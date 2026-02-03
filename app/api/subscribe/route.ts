import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ajustá la ruta a tu instancia de prisma

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Buscamos el comercio por email y activamos la suscripción
    const comercioActualizado = await prisma.comercios.update({
      where: { email_unico: email },
      data: { suscrito: true },
    });

    return NextResponse.json({ 
      success: true, 
      id: comercioActualizado.id_comercio,
      suscrito: comercioActualizado.suscrito 
    });
  } catch (error) {
    console.error("Error en suscripción:", error);
    return NextResponse.json({ error: "Error al activar cuenta" }, { status: 500 });
  }
}