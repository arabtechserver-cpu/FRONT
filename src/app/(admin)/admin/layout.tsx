import type { Metadata } from "next";
import { Cairo, Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../../globals.css";
import "@/styles/admin-theme.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", weight: ["400", "500", "600", "700", "800", "900"], display: "swap" });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Admin Dashboard | BORAI STORE",
  description: "Admin Management Portal",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logo_en.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/images/logo_en.png',
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark admin-site">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} ${jakarta.variable} ${jetbrains.variable} admin-theme font-sans bg-background text-on-surface antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
