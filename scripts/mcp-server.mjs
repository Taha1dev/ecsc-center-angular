import path from 'node:path';
import { spawn } from 'node:child_process';
import { workspaceRoot } from './workspace-apps.mjs';

const server = process.argv[2];
let command;
let args;
if (server === 'angular-cli') {
  command = process.execPath;
  args = [
    path.join(workspaceRoot, 'node_modules/@angular/cli/bin/ng.js'),
    'mcp',
    '--root',
    workspaceRoot,
  ];
} else if (server === 'spartan-ui') {
  const packages = ['-y', '--package=@spartan-ng/mcp@1.8.0', '--package=ajv@8.17.1', 'spartan-mcp'];
  command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
  args = process.platform === 'win32' ? ['/d', '/c', 'npx', ...packages] : packages;
} else {
  throw new Error('Use: node scripts/mcp-server.mjs angular-cli|spartan-ui');
}
const child = spawn(command, args, { cwd: workspaceRoot, stdio: 'inherit', windowsHide: true });
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
