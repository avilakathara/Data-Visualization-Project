import * as d3 from "https://cdn.jsdelivr.net/npm/d3@4/+esm";

var width = 1420,
    height = 920;

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
    .paddingTop(20)    
    .round(true);

d3.csv("data/grouped_formatted_billionaires_dataset_1.csv", type, function(error, data) {
if (error) throw error;


var root = stratify(data)
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.height - a.height || b.value - a.value; });


var top100 = 16700

treemap(root);

var flip = true;



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
        if (flip)
        d3.select("#first")
        .text(d.id + "\t" + format(d.value) + "\t" + d.data.gdp_country);
        else
        d3.select("#second")
            .text(d.id + "\t" + format(d.value) + "\t" + d.data.gdp_country);

        flip = !flip;

    })
    .on("mouseover", function(d) {
        d3.select(this).style("background", "white");
        d3.select(this).style("color", "black");
        // apply on div id="info"
        d3.select("#info")
            .text(d.id + "\t" + format(d.value) + "\t" + d.data.gdp_country);
    })
    .on("mouseout", function(d) {
        d3.select(this).style("background", function(d) { while (d.depth > 1) d = d.parent; return color(d.id); });
        // d3.select(this).style("color", "white");
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

    d3.select("body")
    .selectAll("titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter().append("div")
        .style("left", function(d){ return +d.x0+ "px"})
        .style("top", function(d){ return d.y0 + 5+ "px"})
        .style("z-index", 1000)
        .style("position", "absolute")
    .append("text")
      .text(function(d){ return d.id.substring(d.id.lastIndexOf(";") + 1).split(/(?=[A-Z][^A-Z])/g).join("\n") })
      .attr("font-size", "19px")
      .attr("fill",  function(d){ return color(d.data.id)});
    
});



function type(d) {
d.value = +d.value;
return d;
}
  
