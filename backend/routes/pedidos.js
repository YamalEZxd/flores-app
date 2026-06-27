// backend/routes/pedidos.js
const express = require("express");
const { sql, poolPromise } = require("../db/database");
const router = express.Router();

// POST /api/pedidos -> registrar un pedido (RF02 / RN01)
router.post("/", async (req, res) => {
  const { cliente, items } = req.body;

  if (!cliente?.nombre || !cliente?.telefono || !cliente?.direccion) {
    return res.status(400).json({ error: "Nombre, telefono y direccion son obligatorios" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El pedido debe tener al menos un producto" });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 1) Cliente (busca por telefono, o crea uno nuevo)
    let clienteResult = await new sql.Request(transaction)
      .input("telefono", sql.NVarChar, cliente.telefono)
      .query("SELECT id FROM clientes WHERE telefono = @telefono");

    let clienteId;
    if (clienteResult.recordset.length > 0) {
      clienteId = clienteResult.recordset[0].id;
    } else {
      const insertCliente = await new sql.Request(transaction)
        .input("nombre", sql.NVarChar, cliente.nombre)
        .input("telefono", sql.NVarChar, cliente.telefono)
        .input("direccion", sql.NVarChar, cliente.direccion)
        .input("email", sql.NVarChar, cliente.email || null)
        .query(`
          INSERT INTO clientes (nombre, telefono, direccion, email)
          OUTPUT INSERTED.id
          VALUES (@nombre, @telefono, @direccion, @email)
        `);
      clienteId = insertCliente.recordset[0].id;
    }

    // 2) Validar stock y calcular total
    let total = 0;
    const detalle = [];
    for (const item of items) {
      const prodRes = await new sql.Request(transaction)
        .input("id", sql.Int, item.producto_id)
        .query("SELECT * FROM productos WHERE id = @id");
      const producto = prodRes.recordset[0];

      if (!producto || !producto.disponible || producto.stock < item.cantidad) {
        throw new Error(`Producto no disponible: ${item.producto_id}`);
      }
      const subtotal = producto.precio * item.cantidad;
      total += subtotal;
      detalle.push({ producto, cantidad: item.cantidad, subtotal });
    }

    // 3) Crear el pedido
    const insertPedido = await new sql.Request(transaction)
      .input("cliente_id", sql.Int, clienteId)
      .input("total", sql.Decimal(10, 2), total)
      .input("notas", sql.NVarChar, req.body.notas || null)
      .query(`
        INSERT INTO pedidos (cliente_id, estado, total, notas)
        OUTPUT INSERTED.id
        VALUES (@cliente_id, 'registrado', @total, @notas)
      `);
    const pedidoId = insertPedido.recordset[0].id;

    // 4) Items + descontar stock
    for (const d of detalle) {
      await new sql.Request(transaction)
        .input("pedido_id", sql.Int, pedidoId)
        .input("producto_id", sql.Int, d.producto.id)
        .input("cantidad", sql.Int, d.cantidad)
        .input("precio_unitario", sql.Decimal(10, 2), d.producto.precio)
        .input("subtotal", sql.Decimal(10, 2), d.subtotal)
        .query(`
          INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
          VALUES (@pedido_id, @producto_id, @cantidad, @precio_unitario, @subtotal)
        `);

      await new sql.Request(transaction)
        .input("cantidad", sql.Int, d.cantidad)
        .input("id", sql.Int, d.producto.id)
        .query("UPDATE productos SET stock = stock - @cantidad WHERE id = @id");
    }

    await transaction.commit();
    res.status(201).json({ pedidoId, mensaje: "Tu pedido fue registrado correctamente" });
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ error: err.message });
  }
});

// GET /api/pedidos/:id -> seguimiento (RF03)
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const pedidoRes = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT pedidos.*, clientes.nombre AS cliente_nombre, clientes.telefono, clientes.direccion
        FROM pedidos JOIN clientes ON clientes.id = pedidos.cliente_id
        WHERE pedidos.id = @id
      `);
    if (pedidoRes.recordset.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const itemsRes = await pool.request()
      .input("pedido_id", sql.Int, req.params.id)
      .query(`
        SELECT pedido_items.*, productos.nombre, productos.imagen_url
        FROM pedido_items JOIN productos ON productos.id = pedido_items.producto_id
        WHERE pedido_id = @pedido_id
      `);

    res.json({ ...pedidoRes.recordset[0], items: itemsRes.recordset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pedidos -> listado para el panel del dueno
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const resultado = await pool.request().query(`
      SELECT pedidos.*, clientes.nombre AS cliente_nombre, clientes.telefono
      FROM pedidos JOIN clientes ON clientes.id = pedidos.cliente_id
      ORDER BY pedidos.fecha_pedido DESC
    `);
    res.json(resultado.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pedidos/:id/estado -> confirmar/avanzar pedido (RN02, RN04, RN06)
router.put("/:id/estado", async (req, res) => {
  try {
    const { estado, fecha_entrega_estimada } = req.body;
    const validos = ["registrado", "en_preparacion", "enviado", "entregado"];
    if (!validos.includes(estado)) {
      return res.status(400).json({ error: "Estado invalido" });
    }

    const pool = await poolPromise;

    if (estado === "enviado" && !fecha_entrega_estimada) {
      const actual = await pool.request()
        .input("id", sql.Int, req.params.id)
        .query("SELECT fecha_entrega_estimada FROM pedidos WHERE id = @id");
      if (!actual.recordset[0]?.fecha_entrega_estimada) {
        return res.status(400).json({ error: "Debe registrar una fecha de entrega estimada antes de enviar" });
      }
    }

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("estado", sql.NVarChar, estado)
      .input("fecha", sql.Date, fecha_entrega_estimada || null)
      .query(`
        UPDATE pedidos SET estado = @estado,
          fecha_entrega_estimada = COALESCE(@fecha, fecha_entrega_estimada)
        WHERE id = @id
      `);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;