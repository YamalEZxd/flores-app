import { Navigate } from "react-router-dom";

export default function RutaAdmin({ children }) {
  const autenticado = localStorage.getItem("flores_admin") === "ok";
  if (!autenticado) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}