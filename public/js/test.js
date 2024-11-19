function init() {
    /* Margin object for the chart */
    var margin = {top: 20, right: 20, bottom: 30, left: 60},
        /* Width of the chart */
        w = 600,
        /* Height of the chart */
        h = 300,
        /* Padding for the chart */
        padding = 0,
        /* Computed width of the chart */
        width = w - margin.left - margin.right,
        /* Computed height of the chart */
        height = h - margin.top - margin.bottom;

    // Load the CSV data
    d3.csv("CSV/World_Bank_Data.csv", function(d) {
        return {
            date: +d.Year,
            value: +d.Value
        };
    }).then(function(dataset) {
       
    });
}

// Call the init function to render the line and area charts
init();