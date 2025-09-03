import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { PropsWithChildren} from "react";

export type ColorScheme = "light" | "dark";
interface Context { scheme: ColorScheme; toggle: () => void; }

const ThemeContext = createContext<Context | null>(null);
const STORAGE_KEY = "bp_color_scheme";

export function AppThemeProvider({ children }: PropsWithChildren) {
  const initial = (): ColorScheme => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY) as ColorScheme | null;

      if (saved === "light" || saved === "dark") {
        return saved;
      }
    }
    return "light";
  };

  const [scheme, setScheme] = useState<ColorScheme>(initial);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, scheme);
    }
  }, [scheme]);

  const theme = useMemo(
    () => createTheme({ palette: { mode: scheme } }),
    [scheme]
  );

  const value = useMemo<Context>(
    () => ({
      scheme,
      toggle: () => setScheme(
        (s) => (s === "light" ? "dark" : "light")
      )
    }),
    [scheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useColorScheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useColorScheme must be used within AppThemeProvider");
  }

  return context;
}
