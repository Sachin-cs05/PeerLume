import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'monaco-editor/esm/vs/editor/editor.api.js': path.resolve(
        __dirname,
        '../../node_modules/monaco-editor/esm/vs/editor/editor.api.js'
      ),
      'monaco-editor': path.resolve(__dirname, '../../node_modules/monaco-editor'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('monaco-editor') || id.includes('yjs') || id.includes('y-monaco') || id.includes('y-protocols') || id.includes('lib0')) {
              return 'vendor-editor';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('socket.io-client')) {
              return 'vendor-socket';
            }
            return 'vendor-misc';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
