import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const vitePort = Number(process.env.VITE_PORT) || 5174;

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: vitePort,
    strictPort: true
  }
});