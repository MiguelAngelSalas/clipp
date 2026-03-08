import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth"; // Importamos el tipo para mejor soporte
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 🛡️ 1. Definimos authOptions por separado y lo exportamos
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("------------------------------------------");
        console.log("🔍 INTENTO DE LOGIN:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan credenciales.");
        }

        try {
          const usuario = await prisma.comercios.findUnique({
            where: { email_unico: credentials.email },
          });

          if (!usuario) {
            console.log("❌ ERROR: Usuario no encontrado");
            throw new Error("El email no está registrado.");
          }

          const passwordCorrecta = await bcrypt.compare(credentials.password, usuario.contrasena);
          
          if (!passwordCorrecta) {
            console.log("❌ ERROR: Password incorrecta");
            throw new Error("Contraseña incorrecta.");
          }

          if (!usuario.emailVerificado) {
            console.log("⚠️ ADVERTENCIA: Usuario no verificado");
            throw new Error("Tu cuenta aún no ha sido verificada.");
          }

          console.log("🚀 LOGIN EXITOSO:", usuario.nombre_empresa);

          return {
            id: usuario.id_comercio.toString(),
            name: usuario.nombre_empresa,
            email: usuario.email_unico,
            id_comercio: usuario.id_comercio,
            slug: usuario.slug,
            nombre_empresa: usuario.nombre_empresa,
            suscrito: usuario.suscrito,
          };
        } catch (error: any) {
          throw new Error(error.message || "Error en el servidor");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.id_comercio = user.id_comercio;
        token.slug = user.slug;
        token.nombre_empresa = user.nombre_empresa;
        token.suscrito = user.suscrito;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.id_comercio = token.id_comercio;
        session.user.slug = token.slug;
        session.user.nombre_empresa = token.nombre_empresa;
        session.user.suscrito = token.suscrito;
        session.user.name = token.nombre_empresa;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 🛡️ 2. El handler usa las opciones definidas arriba
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };