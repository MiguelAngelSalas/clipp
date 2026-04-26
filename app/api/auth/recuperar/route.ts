import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

// Inicializamos Resend con la variable de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "El email es requerido" }, { status: 400 });
    }

    // 1. Verificamos si el comercio existe
    const comercio = await prisma.comercios.findFirst({
      where: { email_unico: email },
    });

    if (!comercio) {
      // Por seguridad, siempre devolvemos OK aunque el mail no exista, 
      // así nadie puede "adivinar" qué correos están registrados en tu BD.
      return NextResponse.json({ message: "Si el correo existe, se enviará un link" }, { status: 200 });
    }

    // 2. Generamos un token seguro y único
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000); // Expira en 1 hora

    // 3. Guardamos el token en la base de datos
    await prisma.comercios.update({
      where: { id_comercio: comercio.id_comercio },
      data: {
        resetToken: token,
        resetTokenExpiry: tokenExpiry,
      },
    });

    // 4. Armamos el link de recuperación
    // NEXTAUTH_URL debe estar en tu .env (ej: http://localhost:3000 o https://tu-dominio.com)
    const baseUrl = process.env.NEXTAUTH_URL;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // 5. Enviamos el correo usando Resend
    const { data, error } = await resend.emails.send({
      from: "Soporte Clipp <clippverificacion@clipp.com.ar>", // Cambiá esto por tu dominio verificado cuando lo tengas
      to: [email],
      subject: "Recuperación de Contraseña - Clipp",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #3A3A3A;">
          <h2 style="color: #7A9A75;">Recuperación de Contraseña</h2>
          <p>Hola, solicitaste restablecer tu contraseña para tu barbería.</p>
          <p>Hacé clic en el siguiente botón para crear una nueva contraseña. Este enlace expirará en 1 hora.</p>
          <a href="${resetLink}" style="padding: 12px 24px; background-color: #7A9A75; color: white; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px; font-weight: bold;">Restablecer Contraseña</a>
          <p style="margin-top: 30px; font-size: 12px; color: #888;">Si no solicitaste este cambio, podés ignorar este correo tranquilamente.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error interno de Resend:", error);
      return NextResponse.json({ message: "Error al intentar despachar el correo" }, { status: 500 });
    }

    return NextResponse.json({ message: "Correo enviado exitosamente", data }, { status: 200 });

  } catch (error) {
    console.error("Error general en recuperar API:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}