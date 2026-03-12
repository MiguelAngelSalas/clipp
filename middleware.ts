import { withAuth } from "next-auth/middleware"

// 1. Guardamos la configuración de NextAuth en una constante afuera
const authMiddleware = withAuth({
  pages: {
    signIn: "/login", // Si no hay sesión, mandalos acá
  },
})

// 2. Exportamos una función explícita (esto es lo que Turbopack te pide a gritos)
export default function middleware(req: any, event: any) {
  return (authMiddleware as any)(req, event)
}

// 3. Tu configuración de rutas queda exactamente igual
export const config = { 
  matcher: [
    "/api/caja/:path*",
    // Acordate de cómo lo dejamos antes para no bloquear al cliente final:
    // "/api/usuarios/:path*", (comentado o modificado según lo que elegiste)
    "/api/empleados/:path*",
    "/api/config/:path*",
  ] 
}