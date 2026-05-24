import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Euskara SRS — Aprende Euskera con Repetición Espaciada",
  description: "Aprende vocabulario en euskera de manera eficiente usando el algoritmo científico de repetición espaciada (SM-2).",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Euskara SRS",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
