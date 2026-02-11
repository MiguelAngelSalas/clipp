"use client"

import { Button } from "@/components/ui/button"
import { 
  Scissors, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Pencil, 
  UserCheck, 
  MessageCircle 
} from "lucide-react"

import { formatTimeDisplay } from "@/lib/date-utils"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const THEME = {
  card: "bg-white/50 border border-slate-200 backdrop-blur-sm", 
  accentGreen: "bg-[#7A9A75] text-white", 
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmado: "bg-blue-100 text-blue-700 border-blue-200",
  finalizado: "bg-green-100 text-green-700 border-green-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
}

interface TurnoCardProps {
  turno: any
  onEdit: (turno: any) => void
  onCancel: (id: number) => void
  onFinalizar: (turno: any) => void
  onNotify: () => void 
}

export function TurnoCard({ turno, onEdit, onCancel, onFinalizar, onNotify }: TurnoCardProps) {

  const nombreParaMostrar = turno.nombre_invitado || turno.clientes?.nombre_cliente || "Cliente Anónimo";
  
  const esRecurrenteConOtroNombre = 
    turno.clientes?.nombre_cliente && 
    turno.clientes.nombre_cliente !== turno.nombre_invitado;

  return (
    <div className={`${THEME.card} p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all hover:shadow-md`}>
      
      {/* IZQUIERDA: HORA Y DATOS */}
      <div className="flex items-center gap-4">
        <div className={`${THEME.accentGreen} min-w-[64px] py-3 rounded-md text-center text-sm font-bold shadow-sm`}>
          {/* 🛠️ SOLUCIÓN ANTIBUGS: Cortamos el texto directamente para evitar desfase de 3hs */}
          {typeof turno.hora === 'string' && turno.hora.includes('T') 
            ? turno.hora.split('T')[1].substring(0, 5) 
            : formatTimeDisplay(turno.hora) 
          }
        </div>
        
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-lg leading-tight text-slate-800">
              {nombreParaMostrar}
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wide ${ESTADO_COLORS[turno.estado] || ESTADO_COLORS.pendiente}`}>
              {turno.estado}
            </span>
          </div>
          
          {esRecurrenteConOtroNombre && (
            <p className="text-[10px] text-[#7A9A75] font-bold italic flex items-center gap-1 mt-0.5 opacity-90">
              <UserCheck className="w-3 h-3" /> Frecuente: {turno.clientes.nombre_cliente}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-sm opacity-70 text-slate-600 mt-1">
            <div className="flex items-center gap-1">
              <Scissors className="w-3 h-3" />
              <span className="capitalize">{turno.servicio || "Corte"}</span>
            </div>
            {Number(turno.monto) > 0 && (
              <div className="flex items-center gap-1 font-semibold text-green-700 bg-green-50 px-1 rounded">
                <DollarSign className="w-3 h-3" />
                {Number(turno.monto).toLocaleString('es-AR')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DERECHA: ACCIONES */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        {turno.estado !== 'finalizado' && turno.estado !== 'cancelado' && (
          <>
            {turno.estado === 'pendiente' && (
              <Button 
                variant="outline" 
                size="sm" 
                title="Notificar por WhatsApp"
                className="border-green-500 text-green-600 hover:bg-green-50 h-8 px-3"
                onClick={onNotify}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Notificar
              </Button>
            )}

            <Button 
              variant="ghost" size="icon" title="Modificar Turno"
              className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => onEdit(turno)} 
            >
              <Pencil className="w-5 h-5" />
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="ghost" size="icon" title="Cancelar Turno"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                        <XCircle className="w-5 h-5" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar turno?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vas a cancelar el turno de <strong>{nombreParaMostrar}</strong>. Esta acción liberará el horario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                            onClick={() => onCancel(turno.id_turno)}
                        >
                            Sí, Cancelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Button 
              size="sm" 
              className="bg-slate-800 text-white hover:bg-slate-700 shadow-sm h-8 px-3"
              onClick={() => onFinalizar(turno)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          </>
        )}
        
        {turno.estado === 'finalizado' && (
          <p className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
          </p>
        )}
      </div>
    </div>
  )
}