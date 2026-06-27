// backend/routes/productos.js
const express = require("express");
const { sql, poolPromise } = require("../db/database");
const router = express.Router();

// GET /api/productos -> catalogo publico (RF01, RN03)
router.get("/", async (req, res) => {
  try {
    const { categoria, buscar } = req.query;
    const pool = await poolPromise;
    const request = pool.request();

    let query = "SELECT * FROM productos WHERE disponible = 1 AND stock > 0";

    if (categoria) {
      query += " AND categoria = @categoria";
      request.input("categoria", sql.NVarChar, categoria);
    }
    if (buscar) {
      query += " AND (nombre LIKE @buscar OR descripcion LIKE @buscar)";
      request.input("buscar", sql.NVarChar, `%${buscar}%`);
    }
    query += " ORDER BY nombre ASC";

    const resultado = await request.query(query);
    res.json(resultado.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos/:id -> detalle
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const resultado = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM productos WHERE id = @id");

    if (resultado.recordset.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(resultado.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos/admin/todos -> panel del dueno (incluye agotados)
router.get("/admin/todos", async (req, res) => {
  try {
    const pool = await poolPromise;
    const resultado = await pool.request().query("SELECT * FROM productos ORDER BY id DESC");
    res.json(resultado.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productos -> el dueno agrega un producto (RNF06)
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, categoria, precio, imagen_url, texto_alt, stock } = req.body;
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: "nombre, categoria y precio son obligatorios" });
    }
    const pool = await poolPromise;
    const resultado = await pool.request()
      .input("nombre", sql.NVarChar, nombre)
      .input("descripcion", sql.NVarChar, descripcion || "")
      .input("categoria", sql.NVarChar, categoria)
      .input("precio", sql.Decimal(10, 2), precio)
      .input("imagen_url", sql.NVarChar, imagen_url || "")
      .input("texto_alt", sql.NVarChar, texto_alt || nombre)
      .input("stock", sql.Int, stock || 0)
      .query(`
        INSERT INTO productos (nombre, descripcion, categoria, precio, imagen_url, texto_alt, stock, disponible)
        OUTPUT INSERTED.id
        VALUES (@nombre, @descripcion, @categoria, @precio, @imagen_url, @texto_alt, @stock, 1)
      `);
    res.status(201).json({ id: resultado.recordset[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/productos/:id -> editar (RNF06)
router.put("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const existenteRes = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM productos WHERE id = @id");

    if (existenteRes.recordset.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const datos = { ...existenteRes.recordset[0], ...req.body };

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("nombre", sql.NVarChar, datos.nombre)
      .input("descripcion", sql.NVarChar, datos.descripcion)
      .input("categoria", sql.NVarChar, datos.categoria)
      .input("precio", sql.Decimal(10, 2), datos.precio)
      .input("imagen_url", sql.NVarChar, datos.imagen_url)
      .input("texto_alt", sql.NVarChar, datos.texto_alt)
      .input("stock", sql.Int, datos.stock)
      .input("disponible", sql.Bit, datos.disponible)
      .query(`
        UPDATE productos SET nombre=@nombre, descripcion=@descripcion, categoria=@categoria,
          precio=@precio, imagen_url=@imagen_url, texto_alt=@texto_alt, stock=@stock, disponible=@disponible
        WHERE id=@id
      `);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;