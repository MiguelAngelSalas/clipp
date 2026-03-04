import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Para LEER los movimientos del día
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_comercio = searchParams.get("id_comercio");
  const fechaParam = searchParams.get("fecha"); 

  if (!id_comercio) {
    return NextResponse.json({ message: "Falta ID comercio" }, { status: 400 });
  }

  try {
    // Si viene fechaParam (YYYY-MM-DD), creamos la fecha en base a eso
    // Si no, usamos la fecha actual
    const baseDate = fechaParam ? new Date(`${fechaParam}T00:00:00`) : new Date();

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
      orderBy: { fecha: 'asc' } // Orden ascendente para la cronología
    });

    return NextResponse.json(movimientos);

  } catch (error) {
    console.error("Error en GET /api/caja:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// 2. POST: Para GUARDAR un nuevo cobro manual
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log para debuguear en la terminal de VS Code
    console.log("DEBUG: Body recibido:", body);

    const { monto, descripcion, metodo, id_comercio } = body;

    // Validación de seguridad
    if (!monto || !id_comercio) {
        return NextResponse.json({ message: "Monto e ID Comercio son obligatorios" }, { status: 400 });
    }

    // IMPORTANTE: No restamos 3 horas aquí.
    // Guardamos la fecha UTC tal cual para que tus utilidades de frontend 
    // hagan el ajuste de zona horaria correctamente al mostrarlo.
    const fechaActual = new Date(); 

    const nuevoMovimiento = await prisma.movimientos_caja.create({
      data: {
        monto: Number(monto),
        // Si descripcion llega vacío, aplicamos el fallback
        descripcion: (descripcion && descripcion.trim() !== "") ? descripcion : "Venta varios",
        // Mapeamos 'metodo' a 'metodo_pago' (la columna de tu DB)
        metodo_pago: metodo || "EFECTIVO", 
        tipo: "INGRESO",
        id_comercio: Number(id_comercio),
        fecha: fechaActual, 
      },
    });

    return NextResponse.json(nuevoMovimiento, { status: 200 });

  } catch (error: any) {
    console.error("ERROR CRÍTICO EN POST /api/caja:", error);
    return NextResponse.json({ 
        message: "Error al guardar el cobro", 
        error: error.message 
    }, { status: 500 });
  }
}