import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Phone, ArrowLeft, Loader2 } from "lucide-react"

export function StepData({ date, selectedTime, nombre, setNombre, telefono, setTelefono, onBack, onConfirm, loading }: any) {
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
        <div className="relative">
          <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Tu Nombre" 
            className="pl-12 h-14 text-lg" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="WhatsApp (Solo números)" 
            className="pl-12 h-14 text-lg" 
            type="tel" 
            value={telefono} 
            onChange={(e) => {
              // 1. Agarramos el valor
              const val = e.target.value;
              // 2. Reemplazamos todo lo que NO sea número (0-9) por nada
              const soloNumeros = val.replace(/\D/g, '');
              // 3. Guardamos el string limpio
              setTelefono(soloNumeros);
            }} 
          />
        </div>
      </div>

      <Button 
        className="w-full mt-6 bg-[#7A9A75] hover:bg-[#688564] text-white text-xl h-14 font-bold shadow-lg shadow-[#7A9A75]/20" 
        // Agregamos una validación extra: mínimo 10 números para Argentina
        disabled={!nombre || telefono.length < 10 || loading} 
        onClick={onConfirm}
      >
        {loading ? <Loader2 className="animate-spin" /> : "Confirmar Reserva"}
      </Button>
    </div>
  )
}