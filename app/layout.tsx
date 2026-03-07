import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Toaster } from "sonner";
import { Providers } from "./providers"; // 👈 Importamos el nuevo wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clipp",
  description: "Sistema de gestión para barberías",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 🛡️ Envolvemos TODO con Providers */}
        <Providers>
          <Theme> 
              {children} 
          </Theme>
        </Providers>

        <Toaster 
            position="bottom-right" 
            richColors 
            style={{ zIndex: 99999, position: 'fixed' }} 
        />
      </body> 
    </html>
  );
}