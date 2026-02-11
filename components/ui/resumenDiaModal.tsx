"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, X, CheckCircle2, CircleDashed, Ban, Banknote } from "lucide-react"

interface ResumenDiaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | undefined
  turnos: any[]
  extras?: any[]
}

export function ResumenDiaModal({ open, onOpenChange, date, turnos, extras = [] }: ResumenDiaModalProps) {
  
  // 1. CAJA REAL (Turnos Finalizados)
  const totalTurnosCaja = turnos
    .filter(t => t.estado === "finalizado")
    .reduce((acc, t) => acc + Number(t.monto || 0), 0)

  // 2. EXTRAS (Siempre son plata real)
  const totalExtras = extras.reduce((acc, e) => acc + Number(e.monto || 0), 0)

  // 3. SUMA FINAL (Turnos Finalizados + Extras)
  const totalCaja = totalTurnosCaja + totalExtras

  // 4. ESTIMADO (Turnos no cancelados + Extras)
  const totalTurnosEstimado = turnos
    .filter(t => t.estado !== "cancelado")
    .reduce((acc, t) => acc + Number(t.monto || 0), 0)

  const totalEstimado = totalTurnosEstimado + totalExtras

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full h-full max-w-full md:max-w-2xl bg-migue-beige p-0 overflow-hidden flex flex-col border-none sm:rounded-xl">
          
          {/* HEADER */}
          <div className="p-6 border-b border-gray-400/20 flex justify-between items-center bg-white/20 backdrop-blur-md">
            <div>
                <DialogTitle className="text-2xl font-serif uppercase tracking-widest text-migue-gris">Cierre de Caja</DialogTitle>
                <DialogDescription className="text-migue-gris opacity-80">
                    {date?.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}
                </DialogDescription>
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full h-12 w-12 p-0 hover:bg-black/10">
                <X className="w-6 h-6 text-migue-gris" />
            </Button>
          </div>
          
          {/* LISTA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* 1. RENDERIZAMOS LOS EXTRAS (CON KEY ÚNICA GARANTIZADA ✅) */}
            {extras.length > 0 && extras.map((extra, index) => {
                // Usamos id_turno, id, o el index como último recurso para evitar el error extra-undefined
                const extraKey = extra.id_turno || extra.id || `extra-idx-${index}`;

                return (
                  <div key={`extra-${extraKey}`} className="p-5 rounded-xl shadow-sm border border-yellow-200/50 bg-yellow-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-sm bg-yellow-100 text-yellow-700">
                              <Banknote className="w-6 h-6" />
                          </div>
                          <div>
                              <p className="font-bold text-xl text-[#333]">
                                  {extra.descripcion || "Ingreso Extra"}
                              </p>
                              <p className="text-sm text-[#666] uppercase tracking-wide flex items-center gap-2">
                                  Movimiento de Caja
                              </p>
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-yellow-600 font-bold text-xs mb-1">
                              <CheckCircle2 className="w-3 h-3" /> EXTRA
                          </div>
                          <p className="font-bold text-lg text-[#333]">
                              $ {extra.monto}
                          </p>
                      </div>
                  </div>
                )
            })}

            {/* 2. RENDERIZAMOS LOS TURNOS */}
            {turnos.length > 0 ? (
                turnos.map((turno, idx) => {
                    const horaDate = new Date(turno.hora);
                    const horaSimple = isNaN(horaDate.getTime()) 
                        ? turno.hora.slice(0, 2) 
                        : horaDate.getUTCHours(); 

                    const estaFinalizado = turno.estado === "finalizado";
                    const estaCancelado = turno.estado === "cancelado";

                    let containerClass = "bg-white/50 border-gray-400/10 opacity-70";
                    if (estaFinalizado) containerClass = "bg-white/90 border-green-200";
                    if (estaCancelado) containerClass = "bg-red-50 border-red-100 opacity-60 grayscale-[0.5]";

                    return (
                        <div key={turno.id_turno || `turno-idx-${idx}`} className={`p-5 rounded-xl shadow-sm border flex items-center justify-between transition-colors ${containerClass}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-md 
                                    ${estaFinalizado ? "bg-[#7A9A75] text-white" : estaCancelado ? "bg-red-200 text-red-700" : "bg-[#4A4A4A] text-[#D6Dac2]"}`}>
                                    {horaSimple}
                                </div>
                                <div>
                                    <p className={`font-bold text-xl capitalize ${estaCancelado ? "line-through text-red-900/50" : "text-[#333]"}`}>
                                        {turno.clientes?.nombre_cliente || turno.nombre_invitado || "Cliente"}
                                    </p>
                                    <p className="text-sm text-[#666] uppercase tracking-wide flex items-center gap-2">
                                        {turno.servicio}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                 {estaFinalizado && (
                                     <div className="flex items-center justify-end gap-1 text-[#7A9A75] font-bold text-xs mb-1">
                                          <CheckCircle2 className="w-3 h-3" /> COBRADO
                                     </div>
                                 )}
                                 {estaCancelado && (
                                     <div className="flex items-center justify-end gap-1 text-red-400 font-bold text-xs mb-1">
                                          <Ban className="w-3 h-3" /> CANCELADO
                                     </div>
                                 )}
                                 {!estaFinalizado && !estaCancelado && (
                                     <div className="flex items-center justify-end gap-1 text-gray-400 font-bold text-xs mb-1">
                                          <CircleDashed className="w-3 h-3" /> PENDIENTE
                                     </div>
                                 )}

                                 <p className={`font-bold text-lg ${estaFinalizado ? "text-[#333]" : estaCancelado ? "text-red-300 line-through" : "text-gray-400"}`}>
                                    $ {turno.monto}
                                 </p>
                            </div>
                        </div>
                    )
                })
            ) : (
                extras.length === 0 && ( 
                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-migue-gris">
                        <Clock className="w-16 h-16 mb-4" />
                        <p className="text-xl">No hay movimientos hoy.</p>
                    </div>
                )
            )}
          </div>
          
          {/* FOOTER */}
          <div className="p-6 border-t border-gray-400/20 bg-white/40 backdrop-blur-md grid grid-cols-2 gap-4">
            
            <div className="text-left opacity-60">
                <p className="text-xs font-bold uppercase tracking-wider mb-1">Potencial (Sin cancelados)</p>
                <p className="text-xl font-serif font-bold text-[#4A4A4A]">
                    $ {totalEstimado}
                </p>
            </div>

            <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider mb-1 text-[#7A9A75]">En Caja (Real)</p>
                <p className="text-4xl font-serif font-[1000] text-[#3D2B1F]">
                    $ {totalCaja}
                </p>
            </div>
          </div>

        </DialogContent>
    </Dialog>
  )
}