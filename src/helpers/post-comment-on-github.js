const Github = require('../clients/github');

const postCommentOnGithub = async (apps, prNumber, githubConfig, createAppLink) => {
    const appsComment = apps.map(({ url, site, appName }) => {
        console.log(
            `New app - Review app can be reached by browsing: ${url}`
        );

        if (typeof createAppLink === 'function') {
            return createAppLink(url, site, appName);
        }

        return `- [**${site}**](${url})`;
    });

    const comment = `## Review apps:\n${appsComment.join('\n')}`;

    const github = Github(githubConfig.token, githubConfig.baseUrl);
    github.postComment(githubConfig.org, githubConfig.repo, prNumber, comment);
}

module.exports = postCommentOnGithub;
