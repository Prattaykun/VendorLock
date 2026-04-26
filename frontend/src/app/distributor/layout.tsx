import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Noto_Sans_Devanagari } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

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
  title: "VendorLock Distributor Dashboard",
  description: "Human-in-the-loop control tower for distributor decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hindiSans.variable} h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

