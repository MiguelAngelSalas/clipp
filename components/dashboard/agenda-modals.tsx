"use client"

import { NuevoTurnoModal } from "@/components/ui/nuevoTurnoModal" 
import { ResumenDiaModal } from "@/components/ui/resumenDiaModal"
import { RegistrarCobroModal } from "@/components/ui/registrarCobroModal" 
import { SubscriptionModal } from "@/components/dashboard/subscription-modal"

// Pasamos el 'usuario' como prop extra desde AgendaView para mayor seguridad
export function AgendaModals({ logic, usuario: usuarioProp }: { logic: any, usuario: any }) {
    
    const { 
        modals, 
        cerrarModal, 
        guardarTurno, 
        registrarCobro, 
        date, 
        turnos,        // <--- Cambiamos turnosDelDia por turnos (el array completo)
        extrasDelDia,
        turnoEditando,
        nombreBarberia 
    } = logic

    // El usuario puede venir del hook o de la prop del padre
    const usuarioFinal = usuarioProp || logic.usuario;

    const handleGuardarCobro = (datosModal: any) => {
        // Debug para que veas en la consola del navegador qué llega
        console.log("Datos que llegan del modal:", datosModal);

        registrarCobro({
            monto: datosModal.monto,
            // Usamos .descripcion porque así lo definimos en el handleSubmit del Modal
            descripcion: datosModal.descripcion, 
            // Usamos .metodo porque así sale del Modal
            metodo: datosModal.metodo 
    })
}

    return (
        <>
            <NuevoTurnoModal 
                open={modals.nuevoTurno} 
                onOpenChange={(open) => !open && cerrarModal('nuevoTurno')}
                date={date} 
                // 👇 ACÁ: Pasamos 'turnos' (todos) para que el modal chequee disponibilidad
                turnos={turnos || []} 
                turnoAEditar={turnoEditando}
                onGuardar={guardarTurno} 
                usuario={usuarioFinal} 
            />

            <RegistrarCobroModal 
                open={modals.cobro}
                onOpenChange={(open) => !open && cerrarModal('cobro')}
                onGuardar={handleGuardarCobro} 
            />

            <ResumenDiaModal 
                open={modals.resumen} 
                onOpenChange={(open) => !open && cerrarModal('resumen')} 
                date={date} 
                turnos={logic.turnosDelDia} // Acá sí solo los del día para el resumen
                extras={extrasDelDia}
            />

            <SubscriptionModal 
                isOpen={modals.suscripcion} 
                onClose={() => cerrarModal('suscripcion')}
                userEmail={usuarioFinal?.email_unico || usuarioFinal?.email}
                nombreComercio={nombreBarberia}
            />
        </>
    )
}
