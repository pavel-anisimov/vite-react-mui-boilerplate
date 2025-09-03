
import {render, screen} from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";

import type { RenderResult} from "@testing-library/react";

import App from "@/app/App";
import { AppQueryProvider } from "@/app/providers/QueryProvider";
import { AppThemeProvider } from "@/app/providers/ThemeProvider";
import "@/i18n/i18n";

/**
 * Renders the provided UI element within the necessary application context providers.
 * These providers include routing, theming, and query management to simulate the app's environment.
 *
 * @param {React.ReactElement} ui - The UI element to be rendered within the provided application context.
 * @return {RenderResult} The result of the render, which includes utilities for testing the rendered output.
 */
function renderWithProviders(ui: React.ReactElement): RenderResult {
  return render(
    <BrowserRouter>
      <AppQueryProvider>
        <AppThemeProvider>{ui}</AppThemeProvider>
      </AppQueryProvider>
    </BrowserRouter>
  );
}

describe("App",
  /**
   * Test to ensure that the navigation items are rendered correctly in the application.
   *
   * This test checks if a button with the name "menu" or "меню" is present in the
   * document after rendering the application with the provided test utilities.
   */
  () => {
  it("renders nav items",
    /**
     * Asynchronous test function to render the application component using the `renderWithProviders` utility function.
     * It asserts that a button with the role "button" and a name matching "menu" or "меню" (case-insensitive)
     * is present in the document.
     */
    async () => {
      renderWithProviders(<App />);
      expect(await screen.findByRole("button", { name: /menu|меню/i })).toBeInTheDocument();
    }
  );
});

