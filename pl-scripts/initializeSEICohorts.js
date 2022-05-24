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

const addStudentsToGitHubTeams = async (students) => Promise.all(
  CONFIG.filter((config) => !config.learnCohortIsPrep).map((config) => {
    const campusStudents = students.filter((student) => config.precourseCampusName === student.campus);
    if (!campusStudents.length) return null;
    const campusName = formatGitHubTeamNameAsSlug(config.teamName);
    console.log('Add', campusStudents.length, 'students to team', campusName);
    console.log(campusStudents.map((student) => student.githubHandle));
    // return GitHub.addUsersToTeam(campusStudents.map((student) => student.githubHandle, campusName));
  }),
);

const addStudentsToLearnCohorts = async (students) => {
  const studentsWithValidCampus = students.filter((student) => CONFIG.find((config) => config.precourseCampusName === student.campus));
  return Promise.all(studentsWithValidCampus.map((student) => {
    const campusConfig = CONFIG.find((config) => config.precourseCampusName === student.campus);
    const splitName = student.fullName.split(' ');
    const learnStudent = {
      first_name: splitName[0],
      last_name: splitName[splitName.length - 1],
      email: student.email,
    };
    console.log('Add student from Precourse', student.campus, 'to', campusConfig.learnCampusName, campusConfig.learnCohortId, JSON.stringify(learnStudent));
    // return addStudentToCohortRL(campusConfig.learnCohortId, learnStudent);
  }));
};



