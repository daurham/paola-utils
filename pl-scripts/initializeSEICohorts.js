require('dotenv').config();
// const Bottleneck = require('bottleneck');
// const _ = require('underscore');
// const GSheets = require('./googleSheets');
// const GGroups = require('./googleGroups');
// const GMail = require('./googleMail');
// const Salesforce = require('./salesforce');
const GitHub = require('../github');
const Learn = require('../learn');
// const Slack = require('./slack');

/*
- Create GitHub teams for Immersive Cohorts and for Next Precourse
- Add instructors to new GitHub teams
- Create Learn cohorts for Immersive Cohorts and for Next Precourse
- Add instructors to new Learn cohorts
- Get students who have completed Precourse
- Add students to GitHub teams and Learn cohorts


Remaining TODOs:
  - Confirm github team names
  - Confirm learn cohort names

2204: W1 / W7 (4/11/2022 - 7/8/2022)
  '22-04-SEI-RFC', '2022-04-11', '2022-07-18'
    start date is same, end date is the start date of the NEXT cohort
  'SEI - HR-RPP36 - February 2022', '22-02-SEI-RPT', '2022-02-21', '2022-11-12'
    dates are AS LISTED
  'SEI - Precourse - April 2022', null, '2022-02-22', '2022-04-11'
*/

// initializeSEICohort(null, null, 'Precourse', 'SEI - Precourse - April 2022', null, '2022-02-22', '2022-04-11');
// initializeSEICohort(null, null, 'Remote Central', 'SEI-RFC2204', '22-04-SEI-RFC', '2022-04-11', '2022-07-18');
// initializeSEICohort(null, null, 'Remote Pacific', 'SEI-RFP2204', '22-04-SEI-RFP', '2022-04-11', '2022-07-18');
// initializeSEICohort(null, null, 'Remote Eastern', 'SEI-RFE2204', '22-04-SEI-RFE', '2022-04-11', '2022-07-18');
// initializeSEICohort(null, null, 'Remote Part Time', 'SEI - HR-RPP36 - February 2022', '22-02-SEI-RPT', '2022-02-21', '2022-11-12');

const LEARN_COHORT_FT_START_DATE = '2022-05-31';
const LEARN_COHORT_FT_END_DATE = '2022-09-05';
const LEARN_COHORT_PT_START_DATE = '2022-06-01';
const LEARN_COHORT_PT_END_DATE = '2023-02-25';
const LEARN_COHORT_PRECOURSE_START_DATE = '2022-05-31';
const LEARN_COHORT_PRECOURSE_END_DATE = '2022-07-18';

const CONFIG = {
  RFP: {
    teamName: 'Students: RFP2205',
    learnCampusName: 'Remote Pacific',
    learnCohortName: 'SEI-RFP2205',
    learnCohortLabel: '22-05-SEI-RFP',
    learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
    learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
    staffGitHubHandles: [
      'annahinnyc',
      'destinywalker1',
      'eric-do',
      'hilaryupton13',
      'mason-jp',
      'jyuen',
      'Katie-Papke',
      'mylanidemas1',
      'yu-linkong1',
    ],
  },
  RFE: {
    teamName: 'Students: RFE2205',
    learnCampusName: 'Remote Eastern',
    learnCohortName: 'SEI-RFE2205',
    learnCohortLabel: '22-05-SEI-RFE',
    learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
    learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
    staffGitHubHandles: [
      'DaltonHart',
      'ascherj',
      'MFiorillo',
      'SheleciaM',
      'ZabrianOglesby',
    ],
  },
  RFC: {
    teamName: 'Students: RFC2205',
    learnCampusName: 'Remote Central',
    learnCohortName: 'SEI-RFC2205',
    learnCohortLabel: '22-05-SEI-RFC',
    learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
    learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
    staffGitHubHandles: [
      'DaltonHart',
      'ascherj',
      'MFiorillo',
      'SheleciaM',
      'ZabrianOglesby',
    ],
  },
  RPP: {
    teamName: 'Students: RPP2205',
    learnCampusName: 'Remote Part Time',
    learnCohortName: 'SEI-RPP2205',
    learnCohortLabel: '22-05-SEI-RPT',
    learnCohortStartDate: LEARN_COHORT_PT_START_DATE,
    learnCohortEndDate: LEARN_COHORT_PT_END_DATE,
    learnCohortIsPartTime: true,
    staffGitHubHandles: [
      'lexjacobs',
      'isabellatea',
      'Comafke09',
      'LesliePajuelo',
      'maysieo',
      'michellelockett',
    ],
  },
  SEIP: {
    teamName: 'Students: SEIP2207',
    learnCampusName: 'Precourse',
    learnCohortName: 'SEI - Precourse - July 2022',
    learnCohortLabel: null,
    learnCohortStartDate: LEARN_COHORT_PRECOURSE_START_DATE,
    learnCohortEndDate: LEARN_COHORT_PRECOURSE_END_DATE,
    learnCohortIsPrep: true,
    staffGitHubHandles: [
      'danrouse',
      'colemandavid55',
      'aesuan',
      'peterianmuller',
      'stevenchung213',
      'beverlyAH',
      'N8RB8',
    ],
  },
};

const campusNameToLearnCohortID = {
  'RFT Pacific': '3231',
  'RFT Eastern': '3229',
  'RFT Central': '3230',
  'RPT Pacific': '3232',
};

