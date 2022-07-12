/* eslint-disable no-restricted-syntax, no-await-in-loop */
require('dotenv').config();
const Bottleneck = require('bottleneck');
const GitHub = require('../github');
const Learn = require('../learn');
const { loadGoogleSpreadsheet, getRows } = require('../googleSheets');
const { DOC_ID_CESP, SHEET_ID_CESP_ROSTER } = require('../constants');

const DO_IT_LIVE = false;

const LEARN_COHORT_FT_START_DATE = '2022-07-18'; // direct from product cal
const LEARN_COHORT_FT_END_DATE = '2022-10-24'; // start date of round after NEXT
const LEARN_COHORT_PT_START_DATE = '2022-07-19'; // direct from product cal
const LEARN_COHORT_PT_END_DATE = '2023-04-15'; // direct from product cal
const LEARN_COHORT_PRECOURSE_START_DATE = '2022-07-18'; // direct from product cal
const LEARN_COHORT_PRECOURSE_END_DATE = '2022-09-05'; // start date of next round

const CONFIG = [{
  teamName: 'Students: RFP2207',
  learnCampusName: 'Remote Pacific',
  learnCohortName: 'SEI-RFP2207',
  learnCohortLabel: '22-07-SEI-RFP',
  learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
  learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
  precourseCampusName: 'RFT Pacific',
  staff: [{
    firstName: 'Yu-Lin', lastName: 'Kong', email: 'yulin.kong@galvanize.com', github: 'yu-linkong1',
  }, {
    firstName: 'Annah', lastName: 'Patterson', email: 'annah.patterson@galvanize.com', github: 'annahinnyc',
  }, {
    firstName: 'Destiny', lastName: 'Walker', email: 'destiny.walker@galvanize.com', github: 'destinywalker1',
  }, {
    firstName: 'Eric', lastName: 'Do', email: 'eric.do@galvanize.com', github: 'eric-do',
  }, {
    firstName: 'Hilary', lastName: 'Upton', email: 'hilary.upton@galvanize.com', github: 'hilaryupton13',
  }, {
    firstName: 'Itzel', lastName: 'Cortes', email: 'itzel.cortes@galvanize.com',
  }, {
    firstName: 'Jess', lastName: 'Mason', email: 'jess.mason@galvanize.com', github: 'mason-jp',
  }, {
    firstName: 'Julian', lastName: 'Yuen', email: 'julian.yuen@galvanize.com', github: 'jyuen',
  }, {
    firstName: 'Katie', lastName: 'Papke', email: 'katie.papke@galvanize.com', github: 'Katie-Papke',
  }, {
    firstName: 'Mylani', lastName: 'Demas', email: 'mylani.demas@galvanize.com', github: 'mylanidemas1',
  }, {
    firstName: 'Natalie', lastName: 'Massarany', email: 'natalie.massarany@galvanize.com',
  }],
}, {
  teamName: 'Students: RFE2207',
  learnCampusName: 'Remote Eastern',
  learnCohortName: 'SEI-RFE2207',
  learnCohortLabel: '22-07-SEI-RFE',
  learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
  learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
  precourseCampusName: 'RFT Eastern',
  staff: [{
    firstName: 'Zabrian', lastName: 'Oglesby', email: 'zabrian.oglesby@galvanize.com', github: 'ZabrianOglesby',
  }, {
    firstName: 'Jolisha', lastName: 'Young', email: 'jolisha.young@galvanize.com',
  }, {
    firstName: 'Jake', lastName: 'Ascher', email: 'jake.ascher@galvanize.com', github: 'ascherj',
  }, {
    firstName: 'Shelecia', lastName: 'McKinney', email: 'shelecia.mckinney@galvanize.com', github: 'SheleciaM',
  }, {
    firstName: 'Sunnie', lastName: 'Frazier', email: 'francine.frazier@galvanize.com',
  }, {
    firstName: 'Tanya', lastName: 'Farirayi', email: 'tanya.farirayi@galvanize.com',
  }, {
    firstName: 'Tosi', lastName: 'Awofeso', email: 'tosin.awofeso@galvanize.com',
  }],
}, {
  teamName: 'Students: RFC2207',
  learnCampusName: 'Remote Central',
  learnCohortName: 'SEI-RFC2207',
  learnCohortLabel: '22-07-SEI-RFC',
  learnCohortStartDate: LEARN_COHORT_FT_START_DATE,
  learnCohortEndDate: LEARN_COHORT_FT_END_DATE,
  precourseCampusName: 'RFT Central',
  staff: [{
    firstName: 'Zabrian', lastName: 'Oglesby', email: 'zabrian.oglesby@galvanize.com', github: 'ZabrianOglesby',
  }, {
    firstName: 'Jolisha', lastName: 'Young', email: 'jolisha.young@galvanize.com',
  }, {
    firstName: 'Jake', lastName: 'Ascher', email: 'jake.ascher@galvanize.com', github: 'ascherj',
  }, {
    firstName: 'Shelecia', lastName: 'McKinney', email: 'shelecia.mckinney@galvanize.com', github: 'SheleciaM',
  }, {
    firstName: 'Sunnie', lastName: 'Frazier', email: 'francine.frazier@galvanize.com',
  }, {
    firstName: 'Tanya', lastName: 'Farirayi', email: 'tanya.farirayi@galvanize.com',
  }, {
    firstName: 'Tosi', lastName: 'Awofeso', email: 'tosin.awofeso@galvanize.com',
  }],
}, {
  teamName: 'Students: RPP2207',
  learnCampusName: 'Remote Part Time',
  learnCohortName: 'SEI-RPP2207',
  learnCohortLabel: '22-07-SEI-RPT',
  learnCohortStartDate: LEARN_COHORT_PT_START_DATE,
  learnCohortEndDate: LEARN_COHORT_PT_END_DATE,
  learnCohortIsPartTime: true,
  precourseCampusName: 'RPT Pacific',
  staff: [{
    firstName: 'Jeffrey', lastName: 'Cho', email: 'jeffrey.cho@galvanize.com',
  }, {
    firstName: 'Alex', lastName: 'Jacobs', email: 'alex.jacobs@galvanize.com', github: 'lexjacobs',
  }, {
    firstName: 'Bella', lastName: 'Tea', email: 'bella.tea@galvanize.com', github: 'isabellatea',
  }, {
    firstName: 'Courtney', lastName: 'Walker', email: 'courtney.walker@galvanize.com', github: 'Comafke09',
  }, {
    firstName: 'Leslie', lastName: 'Pajuelo', email: 'leslie.pajuelo@galvanize.com', github: 'LesliePajuelo',
  }, {
    firstName: 'Maysie', lastName: 'Ocera', email: 'maysie.ocera@galvanize.com', github: 'maysieo',
  }, {
    firstName: 'Michelle', lastName: 'Lockett', email: 'michelle.lockett@galvanize.com', github: 'michellelockett',
  }, {
    firstName: 'Stephanie', lastName: 'Reissner', email: 'stephanie.reissner@galvanize.com',
  }],
}, {
  teamName: 'Students: SEIP2209',
  learnCampusName: 'Precourse',
  learnCohortName: 'SEI - Precourse - September 2022',
  learnCohortLabel: null,
  learnCohortStartDate: LEARN_COHORT_PRECOURSE_START_DATE,
  learnCohortEndDate: LEARN_COHORT_PRECOURSE_END_DATE,
  learnCohortIsPrep: true,
  staff: [{
    firstName: 'Peter', lastName: 'Muller', email: 'peter.muller@galvanize.com', github: 'peterianmuller',
  }, {
    firstName: 'Beverly', lastName: 'Hernandez', email: 'beverly.hernandez@galvanize.com', github: 'beverlyAH',
  }, {
    firstName: 'Daniel', lastName: 'Rouse', email: 'daniel.rouse@galvanize.com', github: 'danrouse',
  }, {
    firstName: 'David', lastName: 'Coleman', email: 'david.coleman@galvanize.com', github: 'colemandavid55',
  }, {
    firstName: 'Eliza', lastName: 'Drinker', email: 'eliza.drinker@galvanize.com', github: 'aesuan',
  }, {
    firstName: 'Steven', lastName: 'Chung', email: 'steven.chung@galvanize.com', github: 'stevenchung213',
  }],
}];

