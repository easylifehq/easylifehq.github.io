import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }

          if (id.includes("node_modules/react-router-dom") || id.includes("node_modules/@remix-run")) {
            return "vendor-router";
          }

          if (id.includes("node_modules/@firebase/")) {
            const firebasePackage = id.split("node_modules/@firebase/")[1]?.split(/[\\/]/)[0];
            return firebasePackage ? `firebase-${firebasePackage}` : "firebase";
          }

          if (id.includes("node_modules/firebase/")) {
            return "firebase";
          }
        },
      },
    },
  },
});
