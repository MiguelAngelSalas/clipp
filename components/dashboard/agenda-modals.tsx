"use client"

import { NuevoTurnoModal } from "@/components/ui/nuevoTurnoModal" 
import { ResumenDiaModal } from "@/components/ui/resumenDiaModal"
import { RegistrarCobroModal } from "@/components/ui/registrarCobroModal" 
import { SubscriptionModal } from "@/components/dashboard/subscription-modal"

export function AgendaModals({ logic }: { logic: any }) {
    // 1. Desestructuramos todo (AGREGAMOS extrasDelDia)
    const { 
        modals, 
        cerrarModal, 
        guardarTurno, 
        registrarCobro, 
        date, 
        turnosDelDia,
        extrasDelDia, // <--- 1. IMPORTANTE: TRAEMOS LOS EXTRAS DEL HOOK
        turnoEditando, 
        usuario, 
        nombreBarberia 
    } = logic

    // 2. DEFINIMOS LA FUNCIÓN TRADUCTORA
    const handleGuardarCobro = (datosModal: any) => {
        registrarCobro({
            monto: datosModal.monto,
            descripcion: datosModal.concepto, 
            metodo: datosModal.metodo_pago === "Efectivo" ? "EFECTIVO" : "DIGITAL"
        })
    }

    // 3. EL RETURN
    return (
        <>
            <NuevoTurnoModal 
                open={modals.nuevoTurno} 
                onOpenChange={(open) => !open && cerrarModal('nuevoTurno')}
                date={date} 
                turnos={turnosDelDia} 
                turnoAEditar={turnoEditando}
                onGuardar={guardarTurno} 
                usuario={usuario} 
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
                turnos={turnosDelDia}
                extras={extrasDelDia} // <--- 2. SE LO PASAMOS AL MODAL
            />

            <SubscriptionModal 
                isOpen={modals.suscripcion} 
                onClose={() => cerrarModal('suscripcion')}
                userEmail={usuario?.email_unico || usuario?.email}
                nombreComercio={nombreBarberia}
            />
        </>
    )
}