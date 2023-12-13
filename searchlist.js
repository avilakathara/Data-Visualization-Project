document.addEventListener("DOMContentLoaded", function () {
    // Fetch the CSV file
    fetch("data/Billionaires_Statistics_Dataset.csv")
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            const defaultHeaders = ["rank", "net worth", "category", "name", "age", "country", "city", "source"];

            function createArrowIcon() {
              const arrowIcon = document.createElement("span");
              arrowIcon.classList.add("arrow-icon");
              return arrowIcon;
            }

            function toggleArrow(th, isAscending) {
              // Remove existing arrow classes from all headers
              document.querySelectorAll('.sortable').forEach(header => {
                header.classList.remove("arrow-up", "arrow-down", "selected");
              });

              // Add the appropriate arrow class based on the sorting order
              if (isAscending) {
                th.classList.add("arrow-up", "selected");
              } else {
                th.classList.add("arrow-down", "selected");
              }
            }
            const headers = results.meta.fields;
            const data = results.data;
  
            const tsearch = document.getElementById("myInput");
            tsearch.addEventListener("keydown", (e) => searchTable(e))
            const thead = document.getElementById("data-table").getElementsByTagName("thead")[0];
            const tbody = document.getElementById("data-table").getElementsByTagName("tbody")[0];
  
            // Clear existing table content
            thead.innerHTML = "";
            tbody.innerHTML = "";
  
            // Populate table headers with arrow icons
            defaultHeaders.forEach(headerText => {
              const th = document.createElement("th");
              th.textContent = headerText;
              th.classList.add("sortable");
              th.appendChild(createArrowIcon()); // Add arrow icon to each header
              th.addEventListener("click", function () {
                toggleArrow(this, !this.classList.contains("arrow-up"));
                // Call the sorting function
                sortTable(headerText);
              });
              thead.appendChild(th);
            });
  
            // Populate table with data
            data.forEach(rowData => {
              const row = tbody.insertRow();
              headers.forEach(headerText => {
                if(defaultHeaders.includes(headerText)) {
                  const cell = row.insertCell();
                  cell.textContent = rowData[headerText];
                }
              });
            });
          },
          error: function(error) {
            console.error("Error parsing CSV:", error.message);
          }
        });
      })
      .catch(error => console.error("Error fetching CSV:", error));
  });
  
  function removeColumn(headerToRemove) {
    const headerIndex = headers.indexOf(headerToRemove);

    if (headerIndex > -1) {
      headers.splice(headerIndex, 1);

      data.forEach(rowData => {
        delete rowData[headerToRemove];
      });

      // Update the table with the modified data
      updateTable();
    }
  }

  function searchTable(event) {
    if (event.key === 'Enter') {
      const input = document.getElementById("myInput").value.toUpperCase();
      const table = document.getElementById("data-table");
      const rows = table.getElementsByTagName("tr");
  
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let found = false;
  
        for (let j = 0; j < cells.length; j++) {
          const cellText = cells[3].textContent.toUpperCase();
          if (cellText.includes(input)) {
            found = true;
            break;
          }
        }
  
        rows[i].style.display = found ? "" : "none";
      }
    }
  }
  
  function sortTable(headerText) {
    const table = document.getElementById("data-table");
    const rows = Array.from(table.getElementsByTagName("tr"));
    const headerIndex = Array.from(table.getElementsByTagName("th")).findIndex(th => th.textContent === headerText);
    const isNumeric = !isNaN(parseFloat(rows[1].cells[headerIndex].textContent));
  
    // Check if the current sorting order is ascending or descending
    const currentOrder = table.getAttribute("data-sort-order") || 'desc';
    const sortOrder = (currentOrder === 'asc') ? 'desc' : 'asc';
  
    // Update the data-sort-order attribute for the next click
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

  // Function to toggle arrow icons
  function toggleArrow(th, isAscending) {
    // Remove existing arrow classes
    th.classList.remove("arrow-up", "arrow-down");

    // Add the appropriate arrow class based on the sorting order
    if (isAscending) {
      th.classList.add("arrow-up");
    } else {
      th.classList.add("arrow-down");
    }
  }
  