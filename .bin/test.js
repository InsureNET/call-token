const ganache = require('ganache-cli');
const spawn = require('child_process').spawn;
const path = require('path');
const SEPARATOR = process.platform === 'win32' ? ';' : ':';
const env = Object.assign({}, process.env);

const server = ganache.server({
  gasPrice: 2000000000,
  gasLimit: 8000000,
  // eslint-disable-next-line camelcase
  total_accounts: 10,
  // eslint-disable-next-line camelcase
  network_id: 999,
});

env.PATH = path.resolve('./node_modules/.bin') + SEPARATOR + env.PATH;

const main = async () => {
  await server.listen('7545');
  const child = spawn('truffle', ['test'], {
    cwd: process.cwd(),
    env: env,
  });
  child.stdout.on('data', data => process.stdout.write(data.toString()));
  child.stderr.on('data', data => process.stderr.write(data.toString()));
  child.on('close', code => process.exit(code));
};

main();
