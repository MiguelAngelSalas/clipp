"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    
    const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading")
    const [mensaje, setMensaje] = React.useState("Verificando tu cuenta...")

    React.useEffect(() => {
        if (!token) {
            setStatus("error")
            setMensaje("Token de verificación no encontrado.")
            return
        }

        const verificar = async () => {
            try {
                const res = await fetch(`/api/auth/verify?token=${token}`)
                const data = await res.json()

                if (res.ok) {
                    setStatus("success")
                    setMensaje("¡Email verificado con éxito!")
                } else {
                    setStatus("error")
                    setMensaje(data.message || "Error al verificar el email.")
                }
            } catch (error) {
                setStatus("error")
                setMensaje("Error de conexión.")
            }
        }

        verificar()
    }, [token])

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-[#7A9A75] animate-spin" />
                        <h1 className="text-2xl font-serif font-bold text-slate-800">{mensaje}</h1>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                        <h1 className="text-2xl font-serif font-bold text-slate-800">{mensaje}</h1>
                        <p className="text-slate-500">Ya podés empezar a gestionar tus turnos en Clipp.</p>
                        <Button 
                            className="w-full bg-[#7A9A75] hover:bg-[#688563] text-white py-6 text-lg"
                            onClick={() => window.location.href = "/"}
                        >
                            Ir al Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <XCircle className="w-16 h-16 text-red-500" />
                        <h1 className="text-2xl font-serif font-bold text-slate-800">¡Ups! Algo salió mal</h1>
                        <p className="text-slate-500">{mensaje}</p>
                        <Button 
                            variant="outline"
                            className="w-full border-slate-200"
                            onClick={() => window.location.href = "/"}
                        >
                            Volver al inicio
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}