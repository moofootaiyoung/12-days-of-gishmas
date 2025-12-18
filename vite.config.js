import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    // Fallback config to prevent crash if .env is missing
    var fallbackConfig = JSON.stringify({
        apiKey: "demo-key",
        authDomain: "demo.firebaseapp.com",
        projectId: "demo-project",
        storageBucket: "demo.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef"
    });
    return {
        plugins: [react()],
        define: {
            __firebase_config: JSON.stringify(env.VITE_FIREBASE_CONFIG || fallbackConfig),
            __initial_auth_token: "undefined",
            __app_id: JSON.stringify(env.VITE_APP_ID || 'local-dev-app')
        }
    };
});
