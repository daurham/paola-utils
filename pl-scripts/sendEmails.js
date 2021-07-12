/* eslint-disable no-restricted-syntax, no-await-in-loop, no-console */
require('dotenv').config();
const { slackAPIRequest } = require('../slack');
const Bottleneck = require('bottleneck');
const {
  DOC_ID_HRPTIV,
  SHEET_ID_HRPTIV_ROSTER,
  DOC_ID_PULSE,
  DEADLINES_FULL_TIME,
  DEADLINES_PART_TIME,
} = require('../constants');
const {
  loadGoogleSpreadsheet,
  getSheetMetadata,
  upsertSheetMetadata,
  deleteSheetMetadata,
} = require('../googleSheets');
const { sendEmailFromDraft } = require('../googleMail');
const { getNewStudentsFromSFDC, hasIntakeFormCompleted } = require('./getNewStudentsFromSFDC');
const techMentors = require('../tech-mentors');

const NO_FORK_TEXT = 'No Fork';
const ERROR_TEXT = 'Timed Out';
const TIMED_OUT_TEXT = 'Timed Out';
const MESSAGE_NO_FORKS = 'According to our records, you haven\'t forked any of the assignment repositories.';

const rateLimiter = new Bottleneck({
  maxConcurrent: 3,
  minTime: 500,
});
const sendEmailFromDraftRL = rateLimiter.wrap(sendEmailFromDraft);

const normalizeEmail = (email) => email.toLowerCase().replace(/\./g, '');
const normalizeName = (name) => name.toLowerCase().replace(/\s/g, '');

let cachedRosterStudents;
let cachedRepoCompletionStudents;

async function getRosterStudents() {
  const sheetHRPTIV = await loadGoogleSpreadsheet(DOC_ID_HRPTIV);
  const rosterStudents = await sheetHRPTIV.sheetsById[SHEET_ID_HRPTIV_ROSTER].getRows();
  return rosterStudents;
}

async function getRepoCompletionStudents() {
  const doc = await loadGoogleSpreadsheet(DOC_ID_PULSE);
  const sheets = await Promise.all(
    techMentors.map(async (techMentor) => {
      const sheetID = techMentor.repoCompletionSheetID;
      const sheet = doc.sheetsById[sheetID];
      const rows = await sheet.getRows();
      return rows.filter((row) => row.githubHandle);
    }),
  );
  return sheets.flat();
}

async function getMissingSlackUsers() {
  const slackUsers = await slackAPIRequest('users.list', 'GET');
  if (!cachedRosterStudents) cachedRosterStudents = await getRosterStudents();
  return cachedRosterStudents.filter((rosterStudent) => !slackUsers.members.find(
    (slackUser) => slackUser.profile && slackUser.profile.email
      && (
        normalizeEmail(slackUser.profile.email) === normalizeEmail(rosterStudent.email)
        || normalizeName(slackUser.profile.real_name) === normalizeName(rosterStudent.fullName)
      ),
  ));
}

const getDeadline = (student, moduleNumber, final) => {
  const { deadlineGroup, campus } = student;
  let key = final ? 'Final' : deadlineGroup;
  if (!(key in DEADLINES_FULL_TIME)) key = 'W4'; // give up :(
  const deadlines = campus.includes('RPT') ? DEADLINES_PART_TIME[key] : DEADLINES_FULL_TIME[key];
  return deadlines[moduleNumber - 1];
};

