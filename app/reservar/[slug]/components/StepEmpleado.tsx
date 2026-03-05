"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Loader2, User, ChevronLeft } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface StepEmpleadoProps {
  idComercio: number
  idServicio?: number
  onSelect: (empleado: any) => void
  onBack: () => void
}

export function StepEmpleado({ idComercio, idServicio, onSelect, onBack }: StepEmpleadoProps) {
  const [empleados, setEmpleados] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        // Buscamos los empleados del comercio
        // Si mandás el idServicio, la API debería filtrar solo los que brindan ese servicio
        const res = await fetch(`/api/empleados?id_comercio=${idComercio}${idServicio ? `&id_servicio=${idServicio}` : ''}`)
        if (res.ok) {
          const data = await res.json()
          setEmpleados(data)
        }
      } catch (error) {
        console.error("Error cargando barberos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmpleados()
  }, [idComercio, idServicio])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A9A75] mb-4" />
        <p className="text-gray-400 font-medium">Buscando a los cracks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {empleados.length > 0 ? (
          empleados.map((emp) => (
            <button
              key={emp.id_empleado}
              onClick={() => onSelect(emp)}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-[#7A9A75] hover:shadow-md transition-all text-left group"
            >
              <Avatar className="h-16 w-16 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                <AvatarImage src={emp.foto_url} className="object-cover" />
                <AvatarFallback className="bg-gray-50 text-gray-300">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div>
                <p className="font-black text-[#3D2B1F] uppercase text-sm tracking-tight">
                  {emp.nombre}
                </p>
                <p className="text-[10px] font-bold text-[#7A9A75] uppercase tracking-widest mt-0.5">
                  Barbero Disponible
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No hay barberos disponibles para este servicio.</p>
          </div>
        )}
      </div>

      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="w-full text-gray-400 hover:text-[#3D2B1F] font-bold uppercase text-[10px] tracking-[0.2em]"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver a servicios
      </Button>
    </div>
  )
}