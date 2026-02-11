import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Recibido de Telegram:", body); // 👈 Meté este log para ver qué llega en la consola

    const message = body.message;
    
    // Verificamos que sea un mensaje de texto
    if (message && message.text) {
      const text = message.text;
      const chatId = message.chat.id.toString();

      // Buscamos el comando /start
      if (text.startsWith("/start")) {
        // El formato es "/start 123", separamos por espacio y tomamos el segundo elemento
        const parts = text.split(" ");
        const idComercioStr = parts.length > 1 ? parts[1] : null;

        if (idComercioStr && !isNaN(Number(idComercioStr))) {
          const idComercio = Number(idComercioStr);

          // 1. Buscamos si el comercio existe antes de actualizar
          const comercio = await prisma.comercios.findUnique({
            where: { id_comercio: idComercio }
          });

          if (comercio) {
            // 2. Guardamos el chatId
            await prisma.comercios.update({
              where: { id_comercio: idComercio },
              data: { telegramChatId: chatId }
            });

            // 3. Notificamos éxito al usuario
            const token = process.env.TELEGRAM_BOT_TOKEN;
            const textoOk = `✅ ¡Vínculo exitoso! \n\nHola *${comercio.nombre_empresa}*, a partir de ahora te avisaré por acá cada vez que alguien reserve un turno. 💈`;
            
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                chat_id: chatId, 
                text: textoOk,
                parse_mode: "Markdown" // Para que las negritas funcionen
              }),
            });
          }
        } else {
          // Si el barbero entró al bot pero sin el link especial (sin el ID)
          const token = process.env.TELEGRAM_BOT_TOKEN;
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              chat_id: chatId, 
              text: "⚠️ Hola! Para vincular tu cuenta, por favor hacé click en el botón 'Vincular Telegram' desde tu panel de gestión." 
            }),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error en Webhook Telegram:", error);
    // Respondemos 200 igual para que Telegram no nos siga reintentando el envío infinito
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}