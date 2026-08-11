const { spawn, spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function dockerCompose(args) {
  return spawnSync('docker', ['compose', ...args], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });
}

console.log('[dev] Starting docker container (mysql)...');
const up = dockerCompose(['up', '-d']);
if (up.status !== 0) {
  process.exit(up.status ?? 1);
}

const nest = spawn('npx', ['nest', 'start', '--watch'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

let stopping = false;

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  console.log('\n[dev] Stopping docker container...');
  dockerCompose(['stop']);
  process.exit(exitCode);
}

nest.on('exit', (code) => stop(code ?? 0));

process.on('SIGINT', () => {
  nest.kill('SIGINT');
});
process.on('SIGTERM', () => {
  nest.kill('SIGTERM');
});
