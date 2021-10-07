const cypress = require('cypress');
const path = require('path');

module.exports = {
  repoName: 'twiddler',
  repoCompletionColumnNames: ['onTimeTwiddlerPR'],
  runTests: (repoPath) => {
    const strippedPath = repoPath.replace(path.resolve(__dirname, '../..'), '');
    return cypress
      .run({
        config: {
          defaultCommandTimeout: 100,
          fixturesFolder: false,
          integrationFolder: path.resolve(__dirname, 'twiddler-cypress-tests'),
          pluginsFile: false,
          supportFile: false,
          screenshotOnRunFailure: false,
          video: false,
        },
        configFile: false,
        quiet: true,
        reporter: path.resolve(__dirname, 'twiddler-cypress-dummy-reporter.js'),
        env: {
          INDEX_PATH: `${strippedPath}/index.html`,
          ALL_TESTS: true,
        },
      })
      .then((results) => {
        return {
          repoCompletionChanges: {
            onTimeTwiddlerPR: results.totalPassed,
          },
        };
      });
  },
};
