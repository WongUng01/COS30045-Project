// Set dimensions and margins
const vis2_margin = { top: 20, right: 50, bottom: 50, left: 40 };
const vis2_width = 800 - vis2_margin.left - vis2_margin.right;
const vis2_height = 380 - vis2_margin.top - vis2_margin.bottom;

// Create the SVG container
const vis2_svg = d3
.select("#vis2-chart")
.attr("vis2_width", vis2_width + vis2_margin.left + vis2_margin.right)
.attr("vis2_height", vis2_height + vis2_margin.top + vis2_margin.bottom)
.append("g")
.attr("transform", `translate(${vis2_margin.left},${vis2_margin.top})`);

// Define scales
const xScale = d3.scaleLinear().range([0, vis2_width]);
const yScale = d3.scaleLinear().range([vis2_height, 0]);

// Add axes groups
const xAxisGroup = vis2_svg.append("g").attr("transform", `translate(0,${vis2_height})`);
const yAxisGroup = vis2_svg.append("g");

// Define the color scheme
const colors1 = d3.scaleOrdinal().range(["#4695B1 ", "#7A7A7A"]);
const colors2 = d3.scaleOrdinal().range(["#D35400", "#2874A6"]);

// Define narrative content for each country
const narratives = {
germany: `
    <h2><u>Germany's Energy Trends</u></h2>
    <p>
        <b>Germany</b> has long been recognized as a pioneer in <b>renewable energy adoption</b>, driven by its ambitious <i>Energiewende</i> (<b>Energy Transition</b>) policy, 
        which aims to shift the country toward a <b>sustainable</b> and <b>low-carbon energy system</b>. Over the years, 
        Germany has made substantial investments in <b>wind</b> and <b>solar power</b>, making these two sources <b>cornerstones</b> of its energy mix. As of recent years, 
        <b>wind energy</b> accounts for a significant share of Germany's electricity generation, followed by <b>solar photovoltaics</b>, which continues to grow steadily.
    </p>
    <p>
        At the same time, Germany has actively worked to reduce its reliance on <b>fossil fuels</b>, particularly <i>coal</i>, which has historically been a dominant energy source. 
        Through <b>stringent policies</b>, <b>financial incentives</b>, and <b>public awareness campaigns</b>, fossil fuel consumption has gradually decreased, 
        marking a significant step toward <b>carbon neutrality</b>. However, challenges remain, especially with phasing out <i>nuclear energy</i> and balancing the <b>intermittency of renewables</b> with <b>reliable energy supply</b>.
    </p>
`,
france: `
    <h2><u>France's Energy Trends</u></h2>
    <p>
        <b>France</b> has historically relied on <b>nuclear power</b> as the backbone of its energy system, enabling the country to maintain some of the <b>lowest carbon emissions</b> in Europe. 
        However, in recent years, France has shifted its focus to diversify its energy mix by investing in <b>renewable energy sources</b> such as <b>wind</b>, <b>solar</b>, 
        and <b>hydroelectric power</b>. This transition aligns with the EU’s ambitious <b>climate goals</b> and France’s commitments under the <i>Paris Agreement</i>.
    </p>
    <p>
        Despite progress in renewables, <b>fossil fuel consumption</b> remains a challenge, particularly in the <i>transportation</i> and <i>industrial sectors</i>. 
        France’s energy policies, including <b>tax incentives</b> and <b>subsidies</b>, have been designed to accelerate the adoption of renewables while gradually reducing reliance on <b>fossil fuels</b>. 
        The nation’s investments in <b>grid infrastructure</b> and <b>smart energy systems</b> further highlight its dedication to a <b>sustainable energy future</b>.
    </p>
`,
uk: `
    <h2><u>United Kingdom's Industrial Emissions and Profile</u></h2>
    <p>
        <b>The United Kingdom</b> has undergone a remarkable <b>energy transformation</b> in recent decades, making significant progress in reducing its dependency on <b>fossil fuels</b>. 
        Central to this shift has been the rapid adoption of <b>renewable energy sources</b>, particularly <b>wind power</b>, which now forms a substantial part of the UK’s energy generation. 
        The UK’s commitment to <b>offshore wind farms</b> and innovative <b>energy storage systems</b> underscores its role as a leader in <b>green energy</b>.
    </p>
    <p>
        At the same time, the UK has significantly reduced <i>coal consumption</i>, once a dominant source of energy, through initiatives such as the <i>carbon price floor</i> and the planned <b>phase-out of coal power</b> by 2024. 
        The <b>Climate Change Act</b> and other key policies have provided a robust framework for cutting <b>greenhouse gas emissions</b> and transitioning to a <b>low-carbon economy</b>.
    </p>
`,
};

