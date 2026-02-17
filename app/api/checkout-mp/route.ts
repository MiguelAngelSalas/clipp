import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, nombreComercio } = await req.json();
    
    // Usamos la URL de Vercel (asegurate que esté en tus variables de entorno)
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://tu-proyecto.vercel.app').replace(/\/$/, "");

    console.log("🚀 Creando Suscripción (Preapproval) para:", nombreComercio);

    const body = {
      reason: `Suscripción Mensual Clipp - ${nombreComercio}`,
      payer_email: email,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 5000, // Lo que cobrará después de la prueba
        currency_id: "ARS",
        free_trial: {
          frequency: 15, // <--- TUS 15 DÍAS GRATIS
          frequency_type: "days"
        }
      },
      // Importante: status pending para que empiece el flujo
      back_url: `${baseUrl}/`, 
      status: "pending"
    };

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error de MP en Suscripción:", data);
      return NextResponse.json({ error: data.message || "Error en MP" }, { status: response.status });
    }

    // Devolvemos el init_point para que el modal redirija al barbero
    return NextResponse.json({ init_point: data.init_point });

  } catch (error: any) {
    console.error("🔥 Error interno:", error);
    return NextResponse.json({ error: "Error al conectar con Mercado Pago" }, { status: 500 });
  }
}