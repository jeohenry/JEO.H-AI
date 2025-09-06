import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "~": path.resolve(__dirname, "src"),
      "src": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true, // ✅ enable source maps for debugging
    rollupOptions: {
      // ⚠️ Don't mark these as external unless you load them via CDN
      // external: ["jspdf", "jspdf-autotable", "react-hot-toast"],
    },
  },
});