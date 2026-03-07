"use client"

import * as React from "react"
// 🛡️ Importamos los hooks de NextAuth
import { useSession, signOut } from "next-auth/react"
import { LandingPage } from "@/components/ui/landingPage" 
import { LoginPage } from "@/components/ui/loginPage" 
import { RegisterPage } from "@/components/ui/registerPage"
import { AgendaView } from "@/components/dashboard/agenda-view"
import { NosotrosSection } from "@/components/ui/nosotrosSection"

export default function Home() { 
  // 1. Obtenemos la sesión real del búnker
  const { data: session, status } = useSession()
  
  const [vista, setVista] = React.useState<"landing" | "login" | "register" | "agenda" | "nosotros">("landing")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  // --- SINCRONIZACIÓN DE VISTAS ---
  const navegarA = (nuevaVista: "landing" | "login" | "register" | "agenda" | "nosotros") => {
    window.history.pushState({ vista: nuevaVista }, "")
    setVista(nuevaVista)
  }

  // --- 🛡️ EFECTO PATOVICA REAL ---
  React.useEffect(() => {
    if (status === "authenticated") {
      setVista("agenda")
    } else if (status === "unauthenticated" && (vista === "agenda")) {
      setVista("landing")
    }
  }, [status, vista])

  const handleLogout = async () => {
    // Cerramos sesión en serio y mandamos a la landing
    await signOut({ callbackUrl: "/" })
  }

  // Mientras NextAuth chequea las cookies, mostramos un estado neutro
  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-[#3A3A3A] animate-pulse font-serif italic">Abriendo búnker...</p>
      </div>
    )
  }

  // --- RENDERIZADO DE VISTAS ---

  // 1. Si hay sesión, forzamos la vista de Agenda
  if (session) {
    return (
      <AgendaView 
        usuario={session.user} 
        onLogout={handleLogout} 
        onUpdateUser={() => { /* Opcional: recargar sesión */ }}
      />
    )
  }

  // 2. Si no hay sesión, usamos el sistema de ruteo interno
  switch (vista) {
    case "nosotros":
      return <NosotrosSection onVolver={() => navegarA("landing")} />
      
    case "login":
      return (
        <LoginPage 
          onLoginSuccess={() => { /* El useEffect de status detectará el cambio solo */ }}
          onRegisterClick={() => navegarA("register")} 
          onVolver={() => navegarA("landing")}
        />
      )
      
    case "register":
      return (
        <RegisterPage 
          onRegisterSubmit={async (datos: any) => { 
            try {
              // 📡 AHORA SÍ: Le pegamos a la API de registro en serio
              const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
              });

              const resData = await res.json();

              if (res.ok) {
                // ✅ Si la API respondió 201/200, devolvemos true al componente
                console.log("✅ Registro exitoso en el servidor");
                return true;
              } else {
                // ❌ Si hubo error (ej: email duplicado), devolvemos el mensaje de la API
                console.error("⚠️ Error de registro:", resData.message);
                return resData.message || "No se pudo crear la cuenta";
              }
            } catch (err) {
              console.error("🔥 Error de conexión:", err);
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