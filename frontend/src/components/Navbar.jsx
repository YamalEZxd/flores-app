import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { itemCount, setDrawerAbierto } = useCart();
  return (
    <header style={{ background: "#1a1a1a", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

        {/* LOGO */}
        <Link to="/" style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          🌸 <span style={{ color: "#e8567a" }}>FloresArte</span>
        </Link>

        {/* MENU CENTRADO */}
        <nav style={{ display: "flex", gap: 32, flex: 1, justifyContent: "center" }}>
          <Link to="/" style={{ color: "#e8567a", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none" }}>CATÁLOGO</Link>
          <Link to="/pedido" style={{ color: "#e8567a", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none" }}>MI PEDIDO</Link>
          <Link to="/seguimiento" style={{ color: "#e8567a", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none" }}>SEGUIMIENTO</Link>
          <Link to="/admin" style={{ color: "#e8567a", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none" }}>ADMIN</Link>
        </nav>

        {/* CARRITO */}
        <button onClick={() => setDrawerAbierto(true)} style={{ background: "transparent", border: "2px solid #fff", color: "#fff", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          🛒 Carrito
          <span style={{ background: "#e8567a", color: "#fff", borderRadius: 999, fontSize: "0.75rem", padding: "2px 8px", fontWeight: 700 }}>
            {itemCount}
          </span>
        </button>

      </div>
    </header>
  );
}