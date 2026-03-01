"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button" 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Home } from "lucide-react" 

// Componentes modulares
import { StepCalendar } from "./components/StepCalendar" 
import { StepService } from "./components/StepService" 
import { StepTime } from "./components/StepTime"
import { StepData } from "./components/StepData"
import { StepSuccess } from "./components/StepSuccess" 

// Hook personalizado
import { useGuestBooking } from "./hooks/useGuestBooking" 

export default function GuestBookingPage() {
  const params = useParams()
  const slug = params.slug as string 
  const [idComercio, setIdComercio] = React.useState<number | null>(null)
  const [error, setError] = React.useState(false)

  // 1. Buscamos el ID del comercio por su Slug
  React.useEffect(() => {
    const fetchId = async () => {
      try {
        const res = await fetch(`/api/usuarios/publico?slug=${slug}`)
        if (res.ok) {
          const data = await res.json()
          setIdComercio(data.id_comercio)
        } else {
          setError(true)
        }
      } catch (e) {
        setError(true)
      }
    }
    if (slug) fetchId()
  }, [slug])

  if (error) return <ErrorState />
  if (!idComercio) return <LoadingState />

  return <BookingForm idComercio={idComercio} slug={slug} />
}

// --- SUB-COMPONENTE: EL FORMULARIO ---
function BookingForm({ idComercio, slug }: { idComercio: number, slug: string }) {
  const router = useRouter()
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5>(1)

  const { 
    comercio, servicios, loadingData, submitting,
    date, setDate, selectedTime, setSelectedTime,
    nombre, setNombre, telefono, setTelefono,
    selectedServicio, setSelectedServicio,
    horariosPosibles, getHorariosLibres, reservarTurno 
  } = useGuestBooking(idComercio)

  const handleConfirmar = async () => {
    const exito = await reservarTurno()
    if (exito) setStep(5)
  }

  if (loadingData) return <LoadingState />

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      
      {step !== 5 && (
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/${slug}`)} 
          className="absolute top-4 left-4 text-gray-400 hover:text-[#7A9A75]"
        >
          <Home className="mr-2 h-4 w-4" /> Volver
        </Button>
      )}

      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center border-b border-gray-50 pb-6">
          <ProgressIndicator step={step} total={4} />
          <CardTitle className="font-serif text-3xl text-[#3A3A3A] mt-4">
            {comercio?.nombre_empresa || "Barbería"}
          </CardTitle>
          <CardDescription className="text-base font-medium text-[#7A9A75]">
            {step === 1 && "1. Elegí el día"}
            {step === 2 && "2. ¿Qué te vas a hacer?"}
            {step === 3 && "3. Elegí la hora"}
            {step === 4 && "4. Completá tus datos"}
            {step === 5 && "¡Turno Confirmado!"}
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

          {step === 2 && (
            <StepService 
              servicios={servicios}
              selectedServicio={selectedServicio}
              onSelect={(srv: any) => { 
                setSelectedServicio(srv); 
                setStep(3); 
              }}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && date && (
            <StepTime 
              date={date} 
              selectedTime={selectedTime} 
              horariosPosibles={horariosPosibles} 
              horariosLibres={getHorariosLibres(date)} 
              onSelect={(time: string) => {
                setSelectedTime(time);
                setStep(4);
              }} 
              onBack={() => setStep(2)} 
            />
          )}

          {step === 4 && date && (
            <StepData 
              date={date} 
              selectedTime={selectedTime}
              nombre={nombre} setNombre={setNombre}
              telefono={telefono} setTelefono={setTelefono}
              servicioElegido={selectedServicio} 
              onBack={() => setStep(3)}
              onConfirm={handleConfirmar}
              loading={submitting}
            />
          )}

          {step === 5 && (
            <StepSuccess 
              date={date} 
              time={selectedTime}
              onNew={() => window.location.reload()}
              onBack={() => router.push(`/${slug}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// --- INDICADOR DE PROGRESO SIN LA FUNCIÓN CN ---
function ProgressIndicator({ step, total = 4 }: { step: number, total?: number }) {
  return (
    <div className="flex justify-center gap-2 mb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div 
          key={i} 
          className={`h-1.5 w-10 rounded-full transition-all duration-500 ${
            step > i ? "bg-[#7A9A75]" : "bg-gray-100"
          }`} 
        />
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <Loader2 className="w-10 h-10 animate-spin text-[#7A9A75]" />
    </div>
  )
}

function ErrorState() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <span className="text-6xl mb-4 block">💈</span>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h2>
        <p className="text-gray-500 mb-6">El link parece ser incorrecto o la barbería ya no está disponible.</p>
        <Button onClick={() => router.push('/')} className="bg-[#7A9A75] hover:bg-[#688564]">
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}