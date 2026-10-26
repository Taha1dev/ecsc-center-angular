# Creating a center

Run from the repository root:

```sh
npm run center:new -- new-center
```

The generator first asks `Does this center have a defined visual identity? (y/n):`.

- Answer `n` to skip the color questions and use primary `#002623`, secondary `#988561`, and `assets/branding/default-center/id.webp` for both the logo and favicon.
- Answer `y` to enter primary and secondary HEX colors, such as `#397b73` or `#abc`.

It then asks for `Center name`, the display name. Use a technical ID with lowercase Latin letters, digits, and hyphens, such as `new-center`. You can also pass a quoted display name and supply the technical ID when prompted:

```sh
npm run center:new -- "New Service Center"
```

## Preview or run without questions

Custom identity:

```sh
npm run center:new -- new-center --name "New Service Center" --visual-identity y --primary "#397b73" --secondary "#baa97d" --dry-run
```

Default identity:

```sh
npm run center:new -- new-center --name "New Center" --visual-identity n --dry-run
```

Remove `--dry-run` to create the files. Do not combine `--visual-identity n` with `--primary`, `--secondary`, or `--logo`. Older non-interactive commands that supply custom colors without the identity flag still work.

When passing flags through npm in Windows PowerShell, use `npm.cmd run center:new -- ...` if npm.ps1 does not forward the options correctly.

Additional options:

- `--logo "C:/assets/logo.png"`: copy a supplied local logo unchanged. Supported formats: SVG, PNG, JPEG, WebP, and ICO.
- `--skip-install`: create files without installing. Run `npm install --ignore-scripts` afterward to update the root lockfile and workspace links.
- `--help`: show usage.

## What gets created

The generator creates `apps/<id>`, registers Angular CLI, npm, and Turbo tasks, and chooses development/preview ports not already assigned in the workspace configuration. Preview and Playwright discovery read `angular.json` rather than a fixed center list. Port selection does not check other programs running on your machine.

It creates a browser smoke test covering both shells, widths of 390/768/1280/1536px, and the transaction sections. It also creates routes, navigation, API configuration, and test/production environment files.

Inputs and conflicts are checked before writing. Existing centers cannot be overwritten. `--dry-run` writes nothing and does not install dependencies. A normal run uses `npm install --ignore-scripts` to update the single lockfile and workspace links. If installation fails, the files remain and the generator prints the command to finish setup.

## Branding and sample data

Generated centers use Alexandria, RTL, and the existing shared layouts. All new centers use the shared stars login pattern, copied unchanged into their own public brand folder.

`brand.json` records the selected colors and derived tokens; `src/brand.css` applies them. The supplied primary remains the branded background at `brand-950`, and the supplied secondary is stored at `highlight-500`. Action colors can be adjusted for readable contrast. Shared status colors keep their common meaning across brands.

For a custom identity without `--logo`, the generator creates a temporary geometric marker. Replace it with the actual logo before adopting that identity. For the default identity, it copies the shared image to `public/brands/<id>/logo.webp` and uses it as both logo and favicon.

Catalogs, fees, decisions, and generated data are examples. Replace `src/config/services.ts` and `reports.ts` with approved definitions.

After creation:

```sh
npm run dev:new-center
```

Build and preview just that center:

```sh
npm run build:new-center
npm run preview:new-center
```

Use the checks appropriate to your changes. See [validation](VALIDATION.md) for the available commands.

Inside `apps/<id>`, use `npm run build:dev` for the test environment, or `npm run build` for production. After enabling `ng` with `.\dev.ps1` at the root, `ng build` inside that same center folder also selects its production build. See [local build commands and environments](api-configuration.md#run-and-build).

## Environments and API settings

Each center has:

- `apps/<id>/src/environments/environment.ts`: test settings, with `production: false`.
- `apps/<id>/src/environments/environment.production.ts`: production settings, with `production: true`.

Both export an `environment` object with matching properties. Add new settings to both files. Always import the base environment file:

```ts
import { environment } from './environments/environment';
```

`npm run dev:<id>` defaults to the test configuration. `npm run build:<id>` uses production and replaces the environment file through `fileReplacements`.

After enabling the workspace CLI with `.\dev.ps1`, build a test version with:

```sh
ng build new-center --configuration=test
```

Both files contain `apiBaseUrl`. `src/app.config.ts` supplies it through the shared `API_CONFIG` token. Set the addresses for your backend; the initial `/api` value needs an API or proxy on the same origin. See [API configuration](api-configuration.md).

## Delete a generated center

```sh
npm run center:delete -- new-center
```

The command lists the app folder, generated test, and build output, then requires this exact confirmation:

```text
delete new-center center
```

Any other response cancels. There is no confirmation bypass, and deletion requires an interactive terminal. Confirming removes the app, including local customizations, its generated test, and build output. It also removes Angular/npm/Turbo registrations and updates workspace links and the lockfile.

An application with `center.deletionProtected: true` in its `package.json` cannot be deleted by this tool, regardless of its name. Existing protected applications retain that explicit metadata. New generated manifests include `center.generated: true` and `center.deletionProtected: false`. The tool also checks the generated folder/brand structure; changing a metadata flag alone does not make an arbitrary directory deletable. It rechecks configuration and application metadata after confirmation to reject stale plans.

On Windows, stop the center's development or preview server with `Ctrl+C` first. The tool backs up files without renaming the app directory and retries temporary file locks. If a persistent lock prevents deletion, it restores files/settings and explains which processes to close. If recovery itself fails, it preserves the backup and prints its path.

Preview deletion without changing anything:

```sh
node scripts/delete-center.mjs new-center --dry-run
```
