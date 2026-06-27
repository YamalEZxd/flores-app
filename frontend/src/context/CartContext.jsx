// frontend/src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext(null);

function leerCarritoGuardado() {
  try {
    const datos = localStorage.getItem("flores_carrito");
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(leerCarritoGuardado);
  const [toasts, setToasts] = useState([]);
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  useEffect(() => {
    localStorage.setItem("flores_carrito", JSON.stringify(items));
  }, [items]);

  const notificar = useCallback((mensaje) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, mensaje }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const agregarAlCarrito = useCallback((producto, cantidad = 1) => {
    setItems((actual) => {
      const existe = actual.find((i) => i.id === producto.id);
      if (existe) {
        return actual.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i));
      }
      return [...actual, { ...producto, cantidad }];
    });
    notificar(`Has seleccionado: ${producto.nombre}`);
    setDrawerAbierto(true);
  }, [notificar]);

  const quitarDelCarrito = useCallback((id) => {
    setItems((actual) => actual.filter((i) => i.id !== id));
  }, []);

  const cambiarCantidad = useCallback((id, cantidad) => {
    setItems((actual) =>
      actual.map((i) => (i.id === id ? { ...i, cantidad: Math.max(1, cantidad) } : i)).filter((i) => i.cantidad > 0)
    );
  }, []);

  const vaciarCarrito = useCallback(() => setItems([]), []);

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const itemCount = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, total, itemCount, agregarAlCarrito, quitarDelCarrito, cambiarCantidad, vaciarCarrito, notificar, toasts, drawerAbierto, setDrawerAbierto }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}