"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    
    // List of public routes that don't need auth
    const publicRoutes = ["/login", "/", "/certificate/verify"];
    const isPublicRoute = publicRoutes.some(r => pathname?.startsWith(r));

    if (!token && !isPublicRoute) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  // If not authenticated and trying to access a private route, don't render children
  // (router.push in useEffect will redirect them)
  const isPublicRoute = ["/login", "/", "/certificate/verify"].some(r => pathname?.startsWith(r));
  if (!isAuthenticated && !isPublicRoute) {
    return null; 
  }

  return <>{children}</>;
}