// map of learnCohortName to UID
// populated when cohorts are created
// if doing a late-run, or student population, set these manually!
// the UIDs of newly-created cohorts are logged at creation-time
const cohortIds = {
  'SEI-RFP2207': 'c7d5ccfdbfb4ffe7ca',
  'SEI-RFC2207': '6ddd43fe810c6439be',
  'SEI-RFE2207': 'e101fbcd54a669f9ab',
  'SEI-RPP2207': '18509cdf743efabec7',
  'SEI - Precourse - September 2022': '583bcb1d7c32f96979',
};

// END OF CONFIGURATION

const learnRateLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 500,
});
const addStudentToCohortRL = learnRateLimiter.wrap(Learn.addStudentToCohort);

const formatGitHubTeamNameAsSlug = (teamName) => teamName.replace(/:/g, '').replace(/\s+/g, '-');

const createGitHubTeams = () => Promise.all(
  CONFIG.map((config) => {
    console.log('Create GitHub team', config.teamName);
    if (DO_IT_LIVE) {
      return GitHub.createTeam(config.teamName);
    }
  }),
);

const addInstructorsToGitHubTeams = () => Promise.all(
  CONFIG.map((config) => {
    const usernames = config.staff.filter((s) => s.github).map((s) => s.github);
    console.log(`Adding staff to GitHub Team ${formatGitHubTeamNameAsSlug(config.teamName)}: ${usernames}...`);
    if (DO_IT_LIVE) {
      return GitHub.addUsersToTeam(usernames, formatGitHubTeamNameAsSlug(config.teamName), true);
    }
  }),
);

