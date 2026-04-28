import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Noto_Sans_Devanagari } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hindiSans = Noto_Sans_Devanagari({
  variable: "--font-hindi-sans",
  subsets: ["devanagari", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VendorLock AI",
  description: "Advanced Trade Intelligence & Risk Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hindiSans.variable} h-full antialiased dark`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
            font-family: 'Material Symbols Outlined';
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>{children}</AuthProvider>
          </TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}