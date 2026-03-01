"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Phone, ArrowLeft, Loader2, Scissors } from "lucide-react"

export function StepData({ 
  date, 
  selectedTime, 
  nombre, 
  setNombre, 
  telefono, 
  setTelefono, 
  servicio, 
  setServicio, 
  onBack, 
  onConfirm, 
  loading 
}: any) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 max-w-md mx-auto">
      <Button variant="ghost" onClick={onBack} className="text-gray-400 pl-0 hover:text-gray-600">
        <ArrowLeft className="mr-2 h-4 w-4" /> Cambiar horario
      </Button>

      <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#7A9A75]/20 mb-6 text-center">
        <p className="text-2xl font-serif font-bold text-[#3A3A3A] capitalize">
          {date?.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric' })} <span className="text-[#7A9A75] mx-2">•</span> {selectedTime} hs
        </p>
      </div>

      <div className="space-y-4">
        {/* Input Nombre */}
        <div className="relative">
          <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Tu Nombre" 
            className="pl-12 h-14 text-lg border-gray-200 focus:ring-[#7A9A75]" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
          />
        </div>

        {/* Input WhatsApp */}
        <div className="relative">
          <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="WhatsApp (Solo números)" 
            className="pl-12 h-14 text-lg border-gray-200 focus:ring-[#7A9A75]" 
            type="tel" 
            value={telefono} 
            onChange={(e) => {
              const val = e.target.value;
              const soloNumeros = val.replace(/\D/g, '');
              setTelefono(soloNumeros);
            }} 
          />
        </div>
      </div>

      <Button 
        className="w-full mt-6 bg-[#7A9A75] hover:bg-[#688564] text-white text-xl h-14 font-bold shadow-lg shadow-[#7A9A75]/20 transition-all active:scale-[0.98]" 
        disabled={!nombre || telefono.length < 10 || loading} 
        onClick={onConfirm}
      >
        {loading ? <Loader2 className="animate-spin" /> : "Confirmar Reserva"}
      </Button>
    </div>
  )
}