const { Octokit } = require('@octokit/rest');

const Github = (authToken, baseUrl) => {
  const github = new Octokit({
    baseUrl: baseUrl,
    auth: 'token ' + authToken,
  });

  return {
    getPullRequests: (owner, repo) => {
      return github.pulls.list({ owner, repo, per_page: 100 });
    },
    getIssueDescription: async (owner, repo, issue_number) => {
      const result = await github.issues.get({ owner, repo, issue_number });

      return result.data.body;
    },
    postComment: (owner, repo, issue_number, body) => {
      return github.issues.createComment({ owner, repo, issue_number, body });
    },
    editIssueDescription: (owner, repo, issue_number, description) => {
      return github.issues.update({ owner, repo, issue_number, body: description });
    },
  };
};

module.exports = Github;
