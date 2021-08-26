/* eslint-disable no-console */
require('dotenv').config();
const { format } = require('date-fns');
const Bottleneck = require('bottleneck');
const { addStudentToGroup } = require('../googleGroups');
const { sendEmailFromDraft } = require('../googleMail');
const { loadGoogleSpreadsheet, replaceWorksheet } = require('../googleSheets');
const { addUsersToTeam, createBranches } = require('../github');
const { addStudentToCohort } = require('../learn');
const { createChannelPerStudent, sendMessageToChannel } = require('../slack');
const techMentors = require('../tech-mentors');
const { getNewStudentsFromSFDC, hasIntakeFormCompleted } = require('./getNewStudentsFromSFDC');

const {
  COHORT_ID,
  PRECOURSE_COHORT_START_DATE,
  DEADLINES_FULL_TIME,
  DEADLINES_PART_TIME,
  LEARN_COHORT_ID,
  GITHUB_STUDENT_TEAM,
  GITHUB_ORG_NAME,
  DOC_ID_HRPTIV,
  DOC_ID_PULSE,
  SHEET_ID_HRPTIV_ROSTER,
  SHEET_ID_HRPTIV_NAUGHTY_LIST,
} = require('../constants');

const NAUGHTY_LIST_HEADERS = [
  'fullName',
  'campus',
  'githubHandle',
  'dateAddedToPrecourse',
  'deadlineGroup\n(Keep Blank)',
  'email',
  'courseStartDate',
  'productCode',
  'stage',
  'separationStatus',
  'separationType',
  'sfdcContactId',
  'sfdcOpportunityId',
  'secondaryEmail',
  'preferredFirstName',
  'birthday',
  'phoneNumber',
  'mailingAddress',
  'emergencyContactName',
  'emergencyContactPhone',
  'emergencyContactRelationship',
  'tshirtSize',
  'tshirtFit',
  'highestDegree',
  'gender',
  'race',
  'ethnicity',
  'identifyAsLGBTQ',
  'isUSVeteran',
  'isDependentOfUSVeteran',
  'isCitizenOrPermanentResident',
  'hoodieSize',
  'addressWhileInSchool',
  'allergies',
  'otherAddress',
  'studentFunding1',
  'studentFunding1Stage',
  'paymentOption',
  'namePronunciation',
  'pronouns',
  'operatingSystem',
  'canCelebrateBirthday',
  'obligationsDuringCourse',
  'strengths',
  'otherBootcampsAppliedTo',
  'firstChoiceBootcamp',
  'whyHackReactor',
  'funFact',
  'previousPaymentType',
  'selfReportedPrepartion',
  'alumniStage',
  'salaryPriorToProgram',
  'linkedInUsername',
  'ageAtStart',
  'studentOnboardingFormCompletedOn',
];

// Week calculation for deadlines & groups
const WEEK_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const currentDate = new Date();
function getCurrentCohortWeek() {
  return Math.ceil((currentDate - new Date(PRECOURSE_COHORT_START_DATE)) / WEEK_DURATION_MS);
}
const currentCohortWeek = getCurrentCohortWeek();
if (
  currentCohortWeek < 1 || // no onboarding in W0
  currentCohortWeek > 4 || // or after W4
  // or after 5PM PT on Friday of W4 (5PM PT = midnight/1AM UTC next day)
  (currentCohortWeek === 4 && currentDate.getUTCDay() > 5 && currentDate.getUTCHours() > 0)
) {
  console.error(`Cohort week out of range (${currentCohortWeek}), exiting`);
  process.exit(0);
}

const googleGroupFullTime = `seipw${currentCohortWeek}@galvanize.com`;
const googleGroupPartTime = currentCohortWeek <= 2
  ? `seip-rpt-w${currentCohortWeek}@galvanize.com`
  : `seip.rptw${currentCohortWeek}@galvanize.com`;
const currentDeadlineGroup = `W${currentCohortWeek}`;

const rateLimiter = new Bottleneck({
  maxConcurrent: 3,
  minTime: 333,
});
const addStudentToCohortRL = rateLimiter.wrap(addStudentToCohort);
const addStudentToGroupRL = rateLimiter.wrap(addStudentToGroup);

