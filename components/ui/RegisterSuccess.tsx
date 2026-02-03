import { Button } from "@/components/ui/button"
import { MailCheck } from "lucide-react"

interface RegisterSuccessProps {
    email: string
    onLoginClick: () => void
}

export function RegisterSuccess({ email, onLoginClick }: RegisterSuccessProps) {
    return (
        <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#7A9A75]/10 text-[#7A9A75] w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
               <MailCheck className="w-10 h-10" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-serif font-bold text-[#3A3A3A]">¡Revisá tu email!</h2>
              <p className="text-slate-600">
                Enviamos un link de activación a:<br/>
                <span className="font-bold text-[#7A9A75]">{email}</span>
              </p>
            </div>
            <Button 
              onClick={onLoginClick} 
              className="w-full bg-[#7A9A75] hover:bg-[#688563] text-white font-bold py-7 text-lg shadow-md rounded-xl"
            >
              IR AL LOGIN
            </Button>
        </div>
    )
}