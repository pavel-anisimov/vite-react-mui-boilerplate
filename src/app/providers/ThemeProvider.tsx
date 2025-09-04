import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { PropsWithChildren } from "react";

export type ColorScheme = "light" | "dark";
interface Context { scheme: ColorScheme; toggle: () => void; }

const ThemeContext = createContext<Context | null>(null);
const STORAGE_KEY = "bp_color_scheme";

/**
 * Provides theme management for the application, including the ability to toggle
 * between light and dark modes. This component wraps its children with a ThemeProvider
 * and makes the current theme and toggle function available via a context.
 *
 * @param {PropsWithChildren} props - The properties passed to the AppThemeProvider,
 *                                    including children to render within the component.
 * @param {React.ReactNode} props.children - The child components to be rendered inside the provider.
 * @return {React.ReactElement} Returns a theme-enabled React component hierarchy
 *                              including the provided children and context.
 * @constructor
 */
export function AppThemeProvider({ children }: PropsWithChildren): React.ReactElement {
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

  /**
   * Represents the theme configuration to be used throughout the application,
   * which dynamically adapts based on the provided scheme.
   *
   * This variable utilizes the useMemo hook to memoize the result of
   * createTheme, ensuring that the theme object is only recalculated
   * when the scheme dependency changes.
   *
   * The theme is constructed using the createTheme function, which generates
   * a theme configuration object. The palette property is set with a mode
   * determined by the value of the scheme.
   *
   * Dependencies:
   * - scheme: The current color mode, typically 'light' or 'dark',
   *   which determines the theme palette's mode.
   */
  const theme = useMemo(
    () => createTheme({ palette: { mode: scheme } }),
    [scheme]
  );

  /**
   * Memoized context value for theme management.
   *
   * This variable uses the `useMemo` React hook to create an object containing
   * the current color scheme and a toggle function to switch between "light"
   * and "dark" themes. The memoized value is recalculated only when the
   * `scheme` dependency changes, optimizing rendering performance.
   *
   * @type {Context}
   */
  const value: Context = useMemo<Context>(
    () => ({
      scheme,
      toggle: () => setScheme(
        (scheme) => (scheme === "light" ? "dark" : "light")
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
