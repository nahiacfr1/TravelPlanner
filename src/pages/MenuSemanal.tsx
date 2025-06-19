import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./MenuSemanal.css";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";

interface DiaMenu {
  fecha: string;
  desayuno: string;
  comida: string;
  cena: string;
}

interface Receta {
  id: string;
  nombre: string;
}

function MenuSemanal() {
  const { id } = useParams();
  const [menus, setMenus] = useState<DiaMenu[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);

  useEffect(() => {
    if (!id) return;

    const bloques = JSON.parse(localStorage.getItem(`bloquesMenu_${id}`) || "[]");
    const almacenado = JSON.parse(localStorage.getItem(`menusViaje_${id}`) || "{}");
    const listaRecetas = JSON.parse(localStorage.getItem("recetas") || "[]");

    setRecetas(
      listaRecetas.map((r: any, idx: number) => ({ id: idx.toString(), nombre: r.nombre }))
    );

    const dias: DiaMenu[] = [];
    bloques.forEach((bloque: { inicio: string; fin: string }) => {
      const actual = new Date(bloque.inicio);
      const fin = new Date(bloque.fin);

      while (actual <= fin) {
        const fechaStr = actual.toISOString().split("T")[0];
        dias.push({
          fecha: fechaStr,
          desayuno: almacenado[fechaStr]?.desayuno || "",
          comida: almacenado[fechaStr]?.comida || "",
          cena: almacenado[fechaStr]?.cena || "",
        });
        actual.setDate(actual.getDate() + 1);
      }
    });

    setMenus(dias);
  }, [id]);

  const actualizarMenu = (fecha: string, campo: keyof DiaMenu, valor: string) => {
    const actualizado = menus.map((dia) =>
      dia.fecha === fecha ? { ...dia, [campo]: valor } : dia
    );
    setMenus(actualizado);

    const almacenado = JSON.parse(localStorage.getItem(`menusViaje_${id}`) || "{}");
    almacenado[fecha] = { ...almacenado[fecha], [campo]: valor };
    localStorage.setItem(`menusViaje_${id}`, JSON.stringify(almacenado));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const [fecha, campo] = destination.droppableId.split("|");
    const receta = recetas.find((r) => r.id === draggableId);
    if (receta) {
      actualizarMenu(fecha, campo as keyof DiaMenu, receta.nombre);
    }
  };

  return (
    <div className="menu-semanal">
      <h1>Menú Diario del Viaje</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="zona-recetas">
          <h2>📋 Recetas disponibles</h2>
          <Droppable droppableId="recetas" direction="horizontal" isDropDisabled={true}>
            {(provided) => (
              <div
                className="recetas-lista"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {recetas.map((receta, index) => (
                  <Draggable
                    key={receta.id}
                    draggableId={receta.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className="receta-draggable"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {receta.nombre}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {menus.map((dia) => (
          <div key={dia.fecha} className="dia-menu">
            <h3>{dia.fecha}</h3>
            {(["desayuno", "comida", "cena"] as (keyof DiaMenu)[]).map((campo) => (
              <Droppable droppableId={`${dia.fecha}|${campo}`} key={campo}>
                {(provided, snapshot) => (
                  <div
                    className={`menu-bloque ${
                      snapshot.isDraggingOver ? "dragging-over" : ""
                    }`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <label>
                      {campo.charAt(0).toUpperCase() + campo.slice(1)}:
                      <input
                        type="text"
                        value={dia[campo]}
                        onChange={(e) => actualizarMenu(dia.fecha, campo, e.target.value)}
                      />
                    </label>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}

export default MenuSemanal;
