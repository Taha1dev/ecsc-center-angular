import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { expect, it, vi } from 'vitest';
import { angularArgs, generationArgs } from '../../scripts/ng.mjs';

const root = path.resolve('.');
const workspace = {
  projects: {
    ecsc: { projectType: 'application', sourceRoot: 'apps/ecsc/src' },
    'new-center': { projectType: 'application', sourceRoot: 'apps/new-center/src' },
    ui: { projectType: 'library', sourceRoot: 'packages/ui/src' },
    'data-access': { projectType: 'library', sourceRoot: 'packages/data-access/src' },
    core: { projectType: 'library', sourceRoot: 'packages/core/src' },
  },
};

it('maps any registered application shorthand to its components directory', () => {
  const args = angularArgs(['g', '--ecsc', 'c', 'customer-card', '--dry-run'], workspace, root);
  expect(args).toEqual([
    'generate',
    'component',
    'customer-card',
    '--project=ecsc',
    '--path=apps/ecsc/src/components',
    '--style=none',
    '--skip-tests',
    '--dry-run',
  ]);
  expect(angularArgs(['g', '--new-center', 'c', 'card'], workspace, root)).toContain(
    '--path=apps/new-center/src/components',
  );
});

it('accepts the center selector after the schematic or name', () => {
  const expected = angularArgs(['g', '--ecsc', 'c', 'customer-card'], workspace, root);
  expect(angularArgs(['g', 'c', '--ecsc', 'customer-card'], workspace, root)).toEqual(expected);
  expect(angularArgs(['g', 'c', 'customer-card', '--ecsc'], workspace, root)).toEqual(expected);
  expect(angularArgs(['g', 'page', '--ecsc', 'customers'], workspace, root)).toContain(
    '--path=apps/ecsc/src/pages',
  );
  expect(() => angularArgs(['g', 'c', '--ecsc', '-customer-card'], workspace, root)).toThrow(
    'must not start with a dash',
  );
});

it('supports explicit selectors, pages, relative paths and CLI option overrides', () => {
  const args = angularArgs(
    [
      'g',
      '--center-name=ecsc',
      'page',
      'customers',
      '--path',
      'features/customers/pages',
      '--style=css',
      '--skip-tests=false',
      '--flat',
    ],
    workspace,
    root,
  );
  expect(args).toEqual([
    'generate',
    'component',
    'customers',
    '--project=ecsc',
    '--path=apps/ecsc/src/features/customers/pages',
    '--style=css',
    '--skip-tests=false',
    '--flat',
  ]);
  expect(angularArgs(['g', '--center', 'ecsc', 'page', 'customers'], workspace, root)).toContain(
    '--path=apps/ecsc/src/pages',
  );
});

it('preserves ordinary Angular CLI commands and explicit library generation', () => {
  for (const args of [['serve', 'ecsc'], ['g', 'c', 'card', '--project=ui'], ['version']])
    expect(angularArgs(args, workspace, root)).toEqual(args);
});

it('rejects conflicting selectors and paths escaping the selected application', () => {
  for (const args of [
    ['g', '--center=missing', 'c', 'card'],
    ['g', '--ecsc', '--center=ecsc', 'c', 'card'],
    ['g', '--ecsc', 'c', 'card', '--project=ui'],
    ['g', '--ecsc', 'c', 'card', '--path=../../m3/src'],
    ['g', '--ecsc', 'c', '../../../m3/src/card'],
    ['g', '--ecsc', 'c', 'card', '--path'],
  ])
    expect(() => angularArgs(args, workspace, root)).toThrow();
});

