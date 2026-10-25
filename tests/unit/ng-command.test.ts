import path from 'node:path';
import { expect, it } from 'vitest';
import { angularArgs } from '../../scripts/ng.mjs';

const root = path.resolve('.');
const workspace = {
  projects: {
    ecsc: { projectType: 'application', sourceRoot: 'apps/ecsc/src' },
    'new-center': { projectType: 'application', sourceRoot: 'apps/new-center/src' },
    ui: { projectType: 'library', sourceRoot: 'packages/ui/src' },
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
