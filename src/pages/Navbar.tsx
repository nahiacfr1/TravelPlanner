// src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("activeUser");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">🌿 Travel Planner</div>
      <div className="navbar-links">
        <Link to="/dashboard">Mis viajes</Link>
        <Link to="/crear-viaje">Crear viaje</Link>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </div>
    </nav>
  );
}

export default Navbar;
