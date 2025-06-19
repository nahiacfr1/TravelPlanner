// src/pages/Home.tsx
import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">TRAVEL PLANNER</h1>
      <div className="home-box">
        <button className="home-button" onClick={() => navigate("/register")}>
          Registrarse
        </button>
        <button className="home-button" onClick={() => navigate("/login")}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}

export default Home;
