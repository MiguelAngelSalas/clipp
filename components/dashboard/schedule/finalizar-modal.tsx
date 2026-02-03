"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// 1. IMPORTAMOS EL SELECT 👇
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, AlertCircle, Loader2 } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"

interface FinalizarModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    turno: any
    // Actualizamos la firma para que acepte el segundo argumento (metodo)
    onConfirm: (monto: number, metodo?: string) => Promise<void>
}

export function FinalizarModal({ open, onOpenChange, turno, onConfirm }: FinalizarModalProps) {
    const [monto, setMonto] = React.useState("")
    const [metodo, setMetodo] = React.useState("EFECTIVO") // 2. ESTADO NUEVO
    const [loading, setLoading] = React.useState(false)

    // Cargar precio sugerido y método al abrir
    React.useEffect(() => {
        if (open && turno) {
            setMonto(turno.monto > 0 ? turno.monto.toString() : "")
            // Si el turno ya tenía un método guardado, lo respetamos. Si no, Efectivo.
            setMetodo(turno.metodo_pago || "EFECTIVO")
        }
    }, [open, turno])

    const handleConfirm = async () => {
        setLoading(true)
        // 3. ENVIAMOS EL MÉTODO AL CONFIRMAR 👇
        await onConfirm(
            monto ? parseFloat(monto) : 0, 
            metodo === "EFECTIVO" ? "EFECTIVO" : "DIGITAL"
        )
        setLoading(false)
        onOpenChange(false)
    }

    const nombreCliente = turno?.clientes?.nombre_cliente || turno?.nombre_invitado || "Cliente";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-white border-2 border-migue/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-serif text-migue-gris">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Finalizar Turno
                    </DialogTitle>
                    <DialogDescription>
                        Confirmá el cobro a <b>{nombreCliente}</b>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* INPUT MONTO */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-migue-gris opacity-70">Monto Final</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-bold">$</span>
                            <Input 
                                type="number" placeholder="0.00" 
                                className="pl-8 text-lg font-bold h-12 border-migue/20"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* 4. SELECTOR MÉTODO DE PAGO 👇 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-migue-gris opacity-70">Método de Pago</label>
                        <Select value={metodo} onValueChange={setMetodo}>
                            <SelectTrigger className="h-12 border-migue/20 bg-white font-medium focus:ring-green-600/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-migue/10 z-[9999]">
                                <SelectItem value="EFECTIVO" className="cursor-pointer">Efectivo</SelectItem>
                                <SelectItem value="TRANSFERENCIA" className="cursor-pointer">Transferencia</SelectItem>
                                <SelectItem value="TARJETA" className="cursor-pointer">Tarjeta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 bg-gray-50 p-2 rounded">
                        <AlertCircle className="w-3 h-3 text-blue-500" />
                        El turno pasará a estado <b>Finalizado</b>.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar y Cerrar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}