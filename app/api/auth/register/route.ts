import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// --- HELPER PARA CREAR SLUGS ---
function generarSlug(nombre: string) {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("------------------------------------------");
    console.log("📝 NUEVO INTENTO DE REGISTRO:", data.email);

    // 0. VALIDACIÓN DE FORMATO
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!data.email || !emailRegex.test(data.email)) {
      return NextResponse.json({ message: "Email inválido." }, { status: 400 });
    }

    // 1. VERIFICACIÓN DE EMAIL EXISTENTE
    const emailExistente = await prisma.comercios.findUnique({
      where: { email_unico: data.email },
    });

    if (emailExistente) {
      console.log("⚠️ Registro fallido: Email ya en uso");
      return NextResponse.json({ message: "El email ya está registrado." }, { status: 409 });
    }

    // 2. PROCESAMIENTO DE SLUG
    let slugFinal = generarSlug(data.nombre);
    if (!slugFinal) slugFinal = `comercio-${crypto.randomBytes(4).toString('hex')}`;

    const slugExistente = await prisma.comercios.findUnique({
      where: { slug: slugFinal },
    });

    if (slugExistente) {
      console.log("⚠️ Registro fallido: Slug ya en uso");
      return NextResponse.json({ message: "El nombre de la barbería ya está tomado. Probá uno similar." }, { status: 409 });
    }

    // 3. SEGURIDAD
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 4. GUARDADO EN BASE DE DATOS (NEON)
    console.log("💾 Intentando guardar en DB...");
    const nuevoComercio = await prisma.comercios.create({
      data: {
        nombre_empresa: data.nombre,
        slug: slugFinal,
        email_unico: data.email,
        contrasena: hashedPassword,
        telefono_unico: data.telefono || null,
        verificationToken: verificationToken,
        emailVerificado: false,
        // Valores por defecto para evitar errores en el dashboard
        hora_apertura: "09:00",
        hora_cierre: "20:00",
        duracion_turno_min: 30,
        suscrito: false
      },
    });
    console.log("✅ Comercio creado en DB con ID:", nuevoComercio.id_comercio);

    // 5. ENVÍO DE EMAIL (Resend)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const linkVerificacion = `${baseUrl}/verify-email?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: 'Clipp <notificaciones@clipp.com.ar>', 
        to: data.email,
        subject: '¡Bienvenido a Clipp! Verificá tu cuenta',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #3A3A3A;">¡Hola ${data.nombre}!</h1>
            <p>Tu agenda está casi lista. Tu link público será: <strong>clipp.com.ar/${slugFinal}</strong></p>
            <p>Hacé click abajo para activar tu cuenta:</p>
            <a href="${linkVerificacion}" 
               style="background-color: #7A9A75; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 10px;">
               Verificar mi cuenta
            </a>
          </div>
        `
      });
      console.log("📧 Email de verificación enviado.");
    } catch (mailError) {
      console.error("❌ Error de Resend (pero la cuenta se creó):", mailError);
    }

    console.log("------------------------------------------");
    return NextResponse.json({
      message: "Registro exitoso. Revisá tu email.",
      id: nuevoComercio.id_comercio,
    });

  } catch (error: any) {
    console.error("🔥 ERROR CRÍTICO EN REGISTRO:", error.message);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "Ya existe un registro con esos datos." }, { status: 409 });
    }

    return NextResponse.json({ message: "Error interno del servidor", detail: error.message }, { status: 500 });
  }
}