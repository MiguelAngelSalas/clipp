"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Banknote, Wallet, Smartphone, ReceiptText, Tag, Scissors, Clock, ShoppingBag } from "lucide-react"

interface ResumenDiaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | undefined
  turnos: any[]
  extras?: any[]
}

export function ResumenDiaModal({ open, onOpenChange, date, turnos, extras = [] }: ResumenDiaModalProps) {
  
  // --- LÓGICA DE SUMA CONSOLIDADA ---
  const movimientosExitosos = [
    ...turnos.filter(t => t.estado === "finalizado"),
    ...extras
  ];

  const totalEfectivo = movimientosExitosos
    .filter(i => i.metodo_pago?.toUpperCase() === "EFECTIVO")
    .reduce((acc, i) => acc + Number(i.monto || 0), 0);

  const totalDigital = movimientosExitosos
    .filter(i => {
      const m = i.metodo_pago?.toUpperCase();
      return m === "DIGITAL" || m === "TRANSFERENCIA" || m === "TARJETA";
    })
    .reduce((acc, i) => acc + Number(i.monto || 0), 0);

  const totalCajaReal = totalEfectivo + totalDigital;

  const formatHora = (dateInput: any) => {
    if (!dateInput) return "--:--";
    const d = new Date(dateInput);
    // Ajuste simple por si la fecha viene en UTC
    return d.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full h-full max-w-full md:max-w-2xl bg-migue-beige p-0 overflow-hidden flex flex-col border-none sm:rounded-xl font-sans">
          
          <div className="p-6 border-b border-gray-400/20 flex justify-between items-center bg-white/20 backdrop-blur-md text-migue-gris">
            <div>
                <DialogTitle className="text-2xl font-serif uppercase tracking-widest font-[1000]">Detalle de Caja</DialogTitle>
                <DialogDescription className="text-migue-gris/80 font-medium italic">
                    {date?.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}
                </DialogDescription>
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full h-12 w-12 p-0 hover:bg-black/10 transition-colors">
                <X className="w-6 h-6 text-migue-gris" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Cronología de Ingresos</p>

            {[...turnos, ...extras]
              .sort((a, b) => {
                const horaA = new Date(a.hora || a.fecha || a.created_at).getTime();
                const horaB = new Date(b.hora || b.fecha || b.created_at).getTime();
                return horaA - horaB;
              })
              .map((item, idx) => {
                const isExtra = !item.id_turno;
                const estaFinalizado = item.estado === "finalizado" || isExtra;
                const estaCancelado = item.estado === "cancelado";
                
                // Normalizamos el método de pago para la UI
                const mRaw = item.metodo_pago?.toUpperCase();
                const metodo = (mRaw === "DIGITAL" || mRaw === "TRANSFERENCIA") ? "DIGITAL" : "EFECTIVO";

                // Títulos inteligentes
                const titulo = isExtra 
                  ? (item.descripcion || "Venta Varios") 
                  : (item.clientes?.nombre_cliente || item.nombre_invitado || "Cliente");

                const subtitulo = isExtra 
                  ? "Cobro Manual / Producto" 
                  : (item.servicio_nombre || item.servicio || "Corte/Servicio");

                const horaDisplay = formatHora(item.hora || item.fecha || item.created_at);

                return (
                    <div key={idx} className={`group p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                        estaFinalizado ? "bg-white border-gray-200 shadow-sm hover:shadow-md" : "bg-gray-100/50 border-transparent opacity-40"
                    }`}>
                        <div className="flex items-center gap-4">
                            {/* Iconografía por tipo de venta */}
                            <div className="flex flex-col items-center gap-1.5">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                                    isExtra ? "bg-blue-100 text-blue-600" : 
                                    estaFinalizado ? "bg-[#7A9A75]/20 text-[#7A9A75]" : "bg-gray-200 text-gray-400"
                                }`}>
                                    {isExtra ? <ShoppingBag className="w-5 h-5" /> : <Scissors className="w-5 h-5" />}
                                </div>
                                <span className="text-[10px] font-bold text-migue-gris/40 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> {horaDisplay}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <p className={`font-black text-lg tracking-tight ${estaCancelado ? "line-through text-gray-400" : "text-migue-gris"}`}>
                                    {titulo}
                                </p>
                                <div className="flex flex-col mt-0.5">
                                    <span className="text-[11px] font-bold text-migue-gris/50 uppercase tracking-wider">
                                        {subtitulo}
                                    </span>
                                    {estaFinalizado && (
                                        <div className="mt-1.5">
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase flex items-center w-fit gap-1.5 ${
                                                metodo === 'EFECTIVO' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                                            }`}>
                                                {metodo === 'EFECTIVO' ? <Wallet className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                                                {metodo}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                            <p className={`text-2xl font-serif font-[1000] ${estaCancelado ? "text-gray-300 line-through" : "text-[#3D2B1F]"}`}>
                                $ {Number(item.monto).toLocaleString('es-AR')}
                            </p>
                            {estaFinalizado && (
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Liquidado</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
          </div>
          
          {/* SECCIÓN DE TOTALES REFORZADA */}
          <div className="p-8 border-t border-gray-400/20 bg-white/70 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="absolute -right-2 -top-2 opacity-5">
                      <Wallet className="w-16 h-16 text-emerald-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Efectivo en Caja</p>
                    <p className="text-3xl font-serif font-black text-migue-gris">$ {totalEfectivo.toLocaleString('es-AR')}</p>
                </div>
                <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-right">
                    <div className="absolute -left-2 -top-2 opacity-5">
                      <Smartphone className="w-16 h-16 text-blue-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Cobros Digitales</p>
                    <p className="text-3xl font-serif font-black text-migue-gris">$ {totalDigital.toLocaleString('es-AR')}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <p className="text-[11px] font-black text-migue-gris/30 uppercase tracking-[0.3em]">Recaudación Neta</p>
                    <p className="text-6xl font-serif font-[1000] text-[#3D2B1F] tracking-tighter">
                        $ {totalCajaReal.toLocaleString('es-AR')}
                    </p>
                </div>
                <Button 
                    onClick={() => onOpenChange(false)}
                    className="bg-[#3D2B1F] text-migue-beige hover:bg-black font-black uppercase text-xs h-14 px-12 rounded-2xl transition-all shadow-xl active:scale-95"
                >
                    Finalizar Jornada
                </Button>
            </div>
          </div>

        </DialogContent>
    </Dialog>
  )
}