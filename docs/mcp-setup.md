# Project-local MCP servers

The optional Codex setup is committed in [`.codex/config.toml`](../.codex/config.toml). It does not change user-level MCP settings or contain API keys.

| Server        | Transport       | Launcher                                  |
| ------------- | --------------- | ----------------------------------------- |
| `context7`    | Streamable HTTP | `https://mcp.context7.com/mcp`            |
| `angular-cli` | STDIO           | `node scripts/mcp-server.mjs angular-cli` |
| `spartan-ui`  | STDIO           | `node scripts/mcp-server.mjs spartan-ui`  |

Launch the project client/session from the repository root. The committed command arguments are relative to that working directory. The Node launcher then derives the repository location from its own file and starts each tool there. It uses the installed Angular CLI and chooses the appropriate npm launcher for Windows or POSIX systems. No personal checkout path or unsupported configuration-variable substitution is used.

If your MCP client does not launch project commands from the repository root, set the working directory or absolute launcher path in that client's machine-local configuration. Do not commit your personal path. Codex supports optional per-server working-directory configuration; exact path resolution and project trust behavior depend on the client.

Prerequisites are the supported Node/npm versions, `npm ci`, network access for external docs and the first Spartan npm-cache download, and a client that supports the configured MCP transports. The Spartan launcher supplies pinned `@spartan-ng/mcp` and `ajv` packages through npm's temporary execution cache; it does not migrate the workspace to another build system.

## Inspect and troubleshoot

Restart the client/session after changing registrations. Project configuration is not evidence that the servers connected successfully.

With a Codex CLI installation, inspect the effective configuration from the repository root:

```sh
codex mcp list
codex mcp get angular-cli
codex mcp get spartan-ui
```

Use the client's tool inventory to confirm an actual connection. STDIO servers expect protocol messages on stdin/stdout, so launching one by hand may wait silently for a client. Diagnostics should go to stderr.

A missing API key, network policy, unavailable npm cache package, or client trust restriction can prevent startup. Context7 is configured without a key; service limits may apply. Store any optional credentials outside committed configuration.

References: [Codex MCP settings](https://learn.chatgpt.com/docs/extend/mcp), [Angular MCP](https://angular.dev/ai/mcp), [Spartan MCP](https://www.npmjs.com/package/@spartan-ng/mcp), and [Context7 clients](https://context7.com/docs/resources/all-clients).
