// Set the dimensions and margins of the graph
const vis_3_margin = { top: 40, right: 20, bottom: 70, left: 80 },
    vis_3_width = 700 - vis_3_margin.left - vis_3_margin.right,
    vis_3_height = 350 - vis_3_margin.top - vis_3_margin.bottom;

// Append the SVG object to the container
const vis_3_svg = d3
    .select("#vis_3_chart")
    .append("svg")
    .attr("width", vis_3_width + vis_3_margin.left + vis_3_margin.right)
    .attr("height", vis_3_height + vis_3_margin.top + vis_3_margin.bottom)
    .append("g")
    .attr("transform", `translate(${vis_3_margin.left},${vis_3_margin.top})`);

// Tooltip setup
const vis_3_tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "vis_3_tooltip")
    .style("opacity", 0)
    .attr("class", "vis_3_tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");

// Global variables for data and current year
let vis_3_data = [];
let vis_3_currentYear = 2020; // Set initial year to 2020

// Function to update the scatterplot
function vis_3_updateScatterPlot(filteredData) {
    // Bind filtered data to circles
    const circles = vis_3_svg
        .selectAll("circle")
        .data(filteredData, d => d.Country);

    // Remove old elements
    circles.exit().remove();

    // Add new elements
    circles
        .enter()
        .append("circle")
        .merge(circles) // Merge new and existing elements
        .attr("cx", d => vis_3_x(d["PM2.5 level"]))
        .attr("cy", d => vis_3_y(d["Life expectancy at birth, total (years)"]))
        .attr("r", 6)
        .attr("fill", "blue")
        .style("opacity", 0.7)
        .attr("stroke", "white");

    // Tooltip events
    vis_3_svg
        .selectAll("circle")
        .on("mouseover", (event, d) => {
            vis_3_tooltip.style("opacity", 1);
            vis_3_tooltip.html(
                `<b>Country:</b> ${d.CountryName}<br><b>Year:</b> ${d.Year}<br>
                <b>PM2.5 Level:</b> ${d["PM2.5 level"]}<br>
                <b>Life Expectancy:</b> ${d["Life expectancy at birth, total (years)"]}`
            )
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`);
        })
        .on("mousemove", event => {
            vis_3_tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseleave", () => {
            vis_3_tooltip.style("opacity", 0);
        });
}

// Slider change handler for both GDP and Life Expectancy
d3.select("#vis_3_year_slider").on("input", function () {
    vis_3_currentYear = +this.value; // Get slider value
    d3.select("#vis_3_selected_year").text(vis_3_currentYear); // Update displayed year

    // Filter data for the selected year
    const filteredData = vis_3_data.filter(d => d.Year === vis_3_currentYear);

    // Update both scatter plots with the filtered data
    vis_3_updateScatterPlot(filteredData); // Life Expectancy plot
    vis_4_updateScatterPlot(filteredData); // GDP plot
});


// Load the data
d3.csv("CSV/Economic_Health_PM2.5.csv").then(function (data) {
    // Convert numeric fields to numbers
    data.forEach(d => {
        d["PM2.5 level"] = +d["PM2.5 level"];
        d["Life expectancy at birth, total (years)"] = +d["Life expectancy at birth, total (years)"];
        d["GDP per capita (constant LCU)"] = +d["GDP per capita (constant LCU)"];
        d.Year = +d.Year; // Ensure Year is numeric
    });

    // Filter out data where Life expectancy is 0
    const filteredData = data.filter(d => d["Life expectancy at birth, total (years)"] !== 0);

    // Store filtered data in a global variable
    vis_3_data = filteredData;

    // Define the scales
    vis_3_x = d3
        .scaleLinear()
        .domain([d3.min(filteredData, d => d["PM2.5 level"]) - 5, d3.max(filteredData, d => d["PM2.5 level"])])
        .range([0, vis_3_width]);

    vis_3_y = d3
        .scaleLinear()
        .domain([d3.min(filteredData, d => d["Life expectancy at birth, total (years)"]) - 3,
                 d3.max(filteredData, d => d["Life expectancy at birth, total (years)"]) + 3])
        .range([vis_3_height, 0]);

    // Set slider range based on available data
    const minYear = d3.min(filteredData, d => d.Year);
    const maxYear = 2020; // Limit max year to 2020
    d3.select("#vis_3_year_slider")
        .attr("min", minYear)
        .attr("max", maxYear)
        .attr("value", maxYear);

    // Display the selected year
    d3.select("#vis_3_selected_year").text(maxYear);

    // Add X axis
    vis_3_svg
        .append("g")
        .attr("transform", `translate(0,${vis_3_height})`)
        .call(d3.axisBottom(vis_3_x))
        .append("text")
        .attr("x", vis_3_width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .text("PM2.5 Levels (µg/m³)")
        .style("font-size", "14px");

    // Add Y axis
    vis_3_svg
        .append("g")
        .call(d3.axisLeft(vis_3_y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -vis_3_height / 3 + 60)
        .attr("y", -50)
        .attr("fill", "black")
        .text("Life Expectancy at Birth (Years)")
        .style("font-size", "14px");

    // Initialize scatter plot with the filtered data for the most recent year
    const initialData = filteredData.filter(d => d.Year === maxYear);
    vis_3_updateScatterPlot(initialData);
});