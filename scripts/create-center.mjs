import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { centerTheme, hexColor, themeCss } from './center-theme.mjs';
import { workspaceApps, workspaceRoot } from './workspace-apps.mjs';

const templates = path.join(path.dirname(fileURLToPath(import.meta.url)), 'templates/center');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const html = (value) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c],
  );

export function centerId(value) {
  if (
    !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) ||
    value.length > 48 ||
    /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/.test(value)
  )
    throw new Error(
      'Use a center ID such as new-center (lowercase Latin letters, digits and hyphens).',
    );
  return value;
}

export function centerName(value) {
  const name = value?.trim();
  if (!name || name.length > 120 || /[\p{Cc}\p{Cf}]/u.test(name))
    throw new Error('Enter a center display name of 1–120 characters without control characters.');
  return name;
}

export async function createCenterPlan(root, options) {
  const id = centerId(options.id),
    name = centerName(options.name);
  const tokens = centerTheme(options.primary, options.secondary);
  const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const workspace = readJson('angular.json'),
    pkg = readJson('package.json');
  const turbo = readJson('turbo.json');
  if (
    id === pkg.name ||
    Object.hasOwn(workspace.projects, id) ||
    fs.existsSync(path.join(root, 'apps', id))
  )
    throw new Error(`Center/project ${id} already exists. Nothing was changed.`);
  const apps = workspaceApps(root);
  const usedPorts = new Set(apps.flatMap((app) => [app.devPort, app.previewPort]));
  let port = 5200;
  while (usedPorts.has(port) || usedPorts.has(port + 100)) port++;
  if (port + 100 > 65535) throw new Error('No free configured port pair is available.');
  for (const key of [`dev:${id}`, `build:${id}`, `preview:${id}`])
    if (Object.hasOwn(pkg.scripts, key)) throw new Error(`Script ${key} already exists.`);
  if (Object.hasOwn(turbo.tasks, `${id}#build`)) throw new Error('Turbo task already exists.');

  // Reuse the maintained CLI build configuration, never another center's business data.
  const project = JSON.parse(
    JSON.stringify(workspace.projects.ecsc)
      .replaceAll('apps/ecsc', `apps/${id}`)
      .replaceAll('dist/apps/ecsc', `dist/apps/${id}`)
      .replaceAll('ecsc:build', `${id}:build`),
  );
  project.architect.serve.options.port = port;
  workspace.projects[id] = project;
  pkg.scripts[`dev:${id}`] = `npm run dev --workspace=${id}`;
  pkg.scripts[`build:${id}`] = `turbo build --filter=${id}`;
  pkg.scripts[`preview:${id}`] = `node scripts/serve.mjs ${id}`;
  turbo.tasks[`${id}#build`] = {
    outputs: [`../../dist/apps/${id}/**`],
    dependsOn: ['^build'],
  };
  const appPackage = readJson('apps/ecsc/package.json');
  appPackage.name = id;
  appPackage.scripts = {
    dev: `ng serve ${id}`,
    build: `ng build ${id}`,
    typecheck: 'ngc -p tsconfig.app.json --noEmit',
    preview: `node ../../scripts/serve.mjs ${id}`,
  };
  const base = `apps/${id}`,
    assets = `/assets/brands/${id}`;
  const files = new Map();
  const put = (file, content) => files.set(file, content);
  const app = (file, content) => put(`${base}/${file}`, content);
  let logo = 'logo.svg';
  if (options.logo) {
    const input = path.resolve(options.logo);
    const ext = path.extname(input).toLowerCase();
    if (
      !['.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico'].includes(ext) ||
      !fs.statSync(input).isFile()
    )
      throw new Error('Logo must be a local SVG, PNG, JPEG, WebP or ICO file.');
    logo = `logo${ext}`;
    app(`public/brands/${id}/${logo}`, fs.readFileSync(input));
  } else {
    // A temporary geometric marker, not an invented official logo or government emblem.
    app(
      `public/brands/${id}/${logo}`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><title>Temporary center marker</title><rect x="8" y="8" width="80" height="80" rx="20" fill="${tokens.primary}" stroke="${tokens['primary-foreground']}" stroke-width="3"/><path d="M30 32h36v32H30z" fill="none" stroke="${tokens['primary-foreground']}" stroke-width="5"/><path d="M38 48h20" stroke="${tokens.secondary}" stroke-width="6"/></svg>\n`,
    );
  }
  app(
    `public/brands/${id}/pattern.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><defs><pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M0 40h80M40 0v80" fill="none" stroke="${tokens['brand-200']}" stroke-width="1"/><circle cx="40" cy="40" r="5" fill="${tokens.secondary}"/></pattern></defs><path fill="url(#grid)" d="M0 0h640v640H0z"/></svg>\n`,
  );
  app('package.json', json(appPackage));
  app(
    'tsconfig.app.json',
    json({
      extends: '../../tsconfig.json',
      compilerOptions: { outDir: `../../out-tsc/${id}`, types: [] },
      files: ['src/main.ts'],
      include: ['src/**/*.ts'],
    }),
  );
  app(
    'src/main.ts',
    "import { startCenter } from '@workspace/core';\nimport { centerModule } from './config/module';\nstartCenter(centerModule).catch((error) => console.error(error));\n",
  );
  app(
    'src/routes.ts',
    "import type { CenterPages, CenterRoute } from '@workspace/core';\nexport const extensions: CenterRoute[] = [];\nexport const pages: CenterPages = {};\n",
  );
  app(
    'src/config/center.ts',
    `import type { CenterProfile } from '@workspace/core';\nexport const center = ${json({
      id,
      name,
      logo: `${assets}/${logo}`,
      source: `${assets}/${logo}`,
      favicon: `${assets}/${logo}`,
      loginPattern: `${assets}/pattern.svg`,
      patternKind: 'circuit',
    }).trim()} satisfies CenterProfile;\n`,
  );
  for (const file of ['module.ts', 'services.ts'])
    app(`src/config/${file}`, fs.readFileSync(path.join(templates, `${file}.template`), 'utf8'));
  app(
    'src/config/reports.ts',
    "import { createReports } from '@workspace/data-access';\nimport { catalog } from './services';\nexport const reports = createReports(catalog, [\n{ title: 'الطلبات التجريبية', aliases: ['طلب'] },\n{ title: 'متابعة الخدمات التجريبية', aliases: ['متابعة'] },\n]);\n",
  );
  app(
    'src/styles.css',
    "@import 'tailwindcss';\n@import '../../../packages/ui/src/styles/globals.css';\n@import './brand.css';\n@source \"../../../packages\";\n@source \"./\";\n",
  );
  app('src/brand.css', themeCss(id, tokens));
  app(
    'src/index.html',
    `<!doctype html>\n<html lang="ar" dir="rtl" data-center="${id}"><head><meta charset="utf-8"/><title>${html(name)} | مساحة الموظف</title><base href="/"/><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="icon" href="${assets}/${logo}"/></head><body><app-root></app-root></body></html>\n`,
  );
  app(
    'brand.json',
    json({
      name,
      primary: hexColor(options.primary),
      secondary: hexColor(options.secondary),
      tokens,
    }),
  );
  app(
    'README.md',
    `# ${name}\n\nGenerated center: \`${id}\`.\n\n- Development: \`npm run dev:${id}\` — http://localhost:${port}\n- Build with dependencies: \`npm run build:${id}\`\n- Production preview after building: \`npm run preview:${id}\` — http://localhost:${port + 100}\n\nThe catalog, fees, decisions and demo data are illustrative only. Replace \`src/config/services.ts\` and \`reports.ts\` with approved definitions. The shared fourteen sections and both shells are inherited without product redesign.\n\nBrand inputs and derived tokens are in \`brand.json\`; the applied theme is \`src/brand.css\`. The requested colors are stored in brand-950/highlight-500; action and link colors may be darkened for contrast. Text ink, focus indicators and chart colors are derived for contrast. Shared status colors remain unchanged.\n\n${options.logo ? 'The supplied logo was copied unchanged.' : 'The SVG is a temporary geometric marker. Replace it with the authentic center logo.'} Update \`src/config/center.ts\` and the favicon in \`src/index.html\` if asset filenames change.\n\nRegister optional sections, action forms, routes or replacement pages in \`src/config/module.ts\`. No global center union is required.\n`,
  );
  const smoke = `tests/e2e/${id}.generated.spec.ts`;
  put(
    smoke,
    `import { expect, test } from '@playwright/test';
const origin = 'http://127.0.0.1:' + (process.env['E2E_PRODUCTION'] ? ${port + 100} : ${port});
for (const shell of ['sidebar', 'navbar']) {
  for (const width of [390, 768, 1280, 1536]) {
    test(${JSON.stringify(id)} + ' generated center ' + shell + ' ' + width, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('shell', value), shell);
      await page.goto(origin + '/login');
      await expect(page.locator('html')).toHaveAttribute('data-center', ${JSON.stringify(id)});
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
      await expect(page).toHaveURL(origin + '/centers/${id}');
      for (const route of ['', '/inbox/group', '/inbox/personal', '/reports',
        ...['overview', 'applicants', 'parties', 'fields', 'requirements', 'attachments', 'payments', 'fees', 'refunds', 'decisions', 'actions', 'notes', 'activity', 'output'].map((section) => '/transactions/1001?section=' + section)]) {
        await page.goto(origin + '/centers/${id}' + route);
        await expect(page.locator('main > app-loading')).toHaveCount(0);
        await expect(page.locator('h1')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
      }
      expect(errors).toEqual([]);
    });
  }
}
`,
  );
  for (const file of files.keys())
    if (fs.existsSync(path.join(root, file))) throw new Error(`Refusing to overwrite ${file}.`);
  put('angular.json', json(workspace));
  put('package.json', json(pkg));
  put('turbo.json', json(turbo));
  const prettier = (await resolveConfig(path.join(root, 'package.json'))) ?? {};
  for (const [file, content] of files) {
    if (typeof content === 'string' && !file.endsWith('.svg'))
      files.set(file, await format(content, { ...prettier, filepath: path.join(root, file) }));
  }
  return { id, name, port, files };
}

export function applyCenterPlan(root, plan) {
  const originals = new Map(),
    directories = new Set();
  try {
    for (const [file, content] of plan.files) {
      const target = path.resolve(root, file);
      if (!target.startsWith(path.resolve(root) + path.sep))
        throw new Error('Invalid output path.');
      originals.set(target, fs.existsSync(target) ? fs.readFileSync(target) : null);
      let directory = path.dirname(target);
      while (!fs.existsSync(directory)) {
        directories.add(directory);
        directory = path.dirname(directory);
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    }
  } catch (error) {
    for (const [file, original] of [...originals].reverse()) {
      if (original === null) {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } else fs.writeFileSync(file, original);
    }
    for (const directory of [...directories].sort((a, b) => b.length - a.length))
      if (fs.existsSync(directory)) fs.rmdirSync(directory);
    throw error;
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      id: { type: 'string' },
      name: { type: 'string' },
      primary: { type: 'string' },
      secondary: { type: 'string' },
      logo: { type: 'string' },
      'dry-run': { type: 'boolean' },
      'skip-install': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(
      'npm run center:new -- <id-or-name> [--name "Center name"]\n' +
        'Options: --id slug --primary "#397b73" --secondary "#baa97d" --logo path\n' +
        '         --dry-run (no writes/install) --skip-install (run npm install yourself)',
    );
    return;
  }
  if (positionals.length > 1) throw new Error('Quote names containing spaces.');
  const rl = process.stdin.isTTY
    ? createInterface({ input: process.stdin, output: process.stdout })
    : null;
  const ask = async (given, question, validate) => {
    if (given !== undefined) return validate(given);
    if (!rl) throw new Error(`Missing input: ${question} Use CLI flags in non-interactive mode.`);
    while (true) {
      try {
        return validate((await rl.question(question)).trim());
      } catch (error) {
        if (rl.closed) throw error;
        console.error(error.message);
      }
    }
  };
  let options;
  try {
    const input = positionals[0];
    const suppliedId = values.id ?? (input && /^[a-z][a-z0-9-]*$/.test(input) ? input : undefined);
    if (suppliedId) centerId(suppliedId);
    const primary = await ask(values.primary, 'Primary color (HEX, e.g. #397b73): ', hexColor);
    const secondary = await ask(
      values.secondary,
      'Secondary color (HEX, e.g. #baa97d): ',
      hexColor,
    );
    const id = await ask(suppliedId, 'Center ID (e.g. new-center): ', centerId);
    const display = values.name ?? (input !== suppliedId ? input : undefined);
    const name = await ask(display, 'Center name: ', centerName);
    options = { id, name, primary, secondary, logo: values.logo };
  } finally {
    rl?.close();
  }
  const plan = await createCenterPlan(workspaceRoot, options);
  console.log(`\n${values['dry-run'] ? 'Preview' : 'Creating'} ${plan.name} (${plan.id}):`);
  for (const file of plan.files.keys()) console.log(`  ${file}`);
  if (values['dry-run']) return;
  applyCenterPlan(workspaceRoot, plan);
  if (!values['skip-install']) {
    console.log('\nUpdating npm workspace links and the root lockfile…');
    const npmCli = process.env.npm_execpath;
    const result = npmCli
      ? spawnSync(process.execPath, [npmCli, 'install', '--ignore-scripts'], {
          cwd: workspaceRoot,
          stdio: 'inherit',
        })
      : spawnSync(
          process.platform === 'win32' ? 'npm.cmd' : 'npm',
          ['install', '--ignore-scripts'],
          {
            cwd: workspaceRoot,
            stdio: 'inherit',
            shell: process.platform === 'win32',
          },
        );
    if (result.error || result.status !== 0)
      throw new Error(
        'Center files were created, but npm install failed. Run npm install --ignore-scripts from the root before starting the center.',
      );
  }
  console.log(
    `\nCreated ${plan.id}. ${values['skip-install'] ? 'Run npm install --ignore-scripts, then ' : ''}npm run dev:${plan.id}\n` +
      `http://localhost:${plan.port}\nEdit apps/${plan.id}/src/config/services.ts for approved services.\n` +
      (values.logo
        ? 'Your logo was copied unchanged.'
        : 'Replace the temporary marker with the authentic logo.'),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`\n${error.message}`);
    process.exitCode = 1;
  });
}
