import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from 'resend';

// Inicializamos Resend con la Key de tu .env
const resend = new Resend(process.env.RESEND_API_KEY);

// --- 1. FUNCIÓN HELPER PARA CREAR SLUGS (NUEVA) ---
function generarSlug(nombre: string) {
  return nombre
    .toLowerCase()             // A minúsculas
    .trim()                    // Chau espacios bordes
    .replace(/\s+/g, '-')      // Espacios -> Guiones
    .replace(/[^\w\-]+/g, '')  // Borrar caracteres raros (tildes, emojis)
    .replace(/\-\-+/g, '-');   // Evitar guiones dobles
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.nombre || !data.email || !data.password) {
      return NextResponse.json(
        { message: "Faltan datos: nombre, email o contraseña" },
        { status: 400 }
      );
    }

    const usuarioExistente = await prisma.comercios.findUnique({
      where: { email_unico: data.email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "Ese email ya está registrado" },
        { status: 409 }
      );
    }

    // --- 2. GENERAMOS EL SLUG ANTES DE GUARDAR ---
    let slugFinal = generarSlug(data.nombre);
    
    // Si el nombre era muy raro (ej: "???") y quedó vacío, inventamos uno
    if (!slugFinal) {
      slugFinal = `comercio-${crypto.randomBytes(4).toString('hex')}`;
    }

    // Opcional: Agregar un código random al final para evitar duplicados si hay dos "Barbería Migue"
    // Por ahora lo dejamos limpio. Si choca, Prisma tirará error y lo arreglamos después.

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // --- 3. GUARDAMOS EN BASE DE DATOS ---
    const nuevoComercio = await prisma.comercios.create({
      data: {
        nombre_empresa: data.nombre,
        slug: slugFinal, // <--- ¡ACÁ ESTÁ LA MAGIA! ✨
        email_unico: data.email,
        contrasena: hashedPassword,
        verificationToken: verificationToken,
        emailVerificado: false,
      },
    });

    // Construimos el link (Acá te dejé la versión a prueba de balas por si falla la variable)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clipp.com.ar";
    const linkVerificacion = `${baseUrl}/verify-email?token=${verificationToken}`;

    console.log("Intentando enviar mail a:", data.email);

    // --- ENVÍO REAL ---
    try {
      await resend.emails.send({
        from: 'Clipp <notificaciones@clipp.com.ar>', 
        to: data.email,
        // Agregamos reply_to por si responden
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
      console.log("Email enviado exitosamente");
    } catch (mailError) {
      console.error("Error de Resend:", mailError);
    }

    return NextResponse.json({
      message: "Registro exitoso. Revisá tu email para verificar la cuenta.",
      id: nuevoComercio.id_comercio,
    });

  } catch (error) {
    console.error("Error registrando usuario:", error);
    // Si el error es por slug duplicado (código P2002 de Prisma), avisamos
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