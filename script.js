document.addEventListener("DOMContentLoaded", function () {
    const dataTable = document.getElementById("data-table-filter");
    const addRowBtn = document.getElementById("addRowBtn");
    const addColumnBtn = document.getElementById("addColumnBtn");
    const addNumericalRowBtn = document.getElementById("addNumericalRowBtn");
    const getResultsBtn = document.getElementById("getResultsBtn");

    addRowBtn.addEventListener("click", function () {
        addRowToTable();
    });

    addColumnBtn.addEventListener("click", function () {
        addColumnToTable("New Column");
    });

    addNumericalRowBtn.addEventListener("click", function () {
        addNumericalRowToTable();
    });

    getResultsBtn.addEventListener("click", function () {
        getAndApplyFilters();
    });


    function getSelectedDropdownValue(cell) {
        const dropdownContainer = cell.querySelector(".dropdown-container");
        if (dropdownContainer) {
            // Regular dropdown
            const dropdown = dropdownContainer.querySelector("select");
            return dropdown ? dropdown.value : 'None';
        } else {
            // Numerical dropdown
            const numericalDropdown = cell.querySelector(".numerical-dropdown-container select");
            return numericalDropdown ? numericalDropdown.value : 'None';
        }
    }


    function getAndApplyFilters() {
        const selectedTopicCell = dataTable.rows[1].cells[0];
        const selectedTopic = getSelectedDropdownValue(selectedTopicCell);

        console.log(selectedTopic)

        // const filters = [];
        // for (let i = 1; i < dataTable.rows.length; i++) {
        //     const group1Cell = dataTable.rows[i].cells[1];
        //     const group2Cell = dataTable.rows[i].cells[2];

        //     const group1Value = getSelectedDropdownValue(group1Cell);
        //     const group2Value = getSelectedDropdownValue(group2Cell);

        //     // Create filters for Group 1 and Group 2
        //     if (group1Value !== 'None') {
        //         filters.push({ columnName: selectedTopic, type: 'equals', value: group1Value });
        //     }

        //     if (group2Value !== 'None') {
        //         filters.push({ columnName: selectedTopic, type: 'equals', value: group2Value });
        //     }
        // }

        // Use filters as needed (e.g., apply filters to your data)
        fetchDataAndFilter('data/Billionaires_Statistics_Dataset.csv', filters);
    }

    // Function to add a row to the table
    function addRowToTable() {
        const newRow = dataTable.insertRow();

        // Create a dropdown for the Topic column
        const topicCell = newRow.insertCell(0);
        createDropdown(topicCell, "Topic");

        // Create dropdowns for Group 1 and Group 2 based on the selected topic
        for (let i = 1; i <= dataTable.rows[0].cells.length - 1; i++) {
            const cell = newRow.insertCell(i);

            // Create a dropdown for each cell
            createDropdown(cell);
        }
    }

    function addColumnToTable(columnName) {
        const headerRow = dataTable.rows[0];
        const newHeaderCell = headerRow.insertCell(-1);
        newHeaderCell.textContent = columnName;
        newHeaderCell.style.backgroundColor = '#4CAF50';

        for (let i = 1; i < dataTable.rows.length; i++) {
            const newRowCell = dataTable.rows[i].insertCell(-1);

            // Create a dropdown for each cell
            createDropdown(newRowCell);
        }
    }

    function addNumericalRowToTable() {
        const newRow = dataTable.insertRow();

        // Create a dropdown for the Topic column
        const topicCell = newRow.insertCell(0);
        createDropdown2(topicCell, "Topic");

        // Create input fields for Group 1 and Group 2
        for (let i = 1; i <= dataTable.rows[0].cells.length - 1; i++) {
            const cell = newRow.insertCell(i);

            // Create input field for each cell
            createNumericalInputFields(cell);
        }
    }

    function createNumericalInputFields(cell) {
        // Clear the cell content
        cell.innerHTML = "";

        // Create input fields for numerical input
        const lowerBoundInput = document.createElement("input");
        lowerBoundInput.type = "number";
        lowerBoundInput.placeholder = "Lower Bound";
        cell.appendChild(lowerBoundInput);

        const upperBoundInput = document.createElement("input");
        upperBoundInput.type = "number";
        upperBoundInput.placeholder = "Upper Bound";
        cell.appendChild(upperBoundInput);
    }


    // Function to create a dropdown in a cell
    function createDropdown(cell, topic) {
        // Clear the cell content
        cell.innerHTML = "";

        // Create a container div to hold the dropdown and selected value
        const containerDiv = document.createElement("div");
        containerDiv.classList.add("dropdown-container");

        // Create a select element (dropdown)
        const dropdown = document.createElement("select");
        dropdown.classList.add("js-single");

        const csvHeader = "rank,finalWorth,category,personName,age,country,city,source,industries,countryOfCitizenship,organization,selfMade,status,gender,birthDate,lastName,firstName,title,date,state,residenceStateRegion,birthYear,birthMonth,birthDay,cpi_country,cpi_change_country,gdp_country,gross_tertiary_education_enrollment,gross_primary_education_enrollment_country,life_expectancy_country,tax_revenue_country_country,total_tax_rate_country,population_country,latitude_country,longitude_country";

        const topicOptions = ['category', 'personName', 'country', 'city', 'source', 'industries', 'countryOfCitizenship', 'organization', 'selfMade', 'status', 'gender', 'birthDate', 'lastName', 'firstName', 'title', 'date', 'state', 'residenceStateRegion'];
        const numericalOptions = ['rank', 'finalWorth', 'age', 'birthYear', 'birthMonth', 'birthDay', 'cpi_country', 'cpi_change_country', 'gdp_country', 'gross_tertiary_education_enrollment', 'gross_primary_education_enrollment_country', 'life_expectancy_country', 'tax_revenue_country_country', 'total_tax_rate_country', 'population_country', 'latitude_country', 'longitude_country']

        const headerArray = csvHeader.split(',');

        // Define the options based on the topic or use a default list
        const options = topic === "Topic" ? topicOptions : ["Option 1", "Option 2", "Option 3"];

        // Add options to the dropdown
        options.forEach(optionText => {
            const option = document.createElement("option");
            option.value = optionText;
            option.text = optionText;
            dropdown.appendChild(option);
        });

        // Append the dropdown to the container div
        containerDiv.appendChild(dropdown);

        // Create an element to display the selected value
        const selectedValueDisplay = document.createElement("div");
        selectedValueDisplay.classList.add("selected-value-display");

        // Set the default value for the selected value display
        selectedValueDisplay.textContent = `Selected: ${options[0] || 'None'}`;

        // Append the selected value display to the container div
        containerDiv.appendChild(selectedValueDisplay);

        // Append the container div to the cell
        cell.appendChild(containerDiv);

        // Initialize Select2 on the dropdown
        $(dropdown).select2();

        // Focus on the dropdown for better user experience
        dropdown.focus();

        // Update the selected value display when an option is selected
        $(dropdown).on("change", function (e) {
            const selectedValue = e.target.value;
            selectedValueDisplay.textContent = `Selected: ${selectedValue}`;

            const rowIdx = $(this).closest("tr").index();
            // If the dropdown is in a Group column, fetch and update options for the row
            if (topic == "Topic") {
                updateGroupDropdowns(rowIdx, selectedValue);
            }
        });
    }

    function createDropdown2(cell, topic) {
        // Clear the cell content
        cell.innerHTML = "";

        // Create a container div to hold the dropdown and selected value
        const containerDiv = document.createElement("div");
        containerDiv.classList.add("dropdown-container");

        // Create a select element (dropdown)
        const dropdown = document.createElement("select");
        dropdown.classList.add("js-single");

        const csvHeader = "rank,finalWorth,category,personName,age,country,city,source,industries,countryOfCitizenship,organization,selfMade,status,gender,birthDate,lastName,firstName,title,date,state,residenceStateRegion,birthYear,birthMonth,birthDay,cpi_country,cpi_change_country,gdp_country,gross_tertiary_education_enrollment,gross_primary_education_enrollment_country,life_expectancy_country,tax_revenue_country_country,total_tax_rate_country,population_country,latitude_country,longitude_country";

        const topicOptions = ['category', 'personName', 'country', 'city', 'source', 'industries', 'countryOfCitizenship', 'organization', 'selfMade', 'status', 'gender', 'birthDate', 'lastName', 'firstName', 'title', 'date', 'state', 'residenceStateRegion'];
        const numericalOptions = ['rank', 'finalWorth', 'age', 'birthYear', 'birthMonth', 'birthDay', 'cpi_country', 'cpi_change_country', 'gdp_country', 'gross_tertiary_education_enrollment', 'gross_primary_education_enrollment_country', 'life_expectancy_country', 'tax_revenue_country_country', 'total_tax_rate_country', 'population_country', 'latitude_country', 'longitude_country']

        const headerArray = csvHeader.split(',');

        // Define the options based on the topic or use a default list
        const options = topic === "Topic" ? numericalOptions : ["Option 1", "Option 2", "Option 3"];

        // Add options to the dropdown
        options.forEach(optionText => {
            const option = document.createElement("option");
            option.value = optionText;
            option.text = optionText;
            dropdown.appendChild(option);
        });

        // Append the dropdown to the container div
        containerDiv.appendChild(dropdown);

        // Create an element to display the selected value
        const selectedValueDisplay = document.createElement("div");
        selectedValueDisplay.classList.add("selected-value-display");

        // Set the default value for the selected value display
        selectedValueDisplay.textContent = `Selected: ${options[0] || 'None'}`;

        // Append the selected value display to the container div
        containerDiv.appendChild(selectedValueDisplay);

        // Append the container div to the cell
        cell.appendChild(containerDiv);

        // Initialize Select2 on the dropdown
        $(dropdown).select2();

        // Focus on the dropdown for better user experience
        dropdown.focus();

        // Update the selected value display when an option is selected
        $(dropdown).on("change", function (e) {
            const selectedValue = e.target.value;
            selectedValueDisplay.textContent = `Selected: ${selectedValue}`;

            const rowIdx = $(this).closest("tr").index();
            // If the dropdown is in a Group column, fetch and update options for the row
            if (topic == "Topic") {
                updateGroupDropdowns(rowIdx, selectedValue);
            }
        });
    }

    // Function to update Group 1 and Group 2 dropdowns based on the selected topic and value
    function updateGroupDropdowns(rowIdx, selectedValue) {

        // Replace this with your actual logic to fetch options from the database
        fetchOptionsForGroup(selectedValue).then(groupOptions => {
            // Find the cells in the row for Group 1 and Group 2
            const group1Cell = dataTable.rows[rowIdx].cells[1];
            const group2Cell = dataTable.rows[rowIdx].cells[2];

            // Update the options in the respective dropdowns
            updateDropdownOptions(group1Cell, groupOptions);
            updateDropdownOptions(group2Cell, groupOptions);
        });
    }

    // function updateGroupDropdowns(rowIdx, selectedValue) {

    //     // Replace this with your actual logic to fetch options from the database
    //     fetchOptionsForGroup(selectedValue).then(groupOptions => {

    //         for (let i = 1; i <= dataTable.rows[0].cells.length; i++){
    //             let gcell = dataTable.rows[rowIdx].cells[i];
    //             updateDropdownOptions(gcell, groupOptions);
    //         }
    //     });
    // }


    function fetchOptionsForGroup(selectedValue) {
        return fetchColumnValues('data/Billionaires_Statistics_Dataset.csv', selectedValue)
    }

    // Function to update dropdown options
    function updateDropdownOptions(cell, options) {
        const dropdown = cell.querySelector(".js-single");

        // Clear existing options
        dropdown.innerHTML = "";

        // Add new options
        options.forEach(optionText => {
            const option = document.createElement("option");
            option.value = optionText;
            option.text = optionText;
            dropdown.appendChild(option);
        });

        // Refresh Select2 to reflect the changes
        $(dropdown).select2("destroy");
        $(dropdown).select2();
    }

    async function fetchDataAndFilter(csvFilePath, filters) {
        try {
            const response = await fetch(csvFilePath);
            const data = await response.text();

            // Use Papa.parse to parse CSV data
            const parsedData = Papa.parse(data, { header: true });
            const rows = parsedData.data;
            const header = parsedData.meta.fields;

            // Apply filters
            const filteredData = rows.filter(row => {
                return filters.every(filter => {
                    const columnValue = row[filter.columnName] ? row[filter.columnName].trim() : '';

                    // Apply different types of filters
                    if (filter.type === 'equals') {
                        return columnValue === filter.value;
                    } else if (filter.type === 'between') {
                        const lowerBound = parseFloat(filter.lowerBound);
                        const upperBound = parseFloat(filter.upperBound);
                        const numericValue = parseFloat(columnValue);
                        return numericValue >= lowerBound && numericValue <= upperBound;
                    } else if (filter.type === 'date') {
                        const dateValue = new Date(columnValue);
                        const lowerDate = new Date(filter.lowerBound);
                        const upperDate = new Date(filter.upperBound);
                        return dateValue >= lowerDate && dateValue <= upperDate;
                    }

                    // Add more filter types as needed

                    return false;
                });
            });

            // Extract and print relevant information
            filteredData.forEach(row => {
                const rowData = Object.values(row).map(value => value.trim());
                console.log(rowData);
            });
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    async function fetchColumnValues(csvFilePath, columnName) {
        try {
            const response = await fetch(csvFilePath);
            const data = await response.text();

            // Use Papa.parse to parse CSV data
            const parsedData = Papa.parse(data, { header: true });
            const rows = parsedData.data;

            const columnValues = rows
                .filter(row => row[columnName] !== undefined)
                .map(row => row[columnName].trim());

            const unique = new Set(columnValues);
            const uniqueColumnValues = [...unique];

            return uniqueColumnValues;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
});
