import { useParams, Link } from "react-router-dom";

export default function Confirmacion() {
  const { orderId } = useParams();
  return (
    <div className="contenedor" style={{ padding: "56px 0", textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ fontSize: "3rem" }}>🌸</div>
      <h1>¡Tu pedido fue registrado correctamente!</h1>
      <p style={{ color: "var(--tinta-suave)" }}>Tu número de pedido es <strong>#{orderId}</strong>.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
        <Link to={`/seguimiento/${orderId}`} className="btn btn-primario">Ver estado de mi envío</Link>
        <Link to="/" className="btn btn-secundario">Seguir comprando</Link>
      </div>
    </div>
  );
}