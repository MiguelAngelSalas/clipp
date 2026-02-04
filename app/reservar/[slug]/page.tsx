"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button" 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Home } from "lucide-react" 
import { cn } from "@/lib/utils"

// Componentes (Asegurate que estén en la carpeta components dentro de reservas/[slug])
import { StepCalendar } from "./components/StepCalendar" 
import { StepTime } from "./components/StepTime"
import { StepData } from "./components/StepData"
import { StepSuccess } from "./components/StepSuccess" 

// Hook
import { useGuestBooking } from "./hooks/useGuestBooking" 

// --------------------------------------------------------
// 1. COMPONENTE PADRE (EL TRADUCTOR)
// --------------------------------------------------------
export default function GuestBookingPage() {
  const params = useParams()
  const router = useRouter()
  
  // Capturamos el SLUG del link (ej: "el-kuni")
  const slug = params.slug as string 

  const [idComercio, setIdComercio] = React.useState<number | null>(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    // MAGIA: Buscamos el ID usando el Slug
    const fetchId = async () => {
      try {
        const res = await fetch(`/api/usuarios/publico?slug=${slug}`)
        if (res.ok) {
          const data = await res.json()
          setIdComercio(data.id_comercio) // <--- ¡ACÁ CONSEGUIMOS EL NÚMERO!
        } else {
          console.error("No se encontró el comercio")
          setError(true)
        }
      } catch (e) {
        console.error("Error buscando ID:", e)
        setError(true)
      }
    }

    if (slug) fetchId()
  }, [slug])

  // PANTALLA DE ERROR
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
        <h1 className="text-4xl mb-2">🤔</h1>
        <h2 className="text-2xl font-bold text-[#3A3A3A] mb-4">Comercio no encontrado</h2>
        <Button onClick={() => router.push('/')}>Volver al inicio</Button>
    </div>
  )

  // PANTALLA DE CARGA (Mientras traduce el nombre a ID)
  if (!idComercio) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <Loader2 className="w-10 h-10 animate-spin text-[#7A9A75]" />
    </div>
  )

  // SI YA TENEMOS EL ID, MOSTRAMOS EL FORMULARIO REAL
  return <BookingForm idComercio={idComercio} slug={slug} />
}

// --------------------------------------------------------
// 2. COMPONENTE HIJO (TU FORMULARIO REAL)
// --------------------------------------------------------
function BookingForm({ idComercio, slug }: { idComercio: number, slug: string }) {
  const router = useRouter()
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1)

  // Ahora el hook recibe un NÚMERO real y funciona perfecto
  const { 
    comercio, loadingData, submitting,
    date, setDate, selectedTime, setSelectedTime,
    nombre, setNombre, telefono, setTelefono,
    horariosPosibles, getHorariosLibres, reservarTurno 
  } = useGuestBooking(idComercio)

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
      
      {/* Botón Volver (Corregido para usar el Slug) */}
      {step !== 4 && (
        <Button variant="ghost" onClick={() => router.push(`/${slug}`)} className="absolute top-4 left-4 text-gray-500 hover:text-[#7A9A75]">
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
              onBack={() => router.push(`/${slug}`)} // Volver al perfil
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