import { useState, useEffect, useMemo } from "react"
import { formatTimeDisplay, formatDateLocal } from "@/lib/date-utils"

interface UseNuevoTurnoProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    date: Date | undefined
    turnos: any[]
    turnoAEditar?: any
    onGuardar: (datos: any) => Promise<void>
    usuario: any
}

export function useNuevoTurnoLogic({ open, onOpenChange, date, turnos, turnoAEditar, onGuardar, usuario }: UseNuevoTurnoProps) {
    const [hora, setHora] = useState<string | null>(null)
    const [cliente, setCliente] = useState("")
    const [telefono, setTelefono] = useState("")
    const [servicio, setServicio] = useState("")
    const [monto, setMonto] = useState("")
    const [metodoPago, setMetodoPago] = useState("EFECTIVO") 

    const [loading, setLoading] = useState(false)
    const [buscandoCliente, setBuscandoCliente] = useState(false)

    // 1. GENERAR HORARIOS
    const horariosDinamicos = useMemo(() => {
        if (!usuario) return []
        const slots = []
        const inicio = usuario.hora_apertura || "09:00"
        const fin = usuario.hora_cierre || "20:00"
        const intervalo = usuario.duracion_turno_min || 30

        let [hActual, mActual] = inicio.split(':').map(Number)
        const [hFin, mFin] = fin.split(':').map(Number)
        
        let time = hActual * 60 + mActual
        const timeFin = hFin * 60 + mFin

        while (time < timeFin) {
            const h = Math.floor(time / 60)
            const m = time % 60
            slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
            time += intervalo
        }
        return slots
    }, [usuario])

    // 2. INICIALIZAR SI SE EDITA
    useEffect(() => {
        if (open) { 
            if (turnoAEditar) {
                const horaLimpia = formatTimeDisplay(turnoAEditar.hora)
                
                setHora(horaLimpia)
                setCliente(turnoAEditar.clientes?.nombre_cliente || turnoAEditar.nombre_invitado || "")
                setTelefono(turnoAEditar.contacto_invitado || "")
                setServicio(turnoAEditar.servicio || "")
                setMonto(turnoAEditar.monto ? turnoAEditar.monto.toString() : "")
                setMetodoPago(turnoAEditar.metodo_pago || "EFECTIVO")
            } else {
                setHora(null); setCliente(""); setTelefono(""); setServicio(""); setMonto("")
                setMetodoPago("EFECTIVO")
            }
        }
    }, [open, turnoAEditar])

    // 3. AUTOCOMPLETAR WHATSAPP
    useEffect(() => {
        const buscarCliente = async () => {
            if (telefono.length >= 10 && !turnoAEditar) {
                setBuscandoCliente(true)
                try {
                    const idComercio = usuario.id_comercio || usuario.id 
                    const res = await fetch(`/api/clientes/buscar?whatsapp=${telefono}&id_comercio=${idComercio}`)
                    const data = await res.json()
                    
                    if (data && data.nombre_cliente) {
                        setCliente(data.nombre_cliente)
                    }
                } catch (error) { 
                    console.error("Error buscando cliente:", error) 
                } finally { 
                    setBuscandoCliente(false) 
                }
            }
        }

        const timer = setTimeout(buscarCliente, 500) 
        return () => clearTimeout(timer)
    }, [telefono, usuario, turnoAEditar])

    // 4. GUARDAR CAMBIOS (CORREGIDO PARA EVITAR DESFASE ✅)
    const handleGuardar = async () => {
        if (!date || !hora) return
        setLoading(true)
        
        // En lugar de crear un objeto Date acá, mandamos los strings.
        // Usamos formatDateLocal para asegurar el formato YYYY-MM-DD
        const fechaString = formatDateLocal(date)

        const datos = {
            id_turno: turnoAEditar?.id_turno, 
            id_comercio: usuario.id_comercio || usuario.id,
            fecha: fechaString, // "2026-02-10"
            hora: hora,        // "10:30" (El string que seleccionaste)
            nombre_invitado: cliente,
            contacto_invitado: telefono || null,
            servicio: servicio,
            monto: monto ? parseFloat(monto) : 0,
            metodoPago: metodoPago === "EFECTIVO" ? "EFECTIVO" : "DIGITAL"
        }

        await onGuardar(datos)
        setLoading(false)
        onOpenChange(false)
    }

    // 5. VALIDACIÓN DE OCUPADO
    const estaOcupado = (h: string) => {
        return turnos.some(t => {
            if (turnoAEditar && t.id_turno === turnoAEditar.id_turno) return false
            if (t.estado === "cancelado") return false

            try {
                const fechaTurnoStr = formatDateLocal(t.hora)
                const fechaSeleccionadaStr = formatDateLocal(date!)

                if (fechaTurnoStr !== fechaSeleccionadaStr) return false

                // Comparamos el string directo de la DB (Solución Atómica)
                // t.hora viene como "2026-02-10T10:30:00.000Z"
                const horaTurnoLocal = typeof t.hora === 'string' 
                    ? t.hora.split('T')[1].substring(0, 5) 
                    : formatTimeDisplay(t.hora)
                
                return horaTurnoLocal === h
            } catch { 
                return false 
            }
        })
    }

    return {
        hora, setHora,
        cliente, setCliente,
        telefono, setTelefono,
        servicio, setServicio,
        monto, setMonto,
        metodoPago, setMetodoPago,
        loading, buscandoCliente,
        horariosDinamicos,
        handleGuardar, estaOcupado
    }
}