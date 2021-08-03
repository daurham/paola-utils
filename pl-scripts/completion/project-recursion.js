/* global mocha */
module.exports = {
  repoName: 'recursion',
  testRunnerFileName: 'SpecRunner.html',
  sheetColumns: ['recursion'],
  getTestResults: (page) => {
    return page.evaluate(() => {
      return new Promise((resolve) => {
        function onComplete() {
          resolve({
            recursion: mocha.suite.suites.filter(
              (section) => section.tests[0].state === 'passed',
            ).length,
          });
        }
        // eslint-disable-next-line no-underscore-dangle
        if (mocha._state === 'init' || mocha._state === 'running') {
          mocha.suite.afterAll(() => onComplete());
        } else {
          onComplete();
        }
      });
    });
  },
};
