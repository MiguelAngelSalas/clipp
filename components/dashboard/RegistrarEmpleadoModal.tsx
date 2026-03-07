"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Trash2, Users, Camera, CheckCircle2, X } from "lucide-react"
import { toast } from "sonner"

const CLOUD_NAME = "dylr49zlx"
const UPLOAD_PRESET = "clipp_staff" 

export function RegistrarEmpleadoModal({ open, onOpenChange, servicios = [], idComercio, usuario }: any) {
  const [nombre, setNombre] = React.useState("")
  const [fotoUrl, setFotoUrl] = React.useState("") 
  const [preview, setPreview] = React.useState("") 
  const [subiendoFoto, setSubiendoFoto] = React.useState(false)
  const [serviciosSeleccionados, setServiciosSeleccionados] = React.useState<number[]>([])
  const [cargando, setCargando] = React.useState(false)
  const [listaEmpleados, setListaEmpleados] = React.useState<any[]>([])
  const [editandoId, setEditandoId] = React.useState<number | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const cargarEmpleados = React.useCallback(async () => {
    if (!idComercio) return
    try {
      const res = await fetch(`/api/empleados?id_comercio=${idComercio}`)
      const data = await res.json()
      if (Array.isArray(data)) setListaEmpleados(data)
    } catch (err) { console.error(err) }
  }, [idComercio])

  React.useEffect(() => {
    if (open) cargarEmpleados()
    else cancelarEdicion()
  }, [open, cargarEmpleados])

  const comprimirImagen = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.6);
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setSubiendoFoto(true)

    try {
      const optimizada = await comprimirImagen(file);
      const formData = new FormData()
      formData.append("file", optimizada)
      formData.append("upload_preset", UPLOAD_PRESET)
      formData.append("folder", `clipp/${usuario?.slug || idComercio}/staff`)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      setFotoUrl(data.secure_url)
      toast.success("Foto lista")
    } catch (err) {
      toast.error("Error al subir foto")
      setPreview("")
    } finally {
      setSubiendoFoto(false)
      if (e.target) e.target.value = "" 
    }
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setNombre("")
    setFotoUrl("")
    setPreview("")
    setServiciosSeleccionados([])
  }

  const prepararEdicion = (emp: any) => {
    setEditandoId(emp.id_empleado)
    setNombre(emp.nombre)
    setFotoUrl(emp.foto_url || "")
    setPreview("")
    setServiciosSeleccionados(emp.servicios?.map((s: any) => s.id_servicio) || [])
    
    // Scrolleo suave hacia arriba para editar
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const eliminarEmpleado = async (id: number) => {
    if (!confirm("¿Eliminar barbero?")) return
    try {
      const res = await fetch(`/api/empleados?id_empleado=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Eliminado")
        if (editandoId === id) cancelarEdicion()
        cargarEmpleados()
      } else {
        const txt = await res.text()
        alert("Error: " + txt)
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || cargando || subiendoFoto) return
    
    setCargando(true)
    try {
      const res = await fetch("/api/empleados", {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empleado: editandoId,
          nombre,
          foto_url: fotoUrl, 
          id_comercio: Number(idComercio),
          serviciosIds: serviciosSeleccionados
        })
      })

      if (res.ok) {
        toast.success(editandoId ? "Actualizado" : "Registrado")
        cancelarEdicion()
        cargarEmpleados()
      }
    } catch (error) {
      toast.error("Error al guardar")
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-3xl max-w-md border-none shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div ref={scrollRef} className="p-8 overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-black text-[#3D2B1F] flex items-center gap-2 uppercase tracking-tighter">
                <Users className="w-7 h-7 text-[#7A9A75]" /> Staff
              </DialogTitle>
              
              {/* BOTÓN DINÁMICO PARA VOLVER A MODO REGISTRO */}
              {editandoId && (
                <button 
                  onClick={cancelarEdicion}
                  className="text-[10px] font-black text-[#7A9A75] border-2 border-[#7A9A75] px-3 py-1 rounded-full hover:bg-[#7A9A75] hover:text-white transition-all uppercase tracking-widest"
                >
                  + Nuevo
                </button>
              )}
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 border-b border-gray-100 pb-8">
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => !subiendoFoto && fileInputRef.current?.click()}
                className={`h-24 w-24 rounded-full bg-gray-50 border-4 ${editandoId ? 'border-[#7A9A75]' : 'border-white'} shadow-xl flex items-center justify-center overflow-hidden cursor-pointer relative group transition-all`}
              >
                {preview || fotoUrl ? (
                  <>
                    <img src={preview || fotoUrl} alt="Avatar" className={`h-full w-full object-cover ${subiendoFoto ? 'opacity-40' : ''}`} />
                    {subiendoFoto && <Loader2 className="absolute animate-spin text-[#3D2B1F]" />}
                    {!subiendoFoto && fotoUrl && <CheckCircle2 className="absolute bottom-1 right-1 text-green-500 bg-white rounded-full w-5 h-5" />}
                  </>
                ) : (
                  <Camera className="text-gray-300 w-8 h-8" />
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {subiendoFoto ? "Subiendo..." : editandoId ? "Cambiar foto" : "Toca la foto"}
              </span>
            </div>

            <div className="space-y-1">
              <Label className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Nombre</Label>
              <Input 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-12 border-gray-200 rounded-2xl font-bold focus:ring-[#7A9A75]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Servicios</Label>
              <div className="flex flex-wrap gap-2">
                {servicios.map((s: any) => {
                  const isSelected = serviciosSeleccionados.includes(s.id_servicio)
                  return (
                    <button
                      key={s.id_servicio}
                      type="button"
                      onClick={() => setServiciosSeleccionados(prev => isSelected ? prev.filter(x => x !== s.id_servicio) : [...prev, s.id_servicio])}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${
                        isSelected ? "bg-[#3D2B1F] text-white border-[#3D2B1F]" : "bg-white text-gray-400 border-gray-100"
                      }`}
                    >
                      {s.nombre}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit"
                disabled={cargando || !nombre || subiendoFoto} 
                className={`flex-1 h-14 font-black uppercase rounded-2xl text-white shadow-lg transition-all ${editandoId ? 'bg-[#7A9A75] hover:bg-[#688563]' : 'bg-[#3D2B1F] hover:bg-black'}`}
              >
                {cargando ? <Loader2 className="animate-spin" /> : editandoId ? "Guardar Cambios" : "Registrar"}
              </Button>
              
              {editandoId && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={cancelarEdicion}
                  className="h-14 w-14 rounded-2xl border-gray-200 text-gray-400 hover:text-red-500"
                >
                  <X className="w-6 h-6" />
                </Button>
              )}
            </div>
          </form>

          <div className="mt-8 space-y-4">
            <p className="font-black uppercase text-[10px] text-gray-400 tracking-widest px-1">Equipo actual</p>
            {listaEmpleados.map((emp: any) => (
              <div 
                key={emp.id_empleado} 
                className={`flex items-center gap-4 p-4 rounded-2xl border bg-white shadow-sm cursor-pointer transition-all ${editandoId === emp.id_empleado ? 'border-[#7A9A75] bg-[#7A9A75]/5' : 'border-gray-100 hover:border-gray-200'}`}
                onClick={() => prepararEdicion(emp)}
              >
                <img src={emp.foto_url || "/api/placeholder/100/100"} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <p className="font-black text-[#3D2B1F] uppercase text-xs flex-1">{emp.nombre}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-red-50"
                  onClick={(e: React.MouseEvent) => { 
                    e.stopPropagation()
                    eliminarEmpleado(emp.id_empleado)
                  }}
                >
                  <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500 transition-colors" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}