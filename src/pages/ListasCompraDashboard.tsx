import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ListasCompraDashboard.css";

interface ListaCompra {
  nombre: string;
  elementos: { nombre: string; completado: boolean }[];
}

function ListasCompraDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listas, setListas] = useState<{ nombre: string; total: number; completado: number }[]>([]);

  useEffect(() => {
    if (!id) return;

    const raw = localStorage.getItem(`listaCompraDetallada_${id}`);
    if (raw) {
      try {
        const data: ListaCompra = JSON.parse(raw);
        const total = data.elementos.length;
        const completado = data.elementos.filter(e => e.completado).length;

        setListas([{ nombre: data.nombre, total, completado }]);
      } catch (e) {
        console.error("Error al leer lista de la compra:", e);
      }
    }
  }, [id]);

  const irALaLista = () => {
    navigate(`/lista-compra/${id}`);
  };

  const borrarLista = () => {
    if (!id) return;
    localStorage.removeItem(`listaCompraDetallada_${id}`);
    setListas([]);
  };

  return (
    <div className="listas-compra-dashboard">
      <button className="volver" onClick={() => navigate(-1)}>← Volver al viaje</button>
      <h1>🛒 Listas de la compra</h1>

      {listas.length === 0 ? (
        <p>No hay listas de la compra guardadas para este viaje.</p>
      ) : (
        <ul>
          {listas.map((lista, i) => (
            <li key={i} className="lista-item">
              <div>
                <strong>{lista.nombre}</strong>
                <p>{lista.completado} / {lista.total} completados</p>
              </div>
              <div className="acciones">
                <button onClick={irALaLista}>📝 Ver lista</button>
                <button className="eliminar" onClick={borrarLista}>🗑️ Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListasCompraDashboard;
