// backend/routes/pedidos.js
const express = require("express");
const pool = require("../db/database");
const router = express.Router();

router.post("/", async (req, res) => {
  const { cliente, items } = req.body;
  if (!cliente?.nombre || !cliente?.telefono || !cliente?.direccion) {
    return res.status(400).json({ error: "Nombre, telefono y direccion son obligatorios" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El pedido debe tener al menos un producto" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let clienteRow = await client.query("SELECT * FROM clientes WHERE telefono = $1", [cliente.telefono]);
    let clienteId;
    if (clienteRow.rows.length > 0) {
      clienteId = clienteRow.rows[0].id;
    } else {
      const nuevo = await client.query(
        "INSERT INTO clientes (nombre, telefono, direccion, email) VALUES ($1, $2, $3, $4) RETURNING id",
        [cliente.nombre, cliente.telefono, cliente.direccion, cliente.email || null]
      );
      clienteId = nuevo.rows[0].id;
    }

    let total = 0;
    const detalle = [];
    for (const item of items) {
      const prodRes = await client.query("SELECT * FROM productos WHERE id = $1", [item.producto_id]);
      const producto = prodRes.rows[0];
      if (!producto || !producto.disponible || producto.stock < item.cantidad) {
        throw new Error(`Producto no disponible: ${item.producto_id}`);
      }
      const subtotal = producto.precio * item.cantidad;
      total += subtotal;
      detalle.push({ producto, cantidad: item.cantidad, subtotal });
    }

    const pedidoRes = await client.query(
      "INSERT INTO pedidos (cliente_id, estado, total, notas) VALUES ($1, 'registrado', $2, $3) RETURNING id",
      [clienteId, total, req.body.notas || null]
    );
    const pedidoId = pedidoRes.rows[0].id;

    for (const d of detalle) {
      await client.query(
        "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)",
        [pedidoId, d.producto.id, d.cantidad, d.producto.precio, d.subtotal]
      );
      await client.query("UPDATE productos SET stock = stock - $1 WHERE id = $2", [d.cantidad, d.producto.id]);
    }

    await client.query("COMMIT");
    res.status(201).json({ pedidoId, mensaje: "Tu pedido fue registrado correctamente" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pedidos.*, clientes.nombre AS cliente_nombre, clientes.telefono
      FROM pedidos JOIN clientes ON clientes.id = pedidos.cliente_id
      ORDER BY pedidos.fecha_pedido DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pedidoRes = await pool.query(`
      SELECT pedidos.*, clientes.nombre AS cliente_nombre, clientes.telefono, clientes.direccion
      FROM pedidos JOIN clientes ON clientes.id = pedidos.cliente_id
      WHERE pedidos.id = $1
    `, [req.params.id]);
    if (pedidoRes.rows.length === 0) return res.status(404).json({ error: "Pedido no encontrado" });

    const itemsRes = await pool.query(`
      SELECT pedido_items.*, productos.nombre, productos.imagen_url
      FROM pedido_items JOIN productos ON productos.id = pedido_items.producto_id
      WHERE pedido_id = $1
    `, [req.params.id]);

    res.json({ ...pedidoRes.rows[0], items: itemsRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/estado", async (req, res) => {
  try {
    const { estado, fecha_entrega_estimada } = req.body;
    const validos = ["registrado", "en_preparacion", "enviado", "entregado"];
    if (!validos.includes(estado)) return res.status(400).json({ error: "Estado invalido" });

    if (estado === "enviado" && !fecha_entrega_estimada) {
      const actual = await pool.query("SELECT fecha_entrega_estimada FROM pedidos WHERE id = $1", [req.params.id]);
      if (!actual.rows[0]?.fecha_entrega_estimada) {
        return res.status(400).json({ error: "Debe registrar una fecha de entrega estimada antes de enviar" });
      }
    }

    await pool.query(
      `UPDATE pedidos SET estado = $1, fecha_entrega_estimada = COALESCE($2, fecha_entrega_estimada) WHERE id = $3`,
      [estado, fecha_entrega_estimada || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;