const { GoogleSpreadsheet } = require('google-spreadsheet');

async function loadGoogleSpreadsheet(id) {
  const doc = new GoogleSpreadsheet(id);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  });
  await doc.loadInfo();
  return doc;
}

module.exports = loadGoogleSpreadsheet;
