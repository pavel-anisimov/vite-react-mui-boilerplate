import { renderHook, act } from "@testing-library/react";
import React from "react";
import { describe, it, expect } from "vitest";

import type {JSX} from "react";

import { AppThemeProvider, useColorScheme } from "@/app/providers/ThemeProvider";

/**
 * A wrapper component that provides an application-wide theme context.
 *
 * @param {Object} props - The props object for the wrapper component.
 * @param {React.ReactNode} props.children - The child elements or components to be wrapped inside the theme provider.
 * @return {JSX.Element} The component wrapped with the application theme provider.
 */
function wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <AppThemeProvider>{children}</AppThemeProvider>;
}

describe("ThemeProvider",
  /**
   * Test suite for the color scheme toggle functionality provided by the `useColorScheme` hook.
   *
   * This test verifies that:
   * - The color scheme toggles correctly between states when invoked.
   * - The updated color scheme value is correctly persisted to `localStorage` under the key `bp_color_scheme`.
   *
   * The `renderHook` utility is used to mount and test the hook within the provided wrapper.
   */
  () => {
    it("toggles color scheme and persists to localStorage", () => {
      const { result } = renderHook((): Context => useColorScheme(), { wrapper });
      const initial = result.current.scheme;

      act(() => result.current.toggle());

      expect(result.current.scheme).not.toBe(initial);
      expect(localStorage.getItem("bp_color_scheme")).toBe(result.current.scheme);
    });
  });
