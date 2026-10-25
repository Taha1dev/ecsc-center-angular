import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { workspaceRoot } from './workspace-apps.mjs';

// Only center-scoped component/page shorthand is translated. Other CLI calls pass through.
export function angularArgs(args, workspace, root = workspaceRoot) {
  if (!['g', 'generate'].includes(args[0])) return args;
  const apps = Object.entries(workspace.projects)
    .filter(([, project]) => project.projectType === 'application')
    .map(([id]) => id);
  let center;
  const forwarded = [];
  const select = (id) => {
    if (center) throw new Error('Select exactly one center.');
    if (!apps.includes(id)) throw new Error(`Unknown center: ${id}. Choose ${apps.join(', ')}.`);
    center = id;
  };
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (['--center', '--center-name'].includes(arg)) select(args[++i]);
    else if (/^--(?:center|center-name)=/.test(arg)) select(arg.slice(arg.indexOf('=') + 1));
    else if (apps.includes(arg.slice(2)) && arg.startsWith('--')) select(arg.slice(2));
    else forwarded.push(arg);
  }
  if (!center) return args;
  const [kind, name, ...options] = forwarded;
  if (!['c', 'component', 'page'].includes(kind) || !name || name.startsWith('-'))
    throw new Error(
      'Use: ng g c --<center> <name>, or ng g page --<center> <name>. The name must not start with a dash.',
    );
  if (options.some((arg) => /^--project(?:=|$)/.test(arg)))
    throw new Error('Use either a center selector or --project, not both.');
  const sourceRoot = workspace.projects[center].sourceRoot;
  const source = path.resolve(root, sourceRoot);
  if (!source.startsWith(path.resolve(root) + path.sep))
    throw new Error('Invalid center sourceRoot.');
  let customPath;
  const rest = [];
  for (let i = 0; i < options.length; i++) {
    const arg = options[i];
    if (arg === '--path' || arg.startsWith('--path=')) {
      if (customPath !== undefined) throw new Error('Provide --path only once.');
      customPath = arg === '--path' ? options[++i] : arg.slice('--path='.length);
      if (!customPath || customPath.startsWith('--'))
        throw new Error('--path requires a directory.');
    } else rest.push(arg);
  }
  const relative = customPath ?? (kind === 'page' ? 'pages' : 'components');
  if (path.isAbsolute(relative))
    throw new Error('--path must be relative to the center src directory.');
  const target = path.resolve(source, relative);
  const namedTarget = path.resolve(target, name);
  for (const directory of [target, namedTarget])
    if (directory !== source && !directory.startsWith(source + path.sep))
      throw new Error('The generated files must stay inside the selected center src directory.');
  const defaults = [];
  if (
    !rest.some(
      (arg) => /^--style(?:=|$)/.test(arg) || /^--inline-style(?:=|$)/.test(arg) || arg === '-s',
    )
  )
    defaults.push('--style=none');
  if (!rest.some((arg) => /^--(?:skip-tests|no-skip-tests)(?:=|$)/.test(arg)))
    defaults.push('--skip-tests');
  return [
    'generate',
    'component',
    name,
    `--project=${center}`,
    `--path=${path.relative(root, target).replaceAll('\\', '/')}`,
    ...defaults,
    ...rest,
  ];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const workspace = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'angular.json'), 'utf8'));
    const args = angularArgs(process.argv.slice(2), workspace);
    const result = spawnSync(
      process.execPath,
      [path.join(workspaceRoot, 'node_modules/@angular/cli/bin/ng.js'), ...args],
      { cwd: workspaceRoot, stdio: 'inherit' },
    );
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
