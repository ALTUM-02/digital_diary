import { useState, useEffect, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import type { User } from "@/types";
import { apiLogin, apiMe, clearToken, getToken, USE_MOCK } from "@/lib/api";
import { MOCK_USERS } from "@/lib/mock-data";

const STORAGE_KEY = "diaryverse_auth";

function AuthProviderImpl() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const token = getToken();
      if (!token) {
        // No token — try localStorage fallback (for mock mode)
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored && mounted) {
            setUser(JSON.parse(stored) as User);
          }
        } cat
          // ignore
        }
        if (mounted) setIsLoading(false);
        return;
      }

      if (USE_MOCK) {
        // Mock mode — restore from localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored && mounted) {
            setUser(JSON.parse(stored) as User);
          }
        } catch {
          // ignore
        }
        if (mounted) setIsLoading(false);
        return;
      }

      // Real API — fetch me with token
      const meUser = await apiMe();
      if (mounted) {
        if (meUser) {
          setUser(meUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(meUser));
        } else {
          // Token invalid — clear
          clearToken();
          localStorage.removeItem(STORAGE_KEY);
        }
        setIsLoading(false);
      }
    }

    init();

    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const result = await apiLogin(email, password);
    if (result) {
      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearToken();
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isAdmin = user?.role === "admin";

  return { user, isLoading, isAdmin, login, logout };
}

const [AuthProvider, useAuth] = createContextHook(AuthProviderImpl);

export { AuthProvider, useAuth };
