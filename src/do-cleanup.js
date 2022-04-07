const AWS = require('aws-sdk');
const Github = require('./clients/github');
const { deleteDomain } = require('./clients/serverless/domain');
const { removeApp } = require('./clients/serverless/app');

const doCleanup = async (config) => {
  const getOpenPrs = async () => {
    const github = Github(config.github.token, config.github.baseUrl);

    const [prs] = await Promise.all([
      github.getPullRequests(config.github.org, config.github.repo),
    ]);

    return prs.data.map(pr => pr.number);
  };

  const getApps = async () => new Promise((resolve, reject) => {
    const apiGateway = new AWS.APIGateway({apiVersion: '2015-07-09'});

    apiGateway.getRestApis({ limit: 500 }, (err, data) => {
      if (err) {
        reject(err)
      }

      const result = data.items
        .map(item => {
          const matches = config.app.regex.exec(item.name);
          return matches && matches[0];
        })
        .filter(item => !!item);

      resolve(result);
    });
  });

  const getAppsToRemove = async () => {
    const openPrs = await getOpenPrs();

    const activeApps = await getApps();

    return activeApps.filter(app => {
      const matches = config.app.regex.exec(app);
      if (!matches || matches.length < 2) {
        return false;
      }

      const appNumber = parseInt(matches[1], 10);

      return openPrs.indexOf(appNumber) === -1;
    });
  };

  const appsToRemove = await getAppsToRemove();

  if (appsToRemove.length === 0) {
    console.log('Nothing to remove, bye...');
    return;
  }

  for (const app of appsToRemove) {
    process.env.SERVICE_NAME = app;

    if (config.app.useCustomDomain) {
      await deleteDomain();
    }
    await removeApp(app, config.app.serverlessConfigFile);
  }
};

module.exports = doCleanup;
