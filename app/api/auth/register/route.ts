import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// --- 1. FUNCIÓN HELPER PARA CREAR SLUGS ---
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

    // --- 0. VALIDACIÓN DE FORMATO DE EMAIL ---
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!data.email || !emailRegex.test(data.email)) {
      return NextResponse.json(
        { message: "El email ingresado no es válido. Revisalo por favor." },
        { status: 400 }
      );
    }

    if (!data.nombre || !data.password) {
      return NextResponse.json(
        { message: "Faltan datos: nombre o contraseña" },
        { status: 400 }
      );
    }

    // --- 1. GENERAMOS EL SLUG PRIMERO ---
    // Lo necesitamos ahora para poder chequear si ya existe en la DB
    let slugFinal = generarSlug(data.nombre);
    if (!slugFinal) {
      slugFinal = `comercio-${crypto.randomBytes(4).toString('hex')}`;
    }

    // --- 2. CHEQUEO DOBLE PREVENTIVO (Email y Slug) ---
    // Usamos findFirst con OR para capturar cualquiera de los dos conflictos
    const usuarioExistente = await prisma.comercios.findFirst({
      where: {
        OR: [
          { email_unico: data.email },
          { slug: slugFinal }
        ]
      },
    });

    if (usuarioExistente) {
      const esEmail = usuarioExistente.email_unico === data.email;
      return NextResponse.json(
        { 
          message: esEmail 
            ? "Ese email ya está registrado." 
            : "Ese nombre de barbería ya está en uso. Probá agregando tu ciudad (ej: Boy Cut Banfield)." 
        },
        { status: 409 }
      );
    }

    // --- 3. PREPARACIÓN DE DATOS ---
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // --- 4. GUARDADO EN BASE DE DATOS ---
    const nuevoComercio = await prisma.comercios.create({
      data: {
        nombre_empresa: data.nombre,
        slug: slugFinal,
        email_unico: data.email,
        contrasena: hashedPassword,
        telefono_unico: data.telefono,
        verificationToken: verificationToken,
        emailVerificado: false,
      },
    });

    // --- 5. ENVÍO DE EMAIL ---
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clipp.com.ar";
    const linkVerificacion = `${baseUrl}/verify-email?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: 'Clipp <notificaciones@clipp.com.ar>', 
        to: data.email,
        replyTo: 'clippverificacion@gmail.com', 
        subject: '¡Bienvenido a Clipp! Verificá tu cuenta',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #3A3A3A;">¡Hola ${data.nombre}!</h1>
            <p>Gracias por sumarte a Clipp. Tu link personalizado será: <strong>clipp.com.ar/${slugFinal}</strong></p>
            <p>Para activar tu agenda, hacé click en el botón de abajo:</p>
            <a href="${linkVerificacion}" 
               style="background-color: #7A9A75; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 10px;">
               Verificar mi cuenta
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">Si no creaste esta cuenta, ignorá este mensaje.</p>
          </div>
        `
      });
      console.log("Email enviado exitosamente a:", data.email);
    } catch (mailError) {
      console.error("Error de Resend:", mailError);
      // No frenamos el proceso aquí, el usuario ya se creó.
    }

    return NextResponse.json({
      message: "Registro exitoso. Revisá tu email para verificar la cuenta.",
      id: nuevoComercio.id_comercio,
    });

  } catch (error) {
    console.error("Error registrando usuario:", error);
    
    // Fallback por si algo se escapó al findFirst (Error de unicidad en Prisma)
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { message: "Ya existe un comercio con ese nombre/slug o email." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}