import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowed = {
  domain: [],
  'data-access': ['domain'],
  ui: ['domain'],
  core: ['domain', 'data-access', 'ui'],
};
export function checkImport(file, specifier) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const owner = relative.match(/^packages\/([^/]+)\//)?.[1];
  const app = relative.match(/^apps\/([^/]+)\//)?.[1];
  if (
    specifier.startsWith('@/') ||
    (specifier.startsWith('@workspace/') &&
      specifier.split('/').length > 2 &&
      specifier !== '@workspace/ui/globals.css')
  )
    throw new Error(`Private alias in ${relative}: ${specifier}`);
  if (
    /(^|\/)(react|react-dom|vite)(\/|$)/.test(specifier) ||
    specifier.startsWith('@radix-ui/react')
  )
    throw new Error(`Obsolete framework in ${relative}: ${specifier}`);
  if (owner === 'domain' && !specifier.startsWith('.') && !['zod'].includes(specifier))
    throw new Error(`Domain must be framework independent: ${specifier}`);
  const dep = specifier.match(/^@workspace\/([^/]+)/)?.[1];
  if (owner && dep && dep !== owner && !allowed[owner]?.includes(dep))
    throw new Error(`Forbidden dependency ${owner} -> ${dep}`);
  if (owner && specifier.includes('/apps/'))
    throw new Error(`Shared code imports app: ${relative}`);
  if (specifier.startsWith('.')) {
    const resolved = path
      .relative(root, path.resolve(path.dirname(file), specifier))
      .replaceAll('\\', '/');
    if (owner && resolved.startsWith('apps/')) throw new Error('Shared code imports application');
    if (app && resolved.startsWith('packages/'))
      throw new Error('Apps must use library public entry points');
    if (owner && resolved.startsWith('packages/') && !resolved.startsWith(`packages/${owner}/`))
      throw new Error('Use library public entry points');
    if (
      owner === 'domain' &&
      relative.includes('/domain/') &&
      resolved.includes('/lib/definitions')
    )
      throw new Error('Domain imports presentation definitions');
  }
}
export function checkComponentStructure(file, source) {
  const components = source.statements.filter(ts.isClassDeclaration).flatMap((node) =>
    (ts.getDecorators(node) ?? []).flatMap((decorator) => {
      const call = decorator.expression;
      return ts.isCallExpression(call) &&
        ts.isIdentifier(call.expression) &&
        call.expression.text === 'Component'
        ? [call.arguments[0]]
        : [];
    }),
  );
  if (!components.length) return;
  const name = path.basename(file, '.ts');
  if (components.length !== 1 || path.basename(path.dirname(file)) !== name)
    throw new Error(`Each component needs its own matching folder and TS file: ${file}`);
  const metadata = components[0];
  if (!metadata || !ts.isObjectLiteralExpression(metadata))
    throw new Error(`Component metadata must declare an external HTML template: ${file}`);
  const property = (key) =>
    metadata.properties.find(
      (entry) => ts.isPropertyAssignment(entry) && entry.name.getText(source) === key,
    );
  const template = property('templateUrl')?.initializer;
  if (
    property('template') ||
    !template ||
    !ts.isStringLiteral(template) ||
    template.text !== `./${name}.html` ||
    !fs.existsSync(path.join(path.dirname(file), `${name}.html`))
  )
    throw new Error(`Component needs a separate ${name}.html beside its TS file: ${file}`);
}
export function checkBoundaries() {
  let count = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist'].includes(entry.name)) walk(f);
      } else if (/\.(ts|mjs)$/.test(f)) {
        count++;
        const text = fs.readFileSync(f, 'utf8');
        const source = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true);
        if (f.startsWith(path.join(root, 'packages') + path.sep) && f.endsWith('.ts'))
          checkComponentStructure(f, source);
        function visit(node) {
          if (
            (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
          )
            checkImport(f, node.moduleSpecifier.text);
          if (
            ts.isCallExpression(node) &&
            (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
              (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
            node.arguments[0] &&
            ts.isStringLiteral(node.arguments[0])
          )
            checkImport(f, node.arguments[0].text);
          ts.forEachChild(node, visit);
        }
        visit(source);
        if (
          f.includes(`${path.sep}packages${path.sep}`) &&
          /center\.id\s*===\s*['"](?:ecsc|m3|jus)['"]/.test(text)
        )
          throw new Error(`Center branching in shared code: ${f}`);
      }
    }
  }
  walk(path.join(root, 'apps'));
  walk(path.join(root, 'packages'));
  return count;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  console.log(`Import boundaries passed (${checkBoundaries()} source files)`);
