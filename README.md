# googoo

Library that allows to create review apps using Serverless framework.

## Usage

First, you need to install this library as dependency in your project - `npm install --save-dev @schibsted/googoo`

Add a script in your `package.json`:
```json
{
  "scripts": {
    "deploy-review-app": "npx node_modules/@schibsted/googoo deploy -c googoo.config.js",
    "cleanup-review-app": "npx node_modules/@schibsted/googoo cleanup -c googoo.config.js"
  }
}
```

Create `googoo.config.js` file. Example below:

```js
module.exports = {
    github: {
        token: 'GITHUB_TOKEN',
        baseUrl: 'https://github.mycompany.io/api/v3',
        org: 'myAwesomeGithubOrg',
        repo: 'myProject',
    },
    ci: {
        prNumber: '4077',
    },
    app: {
        prefix: 'myapp-pr-',
        useCustomDomain: true,
        serverlessConfigFile: 'serverless.review.yml',
    },
    buildCommand: 'npm run build',
    createAppLink: (url, site, appName) => {
        return `- [**${site}**](${url}) This is great!`;
    },
    hooks: {
      beforeBuild: (site, appName) => {},
      afterBuild: (site, appName) => {},
      beforeDeploy: (site, appName) => {},
      afterDeploy: (site, appName, isDeployed, reviewAppUrl) => {},
    },
};

```

Configuration options:
* `github.token` - required. Library calls Github API to retrieve PR description and update it with links.
* `github.baseUrl` - optional. By default, public Github API will be called, but you might want to use it with your Github Enterprise
* `github.org` - required. Github organization where the repo belongs to.
* `github.repo` - required. Your Github repository name
* `ci.prNumber` - required. PR number. Usually you will retrieve this from env variables in your CI. It is used in the app name.
* `app.prefix` - optional. By default, your app name will be prefixed with `review-`, but you might want to customize it
* `app.useCustomDomain` - optional. Allows you to have your custom domain to be used with review apps. Keep in mind that the domain has to be delegated to Route53 then and ACM certificate has to exist in us-east-1 region.
* `app.serverlessConfigFile` - optional. Name of file with serverless app config. Defaults to `serverless.yml`
* `buildCommand` - optional. Allows to call additional script before deploying the app
* `createAppLink` - optional. Once the app is deployed, library will post app link as comment in PR. You might want to customize the format.
* `hooks` - optional. An object consisting of JS functions to call during the process:
  * `beforeBuild` - called before running the `buildCommand` (only if `buildCommand` is defined)
  * `afterBuild` - called after running the `buildCommand` (only if `buildCommand` is defined)
  * `beforeDeploy` - called before running serverless deploy
  * `afterDeploy` - called after running serverless deploy. It receives two additional arguments:
    - `isDeployed` - boolean with the status of the deploy
    - `reviewAppUrl` - final review app URL

Example of `serverless.yml` file:

```yaml
service: ${env:SERVICE_NAME}

plugins:
  - serverless-offline
  - serverless-domain-manager

frameworkVersion: '2'
useDotenv: true

provider:
  name: aws
  runtime: nodejs12.x
  lambdaHashingVersion: 20201221
  logRetentionInDays: 7
  region: eu-north-1
  apiGateway:
    binaryMediaTypes:
      - '*/*'
  environment:
    DEFAULT_HOST: https://${self:service}.pr.example.com
    IS_REVIEW_APP: true
  
custom:
  customDomain:
    domainName: ${self:service}.pr.example.com
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true

package:
  exclude:
    - .git/**
    - .idea/**

functions:
  app:
    handler: ./serverless.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
    environment: ${file(./serverless.review.env.yml):environment} # this is optional - you can use it to be able to set env variables in PR description
```

Now make sure to call review apps scripts somewhere in your CI:

`npm run deploy-review-app` should be ideally called when running CI for PRs and you're done with testing.

`npm run cleanup-review-app` will remove all review apps that do not have opened PR. For example, it can be called using cron once per day.

It is a bit boring now, but only one step is left :) Add optional PR template to your Github repo. Create `.github/PULL_REQUEST_TEMPLATE.md` file:

```markdown
**Review app**

Check "Create review app" and at least **one** APP to deploy a review app. **Note** that you can deploy multiple review apps at once by checking several publications.

- [ ] Create review app
  - [ ] deploy **app**

Additionally, you can override env variables in the review app. Just uncomment the line below and fill in with your desired values.

// SET ENV FOO="BAR BAZ BAT" ANOTHER_ENV_VAR="bar baz bat"
```

You are done! :) 

## Local development

```
nvm use
npm install
npm start
```
