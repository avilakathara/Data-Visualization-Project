import * as d3 from "https://cdn.jsdelivr.net/npm/d3@4/+esm";

var width = self.innerWidth * 0.6
var height = self.innerHeight * 0.95;

var format = d3.format(",d");

var color = d3.scaleOrdinal()   
    .range(d3.schemeCategory10
        .map(function(c) { c = d3.rgb(c); c.opacity = 0.6; return c; }));

var stratify = d3.stratify()    
    .parentId(function(d) {return d.id.substring(0, d.id.lastIndexOf(";")); });

var treemap = d3.treemap()
    .size([width, height])
    .padding(1)
    
    // .paddingInner(3)
    // .paddingTop(20)      
    .round(true);

d3.csv("data/grouped_formatted_billionaires_dataset_2.csv", type, function(error, data) {
if (error) throw error;


var root = stratify(data)
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.height - a.height || b.value - a.value; });


// var top100 = 16700
var top100 = 50000

treemap(root);

var flip = true;

var first;
var second;

d3.select("body")
    .selectAll(".node")
    .data(root.leaves())
    .enter().append("div")
    .attr("class", "node")
    .attr("title", function(d) { return d.id + "\n" + format(d.value); })
    .style("left", function(d) { return d.x0 + "px"; })
    .style("top", function(d) { return d.y0 + "px"; })
    .style("width", function(d) { return d.x1 - d.x0 + "px"; })
    .style("height", function(d) { return d.y1 - d.y0 + "px"; })
    .style("background", function(d) { while (d.depth > 1) d = d.parent; return color(d.id); })
    .on("click", function(d) {

        // category = d.id.split(";")[1];
        // country = d.id.split(";")[2];

        if (flip) {
            hover(d3.select(this));

            reset(first);
            first = d3.select(this);

            d3.select("#first")
            .text( d.id.split(";")[1] + ": " + d.id.split(";")[2]);
            

            
        }
        else {
            hover(d3.select(this));

            reset(second);
            second = d3.select(this);
            d3.select("#second")
            .text( d.id.split(";")[1] + ": " + d.id.split(";")[2]);
        }

        // convert $2,715,518,274,227 to 2715518274227
        // convert to number
        
        var new_color = function(d) { while (d.depth > 1) d = d.parent; return color(d.id); };
        updateBarChart(totalNetWorth, flip, d.value, new_color(d));

        var gdpValue = d.data.gdp_country.replace(/,/g, '').replace('$', '');
        updateBarChart(gdp, flip, +gdpValue, new_color(d));
        updateBarChart(taxRate, flip, +d.data.tax_rate_country, new_color(d));
        updateBarChart(count, flip, +d.data.amount_of_billionaires, new_color(d));

        // convert 0.008438 to 0.84
        // KEEP 2 DECIMAL PLACES
        var percentValue = +(+d.data.percentage).toPrecision(2) * 100 ;
        
        updateBarChart(perc, flip, +percentValue, new_color(d));

        flip = !flip;
    })
    .on("mouseover", function(d) {
        // make background color darker
       hover(d3.select(this));
        // apply on div id="info"
        d3.select("#info")
            .text(d.id + "\t" + format(d.value) + "\t" + d.data.gdp_country);
    })
    .on("mouseout", function(d) {
        if (first && d3.select(this)._groups[0][0] == first._groups[0][0]) {
        }
        else if (second && d3.select(this)._groups[0][0] == second._groups[0][0]) {
        }
        else {
            reset(d3.select(this));
        }
    })
    .append("div")
    .attr("class", "node-label")
    .text(function(d) { 
        if (d.value < top100)
            return "";

        return d.id.substring(d.id.lastIndexOf(";") + 1).split(/(?=[A-Z][^A-Z])/g).join("\n"); 
    })
    .append("div")
    .attr("class", "node-value")
    .text(function(d) { 
        if (d.value < top100)
            return "";
        return format(d.value); 
    });

    
    
});

function reset(v) {
    if (v) {
        v.style("background", function(d) { while (d.depth > 1) d = d.parent; return color(d.id); });
        v.style("border", "none");
    }
}

function hover(v) {
    if (v) {
        v.style("background", function(d) { while (d.depth > 1) d = d.parent; return color(d.id).darker(1); });
        v.style("border", "solid");
        v.style("border-color", function(d) { while (d.depth > 1) d = d.parent; return color(d.id).darker(2); });
    }
}

function type(d) {
d.value = +d.value;
return d;
}

var barSize = 200;
  
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
  
  function updateBarChart(chartDiv, partToUpdate, newValue, newColor) {
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
    console.log(total);
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

  var totalNetWorth = createBarChart('Total net worth', 82333, 18);
  var gdp = createBarChart('GDP', 82, 18);
  var taxRate = createBarChart('Tax rate', 1182, 18);
  var count = createBarChart('Amount of billionaires', 1, 18);
  var perc = createBarChart('Percentage of sector', 1, 18);
