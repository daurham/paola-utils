require('dotenv').config();
const { google } = require('googleapis');

const {
  getAllGroupMembers,
  addStudentToGroup,
  removeGroupMember,
} = require('.');

const scopes = ['https://www.googleapis.com/auth/admin.directory.group'];
const jwt = new google.auth.JWT(process.env.GOOGLE_GROUPS_CLIENT_EMAIL, null, process.env.GOOGLE_ADMIN_CLIENT_KEY, scopes, 'paola@galvanize.com');

const GOOGLE_GROUP_ID = 'paola-sandbox@galvanize.com';
const GOOGLE_GROUP_USER = 'paola@galvanize.com';

const authenticate = async () => {
  await jwt.authorize((err, token) => {
    if (err) return err;
    return token;
  });

  return google.admin(
    { version: 'directory_v1', auth: jwt },
  );
};

// Clear out all group members before testing
beforeAll(async () => {
  const service = await authenticate();
  const response = await service.members.list({
    groupKey: GOOGLE_GROUP_ID,
  });
  if (response.data.members && response.data.members.length) {
    response.data.members.map(async (user) => {
      await service.members.delete({
        groupKey: GOOGLE_GROUP_ID,
        memberKey: user.email,
      });
    });
  }
});

const addUser = async () => {
  const service = await authenticate();
  await service.members.insert({
    groupKey: GOOGLE_GROUP_ID,
    resource: { email: GOOGLE_GROUP_USER },
  });
};

const removeUser = async () => {
  const service = await authenticate();
  await service.members.delete({
    groupKey: GOOGLE_GROUP_ID,
    memberKey: GOOGLE_GROUP_USER,
  });
};

describe('getAllGroupMembers', () => {
  test('Should return an empty array if no members', async () => {
    const members = await getAllGroupMembers(GOOGLE_GROUP_ID);
    expect(members).toHaveLength(0);
  });
  test('Should return an array of group members', async () => {
    await addUser();
    const members = await getAllGroupMembers(GOOGLE_GROUP_ID);
    expect(members).toHaveLength(1);
    expect(members[0]).toHaveProperty('email');
    expect(members[0]).toHaveProperty('role');
  });
  test('Should return an error if group id does not exist', async () => {
    const members = await getAllGroupMembers('*****');
    expect(members).toBe('Resource Not Found: groupKey');
  });
  test('Should return an error if no access to group id', async () => {
    const members = await getAllGroupMembers('googlegroups@gmail.com');
    expect(members).toBe('Not Authorized to access this resource/api');
  });
});

describe('addStudentToGroup', () => {
  test('Should return true if user successfully is added', async () => {
    await removeUser();
    const response = await addStudentToGroup(GOOGLE_GROUP_ID, GOOGLE_GROUP_USER);
    expect(response).toBe(true);
  });
  test('Should return an error if user is already in group', async () => {
    const response = await addStudentToGroup(GOOGLE_GROUP_ID, GOOGLE_GROUP_USER);
    expect(response).toBe('Member already exists.');
  });
  test('Should return an error if user does not exist', async () => {
    const response = await addStudentToGroup(GOOGLE_GROUP_ID, '****@gmail.com');
    expect(response).toContain('Resource Not Found');
  });
  test('Should return an error if invalid memberKey provided', async () => {
    const response = await addStudentToGroup(GOOGLE_GROUP_ID, '****aabbcc');
    expect(response).toContain('Invalid Input: memberKey');
  });
});

describe('removeGroupMember', () => {
  test('Should return true if user successfully is removed', async () => {
    const response = await removeGroupMember(GOOGLE_GROUP_ID, GOOGLE_GROUP_USER);
    expect(response).toBe(true);
  });
  test('Should return an error if user was already not in group', async () => {
    const response = await removeGroupMember(GOOGLE_GROUP_ID, GOOGLE_GROUP_USER);
    expect(response).toBe('Resource Not Found: memberKey');
  });
  test('Should return an error if user does not exist', async () => {
    const response = await removeGroupMember(GOOGLE_GROUP_ID, '****@gmail.com');
    expect(response).toContain('Resource Not Found');
  });
  test('Should return an error if invalid memberKey provided', async () => {
    const response = await removeGroupMember(GOOGLE_GROUP_ID, '****');
    expect(response).toBe('Missing required field: memberKey');
  });
});
