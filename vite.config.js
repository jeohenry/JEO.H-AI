import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),   // "@/..." → src/...
      "~": path.resolve(__dirname, "src"),   // "~/" → src/...
      "src": path.resolve(__dirname, "src"), // "src/..." → src/...
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      external: ["jspdf"], // 👈 Prevent Rollup from bundling jspdf
    },
  },
});