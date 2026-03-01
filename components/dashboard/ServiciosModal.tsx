"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scissors, DollarSign, Save, Loader2, Tag, Trash2, X } from "lucide-react"
import { toast } from "sonner"

export function ServiciosModal({ open, onOpenChange, idComercio, onServicioAgregado }: any) {
  const [loading, setLoading] = React.useState(false)
  const [servicios, setServicios] = React.useState<any[]>([]) 
  const [cargandoLista, setCargandoLista] = React.useState(false)
  
  // Estado para saber si estamos editando uno existente
  const [editId, setEditId] = React.useState<number | null>(null)
  
  const [formData, setFormData] = React.useState({
    nombre: "",
    precio: ""
  })

  const cargarServicios = async () => {
    if (!idComercio) return
    setCargandoLista(true)
    try {
      const res = await fetch(`/api/servicios?id_comercio=${idComercio}`)
      if (res.ok) {
        const data = await res.json()
        setServicios(data)
      }
    } catch (error) {
      console.error("Error al cargar servicios", error)
    } finally {
      setCargandoLista(false)
    }
  }

  React.useEffect(() => {
    if (open) {
      cancelarEdicion()
      cargarServicios()
    }
  }, [open, idComercio])

  // Función para cargar los datos en el form y entrar en modo edición
  const prepararEdicion = (srv: any) => {
    setEditId(srv.id_servicio)
    setFormData({
      nombre: srv.nombre,
      precio: srv.precio.toString()
    })
  }

  const cancelarEdicion = () => {
    setEditId(null)
    setFormData({ nombre: "", precio: "" })
  }

  const handleSave = async () => {
    if (!idComercio) {
      toast.error("Error: No se encontró el ID del comercio.")
      return
    }

    if (!formData.nombre || !formData.precio) {
      toast.error("Completá nombre y precio.")
      return
    }

    setLoading(true)
    try {
      const metodo = editId ? 'PUT' : 'POST'
      const res = await fetch('/api/servicios', {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_servicio: editId, // Solo se usa en PUT
          id_comercio: idComercio, 
          nombre: formData.nombre,
          precio: Number(formData.precio)
        })
      })

      const resData = await res.json()

      if (res.ok) {
        toast.success(editId ? "Servicio actualizado" : "Servicio guardado")
        if (onServicioAgregado) onServicioAgregado(resData)
        cancelarEdicion()
        cargarServicios()
      } else {
        toast.error(resData.error || "Error al procesar la solicitud.")
      }
    } catch (error) {
      toast.error("Error de conexión al servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation() // Para que no se dispare el onClick de la fila (edición)
    
    if (!confirm("¿Seguro que querés eliminar este servicio?")) return

    try {
      const res = await fetch(`/api/servicios?id_servicio=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Servicio eliminado")
        if (editId === id) cancelarEdicion()
        cargarServicios()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "No se pudo eliminar.")
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-[#FDFBF7] border-migue/20 max-h-[85vh] overflow-y-auto">
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-[#3A3A3A] flex items-center gap-2">
            <Scissors className="w-6 h-6 text-[#7A9A75]" /> Mis Servicios
          </DialogTitle>
          <DialogDescription className="text-migue-gris/70">
            {editId ? "Editando servicio del catálogo." : "Agregá servicios a tu catálogo."}
          </DialogDescription>
        </DialogHeader>

        {/* --- SECCIÓN 1: FORMULARIO (POST / PUT) --- */}
        <div className="grid gap-5 py-4 border-b border-gray-200 pb-6 mb-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-migue-gris font-bold text-xs uppercase tracking-wider">
              <Tag className="w-4 h-4 text-[#7A9A75]" /> Nombre del Servicio
            </Label>
            <Input 
              placeholder="Ej: Corte Degradé" 
              className="border-migue/30 focus-visible:ring-[#7A9A75]"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-migue-gris font-bold text-xs uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-[#7A9A75]" /> Precio Final
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <Input 
                type="number"
                placeholder="5000"
                className="pl-8 border-migue/30 focus-visible:ring-[#7A9A75]"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1 bg-[#7A9A75] hover:bg-[#688564] text-white font-bold transition-all shadow-md py-6"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
              {editId ? "Actualizar Servicio" : "Guardar en Catálogo"}
            </Button>
            
            {editId && (
              <Button variant="outline" onClick={cancelarEdicion} className="px-3 border-gray-300">
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            )}
          </div>
        </div>

        {/* --- SECCIÓN 2: LISTA CON EDITAR Y BORRAR --- */}
        <div className="space-y-4 mt-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Catálogo Activo</h3>
          
          {cargandoLista ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-[#7A9A75]" /></div>
          ) : servicios.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-400 italic">
              No hay servicios cargados.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {servicios.map((srv) => (
                <div 
                  key={srv.id_servicio} 
                  onClick={() => prepararEdicion(srv)}
                  className={`bg-white p-4 rounded-xl border flex justify-between items-center transition-all group cursor-pointer hover:shadow-md ${editId === srv.id_servicio ? 'border-[#7A9A75] ring-1 ring-[#7A9A75]/20' : 'border-gray-100 hover:border-[#7A9A75]/30'}`}
                >
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-[#3A3A3A] text-base">{srv.nombre}</p>
                    <p className="font-serif font-bold text-[#7A9A75] text-sm mt-0.5">${Number(srv.precio)}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(e, srv.id_servicio)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}