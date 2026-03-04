"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import AppMenu from "@/components/ui/appMenu"
import { ArrowLeft } from "lucide-react"
import { ConfigModal } from "@/components/dashboard/config-modal"
import { ServiciosModal } from "@/components/dashboard/ServiciosModal"
import { RegistrarEmpleadoModal } from "./RegistrarEmpleadoModal" 
import { toast } from "sonner"

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
  const [isServicesOpen, setServicesOpen] = React.useState(false)
  const [isEmployeesOpen, setEmployeesOpen] = React.useState(false) 
  const [servicios, setServicios] = React.useState<any[]>([]) // 👈 Tipado corregido para evitar error 'never'

  const idParaTelegram = usuario?.id_comercio || usuario?.id;

  // --- CARGA MANUAL DE SERVICIOS ---
  // Usamos una función en lugar de useEffect para evitar bucles infinitos
  const handleOpenEmployees = async () => {
    if (idParaTelegram && servicios.length === 0) {
      try {
        const res = await fetch(`/api/servicios?id_comercio=${idParaTelegram}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setServicios(data);
        }
      } catch (err) {
        console.error("Error cargando servicios para empleados", err);
      }
    }
    setEmployeesOpen(true);
  };

  const handleShare = () => {
    const slug = usuario?.slug
    if (!slug) {
        alert("Primero tenés que configurar el nombre de tu negocio (Slug).")
        return
    }
    const url = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(url)
    toast.success(`¡Comparti el link de la turnera!\n\n${url}`)
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
              onShareClick={handleShare} 
              onServicesClick={() => setServicesOpen(true)}
              onEmployeesClick={handleOpenEmployees} // 👈 Cambiado a la función de carga manual
              idComercio={idParaTelegram} 
            />
            
            <div className="h-10 w-10 rounded-full bg-[#4A4A4A] flex items-center justify-center text-[#D6Dac2] font-bold shadow-md border border-migue/30 uppercase">
                {usuario?.nombre_empresa?.charAt(0) || "M"}
            </div>
        </div>

        {/* --- MODALES --- */}
        <ConfigModal 
          open={isConfigOpen} 
          onOpenChange={setIsConfigOpen} 
          usuario={usuario}
          onUpdate={onUpdateUser}
        />

        <ServiciosModal
          open={isServicesOpen}
          onOpenChange={setServicesOpen}
          idComercio={idParaTelegram}
        />

        {/* --- MODAL DE EMPLEADOS --- */}
        <RegistrarEmpleadoModal
          open={isEmployeesOpen}
          onOpenChange={setEmployeesOpen}
          servicios={servicios}
          idComercio={idParaTelegram}
          usuario={usuario} // 👈 CRÍTICO: Pasamos el usuario para que Cloudinary tenga el slug y cree las carpetas
          onGuardar={() => {
            toast.success("¡Operación exitosa!");
          }}
        />
    </div>
  )
}