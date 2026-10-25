import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';
import { checkBoundaries, checkComponentStructure } from '../../scripts/check-boundaries.mjs';

const check = (file: string, text: string) =>
  checkComponentStructure(file, ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true));

it('keeps all package components in individual folders with external templates', () => {
  expect(() => checkBoundaries()).not.toThrow();
});

it('accepts an external template and rejects inline, missing and shared component files', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'component-structure-'));
  // Use a matching file/folder name without relying on a fixed temporary directory.
  const name = path.basename(parent);
  const file = path.join(parent, name + '.ts');
  const html = path.join(parent, name + '.html');
  fs.writeFileSync(html, '<ng-content />');
  try {
    expect(() =>
      check(file, `@Component({templateUrl: './${name}.html'}) class Card {}`),
    ).not.toThrow();
    expect(() => check(file, "@Component({template: '<p>Inline</p>'}) class Card {}")).toThrow(
      'separate',
    );
    expect(() => check(file, "@Component({templateUrl: './missing.html'}) class Card {}")).toThrow(
      'separate',
    );
    expect(() =>
      check(
        file,
        `@Component({templateUrl: './${name}.html'}) class Card {}
        @Component({templateUrl: './${name}.html'}) class Other {}`,
      ),
    ).toThrow('own matching folder');
    expect(() =>
      check(path.join(parent, 'flat.ts'), "@Component({templateUrl: './flat.html'}) class Flat {}"),
    ).toThrow('own matching folder');
  } finally {
    fs.unlinkSync(html);
    fs.rmdirSync(parent);
  }
});

it('leaves services and directives outside the component folder rule', () => {
  expect(() => check('service.ts', '@Injectable() class Service {}')).not.toThrow();
  expect(() => check('directive.ts', '@Directive() class Control {}')).not.toThrow();
});
