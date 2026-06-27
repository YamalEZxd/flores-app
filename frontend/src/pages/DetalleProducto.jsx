import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";

export default function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState(null);
  const { agregarAlCarrito } = useCart();

  useEffect(() => {
    api.obtenerProducto(id).then(setProducto).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return <div className="contenedor" style={{ padding: "32px 0" }}><p>No se encontró el producto. <Link to="/">Volver al catálogo</Link></p></div>;
  }
  if (!producto) {
    return <div className="contenedor" style={{ padding: "32px 0" }}><p>Cargando producto…</p></div>;
  }

  return (
    <div className="contenedor">
      <div className="detalle-producto">
        <div className="img-wrap">
          <img src={producto.imagen_url} alt={producto.texto_alt || producto.nombre} />
        </div>
        <div>
          <span className="etiqueta-categoria">{producto.categoria}</span>
          <h1>{producto.nombre}</h1>
          <p style={{ color: "var(--tinta-suave)" }}>{producto.descripcion}</p>
          <p className="precio" style={{ fontSize: "1.6rem" }}>S/ {Number(producto.precio).toFixed(2)}</p>

          {producto.stock > 0 ? (
            <>
              <div className="campo">
                <label>Cantidad</label>
                <div className="selector-cantidad">
                  <button onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
                  <span>{cantidad}</span>
                  <button onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}>+</button>
                </div>
              </div>
              <button className="btn btn-primario" onClick={() => agregarAlCarrito(producto, cantidad)}>
                Agregar pedido
              </button>
            </>
          ) : (
            <p className="sin-stock">Este producto está agotado por ahora.</p>
          )}

          <p style={{ marginTop: 24 }}><Link to="/">← Volver al catálogo</Link></p>
        </div>
      </div>
    </div>
  );
}