"use client"

import * as React from "react"
import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, X } from "lucide-react"
import { useLoginLogic } from "../../app/api/auth/hooks/useLoginLogic"
import { LoginSuccess } from "./LoginSucces"

interface LoginPageProps {
  onLoginSuccess: () => void 
  onVolver: () => void       
  onRegisterClick: () => void
}

export function LoginPage({ onLoginSuccess, onVolver, onRegisterClick }: LoginPageProps) {
  
  // 1. Inicializamos el router
  const router = useRouter()

  // 2. EFECTO "PATOVICA": Si ya hay usuario, al Dashboard
  React.useEffect(() => {
    // 👇 ACÁ ESTÁ EL CAMBIO: Buscamos 'usuario_clipp'
    const usuarioGuardado = localStorage.getItem("usuario_clipp") 
    
    // Si existe el usuario guardado (no es null ni vacío), redirigimos
    if (usuarioGuardado) {
      console.log("Sesión encontrada, redirigiendo al Dashboard...")
      router.push("/dashboard") 
    }
  }, [router])

  // --- LÓGICA ORIGINAL DEL LOGIN ---
  const {
    email, setEmail,
    password, setPassword,
    mode, setMode, 
    loading, error, shake, resetSent, setResetSent,
    handleSubmit, setError
  } = useLoginLogic(onLoginSuccess)

  // 3. Pantalla de Éxito de Recuperación
  if (resetSent) {
    return (
        <div className="min-h-screen bg-migue-beige flex items-center justify-center p-4">
            <LoginSuccess onBack={() => { setResetSent(false); setMode('login'); }} />
        </div>
    )
  }

  // 4. Renderizamos el Formulario
  const isRecovery = mode === 'recovery'

  return (
    <div className="min-h-screen bg-migue-beige flex items-center justify-center p-4">
      <div className={`bg-white/80 backdrop-blur-sm border border-migue/20 shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        
        {/* HEADER */}
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif font-bold text-[#3A3A3A]">
              {isRecovery ? "Recuperar Clave" : "¡Hola de nuevo!"}
            </h1>
            <p className="text-migue-gris opacity-70">
              {isRecovery 
                ? "Te enviaremos un link para crear una nueva contraseña." 
                : "Ingresá tus datos para gestionar tu barbería."}
            </p>
        </div>

        {/* FORMULARIO */}
        <div className="space-y-4 pt-4">
            {/* Mensaje de Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">{error}</span>
                <button className="ml-auto" onClick={() => setError(null)}>
                  <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                </button>
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" type="email" placeholder="barberia@ejemplo.com" 
                  className="bg-white h-12 border-migue/20"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* Input Password */}
            {!isRecovery && (
              <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <button 
                        onClick={() => { setMode('recovery'); setError(null); }}
                        className="text-xs text-[#7A9A75] hover:underline font-bold"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                  </div>
                  <Input 
                    id="password" type="password" 
                    className="bg-white border-migue/20 h-12"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
              </div>
            )}

            {/* Botón Principal */}
            <Button 
              onClick={handleSubmit} 
              disabled={loading}    
              className="w-full bg-[#7A9A75] hover:bg-[#688563] text-white font-bold py-7 text-lg shadow-md rounded-xl mt-4"
            >
                {loading ? "PROCESANDO..." : (isRecovery ? "ENVIAR LINK" : "INICIAR SESIÓN")}
            </Button>

            {/* Botón Cancelar */}
            {isRecovery && (
              <button 
                onClick={() => { setMode('login'); setError(null); }}
                className="w-full text-sm text-[#7A9A75] font-bold hover:underline"
              >
                Cancelar y volver al login
              </button>
            )}
        </div>

        {/* FOOTER */}
        {!isRecovery && (
          <div className="text-center text-sm text-migue-gris opacity-80 pt-4 border-t border-migue/10">
              ¿No tenés cuenta?{" "}
              <button onClick={onRegisterClick} className="text-[#7A9A75] font-bold hover:underline">
                  Registrate acá
              </button>
          </div>
        )}

        <button 
          onClick={onVolver} 
          className="flex items-center justify-center w-full text-migue-gris/50 hover:text-migue-gris text-sm mt-4 group"
        >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Volver al inicio
        </button>

      </div>
    </div>
  )
}