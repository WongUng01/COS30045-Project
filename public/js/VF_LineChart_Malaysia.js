function init() {
    var margin = {top: 20, right: 20, bottom: 30, left: 60},
        w = 800,
        h = 400,
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    // Load the dataset
    d3.csv("CSV/World_Bank_Data_Malaysia.csv", function(d) {
        return {
            series: d["Series Name"],
            date: new Date(d.Year),
            value: d.Value === "N/A" ? 0 : +d.Value // Handle "N/A" as 0
        };
    }).then(function(dataset) {
        // Group data by series
        var groupedData = d3.group(dataset, d => d.series);

        // Normalize each series (2000 = 100)
        groupedData.forEach(function(values, seriesName) {
            var baseline = values.find(d => d.date.getFullYear() === 2000)?.value || 1;
            values.forEach(function(d) {
                d.index = (d.value / baseline) * 100;
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
            var line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.index));

            svg.append("path")
                .datum(values)
                .attr("class", "line")
                .attr("d", line)
                .style("stroke", colorScale(seriesName))
                .style("stroke-width", 2)
                .style("fill", "none");
        });

        // Add legend
        var legend = svg.append("g")
            .attr("transform", `translate(${width + 20}, 20)`);

        Array.from(groupedData.keys()).forEach((seriesName, i) => {
            var legendItem = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendItem.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colorScale(seriesName));

            legendItem.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .text(seriesName)
                .style("font-size", "12px")
                .style("alignment-baseline", "middle");
        });
    });
}

// Call the init function
init();
