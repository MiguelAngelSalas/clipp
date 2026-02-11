"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Clock, CalendarDays } from "lucide-react"
import { TurnoCard } from "./turno-card"
import { FinalizarModal } from "./finalizar-modal"
import { toast } from "sonner"

interface ScheduleListProps {
  date: Date | undefined
  turnosDelDia: any[]      
  onAddExtra: () => void   
  onEditTurno: (turno: any) => void
  // --- ESTO ES LO QUE FALTABA 👇 ---
  onFinalizarTurno: (id: number, monto: number, metodo: string) => Promise<void>
  onCancelarTurno: (id: number) => Promise<void>
}

export function ScheduleList({ 
  date, 
  turnosDelDia, 
  onAddExtra, 
  onEditTurno,
  onFinalizarTurno,
  onCancelarTurno 
}: ScheduleListProps) {
  
  const [turnoACobrar, setTurnoACobrar] = React.useState<any>(null)

  const fechaLinda = date 
    ? date.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })
    : "Hoy";

  const fechaCapitalizada = fechaLinda.charAt(0).toUpperCase() + fechaLinda.slice(1);

  // --- LÓGICA DE NOTIFICACIÓN WHATSAPP ---
  const handleNotify = (turno: any) => {
    const telefono = turno.contacto_invitado || turno.clientes?.whatsapp;
    const nombre = turno.nombre_invitado || turno.clientes?.nombre_cliente;
    const { hora, id_turno, servicio } = turno;
    
    if (!telefono) {
      toast.error("El cliente no tiene teléfono registrado");
      return;
    }

    const numeroLimpio = telefono.replace(/\D/g, ''); 
    const urlConfirmacion = `${window.location.origin}/confirmar/${id_turno}`;
    const mensaje = `¡Hola *${nombre}*! 💈 Confirmamos tu turno de *${servicio || 'Peluquería'}* el día *${fechaCapitalizada}*. Confirmá acá: ${urlConfirmacion}`;

    window.open(`https://web.whatsapp.com/send?phone=${numeroLimpio}&text=${encodeURIComponent(mensaje)}`, 'whatsapp_web');
    toast.info("Abriendo WhatsApp Web...");
  };

  return (
    <>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex flex-col">
                <h3 className="font-medium text-slate-400 uppercase tracking-widest text-[10px]">Cronograma</h3>
                <p className="text-xl font-serif text-slate-700 flex items-center gap-2 mt-1">
                    <CalendarDays className="w-4 h-4 text-[#7A9A75]" />
                    {fechaCapitalizada}
                </p>
            </div>

            <Button onClick={onAddExtra} size="sm" className="bg-[#7A9A75] hover:bg-[#688564] shadow-md text-white rounded-full px-4">
                <Plus className="mr-2 h-4 w-4" /> Nuevo
            </Button>
        </div>
        
        {/* LISTA DE TURNOS */}
        <div className="p-4 flex-1 overflow-y-auto bg-[#FCFDFB]">
            {turnosDelDia.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {turnosDelDia.map((turno) => (
                        <TurnoCard 
                            key={turno.id_turno}
                            turno={turno}
                            onEdit={onEditTurno}
                            onCancel={() => onCancelarTurno(turno.id_turno)} // 👈 Llama al hook
                            onFinalizar={(t) => setTurnoACobrar(t)}
                            onNotify={() => handleNotify(turno)} 
                        />
                    ))}
                </div>
            ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-slate-200 rounded-xl">
                    <Clock className="w-10 h-10 mb-2 text-slate-300" />
                    <p className="text-slate-500 text-sm">Sin turnos para este día.</p>
                </div>
            )}
        </div>
    </div>

    {/* MODAL DE COBRO */}
    <FinalizarModal 
        open={!!turnoACobrar}
        onOpenChange={(open) => !open && setTurnoACobrar(null)}
        turno={turnoACobrar}
        onConfirm={async (monto, metodo) => { 
            // Aquí 'monto' y 'metodo' ya vienen del modal
            await onFinalizarTurno(turnoACobrar.id_turno, monto, metodo); 
            setTurnoACobrar(null);
        }}
    />
    </>
  )
}