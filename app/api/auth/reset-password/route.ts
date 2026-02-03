import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // 1. Buscamos al usuario por el token y verificamos que no haya expirado
    const usuario = await prisma.comercios.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // El expiry debe ser mayor a "ahora"
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "El link es inválido o ha expirado" },
        { status: 400 }
      );
    }

    // 2. Hasheamos la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Actualizamos el usuario y LIMPIAMOS los campos de reset
    // (Para que el token no se pueda volver a usar)
    await prisma.comercios.update({
      where: { id_comercio: usuario.id_comercio },
      data: {
        contrasena: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error("Error en reset-password API:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}