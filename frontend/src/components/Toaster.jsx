import { useCart } from "../context/CartContext";

export default function Toaster() {
  const { toasts } = useCart();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-contenedor">
      {toasts.map((t) => <div className="toast" key={t.id}>{t.mensaje}</div>)}
    </div>
  );
}