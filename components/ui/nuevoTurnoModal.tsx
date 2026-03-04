"use client"

import * as React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Phone, User, DollarSign, Scissors, Clock, Users, Loader2 } from "lucide-react"
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

  const [listaServicios, setListaServicios] = React.useState<any[]>([])
  const [listaStaff, setListaStaff] = React.useState<any[]>([])
  const [barberoElegido, setBarberoElegido] = React.useState<any>(null)
  const [cargandoDatos, setCargandoDatos] = React.useState(false)

  const idDelComercio = props.usuario?.id_comercio || props.usuario?.id;

  React.useEffect(() => {
    if (props.open && idDelComercio) {
      const cargarInfo = async () => {
        setCargandoDatos(true)
        try {
          const [resSrv, resStaff] = await Promise.all([
            fetch(`/api/servicios?id_comercio=${idDelComercio}`),
            fetch(`/api/empleados?id_comercio=${idDelComercio}`)
          ])
          const srvs = await resSrv.json()
          const staff = await resStaff.json()
          setListaServicios(srvs)
          setListaStaff(staff)
          if (props.turnoAEditar?.id_empleado) {
            setBarberoElegido(staff.find((s: any) => s.id_empleado === props.turnoAEditar.id_empleado))
          }
        } catch (error) { console.error(error) } finally { setCargandoDatos(false) }
      }
      cargarInfo()
    }
  }, [props.open, idDelComercio, props.turnoAEditar])

  const serviciosFiltrados = React.useMemo(() => {
    if (!barberoElegido) return listaServicios;
    const idsHabilitados = barberoElegido.servicios?.map((s: any) => s.id_servicio) || [];
    return listaServicios.filter(s => idsHabilitados.includes(s.id_servicio));
  }, [barberoElegido, listaServicios]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="bg-white rounded-2xl border-2 border-[#3D2B1F]/20 max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-[1000] text-[#3D2B1F] text-center uppercase tracking-tighter">
            {props.turnoAEditar ? "MODIFICAR TURNO" : "NUEVO TURNO"}
          </DialogTitle>
          <DialogDescription className="text-center text-[#7A9A75] font-bold capitalize">
             {props.date?.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* 1. HORARIOS */}
          <div className="space-y-2">
            <Label className="text-[#3D2B1F] font-black uppercase text-xs flex items-center gap-2">
              <Clock className="w-3 h-3" /> 1. Horario disponible
            </Label>
            <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto p-2 border-2 border-[#3D2B1F]/5 rounded-xl bg-gray-50/50">
              {horariosDinamicos.map((h) => {
                const ocupado = estaOcupado(h)
                const selected = hora === h
                return (
                  <button 
                    key={h} type="button" disabled={ocupado} onClick={() => setHora(h)} 
                    className={cn(
                      "py-2 rounded-lg border-2 text-[11px] font-black transition-all shadow-sm", 
                      ocupado ? "bg-gray-100 text-gray-300 border-gray-100 opacity-50" : 
                      selected ? "bg-[#7A9A75] text-white border-[#7A9A75] scale-105" : 
                      "bg-white text-[#3D2B1F] border-[#3D2B1F]/10 hover:border-[#7A9A75]"
                    )}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. STAFF */}
          {hora && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-[#3D2B1F] font-black uppercase text-xs flex items-center gap-2">
                <Users className="w-3 h-3" /> 2. ¿Quién atiende?
              </Label>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {listaStaff.map((emp) => (
                  <button
                    key={emp.id_empleado}
                    type="button"
                    onClick={() => setBarberoElegido(emp)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all min-w-[85px]",
                      barberoElegido?.id_empleado === emp.id_empleado 
                        ? "border-[#7A9A75] bg-[#7A9A75]/5 shadow-sm" 
                        : "border-[#3D2B1F]/5 bg-white hover:border-[#7A9A75]/30"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <img src={emp.foto_url || "/api/placeholder/100/100"} className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#3D2B1F] truncate w-16 text-center">{emp.nombre.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. DATOS */}
          {hora && barberoElegido && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[#3D2B1F] font-black uppercase text-xs">WhatsApp</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {buscandoCliente ? <Loader2 className="w-4 h-4 animate-spin text-[#7A9A75]" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <Input 
                      placeholder="11..." 
                      value={telefono} 
                      onChange={(e) => setTelefono(e.target.value)} 
                      className="pl-10 h-12 font-bold border-migue/20 focus-visible:ring-[#7A9A75] rounded-xl" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#3D2B1F] font-black uppercase text-xs">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      placeholder="Cliente..." 
                      value={cliente} 
                      onChange={(e) => setCliente(e.target.value)} 
                      className="pl-10 h-12 font-bold border-migue/20 focus-visible:ring-[#7A9A75] rounded-xl" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#3D2B1F] font-black uppercase text-xs">Servicio</Label>
                <Select value={servicio} onValueChange={(val) => {
                  const s = listaServicios.find(x => x.nombre === val)
                  setServicio(val)
                  if (s) setMonto(s.precio.toString())
                }}>
                  <SelectTrigger className="h-12 border-migue/20 focus:ring-[#7A9A75] rounded-xl">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="Seleccionar..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#3D2B1F]/10 rounded-xl">
                    {serviciosFiltrados.map(s => (
                      <SelectItem key={s.id_servicio} value={s.nombre} className="font-bold py-3 uppercase text-[10px]">
                        {s.nombre} — ${s.precio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[#3D2B1F] font-black uppercase text-xs">Costo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9A75] font-bold text-lg">$</span>
                    <Input 
                      type="number" 
                      value={monto} 
                      onChange={(e) => setMonto(e.target.value)} 
                      className="pl-8 h-12 font-black text-[#7A9A75] border-migue/20 rounded-xl" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#3D2B1F] font-black uppercase text-xs">Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger className="h-12 border-migue/20 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">
                      <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                      <SelectItem value="DIGITAL">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={() => handleGuardar({ id_empleado: barberoElegido?.id_empleado })} 
            disabled={!hora || !cliente || !servicio || !barberoElegido || loading} 
            className="w-full bg-[#7A9A75] hover:bg-[#5a7a56] text-white py-7 text-lg font-[1000] rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="animate-spin" /> : (props.turnoAEditar ? "GUARDAR CAMBIOS" : "CONFIRMAR TURNO")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}