import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_comercio = searchParams.get("id_comercio");
  const fechaParam = searchParams.get("fecha"); 

  if (!id_comercio) {
    return NextResponse.json({ message: "Falta ID comercio" }, { status: 400 });
  }

  try {
    const baseDate = fechaParam ? new Date(`${fechaParam}T00:00:00`) : new Date();
    // Si no hay fechaParam, restamos 3 horas para ajustar a Argentina
    if (!fechaParam) baseDate.setHours(baseDate.getHours() - 3);

    const inicioDia = new Date(baseDate);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(baseDate);
    finDia.setHours(23, 59, 59, 999);

    const movimientos = await prisma.movimientos_caja.findMany({
      where: {
        id_comercio: Number(id_comercio),
        tipo: "INGRESO",
        fecha: {
          gte: inicioDia,
          lte: finDia
        }
      },
      orderBy: { fecha: 'asc' } // Cambiado a ASC para que el resumen siga el orden del día
    });

    return NextResponse.json(movimientos);

  } catch (error) {
    console.error("Error en GET /api/caja:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // IMPORTANTE: Ponemos logs para ver qué llega desde el frontend
    console.log("DEBUG: Body recibido:", body);

    const { monto, descripcion, metodo, id_comercio } = body;

    // Validación de seguridad para que Prisma no explote
    if (!monto || !id_comercio) {
        return NextResponse.json({ message: "Monto e ID Comercio son obligatorios" }, { status: 400 });
    }

    const fechaArgentina = new Date();
    fechaArgentina.setHours(fechaArgentina.getHours() - 3); 

    const nuevoMovimiento = await prisma.movimientos_caja.create({
      data: {
        monto: Number(monto),
        // Si descripcion llega como "" o undefined, usa el fallback
        descripcion: (descripcion && descripcion.trim() !== "") ? descripcion : "Venta varios",
        // Mapeamos 'metodo' (que viene del modal) a 'metodo_pago' (que es la columna en la DB)
        metodo_pago: metodo || "EFECTIVO", 
        tipo: "INGRESO",
        id_comercio: Number(id_comercio),
        fecha: fechaArgentina, 
      },
    });

    return NextResponse.json(nuevoMovimiento, { status: 200 });

  } catch (error: any) {
    console.error("ERROR CRÍTICO EN POST /api/caja:", error);
    // Si el error es de Prisma (ej: id_comercio no existe), esto te lo dirá en la terminal
    return NextResponse.json({ 
        message: "Error al guardar el cobro", 
        error: error.message 
    }, { status: 500 });
  }
}