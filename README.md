# Service Center Workspace

A reusable Angular workspace for independently configured service-center applications. There is no fixed center list or count. Applications share libraries while keeping their own identity, configuration, data integrations, and extensions.

## Start here

Use a Node.js version supported by `package.json` (`engines.node`) and the npm version in its `packageManager` field. Install dependencies once from the repository root:

```sh
npm ci
```

Start one application, replacing the example ID with an existing center:

```sh
npm run dev:test-center
```

Or run all configured workspace development tasks:

```sh
npm run dev
```

The terminal prints application URLs. Ports are configured in `angular.json`, not fixed by this guide. `npm run` lists the available scripts. `npm start` is a convenience alias for one example application; it does not select a platform-wide default center.

On PowerShell, enable the local `ng` shortcut once per terminal:

```powershell
.\dev.ps1
ng g s customers-api
```

On other shells, or without the shortcut:

```sh
node scripts/ng.mjs g s customers-api
```

The wrapper asks whether the code belongs to a center or a shared package. A global Angular CLI alone does not provide these workspace shortcuts.

## Common tasks

| Task                                  | Command                                        |
| ------------------------------------- | ---------------------------------------------- |
| Create a center                       | `npm run center:new -- new-center`             |
| Create a service                      | `ng g s customers-api`                         |
| Create a component                    | `ng g c customer-card`                         |
| Create a pipe or directive            | `ng g p display-name` / `ng g d busy`          |
| Create a page in a known center       | `ng g page --center-name=new-center customers` |
| Add a Spartan primitive               | `ng g @spartan-ng/cli:ui accordion`            |
| Build one center and its dependencies | `npm run build:test-center`                    |
| Preview its production build          | `npm run preview:test-center`                  |
| Build every workspace package         | `npm run build`                                |

Examples naming an app are not a required center registry. Use an existing ID from `angular.json` or create one first. New pages still need route registration and, when wanted, a menu link.

Services are generated injectable and without tests. The complete picker behavior, destinations, and generation flags are in the [development guide](docs/development-guide.md).

Build output for a center is `dist/apps/<id>/browser/`. Imported library code is included in the application build; libraries do not need separate hosting. Hosting must support SPA route fallback. This repository does not deploy anything automatically.

## Project map

| Location               | Role                                                               |
| ---------------------- | ------------------------------------------------------------------ |
| `apps/<id>`            | Independent applications and their local configuration/features    |
| `packages/domain`      | Shared framework-independent types and rules                       |
| `packages/data-access` | Shared data contracts, adapters, services, and state               |
| `packages/ui`          | Generic UI controls, shared styles, and display utilities          |
| `packages/core`        | Shared product features, layouts, and composition contracts        |
| `libs/ui`              | Owned Spartan Helm source shared by applications                   |
| `assets`               | Source assets copied by tooling; not a global served public folder |
| `scripts`              | Workspace tooling and neutral center templates                     |

Existing applications include demo workflows and sample data. Their catalogs, palettes, URLs, and business rules are not universal requirements. Most transaction data is currently in memory; public API examples do not turn the platform into a production backend or authentication system.

## Guides

- [Create your first center: illustrated walkthrough](docs/guides/create-center.md)
- [Architecture and ownership](docs/ARCHITECTURE.md)
- [Development examples and generator options](docs/development-guide.md)
- [Create/delete a center and choose its identity](docs/center-generator.md)
- [Routes and navigation menus](docs/center-navigation.md)
- [API configuration and adapters](docs/api-configuration.md)
- [Spartan components](docs/spartan-ui.md)
- [Current visual system](DESIGN.md)
- [Verification commands and limits](docs/VALIDATION.md)
- [Optional project-local MCP setup](docs/mcp-setup.md)
- [Agent instructions](AGENTS.md)
