import { useState } from "react"

type LoginMode = 'login' | 'recovery'

export function useLoginLogic(onLoginSuccess: () => void) {
    // Datos
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    
    // Estados de UI
    const [mode, setMode] = useState<LoginMode>('login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [shake, setShake] = useState(false)
    const [resetSent, setResetSent] = useState(false)

    // Helper de Animación
    const triggerShake = () => {
        setShake(true)
        setTimeout(() => setShake(false), 500)
    }

    // --- ACCIÓN 1: LOGIN ---
    const handleLogin = async () => {
        setError(null)
        if (!email || !password) {
            setError("Por favor completá todos los campos")
            triggerShake()
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            
            const data = await res.json()
            console.log("🔍 RESPUESTA API LOGIN:", data) // <--- ESTO ES ORO

            if (res.ok) {
                // 👇 ACÁ ESTABA EL ERROR POTENCIAL
                // Si la API devuelve { user: {...} }, usamos data.user.
                // Si la API devuelve el objeto directo {...}, usamos data.
                const usuarioAGuardar = data.user || data 

                // Guardamos
                localStorage.setItem("usuario_clipp", JSON.stringify(usuarioAGuardar))
                
                // Un pequeño delay para asegurar que se guardó antes de redirigir
                setTimeout(() => {
                    onLoginSuccess() 
                }, 100)
                
            } else {
                setError(res.status === 401 ? "Email o contraseña incorrectos" : data.message)
                triggerShake()
            }
        } catch (error) {
            console.error(error)
            setError("Error de conexión.")
            triggerShake()
        } finally {
            setLoading(false)
        }
    }

    // --- ACCIÓN 2: RECUPERAR CLAVE ---
    const handleResetPassword = async () => {
        if (!email) {
            setError("Ingresá tu email para continuar")
            triggerShake()
            return
        }
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (res.ok) {
                setResetSent(true)
            } else {
                const data = await res.json()
                setError(data.message || "No pudimos procesar la solicitud")
                triggerShake()
            }
        } catch (err) {
            setError("Error de conexión.")
            triggerShake()
        } finally {
            setLoading(false)
        }
    }

    return {
        // Valores
        email, setEmail,
        password, setPassword,
        mode, setMode,
        loading, error, shake, resetSent, setResetSent,
        // Acciones
        handleSubmit: mode === 'login' ? handleLogin : handleResetPassword,
        setError
    }
}