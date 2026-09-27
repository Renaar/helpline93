import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // One bundle is fine: the whole game must stay under 10 MB (GDD 8.9), it is ~2 MB today.
    chunkSizeWarningLimit: 1500,
  },
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
  },
});
