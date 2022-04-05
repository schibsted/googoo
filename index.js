const yargs = require('yargs');
const loadConfig = require('./src/load-config');

const doCleanup = require('./src/do-cleanup');
const doDeploy = require('./src/do-deploy');

const params = yargs
    .command('deploy', 'Deploys review app(s)', {
      config: {
        alias: 'c',
        description: 'config file',
        type: 'string',
      }
    })
    .command('cleanup', 'Cleanup review app(s)', {
      config: {
        alias: 'c',
        description: 'config file',
        type: 'string',
      }
    })
    .parse();

const command = params._.pop() || '';
if (!['deploy', 'cleanup'].includes(command)) {
  throw new Error(`Command ${command} is unrecognized`);
}

const config = loadConfig(params.config);

(async () => {
  if (command === 'cleanup') {
    return await doCleanup(config);
  }

  try {
    await doDeploy(config);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
