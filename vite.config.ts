import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": "/src" } },
  test: { environment: "jsdom", setupFiles: ["./src/setupTests.ts"], css: true }
});

