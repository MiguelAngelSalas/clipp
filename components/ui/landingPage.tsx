"use client"

import * as React from "react"
import { useEffect } from "react"
import { Leaf, Facebook, Instagram, Twitter } from "lucide-react"

interface LandingPageProps {
  onIngresar: () => void
  onRegisterClick: () => void
  onNosotrosClick: () => void // Nueva prop para la sección de Daiana
  idComercio?: number
}

const THEME = {
  bg: "bg-migue-beige",
  text: "text-migue-gris",
  border: "border-migue",
}

export function LandingPage({ onIngresar, onRegisterClick, onNosotrosClick }: LandingPageProps) {
  
  // --- LÓGICA PARA EL BOTÓN ATRÁS DE CHROME ---
  useEffect(() => {
    // Marcamos la entrada en el historial
    window.history.pushState({ vista: 'landing' }, '')

    const handlePopState = () => {
      // Si el usuario vuelve atrás, nos aseguramos de estar en la raíz
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])
  // ------------------------------------------

  return (
    <div className={`min-h-screen ${THEME.bg} font-sans flex flex-col items-center justify-between p-8`}>
      
      {/* HEADER / NAV SUPERIOR */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <button 
            onClick={onRegisterClick}
            className={`border ${THEME.border} py-3 text-sm uppercase tracking-widest ${THEME.text} hover:bg-black/5 transition-colors`}
          >
            Crear cuenta
          </button>
          
          <button 
            onClick={onIngresar} 
            className={`border ${THEME.border} py-3 text-sm uppercase tracking-widest ${THEME.text} hover:bg-black/5 transition-colors`}
          >
            Soy Dueño (Ingresar)
          </button>
          
          <button 
            onClick={onNosotrosClick} // Conectado a la nueva vista
            className={`border ${THEME.border} py-3 text-sm uppercase tracking-widest ${THEME.text} hover:bg-black/5 transition-colors`}
          >
            Acerca de nosotros
          </button>
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="flex-1 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          
          {/* LOGO E IMAGEN */}
          <div className="flex flex-col items-center">
              <h1 className="text-5xl md:text-7xl font-serif text-[#3A3A3A] mb-8 text-center md:text-left tracking-tighter">Clipp</h1>
              <div className={`w-[300px] h-[400px] border-2 ${THEME.border} rounded-t-[150px] flex items-center justify-center relative bg-transparent`}>
                  <Leaf strokeWidth={1} className="w-48 h-48 text-[#3A3A3A] opacity-80" />
              </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col gap-6 w-full max-w-md text-center">
              
              <button 
                onClick={onIngresar} 
                className={`border ${THEME.border} py-5 px-8 text-xl ${THEME.text} hover:bg-[#3A3A3A] hover:text-[#D6Dac2] transition-all uppercase tracking-widest font-medium shadow-sm`}
              >
                Iniciar sesión
              </button>

              <button 
                onClick={onRegisterClick}
                className={`text-xs ${THEME.text} uppercase tracking-[0.2em] opacity-60 hover:opacity-100 hover:underline underline-offset-8 transition-all`}
              >
                ¿No tenés cuenta? Registrate acá
              </button>

          </div>
      </div>

      {/* FOOTER */}
      <div className="w-full max-w-6xl flex justify-end gap-6 mt-12 border-t border-migue/10 pt-8">
          <Facebook className={`w-8 h-8 ${THEME.text} hover:scale-110 transition-transform cursor-pointer`} />
          <Instagram className={`w-8 h-8 ${THEME.text} hover:scale-110 transition-transform cursor-pointer`} />
          <Twitter className={`w-8 h-8 ${THEME.text} hover:scale-110 transition-transform cursor-pointer`} />
      </div>
    </div>
  )
}