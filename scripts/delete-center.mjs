import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { centerId } from './create-center.mjs';
import { workspaceRoot } from './workspace-apps.mjs';

function checkedPath(root, relative) {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep))
    throw new Error('Deletion target is outside the workspace.');
  if (fs.existsSync(target) && fs.realpathSync(target).toLowerCase() !== target.toLowerCase())
    throw new Error(`Refusing redirected/symbolic-link target: ${relative}`);
  return target;
}

export async function deleteCenterPlan(directory, value) {
  const root = fs.realpathSync(directory),
    id = centerId(value);
  const originals = new Map();
  const read = (file) => {
    const bytes = fs.readFileSync(checkedPath(root, file));
    originals.set(file, bytes);
    return JSON.parse(bytes.toString('utf8'));
  };
  const workspace = read('angular.json'),
    pkg = read('package.json'),
    turbo = read('turbo.json');
  const project = workspace.projects[id];
  if (
    !Object.hasOwn(workspace.projects, id) ||
    project.projectType !== 'application' ||
    project.root !== `apps/${id}` ||
    project.architect.build.options.outputPath !== `dist/apps/${id}`
  )
    throw new Error(`No generated application with the expected paths: ${id}`);
  const appPath = checkedPath(root, `apps/${id}`);
  const appPackage = read(`apps/${id}/package.json`);
  if (appPackage.center?.deletionProtected === true)
    throw new Error(
      'This application is preserved by center.deletionProtected in its package.json.',
    );
  const brand = JSON.parse(fs.readFileSync(path.join(appPath, 'brand.json'), 'utf8'));
  if (appPackage.name !== id || !brand.primary || !brand.secondary || !brand.tokens)
    throw new Error('The application does not match the generated center structure.');
  delete workspace.projects[id];
  for (const task of ['dev', 'build', 'preview']) delete pkg.scripts[`${task}:${id}`];
  delete turbo.tasks[`${id}#build`];
  const prettier = (await resolveConfig(path.join(root, 'package.json'))) ?? {};
  const updates = new Map();
  for (const [file, content] of [
    ['angular.json', workspace],
    ['package.json', pkg],
    ['turbo.json', turbo],
  ])
    updates.set(
      file,
      await format(JSON.stringify(content), { ...prettier, filepath: path.join(root, file) }),
    );
  const targets = [`apps/${id}`, `tests/e2e/${id}.generated.spec.ts`, `dist/apps/${id}`].filter(
    (file) => fs.existsSync(checkedPath(root, file)),
  );
  return { root, id, phrase: `delete ${id} center`, originals, updates, targets };
}

export function applyCenterDeletion(plan, confirmation) {
  if (confirmation !== plan.phrase)
    throw new Error('Confirmation did not match. Nothing was deleted.');
  // Recheck paths and configuration after the interactive prompt, before any mutation.
  for (const [file, original] of plan.originals)
    if (!fs.readFileSync(checkedPath(plan.root, file)).equals(original))
      throw new Error('Workspace configuration changed. Run the delete command again.');
  for (const target of plan.targets) checkedPath(plan.root, target);
  const staging = fs.mkdtempSync(path.join(plan.root, '.center-delete-'));
  const backups = [];
  const touched = [];
  try {
    // Windows can hold directory handles even when individual files are removable.
    // Copy first rather than renaming the whole app, and retain backups until commit.
    for (const [index, relative] of plan.targets.entries()) {
      const source = checkedPath(plan.root, relative);
      const destination = checkedPath(
        plan.root,
        path.relative(plan.root, path.join(staging, String(index))),
      );
      fs.cpSync(source, destination, { recursive: true, verbatimSymlinks: true });
      backups.push([source, destination]);
    }
    for (const [source, backup] of backups) {
      checkedPath(plan.root, path.relative(plan.root, source));
      // Track before rm: a locked directory may fail after removing some children.
      touched.push([source, backup]);
      fs.rmSync(source, { recursive: true, maxRetries: 4, retryDelay: 200 });
    }
    for (const [file, content] of plan.updates)
      fs.writeFileSync(checkedPath(plan.root, file), content);
  } catch (error) {
    try {
      for (const [source, backup] of touched.reverse()) {
        checkedPath(plan.root, path.relative(plan.root, source));
        fs.cpSync(backup, source, { recursive: true, force: true, verbatimSymlinks: true });
      }
      for (const [file, bytes] of plan.originals) {
        const target = checkedPath(plan.root, file);
        if (!fs.readFileSync(target).equals(bytes)) fs.writeFileSync(target, bytes);
      }
    } catch (recoveryError) {
      throw new Error(
        `Deletion failed and automatic recovery could not finish. Backups are preserved at ${staging}. ${recoveryError.message}`,
        { cause: error },
      );
    }
    const verifiedStaging = checkedPath(plan.root, path.relative(plan.root, staging));
    fs.rmSync(verifiedStaging, { recursive: true, maxRetries: 4, retryDelay: 200 });
    if (['EBUSY', 'EPERM', 'EACCES'].includes(error.code))
      throw new Error(
        `Center ${plan.id} is locked by another process. Files and configuration were restored. Stop its dev/preview server with Ctrl+C, close terminals or Explorer windows inside apps/${plan.id}, then rerun the delete command.`,
        { cause: error },
      );
    throw error;
  }
  const verifiedStaging = checkedPath(plan.root, path.relative(plan.root, staging));
  if (!path.basename(verifiedStaging).startsWith('.center-delete-'))
    throw new Error('Invalid staging directory.');
  fs.rmSync(verifiedStaging, { recursive: true, maxRetries: 4, retryDelay: 200 });
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { 'dry-run': { type: 'boolean' }, help: { type: 'boolean', short: 'h' } },
  });
  if (values.help) {
    console.log(
      'npm run center:delete -- <center-id>\nPreview only: node scripts/delete-center.mjs <center-id> --dry-run',
    );
    return;
  }
  if (positionals.length !== 1) throw new Error('Provide one center ID, for example test-center.');
  const plan = await deleteCenterPlan(workspaceRoot, positionals[0]);
  console.log(`\nDelete center ${plan.id}:`);
  for (const target of plan.targets) console.log(`  Remove: ${target}`);
  console.log(
    '  Update: angular.json, package.json, turbo.json, package-lock.json and npm workspace links',
  );
  if (values['dry-run']) return;
  if (!process.stdin.isTTY)
    throw new Error('Deletion requires an interactive terminal and the exact confirmation phrase.');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let confirmation;
  try {
    confirmation = await rl.question(`Type "${plan.phrase}" to confirm deletion: `);
  } finally {
    rl.close();
  }
  if (confirmation !== plan.phrase) {
    console.log('Cancelled. Nothing was deleted.');
    return;
  }
  applyCenterDeletion(plan, confirmation);
  const npmCli = process.env.npm_execpath;
  const result = npmCli
    ? spawnSync(process.execPath, [npmCli, 'install', '--ignore-scripts'], {
        cwd: workspaceRoot,
        stdio: 'inherit',
      })
    : spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', '--ignore-scripts'], {
        cwd: workspaceRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
  if (result.error || result.status !== 0)
    throw new Error(
      'Center deleted, but npm cleanup failed. Run npm install --ignore-scripts from the root.',
    );
  console.log(`Deleted center ${plan.id}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
