import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ListasCompraDashboard.css";

interface Elemento {
  nombre: string;
  completado: boolean;
}

interface ListaCompra {
  id: string;
  nombre: string;
  elementos: Elemento[];
}

function ListasCompraDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listas, setListas] = useState<ListaCompra[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`listaCompraList_${id}`);
    if (raw) {
      try {
        const data: ListaCompra[] = JSON.parse(raw);
        setListas(data);
      } catch {
        console.error("Error al cargar las listas de compra.");
      }
    }
  }, [id]);

  const guardarListas = (actualizadas: ListaCompra[]) => {
    if (!id) return;
    setListas(actualizadas);
    localStorage.setItem(`listaCompraList_${id}`, JSON.stringify(actualizadas));
  };

  const crearNuevaLista = () => {
    if (!nuevoNombre.trim()) return;

    const nueva: ListaCompra = {
      id: Date.now().toString(),
      nombre: nuevoNombre.trim(),
      elementos: [],
    };

    const actualizadas = [...listas, nueva];
    guardarListas(actualizadas);
    setNuevoNombre("");
    navigate(`/lista-compra/${id}/${nueva.id}`);
  };

  const eliminarLista = (idLista: string) => {
    const actualizadas = listas.filter((l) => l.id !== idLista);
    guardarListas(actualizadas);
  };

  return (
    <div className="listas-compra-dashboard">
      <button className="volver" onClick={() => navigate(-1)}>← Volver al viaje</button>
      <h1>🛒 Listas de la compra</h1>

      <div className="nueva-lista">
        <input
          type="text"
          placeholder="Nombre de la nueva lista"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && crearNuevaLista()}
        />
        <button onClick={crearNuevaLista}>➕ Crear nueva lista</button>
      </div>

      {listas.length === 0 ? (
        <p>No hay listas de la compra guardadas para este viaje.</p>
      ) : (
        <ul>
          {listas.map((lista) => {
            const total = lista.elementos.length;
            const completado = lista.elementos.filter(e => e.completado).length;

            return (
              <li key={lista.id} className="lista-item">
                <div>
                  <strong>{lista.nombre}</strong>
                  <p>{completado} / {total} completados</p>
                </div>
                <div className="acciones">
                  <button onClick={() => navigate(`/lista-compra/${id}/${lista.id}`)}>
                    📝 Ver lista
                  </button>
                  <button className="eliminar" onClick={() => eliminarLista(lista.id)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ListasCompraDashboard;
