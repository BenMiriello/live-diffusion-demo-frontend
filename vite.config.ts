import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd())
  
  // Get SSL paths from env vars or use defaults
  const sslKeyPath = env.VITE_SSL_KEY_PATH || path.resolve(__dirname, '.cert/key.pem')
  const sslCertPath = env.VITE_SSL_CERT_PATH || path.resolve(__dirname, '.cert/cert.pem')
  
  return {
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    },
    host: true,
    port: parseInt(env.VITE_APP_PORT || '5173'),
    cors: true
  }
  };
};
