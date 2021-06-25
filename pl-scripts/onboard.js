/* eslint-disable no-console */
require('dotenv').config();
const { format } = require('date-fns');
const Bottleneck = require('bottleneck');
const GGroups = require('../googleGroups');
const GMail = require('../googleMail');
const Salesforce = require('../salesforce');
const GitHub = require('../github');
const Learn = require('../learn');
const Slack = require('../slack');
const {
  COHORT_ID,
  PRECOURSE_COHORT_START_DATE,
  FULL_TIME_COURSE_START_DATE,
  PART_TIME_COURSE_START_DATE,
  DEADLINES_FULL_TIME,
  DEADLINES_PART_TIME,
  LEARN_COHORT_ID,
  GITHUB_STUDENT_TEAM,
  GITHUB_ORG_NAME,
  DOC_ID_HRPTIV,
  DOC_ID_PULSE,
  SHEET_ID_HRPTIV_ROSTER,
  SHEET_ID_HRPTIV_NAUGHTY_LIST,
  SFDC_FULL_TIME_COURSE_TYPE,
  SFDC_PART_TIME_COURSE_TYPE,
} = require('../constants');
const techMentors = require('./tech-mentors');
const loadGoogleSpreadsheet = require('./loadGoogleSpreadsheet');

// TODO: Get these hashes automatically when creating branches
const JAVASCRIPT_KOANS_HASH = '244011080f0e8b2d1ff5b927deb9345905f6e651';
const TESTBUILDER_HASH = 'ffb44f876ad0ff227569e3808bcb9be014896d86';
const UNDERBAR_HASH = '44fdd3eaefeb8d3e30f5ce1d9fdeec606715757e';
const TWIDDLER_HASH = '4197fb2da8306b135ff4e0b26af43cd3ff57313c';
const RECURSION_HASH = '442eea294c309d6754c4b15c7c0cb746936675d7';

// Week calculation for deadlines & groups
const WEEK_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
function getCurrentCohortWeek() {
  return Math.ceil((new Date() - new Date(PRECOURSE_COHORT_START_DATE)) / WEEK_DURATION_MS);
}
const currentCohortWeek = getCurrentCohortWeek();
if (currentCohortWeek < 1 || currentCohortWeek > 4) {
  console.error(`Cohort week out of range (${currentCohortWeek}), exiting`);
  process.exit(1);
}
const googleGroupFullTime = `seipw${currentCohortWeek}@galvanize.com`;
const googleGroupPartTime = `seip-rpt-w${currentCohortWeek}@galvanize.com`;
const currentDeadlineGroup = `W${currentCohortWeek}`;

const rateLimiter = new Bottleneck({
  maxConcurrent: 3,
  minTime: 333,
});
const addStudentToCohortRL = rateLimiter.wrap(Learn.addStudentToCohort);
const addStudentToGroupRL = rateLimiter.wrap(GGroups.addStudentToGroup);

const isEligibleToEnroll = (student) => student.stage === 'Deposit Paid' || student.stage === 'Accepted';
const sortStudentsByCampus = (students) => students.sort(
  (a, b) => a.campus.toLowerCase().localeCompare(b.campus.toLowerCase()),
);
const hasIntakeFormCompleted = (student) => student.funFact
  && student.selfReportedPrepartion && student.githubHandle && student.pronouns;
const isFullTime = (student) => student.campus !== 'RPT Pacific';
const isPartTime = (student) => !isFullTime(student);

const updateEnrollmentTrackingSheet = async (students, docID, sheetID) => {
  const doc = await loadGoogleSpreadsheet(docID);
  const sheet = doc.sheetsById[sheetID];
  await sheet.addRows(students);
};

const getRepoCompletionSheetRowCount = async (techMentor) => {
  const doc = await loadGoogleSpreadsheet(DOC_ID_PULSE);
  const sheetID = techMentor.repoCompletionSheetID;
  const sheet = doc.sheetsById[sheetID];
  const rows = await sheet.getRows();
  return rows.filter((row) => row.githubHandle).length;
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
  Slack.createChannelPerStudent(fullNames);
};

