function init() {
    var margin = {top: 20, right: 20, bottom: 30, left: 60},
        w = 700,
        h = 350,
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    // Load both datasets
    Promise.all([
        d3.csv("CSV/World_Bank_Data_Malaysia.csv", function(d) {
            return {
                series: d["Series Name"],
                date: new Date(d.Year),
                value: d.Value === "N/A" ? 0 : +d.Value // Handle "N/A" as 0
            };
        }),
        d3.csv("CSV/PM2.5_Exposure_Malaysia.csv", function(d) {
            return {
                series: "PM2.5 Exposure",
                date: new Date(d.year),
                value: d.value === "N/A" ? 0 : +d.value // Handle "N/A" as 0
            };
        })
    ]).then(function([worldBankData, pm25Data]) {
        // Combine both datasets
        var dataset = worldBankData.concat(pm25Data);

        // Group data by series
        var groupedData = d3.group(dataset, d => d.series);

        // Normalize each series (2000 = 100), handling negative values
        groupedData.forEach(function(values, seriesName) {
            var baseline = values.find(d => d.date.getFullYear() === 2000)?.value || 1;
            values.forEach(function(d) {
                if (baseline === 0) {
                    d.index = 0; // Prevent division by zero
                } else if (d.value < 0) {
                    d.index = 0; // Set a floor for negative values
                } else {
                    d.index = (d.value / baseline) * 100;
                }
            });
        });

        // Flatten grouped data for plotting
        var allData = Array.from(groupedData.values()).flat();

        // Create scales
        var xScale = d3.scaleTime()
            .domain(d3.extent(allData, d => d.date))
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(allData, d => d.index)])
            .range([height, 0]);

        // Create SVG container
        var svg = d3.select("#MalaysiaLineChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add x-axis
        var xAxis = d3.axisBottom(xScale).ticks(10);
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add y-axis
        var yAxis = d3.axisLeft(yScale).ticks(10);
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        
        // Get y-axis tick values
        var yTickValues = yAxis.scale().ticks(10);
        var xTickValues = xAxis.scale().ticks(21)

        // Add vertical dotted lines
        const verticalDottedLines = svg.selectAll(".verticalDottedLine")
            .data(xTickValues)
            .enter()
            .append("line")
            .attr("class", "verticalDottedLine")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "black")
            .style("stroke-dasharray", "5,5")
            .style("stroke-width", "2.5")
            .style("opacity", 0);

        // Add horizontal dotted lines
        svg.selectAll(".dottedLine")
            .data(yTickValues)
            .enter()
            .append("line")
            .attr("class", "dottedLine")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .style("stroke", "grey")
            .style("stroke-dasharray", "5,5");

        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Index (2000 = 100)");

        // Define color scale for multiple lines
        var colorScale = d3.scaleOrdinal()
            .domain(Array.from(groupedData.keys()))            
            .range(d3.schemeCategory10);

        // Add lines for each series
        groupedData.forEach(function(values, seriesName) {
            // Create a unique class name for each line
            const lineClassName = `line-${seriesName.replace(/\s/g, "-").replace(/[^\w-]/g, "")}`; // Sanitize the series name

            // Create line generator
            var lineGenerator = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.index));

            // Append the line to the SVG
            svg.append("path")
                .datum(values)
                .attr("class", `line ${lineClassName}`) // Add specific class
                .attr("d", lineGenerator)
                .style("stroke", colorScale(seriesName))
                .style("stroke-width", 2)
                .style("fill", "none");

            // Add circles for each data point
            const circlePoints = svg.selectAll(`.dataPoint-${lineClassName}`)
                .data(values)
                .enter()
                .append("circle")
                .attr("class", `dataPoint dataPoint-${lineClassName}`)
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yScale(d.index))
                .attr("r", 3) // Circle radius
                .style("fill", colorScale(seriesName))
                .style("opacity", 1); // Initial opacity

            

        });

        const shortenName = {
            "PM2.5 Exposure": "PM2.5 Exposure",
            "Carbon dioxide (CO2) emissions from Industrial Processes (Mt CO2e)": "CO2 emissions from Industrial Processes",
            "Carbon dioxide (CO2) emissions from Industrial Combustion (Energy) (Mt CO2e)": "CO2 emissions from Industrial Combustion",
            "Carbon dioxide (CO2) emissions from Transport (Energy) (Mt CO2e)": "CO2 emissions from Transport",
            "Renewable energy consumption (% of total final energy consumption)": "Renewable energy consumption",
            "GDP per capita (constant LCU)": "GDP per capita",
            "GDP per capita growth (annual %)": "GDP per capita growth",
            "Incidence of tuberculosis (per 100,000 people)": "Incidence of tuberculosis",
            "Life expectancy at birth, total (years)": "Life expectancy",
            "Fossil fuel energy consumption (% of total)": "Fossil fuel energy consumption"  
        };

        // Add legend with hover functionality
        var legendContainer = d3.select("#Chart-Legend");
        groupedData.forEach(function(_, seriesName) {
            var legendItem = legendContainer.append("div")
                .attr("class", "legend-item")
                .style("display", "inline-block")
                .style("margin-right", "10px");

            legendItem.append("span")
                .style("background-color", colorScale(seriesName))
                .style("display", "inline-block")
                .style("width", "12px")
                .style("height", "12px")
                .style("margin-right", "5px");

            legendItem.append("span")
                .text(shortenName[seriesName] || seriesName)
                .style("font-size", "12px");

            legendItem.on("mouseover", function() {
                // Dim all lines and data points
                d3.selectAll(".line").transition()
                    .duration(200)
                    .style("opacity", 0.1);
                d3.selectAll(".dataPoint").transition()
                .duration(200)
                .attr("r", 3)
                .style("opacity", 0.1);
            
                // Highlight the specific line and its data points
                const lineClassName = `line-${seriesName.replace(/\s/g, "-").replace(/[^\w-]/g, "")}`;
                d3.select(`path.${lineClassName}`).transition()
                    .duration(200)
                    .style("opacity", 1);
                d3.selectAll(`circle.dataPoint-${lineClassName}`).transition()
                    .duration(200)
                    .attr("r", 3)
                    .style("opacity", 1);
            })
            .on("mouseout", function() {
                // Reset all lines to full opacity
                d3.selectAll(".line").transition()
                    .duration(200)
                    .style("opacity", 1);
                
                // Reset all data points to full opacity
                d3.selectAll(".dataPoint").transition()
                    .duration(200)
                    .style("opacity", 1);
            });
        });

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .on("mousemove", onMouse)
            .on("mouseout", () => {
                // Hide the tooltip when the mouse leaves the chart area
                d3.select("#MalaysiaLineChart_Tooltip").style("opacity", 0);
                verticalDottedLines.style("opacity", 0); // Hide all vertical lines when mouse leaves the area
                svg.selectAll(".dataPoint").transition()
                    .duration(200)
                    .attr("r", 3);
            });

            function onMouse(event) {
                const mouse = d3.pointer(event);
                const year = Math.round(xScale.invert(mouse[0]));
            
                // Find the closest tick value
                const closestYear = xTickValues.reduce((a, b) => {
                    return Math.abs(b - year) < Math.abs(a - year) ? b : a;
                });
            
                // Reset all vertical lines and circle points
                verticalDottedLines.style("opacity", 0);
                svg.selectAll(".dataPoint")
                    .filter(function () {
                        return d3.select(this).attr("r") > 3; // Only reset circles that are scaled up
                    })
                    .attr("r", 3);
            
                // Show only the closest vertical line if within range
                if (year >= d3.min(xTickValues) && year <= d3.max(xTickValues)) {
                    verticalDottedLines
                        .filter(d => d === closestYear)
                        .style("opacity", 0.7);
            
                    // Collect data points for the closest year
                    const tooltipData = [];
                    svg.selectAll(".dataPoint")
                        .each(function (d) {
                            if (d && d.date) {
                                const pointDate = new Date(d.date);
                                pointDate.setHours(0, 0, 0, 0);
            
                                const closestYearDate = new Date(closestYear);
                                closestYearDate.setHours(0, 0, 0, 0);
            
                                const circle = d3.select(this);
            
                                if (pointDate.getTime() === closestYearDate.getTime()) {
                                    // Scale up the circle
                                    if (circle.attr("r") == 3) {
                                        circle.transition()
                                            .duration(100)
                                            .style("opacity", 1)
                                            .attr("r", 5);
                                    }
            
                                    // Collect data for the tooltip
                                    tooltipData.push({
                                        series: shortenName[d.series] || d.series,
                                        value: d.index.toFixed(2),
                                    });
                                }
                            }
                        });
                    let left = event.pageX + 25;

                    if (left + 250 > 1400){
                        left = event.pageX - 350 - 15;
                    }
            
                    // Display the tooltip
                    const VF_tooltip = d3.select("#MalaysiaLineChart_Tooltip");
                    VF_tooltip.style("opacity", 1)
                        .style("left", `${left}px`) // Position tooltip
                        .style("top", `${event.pageY - 250}px`) // Position tooltip
                        .html(() => {
                            let content = `<div class="tooltip-header">${closestYear.getFullYear()}</div><div class="tooltip-body">`;
                            tooltipData.forEach(data => {
                                const color = colorScale(data.series); // Get the color for the current series
                                content += `
                                    <div class="tooltip-row">
                                        <span style="display: inline-block; width: 12px; height: 12px; background-color: ${color}; margin-right: 5px;"></span>
                                        <span>${data.series}</span>
                                        <span>${data.value}</span>
                                    </div>
                                `;
                            });
                            content += `</div>`;
                            return content;
                        });
                } else {
                    // Hide tooltip when out of range
                    d3.select("#MalaysiaLineChart_Tooltip").style("opacity", 0);
                }
            }
            
                 
    });
}
    
    // Call the init function
    init();