// Function to update the narrative content
function updateNarrative(country) {
const narrative = narratives[country] || "<p>No narrative available for this selection.</p>";
d3.select("#vis2-chart-info").html(narrative);
}

// Function to load and render data for a country
function loadData1(countryCode) {
d3.csv("CSV/World_Bank_Data.csv").then((data) => {
    //console.log(data);
    // Filter data for the selected country
    const countryData = data.filter((d) => d.CountryCode === countryCode);

    // Prepare data for stacking (Renewable Energy and Fossil Fuel)
    const yearData = d3.rollup(
    countryData,
    (rows) => {
        const renewableRow = rows.find((d) => d.SeriesCode === "EG.FEC.RNEW.ZS");
        const fossilFuelRow = rows.find((d) => d.SeriesCode === "EG.USE.COMM.FO.ZS");
        return {
        renewable: renewableRow ? +renewableRow.Value : 0,
        fossilFuel: fossilFuelRow ? +fossilFuelRow.Value : 0,
        };
    },
    (d) => +d.Year
    );

    const stackData = Array.from(yearData, ([year, values]) => ({
    year,
    ...values,
    }));
    //console.log("Stack Data:", stackData);

    // Generate stacked data
    const stackedData = d3.stack()
    .keys(["renewable", "fossilFuel"])
    .value((d, key) => d[key])(stackData);

    // Set domains for scales
    xScale.domain(d3.extent(stackData, (d) => d.year));
    yScale.domain([0, 100]); // Percentage scale for energy sources

        // Transition axes
    xAxisGroup
    .transition()
    .duration(750)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    yAxisGroup
    .transition()
    .duration(750)
    .call(d3.axisLeft(yScale));

    // Remove the right y-axis and its label (if present)
    vis2_svg.selectAll(".y-axis-right").remove();
    vis2_svg.selectAll(".y-right-axis-label").remove();

    // Remove the fossil fuel line (if present)
    vis2_svg.selectAll(".fossil-fuel-line").remove();

    // Add x-axis label
    vis2_svg.select(".x-axis-label").remove(); // Remove existing x-axis label
    vis2_svg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", vis2_width / 2)
    .attr("y", vis2_height + vis2_margin.bottom - 10) // Position below the x-axis
    .text("Year")
    .style("font-size", "14px")
    .style("fill", "#333");

    // Add y-axis label
    vis2_svg.select(".y-axis-label").remove(); // Remove existing y-axis label
    vis2_svg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`) // Rotate the label vertically
    .attr("x", -vis2_height / 2) // Position in the middle of the y-axis
    .attr("y", -vis2_margin.left + 15) // Adjust position from the y-axis
    .text("Percentage of Energy Consumption (%)")
    .style("font-size", "14px")
    .style("fill", "#333");

    // Add the stacked area chart
    const areaGenerator = d3.area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));

    // Bind new data
    const layers = vis2_svg.selectAll(".layer").data(stackedData);

    // Update existing paths with transitions
    layers
    .transition() // Add a transition to smooth the update
    .duration(750) // Duration in milliseconds
    .attr("d", areaGenerator)
    .style("fill", (d, i) => colors1(i));

    layers.enter()
    .append("path")
    .attr("class", "layer")
    .attr("d", areaGenerator)
    .style("fill", (d, i) => colors1(i))
    .style("opacity", 1)
    .on("mouseover", function (event, d) {
        d3.select(this).transition()
                    .delay(30)
                    .style("stroke", "#000")
                    .style("stroke_width", 1)
                    .style("opacity", 0.8);
        vis2_tooltip.style("visibility", "visible");
    })
    .on("mousemove", function (event, d) {
        const [x] = d3.pointer(event);
        const year = Math.round(xScale.invert(x));
        const yearData = d.find((layerData) => layerData.data.year === year);
        const value = yearData ? yearData.data[d.key] : 0;
        const key = d.key === "renewable" ? "Renewable Energy Consumption" : "Fossil Fuel Consumption";

        vis2_tooltip
        .html(`
            <strong><u>${key}</u></strong><br>
            <div style="text-align: left;"
                Year: ${year}<br>
                Value: ${value.toFixed(2)}%
            </div>
        `)
        .style("top", `${event.pageY - 50}px`)
        .style("left", `${event.pageX + 20}px`);
    })
    .on("mouseout", function () {
        d3.select(this).transition()
                    .delay(30)  
                    .style("stroke", "none")
                    .style("opacity", 1);
        vis2_tooltip.style("visibility", "hidden");
    });

    // Add x-axis and y-axis
    xAxisGroup.transition()
            .delay(750)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    yAxisGroup.transition()
            .delay(750)
            .call(d3.axisLeft(yScale));

    // Re-append the y-axis group to bring it to the front
    yAxisGroup.raise();

        // Remove any exiting paths with transitions
        layers
        .exit()
        .transition()
        .duration(750)
        .style("opacity", 0)
        .remove();

});
}

// Function to load and render data for a country
function loadData2(countryCode) {
    d3.csv("CSV/World_Bank_Data.csv").then((data) => {
    const countryData = data.filter((d) => d.CountryCode === countryCode);

    const yearData = d3.rollup(
        countryData,
        (rows) => {
        const combustionRow = rows.find((d) => d.SeriesCode === "EN.GHG.CO2.IC.MT.CE.AR5");
        const processRow = rows.find((d) => d.SeriesCode === "EN.GHG.CO2.IP.MT.CE.AR5");
        const fossilFuelRow = rows.find((d) => d.SeriesCode === "EG.USE.COMM.FO.ZS");
        return {
            combustion: combustionRow ? +combustionRow.Value : 0,
            process: processRow ? +processRow.Value : 0,
            fossilFuel: fossilFuelRow ? +fossilFuelRow.Value : 0,
        };
        },
        (d) => +d.Year
    );

    const stackData = Array.from(yearData, ([year, values]) => ({
        year,
        ...values,
    }));

    const stackedData = d3.stack()
        .keys(["combustion", "process"])
        .value((d, key) => d[key])(stackData);

    xScale.domain(d3.extent(stackData, (d) => d.year));
    yScale.domain([0, d3.max(stackData, (d) => d.combustion + d.process)]);

    // Add secondary y-axis scale
    const yRightScale = d3.scaleLinear()
        .domain([0, d3.max(stackData, (d) => d.fossilFuel)])
        .range([vis2_height, 0]);

    // Transition primary and secondary axes
    xAxisGroup
        .transition()
        .duration(750)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    yAxisGroup
        .transition()
        .duration(750)
        .call(d3.axisLeft(yScale));

    // Add secondary axis group for right-side y-axis
    const yRightAxisGroup = vis2_svg.selectAll(".y-axis-right")
        .data([null]);

    yRightAxisGroup.enter()
        .append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${vis2_width}, 0)`)
        .merge(yRightAxisGroup)
        .transition()
        .duration(750)
        .call(d3.axisRight(yRightScale));

    // Add labels for axes
    vis2_svg.select(".x-axis-label").remove();
    vis2_svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", vis2_width / 2)
        .attr("y", vis2_height + vis2_margin.bottom - 10)
        .text("Year")
        .style("font-size", "14px")
        .style("fill", "#333");

    vis2_svg.select(".y-axis-label").remove();
    vis2_svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -vis2_height / 2)
        .attr("y", -vis2_margin.left + 15)
        .text("CO2 Emissions (Mt)")
        .style("font-size", "14px")
        .style("fill", "#333");

    // Remove existing right y-axis label if present
    vis2_svg.selectAll(".y-right-axis-label").remove();

    // Add the right y-axis label
    vis2_svg.append("text")
    .attr("class", "y-right-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`) // Rotate vertically
    .attr("x", -vis2_height / 2) // Center it vertically along the chart
    .attr("y", vis2_width + vis2_margin.right - 10) // Adjust position relative to chart width
    .text("Fossil Fuel Consumption (%)") // Text to display
    .style("font-size", "14px") // Ensure it's a readable size
    .style("fill", "#333"); // Ensure color is visible against the background

    // Add the stacked area chart
    const areaGenerator = d3.area()
        .x((d) => xScale(d.data.year))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]));

    const layers = vis2_svg.selectAll(".layer").data(stackedData);

    layers
        .transition()
        .duration(750)
        .attr("d", areaGenerator)
        .style("fill", (d, i) => colors2(i));

    layers.enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", areaGenerator)
        .style("fill", (d, i) => colors2(i))
        .style("opacity", 1)
        .on("mouseover", function (event, d) {
            d3.select(this).transition()
                        .delay(30)
                        .style("stroke", "#000")
                        .style("stroke_width", 1)
                        .style("opacity", 0.8);
            vis2_tooltip.style("visibility", "visible");
        })
        .on("mousemove", function (event, d) {
            const [x] = d3.pointer(event);
            const year = Math.round(xScale.invert(x));
            const yearData = d.find((layerData) => layerData.data.year === year);
            const value = yearData ? yearData.data[d.key] : 0;
            const key = d.key === "renewable" ? "Renewable Energy Consumption" : "Fossil Fuel Consumption";

            vis2_tooltip
            .html(`
                <strong><u>${key}</u></strong><br>
                <div style="text-align: left;"
                    Year: ${year}<br>
                    Value: ${value.toFixed(2)}%
                </div>
            `)
            .style("top", `${event.pageY - 50}px`)
            .style("left", `${event.pageX + 20}px`);
        })
        .on("mouseout", function () {
            d3.select(this).transition()
                        .delay(30)  
                        .style("stroke", "none")
                        .style("opacity", 1);
            vis2_tooltip.style("visibility", "hidden");
        });

    layers.exit()
        .transition()
        .duration(750)
        .style("opacity", 0)
        .remove();

    // Add fossil fuel line chart
