"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button" 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Home } from "lucide-react" 
import { cn } from "@/lib/utils"

// Componentes
import { StepCalendar } from "./components/StepCalendar" // <--- NUEVO
import { StepTime } from "./components/StepTime"
import { StepData } from "./components/StepData"
import { StepSuccess } from "./components/StepSuccess" // <--- NUEVO

// Hook
import { useGuestBooking } from "./hooks/useGuestBooking" // <--- NUEVO

export default function GuestBookingPage() {
  const params = useParams()
  const router = useRouter()
  const idComercio = Number(params.id)

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1)

  // Usamos el Hook para traer toda la lógica
  const { 
    comercio, loadingData, submitting,
    date, setDate, selectedTime, setSelectedTime,
    nombre, setNombre, telefono, setTelefono,
    horariosPosibles, getHorariosLibres, reservarTurno 
  } = useGuestBooking(idComercio)

  // Handler de confirmación
  const handleConfirmar = async () => {
    const exito = await reservarTurno()
    if (exito) setStep(4)
    else alert("Error al reservar")
  }

  if (loadingData) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]"><Loader2 className="w-10 h-10 animate-spin text-[#7A9A75]" /></div>
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      
      {/* Botón Volver */}
      {step !== 4 && (
        <Button variant="ghost" onClick={() => router.push(`/barberia/${idComercio}`)} className="absolute top-4 left-4 text-gray-500 hover:text-[#7A9A75]">
          <Home className="mr-2 h-4 w-4" /> Volver a la Barbería
        </Button>
      )}

      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center border-b border-gray-100 pb-6 relative">
          <ProgressIndicator step={step} />
          <CardTitle className="font-serif text-3xl text-[#3A3A3A] mt-4">
            {comercio?.nombre_empresa || "Reserva tu Turno"}
          </CardTitle>
          <CardDescription className="text-lg">
            {step === 1 && "Seleccioná el día"}
            {step === 2 && "Elegí el horario"}
            {step === 3 && "Completá tus datos"}
            {step === 4 && "¡Confirmación exitosa!"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          {step === 1 && (
            <StepCalendar 
              date={date} 
              setDate={(d: Date) => { setDate(d); if(d) setStep(2); }} 
              isDayDisabled={(d: Date) => getHorariosLibres(d).length === 0}
            />
          )}

          {step === 2 && date && (
            <StepTime 
              date={date} 
              selectedTime={selectedTime} 
              horariosPosibles={horariosPosibles} 
              horariosLibres={getHorariosLibres(date)} 
              onSelect={setSelectedTime} 
              onBack={() => { setStep(1); setDate(undefined); setSelectedTime(null); }} 
              onContinue={() => setStep(3)} 
            />
          )}

          {step === 3 && date && (
            <StepData 
              date={date} selectedTime={selectedTime}
              nombre={nombre} setNombre={setNombre}
              telefono={telefono} setTelefono={setTelefono}
              onBack={() => setStep(2)}
              onConfirm={handleConfirmar}
              loading={submitting}
            />
          )}

          {step === 4 && (
            <StepSuccess 
              date={date} time={selectedTime}
              onNew={() => window.location.reload()}
              onBack={() => router.push(`/barberia/${idComercio}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProgressIndicator({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-2 mb-4">
      {[1, 2, 3].map(s => (
        <div key={s} className={cn("h-1 w-8 rounded-full transition-all", step >= s ? "bg-[#7A9A75]" : "bg-gray-200")} />
      ))}
    </div>
  )
}