"use client"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function StepSuccess({ date, time, onNew, onBack }: any) {
  return (
    <div className="text-center py-12 animate-in zoom-in-50">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>
      <h3 className="text-3xl font-serif font-bold text-[#3A3A3A] mb-4">¡Turno Agendado!</h3>
      <p className="text-gray-500 mb-8 text-lg">
        Te esperamos el <span className="font-bold text-gray-800 capitalize">{date?.toLocaleDateString("es-AR", { day: 'numeric', month: 'long'})}</span> a las <span className="font-bold text-gray-800">{time} hs</span>.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" className="h-12 px-8 border-[#7A9A75] text-[#7A9A75] hover:bg-[#7A9A75] hover:text-white" onClick={onNew}>
          Sacar otro turno
        </Button>
        <Button variant="ghost" className="h-12 px-8 text-gray-500 hover:bg-gray-100" onClick={onBack}>
          Volver al Perfil
        </Button>
      </div>
    </div>
  )
}