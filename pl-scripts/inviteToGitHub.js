require('dotenv').config();
const { addUsersToTeam } = require('../github');
const { GITHUB_STUDENT_TEAM } = require('../constants');

(async () => {
  if (!process.argv[2]) {
    console.log('A GitHub handle must be supplied when calling this script');
    process.exit(1);
  }
  console.log(`Adding ${process.argv[2]} to GitHub team ${GITHUB_STUDENT_TEAM}...`);
  const res = await addUsersToTeam([process.argv[2]], GITHUB_STUDENT_TEAM);
  console.log(`Result: ${res}`);
  console.log('Done!');
})();