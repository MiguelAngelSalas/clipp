"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import AppMenu from "@/components/ui/appMenu" // Asegurate que la ruta sea correcta
import { ArrowLeft } from "lucide-react"
import { ConfigModal } from "@/components/dashboard/config-modal"
// Si tenés "sonner" o "react-hot-toast", importalo acá. Si no, usaremos alert()

interface NavHeaderProps {
  onNuevoTurno: () => void
  onRegistrarCobro: () => void 
  onVolver: () => void 
  usuario: any
  onUpdateUser: (u: any) => void
}

export function NavHeader({ 
  onNuevoTurno, 
  onRegistrarCobro, 
  onVolver, 
  usuario, 
  onUpdateUser 
}: NavHeaderProps) {
  
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)

  // 1. LA MAGIA: FUNCIÓN PARA COPIAR EL LINK 📋✨
  const handleShare = () => {
    // Chequeamos que el usuario tenga el slug configurado
    const slug = usuario?.slug
    if (!slug) {
        alert("Primero tenés que configurar el nombre de tu negocio (Slug).")
        return
    }

    // Armamos el link completo
    const url = `${window.location.origin}/${slug}`

    // Copiamos al portapapeles
    navigator.clipboard.writeText(url)
    
    // Le avisamos al usuario (Si tenés Toast, usá toast.success)
    alert(`¡Link copiado!\n\n${url}\n\nPegalo en WhatsApp o Instagram.`)
  }

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
              onRegistrarCobroClick={onRegistrarCobro}
              onConfigClick={() => setIsConfigOpen(true)} 
              onLogoutClick={onVolver}
              // 2. CONECTAMOS LA FUNCIÓN ACÁ 👇
              onShareClick={handleShare} 
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