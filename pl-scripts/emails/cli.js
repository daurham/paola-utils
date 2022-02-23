require('dotenv').config();
const yargs = require('yargs');
const emailDefinitions = require('./emailDefinitions');
const sendEmails = require('./sendEmails');
const fetch = require('node-fetch');

// peter's edit starts here
console.log(process.env.SLACK_TOKEN);
console.log(typeof process.env.SLACK_TOKEN);


(async function getUserIdByEmail(email) {
  const headers = {
    Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  try {
    const response = await fetch(
      `https://slack.com/api/users.lookupByEmail?token=${process.env.SLACK_TOKEN}&email=${email}`,
      { method: 'GET' },
    );
    console.log(await response.json());
    return await response.json();
  } catch (err) {
    console.log(err);
    return err;
  }
})('peter.muller@galvanize.com');





var test = function() {
// delete line above when done

const { argv } = yargs(process.argv)
  .option('emails', {
    alias: 'email',
    describe: 'emails to send',
    type: 'array',
    default: ['studentInfoFormReminder', 'joinSlackReminder'],
    choices: emailDefinitions.map((def) => def.key),
  })
  .option('dry-run', {
    alias: 'dry',
    describe: 'print out recipient names without sending',
    type: 'boolean',
    default: true,
  })
  .option('test-email-address', {
    alias: 'test',
    describe: 'email address that a single test email will be sent to',
    type: 'string'
  });

sendEmails(
  emailDefinitions.filter((def) => argv.emails.includes(def.key)),
  argv['dry-run'],
  argv['test-email-address']
);

// delete line below when done
}
