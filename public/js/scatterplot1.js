// Set the dimensions and margins of the graph
const vis_4_margin = { top: 40, right: 30, bottom: 70, left: 100 },
    vis_4_width = 900 - vis_4_margin.left - vis_4_margin.right,
    vis_4_height = 600 - vis_4_margin.top - vis_4_margin.bottom;

// Append the SVG object to the container
const vis_4_svg = d3
    .select("#vis_4_chart")
    .append("svg")
    .attr("width", vis_4_width + vis_4_margin.left + vis_4_margin.right)
    .attr("height", vis_4_height + vis_4_margin.top + vis_4_margin.bottom)
    .append("g")
    .attr("transform", `translate(${vis_4_margin.left},${vis_4_margin.top})`);

// Tooltip setup
const vis_4_tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "vis_4_tooltip")
    .style("opacity", 0)
    .attr("class", "vis_4_tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");

// Global variables for data and current year
let vis_4_data = [];
let vis_4_currentYear = 2020; // Set initial year to 2020

// Function to update GDP scatter plot
function vis_4_updateScatterPlot(filteredData) {
    // Filter out data points where GDP is 0 or missing (null or undefined)
    const validData = filteredData.filter(d => d["GDP per capita (constant LCU)"] !== 0 && d["GDP per capita (constant LCU)"] != null && !isNaN(d["GDP per capita (constant LCU)"]));

    const circles = vis_4_svg
        .selectAll("circle")
        .data(validData, d => d.Country);

    circles.exit().remove();

    circles
        .enter()
        .append("circle")
        .merge(circles)
        .attr("cx", d => vis_4_x(d["PM2.5 level"]))
        .attr("cy", d => vis_4_y(d["GDP per capita (constant LCU)"]))
        .attr("r", 6)
        .attr("fill", "blue")
        .style("opacity", 0.7)
        .attr("stroke", "white");

    // Tooltip events
    vis_4_svg
        .selectAll("circle")
        .on("mouseover", (event, d) => {
            vis_4_tooltip.style("opacity", 1);
            vis_4_tooltip.html(
                `<b>Country:</b> ${d.Country}<br><b>Year:</b> ${d.Year}<br>
                <b>PM2.5 Level:</b> ${d["PM2.5 level"]}<br>
                <b>GDP:</b> ${d["GDP per capita (constant LCU)"]}`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mousemove", event => {
            vis_4_tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseleave", () => {
            vis_4_tooltip.style("opacity", 0);
        });
}


// Slider change handler
d3.select("#vis_4_year_slider").on("input", function () {
    vis_4_currentYear = +this.value; // Get slider value
    d3.select("#vis_4_selected_year").text(vis_4_currentYear); // Update displayed year

    // Filter data for the selected year
    const filteredData = vis_4_data.filter(d => d.Year === vis_4_currentYear);

    // Update scatter plot with filtered data
    vis_4_updateScatterPlot(filteredData);
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
    const filteredData = data.filter(d => d["GDP per capita (constant LCU)"] !== 0);

    // Store filtered data in a global variable
    vis_4_data = filteredData;

    // Define the scales with a logarithmic scale for the y-axis
    vis_4_x = d3
    .scaleLinear()
    .domain([d3.min(filteredData, d => d["PM2.5 level"]) - 5, d3.max(filteredData, d => d["PM2.5 level"]) + 5])
    .range([0, vis_4_width]);

    vis_4_y = d3
    .scaleLog()  // Use a logarithmic scale for GDP
    .domain([d3.min(filteredData, d => d["GDP per capita (constant LCU)"]) + 1, // Avoid log(0)
            d3.max(filteredData, d => d["GDP per capita (constant LCU)"])])
    .range([vis_4_height, 0]);

    // Update the scatter plot function
    function vis_4_updateScatterPlot(filteredData) {
    const circles = vis_4_svg
        .selectAll("circle")
        .data(filteredData, d => d.Country);

    circles.exit().remove();

    circles
        .enter()
        .append("circle")
        .merge(circles)
        .attr("cx", d => vis_4_x(d["PM2.5 level"]))
        .attr("cy", d => vis_4_y(d["GDP per capita (constant LCU)"]))
        .attr("r", 6)
        .attr("fill", "blue")
        .style("opacity", 0.7)
        .attr("stroke", "white");

    // Tooltip events
    vis_4_svg
        .selectAll("circle")
        .on("mouseover", (event, d) => {
            vis_4_tooltip.style("opacity", 1);
            vis_4_tooltip.html(
                `<b>Country:</b> ${d.Country}<br><b>Year:</b> ${d.Year}<br>
                <b>PM2.5 Level:</b> ${d["PM2.5 level"]}<br>
                <b>GDP:</b> ${d["GDP per capita (constant LCU)"]}`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mousemove", event => {
            vis_4_tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseleave", () => {
            vis_4_tooltip.style("opacity", 0);
        });
    }

    // Add the axes with updated ticks for the log scale
    vis_4_svg
    .append("g")
    .attr("transform", `translate(0,${vis_4_height})`)
    .call(d3.axisBottom(vis_4_x))
    .append("text")
    .attr("x", vis_4_width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .text("PM2.5 Levels (µg/m³)")
    .style("font-size", "14px");

    // Add Y axis with logarithmic scale, use ticks with appropriate format
    vis_4_svg
    .append("g")
    .call(d3.axisLeft(vis_4_y).ticks(5, "~s")) // Format ticks as numbers with suffixes (e.g., 1k, 1M)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -vis_4_height / 3)
    .attr("y", -50)
    .attr("fill", "black")
    .text("GDP per capita (constant LCU)")
    .style("font-size", "14px");
});

function showVisualization(type) {
    const lifeExpectancyPlot = document.getElementById("lifeExpectancyPlot");
    const gdpPlot = document.getElementById("gdpPlot");

    // Hide both plots initially
    lifeExpectancyPlot.style.display = "none";
    gdpPlot.style.display = "none";

    // Show the selected visualization
    if (type === 'life') {
        lifeExpectancyPlot.style.display = "block";
    } else if (type === 'gdp') {
        gdpPlot.style.display = "block";

        // Update GDP chart with the current year's data
        const filteredData = vis_4_data.filter(d => d.Year === vis_4_currentYear);
        vis_4_updateScatterPlot(filteredData);
    }
}

// Show default chart on page load
document.addEventListener("DOMContentLoaded", () => {
    showVisualization('life'); // Default to 'life' visualization
});

