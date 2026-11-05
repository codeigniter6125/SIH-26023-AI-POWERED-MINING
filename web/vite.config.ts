import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const BACKEND = "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: BACKEND, changeOrigin: true },
      "/health": { target: BACKEND, changeOrigin: true },
    },
  },
  build: { chunkSizeWarningLimit: 1200 },
  test: { environment: "node" },
});
