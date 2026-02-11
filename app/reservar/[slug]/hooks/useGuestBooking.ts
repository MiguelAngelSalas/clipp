import { useState, useEffect, useMemo } from "react"
import { formatDateLocal } from "@/lib/date-utils"

export function useGuestBooking(idComercio: number) {
  // Datos del comercio
  const [comercio, setComercio] = useState<any>(null)
  const [turnosOcupados, setTurnosOcupados] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Datos del Formulario
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [servicio, setServicio] = useState("") 

  // 1. Cargar Datos
  useEffect(() => {
    const fetchData = async () => {
      if (!idComercio) return
      try {
        const [resTurnos, resComercio] = await Promise.all([
            fetch(`/api/turnos?id_comercio=${idComercio}`),
            fetch(`/api/usuarios/publico?id_comercio=${idComercio}`)
        ])
        
        if (resTurnos.ok) setTurnosOcupados(await resTurnos.json())
        if (resComercio.ok) setComercio(await resComercio.json())
      } catch (e) { console.error(e) } 
      finally { setLoadingData(false) }
    }
    fetchData()
  }, [idComercio])

  // 2. Calcular Slots (Grilla de horarios vacía)
  const horariosPosibles = useMemo(() => {
    if (!comercio) return []
    const slots = []
    const inicio = comercio.hora_apertura || "09:00"
    const fin = comercio.hora_cierre || "20:00"
    const intervalo = comercio.duracion_turno_min || 30

    let [h, m] = inicio.split(':').map(Number)
    const [hFin, mFin] = fin.split(':').map(Number)
    let totalMin = h * 60 + m
    const totalMinFin = hFin * 60 + mFin

    while (totalMin < totalMinFin) {
      const hh = Math.floor(totalMin / 60).toString().padStart(2, '0')
      const mm = (totalMin % 60).toString().padStart(2, '0')
      slots.push(`${hh}:${mm}`)
      totalMin += intervalo
    }
    return slots
  }, [comercio])

  // 3. Filtrar Ocupados (MÉTODO ATÓMICO: STRING VS STRING) ✅
  const getHorariosLibres = (fecha: Date | undefined) => {
    if (!fecha) return []
    
    // Convertimos la fecha del calendario a "YYYY-MM-DD" estándar
    // Usamos 'en-CA' que siempre devuelve YYYY-MM-DD
    const fechaSeleccionadaStr = fecha.toLocaleDateString('en-CA') 
    
    const horasOcupadas = turnosOcupados
      .filter(t => {
        if (t.estado === 'cancelado') return false

        // 1. MIRAMOS EL CAMPO 'fecha', NO 'hora'
        // t.fecha viene como "2026-02-11T00:00:00.000Z" -> split('T')[0] da "2026-02-11"
        const turnoFechaStr = t.fecha.toString().split('T')[0]
        
        return turnoFechaStr === fechaSeleccionadaStr
      })
      .map(t => {
        // 2. AHORA SÍ SACAMOS LA HORA
        // t.hora viene como "1970-01-01T14:30:00.000Z"
        // split('T')[1] nos da "14:30:00.000Z", substring(0,5) nos da "14:30"
        return t.hora.toString().split('T')[1].substring(0, 5) 
      })
      
    // Filtramos: Dejamos solo las horas que NO están en la lista de ocupadas
    return horariosPosibles.filter(h => !horasOcupadas.includes(h))
  }

  // 4. Enviar Reserva
  const reservarTurno = async () => {
    if (!date || !selectedTime || !nombre || !telefono) return false
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id_comercio: idComercio,
          fecha: formatDateLocal(date), // "YYYY-MM-DD"
          hora: selectedTime,           // "19:30" (String puro) 
          nombre_invitado: nombre,
          contacto_invitado: telefono,
          servicio: servicio || "Corte de Pelo", 
          monto: 0,
          estado: "pendiente"
        })
      })
      return res.ok
    } catch { return false } 
    finally { setSubmitting(false) }
  }

  return {
    comercio, loadingData, submitting,
    date, setDate,
    selectedTime, setSelectedTime,
    nombre, setNombre,
    telefono, setTelefono,
    servicio, setServicio,
    horariosPosibles, getHorariosLibres, reservarTurno
  }
}