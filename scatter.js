d3.csv("data/Parsed.csv", function (d) {
    d.gdp = +d.gdp.replace(/\D/g, '');
    return d;
}).then(function (data) {
    // Set up SVG dimensions
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Append SVG to the container
    const svg = d3.select("#scatter-plot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Function to update the scatter plot
    function updateScatterPlot(xAxisVar, yAxisVar) {
        // Clear existing content
        svg.selectAll("*").remove();

        // Extract unique countries for coloring
        const countries = [...new Set(data.map(d => d.country))];

        // Filter out data points with NaN values in the selected axes
        const filteredData = data.filter(d => !isNaN(d[xAxisVar]) && !isNaN(d[yAxisVar]));

        // Create scales for x and y axes
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => +d[xAxisVar])])
            .range([0, width]);
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(xScale).tickFormat(d3.format(".2s"))); // Use .2s format for billions

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => +d[yAxisVar])])
            .range([height, 0]);
        svg.append("g").call(d3.axisLeft(yScale).tickFormat(d3.format(".2s"))); // Use .2s format for billions


        // Define color scale for countries
        const colorScale = d3.scaleOrdinal()
            .domain(countries)
            .range(d3.schemeCategory10);

        // Add circles to represent data points
        svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(+d[xAxisVar]))
            .attr("cy", d => yScale(+d[yAxisVar]))
            .attr("r", 8)
            .attr("fill", d => colorScale(d.country))
            .attr("opacity", 0.7)
            .on("mouseover", function (_, d) {
                // Show tooltip information in the div inside axis-description
                const tooltipDiv = d3.select("#tooltip-info");

                tooltipDiv.html(`<strong>${d.country}</strong><br>${xAxisVar}: ${d[xAxisVar]}<br>${yAxisVar}: ${d[yAxisVar]}`);

                const circleColor = d3.select(this).attr("fill");

                tooltipDiv.style("display", "block");
                tooltipDiv.style("background-color", circleColor)
                    .style("border", "2px solid black")  
                    .style("border-radius", "8px")
                    .style("padding", "10px");

                d3.select(this).attr("stroke", "#333").attr("stroke-width", 2);
            })
            .on("mouseout", function (_, d) {
                //d3.select("#tooltip-info").style("display", "none");
                d3.select(this).attr("stroke", "none");
            });


        // Add labels for x and y axes
        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text(xAxisVar);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yAxisVar);

        // Add legend for countries
        const legend = d3.select("#legend")
            .selectAll("div")
            .data(colorScale.domain())
            .enter()
            .append("div")
            .style("display", "flex")
            .style("align-items", "center");

        legend.append("span")
            .style("width", "12px")
            .style("height", "12px")
            .style("margin-right", "5px")
            .style("background-color", colorScale);

        legend.append("p")
            .text(d => d);
    }

    updateScatterPlot("gdp", "gdp");

    var xSlider = d3.select("#sliderXmin")
        .append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", d3.max(data, d => +d.gdp))
        .attr("value", 0)
        .attr("class", "slider");

    var xSlider = d3.select("#sliderXmax")
        .append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", d3.max(data, d => +d.gdp))
        .attr("value", d3.max(data, d => +d.gdp))
        .attr("class", "slider");

    var ySlider = d3.select("#sliderYmin")
        .append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", d3.max(data, d => +d.gdp))
        .attr("value", 0)
        .attr("class", "slider");

    var ySlider = d3.select("#sliderYmax")
        .append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", d3.max(data, d => +d.gdp))
        .attr("value", d3.max(data, d => +d.gdp))
        .attr("class", "slider");

    // Event listener for x-axis slider
    xSlider.on("input", function () {
        var xSliderValue = +this.value;
        var yAxisVar = document.getElementById("y-axis").value;
        updateScatterPlot("gdp", yAxisVar);
    });

    // Event listener for y-axis slider
    ySlider.on("input", function () {
        var ySliderValue = +this.value;
        var xAxisVar = document.getElementById("x-axis").value;
        updateScatterPlot(xAxisVar, "gdp");
    });

    function updateSliders(xMin, xMax, xValue, yMin, yMax, yValue) {
        // Update x-axis slider
        d3.select("#sliderX")
            .select("input")
            .attr("min", xMin)
            .attr("max", xMax)
            .attr("value", xValue);

        // Update y-axis slider
        d3.select("#sliderY")
            .select("input")
            .attr("min", yMin)
            .attr("max", yMax)
            .attr("value", yValue);
    }

    // Event listeners for dropdown changes
    document.getElementById("x-axis").addEventListener("change", function () {
        const xAxisVar = this.value;
        const yAxisVar = document.getElementById("y-axis").value;
        updateScatterPlot(xAxisVar, yAxisVar);
    });

    document.getElementById("y-axis").addEventListener("change", function () {
        const xAxisVar = document.getElementById("x-axis").value;
        const yAxisVar = this.value;
        updateScatterPlot(xAxisVar, yAxisVar);
    });
});