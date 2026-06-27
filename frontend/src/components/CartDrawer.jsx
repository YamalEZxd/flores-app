import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { items, total, drawerAbierto, setDrawerAbierto, cambiarCantidad, quitarDelCarrito } = useCart();
  const navigate = useNavigate();
  if (!drawerAbierto) return null;

  return (
    <>
      <div className="carrito-fondo" onClick={() => setDrawerAbierto(false)} />
      <aside className="carrito-panel">
        <div className="encabezado">
          <h3 style={{ color: "#fff", margin: 0 }}>Tu carrito</h3>
          <button className="btn" style={{ background: "transparent", color: "#fff", minHeight: 36 }} onClick={() => setDrawerAbierto(false)}>✕</button>
        </div>
        <div className="lista">
          {items.length === 0 && <p style={{ color: "var(--tinta-suave)", marginTop: 20 }}>Tu carrito está vacío.</p>}
          {items.map((item) => (
            <div className="item-carrito" key={item.id}>
              <img src={item.imagen_url} alt="" />
              <div style={{ flex: 1 }}>
                <strong>{item.nombre}</strong>
                <div className="selector-cantidad" style={{ marginTop: 6 }}>
                  <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}>−</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div>S/ {(item.precio * item.cantidad).toFixed(2)}</div>
                <button onClick={() => quitarDelCarrito(item.id)} style={{ border: "none", background: "none", color: "var(--rosa-polvo-oscuro)", cursor: "pointer" }}>Quitar</button>
              </div>
            </div>
          ))}
        </div>
        <div className="pie">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: "1.1rem" }}>
            <strong>Total</strong><strong>S/ {total.toFixed(2)}</strong>
          </div>
          <button className="btn btn-primario btn-bloque" disabled={items.length === 0} onClick={() => { setDrawerAbierto(false); navigate("/pedido"); }}>
            Confirmar pedido
          </button>
        </div>
      </aside>
    </>
  );
}