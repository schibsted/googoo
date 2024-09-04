const parseEnvString = require('parse-env-string');
const getEnvFromPR = require('./get-env-from-pr');

const writeEnvVariablesToProcess = (pr) => {
  const prVars = getEnvFromPR(pr);
  const vars = parseEnvString(prVars);
  
  for (const key in vars) {
    process.env[key] = vars[key];
  }
}

module.exports = writeEnvVariablesToProcess;
