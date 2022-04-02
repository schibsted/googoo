const util = require('util');
const exec = util.promisify(require('child_process').exec);

const runCommand = async (command) => {
    try {
        await exec(command, {
            stdio: 'inherit',
            shell: true,
        });

        return true;
    } catch (error) {
        console.error(error);

        return false;
    }
};

module.exports = runCommand;
