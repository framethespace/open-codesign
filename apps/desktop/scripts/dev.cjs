#!/usr/bin/env node
const { spawn } = require('node:child_process');
const { dirname, join } = require('node:path');

const electronVitePackageJson = require.resolve('electron-vite/package.json');
const electronViteBin = join(dirname(electronVitePackageJson), 'bin', 'electron-vite.js');
const env = { ...process.env };

// Some hosts, including automation agents, run Electron tooling with this set
// so Electron behaves like Node. The desktop dev app must launch real Electron.
env.ELECTRON_RUN_AS_NODE = undefined;

const child = spawn(process.execPath, [electronViteBin, 'dev', ...process.argv.slice(2)], {
  env,
  stdio: 'inherit',
  windowsHide: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
