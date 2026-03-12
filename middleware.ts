import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const authMiddleware = withAuth({
  pages: { signIn: "/login" },
})

export default function middleware(req: any, event: any) {
  const pathname = req.nextUrl.pathname;

  // 🔓 LAS EXCEPCIONES MÁGICAS:
  // Dejamos pasar la ruta de usuarios públicos Y la de empleados
  if (
    pathname.includes('/publico') || 
    pathname.startsWith('/api/empleados') // 👈 ACÁ ESTÁ LA LLAVE PARA LOS BARBEROS
  ) {
    return NextResponse.next()
  }

  // Si no es ninguna de las anteriores, le tiramos el perro guardián de NextAuth
  return (authMiddleware as any)(req, event)
}

export const config = { 
  matcher: [
    "/api/caja/:path*",
    "/api/usuarios/:path*", 
    "/api/empleados/:path*",
    "/api/config/:path*",
  ] 
}