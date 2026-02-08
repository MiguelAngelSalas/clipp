import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Para LEER (Con filtro de fecha)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_comercio = searchParams.get("id_comercio");
  const fechaParam = searchParams.get("fecha"); 

  if (!id_comercio) {
    return NextResponse.json({ message: "Falta ID comercio" }, { status: 400 });
  }

  try {
    const baseDate = fechaParam ? new Date(`${fechaParam}T00:00:00`) : new Date();
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
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(movimientos);

  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// 2. POST: Para GUARDAR (Con hora Argentina)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monto, descripcion, metodo, id_comercio } = body;

    const fechaArgentina = new Date();
    fechaArgentina.setHours(fechaArgentina.getHours() - 3); 

    const nuevoMovimiento = await prisma.movimientos_caja.create({
      data: {
        monto: Number(monto),
        descripcion: descripcion || "Venta varios",
        metodo_pago: metodo || "EFECTIVO", 
        tipo: "INGRESO",
        id_comercio: Number(id_comercio),
        fecha: fechaArgentina, 
      },
    });

    return NextResponse.json(nuevoMovimiento, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}