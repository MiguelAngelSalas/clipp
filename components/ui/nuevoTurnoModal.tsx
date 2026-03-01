"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Phone, User, DollarSign, Scissors } from "lucide-react" 
import { cn } from "@/lib/utils"
import { useNuevoTurnoLogic } from "@/components/ui/hooks/useNuevoTurnoLogic"

interface NuevoTurnoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | undefined
  turnos: any[] 
  turnoAEditar?: any 
  onGuardar: (datos: any) => Promise<void>
  usuario: any 
}

export function NuevoTurnoModal(props: NuevoTurnoModalProps) {
  const {
    hora, setHora,
    cliente, setCliente,
    telefono, setTelefono,
    servicio, setServicio,
    monto, setMonto,
    metodoPago, setMetodoPago, 
    loading, buscandoCliente,
    horariosDinamicos,
    handleGuardar, estaOcupado
  } = useNuevoTurnoLogic(props)

  // --- ESTADOS Y LÓGICA PARA LOS SERVICIOS ---
  const [listaServicios, setListaServicios] = React.useState<any[]>([])
  const [cargandoServicios, setCargandoServicios] = React.useState(false)

  React.useEffect(() => {
    // Buscamos si el ID viene como id_comercio o simplemente como id
    const idDelComercio = props.usuario?.id_comercio || props.usuario?.id;

    if (props.open && idDelComercio) {
      const cargarServicios = async () => {
        setCargandoServicios(true)
        try {
          const res = await fetch(`/api/servicios?id_comercio=${idDelComercio}`)
          if (res.ok) {
            const data = await res.json()
            setListaServicios(data)
          }
        } catch (error) {
          console.error("Error cargando servicios en modal:", error)
        } finally {
          setCargandoServicios(false)
        }
      }
      cargarServicios()
    }
  }, [props.open, props.usuario])

  // Función que se dispara cuando se elige un servicio del Select
  const handleServicioChange = (nombreServicio: string) => {
    // Buscamos el servicio en nuestra lista por nombre
    const servicioElegido = listaServicios.find(s => s.nombre === nombreServicio)
    
    setServicio(nombreServicio) // Guardamos el nombre
    
    if (servicioElegido) {
      setMonto(servicioElegido.precio.toString()) // Autocompletamos el precio
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#fdfdf9] border-migue/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-migue-gris">
            {props.turnoAEditar ? "Modificar Turno" : "Nuevo Turno"}
          </DialogTitle>
          <DialogDescription className="capitalize">
            {props.date?.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 space-y-5">
            {/* 1. SELECCIÓN DE HORA */}
            <div>
                <Label className="mb-3 block text-xs font-bold uppercase opacity-60 text-migue-gris">1. Elegí el horario disponible</Label>
                <div className="grid grid-cols-4 gap-2 max-h-[150px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-migue/10">
                    {horariosDinamicos.map((h) => {
                        const ocupado = estaOcupado(h)
                        const selected = hora === h
                        return (
                            <button 
                                key={h} type="button" disabled={ocupado} onClick={() => setHora(h)} 
                                className={cn(
                                    "py-2 rounded border text-xs font-bold transition-all shadow-sm", 
                                    ocupado 
                                      ? "bg-red-50 text-red-400 border-red-100 cursor-not-allowed opacity-50" 
                                      : selected 
                                          ? "bg-[#7A9A75] text-white border-[#7A9A75] scale-105 shadow-md" 
                                          : "bg-white text-migue-gris border-migue/20 hover:border-[#7A9A75] hover:bg-[#7A9A75]/5"
                                )}
                            >
                                {h}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 2. DATOS DEL CLIENTE Y DETALLES */}
            {hora && (
                <div className="space-y-4 pt-4 border-t border-migue/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="block text-xs font-bold uppercase opacity-60 text-migue-gris">2. Detalles del Turno</Label>
                    
                    {/* FILA 1: CONTACTO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                            <div className="absolute left-2.5 top-2.5">
                                {buscandoCliente ? <Loader2 className="h-4 w-4 text-[#7A9A75] animate-spin" /> : <Phone className="h-4 w-4 text-gray-400" />}
                            </div>
                            <Input 
                                placeholder="WhatsApp (ej: 11...)" 
                                value={telefono} onChange={(e) => setTelefono(e.target.value)} 
                                className={cn("bg-white pl-9 border-migue/20 transition-all", buscandoCliente && "border-[#7A9A75] ring-1 ring-[#7A9A75]/20")} 
                            />
                        </div>

                        <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Nombre del cliente..." 
                                value={cliente} onChange={(e) => setCliente(e.target.value)} 
                                className={cn("bg-white pl-9 border-migue/20 focus:ring-[#7A9A75]", buscandoCliente && "opacity-70")} 
                            />
                        </div>
                    </div>

                    {/* FILA 2: SERVICIO (SELECT DINÁMICO) */}
                    <div className="relative">
                      {cargandoServicios ? (
                        <div className="flex items-center justify-center h-10 bg-white border border-migue/20 rounded-md">
                           <Loader2 className="h-4 w-4 text-gray-400 animate-spin mr-2" />
                           <span className="text-sm text-gray-500">Cargando catálogo...</span>
                        </div>
                      ) : (
                        <Select value={servicio} onValueChange={handleServicioChange}>
                            <SelectTrigger className="bg-white border-migue/20 text-migue-gris w-full h-10 focus:ring-[#7A9A75]">
                                <div className="flex items-center gap-2">
                                  <Scissors className="h-4 w-4 text-gray-400" />
                                  <SelectValue placeholder="Seleccionar servicio..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-[#3D2B1F]/10 shadow-xl z-[9999] max-h-[200px]">
                                {listaServicios.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500 text-center italic">
                                      No hay servicios cargados.
                                    </div>
                                ) : (
                                    listaServicios.map((srv) => (
                                        <SelectItem 
                                          key={srv.id_servicio} 
                                          value={srv.nombre} 
                                          className="cursor-pointer focus:bg-[#7A9A75]/10 py-3"
                                        >
                                          <div className="flex justify-between w-full pr-4 items-center">
                                            <span className="font-medium">{srv.nombre}</span>
                                            <span className="text-[#7A9A75] font-bold text-xs ml-4">
                                              ${Number(srv.precio).toLocaleString('es-AR')}
                                            </span>
                                          </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* FILA 3: PRECIO Y MÉTODO DE PAGO */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#5a7a56]" />
                            <Input 
                                type="number" 
                                placeholder="Precio" 
                                value={monto} 
                                onChange={(e) => setMonto(e.target.value)} 
                                className="bg-white pl-9 border-migue/20 font-bold text-migue-gris" 
                            />
                        </div>

                        <Select value={metodoPago} onValueChange={setMetodoPago}>
                            <SelectTrigger className="bg-white border-migue/20 text-migue-gris font-medium focus:ring-[#7A9A75]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-[#3D2B1F]/10 shadow-xl z-[9999]">
                                <SelectItem value="EFECTIVO" className="cursor-pointer focus:bg-[#7A9A75]/10">Efectivo</SelectItem>
                                <SelectItem value="TRANSFERENCIA" className="cursor-pointer focus:bg-[#7A9A75]/10">Transferencia</SelectItem>
                                <SelectItem value="TARJETA" className="cursor-pointer focus:bg-[#7A9A75]/10">Tarjeta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
        
        <DialogFooter className="pt-2">
          <Button 
            onClick={handleGuardar} 
            disabled={!hora || !cliente || !servicio || loading} 
            className="bg-[#4A4A4A] hover:bg-[#333333] text-[#D6Dac2] w-full font-bold h-12 text-lg shadow-sm transition-all active:scale-95"
          >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : (props.turnoAEditar ? "Guardar Cambios" : "Confirmar Turno")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}