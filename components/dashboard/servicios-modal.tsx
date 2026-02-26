"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scissors, DollarSign, Save, Loader2, Tag } from "lucide-react"

export function ServiciosModal({ open, onOpenChange, idComercio, onServicioAgregado }: any) {
  const [loading, setLoading] = React.useState(false)
  
  // 1. Estado inicial del formulario para un SERVICIO
  const [formData, setFormData] = React.useState({
    nombre: "",
    precio: "",
    duracion: 30
  })

  // 2. Limpiamos el formulario cada vez que se abre el modal
  React.useEffect(() => {
    if (open) {
      setFormData({ nombre: "", precio: "", duracion: 30 })
    }
  }, [open])

  const handleSave = async () => {
    if (!idComercio) {
      alert("Error: No se encontró el ID del comercio.")
      return
    }

    if (!formData.nombre || !formData.precio) {
      alert("Por favor completá el nombre y el precio del servicio.")
      return
    }

    setLoading(true)
    try {
      // 3. Enviamos los datos a nuestra (futura) API de servicios
      const res = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_comercio: idComercio, 
          nombre: formData.nombre,
          precio: Number(formData.precio),
          duracion: Number(formData.duracion)
        })
      })

      if (res.ok) {
        const nuevoServicio = await res.json()
        // Si tenés una función para actualizar la lista en el padre, la llamamos
        if (onServicioAgregado) onServicioAgregado(nuevoServicio)
        onOpenChange(false)
      } else {
        const errorData = await res.json()
        alert("Error al guardar: " + (errorData.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error en fetch servicios:", error)
      alert("Error de conexión al servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#FDFBF7] border-migue/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-[#3A3A3A] flex items-center gap-2">
            <Scissors className="w-6 h-6 text-[#7A9A75]" /> Nuevo Servicio
          </DialogTitle>
          <DialogDescription className="text-migue-gris/70">
            Agregá un nuevo servicio a tu catálogo para que los clientes puedan elegirlo al reservar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="nombre" className="flex items-center gap-2 text-migue-gris font-bold text-xs uppercase">
              <Tag className="w-4 h-4 text-[#7A9A75]" /> Nombre del Servicio
            </Label>
            <Input 
              id="nombre" 
              type="text" 
              placeholder="Ej: Corte Degradé" 
              className="border-migue/30 focus-visible:ring-[#7A9A75]"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio" className="flex items-center gap-2 text-migue-gris font-bold text-xs uppercase">
                <DollarSign className="w-4 h-4 text-[#7A9A75]" /> Precio
              </Label>
              <Input 
                id="precio" 
                type="number"
                placeholder="Ej: 5000"
                className="border-migue/30 focus-visible:ring-[#7A9A75]"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duracion" className="flex items-center gap-2 text-migue-gris font-bold text-xs uppercase">
                <Scissors className="w-4 h-4 text-[#7A9A75]" /> Duración (min)
              </Label>
              <Input 
                id="duracion" 
                type="number" 
                className="border-migue/30 focus-visible:ring-[#7A9A75]"
                value={formData.duracion}
                onChange={(e) => setFormData({...formData, duracion: Number(e.target.value) || 0})}
              />
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full bg-[#7A9A75] hover:bg-[#688564] text-white font-bold transition-all shadow-md"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Servicio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}