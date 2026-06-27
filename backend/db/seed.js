const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const productos = [
  { nombre: "Ramo de girasoles", descripcion: "Girasoles artificiales ideales para alegrar cualquier ambiente.", categoria: "Decoracion", precio: 45.0, imagen_url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600", texto_alt: "Ramo de girasoles artificiales en jarron de vidrio", stock: 20 },
  { nombre: "Corona funebre clasica", descripcion: "Corona funebre con flores artificiales blancas y verdes.", categoria: "Funebre", precio: 120.0, imagen_url: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=600", texto_alt: "Corona funebre de flores artificiales blancas y verdes", stock: 8 },
  { nombre: "Cesta de artesania en mimbre", descripcion: "Cesta artesanal de mimbre tejida a mano con flores secas.", categoria: "Artesania", precio: 38.0, imagen_url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600", texto_alt: "Cesta artesanal de mimbre con flores secas decorativas", stock: 10 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255),
        descripcion TEXT,
        categoria VARCHAR(100),
        precio NUMERIC,
        imagen_url TEXT,
        texto_alt TEXT,
        stock INTEGER,
        disponible INTEGER DEFAULT 1
      )
    `);
    const { rows } = await client.query('SELECT COUNT(*) AS n FROM productos');
    if (parseInt(rows[0].n) > 0) {
      console.log(`Ya hay ${rows[0].n} productos. No se vuelve a sembrar.`);
    } else {
      for (const p of productos) {
        await client.query(
          'INSERT INTO productos (nombre, descripcion, categoria, precio, imagen_url, texto_alt, stock, disponible) VALUES ($1, $2, $3, $4, $5, $6, $7, 1)',
          [p.nombre, p.descripcion, p.categoria, p.precio, p.imagen_url, p.texto_alt, p.stock]
        );
      }
      console.log(`Se insertaron ${productos.length} productos.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

seed();