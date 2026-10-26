# Service Center Workspace

Each center is an independent Angular application with its own identity, settings, pages, and data integration. Shared packages provide reusable code; they do not share live state between running applications.

## Run an existing center

Open a terminal at the repository root, where `package.json` lives. Use a Node.js version accepted by its `engines.node` field and the npm version in `packageManager`. Then install dependencies:

```sh
npm ci
```

Open `angular.json` and find a project with `projectType: "application"` whose folder exists under `apps/`. Run `npm run` to see its scripts, then start it with `npm run dev:<id>`, replacing `<id>` with that project's ID. Open the URL printed in the terminal.

Enable the local shortcut once in each PowerShell terminal:

```powershell
.\dev.ps1
```

The chapters use `ng` after this setup. On other shells, use `npm run ng --` in place of `ng`, from the repository root. Both use the workspace shortcuts; a global Angular CLI alone does not provide them.

## Read in order

1. **README**: install dependencies and run an existing application.
2. [01 - Workspace](docs/01-workspace.md): choose where code belongs and follow application startup.
3. [02 - Create a center](docs/02-create-center.md): generate an application and configure its identity.
4. [03 - Generate code](docs/03-generate-code.md): create and use components, services, pipes, directives, and Spartan controls.
5. [04 - Pages and navigation](docs/04-pages-and-navigation.md): give a page a URL and a menu entry.
6. [05 - Data and API](docs/05-data-and-api.md): configure an address, make a request, and show its result.
7. [06 - Build and check](docs/06-build-and-check.md): build, preview, test, and remove a disposable center.

The walkthrough uses **`guide-center`** as an example ID. It is not an application you must keep or a fixed platform registry. Use an unused ID for your work; applications are discovered from configuration and files on disk.

[Optional MCP setup](docs/mcp-setup.md) is available separately; it is not needed to follow the chapters.

**Continue to [01 - Workspace](docs/01-workspace.md).**
