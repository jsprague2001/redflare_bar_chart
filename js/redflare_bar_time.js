// ========================================
// ======= Bar Chart (Time Series) ========
// ========================================

// Find the Redflare CSS sheet 
for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].title == 'redflare_css') {
        var redflare_index = i;
    }
}

// Find all Bar Charts on page
var rfHist_nodeListLen = document.getElementsByClassName("rfBarTime").length;
var rfHist_nodeList = document.getElementsByClassName("rfBarTime");
for (var i = 0; i < rfHist_nodeListLen; i++) {
    var rfChart_id = rfHist_nodeList[i].id;
    console.log('RF ID: ', rfChart_id);
    // Find the matching style rule
    var rf_cssRulesLen = document.styleSheets[redflare_index].cssRules.length;
    for (var j = 0; j < rf_cssRulesLen; j++) {
        if (document.styleSheets[redflare_index].cssRules[j].selectorText == '#' + rfChart_id) {
            var cssRules_index = j;
        }
    }
    var rfChart_style = document.styleSheets[redflare_index].cssRules[cssRules_index].style; 
    // Pass chart ID and style rule to function
    drawData_chart(rfChart_id, rfChart_style);
}

// Main function for drawing the histogram
// Unique thing about this chart is that it has 2 X scales
// 1 for sizing the scale to use bandwidth() the other to take advantage of scaledate()
function drawData_chart(data_chart_id, rfChart_style) {
    // Get div size
    var divWidth = document.getElementById(data_chart_id).offsetWidth;
    var divHeight = document.getElementById(data_chart_id).offsetHeight;
    
    // Set the margins of the chart, standard d3 style
    var margin = {top: 20, right: 20, bottom: 40, left: 63},
        width = divWidth - margin.left - margin.right,
        height = divHeight - margin.top - margin.bottom;
    
    var barPadding = .05;
    
    // Get custom CSS values
    var xSource  = rfChart_style.getPropertyValue('--xSource');
    var xLegend  = rfChart_style.getPropertyValue('--xLegend');
    var yLegend  = rfChart_style.getPropertyValue('--yLegend');
    var numTicks = Number(rfChart_style.getPropertyValue('--numTicks'));
    var bPadding  = rfChart_style.getPropertyValue('--bPadding');
    var dataFile = rfChart_style.getPropertyValue('--dataFile').trim();
    var ttLabelDt  = rfChart_style.getPropertyValue('--ttLabelDt');
    var ttLabelVal  = rfChart_style.getPropertyValue('--ttLabelVal');
    var ttDateStyle = rfChart_style.getPropertyValue('--ttDateStyle');
    var ttBackground  = rfChart_style.getPropertyValue('--ttBackground');
    var barStyle  = rfChart_style.getPropertyValue('--barStyle');
    
    // Setup the X, Y Scales
    var x = d3.scaleBand()
        .padding(barPadding)
        .range([0, width]);
    
    // Setup date array for X scale
    var parseTime = d3.timeParse("%m/%d/%Y");
    var scaleDates = new Array();
    var xScaleTime1 = d3.scaleTime();
    
    var y = d3.scaleLinear()
        .range([height, 0]);
    
    // Define the tooltip div
    var div = d3.select("#" + data_chart_id).append("div")	
        .attr("class", "tooltip");

    // Debugging 
    console.log('Div W x H: ', divWidth, divHeight);
    console.log('Chart W x H: ', width, height);
    
    // append the svg object to the div
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#" + data_chart_id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // .attr("style", "outline: thin solid gray;")
    .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

    // Draw a line to enhance the X scale
    svg.append("g")         
    .append("line") 
        .style("stroke", "black")
        .style("stroke-width", 1)
        .attr("x1", 0).attr("y1", height + .5 )
        .attr("x2", width + 1).attr("y2", height + .5);

    // Source Text
    svg.append("g") 
        .attr("transform", "translate(0," + height + ")")    
    .append("text")
        .attr("x", -margin.left + 7)
        .attr("y", + (margin.bottom - 7))
        .attr("fill", "#000")
        .attr("font-family", "Arial")
        .attr("font-size", ".5em")
        .attr("text-anchor", "start")
        .text(xSource);

    //////////////////////////////////
    // Get data, start data-loop
    //////////////////////////////////
    d3.csv(dataFilePath + dataFile, function(error, data) {
    if (error) throw error;

        // Format data, build array
        data.forEach(function(d) {
            d.rowAmount = +d.rowAmount;
            d.rowDate = parseTime(d.rowDate);
            scaleDates.push(d.rowDate);
        });

        // Sort the data by dates, from oldest to newest
        data.sort(function(a,b) { return new Date(a.rowDate) - new Date(b.rowDate) }); 

        // Scale the range of the data in the domains
        x.domain(data.map(function(d) { return d.rowDate; }));
        y.domain([0, d3.max(data, function(d) { return d.rowAmount; })]);

        // Append the bars to the histogram 
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", barStyle)
            .attr("x", function(d) { return x(d.rowDate); })
            // Reverse start point in case you need rising animation
            .attr("y", height)
            .attr("height", 0) 
            .attr("width", x.bandwidth())
            .on("mouseover", function(d) {
                var ttDtStyle = formatDate(d.rowDate, ttDateStyle);
                //var ttDtStyle = d.rowDate;
                div.transition()		
                    .duration(200)		
                    .style("background", ttBackground)
                    .style("opacity", .9);
                div.html(ttLabelDt + ttDtStyle + "<br/>" +
                         ttLabelVal + d.rowAmount.toLocaleString('en'))	
                    .style("left", (d3.event.pageX) + "px")		
                    .style("top", (d3.event.pageY - 28) + "px");
            })					
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            })
         // Animation
         .transition()
         .duration(1000) 
         .attr("y", function(d, i) {return y(d.rowAmount);})
         .attr("height", function(d, i) {return height -  y(d.rowAmount); })
         ;
            
        xScaleTime1.range([(x.bandwidth()/2) - barPadding, width - ((x.bandwidth()/2) - barPadding)])
                    .domain(d3.extent(scaleDates));

        console.log("Bandwidth: " + x.bandwidth());
        // console.log(data_chart_id, "Extent: ", d3.extent(data, function(d) { return d.rowDate; }));
        console.log(d3.extent(scaleDates));

        // Add the x Axis with date formatting
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            //.call(d3.axisBottom(xScaleTime).tickFormat(d3.timeFormat("%d/%m/%Y")).ticks(45));
            .call(d3.axisBottom(xScaleTime1)
                .tickFormat(d3.timeFormat("%Y"))
                .ticks(numTicks))
            .append("text")
            .attr("x", width/2)
            .attr("y", + (margin.bottom - 7))
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .transition()
            .text(xLegend);

        // Add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
            .append("text")
            .attr("x", -(height/2)) // X,Y are on a new plane due to rotation
            .attr("y", -margin.left+14) 
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text(yLegend);

    });
    //////////////////////////////////
    // End data loop
    //////////////////////////////////
}
