import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { applyCenterPlan, centerId, createCenterPlan } from '../../scripts/create-center.mjs';
import { centerTheme, contrast, hexColor } from '../../scripts/center-theme.mjs';
import { workspaceApps } from '../../scripts/workspace-apps.mjs';
import { applyCenterDeletion, deleteCenterPlan } from '../../scripts/delete-center.mjs';

const roots: string[] = [];
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecsc-generator-'));
  roots.push(root);
  for (const file of ['angular.json', 'package.json', 'turbo.json', 'apps/ecsc/package.json']) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.resolve(file), path.join(root, file));
  }
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) {
    if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('ecsc-generator-'))
      throw new Error('Unexpected test directory');
    fs.rmSync(root, { recursive: true, force: true });
  }
});
const options = {
  id: 'new-center',
  name: 'مركز جديد',
  primary: '#397b73',
  secondary: '#baa97d',
};

it('generates an isolated app, registers all tasks and discovers it without changing existing apps', async () => {
  const root = fixture();
  const before = fs.readFileSync(path.join(root, 'angular.json'), 'utf8');
  const ports = new Set(workspaceApps(root).flatMap((app) => [app.devPort, app.previewPort]));
  let expectedPort = 5200;
  while (ports.has(expectedPort) || ports.has(expectedPort + 100)) expectedPort++;
  const plan = await createCenterPlan(root, options);
  expect(fs.readFileSync(path.join(root, 'angular.json'), 'utf8')).toBe(before);
  expect(fs.existsSync(path.join(root, 'apps/new-center'))).toBe(false);
  applyCenterPlan(root, plan);
  const workspace = JSON.parse(fs.readFileSync(path.join(root, 'angular.json'), 'utf8'));
  for (const [id, project] of Object.entries(JSON.parse(before).projects))
    expect(workspace.projects[id]).toEqual(project);
  const app = workspaceApps(root).find((app) => app.id === options.id)!;
  expect(app.devPort).toBe(expectedPort);
  expect(app.previewPort).toBe(expectedPort + 100);
  expect(app.output).toBe(path.join(root, 'dist/apps/new-center/browser'));
  expect(workspace.projects['new-center'].architect.build.options.browser).toBe(
    'apps/new-center/src/main.ts',
  );
  const targets = workspace.projects['new-center'].architect;
  expect(targets.build.defaultConfiguration).toBe('production');
  expect(targets.build.configurations.production.fileReplacements).toContainEqual({
    replace: 'apps/new-center/src/environments/environment.ts',
    with: 'apps/new-center/src/environments/environment.production.ts',
  });
  expect(targets.build.configurations.test).toEqual(targets.build.configurations.development);
  expect(targets.serve.defaultConfiguration).toBe('test');
  expect(targets.serve.configurations.test.buildTarget).toBe('new-center:build:test');
  expect(
    fs.readFileSync(path.join(root, 'apps/new-center/src/environments/environment.ts'), 'utf8'),
  ).toContain('production: false');
  expect(
    fs.readFileSync(
      path.join(root, 'apps/new-center/src/environments/environment.production.ts'),
      'utf8',
    ),
  ).toContain('production: true');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  expect(pkg.scripts['build:new-center']).toBe('turbo build --filter=new-center');
  const turbo = JSON.parse(fs.readFileSync(path.join(root, 'turbo.json'), 'utf8'));
  expect(turbo.tasks['new-center#build'].outputs).toEqual(['../../dist/apps/new-center/**']);
  expect(
    fs.readFileSync(path.join(root, 'apps/new-center/src/config/module.ts'), 'utf8'),
  ).not.toContain('propertyFields');
  expect(
    fs.readFileSync(path.join(root, 'tests/e2e/new-center.generated.spec.ts'), 'utf8'),
  ).toContain('1536');
  await expect(createCenterPlan(root, options)).rejects.toThrow('already exists');
  const next = await createCenterPlan(root, { ...options, id: 'another-center' });
  expect(next.port).toBeGreaterThan(expectedPort);
});