it('lists registered centers dynamically and places the service in the selected center', async () => {
  const choose = vi.fn().mockResolvedValueOnce('centers').mockResolvedValueOnce('another-center');
  const expanded = {
    projects: {
      ...workspace.projects,
      'another-center': { projectType: 'application', sourceRoot: 'apps/another-center/src' },
    },
  };
  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-targets-'));
  for (const id of ['ecsc', 'new-center', 'another-center'])
    fs.mkdirSync(path.join(targetRoot, 'apps', id, 'src'), { recursive: true });
  Object.assign(expanded.projects, {
    'missing-center': { projectType: 'application', sourceRoot: 'apps/missing-center/src' },
  });
  let args: string[];
  try {
    args = await generationArgs(['g', 's', 'customers'], expanded, choose, targetRoot);
  } finally {
    fs.rmSync(targetRoot, { recursive: true, force: true });
  }
  expect(choose.mock.calls[1][1].map((choice: { value: string }) => choice.value)).toEqual([
    'ecsc',
    'new-center',
    'another-center',
  ]);
  expect(args).toContain('--project=another-center');
  expect(args).toContain('--path=apps/another-center/src/services');
  expect(args).toContain('--injectable');
  expect(args).toContain('--skip-tests');
});

it('offers data-access first for shared services and supports core', async () => {
  const choose = vi.fn().mockResolvedValueOnce('packages').mockResolvedValueOnce('core');
  const args = await generationArgs(['g', 'service', 'draft'], workspace, choose, root);
  expect(choose.mock.calls[1][1].map((choice: { value: string }) => choice.value)).toEqual([
    'data-access',
    'core',
  ]);
  expect(args).toContain('--project=core');
  expect(args).toContain('--path=packages/core/src/services');
});

it('offers ui first for pipes, directives and shared components', async () => {
  for (const [kind, folder] of [
    ['p', 'pipes'],
    ['d', 'directives'],
    ['c', 'components'],
  ]) {
    const choose = vi.fn().mockResolvedValueOnce('packages').mockResolvedValueOnce('ui');
    const args = await generationArgs(['g', kind, 'example'], workspace, choose, root);
    expect(choose.mock.calls[1][1].map((choice: { value: string }) => choice.value)).toEqual([
      'ui',
      'core',
    ]);
    expect(args).toContain(`--path=packages/ui/src/${folder}`);
    expect(args).toContain('--skip-tests');
    if (kind === 'c') {
      expect(args).toContain('--flat=false');
      expect(args).toContain('--inline-template=false');
    }
  }
});

it('supports explicit targets without prompting and enforces service defaults', async () => {
  const choose = vi.fn();
  const args = await generationArgs(
    ['g', 's', 'customers', '--project=data-access', '--dry-run'],
    workspace,
    choose,
    root,
  );
  expect(choose).not.toHaveBeenCalled();
  expect(args).toContain('--path=packages/data-access/src/services');
  expect(args).toContain('--injectable');
  expect(args).toContain('--type=service');
  for (const flag of [
    '--skip-tests=false',
    '--no-skip-tests',
    '--injectable=false',
    '--no-injectable',
  ])
    expect(() =>
      angularArgs(['g', 's', 'customers', '--project=core', flag], workspace, root),
    ).toThrow('always generates');
  expect(() => angularArgs(['g', 's', 'customers', '--project=domain'], workspace, root)).toThrow(
    'plain TypeScript',
  );
});

it('preserves custom center paths for pipes and directives and rejects escaping paths', () => {
  for (const kind of ['p', 'd']) {
    const args = angularArgs(
      ['g', kind, 'example', '--ecsc', '--path=features/customers'],
      workspace,
      root,
    );
    expect(args).toContain('--path=apps/ecsc/src/features/customers');
    expect(() =>
      angularArgs(['g', kind, 'example', '--ecsc', '--path=../../outside'], workspace, root),
    ).toThrow('stay inside');
  }
});

it('does not run a generator when target selection is cancelled', async () => {
  const choose = vi.fn().mockRejectedValue(new Error('Cancelled'));
  await expect(generationArgs(['g', 's', 'example'], workspace, choose, root)).rejects.toThrow(
    'Cancelled',
  );
});
