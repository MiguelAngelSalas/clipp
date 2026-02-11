import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // LOG DE EMERGENCIA: Esto se tiene que ver SI O SI en Vercel
  console.log("🚀 WEBHOOK DISPARADO - Alguien tocó el bot");

  try {
    const body = await req.json();
    console.log("📩 BODY RECIBIDO:", JSON.stringify(body));

    const message = body.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id.toString();
    const text = message.text;

    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const idComercioStr = parts.length > 1 ? parts[1] : null;

      // USAMOS LOS DOS NOMBRES POSIBLES
      const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;

      if (!token) {
        console.error("❌ ERROR CRITICO: No hay TOKEN en Vercel. Revisá las variables de entorno.");
        return NextResponse.json({ ok: true }); 
      }

      if (idComercioStr && !isNaN(Number(idComercioStr))) {
        const idComercio = Number(idComercioStr);

        // Actualizamos la DB
        const comercio = await prisma.comercios.update({
          where: { id_comercio: idComercio },
          data: { telegramChatId: chatId }
        });

        console.log(`✅ DB Actualizada: Comercio ${idComercio} -> Chat ${chatId}`);

        // Mandamos respuesta
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ ¡Vínculo exitoso para ${comercio.nombre_empresa}!`,
          }),
        });
        
        const resData = await res.json();
        console.log("📡 Respuesta de Telegram API:", resData);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("🔥 ERROR EN EL WEBHOOK:", error.message);
    return NextResponse.json({ ok: true });
  }
}

// Para probar desde el navegador si la ruta existe
export async function GET() {
  return NextResponse.json({ status: "Webhook activo y esperando POSTs de Telegram" });
}