import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'libs/ui');
// Keep official CLI sources in place while exposing each installed primitive to ng-packagr.
for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
  if (!entry.isDirectory() || !fs.existsSync(path.join(directory, entry.name, 'src/index.ts')))
    continue;
  const file = path.join(directory, entry.name, 'ng-package.json');
  if (!fs.existsSync(file))
    fs.writeFileSync(file, JSON.stringify({ lib: { entryFile: 'src/index.ts' } }, null, 2) + '\n');
}
