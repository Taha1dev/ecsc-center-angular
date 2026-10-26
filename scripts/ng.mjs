import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { workspaceRoot } from './workspace-apps.mjs';

const generators = {
  c: 'component',
  component: 'component',
  page: 'component',
  s: 'service',
  service: 'service',
  p: 'pipe',
  pipe: 'pipe',
  d: 'directive',
  directive: 'directive',
};
const folders = {
  component: 'components',
  service: 'services',
  pipe: 'pipes',
  directive: 'directives',
};
const hasOption = (args, key) =>
  args.some((arg) => arg === `--${key}` || arg.startsWith(`--${key}=`));
function optionValue(args, key) {
  const index = args.findIndex((arg) => arg === `--${key}` || arg.startsWith(`--${key}=`));
  if (index < 0) return undefined;
  const value = args[index].includes('=')
    ? args[index].slice(args[index].indexOf('=') + 1)
    : args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value.`);
  return value;
}

function requireTrue(args, key) {
  const index = args.indexOf(`--${key}`);
  if (
    args.includes(`--no-${key}`) ||
    args.includes(`--${key}=false`) ||
    (index >= 0 && args[index + 1] === 'false')
  )
    throw new Error(
      `This workspace always generates services, pipes and directives with --${key}.`,
    );
  return hasOption(args, key) ? [] : [`--${key}`];
}

export function angularArgs(args, workspace, root = workspaceRoot) {
  const result = scopedAngularArgs(args, workspace, root);
  if (!['g', 'generate'].includes(result[0])) return result;
  const kind = generators[result[1]];
  if (!['service', 'pipe', 'directive'].includes(kind) || result.includes('--help')) return result;
  const defaults = [...requireTrue(result, 'skip-tests')];
  if (kind === 'service') defaults.push(...requireTrue(result, 'injectable'));
  if (kind !== 'pipe' && !hasOption(result, 'type')) defaults.push(`--type=${kind}`);
  if (kind === 'pipe' && !hasOption(result, 'type-separator')) defaults.push('--type-separator=.');
  const project = optionValue(result, 'project');
  if (project === 'domain')
    throw new Error('Domain contains plain TypeScript, not Angular services, pipes or directives.');
  if (project && !hasOption(result, 'path')) {
    const source = workspace.projects[project]?.sourceRoot;
    if (!source) throw new Error(`Unknown project or missing sourceRoot: ${project}`);
    defaults.push(`--path=${source}/${folders[kind]}`);
  }
  return [...result, ...defaults];
}

function scopedAngularArgs(args, workspace, root) {
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
  if (!generators[kind] || !name || name.startsWith('-'))
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
  const relative = customPath ?? (kind === 'page' ? 'pages' : folders[generators[kind]]);
  if (path.isAbsolute(relative))
    throw new Error('--path must be relative to the center src directory.');
  const target = path.resolve(source, relative);
  const namedTarget = path.resolve(target, name);
  for (const directory of [target, namedTarget])
    if (directory !== source && !directory.startsWith(source + path.sep))
      throw new Error('The generated files must stay inside the selected center src directory.');
  const defaults = [];
  if (
    generators[kind] === 'component' &&
    !rest.some(
      (arg) => /^--style(?:=|$)/.test(arg) || /^--inline-style(?:=|$)/.test(arg) || arg === '-s',
    )
  )
    defaults.push('--style=none');
  if (!rest.some((arg) => /^--(?:skip-tests|no-skip-tests)(?:=|$)/.test(arg)))
    defaults.push('--skip-tests');
  return [
    'generate',
    generators[kind],
    name,
    `--project=${center}`,
    `--path=${path.relative(root, target).replaceAll('\\', '/')}`,
    ...defaults,
    ...rest,
  ];
}

// The picker is passed in so target selection can be tested without a terminal.
export async function generationArgs(args, workspace, choose, root = workspaceRoot) {
  if (
    !['g', 'generate'].includes(args[0]) ||
    !generators[args[1]] ||
    args.some((arg) => ['--help', '-h'].includes(arg))
  )
    return angularArgs(args, workspace, root);
  const kind = generators[args[1]];
  if (!args[2] || args[2].startsWith('-')) return angularArgs(args, workspace, root);
  const apps = Object.entries(workspace.projects).filter(
    ([, project]) => project.projectType === 'application',
  );
  const explicitTarget =
    hasOption(args, 'project') ||
    hasOption(args, 'center') ||
    hasOption(args, 'center-name') ||
    args.some((arg) => apps.some(([id]) => arg === `--${id}`));
  if (explicitTarget) return angularArgs(args, workspace, root);

  const scope = await choose('Where should this go?', [
    { value: 'centers', label: 'Centers — used by one center' },
    { value: 'packages', label: 'Packages — shared code' },
  ]);
  if (scope === 'centers') {
    const existingApps = apps.filter(
      ([, project]) => project.sourceRoot && fs.existsSync(path.resolve(root, project.sourceRoot)),
    );
    const center = await choose(
      'Choose a center:',
      existingApps.map(([id]) => ({ value: id, label: id })),
    );
    return angularArgs([...args, `--center=${center}`], workspace, root);
  }
  const candidates =
    kind === 'service'
      ? [
          { value: 'data-access', label: 'data-access — API and data services' },
          { value: 'core', label: 'core — shared feature behavior' },
        ]
      : [
          { value: 'ui', label: 'ui — general UI code' },
          { value: 'core', label: 'core — shared product features' },
        ];
  const available = candidates.filter(
    ({ value }) => workspace.projects[value]?.projectType === 'library',
  );
  const project = await choose('Choose a package:', available);
  const options = [...args, `--project=${project}`];
  if (!hasOption(options, 'path'))
    options.push(
      `--path=${workspace.projects[project].sourceRoot}/${args[1] === 'page' ? 'pages' : folders[kind]}`,
    );
  if (kind === 'component') {
    if (!hasOption(options, 'style')) options.push('--style=none');
    if (!hasOption(options, 'skip-tests') && !hasOption(options, 'no-skip-tests'))
      options.push('--skip-tests');
    // Owned shared components keep their own folder and external HTML template.
    if (
      options.includes('--flat') ||
      options.includes('--flat=true') ||
      options.includes('--inline-template') ||
      options.includes('--inline-template=true') ||
      options.includes('-t')
    )
      throw new Error('Shared components require a matching folder and a separate HTML template.');
    options.push('--flat=false', '--inline-template=false');
  }
  const result = angularArgs(options, workspace, root);
  if (args[1] === 'page') result[1] = 'component';
  return result;
}

async function terminalChoice(question, choices) {
  if (!choices.length) throw new Error(`No available targets. ${question}`);
  if (!process.stdin.isTTY)
    throw new Error(
      'Target selection needs an interactive terminal. Supply --project=<name> or --center-name=<id>.',
    );
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log(`\n${question}`);
    choices.forEach((choice, index) =>
      console.log(`  ${index + 1}. ${choice.label}${index === 0 ? ' (default)' : ''}`),
    );
    while (true) {
      const answer = (await rl.question('Choose a number or name [1]: ')).trim();
      const selected = !answer
        ? choices[0]
        : choices.find(
            (choice, index) =>
              answer === String(index + 1) || answer.toLowerCase() === choice.value.toLowerCase(),
          );
      if (selected) return selected.value;
      console.error('Choose one of the listed options.');
    }
  } finally {
    rl.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const workspace = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'angular.json'), 'utf8'));
    const args = await generationArgs(process.argv.slice(2), workspace, terminalChoice);
    const result = spawnSync(
      process.execPath,
      [path.join(workspaceRoot, 'node_modules/@angular/cli/bin/ng.js'), ...args],
      // Let Angular infer the application from the current folder for bare builds.
      { cwd: args[0] === 'build' ? process.cwd() : workspaceRoot, stdio: 'inherit' },
    );
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
