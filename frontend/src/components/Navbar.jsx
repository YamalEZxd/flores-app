import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { itemCount, setDrawerAbierto } = useCart();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header style={{ background: "#1a1a1a", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

        {/* LOGO */}
        <Link to="/" style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          🌸 <span style={{ color: "#e8567a" }}>FloresArte</span>
        </Link>

        {/* MENU DESKTOP */}
        <nav style={{ display: "flex", gap: 32, flex: 1, justifyContent: "center" }} className="nav-desktop">
          <Link to="/" style={{ color: "#e8567a", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none" }}>CATÁLOGO</Link>
          <Link to="/pedido" style={{ color: "#e8567a", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none" }}>MI PEDIDO</Link>
          <Link to="/seguimiento" style={{ color: "#e8567a", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none" }}>SEGUIMIENTO</Link>
          <Link to="/admin" style={{ color: "#e8567a", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none" }}>ADMIN</Link>
        </nav>

        {/* DERECHA: CARRITO + HAMBURGUESA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setDrawerAbierto(true)} style={{ background: "transparent", border: "2px solid #fff", color: "#fff", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            🛒 <span className="carrito-texto">Carrito</span>
            <span style={{ background: "#e8567a", color: "#fff", borderRadius: 999, fontSize: "0.75rem", padding: "2px 8px", fontWeight: 700 }}>
              {itemCount}
            </span>
          </button>

          {/* HAMBURGUESA solo en móvil */}
          <button
            className="hamburguesa"
            onClick={() => setMenuAbierto(!menuAbierto)}
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.6rem", cursor: "pointer", lineHeight: 1 }}
          >
            {menuAbierto ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* MENU MÓVIL */}
      {menuAbierto && (
        <nav style={{ background: "#1a1a1a", borderTop: "1px solid #333", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 20 }} className="nav-mobile">
          <Link to="/" onClick={() => setMenuAbierto(false)} style={{ color: "#e8567a", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>CATÁLOGO</Link>
          <Link to="/pedido" onClick={() => setMenuAbierto(false)} style={{ color: "#e8567a", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>MI PEDIDO</Link>
          <Link to="/seguimiento" onClick={() => setMenuAbierto(false)} style={{ color: "#e8567a", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>SEGUIMIENTO</Link>
          <Link to="/admin" onClick={() => setMenuAbierto(false)} style={{ color: "#e8567a", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>ADMIN</Link>
        </nav>
      )}

      {/* ESTILOS RESPONSIVE */}
      <style>{`
        .nav-desktop { display: flex !important; }
        .hamburguesa { display: none !important; }
        .nav-mobile { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .hamburguesa { display: block !important; }
          .carrito-texto { display: none; }
        }
        @media (max-width: 768px) {
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}