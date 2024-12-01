// Set dimensions and margins
const vis4_margin = { top: 20, right: 50, bottom: 50, left: 50 };
const vis4_width = 800 - vis4_margin.left - vis4_margin.right;
const vis4_height = 380 - vis4_margin.top - vis4_margin.bottom;

// Create the SVG container
const vis4_svg = d3
.select("#vis4-chart")
.attr("vis4_width", vis4_width + vis4_margin.left + vis4_margin.right)
.attr("vis4_height", vis4_height + vis4_margin.top + vis4_margin.bottom)
.append("g")
.attr("transform", `translate(${vis4_margin.left},${vis4_margin.top})`);

// Define scales
const vis4_xScale = d3.scaleLinear().range([0, vis4_width]);
const vis4_yScale = d3.scaleLinear().range([vis4_height, 0]);

//Color sheme for stacke area chart (Transport, Industrial Combustion, Industrial Processes)
const stackedColors = d3.scaleOrdinal().range(["#87CEEB ", "#FFA500", "#708090"]);

//Cholor scheme for the scatter plot chart (Life Expectance, Incidence)
const scatterColors = d3.scaleOrdinal().range(["#00008B ", "#006400"]);

// Chart descriptions
const vis4Descriptions = {
  lineTrend: `
      <h2><u>Trend Analysis</u></h2>
      <p>
        This chart highlights the trend of <i>PM2.5 levels</i> in <b>Malaysia, Thailand, Singapore, and Indonesia</b> from <b>2000 to 2020</b>. 
        It provides an overview of how air quality has evolved across these countries over time, helping identify significant patterns and regional differences.
        The data shows fluctuations in air quality, with some countries exhibiting steady improvement while others face persistent challenges.
      </p>
      <p>
        <i>PM2.5</i> refers to <b>fine particulate matter</b> smaller than 2.5 micrometers in diameter, which can pose severe health risks when levels exceed safe limits. 
        Monitoring trends in <b>PM2.5 exposure</b> is crucial for understanding the effectiveness of air quality management policies and identifying areas that require urgent intervention to protect public health and the environment.
      </p>
      `,
    healthMetrics: `
      <h2><u>Health Metrics</u></h2>
      <p>
        This chart correlates <i>PM2.5 exposure levels</i> with key health indicators, such as <b>life expectancy</b> and the <b>incidence of tuberculosis</b>. 
        The dual y-axis provides a comprehensive view of how air quality impacts health outcomes, while a slider allows you to focus on specific years for deeper analysis.
      </p>
      <p>
        <b>PM2.5</b> exposure is a critical measure of air quality, directly linked to respiratory and cardiovascular health issues. 
        Use this chart to explore the relationship between <b>PM2.5 levels</b> and public health indicators, highlighting the importance of effective air pollution control measures.
      </p>
    `,
    EandC: `
      <h2><u>Emissions and Consumption</u></h2>
      <p>
        This visualization provides an in-depth look at <i>CO2 emissions</i> and <i>energy consumption trends</i> in Malaysia. 
        The stacked area chart highlights contributions from <b>industrial combustion</b>, <b>industrial processes</b>, and <b>transportation</b> to total CO2 emissions, 
        while the line chart reveals trends in renewable and fossil fuel energy consumption. Together, these elements offer a dual perspective on Malaysia's environmental and energy challenges.
      </p>
      <p>
        The trends shown reflect both the ongoing reliance on fossil fuels and gradual shifts toward renewable energy. By analyzing this data, 
        users can assess the effectiveness of Malaysia’s energy policies and identify areas requiring further intervention to reduce emissions and promote sustainability. 
        This chart serves as a tool for understanding the impact of energy use on environmental outcomes.
      </p>
    `,
  };

// Function to update the description
function updateDescription(chartType){
    const description = vis4Descriptions[chartType] || "<p>Not available</p>"
    d3.select("#vis4-chart-info").html(description)
}

