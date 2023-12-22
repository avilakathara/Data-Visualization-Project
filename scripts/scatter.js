d3.csv("data/Parsed.csv", function (d) {
    // GDP darts is in ""'s, so need to remove them before computing.
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


    // Calculate the trendline of the data
    function calctrend(data, xAxisVar, yAxisVar) {
        // Get the x and y values into an array
        const xValues = data.map(d => +d[xAxisVar]);
        const yValues = data.map(d => +d[yAxisVar]);

        // Mean od each array 
        const xMean = d3.mean(xValues);
        const yMean = d3.mean(yValues);

        // Slope calculation
        const numerator = d3.sum(xValues.map((l, i) => (l - xMean) * (yValues[i] - yMean)));
        const denominator = d3.sum(xValues.map(l => Math.pow(l - xMean, 2)));

        const grad = numerator / denominator;
        const intercept = yMean - grad * xMean;

        return { slope: grad, intercept };
    }

    // Helper fucntion to format numbers
    function formatLargeNumber(number) {
        if (Math.abs(number) >= 1e12) {
            return '$' + (number / 1e12).toFixed(1) + 'T';
        } else if (Math.abs(number) >= 1e9) {
            return '$' + (number / 1e9).toFixed(1) + 'B';
        } else if (Math.abs(number) >= 1e6) {
            return '$' + (number / 1e6).toFixed(1) + 'M';
        } else if (Math.abs(number) >= 1e3) {
            return '$' + (number / 1e3).toFixed(1) + 'K';
        }
        return number.toString();
    }

    // Convert the feature to a proper name
    function getFormattedName(axisVar) {
        switch (axisVar) {
            case "gdp":
                return "GDP";
            case "numBillionaires":
                return "Number of Billionaires"
            case "totalWealth":
                return "Total Wealth"
            case "totalTaxRate":
                return "Total Tax Rate"
            default:
                return "Error";
        }
    }

    // Function to update the scatter plot
    function updateScatterPlot(xAxisVar, yAxisVar) {
        // Clear everything
        svg.selectAll("*").remove();

        // Extract unique countries 
        const countries = [...new Set(data.map(d => d.country))];

        // Filter out data points with NaN values in the selected axes
        const filteredData = data.filter(d => !isNaN(d[xAxisVar]) && !isNaN(d[yAxisVar]));

        // Create scales for x and y axes
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => +d[xAxisVar])])
            .range([0, width]);
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(xScale).tickFormat(d3.format(".2s"))); 

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => +d[yAxisVar])])
            .range([height, 0]);
        svg.append("g").call(d3.axisLeft(yScale).tickFormat(d3.format(".2s"))); 


        // Define color scale for countries
        const colors = d3.scaleOrdinal()
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
            .attr("fill", d => colors(d.country))
            .attr("opacity", 0.7)
            .on("mouseover", function (_, d) {
                // Show tooltip information in the div inside axis-description
                const tooltipDiv = d3.select("#tooltip-info");

                tooltipDiv.html(`<strong>${d.country}</strong><br>${xAxisVar}: ${formatLargeNumber(d[xAxisVar])}<br>${yAxisVar}: ${formatLargeNumber(d[yAxisVar])}`);

                tooltipDiv.style("display", "block");
                tooltipDiv.style("background-color", "white")
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
            .text(getFormattedName(xAxisVar));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(getFormattedName(yAxisVar));

        
        // Calculate the trendline and the display the gradient to the user.
        const trendline = calctrend(filteredData, xAxisVar, yAxisVar);

        const line = d3.line()
            .x(d => xScale(+d[xAxisVar]))
            .y(d => yScale(trendline.slope * +d[xAxisVar] + trendline.intercept));

        svg.append("path")
            .datum(filteredData)
            .attr("class", "trend-line")
            .attr("d", line)
            .attr("stroke", "black")
            .attr("stroke-width", 0.1)
            .attr("fill", "none");

        const gradientDiv = d3.select("#gradient-info");
        gradientDiv.html(`Trendline Gradient: ${trendline.slope.toFixed(2)}`);
    }

    // Intitlize with gdp vs gdp just to have something on the grpah.
    updateScatterPlot("gdp", "gdp");

    // Event listeners for x and y axis selection dropdown changes
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