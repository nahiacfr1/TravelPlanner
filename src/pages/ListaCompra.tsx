import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ListaCompra.css";

interface ElementoCompra {
  nombre: string;
  completado: boolean;
}

interface ListaCompra {
  id: string;
  nombre: string;
  elementos: ElementoCompra[];
}

function ListaCompra() {
  const { viajeId, idLista } = useParams();
  const navigate = useNavigate();

  const [nombreLista, setNombreLista] = useState("Mi lista");
  const [elementos, setElementos] = useState<ElementoCompra[]>([]);
  const [nuevoElemento, setNuevoElemento] = useState("");

  // Cargar lista al iniciar
  useEffect(() => {
    if (!viajeId || !idLista) return;

    const raw = localStorage.getItem(`listaCompraList_${viajeId}`);
    if (raw) {
      const data: ListaCompra[] = JSON.parse(raw);
      const lista = data.find((l) => l.id === idLista);
      if (lista) {
        setNombreLista(lista.nombre);
        setElementos(lista.elementos);
      }
    }
  }, [viajeId, idLista]);

  // Guardar en localStorage al cambiar
  useEffect(() => {
    if (!viajeId || !idLista) return;

    const raw = localStorage.getItem(`listaCompraList_${viajeId}`);
    if (!raw) return;

    const data: ListaCompra[] = JSON.parse(raw);
    const actualizadas = data.map((l) =>
      l.id === idLista ? { ...l, nombre: nombreLista, elementos } : l
    );

    localStorage.setItem(`listaCompraList_${viajeId}`, JSON.stringify(actualizadas));
  }, [nombreLista, elementos, viajeId, idLista]);

  const añadirElemento = () => {
    if (!nuevoElemento.trim()) return;
    setElementos([...elementos, { nombre: nuevoElemento.trim(), completado: false }]);
    setNuevoElemento("");
  };

  const eliminarElemento = (index: number) => {
    const copia = [...elementos];
    copia.splice(index, 1);
    setElementos(copia);
  };

  const toggleElemento = (index: number) => {
    const copia = [...elementos];
    copia[index].completado = !copia[index].completado;
    setElementos(copia);
  };

  const borrarListaCompleta = () => {
    if (!viajeId || !idLista) return;

    const raw = localStorage.getItem(`listaCompraList_${viajeId}`);
    if (!raw) return;

    const data: ListaCompra[] = JSON.parse(raw);
    const actualizadas = data.filter((l) => l.id !== idLista);
    localStorage.setItem(`listaCompraList_${viajeId}`, JSON.stringify(actualizadas));
    navigate(`/viaje/${viajeId}/listas-compra`);
  };

  const progreso = elementos.length
    ? Math.round((elementos.filter((e) => e.completado).length / elementos.length) * 100)
    : 0;

  return (
    <div className="lista-compra-pantalla">
      <button className="volver" onClick={() => navigate(-1)}>← Volver</button>

      <input
        className="titulo-lista"
        value={nombreLista}
        onChange={(e) => setNombreLista(e.target.value)}
      />

      <div className="barra-progreso">
        <div className="relleno" style={{ width: `${progreso}%` }}></div>
      </div>
      <p className="porcentaje">{progreso}% completado</p>

      <div className="añadir-form">
        <input
          type="text"
          placeholder="Añadir nuevo elemento"
          value={nuevoElemento}
          onChange={(e) => setNuevoElemento(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && añadirElemento()}
        />
        <button onClick={añadirElemento}>Añadir</button>
      </div>

      <ul className="lista-elementos">
        {elementos.map((item, i) => (
          <li key={i} className={item.completado ? "completado" : ""}>
            <label>
              <input
                type="checkbox"
                checked={item.completado}
                onChange={() => toggleElemento(i)}
              />
              {item.nombre}
            </label>
            <button className="eliminar" onClick={() => eliminarElemento(i)}>✕</button>
          </li>
        ))}
      </ul>

      {elementos.length > 0 && (
        <button className="borrar-lista" onClick={borrarListaCompleta}>
          🗑️ Eliminar esta lista
        </button>
      )}
    </div>
  );
}

export default ListaCompra;