it('rejects invalid IDs, colors and collisions before writing anything', async () => {
  const root = fixture();
  for (const id of ['../oops', 'CON', 'con', 'new/center', '-center', 'a'.repeat(49)])
    expect(() => centerId(id)).toThrow();
  for (const primary of ['red', '#12345', '#fff; color:red', '#gggggg'])
    await expect(createCenterPlan(root, { ...options, primary })).rejects.toThrow('HEX');
  await expect(createCenterPlan(root, { ...options, id: 'ecsc' })).rejects.toThrow(
    'already exists',
  );
  fs.mkdirSync(path.join(root, 'tests/e2e'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tests/e2e/new-center.generated.spec.ts'), 'existing test');
  await expect(createCenterPlan(root, options)).rejects.toThrow('overwrite');
  expect(fs.existsSync(path.join(root, 'apps/new-center'))).toBe(false);
});

it('restores previous files and removes partial outputs when a write fails', () => {
  const root = fixture();
  const before = fs.readFileSync(path.join(root, 'package.json'));
  const files = new Map<string, string | undefined>([
    ['package.json', '{}'],
    ['apps/partial-center/src/main.ts', 'partial output'],
    ['apps/partial-center/src/fail.ts', undefined],
  ]);
  expect(() => applyCenterPlan(root, { files })).toThrow();
  expect(fs.readFileSync(path.join(root, 'package.json'))).toEqual(before);
  expect(fs.existsSync(path.join(root, 'apps/partial-center'))).toBe(false);
});

it('escapes display names in HTML/TypeScript and copies a supplied logo unchanged', async () => {
  const root = fixture();
  const logo = path.join(root, 'authentic.svg');
  const contents = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"/>';
  fs.writeFileSync(logo, contents);
  const name = 'مركز "خاص" <جديد> & خدمات';
  const plan = await createCenterPlan(root, { ...options, name, logo });
  applyCenterPlan(root, plan);
  expect(
    fs.readFileSync(path.join(root, 'apps/new-center/public/brands/new-center/logo.svg'), 'utf8'),
  ).toBe(contents);
  const index = fs.readFileSync(path.join(root, 'apps/new-center/src/index.html'), 'utf8');
  expect(index).toContain('&lt;جديد&gt;');
  expect(index).toContain('&amp;');
  expect(
    fs.readFileSync(path.join(root, 'apps/new-center/src/config/center.ts'), 'utf8'),
  ).toContain('new-center/logo.svg');
});

it('derives readable action, focus, sidebar and chart tokens even from extreme input colors', () => {
  expect(hexColor('#ABC')).toBe('#aabbcc');
  for (const primary of ['#fff', '#000', '#ff0', '#0ff', '#777', '#397b73']) {
    for (const secondary of ['#fff', '#000', '#888', '#baa97d']) {
      const t = centerTheme(primary, secondary);
      expect(contrast(t.primary, t['primary-foreground'])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.primary, t.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.secondary, t['secondary-foreground'])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t['primary-soft-foreground'], t['brand-50'])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.ring, t.background)).toBeGreaterThanOrEqual(3);
      expect(contrast(t['chart-1'], '#fff')).toBeGreaterThanOrEqual(3);
      expect(contrast(t['chart-2'], '#fff')).toBeGreaterThanOrEqual(3);
      expect(t.sidebar).toBe(hexColor(primary));
      expect(t['brand-950']).toBe(hexColor(primary));
      expect(contrast(t.sidebar, t['sidebar-foreground'])).toBeGreaterThanOrEqual(4.5);
      expect(t).not.toHaveProperty('success');
      expect(t).not.toHaveProperty('danger');
    }
  }
});

it('uses the requested dark primary unchanged for branded backgrounds', () => {
  const t = centerTheme('#0e182c', '#d1ff58');
  expect(t['brand-950']).toBe('#0e182c');
  expect(t.sidebar).toBe('#0e182c');
  expect(t.primary).toBe('#0e182c');
  expect(t['brand-900']).not.toBe('#05080f');
});

it('requires the exact center-specific deletion phrase and preserves everything on cancellation', async () => {
  const root = fixture();
  applyCenterPlan(root, await createCenterPlan(root, options));
  const plan = await deleteCenterPlan(root, options.id);
  const before = fs.readFileSync(path.join(root, 'angular.json'));
  for (const confirmation of ['', 'yes', 'delete other-center center', 'delete new-center center '])
    expect(() => applyCenterDeletion(plan, confirmation)).toThrow('Confirmation');
  expect(fs.readFileSync(path.join(root, 'angular.json'))).toEqual(before);
  expect(fs.existsSync(path.join(root, 'apps/new-center/src/main.ts'))).toBe(true);
});

