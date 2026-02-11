import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Recibido de Telegram:", JSON.stringify(body, null, 2));

    const message = body.message;
    
    // Verificamos que sea un mensaje de texto
    if (message && message.text) {
      const text = message.text;
      const chatId = message.chat.id.toString();

      // Buscamos el comando /start
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        const idComercioStr = parts.length > 1 ? parts[1] : null;

        // Intentamos obtener el token de cualquiera de los dos nombres
        const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;

        if (!token) {
          console.error("❌ ERROR: No se encontró el TOKEN en las variables de entorno de Vercel.");
        }

        if (idComercioStr && !isNaN(Number(idComercioStr))) {
          const idComercio = Number(idComercioStr);

          // 1. Buscamos si el comercio existe
          const comercio = await prisma.comercios.findUnique({
            where: { id_comercio: idComercio }
          });

          if (comercio) {
            // 2. Guardamos el chatId en la base de datos
            await prisma.comercios.update({
              where: { id_comercio: idComercio },
              data: { telegramChatId: chatId }
            });

            console.log(`✅ ChatId ${chatId} vinculado al comercio ${idComercio}`);

            // 3. Notificamos éxito al usuario
            const textoOk = `✅ ¡Vínculo exitoso! \n\nHola *${comercio.nombre_empresa}*, a partir de ahora te avisaré por acá cada vez que alguien reserve un turno. 💈`;
            
            const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                chat_id: chatId, 
                text: textoOk,
                parse_mode: "Markdown" 
              }),
            });

            const resData = await res.json();
            if (!resData.ok) console.error("❌ Error de Telegram al enviar OK:", resData);

          } else {
            console.log("⚠️ ID de comercio no encontrado en la DB:", idComercio);
          }
        } else {
          // Si el barbero entró al bot sin el ID en el link
          console.log("ℹ️ El usuario inició el bot sin ID de comercio.");
          
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              chat_id: chatId, 
              text: "⚠️ ¡Hola! Para vincular tu cuenta, por favor hacé clic en el botón 'Vincular Telegram' desde tu panel de gestión en la web. 💈" 
            }),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error crítico en Webhook Telegram:", error);
    // Respondemos 200 igual para que Telegram no reintente infinitamente
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}