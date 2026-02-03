// src/lib/whatsapp.ts

const META_TOKEN = process.env.META_WA_TOKEN;
const META_PHONE_ID = process.env.META_PHONE_ID;

export async function enviarWhatsAppConfirmacion(telefono: string, nombre: string, fechaHora: string) {
  
  // Limpieza de número (Standard para Argentina)
  let fono = telefono.replace(/\D/g, ""); 
  if (fono.startsWith("0")) fono = fono.substring(1);
  if (fono.startsWith("15")) fono = fono.substring(2);
  if (!fono.startsWith("54")) fono = "549" + fono;

  // --- MODO SIMULACIÓN (Si no hay credenciales) ---
  if (!META_TOKEN || !META_PHONE_ID) {
    console.log(`\n🔔 [SIMULACION WHATSAPP]`);
    console.log(`   🚀 Enviando a: ${fono}`);
    console.log(`   👤 Cliente: ${nombre}`);
    console.log(`   📅 Turno: ${fechaHora}`);
    console.log(`   ✅ Estado: SIMULADO (Falta configurar .env)\n`);
    return true; // Devolvemos true para que el sistema crea que se envió
  }

  // --- MODO REAL (Cuando Meta te deje entrar) ---
  const url = `https://graph.facebook.com/v17.0/${META_PHONE_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: fono,
    type: "template",
    template: {
      name: "confirmacion_turno", // Acordate de crear esta plantilla mañana
      language: { code: "es_AR" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombre },
            { type: "text", text: fechaHora }
          ]
        }
      ]
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${META_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        console.error("❌ Error Real Meta:", err);
        return false;
    }
    
    console.log("✅ WPP Real Enviado a", fono);
    return true;

  } catch (e) {
    console.error("❌ Error de red:", e);
    return false;
  }
}