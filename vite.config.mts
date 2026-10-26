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
  optimizeDeps: {
    // Imported only by the story run's setup (`src/stories/utils/motion.ts`): listed, so it is
    // bundled with the other dependencies before the first story runs, not when a story finds it,
    // which reloaded the page in the middle of the run.
    include: ['@react-spring/shared'],
  },
});
