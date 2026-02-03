"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { CalendarDayButton } from "./calendar-day-button"
import { getCalendarClassNames } from "./calendar-styles"
import { CalendarChevron, CalendarRoot, CalendarWeekNumber } from "./calendar-parts"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  
  // --- FIX DE HIDRATACIÓN ---
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  // --------------------------

  const calendarClassNames = getCalendarClassNames(
    className,
    buttonVariant,
    props.showWeekNumber,
    captionLayout
  )

  // Si no está montado en el cliente, no renderizamos nada (o un div vacío del mismo tamaño)
  // Esto evita que el servidor mande un HTML que el cliente va a rechazar
  if (!mounted) return <div className="p-3 w-[280px] h-[300px]" />; 

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      // Forzamos un locale específico para que servidor y cliente hablen lo mismo (opcional pero recomendado)
      // locale={es} 
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        ...calendarClassNames,
        ...classNames,
      }}
      components={{
        Root: CalendarRoot,
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
        WeekNumber: CalendarWeekNumber,
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }