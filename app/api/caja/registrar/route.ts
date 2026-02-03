import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monto, descripcion, metodo, id_comercio } = body;

    if (!monto || !id_comercio) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Usamos el modelo 'movimientos_caja' que definiste en el schema
    const nuevoMovimiento = await prisma.movimientos_caja.create({
      data: {
        monto: Number(monto),
        descripcion: descripcion || "Venta varios",
        // Mapeamos lo que llega del front (metodo) a la DB (metodo_pago)
        metodo_pago: metodo || "EFECTIVO", 
        tipo: "INGRESO",
        id_comercio: Number(id_comercio),
        // Fecha se pone sola por el @default(now())
      },
    });

    return NextResponse.json(nuevoMovimiento, { status: 200 });

  } catch (error) {
    console.error("Error en caja:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}