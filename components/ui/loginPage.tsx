"use client"

import * as React from "react"
import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, X } from "lucide-react"
// 🛡️ IMPORTAMOS NEXT-AUTH
import { signIn, useSession } from "next-auth/react"
import { toast } from "sonner"

interface LoginPageProps {
  onLoginSuccess: () => void 
  onVolver: () => void       
  onRegisterClick: () => void
}

export function LoginPage({ onLoginSuccess, onVolver, onRegisterClick }: LoginPageProps) {
  const router = useRouter()
  const { status } = useSession()

  // ESTADOS LOCALES
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<'login' | 'recovery'>('login')

  // EFECTO PATOVICA: Si detecta sesión activa, manda al home
  React.useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'recovery') {
      toast.info("Función de recuperación en mantenimiento")
      setLoading(false)
      return
    }

    try {
      // 🔥 LLAMADA AL MOTOR DE NEXT-AUTH
      const result = await signIn("credentials", {
        email: email.trim(),
        password: password,
        redirect: false, // Manejamos la redirección a mano para evitar cuelgues
      })

      if (result?.error) {
        // Si el authorize de route.ts devuelve null o error
        setError("Email o contraseña incorrectos. Revisá bien los datos.")
        setLoading(false)
      } else if (result?.ok) {
        toast.success("¡Acceso concedido! Entrando...")
        
        // Ejecutamos el callback del padre si existe
        if (onLoginSuccess) onLoginSuccess()

        // 🚀 REDIRECCIÓN FORZADA: 
        // Usamos window.location para asegurar que el Middleware y las cookies se refresquen bien
        window.location.href = "/" 
      }
    } catch (err) {
      setError("Hubo un problema de conexión con el servidor.")
      setLoading(false)
    }
  }

  const isRecovery = mode === 'recovery'

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 font-sans">
      <div className={`bg-white border border-migue/20 shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 animate-in fade-in zoom-in duration-300`}>
        
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
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">{error}</span>
                <button type="button" className="ml-auto" onClick={() => setError(null)}>
                  <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                </button>
              </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="barberia@ejemplo.com" 
                  className="bg-white h-12 border-migue/20 focus:ring-2 focus:ring-[#7A9A75] outline-none"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
            </div>

            {!isRecovery && (
              <div className="space-y-2">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <button 
                        type="button"
                        onClick={() => { setMode('recovery'); setError(null); }}
                        className="text-xs text-[#7A9A75] hover:underline font-bold"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    className="bg-white border-migue/20 h-12 focus:ring-2 focus:ring-[#7A9A75] outline-none"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}    
              className="w-full bg-[#7A9A75] hover:bg-[#688563] text-white font-bold py-7 text-lg shadow-md rounded-xl mt-4 transition-all active:scale-[0.98]"
            >
                {loading ? "PROCESANDO..." : (isRecovery ? "ENVIAR LINK" : "INICIAR SESIÓN")}
            </Button>

            {isRecovery && (
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="w-full text-sm text-[#7A9A75] font-bold hover:underline"
              >
                Cancelar y volver al login
              </button>
            )}
        </form>

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
          className="flex items-center justify-center w-full text-migue-gris/50 hover:text-migue-gris text-sm mt-4 group transition-colors"
        >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Volver al inicio
        </button>

      </div>
    </div>
  )
}