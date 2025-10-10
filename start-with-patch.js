#!/usr/bin/env node

/**
 * Custom Expo start script
 * Just forwards to expo start
 */

const { spawn } = require('child_process');

const args = process.argv.slice(2);
const expo = spawn('npx', ['expo', 'start', ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});

expo.on('exit', (code) => {
  process.exit(code);
});
