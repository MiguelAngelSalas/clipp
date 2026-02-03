"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Scissors, Save, Loader2 } from "lucide-react"

export function ConfigModal({ open, onOpenChange, usuario, onUpdate }: any) {
  const [loading, setLoading] = React.useState(false)
  
  // 1. Estado inicial del formulario
  const [formData, setFormData] = React.useState({
    hora_apertura: "09:00",
    hora_cierre: "20:00",
    duracion_turno_min: 30
  })

  // 2. Sincronizamos los datos cuando el modal se abre o el usuario cambia
  React.useEffect(() => {
    if (open && usuario) {
      setFormData({
        hora_apertura: usuario.hora_apertura || "09:00",
        hora_cierre: usuario.hora_cierre || "20:00",
        duracion_turno_min: usuario.duracion_turno_min || 30
      })
    }
  }, [usuario, open])

  const handleSave = async () => {
    // 3. CAPTURA DE ID SEGURA: Probamos todas las variantes de nombre de campo
    const idFinal = usuario?.id_comercio || usuario?.id;

    if (!idFinal) {
      alert("Error: No se pudo encontrar el ID del comercio.");
      console.error("Usuario sin ID:", usuario);
      return;
    }

    setLoading(true)
    try {
      const res = await fetch('/api/comercios/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_comercio: idFinal, 
          ...formData 
        })
      })

      if (res.ok) {
        const data = await res.json()
        // Le pasamos los nuevos datos al estado global de la app
        onUpdate(data) 
        onOpenChange(false)
      } else {
        const errorData = await res.json()
        alert("Error al guardar: " + (errorData.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error en fetch config:", error)
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
            <Clock className="w-6 h-6 text-[#7A9A75]" /> Ajustes del Negocio
          </DialogTitle>
          <DialogDescription className="text-migue-gris/70">
            Configurá tu jornada laboral para que el calendario calcule tu disponibilidad automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apertura" className="text-migue-gris font-bold text-xs uppercase">Hora Apertura</Label>
              <Input 
                id="apertura" 
                type="time" 
                className="border-migue/30 focus-visible:ring-[#7A9A75]"
                value={formData.hora_apertura}
                onChange={(e) => setFormData({...formData, hora_apertura: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cierre" className="text-migue-gris font-bold text-xs uppercase">Hora Cierre</Label>
              <Input 
                id="cierre" 
                type="time" 
                className="border-migue/30 focus-visible:ring-[#7A9A75]"
                value={formData.hora_cierre}
                onChange={(e) => setFormData({...formData, hora_cierre: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracion" className="flex items-center gap-2 text-migue-gris font-bold text-xs uppercase">
              <Scissors className="w-4 h-4 text-[#7A9A75]" /> Duración de Turno (minutos)
            </Label>
            <Input 
              id="duracion" 
              type="number" 
              placeholder="Ej: 30" 
              className="border-migue/30 focus-visible:ring-[#7A9A75]"
              value={formData.duracion_turno_min}
              onChange={(e) => setFormData({...formData, duracion_turno_min: parseInt(e.target.value) || 0})}
            />
            <p className="text-[10px] text-migue-gris/50 italic">
              Este tiempo se usará para calcular cuántos turnos entran en tu día.
            </p>
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
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}