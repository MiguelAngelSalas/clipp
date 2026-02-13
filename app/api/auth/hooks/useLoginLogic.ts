import { useState } from "react"

type LoginMode = 'login' | 'recovery'

export function useLoginLogic(onLoginSuccess: () => void) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mode, setMode] = useState<LoginMode>('login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [shake, setShake] = useState(false)
    const [resetSent, setResetSent] = useState(false)

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

            if (res.ok) {
                const usuarioAGuardar = data.user || data 
                localStorage.setItem("usuario_clipp", JSON.stringify(usuarioAGuardar))
                setTimeout(() => {
                    onLoginSuccess() 
                }, 100)
            } else {
                setError(res.status === 401 ? "Email o contraseña incorrectos" : (data.message || "Error al iniciar sesión"))
                triggerShake()
            }
        } catch (error) {
            setError("Error de conexión.")
            triggerShake()
        } finally {
            setLoading(false)
        }
    }

    // --- ACCIÓN 2: RECUPERAR CLAVE ---
    const handleResetPassword = async () => {
        setError(null) // 👈 Limpiamos errores previos antes de empezar
        if (!email) {
            setError("Ingresá tu email para continuar")
            triggerShake()
            return
        }
        
        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json() // 👈 Movido arriba para usarlo en ambos casos

            if (res.ok) {
                setResetSent(true)
            } else {
                // 🔴 ACÁ RECIBE EL 404 DE "NO ENCONTRAMOS NINGUNA CUENTA"
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
        email, setEmail,
        password, setPassword,
        mode, setMode,
        loading, error, shake, resetSent, setResetSent,
        handleSubmit: mode === 'login' ? handleLogin : handleResetPassword,
        setError
    }
}