require('dotenv').config();
const yargs = require('yargs');
const emailDefinitions = require('./emailDefinitions');
const sendEmails = require('./sendEmails');

// peter's edit starts here
console.log(process.env.SLACK_TOKEN);
console.log(typeof process.env.SLACK_TOKEN);

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
