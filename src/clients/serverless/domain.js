const util = require('util');
const exec = util.promisify(require('child_process').exec);

const createDomain = async () => {
  try {
    await exec(`serverless create_domain -c serverless.review.yml`, {
      stdio: 'inherit',
      shell: true,
    });

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
};

const deleteDomain = async () => {
  try {
    await exec(`serverless delete_domain -c serverless.review.yml`, {
      stdio: 'inherit',
      shell: true,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createDomain,
  deleteDomain,
};
