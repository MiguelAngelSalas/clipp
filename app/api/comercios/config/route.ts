import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    // 1. Recibimos los datos que vienen del Modal
    const body = await req.json();
    const { id_comercio, hora_apertura, hora_cierre, duracion_turno_min } = body;

    // Validamos que el ID exista
    if (!id_comercio) {
      return NextResponse.json({ error: "Falta el ID del comercio" }, { status: 400 });
    }

    // 2. Actualizamos en la base de datos usando Prisma
    const actualizado = await prisma.comercios.update({
      where: { 
        id_comercio: Number(id_comercio) 
      },
      data: {
        hora_apertura: hora_apertura,
        hora_cierre: hora_cierre,
        duracion_turno_min: Number(duracion_turno_min)
      }
    });

    // 3. Devolvemos el registro actualizado para que el front se refresque
    return NextResponse.json(actualizado);

  } catch (error: any) {
    console.error("ERROR EN API CONFIG:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la configuración", detalle: error.message }, 
      { status: 500 }
    );
  }
}