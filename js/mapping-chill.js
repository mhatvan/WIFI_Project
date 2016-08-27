(function () {
    "use strict";

    //  
    //    var svg = [];
    //
    //
    //    init();
    //
    //    function init() {
    //        initializeMap();
    //        createMap();
    //        returnsvg(500, 500);
    //    }
    //    
    //     function initializeMap() {
    //    }
    //
    //    
    //    function returnsvg(mapWidth, mapHeight) {
    //
    //        var svg = d3.select("#map-background")
    //            .attr("width", mapWidth)
    //            .attr("height", mapHeight);
    //        
    //        return svg;
    //    }
    //    
    //        console.log(returnsvg());
    //        
    //
    //   






    /* Map wird erstellt */


    //    function initializeMap() {


    var mapWidth = 500;
    var mapHeight = 500;
    var centered;

    var scale = 1800;

    //    }


    //    initializeMap();


    var translate = [mapWidth / 2, mapHeight / 2];

    /* Longitude u Latitude */
    var center = ([-15, 51.070843]);


    var projection = d3.geo.mercator()
        .center(center)
        .translate(translate)
        .scale(scale);

    // Pfad Generator
    var path = d3.geo.path()
        .projection(projection);

    //    var svg = d3.select("#container").append("svg")
    var svg = d3.select("#map-background")
        .attr("width", mapWidth)
        .attr("height", mapHeight);

    var g = svg.append("g");

    /* Farbabstufungen für das Color Mapping */

    var color = d3.scale.quantize()
        .range(["rgb(255, 255, 255)", "rgb(188,189,220)", "rgb(117,107,177)"]);

    /* Color wird gepickt, min max Werte innerhalb Farbrange von var color  */

    d3.csv("data/aut-productivity.csv", function (data) {
        color.domain([
            d3.min(data, function (d) {
                return d.value;
            }),
             d3.max(data, function (d) {
                return d.value;
            })
        ]);

        /* DACH Länder werden ausgelesen */

        d3.json("data/custom.geo.json", function (error, countries) {
            if (error) {
                throw error;
            }

            for (var i = 0; i < data.length; i++) {

                var dataState = data[i].state;

                var dataValue = parseFloat(data[i].value);

                for (var j = 0; j < countries.features.length; j++) {

                    var jsonState = countries.features[j].properties.NAME;

                    if (dataState === jsonState) {
                        countries.features[j].properties.value = dataValue;
                        break;

                    }
                }
            }

            /* Color Mapping auf die einzelnen Länder */

            g.append("g")
                .attr("id", "countries")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", path)



            .on("click", clicked)





            .style("fill", function (d) {
                var value = d.properties.value;

                if (value) {
                    return color(value);

                    /* Fallback auf Rot */
                } else {
                    return "red";
                }
            });


            /* Der Ländername wird in das jeweilige Land geschrieben */

            g.selectAll("text")
                .data(countries.features)
                .enter()
                .append("text")
                .style("fill", "#ea6e6e")
                .style("text-decoration", "underline")
                .attr("transform", function (d) {
                    //                    g.on("click", clicked(d));
                    return "translate(" + path.centroid(d) + ")";
                })
                .attr("dx", function (d) {
                    return d.properties.dx;
                })
                .attr("dy", function (d) {
                    return d.properties.dy;
                })
                .text(function (d) {
                    return d.properties.NAME;

                });


        });

    });


    /* Legende für die Daten */

    var legend = d3.select('#legend')
        .append('ul')
        .attr('class', 'list-inline');


    var formats = {
        percent: d3.format('%')
    };

    var keys = legend.selectAll('li.key')
        .data(color.range());

    keys.enter().append('li')
        .attr('class', 'key')
        .style('border-top-color', String)
        .text(function (d) {
            var r = color.invertExtent(d);
            return formats.percent(r[0]);
        });


    /* TABELLEN DATA MAPPING */

    /* Abfallaufkommen nach Abfallkategorie */

    //    function showMüllChart()

    d3.json("https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/de/ten00108", function (error, chartdata) {
        if (error) {
            console.log(error);
        }

        console.log(chartdata);




        /*  for (var i = 0; i < 5; i++) {
                    var newChartData = [chartdata.value[i]];
                    console.log(newChartData);
                }
        */

        // Eurostat abfragen per AJAX


        // CHART A

        var abfallaufkommen_AUT = [chartdata.value[0],
                              chartdata.value[1],
                              chartdata.value[2],
                              chartdata.value[3],
                              chartdata.value[4],
                                     ];

        var abfallaufkommen_GER = [chartdata.value[30],
                              chartdata.value[31],
                              chartdata.value[32],
                              chartdata.value[33],
                              chartdata.value[34],
                                     ];

        var abfallaufkommen_FR = [chartdata.value[70],
                              chartdata.value[71],
                              chartdata.value[72],
                              chartdata.value[73],
                              chartdata.value[74],
                                     ];


        /*

                function abfallaufkommen_AUT() {

                    var abfallaufkommen_AUT = [];

                    for (var i = 0; i < 5; i++) {

                        chartdata.value[i];
                        console.log(chartdata.value[i]);
                        abfallaufkommen_AUT.push(chartdata.value[i]);
                    }
                    console.log(abfallaufkommen_AUT);
                    return (abfallaufkommen_AUT);
                }

        */


        /*

        for (var j = 30; j < 35; j++) {

            var abfallaufkommen_GER = [chartdata.value[j]];
            console.log(abfallaufkommen_GER);
        }
        */


        // CHART A, AUT

        var barHeight = 30;

        var barLength = d3.scale.linear()
            .domain([0, d3.max(abfallaufkommen_AUT)])
            //            .range([0, window.innerWidth - 130]);
            .range([0, window.innerWidth - 150]);


        /* SVG CHART */

        var chart = d3.select(".chart");
        /* so lassen! */

        chart.attr("width", "100%")
            .attr("height", 2000)
            //            .attr("height", barHeight * (abfallaufkommen_AUT.length));




        /* X und Y Achse kreieren für den Chart */

        //Create the SVG Viewport selection
        var xyAxisContainer = d3.select("#chart-container")
            //            .style("background-color", "#e3e3e3")
            .append("svg")
            .attr("class", "xyaxis")
            .style("width", "100%")
            .style("height", 3000)
            .style("margin-left", 5);

        $(".xyaxis").hide();

        //Create the Scale we will use for the Axis


        var jahr_label = chartdata.dimension.time.category.label;

        var jahr_label_array = [
                                jahr_label[2004],
                                jahr_label[2006],
                                jahr_label[2008],
                                jahr_label[2010],
                                jahr_label[2012]
                               ];
        //
        //        var jahr = [];
        ////
        //        for (var x = 2004; x < 2013; x+=2) {
        //
        //            chartdata.dimension.time.category.label[x];
        //            console.log(chartdata.dimension.time.category.label[x]);
        //            jahr.push(chartdata.value[x]);
        //        }
        ////
        //        console.log(jahr);
        //        //        return (jahr);
        //
        //        //         var jahr = chartdata.dimension.time.category.label;
        //        console.log(chartdata.dimension.time.category.label[2004]);
        //
        //        








        //    

        //            .append("g")
        //            .attr("transform", "translate(" + 40 + "," + 20 + ")")


        var xScale = d3.scale.linear()
            .domain([0, (d3.max(abfallaufkommen_AUT))])
            .range([0, window.innerWidth - 150]);

        var yScale = d3.scale.linear()
            .domain([jahr_label_array[0], jahr_label_array[jahr_label_array.length - 1]])
            .range([0, window.innerHeight - 150]);

        //Create the Axis
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");
        //                    .ticks(;

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(jahr_label_array.length, '');

        chart.append("g")
            .attr("transform", function () {
                return "translate(49,810)";
            })
            .call(xAxis);

        chart.append("g")
            .attr("transform", function () {
                return "translate(50,11)";
            })
            .call(yAxis);

        /* Chart bekommt Namen der Daten */

        d3.select("#chart-container")
            .append("div")
            .attr("id", "chartlabel")
            .text(chartdata.label);

        $("#chartlabel").insertBefore(".chart");

        $("#chartlabel").hide();


        /*    var bar = chart.selectAll("g")
            .data(abfallaufkommen_AUT)
            .append("g")
            .enter()
            .attr("transform", function (d, i) {
                return "translate(10," + i * barHeight + ")";
            })
            .attr("class", "responsive");      
            */

        var bar = chart.append("g")
            .data(abfallaufkommen_AUT)
            .enter()
            .attr("transform", function (d, i) {
                return "translate(10," + i * barHeight + ")";
            })
            .attr("class", "responsive");

        /* Chart bekommt Bars */

        bar.append("rect")
            .attr("width", function (d) {
                return barLength(d) + "px";
            })
            .attr("height", barHeight - 5);

        /* Bars bekommen Textwerte */

        bar.append("text")
            .attr("x", function (d) {

                return barLength(d) - 3;
            })
            .attr("y", barHeight / 2)

        /* Damit Text in Box drinnen ist und nicht zuweit oben */

        .attr("dy", ".23em")

        .text(function (d) {

            return d;

        });



    });


    /* Togglen der Buttons A, B, C */

    $("#A").on("click", function () {
        //                        showMüllChart();
        //                    $("#chart-container").show(500);
        $(".chart").show(500);
        $("#chartlabel").show(500);
        $(".xyaxis").show(500);

        $("#red-box").hide(500);
        $("#green-box").hide(500);
    });

    $("#B").on("click", function () {

        //            showDummy();
        //            $("#chart-container").show(500);
        $("#red-box").show(500);

        $(".chart").hide(500);
        $("#chartlabel").hide(500);
        $(".xyaxis").hide(500);
        $("#green-box").hide(500);

    });

    $("#C").on("click", function () {
        //            showDummy();
        //            $("#chart-container").show(500);
        $("#green-box").show(500);

        $(".chart").hide(500);
        $("#chartlabel").hide(500);
        $(".xyaxis").hide(500);
        $("#red-box").hide(500);
    });

    //    function showDummy() {
    d3.select("#chart-container").append("div")
        .style("width", "100%")
        .style("height", "100px")
        .style("background-color", "red")
        .attr("id", "red-box");
    //    }

    d3.select("#chart-container").append("div")
        .style("width", "100%")
        .style("height", "100px")
        .style("background-color", "green")
        .attr("id", "green-box");



    hideElements();

    function hideElements() {
        //        $("#chart-container").hide();
        $("#green-box").hide();
        $("#red-box").hide();
        $(".chart").hide();
        $(".x-axis-A").hide();
    }


    /* Map wird je nach User Device responsive bei load und bleibt es beim resizen des Fensters */

    d3.select(window)
        .on("load", sizeChange);

    d3.select(window)
        .on("resize", sizeChange);


    function sizeChange() {
        d3.select("g").attr("transform", "scale(" + $("body").width() / 1700 + ")");
        $("#map-background").height($("body").width() * 0.418);



        /* responsiveness bar chart not working correctly */

        //            var translateit = ("transform", "translate(10," + i * 20 + ")");
        //            var scaleit = ("transform", "scale(" + $("body").width() / 1700 + ")");

        //            $(".chart").children()
        //                .attr("transform", translateit + "" + scaleit);

    }





    /* Österreich Map wird draggable und zoomable innerhalb des containers */

    /*
        var zoom = d3.behavior.zoom()
            .on("zoom", function () {
                g.attr("transform", "translate(" +
                    d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
                g.selectAll("path")
                    .attr("d", path.projection(projection));
            });

        svg.call(zoom);
    */


    /* Zoom STAGES */

    function clicked(d) {
        var x, y, scaleFactor;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            scaleFactor = 20;
            centered = d;



            /* rauszoom: wieder reset auf die startwerte */

        } else {
            x = mapWidth / 2;
            y = mapHeight / 2;
            scaleFactor = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function (d) {
                return d === centered;
            });

        g.transition()
            /*zoom in und out dauer */
            .duration(1250)

        .attr("transform", "translate(" + mapWidth / 2 + "," + mapHeight / 2 + ")scale(" + scaleFactor + ")translate(" + -x * 0.99 + "," + -y + ")")

        .style("stroke-width", 1.5 / scaleFactor + "px");
    }




}());