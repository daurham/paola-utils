const { getStudents } = require('../salesforce');
const { loadGoogleSpreadsheet } = require('../googleSheets');
const {
  FULL_TIME_COURSE_START_DATE,
  PART_TIME_COURSE_START_DATE,
  DOC_ID_HRPTIV,
  SHEET_ID_HRPTIV_ROSTER,
  SFDC_FULL_TIME_COURSE_TYPE,
  SFDC_PART_TIME_COURSE_TYPE,
} = require('../constants');

const getEnrolledStudentSFDCContactIDs = async (docID, sheetID) => {
  const doc = await loadGoogleSpreadsheet(docID);
  const sheet = doc.sheetsById[sheetID];
  const rows = await sheet.getRows();
  return rows.map((row) => row.sfdcContactId);
};

const getStudentsFromSFDC = async () => []
  .concat(
    await getStudents(FULL_TIME_COURSE_START_DATE, SFDC_FULL_TIME_COURSE_TYPE),
    await getStudents(PART_TIME_COURSE_START_DATE, SFDC_PART_TIME_COURSE_TYPE),
  )
  .filter((student) => student.stage === 'Deposit Paid' || student.stage === 'Accepted');

const getNewStudentsFromSFDC = async () => {
  const students = await getStudentsFromSFDC();
  console.log('STEEEVE1: ', students);
  const enrolledStudentContactIDs = await getEnrolledStudentSFDCContactIDs(
    DOC_ID_HRPTIV,
    SHEET_ID_HRPTIV_ROSTER,
  );
  console.log('STEEEVE2: ', enrolledStudentContactIDs);
  console.log('STEEEEVE3: ', students.filter((student) => enrolledStudentContactIDs.includes(student.sfdcContactId)));
  return students.filter((student) =>
    !enrolledStudentContactIDs.includes(student.sfdcContactId));
};

const hasIntakeFormCompleted = (student) => student.funFact
  && student.selfReportedPrepartion && student.githubHandle && student.pronouns;

module.exports = {
  getStudentsFromSFDC,
  getNewStudentsFromSFDC,
  hasIntakeFormCompleted,
};
