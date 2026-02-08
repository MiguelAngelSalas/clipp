import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarWhatsAppConfirmacion } from "@/lib/whatsapp";

// 1. GET: Obtener turnos y limpiar los viejos 🧹
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idComercio = searchParams.get("id_comercio");

    if (!idComercio) {
      return NextResponse.json({ message: "Falta el ID del comercio" }, { status: 400 });
    }

    // ============================================================
    // 🧹 EL BARRENDERO
    // ============================================================
    const fechaStringArg = new Date().toLocaleDateString('en-CA', { 
        timeZone: 'America/Argentina/Buenos_Aires' 
    });

    const puntoDeCorteISO = `${fechaStringArg}T00:00:00.000Z`;
    const inicioDelDia = new Date(puntoDeCorteISO);

    // console.log("🧹 Barriendo turnos anteriores a:", inicioDelDia.toISOString());

    await prisma.turnos.updateMany({
      where: {
        id_comercio: Number(idComercio),
        fecha: { lt: inicioDelDia }, 
        estado: "pendiente"
      },
      data: { estado: "cancelado" }
    });
    // ============================================================

    const turnos = await prisma.turnos.findMany({
      where: { id_comercio: Number(idComercio) },
      orderBy: { fecha: 'asc' },
      include: {
        clientes: { select: { nombre_cliente: true, whatsapp: true } }
      }
    });

    return NextResponse.json(turnos);

  } catch (error) {
    console.error("Error obteniendo turnos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// 2. POST: Crear Turno + Enviar WhatsApp 📝
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const idComercioRecibido = body.id_comercio || body.idComercio;

        if (!idComercioRecibido) {
             return NextResponse.json({ message: "Falta el ID del comercio" }, { status: 400 });
        }

        const { nombre_invitado, contacto_invitado, fecha, metodoPago, ...restoDelTurno } = body;
        let horaFinalRecibida = body.hora;

        if (horaFinalRecibida && horaFinalRecibida.includes('T')) {
            horaFinalRecibida = horaFinalRecibida.split('T')[1].substring(0, 5);
        }
        
        if (!fecha || !horaFinalRecibida) {
            return NextResponse.json({ message: "La fecha y la hora son obligatorias" }, { status: 400 });
        }

        const fechaFinal = new Date(`${fecha}T12:00:00Z`);
        const horaFinal = new Date(`${fecha}T${horaFinalRecibida}:00`);

        if (isNaN(fechaFinal.getTime()) || isNaN(horaFinal.getTime())) {
            return NextResponse.json({ message: "Formato de fecha u hora inválido" }, { status: 400 });
        }

        let idClienteFinal = body.id_cliente; 
        
        // --- Gestión del Cliente ---
        if (!idClienteFinal && contacto_invitado && idComercioRecibido) {
            const clienteExistente = await prisma.clientes.findFirst({
                where: { 
                    whatsapp: contacto_invitado,
                    id_comercio: Number(idComercioRecibido) 
                }
            });

            if (clienteExistente) {
                const clienteActualizado = await prisma.clientes.update({
                    where: { id_cliente: clienteExistente.id_cliente },
                    data: { nombre_cliente: nombre_invitado }
                });
                idClienteFinal = clienteActualizado.id_cliente;
            } else {
                const nuevoCliente = await prisma.clientes.create({
                    data: {
                        id_comercio: Number(idComercioRecibido), 
                        nombre_cliente: nombre_invitado,
                        whatsapp: contacto_invitado,
                    }
                });
                idClienteFinal = nuevoCliente.id_cliente;
            }
        }

        const nuevoTurno = await prisma.turnos.create({
            data: {
                id_comercio: Number(idComercioRecibido),
                ...restoDelTurno,
                id_cliente: idClienteFinal, 
                nombre_invitado: nombre_invitado,
                contacto_invitado: contacto_invitado,
                fecha: fechaFinal,
                hora: horaFinal,
                metodo_pago: metodoPago || "EFECTIVO" 
            }
        });

        // --- WhatsApp ---
        try {
            if (contacto_invitado) {
                const fechaLinda = new Date(fechaFinal).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' }) + 
                                   " a las " + horaFinalRecibida + "hs";
                
                enviarWhatsAppConfirmacion(
                    contacto_invitado, 
                    nombre_invitado, 
                    fechaLinda
                );
            }
        } catch (error) {
            console.error("Error no bloqueante enviando WPP:", error);
        }

        return NextResponse.json(nuevoTurno);

    } catch (error: any) {
        console.error("Error creando turno:", error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { message: "Ya existe un turno reservado en ese horario." }, 
                { status: 409 }
            );
        }
        return NextResponse.json({ message: "Error al crear turno" }, { status: 500 });
    }
}

// 3. PUT: Actualizar turno (CON EL FIX DE FECHA 🩹) 🔄
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        
        console.log("📦 PUT RECIBIDO:", body);
        
        // Usamos 'let' para poder rellenar la fecha si falta
        let { id_turno, estado, monto, servicio, hora, nombre_invitado, contacto_invitado, fecha, metodoPago } = body;

        if (!id_turno) {
            return NextResponse.json({ message: "Falta el ID del turno" }, { status: 400 });
        }

        const datosAActualizar: any = {};

        // Actualizamos campos simples
        if (estado) datosAActualizar.estado = estado;
        if (monto !== undefined && monto !== "") datosAActualizar.monto = Number(monto);
        if (servicio) datosAActualizar.servicio = servicio;
        if (nombre_invitado) datosAActualizar.nombre_invitado = nombre_invitado;
        if (contacto_invitado !== undefined) datosAActualizar.contacto_invitado = contacto_invitado;
        if (metodoPago) datosAActualizar.metodo_pago = metodoPago;

        // --- FIX: SI FALTA FECHA PERO TENEMOS HORA ISO ---
        // Si el body trae "hora": "2026-02-22T14:30..." pero "fecha": undefined
        if (!fecha && hora && typeof hora === 'string' && hora.includes('T')) {
            fecha = hora.split('T')[0]; // "2026-02-22" (Robamos la fecha del string ISO)
        }

        // Limpiamos la hora para que quede "HH:mm"
        let horaLimpia = hora;
        if (horaLimpia && typeof horaLimpia === 'string' && horaLimpia.includes('T')) {
            horaLimpia = horaLimpia.split('T')[1].substring(0, 5); // "14:30"
        }

        // Ahora sí, si tenemos las dos cosas (una vino o la calculamos), actualizamos
        if (horaLimpia && fecha) {
             const h = new Date(`${fecha}T${horaLimpia}:00`);
             const f = new Date(`${fecha}T12:00:00Z`); // Truco del mediodía
             
             if (!isNaN(h.getTime())) datosAActualizar.hora = h;
             if (!isNaN(f.getTime())) datosAActualizar.fecha = f;
        }

        console.log("✅ Datos que vamos a mandar a Prisma:", datosAActualizar);

        const turnoActualizado = await prisma.turnos.update({
            where: { id_turno: Number(id_turno) },
            data: datosAActualizar
        });

        return NextResponse.json(turnoActualizado);

    } catch (error) {
        console.error("Error actualizando turno:", error);
        return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
    }
}