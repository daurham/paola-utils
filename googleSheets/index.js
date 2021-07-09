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

async function getSheetMetadata(doc, metadataKey) {
  const res = await doc.axios.post('/developerMetadata:search', {
    dataFilters: [{
      developerMetadataLookup: {
        metadataKey,
        metadataLocation: {
          spreadsheet: true,
        },
      },
    }],
  });
  if (res.status !== 200 || !res.data || !res.data.matchedDeveloperMetadata) return null;
  return res.data.matchedDeveloperMetadata[0].developerMetadata.metadataValue;
}

function createSheetMetadata(doc, metadataKey, metadataValue) {
  return doc.axios.post(':batchUpdate', {
    requests: [{
      createDeveloperMetadata: {
        developerMetadata: {
          metadataKey,
          metadataValue,
          location: {
            spreadsheet: true,
          },
          visibility: 1,
        },
      },
    }],
    includeSpreadsheetInResponse: false,
  });
}

function updateSheetMetadata(doc, metadataKey, metadataValue) {
  return doc.axios.post(':batchUpdate', {
    requests: [{
      updateDeveloperMetadata: {
        dataFilters: [{
          developerMetadataLookup: {
            metadataKey,
            metadataLocation: {
              spreadsheet: true,
            },
          },
        }],
        developerMetadata: {
          metadataKey,
          metadataValue,
          location: {
            spreadsheet: true,
          },
          visibility: 1,
        },
        fields: '*',
      },
    }],
    includeSpreadsheetInResponse: false,
  });
}

async function upsertSheetMetadata(doc, metadataKey, metadataValue) {
  const existingMetadata = await getSheetMetadata(doc, metadataKey);
  if (!existingMetadata) {
    return createSheetMetadata(doc, metadataKey, metadataValue);
  }
  return updateSheetMetadata(doc, metadataKey, metadataValue);
}

function deleteSheetMetadata(doc, metadataKey) {
  return doc.axios.post(':batchUpdate', {
    requests: [{
      deleteDeveloperMetadata: {
        dataFilter: {
          developerMetadataLookup: {
            metadataKey,
            metadataLocation: {
              spreadsheet: true,
            },
          },
        },
      },
    }],
    includeSpreadsheetInResponse: false,
  });
}

module.exports = {
  loadGoogleSpreadsheet,
  replaceWorksheet,
  getRows,

  getSheetMetadata,
  createSheetMetadata,
  updateSheetMetadata,
  upsertSheetMetadata,
  deleteSheetMetadata,
};
