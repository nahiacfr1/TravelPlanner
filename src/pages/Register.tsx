// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");

    if (users[email]) {
      alert("Este usuario ya existe");
      return;
    }

    users[email] = { password, maletas: [] };
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registro completado");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Crear cuenta</h1>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Registrarse</button>
      </div>
    </div>
  );
}

export default Register;
