import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// BASE_PATH is set for GitHub Pages builds, e.g. BASE_PATH=/Portfolio/ npm run build
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 600 },
});
