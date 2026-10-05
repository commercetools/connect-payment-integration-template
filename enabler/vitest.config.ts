import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['./test/**/*.spec.ts'],
    clearMocks: false,
    mockReset: false,
    restoreMocks: false,
  },
});
