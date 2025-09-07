// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "~": path.resolve(__dirname, "src"),
        src: path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 5173, // ✅ Default dev port (you can change if needed)
      open: true, // ✅ Auto-open browser on dev start
      proxy: {
        // ✅ Example proxy for API requests in development
        "/api": {
          target:
            mode === "development"
              ? "http://localhost:8000" // local backend
              : "https://your-api.onrender.com", // production backend
          changeOrigin: true,
          secure: false,
        },
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
  };
});