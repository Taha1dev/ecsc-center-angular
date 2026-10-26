import path from 'node:path';
import fs from 'node:fs';
import ts from 'typescript';
import { expect, it } from 'vitest';
import { checkImport, checkCenterBranches } from '../../scripts/check-boundaries.mjs';

it('rejects relative imports across arbitrary application names but allows local files', () => {
  const file = path.resolve('apps/example-one/src/features/page.ts');
  expect(() => checkImport(file, '../../../example-two/src/services/api')).toThrow(
    'another application',
  );
  expect(() => checkImport(file, './local')).not.toThrow();
  expect(() => checkImport(file, '@workspace/core')).not.toThrow();
});

it('detects direct center-ID branches for arbitrary future identifiers', () => {
  for (const text of [
    "if (center.id === 'future-center') {}",
    "if ('future-center' !== config.profile.id) {}",
    "switch (record.centerId) { case 'future-center': break; }",
  ]) {
    const source = ts.createSourceFile('shared.ts', text, ts.ScriptTarget.Latest, true);
    expect(() => checkCenterBranches('shared.ts', source)).toThrow('center-ID');
  }
  const source = ts.createSourceFile(
    'shared.ts',
    'if (record.centerId === requestedId) {}',
    ts.ScriptTarget.Latest,
    true,
  );
  expect(() => checkCenterBranches('shared.ts', source)).not.toThrow();
});

it('has source files for every registered project', () => {
  const workspace = JSON.parse(fs.readFileSync('angular.json', 'utf8'));
  for (const [id, project] of Object.entries(workspace.projects) as [
    string,
    {
      sourceRoot: string;
      projectType: string;
      architect: { build: { options: { browser?: string; project?: string } } };
    },
  ][]) {
    expect(fs.existsSync(project.sourceRoot), id).toBe(true);
    const entry =
      project.projectType === 'application'
        ? project.architect.build.options.browser
        : project.architect.build.options.project;
    expect(entry && fs.existsSync(entry), id).toBeTruthy();
  }
});
