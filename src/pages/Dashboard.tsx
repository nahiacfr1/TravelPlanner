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
  const [nombresEditados, setNombresEditados] = useState<Record<string, string>>({});

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
    const nombresIniciales: Record<string, string> = {};
    datos.forEach((v: Viaje) => {
      nombresIniciales[v.id] = v.nombre;
    });
    setNombresEditados(nombresIniciales);
  }, [navigate]);

  const irACrearViaje = () => {
    navigate("/crear-viaje");
  };

  const entrarAViaje = (id: string) => {
    navigate(`/viaje/${id}`);
  };

  const actualizarNombre = (id: string) => {
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) return;

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const viajesUsuario = users[activeUser].maletas || [];

    const actualizados = viajesUsuario.map((v: Viaje) =>
      v.id === id ? { ...v, nombre: nombresEditados[id] } : v
    );

    users[activeUser].maletas = actualizados;
    localStorage.setItem("users", JSON.stringify(users));
    setViajes(actualizados);
  };

  const eliminarViaje = (id: string) => {
    const confirmacion = window.confirm("¿Seguro que quieres eliminar este viaje?");
    if (!confirmacion) return;

    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) return;

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const nuevosViajes = users[activeUser].maletas.filter((v: Viaje) => v.id !== id);
    users[activeUser].maletas = nuevosViajes;

    localStorage.setItem("users", JSON.stringify(users));
    setViajes(nuevosViajes);
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
            <li key={v.id}>
              <input
                type="text"
                value={nombresEditados[v.id] || ""}
                onChange={(e) =>
                  setNombresEditados({ ...nombresEditados, [v.id]: e.target.value })
                }
              />
              <button onClick={() => actualizarNombre(v.id)}>💾 Guardar</button>
              <button onClick={() => eliminarViaje(v.id)}>🗑️ Eliminar</button>
              <button onClick={() => entrarAViaje(v.id)}>➡️ Ir al viaje</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
