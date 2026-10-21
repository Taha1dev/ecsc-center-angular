import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  resolve: {
    alias: {
      '@workspace/domain': fileURLToPath(
        new URL('./packages/domain/src/index.ts', import.meta.url),
      ),
      '@workspace/data-access': fileURLToPath(
        new URL('./packages/data-access/src/index.ts', import.meta.url),
      ),
      '@workspace/ui': fileURLToPath(new URL('./packages/ui/src/index.ts', import.meta.url)),
    },
  },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
