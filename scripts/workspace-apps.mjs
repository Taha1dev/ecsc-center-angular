import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Center tooling uses apps with explicit server ports and build outputs.
// A plain Angular CLI app may not have these center-specific settings yet.
export function workspaceApps(root = workspaceRoot, { requireFiles = true } = {}) {
  const workspace = JSON.parse(fs.readFileSync(path.join(root, 'angular.json'), 'utf8'));
  return Object.entries(workspace.projects)
    .filter(
      ([, project]) =>
        project.projectType === 'application' &&
        (!requireFiles ||
          (typeof project.sourceRoot === 'string' &&
            fs.existsSync(path.join(root, project.sourceRoot, 'main.ts')))) &&
        Number.isInteger(project.architect?.serve?.options?.port) &&
        project.architect?.build?.options?.outputPath,
    )
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