const students = [
  {
      "fullName": "Binh Nguyen",
      "campus": "RFT Central",
      "githubHandle": "kbinhnguyen",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "kbinhnguyen.nihongo@gmail.com"
  },
  {
      "fullName": "Dylan Hollier",
      "campus": "RFT Central",
      "githubHandle": "Dylanph21",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "dylanphollier@gmail.com"
  },
  {
      "fullName": "Hsuan Wen Huang",
      "campus": "RFT Central",
      "githubHandle": "sharonhw888",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "sharonhw888@gmail.com"
  },
  {
      "fullName": "Jean Kim",
      "campus": "RFT Central",
      "githubHandle": "jeankayy",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "jeankim119@gmail.com"
  },
  {
      "fullName": "Jeffrey Jackson",
      "campus": "RFT Central",
      "githubHandle": "jeffmjack",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "jeffmjack@gmail.com"
  },
  {
      "fullName": "Kai Sheng",
      "campus": "RFT Central",
      "githubHandle": "maestrokyles",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "ksheng@utexas.edu"
  },
  {
      "fullName": "Lawrence Sanzogni",
      "campus": "RFT Central",
      "githubHandle": "Lawsan92",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "lawrencesanzogni@gmail.com"
  },
  {
      "fullName": "May Liang",
      "campus": "RFT Central",
      "githubHandle": "mayliang021",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "mayliang021@gmail.com"
  },
  {
      "fullName": "NICHOLAS KEMPKES",
      "campus": "RFT Central",
      "githubHandle": "kemp3673",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "nicholas.kempkes@gmail.com"
  },
  {
      "fullName": "Sam Irvin",
      "campus": "RFT Central",
      "githubHandle": "sbirvin1s",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "sbirvin1s@gmail.com"
  },
  {
      "fullName": "Stuart Hosman",
      "campus": "RFT Central",
      "githubHandle": "Rhosmans",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "rhosmans@gmail.com"
  },
  {
      "fullName": "Travis Redden",
      "campus": "RFT Central",
      "githubHandle": "Symphon-y",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "t.rav08@gmail.com"
  },
  {
      "fullName": "Zachary Smith",
      "campus": "RFT Central",
      "githubHandle": "Zach-Smith1",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "zachsmithglobal@icloud.com"
  },
  {
      "fullName": "Andrew Wallace",
      "campus": "RFT Central",
      "githubHandle": "andronicus217",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-12T22:00:00.000Z",
      "email": "amw.infospecialist@gmail.com"
  },
  {
      "fullName": "Fahad Syed",
      "campus": "RFT Central",
      "githubHandle": "syed216",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-17T22:00:00.000Z",
      "email": "syed.216@gmail.com"
  },
  {
      "fullName": "Xiaqing Xu",
      "campus": "RFT Central",
      "githubHandle": "xuxiaqing2011",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-21T22:00:00.000Z",
      "email": "xuxiaqing2019@gmail.com"
  },
  {
      "fullName": "David Kroll",
      "campus": "RFT Central",
      "githubHandle": "dkroll713",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-24T22:00:00.000Z",
      "email": "dkroll713@gmail.com"
  },
  {
      "fullName": "Wenxin Gu",
      "campus": "RFT Central",
      "githubHandle": "wguab",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-25T22:00:00.000Z",
      "email": "wguab@uchicago.edu"
  },
  {
      "fullName": "Yari Torres Nicola",
      "campus": "RFT Central",
      "githubHandle": "yaritorres",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-26T22:00:00.000Z",
      "email": "ybtorres9@gmail.com"
  },
  {
      "fullName": "Shirley Nguyen",
      "campus": "RFT Central",
      "githubHandle": "shnguyen8",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-27T22:00:00.000Z",
      "email": "shirley.nguyen8@outlook.com"
  },
  {
      "fullName": "Viren Patel",
      "campus": "RFT Central",
      "githubHandle": "vpatel89",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-27T22:00:00.000Z",
      "email": "virenpatel89@gmail.com"
  },
  {
      "fullName": "David Fan",
      "campus": "RFT Central",
      "githubHandle": "tinyfishbigpond",
      "deadlineGroup": "W4",
      "dateAdded": "2022-05-01T22:00:00.000Z",
      "email": "davidlfan@gmail.com"
  },
  {
      "fullName": "Monica Cupp",
      "campus": "RFT Central",
      "githubHandle": "MonicaCupp",
      "deadlineGroup": "W4",
      "dateAdded": "2022-05-03T22:00:00.000Z",
      "email": "monicaycupp@gmail.com"
  },
  {
      "fullName": "Albert Huynh",
      "campus": "RFT Eastern",
      "githubHandle": "albertthuynh94",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "albertthuynh94@gmail.com"
  },
  {
      "fullName": "Brandon Hester",
      "campus": "RFT Eastern",
      "githubHandle": "nckitesurf",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "brandonrhester@gmail.com"
  },
  {
      "fullName": "ChenYou Huang",
      "campus": "RFT Eastern",
      "githubHandle": "chenyou-H",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "chenyouhuang@gmail.com"
  },
  {
      "fullName": "Cheyenne Cornett",
      "campus": "RFT Eastern",
      "githubHandle": "Cheyennecornett",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "cheyenne.cornett22@gmail.com"
  },
  {
      "fullName": "Jared Shedrofsky",
      "campus": "RFT Eastern",
      "githubHandle": "jaredshedr",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "jaredsurfside@gmail.com"
  },
  {
      "fullName": "Juan Jose Pinol",
      "campus": "RFT Eastern",
      "githubHandle": "JuanOfMany",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "juannncodes@gmail.com"
  },
  {
      "fullName": "Khai Le",
      "campus": "RFT Eastern",
      "githubHandle": "WhisperingTrees",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "khaischools@gmail.com"
  },
  {
      "fullName": "Maria Hirai",
      "campus": "RFT Eastern",
      "githubHandle": "maria6417",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "mh6417a@gmail.com"
  },
  {
      "fullName": "Max McKenna",
      "campus": "RFT Eastern",
      "githubHandle": "mmckenna34",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "mckennamax34@gmail.com"
  },
  {
      "fullName": "Patrick Post",
      "campus": "RFT Eastern",
      "githubHandle": "ppost0",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "p.post2321@yahoo.com"
  },
  {
      "fullName": "Sam Bartlett",
      "campus": "RFT Eastern",
      "githubHandle": "samkbe",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "samkbe@gmail.com"
  },
  {
      "fullName": "Sheng Hao Dong",
      "campus": "RFT Eastern",
      "githubHandle": "MochaUUZ",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "shengdong2000@gmail.com"
  },
  {
      "fullName": "Syna Laureano",
      "campus": "RFT Eastern",
      "githubHandle": "slaureano001",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "slaureano001@gmail.com"
  },
  {
      "fullName": "Taylor Thornton",
      "campus": "RFT Eastern",
      "githubHandle": "taylorthornton",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "taylorthornton.texas@gmail.com"
  },
  {
      "fullName": "Yan Chen",
      "campus": "RFT Eastern",
      "githubHandle": "Yan6789",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "yanchen0628@gmail.com"
  },
  {
      "fullName": "YangLiang Lu",
      "campus": "RFT Eastern",
      "githubHandle": "yanglianglu",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-10T22:00:00.000Z",
      "email": "9172576883qwer@gmail.com"
  },
  {
      "fullName": "Adam Kincer",
      "campus": "RFT Eastern",
      "githubHandle": "adamjk16",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-13T22:00:00.000Z",
      "email": "adamjk0106@gmail.com"
  },
  {
      "fullName": "Ian Zuber",
      "campus": "RFT Eastern",
      "githubHandle": "ianzuber221",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-14T22:00:00.000Z",
      "email": "ianzuber221@gmail.com"
  },
  {
      "fullName": "Qiuhan Xiong",
      "campus": "RFT Eastern",
      "githubHandle": "WennyXiong",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-14T22:00:00.000Z",
      "email": "wenny.xiong@hotmail.com"
  },
  {
      "fullName": "Lu Zhang",
      "campus": "RFT Eastern",
      "githubHandle": "llz08",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-16T22:00:00.000Z",
      "email": "zhanglu0804@gmail.com"
  },
  {
      "fullName": "Andrew Arsenault",
      "campus": "RFT Eastern",
      "githubHandle": "vamman311",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-17T22:00:00.000Z",
      "email": "drew.311.a@gmail.com"
  },
  {
      "fullName": "Brian Vose",
      "campus": "RFT Eastern",
      "githubHandle": "Banzubie",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-17T22:00:00.000Z",
      "email": "brvose@gmail.com"
  },
  {
      "fullName": "Ju Hyun Suh",
      "campus": "RFT Eastern",
      "githubHandle": "galopyz",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-17T22:00:00.000Z",
      "email": "shipalnomoo@gmail.com"
  },
  {
      "fullName": "Michael Schoenecker",
      "campus": "RFT Eastern",
      "githubHandle": "noginger13",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-17T22:00:00.000Z",
      "email": "michael.schoenecker@gmail.com"
  },
  {
      "fullName": "Patrick O'Shea",
      "campus": "RFT Eastern",
      "githubHandle": "PatMan817",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-17T22:00:00.000Z",
      "email": "osheap81796@gmail.com"
  },
  {
      "fullName": "Christopher Lathen",
      "campus": "RFT Eastern",
      "githubHandle": "clathen",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-18T22:00:00.000Z",
      "email": "clathen@gmail.com"
  },
  {
      "fullName": "Xinyuan Zheng",
      "campus": "RFT Eastern",
      "githubHandle": "xinyuanzheng001",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-18T22:00:00.000Z",
      "email": "xinyuanzheng4@gmail.com"
  },
  {
      "fullName": "Anthony Cella",
      "campus": "RFT Eastern",
      "githubHandle": "cello-frodo",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-19T22:00:00.000Z",
      "email": "anthony.cella242@gmail.com"
  },
  {
      "fullName": "Joseph Han",
      "campus": "RFT Eastern",
      "githubHandle": "hanjoseph",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-19T22:00:00.000Z",
      "email": "josephkhhan@gmail.com"
  },
  {
      "fullName": "Elizabeth Bivens-Tatum",
      "campus": "RFT Eastern",
      "githubHandle": "ebivenstatum",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-20T22:00:00.000Z",
      "email": "ebivenstatum@gmail.com"
  },
  {
      "fullName": "Ivan Moreno",
      "campus": "RFT Eastern",
      "githubHandle": "imore85",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-20T22:00:00.000Z",
      "email": "ivandmoreno1985@gmail.com"
  },
  {
      "fullName": "Anthony McGovern",
      "campus": "RFT Eastern",
      "githubHandle": "code402b",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-21T22:00:00.000Z",
      "email": "mcgovern.anthony@gmail.com"
  },
  {
      "fullName": "John Economou",
      "campus": "RFT Eastern",
      "githubHandle": "juranamou",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-21T22:00:00.000Z",
      "email": "johnlafayeti@gmail.com"
  },
  {
      "fullName": "Jason Vallery",
      "campus": "RFT Eastern",
      "githubHandle": "creatorjv",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-24T22:00:00.000Z",
      "email": "valleryje@live.com"
  },
  {
      "fullName": "Karrissa Volcy",
      "campus": "RFT Eastern",
      "githubHandle": "KARSE22",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-24T22:00:00.000Z",
      "email": "v.karrissa1@gmail.com"
  },
  {
      "fullName": "Manuel Rosadilla Cornu",
      "campus": "RFT Eastern",
      "githubHandle": "mrosadilla23",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-13T22:00:00.000Z",
      "email": "manurosadilla@gmail.com"
  },
  {
      "fullName": "ali omidfar",
      "campus": "RFT Pacific",
      "githubHandle": "aomidfar",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "ali.omidfar.862@my.csun.edu"
  },
  {
      "fullName": "Andrew Schwaderer",
      "campus": "RFT Pacific",
      "githubHandle": "BlandSchwad",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "schwaderer@protonmail.com"
  },
  {
      "fullName": "Brandon Hsu",
      "campus": "RFT Pacific",
      "githubHandle": "akblal",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "brandon.j.hsu@gmail.com"
  },
  {
      "fullName": "Caleb Otto",
      "campus": "RFT Pacific",
      "githubHandle": "ottocj01",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "caleb.otto.01@gmail.com"
  },
  {
      "fullName": "Camden Smith",
      "campus": "RFT Pacific",
      "githubHandle": "camdensmithh",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "camdensmithh@yahoo.com"
  },
  {
      "fullName": "Caroline Peake",
      "campus": "RFT Pacific",
      "githubHandle": "carolinepeake",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "peake.caroline@gmail.com"
  },
  {
      "fullName": "Clarissa Lopez",
      "campus": "RFT Pacific",
      "githubHandle": "lopezclarissa2021",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "lopezclarissa2021@gmail.com"
  },
  {
      "fullName": "Coty Ray Janeway",
      "campus": "RFT Pacific",
      "githubHandle": "CotyJ",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "coty.janeway@gmail.com"
  },
  {
      "fullName": "Daniel Qoborsi",
      "campus": "RFT Pacific",
      "githubHandle": "dqoborsi",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "dqoborsi@gmail.com"
  },
  {
      "fullName": "David Arredondo",
      "campus": "RFT Pacific",
      "githubHandle": "dondo5252",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "dcarredondo90@gmail.com"
  },
  {
      "fullName": "Gian Franco Lazaro",
      "campus": "RFT Pacific",
      "githubHandle": "gianlazaro",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "gianlazaro7411@gmail.com"
  },
  {
      "fullName": "Harold Starratt",
      "campus": "RFT Pacific",
      "githubHandle": "Draw1Play1",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "hal.s.starr@gmail.com"
  },
  {
      "fullName": "Hee mo Yang",
      "campus": "RFT Pacific",
      "githubHandle": "heemo521",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "heemo521@gmail.com"
  },
  {
      "fullName": "Herrison Zhao",
      "campus": "RFT Pacific",
      "githubHandle": "harrisonzhao97",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "harrisonzhao97@gmail.com"
  },
  {
      "fullName": "Ibraheem Azam",
      "campus": "RFT Pacific",
      "githubHandle": "ibraheemazam",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "ibraheemazam@gmail.com"
  },
  {
      "fullName": "Jerome Maynard Rodriguez",
      "campus": "RFT Pacific",
      "githubHandle": "JeromeMTR",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "jeromemtrodriguez@gmail.com"
  },
  {
      "fullName": "Jesse Fu",
      "campus": "RFT Pacific",
      "githubHandle": "Jesse132",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "jesse.fuu@gmail.com"
  },
  {
      "fullName": "Jonathan Oh",
      "campus": "RFT Pacific",
      "githubHandle": "ohjonoh-git",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "jonoh832@gmail.com"
  },
  {
      "fullName": "Kent Harrison Taylor",
      "campus": "RFT Pacific",
      "githubHandle": "kentskorner",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "kent.taylor.cal@gmail.com"
  },
  {
      "fullName": "Marshall Zmuda",
      "campus": "RFT Pacific",
      "githubHandle": "MarZmu",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "marshall.z@outlook.com"
  },
  {
      "fullName": "Matthew Gilliam",
      "campus": "RFT Pacific",
      "githubHandle": "Dalphus",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "moofus2000@gmail.com"
  },
  {
      "fullName": "Pan Liu",
      "campus": "RFT Pacific",
      "githubHandle": "pan-liu-us",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "us.panliu@gmail.com"
  },
  {
      "fullName": "Patrick Steven Wilson",
      "campus": "RFT Pacific",
      "githubHandle": "corsoNova",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "steven26wilson@gmail.com"
  },
  {
      "fullName": "Peter McBride",
      "campus": "RFT Pacific",
      "githubHandle": "GitPeteM",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "mrpetermcbride@gmail.com"
  },
  {
      "fullName": "River Xiang",
      "campus": "RFT Pacific",
      "githubHandle": "rxlbas",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "rachaelsunnn@gmail.com"
  },
  {
      "fullName": "Shanshan Xia",
      "campus": "RFT Pacific",
      "githubHandle": "xiaxia330",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "511219774@qq.com"
  },
  {
      "fullName": "Siope Tongi",
      "campus": "RFT Pacific",
      "githubHandle": "noattongi",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "noattongi@gmail.com"
  },
  {
      "fullName": "Stephen Rinkov",
      "campus": "RFT Pacific",
      "githubHandle": "drumgarage",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "drumgarage@gmail.com"
  },
  {
      "fullName": "teddy an",
      "campus": "RFT Pacific",
      "githubHandle": "an410mu",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "an410mu@gmail.com"
  },
  {
      "fullName": "Theresa Tran",
      "campus": "RFT Pacific",
      "githubHandle": "txtrax",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "theresa.tran216@gmail.com"
  },
  {
      "fullName": "Toan Dao",
      "campus": "RFT Pacific",
      "githubHandle": "toanddao",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "toanddao@gmail.com"
  },
  {
      "fullName": "Xiaofeng Zhou",
      "campus": "RFT Pacific",
      "githubHandle": "poioper",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "xfzhou1990@gmail.com"
  },
  {
      "fullName": "Yuxiu Zhang",
      "campus": "RFT Pacific",
      "githubHandle": "JadeZYX",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "yxzhang1009@gmail.com"
  },
  {
      "fullName": "Clayton Chin",
      "campus": "RFT Pacific",
      "githubHandle": "mrdooby",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-13T22:00:00.000Z",
      "email": "chinclayton98@gmail.com"
  },
  {
      "fullName": "Isabelle Smith",
      "campus": "RFT Pacific",
      "githubHandle": "izzigrace",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-13T22:00:00.000Z",
      "email": "izzigrace6@gmail.com"
  },
  {
      "fullName": "Jennifer Lin",
      "campus": "RFT Pacific",
      "githubHandle": "JennyMipha",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-13T22:00:00.000Z",
      "email": "fossil0529@gmail.com"
  },
  {
      "fullName": "Mark Miw",
      "campus": "RFT Pacific",
      "githubHandle": "markmiw",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-13T22:00:00.000Z",
      "email": "markmiw6@gmail.com"
  },
  {
      "fullName": "Cornelius Constantin Renken",
      "campus": "RFT Pacific",
      "githubHandle": "corneliusrenken",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-14T22:00:00.000Z",
      "email": "cornelius.renken@gmail.com"
  },
  {
      "fullName": "Daniel Chu",
      "campus": "RFT Pacific",
      "githubHandle": "crypto-bender",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-17T22:00:00.000Z",
      "email": "dac3mf@virginia.edu"
  },
  {
      "fullName": "Corbin Jarett-Dunbar",
      "campus": "RFT Pacific",
      "githubHandle": "Corbin",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-18T22:00:00.000Z",
      "email": "corbindunbar2008@gmail.com"
  },
  {
      "fullName": "Jasper Bucad",
      "campus": "RFT Pacific",
      "githubHandle": "justjjasper",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-18T22:00:00.000Z",
      "email": "jasjasper101@gmail.com"
  },
  {
      "fullName": "Jessica Chen",
      "campus": "RFT Pacific",
      "githubHandle": "codingavatar",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-19T22:00:00.000Z",
      "email": "jessicachen012@gmail.com"
  },
  {
      "fullName": "Louisa Yonzon",
      "campus": "RFT Pacific",
      "githubHandle": "Louisaflor",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-19T22:00:00.000Z",
      "email": "yonzonlouisa25@icloud.com"
  },
  {
      "fullName": "Nicholas Johnson",
      "campus": "RFT Pacific",
      "githubHandle": "ntjohns10",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-19T22:00:00.000Z",
      "email": "ntjohns10@gmail.com"
  },
  {
      "fullName": "Andy Chow",
      "campus": "RFT Pacific",
      "githubHandle": "andychow94",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-20T22:00:00.000Z",
      "email": "andychow94@gmail.com"
  },
  {
      "fullName": "Christopher Choi",
      "campus": "RFT Pacific",
      "githubHandle": "chrisxchoi",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-21T22:00:00.000Z",
      "email": "chris@choi.is"
  },
  {
      "fullName": "Sara Shan",
      "campus": "RFT Pacific",
      "githubHandle": "SaraYunShan",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-21T22:00:00.000Z",
      "email": "offersarashan@gmail.com"
  },
  {
      "fullName": "Frederick Pascua",
      "campus": "RFT Pacific",
      "githubHandle": "mclul",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-23T22:00:00.000Z",
      "email": "rickpascua@rocketmail.com"
  },
  {
      "fullName": "Peter Phan",
      "campus": "RFT Pacific",
      "githubHandle": "peterhphan",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-23T22:00:00.000Z",
      "email": "pphan0703@gmail.com"
  },
  {
      "fullName": "Royce Chun",
      "campus": "RFT Pacific",
      "githubHandle": "rochun",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-23T22:00:00.000Z",
      "email": "royce.h.chun@gmail.com"
  },
  {
      "fullName": "Tsering Kesang Dingtsa",
      "campus": "RFT Pacific",
      "githubHandle": "kesang20",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-23T22:00:00.000Z",
      "email": "kesangdingtsa@gmail.com"
  },
  {
      "fullName": "Aaron Pan",
      "campus": "RFT Pacific",
      "githubHandle": "Panlord",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-24T22:00:00.000Z",
      "email": "adpan.dev@gmail.com"
  },
  {
      "fullName": "Jason Chiou",
      "campus": "RFT Pacific",
      "githubHandle": "jasonchiou",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-24T22:00:00.000Z",
      "email": "jaschiou@gmail.com"
  },
  {
      "fullName": "Mahmmod Muhamad",
      "campus": "RFT Pacific",
      "githubHandle": "mmuhamad1",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-24T22:00:00.000Z",
      "email": "muhamadmahmmod@gmail.com"
  },
  {
      "fullName": "Bruce Diesel Rabago",
      "campus": "RFT Pacific",
      "githubHandle": "BungaloBuce",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-25T22:00:00.000Z",
      "email": "dieselrabago@gmail.com"
  },
  {
      "fullName": "Jian Quan Liu",
      "campus": "RFT Pacific",
      "githubHandle": "carsonliu1",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-25T22:00:00.000Z",
      "email": "liucarson@yahoo.com"
  },
  {
      "fullName": "Shannon Murphy",
      "campus": "RFT Pacific",
      "githubHandle": "Murphy1693",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-25T22:00:00.000Z",
      "email": "murphy1693@gmail.com"
  },
  {
      "fullName": "Gary Mak",
      "campus": "RFT Pacific",
      "githubHandle": "xgmak94",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-28T22:00:00.000Z",
      "email": "xgmak94@gmail.com"
  },
  {
      "fullName": "Jean Lam",
      "campus": "RFT Pacific",
      "githubHandle": "jeanlamw",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-28T22:00:00.000Z",
      "email": "jeanlamw@gmail.com"
  },
  {
      "fullName": "Johnny Mok",
      "campus": "RFT Pacific",
      "githubHandle": "jmok19927",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-29T22:00:00.000Z",
      "email": "hipposarepro@gmail.com"
  },
  {
      "fullName": "Kevin Ha",
      "campus": "RFT Pacific",
      "githubHandle": "kevhaha",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "kevincw.ha@gmail.com"
  },
  {
      "fullName": "Wei Cui",
      "campus": "RFT Pacific",
      "githubHandle": "cwsp0069",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "cwsp0069@gmail.com"
  },
  {
      "fullName": "Aman Arabi",
      "campus": "RPT Pacific",
      "githubHandle": "amanarabi",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "amanarabi@gmail.com"
  },
  {
      "fullName": "Blake Crawford",
      "campus": "RPT Pacific",
      "githubHandle": "wulfmatik",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "blake.crawford@outlook.com"
  },
  {
      "fullName": "Brandon Bissing",
      "campus": "RPT Pacific",
      "githubHandle": "bbissing",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "bbissing101@gmail.com"
  },
  {
      "fullName": "Cameron Hirsh",
      "campus": "RPT Pacific",
      "githubHandle": "camjhirsh",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "camjhirsh@gmail.com"
  },
  {
      "fullName": "Chelsea Pae",
      "campus": "RPT Pacific",
      "githubHandle": "chelseapae",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "chelseapae@gmail.com"
  },
  {
      "fullName": "Chengze Song",
      "campus": "RPT Pacific",
      "githubHandle": "puhpx",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "sccflzz@gmail.com"
  },
  {
      "fullName": "Connor Thurston",
      "campus": "RPT Pacific",
      "githubHandle": "VoidWizid",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "connor.thurston1@gmail.com"
  },
  {
      "fullName": "Do Hun Kim",
      "campus": "RPT Pacific",
      "githubHandle": "dkim1017",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "dkim1017@gmail.com"
  },
  {
      "fullName": "Huan Tran",
      "campus": "RPT Pacific",
      "githubHandle": "huantran123",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "huanductran98@gmail.com"
  },
  {
      "fullName": "Kyle Dick",
      "campus": "RPT Pacific",
      "githubHandle": "KDD87",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "kyle.dick0811@gmail.com"
  },
  {
      "fullName": "Matthew Dailey",
      "campus": "RPT Pacific",
      "githubHandle": "mattdailey173",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "mattdailey173@gmail.com"
  },
  {
      "fullName": "Qin Gao",
      "campus": "RPT Pacific",
      "githubHandle": "AnnaG2221",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "qingao2221@hotmail.com"
  },
  {
      "fullName": "Sijia Tao",
      "campus": "RPT Pacific",
      "githubHandle": "taoshika127",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "taoshika127@gmail.com"
  },
  {
      "fullName": "Stacey Pereira",
      "campus": "RPT Pacific",
      "githubHandle": "staceypereira1",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "staceypereira1@gmail.com"
  },
  {
      "fullName": "Steven Moody",
      "campus": "RPT Pacific",
      "githubHandle": "sjmoody",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "smoody07@gmail.com"
  },
  {
      "fullName": "Vivienne Weilacker",
      "campus": "RPT Pacific",
      "githubHandle": "viviennema",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "vivienne@socalrealestatehub.com"
  },
  {
      "fullName": "Xin Ding",
      "campus": "RPT Pacific",
      "githubHandle": "daisydingdx",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "xd222@cornell.edu"
  },
  {
      "fullName": "Yuchen Pan",
      "campus": "RPT Pacific",
      "githubHandle": "pyc0422",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "pyc0422@gmail.com"
  },
  {
      "fullName": "Yunsup Jung",
      "campus": "RPT Pacific",
      "githubHandle": "yunsupj",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "yunsup.j@gmail.com"
  },
  {
      "fullName": "Nicholas Cassano",
      "campus": "RPT Pacific",
      "githubHandle": "romanlaughs",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-13T22:00:00.000Z",
      "email": "romanlaughs@gmail.com"
  },
  {
      "fullName": "Sheeva Nina Haghighat",
      "campus": "RPT Pacific",
      "githubHandle": "h-sheeva",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-14T22:00:00.000Z",
      "email": "h.sheeva@gmail.com"
  },
  {
      "fullName": "xuandong huang",
      "campus": "RPT Pacific",
      "githubHandle": "hxdr",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-16T22:00:00.000Z",
      "email": "raymondhuang2015@gmail.com"
  },
  {
      "fullName": "Donald Alexander",
      "campus": "RPT Pacific",
      "githubHandle": "malexander6",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-18T22:00:00.000Z",
      "email": "dmalexander6@gmail.com"
  },
  {
      "fullName": "Ken Kurita",
      "campus": "RPT Pacific",
      "githubHandle": "KenKurita",
      "deadlineGroup": "W2",
      "dateAdded": "2022-04-18T22:00:00.000Z",
      "email": "kenkurita95@gmail.com"
  },
  {
      "fullName": "Heather Ray",
      "campus": "RPT Pacific",
      "githubHandle": "bubsinthemountains",
      "deadlineGroup": "W3",
      "dateAdded": "2022-04-28T22:00:00.000Z",
      "email": "hf.ray01@gmail.com"
  },
  {
      "fullName": "Matthew McIvor",
      "campus": "RPT Pacific",
      "githubHandle": "matthewrmcivor",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "matthewrmcivor@gmail.com"
  },
  {
      "fullName": "Thanh Ly",
      "campus": "RPT Pacific",
      "githubHandle": "thanhgly",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "thanh.g.ly@outlook.com"
  },
  {
      "fullName": "Yui Murayama",
      "campus": "RPT Pacific",
      "githubHandle": "Yui1002",
      "deadlineGroup": "W1",
      "dateAdded": "2022-04-11T22:00:00.000Z",
      "email": "yuimurayama1002@gmail.com"
  }
];



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
  console.log('Adding students to GitHub teams...');
  await addStudentsToGitHubTeams(students);
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

