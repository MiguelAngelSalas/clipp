"use client" // <--- Importante

import { NuevoTurnoModal } from "@/components/ui/nuevoTurnoModal" // O la ruta que tengas
import { ResumenDiaModal } from "@/components/ui/resumenDiaModal"
import { RegistrarCobroModal } from "@/components/ui/registrarCobroModal" 
import { SubscriptionModal } from "@/components/dashboard/subscription-modal"

export function AgendaModals({ logic }: { logic: any }) {
    // 1. Desestructuramos todo lo que viene del hook
    const { 
        modals, 
        cerrarModal, 
        guardarTurno, 
        registrarCobro, 
        date, 
        turnosDelDia, 
        turnoEditando, 
        usuario, 
        nombreBarberia 
    } = logic

    // 2. DEFINIMOS LA FUNCIÓN TRADUCTORA ACÁ (Antes del return) 👇
    const handleGuardarCobro = (datosModal: any) => {
        // Acá conectamos tu Modal (concepto) con la API (descripcion)
        registrarCobro({
            monto: datosModal.monto,
            descripcion: datosModal.concepto, 
            metodo: datosModal.metodo_pago === "Efectivo" ? "EFECTIVO" : "DIGITAL"
        })
    }

    // 3. AHORA SÍ EL RETURN
    return (
        <>
            <NuevoTurnoModal 
                open={modals.nuevoTurno} 
                onOpenChange={(open) => !open && cerrarModal('nuevoTurno')}
                date={date} 
                turnosDelDia={turnosDelDia} 
                turnoAEditar={turnoEditando}
                onGuardar={guardarTurno} 
                usuario={usuario} 
            />

            <RegistrarCobroModal 
                open={modals.cobro}
                onOpenChange={(open) => !open && cerrarModal('cobro')}
                
                // Ahora esta variable SÍ existe porque la definimos arriba 👆
                onGuardar={handleGuardarCobro} 
            />

            <ResumenDiaModal 
                open={modals.resumen} 
                onOpenChange={(open) => !open && cerrarModal('resumen')} 
                date={date} 
                turnos={turnosDelDia} 
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