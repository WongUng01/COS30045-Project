// Define margins, width, and height
const margin = { top: 50, right: 20, bottom: 60, left: 80 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append the SVG element
const svg = d3.select("#pm25-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Set color palette for countries
const colors = {
    norway: "orange",
    france: "red",
    uk: "blue",
    germany: "purple",
    spain: "teal",
    average: "black"
};

// Parse the CSV data
d3.csv("CSV/EuropeanPM.csv").then(data => {

    // Parse data and cast to numerical types, handle missing data
    data.forEach(d => {
        d.Year = +d.Year;  // Ensure year is a number
        d.norway = d.norway ? +d.norway : NaN;
        d.france = d.france ? +d.france : NaN;
        d.uk = d.uk ? +d.uk : NaN;
        d.germany = d.germany ? +d.germany : NaN;
        d.spain = d.spain ? +d.spain : NaN;
        d.average = d.average ? +d.average : NaN;
    });

    // Filter out any rows where any country data is NaN
    data = data.filter(d => !isNaN(d.norway) && !isNaN(d.france) && !isNaN(d.uk) && !isNaN(d.germany) && !isNaN(d.spain) && !isNaN(d.average));
    //console.log(data);

    // Set up the scales
    const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
    .range([0, width]);

    const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.norway, d.france, d.uk, d.germany, d.spain, d.average))])
    .range([height, 0]);


    // Add the X axis
    // Add the X axis without commas
    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d"))) // Remove commas from tick labels
    .selectAll("path, line")
    .style("stroke", "black");


    // Add the Y axis
    svg.append("g")
        .call(d3.axisLeft(y).ticks(10))
        .selectAll("path, line")
        .style("stroke", "black");

    // Add tick text styling separately
    svg.selectAll(".tick text")
        .style("fill", "black") // Explicitly set text color
        .style("font-size", "12px"); // Optional: Adjust text size

    // Define the line function for generating the path
    const line = d3.line()
    .x(d => {
        const xValue = x(d.Year);
        return xValue;
    })
    .y(d => {
        const yValue = y(d.value);
        return yValue;
    });

    // Draw lines for each country and the European average
    const countries = ["norway", "france", "uk", "germany", "spain", "average"];

    countries.forEach(country => {
        const validData = data.map(d => ({ Year: d.Year, value: d[country] }))
                              .filter(d => !isNaN(d.value));  // Filter out NaN values
            
        if (validData.length > 0) {
            svg.append("path")
                .data([validData])
                .attr("class", country)
                .attr("d", function(d) {
                    // Log the d object and the x, y values being passed into the line generator
                    //console.log("Data for line:", d);
                    return line(d);
                })
                .attr("fill", "none")
                .attr("stroke", colors[country])
                .attr("stroke-width", country === "average" ? 4 : 2);
        }
    });
    
    /*
    // Add title and labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Tracking European PM2.5 Trends (2000–2020): Regional and National Perspectives");
    */

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom / 2)
        .attr("text-anchor", "middle")
        .text("Year")
        .style("font-size", "14px")
        .style("fill", "#333");

    svg.append("text")
        .attr("x", -height / 2)  // Adjust this to position it closer to the left
        .attr("y", -margin.left + 30)  // Adjust this to place it in the correct vertical position
        .attr("transform", "rotate(-90)")  // Keep the rotation
        .attr("text-anchor", "middle")  // Ensure the text is centered along its own axis
        .text("PM2.5 Concentration (µg/m³)")
        .style("font-size", "14px")
        .style("fill", "#333");

    // Add a legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 50}, 10)`);

    Object.keys(colors).forEach((country, index) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", index * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colors[country]);

        legend.append("text")
            .attr("x", 20)
            .attr("y", index * 20 + 12)
            .style("font-size", "12px")
            .text(country === "norway" ? "Norway" : country.charAt(0).toUpperCase() + country.slice(1));
    });

    // Add tooltips on hover
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "5px");

    svg.selectAll("path")
        .on("mouseover", function (event, d) {
            const country = d3.select(this).attr("class");
            const yearIndex = Math.floor(event.offsetX / (width / data.length));  // Get the index of the year
            const yearData = data[yearIndex];  // Get the data for that year
            
            // Extract the relevant PM2.5 value for the hovered country and year
            const value = yearData[country];

            tooltip.text(`${country.charAt(0).toUpperCase() + country.slice(1)} - PM2.5: ${value} µg/m³`)
                .style("visibility", "visible");
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY + 5) + "px")
                .style("left", (event.pageX + 5) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        });
});

