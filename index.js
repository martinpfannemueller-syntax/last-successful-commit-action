const core = require("@actions/core");
const github = require("@actions/github");

try {
  const octokit = github.getOctokit(core.getInput("github_token"));
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  octokit.actions
    .listWorkflowRuns({
      owner,
      repo,
      workflow_id: core.getInput("workflow_id"),
      status: "success",
      branch: core.getInput("branch"),
      event: "push",
    })
    .then((res) => {
      let workflow_runs = res.data.workflow_runs;
      workflow_runs.sort(function (a, b) {
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
      const lastSuccessCommitHash =
        workflow_runs.length > 0
          ? workflow_runs[0].head_commit.id
          : "";
      core.setOutput("commit_hash", lastSuccessCommitHash);
    })
    .catch((e) => {
      core.setFailed(e.message);
    });
} catch (e) {
  core.setFailed(e.message);
}
