import { onDataReady } from "./dataloader.js";

function createTable() {
    var selectedRows = [];

      onDataReady((loadedData, headers) => {
        const defaultHeaders = ["rank", "net worth", "category", "name", "age", "country", "city", "source", "organization"];
  
        function createArrowIcon() {
          const arrowIcon = document.createElement("span");
          arrowIcon.classList.add("arrow-icon");
          return arrowIcon;
        }
  
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
        const data = loadedData;
  
        const tsearch = document.getElementById("myInput");
        tsearch.addEventListener("keydown", (e) => searchTable(e))
        const thead = document.getElementById("data-table").getElementsByTagName("thead")[0];
        const tbody = document.getElementById("data-table").getElementsByTagName("tbody")[0];
  
        // Clear existing table content
        thead.innerHTML = "";
        tbody.innerHTML = "";
  
        defaultHeaders.forEach(headerText => {
          const th = document.createElement("th");
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
          headers.forEach(headerText => {
            if(defaultHeaders.includes(headerText)) {
              const cell = row.insertCell();
              cell.textContent = rowData[headerText];
            }
          });
        });
  
        // Get the table element
        var table = document.getElementById("data-table");
        const rows = table.getElementsByTagName("tr");
  
        // Add a click event listener to the table
        for (let i = 0; i < rows.length; i++) {
          rows[i].addEventListener("click", function(e) {
            // Check if the clicked element is a checkbox with the class "row-checkbox"
            console.log("clicked")
  
            // Toggle the "selected" class on the parent row
            rows[i].classList.toggle("selected");
  
            // Get all selected rows
            var selectedRows = table.querySelectorAll(".selected");
  
            // Compare values of the selected rows
            if (selectedRows.length > 1) {
              console.log(selectedRows)
            }
          });
        }
      });
      }
    
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
  
    function toggleArrow(th, isAscending) {
      th.classList.remove("arrow-up", "arrow-down");
  
      // Add the appropriate arrow class based on the sorting order
      if (isAscending) {
        th.classList.add("arrow-up");
      } else {
        th.classList.add("arrow-down");
      }
    }

export {createTable}