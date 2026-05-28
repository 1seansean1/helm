import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Base path: served from root on custom domain / S3; from /helm/ on GitHub Pages.
// Set VITE_BASE at build time, default "/".
declare const process: { env: Record<string, string | undefined> };
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "robots.txt"],
      manifest: {
        name: "Helm — Frontier AI for Product Leaders",
        short_name: "Helm",
        description:
          "Coaching companion for product designers leading consumer-facing frontier-model AI in banking and fintech. Bring-your-own Claude API key.",
        theme_color: "#0b0f17",
        background_color: "#0b0f17",
        display: "standalone",
        orientation: "portrait",
        scope: base,
        start_url: base,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
        // Don't cache API calls to Anthropic
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  server: { port: 5173 },
  preview: { port: 4173 },
});
