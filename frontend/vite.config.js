import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/game': { target: 'http://localhost:8000', changeOrigin: true },
            '/signup': { target: 'http://localhost:8000', changeOrigin: true },
            '/login': { target: 'http://localhost:8000', changeOrigin: true },
            '/users': { target: 'http://localhost:8000', changeOrigin: true },
            '/leaderboard': { target: 'http://localhost:8000', changeOrigin: true },
            '/notifications': { target: 'http://localhost:8000', changeOrigin: true },
            '/upload-avatar': { target: 'http://localhost:8000', changeOrigin: true },
            '/update-profile': { target: 'http://localhost:8000', changeOrigin: true },
            '/uploads': { target: 'http://localhost:8000', changeOrigin: true },
            '/ws': { target: 'ws://localhost:8000', ws: true },
        },
    },
});
