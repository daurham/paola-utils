const { getNewStudentsFromSFDC, hasIntakeFormCompleted } = require('../getNewStudentsFromSFDC');
const { slackAPIRequest } = require('../../slack');
const { LEARN_COHORT_ID, SLACK_JOIN_URL_STUB } = require('../../constants');
const {
  getDeadline,
  getMissedDeadlineStudents,
  getModule1MissDetails,
  getModule2MissDetails,
  getModule3MissDetails,
} = require('./missedDeadlines');
const { getRosterStudents } = require('./getStudents');

const MERGE_FIELD_STUDENT_INFO_FORM_URL = 'www.tfaforms.com/369587?tfa_57=';

const normalizeEmail = (email) => email.toLowerCase().replace(/\./g, '');
const normalizeName = (name) => name.toLowerCase().replace(/\s/g, '');
async function getMissingSlackUsers() {
  let cursor = '';
  const slackUsers = [];
  do {
    const response = await slackAPIRequest(`users.list?cursor=${cursor}`, 'GET'); // eslint-disable-line no-await-in-loop
    slackUsers.push(...response.members);
    cursor = response.response_metadata.next_cursor;
  } while (cursor);
  const rosterStudents = await getRosterStudents();
  return rosterStudents.filter((rosterStudent) => !slackUsers.find(
    (slackUser) => slackUser.profile && slackUser.profile.email
      && (
        normalizeEmail(slackUser.profile.email) === normalizeEmail(rosterStudent.email)
        || normalizeName(slackUser.profile.real_name) === normalizeName(rosterStudent.fullName)
      ),
  ));
}

const formatName = (name) => name.toLowerCase().split(' ').map((part) => part.replace(/^(.)/, (char) => char.toUpperCase())).join(' ');
const numDaysAgo = (dateString) => Math.floor(
  (new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24),
);

module.exports = [{
  key: 'studentInfoFormReminder',
  draftName: '[Action Required] Student Info Form Submission',
  async getEmails() {
    const newStudents = await getNewStudentsFromSFDC();
    const naughtyList = newStudents
      .filter((student) => !hasIntakeFormCompleted(student));
    return naughtyList.map((student) => ({
      email: student.email,
      fields: {
        formURL: MERGE_FIELD_STUDENT_INFO_FORM_URL + student.sfdcContactId,
      },
    }));
  },
}, {
  key: 'joinSlackReminder',
  draftName: '[Action Required] SEI Precourse Slack',
  async getEmails() {
    const students = await getMissingSlackUsers();
    const staleStudents = students.filter((s) => numDaysAgo(s.dateAddedToPrecourse) > 1);
    return staleStudents.map((student) => ({
      email: student.email,
      fields: {
        name: formatName(student.preferredFirstName),
        slackJoinURL: SLACK_JOIN_URL_STUB,
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
        learnCohortId1: LEARN_COHORT_ID,
        learnCohortId2: LEARN_COHORT_ID,
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
        learnCohortId1: LEARN_COHORT_ID,
        learnCohortId2: LEARN_COHORT_ID,
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
        learnCohortId1: LEARN_COHORT_ID,
        learnCohortId2: LEARN_COHORT_ID,
      },
    }));
  },
}];
