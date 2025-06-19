// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CrearViaje from "./pages/CrearViaje";
import ViajeDashboard from "./pages/ViajeDashboard";
import EditarMaleta from "./pages/EditarMaleta";
import PrivateLayout from "./pages/PrivateLayout";
import Recetas from "./pages/Recetas";
import PlanificarMenu from "./pages/PlanificarMenu";
import MenuSemanal from "./pages/MenuSemanal";
import RutaClima from "./pages/RutaClima";
import ListaCompra from "./pages/ListaCompra";
import ListasCompraDashboard from "./pages/ListasCompraDashboard";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateLayout />}>
        <Route path="/viaje/:id/planificar-menu" element={<PlanificarMenu />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/viaje/:id/menu-semanal" element={<MenuSemanal />} />
        <Route path="/viaje/:id/ruta-clima" element={<RutaClima />} />
        <Route path="/lista-compra/:viajeId/:idLista" element={<ListaCompra />} />
        <Route path="/crear-viaje" element={<CrearViaje />} />
        <Route path="/recetas" element={<Recetas />} />
        <Route path="/viaje/:id" element={<ViajeDashboard />} />
        <Route path="/viaje/:id/listas-compra" element={<ListasCompraDashboard />} />
        <Route path="/viaje/:id/maleta/:nombreMaleta" element={<EditarMaleta />} />
      </Route>
    </Routes>
  );
}

export default App;
