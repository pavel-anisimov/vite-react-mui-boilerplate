import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@/styles/index.css";
import App from "@/app/App";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { AppQueryProvider } from "@/app/providers/QueryProvider";
import { AppThemeProvider } from "@/app/providers/ThemeProvider";
import "@/i18n/i18n"; // internalization i18n


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppQueryProvider>
        <AppThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppThemeProvider>
      </AppQueryProvider>
    </BrowserRouter>
  </StrictMode>
);
