import { renderHook, act } from "@testing-library/react";
import React from "react";
import { describe, it, expect } from "vitest";

import { AppThemeProvider, useColorScheme } from "@/app/providers/ThemeProvider";


function wrapper({ children }: { children: React.ReactNode }) {
return <AppThemeProvider>{children}</AppThemeProvider>;
}


describe("ThemeProvider", () => {
  it("toggles color scheme and persists to localStorage", () => {
    const { result } = renderHook(() => useColorScheme(), { wrapper });
    const initial = result.current.scheme;

    act(() => result.current.toggle());

    expect(result.current.scheme).not.toBe(initial);
    expect(localStorage.getItem("bp_color_scheme")).toBe(result.current.scheme);
  });
});
