// src/pages/Recetas.tsx
import { useState, useEffect } from "react";
import "./Recetas.css";


interface Receta {
  nombre: string;
  ingredientes: string;
  preparacion: string;
}

function Recetas() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [nueva, setNueva] = useState<Receta>({ nombre: "", ingredientes: "", preparacion: "" });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Receta>({ nombre: "", ingredientes: "", preparacion: "" });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recetas") || "[]");
    setRecetas(saved);
  }, []);

  const guardarRecetas = (r: Receta[]) => {
    localStorage.setItem("recetas", JSON.stringify(r));
    setRecetas(r);
  };

  const añadirReceta = () => {
    if (!nueva.nombre.trim()) return;
    const actualizadas = [...recetas, nueva];
    guardarRecetas(actualizadas);
    setNueva({ nombre: "", ingredientes: "", preparacion: "" });
  };

  const iniciarEdicion = (index: number) => {
    setEditIndex(index);
    setEditData(recetas[index]);
  };

  const guardarEdicion = () => {
    if (editIndex === null) return;
    const actualizadas = recetas.map((r, i) => (i === editIndex ? editData : r));
    guardarRecetas(actualizadas);
    setEditIndex(null);
    setEditData({ nombre: "", ingredientes: "", preparacion: "" });
  };

  const cancelarEdicion = () => {
    setEditIndex(null);
    setEditData({ nombre: "", ingredientes: "", preparacion: "" });
  };

  return (
    <div className="recetas-page">
      <h1>Mis Recetas</h1>
      <div className="formulario-receta">
        <input
          placeholder="Nombre"
          value={nueva.nombre}
          onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
        />
        <textarea
          placeholder="Ingredientes (uno por línea)"
          value={nueva.ingredientes}
          onChange={(e) => setNueva({ ...nueva, ingredientes: e.target.value })}
        />
        <textarea
          placeholder="Preparación"
          value={nueva.preparacion}
          onChange={(e) => setNueva({ ...nueva, preparacion: e.target.value })}
        />
        <button onClick={añadirReceta}>Añadir receta</button>
      </div>
      <ul className="lista-recetas">
        {recetas.map((r, i) => (
          <li key={i}>
            {editIndex === i ? (
              <div>
                <input
                  value={editData.nombre}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                />
                <textarea
                  value={editData.ingredientes}
                  onChange={(e) => setEditData({ ...editData, ingredientes: e.target.value })}
                />
                <textarea
                  value={editData.preparacion}
                  onChange={(e) => setEditData({ ...editData, preparacion: e.target.value })}
                />
                <button onClick={guardarEdicion}>Guardar</button>
                <button onClick={cancelarEdicion}>Cancelar</button>
              </div>
            ) : (
              <div>
                <strong>{r.nombre}</strong>
                <p><b>Ingredientes:</b><br />{r.ingredientes.split('\n').map((linea, j) => <span key={j}>• {linea}<br /></span>)}</p>
                <p><b>Preparación:</b> {r.preparacion}</p>
                <button onClick={() => iniciarEdicion(i)}>Editar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Recetas;