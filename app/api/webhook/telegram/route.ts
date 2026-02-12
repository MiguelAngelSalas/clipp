import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegurate que esta ruta a prisma esté bien

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log("--- 🏁 INICIO DEL WEBHOOK ---");
  
  try {
    const body = await req.json();
    console.log("📦 Body recibido:", JSON.stringify(body));

    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
      console.error("❌ ERROR: No existe TELEGRAM_TOKEN en Vercel");
      return NextResponse.json({ ok: true });
    }

    // Si es el comando /start
    if (body.message?.text?.startsWith("/start")) {
      const chatId = body.message.chat.id;
      const startPayload = body.message.text.split(" ")[1]; // El ID que viene después de /start

      console.log(`👤 ChatID: ${chatId}, Payload: ${startPayload}`);

      if (startPayload) {
        console.log("🔍 Buscando comercio en la DB...");
        // IMPORTANTE: Asegurate que el nombre del campo sea id_comercio o el que uses
        const comercio = await prisma.comercios.findUnique({
          where: { id_comercio: Number(startPayload) }
        });

        if (comercio) {
          console.log("✅ Comercio encontrado. Actualizando telegramId...");
          await prisma.comercios.update({
            where: { id_comercio: comercio.id_comercio },
            data: { telegramChatId: chatId.toString() }
          });

          // Enviar respuesta al usuario
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `¡Vinculación exitosa! Soy el bot de ${comercio.nombre_empresa}.`
            }),
          });
          console.log("📧 Mensaje de éxito enviado a Telegram");
        } else {
          console.error("⚠️ No se encontró el comercio con ese ID");
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("🔥 ERROR CRÍTICO:", error.message);
    return NextResponse.json({ ok: true }); // Siempre 200 para que Telegram no reintente mil veces
  }
}

export async function GET() {
  return NextResponse.json({ status: "online", message: "Ruta activa" });
}