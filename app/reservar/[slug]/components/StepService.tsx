"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Scissors, ChevronLeft, Check } from "lucide-react"

interface StepServiceProps {
  servicios: any[]
  selectedServicio: any | null
  onSelect: (servicio: any) => void
  onBack: () => void
}

export function StepService({ servicios, selectedServicio, onSelect, onBack }: StepServiceProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        {servicios.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Scissors className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No hay servicios disponibles.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {servicios.map((srv) => {
              const isSelected = selectedServicio?.id_servicio === srv.id_servicio
              
              return (
                <button
                  key={srv.id_servicio}
                  onClick={() => onSelect(srv)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left group ${
                    isSelected 
                      ? "border-[#7A9A75] bg-[#7A9A75]/5 shadow-md" 
                      : "border-gray-100 bg-white hover:border-[#7A9A75]/30 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? "bg-[#7A9A75] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-[#7A9A75]/10"
                    }`}>
                      {isSelected ? <Check className="w-5 h-5" /> : <Scissors className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#3A3A3A] text-lg leading-tight">
                        {srv.nombre}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">Barbería Profesional</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xl font-serif font-bold ${
                      isSelected ? "text-[#7A9A75]" : "text-[#3A3A3A]"
                    }`}>
                      ${Number(srv.precio).toLocaleString('es-AR')}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="w-full text-gray-400 hover:text-[#3A3A3A] font-medium"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver al calendario
        </Button>
      </div>
    </div>
  )
}