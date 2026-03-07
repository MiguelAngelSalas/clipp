import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarNotificacionTelegram } from "@/lib/telegram";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";

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

// 1. GET: Privacidad Selectiva (Blindado 🛡️)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(); 
    const idComercio = new URL(req.url).searchParams.get("id_comercio");
    if (!idComercio) return NextResponse.json({ message: "Falta ID" }, { status: 400 });

    // Limpieza automática
    await prisma.turnos.updateMany({
      where: { 
        id_comercio: Number(idComercio), 
        fecha: { lt: getInicioDelDiaArg() }, 
        estado: "pendiente" 
      },
      data: { estado: "cancelado" }
    });

    const turnos = await prisma.turnos.findMany({
      where: { id_comercio: Number(idComercio) },
      orderBy: { hora: 'asc' },
      include: { 
        clientes: { select: { nombre_cliente: true, whatsapp: true } },
        empleados: true 
      }
    });

    // 🛡️ SI NO HAY SESIÓN: Filtramos la data sensible para el público
    if (!session) {
      const turnosProtegidos = turnos.map(turno => ({
        id_turno: turno.id_turno,
        fecha: turno.fecha,
        hora: turno.hora,
        id_empleado: turno.id_empleado,
        empleados: turno.empleados,
        estado: turno.estado,
        // Ocultamos la identidad
        nombre_invitado: "Reservado",
        contacto_invitado: "Privado",
        servicio_nombre: "Ocupado", 
        clientes: null 
      }));
      return NextResponse.json(turnosProtegidos);
    }

    // SI HAY SESIÓN: Mandamos todo (tus hermanos ven la agenda completa)
    return NextResponse.json(turnos);
  } catch (error) {
    console.error("Error en GET turnos:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// 2. POST: Crear + Protección de Origen
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const idComercio = body.id_comercio || body.idComercio;
    const { 
        nombre_invitado, contacto_invitado, fecha, 
        id_servicio, servicio, hora, origen, id_empleado 
    } = body;

    // 🛡️ Evitamos que un cliente mande 'origen: dashboard' para saltar reglas
    if (origen === "dashboard" && !session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { objHora, strHora } = formatearHora(hora, fecha);
    const fechaFinal = new Date(`${fecha}T12:00:00.000Z`);

    const cliente = await prisma.clientes.upsert({
      where: { id_comercio_whatsapp: { id_comercio: Number(idComercio), whatsapp: contacto_invitado } },
      update: { nombre_cliente: nombre_invitado },
      create: { id_comercio: Number(idComercio), nombre_cliente: nombre_invitado, whatsapp: contacto_invitado }
    }).catch(async () => {
        return await prisma.clientes.findFirst({ 
          where: { whatsapp: contacto_invitado, id_comercio: Number(idComercio) }
        });
    });

    let infoServicio: any = null;
    if (id_servicio) {
      infoServicio = await prisma.servicios.findUnique({ where: { id_servicio: Number(id_servicio) } });
    }

    const nuevoTurno = await prisma.turnos.create({
      data: {
        id_comercio: Number(idComercio),
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

    // Notificación Telegram
    const comercio = await prisma.comercios.findUnique({
      where: { id_comercio: Number(idComercio) },
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
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// 3. PUT: Actualizar (Solo Admin 🔐)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    
    // 🛡️ Nadie modifica un turno si no está logueado
    if (!session) {
      return NextResponse.json({ message: "No tenés permiso para editar turnos" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      id_turno, estado, monto, metodoPago, nombre_invitado,
      id_servicio, id_empleado, servicio_nombre, hora, fecha, contacto_invitado,
    } = body;

    const turnoActualizado = await prisma.turnos.update({
      where: { id_turno: Number(id_turno) },
      data: {
        estado: estado || undefined,
        monto: monto ? new Prisma.Decimal(monto.toString()) : undefined,
        metodo_pago: metodoPago || undefined,
        nombre_invitado: nombre_invitado || undefined,
        id_servicio: id_servicio ? Number(id_servicio) : undefined,
        id_empleado: id_empleado ? Number(id_empleado) : undefined,
        servicio_nombre: servicio_nombre || undefined,
        hora: hora ? new Date(`1970-01-01T${hora.substring(0, 5)}:00.000Z`) : undefined, 
        fecha: fecha ? new Date(fecha) : undefined, 
        contacto_invitado: contacto_invitado || undefined,
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