import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// During development, API and uploaded files are proxied to the Express backend.
// Values come from the .env file next to this config (defaults keep it working without one).
export default defineConfig(({ mode }) => {
  // The '' prefix loads every variable, not only the VITE_ ones. These stay in this
  // config file and are not exposed to the browser code.
  const env = loadEnv(mode, process.cwd(), '');

  const serverUrl = env.SERVER_URL || 'http://localhost:5000';
  const port = Number(env.PORT) || 5173;

  return {
    plugins: [react()],
    server: {
      port,
      proxy: {
        '/api': serverUrl,
        '/uploads': serverUrl,
      },
    },
  };
});