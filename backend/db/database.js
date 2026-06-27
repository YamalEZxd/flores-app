// backend/db/database.js
const sql = require("mssql");

const config = {
  user: "flores_app",
  password: "Flores2026!",
  server: "DESKTOP-G6MIECL\\SQLEXPRESS", // ojo: doble backslash
  database: "FloresDB",
  options: {
    encrypt: false,               // en local no se necesita cifrado
    trustServerCertificate: true,
  },
};

let poolPromise = sql.connect(config)
  .then((pool) => {
    console.log("Conectado a SQL Server (FloresDB)");
    return pool;
  })
  .catch((err) => {
    console.error("Error al conectar a SQL Server:", err.message);
    throw err;
  });

module.exports = { sql, poolPromise };