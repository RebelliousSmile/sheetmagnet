import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/connectors/**/*.ts', 'src/lib/templates/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts', 'src/lib/**/index.ts'],
      thresholds: { lines: 100, functions: 100, branches: 100 },
    },
  },
});
