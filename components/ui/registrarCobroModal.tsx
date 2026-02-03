"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Tag } from "lucide-react"

// 1. CORRECCIÓN: Renombramos a 'onGuardar' para que coincida con lo que manda el Padre
interface RegistrarCobroModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGuardar: (datos: any) => void 
}

export function RegistrarCobroModal({ open, onOpenChange, onGuardar }: RegistrarCobroModalProps) {
  const [monto, setMonto] = React.useState("")
  const [concepto, setConcepto] = React.useState("")
  const [metodo, setMetodo] = React.useState("EFECTIVO")

  React.useEffect(() => {
    if (open) {
        setMonto("")
        setConcepto("")
        setMetodo("EFECTIVO")
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 2. LÓGICA: Traducimos los datos ACÁ MISMO antes de enviarlos
    // Así tu AgendaModals queda limpio.
    onGuardar({
      monto: parseFloat(monto),
      descripcion: concepto, // Mapeamos: concepto (visual) -> descripcion (BD)
      metodo: metodo === "EFECTIVO" ? "EFECTIVO" : "DIGITAL", // Simplificamos la lógica
    })
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-2xl border-2 border-[#3D2B1F]/20 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-[1000] text-[#3D2B1F] text-center">
            REGISTRAR COBRO
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[#3D2B1F] font-black uppercase text-xs">Monto total</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a7a56] font-bold text-lg">$</span>
              <Input 
                type="number" 
                placeholder="0.00"
                step="0.01" // Agregado para permitir decimales cómodamente
                className="pl-8 h-12 text-lg font-bold border-migue/20 focus-visible:ring-[#7A9A75]"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#3D2B1F] font-black uppercase text-xs">Concepto / Producto</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input 
                placeholder="Ej: Cera Mate, Gaseosa..." 
                className="pl-10 h-12 border-migue/20 focus-visible:ring-[#7A9A75]"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#3D2B1F] font-black uppercase text-xs">Método de pago</Label>
            <Select value={metodo} onValueChange={setMetodo}>
              <SelectTrigger className="h-12 border-migue/20 focus:ring-[#7A9A75]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-[#3D2B1F]/10 shadow-xl z-[9999]">
                <SelectItem value="EFECTIVO" className="cursor-pointer focus:bg-[#7A9A75]/10 font-medium">
                  Efectivo
                </SelectItem>
                <SelectItem value="TRANSFERENCIA" className="cursor-pointer focus:bg-[#7A9A75]/10 font-medium">
                  Transferencia
                </SelectItem>
                <SelectItem value="TARJETA" className="cursor-pointer focus:bg-[#7A9A75]/10 font-medium">
                  Tarjeta
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-[#7A9A75] hover:bg-[#5a7a56] text-white py-6 text-lg font-black rounded-xl shadow-lg transition-all active:scale-95">
            CONFIRMAR COBRO
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}