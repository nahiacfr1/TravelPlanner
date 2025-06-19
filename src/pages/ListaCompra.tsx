import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ListaCompra.css";

interface ElementoCompra {
  nombre: string;
  completado: boolean;
}

function ListaCompra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombreLista, setNombreLista] = useState("Mi lista de la compra");
  const [elementos, setElementos] = useState<ElementoCompra[]>([]);
  const [nuevoElemento, setNuevoElemento] = useState("");

  // Cargar al iniciar
  useEffect(() => {
    if (!id) return;

    const almacenada = JSON.parse(localStorage.getItem(`listaCompraDetallada_${id}`) || "null");
    if (almacenada) {
      setNombreLista(almacenada.nombre || "Mi lista de la compra");
      setElementos(almacenada.elementos || []);
    } else {
      // Lista generada desde MenuSemanal
      const basica = JSON.parse(localStorage.getItem(`listaCompra_${id}`) || "[]");
      const inicial = basica.map((item: string) => ({ nombre: item, completado: false }));
      setElementos(inicial);
    }
  }, [id]);

  // Guardar automáticamente
  useEffect(() => {
    if (!id) return;
    const data = {
      nombre: nombreLista,
      elementos,
    };
    localStorage.setItem(`listaCompraDetallada_${id}`, JSON.stringify(data));
  }, [nombreLista, elementos, id]);

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

  const borrarLista = () => {
    if (!id) return;
    localStorage.removeItem(`listaCompraDetallada_${id}`);
    setElementos([]);
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
        <button className="borrar-lista" onClick={borrarLista}>
          🗑️ Eliminar lista completa
        </button>
      )}
    </div>
  );
}

export default ListaCompra;
