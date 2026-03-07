"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import AppMenu from "@/components/ui/appMenu"
import { ArrowLeft } from "lucide-react"
import { ConfigModal } from "@/components/dashboard/config-modal"
import { ServiciosModal } from "@/components/dashboard/ServiciosModal"
import { RegistrarEmpleadoModal } from "./RegistrarEmpleadoModal" 
import { toast } from "sonner"
// 🛡️ Importamos NextAuth
import { signOut, useSession } from "next-auth/react"

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
  
  // Obtenemos la sesión para mostrar info del usuario logueado
  const { data: session } = useSession()

  const [isConfigOpen, setIsConfigOpen] = React.useState(false)
  const [isServicesOpen, setServicesOpen] = React.useState(false)
  const [isEmployeesOpen, setEmployeesOpen] = React.useState(false) 
  const [servicios, setServicios] = React.useState<any[]>([])

  const idParaTelegram = usuario?.id_comercio || usuario?.id;

  // Lógica de Logout Real
  const handleLogout = async () => {
  // 1. Mostramos el toast de carga manualmente
    const toastId = toast.loading('Cerrando sesión...');

    try {
      // 2. Ejecutamos el signOut SIN redirección automática
      await signOut({ redirect: false });

      // 3. Si todo salió bien, actualizamos el toast a éxito
      toast.success('¡Hasta la próxima!', { id: toastId });

      // 4. Pequeño delay para que el usuario vea el mensaje y redirección manual
      setTimeout(() => {
        window.location.href = "/"; 
      }, 1500);

    } catch (error) {
      toast.error('Error al salir', { id: toastId });
      console.error("Error en logout:", error);
    }
  }

  const handleOpenEmployees = async () => {
    setEmployeesOpen(true);
    
    if (idParaTelegram) {
      try {
        const res = await fetch(`/api/servicios?id_comercio=${idParaTelegram}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setServicios(data);
        }
      } catch (err) {
        console.error("Error cargando servicios para empleados", err);
        toast.error("No se pudieron actualizar los servicios");
      }
    }
  };

  const handleShare = () => {
    const slug = usuario?.slug
    if (!slug) {
        toast.error("Primero tenés que configurar el nombre de tu negocio (Slug).")
        return
    }
    const url = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(url)
    toast.success(`¡Link copiado! Ya podés compartirlo.`, {
      description: url
    })
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
              onLogoutClick={handleLogout} // 👈 Ahora usa la función de NextAuth
              onShareClick={handleShare} 
              onServicesClick={() => setServicesOpen(true)}
              onEmployeesClick={handleOpenEmployees}
              idComercio={idParaTelegram} 
            />
            
            {/* Avatar con la inicial del usuario logueado o del comercio */}
            <div className="h-10 w-10 rounded-full bg-[#4A4A4A] flex items-center justify-center text-[#D6Dac2] font-bold shadow-md border border-migue/30 uppercase cursor-default">
                {session?.user?.name?.charAt(0) || usuario?.nombre_empresa?.charAt(0) || "M"}
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

        <RegistrarEmpleadoModal
          open={isEmployeesOpen}
          onOpenChange={setEmployeesOpen}
          servicios={servicios}
          idComercio={idParaTelegram}
          usuario={usuario}
        />
    </div>
  )
}