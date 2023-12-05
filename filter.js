// filter.js

document.addEventListener("DOMContentLoaded", function () {
    // Load CSV data from file
    Papa.parse("data/Billionaires_Statistics_Dataset.csv", {
        download: true,
        header: true,
        complete: function (results) {
            const csvData = results.data;

            // Get unique column names from the CSV data
            const columnNames = Object.keys(csvData[0]);

            // Create filter sliders for div3 and div4
            createFilterControls("filterDiv3", columnNames, "div3", csvData);
            createFilterControls("filterDiv4", columnNames, "div4", csvData);

            // Add event listeners for updating filters
            document.getElementById("filterDiv3").addEventListener("input", updateFilters);
            document.getElementById("filterDiv4").addEventListener("input", updateFilters);
        }
    });
});

function createFilterControls(containerId, columnNames, divId, csvData) {
    const container = document.getElementById(containerId);

    var numerical = ['rank', 'age', 'finalWorth', 'birthYear', 'birthMonth', 'birthDay', 'cpi_country', 'cpi_change_country', 'gdp_country',
        'gross_tertiary_education_enrollment', 'gross_primary_education_enrollment_country', 'life_expectancy_country',
        'tax_revenue_country_country', 'total_tax_rate_country', 'population_country', 'latitude_country', 'longitude_country'];
    //var numerical = ['rank', 'age'];

    const csv_file = "data/Billionaires_Statistics_Dataset.csv"

    columnNames.forEach(column => {
        
        //const isNumerical = isColumnNumerical(csvData, column);
        const controlContainer = document.createElement("div");

        if (numerical.indexOf(column) != -1) {

            let largestVal = Number.MIN_SAFE_INTEGER;
            let smallestVal = Number.MAX_SAFE_INTEGER;

            fetch(csv_file)
                .then(response => response.text())
                .then(csvData => {
                    const rows = csvData.split('\n').map(row => row.split(','));

                    const columnIndex = rows[0].indexOf(column);
                    //console.log(column)
                    //console.log(columnIndex)
                    for (let i = 1; i < rows.length; i++) {
                        const columnValue = parseFloat(rows[i][columnIndex]);

                        if (!isNaN(columnValue)) {
                            largestVal = Math.max(largestVal, columnValue);
                            smallestVal = Math.min(smallestVal, columnValue);
                        }
                    }

                    controlContainer.innerHTML = `
                <label for="${column}">${column}:</label>
                <input type="range" id="${column}Min" name="${column}" min="${smallestVal}" max="${largestVal}" value="${smallestVal}">
                <input type="range" id="${column}Max" name="${column}" min="${smallestVal}" max="${largestVal}" value="${largestVal}">
                <span id="${column}MinValue">${smallestVal}</span>
                <span id="${column}MaxValue">${largestVal}</span>
            `;

                    // Add event listeners to the range inputs
                    const minRangeInput = controlContainer.querySelector(`#${column}Min`);
                    const maxRangeInput = controlContainer.querySelector(`#${column}Max`);
                    const minSpan = controlContainer.querySelector(`#${column}MinValue`);
                    const maxSpan = controlContainer.querySelector(`#${column}MaxValue`);

                    minRangeInput.addEventListener('input', function () {
                        minSpan.textContent = minRangeInput.value;
                    });

                    maxRangeInput.addEventListener('input', function () {
                        maxSpan.textContent = maxRangeInput.value;
                    });
                })
                .catch(error => console.error('Error loading the CSV file:', error));
            
        } else {
            const uniqueValues = getUniqueValues(csvData, column);
            console.log(column)

            const dropdownContainer = document.createElement("div");
            dropdownContainer.className = "dropdown";

            const dropdownButton = document.createElement("button");
            dropdownButton.textContent = column;
            dropdownButton.className = "dropdown-btn";

            const filterInput = document.createElement("input");
            filterInput.type = "text";
            filterInput.placeholder = "Filter...";
            filterInput.className = "filter-input";

            const optionsContainer = document.createElement("div");
            optionsContainer.className = "filter-options";
            optionsContainer.style.display = "none";

            uniqueValues.forEach(value => {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `${column}-${value}`;
                checkbox.value = value;
                checkbox.checked = true; // default: all values selected

                const label = document.createElement("label");
                label.htmlFor = `${column}-${value}`;
                label.textContent = value;

                optionsContainer.appendChild(checkbox);
                optionsContainer.appendChild(label);
            });

            dropdownContainer.appendChild(dropdownButton);
            dropdownContainer.appendChild(filterInput);
            dropdownContainer.appendChild(optionsContainer);
            controlContainer.appendChild(dropdownContainer);

            // Toggle options visibility when clicking the button
            dropdownButton.addEventListener('click', function () {
                if (optionsContainer.style.display === "none") {
                    optionsContainer.style.display = "block";
                } else {
                    optionsContainer.style.display = "none";
                }
            });

            // Filter options based on input value
            filterInput.addEventListener('input', function () {
                const filterValue = filterInput.value.toLowerCase();
                const options = optionsContainer.querySelectorAll('label');

                options.forEach(option => {
                    const optionText = option.textContent.toLowerCase();
                    option.style.display = optionText.includes(filterValue) ? 'block' : 'none';
                });
            });
        }
        container.appendChild(controlContainer);
    });
}

function updateFilters() {
    const filtersDiv3 = getFilters("filterDiv3");
    const filtersDiv4 = getFilters("filterDiv4");

    // Apply filters to the data
    const filteredDataDiv3 = filterData(csvData, filtersDiv3);
    const filteredDataDiv4 = filterData(csvData, filtersDiv4);

    // Display filtered data in div3 and div4
    displayFilteredData(filteredDataDiv3, "div3");
    displayFilteredData(filteredDataDiv4, "div4");

    // Display comparison in div5
    displayComparison(filteredDataDiv3, filteredDataDiv4);
}


function getFilters(containerId) {
    const filters = {};
    const controls = document.getElementById(containerId).querySelectorAll("input[type='range'], input[type='checkbox']");

    controls.forEach(control => {
        const columnName = control.id;
        const value = control.type === "range" ? parseFloat(control.value) : control.checked;

        if (columnName.includes("-")) {
            const [column, option] = columnName.split("-");
            if (!filters[column]) {
                filters[column] = [];
            }
            if (value) {
                filters[column].push(option);
            }
        } else {
            filters[columnName] = value;
        }
    });

    return filters;
}

function getUniqueValues(data, column) {
    return [...new Set(data.map(item => item[column]))];
}


