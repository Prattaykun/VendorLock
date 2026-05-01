import type { Metadata } from "next";
import HorecaSidebar from "@/components/horeca/HorecaSidebar";

export const metadata: Metadata = {
  title: "VendorLock AI - HORECA Procurement",
  description: "Advanced Procurement Intelligence for Hotels, Restaurants & Cafes",
};

export default function HorecaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex bg-[#081425] antialiased">
      <HorecaSidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
