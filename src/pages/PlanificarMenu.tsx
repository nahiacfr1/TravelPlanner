// PlanificarMenu.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PlanificarMenu.css";

function PlanificarMenu() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [errores, setErrores] = useState("");
  const [bloquesExistentes, setBloquesExistentes] = useState<
    { inicio: string; fin: string }[] | null
  >(null);

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`menusViajeList_${id}`);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          const ultimo = data[data.length - 1];
          if (ultimo?.bloques?.length) {
            setBloquesExistentes(ultimo.bloques);
          }
        }
      } catch {
        console.error("Error al leer bloques de menú.");
      }
    }
  }, [id]);

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

    if (!id) {
      setErrores("ID del viaje no encontrado");
      return;
    }

    const key = `menusViajeList_${id}`;
    const existentes: any[] = JSON.parse(localStorage.getItem(key) || "[]");

    const yaExiste = existentes.find(
      (m) =>
        m.bloques?.length === bloques.length &&
        m.bloques?.[0]?.inicio === bloques[0].inicio &&
        m.bloques?.[m.bloques.length - 1]?.fin === bloques[bloques.length - 1].fin
    );

    if (yaExiste) {
      const confirmar = window.confirm(
        "Ya existe un menú con este rango de fechas. ¿Quieres sobrescribirlo?"
      );

      if (confirmar) {
        const actualizados = existentes.map((m) =>
          m.id === yaExiste.id ? { ...m, bloques } : m
        );
        localStorage.setItem(key, JSON.stringify(actualizados));
        navigate(`/viaje/${id}/menu-semanal/${yaExiste.id}`);
      } else {
        const nuevo = { id: Date.now().toString(), bloques };
        localStorage.setItem(key, JSON.stringify([...existentes, nuevo]));
        navigate(`/viaje/${id}/menu-semanal/${nuevo.id}`);
      }
    } else {
      const nuevo = { id: Date.now().toString(), bloques };
      localStorage.setItem(key, JSON.stringify([...existentes, nuevo]));
      navigate(`/viaje/${id}/menu-semanal/${nuevo.id}`);
    }
  };

  return (
    <div className="planificador">
      <h1>Planificar Menú del Viaje</h1>

      {bloquesExistentes && (
        <div className="bloques-existentes">
          <p>
            Ya hay un menú planificado del {bloquesExistentes[0].inicio} al {" "}
            {bloquesExistentes[bloquesExistentes.length - 1].fin}
          </p>
          <button
            className="ver-menu"
            onClick={() => {
              const raw = localStorage.getItem(`menusViajeList_${id}`);
              if (raw) {
                const data = JSON.parse(raw);
                if (data.length > 0) {
                  const ultimo = data[data.length - 1];
                  navigate(`/viaje/${id}/menu-semanal/${ultimo.id}`);
                }
              }
            }}
          >
            📅 Ver menú planificado
          </button>
        </div>
      )}

      <label>
        Fecha de inicio:
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
      </label>
      <label>
        Fecha de fin:
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
      </label>
      {errores && <p className="error">{errores}</p>}
      <button onClick={calcularSemanas}>Generar menús semanales</button>
    </div>
  );
}

export default PlanificarMenu;
