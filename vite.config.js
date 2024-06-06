import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 3000,
        rollupOptions: {
            output: {
                chunkFileNames: "assets/chunks/chunk-[hash].js",
                entryFileNames: "assets/js/app-[hash].js",
                assetFileNames: "assets/[ext]/css-[hash].[ext]",
            },
        },
    },
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
});
