import { useState } from "react"

export function useRegisterLogic(onRegisterSubmit: (datos: any) => Promise<boolean | string>) {
    // Estado del Formulario
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        telefono: "", // 👈 1. Agregado para el aviso al barbero
        password: "",
        confirmPassword: ""
    })

    // Estados de UI
    const [isRegistered, setIsRegistered] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [shake, setShake] = useState(false)

    // Helpers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setError(null)
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const triggerShake = () => {
        setShake(true)
        setTimeout(() => setShake(false), 500)
    }

    // Validaciones Computadas
    const passwordsMatch = formData.password === formData.confirmPassword
    
    // 2. Actualizamos canSubmit para incluir el teléfono
    const canSubmit = 
        formData.nombre && 
        formData.email && 
        formData.telefono && 
        formData.password && 
        passwordsMatch && 
        !loading

    // Acción Principal
    const handleSubmit = async () => {
        setError(null)

        // 3. Validación de campos obligatorios incluyendo teléfono
        if (!formData.nombre || !formData.email || !formData.telefono || !formData.password) {
            setError("Por favor completá todos los campos")
            triggerShake()
            return
        }
        
        if (!passwordsMatch) {
            setError("Las contraseñas no coinciden")
            triggerShake()
            return
        }
        
        setLoading(true)
        
        // Sacamos confirmPassword antes de enviar, el resto (incluyendo telefono) va al backend
        const { confirmPassword, ...datosAEnviar } = formData
        
        try {
            const result = await onRegisterSubmit(datosAEnviar)
            
            if (result === true) {
                setIsRegistered(true)
            } else if (typeof result === "string") {
                setError(result)
                triggerShake()
            }
        } catch (err) {
            setError("Error de conexión. Intentá nuevamente.")
            triggerShake()
        } finally {
            setLoading(false)
        }
    }

    return {
        formData, handleChange,
        loading, error, setError,
        shake, isRegistered,
        passwordsMatch, canSubmit,
        handleSubmit
    }
}