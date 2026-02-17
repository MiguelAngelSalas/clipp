"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, CheckCircle2, Loader2, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function SubscriptionModal({ isOpen, onClose, userEmail, nombreComercio }: any) {
  const [loading, setLoading] = React.useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout-mp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, nombreComercio })
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (e) {
      // Reemplazado por un log para no usar alert si no querés
      console.error("Error MP:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Agregamos bg-white y shadow-2xl para que no se vea transparente */}
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl overflow-hidden">
        <DialogHeader className="flex flex-col items-center pt-6">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="text-[#7A9A75] w-10 h-10" />
          </div>
          <DialogTitle className="text-3xl font-serif text-slate-800">¡Último paso!</DialogTitle>
          <DialogDescription className="text-center text-slate-500 text-base px-2">
            Activá tus **15 días de prueba gratis** para empezar a organizar tu agenda. 
            No se te cobrará nada hoy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 px-2">
          {/* Fondo beige clarito para la lista de beneficios */}
          <div className="bg-[#FDFBF7] p-5 rounded-xl border border-[#7A9A75]/10">
            <ul className="text-sm space-y-3 text-slate-600 font-medium">
              <li className="flex items-center gap-3">
                <span className="text-[#7A9A75]">✓</span> Agenda ilimitada por 15 días
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#7A9A75]">✓</span> Notificaciones por WhatsApp
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#7A9A75]">✓</span> Soporte técnico prioritario
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleStartTrial} 
              disabled={loading}
              className="w-full h-16 bg-[#7A9A75] hover:bg-[#688564] text-white font-bold text-xl shadow-lg shadow-green-900/10 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                "Probar 15 días gratis"
              )}
            </Button>
            
            <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              <Lock className="w-3 h-3" /> 
              Pago seguro vía Mercado Pago
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}