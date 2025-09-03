// src/app/providers/AuthProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { login as apiLogin, me as apiMe } from "@/api/auth";

type User = { id: string; email: string; name?: string | null; roles?: string[] };

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken?: string) => void; // for refresh from the interceptor if desired
};

const AuthReactContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reading from localStorage and trying to pull up a profile
  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { accessToken?: string; refreshToken?: string };
        if (parsed.accessToken) setAccessToken(parsed.accessToken);
        if (parsed.refreshToken) setRefreshToken(parsed.refreshToken);
      } catch {
        // invalid JSON - let's clean it up just in case
        localStorage.removeItem("auth");
      }
    }

    // if there is an accessToken, we try to get the profile
    (async () => {
      try {
        if (localStorage.getItem("auth")) {
          const u = await apiMe();
          setUser(u);
        }
      } catch {
        // token is invalid, leave logged out
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistTokens = useCallback((access: string, refresh?: string) => {
    const next = {
      accessToken: access,
      refreshToken: refresh ?? refreshToken ?? null,
    };
    localStorage.setItem("auth", JSON.stringify(next));
    setAccessToken(next.accessToken);
    if (refresh ?? null) setRefreshToken(refresh!);
  }, [refreshToken]);

  const setTokens = useCallback((access: string, refresh?: string) => {
    persistTokens(access, refresh);
  }, [persistTokens]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken } = await apiLogin({ email, password });
    persistTokens(accessToken, refreshToken);
    const u = await apiMe();
    setUser(u);
  }, [persistTokens]);

  // Заглушка — когда появится /auth/register на Gateway, дерни его здесь
  const signUp = useCallback(async (_email: string, _password: string, _name?: string) => {
    throw new Error("Registration is not implemented yet on API-Gateway");
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem("auth");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    accessToken,
    isLoading,
    signIn,
    signUp,
    signOut,
    setTokens,
  }), [user, accessToken, isLoading, signIn, signUp, signOut, setTokens]);

  return <AuthReactContext.Provider value={value}>{children}</AuthReactContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthReactContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
