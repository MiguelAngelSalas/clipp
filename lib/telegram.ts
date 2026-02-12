// lib/telegram.ts
export async function enviarNotificacionTelegram({ chatId, nombre, fecha, hora, servicio }: any) {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token || !chatId) return;

  const mensaje = `🔔 *Nuevo Turno*\n\n👤 Cliente: ${nombre}\n📅 Fecha: ${fecha}\n⏰ Hora: ${hora} hs\n✂️ Servicio: ${servicio}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {
    console.error("Error enviando Telegram:", e);
  }
}