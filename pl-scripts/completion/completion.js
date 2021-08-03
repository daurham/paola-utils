const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const {
  loadGoogleSpreadsheet,
  getRows,
  updateWorksheet,
} = require('../../googleSheets');
const {
  cloneOrPullRepository,
  GIT_RETURN_CODE,
} = require('../../git/git-clone');
const { asyncTimeout, TimeoutError } = require('./async-timeout');

const TEST_TIME_LIMIT_MS = 30000;

const CELL_VALUE_NO_FORK = 'No Fork';
const CELL_VALUE_TIMEOUT = 'Timed Out';
const CELL_VALUE_ERROR = 'Error';

const GIT_RESPONSE_LOG_STRINGS = {
  [GIT_RETURN_CODE.REPO_CLONED]: 'Cloned remote repo',
  [GIT_RETURN_CODE.REPO_PULLED]: 'Updated local repo from remote',
  [GIT_RETURN_CODE.ERROR_REPO_PULL]: 'Error updating local repo, skipping',
  [GIT_RETURN_CODE.ERROR_REPO_CLONE]: 'Error cloning remote repo, skipping',
  [GIT_RETURN_CODE.REPO_NOT_FOUND]: 'Remote repo not found, skipping',
  [GIT_RETURN_CODE.REPO_NOT_CHANGED]: 'Remote repo unchanged, skipping',
};

const getTime = () => new Date().toLocaleTimeString('en-US', { hour12: false });

function getDefaultProjectValues(project, value) {
  return project.sheetColumns.reduce(
    (obj, col) => ({ ...obj, [col]: value }),
    {},
  );
}

async function batchPromises(promiseGenerators, batchSize) {
  while (promiseGenerators.length) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      promiseGenerators.splice(0, batchSize || 1).map((g) => g()),
    );
  }
}

async function executeTestRunner(testRunnerPath, callback, showLogs) {
  if (!fs.existsSync(testRunnerPath)) {
    throw new Error(`Test runner does not exist: ${testRunnerPath}`);
  }
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  const page = await browser.newPage();
  if (showLogs) {
    page.on('console', (c) =>
      console.log(getTime(), '[Headless Browser]', c.text()),
    );
  }
  await page.goto(`file://${testRunnerPath}`);

  try {
    const result = await asyncTimeout(callback(page), TEST_TIME_LIMIT_MS);
    await browser.close();
    if (result instanceof Error) throw result;
    return result;
  } catch (err) {
    await browser.close();
    throw err;
  }
}

async function fetchAndTestProject({
  githubHandle,
  project,
  cohortId,
  verbose,
  lastCommitHash,
  localPathToStudentRepos,
}) {
  const logPrefix = `[${githubHandle} - ${project.repoName}]:`;
  const qualifiedRepoName = `${cohortId}-${project.repoName}`;
  const localRepoPath = path.resolve(
    localPathToStudentRepos,
    githubHandle,
    qualifiedRepoName,
  );
  const githubPath = `${githubHandle}/${qualifiedRepoName}.git`;
  const gitResult = await cloneOrPullRepository(
    localRepoPath,
    githubPath,
    // lastCommitHash,
  );
  console.info(getTime(), logPrefix, GIT_RESPONSE_LOG_STRINGS[gitResult.code]);

  const results = {
    hash: gitResult.hash,
    changes: {},
  };

  if (
    gitResult.code === GIT_RETURN_CODE.REPO_CLONED ||
    gitResult.code === GIT_RETURN_CODE.REPO_PULLED
  ) {
    console.info(getTime(), logPrefix, 'Executing test runner...');
    try {
      if (project.testRunnerFileName) {
        // Preferentially use an HTML testRunnerFileName in conjunction with
        // a getTestResults function that runs on the page
        results.changes = await executeTestRunner(
          path.join(localRepoPath, project.testRunnerFileName),
          project.getTestResults,
          verbose,
        );
      } else if (project.runTests) {
        // If there's no HTML test runner, use a supplied runTests function
        results.changes = await project.runTests(path.join(localRepoPath));
      }
    } catch (err) {
      if (verbose) console.error(err);
      const cellValue = {
        value:
          err instanceof TimeoutError ? CELL_VALUE_TIMEOUT : CELL_VALUE_ERROR,
        note: `${err.name}: ${err.message}`,
      };
      results.changes = getDefaultProjectValues(project, cellValue);
    }
  } else if (gitResult.code === GIT_RETURN_CODE.REPO_NOT_FOUND) {
    results.changes = getDefaultProjectValues(project, CELL_VALUE_NO_FORK);
  }
  return results;
}

