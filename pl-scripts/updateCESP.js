/* eslint-disable no-console, quote-props */
require('dotenv').config();
const {
  DOC_ID_CESP,
  DOC_ID_PULSE,
  SHEET_ID_CESP_ROSTER,
  SHEET_ID_CESP_MODULE_COMPLETION,
} = require('../constants');
const techMentors = require('./tech-mentors');
const loadGoogleSpreadsheet = require('./loadGoogleSpreadsheet');

const CESP_ROSTER_SHEET_HEADERS = [
  'Full Name',
  'Campus',
  'GitHub',
  'Deadline Group',
  'Date Added',
  'SFDC Email',
  'VBA Funding Type',
  'Prep Type',
  'PRP Laser Coaching',
  'Precourse Attempts',
  'Tech Mentor',
  'Precourse Complete',
  'Status',
];
const CESP_MODULE_COMPLETION_SHEET_HEADERS = [
  'Full Name',
  'Campus',
  'GitHub',
  'Deadline Group',
  'Date Added',
  'Tech Mentor',
  'Module 1',
  'Module 2',
  'Module 3',
  'All Complete',
];

const getRepoCompletionSheetData = async (docID, sheetID) => {
  const doc = await loadGoogleSpreadsheet(docID);
  const sheet = doc.sheetsById[sheetID];
  const rows = await sheet.getRows();
  return rows.map((row) => ({
    fullName: row.fullName,
    campus: row.campus,
    githubHandle: row.githubHandle,
    deadlineGroup: row.deadlineGroup,
    dateAdded: row.dateAdded,
    email: row.email,
    techMentor: row.techMentor,
    VBAFundingType: row.VBAFundingType,
    prepType: row.prepType,
    hadLaserCoaching: row.hadLaserCoaching,
    numPrecourseEnrollments: row.numPrecourseEnrollments,
    koansMinReqs: row.koansMinReqs,
    javascriptKoans: row.javascriptKoans,
    testbuilder: row.testbuilder,
    underbarPartOne: row.underbarPartOne,
    underbarPartTwo: row.underbarPartTwo,
    twiddler: row.twiddler,
    recursion: row.recursion,
    partOneComplete: row.partOneComplete,
    partTwoComplete: row.partTwoComplete,
    partThreeComplete: row.partThreeComplete,
    allComplete: row.allComplete,
    onTimeKoansPR: row.onTimeKoansPR,
    onTimeTestbuilderPR: row.onTimeTestbuilderPR,
    onTimeUnderbarOnePR: row.onTimeUnderbarOnePR,
    onTimeTwiddlerPR: row.onTimeTwiddlerPR,
    onTimeRecursionPR: row.onTimeRecursionPR,
    notes: row.notes,
  }));
};
const sortStudentsByFullName = (a, b) =>
  a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase());
const sortStudentsByCampus = (a, b) =>
  a.campus.toLowerCase().localeCompare(b.campus.toLowerCase());
const sortStudentsByDateAdded = (a, b) =>
  a.dateAdded.toLowerCase().localeCompare(b.dateAdded.toLowerCase());

const updateCESPRosterSheet = async (students, docID, sheetID) => {
  const doc = await loadGoogleSpreadsheet(docID);
  const sheet = doc.sheetsById[sheetID];
  await sheet.clear();
  await sheet.setHeaderRow(CESP_ROSTER_SHEET_HEADERS);
  await sheet.addRows(students);
};

const updateCESPModuleCompletionSheet = async (students, docID, sheetID) => {
  const doc = await loadGoogleSpreadsheet(docID);
  const sheet = doc.sheetsById[sheetID];
  await sheet.clear();
  await sheet.setHeaderRow(CESP_MODULE_COMPLETION_SHEET_HEADERS);
  await sheet.addRows(students);
};

const formatStudentsForCESPRosterSheet = (students) => students.map((student) => ({
  'Full Name': student.fullName,
  'Campus': student.campus,
  'GitHub': student.githubHandle,
  'Deadline Group': student.deadlineGroup,
  'Date Added': student.dateAdded,
  'SFDC Email': student.email,
  'VBA Funding Type': student.VBAFundingType,
  'Prep Type': student.prepType,
  'PRP Laser Coaching': student.hadLaserCoaching,
  'Precourse Attempts': student.numPrecourseEnrollments,
  'Tech Mentor': student.techMentor,
  'Precourse Complete': student.allComplete,
  'Status': 'Enrolled',
}));
const formatStudentsForCESPModuleCompletionSheet = (students) => students.map((student) => ({
  'Full Name': student.fullName,
  'Campus': student.campus,
  'GitHub': student.githubHandle,
  'Deadline Group': student.deadlineGroup,
  'Date Added': student.dateAdded,
  'Tech Mentor': student.techMentor,
  'Module 1': student.partOneComplete,
  'Module 2': student.partTwoComplete,
  'Module 3': student.partThreeComplete,
  'All Complete': student.allComplete,
}));

(async () => {
  const studentsFromRepoCompletion = await Promise.all(
    techMentors.map(
      (techMentor) => getRepoCompletionSheetData(DOC_ID_PULSE, techMentor.repoCompletionSheetID),
    ),
  );
  const students = studentsFromRepoCompletion
    .flat()
    .filter((student) => student.fullName)
    .sort(sortStudentsByFullName)
    .sort(sortStudentsByDateAdded)
    .sort(sortStudentsByCampus);
  console.info(`Adding ${students.length} students to CES&P roster...`);
  const roster = formatStudentsForCESPRosterSheet(students);
  const moduleCompletion = formatStudentsForCESPModuleCompletionSheet(students);
  console.info('Updating roster sheet...');
  await updateCESPRosterSheet(roster, DOC_ID_CESP, SHEET_ID_CESP_ROSTER);
  console.info('Updating module completion sheet...');
  await updateCESPModuleCompletionSheet(
    moduleCompletion,
    DOC_ID_CESP,
    SHEET_ID_CESP_MODULE_COMPLETION,
  );
  console.info('Done!');
})();
