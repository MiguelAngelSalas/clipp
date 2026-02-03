"use client"

import * as React from "react"
import { NavHeader } from "@/components/dashboard/nav-header"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { ScheduleList } from "@/components/dashboard/schedule/schedule-list"
import { AgendaModals } from "./agenda-modals" // <--- Importamos el grupo de modales
import { useAgendaLogic } from "@/components/dashboard/hooks/useAgendaLogic" // <--- Importamos el cerebro

const THEME = {
    bg: "bg-migue-beige",       
    text: "text-[#3D2B1F]",
}

export function AgendaView({ usuario, onLogout, onUpdateUser }: any) {
    // Toda la lógica compleja vive ahora dentro de este hook
    const logic = useAgendaLogic(usuario)
    
    // Desestructuramos solo lo que necesitamos para el Layout
    const { date, setDate, turnos, turnosDelDia, abrirModal, nombreBarberia, cargarTurnos } = logic

    return (
        <div className={`min-h-screen ${THEME.bg} ${THEME.text}`}>
            <NavHeader 
                onNuevoTurno={() => abrirModal('nuevoTurno')} 
                onRegistrarCobro={() => abrirModal('cobro')}
                onVolver={onLogout}
                usuario={usuario}
                onUpdateUser={onUpdateUser}
            />

            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#3D2B1F]/10 pb-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-[1000] text-[#3D2B1F] tracking-tight">
                            Hola, {nombreBarberia} 👋
                        </h1>
                        <p className="text-xl md:text-2xl font-[900] text-[#3D2B1F] opacity-90 capitalize mt-2">
                            {new Date().toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    <button 
                        onClick={() => abrirModal('resumen')}
                        className="text-xs font-[1000] text-[#3D2B1F] hover:text-[#5a7a56] underline underline-offset-8 decoration-2 uppercase tracking-[0.2em] transition-all"
                    >
                        Ver resumen financiero
                    </button>
                </div>

                {/* --- GRID PRINCIPAL --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4">
                        <CalendarWidget 
                            date={date} 
                            setDate={setDate} 
                            turnos={turnos}
                            usuario={usuario}
                        />
                    </div>
                    <div className="md:col-span-8">
                        <ScheduleList 
                            turnosDelDia={turnosDelDia} 
                            onAddExtra={() => abrirModal('nuevoTurno')}
                            onTurnoUpdated={cargarTurnos}
                            onEditTurno={(turno) => abrirModal('nuevoTurno', turno)}
                        />
                    </div>
                </div>
            </main>

            {/* --- MODALES (Ahora es una sola línea) --- */}
            <AgendaModals logic={logic} />
        </div>
    )
}