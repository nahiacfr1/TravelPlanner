// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");

    if (!users[email] || users[email].password !== password) {
      alert("Credenciales incorrectas");
      return;
    }

    localStorage.setItem("activeUser", email);
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Iniciar sesión</h1>
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
        <button onClick={handleLogin}>Entrar</button>
      </div>
    </div>
  );
}

export default Login;
