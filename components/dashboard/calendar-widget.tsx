"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"

interface CalendarWidgetProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  turnos: any[] 
  usuario: any 
}

export function CalendarWidget({ date, setDate, turnos = [], usuario }: CalendarWidgetProps) {

  // Definimos el color café oscuro sólido
  const marronOscuro = "text-[#3D2B1F]"
  
  const capacidadMax = React.useMemo(() => {
    const apertura = usuario?.hora_apertura || "09:00";
    const cierre = usuario?.hora_cierre || "20:00";
    const duracion = usuario?.duracion_turno_min || 30;

    const [hA, mA] = apertura.split(':').map(Number);
    const [hC, mC] = cierre.split(':').map(Number);
    const minutosTotales = (hC * 60 + mC) - (hA * 60 + mA);

    const calculo = Math.floor(minutosTotales / duracion);
    return calculo > 0 ? calculo : 10;
  }, [usuario]);

  const ocupacionPorDia = React.useMemo(() => {
    const counts: Record<string, number> = {};
    turnos.forEach((t: any) => {
      if (t.estado === 'cancelado') return;
      const fecha = String(t.fecha).split('T')[0];
      counts[fecha] = (counts[fecha] || 0) + 1;
    });
    return counts;
  }, [turnos]);

  const modifiers = {
    completo: (day: Date) => {
      const fechaStr = day.toLocaleDateString('en-CA');
      return (ocupacionPorDia[fechaStr] || 0) >= capacidadMax;
    },
    disponible: (day: Date) => {
      const fechaStr = day.toLocaleDateString('en-CA');
      const cant = ocupacionPorDia[fechaStr] || 0;
      return cant > 0 && cant < capacidadMax;
    }
  };

  const cantidadTurnosDelDia = React.useMemo(() => {
    if (!date) return 0;
    const diaSel = date.toLocaleDateString('en-CA');
    return ocupacionPorDia[diaSel] || 0;
  }, [date, ocupacionPorDia]);

  return (
    <div className="flex flex-col gap-6">
        {/* CAJA DEL CALENDARIO */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#3D2B1F]/20 shadow-xl flex flex-col items-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={es}
                className="rounded-md"
                modifiers={modifiers}
                modifiersClassNames={{
                    completo: "day-full font-black",      
                    disponible: "day-available font-black" 
                }}
            />

            {/* REFERENCIAS DE COLOR */}
            <div className="mt-6 flex gap-6 text-[11px] uppercase font-[1000] tracking-tighter">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#7A9A75]"></div> 
                <span className={marronOscuro}>Con lugar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#e57373]"></div> 
                <span className={marronOscuro}>Completo</span>
              </div>
            </div>
        </div>

        {/* CAJA DE ESTADO (TEXTOS REFORZADOS) */}
        <div className="bg-white p-8 rounded-2xl border-2 border-[#3D2B1F]/20 shadow-xl space-y-6">
            
            {/* ITEM: TURNOS AGENDADOS */}
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <span className={`${marronOscuro} font-[1000] uppercase text-[12px] tracking-[0.1em]`}>
                  Turnos agendados
                </span>
                <span className={`font-[1000] ${marronOscuro} text-4xl tracking-tighter`}>
                    {date ? cantidadTurnosDelDia : "-"}
                </span>
            </div>

            {/* ITEM: ESTADO DEL DÍA */}
            <div className="flex items-center justify-between">
                <span className={`${marronOscuro} font-[1000] uppercase text-[12px] tracking-[0.1em]`}>
                  Estado del día
                </span>
                <span className={`font-[1000] text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-md ${
                    cantidadTurnosDelDia >= capacidadMax 
                    ? "bg-red-700 text-white" 
                    : cantidadTurnosDelDia > 0 
                      ? "bg-[#5a7a56] text-white" 
                      : "bg-[#3D2B1F] text-white"
                }`}>
                    {cantidadTurnosDelDia >= capacidadMax 
                      ? "COMPLETO" 
                      : cantidadTurnosDelDia > 0 
                        ? "CON ACTIVIDAD" 
                        : "LIBRE"}
                </span>
            </div>
        </div>
    </div>
  )
}