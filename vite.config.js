import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
      process.env.VITE_API_BASE_URL || process.env.NODE_ENV === "production"
        ? "https://ailifelog-production-alex.up.railway.app"
        : "http://localhost:4000",
    ),
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