const isFullTime = (student) => student.campus !== 'RPT Pacific';
const isPartTime = (student) => !isFullTime(student);

const formatStudentForRepoCompletion = (student, techMentor, rowIndex) => ({
  fullName: student.fullName,
  campus: student.campus,
  githubHandle: student.githubHandle,
  deadlineGroup: currentDeadlineGroup,
  dateAdded: student.dateAddedToPrecourse,
  email: student.email,
  techMentor,
  // VBAFundingType: student.VBAFundingType,
  // TODO: Maybe handle setting these to the proper formulas?
  prepType: `=VLOOKUP(A${rowIndex},HRPTIV!A:BC,50,false)`, // student.selfReportedPrepartion,
  // NB: for this column to work on each new cohort,
  // the iferror in the formula has to be unwrapped to allow access
  hadLaserCoaching: `=IF(EQ(IFERROR(vlookup(A${rowIndex},` +
                    `IMPORTRANGE("https://docs.google.com/spreadsheets/d/1v3ve2aYtO6MsG6Zjp-SBX-ote6JdWVvuYekHUst2wWw","Laser Coached Students Enrolled!A2:A"),1,false),` +
                    `"No"), A${rowIndex}), "Yes", "No")`,
  numPrecourseEnrollments: `=MAX(COUNTIF('Precourse Enrollments Archive'!B:B,A${rowIndex}),` +
                           `COUNTIF('Precourse Enrollments Archive'!D:D,C${rowIndex}),` +
                           `COUNTIF('Precourse Enrollments Archive'!G:G,F${rowIndex})) + 1`,
  koansMinReqs: 'No Fork',
  javascriptKoans: 'No Fork',
  testbuilder: 'No Fork',
  underbarPartOne: 'No Fork',
  underbarPartTwo: 'No Fork',
  twiddler: 'No Fork',
  recursion: 'No Fork',
  partOneComplete: `=IF(AND(L${rowIndex}="Yes", M${rowIndex}>=26, N${rowIndex}>=3323, N${rowIndex}<=3329, O${rowIndex}=61), "Yes", "No")`,
  partTwoComplete: `=IF(AND(P${rowIndex}=64, Q${rowIndex}>=3.5, ISNUMBER(Q${rowIndex})), "Yes", "No")`,
  partThreeComplete: `=IF(AND(R${rowIndex}>=2, ISNUMBER(R${rowIndex})),"Yes", "No")`,
  allComplete: `=IF(AND(S${rowIndex}="Yes",T${rowIndex}="Yes",U${rowIndex}="Yes"),"Yes","No")`,
  // onTimeKoansPR: student.onTimeKoansPR,
  // onTimeTestbuilderPR: student.onTimeTestbuilderPR,
  // onTimeUnderbarOnePR: student.onTimeUnderbarOnePR,
  onTimeTwiddlerPR: 'No Fork',
  // onTimeRecursionPR: student.onTimeRecursionPR,
  // notes: student.notes,
});

const weightedPodSize = (pod) => Math.ceil(pod.podSize / (pod.podSizeRatio || 1));

const assignStudentsToPods = async (pulseDoc, students) => {
  const podSizes = await Promise.all(
    techMentors.map(async (techMentor) => {
      const rows = await pulseDoc.sheetsById[techMentor.repoCompletionSheetID].getRows();
      return rows.filter((row) => row.githubHandle).length;
    }),
  );
  const techMentorsWithPodSize = techMentors.map((techMentor, index) => ({
    ...techMentor,
    podSize: podSizes[index],
    repoCompletionRowsToAdd: [],
  }));

  students.forEach((student) => {
    const pod = techMentorsWithPodSize.reduce((smallestPod, currentPod) => {
      if (!smallestPod || weightedPodSize(smallestPod) > weightedPodSize(currentPod)) {
        return currentPod;
      }
      return smallestPod;
    });
    console.info(`Assigning ${student.fullName} to ${pod.name}'s pod`);

    pod.podSize += 1;
    pod.repoCompletionRowsToAdd.push(formatStudentForRepoCompletion(student, pod.name, pod.podSize + 1));
  });

  return techMentorsWithPodSize;
};

