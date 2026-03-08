"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { LandingPage } from "@/components/ui/landingPage" 
import { LoginPage } from "@/components/ui/loginPage" 
import { RegisterPage } from "@/components/ui/registerPage"
import { AgendaView } from "@/components/dashboard/agenda-view"
import { NosotrosSection } from "@/components/ui/nosotrosSection"

export default function Home() { 
  const { data: session, status } = useSession()
  const [vista, setVista] = React.useState<"landing" | "login" | "register" | "agenda" | "nosotros">("landing")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  // --- 🛡️ SINCRONIZACIÓN POR HASH (FLECHA ATRÁS) ---
  React.useEffect(() => {
    const sincronizarVistaConURL = () => {
      // Leemos el # de la URL (ej: #login)
      const hash = window.location.hash.replace('#', '') as any;
      
      if (hash === 'login' || hash === 'register' || hash === 'nosotros' || hash === 'landing') {
        console.log("🔙 El navegador cambió a:", hash);
        setVista(hash);
      } else {
        // Si no hay hash o es cualquier otra cosa, vamos a la landing
        setVista("landing");
      }
    };

    // Escuchamos cuando cambia el hash (flecha atrás/adelante de Chrome)
    window.addEventListener("hashchange", sincronizarVistaConURL);
    
    // Ejecutamos al cargar por si el usuario entra directo a /#login
    sincronizarVistaConURL();

    return () => window.removeEventListener("hashchange", sincronizarVistaConURL);
  }, []);

  // --- FUNCIÓN NAVEGAR MEJORADA ---
  const navegarA = (nuevaVista: "landing" | "login" | "register" | "agenda" | "nosotros") => {
    if (nuevaVista === "landing") {
      // Limpiamos el hash para volver a la URL base /
      window.location.hash = "";
      // Si el navegador no limpia el hash solo, forzamos la vista
      setVista("landing");
    } else {
      // Esto cambia la URL a /#login, lo que genera un historial real
      window.location.hash = nuevaVista;
      setVista(nuevaVista);
    }
  };

  // --- 🛡️ EFECTO PATOVICA (SESIÓN) ---
  React.useEffect(() => {
    if (status === "authenticated") {
      setVista("agenda")
    } else if (status === "unauthenticated" && (vista === "agenda")) {
      setVista("landing")
    }
  }, [status, vista])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-[#3A3A3A] animate-pulse font-serif italic">Abriendo búnker...</p>
      </div>
    )
  }

  // Si hay sesión, ignoramos el sistema de vistas
  if (session) {
    return (
      <AgendaView 
        usuario={session.user} 
        onLogout={handleLogout} 
        onUpdateUser={() => {}}
      />
    )
  }

  // --- RENDERIZADO DE VISTAS ---
  switch (vista) {
    case "nosotros":
      return <NosotrosSection onVolver={() => navegarA("landing")} />
      
    case "login":
      return (
        <LoginPage 
          onLoginSuccess={() => {}}
          onRegisterClick={() => navegarA("register")} 
          onVolver={() => navegarA("landing")}
        />
      )
      
    case "register":
      return (
        <RegisterPage 
          onRegisterSubmit={async (datos: any) => { 
            try {
              const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
              });
              const resData = await res.json();
              if (res.ok) return true;
              return resData.message || "No se pudo crear la cuenta";
            } catch (err) {
              return "Error de red. Verificá tu conexión.";
            }
          }} 
          onLoginClick={() => navegarA("login")}
          onVolver={() => navegarA("landing")}
        />
      )
      
    case "landing":
    default:
      return (
        <LandingPage 
          onIngresar={() => navegarA("login")} 
          onRegisterClick={() => navegarA("register")} 
          onNosotrosClick={() => navegarA("nosotros")}
          idComercio={2} 
        />
      )
  }
}