// student object example:
//    {
//   "fullName": "Abdulmalek Alkabsh",
//   "campus": "RPT Pacific",
//   "githubHandle": "amalkabsh",
//   "deadlineGroup": "W1",
//   "dateAdded": "2021-09-20T22:00:00.000Z",
//   "email": "amalkabsh@ucdavis.edu"
// },


const students = [
    {
        "fullName": "Amanda Wright",
        "campus": "RFT Central",
        "githubHandle": "wrightaq",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "amandaqwright@gmail.com"
    },
    {
        "fullName": "Ethan Flower",
        "campus": "RFT Central",
        "githubHandle": "EthanFlower1",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "ethanjamesflower@gmail.com"
    },
    {
        "fullName": "Jason Gates",
        "campus": "RFT Central",
        "githubHandle": "ZerowGG",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "gatesjasond@gmail.com"
    },
    {
        "fullName": "Joseph Connors Shultz",
        "campus": "RFT Central",
        "githubHandle": "JCShultz",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "josephcshultz@gmail.com"
    },
    {
        "fullName": "Justin Chesterfield",
        "campus": "RFT Central",
        "githubHandle": "Casterwield",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "jchesterfield42@gmail.com"
    },
    {
        "fullName": "Scott Clary",
        "campus": "RFT Central",
        "githubHandle": "ScottBClary",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "scottbclary@gmail.com"
    },
    {
        "fullName": "Lawrence Ditton",
        "campus": "RFT Central",
        "githubHandle": "larryshank",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-23T23:00:00.000Z",
        "email": "larry113@gmail.com"
    },
    {
        "fullName": "Yanick Hickman",
        "campus": "RFT Central",
        "githubHandle": "Y-nick",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-27T23:00:00.000Z",
        "email": "Yanick.hickman@gmail.com"
    },
    {
        "fullName": "Andrew King",
        "campus": "RFT Eastern",
        "githubHandle": "NaNdyKing",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "andyking.lrn@gmail.com"
    },
    {
        "fullName": "Christopher Lathen",
        "campus": "RFT Eastern",
        "githubHandle": "clathen",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "clathen@gmail.com"
    },
    {
        "fullName": "Cory Nickerson",
        "campus": "RFT Eastern",
        "githubHandle": "cory314",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "crnckrsn@gmail.com"
    },
    {
        "fullName": "German Diaz",
        "campus": "RFT Eastern",
        "githubHandle": "gdiaz5",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "germandiaz555@gmail.com"
    },
    {
        "fullName": "Hakeem Abdulmalik",
        "campus": "RFT Eastern",
        "githubHandle": "HakeemDAbdulmalik",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "hakeem.d.abdulmalik@gmail.com"
    },
    {
        "fullName": "Jake Reid",
        "campus": "RFT Eastern",
        "githubHandle": "JakeReid53",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "jakereid53@gmail.com"
    },
    {
        "fullName": "Jordan Addleman",
        "campus": "RFT Eastern",
        "githubHandle": "maximumjpeg",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "xibalbarising@gmail.com"
    },
    {
        "fullName": "Joy Parker",
        "campus": "RFT Eastern",
        "githubHandle": "Parkerjn90",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "parkerjn90@gmail.com"
    },
    {
        "fullName": "Levi Walker",
        "campus": "RFT Eastern",
        "githubHandle": "LWcaveman",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "lwcaveman@gmail.com"
    },
    {
        "fullName": "Nicholas Elliott",
        "campus": "RFT Eastern",
        "githubHandle": "nelliott82",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "nikkoelliott@gmail.com"
    },
    {
        "fullName": "Philip Koller",
        "campus": "RFT Eastern",
        "githubHandle": "PhilipKoller",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "philipckoller@gmail.com"
    },
    {
        "fullName": "Sonia Ann Friscia",
        "campus": "RFT Eastern",
        "githubHandle": "SoniaAnn",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "soniaannfriscia@gmail.com"
    },
    {
        "fullName": "UTKU Can OZKAN",
        "campus": "RFT Eastern",
        "githubHandle": "utkucanozkan1",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "utkucozkan@gmail.com"
    },
    {
        "fullName": "Val Pizzo",
        "campus": "RFT Eastern",
        "githubHandle": "valpizzo",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "valpizzo2@gmail.com"
    },
    {
        "fullName": "Yaokai Dong",
        "campus": "RFT Eastern",
        "githubHandle": "ykdong",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "ykdong1991@gmail.com"
    },
    {
        "fullName": "Yuki Ogawa",
        "campus": "RFT Eastern",
        "githubHandle": "yuki-og",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "tcb.yukiogawa@gmail.com"
    },
    {
        "fullName": "Irvin Solano",
        "campus": "RFT Eastern",
        "githubHandle": "irvin-solano",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-24T23:00:00.000Z",
        "email": "irvin.solano.ny@gmail.com"
    },
    {
        "fullName": "Wei Teck Lee",
        "campus": "RFT Eastern",
        "githubHandle": "arkteck",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-27T23:00:00.000Z",
        "email": "arkteck@gmail.com"
    },
    {
        "fullName": "Davyd Zakorchennyi",
        "campus": "RFT Eastern",
        "githubHandle": "Diza41a",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "diza41a@mail.com"
    },
    {
        "fullName": "Kayla Kranzfelder",
        "campus": "RFT Eastern",
        "githubHandle": "KKranzfelder",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "kkranzfelder@gmail.com"
    },
    {
        "fullName": "Cameron Joseph Estep",
        "campus": "RFT Eastern",
        "githubHandle": "Thunderpig851",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-01T23:00:00.000Z",
        "email": "camestep8517@gmail.com"
    },
    {
        "fullName": "Yao Yu",
        "campus": "RFT Eastern",
        "githubHandle": "amyyuyao",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-02T23:00:00.000Z",
        "email": "amyyuyao.thu@gmail.com"
    },
    {
        "fullName": "Justin Kirk",
        "campus": "RFT Eastern",
        "githubHandle": "intern-jck",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-04T23:00:00.000Z",
        "email": "justin.c.kirk@gmail.com"
    },
    {
        "fullName": "Josue Bejar Castillo",
        "campus": "RFT Eastern",
        "githubHandle": "josuebejar11",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-06T23:00:00.000Z",
        "email": "josuebejar11@gmail.com"
    },
    {
        "fullName": "PO CHANG CHEN",
        "campus": "RFT Eastern",
        "githubHandle": "kk741852963tw",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-08T23:00:00.000Z",
        "email": "kk741852963tw1610@gmail.com"
    },
    {
        "fullName": "Brice Koppin",
        "campus": "RFT Eastern",
        "githubHandle": "Bkoppin",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "bricekoppinesq@gmail.com"
    },
    {
        "fullName": "Kedir Zeinu",
        "campus": "RFT Eastern",
        "githubHandle": "Kedirz",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "kedirmohammedzeinu@gmail.com"
    },
    {
        "fullName": "Benjamin Thornton",
        "campus": "RFT Eastern",
        "githubHandle": "benjaminlthornton",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-02T23:00:00.000Z",
        "email": "benjamin.l.thornton@gmail.com"
    },
    {
        "fullName": "Fangzhuo Xi",
        "campus": "RFT Eastern",
        "githubHandle": "FangzhuoXi",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-02T23:00:00.000Z",
        "email": "fangzhuoxi93@gmail.com"
    },
    {
        "fullName": "Jonathan Huang",
        "campus": "RFT Eastern",
        "githubHandle": "jonlovescode",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-04T23:00:00.000Z",
        "email": "jonathan95129@gmail.com"
    },
    {
        "fullName": "Alexis Stone",
        "campus": "RFT Pacific",
        "githubHandle": "alexislcstone",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "alexislcstone@gmail.com"
    },
    {
        "fullName": "Andres Arango",
        "campus": "RFT Pacific",
        "githubHandle": "arangotang",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "arangotang97@gmail.com"
    },
    {
        "fullName": "Andy Luu",
        "campus": "RFT Pacific",
        "githubHandle": "LuuLuu0",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "luuandyf2nd@gmail.com"
    },
    {
        "fullName": "Barry Cheung",
        "campus": "RFT Pacific",
        "githubHandle": "bleecheung",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "barryleecheung@gmail.com"
    },
    {
        "fullName": "Brian Bui",
        "campus": "RFT Pacific",
        "githubHandle": "brianbui012",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "brianbui012@gmail.com"
    },
    {
        "fullName": "Camila Michelle Vasquez",
        "campus": "RFT Pacific",
        "githubHandle": "CamilaVasquez",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "cvasquezdr7@gmail.com"
    },
    {
        "fullName": "Dan Mao",
        "campus": "RFT Pacific",
        "githubHandle": "Angelamaomao",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "maodan091216@gmail.com"
    },
    {
        "fullName": "Danika Partridge",
        "campus": "RFT Pacific",
        "githubHandle": "danika-gray",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "danika.partridge@gmail.com"
    },
    {
        "fullName": "Donna Szeto",
        "campus": "RFT Pacific",
        "githubHandle": "donnalikestocode",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "szetodonna2@gmail.com"
    },
    {
        "fullName": "Dustin Deitch",
        "campus": "RFT Pacific",
        "githubHandle": "DeitchDustin",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "deitchdustin@gmail.com"
    },
    {
        "fullName": "Esther Kuang",
        "campus": "RFT Pacific",
        "githubHandle": "eghkuang",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "eghkuang@gmail.com"
    },
    {
        "fullName": "Fengji Zhang",
        "campus": "RFT Pacific",
        "githubHandle": "thewyze",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "fengji.zhang0@gmail.com"
    },
    {
        "fullName": "gil cohen",
        "campus": "RFT Pacific",
        "githubHandle": "gilcohen67",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "gil.cohen67@gmail.com"
    },
    {
        "fullName": "Han Sol Ji",
        "campus": "RFT Pacific",
        "githubHandle": "ji1hansol",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "ji1hansol@gmail.com"
    },
    {
        "fullName": "Hang Yin",
        "campus": "RFT Pacific",
        "githubHandle": "hangyin2020",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "hangyin2010@gmail.com"
    },
    {
        "fullName": "James Reagan",
        "campus": "RFT Pacific",
        "githubHandle": "jpreagan",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "jpreagan945@gmail.com"
    },
    {
        "fullName": "Jason Matta",
        "campus": "RFT Pacific",
        "githubHandle": "jmatta9",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "jt.matta@gmail.com"
    },
    {
        "fullName": "Jerry Tapia",
        "campus": "RFT Pacific",
        "githubHandle": "jerrytapia",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "jerryxtapia@gmail.com"
    },
    {
        "fullName": "Jessica Zhou",
        "campus": "RFT Pacific",
        "githubHandle": "jessicazhou86",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "jessicazhou541@gmail.com"
    },
    {
        "fullName": "Jordan Sweet",
        "campus": "RFT Pacific",
        "githubHandle": "jsbmg",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "jordansw.hr@gmail.com"
    },
    {
        "fullName": "Justin Guan",
        "campus": "RFT Pacific",
        "githubHandle": "Jthforce",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "guanjustin@gmail.com"
    },
    {
        "fullName": "Kevin Niu",
        "campus": "RFT Pacific",
        "githubHandle": "kevinkniu",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "kevinkniu@gmail.com"
    },
    {
        "fullName": "LINNA LI",
        "campus": "RFT Pacific",
        "githubHandle": "lucky89nana",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "lilinna0809@gmail.com"
    },
    {
        "fullName": "Michael Lin",
        "campus": "RFT Pacific",
        "githubHandle": "michaelin-96",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "michaelin.96@gmail.com"
    },
    {
        "fullName": "Michael Zaki",
        "campus": "RFT Pacific",
        "githubHandle": "Mikezaki94",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "mikezaki94@gmail.com"
    },
    {
        "fullName": "Pan Liu",
        "campus": "RFT Pacific",
        "githubHandle": "pan-liu-us",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "us.panliu@gmail.com"
    },
    {
        "fullName": "Rafael Rivera",
        "campus": "RFT Pacific",
        "githubHandle": "unrestrainedOcean",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "xralphiex@gmail.com"
    },
    {
        "fullName": "Robert Earl Campbell Jr.",
        "campus": "RFT Pacific",
        "githubHandle": "recampbelljr",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "robert.e.campbell.jr@gmail.com"
    },
    {
        "fullName": "Ryan Snow",
        "campus": "RFT Pacific",
        "githubHandle": "r-snow",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "rymsnow@gmail.com"
    },
    {
        "fullName": "Shannon Largman",
        "campus": "RFT Pacific",
        "githubHandle": "slargman",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "shannon.largman@gmail.com"
    },
    {
        "fullName": "Sully Sullivan Clark",
        "campus": "RFT Pacific",
        "githubHandle": "clarkjs237",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "clarkjs237@gmail.com"
    },
    {
        "fullName": "tanner Hebert",
        "campus": "RFT Pacific",
        "githubHandle": "Caponey2",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "tannerhebert20xx@gmail.com"
    },
    {
        "fullName": "Xiao Han",
        "campus": "RFT Pacific",
        "githubHandle": "Lesson9",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "outsidenewcastle@gmail.com"
    },
    {
        "fullName": "Xiaohuan Hu",
        "campus": "RFT Pacific",
        "githubHandle": "Xiaohuan0319",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "huxiaohuan.jlu@gmail.com"
    },
    {
        "fullName": "Zakee Arrington Anderson",
        "campus": "RFT Pacific",
        "githubHandle": "zakeeanderson",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "zzzanderson@protonmail.com"
    },
    {
        "fullName": "Zhiya Xu",
        "campus": "RFT Pacific",
        "githubHandle": "ExYY98",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "xuesmy@gmail.com"
    },
    {
        "fullName": "Zebib Gebreslassie",
        "campus": "RFT Pacific",
        "githubHandle": "zebibg",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-24T23:00:00.000Z",
        "email": "zgebres@gmail.com"
    },
    {
        "fullName": "Leia Harlow",
        "campus": "RFT Pacific",
        "githubHandle": "leiaHarlow",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-27T23:00:00.000Z",
        "email": "leia.harlow@gmail.com"
    },
    {
        "fullName": "Jeffrey Leary",
        "campus": "RFT Pacific",
        "githubHandle": "learyjk",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "leary.keegan@gmail.com"
    },
    {
        "fullName": "John Ong",
        "campus": "RFT Pacific",
        "githubHandle": "Itsjohnong",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "itsjohnong@gmail.com"
    },
    {
        "fullName": "Jongmyung Jeong",
        "campus": "RFT Pacific",
        "githubHandle": "pqqrpr",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "yojefff@gmail.com"
    },
    {
        "fullName": "Neil Andrew Johnson",
        "campus": "RFT Pacific",
        "githubHandle": "nxjohnson",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "neiljohnson92@gmail.com"
    },
    {
        "fullName": "Jin Jin Peng",
        "campus": "RFT Pacific",
        "githubHandle": "jinp1031",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-01T23:00:00.000Z",
        "email": "jinp1031@gmail.com"
    },
    {
        "fullName": "Din Cohen",
        "campus": "RFT Pacific",
        "githubHandle": "dincohen92",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-02T23:00:00.000Z",
        "email": "dincohen92@gmail.com"
    },
    {
        "fullName": "Alex Krut",
        "campus": "RFT Pacific",
        "githubHandle": "EtoKruto",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-03T23:00:00.000Z",
        "email": "akrut26@gmail.com"
    },
    {
        "fullName": "Jean Lam",
        "campus": "RFT Pacific",
        "githubHandle": "jeanlamw",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-03T23:00:00.000Z",
        "email": "jeanlamw@gmail.com"
    },
    {
        "fullName": "Le Yu",
        "campus": "RFT Pacific",
        "githubHandle": "yulejessica",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-03T23:00:00.000Z",
        "email": "yulejessica@gmail.com"
    },
    {
        "fullName": "Peggy Tran",
        "campus": "RFT Pacific",
        "githubHandle": "pegaatron",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-03T23:00:00.000Z",
        "email": "peggypotatoes@gmail.com"
    },
    {
        "fullName": "Vincent Ding",
        "campus": "RFT Pacific",
        "githubHandle": "vincentdingg",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-03T23:00:00.000Z",
        "email": "vincentdingg@gmail.com"
    },
    {
        "fullName": "Johnny Wu",
        "campus": "RFT Pacific",
        "githubHandle": "Skydodle",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-04T23:00:00.000Z",
        "email": "skydodle@gmail.com"
    },
    {
        "fullName": "Aaron Bowers",
        "campus": "RFT Pacific",
        "githubHandle": "aaron-bowers",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-06T23:00:00.000Z",
        "email": "bowersaaronjames@gmail.com"
    },
    {
        "fullName": "Junsu Park",
        "campus": "RFT Pacific",
        "githubHandle": "junsupark94",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-06T23:00:00.000Z",
        "email": "junsupark94@gmail.com"
    },
    {
        "fullName": "Fan Zhang",
        "campus": "RFT Pacific",
        "githubHandle": "AliciaFZhang",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-08T23:00:00.000Z",
        "email": "aliciafzhang@gmail.com"
    },
    {
        "fullName": "Joshua Ham",
        "campus": "RFT Pacific",
        "githubHandle": "joshuaju12",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-09T23:00:00.000Z",
        "email": "joshuaju.ham@gmail.com"
    },
    {
        "fullName": "Xinru Wang",
        "campus": "RFT Pacific",
        "githubHandle": "gracethecoder",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-24T23:00:00.000Z",
        "email": "xinruw1@gmail.com"
    },
    {
        "fullName": "Kenny Tran",
        "campus": "RFT Pacific",
        "githubHandle": "kennytran95",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "kennyytran95@gmail.com"
    },
    {
        "fullName": "Zachary Kessler",
        "campus": "RFT Pacific",
        "githubHandle": "zman811",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-03T23:00:00.000Z",
        "email": "sunburnzman@gmail.com"
    },
    {
        "fullName": "Isaac Chung",
        "campus": "RFT Pacific",
        "githubHandle": "imizik",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-06T23:00:00.000Z",
        "email": "chung.isaac3@gmail.com"
    },
    {
        "fullName": "ABDIEL SANCHEZ-GAUD",
        "campus": "RPT Pacific",
        "githubHandle": "absaga",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "gaud.abdiel@gmail.com"
    },
    {
        "fullName": "Alex Yeung",
        "campus": "RPT Pacific",
        "githubHandle": "yeung608",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "a.yeung608@yahoo.com"
    },
    {
        "fullName": "David Chiu",
        "campus": "RPT Pacific",
        "githubHandle": "dchiu91",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "david.chiu991@gmail.com"
    },
    {
        "fullName": "Dongning Song",
        "campus": "RPT Pacific",
        "githubHandle": "mathdsong",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "mathdsong@gmail.com"
    },
    {
        "fullName": "Duke Romkey",
        "campus": "RPT Pacific",
        "githubHandle": "dukeromkey",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "dukeromkey@gmail.com"
    },
    {
        "fullName": "Ethan Ayaay",
        "campus": "RPT Pacific",
        "githubHandle": "ayaayethan",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "ayaayethan@gmail.com"
    },
    {
        "fullName": "Jingtian Liu",
        "campus": "RPT Pacific",
        "githubHandle": "liujt1205",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "liujt1205@gmail.com"
    },
    {
        "fullName": "Jinying Ren",
        "campus": "RPT Pacific",
        "githubHandle": "renfiona9",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "renfiona9@gmail.com"
    },
    {
        "fullName": "John Hall",
        "campus": "RPT Pacific",
        "githubHandle": "jkeithhall",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "j.keithhall@gmail.com"
    },
    {
        "fullName": "Lingxuan Xu",
        "campus": "RPT Pacific",
        "githubHandle": "matt7xu",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "matt7xu@gmail.com"
    },
    {
        "fullName": "Miranda Zhou",
        "campus": "RPT Pacific",
        "githubHandle": "mirandasizhou",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "mirandasizhou@gmail.com"
    },
    {
        "fullName": "Morgan Harrison",
        "campus": "RPT Pacific",
        "githubHandle": "morganharrison",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "morganharrison13@gmail.com"
    },
    {
        "fullName": "Nicholas Hays",
        "campus": "RPT Pacific",
        "githubHandle": "Shistavanen",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "nicholasahays@gmail.com"
    },
    {
        "fullName": "Nicholas Murray",
        "campus": "RPT Pacific",
        "githubHandle": "nich-0",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "ncmurray@gmail.com"
    },
    {
        "fullName": "Riccardo Pirruccio",
        "campus": "RPT Pacific",
        "githubHandle": "Ill-Spinach",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "rickp1795@gmail.com"
    },
    {
        "fullName": "Ruonan Xi",
        "campus": "RPT Pacific",
        "githubHandle": "ruonanxi73",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "546904462x@gmail.com"
    },
    {
        "fullName": "Ryan Jones",
        "campus": "RPT Pacific",
        "githubHandle": "rmjones3",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "ryanmj10@gmail.com"
    },
    {
        "fullName": "Stephanie Nagel",
        "campus": "RPT Pacific",
        "githubHandle": "aelious",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "aeliousx@gmail.com"
    },
    {
        "fullName": "William Kent",
        "campus": "RPT Pacific",
        "githubHandle": "kentwl1876",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "kentwl1876@gmail.com"
    },
    {
        "fullName": "Xiaohui Li",
        "campus": "RPT Pacific",
        "githubHandle": "healthyxhl23",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "herryxhl23@gmail.com"
    },
    {
        "fullName": "ZEFENG SHEN",
        "campus": "RPT Pacific",
        "githubHandle": "zzsocool",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "shzf13@gmail.com"
    },
    {
        "fullName": "Justo Marquez",
        "campus": "RPT Pacific",
        "githubHandle": "marquezmiko",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-23T23:00:00.000Z",
        "email": "marquezmiko@gmail.com"
    },
    {
        "fullName": "Keenan Aldridge",
        "campus": "RPT Pacific",
        "githubHandle": "kmantan",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "kmantan@gmail.com"
    },
    {
        "fullName": "Isaac Lee",
        "campus": "RPT Pacific",
        "githubHandle": "IHeewonL",
        "deadlineGroup": "W2",
        "dateAdded": "2022-03-03T23:00:00.000Z",
        "email": "isaac.heewon@gmail.com"
    },
    {
        "fullName": "Francisco Javier Campos Castelló",
        "campus": "RPT Pacific",
        "githubHandle": "Loxiiii",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-06T23:00:00.000Z",
        "email": "javiercamposcastello@gmail.com"
    },
    {
        "fullName": "Keren Liu",
        "campus": "RPT Pacific",
        "githubHandle": "Keren-futureSoftwareEngineer",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-06T23:00:00.000Z",
        "email": "karenliu816@gmail.com"
    },
    {
        "fullName": "Hasan Uchchas",
        "campus": "RPT Pacific",
        "githubHandle": "HUchchas",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-07T23:00:00.000Z",
        "email": "hsuchchas@gmail.com"
    },
    {
        "fullName": "Anthony Merino",
        "campus": "RPT Pacific",
        "githubHandle": "chiElephant",
        "deadlineGroup": "W3",
        "dateAdded": "2022-03-09T23:00:00.000Z",
        "email": "the.anthony.merino@gmail.com"
    },
    {
        "fullName": "Kristopher Opeda",
        "campus": "RPT Pacific",
        "githubHandle": "kopeda",
        "deadlineGroup": "W4",
        "dateAdded": "2022-03-15T23:00:00.000Z",
        "email": "kristopher.opeda@me.com"
    },
    {
        "fullName": "Bolormaa Zanabaatar",
        "campus": "RPT Pacific",
        "githubHandle": "Bolor61",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "obol0103@gmail.com"
    },
    {
        "fullName": "SunHee Simon",
        "campus": "RPT Pacific",
        "githubHandle": "sunhees",
        "deadlineGroup": "W1",
        "dateAdded": "2022-02-22T23:00:00.000Z",
        "email": "sunhee.simon@gmail.com"
    },
    {
        "fullName": "Jewell Wilson",
        "campus": "RPT Pacific",
        "githubHandle": "jewellwilson1",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-27T23:00:00.000Z",
        "email": "jewellgwilson@gmail.com"
    },
    {
        "fullName": "Eric Kalin",
        "campus": "RPT Pacific",
        "githubHandle": "ekalin12",
        "deadlineGroup": "W2",
        "dateAdded": "2022-02-28T23:00:00.000Z",
        "email": "e.kalin12@gmail.com"
    }
]

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
