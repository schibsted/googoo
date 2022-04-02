const exec = require('child_process').exec;

module.exports = (command, options, callback = () => {}) => {
    return new Promise((resolve, reject) => {
        const ls = exec(command, options, callback);

        ls.stdout.pipe(process.stdout);
        ls.stderr.pipe(process.stderr);

        ls.on('exit', function (code) {
            if (code === 0) {
                return resolve();
            }

            reject();
        });
    });
}
