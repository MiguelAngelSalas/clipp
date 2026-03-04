"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2, Trash2, Users, X, Camera } from "lucide-react"
import { toast } from "sonner"

// ⚙️ CONFIGURACIÓN DE CLOUDINARY
const CLOUD_NAME = "dylr49zlx"
const UPLOAD_PRESET = "clipp_staff" // Asegurate que este sea el nombre exacto de tu preset "Unsigned"

export function RegistrarEmpleadoModal({ open, onOpenChange, servicios = [], idComercio, usuario }: any) {
  const [nombre, setNombre] = React.useState("")
  const [fotoUrl, setFotoUrl] = React.useState("") 
  const [preview, setPreview] = React.useState("") 
  const [archivoFoto, setArchivoFoto] = React.useState<File | null>(null)
  const [serviciosSeleccionados, setServiciosSeleccionados] = React.useState<number[]>([])
  const [cargando, setCargando] = React.useState(false)
  const [listaEmpleados, setListaEmpleados] = React.useState<any[]>([])
  const [editandoId, setEditandoId] = React.useState<number | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const cargarEmpleados = React.useCallback(async () => {
    if (!idComercio) return
    try {
      const res = await fetch(`/api/empleados?id_comercio=${idComercio}`)
      const data = await res.json()
      if (Array.isArray(data)) setListaEmpleados(data)
    } catch (err) { console.error("Error cargando empleados:", err) }
  }, [idComercio])

  React.useEffect(() => {
    if (open) cargarEmpleados()
    else cancelarEdicion()
  }, [open, cargarEmpleados])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArchivoFoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setNombre("")
    setFotoUrl("")
    setPreview("")
    setArchivoFoto(null)
    setServiciosSeleccionados([])
  }

  const prepararEdicion = (emp: any) => {
    setEditandoId(emp.id_empleado)
    setNombre(emp.nombre)
    setFotoUrl(emp.foto_url || "")
    setPreview("") 
    setServiciosSeleccionados(emp.servicios.map((s: any) => s.id_servicio))
  }

  // --- FUNCIÓN DE SUBIDA CON CARPETAS DINÁMICAS ---
  const subirACloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)
    
    // 📁 Carpeta: clipp / [nombre-barberia] / staff
    const carpetaDestino = `clipp/${usuario?.slug || 'comercio_' + idComercio}/staff`
    formData.append("folder", carpetaDestino)
    console.log("Subiendo a Cloudinary con carpeta:", carpetaDestino,usuario, idComercio)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    })
    
    if (!res.ok) {
        const errorData = await res.json()
        console.error("Detalle error Cloudinary:", errorData)
        throw new Error("Error al subir a Cloudinary")
    }
    
    const data = await res.json()
    return data.secure_url 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || cargando) return
    
    setCargando(true)
    let urlFinal = fotoUrl;

    try {
      if (archivoFoto) {
        urlFinal = await subirACloudinary(archivoFoto)
      }

      const res = await fetch("/api/empleados", {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empleado: editandoId,
          nombre,
          foto_url: urlFinal,
          id_comercio: Number(idComercio),
          serviciosIds: serviciosSeleccionados
        })
      })

      if (res.ok) {
        toast.success(editandoId ? "Barbero actualizado" : "Barbero registrado con éxito")
        cancelarEdicion()
        cargarEmpleados()
      }
    } catch (error) {
      console.error(error)
      toast.error("No se pudo procesar la solicitud")
    } finally {
      setCargando(false)
    }
  }

  const eliminarEmpleado = async (id: number) => {
    if (!confirm("¿Seguro que querés eliminar a este barbero?")) return;
    try {
      const res = await fetch(`/api/empleados?id_empleado=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Barbero eliminado");
        if (editandoId === id) cancelarEdicion()
        cargarEmpleados();
      }
    } catch (error) { toast.error("Error al eliminar") }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onOpenAutoFocus={(e) => e.preventDefault()} 
        className="bg-white rounded-3xl max-w-md border-none shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
      >
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-[#3D2B1F] flex items-center gap-2 uppercase italic tracking-tighter">
              <Users className="w-7 h-7 text-[#7A9A75]" /> Staff de Barberos
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 border-b border-gray-100 pb-8">
            <div className="flex flex-col items-center gap-3">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 w-24 rounded-full bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-all relative group"
                >
                    {preview || fotoUrl ? (
                        <img src={preview || fotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                        <Camera className="text-gray-300 w-8 h-8" />
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toca para cambiar foto</span>
            </div>

            <div className="space-y-1">
              <Label className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Nombre Completo</Label>
              <Input 
                placeholder="Ej: Franco Benitez" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-12 border-gray-200 rounded-2xl font-bold text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase text-[10px] text-gray-400 tracking-widest italic">Especialidades</Label>
              <div className="flex flex-wrap gap-2">
                {servicios.map((s: any) => {
                  const isSelected = serviciosSeleccionados.includes(s.id_servicio);
                  return (
                    <button
                      key={s.id_servicio}
                      type="button"
                      onClick={() => setServiciosSeleccionados(prev => isSelected ? prev.filter(x => x !== s.id_servicio) : [...prev, s.id_servicio])}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                          isSelected ? "bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-md" : "bg-white text-gray-400 border-gray-100"
                      }`}
                    >
                      {s.nombre}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit"
                disabled={cargando || !nombre} 
                className={`flex-1 h-14 font-black uppercase rounded-2xl transition-all shadow-lg ${
                  editandoId ? "bg-blue-600 hover:bg-blue-700" : "bg-[#3D2B1F] hover:bg-black"
                } text-white`}
              >
                {cargando ? <Loader2 className="animate-spin" /> : editandoId ? "Actualizar" : "Registrar"}
              </Button>
              {editandoId && (
                <Button type="button" variant="outline" onClick={cancelarEdicion} className="h-14 w-14 rounded-2xl">
                  <X />
                </Button>
              )}
            </div>
          </form>

          <div className="mt-8 space-y-4">
            <Label className="font-black uppercase text-[11px] text-[#3D2B1F] tracking-widest">Lista de Personal</Label>
            <div className="grid grid-cols-1 gap-3">
                {listaEmpleados.map((emp: any) => (
                  <div 
                    key={emp.id_empleado} 
                    onClick={() => prepararEdicion(emp)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      editandoId === emp.id_empleado ? "border-blue-500 bg-blue-50/50" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                        {emp.foto_url ? (
                            <img src={emp.foto_url} alt={emp.nombre} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center font-black text-[#7A9A75] uppercase">{emp.nombre.charAt(0)}</div>
                        )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="font-black text-[#3D2B1F] uppercase text-xs tracking-tight">{emp.nombre}</p>
                        <p className="text-[10px] font-bold text-[#7A9A75] uppercase">{emp.servicios?.length || 0} Servicios</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); eliminarEmpleado(emp.id_empleado); }}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}