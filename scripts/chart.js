// Sample data (replace this with your actual data)
import { onDataReady } from "./dataloader.js";
import { createTable } from "./searchlist.js";

var data = null;
var selected = null;

// Dropdown selection for the piechart
document.getElementById("piechartFeatures").addEventListener("change", function () {
    selected = this.value;
    switch (selected) {
        case "gender":
            createChart("gender", data, distributeByGender);
            break;
        case "self-made":
            createChart("self-made", data, distributeBySelfmade);
            break;
    }
});

// Dropdown selection for the barchart

document.getElementById("barchartFeatures").addEventListener("change", function () {
    selected = this.value;
    switch (selected) {
        case "category":
        case "countryOfCitizenship":
            createBarChart(selected);
            break;
    }
});

// When the DOMcontent is loaded create the table and the charts
document.addEventListener("DOMContentLoaded", function () {
    onDataReady((loadedData, headers) => {
        data = loadedData;
        createTable();
        createChart("gender", data, distributeByGender);
        createBarChart("category");
    });
});

// Create chart based on chosen item in dropdown
function createChart(title, data, distributionFunction) {
    const distribution = distributionFunction(data);
    if(title == "gender") {
        const newDistr = {
            "Male": distribution.M, 
            "Female": distribution.F
        }
        renderPieChart(title, newDistr);
    } else {
        renderPieChart(title, distribution);
    }

}

// Get data distribution by gender
function distributeByGender(data) {
    return data.reduce((acc, { gender }) => ({
        ...acc,
        [gender]: (acc[gender] || 0) + 1,
    }), {});
}

// Get data distribution by boolean value self-made
function distributeBySelfmade(data) {
    const selfmadeDistribution = data.reduce((acc, { selfMade }) => {
        acc[selfMade] = (acc[selfMade] || 0) + 1;
        return acc;
    }, {});

    return {
        "self-made": selfmadeDistribution["TRUE"],
        "inherited": selfmadeDistribution["FALSE"]
    };
}

// Create the bar chart based on dropdown selection
function createBarChart(feature) {
    const distribution = distributeByFeature(data, feature);
    const sortedData = sortData(distribution,feature);
    renderBarChart(sortedData, feature);
}

// Get data distribution by chosen dropdown value
function distributeByFeature(data, feature) {
    return data.reduce((acc, item) => {
        const key = item[feature];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

// Sorts by the dropdown selection value
function sortData(data, feature) {
    let res = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => ({ [feature]: key, count }));
    return res;
}

// Create the piechart SVG with D3
function renderPieChart(title, distribution) {
    // Set up the chart dimensions
    var margin = { top: 150, right: 100, bottom: 150, left: 100 },
    width = window.innerWidth * 0.6,
    height = window.innerHeight * 0.6,
    radius = Math.min(width, height) / 2;

    // Create an SVG element
    const svg = d3.select('#billionairesPieChart')
        .html('')
        .append('svg')
        .attr('viewBox', `0 0 ${width + margin.right + margin.left} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', 'translate(' + (width + margin.right + margin.left)/2 + ',' + (height + margin.top + margin.bottom)/2 +  ')');

    document.getElementById('pieChartTitle').innerText = title == "gender" ? 'Distribution of billionaires by ' + title : 'Distribution of billionaires by self-made vs. inherited wealth';

    // Create a color scale
    const color = d3.scaleOrdinal()
        .domain(Object.keys(distribution))
        .range(['#3498db', '#e74c3c']);

    const pie = d3.pie().value(d => d[1]);

    // Generate the pie chart
    const arcs = svg.selectAll('arc')
        .data(pie(Object.entries(distribution)))
        .enter()
        .append('g');

    arcs.append('path')
        .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
        .attr('fill', d => color(d.data[0]));

    // Add percentage labels to each slice
    arcs.append('text')
        .attr('transform', d => {
            const pos = d3.arc().innerRadius(radius).outerRadius(radius + 60).centroid(d);
            return 'translate(' + pos + ')';
        })
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .text(d => (d.data[1] / d3.sum(Object.values(distribution)) * 100).toFixed(2) + '%');

    // Create legend
    const legend = svg.selectAll('.legend')
        .data(Object.keys(distribution))
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => 'translate(100,' + (i * 20) + ')');

    legend.append('rect')
        .attr('x', width * 0.26)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => color(d));

    legend.append('text')
        .attr('x', width * 0.25) // Adjust the x-coordinate to move labels to the right
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end') // Adjust text-anchor to 'start'
        .text(d => d);
}

// Create the barchart SVG with D3
function renderBarChart(data, feature) {
    // Set the dimensions and margins of the graph
    var margin = { top: 150, right: 100, bottom: 150, left: 100 },
        width = window.innerWidth * 0.6,
        height = window.innerHeight * 0.6 ;

    var svg = d3.select('#billionairesBarChart')
        .html('') // Clear the existing content
        .append('svg')
        .attr('viewBox', `0 0 ${width + margin.right + margin.left} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    document.getElementById('barChartTitle').innerText = "Billionaires Distribution by " + (feature == "category" ? "Industry" : "Country");

    var x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return feature == "category" ? d.category : d.countryOfCitizenship; }))
        .padding(0.2);

    // Add country/category names on x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-5,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.count; })])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "12px");

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Tooltip when hovering over the bar
    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("padding", "8px");

    // Tooltip activation when hovering over the bar
    svg.selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(feature == "category" ? d.category : d.countryOfCitizenship); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.count); })
        .attr("height", function (d) { return height - y(d.count); })
        .attr("fill", (d, i) => color(i))
        .on("mouseover", function (event, d) {
            tooltipDiv.html(`<div>${feature == "category" ? "Category: " + d.category : "Country: " + d.countryOfCitizenship}</div><div>Billionaires: ${d.count}</div>`)
                .style("visibility", "visible");
        })
        .on("mousemove", function (event) {
            tooltipDiv.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltipDiv.style("visibility", "hidden");
        });
}