const lineGenerator = d3.line()
.x((d) => xScale(d.year))
.y((d) => yRightScale(d.fossilFuel));

// Select existing line or create a new one
const fossilFuelLine = vis2_svg.selectAll(".fossil-fuel-line")
.data([stackData]);

// Enter phase: create the line with initial transparency
fossilFuelLine.enter()
.append("path")
.attr("class", "fossil-fuel-line")
.style("stroke", "red")
.style("stroke-dasharray", "5,5")
.style("fill", "none")
.style("opacity", 0) // Start invisible
.attr("d", lineGenerator) // Initial path (optional)
.transition() // Smoothly transition into view
.duration(750)
.style("opacity", 1)
.attr("d", lineGenerator); // Set the final path

// Update phase: smoothly transition the line
fossilFuelLine
.transition()
.duration(750)
.attr("d", lineGenerator)
.style("opacity", 1); // Ensure full visibility during update

// Exit phase: remove any old line charts
fossilFuelLine.exit()
.transition()
.duration(750)
.style("opacity", 0) // Fade out
.remove();

    });
}



// Tooltip for interactivity
const vis2_tooltip = d3
.select("body")
.append("div")
.attr("class", "tooltip")
.style("width", "130px")
.style("visibility", "hidden")
.style("position", "absolute")
.style("background-color", "#fff")
.style("border", "1px solid #ccc")
.style("padding", "8px")
.style("border-radius", "4px")
.style("font-size", "12px");