// Function to load Trend Analysis
function loadTrendAnalysis() {
  // Clear only the chart elements but not the axes groups
  vis4_svg.selectAll("*").remove();

  // Remove the slider container (if it exists)
  d3.select("#slider-container").remove();
  
  // Add axes groups with new class names
  const lineAnalysis_xAxisGroup = vis4_svg.append("g")
      .attr("class", "lineAnalysis-axis-x")
      .attr("transform", `translate(0,${vis4_height})`);
  
  const lineAnalysis_yAxisGroup = vis4_svg.append("g")
      .attr("class", "lineAnalysis-axis-y");

    // Load PM2.5 data
    d3.csv("CSV/PM2.5_Exposure.csv").then((data) => {
        // Filter data for the selected countries
        const countries = ["Malaysia", "Thailand", "Singapore", "Indonesia"];
        const filteredData = data.filter(d => countries.includes(d.Country));

        // Parse numeric values
        filteredData.forEach(d => {
            d.TIME_PERIOD = +d.TIME_PERIOD;
            d.OBS_VALUE = +d.OBS_VALUE;
        });

        // Group data by country
        const countryData = d3.group(filteredData, d => d.Country);

        // Set up scales
        xScale.domain(d3.extent(filteredData, d => d.TIME_PERIOD)); // Time period range
        yScale.domain([0, d3.max(filteredData, d => d.OBS_VALUE)]); // PM2.5 levels range

        // Add or update axes
        lineAnalysis_xAxisGroup
            .transition().duration(750)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
        lineAnalysis_yAxisGroup
            .transition().duration(750)
            .call(d3.axisLeft(yScale).ticks(10));

        // Add or update axis labels (recreate if missing)
        if (!vis4_svg.select(".x-axis-label").node()) {
            vis4_svg.append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", vis4_width / 2)
                .attr("y", vis4_height + vis4_margin.bottom - 5)
                .text("Year")
                .style("font-size", "14px");
        }

        if (!vis4_svg.select(".y-axis-label").node()) {
            vis4_svg.append("text")
                .attr("class", "y-axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -vis4_height / 2)
                .attr("y", -vis4_margin.left + 15)
                .text("PM2.5 Levels (µg/m³)")
                .style("font-size", "14px");
        }

        // Define line generator
        const line = d3.line()
            .x(d => xScale(d.TIME_PERIOD))
            .y(d => yScale(d.OBS_VALUE));

        // Add lines for each country
        countryData.forEach((values, country) => {
            vis4_svg.append("path")
                .datum(values)
                .attr("class", "chart-element") // For easy removal during updates
                .attr("fill", "none")
                .attr("stroke", getCountryColor(country)) // Use a color scheme
                .attr("stroke-width", 2)
                .attr("d", line);

            // Add country labels at the end of the lines
            const lastPoint = values[values.length - 1];
            vis4_svg.append("text")
                .attr("class", "chart-element") // For easy removal during updates
                .attr("x", xScale(lastPoint.TIME_PERIOD) - 10)
                .attr("y", yScale(lastPoint.OBS_VALUE) - 8)
                .text(country)
                .style("font-size", "12px")
                .style("fill", getCountryColor(country));
        });

        // Tooltip interactivity
        const tooltip = d3.select("body").append("div")
            .attr("class", "vis4_tooltip")
            .style("visibility", "hidden");

        vis4_svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "chart-element") // For easy removal during updates
            .attr("cx", d => xScale(d.TIME_PERIOD))
            .attr("cy", d => yScale(d.OBS_VALUE))
            .attr("r", 4)
            .attr("fill", d => getCountryColor(d.Country))
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`<strong>${d.Country}</strong><br>Year: ${d.TIME_PERIOD}<br>PM2.5: ${d.OBS_VALUE}`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", `${event.pageY - 50}px`)
                    .style("left", `${event.pageX + 20}px`);
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"));
    });
}

// Utility function to assign colors
function getCountryColor(country) {
    const colors = {
        Malaysia: "blue",
        Thailand: "orange",
        Singapore: "green",
        Indonesia: "purple"
    };
    return colors[country] || "gray";
}




