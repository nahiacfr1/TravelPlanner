// src/pages/CrearViaje.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CrearViaje.css";

function CrearViaje() {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  const handleCrear = () => {
    if (!nombre.trim()) return alert("Introduce un nombre para el viaje");

    const id = Date.now().toString();
    const activeUser = localStorage.getItem("activeUser");

    if (!activeUser) {
      alert("No has iniciado sesión");
      navigate("/login");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}");

    const nuevoViaje = {
      id,
      nombre,
      maletas: [],
      menus: [],
    };

    users[activeUser].maletas.push(nuevoViaje);
    localStorage.setItem("users", JSON.stringify(users));
    navigate(`/viaje/${id}`);
  };

  return (
    <div className="crear-container">
      <div className="crear-box">
        <h1>Crear nuevo viaje</h1>
        <input
          type="text"
          placeholder="Destino del viaje"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button onClick={handleCrear}>Crear</button>
      </div>
    </div>
  );
}

export default CrearViaje;
