import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api/client";

export default function Pedido() {
  const { items, total, vaciarCarrito, notificar } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", telefono: "", direccion: "", email: "" });
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const actualizarCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const confirmarPedido = async (e) => {
  e.preventDefault();
  setError(null);

  // Validacion: telefono debe tener 9 digitos y empezar con 9
  if (!/^9\d{8}$/.test(form.telefono)) {
    setError("El teléfono debe tener 9 dígitos y empezar con 9. Ejemplo: 987654321");
    return;
  }

  setEnviando(true);
    try {
      const respuesta = await api.crearPedido({
        cliente: form,
        items: items.map((i) => ({ producto_id: i.id, cantidad: i.cantidad })),
        notas,
      });
      vaciarCarrito();
      notificar(respuesta.mensaje || "Tu pedido fue registrado correctamente");
      navigate(`/confirmacion/${respuesta.pedidoId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="contenedor" style={{ padding: "40px 0" }}>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega algún arreglo desde el <Link to="/">catálogo</Link>.</p>
      </div>
    );
  }

  return (
    <div className="contenedor" style={{ padding: "32px 0 56px", maxWidth: 640 }}>
      <h1>Confirmar pedido</h1>
      <div style={{ background: "#fff", borderRadius: 14, padding: 16, margin: "20px 0", boxShadow: "var(--sombra)" }}>
        {items.map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span>{i.cantidad} × {i.nombre}</span>
            <span>S/ {(i.precio * i.cantidad).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontWeight: 700, borderTop: "1px solid var(--borde)", paddingTop: 10 }}>
          <span>Total</span><span>S/ {total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={confirmarPedido}>
        <div className="campo"><label htmlFor="nombre">Nombre completo</label><input id="nombre" required value={form.nombre} onChange={actualizarCampo("nombre")} /></div>
        <div className="campo"><label htmlFor="telefono">Teléfono / WhatsApp</label><input
  id="telefono"
  required
  inputMode="numeric"
  maxLength={9}
  placeholder="987654321"
  value={form.telefono}
  onChange={(e) => {
    const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 9);
    setForm({ ...form, telefono: soloNumeros });
  }}
/></div>
        <div className="campo"><label htmlFor="direccion">Dirección de entrega</label><input id="direccion" required value={form.direccion} onChange={actualizarCampo("direccion")} /></div>
        <div className="campo"><label htmlFor="email">Correo (opcional)</label><input id="email" type="email" value={form.email} onChange={actualizarCampo("email")} /></div>
        <div className="campo"><label htmlFor="notas">Notas (opcional)</label><textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} /></div>

        {error && <p style={{ color: "var(--rosa-polvo-oscuro)" }}>{error}</p>}
        <button className="btn btn-primario btn-bloque" disabled={enviando}>{enviando ? "Registrando…" : "Registrar pedido"}</button>
      </form>
    </div>
  );
}