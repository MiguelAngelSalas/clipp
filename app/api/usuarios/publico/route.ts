import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idComercio = searchParams.get("id_comercio");

    if (!idComercio) {
      return NextResponse.json({ error: "ID de comercio requerido" }, { status: 400 });
    }

    // Buscamos los datos de la barbería
    const comercio = await prisma.comercios.findUnique({
      where: { 
        id_comercio: Number(idComercio) 
      },
      select: {
        nombre_empresa: true,
        hora_apertura: true,
        hora_cierre: true,
        duracion_turno_min: true,
        // Agregá acá otros campos públicos si querés (dirección, logo, etc)
      }
    });

    if (!comercio) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    return NextResponse.json(comercio);

  } catch (error: any) {
    console.error("ERROR AL OBTENER PERFIL PÚBLICO:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}