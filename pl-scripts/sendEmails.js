/* eslint-disable no-restricted-syntax, no-await-in-loop */
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

const rateLimiter = new Bottleneck({
  maxConcurrent: 3,
  minTime: 400,
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

const formatName = (name) => name.toLowerCase().split(' ').map((part) => part.replace(/^(.)/, (char) => char.toUpperCase())).join(' ');
const numDaysAgo = (dateString) => Math.floor(
  (new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24),
);
const EMAILS = [{
//   key: 'studentInfoFormReminder',
//   draftName: '[Action Required] Student Info Form Submission',
//   async getEmails() {
//     const newStudents = await getNewStudentsFromSFDC();
//     const naughtyList = newStudents
//       .filter((student) => !hasIntakeFormCompleted(student));
//     return naughtyList.map((student) => ({
//       email: student.email,
//       fields: {
//         formURL: `www.tfaforms.com/369587?tfa_57=${student.sfdcContactId}`,
//       },
//     }));
//   },
// }, {
//   key: 'joinSlackReminder',
//   draftName: '[Action Required] SEI Precourse Slack',
//   async getEmails() {
//     const students = await getMissingSlackUsers();
//     const staleStudents = students.filter((s) => numDaysAgo(s.dateAddedToPrecourse) > 2);
//     return staleStudents.map((student) => ({
//       email: student.email,
//       fields: {
//         name: formatName(student.preferredFirstName),
//         slackJoinURL: 'join.slack.com/t/sei-opr/shared_invite/zt-n8sr33fp-WgI39v3Ev0EhW1ixyws1_w',
//       },
//     }));
//   },
// }, {
  key: 'missedSoftDeadline1',
  draftName: 'SEI Precourse - Module 1 Soft Deadline Missed', // TODO
  async getEmails() {
    const students = await getMissedDeadlineStudents(1);
    return students.map((student) => ({
      email: student.email,
      techMentor: student.techMentor,
      fullName: student.fullName,
      fields: {
        name: formatName(student.preferredFirstName),
        deadlineDate: getDeadline(student, 1),
      },
    }));
  },
}, {
  key: 'missedSoftDeadline2',
  draftName: 'SEI Precourse - Module 2 Soft Deadline Missed', // TODO
  async getEmails() {
    const students = await getMissedDeadlineStudents(2);
    return students.map((student) => ({
      email: student.email,
      techMentor: student.techMentor,
      fullName: student.fullName,
      fields: {
        name: formatName(student.preferredFirstName),
        deadlineDate: getDeadline(student, 2),
      },
    }));
  },
}, {
  key: 'missedSoftDeadline3',
  draftName: 'SEI Precourse - Module 3 Soft Deadline Missed', // TODO
  async getEmails() {
    const students = await getMissedDeadlineStudents(3);
    return students.map((student) => ({
      email: student.email,
      techMentor: student.techMentor,
      fullName: student.fullName,
      fields: {
        name: formatName(student.preferredFirstName),
        deadlineDate: getDeadline(student, 3),
      },
    }));
  },
}];

(async () => {
  // change to pulse doc instead of hrptiv
  const docPulse = await loadGoogleSpreadsheet(DOC_ID_PULSE);
  for (const { key, draftName, getEmails } of EMAILS) {
    console.info(`Checking for ${draftName}...`);
    // await deleteSheetMetadata(docPulse, key);

    const sheetMetadata = (await getSheetMetadata(docPulse, key)) || '';
    const sentEmails = sheetMetadata.split(',');
    const unfilteredEmails = await getEmails();
    const filteredEmails = unfilteredEmails.filter(({ email }) => !sentEmails.includes(email));
    // filteredEmails = filteredEmails.map(s => ({ ...s, email: 'daniel.rouse@galvanize.com' }));
    // if (!filteredEmails.length) continue;
    // filteredEmails = [filteredEmails[0]];
    // filteredEmails[0].email = 'daniel.rouse@galvanize.com';
    await Promise.all(
      filteredEmails.map(({ email, fields, techMentor, fullName }) => {
        console.info(`${draftName}: ${techMentor}, ${fullName}, ${email}...`);
        // return null;
        return sendEmailFromDraftRL(
          draftName,
          email,
          [],
          [],
          { name: 'SEI Precourse', email: 'sei.precourse@galvanize.com' },
          fields,
        );
      }),
    );
    await upsertSheetMetadata(docPulse, key, filteredEmails.map(({ email }) => email).join(','));
  }

  // cache manually populated EOD 7/6/21
  // plan for test run weds 7/7:
  // comment out upsert line and run for new results Weds morning
  // test sending soft deadline missed emails to self
  // confirm email addresses, uncomment upsert line and run
})();
