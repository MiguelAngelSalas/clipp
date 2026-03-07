import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login", // Si no hay sesión, mandalos acá
  },
})

export const config = { 
  matcher: [
    // 🛡️ PROTEGEMOS ESTO:
    "/api/caja/:path*",
    "/api/usuarios/:path*",
    "/api/empleados/:path*",
    "/api/config/:path*",
    // ❌ NO pongas "/" ni "/login" acá, porque si no entrás en un bucle infinito
  ] 
}