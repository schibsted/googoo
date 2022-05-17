const exec = require('../../helpers/user-friendly-exec');

const deployApp = async (reviewAppName, configFile) => {
  console.log(`Deploying ${reviewAppName}`);
  try {
    await exec(`serverless deploy -c ${configFile}`, {
      stdio: 'inherit',
      shell: true,
    });

    return true;
  } catch (error) {
    console.log(`Can not deploy review app ${reviewAppName}`);
    console.error(error);

    return false;
  }
};

const removeApp = async (reviewAppName, configFile) => {
  console.log(`Removing ${reviewAppName}`);
  try {
    await exec(`serverless remove -c ${configFile}`, {
      stdio: 'inherit',
      shell: true,
    });

    return true;
  } catch (error) {
    console.log(`Can not remove review app ${reviewAppName}`);
    console.error(error);

    return false;
  }
};

const appExists = async (configFile) => {
  try {
    await exec(`serverless info -c ${configFile}`, {
      stdio: 'inherit',
      shell: true,
    });

    return true;
  } catch (error) {
    return false;
  }
}

const getAppUrl = async (configFile, useCustomDomain) => {
  const searchFor = useCustomDomain ? '^DomainName' : 'ServiceEndpoint';
  return new Promise(async (resolve, reject) => {
    try {
      await exec(`serverless info -c ${configFile} --verbose | sed 's/^ *//g' | grep ${searchFor} | sed s/${searchFor}\\:\\ //g`, {
        stdio: 'inherit',
        shell: true,
      }, (error, stdout) => {
        const domain = stdout.trim();
        resolve(useCustomDomain ? `https://${domain}/` : domain);
      });
    } catch (error) {
      return reject(false);
    }
  });
};

module.exports = {
  deployApp,
  removeApp,
  appExists,
  getAppUrl,
};
