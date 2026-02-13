"use client"

import * as React from "react"
import { LandingPage } from "@/components/ui/landingPage" 
import { LoginPage } from "@/components/ui/loginPage" 
import { RegisterPage } from "@/components/ui/registerPage"
import { AgendaView } from "@/components/dashboard/agenda-view"

export default function Home() { 
  const [vista, setVista] = React.useState<"landing" | "login" | "register" | "agenda">("landing")
  const [usuario, setUsuario] = React.useState<any>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  // 1. CHEQUEO DE SESIÓN
  React.useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario_clipp")
    if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado))
        setVista("agenda") 
    }
  }, [])

  // 2. DETECTOR DE RETORNO DE MERCADO PAGO
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "approved" && usuario) {
      const activarSuscripcion = async () => {
        try {
          const res = await fetch('/api/auth/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuario.email_unico })
          });

          if (res.ok) {
            const usuarioActualizado = { ...usuario, suscrito: true };
            handleUpdateUser(usuarioActualizado); // Usamos nuestra nueva función
            window.history.replaceState({}, document.title, "/");
            alert("¡Excelente! Tu suscripción se activó correctamente.");
          }
        } catch (error) {
          console.error("Error al activar suscripción:", error);
        }
      };
      activarSuscripcion();
    }
  }, [usuario]);

  // --- NUEVA FUNCIÓN DE ACTUALIZACIÓN GLOBAL ---
  const handleUpdateUser = (nuevoData: any) => {
    // Si la API devuelve el objeto dentro de 'data', lo extraemos, sino usamos el objeto directo
    const datosFinales = nuevoData.data || nuevoData;
    
    setUsuario(datosFinales);
    localStorage.setItem("usuario_clipp", JSON.stringify(datosFinales));
  };

  // HANDLERS
  const handleLoginSuccess = () => {
      const u = localStorage.getItem("usuario_clipp")
      if (u) {
          setUsuario(JSON.parse(u))
          setVista("agenda")
      }
  }

  const handleLogout = () => {
      localStorage.removeItem("usuario_clipp")
      setUsuario(null)
      setVista("landing")
  }

  const handleRegisterSubmit = async (datosUsuario: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosUsuario)
      });

      const data = await res.json();

      if (res.ok) {
        // 🟢 ÉXITO
        return true; 
      } else {
        // 🔴 ERROR: Dejamos que el Backend decida el mensaje (Email o Slug)
        return data.message || "Hubo un error en el registro";
      }
    } catch (error) { 
      console.error("Error de registro:", error);
      return "Error de conexión. Verificá tu internet.";
    }
  }

  if (!mounted) return <div className="min-h-screen bg-[#FDFBF7]"></div> 

  // FLUJO DE NAVEGACIÓN
  switch (vista) {
      case "landing":
          return (
            <LandingPage 
              onIngresar={() => setVista("login")} 
              onRegisterClick={() => setVista("register")} 
              idComercio={usuario?.id_comercio || 2}
            />
          )
      
      case "login":
          return (
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
              onRegisterClick={() => setVista("register")} 
              onVolver={() => setVista("landing")}
            />
          )
      
      case "register":
          return (
            <RegisterPage 
              onRegisterSubmit={handleRegisterSubmit} 
              onLoginClick={() => setVista("login")}
              onVolver={() => setVista("landing")}
            />
          )
      
      case "agenda":
          return (
            <AgendaView 
              usuario={usuario} 
              onLogout={handleLogout} 
              onUpdateUser={handleUpdateUser} // <-- PASAMOS LA FUNCIÓN AQUÍ
            />
          )
      
      default:
          return <LandingPage onIngresar={() => setVista("login")} onRegisterClick={() => setVista("register")} />
  }
}