async function getMissedDeadlineStudents(moduleNumber) {
  if (!cachedRepoCompletionStudents) {
    cachedRepoCompletionStudents = await getRepoCompletionStudents();
  }
  if (!cachedRosterStudents) {
    cachedRosterStudents = await getRosterStudents();
  }
  return cachedRepoCompletionStudents.filter((student) => {
    const softDeadline = getDeadline(student, moduleNumber);
    const hardDeadline = getDeadline(student, moduleNumber, true);
    const isModuleComplete = [
      student.partOneComplete === 'Yes',
      student.partTwoComplete === 'Yes',
      student.partThreeComplete === 'Yes',
    ];
    if (softDeadline === hardDeadline) return false;
    if (student[`notifiedM${moduleNumber}Miss`]) return false;

    const dateParts = softDeadline.split('/');
    const cutoff = new Date(dateParts[2], Number(dateParts[0]) - 1, Number(dateParts[1]) + 1);
    return cutoff < new Date() && !isModuleComplete[moduleNumber - 1];
  }).map((student) => ({
    ...student,
    preferredFirstName: cachedRosterStudents.find((rosterStudent) => rosterStudent.fullName === student.fullName).preferredFirstName,
  }));
}

function getProjectCompletionMessage(projectName, repoCompletionValue, isComplete) {
  /* eslint-disable no-else-return */
  if (repoCompletionValue === NO_FORK_TEXT) {
    return `${projectName} has not been forked`;
  } else if (repoCompletionValue === TIMED_OUT_TEXT) {
    return `${projectName} is <b>timing out</b> (taking more than 30 seconds to execute)`;
  } else if (repoCompletionValue === ERROR_TEXT) {
    return `${projectName} is throwing an error`;
  } else if (isComplete) {
    return `${projectName} is complete ✅`;
  }
  return `${projectName} is <b>not complete</b> ❌`;

  /* eslint-enable no-else-return */
}

function getMissedDeadlineDetails(student, projects) {
  if (projects.every(([projectName, projectValue]) => projectValue === NO_FORK_TEXT)) {
    return MESSAGE_NO_FORKS;
  }

  const messages = projects.map((project) => getProjectCompletionMessage(...project));
  if (messages.length > 1) {
    messages[messages.length - 1] = `and ${messages[messages.length - 1]}`;
  }
  return `According to our records, ${messages.join(', ')}.`;
}

function getModule1MissDetails(student) {
  return getMissedDeadlineDetails(student, [
    ['JavaScript Koans', student.javascriptKoans, student.koansMinReqs === 'Yes'],
    ['Testbuilder', student.testbuilder, Number(student.testbuilder) >= 3323 && Number(student.testbuilder) < 3330],
    ['Underbar Part 1', student.underbarPartOne, Number(student.underbar) >= 55],
  ]);
}

function getModule2MissDetails(student) {
  return getMissedDeadlineDetails(student, [
    ['Underbar Part 2', student.underbarPartTwo, Number(student.underbarPartTwo) >= 58],
    ['Twiddler', student.twiddler, Number(student.twiddler) >= 3.5],
  ]);
}

function getModule3MissDetails(student) {
  return getMissedDeadlineDetails(student, [
    ['Recursion', student.recursion, Number(student.recursion) >= 2],
  ]);
}

const formatName = (name) => name.toLowerCase().split(' ').map((part) => part.replace(/^(.)/, (char) => char.toUpperCase())).join(' ');
const numDaysAgo = (dateString) => Math.floor(
  (new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24),
);

