import { useState, useEffect, useMemo } from "react"
import { formatDateLocal } from "@/lib/date-utils"

export function useGuestBooking(idComercio: number) {
  // Datos del comercio y catálogo
  const [comercio, setComercio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([]) // NUEVO: Para el catálogo
  const [turnosOcupados, setTurnosOcupados] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Datos del Formulario
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  
  // NUEVO: Manejo del servicio seleccionado (ID, nombre y monto)
  const [selectedServicio, setSelectedServicio] = useState<any | null>(null)

  // 1. Cargar Datos (Turnos, Comercio y Servicios)
  useEffect(() => {
    const fetchData = async () => {
      if (!idComercio) return
      try {
        const [resTurnos, resComercio, resServicios] = await Promise.all([
            fetch(`/api/turnos?id_comercio=${idComercio}`),
            fetch(`/api/usuarios/publico?id_comercio=${idComercio}`),
            fetch(`/api/servicios?id_comercio=${idComercio}`) // Traemos los servicios
        ])
        
        if (resTurnos.ok) setTurnosOcupados(await resTurnos.json())
        if (resComercio.ok) setComercio(await resComercio.json())
        if (resServicios.ok) setServicios(await resServicios.json())
        
      } catch (e) { 
        console.error("Error cargando datos iniciales:", e) 
      } finally { 
        setLoadingData(false) 
      }
    }
    fetchData()
  }, [idComercio])

  // 2. Calcular Slots (Grilla de horarios vacía basada en apertura/cierre)
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

  // 3. Filtrar Horarios Libres
  const getHorariosLibres = (fecha: Date | undefined) => {
    if (!fecha) return []
    
    const fechaSeleccionadaStr = fecha.toLocaleDateString('en-CA') 
    
    const horasOcupadas = turnosOcupados
      .filter(t => {
        if (t.estado === 'cancelado') return false
        const turnoFechaStr = t.fecha.toString().split('T')[0]
        return turnoFechaStr === fechaSeleccionadaStr
      })
      .map(t => {
        return t.hora.toString().split('T')[1].substring(0, 5) 
      })
      
    return horariosPosibles.filter(h => !horasOcupadas.includes(h))
  }

  // 4. Enviar Reserva al Backend
  const reservarTurno = async () => {
    // Validamos que tengamos fecha, hora, nombre, teléfono y el servicio elegido
    if (!date || !selectedTime || !nombre || !telefono || !selectedServicio) return false
    
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id_comercio: idComercio,
          id_servicio: selectedServicio.id_servicio, // Guardamos el ID real
          fecha: formatDateLocal(date), 
          hora: selectedTime,           
          nombre_invitado: nombre,
          contacto_invitado: telefono,
          servicio_nombre: selectedServicio.nombre, // Nombre del servicio para el historial
          monto: Number(selectedServicio.precio),   // El precio configurado por el barbero
          estado: "pendiente"
        })
      })
      return res.ok
    } catch (error) { 
      console.error("Error al reservar:", error)
      return false 
    } finally { 
      setSubmitting(false) 
    }
  }

  return {
    comercio, 
    servicios, // La lista para que el cliente elija
    loadingData, 
    submitting,
    date, setDate,
    selectedTime, setSelectedTime,
    nombre, setNombre,
    telefono, setTelefono,
    selectedServicio, setSelectedServicio, // Para manejar la selección del paso 2
    horariosPosibles, 
    getHorariosLibres, 
    reservarTurno
  }
}