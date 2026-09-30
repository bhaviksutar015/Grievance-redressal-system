import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server: binds 0.0.0.0 so the sandbox preview works, and proxies /api to
// the Express backend so the browser never needs to reach localhost:4000.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
