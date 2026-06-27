// backend/server.js
const express = require("express");
const cors = require("cors");

const productosRouter = require("./routes/productos");
const pedidosRouter = require("./routes/pedidos");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/productos", productosRouter);
app.use("/api/pedidos", pedidosRouter);

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});