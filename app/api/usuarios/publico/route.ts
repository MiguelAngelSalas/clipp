import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Buscamos ambos parámetros
    const idComercio = searchParams.get("id_comercio");
    const slug = searchParams.get("slug");

    // 2. Si no mandaron ninguno, error
    if (!idComercio && !slug) {
      return NextResponse.json({ error: "ID de comercio o Slug requerido" }, { status: 400 });
    }

    let comercio;

    // 3. Estrategia de búsqueda
    if (slug) {
      // Opción A: Buscar por SLUG (Lo nuevo)
      comercio = await prisma.comercios.findUnique({
        where: { slug: slug },
        select: {
          id_comercio: true, // Necesitamos el ID para guardar el turno después
          nombre_empresa: true,
          hora_apertura: true,
          hora_cierre: true,
          duracion_turno_min: true,
          slug: true,
        }
      });
    } else if (idComercio) {
      // Opción B: Buscar por ID (Lo viejo, por si acaso)
      comercio = await prisma.comercios.findUnique({
        where: { 
          id_comercio: Number(idComercio) 
        },
        select: {
          id_comercio: true,
          nombre_empresa: true,
          hora_apertura: true,
          hora_cierre: true,
          duracion_turno_min: true,
          slug: true,
        }
      });
    }

    if (!comercio) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    return NextResponse.json(comercio);

  } catch (error: any) {
    console.error("ERROR AL OBTENER PERFIL PÚBLICO:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}