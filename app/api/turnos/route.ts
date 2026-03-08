import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarNotificacionTelegram } from "@/lib/telegram";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

// --- HELPERS ---
const getInicioDelDiaArg = () => {
  const fechaString = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
  return new Date(`${fechaString}T00:00:00.000Z`);
};

const formatearHora = (horaInput: string, fechaInput: string) => {
  let limpia = horaInput.includes('T') ? horaInput.split('T')[1].substring(0, 5) : horaInput;
  return {
    objHora: limpia,
    strHora: limpia
  };
};

// 1. GET: Privacidad Selectiva + Blindaje Anti-Espionaje 🛡️
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions); 
    const { searchParams } = new URL(req.url);
    const idComercioUrl = searchParams.get("id_comercio");

    if (!idComercioUrl) return NextResponse.json({ message: "Falta ID" }, { status: 400 });

    // 🛡️ LÓGICA DE SEGURIDAD:
    // Forzamos el tipado con (session?.user as any) para que no tire error de compilación
    let idFinal = Number(idComercioUrl);
    const userSession = session?.user as any; 
    
    if (userSession?.id_comercio) {
      idFinal = Number(userSession.id_comercio);
    }

    // Limpieza automática
    await prisma.turnos.updateMany({
      where: { 
        id_comercio: idFinal, 
        fecha: { lt: getInicioDelDiaArg() }, 
        estado: "pendiente" 
      },
      data: { estado: "cancelado" }
    });

    const turnos = await prisma.turnos.findMany({
      where: { id_comercio: idFinal },
      orderBy: { hora: 'asc' },
      include: { 
        clientes: { select: { nombre_cliente: true, whatsapp: true } },
        empleados: true 
      }
    });

    if (!session) {
      const turnosProtegidos = turnos.map(turno => ({
        id_turno: turno.id_turno,
        fecha: turno.fecha,
        hora: turno.hora,
        id_empleado: turno.id_empleado,
        empleados: turno.empleados,
        estado: turno.estado,
        nombre_invitado: "Reservado",
        contacto_invitado: "Privado",
        servicio_nombre: "Ocupado", 
        clientes: null 
      }));
      return NextResponse.json(turnosProtegidos);
    }

    return NextResponse.json(turnos);
  } catch (error) {
    console.error("Error en GET turnos:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// 2. POST: Crear + Blindaje de ID
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userSession = session?.user as any;
    const body = await req.json();
    
    const idComercioFinal = userSession?.id_comercio 
      ? Number(userSession.id_comercio) 
      : Number(body.id_comercio || body.idComercio);

    const { 
        nombre_invitado, contacto_invitado, fecha, 
        id_servicio, servicio, hora, origen, id_empleado 
    } = body;

    if (origen === "dashboard" && !session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { objHora, strHora } = formatearHora(hora, fecha);
    const fechaFinal = new Date(`${fecha}T12:00:00.000Z`);

    const cliente = await prisma.clientes.upsert({
      where: { id_comercio_whatsapp: { id_comercio: idComercioFinal, whatsapp: contacto_invitado } },
      update: { nombre_cliente: nombre_invitado },
      create: { id_comercio: idComercioFinal, nombre_cliente: nombre_invitado, whatsapp: contacto_invitado }
    }).catch(async () => {
        return await prisma.clientes.findFirst({ 
          where: { whatsapp: contacto_invitado, id_comercio: idComercioFinal }
        });
    });

    let infoServicio: any = null;
    if (id_servicio) {
      infoServicio = await prisma.servicios.findUnique({ where: { id_servicio: Number(id_servicio) } });
    }

    const nuevoTurno = await prisma.turnos.create({
      data: {
        id_comercio: idComercioFinal,
        id_cliente: cliente?.id_cliente,
        id_servicio: infoServicio?.id_servicio || undefined,
        id_empleado: id_empleado ? Number(id_empleado) : undefined,
        servicio_nombre: infoServicio?.nombre || servicio || "Corte",
        monto: infoServicio?.precio ? new Prisma.Decimal(infoServicio.precio.toString()) : new Prisma.Decimal(0),
        nombre_invitado,
        contacto_invitado,
        fecha: fechaFinal,
        hora: new Date(`1970-01-01T${objHora}:00.000Z`), 
        estado: "pendiente"
      },
      include: { empleados: true }
    });

    const comercio = await prisma.comercios.findUnique({
      where: { id_comercio: idComercioFinal },
      select: { telegramChatId: true, nombre_empresa: true }
    });

    if (comercio?.telegramChatId && origen !== "dashboard") {
      try {
        await enviarNotificacionTelegram({
          chatId: comercio.telegramChatId,
          nombre: nombre_invitado,
          fecha: new Date(fecha).toLocaleDateString("es-AR"),
          hora: strHora,
          servicio: nuevoTurno.servicio_nombre
        });
      } catch (errTelegram) {
        console.error("Falló Telegram:", errTelegram);
      }
    }

    return NextResponse.json(nuevoTurno);
  } catch (error: any) {
    console.error("Error en POST turnos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// 3. PUT: Actualizar (Solo Admin 🔐)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userSession = session?.user as any;
    
    if (!userSession?.id_comercio) {
      return NextResponse.json({ message: "No tenés permiso" }, { status: 401 });
    }

    const body = await req.json();
    const { id_turno, ...datosUpdate } = body;

    const turnoOriginal = await prisma.turnos.findUnique({
        where: { id_turno: Number(id_turno) }
    });

    if (!turnoOriginal || turnoOriginal.id_comercio !== Number(userSession.id_comercio)) {
        return NextResponse.json({ message: "Este turno no te pertenece" }, { status: 403 });
    }

    const turnoActualizado = await prisma.turnos.update({
      where: { id_turno: Number(id_turno) },
      data: {
        estado: datosUpdate.estado || undefined,
        monto: datosUpdate.monto ? new Prisma.Decimal(datosUpdate.monto.toString()) : undefined,
        metodo_pago: datosUpdate.metodoPago || undefined,
        nombre_invitado: datosUpdate.nombre_invitado || undefined,
        id_servicio: datosUpdate.id_servicio ? Number(datosUpdate.id_servicio) : undefined,
        id_empleado: datosUpdate.id_empleado ? Number(datosUpdate.id_empleado) : undefined,
        servicio_nombre: datosUpdate.servicio_nombre || undefined,
        hora: datosUpdate.hora ? new Date(`1970-01-01T${datosUpdate.hora.substring(0, 5)}:00.000Z`) : undefined, 
        fecha: datosUpdate.fecha ? new Date(datosUpdate.fecha) : undefined, 
        contacto_invitado: datosUpdate.contacto_invitado || undefined,
      },
      include: { 
        clientes: { select: { nombre_cliente: true } },
        empleados: true 
      }
    });

    return NextResponse.json(turnoActualizado);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}