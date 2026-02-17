"use client"

import * as React from "react"
import { Scissors, Zap, ShieldCheck, Bell, TrendingUp, MessageCircle } from "lucide-react"

// Definimos tu logo SVG para reusarlo aquí también
const ClippLogo = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 20 c2-3 2-5 2-5 c0 0 -4 -8 10 -11 c0 0 5 6 0 12 c-3 3 -9 3 -10 -1" />
    <path d="M9 14 c3 -1 5 -3 6 -4" />
    <path d="M7 20 c1 -1 2 -3 2 -5" />
  </svg>
)

export function NosotrosSection({ onVolver }: { onVolver: () => void }) {
  const features = [
    {
      icon: <Scissors className="w-8 h-8" strokeWidth={1.5} />,
      title: "Gestión de Turnos",
      desc: "Sus clientes pueden visualizar horarios disponibles y reservar su lugar de forma autónoma, sin interrupciones en su jornada de trabajo."
    },
    {
      icon: <Bell className="w-8 h-8" strokeWidth={1.5} />,
      title: "Alertas por Telegram",
      desc: "Notificaciones instantáneas exclusivas para el profesional al recibir o modificar una reserva, manteniendo su agenda siempre actualizada."
    },
    {
      icon: <MessageCircle className="w-8 h-8" strokeWidth={1.5} />,
      title: "Recordatorios vía WhatsApp",
      desc: "Herramienta integrada para enviar recordatorios directos a sus clientes con un solo clic, optimizando la asistencia y el contacto profesional."
    },
    {
      icon: <TrendingUp className="w-8 h-8" strokeWidth={1.5} />,
      title: "Registro de Ventas",
      desc: "Herramienta de control financiero para realizar un seguimiento detallado de los ingresos diarios y mensuales del establecimiento."
    }
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl">
        
        {/* BOTÓN VOLVER */}
        <button 
          onClick={onVolver} 
          className="mb-8 text-xs uppercase tracking-[0.2em] text-migue-gris opacity-60 hover:opacity-100 transition-all"
        >
          ← Volver al inicio
        </button>

        {/* ENCABEZADO CON LOGO */}
        <div className="text-center mb-16 flex flex-col items-center">
          {/* Tu logo SVG aquí también para que se vea la marca */}
          <ClippLogo className="w-20 h-20 text-[#3A3A3A] mb-4 opacity-90" />
          
          <h2 className="text-4xl md:text-5xl font-serif text-[#3A3A3A] mb-6 tracking-tighter">Sobre Clipp</h2>
          <p className="text-lg text-migue-gris max-w-2xl mx-auto leading-relaxed">
            Clipp es una solución diseñada para <strong>optimizar la gestión operativa de barberías</strong>. 
            Nuestro enfoque es brindar agilidad al profesional y comodidad al cliente.
          </p>
        </div>

        {/* GRILLA DE VALORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {features.map((f, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="text-[#3A3A3A] p-2 border border-migue rounded-lg">
                {f.icon}
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 uppercase tracking-wide">{f.title}</h3>
                <p className="text-migue-gris opacity-80 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BANNER FINAL */}
        <div className="border-t border-b border-migue py-12 flex flex-col md:flex-row justify-around items-center gap-8 text-center text-migue-gris">
          <div className="flex flex-col items-center">
            <Zap className="w-10 h-10 mb-4 opacity-70" />
            <span className="uppercase tracking-[0.3em] font-bold text-sm">Agilidad</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-10 h-10 mb-4 opacity-70" />
            <span className="uppercase tracking-[0.3em] font-bold text-sm">Confianza</span>
          </div>
          <div className="flex flex-col items-center">
            <Bell className="w-10 h-10 mb-4 opacity-70" />
            <span className="uppercase tracking-[0.3em] font-bold text-sm">Automatización</span>
          </div>
        </div>
      </div>
    </div>
  )
}