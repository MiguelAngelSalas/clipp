"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, X } from "lucide-react"
// Importamos módulos
import { useRegisterLogic } from "./hooks/useRegisterLogic"
import { RegisterSuccess } from "./RegisterSuccess"

interface RegisterPageProps {
  onRegisterSubmit: (datos: any) => Promise<boolean | string>
  onLoginClick: () => void      
  onVolver: () => void          
}

export function RegisterPage({ onRegisterSubmit, onLoginClick, onVolver }: RegisterPageProps) {
  
  // Inyectamos la lógica
  const {
    formData, handleChange,
    loading, error, setError,
    shake, isRegistered,
    passwordsMatch, canSubmit,
    handleSubmit
  } = useRegisterLogic(onRegisterSubmit)

  return (
    <div className="min-h-screen bg-migue-beige flex items-center justify-center p-4">
      
      <div className={`bg-white/80 backdrop-blur-sm border border-migue/20 shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        
        {/* CASO 1: YA REGISTRADO (MOSTRAR ÉXITO) */}
        {isRegistered ? (
            <RegisterSuccess email={formData.email} onLoginClick={onLoginClick} />
        ) : (
            // CASO 2: FORMULARIO DE REGISTRO
            <>
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-serif font-bold text-[#3A3A3A]">Crear Cuenta</h1>
                    <p className="text-migue-gris opacity-70">Unite para gestionar tus turnos de forma pro.</p>
                </div>

                <div className="space-y-4 pt-2">
                    {/* ERROR MSG */}
                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-semibold">{error}</span>
                        <button className="ml-auto" onClick={() => setError(null)}>
                          <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                        </button>
                      </div>
                    )}

                    {/* INPUTS */}
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre" className={error && !formData.nombre ? "text-red-500" : ""}>Nombre de la Empresa</Label>
                        <Input 
                            id="nombre" placeholder="Ej: Barberia Lomas de Zamora" 
                            className={`bg-white h-11 transition-all ${error && !formData.nombre ? 'border-red-300 focus-visible:ring-red-100' : 'border-migue/20'}`} 
                            value={formData.nombre} onChange={handleChange} disabled={loading}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className={error?.includes("email") ? "text-red-500" : ""}>Email</Label>
                        <Input 
                            id="email" type="email" placeholder="hola@ejemplo.com" 
                            className={`bg-white h-11 transition-all ${error?.includes("email") ? 'border-red-300 focus-visible:ring-red-100' : 'border-migue/20'}`}
                            value={formData.email} onChange={handleChange} disabled={loading}
                        />
                    </div>

                    {/* NUEVO: CAMPO DE TELÉFONO */}
                    <div className="space-y-1.5">
                        <Label htmlFor="telefono" className={error?.includes("teléfono") ? "text-red-500" : ""}>Teléfono de Contacto</Label>
                        <Input 
                            id="telefono" type="text" placeholder="Ej: 1123456789" 
                            className={`bg-white h-11 transition-all ${error?.includes("teléfono") ? 'border-red-300 focus-visible:ring-red-100' : 'border-migue/20'}`}
                            value={formData.telefono} onChange={handleChange} disabled={loading}
                        />
                        <p className="text-[10px] text-migue-gris opacity-60">
                          * Lo usaremos para enviarte avisos de nuevos turnos.
                        </p>
                    </div>
                    
                    <div className="space-y-1.5">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" type="password" placeholder="Elegí una clave"
                            className="bg-white border-migue/20 h-11"
                            value={formData.password} onChange={handleChange} disabled={loading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Repetir Contraseña</Label>
                        <Input 
                            id="confirmPassword" type="password" placeholder="Escribila de nuevo"
                            className={`bg-white h-11 transition-colors ${formData.confirmPassword && !passwordsMatch ? "border-red-400 focus-visible:ring-red-400" : "border-migue/20 focus-visible:ring-[#7A9A75]"}`}
                            value={formData.confirmPassword} onChange={handleChange} disabled={loading}
                        />
                    </div>

                    <Button 
                        onClick={handleSubmit} 
                        disabled={!canSubmit}
                        className={`w-full font-bold py-7 text-lg shadow-md rounded-xl mt-4 transition-all ${canSubmit ? "bg-[#7A9A75] hover:bg-[#688563] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"} ${shake && !canSubmit ? 'bg-red-400' : ''}`}
                    >
                        {loading ? "CREANDO CUENTA..." : "REGISTRARME"}
                    </Button>
                </div>

                {/* FOOTER */}
                <div className="text-center text-sm text-migue-gris opacity-80 pt-4 border-t border-migue/10">
                    ¿Ya tenés cuenta?{" "}
                    <button onClick={onLoginClick} className="text-[#7A9A75] font-bold hover:underline">
                        Iniciá Sesión
                    </button>
                </div>

                <button onClick={onVolver} className="flex items-center justify-center w-full text-migue-gris/50 hover:text-migue-gris text-sm mt-2 group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                    Volver al inicio
                </button>
            </>
        )}

      </div>
    </div>
  )
}