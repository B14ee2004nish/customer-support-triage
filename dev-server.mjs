import { spawn } from 'child_process';

const rawArgs = process.argv.slice(2);
let port = process.env.PORT || '3000';
let hostname = '0.0.0.0';

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--port' || arg === '-p') {
    port = rawArgs[++i] || port;
  } else if (arg === '--host' || arg === '-H' || arg === '--hostname') {
    hostname = rawArgs[++i] || hostname;
  }
}

const child = spawn('npx', ['next', 'dev', '-p', port, '-H', hostname], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: port },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