const addStudentsToGitHub = async (students) => {
  const gitHandles = students.map((student) => student.githubHandle);

  await GitHub.addUsersToTeam(gitHandles, GITHUB_STUDENT_TEAM);
  await GitHub.createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-javascript-koans`, JAVASCRIPT_KOANS_HASH, gitHandles);
  await GitHub.createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-testbuilder`, TESTBUILDER_HASH, gitHandles);
  await GitHub.createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-underbar`, UNDERBAR_HASH, gitHandles);
  await GitHub.createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-twiddler`, TWIDDLER_HASH, gitHandles);
  await GitHub.createBranches(GITHUB_ORG_NAME, `${COHORT_ID}-recursion`, RECURSION_HASH, gitHandles);
};

const sendEmailsToStudents = async (students) => {
  // -----------------
  // EMAILs ON-BOARDING
  // -----------------
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
    await GMail.sendEmailFromDraft(
      welcomeSubjectQuery,
      toList,
      ccList,
      bccList,
      alias,
      {},
    );
  }

  if (ccListFullTime.length > 0) {
    await GMail.sendEmailFromDraft(
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
    await GMail.sendEmailFromDraft(
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

const getEnrolledStudentSFDCContactIDs = async (docID, sheetID) => {
  const doc = await loadGoogleSpreadsheet(docID);
  const sheet = doc.sheetsById[sheetID];
  const rows = await sheet.getRows();
  return rows.map((row) => row.sfdcContactId);
};

const processStudents = (fullTimeStudents, partTimeStudents) => {
  const fullTimeStudentsForSheet = fullTimeStudents.map((student) => {
    let fullTimeCampus = student.campus;
    if (student.productCode.includes('RFT')) {
      fullTimeCampus = 'RFT Pacific';
    } else if (student.productCode.includes('RFE')) {
      fullTimeCampus = 'RFT Eastern';
    }

    return {
      campus: fullTimeCampus,
      stage: student.stage,
      fullName: student.fullName,
      email: student.email,
      secondaryEmail: student.secondaryEmail,
      dateAddedToPrecourse: '5/11/2020 - Initial Release',
      githubHandle: student.github,
      courseStartDate: student.courseStartDate,
      productCode: student.productCode,
      separationStatus: student.separationStatus,
      separationType: student.separationType,
      separationReason: student.separationReason,
      separationNotes: student.separationNotes,
      lastDayOfAttendance: student.lastDayOfAttendance,
      lastDayOfAttendanceAcronym: student.lastDayOfAttendanceAcronym,
      dateOfDetermination: student.dateOfDetermination,
      sfdcContactId: student.sfdcContactId,
      sfdcOpportunityId: student.sfdcOpportunityId,
      preferredFirstName: student.preferredFirstName,
      birthday: student.birthday,
      phoneNumber: student.phoneNumber,
      mailingAddress: student.mailingAddress,
      emergencyContactName: student.emergencyContactName,
      emergencyContactPhone: student.emergencyContactPhone,
      emergencyContactRelationship: student.emergencyContactRelationship,
      tshirtSize: student.tshirtSize,
      tshirtFit: student.tshirtFit,
      highestDegree: student.highestDegree,
      gender: student.gender,
      race: student.race,
      ethnicity: student.ethnicity,
      identifyAsLGBTQ: student.identifyAsLGBTQ,
      isUSVeteran: student.isUSVeteran ? 'Yes' : 'No',
      isDependentOfUSVeteran: student.isDependentOfUSVeteran ? 'Yes' : 'No',
      isCitizenOrPermanentResident: student.isCitizenOrPermanentResident ? 'Yes' : 'No',
      hoodieSize: student.hoodieSize,
      addressWhileInSchool: student.addressWhileInSchool,
      allergies: student.allergies,
      otherAddress: student.otherAddress,
      studentFunding1: student.studentFunding1,
      studentFunding1Stage: student.studentFunding1Stage,
      paymentOption: student.paymentOption,
      namePronunciation: student.namePronunciation,
      pronouns: student.pronouns,
      operatingSystem: student.operatingSystem,
      canCelebrateBirthday: student.canCelebrateBirthday,
      obligationsDuringCourse: student.obligationsDuringCourse,
      strengths: student.strengths,
      otherBootcampsAppliedTo: student.otherBootcampsAppliedTo,
      firstChoiceBootcamp: student.firstChoiceBootcamp,
      whyHackReactor: student.whyHackReactor,
      funFact: student.funFact,
      previousPaymentType: student.previousPaymentType,
      selfReportedPrepartion: student.selfReportedPrepartion,
      alumniStage: student.alumniStage,
      salaryPriorToProgram: student.salaryPriorToProgram,
      linkedInUsername: student.linkedInUsername,
      ageAtStart: student.ageAtStart,
      studentOnboardingFormCompletedOn: new Date(student.studentOnboardingFormCompletedOn),
    };
  });

  const partTimeStudentsForSheet = partTimeStudents.map((student) => ({
    campus: 'RPT Pacific',
    stage: student.stage,
    fullName: student.fullName,
    email: student.email,
    secondaryEmail: student.secondaryEmail,
    dateAddedToPrecourse: '5/11/2020 - Initial Release',
    githubHandle: student.github,
    courseStartDate: student.courseStartDate,
    productCode: student.productCode,
    separationStatus: student.separationStatus,
    separationType: student.separationType,
    separationReason: student.separationReason,
    separationNotes: student.separationNotes,
    lastDayOfAttendance: student.lastDayOfAttendance,
    lastDayOfAttendanceAcronym: student.lastDayOfAttendanceAcronym,
    dateOfDetermination: student.dateOfDetermination,
    sfdcContactId: student.sfdcContactId,
    sfdcOpportunityId: student.sfdcOpportunityId,
    preferredFirstName: student.preferredFirstName,
    birthday: student.birthday,
    phoneNumber: student.phoneNumber,
    mailingAddress: student.mailingAddress,
    emergencyContactName: student.emergencyContactName,
    emergencyContactPhone: student.emergencyContactPhone,
    emergencyContactRelationship: student.emergencyContactRelationship,
    tshirtSize: student.tshirtSize,
    tshirtFit: student.tshirtFit,
    highestDegree: student.highestDegree,
    gender: student.gender,
    race: student.race,
    ethnicity: student.ethnicity,
    identifyAsLGBTQ: student.identifyAsLGBTQ,
    isUSVeteran: student.isUSVeteran ? 'Yes' : 'No',
    isDependentOfUSVeteran: student.isDependentOfUSVeteran ? 'Yes' : 'No',
    isCitizenOrPermanentResident: student.isCitizenOrPermanentResident ? 'Yes' : 'No',
    hoodieSize: student.hoodieSize,
    addressWhileInSchool: student.addressWhileInSchool,
    allergies: student.allergies,
    otherAddress: student.otherAddress,
    studentFunding1: student.studentFunding1,
    studentFunding1Stage: student.studentFunding1Stage,
    paymentOption: student.paymentOption,
    namePronunciation: student.namePronunciation,
    pronouns: student.pronouns,
    operatingSystem: student.operatingSystem,
    canCelebrateBirthday: student.canCelebrateBirthday,
    obligationsDuringCourse: student.obligationsDuringCourse,
    strengths: student.strengths,
    otherBootcampsAppliedTo: student.otherBootcampsAppliedTo,
    firstChoiceBootcamp: student.firstChoiceBootcamp,
    whyHackReactor: student.whyHackReactor,
    funFact: student.funFact,
    previousPaymentType: student.previousPaymentType,
    selfReportedPrepartion: student.selfReportedPrepartion,
    alumniStage: student.alumniStage,
    salaryPriorToProgram: student.salaryPriorToProgram,
    linkedInUsername: student.linkedInUsername,
    ageAtStart: student.ageAtStart,
    studentOnboardingFormCompletedOn: new Date(student.studentOnboardingFormCompletedOn),
  }));

  return fullTimeStudentsForSheet.concat(partTimeStudentsForSheet);
};

const assignStudentsToPods = async (students) => {
  const podSizes = await Promise.all(
    techMentors.map((techMentor) => getRepoCompletionSheetRowCount(techMentor)),
  );
  const techMentorsWithPodSize = techMentors.map((techMentor, index) => ({
    ...techMentor,
    podSize: Math.ceil(podSizes[index] / (techMentor.podSizeRatio || 1)),
    repoCompletionRowsToAdd: [],
  }));

  students.forEach((student) => {
    const pod = techMentorsWithPodSize.reduce((smallestPod, currentPod) => {
      if (!smallestPod || smallestPod.podSize > currentPod.podSize) {
        return currentPod;
      }
      return smallestPod;
    });
    console.info(`Assigning ${student.fullName} to ${pod.name}'s pod`);

    pod.podSize += 1;
    pod.repoCompletionRowsToAdd.push({
      fullName: student.fullName,
      campus: student.campus,
      githubHandle: student.githubHandle,
      deadlineGroup: currentDeadlineGroup,
      dateAdded: student.dateAddedToPrecourse,
      email: student.email,
      techMentor: pod.name,
      // VBAFundingType: student.VBAFundingType,
      prepType: 'FILL_ME_IN',
      hadLaserCoaching: 'FILL_ME_IN',
      numPrecourseEnrollments: 'FILL_ME_IN',
      koansMinReqs: 'No Fork',
      javascriptKoans: 'No Fork',
      testbuilder: 'No Fork',
      underbarPartOne: 'No Fork',
      underbarPartTwo: 'No Fork',
      twiddler: 'No Fork',
      recursion: 'No Fork',
      partOneComplete: 'FILL_ME_IN',
      partTwoComplete: 'FILL_ME_IN',
      partThreeComplete: 'FILL_ME_IN',
      allComplete: 'FILL_ME_IN',
      // onTimeKoansPR: student.onTimeKoansPR,
      // onTimeTestbuilderPR: student.onTimeTestbuilderPR,
      // onTimeUnderbarOnePR: student.onTimeUnderbarOnePR,
      // onTimeTwiddlerPR: student.onTimeTwiddlerPR,
      // onTimeRecursionPR: student.onTimeRecursionPR,
      // notes: student.notes,
    });
  });

  return techMentorsWithPodSize;
};

const addStudentsToRepoCompletionSheets = async (pods) => {
  const doc = await loadGoogleSpreadsheet(DOC_ID_PULSE);
  const repoCompletionPromises = pods.map((pod) => {
    const sheet = doc.sheetsById[pod.repoCompletionSheetID];
    return sheet.addRows(pod.repoCompletionRowsToAdd);
  });
  return Promise.all(repoCompletionPromises);
};

const getNewStudents = async () => {
  const enrolledStudentContactIDs = await getEnrolledStudentSFDCContactIDs(
    DOC_ID_HRPTIV,
    SHEET_ID_HRPTIV_ROSTER,
  );
  const fullTimeStudentsSFDC = (await Salesforce
    .getStudents(FULL_TIME_COURSE_START_DATE, SFDC_FULL_TIME_COURSE_TYPE))
    .filter(isEligibleToEnroll);
  const partTimeStudentsSFDC = (await Salesforce
    .getStudents(PART_TIME_COURSE_START_DATE, SFDC_PART_TIME_COURSE_TYPE))
    .filter(isEligibleToEnroll);
  
  const processedStudents = processStudents(fullTimeStudentsSFDC, partTimeStudentsSFDC)
    .filter((student) => !enrolledStudentContactIDs.includes(student.sfdcContactId))
    .map((student) => ({
      ...student,
      dateAddedToPrecourse: format(new Date(), 'MM/dd/yyyy'),
    }));
  return sortStudentsByCampus(processedStudents);
};

(async () => {
  const newStudents = await getNewStudents();
  const eligibleNewStudents = newStudents.filter(hasIntakeFormCompleted);

  console.info(eligibleNewStudents.length, 'new students');
  console.info(newStudents.length - eligibleNewStudents.length, 'students without their intake form completed');

  if (newStudents.length - eligibleNewStudents.length > 0) {
    // TODO: Clear naughty list sheet
    console.info('Adding students to HRPTIV naughty list...');
    await updateEnrollmentTrackingSheet(
      newStudents.filter((student) => !hasIntakeFormCompleted(student)),
      DOC_ID_HRPTIV,
      SHEET_ID_HRPTIV_NAUGHTY_LIST,
    );
    // TODO: Send naughty list emails
  }
  if (eligibleNewStudents.length > 0) {
    console.info('Adding students to HRPTIV roster...');
    await updateEnrollmentTrackingSheet(
      eligibleNewStudents,
      DOC_ID_HRPTIV,
      SHEET_ID_HRPTIV_ROSTER,
    );

    const pods = await assignStudentsToPods(eligibleNewStudents);
    console.info('Adding students to Repo Completion sheets...');
    await addStudentsToRepoCompletionSheets(pods);
    console.info('Adding students to the Learn cohort...');
    await addStudentsToLearnCohort(eligibleNewStudents);
    console.info('Adding students to Google Groups...');
    await addStudentsToGoogleGroups(eligibleNewStudents);
    console.info('Creating Slack channels...');
    createStudentSlackChannels(eligibleNewStudents);
    console.info('Adding students to GitHub team and creating branches...');
    await addStudentsToGitHub(eligibleNewStudents);
    console.info('Sending welcome emails to new students...');
    await sendEmailsToStudents(eligibleNewStudents);
    console.info('Done!');
  }
})();
