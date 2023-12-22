import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var width = self.innerWidth * 0.6;
var height = self.innerHeight * 0.95;

var format = d3.format(",d");

var color = d3.scaleOrdinal()
    .range(d3.schemeCategory10
        .map(function(c) { c = d3.rgb(c); c.opacity = 0.6; return c; }));

var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(";")); });

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

    function calculateFontSize(d) {
        var rectWidth = d.x1 - d.x0;
        return (rectWidth / 11.00) + "px";
    }

    function calculateTitleSize(d) {
        var rectWidth = d.x1 - d.x0;
        return Math.min((rectWidth / 11.00), 27) + "px";
    }

    var root = stratify(data)
        .sum(function(d) { return d.value; })
        .sort(function(a, b) { return b.height - a.height || b.value - a.value; });


    var top100 = 50000
    treemap(root);

    var flip = true;

    var first;
    var second;

    var nodes = group.selectAll(".node")
        .data(root.leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
        // add zoom
        
        ;



    nodes.append("rect")
    .on("mouseover", function(d) { hover(d3.select(this)); })
    .on("mouseout", function(d) { 
        
        if (first && d3.select(this)._groups[0][0] == first._groups[0][0]) {
        }
        else if (second && d3.select(this)._groups[0][0] == second._groups[0][0]) {
        }
        else {
            reset(d3.select(this));
        }

    })
    .on("click", function(d) {
        var dd = d3.select(this)._groups[0][0].__data__;

        console.log(dd)
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

        // convert $2,715,518,274,227 to 2715518274227
        // convert to number
        
        var new_color = function(d) { while (d.depth > 1) d = d.parent; return color(d.id); };
        updateBarChart(totalNetWorth, flip, dd.value * 1000000, new_color(dd), "large");

        var gdpValue = dd.data.gdp_country.replace(/,/g, '').replace('$', '');
        updateBarChart(gdp, flip, +gdpValue, new_color(dd), "large");
        updateBarChart(taxRate, flip, +dd.data.tax_rate_country, new_color(dd), "percentage");
        updateBarChart(count, flip, +dd.data.amount_of_billionaires, new_color(dd));

        // convert 0.008438 to 0.84
        // KEEP 2 DECIMAL PLACES
        var percentValue = +(+dd.data.percentage).toPrecision(2) * 100 ;
        
        updateBarChart(perc, flip, +percentValue, new_color(dd), "percentage");

        flip = !flip;
    })
        .attr("id", function(d) { return "rect-" + d.id; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("fill", function(d) { while (d.depth > 1) d = d.parent; return color(d.id); });
        


    nodes.append("text")
        .attr("x", (d) => { return (d.x1 - d.x0) / 100; })
        .attr("y", (d) => { return (d.x1 - d.x0) / 8; })
        .text(function(d) { 
                // if (d.value < top100)
                //     return "";
    
            return d.id.substring(d.id.lastIndexOf(";") + 1).split(/(?=[A-Z][^A-Z])/g); 
        }).style("font-size", calculateFontSize);

    nodes.append("text")
    .attr("x", (d) => { return (d.x1 - d.x0) / 100; })
    .attr("y", (d) => { return (d.x1 - d.x0) / 4; })
    .text(function(d) { 

        return formatLargeNumber(+d.value  * 1000000) + "$"; 
    }).style("font-size", calculateFontSize);

    // Add title for the 3 groups
    group
    .selectAll("titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter()
    .append("g")
    .attr("class", "node")
    // .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
    .append("text")
        .attr("x", function(d){ return d.x0})
        .attr("y", function(d){ return d.y0 + 25})
        .text(function(d){ return d.data.id.split(";")[1]})
        .attr("font-size", calculateTitleSize)
        .attr("fill",  function(d){ while (d.depth > 1) d = d.parent; return color(d.id); } )

});



function reset(v) {
    if (v) {
        v.attr("fill", function(d) { while (d.depth > 1) d = d.parent; return color(d.id); });
        v.style("stroke-width", "0");
    }
}

function hover(v) {
    if (v) {
        v.attr("fill", function(d) { while (d.depth > 1) d = d.parent; return color(d.id).darker(1); });
        v.style("stroke-width", 2);
        v.attr("stroke", function(d) { while (d.depth > 1) d = d.parent; return color(d.id).darker(2); });
    }
}


var barSize = 300;
  
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
  
  function updateBarChart(chartDiv, partToUpdate, newValue, newColor, type = "") {
    if (!chartDiv) {
        console.error('Bar chart div not provided or not found.');
        return;
    }

    // Find the number elements
    var firstNum = chartDiv.querySelector('.firstnum');
    var secondNum = chartDiv.querySelector('.secondnum');
    var firstPart = chartDiv.querySelector('.firstpart');
    var secondPart = chartDiv.querySelector('.secondpart');

    // Convert current values to integers
    var currentFirstValue = parseInt(firstNum.textContent);
    var currentSecondValue = parseInt(secondNum.textContent);

    if (type == "percentage") {
        newValue = newValue + "%";
    }

    if (type == "large") {
        newValue = formatLargeNumber(newValue) + "$";
    }


    if (partToUpdate) {
        // Update the first part
        firstNum.textContent = newValue.toString();
        currentFirstValue = newValue;
    } else {
        // Update the second part
        secondNum.textContent = newValue.toString();
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



  var totalNetWorth = createBarChart('Total net worth', 1, 1);
  var gdp = createBarChart('GDP', 1, 1);
  var taxRate = createBarChart('Tax rate', 1, 1);
  var count = createBarChart('Amount of billionaires', 1, 1);
  var perc = createBarChart('Percentage of sector', 1, 1);

