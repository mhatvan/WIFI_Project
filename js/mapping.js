(function () {
    "use strict";


    /* Map wird erstellt */

    var mapWidth = 500;
    var mapHeight = 500;
    //    var centered;

    var scale = 2500;

    //    var translate = [400, 2950];
    //    var translate = [0,0];
    var translate = [mapWidth / 2, mapHeight / 2];

    /* Longitude u Latitude */
    var center = ([-8, 52.070843]);

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

        d3.json("data/custom.geo.json", function (error, dach) {
            if (error) {
                throw error;
            }

            for (var i = 0; i < data.length; i++) {

                var dataState = data[i].state;

                var dataValue = parseFloat(data[i].value);

                for (var j = 0; j < dach.features.length; j++) {

                    var jsonState = dach.features[j].properties.NAME;

                    if (dataState == jsonState) {
                        dach.features[j].properties.value = dataValue;
                        break;

                    }
                }
            }

            /* Color Mapping auf die einzelnen Länder */

            g.append("g")
                .attr("id", "states")
                .selectAll("path")
                .data(dach.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function (d) {
                    var value = d.properties.value;

                    if (value) {
                        return color(value);

                        /* Fallback auf Weiß */
                    } else {
                        return "white";
                    }
                });


            /* Der Ländername wird in das jeweilige Land geschrieben */

            g.selectAll("text")
                .data(dach.features)
                .enter()
                .append("text")
                .style("fill", "#ea6e6e")
                .style("text-decoration", "underline")
                .attr("transform", function (d) {
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

    /* Map wird je nach User Device responsive bei load und bleibt es beim resizen des Fensters */

    d3.select(window)
        .on("load", sizeChange);

    d3.select(window)
        .on("resize", sizeChange);

    function sizeChange() {
        d3.select("g").attr("transform", "scale(" + $("body").width() / 1700 + ")");
        $("#map-background").height($("body").width() * 0.418);
    }



    /* TABELLEN DATA MAPPING */

    $("#A").on("click", function () {
        var toggleA = true;
        if (toggleA === true) {
            //            showMüllChart();
            $(".chart").show(500);
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
            $("#red-box").show(500);
            toggleB = false;
        }

        if (toggleB === false) {
            $(".chart").hide(500);
            $("#green-box").hide(500);
            toggleB = true;
        }


    });

    $("#C").on("click", function () {
        var toggleC = true;
        if (toggleC === true) {
            //            showDummy();
            $("#green-box").show(500);
            toggleC = false;
        }

        if (toggleC === false) {
            $(".chart").hide(500);
            $("#red-box").hide(500);
            toggleC = true;
        }


    });


    //    function showDummy() {
    d3.select(".container").append("div")
        .style("width", "100%")
        .style("height", "100px")
        .style("background-color", "red")
        .attr("id", "red-box");
    //    }


    d3.select(".container").append("div")
        .style("width", "100%")
        .style("height", "100px")
        .style("background-color", "green")
        .attr("id", "green-box");

    $("#green-box").hide();
    $("#red-box").hide();
    $(".chart").hide();


    //    function showMüllChart() {


    /* Abfallaufkommen nach Abfallkategorie */

    d3.json("http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/de/ten00108", function (error, chartdata) {
        if (error) {
            console.log(error);
        }

        console.log(chartdata);

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

        d3.select(".chart")
            .style("background-color", "#c1c1d0")
            .style("width", "100%");

        var chartdata = [chartdata.value[0],
                          chartdata.value[1],
                          chartdata.value[2],
                          chartdata.value[3],
                          chartdata.value[4]
                         ];

        var barHeight = 20;

        var barLength = d3.scale.linear()
            .domain([0, d3.max(chartdata)])
            //            .range([0, window.innerWidth - 130]);
            .range([0, window.innerWidth - 100]);

        var chart = d3.select(".chart");

        chart.attr("height", barHeight * chartdata.length);

        //        console.log(chart);
        //        console.log(chart[0][0].width.animVal.value);

        var bar = chart.selectAll("g")
            .data(chartdata)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * barHeight + ")";
            });

        /* Chart bekommt Bars */

        bar.append("rect")
            .attr("width", function (d) {
                return barLength(d) + "px";
            })
            .attr("height", barHeight - 5);

        //        console.log(parseInt(chart[0][0].width.animVal.value) - bar);

        /* Bars bekommen Textwerte */
        bar.append("text")
            .attr("x", function (d) {

                //                return (((parseInt(chart[0][0].width.animVal.value) + (barLength(d))) / 3));
                return barLength(d) - 3;

            })
            .attr("y", barHeight / 2)

        /* Damit Text in Box drinnen ist und nicht zuweit oben */
        .attr("dy", ".23em")

        .text(function () {

            for (var i = 0; i <= chartdata.length; i++) {
                //                console.log(chartdata[i]);
                return chartdata[i];


            }
        });
    });


    /*
    
    HTML LÖSUNG
    
    
    d3.select("body").append("div")
        .attr("class", "infoheader");

    var data = [graphdata.value[0],
                graphdata.value[1],
                graphdata.value[2],
                graphdata.value[3],
                graphdata.value[4]
               ];

    //    console.log(graphdata.value[4]);


    var x = d3.scale.linear()
        .domain([0, d3.max(data)])
        .range([0, window.innerWidth - 130]);


    d3.select(".infoheader").append("div")
        .attr("class", "chart");


    d3.select(".chart")
        .selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .style("width", function (d) {
            return x(d) + "px";
        })
        .text(function (d) {
            return d;
        });
*/



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


    /*

        function clicked(d) {
            var x, y, k;

            if (d && centered !== d) {
                var centroid = path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                k = 4;
                centered = d;
            } else {
                x = width / 2;
                y = height / 2;
                k = 1;
                centered = null;
            }

            g.selectAll("path")
                .classed("active", centered && function (d) {
                    return d === centered;
                });

            g.transition()
                .duration(750)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .style("stroke-width", 1.5 / k + "px");
        }

    */



}());