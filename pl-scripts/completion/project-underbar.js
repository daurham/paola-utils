/* global mocha */
module.exports = {
  repoName: 'underbar',
  testRunnerFileName: 'SpecRunner.html',
  sheetColumns: ['underbarPartOne', 'underbarPartTwo'],
  getTestResults: (page) =>
    page.evaluate(() => {
      return new Promise((resolve) => {
        function onComplete() {
          const passedTestCount = mocha.suite.suites.map((section) => {
            return section.suites
              .map(
                (subsection) =>
                  subsection.tests.filter((t) => t.state === 'passed').length,
              )
              .reduce((sum, cur) => sum + cur, 0);
          });
          resolve({
            underbarPartOne: passedTestCount[0],
            underbarPartTwo: passedTestCount[1],
            // underbarExtra: passedTestCount[2],
          });
        }
        // TODO: mocha._state is not present here, so there's a potential
        // race condition where the test runner finishes before this runs
        // if (mocha._state === 'init' || mocha._state === 'running') {
        mocha.suite.afterAll(() => onComplete());
        // } else {
        //   onComplete();
        // }
      });
    }),
};
