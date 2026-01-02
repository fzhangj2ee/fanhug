import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { viteSourceLocator } from '@metagptx/vite-plugin-source-locator';

// Build number is now hardcoded to 176 as requested
const buildNumber = '176';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    viteSourceLocator({
      prefix: 'mgx',
    }),
    react(),
  ],
  define: {
    'import.meta.env.VITE_BUILD_NUMBER': JSON.stringify(buildNumber),
  },
  server: {
    watch: { usePolling: true, interval: 800 /* 300~1500 */ },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));