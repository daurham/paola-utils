/* eslint-env browser */
/* global mocha */
const MESSAGE_FINAL_STEP_READY = 'STEP FOUR:';
const MESSAGE_SUITE_COMPLETED =
  'Congratulations! You have finished the exercise!';
const APPEND_TO_TEST_COUNT_ON_INCOMPLETE = ' ❌';
const APPEND_TO_TEST_COUNT_ON_NESTED_SUITES = ' 🤔';

module.exports = {
  repoName: 'testbuilder',
  testRunnerFileName: 'index.html',
  sheetColumns: ['testbuilder'],
  getTestResults: async (page) => {
    let hasCompletedMessage = false;
    page.on('console', function onConsole(event) {
      if (event.text() === MESSAGE_SUITE_COMPLETED) {
        hasCompletedMessage = true;
      } else if (event.text().startsWith(MESSAGE_FINAL_STEP_READY)) {
        page.evaluate(() => window.nextStep());
      }
    });

    await page.evaluate(function evalPage() {
      window.detectNetwork('38345678901234');
      window.detectNetwork('39345678901234');
      window.detectNetwork('343456789012345');
      window.detectNetwork('373456789012345');
      window.nextStep();
      window.detectNetwork('4123456789012');
      window.detectNetwork('4123456789012345');
      window.detectNetwork('4123456789012345678');
      window.detectNetwork('5112345678901234');
      window.detectNetwork('5212345678901234');
      window.detectNetwork('5312345678901234');
      window.detectNetwork('5412345678901234');
      window.detectNetwork('5512345678901234');
      window.nextStep();
      window.nextStep();
      window.nextStep();
    });

    // Bail out if suite isn't running
    if (!(await page.evaluate(() => document.querySelector('.passes')))) {
      return {
        testbuilder: 0,
      };
    }

    // Explicitly wait for the number of test results to match the number of defined tests
    await page.waitForFunction(() => {
      function countTests(suites) {
        return suites.reduce(
          (acc, suite) => acc + suite.tests.length + countTests(suite.suites),
          0,
        );
      }
      const definedTests = countTests(mocha.suite.suites);
      const executedTests =
        Number(document.querySelector('.passes em').innerText) +
        Number(document.querySelector('.failures em').innerText);
      return executedTests >= definedTests;
    });

    const hasNestedSuites = await page.evaluate(() => {
      return mocha.suite.suites.some((suite) => suite.suites.length > 0);
    });

    let testsPassing =
      Number(
        await page.$$eval(
          '.passes',
          (passes) => passes[0].children[1].innerText,
        ),
      ) || 0;
    if (!hasCompletedMessage) {
      testsPassing += APPEND_TO_TEST_COUNT_ON_INCOMPLETE;
    } else if (hasNestedSuites) {
      testsPassing += APPEND_TO_TEST_COUNT_ON_NESTED_SUITES;
    }

    return {
      testbuilder: testsPassing,
    };
  },
};