async function updateRepoCompletionWorksheet({
  sheetId,
  sheetName,
  projects,
  techMentorName,
  batchSize,
  cohortId,
  localPathToStudentRepos,
  verbose,
}) {
  const sheet = await loadGoogleSpreadsheet(sheetId);
  const worksheet = sheet.sheetsByTitle[sheetName];
  if (!sheet) return false;

  const repoCompletionWorksheetRows = await worksheet.getRows();

  // Parse JSON from student metadata worksheet
  const studentMetadataWorksheet = sheet.sheetsByTitle['Repo Completion Metadata'];
  const studentMetadataWorksheetRows = await studentMetadataWorksheet.getRows();
  const studentMetadata = studentMetadataWorksheetRows.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.githubHandle]: JSON.parse(cur.json),
    }),
    {},
  );

  // Combine data from repo completion and metadata sheets
  const rawStudents = (await getRows(worksheet)).filter(
    (row) => row.githubHandle && (!techMentorName || row.techMentor === techMentorName),
  );
  const students = rawStudents.map((student) => ({
    ...student,
    metadata: studentMetadata[student.githubHandle] || {},
  }));

  // Defer creation of promises so execution doesn't begin immediately, for batching
  const promiseGenerators = students.map((student) => {
    return async () => {
      const studentResults = { githubHandle: student.githubHandle };
      await Promise.all(
        projects.map(async (project) => {
          const results = await fetchAndTestProject({
            githubHandle: student.githubHandle,
            project,
            cohortId,
            verbose,
            lastCommitHash: student.metadata[`${project.repoName}LastCommit`],
            localPathToStudentRepos,
          });
          Object.assign(studentResults, results.changes);
          student.metadata[`${project.repoName}LastCommit`] = results.hash; // eslint-disable-line no-param-reassign
        }),
      );
      // Update repo completion sheet
      await updateWorksheet(
        worksheet,
        'githubHandle',
        studentResults,
        repoCompletionWorksheetRows,
      );
      // Update student metadata sheet with tested commit hashes
      await updateWorksheet(
        studentMetadataWorksheet,
        'githubHandle',
        {
          githubHandle: student.githubHandle,
          json: JSON.stringify(student.metadata),
        },
        studentMetadataWorksheetRows,
      );
    };
  });

  await batchPromises(promiseGenerators, batchSize || 1);

  return true;
}

async function updateRepoCompletionWorksheets({
  sheetId,
  sheetNames,
  projects,
  batchSize,
  cohortId,
  localPathToStudentRepos,
  verbose,
}) {
  // eslint-disable-next-line no-restricted-syntax
  for (const sheetName of sheetNames) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await updateRepoCompletionWorksheet({
        sheetId,
        sheetName,
        projects,
        batchSize,
        cohortId,
        localPathToStudentRepos,
        verbose,
      });
      if (!result) {
        console.info(
          getTime(),
          `Google Sheet or Worksheet name not found, skipping: ${sheetName}`,
        );
      }
    } catch (err) {
      console.error(
        'Unexpected error when assessing repo completion, skipping:',
      );
      console.error(`sheetId: ${sheetId}, sheetName: ${sheetName}`);
      console.error(err);
    }
  }
}

module.exports = {
  fetchAndTestProject,
  updateRepoCompletionWorksheets,
};
