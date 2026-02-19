"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner" 

export function useAgendaLogic(usuario: any) {
    // --- ESTADOS ---
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [turnos, setTurnos] = useState<any[]>([])
    const [extras, setExtras] = useState<any[]>([]) 
    const [loading, setLoading] = useState(false)
    
    const [modals, setModals] = useState({
        nuevoTurno: false,
        resumen: false,
        cobro: false,
        suscripcion: false
    })
    const [turnoEditando, setTurnoEditando] = useState<any>(null)

    const { idComercio, tieneSuscripcion, nombreBarberia } = useMemo(() => {
        return {
            idComercio: usuario?.id_comercio || usuario?.id,
            tieneSuscripcion: usuario?.suscrito === true || usuario?.suscrito === 1 || usuario?.suscrito === "true",
            nombreBarberia: usuario?.nombre_empresa || usuario?.nombre || "Mi Barbería"
        }
    }, [usuario])

    // --- 1. CARGA DE DATOS ---
    const cargarDatos = useCallback(async () => {
        if (!idComercio || !date) return
        setLoading(true)
        
        const fechaString = date.toLocaleDateString('en-CA');
        
        try {
            const [resTurnos, resExtras] = await Promise.all([
                fetch(`/api/turnos?id_comercio=${idComercio}`),
                fetch(`/api/caja?id_comercio=${idComercio}&fecha=${fechaString}`)
            ]);

            if (resTurnos.ok) setTurnos(await resTurnos.json());
            if (resExtras.ok) setExtras(await resExtras.json());

        } catch (e) {
            toast.error("Error al sincronizar datos");
        } finally {
            setLoading(false)
        }
    }, [idComercio, date])

    useEffect(() => { cargarDatos() }, [cargarDatos])

    // --- 2. GESTIÓN DE MODALES ---
    const abrirModal = (tipo: keyof typeof modals, data?: any) => {
        if ((tipo === 'nuevoTurno' || tipo === 'cobro') && !tieneSuscripcion) {
            setModals(prev => ({ ...prev, suscripcion: true }))
            return
        }
        
        if (tipo === 'nuevoTurno') setTurnoEditando(data || null)
        setModals(prev => ({ ...prev, [tipo]: true }))
    }

    const cerrarModal = (tipo: keyof typeof modals) => {
        setModals(prev => ({ ...prev, [tipo]: false }))
        if (tipo === 'nuevoTurno') setTurnoEditando(null)
    }

    // --- 3. ACCIONES ---
    const ejecutarAccion = async (url: string, method: string, body: any, successMsg: string) => {
        const toastId = toast.loading("Procesando...");
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(successMsg, { id: toastId });
                await cargarDatos();
                return true;
            } 
            throw new Error();
        } catch (e) {
            toast.error("Error en la operación", { id: toastId });
            return false;
        }
    }

    const guardarTurno = async (datos: any) => {
        const method = datos.id_turno ? 'PUT' : 'POST';
        const body = { 
            ...datos, 
            id_comercio: Number(idComercio),
            fecha: method === 'POST' ? date?.toLocaleDateString('en-CA') : datos.fecha 
        };
        const ok = await ejecutarAccion('/api/turnos', method, body, "Turno guardado");
        if (ok) cerrarModal('nuevoTurno');
    }

    const registrarCobro = async (datos: any) => {
        const ok = await ejecutarAccion('/api/caja', 'POST', { ...datos, id_comercio: Number(idComercio) }, "Cobro registrado");
        if (ok) cerrarModal('cobro');
    }

    const finalizarTurno = async (idTurno: number, montoFinal: number, metodoPago: string) => {
        await ejecutarAccion('/api/turnos', 'PUT', {
            id_turno: idTurno,
            estado: 'finalizado',
            monto: montoFinal,
            metodoPago
        }, "¡Turno finalizado!");
    }

    const onCancelarTurno = async (idTurno: number) => {
        await ejecutarAccion('/api/turnos', 'PUT', {
            id_turno: idTurno,
            estado: 'cancelado'
        }, "Turno cancelado");
    }

    // 🔥 NUEVA ACCIÓN: Confirmación Manual
    const onConfirmarTurno = async (idTurno: number) => {
        await ejecutarAccion('/api/turnos', 'PUT', {
            id_turno: idTurno,
            estado: 'confirmado'
        }, "Turno confirmado");
    }

    // --- 4. DATA COMPUTADA ---
    const turnosDelDia = useMemo(() => {
        if (!date) return []
        const ISO = date.toLocaleDateString('en-CA')
        return turnos.filter(t => String(t.fecha).startsWith(ISO))
    }, [date, turnos])

    // --- 5. RETURN ---
    return {
        date, setDate,
        turnos,
        turnosDelDia,
        extrasDelDia: extras,
        loading,
        nombreBarberia,
        modals, turnoEditando,
        abrirModal, cerrarModal,
        guardarTurno, 
        registrarCobro, 
        finalizarTurno,
        onCancelarTurno,
        onConfirmarTurno, // 🔥 Lo devolvemos acá para que AgendaView lo vea
        recargar: cargarDatos,
        tieneSuscripcion 
    }
}