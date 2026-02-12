import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log("🔔 ¡LLEGÓ EL POST DE TELEGRAM!");
  return NextResponse.json({ ok: true });
}

export async function GET() {
  console.log("🔔 ¡LLEGÓ UN GET DESDE EL NAVEGADOR!");
  return NextResponse.json({ 
    status: "online", 
    message: "Si ves esto, la ruta funciona perfectamente" 
  });
}