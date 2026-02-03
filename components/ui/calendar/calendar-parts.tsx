import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

// Componente Raíz
export const CalendarRoot = ({ className, rootRef, ...props }: any) => {
  return (
    <div
      data-slot="calendar"
      ref={rootRef}
      className={cn(className)}
      {...props}
    />
  )
}

// Componente Flechas (Navegación)
export const CalendarChevron = ({ className, orientation, ...props }: any) => {
  if (orientation === "left") {
    return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
  }
  if (orientation === "right") {
    return <ChevronRightIcon className={cn("size-4", className)} {...props} />
  }
  return <ChevronDownIcon className={cn("size-4", className)} {...props} />
}

// Componente Número de Semana
export const CalendarWeekNumber = ({ children, ...props }: any) => {
  return (
    <td {...props}>
      <div className="flex size-(--cell-size) items-center justify-center text-center">
        {children}
      </div>
    </td>
  )
}