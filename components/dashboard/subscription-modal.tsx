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
      alert("Error al conectar con Mercado Pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="text-[#7A9A75] w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-serif">¡Último paso!</DialogTitle>
          <DialogDescription className="text-center">
            Para empezar a agendar turnos, activá tu **semana de prueba gratis**. 
            No se te cobrará nada hoy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-[#FDFBF7] p-4 rounded-lg border border-[#7A9A75]/20">
            <ul className="text-sm space-y-2 text-gray-600">
              <li className="flex items-center gap-2">✅ Agenda ilimitada por 7 días</li>
              <li className="flex items-center gap-2">✅ Recordatorios por WhatsApp</li>
              <li className="flex items-center gap-2">✅ Cancelá cuando quieras</li>
            </ul>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center">
            <Lock className="w-3 h-3" /> Procesado de forma segura por Mercado Pago
          </div>

          <Button 
            onClick={handleStartTrial} 
            disabled={loading}
            className="w-full h-14 bg-[#7A9A75] hover:bg-[#688564] text-white font-bold text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Vincular tarjeta y empezar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}