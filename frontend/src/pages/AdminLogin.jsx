import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CLAVE_ADMIN = "florestienda2026";

export default function AdminLogin() {
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const entrar = (e) => {
    e.preventDefault();
    if (clave === CLAVE_ADMIN) {
      localStorage.setItem("flores_admin", "ok");
      navigate("/admin");
    } else {
      setError(true);
    }
  };

  return (
    <div className="contenedor" style={{ padding: "60px 0", maxWidth: 380, margin: "0 auto" }}>
      <h1>Acceso del negocio</h1>
      <p style={{ color: "var(--tinta-suave)" }}>
        Solo para la dueña del negocio.
      </p>
      <form onSubmit={entrar}>
        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            type="password"
            value={clave}
            onChange={(e) => { setClave(e.target.value); setError(false); }}
            autoFocus
          />
        </div>
        {error && (
          <p style={{ color: "var(--rosa-polvo-oscuro)" }}>
            Contraseña incorrecta. Intenta de nuevo.
          </p>
        )}
        <button className="btn btn-primario btn-bloque">Entrar</button>
      </form>
    </div>
  );
}