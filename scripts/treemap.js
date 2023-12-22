import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Set up width and height 
var width = self.innerWidth * 0.6;
var height = self.innerHeight * 0.95;

// Create a color function
var color = d3.scaleOrdinal()
    .range(d3.schemeCategory10
        .map(function(c) { c = d3.rgb(c); c.opacity = 0.6; return c; }));

// Convert data to a tree format
var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(";")); });

// Create a treemap 
var treemap = d3.treemap()
    .size([width, height])
    .padding(1)
    .paddingTop(28)
    .round(true);

// Creating an SVG container for the treemap
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("font", "10px sans-serif");

// Create a group for the treemap
var group = svg.append("g");

// Add zoom
var zoom = d3.zoom()
    .scaleExtent([1, 100])
    .on("zoom", (event) => {
        group.attr('transform', event.transform);
    });

// Add zoom event listener to the svg container
svg.call(zoom);

// Load your data here
d3.csv("data/grouped_formatted_billionaires_dataset_2.csv").then(function(data) {

    // Create a root node from the data
    var root = stratify(data)
        .sum(function(d) { return d.value; })
        .sort(function(a, b) { return b.height - a.height || b.value - a.value; });


    treemap(root);

    // Variable to keep track of the current nodes being selected
    var flip = true;
    var first;
    var second;

    // Create the nodes and add them to the group
    var nodes = group.selectAll(".node")
        .data(root.leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

    // Create the rectangles for each node
    nodes.append("rect")
    //On hover, change the color of the rectangle and add a border
    .on("mouseover", function(d) { hover(d3.select(this)); })
    //On mouseout, reset the color of the rectangle and remove the border
    .on("mouseout", function(d) { 
        if (first && d3.select(this)._groups[0][0] == first._groups[0][0]) {
        }
        else if (second && d3.select(this)._groups[0][0] == second._groups[0][0]) {
        }
        else {
            reset(d3.select(this));
        }
    })
    //On click, change the color of the rectangle and add a border
    //Also update the bar charts with the new data
    .on("click", function(d) {
        var dd = d3.select(this)._groups[0][0].__data__;
        
        if (flip) {
            hover(d3.select(this));

            reset(first);
            first = d3.select(this);

            d3.select("#first")
            .text( dd.id.split(";")[1] + ": " + dd.id.split(";")[2]);
        }
        else {
            hover(d3.select(this));

            reset(second);
            second = d3.select(this);
            d3.select("#second")
            .text( dd.id.split(";")[1] + ": " + dd.id.split(";")[2]);
        }

        // Update the bar charts
        var new_color = function(d) { while (d.depth > 1) d = d.parent; return color(d.id); };
        updateBarChart(totalNetWorth, flip, +dd.value * 1000000, new_color(dd), "large");

        var gdpValue = dd.data.gdp_country.replace(/,/g, '').replace('$', '');
        updateBarChart(gdp, flip, +gdpValue, new_color(dd), "large");
        updateBarChart(taxRate, flip, +dd.data.tax_rate_country, new_color(dd), "percentage");
        updateBarChart(count, flip, +dd.data.amount_of_billionaires, new_color(dd));

        var percentValue = +(+dd.data.percentage).toPrecision(2) * 100 ;
        
        updateBarChart(perc, flip, +percentValue, new_color(dd), "percentage");

        flip = !flip;
    })
        .attr("id", function(d) { return "rect-" + d.id; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("fill", function(d) { while (d.depth > 1) d = d.parent; return color(d.id); })
        .style("cursor", "pointer");
        

    // Add country name to the rectangles
    nodes.append("text")
        .attr("x", (d) => { return (d.x1 - d.x0) / 100; })
        .attr("y", (d) => { return (d.x1 - d.x0) / 8; })
        .text(function(d) { 
            return d.id.substring(d.id.lastIndexOf(";") + 1); 
        }).style("font-size", calculateFontSize);
    
    // Add the net worth to the rectangles
    nodes.append("text")
    .attr("x", (d) => { return (d.x1 - d.x0) / 100; })
    .attr("y", (d) => { return (d.x1 - d.x0) / 4; })
    .text(function(d) { 

        return formatLargeNumber(+d.value  * 1000000) + "$"; 
    }).style("font-size", calculateFontSize);

    // Add the title for each industry
    group
    .selectAll("titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter()
    .append("g")
    .attr("class", "node")
    .append("text")
        .attr("x", function(d){ return d.x0})
        .attr("y", function(d){ return d.y0 + 25})
        .text(function(d){ return d.data.id.split(";")[1]})
        .attr("font-size", calculateTitleSize)
        .attr("fill",  function(d){ while (d.depth > 1) d = d.parent; return color(d.id); } )

});
//Helper functions

// Function to scale the font size of the country name
function calculateFontSize(d) {
    var rectWidth = d.x1 - d.x0;
    return (rectWidth / 11.00) + "px";
}

// Function to scale the font size of the title
function calculateTitleSize(d) {
    var rectWidth = d.x1 - d.x0;
    return Math.min((rectWidth / 11.00), 27) + "px";
}

// Function to reset the color and border of a rectangle
function reset(v) {
    if (v) {
        v.attr("fill", function(d) { while (d.depth > 1) d = d.parent; return color(d.id); });
        v.style("stroke-width", "0");
    }
}

// Function to change the color and add a border to a rectangle
function hover(v) {
    if (v) {
        v.attr("fill", function(d) { while (d.depth > 1) d = d.parent; return color(d.id).darker(1); });
        v.style("stroke-width", 2);
        v.attr("stroke", function(d) { while (d.depth > 1) d = d.parent; return color(d.id).darker(2); });
    }
}

// Function to format large numbers
function formatLargeNumber(number) {
    if (Math.abs(number) >= 1e12) {
        return (number / 1e12).toFixed(1) + 'T';
    } else if (Math.abs(number) >= 1e9) {
        return (number / 1e9).toFixed(1) + 'B';
    } else if (Math.abs(number) >= 1e6) {
        return (number / 1e6).toFixed(1) + 'M';
    } else if (Math.abs(number) >= 1e3) {
        return (number / 1e3).toFixed(1) + 'K';
    }
    return number.toString();
}

var barSize = 300;

// Create the bar charts
function createBarChart(title, num1, num2) {
    // Calculate total and normalize numbers to get percentages
    var total = num1 + num2;
    var firstPartWidth = (num1 / total) * barSize;
    var secondPartWidth = (num2 / total) * barSize;
    
    // Create the outer box
    var box = document.createElement('div');
    box.className = 'box';
  
    // Create and append the title div
    var titleDiv = document.createElement('div');
    titleDiv.textContent = title;
    box.appendChild(titleDiv);
  
    // Create the barchart container
    var barchart = document.createElement('div');
    barchart.className = 'barchart';
  
    // Create and append the first number
    var firstNum = document.createElement('div');
    firstNum.className = 'firstnum';
    firstNum.textContent = num1.toString();
    barchart.appendChild(firstNum);
  
    // Create and append the first part
    var firstPart = document.createElement('div');
    firstPart.className = 'firstpart';
    firstPart.style.width = firstPartWidth + 'px'; // Set width
    barchart.appendChild(firstPart);
  
    // Create and append the second part
    var secondPart = document.createElement('div');
    secondPart.className = 'secondpart';
    secondPart.style.width = secondPartWidth + 'px'; // Set width
    barchart.appendChild(secondPart);
  
    // Create and append the second number
    var secondNum = document.createElement('div');
    secondNum.className = 'secondnum';
    secondNum.textContent = num2.toString();
    barchart.appendChild(secondNum);
  
    // Append the barchart to the box
    box.appendChild(barchart);
  
    // Append the box to the body
    var mainDiv = document.getElementById('main');
    mainDiv.appendChild(box);

    return box;
  }
  
  // Update the bar charts
  function updateBarChart(chartDiv, partToUpdate, newValue, newColor, type = "") {

    // Find the number elements
    var firstNum = chartDiv.querySelector('.firstnum');
    var secondNum = chartDiv.querySelector('.secondnum');
    var firstPart = chartDiv.querySelector('.firstpart');
    var secondPart = chartDiv.querySelector('.secondpart');

    // Convert current values to integers
    var currentFirstValue = parseInt(firstNum.value);
    var currentSecondValue = parseInt(secondNum.value);


    var newValueString = newValue;

    // If the type is percentage, round the number and add a percentage sign
    if (type == "percentage") {
        newValueString = Math.round(newValue).toFixed(0) + "%";
    }
    // If the type is large, format the number and add a dollar sign
    if (type == "large") {
        newValueString = formatLargeNumber(+newValue) + "$";
    }


    if (partToUpdate) {
        // Update the first part
        firstNum.textContent = newValueString.toString();
        firstNum.value = newValue;
        currentFirstValue = newValue;
    } else {
        // Update the second part
        secondNum.textContent = newValueString.toString();
        secondNum.value = newValue;
        currentSecondValue = newValue;
    } 
    

    // Calculate and update widths based on new values
    var total = currentFirstValue + currentSecondValue;
    var firstPartWidth = (currentFirstValue / total) * barSize;
    var secondPartWidth = (currentSecondValue / total) * barSize;

    firstPart.style.width = firstPartWidth + 'px';
    secondPart.style.width = secondPartWidth + 'px';

    // Update the color of the changed part
    if (partToUpdate) {
        firstPart.style.backgroundColor = newColor;
    } else {
        secondPart.style.backgroundColor = newColor;
    }
}


// Initalize the bar charts
var totalNetWorth = createBarChart('Total net worth', 1, 1);
var gdp = createBarChart('GDP', 1, 1);
var taxRate = createBarChart('Total tax rate', 1, 1);
var count = createBarChart('Amount of billionaires', 1, 1);
var perc = createBarChart('Percentage of sector', 1, 1);

