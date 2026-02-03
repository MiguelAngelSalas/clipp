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

    // 2. Por seguridad, si no existe no avisamos, pero terminamos acá
    if (!usuario) {
      return NextResponse.json({ message: "Si el email existe, se enviará un link." });
    }

    // 3. Generamos un token de reset y una expiración (1 hora)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hora desde ahora

    // 4. Guardamos en la DB
    await prisma.comercios.update({
      where: { email_unico: email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: expiry,
      },
    });

    // 5. Mandamos el mail con Resend
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: 'Clipp <onboarding@resend.dev>',
      to: email,
      subject: 'Restablecer tu contraseña - Clipp',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #3A3A3A;">¿Olvidaste tu contraseña?</h1>
          <p>No pasa nada, a todos nos pasa. Hacé click en el botón de abajo para elegir una nueva:</p>
          <a href="${resetUrl}" 
             style="background-color: #7A9A75; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0;">
            Cambiar contraseña
          </a>
          <p style="font-size: 12px; color: #888;">Este link expira en 1 hora. Si no pediste esto, ignorá el mail.</p>
        </div>
      `
    });

    return NextResponse.json({ message: "Email enviado con éxito" });

  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}