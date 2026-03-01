import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; // Asegurate de que esta ruta a tu prisma apunte bien

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_comercio = searchParams.get("id_comercio");

    if (!id_comercio) return NextResponse.json({ message: "Falta id_comercio" }, { status: 400 });

    const servicios = await prisma.servicios.findMany({
      where: { 
        id_comercio: Number(id_comercio),
        activo: true // Solo traemos los que no borró
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(servicios);
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_comercio, nombre, precio } = body;
    if (!id_comercio || !nombre || !precio) {
      return NextResponse.json({ message: "Faltan datos requeridos" }, { status: 400 });
    }
    const nombreLimpio = nombre.trim();
    const servicioExistente = await prisma.servicios.findFirst({
      where:{
        id_comercio: Number(id_comercio),
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive"
        }
      }
    })
    if(servicioExistente){
      return NextResponse.json({ message: "Ya existe un servicio con ese nombre" }, { status: 400 });
    }
    const nuevoServicio = await prisma.servicios.create({
      data: {
        id_comercio: Number(id_comercio),
        nombre: nombreLimpio,
        precio: Number(precio),// Si no le pone duración, por defecto 30 min
      }
    });
    return NextResponse.json(nuevoServicio);
  } catch (error: any) {
    console.error("Error en API de servicios:", error);
    // Por si el patovica de la API falla y choca contra el @@unique de la BD (P2002)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "La base de datos rechazó el servicio porque ya existe uno igual." }, 
        { status: 400 }
      );
    }
    // Cualquier otro error grave
    return NextResponse.json(
      { error: "Hubo un problema en el servidor al intentar guardar." }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id_servicio, nombre, precio } = data;

    if (!id_servicio || !nombre || !precio) {
      return NextResponse.json({ error: "Faltan datos para actualizar." }, { status: 400 });
    }

    const nombreLimpio = nombre.trim();

    // Validar que el nuevo nombre no lo tenga OTRO servicio del mismo comercio
    // Buscamos el servicio actual para saber de qué comercio es
    const servicioActual = await prisma.servicios.findUnique({
      where: { id_servicio: Number(id_servicio) }
    });

    if (servicioActual) {
      const duplicado = await prisma.servicios.findFirst({
        where: {
          id_comercio: servicioActual.id_comercio,
          nombre: { equals: nombreLimpio, mode: "insensitive" },
          NOT: { id_servicio: Number(id_servicio) } // Que no sea el mismo que estamos editando
        }
      });

      if (duplicado) {
        return NextResponse.json({ error: "Ya tenés otro servicio con ese nombre." }, { status: 400 });
      }
    }

    const servicioActualizado = await prisma.servicios.update({
      where: { id_servicio: Number(id_servicio) },
      data: {
        nombre: nombreLimpio,
        precio: Number(precio)
      }
    });

    return NextResponse.json(servicioActualizado);
  } catch (error) {
    console.error("Error en PUT servicios:", error);
    return NextResponse.json({ error: "Error al actualizar el servicio." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_servicio = searchParams.get("id_servicio");

    if (!id_servicio) {
      return NextResponse.json({ error: "ID de servicio no proporcionado" }, { status: 400 });
    }

    await prisma.servicios.delete({
      where: { id_servicio: Number(id_servicio) },
    });

    return NextResponse.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error en DELETE servicios:", error);
    return NextResponse.json({ error: "No se puede eliminar un servicio que ya tiene turnos asociados." }, { status: 400 });
  }
}