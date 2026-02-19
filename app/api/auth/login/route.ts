import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const usuario = await prisma.comercios.findUnique({
      where: { email_unico: email },
    });

    if (!usuario) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.contrasena);

    if (!passwordCorrecta) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    // --- 🛡️ EL PATOVICA: CHEQUEO DE VERIFICACIÓN ---
    if (!usuario.emailVerificado) {
      return NextResponse.json(
        { message: "Tu cuenta aún no ha sido verificada. Por favor, revisá tu email." },
        { status: 403 } // 403 es "Prohibido hasta que cumplas la condición"
      );
    }

    // 5. SI TODO OK
    return NextResponse.json({
      message: "Login exitoso",
      user: {
        id: usuario.id_comercio,
        nombre: usuario.nombre_empresa,
        email: usuario.email_unico,
        emailVerificado: usuario.emailVerificado,
        suscrito: usuario.suscrito, // 🔥 ¡FALTABA ESTE CAMPEÓN!
        slug: usuario.nombre_empresa.toLowerCase().replace(/\s+/g, '-')
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}