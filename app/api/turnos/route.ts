import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarNotificacionTelegram } from "@/lib/telegram";

// --- HELPERS INTERNOS ---

const getInicioDelDiaArg = () => {
  // Obtenemos YYYY-MM-DD de Argentina
  const fechaString = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
  return new Date(`${fechaString}T00:00:00.000Z`);
};

const formatearHora = (horaInput: string, fechaInput: string) => {
  // 1. Nos aseguramos de tener solo HH:mm (por si el front manda un ISO)
  let limpia = horaInput.includes('T') ? horaInput.split('T')[1].substring(0, 5) : horaInput;
  
  // 2. Creamos la fecha final forzando UTC con la "Z"
  // Esto hace que si elegiste 19:30, se guarde como 19:30 UTC.
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
      orderBy: { hora: 'asc' }, // Ordenar por hora para la agenda
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

    // Usamos el helper para clavar la hora elegida
    const { objHora, strHora } = formatearHora(hora, fecha);
    
    // Fecha para la columna 'fecha' (día), la ponemos al mediodía para evitar saltos
    const fechaFinal = new Date(`${fecha}T12:00:00.000Z`);

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

    // Notificación Telegram
    const comercio = await prisma.comercios.findUnique({
      where: { id_comercio: Number(idComercio) },
      select: { telegramChatId: true }
    });

    if (comercio?.telegramChatId) {
      enviarNotificacionTelegram({
        chatId: comercio.telegramChatId,
        nombre: nombre_invitado,
        fecha: new Date(fecha).toLocaleDateString("es-AR"),
        hora: strHora,
        servicio: servicio
      });
    }

    return NextResponse.json(nuevoTurno);
  } catch (error) {
    console.error("Error en POST:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// 3. PUT: Actualizar
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Desestructuramos TODO lo que puede venir del front
    const { 
      id_turno, 
      estado, 
      monto, 
      metodoPago,
      // 👇 Agregamos estos campos para la edición
      nombre_invitado,
      servicio,
      hora,
      fecha,
      contacto_invitado,
    } = body;

    console.log("🛠️ ACTUALIZANDO TURNO:", id_turno, body); // Un log para ver qué llega

    const turnoActualizado = await prisma.turnos.update({
      where: { id_turno: Number(id_turno) },
      data: {
        // Lógica de Estado/Pago (lo que ya tenías)
        estado: estado || undefined,
        monto: monto ? Number(monto) : undefined,
        metodo_pago: metodoPago || undefined,

        // 👇 Lógica de Edición de Datos (LO NUEVO)
        // Usamos "|| undefined" para que si no mandás el dato, no lo borre ni lo toque
        nombre_invitado: nombre_invitado || undefined,
        servicio: servicio || undefined,
        hora: hora ? new Date(`1970-01-01T${hora}:00Z`) : undefined,
        // Ojo con la fecha: Prisma suele pedir objeto Date o string ISO válido
        fecha: fecha ? new Date(fecha) : undefined, 
        contacto_invitado: contacto_invitado || undefined,
      },
    });

    return NextResponse.json(turnoActualizado);
  } catch (error) {
    console.error("❌ Error al actualizar turno:", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}