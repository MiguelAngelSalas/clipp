"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Clock, CalendarDays } from "lucide-react" // Agregué icono CalendarDays
import { TurnoCard } from "./turno-card"
import { FinalizarModal } from "./finalizar-modal"
import { toast } from "sonner"

interface ScheduleListProps {
  date: Date | undefined // 👈 1. AGREGAMOS ESTA PROP (Puede venir undefined al inicio)
  turnosDelDia: any[]      
  onAddExtra: () => void   
  onTurnoUpdated?: () => void
  onEditTurno?: (turno: any) => void
}

export function ScheduleList({ date, turnosDelDia, onAddExtra, onTurnoUpdated, onEditTurno }: ScheduleListProps) {
  
  const [turnoACobrar, setTurnoACobrar] = React.useState<any>(null)

  // Formateamos la fecha para que se vea linda (Ej: "Domingo 8 de Febrero")
  const fechaLinda = date 
    ? date.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })
    : "Hoy";

  // Lógica para poner la primera letra en mayúscula (cosmética)
  const fechaCapitalizada = fechaLinda.charAt(0).toUpperCase() + fechaLinda.slice(1);

  // 1. Lógica para Cobrar (Finalizar)
  const handleFinalizarConfirmado = async (monto: number) => {
      if (!turnoACobrar) return
      try {
          await fetch('/api/turnos', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  id_turno: turnoACobrar.id_turno,
                  estado: 'finalizado',
                  monto: monto
              })
          })
          
          toast.success("Turno cobrado", { description: `$${monto}` })
          if (onTurnoUpdated) onTurnoUpdated()
      } catch (error) {
          console.error(error)
          toast.error("Error al finalizar")
      }
  }

  // 2. Lógica para Cancelar
  const handleCancelar = async (id: number) => {
      try {
          await fetch('/api/turnos', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_turno: id, estado: 'cancelado' })
          })

          toast.info("Turno cancelado")
          if (onTurnoUpdated) onTurnoUpdated()
      } catch (error) { 
          console.error(error) 
          toast.error("No se pudo cancelar el turno")
      }
  }

  return (
    <>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex flex-col">
                <h3 className="font-medium text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                    Cronograma
                </h3>
                {/* 👈 2. ACÁ MOSTRAMOS LA FECHA */}
                <p className="text-xl font-serif text-slate-700 flex items-center gap-2 mt-1">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    {fechaCapitalizada}
                </p>
            </div>

            <Button onClick={onAddExtra} size="sm" className="bg-[#7A9A75] hover:bg-[#688564] shadow-md text-white border-none rounded-full px-4">
                <Plus className="mr-2 h-3 w-3" /> Nuevo
            </Button>
        </div>
        
        {/* LISTA DE TARJETAS */}
        <div className="p-4 flex-1 overflow-y-auto">
            {turnosDelDia.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {turnosDelDia.map((turno) => (
                        <TurnoCard 
                            key={turno.id_turno}
                            turno={turno}
                            onEdit={(t) => onEditTurno && onEditTurno(t)}
                            onCancel={handleCancelar}
                            onFinalizar={(t) => setTurnoACobrar(t)}
                        />
                    ))}
                </div>
            ) : (
                // EMPTY STATE
                <div className="h-40 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Clock className="w-10 h-10 mb-2 text-slate-400" />
                    <p className="text-slate-500 font-medium text-sm">Sin turnos para este día.</p>
                </div>
            )}
        </div>
    </div>

    {/* MODAL */}
    <FinalizarModal 
        open={!!turnoACobrar}
        onOpenChange={(open) => !open && setTurnoACobrar(null)}
        turno={turnoACobrar}
        onConfirm={handleFinalizarConfirmado}
    />
    </>
  )
}