// lib/telegram.ts
export async function enviarNotificacionTelegram({ chatId, nombre, fecha, hora, servicio }: any) {
  const token = process.env.TELEGRAM_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clipp.com.ar";

  if (!token || !chatId) return;

  // Formateamos el mensaje con un poco más de onda
  const mensaje = `✨ *¡Nuevo Turno Confirmado!* ✨\n\n` +
                  `👤 *Cliente:* ${nombre}\n` +
                  `📅 *Fecha:* ${fecha}\n` +
                  `⏰ *Hora:* ${hora} hs\n` +
                  `✂️ *Servicio:* ${servicio}\n\n` +
                  `_Gestioná tus turnos desde el dashboard de Clipp._`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: "Markdown",
        // 👇 ACÁ ESTÁ LA MAGIA: Agregamos el botón
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📅 Ver mi Agenda",
                url: `${baseUrl}` // O `${baseUrl}/dashboard` según tu ruta
              }
            ]
          ]
        }
      }),
    });
  } catch (e) {
    console.error("Error enviando Telegram:", e);
  }
}