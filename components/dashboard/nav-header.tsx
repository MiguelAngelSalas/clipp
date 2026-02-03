"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import AppMenu from "@/components/ui/appMenu"
import { ArrowLeft } from "lucide-react"
import { ConfigModal } from "@/components/dashboard/config-modal"

interface NavHeaderProps {
  onNuevoTurno: () => void
  onRegistrarCobro: () => void // <-- 1. AGREGAMOS ESTA PROP
  onVolver: () => void 
  usuario: any
  onUpdateUser: (u: any) => void
}

export function NavHeader({ 
  onNuevoTurno, 
  onRegistrarCobro, // <-- 2. LA RECIBIMOS ACÁ
  onVolver, 
  usuario, 
  onUpdateUser 
}: NavHeaderProps) {
  
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)

  return (
    <div className="bg-white border-b border-migue/20 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        
        <div className="flex items-center gap-4">
             <Button 
                variant="ghost" 
                onClick={onVolver} 
                className="text-xl font-bold text-migue-gris hover:bg-migue-beige/50 pl-0"
             >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver
             </Button>
        </div>
        
        <div className="flex items-center gap-3">
            <AppMenu 
              onNuevoTurnoClick={onNuevoTurno} 
              onRegistrarCobroClick={onRegistrarCobro} // <-- 3. SE LA PASAMOS AL MENÚ
              onConfigClick={() => setIsConfigOpen(true)} 
              onLogoutClick={onVolver}
            />
            
            <div className="h-10 w-10 rounded-full bg-[#4A4A4A] flex items-center justify-center text-[#D6Dac2] font-bold shadow-md border border-migue/30 uppercase">
                {usuario?.nombre_empresa?.charAt(0) || "M"}
            </div>
        </div>

        <ConfigModal 
          open={isConfigOpen} 
          onOpenChange={setIsConfigOpen} 
          usuario={usuario}
          onUpdate={onUpdateUser}
        />
    </div>
  )
}