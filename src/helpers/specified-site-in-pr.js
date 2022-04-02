const specifiedSiteInPr = pullRequest => {
  try {
    const lines = pullRequest.body.split('\r\n');

    const result = lines
      .filter(line => line.includes('- [x] deploy **'))
      .map(line => {
        const appString = line.split('- [x] deploy **')[1];
        return appString.substring(0, appString.indexOf('**'));
      });

    if (result && result.length) {
      return result;
    }

    return '';
  } catch (err) {
    return '';
  }
};

module.exports = specifiedSiteInPr;
