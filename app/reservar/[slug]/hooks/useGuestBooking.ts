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

  // 2. Calcular Slots
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

  // 3. Filtrar Ocupados (ARREGLADO)
  const getHorariosLibres = (fecha: Date | undefined) => {
    if (!fecha) return []
    const fechaStr = fecha.toISOString().split('T')[0]
    
    const ocupados = turnosOcupados
      .filter(t => {
        // Obtenemos la fecha del turno en formato YYYY-MM-DD
        const tStr = new Date(t.fecha).toISOString().split('T')[0]
        return tStr === fechaStr && t.estado !== 'cancelado'
      })
      .map(t => {
        const d = new Date(t.hora)
        // 🛠️ CAMBIO CLAVE 1: Usamos getHours() (Hora Local)
        // Esto hace que las 22:30 de la DB se lean como 19:30
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      })
      
    return horariosPosibles.filter(h => !ocupados.includes(h))
  }

  // 4. Enviar Reserva (FIX FINAL PARA ZONA HORARIA)
  const reservarTurno = async () => {
    if (!date || !selectedTime || !nombre || !telefono) return false
    setSubmitting(true)
    
    // 1. Armamos la fecha local tal cual la eligió el usuario (ej: 19:30)
    const [h, m] = selectedTime.split(':').map(Number)
    const fechaLocal = new Date(date)
    fechaLocal.setHours(h, m, 0, 0) 
    
    // 2. Extraemos la hora UTC real (ej: si es 19:30 AR, acá saca 22:30)
    // Esto es lo que le vamos a mandar a la API para que guarde bien
    const utcH = fechaLocal.getUTCHours().toString().padStart(2, '0')
    const utcM = fechaLocal.getUTCMinutes().toString().padStart(2, '0')
    const horaParaEnviar = `${utcH}:${utcM}`

    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id_comercio: idComercio,
          
          fecha: formatDateLocal(date), // Mantenemos el formato string YYYY-MM-DD
          hora: horaParaEnviar,         // Mandamos la hora convertida a UTC ("22:30")
          
          nombre_invitado: nombre,
          contacto_invitado: telefono,
          servicio: "Corte de Pelo", 
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
    horariosPosibles, getHorariosLibres, reservarTurno
  }
}