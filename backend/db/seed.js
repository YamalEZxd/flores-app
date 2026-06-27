// backend/db/seed.js
const db = require("./database");

const productos = [
  {
    nombre: "Arreglo de rosas blancas",
    descripcion: "Rosas artificiales blancas en base redonda de ceramica.",
    categoria: "Decoracion",
    precio: 65.0,
    imagen_url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600",
    texto_alt: "Arreglo de rosas blancas artificiales en base redonda",
    stock: 12,
  },
  {
    nombre: "Ramo de girasoles",
    descripcion: "Girasoles artificiales ideales para alegrar cualquier ambiente.",
    categoria: "Decoracion",
    precio: 45.0,
    imagen_url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600",
    texto_alt: "Ramo de girasoles artificiales en jarron de vidrio",
    stock: 20,
  },
  {
    nombre: "Corona funebre clasica",
    descripcion: "Corona funebre con flores artificiales blancas y verdes.",
    categoria: "Funebre",
    precio: 120.0,
    imagen_url: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=600",
    texto_alt: "Corona funebre de flores artificiales blancas y verdes",
    stock: 8,
  },
  {
    nombre: "Cesta de artesania en mimbre",
    descripcion: "Cesta artesanal de mimbre tejida a mano con flores secas.",
    categoria: "Artesania",
    precio: 38.0,
    imagen_url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600",
    texto_alt: "Cesta artesanal de mimbre con flores secas decorativas",
    stock: 10,
  },
];

const insert = db.prepare(`
  INSERT INTO productos (nombre, descripcion, categoria, precio, imagen_url, texto_alt, stock, disponible)
  VALUES (@nombre, @descripcion, @categoria, @precio, @imagen_url, @texto_alt, @stock, 1)
`);

const yaHayDatos = db.prepare("SELECT COUNT(*) AS n FROM productos").get().n;
if (yaHayDatos > 0) {
  console.log(`Ya hay ${yaHayDatos} productos. No se vuelve a sembrar.`);
} else {
  for (const p of productos) insert.run(p);
  console.log(`Se insertaron ${productos.length} productos.`);
}
