require('dotenv').config();
const Bottleneck = require('bottleneck');
// const _ = require('underscore');
// const GSheets = require('./googleSheets');
// const GGroups = require('./googleGroups');
// const GMail = require('./googleMail');
// const Salesforce = require('./salesforce');
const GitHub = require('../github');
const Learn = require('../learn');

const learnRateLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 500,
});
const addStudentToCohortRL = learnRateLimiter.wrap(Learn.addStudentToCohort);
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

const CONFIG = [{
  // RFP
  teamName: 'Students: RFP2205',
  learnCampusName: 'Remote Pacific',
  learnCohortName: 'SEI-RFP2205',
  learnCohortLabel: '22-05-SEI-RFP',
  learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
  learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
  precourseCampusName: 'RFT Pacific',
  learnCohortId: '3342',
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
}, {
  teamName: 'Students: RFE2205',
  learnCampusName: 'Remote Eastern',
  learnCohortName: 'SEI-RFE2205',
  learnCohortLabel: '22-05-SEI-RFE',
  learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
  learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
  precourseCampusName: 'RFT Eastern',
  learnCohortId: '3341',
  staffGitHubHandles: [
    'DaltonHart',
    'ascherj',
    'MFiorillo',
    'SheleciaM',
    'ZabrianOglesby',
  ],
}, {
  teamName: 'Students: RFC2205',
  learnCampusName: 'Remote Central',
  learnCohortName: 'SEI-RFC2205',
  learnCohortLabel: '22-05-SEI-RFC',
  learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
  learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
  precourseCampusName: 'RFT Central',
  learnCohortId: '3339',
  staffGitHubHandles: [
    'DaltonHart',
    'ascherj',
    'MFiorillo',
    'SheleciaM',
    'ZabrianOglesby',
  ],
}, {
  teamName: 'Students: RPP2205',
  learnCampusName: 'Remote Part Time',
  learnCohortName: 'SEI-RPP2205',
  learnCohortLabel: '22-05-SEI-RPT',
  learnCohortStartDate: LEARN_COHORT_PT_START_DATE,
  learnCohortEndDate: LEARN_COHORT_PT_END_DATE,
  learnCohortIsPartTime: true,
  precourseCampusName: 'RPT Pacific',
  learnCohortId: '3343',
  staffGitHubHandles: [
    'lexjacobs',
    'isabellatea',
    'Comafke09',
    'LesliePajuelo',
    'maysieo',
    'michellelockett',
  ],
}, {
  teamName: 'Students: SEIP2207',
  learnCampusName: 'Precourse',
  learnCohortName: 'SEI - Precourse - July 2022',
  learnCohortLabel: null,
  learnCohortStartDate: LEARN_COHORT_PRECOURSE_START_DATE,
  learnCohortEndDate: LEARN_COHORT_PRECOURSE_END_DATE,
  learnCohortIsPrep: true,
  learnCohortId: '3340',
  staffGitHubHandles: [
    'danrouse',
    'colemandavid55',
    'aesuan',
    'peterianmuller',
    'stevenchung213',
    'beverlyAH',
    'N8RB8',
  ],
}];

//     'RFT Central' : 'Students-RFC2204',
//     'RFT Pacific': 'Students-RFP2204',
//     // 'RPT Pacific': 'Students-HR-RPP36',
//     'RFT Eastern': 'Students-RFE2204',
const formatGitHubTeamNameAsSlug = (teamName) => teamName.replace(/:/g, '').replace(/\s+/g, '-');

const createGitHubTeams = () => Promise.all(
  CONFIG.map((config) => GitHub.createTeam(config.teamName)),
);

const addInstructorsToGitHubTeams = async () => {
  // add to team but we need PUT body {"role": "maintainer"} and maybe a Content-Type: application/json header
};

