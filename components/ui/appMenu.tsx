"use client"

import * as React from "react"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { 
  CalendarDays, 
  CreditCard, 
  Settings, 
  LogOut, 
  PlusCircle,
  Share2,
  Send 
} from "lucide-react"

interface AppMenuProps {
  onNuevoTurnoClick?: () => void
  onRegistrarCobroClick?: () => void 
  onConfigClick?: () => void 
  onLogoutClick?: () => void 
  onShareClick?: () => void
  onServicesClick?: () => void
  idComercio?: number 
}

export default function AppMenu({ 
  onNuevoTurnoClick, 
  onRegistrarCobroClick,
  onConfigClick, 
  onLogoutClick,
  onShareClick,
  onServicesClick,
  idComercio 
}: AppMenuProps) {
  
  const estiloMenu = "bg-white border border-migue shadow-lg min-w-[200px]"
  const estiloItem = "cursor-pointer text-migue-gris focus:bg-migue-beige focus:text-migue-gris py-2"
  const verdeMigue = "text-[#7A9A75]"

  // Nombre de usuario de tu bot (el que termina en _bot)
  const botUsername = "saas_barberia_bot"; 

  return (
    <Menubar className="rounded-md border-none bg-transparent shadow-none">
      
      {/* MENÚ AGENDA */}
      <MenubarMenu>
        <MenubarTrigger className="font-bold text-migue-gris cursor-pointer hover:bg-migue-beige rounded px-3 py-1 transition-colors data-[state=open]:bg-migue-beige">
            Agenda
        </MenubarTrigger>
        <MenubarContent className={estiloMenu}>
          <MenubarItem onClick={onNuevoTurnoClick} className={estiloItem}>
            <PlusCircle className={`mr-2 h-4 w-4 ${verdeMigue}`} /> 
            Nuevo Turno <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          
          <MenubarItem className={estiloItem}>
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
            Ver Calendario
          </MenubarItem>
          <MenubarSeparator className="bg-migue-gris/20" />
        </MenubarContent>
      </MenubarMenu>

      {/* MENÚ CAJA */}
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer text-migue-gris hover:bg-migue-beige rounded px-3 py-1 transition-colors data-[state=open]:bg-migue-beige">
            Caja
        </MenubarTrigger>
        <MenubarContent className={estiloMenu}>
          <MenubarItem onClick={onRegistrarCobroClick} className={estiloItem}>
              <CreditCard className="mr-2 h-4 w-4 opacity-70" /> Registrar Cobro
          </MenubarItem>
          <MenubarSeparator className="bg-migue-gris/20" />
          <MenubarItem className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer py-2">
            Cerrar Caja del Día
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      {/* MENÚ MI NEGOCIO */}
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer text-migue-gris hover:bg-migue-beige rounded px-3 py-1 transition-colors data-[state=open]:bg-migue-beige">
            Mi Negocio
        </MenubarTrigger>
        <MenubarContent className={estiloMenu}>
          <MenubarItem>

          </MenubarItem>
          <MenubarItem className={estiloItem} onClick={onShareClick}>
              <Share2 className="mr-2 h-4 w-4 text-blue-500" /> Compartir Link
          </MenubarItem>

          {/* OPCIÓN TELEGRAM COMO LINK DIRECTO */}
          <MenubarItem className={estiloItem} asChild>
            <a 
              href={`https://telegram.me/${botUsername}?start=${idComercio}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center w-full"
            >
              <Send className="mr-2 h-4 w-4 text-[#0088cc]" /> 
              Notificaciones Telegram
            </a>
          </MenubarItem>
          
          <MenubarSeparator className="bg-migue-gris/20" />

          <MenubarItem className={estiloItem} onClick={onConfigClick}>
              <Settings className="mr-2 h-4 w-4 opacity-70" /> Configuración
          </MenubarItem>
          <MenubarItem className={estiloItem} onClick={()=>alert("Estamos trabajando en ello")}>
              <Settings className="mr-2 h-4 w-4 opacity-70" /> Servicios
          </MenubarItem>
          <MenubarSeparator className="bg-migue-gris/20" />
          <MenubarItem className={estiloItem} onClick={onLogoutClick}>
              <LogOut className="mr-2 h-4 w-4 opacity-70" /> Salir
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

    </Menubar>
  )
}
