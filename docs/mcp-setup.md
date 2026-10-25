# Project-local MCP servers

Codex configuration lives in [`.codex/config.toml`](../.codex/config.toml). It registers three enabled servers for this repository, without changing user-level MCP settings:

| Server        | Transport       | Launch / endpoint                                                                        |
| ------------- | --------------- | ---------------------------------------------------------------------------------------- |
| `context7`    | Streamable HTTP | `https://mcp.context7.com/mcp`                                                           |
| `angular-cli` | STDIO           | Installed workspace Angular CLI: `node node_modules/@angular/cli/bin/ng.js mcp --root .` |
| `spartan-ui`  | STDIO           | `@spartan-ng/mcp@1.8.0`, with `ajv@8.17.1` supplied through npm exec's temporary cache   |

The two local processes explicitly start in `E:/Development/ecsc-center-angular`, so Angular discovers this workspace instead of an unrelated working directory. If the repository moves, update their `cwd` settings. `cmd.exe` runs the npm launcher on Windows. Spartan's temporary npm packages do not add dependencies or Nx configuration to this workspace.

Prerequisites: the project's supported Node/npm versions, `npm ci` for Angular, and network access for Context7, Spartan documentation and the first npm-cache download. Context7 is configured without an API key; service rate limits apply. Do not commit API keys to this file.

After adding or changing these settings, restart the local Codex client/extension or open a new Codex session for this trusted project. A configuration change does not add new tools to an already running conversation automatically.

To inspect the resolved registrations from the repository root:

```powershell
codex mcp get context7 --json
codex mcp get angular-cli --json
codex mcp get spartan-ui --json
```

These commands inspect configuration, not connection health. The client's `/mcp` view shows active connections. Keep the project trusted in Codex so its project-level configuration can be loaded.

Verification completed for this setup: Context7 initialized and listed its two documentation tools; Angular initialized, listed nine tools and successfully discovered this repository with `list_projects`; Spartan initialized, listed 17 tools and returned its component catalog.

The installed standalone Codex CLI currently rejects the existing user-level `service_tier = "default"` setting. Registration inspection succeeded with a per-command compatibility override, without changing that user-level file:

```powershell
codex -c 'service_tier="fast"' mcp get angular-cli --json
```

References: [Codex MCP configuration](https://learn.chatgpt.com/docs/extend/mcp), [Angular CLI MCP](https://angular.dev/ai/mcp), [Spartan MCP](https://www.npmjs.com/package/@spartan-ng/mcp), [Context7 setup](https://context7.com/docs/resources/all-clients).
