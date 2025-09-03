import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type User = { id: string; email: string; name?: string | null; roles?: string[] };
type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthReactContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    const u = localStorage.getItem("user");
    if (t && u) {
      setAccessToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {
        /* empty */
      }
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((token: string, usr: User) => {
    setAccessToken(token);
    setUser(usr);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(usr));
  }, []);

  // Temporary stubs - replace with requests to FastAPI later
  const signIn = useCallback(async (email: string, password: string) => {
    void password; // mark as intentionally unused (until backend wired)
    persist("dev-token", { id: "u1", email, roles: ["user"] });
  }, [persist]);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    void password; // mark as intentionally unused (until backend wired)
    persist("dev-token", { id: "u1", email, name: name ?? null, roles: ["user"] });
  }, [persist]);

  const signOut = useCallback(async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, accessToken, isLoading, signIn, signUp, signOut }),
    [user, accessToken, isLoading, signIn, signUp, signOut]
  );

  return <AuthReactContext.Provider value={value}>{children}</AuthReactContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthReactContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};





