import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(req: Request) {
  try {
    const { email, nombreComercio } = await req.json();
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, "");

    console.log("🚀 Enviando a MP -> URL:", baseUrl);

    const preference = new Preference(client);
    
    // Forzamos el objeto body con una estructura más plana
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'suscripcion-mensual',
            title: `Plan SaaS - ${nombreComercio}`,
            quantity: 1,
            unit_price: 5000, 
            currency_id: 'ARS',
          }
        ],
        payer: { 
          email: email 
        },
        // Probamos sin la redirección automática un segundo para ver si el problema es SOLO auto_return
        // O mejor: nos aseguramos que las URLs sean IDENTICAS y válidas.
        back_urls: {
          success: `${baseUrl}`,
          failure: `${baseUrl}`,
          pending: `${baseUrl}`
        },
        /*auto_return: "approved" */
      }
    });

    return NextResponse.json({ init_point: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MP:", error);
    // Extraemos el detalle si MP lo manda en la respuesta
    const errorDetail = error.response?.data?.message || error.message;
    return NextResponse.json({ 
      error: "Error al crear pago",
      detalle: errorDetail
    }, { status: 500 });
  }
}