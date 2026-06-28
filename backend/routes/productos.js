// backend/routes/productos.js
const express = require("express");
const pool = require("../db/database");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { categoria, buscar } = req.query;
    let query = "SELECT * FROM productos WHERE disponible = true AND stock > 0";
    const params = [];

    if (categoria) {
      params.push(categoria);
      query += ` AND UPPER(categoria) = UPPER($${params.length})`;
    }
    if (buscar) {
      params.push(`%${buscar}%`);
      query += ` AND (nombre ILIKE $${params.length} OR descripcion ILIKE $${params.length})`;
    }
    query += " ORDER BY nombre ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, categoria, precio, imagen_url, texto_alt, stock } = req.body;
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: "nombre, categoria y precio son obligatorios" });
    }
    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, categoria, precio, imagen_url, texto_alt, stock, disponible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id`,
      [nombre, descripcion || "", categoria, precio, imagen_url || "", texto_alt || nombre, stock || 0]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existente = await pool.query("SELECT * FROM productos WHERE id = $1", [req.params.id]);
    if (existente.rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    const datos = { ...existente.rows[0], ...req.body };
    await pool.query(
      `UPDATE productos SET nombre=$1, descripcion=$2, categoria=$3, precio=$4,
       imagen_url=$5, texto_alt=$6, stock=$7, disponible=$8 WHERE id=$9`,
      [datos.nombre, datos.descripcion, datos.categoria, datos.precio,
       datos.imagen_url, datos.texto_alt, datos.stock, datos.disponible, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;