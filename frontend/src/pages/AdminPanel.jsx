import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";

const ESTADOS = ["registrado", "en_preparacion", "enviado", "entregado"];
const ETIQUETAS = { registrado: "Registrado", en_preparacion: "En preparación", enviado: "Enviado", entregado: "Entregado" };

export default function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    api.obtenerPedidos().then(setPedidos).finally(() => setCargando(false));
  };
  useEffect(cargar, []);

  const cambiarEstado = async (pedido, nuevoEstado) => {
    let fecha = pedido.fecha_entrega_estimada;
    if (nuevoEstado === "enviado" && !fecha) {
      fecha = window.prompt("Fecha estimada de entrega (AAAA-MM-DD):");
      if (!fecha) return;
    }
    try {
      await api.actualizarEstadoPedido(pedido.id, { estado: nuevoEstado, fecha_entrega_estimada: fecha });
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
            <thead><tr><th>#</th><th>Cliente</th><th>Teléfono</th><th>Total</th><th>Estado</th><th>Entrega</th><th>Acción</th></tr></thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.cliente_nombre}</td><td>{p.telefono}</td>
                  <td>S/ {Number(p.total).toFixed(2)}</td>
                  <td><span className={`estado-pill estado-${p.estado}`}>{ETIQUETAS[p.estado]}</span></td>
                  <td>{p.fecha_entrega_estimada ? new Date(p.fecha_entrega_estimada).toLocaleDateString() : "—"}</td>
                  <td>
                    <select value={p.estado} onChange={(e) => cambiarEstado(p, e.target.value)} style={{ minHeight: 38, borderRadius: 8, border: "1px solid var(--borde)" }}>
                      {ESTADOS.map((e) => <option key={e} value={e}>{ETIQUETAS[e]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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