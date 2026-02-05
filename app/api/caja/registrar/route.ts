import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Para LEER los movimientos (Buscando desde las 00:00 de Argentina)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_comercio = searchParams.get("id_comercio");

  if (!id_comercio) {
    return NextResponse.json({ message: "Falta ID comercio" }, { status: 400 });
  }

  try {
    // A. Calculamos el "HOY" Argentino
    const ahora = new Date();
    ahora.setHours(ahora.getHours() - 3); // Forzamos UTC-3

    // B. Ponemos el reloj en 00:00:00
    const inicioDiaArg = new Date(ahora);
    inicioDiaArg.setHours(0, 0, 0, 0);

    const movimientos = await prisma.movimientos_caja.findMany({
      where: {
        id_comercio: Number(id_comercio),
        fecha: {
          gte: inicioDiaArg, // "Traeme todo lo que pasó desde las 00:00 de ARG"
        },
        tipo: "INGRESO"
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(movimientos);

  } catch (error) {
    console.error("Error leyendo caja:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// 2. POST: Para GUARDAR con hora Argentina (LA SOLUCIÓN REAL) 🇦🇷💾
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monto, descripcion, metodo, id_comercio } = body;

    if (!monto || !id_comercio) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // --- MAGIA: CREAMOS LA FECHA ARGENTINA MANUALMENTE ---
    const fechaArgentina = new Date();
    fechaArgentina.setHours(fechaArgentina.getHours() - 3); 
    // Ahora 'fechaArgentina' tiene la hora de tu reloj, no la de Londres.

    const nuevoMovimiento = await prisma.movimientos_caja.create({
      data: {
        monto: Number(monto),
        descripcion: descripcion || "Venta varios",
        metodo_pago: metodo || "EFECTIVO", 
        tipo: "INGRESO",
        id_comercio: Number(id_comercio),
        
        // --- ACÁ ESTÁ EL TRUCO ---
        // No dejamos que la DB ponga la fecha sola. Se la imponemos nosotros.
        fecha: fechaArgentina, 
      },
    });

    return NextResponse.json(nuevoMovimiento, { status: 200 });

  } catch (error) {
    console.error("Error guardando:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}