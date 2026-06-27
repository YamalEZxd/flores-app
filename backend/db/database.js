// backend/db/database.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch((err) => console.error("Error al conectar a PostgreSQL:", err.message));

module.exports = pool;