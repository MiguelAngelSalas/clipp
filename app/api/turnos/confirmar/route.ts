import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ajustá la ruta según donde creaste el archivo

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID faltante" }, { status: 400 });

    await prisma.turnos.update({
      where: { id_turno: Number(id) },
      data: { estado: 'confirmado' },
    });

    return NextResponse.json({ message: "Turno confirmado" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error de DB" }, { status: 500 });
  }
}