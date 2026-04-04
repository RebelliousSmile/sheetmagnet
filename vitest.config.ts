import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/connectors/**/*.ts',
        'src/lib/templates/**/*.ts',
        'src/lib/stores/**/*.ts',
        'src/lib/export/**/*.ts',
      ],
      exclude: ['src/lib/**/*.test.ts', 'src/lib/**/index.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
});
