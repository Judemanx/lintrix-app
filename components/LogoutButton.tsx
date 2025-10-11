// components/LogoutButton.tsx
import React from "react";
import { useRouter } from "next/router";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // limpiar token y posible estado local
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // opcional: si guardas user en localStorage
    }

    // reemplaza la ruta para que el usuario no vuelva atrás con el botón "Back"
    router.replace("/auth/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      type="button"
    >
      Logout
    </button>
  );
}
