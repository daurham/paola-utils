/* eslint-disable no-console */
require('dotenv').config();
const fetch = require('node-fetch');
const { SLACK_TM_EMAILS } = require('../constants');

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
const sendMessageToChannel = (channel, text) => slackAPIRequest(
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

// const getUserIdByEmail = async (email) => slackAPIRequest(
//   `users.lookupByEmail?email=${email}`,
//   'GET',
// );

// const getAllChannelsInWorkspace = async () => slackAPIRequest(
//   'conversations.list',
//   'GET',
// );
const getTechMentorUserIDs = async () => {
  const users = await slackAPIRequest('users.list', 'GET');
  return users.members
    .filter((user) => SLACK_TM_EMAILS.includes(user.profile.email))
    .map((user) => user.id);
};

const createChannelPerStudent = async (nameList) => {
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
    const techMentorUserIDs = await getTechMentorUserIDs();
    const invited = await inviteUsersToChannel(result.channel.id, techMentorUserIDs);
    if (!invited.ok) console.warn('Failed to invite users to channel', invited);
  });
};
// const inviteNewTmsToChannels = async () => {}; // TODO?
// const sendMessageViaDM = async () => {}; // TODO?
// const getChannelHistory = async (channelID) => slackAPIRequest(
//   `conversations.history?channel=${channelID}&limit=1000`,
//   'GET',
// );

module.exports = {
  slackAPIRequest,

  createChannelPerStudent,
  sendMessageToChannel,
};

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
