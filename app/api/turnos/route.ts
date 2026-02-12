import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarNotificacionTelegram } from "@/lib/telegram";

export const dynamic = 'force-dynamic';

// --- HELPERS INTERNOS ---
const getInicioDelDiaArg = () => {
  const fechaString = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
  return new Date(`${fechaString}T00:00:00.000Z`);
};

const formatearHora = (horaInput: string, fechaInput: string) => {
  let limpia = horaInput.includes('T') ? horaInput.split('T')[1].substring(0, 5) : horaInput;
  const fechaIsoString = `${fechaInput}T${limpia}:00.000Z`;
  
  return {
    objHora: new Date(fechaIsoString),
    strHora: limpia
  };
};

// 1. GET: Obtener y Limpiar
export async function GET(req: Request) {
  try {
    const idComercio = new URL(req.url).searchParams.get("id_comercio");
    if (!idComercio) return NextResponse.json({ message: "Falta ID" }, { status: 400 });

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
      include: { clientes: { select: { nombre_cliente: true, whatsapp: true } } }
    });

    return NextResponse.json(turnos);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// 2. POST: Crear + Notificar
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idComercio = body.id_comercio || body.idComercio;
    const { nombre_invitado, contacto_invitado, fecha, servicio, hora } = body;

    const { objHora, strHora } = formatearHora(hora, fecha);
    const fechaFinal = new Date(`${fecha}T12:00:00.000Z`);

    // Upsert cliente
    const cliente = await prisma.clientes.upsert({
      where: { 
        id_comercio_whatsapp: { 
          id_comercio: Number(idComercio), 
          whatsapp: contacto_invitado 
        } 
      },
      update: { nombre_cliente: nombre_invitado },
      create: { 
        id_comercio: Number(idComercio), 
        nombre_cliente: nombre_invitado, 
        whatsapp: contacto_invitado 
      }
    }).catch(async () => {
        return await prisma.clientes.findFirst({ 
          where: { whatsapp: contacto_invitado, id_comercio: Number(idComercio) }
        });
    });

    // Crear turno
    const nuevoTurno = await prisma.turnos.create({
      data: {
        id_comercio: Number(idComercio),
        id_cliente: cliente?.id_cliente,
        nombre_invitado,
        contacto_invitado,
        servicio: servicio || "Corte",
        fecha: fechaFinal,
        hora: objHora, 
        estado: "pendiente"
      }
    });

    console.log("✅ Turno creado en DB. Iniciando proceso de notificación...");

    // Notificación Telegram
    const comercio = await prisma.comercios.findUnique({
      where: { id_comercio: Number(idComercio) },
      select: { telegramChatId: true, nombre_empresa: true }
    });

    // IMPORTANTE: Agregamos el AWAIT para que Vercel no mate la función antes de enviar el mensaje
    if (comercio?.telegramChatId) {
      console.log(`📱 Enviando notificación a Telegram (ChatID: ${comercio.telegramChatId})`);
      try {
        await enviarNotificacionTelegram({
          chatId: comercio.telegramChatId,
          nombre: nombre_invitado,
          fecha: new Date(fecha).toLocaleDateString("es-AR"),
          hora: strHora,
          servicio: servicio || "Corte"
        });
        console.log("📧 Notificación enviada con éxito.");
      } catch (errTelegram) {
        console.error("❌ Falló el envío de Telegram, pero el turno se creó:", errTelegram);
      }
    } else {
      console.log("⚠️ El comercio no tiene vinculado un Telegram (telegramChatId es null).");
    }

    return NextResponse.json(nuevoTurno);

  } catch (error: any) {
    console.error("🔥 Error en POST de Turnos:", error.message);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// 3. PUT: Actualizar
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      id_turno, 
      estado, 
      monto, 
      metodoPago,
      nombre_invitado,
      servicio,
      hora,
      fecha,
      contacto_invitado,
    } = body;

    const turnoActualizado = await prisma.turnos.update({
      where: { id_turno: Number(id_turno) },
      data: {
        estado: estado || undefined,
        monto: monto ? Number(monto) : undefined,
        metodo_pago: metodoPago || undefined,
        nombre_invitado: nombre_invitado || undefined,
        servicio: servicio || undefined,
        hora: hora ? new Date(`1970-01-01T${hora}:00Z`) : undefined,
        fecha: fecha ? new Date(fecha) : undefined, 
        contacto_invitado: contacto_invitado || undefined,
      },
    });

    return NextResponse.json(turnoActualizado);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}