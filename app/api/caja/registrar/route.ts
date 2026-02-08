import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Para LEER los movimientos (Con fecha específica y LÍMITE final)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_comercio = searchParams.get("id_comercio");
  
  // Leemos la fecha que pide el front (si no viene, usamos HOY)
  // Formato esperado: YYYY-MM-DD
  const fechaParam = searchParams.get("fecha"); 

  if (!id_comercio) {
    return NextResponse.json({ message: "Falta ID comercio" }, { status: 400 });
  }

  try {
    // A. Definimos qué día vamos a buscar
    // Si viene fechaParam (ej: "2026-02-06"), usamos esa. Si no, usamos "ahora".
    // Le agregamos la "T00:00:00" para asegurar que arranque al inicio del día local
    const baseDate = fechaParam 
        ? new Date(`${fechaParam}T00:00:00`) 
        : new Date();

    // Si no vino fecha, ajustamos la hora actual por las dudas (UTC-3 manual si hace falta)
    if (!fechaParam) {
        baseDate.setHours(baseDate.getHours() - 3);
    }

    // B. ARMAMOS EL RANGO EXACTO (De 00:00 a 23:59)
    
    // Inicio: 00:00:00.000
    const inicioDia = new Date(baseDate);
    inicioDia.setHours(0, 0, 0, 0);

    // Fin: 23:59:59.999
    const finDia = new Date(baseDate);
    finDia.setHours(23, 59, 59, 999);

    const movimientos = await prisma.movimientos_caja.findMany({
      where: {
        id_comercio: Number(id_comercio),
        tipo: "INGRESO",
        
        // 🔥 ESTE ES EL FILTRO MAGICO QUE SOLUCIONA TU PROBLEMA 🔥
        fecha: {
          gte: inicioDia, // Mayor o igual a las 00:00
          lte: finDia     // Menor o igual a las 23:59
        }
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