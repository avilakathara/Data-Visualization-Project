// Sample data (replace this with your actual data)
import { onDataReady } from "./dataloader.js";
import { createTable } from "./searchlist.js";

var data = null;
var numberOfRows = 5;
var selected = null;

document.getElementById("features").addEventListener("change", function () {
    numberOfRows = 5;
    selected = this.value;
    document.getElementById("expandCountries").style.display = "none"
    document.getElementById("resetCountries").style.display = "none"
    switch (selected) {
        case "gender":
            createChart("gender", data, distributeByGender);
            break;
        case "self-made":
            createChart("self-made", data, distributeBySelfmade);
            break;
        case "category":
        case "countryOfCitizenship":
            document.getElementById("expandCountries").style.display = ""
            document.getElementById("resetCountries").style.display = ""
            createBarChart(selected);
            break;
    }
});

document.getElementById("expandCountries").addEventListener("click", function () {
    numberOfRows += 5;
    createBarChart(selected);
});

document.getElementById("resetCountries").addEventListener("click", function () {
    numberOfRows = 5;
    createBarChart(selected);
});

document.addEventListener("DOMContentLoaded", function () {
    onDataReady((loadedData, headers) => {
        data = loadedData;
        createTable();
        renderButtons();
    });
});

function renderButtons() {
    document.getElementById("expandCountries").style.display = "none"
    document.getElementById("resetCountries").style.display = "none"
}

function createChart(title, data, distributionFunction) {
    const distribution = distributionFunction(data);
    renderPieChart(title, distribution);
}

function distributeByGender(data) {
    return data.reduce((acc, { gender }) => ({
        ...acc,
        [gender]: (acc[gender] || 0) + 1,
    }), {});
}

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

function createBarChart(feature) {
    const distribution = distributeByFeature(data, feature);
    const sortedData = sortAndSliceData(distribution, numberOfRows);
    renderBarChart(sortedData, feature);
}

function distributeByFeature(data, feature) {
    return data.reduce((acc, item) => {
        const key = item[feature];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

function sortAndSliceData(data, numberOfRows) {
    return Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, numberOfRows)
        .map(([key, count]) => ({ [selected]: key, count }));
}

function renderPieChart(title, distribution) {
    // Set up the chart dimensions
    const width = 600;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Create an SVG element
    const svg = d3.select('#billionairesChart')
        .html("")
        .append('svg')
        .attr('width', width + 100)
        .attr('height', height + 100)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 1.25 + ')');

    // Add title to the pie chart
    svg.append('text')
        .attr('x', 0)
        .attr('y', -height / 1.5)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .text('Distribution of billionaires by ' + title); // Customize the title as needed

    // Create a color scale
    const color = d3.scaleOrdinal()
        .domain(Object.keys(distribution))
        .range(['#3498db', '#e74c3c']); // Add more colors as needed

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
            const pos = d3.arc().innerRadius(radius).outerRadius(radius + 35).centroid(d);
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
        .attr('transform', (d, i) => 'translate(0,' + (i * 20) + ')');

    legend.append('rect')
        .attr('x', width / 3)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => color(d));

    legend.append('text')
        .attr('x', width / 2) // Adjust the x-coordinate to move labels to the right
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end') // Adjust text-anchor to 'start'
        .text(d => d);
}

function renderBarChart(data, feature) {
    // set the dimensions and margins of the graph
    var margin = { top: 40, right: 30, bottom: 100, left: 120 }, // Adjusted top margin for title
        width = 1600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#billionairesChart")
        .html("") // Clear the existing content
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2) 
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("text-decoration", "underline")
        .text("Billionaires Distribution by " + (feature == "category" ? "Category" : "Country"));


    var x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return feature == "category" ? d.category : d.countryOfCitizenship; }))
        .padding(0.2); 

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

    // Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.count; })])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "12px"); 

    // Create a color scale
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create tooltip
    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("padding", "8px");

    svg.selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(feature == "category" ? d.category : d.countryOfCitizenship); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.count); })
        .attr("height", function (d) { return height - y(d.count); })
        .attr("fill", (d, i) => color(i))
        // show tooltip
        .on("mouseover", function (event, d) {
            tooltipDiv.html(`<div>Country: ${feature == "category" ? d.category : d.countryOfCitizenship}</div><div>Value: ${d.count}</div>`)
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

