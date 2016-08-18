/* Österreich Map wird initialisiert */

(function () {
    "use strict";

    var width;
    var height;
    var centered;
    var scale = 2500;
    var translate = [400, 2950];

    var projection = d3.geo.mercator()
        .scale(scale)
        .translate(translate);


    // Pfad Generator
    var path = d3.geo.path()
        .projection(projection);


    /* Österreich Map wird erstellt */

    var svg = d3.select(".container").append("svg")
        .attr("width", width)
        .attr("height", height);

    var g = svg.append("g");

    /* 5 Farbabstufungen für das Color Mapping */

    var color = d3.scale.quantize()
        .range(["rgb(255, 255, 255)", "rgb(188,189,220)", "rgb(117,107,177)"]);

    /* Color wird gepickt, min max Werte innerhalb Farbrange von var color  */

    d3.csv("data/aut-productivity.csv", function (data) {
        color.domain([
            d3.min(data, function (d) {
                console.log(d.value);
                return d.value;
            }),
             d3.max(data, function (d) {
                return d.value;
            })
        ]);


        // JSON Path + callback function wenn json geladen

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
                    //                                console.log(d.properties);
                    //                                console.log(d.properties.value);

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


            /*g.append("path")
                .datum(geojson.mesh(dach, dach.features.geometry, function (a, b) {
                    return a !== b;
                }))
                .attr("id", "state-borders")
                .attr("d", path);*/
        });

    });




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






    //     var legend = d3.select('svg').append('legend');

    /*

        var legend = d3.select(document.createElement("div"));

        svg.insert("legend", ":first-child");

        legend.append('ul')
            .attr('class', 'list-inline');

    */



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