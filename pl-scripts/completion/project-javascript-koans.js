/* global jasmine */
module.exports = {
  repoName: 'javascript-koans',
  testRunnerFileName: 'KoansRunner.html',
  repoCompletionColumnNames: ['koansMinReqs', 'javascriptKoans'],
  getTestResults: (page) =>
    page.evaluate(() => {
      return new Promise((resolve) => {
        function onComplete() {
          // eslint-disable-next-line no-underscore-dangle
          const suites = jasmine.currentEnv_.currentRunner_.suites();
          const requiredSuites = [
            'About Expects',
            'About Arrays',
            'About Functions',
            'About Objects',
          ];
          resolve({
            repoCompletionChanges: {
              koansMinReqs: requiredSuites.every((suiteName) =>
                suites.some(
                  (suite) =>
                    suite.description === suiteName &&
                    suite.results().failedCount === 0,
                ),
              )
                ? 'Yes'
                : 'No',
              javascriptKoans: suites.reduce(
                (sum, suite) =>
                  sum +
                  suite.specs().filter((spec) => spec.results_.failedCount === 0) // eslint-disable-line no-underscore-dangle
                    .length,
                0,
              ),
            },
            failedTests: Array.from(
              document.querySelectorAll('.spec.failed a.description')
            ).map((elem) => elem.getAttribute('title')),
          });
        }

        if (
          jasmine.currentEnv_.currentRunner_ // eslint-disable-line no-underscore-dangle
            .suites()
            .some((suite) => !suite.finished)
        ) {
          jasmine.currentEnv_.currentRunner_.finishCallback = onComplete; // eslint-disable-line no-underscore-dangle
        } else {
          onComplete();
        }
      });
    }),
};
