import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --- OBTENER EMPLEADOS ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_comercio = searchParams.get("id_comercio");

  if (!id_comercio) {
    return NextResponse.json({ message: "Falta id_comercio" }, { status: 400 });
  }

  try {
    const empleados = await prisma.empleados.findMany({
      where: { 
        id_comercio: Number(id_comercio),
        activo: true 
      },
      include: {
        servicios: true 
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(empleados);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener empleados" }, { status: 500 });
  }
}

// --- CREAR EMPLEADO ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, foto_url, id_comercio, serviciosIds } = body; 

    if (!nombre || !id_comercio) {
      return NextResponse.json({ message: "Nombre e id_comercio son obligatorios" }, { status: 400 });
    }

    const nuevoEmpleado = await prisma.empleados.create({
      data: {
        nombre,
        foto_url,
        id_comercio: Number(id_comercio),
        servicios: {
          connect: serviciosIds?.map((id: number) => ({ id_servicio: id })) || []
        }
      },
      include: {
        servicios: true
      }
    });

    return NextResponse.json(nuevoEmpleado, { status: 201 });
  } catch (error: any) {
    console.error("Error creando empleado:", error);
    return NextResponse.json({ message: "Error al crear empleado", error: error.message }, { status: 500 });
  }
}

// --- BORRADO LÓGICO DE EMPLEADO ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_empleado = searchParams.get("id_empleado");

    if (!id_empleado) {
      return NextResponse.json({ message: "Falta id_empleado" }, { status: 400 });
    }

    // Usamos update para poner activo: false en lugar de delete
    // Esto es para que los turnos viejos no queden huérfanos
    await prisma.empleados.update({
      where: { id_empleado: Number(id_empleado) },
      data: { activo: false }
    });

    return NextResponse.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar empleado" }, { status: 500 });
  }
}

// --- ACTUALIZAR EMPLEADO ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id_empleado, nombre, serviciosIds } = body;

    if (!id_empleado) {
      return NextResponse.json({ message: "Falta id_empleado" }, { status: 400 });
    }

    const empleadoActualizado = await prisma.empleados.update({
      where: { id_empleado: Number(id_empleado) },
      data: {
        nombre: nombre,
        servicios: {
          // 'set' reemplaza todas las conexiones anteriores por estas nuevas
          set: serviciosIds?.map((id: number) => ({ id_servicio: id })) || []
        }
      },
      include: { servicios: true }
    });

    return NextResponse.json(empleadoActualizado);
  } catch (error: any) {
    return NextResponse.json({ message: "Error al actualizar", error: error.message }, { status: 500 });
  }
}