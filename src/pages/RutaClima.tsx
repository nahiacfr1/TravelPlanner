// src/pages/RutaClima.tsx
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder";
import "./RutaClima.css";
import { useNavigate } from "react-router-dom";

function RutaClima() {
const navigate = useNavigate();
  const [map, setMap] = useState<L.Map | null>(null);
  const [rutas, setRutas] = useState<any[]>([]);
  const [rutaSeleccionadaIndex, setRutaSeleccionadaIndex] = useState<number | null>(null);
  const [fechaViaje, setFechaViaje] = useState<string>("");
  const [horaViaje, setHoraViaje] = useState<string>("");
  const [climaPorPunto, setClimaPorPunto] = useState<any[]>([]);
  const origenRef = useRef<HTMLInputElement>(null);
  const destinoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (map || document.getElementById("map")?.hasChildNodes()) return;

    const newMap = L.map("map").setView([43.263, -2.935], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(newMap);

    setMap(newMap);
  }, [map]);

  const fetchCoords = async (place: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json`
    );
    const data = await res.json();
    return data.map((result: any) => L.latLng(result.lat, result.lon));
  };

  const obtenerNombreCiudad = async (lat: number, lon: number) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || "Ubicación desconocida";
  };

  const obtenerClima = async (lat: number, lon: number, timestamp: number) => {
    const fecha = new Date(timestamp);
    const fechaISO = fecha.toISOString().slice(0, 13);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode,precipitation&start=${fechaISO}&timezone=Europe/Madrid`;

    const res = await fetch(url);
    const data = await res.json();
    const index = data.hourly.time.findIndex((t: string) => new Date(t).getHours() === fecha.getHours());
    if (index === -1) return "❓ Sin datos";

    const temp = data.hourly.temperature_2m[index];
    const code = data.hourly.weathercode[index];
    const rain = data.hourly.precipitation[index];

    return `${codeToEmoji(code)} (${temp}°C, ${rain} mm)`;
  };

  const codeToEmoji = (code: number) => {
    if (code < 2) return "☀️";
    if (code < 3) return "🌤️";
    if (code < 50) return "☁️";
    if (code < 60) return "🌧️";
    if (code < 70) return "🌦️";
    if (code < 80) return "🌨️";
    return "❓";
  };

  const calcularClimaEnRuta = async (coords: L.LatLng[], totalDistance: number, totalTime: number) => {
    const puntosCada50Km: { punto: L.LatLng; offsetTiempo: number }[] = [];
    let distanciaAcumulada = 0;
    let tiempoAcumulado = 0;

    for (let i = 1; i < coords.length; i++) {
      const segmento = coords[i - 1].distanceTo(coords[i]);
      distanciaAcumulada += segmento;
      const tiempoSegmento = (segmento / totalDistance) * totalTime;
      tiempoAcumulado += tiempoSegmento;
      if (distanciaAcumulada >= 50000) {
        puntosCada50Km.push({ punto: coords[i], offsetTiempo: tiempoAcumulado });
        distanciaAcumulada = 0;
      }
    }

    const fecha = new Date(`${fechaViaje}T${horaViaje}`);
    const timestampInicio = fecha.getTime();

    const climas = await Promise.all(
      puntosCada50Km.map(async ({ punto, offsetTiempo }) => {
        const timestamp = timestampInicio + offsetTiempo * 1000;
        const clima = await obtenerClima(punto.lat, punto.lng, timestamp);
        const ciudad = await obtenerNombreCiudad(punto.lat, punto.lng);
        return {
          punto,
          ciudad,
          clima,
          horaEstimada: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      })
    );

    setClimaPorPunto(climas);
  };

  const calcularRuta = async () => {
    if (!map) return;
    const origen = origenRef.current?.value || "";
    const destino = destinoRef.current?.value || "";
    if (!origen.trim() || !destino.trim()) return;

    const origenCoords = await fetchCoords(origen);
    const destinoCoords = await fetchCoords(destino);

    if (!origenCoords.length || !destinoCoords.length) {
      alert("No se pudo encontrar una de las ubicaciones");
      return;
    }

    rutas.forEach(route => map.removeLayer(route.polyline));
    // @ts-ignore
    const routing = L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" });

    routing.route([
      { latLng: origenCoords[0] },
      { latLng: destinoCoords[0] },
    ], async (err: any, routes: any[]) => {
      if (err || !routes) {
        alert("No se pudo calcular la ruta");
        return;
      }

      const nuevasRutas = routes.map((ruta: any, idx: number) => {
        const polyline = L.polyline(ruta.coordinates, {
          color: "#0074D9",
          weight: 5,
          opacity: 0.7
        }).addTo(map);

        polyline.on("click", async () => {
          rutas.forEach(r => r.polyline.setStyle({ color: "#0074D9", weight: 5, opacity: 0.7 }));
          polyline.setStyle({ color: "#2ECC40", weight: 6, opacity: 1 });
          setRutaSeleccionadaIndex(idx);

          const resumen = {
            origen,
            destino,
            distanciaKm: (ruta.summary.totalDistance / 1000).toFixed(1),
            duracionMin: Math.round(ruta.summary.totalTime / 60),
            fechaGuardado: new Date().toISOString(),
          };

          localStorage.setItem("rutaSeleccionada", JSON.stringify(resumen));

          if (fechaViaje && horaViaje) {
            await calcularClimaEnRuta(ruta.coordinates, ruta.summary.totalDistance, ruta.summary.totalTime);
          } else {
            alert("Selecciona fecha y hora del viaje antes de confirmar la ruta.");
          }
        });

        return { polyline, ruta };
      });

      setRutas(nuevasRutas);
    });
  };

  return (
    <div className="ruta-clima">
        <button className="volver" onClick={() => navigate(-1)}>← Volver</button>
      <h1>🌦️ Ruta y Clima del Viaje</h1>
      <p>Introduce origen, destino, fecha y hora del viaje. Se mostrarán las rutas disponibles. Haz clic en una para ver el clima estimado durante el trayecto.</p>

      <div className="inputs">
        <input ref={origenRef} type="text" placeholder="Origen del viaje" />
        <input ref={destinoRef} type="text" placeholder="Destino final" />
        <input type="date" value={fechaViaje} onChange={(e) => setFechaViaje(e.target.value)} />
        <input type="time" value={horaViaje} onChange={(e) => setHoraViaje(e.target.value)} />
        <button onClick={calcularRuta}>🧭 Calcular ruta</button>
      </div>

      <div id="map" style={{ height: "500px", width: "100%", marginTop: "20px" }}></div>

      {rutaSeleccionadaIndex !== null && (
        <div className="confirmacion">
          <p>Ruta #{rutaSeleccionadaIndex + 1} seleccionada correctamente.</p>
          {climaPorPunto.length > 0 && (
            <div className="climas">
              <h3>⛅ Clima estimado cada 50km:</h3>
              <ul>
                {climaPorPunto.map((c, i) => (
                  <li key={i}>{c.ciudad} ({c.horaEstimada}): {c.clima}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RutaClima;
