"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setStatus("error")
      setMessage("Las contraseñas no coinciden")
      return
    }

    setStatus("loading")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
      } else {
        setStatus("error")
        setMessage(data.message || "El link expiró o es inválido")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error de conexión")
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-migue-beige flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <CheckCircle2 className="w-16 h-16 text-[#7A9A75] mx-auto" />
          <h1 className="text-2xl font-bold font-serif">¡Contraseña cambiada!</h1>
          <p className="text-gray-600">Tu clave se actualizó correctamente. Ya podés iniciar sesión.</p>
          <Button onClick={() => router.push("/")} className="w-full bg-[#7A9A75]">
            Ir al Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-migue-beige flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-serif">Nueva Contraseña</h1>
          <p className="text-sm text-gray-500">Elegí una clave que no olvides fácilmente.</p>
        </div>

        {status === "error" && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle size={16} /> {message}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-migue/20 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Repetir Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white border-migue/20 h-12"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={status === "loading" || !token} 
          className="w-full bg-[#7A9A75] hover:bg-[#688563] py-7 text-lg font-bold"
        >
          {status === "loading" ? <Loader2 className="animate-spin" /> : "ACTUALIZAR CONTRASEÑA"}
        </Button>
      </form>
    </div>
  )
}