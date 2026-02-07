"use client"

import { useState } from "react"
import { Copy, Check, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner" // O la librería de tostadas que uses (o alert)

interface ShareWidgetProps {
  slug: string
  nombreNegocio: string
}

export function ShareWidget({ slug, nombreNegocio }: ShareWidgetProps) {
  const [copiado, setCopiado] = useState(false)
  
  // Armamos la URL completa (detecta si es local o prod)
  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : ''
  
  const linkCompleto = `${origin}/${slug}`

  const copiarLink = () => {
    navigator.clipboard.writeText(linkCompleto)
    setCopiado(true)
    // Si usás Sonner o Toast: toast.success("Link copiado al portapapeles")
    setTimeout(() => setCopiado(false), 2000)
  }

  const compartirWhatsApp = () => {
    const mensaje = `Hola! 👋 Ya podés sacar turno en *${nombreNegocio}* online.\n\nEntrá acá para elegir tu horario: ${linkCompleto}`
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  return (
    <Card className="bg-gradient-to-r from-[#fdfbf7] to-white border-migue/20 shadow-sm mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-migue-gris">
          <Share2 className="h-5 w-5 text-[#7A9A75]" />
          Tu Link de Turnos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* EL INPUT CON EL LINK VISIBLE */}
          <div className="flex-1 relative">
            <Input 
              readOnly 
              value={linkCompleto} 
              className="bg-gray-50 border-migue/20 pr-10 font-mono text-sm text-gray-600"
            />
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-2">
            <Button 
              onClick={copiarLink}
              variant="outline" 
              className="border-migue/20 hover:bg-[#7A9A75]/10 hover:text-[#7A9A75] transition-all"
            >
              {copiado ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiado ? "Copiado" : "Copiar"}
            </Button>

            <Button 
              onClick={compartirWhatsApp}
              className="bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold border-none shadow-md"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          </div>

        </div>
        <p className="text-xs text-gray-400 mt-2">
          Compartí este link en tu Instagram o estados de WhatsApp para que los clientes se agenden solos.
        </p>
      </CardContent>
    </Card>
  )
}