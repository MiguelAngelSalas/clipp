import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// Agregamos 'horariosPosibles' a las props
export function StepTime({ date, selectedTime, horariosPosibles, horariosLibres, onSelect, onBack, onContinue }: any) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 pl-0 hover:text-gray-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <p className="font-bold text-xl capitalize text-[#3A3A3A]">
          {date.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {/* Mapeamos sobre la lista TOTAL de horarios */}
        {horariosPosibles.map((hora: string) => {
          const estaLibre = horariosLibres.includes(hora);
          const isSelected = selectedTime === hora;

          return (
            <Button
              key={hora}
              variant={isSelected ? "default" : "outline"}
              disabled={!estaLibre} // Deshabilitamos si está ocupado
              className={cn(
                "w-full h-12 text-lg font-bold border-2 transition-all",
                // LÓGICA DE COLORES
                !estaLibre 
                  ? "bg-red-50 text-red-300 border-red-100 opacity-60 cursor-not-allowed" // OCUPADO (ROJO)
                  : isSelected 
                    ? "bg-[#7A9A75] hover:bg-[#688564] text-white border-[#7A9A75] scale-105" // SELECCIONADO (VERDE)
                    : "hover:border-[#7A9A75] hover:text-[#7A9A75] text-gray-600 bg-white" // DISPONIBLE (BLANCO)
              )}
              onClick={() => onSelect(hora)}
            >
              {hora}
            </Button>
          );
        })}
      </div>

      <Button 
        className="w-full mt-8 bg-[#3A3A3A] text-[#FDFBF7] h-14 text-lg" 
        disabled={!selectedTime} 
        onClick={onContinue}
      >
        Continuar
      </Button>
    </div>
  )
}