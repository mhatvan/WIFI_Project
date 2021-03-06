 (function () {
     "use strict";

     var mapInitialize = MapInitialize();

     /**
      * Map gets initialized
      * @constructor
      */
     function MapInitialize() {

         var mapWidth = 500;
         var mapHeight = 800;
         var centered;

         /* Zoom*/
         var scale = 1800;

         var translate = [mapWidth / 2, mapHeight / 2];

         /* Longitude u Latitude */
         var center = ([-15, 48.070843]);

         var projection = d3.geo.mercator()
             .center(center)
             .translate(translate)
             .scale(scale);

         // path generator type
         var path = d3.geo.path()
             .projection(projection);

         var svg = d3.select("#map-background")
             .attr("width", mapWidth)
             .attr("height", mapHeight);

         return {
             mapWidth: mapWidth,
             mapHeight: mapHeight,
             centered: centered,
             scale: scale,
             translate: translate,
             center: center,
             projection: projection,
             path: path,
             svg: svg
         };

     }

     //    console.log(mapInitialize);

     var colorMapping = ColorMapping();

     /**
      * Color Mapping 
      * @constructor
      */
     function ColorMapping() {

         /* Colorrange for mapping onto countries */

         var color = d3.scale.quantize()
             .range(["rgb(196, 209, 255)", "rgb(188,189,220)", "rgb(117,107,177)"]);

         /* Color gets picked relative to min max value of var color  */

         d3.csv("data/color-coding.csv", function (data) {
             {
                 color.domain([
            d3.min(data, function (d) {
                         return d.value;
                     }),
             d3.max(data, function (d) {
                         return d.value;
                     })
        ]);

                 /* Countries get read out */

                 d3.json("data/custom.geo.json", function (error, countries) {
                     if (error) {
                         throw error;
                     }

                     for (var i = 0; i < data.length; i++) {

                         /* iterate over Austria, Germany and France */
                         var dataState = data[i].state;

                         var dataValue = parseFloat(data[i].value);

                         for (var j = 0; j < countries.features.length; j++) {

                             var jsonState = countries.features[j].properties.NAME;

                             /* if color-coding.csv names are the same as in custon.geo.json */
                             if (dataState === jsonState) {
                                 countries.features[j].properties.value = dataValue;
                                 break;
                             }
                         }
                     }

                     /* Color Mapping onto the individual countries */

                     var g = mapInitialize.svg.append("g")
                         .attr("id", "countries")
                         .selectAll("path")
                         .data(countries.features)
                         .enter()
                         .append("path")
                         .attr("d", mapInitialize.path)

                     /*important for dataMapping function later*/
                     .attr("id", function (d) {
                         return d.properties.NAME;
                     })

                     .on("click", DataMapping)
                         .on("mouseup", ZoomStages)

                     .style("fill", function (d) {
                         var value = d.properties.value;

                         if (value) {
                             return color(value);

                             /* Fallback auf Rot */
                         } else {
                             return "red";
                         }
                     });

                     /* Countryname gets written into the country center */

                     g.selectAll("text")
                         .data(countries.features)
                         .enter()
                         .append("text")
                         .style("fill", "#ea6e6e")
                         .style("text-decoration", "underline")
                         .attr("transform", function (d) {
                             return "translate(" + mapInitialize.path.centroid(d) + ")";
                         })
                         .attr("dx", function (d) {
                             return d.properties.dx;
                         })
                         .attr("dy", function (d) {
                             return d.properties.dy;
                         })
                         .text(function (d) {
                             //                             console.log(d.properties.NAME);
                             return d.properties.NAME;
                         });
                 });
             }
         });
     }


     //     var zoomStages = ZoomStages();

     /* Hide Interface buttons until Zoom stage 2*/

     $(".fa-arrow-left").hide();

     $("#A").hide();
     $("#B").hide();
     $("#C").hide();

     /**
      * Click on Countries -> Zoom in and out
      * @constructor
      */
     function ZoomStages(d) {

         /* Zoom STAGES */

         //         console.log(d);

         var x, y, scaleFactor;

         if (d && mapInitialize.centered !== d) {

             var centroid = mapInitialize.path.centroid(d);
             x = centroid[0];
             y = centroid[1];
             scaleFactor = 25;
             mapInitialize.centered = d;

             $(".fa-arrow-left").show(500);
             $("#A").show(500);
             $("#B").show(500);
             $("#C").show(500);
         }

         /* zoom out: reset to initial values */
         else {

             x = mapInitialize.mapWidth / 2;
             y = mapInitialize.mapHeight / 2;

             scaleFactor = 1;
             //             console.log(scaleFactor);
             mapInitialize.center = ([-15, 51.070843]);
             mapInitialize.centered = null;

             $(".fa-arrow-left").hide(500);
             $("#A").hide(500);
             $("#B").hide(500);
             $("#C").hide(500);

             $("#co2-container").hide(500);
             $("#waste-container").hide(500);
             $("#electricity-container").hide(500);
             $("#chart-container").hide(500);


         }

         //         
         //         $("#back").on("click", function () {
         //
         //
         //             x = mapInitialize.mapWidth / 2;
         //             y = mapInitialize.mapHeight / 2;
         //
         //
         //             scaleFactor = 1;
         //             console.log(scaleFactor);
         //             mapInitialize.center = ([-15, 51.070843]);
         //             mapInitialize.centered = null;
         //

         //             $(".chart").remove();
         //             $(".Label").remove();
         //             $(".Info").remove();
         //
         //
         //                      $("#chart-container").hide();
         //
         //           $("body").css("background-color", "red");
         //         });

         /* Back Button activates zoom back to Zoomstage 1*/


         //        $(".fa-arrow-left").on("click", function () {

         //          

         //            scaleFactor = sizeChange.responsiveMap[0][0].transform.animVal[0].matrix.a;

         //        });

         d3.select("#countries").selectAll("path")
             .classed("active", mapInitialize.centered && function (d) {
                 return d === mapInitialize.centered;
             });

         d3.select("#countries").transition()
             /* duration of zoom in and zoom out */
             .duration(900)

         .attr("transform", "translate(" + mapInitialize.mapWidth / 2 + "," + mapInitialize.mapHeight / 2 + ")scale(" + scaleFactor + ")translate(" + -x + "," + -y + ")");

     }

     var abc = ABC();

     /**
      * Toggling of Data Buttons 
      * @constructor
      */
     function ABC() {

         $("input[type='button']").on("click", function () {

             $("#chart-container").insertBefore("#map-background").show(500);

             $("#chart-container").css({
                 "background-color": "#fff",
                 "transition": "background-color 1.5s ease"
             });

             switch (this.id) {

             case "A":

                 $("#waste-container").show(500);

                 $("#co2-container").hide(500);
                 $("#electricity-container").hide(500);


                 $('#A').attr("disabled", true);

                 $('#B').attr("disabled", false);
                 $('#C').attr("disabled", false);

                 break;

             case "B":

                 $("#co2-container").show(500);

                 $("#waste-container").hide(500);
                 $("#electricity-container").hide(500);

                 //                 $('#wasteLabel:gt(0)').css("background-color", "red");

                 $('#B').attr("disabled", true);

                 $('#A').attr("disabled", false);
                 $('#C').attr("disabled", false);

                 break;

             case "C":

                 $("#electricity-container").show(500);

                 $("#waste-container").hide(500);
                 $("#co2-container").hide(500);

                 $('#C').attr("disabled", true);

                 $('#A').attr("disabled", false);
                 $('#B').attr("disabled", false);

                 break;

             case "back":

                 $("#co2-container").hide(500);
                 $("#waste-container").hide(500);
                 $("#electricity-container").hide(500);

                 break;
             }
         });
     }

     /**
      * Template for AJAX Requests
      * @constructor
      */
     function MakeAJAXRequest(fileName, callback) {
         var xhr = new XMLHttpRequest();
         xhr.open("get", fileName);
         xhr.responseType = "json";
         xhr.onreadystatechange = function () {
             if (xhr.readyState === 4) {
                 if (xhr.status === 200) {
                     callback(xhr.response);
                 } else {
                     console.log("Error: " + xhr.status);
                 }
             }
         };
         xhr.send();
     }

     /**
      * Click on Countries -> AJAX Request -> Click on Data Buttons -> Display corresponding Chart 
      * @constructor
      */
     function DataMapping(d) {

         //         console.log(d);

         /* DATA MAPPING */

         /* margin for chart positioning */

         var margin = {
             top: 20,
             right: 50,
             bottom: 40,
             left: 50
         };

         var barHeight = 80;

         /* window.innerWidth -> makes the Chart responsive */
         var chartWidth = (window.innerWidth * 0.80) - margin.left - margin.right;
         var chartHeight = (barHeight * (5 * 1.20)) - margin.top - margin.bottom;

         /* Bars Textvalue gets written to the end of the bars and text gets centered relative to the barheight */

         var formatToMillion = d3.format(".3s");

         /* Tick spezification for x and y Axis of chart */

         var tickSize = (6, 7);
         var tickPadding = 6;

         MakeAJAXRequest("data/waste.json", function (wasteData) {

             var wasteData_AUT = [wasteData.value[0],
                              wasteData.value[1],
                              wasteData.value[2],
                              wasteData.value[3],
                              wasteData.value[4],
                                ];

             var wasteData_GER = [wasteData.value[30],
                              wasteData.value[31],
                              wasteData.value[32],
                              wasteData.value[33],
                              wasteData.value[34]
                             ];

             var wasteData_FR = [
                              wasteData.value[70],
                              wasteData.value[71],
                              wasteData.value[72],
                              wasteData.value[73],
                              wasteData.value[74]
                             ];

             var wasteDataCurrent;

             if (d.properties.NAME === "Austria") {
                 wasteDataCurrent = wasteData_AUT;
             }
             if (d.properties.NAME === "Germany") {
                 wasteDataCurrent = wasteData_GER;
             }

             if (d.properties.NAME === "France") {
                 wasteDataCurrent = wasteData_FR;
             }

             var wasteBarLength = d3.scale.linear()
                 .domain([0, d3.max(wasteDataCurrent)])
                 .range([0, chartWidth]);

             /* basic chart initializtation, slight X and Y offset, so the textlabels dont get cut off */

             /* add margins so chart doesnt get cut off */

             var wasteChart = d3.select("#wasteChart")
                 .attr("width", chartWidth + margin.left + margin.right)
                 .attr("height", chartHeight + margin.top + margin.bottom)
                 .append("g")
                 .attr("id", "barchart")
                 .attr("class", "chart")
                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

             /*
             
             Workaround to trigger wastechart only once? no chart, then on leave appends one
             
             d3.select("#wasteInfo").select("#wasteChart").remove();
             
             var wasteChart = d3.select("#wasteInfo").append("svg")
                 .attr("id", "#wasteChart")
                 .attr("width", chartWidth + margin.left + margin.right)
                 .attr("height", chartHeight + margin.top + margin.bottom)
                 .append("g")
                 .attr("id", "barchart")
                 .attr("class", "chart")
                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
*/
             /* data gets binded to g elements, slight X offset so the bars dont stick to the X Axis */

             var wasteBar = wasteChart.selectAll("g")
                 .data(wasteDataCurrent)
                 .enter()
                 .append("g")
                 .attr("transform", function (d, i) {
                     return "translate(5," + i * barHeight + ")";
                 });

             /* Charts receive bars, length relative to garbage values from ajax, height dynamic */

             wasteBar.append("rect")
                 .attr("width", function (d) {
                     return wasteBarLength(d) + "px";
                 })
                 //                 .attr("height", barHeight - 10)
                 .attr("height", barHeight - 10);

             wasteBar.append("text")
                 .attr("x", function (d) {

                     return wasteBarLength(d) - 5;
                 })
                 .attr("y", barHeight / 2)

             /* Mini Hack for the text to be more exactly centered */

             //        .attr("dy", ".23em")

             /* Values get written into the bars and formatted into nicer numbers */

             .text(function (d) {

                 return formatToMillion(d);

             });

             /* Text for Y-Axis */

             var wasteYearLabel = wasteData.dimension.time.category.label;

             var wasteYearLabelArray = [
                                wasteYearLabel[2004],
                                wasteYearLabel[2006],
                                wasteYearLabel[2008],
                                wasteYearLabel[2010],
                                wasteYearLabel[2012]
                               ];

             var xScale = d3.scale.linear()
                 .domain([0, (d3.max(wasteDataCurrent))])
                 .range([0, chartWidth]);

             var yScale = d3.scale.linear()
                 .domain([wasteYearLabelArray[0], wasteYearLabelArray[wasteYearLabelArray.length - 1]])
                 .range([(barHeight * 1) * (wasteDataCurrent.length), 10]);

             /*  Create the Axis and set orientation of values */

             var xAxis = d3.svg.axis()
                 .scale(xScale)
                 .orient("bottom")
                 .ticks(10, ".3s")
                 .tickSize(tickSize)
                 .tickPadding(tickPadding)
                 .outerTickSize(0);

             var yAxis = d3.svg.axis()
                 .scale(yScale)
                 .orient("left")
                 .ticks(wasteYearLabelArray.length, "d")
                 /* (inner/outer size of ticks */
                 .tickSize(tickSize)
                 /*Distance between tickText and Tick*/
                 .tickPadding(tickPadding);

             /* X Axis gets called and translated to be visible */

             wasteChart.append("g")
                 .attr("transform", "translate(5," + (barHeight * (wasteDataCurrent.length)) + ")")
                 .call(xAxis);

             /* Y Axis gets called and translated to be visible */

             wasteChart.append("g")
                 .attr("transform", "translate(0," + (-10) + ")")
                 .call(yAxis);

             if (d3.select("#waste-container").classed("a_notExists")) {

                 $("#waste-container").toggleClass("a_notExists");

                 /* Chart receives name of dataset */

                 d3.select("#waste-container")
                     .append("div")
                     .attr("id", "wasteLabel")
                     .attr("class", "Label")
                     .text(wasteData.label + " in " + d.properties.NAME);

                 /* Chart receives description of dataset */

                 d3.select("#waste-container")
                     .append("p")
                     .attr("id", "wasteInfo")
                     .attr("class", "Info")
                     .text(wasteData.extension.description);

                 d3.select("#waste-container")
                     .append("p")
                     //                     .attr("id", "wasteInfo")
                     .attr("class", "SubInfo")
                     .text(wasteData.dimension.waste.category.label.TOTAL + " in Millions (M)");
             }

             /* wasteLabel becomes :first-child of to be a headline */

             $("#wasteLabel, #wasteInfo").insertBefore("#wasteChart");

         });

         MakeAJAXRequest("data/co2.json", function (co2Data) {

             var co2Data_AUT = [co2Data.value[14],
                              co2Data.value[16],
                              co2Data.value[18],
                              co2Data.value[20],
                              co2Data.value[22],
                                ];

             var co2Data_GER = [co2Data.value[139],
                              co2Data.value[141],
                              co2Data.value[143],
                              co2Data.value[145],
                              co2Data.value[147]
                             ];

             var co2Data_FR = [
                              co2Data.value[314],
                              co2Data.value[316],
                              co2Data.value[318],
                              co2Data.value[320],
                              co2Data.value[322]
                             ];

             var co2DataCurrent;

             if (d.properties.NAME === "Austria") {

                 co2DataCurrent = co2Data_AUT;
             }
             if (d.properties.NAME === "Germany") {
                 co2DataCurrent = co2Data_GER;
             }

             if (d.properties.NAME === "France") {
                 co2DataCurrent = co2Data_FR;
             }

             var co2BarLength = d3.scale.linear()
                 .domain([0, d3.max(co2DataCurrent)])
                 .range([0, chartWidth]);

             /* basic chart initializtation, slight X and Y offset, so the textlabels dont get cut off */

             /* add margins so chart doesnt get cut off */

             var co2Chart = d3.select("#co2Chart")
                 .attr("width", chartWidth + margin.left + margin.right)
                 .attr("height", chartHeight + margin.top + margin.bottom)
                 .append("g")
                 .attr("id", "barchart")
                 .attr("class", "chart")
                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

             /* data gets binded to g elements, slight X offset so the bars dont stick to the X Axis */

             var co2Bar = co2Chart.selectAll("g")
                 .data(co2DataCurrent)
                 .enter()
                 .append("g")
                 .attr("transform", function (d, i) {
                     return "translate(5," + i * barHeight + ")";
                 });

             /* Charts receive bars, length relative to garbage values from ajax, height dynamic */

             co2Bar.append("rect")
                 .attr("width", function (d) {
                     return co2BarLength(d) + "px";
                 })
                 .attr("height", barHeight - 10);

             co2Bar.append("text")
                 .attr("x", function (d) {

                     return co2BarLength(d) - 5;
                 })
                 .attr("y", barHeight / 2)

             /* Mini Hack for the text to be more exactly centered */

             //        .attr("dy", ".23em")

             /* Values get written into the bars and formatted into nicer numbers */

             .text(function (d) {
                 return formatToMillion(d);
             });

             /* Text for Y-Axis */

             var co2YearLabel = co2Data.dimension.time.category.label;

             var co2YearLabelArray = [
                                co2YearLabel[2004],
                                co2YearLabel[2006],
                                co2YearLabel[2008],
                                co2YearLabel[2010],
                                co2YearLabel[2012]
                               ];

             var xScale = d3.scale.linear()
                 .domain([0, (d3.max(co2DataCurrent))])
                 .range([0, chartWidth]);

             var yScale = d3.scale.linear()
                 .domain([co2YearLabelArray[0], co2YearLabelArray[co2YearLabelArray.length - 1]])
                 .range([(barHeight * 1) * (co2DataCurrent.length), 10]);

             /*  Create the Axis and set orientation of values */

             var xAxis = d3.svg.axis()
                 .scale(xScale)
                 .orient("bottom")
                 .ticks(10, ".3s")
                 .tickSize(tickSize)
                 .tickPadding(tickPadding)
                 .outerTickSize(0)
                 .tickFormat(d3.format(".2s"));

             var yAxis = d3.svg.axis()
                 .scale(yScale)
                 .orient("left")
                 .ticks(co2YearLabelArray.length, "d")
                 /* (inner/outer size of ticks */
                 .tickSize(tickSize)
                 /*Distance between tickText and Tick*/
                 .tickPadding(tickPadding);

             /* X Axis gets called and translated to be visible */

             co2Chart.append("g")
                 .attr("transform", "translate(5," + (barHeight * (co2DataCurrent.length)) + ")")
                 .text(function (d) {
                     return formatToMillion(d);
                 })

             .call(xAxis);

             /* Y Axis gets called and translated to be visible */

             co2Chart.append("g")
                 .attr("transform", "translate(0," + (-10) + ")")
                 .call(yAxis);

             /* Chart receives name of dataset */

             if (d3.select("#co2-container").classed("b_notExists")) {

                 $("#co2-container").toggleClass("b_notExists");

                 d3.select("#co2-container")
                     .append("div")
                     .attr("id", "co2Label")
                     .attr("class", "Label")
                     .text(co2Data.label + " in " + d.properties.NAME);

                 /* Chart receives description of dataset */
                 //
                 d3.select("#co2-container")
                     .append("p")
                     .attr("id", "co2Info")
                     .attr("class", "Info")
                     .text(co2Data.extension.description);

                 d3.select("#co2-container")
                     .append("p")
                     .attr("class", "SubInfo")
                     .text(co2Data.extension.subTitle);
             }

             /* co2Label becomes :first-child of to be a headline */

             $("#co2Label, #co2Info").insertBefore("#co2Chart");
         });

         MakeAJAXRequest("data/electricity.json", function (electricityData) {

             var electricityData_AUT = [electricityData.value[41],
                              electricityData.value[43],
                              electricityData.value[45],
                              electricityData.value[47],
                              electricityData.value[49],
                                ];

             var electricityData_GER = [electricityData.value[191],
                              electricityData.value[193],
                              electricityData.value[195],
                              electricityData.value[197],
                              electricityData.value[199],
                                ];

             var electricityData_FR = [electricityData.value[391],
                              electricityData.value[393],
                              electricityData.value[395],
                              electricityData.value[397],
                              electricityData.value[399],
                                ];

             var electricityDataCurrent;

             if (d.properties.NAME === "Austria") {
                 electricityDataCurrent = electricityData_AUT;
             }
             if (d.properties.NAME === "Germany") {

                 electricityDataCurrent = electricityData_GER;
             }

             if (d.properties.NAME === "France") {
                 electricityDataCurrent = electricityData_FR;
             }

             var electricityBarLength = d3.scale.linear()
                 .domain([0, d3.max(electricityData_AUT)])
                 .range([0, chartWidth]);

             /* basic chart initializtation, slight X and Y offset, so the textlabels dont get cut off */

             /* add margins so chart doesnt get cut off */

             var electricityChart = d3.select("#electricityChart")
                 .attr("width", chartWidth + margin.left + margin.right)
                 .attr("height", chartHeight + margin.top + margin.bottom)
                 .append("g")
                 .attr("id", "barchart")
                 .attr("class", "chart")
                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

             /* data gets binded to g elements, slight X offset so the bars dont stick to the X Axis */

             var electricityBar = electricityChart.selectAll("g")
                 .data(electricityData_AUT)
                 .enter()
                 .append("g")
                 .attr("transform", function (d, i) {
                     return "translate(5," + i * barHeight + ")";
                 });

             /* Charts receive bars, length relative to garbage values from ajax, height dynamic */

             electricityBar.append("rect")
                 .attr("width", function (d) {
                     return electricityBarLength(d) + "px";
                 })
                 .attr("height", barHeight - 10);

             electricityBar.append("text")
                 .attr("x", function (d) {

                     return electricityBarLength(d) - 5;
                 })
                 .attr("y", barHeight / 2)

             /* Mini Hack for the text to be more exactly centered */

             //        .attr("dy", ".23em")

             /* Values get written into the bars and formatted into nicer numbers */

             .text(function (d) {
                 return formatToMillion(d);
             });

             /* Text for Y-Axis */

             var electricityYearLabel = electricityData.dimension.time.category.label;

             var electricityYearLabelArray = [
                                electricityYearLabel[2006],
                                electricityYearLabel[2008],
                                electricityYearLabel[2010],
                                electricityYearLabel[2012],
                                electricityYearLabel[2014]
                               ];

             var xScale = d3.scale.linear()
                 .domain([0, (d3.max(electricityData_AUT))])
                 .range([0, chartWidth]);

             var yScale = d3.scale.linear()
                 .domain([electricityYearLabelArray[0], electricityYearLabelArray[electricityYearLabelArray.length - 1]])
                 .range([(barHeight * 1) * (electricityData_AUT.length), 10]);

             /*  Create the Axis and set orientation of values */

             var xAxis = d3.svg.axis()
                 .scale(xScale)
                 .orient("bottom")
                 .ticks(10, ".3s")
                 .tickSize(tickSize)
                 .tickPadding(tickPadding)
                 .outerTickSize(0);

             var yAxis = d3.svg.axis()
                 .scale(yScale)
                 .orient("left")
                 .ticks(electricityYearLabelArray.length, "d")
                 /* (inner/outer size of ticks */
                 .tickSize(tickSize)
                 /*Distance between tickText and Tick*/
                 .tickPadding(tickPadding);

             /* X Axis gets called and translated to be visible */

             electricityChart.append("g")
                 .attr("transform", "translate(5," + (barHeight * (electricityData_AUT.length)) + ")")
                 .call(xAxis);

             /* Y Axis gets called and translated to be visible */

             electricityChart.append("g")
                 .attr("transform", "translate(0," + (-10) + ")")
                 .call(yAxis);

             /* Chart receives name of dataset */

             if (d3.select("#electricity-container").classed("c_notExists")) {

                 $("#electricity-container").toggleClass("c_notExists");

                 d3.select("#electricity-container")
                     .append("div")
                     .attr("id", "electricityLabel")
                     .attr("class", "Label")
                     .text(electricityData.label + " - " + d.properties.NAME);

                 /* Chart receives description of dataset */

                 d3.select("#electricity-container")
                     .append("p")
                     .attr("id", "electricityInfo")
                     .attr("class", "Info")
                     .text(electricityData.dimension.indic_nrg.category.label["12_1176011"]);

                 // electricityData.dimension.product.category.label[9007] + " - " +

                 d3.select("#electricity-container")
                     .append("p")
                     .attr("class", "SubInfo")
                     .text(electricityData.dimension.unit.category.label.MW);

                 console.log(electricityData.dimension.indic_nrg.category.label);



             }

             /* electricityLabel becomes :first-child of to be a headline */

             $("#electricityLabel, #electricityInfo").insertBefore("#electricityChart");
         });
     }

     //Responsiveness();

     /**
      * Hacks for responsiveness on load and on resize
      * @constructor
      */
     function Responsiveness() {

         d3.select(window)
             .on("load", SizeChange);

         d3.select(window)
             .on("resize", SizeChange);

         function SizeChange() {

             // responsive scale is a big problem

             d3.select("#countries").attr("transform", "scale(" + $("body").width() / 1800 + ")");

             $("#map-background").height($("body").width() * 0.42);

             //        var scaleValue = responsiveMap[0][0].transform.animVal[0].matrix.a;

             /*
                     d3.select("#barchart").attr("transform", "scale(" + $("body").width() / 1450 + ")" + " " + "translate(" + 50 + "," + 20 + ")");
                     $(".chart").height($("#map-background").width() * 0.42);*/

             //                    if (window.innerWidth < 1200){
             //                        WasteChart.xAxis.tickValues(5);
             //                    }
         }
     }

     //    console.log(sizeChange.responsiveMap[0][0].transform.animVal[0].matrix.a);

     /* hide chart-container on page load */
     $("#chart-container").hide();

 }());