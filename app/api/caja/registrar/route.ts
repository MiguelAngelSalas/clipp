import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Para LEER los movimientos de hoy (Esto usa el Resumen) 📖
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_comercio = searchParams.get("id_comercio");

  if (!id_comercio) {
    return NextResponse.json({ message: "Falta ID comercio" }, { status: 400 });
  }

  try {
    // Definimos el inicio del día de HOY (00:00hs) para no traer cosas viejas
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);

    const movimientos = await prisma.movimientos_caja.findMany({
      where: {
        id_comercio: Number(id_comercio),
        fecha: {
          gte: hoyInicio, // "Mayor o igual a hoy a la medianoche"
        },
        tipo: "INGRESO"   // Solo queremos sumar plata que entró
      },
      orderBy: {
        fecha: 'desc'     // Los más recientes primero
      }
    });

    return NextResponse.json(movimientos);

  } catch (error) {
    console.error("Error leyendo caja:", error);
    return NextResponse.json({ message: "Error interno al leer caja" }, { status: 500 });
  }
}

// 2. POST: Para GUARDAR un cobro nuevo (Lo que ya tenías) 💾
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monto, descripcion, metodo, id_comercio } = body;

    if (!monto || !id_comercio) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Guardamos en 'movimientos_caja'
    const nuevoMovimiento = await prisma.movimientos_caja.create({
      data: {
        monto: Number(monto),
        descripcion: descripcion || "Venta varios",
        // Mapeamos lo que llega del front (metodo) a la DB (metodo_pago)
        metodo_pago: metodo || "EFECTIVO", 
        tipo: "INGRESO",
        id_comercio: Number(id_comercio),
        // La fecha se pone sola gracias a @default(now()) en tu schema
      },
    });

    return NextResponse.json(nuevoMovimiento, { status: 200 });

  } catch (error) {
    console.error("Error guardando en caja:", error);
    return NextResponse.json({ message: "Error interno al guardar" }, { status: 500 });
  }
}