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
});
