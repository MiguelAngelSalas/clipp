import { useState, useEffect, useMemo } from "react"
import { formatDateLocal } from "@/lib/date-utils"

export function useGuestBooking(idComercio: number) {
  const [comercio, setComercio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [turnosOcupados, setTurnosOcupados] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Datos del Formulario
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [selectedServicio, setSelectedServicio] = useState<any | null>(null)
  
  // 💈 Barbero seleccionado
  const [selectedEmpleado, setSelectedEmpleado] = useState<any | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!idComercio) return
      try {
        const [resTurnos, resComercio, resServicios] = await Promise.all([
            fetch(`/api/turnos?id_comercio=${idComercio}`),
            fetch(`/api/usuarios/publico?id_comercio=${idComercio}`),
            fetch(`/api/servicios?id_comercio=${idComercio}`)
        ])
        
        if (resTurnos.ok) setTurnosOcupados(await resTurnos.json())
        if (resComercio.ok) setComercio(await resComercio.json())
        if (resServicios.ok) setServicios(await resServicios.json())
        
      } catch (e) { 
        console.error("Error cargando datos:", e) 
      } finally { 
        setLoadingData(false) 
      }
    }
    fetchData()
  }, [idComercio])

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

  // 3. Filtrar Horarios Libres (FIX: Exclusividad por barbero 🕵️)
  const getHorariosLibres = (fecha: Date | undefined) => {
    if (!fecha) return []
    
    const fechaSeleccionadaStr = fecha.toLocaleDateString('en-CA') 
    
    const horasOcupadas = turnosOcupados
      .filter(t => {
        // 1. Ignoramos turnos cancelados
        if (t.estado === 'cancelado') return false

        // 2. Verificamos la fecha (YYYY-MM-DD)
        const turnoFechaStr = t.fecha.toString().split('T')[0]
        const coincideFecha = turnoFechaStr === fechaSeleccionadaStr
        
        // 3. 🚨 FIX CRÍTICO:
        // Si hay un barbero elegido, solo bloqueamos las horas de ESE barbero.
        // Si NO hay barbero elegido todavía (ej. en el paso del calendario), 
        // no bloqueamos nada o podríamos bloquear solo si TODOS los barberos están ocupados.
        // Pero para tu flujo, lo correcto es filtrar por el seleccionado.
        const coincideEmpleado = selectedEmpleado 
          ? Number(t.id_empleado) === Number(selectedEmpleado.id_empleado)
          : false; // 👈 Cambiado de 'true' a 'false' para no pisar/bloquear de más

        return coincideFecha && coincideEmpleado
      })
      .map(t => {
        // Extraemos HH:mm del campo hora
        const horaStr = t.hora.toString();
        return horaStr.includes('T') ? horaStr.split('T')[1].substring(0, 5) : horaStr.substring(0, 5);
      })
      
    return horariosPosibles.filter(h => !horasOcupadas.includes(h))
  }

  const reservarTurno = async () => {
    if (!date || !selectedTime || !nombre || !telefono || !selectedServicio || !selectedEmpleado) return false
    
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id_comercio: idComercio,
          id_servicio: selectedServicio.id_servicio,
          id_empleado: selectedEmpleado.id_empleado, 
          fecha: formatDateLocal(date), 
          hora: selectedTime,           
          nombre_invitado: nombre,
          contacto_invitado: telefono,
          servicio_nombre: selectedServicio.nombre,
          monto: Number(selectedServicio.precio),
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
    servicios,
    loadingData, 
    submitting,
    date, setDate,
    selectedTime, setSelectedTime,
    nombre, setNombre,
    telefono, setTelefono,
    selectedServicio, setSelectedServicio,
    selectedEmpleado, setSelectedEmpleado, 
    horariosPosibles, 
    getHorariosLibres, 
    reservarTurno
  }
}