require('dotenv').config();
const yargs = require('yargs');
const emailDefinitions = require('./emailDefinitions');
const sendEmails = require('./sendEmails');


const https = require('https');
const fetch = require('node-fetch');
// peter's edit starts here
console.log(process.env.SLACK_TOKEN[0] === 'x');
console.log(typeof process.env.SLACK_TOKEN);


const tester = () => {
  const testUrl = 'https://slack.com/api/users.list';
  const options = {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_TOKEN}`
    }
  };
  fetch(testUrl, options).then(res => res.json()).then(res => console.log(res)).catch(err => console.log(err));
};

tester();


// --------------------- //

const get = (url) => new Promise((resolve, reject) => https.get(url, options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    (body += chunk);
  });
  res.on('end', () => resolve(JSON.parse(body)));
})
  .on('error', reject));

const options = {
  headers: {
    Authorization: `Bearer ${process.env.SLACK_TOKEN}`
  }
}


async function deleteMessages(threadTs, messages) {
  if (messages.length === 0) {
    return;
  }

  const message = messages.shift();

  if (message.thread_ts !== threadTs) {
    // eslint-disable-next-line no-use-before-define

    await fetchAndDeleteMessages(message.thread_ts, ''); // Fetching replies, it will delete main message as well.
  } else {


    const wrapped = limiter.wrap(get);
    const response = await wrapped(apiConfig.deleteApiUrl + message.ts);

  }

  await deleteMessages(threadTs, messages);
}

async function fetchAndDeleteMessages(threadTs, cursor) {
  const response = await get((threadTs ? `${apiConfig.repliesApiUrl + threadTs}&cursor=` : apiConfig.historyApiUrl) + cursor);
  console.log(response);
  if (!response.ok) {
    return response;
  }

  if (!response.messages || response.messages.length === 0) {
    return response;
  }

  await deleteMessages(threadTs, response.messages);

  if (response.has_more) {
    await fetchAndDeleteMessages(threadTs, response.response_metadata.next_cursor);
  }
}


const apiConfig = {};


var clearChannel = (channelID) => {
  apiConfig.channel = channelID;
  apiConfig.baseApiUrl = 'https://slack.com/api/';
  apiConfig.historyApiUrl = `${apiConfig.baseApiUrl}conversations.history?channel=${apiConfig.channel}&count=1000&cursor=`;
  apiConfig.deleteApiUrl = `${apiConfig.baseApiUrl}chat.delete?channel=${apiConfig.channel}&ts=`;
  apiConfig.repliesApiUrl = `${apiConfig.baseApiUrl}conversations.replies?channel=${apiConfig.channel}&ts=`;
  console.log(apiConfig);
  return fetchAndDeleteMessages(null, '');
};

// clearChannel('CV0JMG4A2');


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
