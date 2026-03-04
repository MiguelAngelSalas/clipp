"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Trash2, Users, X, Camera } from "lucide-react"
import { toast } from "sonner"

const CLOUD_NAME = "dylr49zlx"
const UPLOAD_PRESET = "clipp_staff" 

export function RegistrarEmpleadoModal({ open, onOpenChange, servicios = [], idComercio, usuario }: any) {
  const [nombre, setNombre] = React.useState("")
  const [fotoUrl, setFotoUrl] = React.useState("") 
  const [preview, setPreview] = React.useState("") 
  const [archivoFoto, setArchivoFoto] = React.useState<File | null>(null)
  const [backupBase64, setBackupBase64] = React.useState<string | null>(null)
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
    } catch (err) { console.error(err) }
  }, [idComercio])

  React.useEffect(() => {
    if (open) cargarEmpleados()
    else cancelarEdicion()
  }, [open, cargarEmpleados])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArchivoFoto(file)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setBackupBase64(base64);
        // 💾 Guardamos en disco por si el celu reinicia la pestaña
        localStorage.setItem("clipp_foto_temp", base64);
      };
      reader.readAsDataURL(file);
      e.target.value = "" 
    }
  }

  const cancelarEdicion = () => {
    setEditandoId(null); setNombre(""); setFotoUrl(""); setPreview(""); setArchivoFoto(null); setBackupBase64(null); setServiciosSeleccionados([])
    localStorage.removeItem("clipp_foto_temp");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const prepararEdicion = (emp: any) => {
    setEditandoId(emp.id_empleado); setNombre(emp.nombre); setFotoUrl(emp.foto_url || ""); setPreview(""); setServiciosSeleccionados(emp.servicios.map((s: any) => s.id_servicio))
  }

  const comprimirImagen = (file: File | Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.7);
        };
      };
    });
  };

  const subirACloudinary = async (file: File | Blob) => {
    alert("3. Empezando fetch a Cloudinary...");
    const formData = new FormData()
    const archivoOptimizado = await comprimirImagen(file);
    formData.append("file", archivoOptimizado)
    formData.append("upload_preset", UPLOAD_PRESET)
    const carpetaDestino = `clipp/${usuario?.slug || 'comercio_' + idComercio}/staff`
    formData.append("folder", carpetaDestino)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    })
    if (!res.ok) {
      const errTxt = await res.text();
      alert("Error Cloudinary: " + errTxt);
      throw new Error("Error en Cloudinary")
    }
    const data = await res.json()
    alert("4. Cloudinary OK. URL: " + data.secure_url);
    return data.secure_url 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || cargando) return
    
    setCargando(true)
    let urlFinal = fotoUrl;

    try {
      let archivoParaSubir: File | Blob | null = archivoFoto;

      // 🕵️ ESTRATEGIA DE RESCATE (Estado de React)
      if (!archivoParaSubir && backupBase64) {
        alert("1. Rescatando imagen desde Backup Base64 (Estado)...");
        const resBackup = await fetch(backupBase64);
        archivoParaSubir = await resBackup.blob();
        alert("2. Imagen rescatada con éxito!");
      } 
      // 🕵️ ESTRATEGIA DE RESCATE (LocalStorage por si se reinició la pestaña)
      else if (!archivoParaSubir) {
        const fotoStorage = localStorage.getItem("clipp_foto_temp");
        if (fotoStorage) {
          alert("1. Rescatando desde LocalStorage (el celu reinició la pestaña)...");
          const resBackup = await fetch(fotoStorage);
          archivoParaSubir = await resBackup.blob();
          alert("2. Imagen rescatada desde Storage!");
        }
      }

      if (archivoParaSubir) {
        urlFinal = await subirACloudinary(archivoParaSubir)
      } else {
        alert("Aviso: No hay archivo ni backups encontrados. Se guarda sin foto.");
      }

      alert("5. Mandando datos a la base de datos...");
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
        alert("6. ¡ÉXITO! Barbero guardado.");
        localStorage.removeItem("clipp_foto_temp"); // Limpiamos al terminar
        toast.success("Listo")
        cancelarEdicion()
        cargarEmpleados()
      } else {
        const apiErr = await res.text();
        alert("Error API Clipp: " + apiErr);
      }
    } catch (error: any) {
      alert("Error crítico: " + error.message);
    } finally {
      setCargando(false)
    }
  }

  const eliminarEmpleado = async (id: number) => {
    if (!confirm("¿Eliminar?")) return;
    try {
      const res = await fetch(`/api/empleados?id_empleado=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Eliminado"); cargarEmpleados(); }
    } catch (error) { toast.error("Error") }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-3xl max-w-md border-none shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-[#3D2B1F] flex items-center gap-2 uppercase tracking-tighter">
              <Users className="w-7 h-7 text-[#7A9A75]" /> Staff
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 border-b border-gray-100 pb-8">
            <div className="flex flex-col items-center gap-3">
                <label className="h-24 w-24 rounded-full bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden cursor-pointer relative active:scale-95 transition-all">
                    {preview || fotoUrl ? (
                        <img src={preview || fotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                        <Camera className="text-gray-300 w-8 h-8" />
                    )}
                    <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                </label>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Toca para cambiar foto</span>
            </div>

            <div className="space-y-1">
              <Label className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Nombre</Label>
              <Input 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-12 border-gray-200 rounded-2xl font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Servicios</Label>
              <div className="flex flex-wrap gap-2">
                {servicios.map((s: any) => {
                  const isSelected = serviciosSeleccionados.includes(s.id_servicio);
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
                  );
                })}
              </div>
            </div>

            <Button 
              type="submit"
              disabled={cargando || !nombre} 
              className="w-full h-14 font-black uppercase rounded-2xl bg-[#3D2B1F] hover:bg-black text-white"
            >
              {cargando ? <Loader2 className="animate-spin" /> : editandoId ? "Actualizar" : "Registrar"}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            {listaEmpleados.map((emp: any) => (
              <div 
                key={emp.id_empleado} 
                className="flex items-center gap-4 p-4 rounded-2xl border bg-white border-gray-100 shadow-sm cursor-pointer"
                onClick={() => prepararEdicion(emp)}
              >
                <img src={emp.foto_url || "/api/placeholder/100/100"} className="h-12 w-12 rounded-full object-cover" />
                <div className="flex-1 flex items-center justify-between">
                  <p className="font-black text-[#3D2B1F] uppercase text-xs">{emp.nombre}</p>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); eliminarEmpleado(emp.id_empleado); }}>
                    <Trash2 className="w-4 h-4 text-gray-300" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}