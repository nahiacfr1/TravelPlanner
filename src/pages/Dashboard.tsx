// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

interface Viaje {
  id: string;
  nombre: string;
  maletas: any[];
  menus: any[];
}

function Dashboard() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<Viaje[]>([]);

  useEffect(() => {
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) {
      alert("No has iniciado sesión");
      navigate("/login");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const datos = users[activeUser]?.maletas || [];
    setViajes(datos);
  }, [navigate]);

  const irACrearViaje = () => {
    navigate("/crear-viaje");
  };

  const entrarAViaje = (id: string) => {
    navigate(`/viaje/${id}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>Mis viajes</h1>

        <button onClick={irACrearViaje} className="crear-btn">
          Crear nuevo viaje
        </button>

        <ul>
          {viajes.map((v) => (
            <li key={v.id} onClick={() => entrarAViaje(v.id)}>
              ✈️ {v.nombre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
