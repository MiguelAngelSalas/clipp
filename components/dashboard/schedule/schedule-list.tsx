"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Clock } from "lucide-react"
import { TurnoCard } from "./turno-card"
import { FinalizarModal } from "./finalizar-modal"
import { toast } from "sonner" // 👈 Agregá esto si usas sonner (recomendado) o tu librería de toast

interface ScheduleListProps {
  turnosDelDia: any[]      
  onAddExtra: () => void   
  onTurnoUpdated?: () => void
  onEditTurno?: (turno: any) => void
}

export function ScheduleList({ turnosDelDia, onAddExtra, onTurnoUpdated, onEditTurno }: ScheduleListProps) {
  
  const [turnoACobrar, setTurnoACobrar] = React.useState<any>(null)

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
          
          toast.success("Turno cobrado", { description: `$${monto}` }) // Feedback visual
          
          if (onTurnoUpdated) onTurnoUpdated()
      } catch (error) {
          console.error(error)
          toast.error("Error al finalizar")
      }
  }

  // 2. Lógica para Cancelar (YA SIN CONFIRMACIÓN FEA) 🧹
  const handleCancelar = async (id: number) => {
      // ❌ BORRAMOS EL IF CONFIRM
      // La confirmación ya la hizo el usuario en el modal de TurnoCard
      
      try {
          await fetch('/api/turnos', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_turno: id, estado: 'cancelado' })
          })

          toast.info("Turno cancelado") // Feedback visual lindo
          
          if (onTurnoUpdated) onTurnoUpdated()
      } catch (error) { 
          console.error(error) 
          toast.error("No se pudo cancelar el turno")
      }
  }

  return (
    <>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-medium text-slate-900 uppercase tracking-widest text-sm">Cronograma</h3>
            <Button onClick={onAddExtra} size="sm" className="bg-[#7A9A75] hover:bg-[#688564] shadow-md text-white border-none">
                <Plus className="mr-2 h-3 w-3" /> Nuevo Turno
            </Button>
        </div>
        
        {/* LISTA DE TARJETAS */}
        <div className="p-4">
            {turnosDelDia.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {turnosDelDia.map((turno) => (
                        <TurnoCard 
                            key={turno.id_turno}
                            turno={turno}
                            onEdit={(t) => onEditTurno && onEditTurno(t)}
                            onCancel={handleCancelar} // Se pasa directo
                            onFinalizar={(t) => setTurnoACobrar(t)}
                        />
                    ))}
                </div>
            ) : (
                // EMPTY STATE
                <div className="py-12 text-center opacity-40 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-500 font-medium">No hay turnos para este día.</p>
                </div>
            )}
        </div>
    </div>

    {/* MODAL (Se muestra solo si hay turnoACobrar) */}
    <FinalizarModal 
        open={!!turnoACobrar}
        onOpenChange={(open) => !open && setTurnoACobrar(null)}
        turno={turnoACobrar}
        onConfirm={handleFinalizarConfirmado}
    />
    </>
  )
}