function loadHealth() {
  // Clear existing elements
  vis4_svg.selectAll("*").remove();

  // Create a container for the slider dynamically
  d3.select("#vis4-chart-slider")
    .append("div")
    .attr("id", "slider-container")
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("justify-content", "center")
    .style("align-items", "center")
    .style("margin-top", "10px") // Adjust spacing above the slider
    .style("margin-bottom", "10px") // Adjust spacing below the slider
    .html(`
      <label for="year-slider" style="margin-right: 10px; font-weight: bold;">Year:</label>
      <input type="range" id="year-slider" min="2000" max="2020" value="2000" step="1" style="width: 300px;">
      <span id="year-value" style="margin-left: 10px; font-weight: bold;">2000</span>
    `);

  // Load both datasets
  Promise.all([
    d3.csv("CSV/PM2.5_Exposure.csv"),
    d3.csv("CSV/World_Bank_Data_Asia.csv"),
  ]).then(([pm25Data, worldBankData]) => {
    // Prepare PM2.5 data
    const pm25Filtered = pm25Data.map(d => ({
      Country: d.Country,
      Year: +d.TIME_PERIOD,
      PM2_5: +d.OBS_VALUE,
    }));

    // Filter World Bank data for life expectancy and tuberculosis incidence
    const lifeExpectancy = worldBankData
      .filter(d => d.SeriesCode === "SP.DYN.LE00.IN")
      .map(d => ({
        Country: d.CountryName,
        Year: +d.Year,
        LifeExpectancy: +d.Value,
      }));

    const tuberculosis = worldBankData
      .filter(d => d.SeriesCode === "SH.TBS.INCD")
      .map(d => ({
        Country: d.CountryName,
        Year: +d.Year,
        Tuberculosis: +d.Value,
      }));

    // Combine data by matching Country and Year
    const combinedData = pm25Filtered
      .filter(pm => pm.Country === "Malaysia") // Filter for Malaysia
      .map(pm => {
        const life = lifeExpectancy.find(l => l.Country === pm.Country && l.Year === pm.Year);
        const tb = tuberculosis.find(t => t.Country === pm.Country && t.Year === pm.Year);
        return {
          Country: pm.Country,
          Year: pm.Year,
          PM2_5: pm.PM2_5,
          LifeExpectancy: life ? life.LifeExpectancy : null,
          Tuberculosis: tb ? tb.Tuberculosis : null,
        };
      })
      .filter(d => d.LifeExpectancy && d.Tuberculosis); // Remove incomplete data

    // Define scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(combinedData, d => d.PM2_5) - 2, d3.max(combinedData, d => d.PM2_5) + 2])
      .range([0, vis4_width]);

    const yLeftScale = d3.scaleLinear()
      .domain([d3.min(combinedData, d => d.LifeExpectancy) - 1, d3.max(combinedData, d => d.LifeExpectancy) + 1])
      .range([vis4_height, 0]);

    const yRightScale = d3.scaleLinear()
      .domain([0, d3.max(combinedData, d => d.Tuberculosis) + 3])
      .range([vis4_height, 0]);

    // Add axes
    vis4_svg.append("g")
      .attr("class", "lineAnalysis-axis")
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0, ${vis4_height})`);

    vis4_svg.append("g")
      .attr("class", "lineAnalysis-axis")
      .call(d3.axisLeft(yLeftScale));

    vis4_svg.append("g")
      .attr("class", "lineAnalysis-axis")
      .call(d3.axisRight(yRightScale))
      .attr("transform", `translate(${vis4_width}, 0)`);

    // Add axis labels
    vis4_svg.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", vis4_width / 2)
      .attr("y", vis4_height + vis4_margin.bottom - 5)
      .text("PM2.5 Levels (µg/m³)");

    vis4_svg.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis4_height / 2)
      .attr("y", -vis4_margin.left + 15)
      .text("Life Expectancy (Years)");

    vis4_svg.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis4_height / 2)
      .attr("y", vis4_width + vis4_margin.right - 15)
      .text("Tuberculosis Incidence (per 100k)");

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "vis4_tooltip")
      .style("visibility", "hidden");

    // Add event listener to the slider
    d3.select("#year-slider").on("input", function () {
      const selectedYear = +this.value; // Get the selected year
      d3.select("#year-value").text(selectedYear); // Update displayed year

      // Dim other years' points
      vis4_svg.selectAll("circle")
        .style("opacity", 0.2); // Dim all points

      // Highlight points for the selected year
      vis4_svg.selectAll("circle")
        .filter(d => d.Year === selectedYear)
        .style("opacity", 1);
    });

    // Plot scatter points
    vis4_svg.selectAll(".scatter-life")
      .data(combinedData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.PM2_5))
      .attr("cy", d => yLeftScale(d.LifeExpectancy))
      .attr("r", 4)
      .style("fill", scatterColors(0))
      .style("opacity", 0.7)
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .html(`
            <strong>${d.Country}</strong><br>
            Year: ${d.Year}<br>
            PM2.5: ${d.PM2_5}<br>
            <span style="color: #00008B;">Life Expectancy:</strong></span> ${d.LifeExpectancy}<br>
            <span style="color: #006400;"><strong>Tuberculosis Incidence:</strong></span> ${d.Tuberculosis}
          `);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY - 50}px`)
          .style("left", `${event.pageX + 20}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    vis4_svg.selectAll(".scatter-tb")
      .data(combinedData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.PM2_5))
      .attr("cy", d => yRightScale(d.Tuberculosis))
      .attr("r", 4)
      .style("fill", scatterColors(1))
      .style("opacity", 0.7)
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .html(`
            <strong>${d.Country}</strong><br>
            Year: ${d.Year}<br>
            PM2.5: ${d.PM2_5}<br>
            <span style="color: #00008B;">Life Expectancy:</strong></span> ${d.LifeExpectancy}<br>
            <span style="color: #006400;"><strong>Tuberculosis Incidence:</strong></span> ${d.Tuberculosis}
          `);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY - 50}px`)
          .style("left", `${event.pageX + 20}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));
  });
}


function loadEandC() {
  vis4_svg.selectAll("*").remove();

  // Remove the slider container (if it exists)
  d3.select("#slider-container").remove();

  const xAxisGroup = vis4_svg.append("g")
      .attr("class", "axis-x")
      .attr("transform", `translate(0,${vis4_height})`);

  const yAxisGroup = vis4_svg.append("g")
      .attr("class", "axis-y");


  const yAxisRightGroup = vis4_svg.append("g")
    .attr("class", "axis-y-right")
    .attr("transform", `translate(${vis4_width + 10}, 0)`); // Right axis position

  // Create tooltip div
  const EandCtooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("width", "130px")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.2)")
      .style("visibility", "hidden")
      .style("pointer-events", "none");

  // Load the CSV file
  d3.csv("CSV/World_Bank_Data_Asia.csv").then(data => {
      // Filter for Malaysia
      const malaysiaData = data.filter(d => d.CountryName === "Malaysia");

      // Prepare the emissions data
      const emissionTypes = [
          "Carbon dioxide (CO2) emissions from Transport (Energy) (Mt CO2e)",
          "Carbon dioxide (CO2) emissions from Industrial Combustion (Energy) (Mt CO2e)",
          "Carbon dioxide (CO2) emissions from Industrial Processes (Mt CO2e)"
      ];

      const energyConsumptionTypes = [
        "Renewable energy consumption (% of total final energy consumption)",
        "Fossil fuel energy consumption (% of total)"
      ];

      // Pivot data: group by year and create columns for each emission type
      const emissionsData = d3.groups(malaysiaData, d => d.Year)
          .map(([year, group]) => {
              const row = { year: +year };
              emissionTypes.forEach(type => {
                  const entry = group.find(d => d["Series Name"] === type);
                  row[type] = entry ? +entry.Value : 0; // Use 0 if no value
              });
              energyConsumptionTypes.forEach(type => {
                const entry = group.find(d => d["Series Name"] === type);
                row[type] = entry ? +entry.Value : 0; // Use 0 if no value
              });
              return row;
          });

      // Update scales
      xScale.domain(d3.extent(emissionsData, d => d.year));
      yScale.domain([0, d3.max(emissionsData, d =>
          d[emissionTypes[0]] + d[emissionTypes[1]] + d[emissionTypes[2]]
      )]);

      const yRightScale = d3.scaleLinear()
        .domain([0, 100]) // Percentage for right axis
        .range([vis4_height, 0]);

      // Stack the data
      const stack = d3.stack().keys(emissionTypes);
      const stackedData = stack(emissionsData);

      // Define the area generator
      const area = d3.area()
          .x(d => xScale(d.data.year))
          .y0(d => yScale(d[0]))
          .y1(d => yScale(d[1]));

      // Draw the stacked area chart
      vis4_svg.selectAll(".area")
          .data(stackedData)
          .join("path")
          .attr("class", "area")
          .attr("d", area)
          .attr("fill", d => stackedColors(d.key))
          .on("mouseover", function (event,d){
            d3.select(this).transition()
                    .delay(30)
                    .style("stroke", "#000")
                    .style("stroke_width", 1)
                    .style("opacity", 0.8);
            EandCtooltip.style("visibility", "visible");
          })
          .on("mousemove", function (event, d) {
              // Get mouse position and data point
              const[x] = d3.pointer(event);
              const year = Math.round(xScale.invert(x));
              const yearData = d.find((layerData) => layerData.data.year === year);
              const value = yearData ? yearData.data[d.key] : 0;
              var key = null;

              // Renewable and Fossil Fuel values
              const renewable = yearData ? yearData.data["Renewable energy consumption (% of total final energy consumption)"] : 0;
              const fossilFuel = yearData ? yearData.data["Fossil fuel energy consumption (% of total)"] : 0;
              

              if(d.key === "Carbon dioxide (CO2) emissions from Transport (Energy) (Mt CO2e)"){
                key = "Transport";
              }else if(d.key === "Carbon dioxide (CO2) emissions from Industrial Combustion (Energy) (Mt CO2e)"){
                key = "Industrial Combustion";
              }else{
                key = "Industrial Processes";
              }

              EandCtooltip
              .html(`
                <strong><u>${key}</u></strong><br>
                <div style="text-align: left;">
                  Year: ${year}<br>
                  Value: ${value.toFixed(2)}%<br><br>
                  <strong>Renewable:</strong> ${renewable}%<br>
                  <strong>Fossil Fuel:</strong> ${fossilFuel}%
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
              EandCtooltip.style("visibility", "hidden");
          });

                  // Define line generator
      const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yRightScale(d["Renewable energy consumption (% of total final energy consumption)"]));

      const line2 = d3.line()
          .x(d => xScale(d.year))
          .y(d => yRightScale(d["Fossil fuel energy consumption (% of total)"]));

      // Draw the lines
      vis4_svg.append("path")
        .datum(emissionsData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-dasharray", "6")
        .attr("d", line);

      vis4_svg.append("path")
          .datum(emissionsData)
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-dasharray", "6")
          .attr("d", line2);

      // Add axes
      xAxisGroup.call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
      yAxisGroup.call(d3.axisLeft(yScale));
      yAxisRightGroup.call(d3.axisRight(yRightScale));

      // Add Y-axis label (left)
      vis4_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40) // Position left of Y-axis
        .attr("x", -(vis4_height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")   
        .style("font-size", "14px")
        .text("CO2 Emissions (Mt CO2e)");

      // Add Y-axis label (right)
      vis4_svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", vis4_width + 30) // Move this value to control the position outside the right Y-axis
          .attr("x", -(vis4_height / 2)) // Center the label vertically
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .text("Energy Consumption (%)");


      // Add X-axis label
      vis4_svg.append("text")
        .attr("x", vis4_width / 2)
        .attr("y", vis4_height + 40) // Position below X-axis
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Year");

      yAxisGroup.raise();
      yAxisRightGroup.raise();

  }).catch(error => {
      console.error("Error loading or processing data:", error);
  });
}

function activateTypeButton(Type) {
    // Deactivate all buttons
    d3.selectAll("#vis4-buttons button").classed("active", false);

    // Activate the clicked button
    d3.select(`#vis4-${Type}`).classed("active", true);

    // Update the description
    updateDescription(Type);

    // Check which data loading function to use
    if (Type === "lineTrend") {
        loadTrendAnalysis();
    } else if (Type === "healthMetrics") {
        loadHealth();
    } else {
        loadEandC();
    }
}

// Event listeners for buttons
d3.select("#vis4-lineTrend").on("click", () => activateTypeButton("lineTrend"));
d3.select("#vis4-healthMetrics").on("click", () => activateTypeButton("healthMetrics"));
d3.select("#vis4-EandC").on("click", () => activateTypeButton("EandC"));

// Set default to lineTrend
activateTypeButton("lineTrend");
