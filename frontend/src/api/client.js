// frontend/src/api/client.js
const BASE_URL = "http://localhost:4000/api";

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new Error(datos?.error || "Error del servidor");
  return datos;
}

export const api = {
  obtenerProductos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return solicitar(`/productos${query ? `?${query}` : ""}`);
  },
  obtenerProducto: (id) => solicitar(`/productos/${id}`),
  crearPedido: (pedido) => solicitar(`/pedidos`, { method: "POST", body: JSON.stringify(pedido) }),
  obtenerPedido: (id) => solicitar(`/pedidos/${id}`),
  obtenerPedidos: () => solicitar(`/pedidos`),
  actualizarEstadoPedido: (id, datos) =>
    solicitar(`/pedidos/${id}/estado`, { method: "PUT", body: JSON.stringify(datos) }),
};