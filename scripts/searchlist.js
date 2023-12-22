import { onDataReady } from "./dataloader.js";

function createTable() {
  
      // When the data has been read from the csv file do this.
      onDataReady((loadedData, headers) => {
        const defaultHeaders = ["Country", "numberOfBillionaires", "topCategories", "GDP", "totalTaxRate"];
        
        // Add arrow icon above the headers to indicate which "way" it is sorting the rows
        function createArrowIcon() {
          const arrowIcon = document.createElement("span");
          arrowIcon.classList.add("arrow-icon");
          return arrowIcon;
        }
  
        // Change arrow icon above the headers (up or down)
        function toggleArrow(th, isAscending) {
          document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove("arrow-up", "arrow-down", "selectedheader");
          });
  
          if (isAscending) {
            th.classList.add("arrow-up", "selectedheader");
          } else {
            th.classList.add("arrow-down", "selectedheader");
          }
        }

        var data = loadedData;
  
        const tsearch = document.getElementById("myInput");
        tsearch.addEventListener("keydown", searchTable)
        const thead = document.getElementById("data-table").getElementsByTagName("thead")[0];
        const tbody = document.getElementById("data-table").getElementsByTagName("tbody")[0];
  
        // Clear existing table content
        thead.innerHTML = "";
        tbody.innerHTML = "";
        
        // Group data set by country
        data = createNewDataset(data);
        
        defaultHeaders.forEach(headerText => {
          const th = document.createElement("th");
          if(headerText == "totalTaxRate") {
            headerText = "Total Tax Rate"
          } else if (headerText == "topCategories") {
            headerText = "Top Industries"
          } else if (headerText == "numberOfBillionaires") {
            headerText = "Number of Billionaires"
          }
          th.textContent = headerText;
          th.classList.add("sortable");
          th.appendChild(createArrowIcon()); // Add arrow icon to each header
          th.addEventListener("click", function () {
            toggleArrow(this, !this.classList.contains("arrow-up"));
            sortTable(headerText);
          });
          thead.appendChild(th);
        });

        // Populate table with data
        data.forEach(rowData => {
          const row = tbody.insertRow();
          defaultHeaders.forEach(headerText => {
              const cell = row.insertCell();
              cell.textContent = rowData[headerText];
              // Check if the content is numerical and align to the right
              if (headerText == "GDP" || headerText == "numberOfBillionaires" || headerText == "totalTaxRate") {
                  cell.style.textAlign = 'right';
              }
          });
        });
  
        // Get the table element
        var table = document.getElementById("data-table");
        const rows = table.getElementsByTagName("tr");
  
        // Add a click event listener to the table
        for (let i = 0; i < rows.length; i++) {
          rows[i].addEventListener("click", function (e) {
            // Remove the "selected" class from all rows
            for (let j = 0; j < rows.length; j++) {
              if (i !== j) {
                rows[j].classList.remove("selected");
              }
            }

            // Toggle the "selected" class on the clicked row
            rows[i].classList.toggle("selected");

            // Get the selected row
            const selectedRow = table.querySelector(".selected");
          });
        }
      });
      }
      
    // Search for the country provided by the user in the table.
    function searchTable() {
      const input = document.getElementById("myInput").value.toUpperCase();
      const table = document.getElementById("data-table");
      const rows = table.getElementsByTagName("tr");
  
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let found = false;
  
        for (let j = 0; j < cells.length; j++) {
          const cellText = cells[0].textContent.toUpperCase();
          if (cellText.includes(input)) {
            found = true;
            break;
          }
        }

        rows[i].style.display = found ? "" : "none";
      }
    }
    
    // Sort the table by the column that is clicked.
    function sortTable(headerText) {
      const table = document.getElementById("data-table");
      const rows = Array.from(table.getElementsByTagName("tr"));
      const headerIndex = Array.from(table.getElementsByTagName("th")).findIndex(th => th.textContent === headerText);
      const isNumeric = !isNaN(parseFloat(rows[1].cells[headerIndex].textContent));
    
      // Check if the current sorting order is ascending or descending
      const currentOrder = table.getAttribute("data-sort-order") || 'desc';
      const sortOrder = (currentOrder === 'asc') ? 'desc' : 'asc';
    
      table.setAttribute("data-sort-order", sortOrder);
    
      rows.sort((a, b) => {
        const aValue = isNumeric ? parseFloat(a.cells[headerIndex].textContent) : a.cells[headerIndex].textContent;
        const bValue = isNumeric ? parseFloat(b.cells[headerIndex].textContent) : b.cells[headerIndex].textContent;
    
        const comparison = (aValue < bValue) ? -1 : (aValue > bValue) ? 1 : 0;
        
        // Adjust the comparison based on the sorting order
        return (sortOrder === 'asc') ? comparison : -comparison;
      });
    
      // Update the table with the sorted rows
      rows.forEach(row => table.appendChild(row));
    }
  
    // Group the dataset by country of citizenship
    function createNewDataset(dataset) {
      const newDataset = [];
    
      const groupedData = {};
    
      dataset.forEach(entry => {
        const country = entry.countryOfCitizenship;
    
        if (!groupedData[country]) {
          groupedData[country] = {
            count: 0,
            GDP: entry.gdp_country,
            totalTaxRate: entry.total_tax_rate_country,
            topCategories: {},
          };
        }
    
        // Increment the count for the country
        groupedData[country].count++;
    
        // Count the categories for the country
        const category = entry.category;
        if (!groupedData[country].topCategories[category]) {
          groupedData[country].topCategories[category] = 1;
        } else {
          groupedData[country].topCategories[category]++;
        }
      });
    
      // Build the new dataset
      for (const country in groupedData) {
        const entry = {
          Country: country,
          numberOfBillionaires: groupedData[country].count,
          GDP: groupedData[country].GDP == "" ? "N/A" : groupedData[country].GDP,
          totalTaxRate: groupedData[country].totalTaxRate == "" ? "N/A" : + groupedData[country].totalTaxRate + "%",
          topCategories: Object.entries(groupedData[country].topCategories)
            .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
            .slice(0, 3)
            .map(([category, count]) => (category)),
        };
    
        newDataset.push(entry);
      }
    
      return newDataset;
    }

export {createTable}