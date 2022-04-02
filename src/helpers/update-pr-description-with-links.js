const Github = require('../clients/github');

const updatePrDescriptionWithLinks = async (prNumber, apps, githubConfig) => {
    const github = Github(githubConfig.token, githubConfig.baseUrl);
    const currentDescription = await github.getIssueDescription(githubConfig.org, githubConfig.repo, prNumber);

    const newDescription = apps.reduce((description, app) => {
        return description.replace(new RegExp(`\\[review-app-${app.site}\\]`, 'g'), app.url);
    }, currentDescription);

    return github.editIssueDescription(githubConfig.org, githubConfig.repo, prNumber, newDescription);
}

module.exports = updatePrDescriptionWithLinks;