const EMAILS = [{
  key: 'studentInfoFormReminder',
  draftName: '[Action Required] Student Info Form Submission',
  async getEmails() {
    const newStudents = await getNewStudentsFromSFDC();
    const naughtyList = newStudents
      .filter((student) => !hasIntakeFormCompleted(student));
    return naughtyList.map((student) => ({
      email: student.email,
      fields: {
        formURL: `www.tfaforms.com/369587?tfa_57=${student.sfdcContactId}`,
      },
    }));
  },
}, {
  key: 'joinSlackReminder',
  draftName: '[Action Required] SEI Precourse Slack',
  async getEmails() {
    const students = await getMissingSlackUsers();
    const staleStudents = students.filter((s) => numDaysAgo(s.dateAddedToPrecourse) > 2);
    return staleStudents.map((student) => ({
      email: student.email,
      fields: {
        name: formatName(student.preferredFirstName),
        slackJoinURL: 'join.slack.com/t/sei-opr/shared_invite/zt-n8sr33fp-WgI39v3Ev0EhW1ixyws1_w',
      },
    }));
  },
}, {
  key: 'missedSoftDeadline1',
  draftName: 'SEI Precourse - Module 1 Soft Deadline Missed',
  async getEmails() {
    const students = await getMissedDeadlineStudents(1);
    return students.map((student) => ({
      email: student.email,
      fields: {
        name: formatName(student.preferredFirstName),
        deadlineDate: getDeadline(student, 1),
        details: getModule1MissDetails(student),
      },
    }));
  },
}, {
  key: 'missedSoftDeadline2',
  draftName: 'SEI Precourse - Module 2 Soft Deadline Missed',
  async getEmails() {
    const students = await getMissedDeadlineStudents(2);
    return students.map((student) => ({
      email: student.email,
      fields: {
        name: formatName(student.preferredFirstName),
        deadlineDate: getDeadline(student, 2),
        details: getModule2MissDetails(student),
      },
    }));
  },
}, {
  key: 'missedSoftDeadline3',
  draftName: 'SEI Precourse - Module 3 Soft Deadline Missed',
  async getEmails() {
    const students = await getMissedDeadlineStudents(3);
    return students.map((student) => ({
      email: student.email,
      fields: {
        name: formatName(student.preferredFirstName),
        deadlineDate: getDeadline(student, 3),
        details: getModule3MissDetails(student),
      },
    }));
  },
}];

// TODO: This is pretty nasty. Parameterize for CLI usage?
const OVERRIDE_EMAIL_RECIPIENT = null;// 'daniel.rouse@galvanize.com';
const SEND_SINGLE_EMAIL_ONLY = false;// true;
const CLEAR_CACHE = false;
const SEND_EMAILS = true;

(async () => {
  // change to pulse doc instead of hrptiv
  const docPulse = await loadGoogleSpreadsheet(DOC_ID_PULSE);
  for (const { key, draftName, getEmails } of EMAILS) {
    // if (key !== 'studentInfoFormReminder') continue;

    console.info(`Checking for ${draftName}...`);
    if (CLEAR_CACHE) {
      console.info('Clearing list of sent emails...');
      await deleteSheetMetadata(docPulse, key);
    }

    const sheetMetadata = (await getSheetMetadata(docPulse, key)) || '';
    const sentEmails = sheetMetadata.split(',');
    const allRecipients = await getEmails();
    const filteredRecipients = allRecipients.filter(({ email }) => !sentEmails.includes(email));
    filteredRecipients.forEach(({ email }) => console.info('> ', email));
    let recipients = filteredRecipients;
    if (SEND_SINGLE_EMAIL_ONLY) {
      if (filteredRecipients.length === 0) {
        recipients = [{
          email: OVERRIDE_EMAIL_RECIPIENT,
          fields: {
            name: 'Tchicphillait',
            deadlineDate: '13/37',
            formURL: 'formURL',
            slackJoinURL: 'slackJoinURL',
          },
        }];
      } else {
        recipients = [filteredRecipients[0]];
        recipients[0].email = OVERRIDE_EMAIL_RECIPIENT;
      }
    }

    await Promise.all(
      recipients.map(({ email, fields }) => {
        console.info(`Sending "${draftName} to "${email}"`);
        console.log(fields.details);
        if (SEND_EMAILS) {
          return sendEmailFromDraftRL(
            draftName,
            OVERRIDE_EMAIL_RECIPIENT || email,
            [],
            [],
            { name: 'SEI Precourse', email: 'sei.precourse@galvanize.com' },
            fields,
          );
        }
        return null;
      }),
    );

    // only update cache if using real data
    if (!OVERRIDE_EMAIL_RECIPIENT && !SEND_SINGLE_EMAIL_ONLY && SEND_EMAILS) {
      console.info('Updating list of sent emails...');
      await upsertSheetMetadata(docPulse, key, allRecipients.map(({ email }) => email).join(','));
    }
  }
})();
