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
                //                console.log(d.value);
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
            //Merge the ag. data and GeoJSON
            //Loop through once for each ag. data value
            for (var i = 0; i < data.length; i++) {
                //            console.log(data.length);
                var dataState = data[i].state; //Grab state name
                //            console.log(dataState);
                var dataValue = parseFloat(data[i].value); //Grab data value, and convert from string to float
                //Find the corresponding state inside the GeoJSON
                for (var j = 0; j < dach.features.length; j++) {

                    var jsonState = dach.features[j].properties.NAME;
                    // console.log(jsonState);
                    if (dataState == jsonState) {

                        //Copy the data value into the JSON
                        dach.features[j].properties.value = dataValue;

                        //Stop looking through the JSON
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
                //                .on("click", clicked)
                .style("fill", function (d) {
                    var value = d.properties.value;

                    if (value) {
                        return color(value);

                        /* Fallback auf Orange */
                    } else {
                        return "orange";
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

    d3.json("http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/de/ten00108", function (error, chartdata) {
        if (error) {
            console.log(error);
        }
        console.log(chartdata);
        //    console.log(chartdata.dimension.geo.category.index.AT);
        //    console.log(chartdata.dimension.geo.category.index);

        var chartdata = [chartdata.value[0],
                        chartdata.value[1],
                        chartdata.value[2],
                        chartdata.value[3],
                        chartdata.value[4]
                       ];

        var barHeight = 20;

        var barLength = d3.scale.linear()
            .domain([0, d3.max(chartdata)])
            .range([0, window.innerWidth - 130]);

        var chart = d3.select(".chart");

        chart.attr("height", barHeight * chartdata.length);

        console.log(chart);
        //        console.log(chart[0][0].width.animVal.value);



        var bar = chart.selectAll("g")
            .data(chartdata)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * barHeight + ")";
            });

        console.log(bar[0]);
        //        console.log(bar[0][0].width.animVal.value);
        console.log(bar[0][0].childNodes[0].width.animVal.value);
        console.log(bar[0]);


        /* Chart bekommt Bars */

        bar.append("rect")
            .attr("width", function (d) {
                return barLength(d) + "px";
            })
            .attr("height", barHeight - 5);

        //        console.log(parseInt(chart[0][0].width.animVal.value) - bar);

        /* Bars bekommen Textwerte */
        bar.append("text")
            .attr("x", function () {
                //                return (parseInt(chart[0][0].width.animVal.value) - bar);
                return (parseInt(chart[0][0].width.animVal.value));

            })
            .attr("y", barHeight / 2)

        /* Damit Text in Box drinnen ist und nicht zuweit oben */
        .attr("dy", ".35em")

        .text(function () {
            return chartdata;
            //                            return ["Hansi", "Hansi", "Hansi", "Hansi", "Hansi"];
        });
    });


    /* SVG WIDTH - RECT WIDTH = TEXT gut aligned */





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