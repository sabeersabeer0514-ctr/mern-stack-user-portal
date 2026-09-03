import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Fix: dot (.) to slash (/)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});