"use client"

import * as React from "react"
import { NavHeader } from "@/components/dashboard/nav-header"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { ScheduleList } from "@/components/dashboard/schedule/schedule-list"
import { AgendaModals } from "./agenda-modals" 
import { useAgendaLogic } from "@/components/dashboard/hooks/useAgendaLogic" 

const THEME = {
    bg: "bg-migue-beige",       
    text: "text-[#3D2B1F]",
}

export function AgendaView({ usuario, onLogout, onUpdateUser }: any) {
    // 1. Inyectamos toda la lógica del hook
    const logic = useAgendaLogic(usuario)
    
    // 2. Desestructuramos lo necesario. 
    const { 
        date, 
        setDate, 
        turnos, 
        turnosDelDia, 
        abrirModal, 
        nombreBarberia, 
        finalizarTurno,
        onCancelarTurno,
        onConfirmarTurno // 🔥 IMPORTANTE: Sacamos esta función del hook
    } = logic

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
                            {new Date().toLocaleDateString("es-AR", { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                            })}
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
                    {/* Lateral Izquierdo: Calendario */}
                    <div className="md:col-span-4">
                        <CalendarWidget 
                            date={date} 
                            setDate={setDate} 
                            turnos={turnos}
                            usuario={usuario}
                        />
                    </div>

                    {/* Lateral Derecho: Lista de Turnos */}
                    <div className="md:col-span-8">
                        <ScheduleList 
                            date={date}
                            turnosDelDia={turnosDelDia} 
                            onAddExtra={() => abrirModal('nuevoTurno')}
                            onEditTurno={(turno) => abrirModal('nuevoTurno', turno)}
                            onFinalizarTurno={finalizarTurno}
                            onCancelarTurno={onCancelarTurno}
                            onConfirmarTurno={onConfirmarTurno} // 🔥 AHORA SÍ: Pasamos la prop
                        />
                    </div>
                </div>
            </main>

            {/* --- GRUPO DE MODALES --- */}
            <AgendaModals logic={logic} usuario = {usuario} />
        </div>
    )
}