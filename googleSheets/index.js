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

async function replaceWorksheet(worksheet, headers, rows) {
  await worksheet.clear();
  await worksheet.setHeaderRow(headers);
  await worksheet.addRows(rows);
}

async function getRows(worksheet) {
  const rows = await worksheet.getRows();
  return rows.map((row) => worksheet.headerValues.reduce((student, key) => {
    student[key] = row[key]; // eslint-disable-line no-param-reassign
    return student;
  }, {}));
}

module.exports = {
  loadGoogleSpreadsheet,
  replaceWorksheet,
  getRows,
};
