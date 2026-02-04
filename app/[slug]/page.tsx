"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Calendar, Clock, Scissors, Star, Home } from "lucide-react"

export default function PerfilBarberiaPage() {
  const params = useParams()
  const router = useRouter()
  
  const [info, setInfo] = React.useState<any>(null)
  const [error, setError] = React.useState(false)

  // 1. CAPTURAMOS EL SLUG
  const slug = params.slug; 

  // --- DIAGNÓSTICO 1: Ver si llega el slug ---
  console.log("🔍 [DEBUG] 1. Slug capturado:", slug);

  React.useEffect(() => {
    const fetchBarberia = async () => {
      try {
        console.log("🔍 [DEBUG] 2. Iniciando Fetch a la API...");
        
        // Usamos ruta absoluta por si acaso
        const res = await fetch(`/api/usuarios/publico?slug=${slug}`)
        
        console.log("🔍 [DEBUG] 3. Status de respuesta:", res.status);
        
        if (res.ok) {
          const data = await res.json()
          console.log("🔍 [DEBUG] 4. Datos recibidos:", data); // ¿Llegan los datos acá?
          setInfo(data)
        } else {
          console.error("❌ [ERROR] API devolvió error:", res.status)
          setError(true)
        }
      } catch (err) {
        console.error("❌ [FATAL] Error de conexión:", err)
        setError(true)
      }
    }

    if (slug) {
        fetchBarberia()
    } else {
        console.error("⚠️ [ALERTA] No hay slug, no se hace el fetch");
    }
  }, [slug])

  // --- RENDERIZADO ---

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F0EA] text-[#3A3A3A] p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100">
        <h1 className="text-4xl mb-4">🏚️</h1>
        <h2 className="text-xl font-serif font-bold mb-2">Barbería no encontrada</h2>
        <Button onClick={() => router.push('/')} className="bg-[#3A3A3A] text-white rounded-xl mt-4">
          <Home className="mr-2 w-4 h-4" /> Volver al Inicio
        </Button>
      </div>
    </div>
  )

  if (!info) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F0EA]">
      <Loader2 className="animate-spin text-[#7A9A75] mb-4" />
      {/* Mensaje temporal para ver si está pensando */}
      <p className="text-xs text-gray-400">Cargando perfil de {slug}...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F2F0EA] flex items-center justify-center p-6">
      <div className="relative p-2 border-2 border-[#7A9A75]/20 rounded-[2.5rem] bg-black/5 shadow-inner">
        <Card className="w-full max-w-md border-[1px] border-[#7A9A75]/30 shadow-2xl bg-white overflow-hidden rounded-[2.2rem] relative">
          
          <div className="h-32 bg-[#7A9A75] w-full flex items-end justify-center">
             <div className="w-24 h-24 bg-white rounded-full translate-y-12 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                <div className="w-full h-full border-2 border-[#7A9A75]/10 rounded-full flex items-center justify-center bg-[#FDFBF7]">
                  <span className="text-3xl font-serif font-bold text-[#7A9A75]">
                    {info.nombre_empresa ? info.nombre_empresa[0].toUpperCase() : "C"}
                  </span>
                </div>
             </div>
          </div>

          <CardContent className="pt-16 pb-10 px-8 text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#3A3A3A] mb-1 italic">
                {info.nombre_empresa}
              </h1>
              <div className="w-12 h-0.5 bg-[#7A9A75] mx-auto opacity-50" />
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-10">
              <div className="flex items-center justify-between px-5 py-4 border border-gray-100 rounded-2xl bg-[#FDFBF7]">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-[#7A9A75]" />
                  <span className="text-sm font-medium text-gray-600">Horarios</span>
                </div>
                <span className="text-sm font-bold text-[#3A3A3A]">
                  {info.hora_apertura} — {info.hora_cierre}
                </span>
              </div>
            </div>

            <Button 
              onClick={() => router.push(`/reservar/${slug}`)}
              className="w-full h-16 text-xl bg-[#3A3A3A] hover:bg-[#7A9A75] text-white rounded-2xl transition-all duration-300 shadow-xl group"
            >
              <Calendar className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Reservar Turno
            </Button>

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