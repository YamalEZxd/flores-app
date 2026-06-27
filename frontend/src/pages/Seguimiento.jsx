import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

const PASOS = [
  { clave: "registrado", titulo: "Pedido registrado", texto: "Recibimos tu pedido." },
  { clave: "en_preparacion", titulo: "En preparación", texto: "Estamos armando tu arreglo." },
  { clave: "enviado", titulo: "Enviado", texto: "Tu arreglo está en camino." },
  { clave: "entregado", titulo: "Entregado", texto: "¡Gracias por tu compra!" },
];

export default function Seguimiento() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [idBuscado, setIdBuscado] = useState(orderId || "");
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      setError(null);
      api.obtenerPedido(orderId).then(setPedido).catch((e) => setError(e.message));
    }
  }, [orderId]);

  const onSubmit = (e) => {
    e.preventDefault();
    navigate(`/seguimiento/${idBuscado}`);
  };

  const pasoActualIndex = pedido ? PASOS.findIndex((p) => p.clave === pedido.estado) : -1;

  return (
    <div className="contenedor" style={{ padding: "32px 0 56px", maxWidth: 560 }}>
      <h1>Seguir mi pedido</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input placeholder="Número de pedido" value={idBuscado} onChange={(e) => setIdBuscado(e.target.value)}
          style={{ flex: 1, minHeight: 48, borderRadius: 10, border: "1.5px solid var(--borde)", padding: "0 14px" }} />
        <button className="btn btn-primario">Buscar</button>
      </form>

      {error && <p style={{ color: "var(--rosa-polvo-oscuro)" }}>No encontramos ese pedido.</p>}

      {pedido && (
        <>
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "var(--sombra)", marginBottom: 12 }}>
            <strong>Pedido #{pedido.id}</strong>
            <p style={{ margin: "4px 0 0", color: "var(--tinta-suave)" }}>{pedido.cliente_nombre} — {pedido.direccion}</p>
            {pedido.fecha_entrega_estimada && <p>Entrega estimada: <strong>{pedido.fecha_entrega_estimada}</strong></p>}
          </div>
          <div className="linea-tiempo">
            {PASOS.map((paso, i) => (
              <div key={paso.clave} className={`paso-tiempo ${i < pasoActualIndex ? "completo" : ""} ${i === pasoActualIndex ? "actual" : ""}`}>
                <div className="punto-tiempo">{i <= pasoActualIndex ? "✓" : i + 1}</div>
                <div><h4>{paso.titulo}</h4><p>{paso.texto}</p></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}