const createLearnCohorts = () => Promise.all(
  CONFIG.map(async (config) => {
    const cohort = {
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
    };
    console.log('Create Learn cohort', cohort);
    if (DO_IT_LIVE) {
      const cohortId = await Learn.createNewCohort(cohort);
      cohortIds[config.learnCohortName] = cohortId;
      console.log(`Created Learn cohort ${config.learnCohortName} with UID ${cohortId}`);
    }
  }),
);

const addInstructorsToLearnCohorts = () => Promise.all(
  CONFIG.map(async (config) => {
    const learnCohortId = cohortIds[config.learnCohortName];
    if (!learnCohortId) {
      console.info(`No cohort ID found for cohort "${config.learnCohortName}", skipping...`);
      return;
    }
    for (const { firstName, lastName, email } of config.staff) {
      const staff = {
        first_name: firstName,
        last_name: lastName,
        email,
        instructor: true,
      };
      console.log('Create staff', config.learnCohortName, learnCohortId, staff);
      if (DO_IT_LIVE) {
        await addStudentToCohortRL(learnCohortId, staff);
      }
    }
  }),
);

const getStudentsToOnboard = async () => {
  const cespSheet = await loadGoogleSpreadsheet(DOC_ID_CESP);
  const students = await getRows(cespSheet.sheetsById[SHEET_ID_CESP_ROSTER]);
  const eligibleStudents = students.filter((student) => student['Precourse Complete'] === 'Yes');
  console.log('eligible students', eligibleStudents.length, 'of', students.length);
  return eligibleStudents.map((student) => ({
    fullName: student['Full Name'],
    campus: student['Campus'],
    githubHandle: student['GitHub'],
    email: student['SFDC Email'],
  }));
};

const addStudentsToGitHubTeams = async (students) => {
  const cohortConfigs = CONFIG.filter((config) => !config.learnCohortIsPrep);
  for (const config of cohortConfigs) {
    const campusStudents = students.filter((student) => config.precourseCampusName === student.campus);
    if (!campusStudents.length) {
      console.log(`Cannot find matching CES&P campus for config campus named "${config.precourseCampusName}", skipping!`);
      return null;
    }
    const campusName = formatGitHubTeamNameAsSlug(config.teamName);
    console.log('Add', campusStudents.length, 'students to team', campusName);
    console.log(campusStudents.map((student) => student.githubHandle));
    if (DO_IT_LIVE) {
      await GitHub.addUsersToTeam(campusStudents.map((student) => student.githubHandle), campusName);
    }
  }
};

const addStudentsToLearnCohorts = async (students) => {
  const studentsWithValidCampus = students.filter((student) => CONFIG.find((config) => config.precourseCampusName === student.campus));
  for (const student of studentsWithValidCampus) {
    const campusConfig = CONFIG.find((config) => config.precourseCampusName === student.campus);
    if (!campusConfig) {
      console.log(`Cannot find matching config campus for student "${student.fullName}" with CES&P campus "${student.campus}", skipping!`);
      return null;
    }
    const learnCohortId = cohortIds[campusConfig.learnCohortName];
    const splitName = student.fullName.split(' ');
    const learnStudent = {
      first_name: splitName[0],
      last_name: splitName[splitName.length - 1],
      email: student.email,
    };
    console.log('Add student from Precourse', student.campus, 'to', campusConfig.learnCampusName, learnCohortId, JSON.stringify(learnStudent));
    if (DO_IT_LIVE) {
      await addStudentToCohortRL(learnCohortId, learnStudent);
    }
  }
};

const initializeNewCohorts = async () => {
  console.log('Creating GitHub teams...');
  const gitHubTeamResult = await createGitHubTeams();
  console.log(gitHubTeamResult);

  console.log('Creating Learn cohorts...');
  const learnCohortResult = await createLearnCohorts();
  console.log(learnCohortResult);
};

const populateNewCohortsWithStaff = async () => {
  console.log('Adding instructors to GitHub teams...');
  const addInstructorsToGitHubResult = await addInstructorsToGitHubTeams();
  console.log(addInstructorsToGitHubResult);

  console.log('Adding instructors to Learn cohorts...');
  const addInstructorsToLearnResult = await addInstructorsToLearnCohorts();
  console.log(addInstructorsToLearnResult);
};

const populateNewCohortsWithStudents = async () => {
  console.log('Getting students from roster...');
  const students = await getStudentsToOnboard();
  console.log(`Got ${students.length} students!`);

  console.log('Adding students to GitHub teams...');
  const addStudentsToGitHubResult = await addStudentsToGitHubTeams(students);
  console.log(addStudentsToGitHubResult);

  console.log('Adding students to Learn cohorts...');
  const addStudentsToLearnResult = await addStudentsToLearnCohorts(students);
  console.log(addStudentsToLearnResult);
};

(async () => {
  // await initializeNewCohorts();
  // await populateNewCohortsWithStaff();
  await populateNewCohortsWithStudents();
})();
