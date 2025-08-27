import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";

import App from "@/app/App";
import { AppQueryProvider } from "@/app/providers/QueryProvider";
import { AppThemeProvider } from "@/app/providers/ThemeProvider";
import "@/i18n/i18n";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AppQueryProvider>
        <AppThemeProvider>{ui}</AppThemeProvider>
      </AppQueryProvider>
    </BrowserRouter>
  );
}

describe("App", () => {
  it("renders nav items", async () => {
    renderWithProviders(<App />);
    expect(await screen.findByRole("button", { name: /menu|меню/i })).toBeInTheDocument();
  });
});

