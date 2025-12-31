import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { viteSourceLocator } from '@metagptx/vite-plugin-source-locator';
import fs from 'fs';

// Read build number from timeline
let buildNumber = '1';
try {
  const timelineData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.timeline.json'), 'utf-8'));
  buildNumber = timelineData.timeline_index?.toString() || '1';
} catch (error) {
  console.warn('Could not read timeline_index, using default build number');
}

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