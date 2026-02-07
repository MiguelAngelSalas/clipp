import { useState, useEffect, useMemo } from "react"

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
    // --- ESTADOS ---
    const [hora, setHora] = useState<string | null>(null)
    const [cliente, setCliente] = useState("")
    const [telefono, setTelefono] = useState("")
    const [servicio, setServicio] = useState("")
    const [monto, setMonto] = useState("")
    const [metodoPago, setMetodoPago] = useState("EFECTIVO") 

    const [loading, setLoading] = useState(false)
    const [buscandoCliente, setBuscandoCliente] = useState(false)

    // --- 1. GENERAR HORARIOS ---
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

    // --- 2. INICIALIZAR SI SE EDITA ---
    useEffect(() => {
        if (open) { 
            if (turnoAEditar) {
                const d = new Date(turnoAEditar.hora)
                
                // 🛠️ CORRECCIÓN 1: Usamos getHours (Local)
                const h = d.getHours().toString().padStart(2, '0')
                const m = d.getMinutes().toString().padStart(2, '0')
                
                setHora(`${h}:${m}`)
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

    // --- 3. AUTOCOMPLETAR WHATSAPP ---
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
                } catch (error) { console.error(error) } 
                finally { setBuscandoCliente(false) }
            }
        }

        const timer = setTimeout(buscarCliente, 500) 
        return () => clearTimeout(timer)
    }, [telefono, usuario, turnoAEditar])

    // --- 4. HELPERS ---
    const handleGuardar = async () => {
        if (!date || !hora) return
        setLoading(true)
        
        const [h, m] = hora.split(':').map(Number)
        const fechaHoraFinal = new Date(date)
        fechaHoraFinal.setHours(h, m, 0, 0) // Esto usa tu hora local, ¡está perfecto!

        const datos = {
            id_turno: turnoAEditar?.id_turno, 
            hora: fechaHoraFinal, 
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

    const estaOcupado = (h: string) => {
        return turnos.some(t => {
            if (turnoAEditar && t.id_turno === turnoAEditar.id_turno) return false
            try {
                const d = new Date(t.hora)
                
                // 🛠️ CORRECCIÓN 2: Comparamos con hora Local
                const horaTurno = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
                
                return horaTurno === h
            } catch { return false }
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