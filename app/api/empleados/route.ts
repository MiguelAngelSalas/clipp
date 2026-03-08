import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --- OBTENER EMPLEADOS (Con Filtro de Servicio 🛡️) ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_comercio = searchParams.get("id_comercio");
  const id_servicio = searchParams.get("id_servicio"); // 👈 Capturamos el servicio si viene del turnero

  if (!id_comercio) {
    return NextResponse.json({ message: "Falta id_comercio" }, { status: 400 });
  }

  try {
    const empleados = await prisma.empleados.findMany({
      where: { 
        id_comercio: Number(id_comercio),
        activo: true,
        // 🛡️ FILTRO CLAVE: Solo empleados que ofrecen este servicio específico
        // Si no viene id_servicio, este bloque se ignora y trae a todos.
        ...(id_servicio ? {
          servicios: {
            some: {
              id_servicio: Number(id_servicio)
            }
          }
        } : {})
      },
      include: {
        servicios: true 
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(empleados);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
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
        foto_url: foto_url || null,
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
    const { id_empleado, nombre, foto_url, serviciosIds } = body;

    if (!id_empleado) {
      return NextResponse.json({ message: "Falta id_empleado" }, { status: 400 });
    }

    const empleadoActualizado = await prisma.empleados.update({
      where: { id_empleado: Number(id_empleado) },
      data: {
        nombre: nombre,
        foto_url: foto_url,
        servicios: {
          // Reemplaza todas las conexiones anteriores por estas nuevas
          set: serviciosIds?.map((id: number) => ({ id_servicio: id })) || []
        }
      },
      include: { servicios: true }
    });

    return NextResponse.json(empleadoActualizado);
  } catch (error: any) {
    console.error("Error al actualizar empleado:", error);
    return NextResponse.json({ message: "Error al actualizar", error: error.message }, { status: 500 });
  }
}