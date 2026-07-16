import type { Metadata } from "next";
import Nav from "@/components/nav";
import SessionProvider from "@/components/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arcade Vault · Portal Retro",
  description:
    "Plataforma para jugar online y competir por la mayor puntuación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* SPEC 01: el <link> a Google Fonts es una decisión tomada, no un descuido.
            La alternativa autoalojada es next/font/google. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Courier+Prime:wght@400;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="av-bg"></div>
        <div className="av-noise"></div>
        {/* #root no es un resto de React DOM: globals.css lo usa como marco de la app
            (position: relative; z-index: 2) para quedar por encima de .av-bg y .av-noise. */}
        <div id="root">
          <SessionProvider>
            <Nav />
            <main className="av-main">{children}</main>
          </SessionProvider>
          <footer
            style={{
              borderTop: "1px solid var(--line)",
              padding: "20px 32px",
              textAlign: "center",
              color: "var(--ink-faint)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
            }}
          >
            © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
          </footer>
        </div>
      </body>
    </html>
  );
}
