import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Fallback config as a literal object
  const fallbackConfig = {
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  };

  // Parse the env var if it exists, otherwise use fallback
  let firebaseConfig;
  try {
    firebaseConfig = env.VITE_FIREBASE_CONFIG ? JSON.parse(env.VITE_FIREBASE_CONFIG) : fallbackConfig;
  } catch (e) {
    console.error("Failed to parse VITE_FIREBASE_CONFIG, using fallback", e);
    firebaseConfig = fallbackConfig;
  }

  return {
    plugins: [react()],
    define: {
      // Define these as literal objects/values, not double-stringified strings
      __firebase_config: JSON.stringify(firebaseConfig),
      __initial_auth_token: JSON.stringify(env.VITE_INITIAL_AUTH_TOKEN || null),
      __app_id: JSON.stringify(env.VITE_APP_ID || 'local-dev-app')
    }
  }
})
