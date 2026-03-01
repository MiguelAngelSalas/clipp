"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MessageCircle, Lock, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function SubscriptionModal({ isOpen, onClose, userEmail, nombreComercio }: any) {
  
  const handleWhatsAppContact = () => {
    // Tu número de WhatsApp (con código de país, ej: 54911...)
    const suNumero = "5491166800053" 
    const mensaje = `Hola! Soy de ${nombreComercio} (${userEmail}). Me gustaría activar mis 15 días de prueba gratis en Clipp 🌿.`
    const url = `https://wa.me/${suNumero}?text=${encodeURIComponent(mensaje)}`
    
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl overflow-hidden rounded-[2rem]">
        <DialogHeader className="flex flex-col items-center pt-8">
          <div className="w-20 h-20 bg-[#7A9A75]/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-[#7A9A75] w-12 h-12" />
          </div>
          <DialogTitle className="text-3xl font-serif text-slate-800 text-center px-4">
            ¡Potenciá tu Barbería!
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 text-base px-6 mt-2">
            Comunicate con nuestro equipo para activar tu **prueba gratuita de 15 días** y configurar tu agenda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6 px-4">
          {/* Beneficios con estilo Clipp */}
          <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#7A9A75]/10">
            <ul className="text-sm space-y-4 text-slate-600 font-medium">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-[#7A9A75] w-5 h-5 mt-0.5" />
                <span>Uso ilimitado de la agenda por 15 días.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-[#7A9A75] w-5 h-5 mt-0.5" />
                <span>Link de reserva personalizado para tus clientes.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-[#7A9A75] w-5 h-5 mt-0.5" />
                <span>Asistencia personalizada en la configuración.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleWhatsAppContact} 
              className="w-full h-16 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xl shadow-lg transition-all active:scale-[0.98] rounded-2xl"
            >
              <MessageCircle className="mr-2 h-6 w-6" />
              Hablar con Soporte
            </Button>
            
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
              Activación inmediata vía WhatsApp
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}