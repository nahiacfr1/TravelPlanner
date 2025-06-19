// src/layouts/PrivateLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";

function PrivateLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = localStorage.getItem("activeUser");
    if (!usuario) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default PrivateLayout;
