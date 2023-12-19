d3.csv("data/Parsed.csv", function (d) {
    // Convert GDP values to numeric format (remove commas)
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
            .range([100, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => +d[yAxisVar])])
            .range([height - 100, 0]);

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
            .on("mouseover", function (event, d) {
                // Show tooltip with country name and values
                const tooltip = d3.select("#scatter-plot-container")
                    .append("div")
                    .style("position", "absolute")
                    .style("background", "#f4f4f4")
                    .style("padding", "5px")
                    .style("border", "1px solid #ddd")
                    .style("border-radius", "5px")
                    .style("pointer-events", "none")
                    .html(`<strong>${d.country}</strong><br>${xAxisVar}: ${d[xAxisVar]}<br>${yAxisVar}: ${d[yAxisVar]}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 10 + "px");

                // Highlight the circle
                d3.select(this).attr("stroke", "#333").attr("stroke-width", 2);
            })
            .on("mouseout", function (_, d) {
                // Remove tooltip and reset circle style
                d3.select("#scatter-plot-container").select("div").remove();
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

    // Initial scatter plot with default variables
    updateScatterPlot("gdp", "gdp");

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