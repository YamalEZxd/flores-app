import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";

const CATEGORIAS = ["TODOS", "DECORACION", "FUNEBRE", "CUMPLEANOS", "ARTESANIA"];

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("TODOS");
  const { agregarAlCarrito } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setCargando(true);
    const params = {};
    if (busqueda.trim()) params.buscar = busqueda.trim();
    if (categoria !== "TODOS") params.categoria = categoria;
    api.obtenerProductos(params).then(setProductos).finally(() => setCargando(false));
  }, [busqueda, categoria]);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="contenedor">
          <div className="hero-subtitulo">🌿 FLORES ARTIFICIALES & ARTESANÍAS</div>
          <h1>Belleza que dura para siempre</h1>
          <p>Arreglos florales para toda ocasión — fúnebres, aniversarios, cumpleaños y decoración. Con entrega a domicilio.</p>
          <div className="hero-botones">
            <button className="btn btn-primario" onClick={() => document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" })}>
              🗂 Ver catálogo
            </button>
            <button className="btn btn-secundario" onClick={() => navigate("/seguimiento")}>
              🚚 Rastrear pedido
            </button>
          </div>
        </div>
      </section>

      {/* CATALOGO */}
      <div className="contenedor" id="catalogo">

        {/* BUSCADOR CENTRADO */}
        <div style={{ display: "flex", justifyContent: "center", margin: "28px 0 16px" }}>
          <div className="buscador-wrap" style={{ maxWidth: 520, width: "100%" }}>
            <span>🔍</span>
            <input
              type="search"
              placeholder="Buscar por nombre o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* CHIPS CENTRADOS */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div className="chips">
            {CATEGORIAS.map((c) => (
              <button key={c} className={`chip ${categoria === c ? "activo" : ""}`} onClick={() => setCategoria(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {cargando && <p style={{ padding: "20px 0", textAlign: "center" }}>Cargando catálogo…</p>}

        <div className="grid-productos">
          {productos.map((p) => (
            <div className="tarjeta-producto" key={p.id} onClick={() => navigate(`/producto/${p.id}`)}>
              <div className="img-wrap">
                <img src={p.imagen_url} alt={p.texto_alt || p.nombre} loading="lazy"
                  onError={(e) => { e.target.style.display = "none"; }} />
              </div>
              <div className="cuerpo">
                <span className="etiqueta-categoria">{p.categoria}</span>
                <h3>{p.nombre}</h3>
                <div className="tarjeta-pie">
                  <span className="precio">S/ {Number(p.precio).toFixed(2)}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge-disponible">DISPONIBLE</span>
                    <button className="boton-agregar"
                      onClick={(e) => { e.stopPropagation(); agregarAlCarrito(p, 1); }}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ODS 10 */}
        <section style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", padding: "56px 32px", marginTop: 48, borderRadius: 20, color: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: "2.5rem" }}>🌍</span>
            <h2 style={{ color: "#fff", margin: "12px 0 8px", fontSize: "1.8rem" }}>Compromiso con el ODS 10</h2>
            <p style={{ color: "#bbb", maxWidth: 600, margin: "0 auto", fontSize: "1rem", lineHeight: 1.6 }}>
              Apoyamos la <strong style={{ color: "#e8567a" }}>reducción de desigualdades</strong> digitalizando
              pequeños negocios de flores y artesanías para que compitan en igualdad de condiciones.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20 }}>
            {[
              { icon: "🎯", titulo: "Problema que resuelve", texto: "Pequeños negocios sin presencia digital pierden clientes frente a grandes tiendas." },
              { icon: "👩‍💼", titulo: "Población beneficiada", texto: "Emprendedoras de flores y artesanías con recursos limitados que venden de forma presencial." },
              { icon: "🤝", titulo: "Reducción de desigualdades", texto: "Elimina la barrera tecnológica para tener un catálogo digital y sistema de delivery propio." },
              { icon: "📈", titulo: "Impacto esperado", texto: "Más ventas, mayor autonomía económica y menor dependencia de intermediarios." },
            ].map((item) => (
              <div key={item.titulo} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: 22, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{item.icon}</div>
                <strong style={{ color: "#e8567a", fontSize: "0.95rem" }}>{item.titulo}</strong>
                <p style={{ margin: "10px 0 0", fontSize: "0.88rem", color: "#ccc", lineHeight: 1.6 }}>{item.texto}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <span style={{ background: "#e8567a", color: "#fff", borderRadius: 999, padding: "8px 24px", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em" }}>
              ODS 10 — REDUCCIÓN DE LAS DESIGUALDADES
            </span>
          </div>
        </section>

      </div>
    </>
  );
}