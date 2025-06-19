// MenuSemanal.tsx
import { useParams, useNavigate } from "react-router-dom";
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
  ingredientes?: string;
}

function MenuSemanal() {
  const { id, menuId } = useParams();
  const navigate = useNavigate();
  const [menus, setMenus] = useState<DiaMenu[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);

  useEffect(() => {
    if (!id || !menuId) return;

    const listaRecetas = JSON.parse(localStorage.getItem("recetas") || "[]");
    setRecetas(
      listaRecetas.map((r: any, idx: number) => ({
        id: idx.toString(),
        nombre: r.nombre,
        ingredientes: r.ingredientes,
      }))
    );

    const keyBloques = `menusViajeList_${id}`;
    const keyMenus = `menusViaje_${menuId}`;
    const menusGuardados = JSON.parse(localStorage.getItem(keyMenus) || "{}");
    const lista = JSON.parse(localStorage.getItem(keyBloques) || "[]");
    const seleccionado = lista.find((m: any) => m.id === menuId);
    const bloques = seleccionado?.bloques || [];

    const dias: DiaMenu[] = [];
    bloques.forEach((bloque: { inicio: string; fin: string }) => {
      const actual = new Date(bloque.inicio);
      const fin = new Date(bloque.fin);
      while (actual <= fin) {
        const fechaStr = actual.toISOString().split("T")[0];
        dias.push({
          fecha: fechaStr,
          desayuno: menusGuardados[fechaStr]?.desayuno || "",
          comida: menusGuardados[fechaStr]?.comida || "",
          cena: menusGuardados[fechaStr]?.cena || "",
        });
        actual.setDate(actual.getDate() + 1);
      }
    });

    setMenus(dias);
  }, [id, menuId]);

  const actualizarMenu = (fecha: string, campo: keyof DiaMenu, valor: string) => {
    const actualizado = menus.map((dia) =>
      dia.fecha === fecha ? { ...dia, [campo]: valor } : dia
    );
    setMenus(actualizado);

    const almacenado = JSON.parse(localStorage.getItem(`menusViaje_${menuId}`) || "{}");
    almacenado[fecha] = { ...almacenado[fecha], [campo]: valor };
    localStorage.setItem(`menusViaje_${menuId}`, JSON.stringify(almacenado));
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

  const prepararListaCompra = () => {
    const recetasEnMenu = new Set<string>();
    menus.forEach((dia) => {
      ["desayuno", "comida", "cena"].forEach((campo) => {
        const valor = dia[campo as keyof DiaMenu];
        if (valor) recetasEnMenu.add(valor);
      });
    });

    const ingredientes = new Set<string>();

    recetas.forEach((receta) => {
      if (recetasEnMenu.has(receta.nombre)) {
        (receta.ingredientes || "")
          .split("\n")
          .map((linea: string) => linea.trim())
          .filter((linea: string) => linea !== "")
          .forEach((ing: string) => ingredientes.add(ing));
      }
    });

    if (menuId) {
      localStorage.setItem(`listaCompra_${menuId}`, JSON.stringify([...ingredientes]));
      navigate(`/lista-compra/${menuId}`);
    }
  };

  return (
    <div className="menu-semanal">
      <h1>Menú Diario del Viaje</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="zona-recetas">
          <h2>📋 Recetas disponibles</h2>
          <button
            className="boton-ir-recetas"
            onClick={() => navigate("/recetas")}
          >
            ➕ Añadir nueva receta
          </button>
          <Droppable droppableId="recetas" direction="horizontal" isDropDisabled={true}>
            {(provided) => (
              <div
                className="recetas-lista"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {recetas.map((receta, index) => (
                  <Draggable key={receta.id} draggableId={receta.id} index={index}>
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
            {["desayuno", "comida", "cena"].map((campo) => (
              <Droppable droppableId={`${dia.fecha}|${campo}`} key={campo}>
                {(provided, snapshot) => (
                  <div
                    className={`menu-bloque ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <label>
                      {campo.charAt(0).toUpperCase() + campo.slice(1)}:
                      <input
                        type="text"
                        value={dia[campo as keyof DiaMenu]}
                        onChange={(e) => actualizarMenu(dia.fecha, campo as keyof DiaMenu, e.target.value)}
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

      <div className="boton-lista-compra">
        <button onClick={prepararListaCompra}>🛒 Ir a la lista de la compra</button>
      </div>
    </div>
  );
}

export default MenuSemanal;
