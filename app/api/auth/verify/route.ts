import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
        return NextResponse.json({ message: "Token requerido" }, { status: 400 })
    }

    try {
        // Buscamos al comercio que tenga ese token
        const comercio = await prisma.comercios.findUnique({
            where: { verificationToken: token }
        })

        if (!comercio) {
            return NextResponse.json({ message: "Token inválido o expirado" }, { status: 404 })
        }

        // Marcamos como verificado y borramos el token para que no se reuse
        await prisma.comercios.update({
            where: { id_comercio: comercio.id_comercio },
            data: {
                emailVerificado: true,
                verificationToken: null
            }
        })

        return NextResponse.json({ message: "Email verificado correctamente" })

    } catch (error) {
        return NextResponse.json({ message: "Error interno" }, { status: 500 })
    }
}