import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner" 

export function useAgendaLogic(usuario: any) {
    // --- ESTADOS DE DATOS ---
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [turnos, setTurnos] = useState<any[]>([])
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
    const cargarTurnos = useCallback(async () => {
        if (!idComercio) return
        setLoading(true)
        try {
            const res = await fetch(`/api/turnos?id_comercio=${idComercio}`)
            if (res.ok) setTurnos(await res.json())
        } catch (e) { console.error(e) } 
        finally { setLoading(false) }
    }, [idComercio])

    useEffect(() => { cargarTurnos() }, [cargarTurnos])

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

    // --- 3. ACCIONES (Guardar/Cobrar/Finalizar) ---
    
    // A. Guardar (Nuevo o Editar)
    const guardarTurno = async (datos: any) => {
        if (!date || !idComercio) return
        const toastId = toast.loading("Conectando con la base de datos...");

        try {
            const method = datos.id_turno ? 'PUT' : 'POST'
            const body: any = { ...datos, id_comercio: Number(idComercio) } 
            
            if (method === 'POST') body.fecha = date.toLocaleDateString('en-CA')

            const res = await fetch('/api/turnos', {
                method, 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const dataRespuesta = await res.json();

            if (res.ok) {
                toast.success(method === 'POST' ? "¡Turno Agendado!" : "¡Turno Actualizado!", {
                    id: toastId,
                    description: `Cliente: ${datos.nombre_invitado}`,
                    duration: 4000, 
                });

                await cargarTurnos();
                cerrarModal('nuevoTurno');
            } else { 
                toast.error("No se pudo guardar", {
                    id: toastId,
                    description: dataRespuesta.message || "Ocurrió un error inesperado.",
                    duration: 5000, 
                });
            }
        } catch (e) { 
            console.error(e);
            toast.error("Error de conexión", {
                id: toastId,
                description: "Verificá tu internet e intentá de nuevo.",
                duration: 5000,
            });
        }
    }

    // B. Registrar Cobro (Caja Extra)
    const registrarCobro = async (datos: any) => {
        if (!idComercio) return
        const toastId = toast.loading("Registrando en caja...");

        try {
            const res = await fetch('/api/caja/registrar', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...datos, id_comercio: Number(idComercio) })
            });

            if (res.ok) {
                toast.success("¡Cobro Registrado!", {
                    id: toastId,
                    description: `Monto: $${datos.monto}`,
                    duration: 4000
                });
                cerrarModal('cobro');
                await cargarTurnos();
            } else { 
                toast.error("Error al cobrar", {
                    id: toastId,
                    description: "No se pudo guardar el movimiento."
                });
            }
        } catch (e) { 
            console.error(e);
            toast.error("Error de conexión", {
                id: toastId,
                description: "Verificá tu internet."
            });
        }
    }

    // C. FINALIZAR TURNO (LA NUEVA FUNCIÓN) 👇👇👇
    const finalizarTurno = async (idTurno: number, montoFinal: number, metodoPago: string) => {
        const toastId = toast.loading("Finalizando turno...");

        try {
            const res = await fetch('/api/turnos', {
                method: 'PUT', // Usamos PUT para actualizar el estado
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_turno: idTurno,
                    estado: 'finalizado', // Cambiamos estado
                    monto: montoFinal,    // Guardamos cuánto se cobró realmente
                    metodoPago: metodoPago // Guardamos si fue Efectivo o Digital
                })
            });

            if (res.ok) {
                toast.success("¡Turno Finalizado!", {
                    id: toastId,
                    // Feedback lindo: "$10000 en EFECTIVO"
                    description: `$${montoFinal} cobrados en ${metodoPago.toLowerCase()}`,
                    duration: 4000
                });
                await cargarTurnos(); // Refrescamos la agenda para que cambie de color
            } else {
                toast.error("Error al finalizar", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión", { id: toastId });
        }
    }

    // --- 4. DATOS COMPUTADOS ---
    const turnosDelDia = useMemo(() => {
        if (!date) return []
        const fechaCalendario = date.toLocaleDateString('en-CA')
        return turnos.filter(t => String(t.fecha).split('T')[0] === fechaCalendario)
    }, [date, turnos])

    return {
        // Datos
        date, setDate,
        turnos, turnosDelDia,
        usuario, nombreBarberia,
        // Modales
        modals, turnoEditando,
        abrirModal, cerrarModal,
        // Acciones
        guardarTurno, 
        registrarCobro, 
        cargarTurnos,
        finalizarTurno // <--- 4. NO TE OLVIDES DE EXPORTARLA ACÁ
    }
}