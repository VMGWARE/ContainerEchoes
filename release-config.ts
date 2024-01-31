export default {
  commentOnReleasedPullRequests: false,
  // Update the package.json version for the server and web projects
  beforePrepare: async ({ exec, nextVersion }) => {
    // Update the server package.json version
    await exec(`cd server && npm version ${nextVersion} --no-git-tag-version`);

    // Update the web package.json version
    await exec(`cd web && npm version ${nextVersion} --no-git-tag-version`);
  },
};
