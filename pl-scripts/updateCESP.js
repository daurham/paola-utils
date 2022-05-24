/* eslint-disable no-console, quote-props */
/**
 * TODO:
 *  - handle separated students
 *  - remove or update the "CES&P is updated" box with date on the sheet
 */
require('dotenv').config();
const { loadGoogleSpreadsheet, replaceWorksheet, getRows } = require('../googleSheets');
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
  'RFP Pod',
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

const sortStudentsByFullName = (a, b) =>
  a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase());
const sortStudentsByCampus = (a, b) =>
  a.campus.toLowerCase().localeCompare(b.campus.toLowerCase());
const sortStudentsByDateAdded = (a, b) =>
  a.dateAdded.toLowerCase().localeCompare(b.dateAdded.toLowerCase());

const formatStudentsForCESPRosterSheet = (students, separations) => students.map((student) => ({
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
  'Status': (separations.find((separatedStudent) => separatedStudent.fullName === student.fullName) || { separationType: 'Enrolled' }).separationType,
  'RFP Pod': student['RFP Pod'],
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

const filterAndSortStudents = (students) => students
  .filter((student) => student.fullName)
  .sort(sortStudentsByFullName)
  .sort(sortStudentsByDateAdded)
  .sort(sortStudentsByCampus);

(async () => {
  console.info('Retrieving roster from Pulse...');
  const pulseSheet = await loadGoogleSpreadsheet(DOC_ID_PULSE);
  const studentsFromRepoCompletion = await Promise.all(
    techMentors.map((techMentor) => getRows(
      pulseSheet.sheetsById[techMentor.repoCompletionSheetID],
    )),
  );
  const studentsFromSeparatedRepoCompletion = await getRows(pulseSheet.sheetsByTitle['Separated Repo Completion']);
  const students = filterAndSortStudents(studentsFromRepoCompletion.flat())
    .concat(filterAndSortStudents(studentsFromSeparatedRepoCompletion));
  const separations = await getRows(pulseSheet.sheetsByTitle['Separation Tracker']);
  const activeStudents = students.filter((student) => !separations.find(
    (separatedStudent) => separatedStudent.fullName === student.fullName,
  ));

  const allStudents = await getRows(pulseSheet.sheetsByTitle['HRPTIV']);

  const pacificStudents = activeStudents.filter(s => s.campus === 'RFT Pacific')
    .map((s) => {
      const scores = [
        s.m1DiagnosticTask1,
        s.m1DiagnosticTask2,
        s.m2DiagnosticTask1,
        s.m2DiagnosticTask2,
        s.m3DiagnosticTask1,
        s.m3DiagnosticTask2,
      ].filter((score) => score !== '-' && score !== undefined);
      const hasDiagnostics = scores.length > 0;
      const diagnosticAverage = scores.length > 0
        ? scores.reduce((acc, cur) => acc + Number(cur), 0) / scores.length
        : 0;

      const rosterMatch = allStudents.find((rosterEntry) => rosterEntry.fullName.toLowerCase()
        === s.fullName.toLowerCase());
      const isCalifornia = !!(rosterMatch && (
        rosterMatch.addressWhileInSchool.match(/california/i)
        || rosterMatch.addressWhileInSchool.match(/\bCA\b/)
      ));

      return {
        ...s,
        isCalifornia,
        hasDiagnostics,
        diagnosticAverage,
      };
    });

  const getPodAverage = (pod) => {
    const a = pod.filter((s) => s.hasDiagnostics && s.diagnosticAverage);
    return a.reduce((acc, cur) => acc + cur.diagnosticAverage, 0) / a.length;
  };

  let bestNonCali;
  let bestCali;
  let bestDiff = 100;
  const NUM_ITERATIONS = 100000;
  for (let i = 0; i < NUM_ITERATIONS; i++) {
    const nonCaliPod = pacificStudents.filter((s) => !s.isCalifornia);
    const caliPod = pacificStudents.filter((s) => s.isCalifornia);
    while (caliPod.length >= nonCaliPod.length + 1) {
      const ix = Math.floor(Math.random() * caliPod.length);
      const s = caliPod.splice(ix, 1)[0];
      nonCaliPod.push(s);
    }
    const diff = Math.abs(getPodAverage(caliPod) - getPodAverage(nonCaliPod));
    if (diff < bestDiff) {
      bestDiff = diff;
      bestNonCali = nonCaliPod;
      bestCali = caliPod;
    }
  }

  console.log('Created 2 pods with an average diagnostic score difference of', bestDiff);
  console.log('pod 1', bestCali.length);
  console.log('pod 2', bestNonCali.length);

  console.log(bestNonCali);

  for (let s of students) {
    if (bestCali.find((ts) => ts.githubHandle.toLowerCase() === s.githubHandle.toLowerCase())) {
      console.log('cali match', s.fullName);
      s['RFP Pod'] = 'Only CA';
    } else if (bestNonCali.find((ts) => ts.githubHandle.toLowerCase() === s.githubHandle.toLowerCase())) {
      console.log('non-cali match', s.fullName);
      s['RFP Pod'] = 'Includes Outside CA';
    } else {
      if (s.campus.includes('RFT Pacific')) {
        console.log('no match', s.fullName, `"${s.githubHandle}"`);
      }
      s['RFP Pod'] = '';
    }
  }

  const roster = formatStudentsForCESPRosterSheet(students, separations);
  const moduleCompletion = formatStudentsForCESPModuleCompletionSheet(activeStudents);

  console.info(`Adding ${students.length} students to CES&P roster.`);

  console.info('Retrieving CES&P sheet...');
  const doc = await loadGoogleSpreadsheet(DOC_ID_CESP);

  console.info('Updating roster worksheet...');
  await replaceWorksheet(doc.sheetsById[SHEET_ID_CESP_ROSTER], CESP_ROSTER_SHEET_HEADERS, roster);

  // console.info('Updating module completion worksheet...');
  // await replaceWorksheet(
  //   doc.sheetsById[SHEET_ID_CESP_MODULE_COMPLETION],
  //   CESP_MODULE_COMPLETION_SHEET_HEADERS,
  //   moduleCompletion,
  // );

  console.info('Done!');
})();
