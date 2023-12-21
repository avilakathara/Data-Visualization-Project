// Sample data (replace this with your actual data)
import { onDataReady } from "./dataloader.js";
import { createTable } from "./searchlist.js";

var data = null;
var selected = null;

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

document.getElementById("barchartFeatures").addEventListener("change", function () {
    selected = this.value;
    switch (selected) {
        case "category":
        case "countryOfCitizenship":
            createBarChart(selected);
            break;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    onDataReady((loadedData, headers) => {
        data = loadedData;
        createTable();
        createChart("gender", data, distributeByGender);
        createBarChart("category");
    });
});

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
    const sortedData = sortAndSliceData(distribution,feature);
    renderBarChart(sortedData, feature);
}

function distributeByFeature(data, feature) {
    return data.reduce((acc, item) => {
        const key = item[feature];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

function sortAndSliceData(data, feature) {
    let res = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => ({ [feature]: key, count }));
    return res;
}

function renderPieChart(title, distribution) {
    // Set up the chart dimensions
    const width = 500;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Create an SVG element
    const svg = d3.select('#billionairesPieChart')
        .html("")
        .append('svg')
        .attr('width', width + 100)
        .attr('height', height + 200)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 1.25 + ')');

    // Add title to the pie chart
    svg.append('text')
        .attr('x', 0)
        .attr('y', -height / 1.5)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .text(title == "gender" ? 'Distribution of billionaires by ' + title : 'Distribution of billionaires by self-made vs. inherited wealth'); // Customize the title as needed

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
            const pos = d3.arc().innerRadius(radius).outerRadius(radius + 50).centroid(d);
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
        .attr('transform', (d, i) => 'translate(60,' + (i * 20) + ')');

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
    var margin = { top: 80, right: 100, bottom: 130, left: 60 }, // Adjusted top margin for title
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#billionairesBarChart")
        .html("") // Clear the existing content
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var selectedCountryBox = svg.append("rect")
        .attr("class", "selected-country-box")
        .attr("x", width / 3 - ((width - margin.left - margin.right) / 8))  // Adjusted x position for the selected country box
        .attr("y", -margin.top / 2 + 20)  // Adjusted y position for the selected country box
        .attr("width", (width - margin.left - margin.right) / 1.5)  // Adjusted width for the selected country box
        .attr("height", 60)  // Adjusted height for the selected country box
        .attr("fill", "white")
        .attr("stroke", "black");

    var selectedCountryText = svg.append("text")
        .attr("class", "selected-country-text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2 + 35)  // Adjusted y position for the selected country text
        .attr("text-anchor", "middle")
        .style("font-size", "16px");

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

    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .on("click", function (event, d) {
            // Update the text and show the selected country box
            selectedCountryText.text(d + " has " + data.filter(x => x.countryOfCitizenship == d)[0].count + " billionaires.");
            selectedCountryBox.style("visibility", "visible");
        });

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.count; })])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "12px");

    var color = d3.scaleOrdinal(d3.schemeCategory10);

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
        })
        .on("click", function (event, d) {
            // Update the text and show the selected country box
            selectedCountryText.text("Selected Country: " + d.countryOfCitizenship);
            selectedCountryBox.style("visibility", "visible");
        });
}