const addStudentsToRepoCompletionSheets = async (pulseDoc, pods) => {
  const repoCompletionPromises = pods
    .filter((pod) => pod.repoCompletionRowsToAdd.length > 0)
    .map((pod) => {
      const sheet = pulseDoc.sheetsById[pod.repoCompletionSheetID];
      return sheet.addRows(pod.repoCompletionRowsToAdd);
    });
  return Promise.all(repoCompletionPromises);
};

const addStudentsToLearnCohort = (students) => Promise.all(
  students.map((student) => {
    const splitName = student.fullName.split(' ');
    const learnStudent = {
      first_name: splitName[0],
      last_name: splitName[splitName.length - 1],
      email: student.email,
    };
    return addStudentToCohortRL(LEARN_COHORT_ID, learnStudent);
  }),
);

const addStudentsToGoogleGroups = (students) => Promise.all([
  ...students.filter(isFullTime)
    .map((student) => addStudentToGroupRL(googleGroupFullTime, student.email)),
  ...students.filter(isPartTime)
    .map((student) => addStudentToGroupRL(googleGroupPartTime, student.email)),
]);

const createStudentSlackChannels = (students) => {
  const fullNames = students.map((student) => student.fullName);
  return createChannelPerStudent(fullNames);
};

const addStudentsToGitHub = async (students) => {
  const gitHandles = students.map((student) => student.githubHandle);

  await addUsersToTeam(gitHandles, GITHUB_STUDENT_TEAM);
  await createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-javascript-koans`, gitHandles);
  await createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-testbuilder`, gitHandles);
  await createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-underbar`, gitHandles);
  await createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-twiddler`, gitHandles);
  await createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-recursion`, gitHandles);
};

const sendEmailsToStudents = async (students) => {
  const PROGRAM_EMAIL = 'sei.precourse@galvanize.com';
  const PROGRAM_NAME = 'SEI Precourse';
  const alias = { name: PROGRAM_NAME, email: PROGRAM_EMAIL };
  const welcomeSubjectQuery = '[Action Required] Welcome to Precourse! Please Read Thoroughly 🎉';
  const deadlinesSubjectQuery = currentCohortWeek !== 4
    ? '[Review Required] Precourse Deadlines - When your work is due 🎯'
    : '[Review Required] Accelerated Pace Precourse Deadlines - When your work is due 🎯';
  const toList = [PROGRAM_EMAIL];
  const ccList = students.map((student) => student.email);
  const bccList = [];
  const ccListFullTime = students.filter(isFullTime).map((student) => student.email);
  const ccListPartTime = students.filter(isPartTime).map((student) => student.email);

  if (ccList.length > 0) {
    await sendEmailFromDraft(
      welcomeSubjectQuery,
      toList,
      ccList,
      bccList,
      alias,
      {
        cohortId: COHORT_ID,
      },
    );
  }

  if (ccListFullTime.length > 0) {
    await sendEmailFromDraft(
      deadlinesSubjectQuery,
      toList,
      ccListFullTime,
      bccList,
      alias,
      {
        milestoneOne: DEADLINES_FULL_TIME[currentDeadlineGroup][0],
        milestoneTwo: DEADLINES_FULL_TIME[currentDeadlineGroup][1],
        milestoneThree: DEADLINES_FULL_TIME[currentDeadlineGroup][2],
        deadlineOne: DEADLINES_FULL_TIME.Final[0],
        deadlineTwo: DEADLINES_FULL_TIME.Final[1],
        deadlineThree: DEADLINES_FULL_TIME.Final[2],
      },
    );
  }

  if (ccListPartTime.length > 0) {
    await sendEmailFromDraft(
      deadlinesSubjectQuery,
      toList,
      ccListPartTime,
      bccList,
      alias,
      {
        milestoneOne: DEADLINES_PART_TIME[currentDeadlineGroup][0],
        milestoneTwo: DEADLINES_PART_TIME[currentDeadlineGroup][1],
        milestoneThree: DEADLINES_PART_TIME[currentDeadlineGroup][2],
        deadlineOne: DEADLINES_PART_TIME.Final[0],
        deadlineTwo: DEADLINES_PART_TIME.Final[1],
        deadlineThree: DEADLINES_PART_TIME.Final[2],
      },
    );
  }
};

const sendInternalSlackMessage = async (newStudents, naughtyListStudents, pods) => {
  let slackMessage = `🎉 ${newStudents.length} new student${newStudents.length !== 1 ? 's' : ''} added! 🎉\n`;
  slackMessage += pods
    .filter((pod) => pod.repoCompletionRowsToAdd.length > 0)
    .map((pod) => pod.repoCompletionRowsToAdd.map(
      (student) => `· ${student.fullName} → ${pod.name}`,
    ).join('\n')).join('\n');
  if (slackMessage !== '') {
    await sendMessageToChannel('new-students', slackMessage);
  }
};

const formatSFDCStudentForRoster = (student) => {
  let { campus } = student;
  if (student.productCode.includes('RFT')) campus = 'RFT Pacific';
  if (student.productCode.includes('RFE')) campus = 'RFT Eastern';
  if (student.productCode.includes('RPT')) campus = 'RPT Pacific';
  return {
    ...student,
    campus,
    dateAddedToPrecourse: format(new Date(), 'MM/dd/yyyy'),
    secondaryEmail: student.emailSecondary,
    githubHandle: student.github,
    isUSVeteran: student.isUSVeteran ? 'Yes' : 'No',
    isDependentOfUSVeteran: student.isDependentOfUSVeteran ? 'Yes' : 'No',
    isCitizenOrPermanentResident: student.isCitizenOrPermanentResident ? 'Yes' : 'No',
    studentOnboardingFormCompletedOn: new Date(student.studentOnboardingFormCompletedOn),
  };
};

(async () => {
  const newStudents = (await getNewStudentsFromSFDC())
    .map(formatSFDCStudentForRoster)
    .sort((a, b) => a.campus.toLowerCase().localeCompare(b.campus.toLowerCase()));
  const eligibleNewStudents = newStudents.filter(hasIntakeFormCompleted);
  const naughtyListStudents = newStudents.filter((student) => !hasIntakeFormCompleted(student));

  console.info(eligibleNewStudents.length, 'new students');
  console.info(naughtyListStudents.length, 'students without their intake form completed');

  // Always update naughty list, ensuring old records are all cleared
  console.info('Updating HRPTIV naughty list...');
  const sheetHRPTIV = await loadGoogleSpreadsheet(DOC_ID_HRPTIV);
  await replaceWorksheet(
    sheetHRPTIV.sheetsById[SHEET_ID_HRPTIV_NAUGHTY_LIST],
    NAUGHTY_LIST_HEADERS,
    naughtyListStudents,
  );

  if (eligibleNewStudents.length > 0) {
    console.info('Adding students to HRPTIV roster...');
    await sheetHRPTIV.sheetsById[SHEET_ID_HRPTIV_ROSTER].addRows(eligibleNewStudents);
    const sheetPulse = await loadGoogleSpreadsheet(DOC_ID_PULSE);
    const pods = await assignStudentsToPods(sheetPulse, eligibleNewStudents);
    console.info('Adding students to Repo Completion sheets...');
    await addStudentsToRepoCompletionSheets(sheetPulse, pods);
    console.info('Adding students to the Learn cohort...');
    await addStudentsToLearnCohort(eligibleNewStudents);
    console.info('Adding students to Google Groups...');
    await addStudentsToGoogleGroups(eligibleNewStudents);
    console.info('Creating Slack channels...');
    await createStudentSlackChannels(eligibleNewStudents);
    console.info('Adding students to GitHub team and creating branches...');
    await addStudentsToGitHub(eligibleNewStudents);
    console.info('Sending welcome emails to new students...');
    await sendEmailsToStudents(eligibleNewStudents);
    console.info('Reporting to Slack...');
    await sendInternalSlackMessage(eligibleNewStudents, naughtyListStudents, pods);
  }

  console.info('Done!');
})();
