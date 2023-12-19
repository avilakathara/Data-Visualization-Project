async function fetchAndProcessCSV(csvFilePath) {
    try {
        const response = await fetch(csvFilePath);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const csvData = await response.text();

        // Parse CSV data using PapaParse
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                // Process the data and create a new CSV
                const processedData = processData(result.data);

                // Convert the processed data to CSV format
                const csv = convertToCSV(processedData);

                // You can save or display the new CSV as needed
                console.log(csv);
            },
            error: (error) => {
                console.error('PapaParse error:', error.message);
            },
        });
    } catch (error) {
        console.error(error);
    }
}

// Function to process the data and extract relevant information
function processData(data) {
    const countryData = {};

    // Iterate through each entry in the CSV
    data.forEach((entry) => {
        const country = entry.country;

        // Check if the country already exists in the processed data
        if (!countryData[country]) {
            countryData[country] = {
                gdp: entry.gdp_country,
                numBillionaires: 0,
                totalWealth: 0,
                totalTaxRate: 0,
            };
        }

        // Update the data for the current country
        countryData[country].numBillionaires++;

        // Check if entry.net_worth is defined before replacing commas and converting to float
        if (entry.net_worth !== undefined) {
            countryData[country].totalWealth += parseFloat(entry.net_worth); // Replace commas and convert to float
        }

        countryData[country].totalTaxRate += parseFloat(entry.total_tax_rate_country);
    });

    // Convert the processed data to an array of objects
    return Object.keys(countryData).map((country) => ({
        country,
        gdp: countryData[country].gdp,
        numBillionaires: countryData[country].numBillionaires,
        totalWealth: countryData[country].totalWealth.toFixed(2),
        totalTaxRate: (countryData[country].totalTaxRate / countryData[country].numBillionaires).toFixed(2),
    }));
}



// Function to convert data to CSV format
function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach((row) => {
        const values = headers.map((header) => {
            // Enclose gdp values in quotes
            return header === 'gdp' ? `"${row[header]}"` : row[header];
        });
        csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
}



// Replace 'path/to/your/input.csv' with the actual URL or path to your CSV file
const csvFilePath = 'data/Billionaires_Statistics_Dataset.csv';
fetchAndProcessCSV(csvFilePath);
