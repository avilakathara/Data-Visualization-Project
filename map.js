import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

// Map and projection
const projection = d3.geoNaturalEarth1()
.scale(width / 1.3 / Math.PI)
.translate([width / 2, height / 2])

// Load external data and boot
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(data) {

// Draw the map
svg.append("g")
.selectAll("path")
.data(data.features)
.join("path")
    .attr("fill", "#69b3a2")
    .attr("d", d3.geoPath()
    .projection(projection)
    )
    .style("stroke", "#fff")
    .on("mouseover", (event, d) => {
        // Interactivity can be added here
        console.log("Mouseover on: ", d.properties.name);
    })
    //on mouseover change color
    .on("mouseover", function(d) {
        d3.select(this).style("fill", "orange");
    })
    .on("mouseout", function(d) {
        d3.select(this).style("fill", "#69b3a2");
    })
    ; 
    


})