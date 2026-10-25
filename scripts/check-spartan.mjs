import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'libs/ui');
const installed =
  fs.existsSync(directory) &&
  fs
    .readdirSync(directory, { withFileTypes: true })
    .some(
      (entry) =>
        entry.isDirectory() && fs.existsSync(path.join(directory, entry.name, 'src/index.ts')),
    );

if (!installed) {
  console.log('No Spartan Helm components installed. Add components when needed.');
} else {
  const result = spawnSync(
    process.execPath,
    [
      path.join(root, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'),
      '-p',
      path.join(directory, 'tsconfig.json'),
      '--noEmit',
    ],
    { cwd: root, stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
