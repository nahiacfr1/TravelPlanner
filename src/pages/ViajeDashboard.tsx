import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ViajeDashboard.css";

interface Maleta {
  nombre: string;
  tipo: string;
  items: string[];
}

interface Viaje {
  id: string;
  nombre: string;
  destino?: string;
  maletas: Maleta[];
  menus: any[];
}

const PLANTILLAS_MALETA: Record<string, string[]> = {
  "Maleta grande": ["Camisetas", "Pantalones", "Pijama", "Chaqueta", "Zapatillas"],
  "Maleta mediana": ["Ropa interior", "Pantalones", "Camisetas"],
  "Maleta pequeña": ["Camiseta", "Pantalón corto", "Muda extra"],
  "Bolso de mano": ["Móvil", "Cargador", "Gafas de sol", "Libro"],
  "Botiquin": ["Ibuprofeno", "Paracetamol"],
  "Neceser / Maquillaje": ["Cepillo", "Maquillaje", "Pasta de dientes", "Peine"],
  "Electrónica": ["Portátil", "Auriculares", "Cargadores"],
  "Comida / Snacks": ["Botella de agua", "Fruta", "Snacks"],
  "Trabajo / Estudio": ["Cuaderno", "Bolígrafo", "Ordenador"],
};

function ViajeDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [tipoMaleta, setTipoMaleta] = useState("");
  const [modoEdicion, setModoEdicion] = useState<string | null>(null);
  const [nuevoNombreEdicion, setNuevoNombreEdicion] = useState("");

  useEffect(() => {
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) return;

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const viajes = users[activeUser]?.maletas || [];

    const v = viajes.find((v: Viaje) => v.id === id);
    if (!v) {
      alert("Viaje no encontrado");
      navigate("/dashboard");
    } else {
      setViaje(v);
    }
  }, [id, navigate]);

  const guardarMaleta = () => {
    if (!nuevoNombre.trim() || !tipoMaleta || !viaje) return;

    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) {
      alert("Sesión no iniciada");
      navigate("/login");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}");

    const nuevaMaleta: Maleta = {
      nombre: nuevoNombre,
      tipo: tipoMaleta,
      items: PLANTILLAS_MALETA[tipoMaleta] || [],
    };

    const updated = {
      ...viaje,
      maletas: [...viaje.maletas, nuevaMaleta],
    };

    const updatedViajes = users[activeUser].maletas.map((v: Viaje) =>
      v.id === viaje.id ? updated : v
    );

    users[activeUser].maletas = updatedViajes;
    localStorage.setItem("users", JSON.stringify(users));
    setViaje(updated);
    setNuevoNombre("");
    setTipoMaleta("");
  };

  const eliminarMaleta = (nombre: string) => {
    if (!viaje) return;
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) return;

    const users = JSON.parse(localStorage.getItem("users") || "{}");

    const updatedMaletas = viaje.maletas.filter((m) => m.nombre !== nombre);
    const updated = { ...viaje, maletas: updatedMaletas };

    const updatedViajes = users[activeUser].maletas.map((v: Viaje) =>
      v.id === viaje.id ? updated : v
    );

    users[activeUser].maletas = updatedViajes;
    localStorage.setItem("users", JSON.stringify(users));
    setViaje(updated);
  };

  const guardarNombreEditado = (nombreOriginal: string) => {
    if (!viaje || !nuevoNombreEdicion.trim()) return;

    const maletasActualizadas = viaje.maletas.map((m) =>
      m.nombre === nombreOriginal ? { ...m, nombre: nuevoNombreEdicion.trim() } : m
    );

    const activeUser = localStorage.getItem("activeUser")!;
    const users = JSON.parse(localStorage.getItem("users") || "{}");

    const updated = { ...viaje, maletas: maletasActualizadas };
    const updatedViajes = users[activeUser].maletas.map((v: Viaje) =>
      v.id === viaje.id ? updated : v
    );

    users[activeUser].maletas = updatedViajes;
    localStorage.setItem("users", JSON.stringify(users));
    setViaje(updated);
    setModoEdicion(null);
  };

  if (!viaje) return null;

  return (
    <div className="viaje-dashboard">
      <div className="panel">
        <h1>Viaje a {viaje.nombre}</h1>

        <section className="seccion">
          <h2>🧳 Mis maletas</h2>
          <ul>
            {viaje.maletas.map((m, i) => (
              <li key={i} className="maleta-link">
                {modoEdicion === m.nombre ? (
                  <>
                    <input
                      type="text"
                      value={nuevoNombreEdicion}
                      onChange={(e) => setNuevoNombreEdicion(e.target.value)}
                    />
                    <button onClick={() => guardarNombreEditado(m.nombre)}>💾 Guardar</button>
                    <button onClick={() => setModoEdicion(null)}>❌ Cancelar</button>
                  </>
                ) : (
                  <>
                    <span onClick={() => navigate(`/viaje/${viaje.id}/maleta/${encodeURIComponent(m.nombre)}`)}>
                      🎒 {m.nombre} ({m.tipo})
                    </span>
                    <button onClick={() => {
                      setModoEdicion(m.nombre);
                      setNuevoNombreEdicion(m.nombre);
                    }}>✏️</button>
                    <button className="eliminar-btn" onClick={() => eliminarMaleta(m.nombre)}>
                      ❌
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>

          <div className="maletas-input">
            <input
              type="text"
              placeholder="Nombre de la maleta"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
            <select value={tipoMaleta} onChange={(e) => setTipoMaleta(e.target.value)}>
              <option value="">Selecciona tipo</option>
              {Object.keys(PLANTILLAS_MALETA).map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <button onClick={guardarMaleta}>Añadir</button>
          </div>
        </section>

        <section className="seccion">
          <h2>🍽️ Planificación de comidas</h2>
          <p>Organiza tus menús diarios para este viaje.</p>
          <div className="botones-menu">
            <button onClick={() => navigate("/recetas")}>📚 Ver mis recetas</button>
            <button onClick={() => navigate(`/viaje/${viaje.id}/planificar-menu`)}>🗓️ Planificar menú</button>
          </div>
        </section>

        <section className="seccion">
          <h2>🛒 Listas de la compra</h2>
          <p>Consulta o edita tus listas guardadas para este viaje.</p>
          <div className="botones-menu">
            <button onClick={() => navigate(`/viaje/${viaje.id}/listas-compra`)}>🛍️ Ver listas de la compra</button>
          </div>
        </section>

        <section className="seccion">
          <h2>🚗 Ruta y clima</h2>
          <p>Consulta el tiempo en los lugares por donde pasarás si haces el viaje en coche.</p>
          <div className="botones-menu">
            <button onClick={() => navigate(`/viaje/${viaje.id}/ruta-clima`)}>
              Ver ruta y clima
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ViajeDashboard;
