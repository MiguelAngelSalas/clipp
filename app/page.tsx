"use client"

import * as React from "react"
import { LandingPage } from "@/components/ui/landingPage" 
import { LoginPage } from "@/components/ui/loginPage" 
import { RegisterPage } from "@/components/ui/registerPage"
import { AgendaView } from "@/components/dashboard/agenda-view"
import { NosotrosSection } from "@/components/ui/nosotrosSection" // <--- Importalo acá

export default function Home() { 
  // 1. Agregamos "nosotros" al tipo de la unión
  const [vista, setVista] = React.useState<"landing" | "login" | "register" | "agenda" | "nosotros">("landing")
  const [usuario, setUsuario] = React.useState<any>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  // --- SINCRONIZACIÓN CON EL BOTÓN ATRÁS DE CHROME ---
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const vistaGuardada = event.state?.vista || "landing"
      setVista(vistaGuardada)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Función para navegar y que el botón de atrás funcione
  const navegarA = (nuevaVista: "landing" | "login" | "register" | "agenda" | "nosotros") => {
    window.history.pushState({ vista: nuevaVista }, "")
    setVista(nuevaVista)
  }

  // --- CHEQUEO DE SESIÓN ---
  React.useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario_clipp")
    if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado))
        setVista("agenda") 
    }
  }, [])

  // --- DETECTOR DE RETORNO DE MERCADO PAGO ---
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
            handleUpdateUser(usuarioActualizado);
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

  const handleUpdateUser = (nuevoData: any) => {
    const datosFinales = nuevoData.data || nuevoData;
    setUsuario(datosFinales);
    localStorage.setItem("usuario_clipp", JSON.stringify(datosFinales));
  };

  const handleLoginSuccess = () => {
      const u = localStorage.getItem("usuario_clipp")
      if (u) {
          setUsuario(JSON.parse(u))
          navegarA("agenda")
      }
  }

  const handleLogout = () => {
      localStorage.removeItem("usuario_clipp")
      setUsuario(null)
      navegarA("landing")
  }

  const handleRegisterSubmit = async (datosUsuario: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosUsuario)
      });
      const data = await res.json();
      return res.ok ? true : (data.message || "Hubo un error en el registro");
    } catch (error) { 
      console.error("Error de registro:", error);
      return "Error de conexión.";
    }
  }

  if (!mounted) return <div className="min-h-screen bg-[#FDFBF7]"></div> 

  // --- FLUJO DE NAVEGACIÓN ---
  switch (vista) {
      case "landing":
          return (
            <LandingPage 
              onIngresar={() => navegarA("login")} 
              onRegisterClick={() => navegarA("register")} 
              onNosotrosClick={() => navegarA("nosotros")} // <--- Pasamos la prop
              idComercio={usuario?.id_comercio || 2}
            />
          )
      
      case "nosotros":
          return (
            <NosotrosSection onVolver={() => navegarA("landing")} />
          )
      
      case "login":
          return (
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
              onRegisterClick={() => navegarA("register")} 
              onVolver={() => navegarA("landing")}
            />
          )
      
      case "register":
          return (
            <RegisterPage 
              onRegisterSubmit={handleRegisterSubmit} 
              onLoginClick={() => navegarA("login")}
              onVolver={() => navegarA("landing")}
            />
          )
      
      case "agenda":
          return (
            <AgendaView 
              usuario={usuario} 
              onLogout={handleLogout} 
              onUpdateUser={handleUpdateUser}
            />
          )
      
      default:
          return <LandingPage onIngresar={() => navegarA("login")} onRegisterClick={() => navegarA("register")} onNosotrosClick={() => navegarA("nosotros")} />
  }
}