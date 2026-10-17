import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5000",
      "/socket.io": { target: "http://127.0.0.1:5000", ws: true },
    },
  },
  build: {
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "charts",
              test: /node_modules\/(recharts|d3-|victory)/,
              priority: 30,
            },
            {
              name: "motion",
              test: /node_modules\/(framer-motion|motion-)/,
              priority: 20,
            },
            {
              name: "react",
              test: /node_modules\/(react-dom|react-router|react\/|scheduler)/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
