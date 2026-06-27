import { Link } from "react-router-dom";

export default function ProductCard({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="tarjeta-producto">
      <div className="img-wrap">
        <img src={producto.imagen_url} alt={producto.texto_alt || producto.nombre} loading="lazy" />
      </div>
      <div className="cuerpo">
        <span className="etiqueta-categoria">{producto.categoria}</span>
        <h3>{producto.nombre}</h3>
        <span className="precio">S/ {Number(producto.precio).toFixed(2)}</span>
        {producto.stock <= 3 && producto.stock > 0 && <span className="sin-stock">Quedan {producto.stock} unidades</span>}
      </div>
    </Link>
  );
}