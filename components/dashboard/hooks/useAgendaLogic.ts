import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner" 

export function useAgendaLogic(usuario: any) {
    // --- ESTADOS DE DATOS ---
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [turnos, setTurnos] = useState<any[]>([])
    const [extras, setExtras] = useState<any[]>([]) 
    const [loading, setLoading] = useState(false)

    // --- ESTADOS DE MODALES ---
    const [modals, setModals] = useState({
        nuevoTurno: false,
        resumen: false,
        cobro: false,
        suscripcion: false
    })
    const [turnoEditando, setTurnoEditando] = useState<any>(null)

    // Helpers
    const idComercio = usuario?.id_comercio || usuario?.id
    const tieneSuscripcion = usuario?.suscrito || true
    const nombreBarberia = usuario?.nombre_empresa || usuario?.nombre || "Barbería"

    // --- 1. CARGA DE DATOS ---
    const cargarDatos = useCallback(async () => {
        if (!idComercio) return
        setLoading(true)
        try {
            // A. Traemos los TURNOS
            const resTurnos = await fetch(`/api/turnos?id_comercio=${idComercio}`)
            if (resTurnos.ok) setTurnos(await resTurnos.json())

            // B. Traemos los EXTRAS (CORREGIDO AQUI 🚨)
            // Apuntamos a la ruta real que creamos: /api/caja/registrar
            const resExtras = await fetch(`/api/caja/registrar?id_comercio=${idComercio}`)
            if (resExtras.ok) {
                const dataExtras = await resExtras.json()
                console.log("💰 Extras cargados:", dataExtras) 
                setExtras(dataExtras)
            }

        } catch (e) { console.error(e) } 
        finally { setLoading(false) }
    }, [idComercio])

    useEffect(() => { cargarDatos() }, [cargarDatos])

    // --- 2. LÓGICA DE PERMISOS ---
    const abrirModal = (tipo: 'nuevoTurno' | 'resumen' | 'cobro', turnoData?: any) => {
        if ((tipo === 'nuevoTurno' || tipo === 'cobro') && !tieneSuscripcion) {
            setModals(prev => ({ ...prev, suscripcion: true }))
            return
        }
        if (tipo === 'nuevoTurno') setTurnoEditando(turnoData || null)
        setModals(prev => ({ ...prev, [tipo]: true }))
    }

    const cerrarModal = (tipo: keyof typeof modals) => {
        setModals(prev => ({ ...prev, [tipo]: false }))
        if (tipo === 'nuevoTurno') setTurnoEditando(null)
    }

    // --- 3. ACCIONES ---
    
    // A. Guardar Turno
    const guardarTurno = async (datos: any) => {
        if (!date || !idComercio) return
        const toastId = toast.loading("Guardando...");

        try {
            const method = datos.id_turno ? 'PUT' : 'POST'
            const body: any = { ...datos, id_comercio: Number(idComercio) } 
            
            if (method === 'POST') body.fecha = date.toLocaleDateString('en-CA')

            const res = await fetch('/api/turnos', {
                method, 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success("¡Listo!", { id: toastId });
                await cargarDatos(); 
                cerrarModal('nuevoTurno');
            } else { 
                toast.error("Error al guardar", { id: toastId });
            }
        } catch (e) { toast.error("Error de conexión", { id: toastId }); }
    }

    // B. Registrar Cobro (CORREGIDO AQUI TAMBIEN 🚨)
    const registrarCobro = async (datos: any) => {
        if (!idComercio) return
        const toastId = toast.loading("Registrando en caja...");

        try {
            // Apuntamos a la ruta real: /api/caja/registrar
            const res = await fetch('/api/caja/registrar', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...datos, id_comercio: Number(idComercio) })
            });

            if (res.ok) {
                toast.success("¡Cobro Registrado!", { id: toastId });
                cerrarModal('cobro');
                await cargarDatos(); 
            } else { 
                toast.error("Error al cobrar", { id: toastId });
            }
        } catch (e) { toast.error("Error de conexión", { id: toastId }); }
    }

    // C. Finalizar Turno
    const finalizarTurno = async (idTurno: number, montoFinal: number, metodoPago: string) => {
        const toastId = toast.loading("Finalizando...");
        try {
            const res = await fetch('/api/turnos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_turno: idTurno,
                    estado: 'finalizado',
                    monto: montoFinal,
                    metodoPago: metodoPago
                })
            });

            if (res.ok) {
                toast.success("¡Turno Cobrado!", { id: toastId });
                await cargarDatos();
            } else {
                toast.error("Error", { id: toastId });
            }
        } catch (error) { toast.error("Error de conexión", { id: toastId }); }
    }

    // --- 4. DATOS COMPUTADOS ---
    
    const turnosDelDia = useMemo(() => {
        if (!date) return []
        const fechaCalendario = date.toLocaleDateString('en-CA')
        return turnos.filter(t => String(t.fecha).split('T')[0] === fechaCalendario)
    }, [date, turnos])

    // Filtro simplificado para evitar problemas de zona horaria por ahora
    const extrasDelDia = useMemo(() => {
         return extras; 
    }, [extras])


    return {
        date, setDate,
        turnos, turnosDelDia,
        extrasDelDia,
        usuario, nombreBarberia,
        modals, turnoEditando,
        abrirModal, cerrarModal,
        guardarTurno, 
        registrarCobro, 
        cargarTurnos: cargarDatos,
        finalizarTurno
    }
}