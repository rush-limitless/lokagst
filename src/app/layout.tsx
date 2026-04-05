import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ImmoGest — Gestion Locative",
  description: "Application de gestion des locataires et loyers pour IMMOSTAR SCI",
  manifest: "/manifest.json",
  themeColor: "#1B6B9E",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className={inter.className}>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
