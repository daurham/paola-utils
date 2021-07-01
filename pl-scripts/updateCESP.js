/* eslint-disable no-console, quote-props */
/**
 * TODO:
 *  - handle separated students
 *  - remove or update the "CES&P is updated" box with date on the sheet
 */
require('dotenv').config();
const { loadGoogleSpreadsheet, replaceWorksheet } = require('../googleSheets');
const {
  DOC_ID_CESP,
  DOC_ID_PULSE,
  SHEET_ID_CESP_ROSTER,
  SHEET_ID_CESP_MODULE_COMPLETION,
} = require('../constants');
const techMentors = require('../tech-mentors');

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

const getRepoCompletionSheetData = async (sheet) => {
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
  console.info('Retrieving roster from Pulse...');
  const pulseSheet = await loadGoogleSpreadsheet(DOC_ID_PULSE);
  const studentsFromRepoCompletion = await Promise.all(
    techMentors.map((techMentor) => getRepoCompletionSheetData(
      pulseSheet.sheetsById[techMentor.repoCompletionSheetID],
    )),
  );
  const students = studentsFromRepoCompletion
    .flat()
    .filter((student) => student.fullName)
    .sort(sortStudentsByFullName)
    .sort(sortStudentsByDateAdded)
    .sort(sortStudentsByCampus);
  const roster = formatStudentsForCESPRosterSheet(students);
  const moduleCompletion = formatStudentsForCESPModuleCompletionSheet(students);

  console.info(`Adding ${students.length} students to CES&P roster.`);

  console.info('Retrieving CES&P sheet...');
  const doc = await loadGoogleSpreadsheet(DOC_ID_CESP);

  console.info('Updating roster worksheet...');
  await replaceWorksheet(doc.sheetsById[SHEET_ID_CESP_ROSTER], CESP_ROSTER_SHEET_HEADERS, roster);

  console.info('Updating module completion worksheet...');
  await replaceWorksheet(
    doc.sheetsById[SHEET_ID_CESP_MODULE_COMPLETION],
    CESP_MODULE_COMPLETION_SHEET_HEADERS,
    moduleCompletion,
  );

  console.info('Done!');
})();
