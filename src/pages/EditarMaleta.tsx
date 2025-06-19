// src/pages/EditarMaleta.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import "./EditarMaleta.css";

interface Maleta {
  nombre: string;
  tipo: string;
  items: { nombre: string; marcado: boolean; añadirLista?: boolean }[];
}

interface Viaje {
  id: string;
  nombre: string;
  maletas: Maleta[];
  menus: any[];
}

function EditarMaleta() {
  const { id, nombreMaleta } = useParams();
  const navigate = useNavigate();
  const [maleta, setMaleta] = useState<Maleta | null>(null);
  const [nuevoItem, setNuevoItem] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const iniciarEdicion = (index: number, texto: string) => {
    setEditIndex(index);
    setEditText(texto);
  };

  const guardarEdicion = (index: number) => {
    if (!maleta) return;
    const nuevaMaleta = {
      ...maleta,
      items: maleta.items.map((item, i) =>
        i === index ? { ...item, nombre: editText } : item
      ),
    };
    setMaleta(nuevaMaleta);
    guardar(nuevaMaleta);
    setEditIndex(null);
  };

  const eliminarItem = (nombre: string) => {
    if (!maleta) return;
    const nuevaMaleta = {
      ...maleta,
      items: maleta.items.filter((item) => item.nombre !== nombre),
    };
    setMaleta(nuevaMaleta);
    guardar(nuevaMaleta);
  };

  useEffect(() => {
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) {
      navigate("/login");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const viajes = users[activeUser]?.maletas || [];

    const viaje = viajes.find((v: Viaje) => v.id === id);
    const m = viaje?.maletas.find(
      (m: Maleta) => m.nombre === decodeURIComponent(nombreMaleta || "")
    );

    if (!viaje || !m) {
      alert("Maleta no encontrada");
      navigate(`/viaje/${id}`);
    } else {
      setMaleta(m);
    }
  }, [id, nombreMaleta, navigate]);

  const toggleItem = (nombre: string) => {
    if (!maleta) return;
    const nuevaMaleta = {
      ...maleta,
      items: maleta.items.map((item) =>
        item.nombre === nombre ? { ...item, marcado: !item.marcado } : item
      ),
    };
    setMaleta(nuevaMaleta);
    guardar(nuevaMaleta);
  };

  const toggleAñadirLista = (nombre: string) => {
    if (!maleta) return;
    const nuevaMaleta = {
      ...maleta,
      items: maleta.items.map((item) =>
        item.nombre === nombre ? { ...item, añadirLista: !item.añadirLista } : item
      ),
    };
    setMaleta(nuevaMaleta);
    guardar(nuevaMaleta);
  };

  const guardar = (nuevaMaleta: Maleta) => {
    const activeUser = localStorage.getItem("activeUser")!;
    const users = JSON.parse(localStorage.getItem("users") || "{}");

    const updatedViajes = users[activeUser].maletas.map((v: Viaje) => {
      if (v.id === id) {
        return {
          ...v,
          maletas: v.maletas.map((m: Maleta) =>
            m.nombre === decodeURIComponent(nombreMaleta || "")
              ? nuevaMaleta
              : m
          ),
        };
      }
      return v;
    });

    users[activeUser].maletas = updatedViajes;
    localStorage.setItem("users", JSON.stringify(users));
  };

  const añadirItem = () => {
    if (!nuevoItem.trim() || !maleta) return;
    const nuevaMaleta = {
      ...maleta,
      items: [...maleta.items, { nombre: nuevoItem.trim(), marcado: false, añadirLista: false }],
    };
    setNuevoItem("");
    setMaleta(nuevaMaleta);
    guardar(nuevaMaleta);
  };

  const añadirAListaCompra = () => {
    if (!id || !maleta) return;
    const seleccionados = maleta.items
      .filter((item) => item.añadirLista)
      .map((item) => item.nombre);

    if (seleccionados.length === 0) {
      alert("Selecciona al menos un ítem para añadir a la lista de la compra.");
      return;
    }

    const clave = `listaCompra_${id}`;
    const existente = localStorage.getItem(clave);

    if (existente) {
      const confirmar = window.confirm("Ya existe una lista. ¿Quieres añadir a la existente?");
      if (confirmar) {
        const actual = JSON.parse(existente);
        const fusionada = Array.from(new Set([...actual, ...seleccionados]));
        localStorage.setItem(clave, JSON.stringify(fusionada));
        alert("Ítems añadidos a la lista existente.");
      } else {
        const nuevaClave = `listaCompra_${id}_${Date.now()}`;
        localStorage.setItem(nuevaClave, JSON.stringify(seleccionados));
        alert("Se ha creado una nueva lista de la compra.");
      }
    } else {
      localStorage.setItem(clave, JSON.stringify(seleccionados));
      alert("Lista de la compra creada con los ítems seleccionados.");
    }
  };

  if (!maleta) return null;
  const itemsValidos = maleta.items.filter(
    (item) => item && typeof item.nombre === "string" && item.nombre.trim() !== ""
  );
  const totalItems = itemsValidos.length;
  const itemsMarcados = itemsValidos.filter((item) => item.marcado).length;
  const progreso = totalItems === 0 ? 0 : Math.round((itemsMarcados / totalItems) * 100);

  return (
    <div className="min-h-screen">
      <div className="panel-edicion">
        <button className="volver" onClick={() => navigate(-1)}>← Volver</button>
        <h1>Editar maleta: {maleta.nombre}</h1>
        <p className="progreso">
          Progreso: {itemsMarcados} / {totalItems} ítems embalados
        </p>
        <div className="barra-progreso">
          <div
            className="relleno-progreso"
            style={{ width: `${progreso}%`, height: "10px", backgroundColor: "#6a8f6d" }}
          />
        </div>

        <h2>Contenido</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="items">
            {(provided: any) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {itemsValidos.map((item, index) => (
                  <Draggable
                    key={item.nombre}
                    draggableId={item.nombre}
                    index={index}
                  >
                    {(provided: any) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <input
                          type="checkbox"
                          checked={item.marcado}
                          onChange={() => toggleItem(item.nombre)}
                        />
                        {editIndex === index ? (
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={() => guardarEdicion(index)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") guardarEdicion(index);
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            style={{
                              textDecoration: item.marcado ? "line-through" : "none",
                              cursor: "pointer",
                            }}
                            onDoubleClick={() => iniciarEdicion(index, item.nombre)}
                          >
                            {item.nombre}
                          </span>
                        )}
                        <label style={{ marginLeft: "10px" }}>
                          <input
                            type="checkbox"
                            checked={item.añadirLista || false}
                            onChange={() => toggleAñadirLista(item.nombre)}
                          /> Añadir a lista
                        </label>
                        <button
                          className="btn-borrar"
                          onClick={() => eliminarItem(item.nombre)}
                        >
                          🗑️
                        </button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <div className="form-agregar">
          <input
            type="text"
            value={nuevoItem}
            onChange={(e) => setNuevoItem(e.target.value)}
            placeholder="Añadir ítem"
          />
          <button onClick={añadirItem}>Añadir</button>
        </div>

        <div className="form-agregar">
          <button onClick={añadirAListaCompra}>📦 Añadir a lista de la compra</button>
        </div>
      </div>
    </div>
  );
}

export default EditarMaleta;
