import { useState, useEffect, useMemo } from "react"

interface UseNuevoTurnoProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    date: Date | undefined
    
    // 1. CAMBIO AQUÍ 👇 (Antes decía turnosDelDia)
    turnos: any[]
    
    turnoAEditar?: any
    onGuardar: (datos: any) => Promise<void>
    usuario: any
}

// 2. CAMBIO AQUÍ EN LOS ARGUMENTOS 👇
export function useNuevoTurnoLogic({ open, onOpenChange, date, turnos, turnoAEditar, onGuardar, usuario }: UseNuevoTurnoProps) {
    // --- ESTADOS ---
    const [hora, setHora] = useState<string | null>(null)
    const [cliente, setCliente] = useState("")
    const [telefono, setTelefono] = useState("")
    const [servicio, setServicio] = useState("")
    const [monto, setMonto] = useState("")
    
    // NUEVO ESTADO AGREGADO
    const [metodoPago, setMetodoPago] = useState("EFECTIVO") 

    const [loading, setLoading] = useState(false)
    const [buscandoCliente, setBuscandoCliente] = useState(false)

    // --- 1. GENERAR HORARIOS (Matemática Pura) ---
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
                setHora(`${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`)
                setCliente(turnoAEditar.clientes?.nombre_cliente || turnoAEditar.nombre_invitado || "")
                setTelefono(turnoAEditar.contacto_invitado || "")
                setServicio(turnoAEditar.servicio || "")
                setMonto(turnoAEditar.monto ? turnoAEditar.monto.toString() : "")
                
                // CARGAMOS EL MÉTODO SI EXISTE
                setMetodoPago(turnoAEditar.metodo_pago || "EFECTIVO")
            } else {
                // Resetear form
                setHora(null); setCliente(""); setTelefono(""); setServicio(""); setMonto("")
                // RESETEAMOS A EFECTIVO POR DEFECTO
                setMetodoPago("EFECTIVO")
            }
        }
    }, [open, turnoAEditar])

    // --- 3. AUTOCOMPLETAR WHATSAPP (La Magia) ---
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
        fechaHoraFinal.setHours(h, m, 0, 0)

        const datos = {
            id_turno: turnoAEditar?.id_turno, 
            hora: fechaHoraFinal, 
            nombre_invitado: cliente,
            contacto_invitado: telefono || null,
            servicio: servicio,
            monto: monto ? parseFloat(monto) : 0,
            
            // MANDAMOS EL DATO AL GUARDAR
            metodoPago: metodoPago === "EFECTIVO" ? "EFECTIVO" : "DIGITAL"
        }

        await onGuardar(datos)
        setLoading(false)
        onOpenChange(false)
    }

    const estaOcupado = (h: string) => {
        // 3. CAMBIO AQUÍ EN EL USO 👇 (Usamos 'turnos' en vez de 'turnosDelDia')
        return turnos.some(t => {
            if (turnoAEditar && t.id_turno === turnoAEditar.id_turno) return false
            try {
                const d = new Date(t.hora)
                const horaTurno = `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
                return horaTurno === h
            } catch { return false }
        })
    }

    return {
        // Datos Form
        hora, setHora,
        cliente, setCliente,
        telefono, setTelefono,
        servicio, setServicio,
        monto, setMonto,
        // EXPORTAMOS LOS ESTADOS NUEVOS
        metodoPago, setMetodoPago,
        
        // UI States
        loading, buscandoCliente,
        // Computed
        horariosDinamicos,
        // Actions
        handleGuardar, estaOcupado
    }
}