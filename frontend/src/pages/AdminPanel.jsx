import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";

const ESTADOS = ["registrado", "en_preparacion", "enviado", "entregado"];
const ETIQUETAS = { registrado: "Registrado", en_preparacion: "En preparación", enviado: "Enviado", entregado: "Entregado" };

export default function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [modalFecha, setModalFecha] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");

  const cargar = () => {
    setCargando(true);
    api.obtenerPedidos().then(setPedidos).finally(() => setCargando(false));
  };
  useEffect(cargar, []);

  const verDetalle = async (id) => {
    const data = await api.obtenerPedido(id);
    setDetalle(data);
  };

  const cambiarEstado = async (pedido, nuevoEstado) => {
    let fecha = pedido.fecha_entrega_estimada;
    if (nuevoEstado === "enviado" && !fecha) {
      setFechaSeleccionada("");
      setModalFecha({ pedido, nuevoEstado });
      return;
    }
    try {
      await api.actualizarEstadoPedido(pedido.id, { estado: nuevoEstado, fecha_entrega_estimada: fecha });
      cargar();
    } catch (e) {
      alert(e.message);
    }
  };

  const confirmarFecha = async () => {
    if (!fechaSeleccionada) return alert("Selecciona una fecha");
    const { pedido, nuevoEstado } = modalFecha;
    setModalFecha(null);
    try {
      await api.actualizarEstadoPedido(pedido.id, { estado: nuevoEstado, fecha_entrega_estimada: fechaSeleccionada });
      cargar();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="contenedor" style={{ padding: "28px 0 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Panel del negocio</h1>
        <CerrarSesion />
      </div>

      {cargando && <p>Cargando pedidos…</p>}
      {!cargando && pedidos.length === 0 && <p>Todavía no hay pedidos.</p>}
      {pedidos.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-admin">
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Teléfono</th><th>Total</th><th>Estado</th><th>Entrega</th><th>Acción</th><th>Detalle</th></tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.cliente_nombre}</td>
                  <td>{p.telefono}</td>
                  <td>S/ {Number(p.total).toFixed(2)}</td>
                  <td><span className={`estado-pill estado-${p.estado}`}>{ETIQUETAS[p.estado]}</span></td>
                  <td>{p.fecha_entrega_estimada ? new Date(p.fecha_entrega_estimada).toLocaleDateString() : "—"}</td>
                  <td>
                    <select value={p.estado} onChange={(e) => cambiarEstado(p, e.target.value)} style={{ minHeight: 38, borderRadius: 8, border: "1px solid var(--borde)" }}>
                      {ESTADOS.map((e) => <option key={e} value={e}>{ETIQUETAS[e]}</option>)}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => verDetalle(p.id)} style={{ background: "#e8567a", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FECHA */}
      {modalFecha && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 360, width: "90%" }}>
            <h3 style={{ marginTop: 0 }}>📅 Fecha estimada de entrega</h3>
            <p style={{ color: "#666", marginBottom: 16 }}>Selecciona la fecha para el pedido #{modalFecha.pedido.id}</p>
            <input
              type="date"
              value={fechaSeleccionada}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem", marginBottom: 16, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setModalFecha(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", background: "#f5f5f5", fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={confirmarFecha} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", background: "#e8567a", color: "#fff", fontWeight: 700 }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {detalle && (
        <div onClick={() => setDetalle(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 480, width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <h2 style={{ marginTop: 0 }}>Pedido #{detalle.id}</h2>
            <p><strong>Cliente:</strong> {detalle.cliente_nombre}</p>
            <p><strong>Teléfono:</strong> {detalle.telefono}</p>
            <p><strong>Dirección:</strong> {detalle.direccion}</p>
            <p><strong>Estado:</strong> {ETIQUETAS[detalle.estado]}</p>
            <p><strong>Total:</strong> S/ {Number(detalle.total).toFixed(2)}</p>
            <hr />
            <h3>Productos</h3>
            {detalle.items?.map((item) => (
              <div key={item.producto_id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>{item.nombre} x{item.cantidad}</span>
                <span>S/ {Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
            <button onClick={() => setDetalle(null)} style={{ marginTop: 20, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", width: "100%", fontWeight: 600 }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function CerrarSesion() {
    const navigate = useNavigate();
    const cerrar = () => {
      localStorage.removeItem("flores_admin");
      navigate("/");
    };
    return (
      <button className="btn btn-secundario" onClick={cerrar}>
        Cerrar sesión
      </button>
    );
  }
}