it('deletes only the confirmed generated center, its smoke test and build, and unregisters its tasks', async () => {
  const root = fixture();
  const before = JSON.parse(fs.readFileSync(path.join(root, 'angular.json'), 'utf8'));
  applyCenterPlan(root, await createCenterPlan(root, options));
  fs.mkdirSync(path.join(root, 'dist/apps/new-center'), { recursive: true });
  fs.writeFileSync(path.join(root, 'dist/apps/new-center/index.html'), 'generated build');
  const plan = await deleteCenterPlan(root, options.id);
  applyCenterDeletion(plan, 'delete new-center center');
  expect(fs.existsSync(path.join(root, 'apps/new-center'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'dist/apps/new-center'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'tests/e2e/new-center.generated.spec.ts'))).toBe(false);
  expect(JSON.parse(fs.readFileSync(path.join(root, 'angular.json'), 'utf8'))).toEqual(before);
  expect(
    JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts,
  ).not.toHaveProperty('dev:new-center');
  expect(
    JSON.parse(fs.readFileSync(path.join(root, 'turbo.json'), 'utf8')).tasks,
  ).not.toHaveProperty('new-center#build');
  expect(fs.existsSync(path.join(root, 'apps/ecsc/package.json'))).toBe(true);
  expect(fs.readdirSync(root).some((file) => file.startsWith('.center-delete-'))).toBe(false);
});

it('protects original applications, rejects redirected paths and rejects stale confirmation plans', async () => {
  const root = fixture();
  for (const id of ['ecsc', 'm3', 'jus'])
    await expect(deleteCenterPlan(root, id)).rejects.toThrow('preserved');
  await expect(deleteCenterPlan(root, '../outside')).rejects.toThrow();
  await expect(deleteCenterPlan(root, 'missing-center')).rejects.toThrow(
    'No generated application',
  );
  applyCenterPlan(root, await createCenterPlan(root, options));
  const plan = await deleteCenterPlan(root, options.id);
  fs.appendFileSync(path.join(root, 'package.json'), '\n');
  expect(() => applyCenterDeletion(plan, plan.phrase)).toThrow('configuration changed');
  expect(fs.existsSync(path.join(root, 'apps/new-center'))).toBe(true);
  fs.renameSync(path.join(root, 'apps/new-center'), path.join(root, 'apps/moved-center'));
  fs.symlinkSync(
    path.join(root, 'apps/moved-center'),
    path.join(root, 'apps/new-center'),
    'junction',
  );
  await expect(deleteCenterPlan(root, options.id)).rejects.toThrow('redirected');
  expect(fs.existsSync(path.join(root, 'apps/moved-center/src/main.ts'))).toBe(true);
});

it('restores the center and configuration if deleting its registrations fails', async () => {
  const root = fixture();
  applyCenterPlan(root, await createCenterPlan(root, options));
  const before = fs.readFileSync(path.join(root, 'package.json'));
  const plan = await deleteCenterPlan(root, options.id);
  plan.updates.set('package.json', undefined);
  expect(() => applyCenterDeletion(plan, plan.phrase)).toThrow();
  expect(fs.existsSync(path.join(root, 'apps/new-center/src/main.ts'))).toBe(true);
  expect(fs.existsSync(path.join(root, 'tests/e2e/new-center.generated.spec.ts'))).toBe(true);
  expect(fs.readFileSync(path.join(root, 'package.json'))).toEqual(before);
});

it('deletes without renaming directories, which Windows watchers can lock', async () => {
  const root = fixture();
  applyCenterPlan(root, await createCenterPlan(root, options));
  const plan = await deleteCenterPlan(root, options.id);
  const rename = vi.spyOn(fs, 'renameSync').mockImplementation(() => {
    throw Object.assign(new Error('Directory is busy'), { code: 'EBUSY' });
  });
  try {
    applyCenterDeletion(plan, plan.phrase);
    expect(rename).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(root, 'apps/new-center'))).toBe(false);
  } finally {
    rename.mockRestore();
  }
});

it('restores partially removed files and explains how to release a persistent Windows lock', async () => {
  const root = fixture();
  applyCenterPlan(root, await createCenterPlan(root, options));
  const plan = await deleteCenterPlan(root, options.id);
  const config = fs.readFileSync(path.join(root, 'angular.json'));
  const source = path.join(root, 'apps/new-center/src/main.ts');
  const original = fs.readFileSync(source);
  const remove = fs.rmSync;
  const locked = vi.spyOn(fs, 'rmSync').mockImplementation((target, settings) => {
    if (target === path.join(root, 'apps/new-center')) {
      fs.unlinkSync(source);
      throw Object.assign(new Error('Resource busy'), { code: 'EBUSY' });
    }
    return remove(target, settings);
  });
  try {
    expect(() => applyCenterDeletion(plan, plan.phrase)).toThrow('Ctrl+C');
    expect(fs.readFileSync(source)).toEqual(original);
    expect(fs.readFileSync(path.join(root, 'angular.json'))).toEqual(config);
    expect(fs.readdirSync(root).some((file) => file.startsWith('.center-delete-'))).toBe(false);
  } finally {
    locked.mockRestore();
  }
});
