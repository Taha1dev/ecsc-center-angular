import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
const paths = JSON.parse(fs.readFileSync(new URL('./tsconfig.json', import.meta.url), 'utf8'))
  .compilerOptions.paths as Record<string, string[]>;
export default defineConfig({
  resolve: {
    alias: Object.fromEntries(
      Object.entries(paths)
        .filter(([alias]) => !alias.includes('*'))
        .map(([alias, [target]]) => [alias, fileURLToPath(new URL(target, import.meta.url))]),
    ),
  },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
