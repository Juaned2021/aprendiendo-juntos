import { useState } from "react";
import { login } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "../utils/toast";
import "./Login.css";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(usuario, contrasena);
      if (data.roles.includes("Admin")) {
        navigate("/admin");
      } else if (data.roles.includes("Profesor")) {
        navigate("/profesor");
      } else {
        navigate("/alumno");
      }
    } catch (error) {
      const errorMsg = error.response?.data || error.message || "Error de conexión";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="login-bg">
      <div className="floating-element"></div>
      <div className="login-main-card">
        <div className="login-main-left">
          <div className="login-illustration-placeholder">?</div>
          <h3>Colegio Carlos Julio García</h3>
          <p>Gestiona tus clases, recursos y comunicación educativa en un solo lugar. Diseñada para estudiantes, profesores y administradores.</p>
        </div>
        <div className="login-main-right">
          {/* Botón volver a inicio */}
          <div className="back-to-home-container">
            <a href="/" className="back-to-home-btn">
              <span className="back-text">Volver</span>
            </a>
          </div>
          
          <div className="login-card-modern">
            <img
              src="/images/logos/logo.jpeg"
              alt="Colegio Carlos Julio García"
              className="login-logo-modern"
            />
            <h2 className="login-title">Bienvenido al Colegio Carlos Julio García</h2>
            <p className="login-subtitle">Accede a tus clases y recursos</p>
            <form className="login-form-modern" onSubmit={handleSubmit}>
              <div className="form-group-modern">
                <label htmlFor="usuario">Usuario</label>
                <input
                  id="usuario"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-modern">
                <label htmlFor="contrasena">Contraseña</label>
                <input
                  id="contrasena"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>
              <div className="login-links-row">
                <a href="#" className="login-link">¿Olvidaste tu contraseña?</a>
              </div>
              <button type="submit" className="login-btn-modern">Iniciar Sesión</button>
            </form>
            <div className="login-help-row">
              <span>¿No encuentras tu usuario? <a href="#" className="login-link">Contáctanos</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
