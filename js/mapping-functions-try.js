(function () {
    "use strict";

    /* Map wird erstellt */

    init();

    function init() {
        //        initializeMap();
        //        createMap();
        showMuellChart();
        buttonToggle();
        showDummy();
        hideElements();
        mapResponsiveness();
    }


    //    function initializeMap() {

    var mapWidth = 500;
    var mapHeight = 500;
    var centered;

    var scale = 1800;

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

    //    }


    //    function createMap(svg, g) {


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

        /* Legende für die Daten */

        var legend = d3.select("#legend")
            .append("ul")
            .attr("class", "list-inline");


        var formats = {
            percent: d3.format("%")
        };

        var keys = legend.selectAll("li.key")
            .data(color.range());

        keys.enter().append("li")
            .attr("class", "key")
            .style("border-top-color", String)
            .text(function (d) {
                var r = color.invertExtent(d);
                return formats.percent(r[0]);
            });

        /* Länder werden ausgelesen */

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


            var g = svg.append("g");

            g.append("g")
                .attr("id", "countries")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", path)
                //                .on("click", clickedZoomstages)
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
                    //                    g.on("click", clickedZoomstages(d));
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
    //    }



    /* TABELLEN DATA MAPPING */

    /* Abfallaufkommen nach Abfallkategorie */

    function showMuellChart() {

        d3.json("https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/de/ten00108", function (error, chartdata) {
            if (error) {
                console.log(error);
            }

            //        console.log(Object.keys(chartdata.value).length);
            //        var check = Object.keys(chartdata.value).length;

            /*for (var i = 0; i < 5; i++){
                console.log(chartdata);
                var chartdata = [chartdata.value[i]];
            }*/

            /*for (var i = 0; i < check; i++) {

                console.log(Object.keys(chartdata.value).length);

                var chartdata = chartdata.value[i];
                console.log(chartdata.value[i]);
            }*/

            var abfall_aut = [chartdata.value[0],
                          chartdata.value[1],
                          chartdata.value[2],
                          chartdata.value[3],
                          chartdata.value[4],

                          chartdata.value[30],
                          chartdata.value[31],
                          chartdata.value[32],
                          chartdata.value[33],
                          chartdata.value[34]
                         ];

            var barHeight = 20;

            var barLength = d3.scale.linear()
                .domain([0, d3.max(abfall_aut)])
                //            .range([0, window.innerWidth - 130]);
                .range([0, window.innerWidth - 150]);

            var chart = d3.select(".chart")
                .style("width", "100%");


            /* so lassen! */

            chart.attr("height", barHeight * abfall_aut.length);

            var bar = chart.selectAll("g")
                .data(abfall_aut)
                .enter().append("g")
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

            .text(function () {

                for (var i = 0; i <= abfall_aut.length; i++) {

                    return abfall_aut[i];
                }
            });

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
            var xScale = d3.scale.linear()
                .domain([0, (d3.max(abfall_aut))])
                .range([0, window.innerWidth - 150]);

            var yScale = d3.scale.linear()
                .domain([0, (d3.max(abfall_aut))])
                .range([window.innerHeight - 150, 0]);

            //Create the Axis
            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("right");

            xyAxisContainer.append("g")
                .attr("transform", function () {
                    return "translate(0,0)";
                })
                .call(xAxis);

            xyAxisContainer.append("g")
                .attr("transform", function () {
                    return "translate(0,0)";
                })
                .call(yAxis);

            /* Chart bekommt Namen der Daten */

            d3.select("#chart-container")
                .append("div")
                .attr("id", "chartlabel")
                .text(chartdata.label);

            $("#chartlabel").insertBefore(".chart");

            $("#chartlabel").hide();

        });

    }



    /* Togglen der Buttons A, B, C */

    function buttonToggle() {

        $("#A").on("click", function () {
            var toggleA = true;
            if (toggleA === true) {
                //            showMuellChart();
                //                    $("#chart-container").show(500);
                $(".chart").show(500);
                $("#chartlabel").show(500);
                $(".xyaxis").show(500);

                toggleA = false;
            }

            if (toggleA === false) {
                $("#red-box").hide(500);
                $("#green-box").hide(500);
                toggleA = true;
            }

        });

        $("#B").on("click", function () {
            var toggleB = true;
            if (toggleB === true) {
                //            showDummy();
                //            $("#chart-container").show(500);
                $("#red-box").show(500);
                toggleB = false;
            }

            if (toggleB === false) {
                $(".chart").hide(500);
                $("#chartlabel").hide(500);
                $(".xyaxis").hide(500);
                $("#green-box").hide(500);
                toggleB = true;
            }


        });

        $("#C").on("click", function () {
            var toggleC = true;
            if (toggleC === true) {
                //            showDummy();
                //            $("#chart-container").show(500);
                $("#green-box").show(500);
                toggleC = false;
            }

            if (toggleC === false) {
                $(".chart").hide(500);
                $("#chartlabel").hide(500);
                $(".xyaxis").hide(500);
                $("#red-box").hide(500);
                toggleC = true;
            }
        });


    }

    function showDummy() {
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

    }

    //            hideElements();

    function hideElements() {
        //        $("#chart-container").hide();
        $("#green-box").hide();
        $("#red-box").hide();
        $(".chart").hide();
        $(".x-axis-A").hide();
    }





    /* Map wird je nach User Device responsive bei load und bleibt es beim resizen des Fensters */


    function mapResponsiveness() {

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

    //    function clickedZoomstages(d, centered, path, mapWidth, mapHeight) {
    //        var x, y, scaleFactor;
    //
    //        if (d && centered !== d) {
    //            var centroid = path.centroid(d);
    //            x = centroid[0];
    //            y = centroid[1];
    //            scaleFactor = 20;
    //            centered = d;
    //
    //
    //
    //            /* rauszoom: wieder reset auf die startwerte */
    //
    //        } else {
    //            x = mapWidth / 2;
    //            y = mapHeight / 2;
    //            scaleFactor = 1;
    //            centered = null;
    //        }
    //
    //        g.selectAll("path")
    //            .classed("active", centered && function (d) {
    //                return d === centered;
    //            });
    //
    //        g.transition()
    //            /*zoom in und out dauer */
    //            .duration(1250)
    //
    //        .attr("transform", "translate(" + mapWidth / 2 + "," + mapHeight / 2 + ")scale(" + scaleFactor + ")translate(" + -x * 0.99 + "," + -y + ")")
    //
    //        .style("stroke-width", 1.5 / scaleFactor + "px");
    //    }
    //




}());