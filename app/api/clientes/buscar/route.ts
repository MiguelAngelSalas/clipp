import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const whatsapp = searchParams.get("whatsapp");
  const id_comercio = searchParams.get("id_comercio");

  if (!whatsapp || !id_comercio) return NextResponse.json(null);

  const cliente = await prisma.clientes.findFirst({
    where: {
      whatsapp: whatsapp,
      id_comercio: Number(id_comercio)
    },
    select: { nombre_cliente: true }
  });

  return NextResponse.json(cliente);
}