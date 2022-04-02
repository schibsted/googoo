const yaml = require('js-yaml');
const parseEnvString = require('parse-env-string');
const fs = require('fs');
const getEnvFromPR = require('./get-env-from-pr');

const writeEnvVariablesFile = (pr) => {
  const prVars = getEnvFromPR(pr);
  const vars = parseEnvString(prVars);
  const yamlContent = yaml.dump({ environment: vars });

  fs.writeFileSync('./serverless.review.env.yml', yamlContent);
}

module.exports = writeEnvVariablesFile;
