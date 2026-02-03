import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from 'resend';

// Inicializamos Resend con la Key de tu .env
const resend = new Resend(process.env.RESEND_API_KEY);

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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const nuevoComercio = await prisma.comercios.create({
      data: {
        nombre_empresa: data.nombre,
        email_unico: data.email,
        contrasena: hashedPassword,
        verificationToken: verificationToken,
        emailVerificado: false,
      },
    });

    // Construimos el link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const linkVerificacion = `${baseUrl}/verify-email?token=${verificationToken}`;

    console.log("Intentando enviar mail a:", data.email);

    // --- ENVÍO REAL (DESCOMENTADO) ---
    try {
      await resend.emails.send({
        // IMPORTANTE: Si no validaste dominio, usá 'onboarding@resend.dev'
        from: 'Clipp <onboarding@resend.dev>', 
        to: data.email,
        subject: '¡Bienvenido a Clipp! Verificá tu cuenta',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #3A3A3A;">¡Hola ${data.nombre}!</h1>
            <p>Gracias por sumarte a Clipp. Para activar tu agenda, hacé click en el botón de abajo:</p>
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
      // Si falla el mail, igual creamos el usuario pero avisamos en consola
      console.error("Error de Resend:", mailError);
    }

    return NextResponse.json({
      message: "Registro exitoso. Revisá tu email para verificar la cuenta.",
      id: nuevoComercio.id_comercio,
    });

  } catch (error) {
    console.error("Error registrando usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}