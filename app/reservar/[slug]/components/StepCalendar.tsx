"use client"
import { Calendar } from "@/components/ui/calendar"

export function StepCalendar({ date, setDate, isDayDisabled }: any) {
  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 w-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={(d) => {
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          if (d < hoy) return true
          return isDayDisabled(d) // Delegamos la lógica de bloqueo al padre
        }}
        className="rounded-xl border shadow-sm bg-white p-4 w-full max-w-sm mx-auto"
        classNames={{
          table: "w-full border-collapse",
          head_row: "flex w-full justify-between",
          row: "flex w-full mt-2 justify-between",
          day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center", 
          head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
        }}
      />
    </div>
  )
}