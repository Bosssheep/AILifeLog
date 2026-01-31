/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- 确保这行正确，它代表扫描 src 下所有 jsx 文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
