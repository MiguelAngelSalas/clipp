import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function LoginSuccess({ onBack }: { onBack: () => void }) {
    return (
        <div className="bg-white/80 backdrop-blur-sm border border-migue/20 shadow-xl rounded-2xl p-8 w-full max-w-md text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-[#3A3A3A]">¡Mail enviado!</h2>
                <p className="text-migue-gris">Revisá tu bandeja de entrada. Te enviamos las instrucciones.</p>
            </div>
            <Button 
                onClick={onBack}
                className="w-full bg-[#7A9A75] hover:bg-[#688563] text-white font-bold py-6 rounded-xl"
            >
                VOLVER AL LOGIN
            </Button>
        </div>
    )
}