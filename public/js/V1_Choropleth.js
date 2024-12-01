function init() {
    const w = 600;
    const h = 400;

    let countryISO = "MYS";
    let countryName = "Malaysia";
    let selectedYear = 2020;

    // Map projection and path generator
    const projection = d3.geoMercator()
                         .center([145, -36.5])
                         .translate([w - 150, h + 50])
                         .scale(130);
    const path = d3.geoPath().projection(projection);

    // SVG element creation
    const svg = d3.select("#Map")
                  .append("svg")
                  .attr("width", w)
                  .attr("height", h)
                  .style("background-color", "lightblue");
    const g = svg.append("g");

    // Tooltip setup
    const tooltip = d3.select("body")
                      .append("div")
                      .attr("class", "tooltip")
                      .style("position", "absolute")
                      .style("padding", "10px")
                      .style("background-color", "white")
                      .style("border", "1px solid #ccc")
                      .style("border-radius", "4px")
                      .style("pointer-events", "none")
                      .style("display", "none");

    let hoverTimeout;

    // Color scale based on pollution levels
    const colorScale = d3.scaleThreshold()
        .domain([12, 35, 55, 150])
        .range(["#2ECC71", "#F1C40F", "#E67E22", "#E74C3C", "#8B0000"]);

    // Data storage for CSV files
    let worldBankData = {};
    let pm25Data = {};

    // Load data from CSV files
    function loadData(countryISO, countryName, selectedYear) {
        const worldBankPromise = d3.csv("CSV/World_Bank_Data.csv").then(function(data) {
            data.forEach(d => {
                const key = `${d.CountryCode}-${d.Year}`;
        
                // Ensure the key exists in worldBankData and initialize if not
                if (!worldBankData[key]) {
                    worldBankData[key] = {
                        co2transport: "N/A",
                        co2industrialcombustion: "N/A",
                        co2industrialprocess: "N/A",
                        lifeExpectancy: "N/A",
                        tbIncidence: "N/A",
                        gdpPerCapita: "N/A",
                        gdpGrowth: "N/A",
                        fossilFuelConsumption: "N/A",
                        renewableEnergyConsumption: "N/A"
                    };
                }
        
                // Map Series Code to the corresponding field in worldBankData
                switch (d['SeriesCode']) {
                    case 'EN.GHG.CO2.TR.MT.CE.AR5':
                        worldBankData[key].co2transport = d.Value;
                        break;
                    case 'EN.GHG.CO2.IC.MT.CE.AR5':
                        worldBankData[key].co2industrialcombustion = d.Value;
                        break;
                    case 'EN.GHG.CO2.IP.MT.CE.AR5':
                        worldBankData[key].co2industrialprocess = d.Value;
                        break;
                    case 'SP.DYN.LE00.IN':
                        worldBankData[key].lifeExpectancy = d.Value;
                        break;
                    case 'SH.TBS.INCD':
                        worldBankData[key].tbIncidence = d.Value;
                        break;
                    case 'NY.GDP.PCAP.KN':
                        worldBankData[key].gdpPerCapita = d.Value;
                        break;
                    case 'NY.GDP.PCAP.KD.ZG':
                        worldBankData[key].gdpGrowth = d.Value;
                        break;
                    case 'EG.USE.COMM.FO.ZS':
                        worldBankData[key].fossilFuelConsumption = d.Value;
                        break;
                    case 'EG.FEC.RNEW.ZS':
                        worldBankData[key].renewableEnergyConsumption = d.Value;
                        break;
                    default:
                        // Ignore other series codes or handle additional ones if needed
                        break;
                }
            });
        });
        

        const pm25Promise = d3.csv("CSV/PM2.5_Exposure.csv").then(function(data) {
            data.forEach(d => {
                const key = `${d.ISO}-${d.TIME_PERIOD}`;
                pm25Data[key] = +d.OBS_VALUE;
            });
        });

        // Wait for both datasets to be loaded before setting the default view
        Promise.all([worldBankPromise, pm25Promise]).then(() => {
            console.log("World Bank Data:", worldBankData); // Check if data is loaded correctly
            console.log("PM2.5 Data:", pm25Data);

            // Check if data for Malaysia in 2020 exists
            console.log("Data for Malaysia 2020:", worldBankData["MYS-2020"]);
            console.log("PM2.5 Data for Malaysia 2020:", pm25Data["MYS-2020"]);
            onCountrySelect(countryISO, countryName, selectedYear);
        });
    }


    // Function to update the details box based on country and year
    function updateDetailsBox(countryISO, countryName, year) {
        // Display the selected country name and year
        document.getElementById("country-display").textContent = countryName;
        document.getElementById("year-result").textContent = year;
        document.getElementById("year-slider").value = year;

        // Get data for the selected country and year
        const worldBankKey = `${countryISO}-${year}`;
        const pm25Key = `${countryISO}-${year}`;

        // Update Pollution Section
        const co2 = worldBankData[worldBankKey] || {};
        document.getElementById("pm25-data").textContent = pm25Data[pm25Key] + ("µg/m³") || "N/A";
        document.getElementById("co2-transport-data").textContent = co2.co2transport + ("Mt CO₂e") || "N/A"; // Placeholder
        document.getElementById("co2-industrial-combustion-data").textContent = co2.co2industrialcombustion + ("Mt CO₂e") || "N/A"; // Placeholder
        document.getElementById("co2-industrial-processes-data").textContent = co2.co2industrialprocess + ("Mt CO₂e") || "N/A"; // Placeholder

        // Update Health Section
        const healthData = worldBankData[worldBankKey] || {};
        document.getElementById("life-expectancy-data").textContent = healthData.lifeExpectancy + ("years") || "N/A";
        document.getElementById("tb-incidence-data").textContent = healthData.tbIncidence || "N/A";

        // Update Economy Section
        document.getElementById("gdp-per-capita-data").textContent = healthData.gdpPerCapita || "N/A";
        document.getElementById("gdp-growth-data").textContent = healthData.gdpGrowth + ("%") || "N/A";

        // Update Energy Section
        document.getElementById("fossil-fuel-consumption-data").textContent = healthData.fossilFuelConsumption + ("%") || "N/A";
        document.getElementById("renewable-energy-consumption-data").textContent = healthData.renewableEnergyConsumption + ("%") || "N/A";
    }

    // Event handler for country selection on the map or search bar
    function onCountrySelect(countryISO, countryName, year) {
        updateDetailsBox(countryISO, countryName, year);

        // Add listener to year slider for updates
        document.getElementById("year-slider").addEventListener("input", function() {
            const selectedYear = this.value;
            console.log(selectedYear);
            updateDetailsBox(countryISO, countryName, selectedYear);
            g.selectAll("path")
                .transition()
                .duration(600)
                .attr("fill", function(d) {
                    const pollutionValue = pollutionData[`${d.properties.GID_0}-${selectedYear}`];
                    return pollutionValue !== undefined ? colorScale(pollutionValue) : "#ccc";
            });
        });
    }
    


    // Show and hide tooltip functions
    function showTooltipWithDelay(event, d) {
        hoverTimeout = setTimeout(() => {
            tooltip.style("display", "block")
                   .html(d.properties.COUNTRY)
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 20) + "px");
        }, 1000);
    }

    function hideTooltip() {
        clearTimeout(hoverTimeout);
        tooltip.style("display", "none");
    }

    // Predefined zoom levels
    const zoomLevels = [1, 1.3, 1.6, 1.9, 2.2];
    let currentZoomLevelIndex = 0;

    

    // Zoom control functions
    function updateZoomLevel(increase) {
        if (increase && currentZoomLevelIndex < zoomLevels.length - 1) {
            currentZoomLevelIndex++;
        } else if (!increase && currentZoomLevelIndex > 0) {
            currentZoomLevelIndex--;
        }
        const newZoomLevel = zoomLevels[currentZoomLevelIndex];
        svg.transition()
            .duration(500)
            .call(zoom.scaleTo, newZoomLevel);
        
        // Update the slider position based on zoom level
        d3.select("#zoom-slider").property("value", currentZoomLevelIndex + 1);
    }

    // Event listener for zoom changes
    const zoom = d3.zoom().scaleExtent([1, 2.2]).on("zoom", (event) => {
        g.attr("transform", event.transform);

        // Find the closest zoom level and update the slider
        const closestZoomLevel = zoomLevels.reduce((prev, curr) => 
            Math.abs(curr - event.transform.k) < Math.abs(prev - event.transform.k) ? curr : prev);
        currentZoomLevelIndex = zoomLevels.indexOf(closestZoomLevel);
        d3.select("#zoom-slider").property("value", currentZoomLevelIndex + 1);
    });

    svg.call(zoom);

    d3.select("#zoom-in").on("click", () => updateZoomLevel(true));
    d3.select("#zoom-out").on("click", () => updateZoomLevel(false));

    d3.select("#zoom-slider").on("input", function() {
        const levelIndex = +this.value - 1;
        currentZoomLevelIndex = levelIndex;
        svg.transition().call(zoom.scaleTo, zoomLevels[levelIndex]);
    });

    // Year input element reference
    const yearInput = document.getElementById("year-search");

    function clampYear() {
        let year = parseInt(yearInput.value);
        if (isNaN(year)) year = 2000;
        year = Math.min(2020, Math.max(2000, year));
        yearInput.value = year;
        updateMapColors();
    }

    // Update map colors based on selected year
    function updateMapColors() {
        const year = yearInput.value;
        g.selectAll("path")
            .transition()
            .duration(600)
            .attr("fill", function(d) {
                const pollutionValue = pollutionData[`${d.properties.GID_0}-${year}`];
                return pollutionValue !== undefined ? colorScale(pollutionValue) : "#ccc";
            });
    }

    // Pollution data loading
    let pollutionData = {};
    d3.csv("CSV/PM2.5_Exposure.csv").then(function(data) {
        data.forEach(d => {
            const key = `${d.ISO}-${d.TIME_PERIOD}`;
            pollutionData[key] = +d.OBS_VALUE;
        });
        loadRegionData("Asia");
        loadRegionData("Europe");
        yearInput.addEventListener("change", updateMapColors);
    });

    // Load and display data for specific region
    function loadRegionData(region) {
        fetch(`Combined/Combined${region}.js`)
            .then(response => response.json())
            .then(filenames => {
                return Promise.all(filenames.map(filename => d3.json(`Continents/${region}/${filename}`)));
            })
            .then(dataArray => {
                dataArray.forEach(data => {
                    g.selectAll("path-" + region)
                        .data(data.features)
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .attr("fill", function(d) {
                            const year = yearInput.value;
                            const isoCode = d.properties.GID_0;
                            const pollutionValue = pollutionData[`${isoCode}-${year}`];
                            return pollutionValue !== undefined ? colorScale(pollutionValue) : "#ccc";
                        })
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.3)
                        .on("mouseover", (event, d) => {
                            showTooltipWithDelay(event, d);
                            const originalColor = d3.select(event.target).attr("fill");
                            d3.select(event.target)
                                .style("cursor", "pointer")
                                .transition()
                                .duration(200)
                                .attr("fill", d3.color(originalColor).brighter(0.5));
                        })
                        .on("mousemove", (event) => {
                            if (tooltip.style("display") === "block") {
                                tooltip.style("left", (event.pageX + 10) + "px")
                                       .style("top", (event.pageY - 20) + "px");
                            }
                        })
                        .on("mouseout", (event) => {
                            hideTooltip();
                            d3.select(event.target)
                                .transition()
                                .duration(400)
                                .attr("fill", function(d) {
                                    const pollutionValue = pollutionData[`${d.properties.GID_0}-${yearInput.value}`];
                                    return pollutionValue !== undefined ? colorScale(pollutionValue) : "#ccc";
                                });
                        })
                        .on("click", (event,d) => {
                            const countryISO = d.properties.GID_0; // Replace with the correct property for the country ISO code
                            const countryName = d.properties.COUNTRY; // Replace with the correct property for the country name
                            const year = document.getElementById("year-search").value; // Current selected year
                            const inputElement = document.getElementById("country-search");
                            inputElement.value = countryName; // Set the input field value to the country name
                            setTimeout(() => {
                                inputElement.value = "";
                                console.log("Change: ",inputElement.value)
                            }, 3000);

                            // Call onCountrySelect with the clicked country's details
                            onCountrySelect(countryISO, countryName, year);
                        })
                });
                updateMapColors();
            });
    }

    // Year control event listeners
    document.getElementById("year-decrease").addEventListener("click", () => {
        yearInput.value = Math.max(2000, parseInt(yearInput.value) - 1);
        clampYear();
    });

    document.getElementById("year-increase").addEventListener("click", () => {
        yearInput.value = Math.min(2020, parseInt(yearInput.value) + 1);
        clampYear();
    });

    yearInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            clampYear();
        }
    });

    yearInput.addEventListener("input", () => {
        yearInput.value = yearInput.value.replace(/[^0-9]/g, "");
    });
    yearInput.addEventListener("blur", clampYear);

    // Country search functionality
    function searchCountry() {
        const inputElement = document.getElementById("country-search");
        console.log(inputElement);
        console.log(inputElement.placeholder);
        const inputYear = document.getElementById("year-search");
        const input = inputElement.value.trim().toLowerCase().replace(/\s+/g, '');
        const year = inputYear.value;
        
        const continents = ["Asia", "Europe"];
        const searchPromises = continents.map(continent =>
            fetch(`Combined/Combined${continent}.js`)
                .then(response => response.json())
                .then(data => {
                    const countries = data.map(country => country.replace(".json", "").toLowerCase().replace(/\s+/g, ''));
                    if (countries.includes(input)) {
                        return { found: true, continent };
                    }
                    return { found: false };
                })
        );

        Promise.all(searchPromises).then(results => {
            const match = results.find(result => result && result.found);
            if (match) {
                console.log("Result is:", match);
                fetch(`Continents/${match.continent}/${input}.json`)
                    .then(response => response.json())
                    .then(countryData => {
                        // Assume the ISO code is available in countryData.ISO or modify as per actual data structure
                        countryISO = countryData.features[0].properties.GID_0; // Extract ISO code
                        countryName = countryData.features[0].properties.COUNTRY; 
                        console.log("ISO: ", countryName);

                        // Highlight the country by alternating its color
                        const countryPath = g.selectAll("path")
                            .filter(d => d.properties.COUNTRY.toLowerCase().replace(/\s+/g, '') === input);

                        const originalColor = countryPath.attr("fill");

                        function shineEffect(repeat) {
                            if (repeat > 0) {
                                countryPath
                                    .transition()
                                    .duration(600)
                                    .attr("fill", "blue")
                                    .transition()
                                    .duration(700)
                                    .attr("fill", originalColor)
                                    .on("end", () => shineEffect(repeat - 1));
                            }
                        }

                        shineEffect(4);

                        // Call updateDetailsBox with ISO code, country name, and year
                        console.log("Country Name: " + countryName);
                        console.log("Year: " + year);
                        onCountrySelect(countryISO, countryName, year);
                        updateDetailsBox(countryISO, countryName, year);
                        
                    });

                setTimeout(() => {
                    inputElement.value = "";
                    console.log("Change: ",inputElement.value)
                }, 3000);
            } else {
                inputElement.value = '';  // Clear the iput
                inputElement.placeholder = "Country not found!";
                console.log(inputElement.placeholder);
                
                // Revert back to original placeholder after 2 seconds
                setTimeout(() => {
                    inputElement.placeholder = "Enter country name";
                }, 3000);
            }
        });
    }


    document.getElementById("country-search-button").addEventListener("click", searchCountry);
    document.getElementById("country-search").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            searchCountry();
        }
    });

    loadData(countryISO, countryName, selectedYear);


}

init();
