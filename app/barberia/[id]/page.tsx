"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Calendar, Clock, Scissors, Star } from "lucide-react"

export default function PerfilBarberiaPage() {
  const params = useParams()
  const router = useRouter()
  const [info, setInfo] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchBarberia = async () => {
      try {
        const res = await fetch(`/api/usuarios/publico?id_comercio=${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setInfo(data)
        }
      } catch (error) {
        console.error("Error al cargar la barbería:", error)
      }
    }
    if (params.id) fetchBarberia()
  }, [params.id])

  if (!info) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F0EA]">
      <Loader2 className="animate-spin text-[#7A9A75]" />
    </div>
  )

  return (
    // FONDO ARENA: Para marcar contraste con la tarjeta blanca
    <div className="min-h-screen bg-[#F2F0EA] flex items-center justify-center p-6">
      
      {/* CONTENEDOR CON BORDE EXTERNO Y SOMBRA LIGERA */}
      <div className="relative p-2 border-2 border-[#7A9A75]/20 rounded-[2.5rem] bg-black/5 shadow-inner">
        
        <Card className="w-full max-w-md border-[1px] border-[#7A9A75]/30 shadow-2xl bg-white overflow-hidden rounded-[2.2rem] relative">
          
          {/* BANNER SUPERIOR */}
          <div className="h-32 bg-[#7A9A75] w-full flex items-end justify-center">
             {/* LOGO CIRCULAR */}
             <div className="w-24 h-24 bg-white rounded-full translate-y-12 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                <div className="w-full h-full border-2 border-[#7A9A75]/10 rounded-full flex items-center justify-center bg-[#FDFBF7]">
                  <span className="text-3xl font-serif font-bold text-[#7A9A75]">
                    {info.nombre_empresa[0].toUpperCase()}
                  </span>
                </div>
             </div>
          </div>

          <CardContent className="pt-16 pb-10 px-8 text-center">
            {/* TÍTULO Y LÍNEA DECORATIVA */}
            <div className="mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#3A3A3A] mb-1 italic">
                {info.nombre_empresa}
              </h1>
              <div className="w-12 h-0.5 bg-[#7A9A75] mx-auto opacity-50" />
            </div>
            
            {/* RATING */}
            <div className="flex items-center justify-center gap-1 text-yellow-600/80 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
              <span className="text-[10px] text-gray-400 uppercase tracking-tighter ml-2 font-bold">Local Destacado</span>
            </div>

            {/* CAJAS DE INFORMACIÓN (Fondo tono beige claro) */}
            <div className="grid grid-cols-1 gap-3 mb-10">
              <div className="flex items-center justify-between px-5 py-4 border border-gray-100 rounded-2xl bg-[#FDFBF7]">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-[#7A9A75]" />
                  <span className="text-sm font-medium text-gray-600">Horarios hoy</span>
                </div>
                <span className="text-sm font-bold text-[#3A3A3A]">
                  {info.hora_apertura} — {info.hora_cierre}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-4 border border-gray-100 rounded-2xl bg-[#FDFBF7]">
                <div className="flex items-center gap-3">
                  <Scissors size={18} className="text-[#7A9A75]" />
                  <span className="text-sm font-medium text-gray-600">Especialidad</span>
                </div>
                <span className="text-sm font-bold text-[#3A3A3A]">Barbería & Estilo</span>
              </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <Button 
              onClick={() => router.push(`/reservar/${params.id}`)}
              className="w-full h-16 text-xl bg-[#3A3A3A] hover:bg-[#7A9A75] text-white rounded-2xl transition-all duration-300 shadow-xl group"
            >
              <Calendar className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Reservar Turno
            </Button>

            {/* FOOTER DEL PERFIL */}
            <div className="mt-8 flex flex-col items-center gap-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                Exclusivo para {info.nombre_empresa}
              </p>
              <p className="text-[9px] text-[#7A9A75] font-bold tracking-widest uppercase">
                Powered by Clipp 🌿
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}