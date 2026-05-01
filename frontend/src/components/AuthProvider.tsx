"use client";

import {
  createContext, useContext, useEffect, useState, useCallback, type ReactNode
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe, logout as apiLogout, setAuthToken, setAuthTokenSession, getAuthToken } from "@/lib/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  user_id: string;
  tenant_id: string;
  role: string;
  email: string;
  full_name?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** Login with token — set rememberMe=true to persist in localStorage */
  setSession: (token: string, rememberMe?: boolean) => void;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  loading: true,
  setSession: () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ── Public routes that don't require authentication ───────────────────────────

const PUBLIC_ROUTES = ["/login", "/register", "/", "/certificate/verify"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((r) => pathname?.startsWith(r));
}

// ── Provider ──────────────────────────────────────────────────────────────────

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /** Validate stored token by calling /auth/me. */
  const validateToken = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await getMe();
      setUser(me);
      setLoading(false);
      return me;
    } catch {
      // Token is invalid / expired — clear it
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  /** Called by login page after a successful /auth/login response. */
  const setSession = useCallback((token: string, rememberMe = true) => {
    if (rememberMe) {
      setAuthToken(token);
    } else {
      setAuthTokenSession(token);
    }
  }, []);

  /** Logout: call API, clear token, redirect to /login. */
  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    router.push("/login");
  }, [router]);

  // Validate token on mount and on route change
  useEffect(() => {
    validateToken().then((me) => {
      if (!me && !isPublicRoute(pathname)) {
        router.push("/login");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Global API error listener
  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message } = customEvent.detail;
      // Dynamically import toast to avoid SSR issues if any
      import("sonner").then(({ toast }) => {
        toast.error("API Error", { description: message });
      });
    };

    window.addEventListener("api-error", handleApiError);
    return () => window.removeEventListener("api-error", handleApiError);
  }, []);

  // Loading spinner (match existing design)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" />
      </div>
    );
  }

  // Block private routes for unauthenticated users (router.push is async, prevent flash)
  if (!user && !isPublicRoute(pathname)) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