const createLearnCohorts = () => Promise.all(
  CONFIG.map((config) => Learn.createNewCohort({
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

const addInstructorsToLearnCohorts = async () => {};

const getStudentsToOnboard = async () => {};

const addStudentsToGitHubTeams = async (students) => {
  const cohortConfigs = CONFIG.filter((config) => !config.learnCohortIsPrep);
  for (const config of cohortConfigs) {
    const campusStudents = students.filter((student) => config.precourseCampusName === student.campus);
    if (!campusStudents.length) return null;
    const campusName = formatGitHubTeamNameAsSlug(config.teamName);
    console.log('Add', campusStudents.length, 'students to team', campusName);
    console.log(campusStudents.map((student) => student.githubHandle));
    await GitHub.addUsersToTeam(campusStudents.map((student) => student.githubHandle), campusName);
  }
};

const addStudentsToLearnCohorts = async (students) => {
  const studentsWithValidCampus = students.filter((student) => CONFIG.find((config) => config.precourseCampusName === student.campus));
  for (const student of studentsWithValidCampus) {
    const campusConfig = CONFIG.find((config) => config.precourseCampusName === student.campus);
    const splitName = student.fullName.split(' ');
    const learnStudent = {
      first_name: splitName[0],
      last_name: splitName[splitName.length - 1],
      email: student.email,
    };
    console.log('Add student from Precourse', student.campus, 'to', campusConfig.learnCampusName, campusConfig.learnCohortId, JSON.stringify(learnStudent));
    await addStudentToCohortRL(campusConfig.learnCohortId, learnStudent);
  }
};


// array of objects with keys: fullName, campus, githubHandle, deadlineGroup, dateAdded, email
const students = [];

(async () => {
  // console.log('Creating GitHub teams...');
  // const gitHubTeamResult = await createGitHubTeams();
  // console.log(gitHubTeamResult);

  // TODO: Add instructors to new GitHub teams

  // console.log('Creating Learn cohorts...');
  // const learnCohortResult = await createLearnCohorts();
  // console.log(learnCohortResult);

  // TODO: Add instructors to new Learn cohorts

  // TODO: Get students who have completed Precourse
  // console.log('Adding students to GitHub teams...');
  // console.log(await addStudentsToGitHubTeams(students));
  console.log('Adding students to Learn cohorts...');
  await addStudentsToLearnCohorts(students);
})();

/*
const Bottleneck = require('bottleneck');
const _ = require('underscore');
const GSheets = require('./googleSheets');
const GGroups = require('./googleGroups');
const GMail = require('./googleMail');
const Salesforce = require('./salesforce');
const GitHub = require('./github');
const Learn = require('./learn');
const Slack = require('./slack');

const initializeSEICohort = async (
  githubTeamName,
  githubHandles,
  learnCampusName,
  learnCohortName,
  learnCohortLabel,
  learnCohortStartDate,
  learnCohortEndDate,
  learnInstructors,
  learnStudents
) => {
  const GITHUB_API_USERS = 'https://api.github.com/users';
  const GITHUB_API_TEAMS = 'https://api.github.com/orgs/hackreactor/teams';
  const GITHUB_API_REPOS = 'https://api.github.com/repos/hackreactor';

  // // Create GitHub Team
  // // TODO: Write GitHub.createTeam method
//   const a = await GitHub.createTeam('Students: RFP2204');
//   const b = await GitHub.createTeam('Students: RFC2204');
//   const c = await GitHub.createTeam('Students: RFE2204');
//  const d = await GitHub.createTeam('Students: HR-RPP36');
// await confirmation from magee
//   const e = await GitHub.createTeam('Students: SEIP2205');


//   console.log(a);
//   console.log(b);
//   console.log(c);
// console.log(d);
//   console.log(e);


  // // Add Instructors to GitHub Team
  // // TODO: Write GitHub.addMaintainersToTeam
  // GitHub.addUsersToTeam(gitHandles, GITHUB_TEAM);   TODO
  //
  //
  // Add Students to GitHub Team
//   const x = await GitHub.batchAddUserstoTeam(githubHandles, githubTeamName);
//   GitHub.batchAddUserstoTeam(gitHandles, GITHUB_TEAM);
//   console.log(x);

//   Create Learn Cohort
  const newLearnCohortStatus = await Learn.createNewCohort({
    name: learnCohortName,
    product_type: 'SEI',
    label: learnCohortLabel,
    campus_name: learnCampusName,
    starts_on: learnCohortStartDate,
    ends_on: learnCohortEndDate,
    program: 'Consumer',
    subject: 'Software Engineering',
    cohort_format: 'Full Time',
    category: 'Prep',
    // category: 'Immersive',
  });
  console.log(newLearnCohortStatus);

  // // Add Instructors to Learn Cohort
  // // TODO: Write Learn.batchAddInstructorsToCohort method
  // const batchAddInstructorsToCohort = async (cohortId, instructors) => {
  //   // Create Rate Limiter
  //   const limiter = new Bottleneck({
  //     maxConcurrent: 1,
  //     minTime: 333,
  //   });
  //
  //   // Apply Rate Limit to addInstructorToCohort method
  //   const limitedAddInstructorToCohort = limiter.wrap(Learn.addInstructorToCohort);
  //
  //   try {
  //     const promises = instructors.map(async (instructor) => {
  //       const addInstructorStatus = await limitedAddInstructorToCohort(cohortId, instructor);
  //       // if (addInstructorStatus !== 201) {
  //       //   throw new Error(`Error adding ${instructor.firstName} ${instructor.lastName}`);
  //       // }
  //       return addInstructorStatus;
  //     });
  //     const result = await Promise.all(promises);
  //     return result.every((status) => status === 201);
  //   } catch (error) {
  //     return error.message;
  //   }
  // };
  //
  // const batchAddedInstructors = await batchAddInstructorsToCohort();
  // console.log(batchAddedInstructors);

  //   // Add Students to Learn Cohort
  //   // TODO: Write Learn.batchAddStudentsToCohort method
  // const batchAddStudentsToCohort = async (cohortId, students) => {
  //   let studentStatus;
  //   students.forEach(async (student) => {
  //     studentStatus = await Learn.addStudentToCohort(cohortId, student);
  //     console.log(studentStatus);
  //   });
  // };

  // Log results with copy/paste table/JSON of links and info

  return 'Done!';
};


// initializeSEICohort(null, null, 'Precourse', 'SEI - Precourse - April 2022', null, '2022-02-22', '2022-04-11');



// first create github teams with this call:
// initializeSEICohort();


// list of current GitHub class prefixes:
// const a = await GitHub.createTeam('Students: HR-LAX49');
// const b = await GitHub.createTeam('Students: HR-RFP58');
// const c = await GitHub.createTeam('Students: HR-RPP35');
// const d = await GitHub.createTeam('Students: HR-RFE8');
// const e = await GitHub.createTeam('Students: HR-DEN17');
// const f = await GitHub.createTeam('Students: SEIP2202');


// then create Learn teams with this call ->
// initializeSEICohort(null, null, 'Remote Central', 'SEI-RFC2204', '22-04-SEI-RFC', '2022-04-11', '2022-07-18');
// initializeSEICohort(null, null, 'Remote Pacific', 'SEI-RFP2204', '22-04-SEI-RFP', '2022-04-11', '2022-07-18');
// initializeSEICohort(null, null, 'Remote Eastern', 'SEI-RFE2204', '22-04-SEI-RFE', '2022-04-11', '2022-07-18');
// initializeSEICohort(null, null, 'Remote Part Time', 'SEI - HR-RPP36 - February 2022', '22-02-SEI-RPT', '2022-02-21', '2022-11-12');





// create Precourse Learn cohort
// initializeSEICohort(null, null, 'Precourse', 'SEI - Precourse - May 2022', null, '2022-04-11', '2022-05-30');



// initializeSEICohort(null, null, 'San Jose', 'SEI - HR-SJO7 - September 2021', '21-09-SEI-SJO', '2021-09-20', '2021-12-23');
// initializeSEICohort(null, null, 'Seattle', 'SEI - HR-SEA19 - September 2021', '21-09-SEI-SEA', '2021-09-20', '2021-12-23');

  const campusNameToGitHubTeam = {
    'RFT Central' : 'Students-RFC2204',
    'RFT Pacific': 'Students-RFP2204',
    // 'RPT Pacific': 'Students-HR-RPP36',
    'RFT Eastern': 'Students-RFE2204',
  };

  const campuses = Object.keys(campusNameToGitHubTeam);
  const gitHubPromises = campuses.map((campus) => {
    if (!studentsByCampus[campus]) return;
    const gitHandles = studentsByCampus[campus].map((student) => student.githubHandle);
    const gitHubTeam = campusNameToGitHubTeam[campus];
    // console.log(gitHubTeam);
    return GitHub.addUsersToTeam(gitHandles, gitHubTeam);
  });

  const gitHubResults = await Promise.all(gitHubPromises);
  console.log(gitHubResults);
  return gitHubResults;
};

addAllStudentsToLearn(students);
*/
