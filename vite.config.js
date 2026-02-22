import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/AILifeLog/",
  plugins: [react()],
  // ... 其他配置
});
