// src/pages/PlanificarMenu.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PlanificarMenu.css";

function PlanificarMenu() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [errores, setErrores] = useState("");

  const calcularSemanas = () => {
    if (!fechaInicio || !fechaFin) {
      setErrores("Debes seleccionar ambas fechas");
      return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (inicio > fin) {
      setErrores("La fecha de inicio no puede ser posterior a la de fin");
      return;
    }

    const bloques: { inicio: string; fin: string }[] = [];
    let actual = new Date(inicio);

    while (actual <= fin) {
      const siguiente = new Date(actual);
      siguiente.setDate(siguiente.getDate() + 6);
      const finBloque = siguiente > fin ? fin : siguiente;

      bloques.push({
        inicio: actual.toISOString().split("T")[0],
        fin: finBloque.toISOString().split("T")[0],
      });

      actual = new Date(finBloque);
      actual.setDate(actual.getDate() + 1);
    }

    if (id) {
      localStorage.setItem(`bloquesMenu_${id}`, JSON.stringify(bloques));
      navigate(`/viaje/${id}/menu-semanal`);
    } else {
      setErrores("ID del viaje no encontrado");
    }
  };

  return (
    <div className="planificador">
      <h1>Planificar Menú del Viaje</h1>
      <label>
        Fecha de inicio:
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
      </label>
      <label>
        Fecha de fin:
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
      </label>
      {errores && <p className="error">{errores}</p>}
      <button onClick={calcularSemanas}>Generar menús semanales</button>
    </div>
  );
}

export default PlanificarMenu;