function resetTooltipForRenewables() {
    vis2_svg.selectAll(".layer")
    .on("mouseover", function (event, d) {
        d3.select(this).transition()
        .delay(30)
        .style("stroke", "#000")
        .style("stroke-width", 1)
        .style("opacity", 0.8);
        vis2_tooltip.style("visibility", "visible");
    })
    .on("mousemove", function (event, d) {
        const [x] = d3.pointer(event);
        const year = Math.round(xScale.invert(x));
        const yearData = d.find((layerData) => layerData.data.year === year);
        const value = yearData ? yearData.data[d.key] : 0;
        const key = d.key === "renewable" ? "Renewable Energy Consumption" : "Fossil Fuel Consumption";

        vis2_tooltip
        .html(`<strong><u>${key}</u></strong><br>
            <div style="text-align: left;">
                Year: ${year}<br>
                Value: ${value.toFixed(2)}%
            </div>
            `)
        .style("top", `${event.pageY - 50}px`)
        .style("left", `${event.pageX + 20}px`);
    })
    .on("mouseout", function () {
        d3.select(this).transition()
        .delay(30)
        .style("stroke", "none")
        .style("opacity", 1);
        vis2_tooltip.style("visibility", "hidden");
    });
}

function resetTooltipForUK() {
    vis2_svg.selectAll(".layer")
    .on("mouseover", function (event, d) {
        d3.select(this).transition()
        .delay(30)
        .style("stroke", "#000")
        .style("stroke-width", 1)
        .style("opacity", 0.8);
        vis2_tooltip.style("visibility", "visible");
    })
    // Mousemove event to display tooltip
    .on("mousemove", function (event, d) {
        //console.log(d);
        const [x] = d3.pointer(event);
        const year = Math.round(xScale.invert(x));
        const yearData = d.find((layerData) => layerData.data.year === year);
        const value = yearData ? yearData.data[d.key] : 0; // Current data value
        const key = d.key === "combustion" ? "Industrial Combustion" : d.key === "process" ? "Industrial Process" : "Fossil Fuel Consumption";
        
        // Retrieve fossilFuel value directly from the `data` object
        const fossilFuelValue = yearData ? yearData.data.fossilFuel : 0;
    
        vis2_tooltip
        .html(`
            <strong><u>${key}</u></strong><br>
            <div style="text-align: left;">
                Year: ${year}<br>
                Value: ${value.toFixed(2)} ${key === "Fossil Fuel Consumption" ? "%" : "Mt"}<br><br>
                <strong>Fossil Fuel:</strong>${fossilFuelValue}%
            </div>
        `)
        .style("visibility", "visible")
        .style("top", `${event.pageY - 50}px`)
        .style("left", `${event.pageX + 20}px`);
    })
    .on("mouseout", function () {
        d3.select(this).transition()
        .delay(30)
        .style("stroke", "none")
        .style("opacity", 1); 
        vis2_tooltip.style("visibility", "hidden");
    });
}


function activateButton(country, countryCode) {
    // Deactivate all buttons
    d3.selectAll("#vis2-buttons button").classed("active", false);

    // Activate the clicked button
    d3.select(`#vis2-${country}`).classed("active", true);

    // Update the narrative content
    updateNarrative(country);

    // Check which data loading function to use
    if (countryCode === "GBR") {
    loadData2(countryCode);
    resetTooltipForUK();
    } else {
    loadData1(countryCode);
    resetTooltipForRenewables();
    }
}


// Event listeners for buttons
d3.select("#vis2-germany").on("click", () => activateButton("germany", "DEU"));
d3.select("#vis2-france").on("click", () => activateButton("france", "FRA"));
d3.select("#vis2-uk").on("click", () => activateButton("uk", "GBR"));

// Set default to Germany
activateButton("germany", "DEU");
