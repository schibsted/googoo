const process = require('process');
const merge = require('lodash.merge');
const get = require('lodash.get');

const defaultConfig = {
    github: {
        baseUrl: 'https://api.github.com',
    },
    app: {
        prefix: 'review-',
        useCustomDomain: false,
        serverlessConfigFile: 'serverless.yml',
    },
    buildCommand: '',
    createAppLink: () => {},
};

const requiredOptions = [
    'github.token',
    'github.org',
    'github.repo',
    'ci.prNumber',
];

module.exports = (configFilePath) => {
    const config = merge(
        defaultConfig,
        configFilePath ? require(`${process.cwd()}/${configFilePath}`) : {},
    );

    requiredOptions.map(option => {
        if (!get(config, option)) {
            throw new Error(`${option} is required in config file`);
        }
    });

    config.app.regex = new RegExp(`${config.app.prefix}(\\d+)($|-.+)`, 'm');

    return config;
}
