const Github = require('./clients/github');
const specifiedSiteInPr = require('./helpers/specified-site-in-pr');
const postCommentOnGithub = require('./helpers/post-comment-on-github');
const updatePrDescriptionWithLinks = require('./helpers/update-pr-description-with-links');
const writeEnvVariablesFile = require('./helpers/write-env-variables-file');
const writeEnvVariablesToProcess = require('./helpers/write-env-variables-to-process');
const runCommand = require('./clients/run-command');
const { appExists, deployApp, getAppUrl } = require('./clients/serverless/app');
const { createDomain } = require('./clients/serverless/domain');

const doDeploy = async (config) => {
  const github = Github(config.github.token, config.github.baseUrl);

  const [prs] = await Promise.all([
    github.getPullRequests(config.github.org, config.github.repo),
  ]);

  const [pr] = prs.data.filter(
    prData => prData.number === parseInt(config.ci.prNumber)
  );
  if (!pr) {
    console.log(
      `Skipping review app deployment as no open pr exist for travis pr ${config.ci.prNumber}.`
    );
    return;
  }

  const reviewSites = specifiedSiteInPr(pr);

  await writeEnvVariablesFile(pr);

  writeEnvVariablesToProcess(pr);

  let appsCreated = [];

  const {
    beforeBuild = () => {},
    afterBuild = () => {},
    beforeDeploy = () => {},
    afterDeploy = () => {},
  } = config.hooks || {};

  for (const reviewSite of reviewSites) {
    const reviewAppName = `${config.app.prefix}${pr.number}-${reviewSite}`;

    process.env.SERVICE_NAME = reviewAppName;
    process.env.PUBLICATION = reviewSite;

    console.log(`Creating app ${reviewAppName}`);

    if (config.buildCommand) {
      console.log(`Running build command "${config.buildCommand}" for app ${reviewAppName}...`);

      beforeBuild(reviewSite, reviewAppName);

      const isAppBuilt = await runCommand(config.buildCommand);

      afterBuild(reviewSite, reviewAppName);

      if (!isAppBuilt) {
        throw new Error(`Can not build ${reviewAppName} app!`);
      }
    }

    const doesAppExist = await appExists(config.app.serverlessConfigFile);
    if (!doesAppExist && config.app.useCustomDomain) {
      console.log('App does not exist, creating domain...');
      const isDomainCreated = await createDomain();
      if (!isDomainCreated) {
        throw new Error(`Can not create domain for ${reviewAppName} app`);
      }
    }

    beforeDeploy(reviewSite, reviewAppName);

    const isDeployed = await deployApp(reviewAppName, config.app.serverlessConfigFile);

    const reviewAppUrl = await getAppUrl(config.app.serverlessConfigFile, config.app.useCustomDomain);

    afterDeploy(reviewSite, reviewAppName, isDeployed, reviewAppUrl);

    if (!isDeployed) {
      throw new Error('Can not deploy review app');
    }

    if (!doesAppExist) {
      appsCreated.push({
        url: reviewAppUrl,
        site: reviewSite,
        appName: reviewAppName,
      });
    }
  }

  if (appsCreated.length > 0) {
    await postCommentOnGithub(appsCreated, pr.number, config.github, config.createAppLink);
    await updatePrDescriptionWithLinks(pr.number, appsCreated, config.github);
  }
};

module.exports = doDeploy;
