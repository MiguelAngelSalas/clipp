import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const comercio = await prisma.comercios.findUnique({
    where: { email_unico: email },
    select: { suscrito: true } 
  });

  return NextResponse.json({ suscrito: comercio?.suscrito || false });
}