import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Tooling discovers applications from Angular CLI; no runtime center registry is needed.
export function workspaceApps(root = workspaceRoot) {
  const workspace = JSON.parse(fs.readFileSync(path.join(root, 'angular.json'), 'utf8'));
  return Object.entries(workspace.projects)
    .filter(([, project]) => project.projectType === 'application')
    .map(([id, project]) => {
      const devPort = project.architect.serve.options.port;
      const output = project.architect.build.options.outputPath;
      return {
        id,
        devPort,
        previewPort: devPort + 100,
        output: path.resolve(root, typeof output === 'string' ? output : output.base, 'browser'),
      };
    });
}
