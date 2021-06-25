/* eslint-disable no-console */
require('dotenv').config();
const fetch = require('node-fetch');
// const https = require('https');
// const Bottleneck = require('bottleneck');

// PRECOURSE 1 Workspace
// const idObject = {
//   Beverly: 'UV5M83A3A',
//   Steven: 'U01JWMD1CM9',
//   Eliza: 'U01NRN13YUE',
//   Daniel: 'U01P4LB6Q5A',
//   Jake: 'U01P244S4UX',
//   Marco: 'U02000L2BCJ',
//   David: 'U010L2RB5B2',
// };

// PRECOURSE 2 Workspace
const TECH_MENTOR_USER_ID_MAP = {
  Beverly: 'U013VKW4D7B',
  Daniel: 'U01R3J6S8KS',
  Eliza: 'U01QDV9RA2X',
  Steven: 'U014KAZ8ZTK',
  Jake: 'U01QSCBDA8H',
  David: 'U024K843NEB',
  Marco: 'U01QETJC51V',
  // Peter: 'U015TC8M53R', // Unused, Slack token is Peter's so he doesn't need to be added
};
const techMentorUserIDs = Object.values(TECH_MENTOR_USER_ID_MAP).join(',');

function slackAPIRequest(endpoint, method, body) {
  const headers = {
    Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
    'Content-Type': 'application/json; charset=utf-8',
  };
  return fetch(
    `https://slack.com/api/${endpoint}`,
    { method, body: typeof body === 'string' ? body : JSON.stringify(body), headers },
  ).then((res) => res.json());
}


// Send a message to a channel
exports.sendMessageToChannel = (channel, text) => slackAPIRequest(
  'chat.postMessage',
  'POST',
  { channel, text },
);

// format list of names function to create firstname_lastname,
// which is the desired channel name for each student's private chat channel
const NAME_SUFFIXES = ['II', 'III', 'IV', 'JR', 'SR', 'JR.', 'SR.'];
const formatListOfNames = (nameList) => nameList.map((name) => {
  const nameArray = name.split(' ');
  if (nameArray.length > 2) {
    const lastNamePart = nameArray[nameArray.length - 1].toUpperCase();
    if (NAME_SUFFIXES.includes(lastNamePart)) nameArray.pop();
  }
  return `${nameArray[0].toLowerCase()}_${nameArray[nameArray.length - 1].toLowerCase()}`;
});

const createChannel = async (name) => slackAPIRequest(
  'conversations.create',
  'POST',
  { name, is_private: true },
);

const inviteUsersToChannel = async (channelID, userIDs) => slackAPIRequest(
  'conversations.invite',
  'POST',
  { channel: channelID, is_private: true, users: userIDs },
);

const setChannelPurpose = async (channelID, purpose) => slackAPIRequest(
  'conversations.setPurpose',
  'POST',
  { channel: channelID, purpose },
);

const setChannelTopic = async (channelID, topic) => slackAPIRequest(
  'conversations.setTopic',
  'POST',
  { channel: channelID, topic },
);

exports.getUserIdByEmail = async (email) => slackAPIRequest(
  `users.lookupByEmail?email=${email}`,
  'GET',
);

exports.getAllChannelsInWorkspace = async () => slackAPIRequest(
  'conversations.list',
  'GET',
);

exports.createChannelPerStudent = async (nameList) => {
  const formattedNames = formatListOfNames(nameList);
  formattedNames.forEach(async (name) => {
    const result = await createChannel(name);
    if (!result.ok) {
      console.warn('Failed to create channel for', name);
      console.warn(result);
      return;
    }
    console.info('Created channel', result.channel.id, 'for', name);
    const purposeSet = await setChannelPurpose(
      result.channel.id,
      'This channel is where you will interact with the Precourse team regarding technical questions. '
      + 'TMs will respond to help desk and reach out about your progress throughout the course.',
    );
    if (!purposeSet.ok) console.warn('Failed to set channel purpose', purposeSet);
    const topicSet = await setChannelTopic(result.channel.id, 'Your personal channel with the Precourse Team.');
    if (!topicSet.ok) console.warn('Failed to set channel topic', topicSet);
    const invited = await inviteUsersToChannel(result.channel.id, techMentorUserIDs);
    if (!invited.ok) console.warn('Failed to invite users to channel', invited);
  });
};
exports.inviteNewTmsToChannels = async () => {}; // TODO?
exports.sendMessageViaDM = async () => {}; // TODO?
exports.getChannelHistory = async (channelID) => slackAPIRequest(
  `conversations.history?channel=${channelID}&limit=1000`,
  'GET',
);

// WIP block?
// const apiConfig = {};
// const get = (url) => new Promise((resolve, reject) => https.get(url, options, (res) => {
//   let body = '';
//   res.on('data', (chunk) => {
//     (body += chunk);
//   });
//   res.on('end', () => resolve(JSON.parse(body)));
// })
//   .on('error', reject));
// const options = {
//   headers: {
//     Authorization: `Bearer ${process.env.SLACK_TOKEN}`
//   }
// }
// const limiter = new Bottleneck({
//   maxConcurrent: 2,
//   minTime: 1000,
// });
// async function deleteMessages(threadTs, messages) {
//   if (messages.length === 0) {
//     return;
//   }
//   const message = messages.shift();
//   if (message.thread_ts !== threadTs) {
//     // Fetching replies, it will delete main message as well.
//     // eslint-disable-next-line no-use-before-define
//     await fetchAndDeleteMessages(message.thread_ts, '');
//   } else {
//     const wrapped = limiter.wrap(get);
//     await wrapped(apiConfig.deleteApiUrl + message.ts);
//   }
//   await deleteMessages(threadTs, messages);
// }
// async function fetchAndDeleteMessages(threadTs, cursor) {
//   const response = await get(
//     (threadTs ? `${apiConfig.repliesApiUrl + threadTs}&cursor=` : apiConfig.historyApiUrl)
//     + cursor
//   );
//   console.log(response);
//   if (!response.ok) {
//     return response;
//   }
//   if (!response.messages || response.messages.length === 0) {
//     return response;
//   }
//   await deleteMessages(threadTs, response.messages);
//   if (response.has_more) {
//     await fetchAndDeleteMessages(threadTs, response.response_metadata.next_cursor);
//   }
// }
// exports.clearChannel = (channelID) => {
//   apiConfig.channel = channelID;
//   apiConfig.baseApiUrl = 'https://slack.com/api/';
//   apiConfig.historyApiUrl = `${apiConfig.baseApiUrl}conversations.history?channel=${apiConfig.channel}&count=1000&cursor=`;
//   apiConfig.deleteApiUrl = `${apiConfig.baseApiUrl}chat.delete?channel=${apiConfig.channel}&ts=`;
//   apiConfig.repliesApiUrl = `${apiConfig.baseApiUrl}conversations.replies?channel=${apiConfig.channel}&ts=`;
//   console.log(apiConfig);
//   return fetchAndDeleteMessages(null, '');
// };
