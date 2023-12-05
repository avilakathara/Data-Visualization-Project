document.addEventListener("DOMContentLoaded", function () {
    // Fetch the CSV file
    fetch("data/Billionaires_Statistics_Dataset.csv")
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            const headers = results.meta.fields;
            const data = results.data;
  
            const tsearch = document.getElementById("myInput");
            tsearch.addEventListener("keydown", (e) => searchTable(e))
            const thead = document.getElementById("data-table").getElementsByTagName("thead")[0];
            const tbody = document.getElementById("data-table").getElementsByTagName("tbody")[0];
  
            // Clear existing table content
            thead.innerHTML = "";
            tbody.innerHTML = "";
  
            // Populate table headers
            const headerRow = thead.insertRow();
            headers.forEach(headerText => {
              const th = document.createElement("th");
              th.textContent = headerText;
              th.classList.add("sortable");
              th.addEventListener("click", () => sortTable(headerText));
              headerRow.appendChild(th);
            });
  
            // Populate table with data
            data.forEach(rowData => {
              const row = tbody.insertRow();
              headers.forEach(headerText => {
                const cell = row.insertCell();
                cell.textContent = rowData[headerText];
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
  
  function searchTable(event) {
    if (event.key === 'Enter') {
      const input = document.getElementById("myInput").value.toUpperCase();
      const table = document.getElementById("data-table");
      const rows = table.getElementsByTagName("tr");
  
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let found = false;
  
        for (let j = 0; j < cells.length; j++) {
          const cellText = cells[j].textContent.toUpperCase();
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
  
    // Extracting the header row from the array
    const headerRow = rows.shift();
  
    // Check if the current sorting order is ascending or descending
    const currentOrder = table.getAttribute("data-sort-order") || 'asc';
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
  
    // Inserting the header row back to the beginning
    rows.unshift(headerRow);
  
    // Update the table with the sorted rows
    rows.forEach(row => table.appendChild(row));
  }
  