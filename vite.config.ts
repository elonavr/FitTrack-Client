import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// `npm run dev:phone`: https on the LAN (camera needs a secure origin) with /api proxied to the local API.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "phone" ? [basicSsl()] : [])],
  server: {
    port: 5173,
    host: mode === "phone",
    proxy: { "/api": "http://localhost:5001" },
  },
}));
