import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Este log tiene que aparecer sí o sí si Telegram llega a Vercel
  console.log("🚀 INFO: Webhook invocado");

  try {
    const body = await req.json();
    console.log("📦 BODY DE TELEGRAM:", JSON.stringify(body));

    const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;
    
    if (!token) {
      console.error("❌ ERROR: No hay TOKEN en las variables de Vercel");
      return NextResponse.json({ ok: true });
    }

    // Intentamos mandarte un mensaje de vuelta directo al recibir cualquier cosa
    if (body.message) {
      const chatId = body.message.chat.id;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🤖 ¡Hola! El servidor recibió tu mensaje. Si ves esto, la conexión funciona.",
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("🔥 Error crítico:", err.message);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

// Para probar en el navegador
export async function GET() {
  return NextResponse.json({ mensaje: "El endpoint está vivo" });
}