const createGitHubTeams = () => Promise.all(
  Object.values(CONFIG).map((config) => GitHub.createTeam(config.teamName)),
);

const addInstructorsToGitHubTeams = async () => {
  // add to team but we need PUT body {"role": "maintainer"} and maybe a Content-Type: application/json header
};

const createLearnCohorts = () => Promise.all(
  Object.values(CONFIG).map((config) => Learn.createNewCohort({
    name: config.learnCohortName,
    product_type: 'SEI',
    label: config.learnCohortLabel,
    campus_name: config.learnCampusName,
    starts_on: config.learnCohortStartDate,
    ends_on: config.learnCohortEndDate,
    program: 'Consumer',
    subject: 'Software Engineering',
    cohort_format: config.learnCohortIsPartTime ? 'Part Time' : 'Full Time',
    category: config.learnCohortIsPrep ? 'Prep' : 'Immersive',
  })),
);

const addInstructorsToLearnCohorts = async () => {
  //   // -----------------
  //   // LEARN ON-BOARDING
  //   // -----------------
  // //   const { addStudentToCohort } = Learn;

  // //   const learnLimiter = new Bottleneck({
  // //     maxConcurrent: 2,
  // //     minTime: 500,
  // //   });
  // //   const learnWrapped = learnLimiter.wrap(addStudentToCohort);

  // //   let learnCohortID;
  // //   // const learnPromises = studentsByCampus.map((student) => {

  // //   const learnPromises = students.filter(student => campusNameToLearnCohortID[student.campus]).map((student) => {
  // //     const splitName = student.fullName.split(' ');
  // //     const learnStudent = {
  // //       first_name: splitName[0],
  // //       last_name: splitName[splitName.length - 1],
  // //       email: student.email,
  // //     };

  // //     learnCohortID = campusNameToLearnCohortID[student.campus];
  // //     // console.log(student.FullName, student.Campus, learnCohortID);s
  // //     return learnWrapped(learnCohortID, learnStudent);
  // //   });


  // //   const learnResults = await Promise.all(learnPromises);
  // //   console.log(learnResults);
  // };
};

const getStudentsToOnboard = async () => {};

const addStudentsToGitHubTeams = async (students) => {
  //   const campusNameToGitHubTeam = {
  //     'RFT Central' : 'Students-RFC2204',
  //     'RFT Pacific': 'Students-RFP2204',
  //     // 'RPT Pacific': 'Students-HR-RPP36',
  //     'RFT Eastern': 'Students-RFE2204',
  //   };

  //   const campuses = Object.keys(campusNameToGitHubTeam);
  //   const gitHubPromises = campuses.map((campus) => {
  //     if (!studentsByCampus[campus]) return;
  //     const gitHandles = studentsByCampus[campus].map((student) => student.githubHandle);
  //     const gitHubTeam = campusNameToGitHubTeam[campus];
  //     // console.log(gitHubTeam);
  //     return GitHub.addUsersToTeam(gitHandles, gitHubTeam);
  //   });

  //   const gitHubResults = await Promise.all(gitHubPromises);
  //   console.log(gitHubResults);
  //   return gitHubResults;
};

//   const studentsByCampus = _.groupBy(students.filter(student => campusNameToLearnCohortID[student.campus]), (student) => student.campus);
//   console.log(studentsByCampus);



// // Learn: For Listing In Slack!
// // RFC2202: https://learn-2.galvanize.com/cohorts/3230/users
// // RFP2202: https://learn-2.galvanize.com/cohorts/3231/users
// // RFE2202: https://learn-2.galvanize.com/cohorts/3229/users
// // HR-RPP36: https://learn-2.galvanize.com/cohorts/3232/users

// // // GitHub: For Listing In Slack!
// // RFC2202: https://github.com/orgs/hackreactor/teams/students-RFC2202/members
// // RFP2202: https://github.com/orgs/hackreactor/teams/students-RFP2202/members
// // RFE2202: https://github.com/orgs/hackreactor/teams/students-RFE2202/members
// // HR-RPP36: https://github.com/orgs/hackreactor/teams/students-HR-RPP36/members


// const addStudentsToLearnCohorts = async () => {
//   //   // Add Students to Learn Cohort
//   //   // TODO: Write Learn.batchAddStudentsToCohort method
//   // const batchAddStudentsToCohort = async (cohortId, students) => {
//   //   let studentStatus;
//   //   students.forEach(async (student) => {
//   //     studentStatus = await Learn.addStudentToCohort(cohortId, student);
//   //     console.log(studentStatus);
//   //   });
//   // };

//   const campusNameToLearnCohortID = {
//     'RFT Central' : '3309',
//     'RFT Pacific': '3311',
//     // 'RPT Pacific': '3232',
//     'RFT Eastern': '3310',
//   };


(async () => {
  console.log('Creating GitHub teams...');
  const gitHubTeamResult = await createGitHubTeams();
  console.log(gitHubTeamResult);

  // TODO: Add instructors to new GitHub teams

  console.log('Creating Learn cohorts...');
  const learnCohortResult = await createLearnCohorts();
  console.log(learnCohortResult);

  // TODO: Add instructors to new Learn cohorts

  // TODO: Get students who have completed Precourse
  // TODO: Add students to GitHub teams and Learn cohorts
})();
