import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ensure a single React instance across stories, the renderer and styled-components.
    // Webpack deduped automatically; Vite needs this to avoid
    // "A React Element from an older version of React was rendered".
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
});
