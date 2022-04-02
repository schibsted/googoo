const getEnvFromPR = pullRequest => {
  const lines = pullRequest.body && pullRequest.body.split('\n');
  if (!lines) {
    return '';
  }
  const envLine = lines.find(line => line.startsWith('SET ENV '));
  if (!envLine) {
    return '';
  }

  return envLine.replace('SET ENV ', '').trim();
};

module.exports = getEnvFromPR;
