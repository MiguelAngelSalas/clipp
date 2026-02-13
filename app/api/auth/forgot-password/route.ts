import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Buscamos si el comercio existe
    const usuario = await prisma.comercios.findUnique({
      where: { email_unico: email },
    });

    // 2. AHORA SÍ AVISAMOS: Si no existe, tiramos error explícito
    if (!usuario) {
      return NextResponse.json(
        { message: "No encontramos ninguna cuenta con ese email. Verificalo o registrate." }, 
        { status: 404 }
      );
    }

    // 3. Generamos un token de reset y una expiración (1 hora)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hora desde ahora

    // 4. Guardamos en la DB (Asegurate de tener estos campos en tu schema.prisma)
    await prisma.comercios.update({
      where: { email_unico: email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: expiry,
      },
    });

    // 5. Mandamos el mail con Resend
    // Usamos la URL de producción o localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: 'Clipp <notificaciones@clipp.com.ar>', // Cambialo por tu dominio verificado
        to: email,
        subject: 'Restablecer tu contraseña - Clipp',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #3A3A3A; text-align: center;">¿Olvidaste tu contraseña?</h1>
            <p style="font-size: 16px; line-height: 1.5;">Hola <strong>${usuario.nombre_empresa}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.5;">No pasa nada, a todos nos pasa. Hacé click en el botón de abajo para elegir una nueva clave:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #7A9A75; color: white; padding: 14px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Cambiar contraseña
              </a>
            </div>
            <p style="font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; pt: 20px;">
              Este link expira en 1 hora por seguridad. Si no pediste este cambio, podés ignorar este mail tranquilamente.
            </p>
          </div>
        `
      });
    } catch (mailError) {
      console.error("Error enviando email con Resend:", mailError);
      return NextResponse.json({ message: "No se pudo enviar el email. Intentá más tarde." }, { status: 500 });
    }

    return NextResponse.json({ message: "Email enviado con éxito" });

  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}