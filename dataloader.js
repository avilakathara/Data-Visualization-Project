let headers = null;
let loadedData = null;
let dataReadyCallback = null;

async function fetchAllData() {
  const response = await fetch('data/Billionaires_Statistics_Dataset.csv');
  const csvData = await response.text();

  // Parse CSV data into JavaScript objects using Papa Parse
  Papa.parse(csvData, {
    header: true,
    complete: function (result) {
      loadedData = result.data;
      headers = result.meta.fields
      if (dataReadyCallback) {
        dataReadyCallback(loadedData, headers);
      }
    }
  });
}

fetchAllData();

// register callback when data is ready
function onDataReady(callback) {
  if (loadedData !== null) {
    callback(loadedData, headers);
  } else {
    dataReadyCallback = callback;
  }
}

export { onDataReady };
