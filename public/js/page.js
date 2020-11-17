(function (func) {
    func(window.jQuery, window, document);
})(function ($, window, document) {
    $(function () {
        var scDiv1 = $("#sumChart1")[0],
            scDiv2 = $("#sumChart2")[0],
            scDiv3 = $("#sumChart3")[0],
            xaDiv = $("#xAxis")[0],
            acDiv = $("#allChart")[0],
            tagDiv = $("#tag")[0],
            dtDiv = $("#dtPanel")[0],
            dtModal = $(".detail"),
            overlay = $("#overlay"),
            sortByInput = $("#sortBy");
        var scSVG1, scSVG2, scSVG3, acSVG, xaSVG;
        var rpData = sortedReports[0],
            rpDataFiltered = sortedReports[0];
        var ftValArr = [];
        var portrait;

        // Detail modal close button click listener
        $("#dtCloseBtn, #dtCloseIcon").on("click", function () {
            dtModal.css("display", "none");
            overlay.css("display", "none");
        });

        // Sort event listener
        sortByInput.on("change", function () {
            rpData = sortedReports[parseInt(sortByInput.val()) - 1];
            filter();
        });

        // Filter input event listeners
        $("#seFt, #jwtFt, #oaFt, #bgaFt, #fwFt, #s1Ft, #s2Ft, #s3Ft").on(
            "change",
            function () {
                ftValArr[1] = $("#seFt")[0].checked;
                ftValArr[2] = $("#jwtFt")[0].checked;
                ftValArr[3] = $("#oaFt")[0].checked;
                ftValArr[4] = $("#bgaFt")[0].checked;
                ftValArr[5] = $("#fwFt")[0].checked;
                ftValArr[6] = $("#s1Ft")[0].checked;
                ftValArr[7] = $("#s2Ft")[0].checked;
                ftValArr[8] = $("#s3Ft")[0].checked;
                filter();
            }
        );

        $("#snFt").on("keyup", function () {
            ftValArr[0] = $("#snFt").val();
            filter();
        });

        // Filter reports
        function filter() {
            rpDataFiltered = [];
            rpData.forEach(function (rp) {
                if (
                    rp.host.name.toLowerCase().indexOf(ftValArr[0]) >= 0 ||
                    !ftValArr[0]
                )
                    if (
                        (rp.host.enabled === ftValArr[1] && ftValArr[1]) ||
                        !ftValArr[1]
                    )
                        if (
                            (rp.host.auth_schema_jwt === ftValArr[2] &&
                                ftValArr[2]) ||
                            !ftValArr[2]
                        )
                            if (
                                (rp.host.auth_schema_oauth2 === ftValArr[3] &&
                                    ftValArr[3]) ||
                                !ftValArr[3]
                            )
                                if (
                                    (rp.host.block_guest_access ===
                                        ftValArr[4] &&
                                        ftValArr[4]) ||
                                    !ftValArr[4]
                                )
                                    if (
                                        (rp.host.waf_enabled === ftValArr[5] &&
                                            ftValArr[5]) ||
                                        !ftValArr[5]
                                    )
                                        if (
                                            (rp.status_code === 200 &&
                                                ftValArr[6]) ||
                                            !ftValArr[6]
                                        )
                                            if (
                                                (rp.status_code === 500 &&
                                                    ftValArr[7]) ||
                                                !ftValArr[7]
                                            )
                                                if (
                                                    (rp.status_code === 501 &&
                                                        ftValArr[8]) ||
                                                    !ftValArr[8]
                                                )
                                                    rpDataFiltered.push(rp);
            });

            if (acSVG) acSVG.remove();
            if (xaSVG) xaSVG.remove();

            drawMainCharts();
        }

        // Settings of liquid gauge
        function liquidFillGaugeDefaultSettings() {
            return {
                minValue: 0, // The gauge minimum value.
                maxValue: 100, // The gauge maximum value.
                circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
                circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
                startCircleColor: "#178BCA", // The color of the outer circle.
                endCircleColor: "#178BCA", // The color of the outer circle.
                waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
                waveCount: 1, // The number of full waves per width of the wave circle.
                waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
                waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
                waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
                waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
                waveAnimate: true, // Controls if the wave scrolls or is static.
                startWaveColor: "#178BCA", // The color of the fill wave.
                endWaveColor: "#178BCA", // The color of the fill wave.
                waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
                textVertPosition: 0.5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
                textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
                valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
                displayPercent: true, // If true, a % symbol is displayed after the value.
                textColor: "#045681", // The color of the value text when the wave does not overlap it.
                waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
            };
        }

        // Liquid gauge drawing
        function loadLiquidFillGauge(
            elementId,
            percentVal,
            labelVal,
            config,
            dataArr
        ) {
            if (config == null) config = liquidFillGaugeDefaultSettings();

            var gauge = d3.select("#" + elementId);

            var radius =
                Math.min(
                    parseInt(gauge.style("width")),
                    parseInt(gauge.style("height"))
                ) / 2;

            if (dataArr) radius *= 0.6;

            var locationX = parseInt(gauge.style("width")) / 2 - radius;
            var locationY = parseInt(gauge.style("height")) / 2 - radius;
            var fillPercent =
                Math.max(
                    config.minValue,
                    Math.min(config.maxValue, percentVal)
                ) / config.maxValue;

            var waveHeightScale;
            if (config.waveHeightScaling) {
                waveHeightScale = d3
                    .scaleLinear()
                    .range([0, config.waveHeight, 0])
                    .domain([0, 50, 100]);
            } else {
                waveHeightScale = d3
                    .scaleLinear()
                    .range([config.waveHeight, config.waveHeight])
                    .domain([0, 100]);
            }

            var textPixels = (config.textSize * radius) / 2;
            var textFinalValue = parseFloat(labelVal).toFixed(2);
            var textStartValue = config.valueCountUp
                ? config.minValue
                : textFinalValue;
            var percentText = config.displayPercent ? "%" : "";
            var circleThickness = config.circleThickness * radius;
            var circleFillGap = config.circleFillGap * radius;
            var fillCircleMargin = circleThickness + circleFillGap;
            var fillCircleRadius = radius - fillCircleMargin;
            var waveHeight =
                fillCircleRadius * waveHeightScale(fillPercent * 100);

            var waveLength = (fillCircleRadius * 2) / config.waveCount;
            var waveClipCount = 1 + config.waveCount;
            var waveClipWidth = waveLength * waveClipCount;

            // Rounding functions so that the correct number of decimal places is always displayed as the labelVal counts up.
            var textRounder = function (value) {
                return Math.round(value);
            };
            if (
                parseFloat(textFinalValue) !=
                parseFloat(textRounder(textFinalValue))
            ) {
                textRounder = function (value) {
                    return parseFloat(value).toFixed(1);
                };
            }
            if (
                parseFloat(textFinalValue) !=
                parseFloat(textRounder(textFinalValue))
            ) {
                textRounder = function (value) {
                    return parseFloat(value).toFixed(2);
                };
            }

            // Data for building the clip wave area.
            var data = [];
            for (var i = 0; i <= 40 * waveClipCount; i++) {
                data.push({ x: i / (40 * waveClipCount), y: i / 40 });
            }

            // Scales for drawing the outer circle.
            var gaugeCircleX = d3
                .scaleLinear()
                .range([0, 2 * Math.PI])
                .domain([0, 1]);
            var gaugeCircleY = d3
                .scaleLinear()
                .range([0, radius])
                .domain([0, radius]);

            // Scales for controlling the size of the clipping path.
            var waveScaleX = d3
                .scaleLinear()
                .range([0, waveClipWidth])
                .domain([0, 1]);
            var waveScaleY = d3
                .scaleLinear()
                .range([0, waveHeight])
                .domain([0, 1]);

            // Scales for controlling the position of the clipping path.
            var waveRiseScale = d3
                .scaleLinear()
                // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                // such that the it will won't overlap the fill circle at all when at 0%, and will totally cover the fill
                // circle at 100%.
                .range([
                    fillCircleMargin + fillCircleRadius * 2 + waveHeight,
                    fillCircleMargin - waveHeight,
                ])
                .domain([0, 1]);
            var waveAnimateScale = d3
                .scaleLinear()
                .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
                .domain([0, 1]);

            // Scale for controlling the position of the text within the gauge.
            var textRiseScaleY = d3
                .scaleLinear()
                .range([
                    fillCircleMargin + fillCircleRadius * 2,
                    fillCircleMargin + textPixels * 0.7,
                ])
                .domain([0, 1]);

            // Center the gauge within the parent SVG.
            var gaugeGroup = gauge
                .append("g")
                .attr(
                    "transform",
                    "translate(" + locationX + "," + locationY + ")"
                );

            // Draw the outer circle.
            if (dataArr == null) {
                var gaugeCircleArc = d3
                    .arc()
                    .startAngle(gaugeCircleX(0))
                    .endAngle(gaugeCircleX(1))
                    .outerRadius(gaugeCircleY(radius))
                    .innerRadius(gaugeCircleY(radius - circleThickness));
                var cirGrad = gaugeGroup
                    .append("defs")
                    .append("linearGradient")
                    .attr("id", "cirGrad" + elementId) //id of the gradient
                    .attr("x1", "0%")
                    .attr("x2", "0%")
                    .attr("y1", "0%")
                    .attr("y2", "100%"); //since its a vertical linear gradient
                cirGrad
                    .append("stop")
                    .attr("offset", "0%")
                    .style("stop-color", config.startCircleColor) //end in red
                    .style("stop-opacity", 1);

                cirGrad
                    .append("stop")
                    .attr("offset", "100%")
                    .style("stop-color", config.endCircleColor) //start in blue
                    .style("stop-opacity", 1);
                gaugeGroup
                    .append("path")
                    .attr("d", gaugeCircleArc)
                    // .style("fill", "url(#cirGrad" + elementId + ")")
                    .style("fill", config.startCircleColor)
                    .attr(
                        "transform",
                        "translate(" + radius + "," + radius + ")"
                    )
                    .attr("class", "pie-path")
                    .on("mousemove", function (e, d) {
                        if (portrait) return;

                        var tag = labelVal;

                        d3.select(tagDiv)
                            .style("display", "flex")
                            .style("top", e.y + "px")
                            .style("left", e.x + 20 + "px")
                            .html(tag);
                    })
                    .on("mouseout", function (e, d) {
                        if (portrait) return;

                        d3.select(tagDiv).style("display", "none");
                    });
            } else {
                var pie = d3.pie().value(function (d) {
                    return d.amount;
                });

                pie.startAngle(0.7).endAngle(Math.PI * 2 + 0.7);
                var piedata = pie(dataArr);

                var gaugeCircleArc = d3
                    .arc()
                    .outerRadius(gaugeCircleY(radius))
                    .innerRadius(gaugeCircleY(radius - circleThickness))
                    .padAngle(0.02)
                    .padRadius(100)
                    .cornerRadius(3);

                var path = gaugeGroup
                    .selectAll("path")
                    .data(piedata)
                    .enter()
                    .append("path")
                    .attr("fill", function (d, i) {
                        return d.data.color;
                    })
                    .attr("d", gaugeCircleArc)
                    .attr(
                        "transform",
                        "translate(" + radius + "," + radius + ")"
                    )
                    .attr("class", "pie-path")
                    .on("mousemove", function (e, d) {
                        if (portrait) return;

                        var tag =
                            d.data.status_code +
                            " (" +
                            ((d.data.amount / tServices) * 100).toFixed(2) +
                            "%)";

                        d3.select(tagDiv)
                            .style("display", "flex")
                            .style("top", e.y + "px")
                            .style("left", e.x + 20 + "px")
                            .html(tag);
                    })
                    .on("mouseout", function (e, d) {
                        if (portrait) return;

                        d3.select(tagDiv).style("display", "none");
                    });

                // Add indicator labels
                gaugeGroup
                    .selectAll("text")
                    .data(piedata)
                    .enter()
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("x", function (d) {
                        var a =
                            d.startAngle +
                            (d.endAngle - d.startAngle) / 2 -
                            Math.PI / 2;
                        d.cx = Math.cos(a) * radius;
                        return (d.x =
                            Math.cos(a) * (radius + (portrait ? 30 : 60)));
                    })
                    .attr("y", function (d) {
                        var a =
                            d.startAngle +
                            (d.endAngle - d.startAngle) / 2 -
                            Math.PI / 2;
                        d.cy = Math.sin(a) * radius;
                        return (d.y =
                            Math.sin(a) * (radius + (portrait ? 18 : 36)));
                    })
                    .text(function (d) {
                        return (
                            d.data.status_code +
                            (portrait
                                ? " (" +
                                  ((d.data.amount / tServices) * 100).toFixed(
                                      2
                                  ) +
                                  "%)"
                                : "")
                        );
                    })
                    .attr("fill", function (d) {
                        return d.data.color;
                    })
                    .each(function (d) {
                        var bbox = this.getBBox();
                        d.sx = d.x - bbox.width / 2 - 2;
                        d.ox = d.x + bbox.width / 2 + 2;
                        d.sy = d.oy = d.y + 8;
                    })
                    .attr(
                        "transform",
                        "translate(" + radius + "," + (radius + 6) + ")"
                    )
                    .style("font-size", radius / 5 + "px");

                gaugeGroup
                    .append("defs")
                    .append("marker")
                    .attr("id", "circ")
                    .attr("markerWidth", 12)
                    .attr("markerHeight", 12)
                    .attr("refX", 6)
                    .attr("refY", 6)
                    .append("circle")
                    .attr("fill", "rgba(255,255,255,0.5)")
                    .attr("cx", 6)
                    .attr("cy", 6)
                    .attr("r", 6);

                gaugeGroup
                    .selectAll("path.pointer")
                    .data(piedata)
                    .enter()
                    .append("path")
                    .style("fill", "none")
                    .style("stroke", function (d) {
                        return d.data.color;
                    })
                    .attr("marker-end", "url(#circ)")
                    .attr("d", function (d) {
                        if (d.cx > d.ox + (d.ox - d.oy) / 2) {
                            return (
                                "M" +
                                d.sx +
                                "," +
                                d.sy +
                                "L" +
                                d.ox +
                                "," +
                                d.oy +
                                " " +
                                d.cx +
                                "," +
                                d.cy
                            );
                        } else {
                            return (
                                "M" +
                                d.ox +
                                "," +
                                d.oy +
                                "L" +
                                d.sx +
                                "," +
                                d.sy +
                                " " +
                                d.cx +
                                "," +
                                d.cy
                            );
                        }
                    })
                    .attr(
                        "transform",
                        "translate(" + radius + "," + radius + ")"
                    );
            }

            // Text where the wave does not overlap.
            var text1 = gaugeGroup
                .append("text")
                .text(textRounder(textStartValue) + percentText)
                .attr("class", "liquid-fill-gauge-text")
                .attr("text-anchor", "middle")
                .attr("font-size", textPixels + "px")
                .style("fill", config.textColor)
                .attr(
                    "transform",
                    "translate(" +
                        radius +
                        "," +
                        textRiseScaleY(config.textVertPosition) +
                        ")"
                );

            // The clipping wave area.
            var clipArea = d3
                .area()
                .x(function (d) {
                    return waveScaleX(d.x);
                })
                .y0(function (d) {
                    return waveScaleY(
                        Math.sin(
                            Math.PI * 2 * config.waveOffset * -1 +
                                Math.PI * 2 * (1 - config.waveCount) +
                                d.y * 2 * Math.PI
                        )
                    );
                })
                .y1(function (d) {
                    return fillCircleRadius * 2 + waveHeight;
                });
            var waveGroup = gaugeGroup
                .append("defs")
                .append("clipPath")
                .attr("id", "clipWave" + elementId);
            var wave = waveGroup.append("path").datum(data).attr("d", clipArea);

            // The inner circle with the clipping wave attached.
            var fillCircleGroup = gaugeGroup
                .append("g")
                .attr("clip-path", "url(#clipWave" + elementId + ")");
            var fillCirGra = gaugeGroup
                .append("defs")
                .append("linearGradient")
                .attr("id", "fillCirGra" + elementId) //id of the gradient
                .attr("x1", "0%")
                .attr("x2", "0%")
                .attr("y1", "0%")
                .attr("y2", "100%"); //since its a vertical linear gradient
            fillCirGra
                .append("stop")
                .attr("offset", "0%")
                .style("stop-color", config.startWaveColor) //end in red
                .style("stop-opacity", 1);

            fillCirGra
                .append("stop")
                .attr("offset", "100%")
                .style("stop-color", config.endWaveColor) //start in blue
                .style("stop-opacity", 1);
            fillCircleGroup
                .append("circle")
                .attr("cx", radius)
                .attr("cy", radius)
                .attr("r", fillCircleRadius)
                .style("fill", "url(#fillCirGra" + elementId + ")");

            // Text where the wave does overlap.
            var text2 = fillCircleGroup
                .append("text")
                .text(textRounder(textStartValue) + percentText)
                .attr("class", "liquid-fill-gauge-text")
                .attr("text-anchor", "middle")
                .attr("font-size", textPixels + "px")
                .style("fill", config.waveTextColor)
                .attr(
                    "transform",
                    "translate(" +
                        radius +
                        "," +
                        textRiseScaleY(config.textVertPosition) +
                        ")"
                );

            // Make the value count up.
            if (config.valueCountUp) {
                var textTween = function () {
                    var i = d3.interpolate(this.textContent, textFinalValue);
                    return function (t) {
                        this.textContent = textRounder(i(t)) + percentText;
                    };
                };
                text1
                    .transition()
                    .duration(config.waveRiseTime)
                    .tween("text", textTween);
                text2
                    .transition()
                    .duration(config.waveRiseTime)
                    .tween("text", textTween);
            }

            // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
            var waveGroupXPosition =
                fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
            if (config.waveRise) {
                waveGroup
                    .attr(
                        "transform",
                        "translate(" +
                            waveGroupXPosition +
                            "," +
                            waveRiseScale(0) +
                            ")"
                    )
                    .transition()
                    .duration(config.waveRiseTime)
                    .attr(
                        "transform",
                        "translate(" +
                            waveGroupXPosition +
                            "," +
                            waveRiseScale(fillPercent) +
                            ")"
                    )
                    .on("start", function () {
                        wave.attr("transform", "translate(1,0)");
                    }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
            } else {
                waveGroup.attr(
                    "transform",
                    "translate(" +
                        waveGroupXPosition +
                        "," +
                        waveRiseScale(fillPercent) +
                        ")"
                );
            }

            if (config.waveAnimate) animateWave();

            function animateWave() {
                wave.transition()
                    .duration(config.waveAnimateTime)
                    .ease(d3.easeLinear)
                    .attr(
                        "transform",
                        "translate(" + waveAnimateScale(1) + ",0)"
                    )
                    .on("end", function () {
                        wave.attr(
                            "transform",
                            "translate(" + waveAnimateScale(0) + ",0)"
                        );
                        animateWave(config.waveAnimateTime);
                    });
            }
        }

        // Ellipsis of svg text
        function ellipsis(text) {
            text.each(function () {
                var text = d3.select(this);
                var words = text.text().split(/\s+/);

                var ellipsis = text
                    .text("")
                    .append("tspan")
                    .attr("class", "elip")
                    .text("...");
                var width =
                    parseFloat(text.attr("width")) -
                    ellipsis.node().getComputedTextLength();
                var numWords = words.length;

                var tspan = text
                    .insert("tspan", ":first-child")
                    .text(words.join(" "));

                // Try the whole line
                // While it's too long, and we have words left, keep removing words

                while (
                    tspan.node().getComputedTextLength() > width &&
                    words.length
                ) {
                    words.pop();
                    tspan.text(words.join(" "));
                }

                if (words.length === numWords) {
                    ellipsis.remove();
                }
            });
        }

        // Draw axis
        function drawAxis(
            width,
            height,
            cellHeight,
            sidePadding,
            topPadding,
            minVal,
            maxVal,
            smallBarWidth,
            smallBarSpacing
        ) {
            // Create scales
            var xScale = d3
                .scaleLinear()
                .domain([minVal, maxVal])
                .range([0, width]);

            var yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

            // Add scales to axises
            var xAxis = d3
                .axisTop()
                .scale(xScale)
                .ticks(maxVal - minVal)
                .tickFormat(function (d) {
                    if (d === 0) return "Alerts";
                    else return d - 1;
                });

            var yAxis = d3
                .axisLeft()
                .scale(yScale)
                .ticks(1)
                .tickFormat(function (d) {
                    return "";
                });

            // Append axises to svg
            xaSVG
                .append("g")
                .attr("class", "x-axis")
                .attr(
                    "transform",
                    "translate(" + sidePadding + ", " + topPadding + ")"
                )
                .call(xAxis);

            acSVG
                .append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(" + sidePadding + ", " + 0 + ")")
                .call(yAxis);

            // Append guidance
            xaSVG
                .append("rect")
                .attr("x", sidePadding)
                .attr("y", 15)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", blueCol);
            xaSVG
                .append("text")
                .attr("x", sidePadding + 15)
                .attr("y", 25)
                .text("200")
                .style("fill", "white")
                .style("font-size", "12px");
            xaSVG
                .append("rect")
                .attr("x", sidePadding + 50)
                .attr("y", 15)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", greenCol);
            xaSVG
                .append("text")
                .attr("x", sidePadding + 65)
                .attr("y", 25)
                .text("500")
                .style("fill", "white")
                .style("font-size", "12px");
            xaSVG
                .append("rect")
                .attr("x", sidePadding + 100)
                .attr("y", 15)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", redCol);
            xaSVG
                .append("text")
                .attr("x", sidePadding + 115)
                .attr("y", 25)
                .text("501")
                .style("fill", "white")
                .style("font-size", "12px");
            xaSVG
                .selectAll(".gd-item-small-bar")
                .data(function () {
                    return [
                        {
                            name: "enabled",
                            label: "Service Enabled",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                        },
                        {
                            name: "auth_schema_jwt",
                            label: "JWT Auth",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                        },
                        {
                            name: "auth_schema_oauth2",
                            label: "OAuth2",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                        },
                        {
                            name: "block_guest_access",
                            label: "Block Guest Access",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                        },
                        {
                            name: "waf_enabled",
                            label: "Firewall",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                        },
                    ];
                })
                .enter()
                .append("rect")
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("x", function (d, i) {
                    return sidePadding + i * (smallBarWidth + smallBarSpacing);
                })
                .attr("y", 35)
                .attr("width", smallBarWidth)
                .attr("height", cellHeight * 0.15)
                .attr("fill", function (d, i) {
                    return d.enabledColor;
                });
            xaSVG
                .append("text")
                .attr("x", function () {
                    return (
                        sidePadding + 5 * (smallBarWidth + smallBarSpacing) + 5
                    );
                })
                .attr("y", 35 + cellHeight * 0.15)
                .text(
                    "(Service Enabled, JWT, OAuth2, Block Guest Access, Firewall)"
                )
                .style("fill", "white")
                .style("font-size", "12px");
        }

        // Draw bars
        function drawBars(
            dataArr,
            width,
            itemBarWidth,
            smallBarWidth,
            cellHeight,
            sidePadding,
            smallBarSpacing
        ) {
            var acItems = acSVG
                .selectAll(".ac-item")
                .data(dataArr)
                .enter()
                .append("g")
                .attr("class", "ac-item")
                .attr("transform", function (d, i) {
                    return (
                        "translate(" + sidePadding + ", " + i * cellHeight + ")"
                    );
                })
                .on("click", function (e, d) {
                    // Restore changed colors by previous click
                    d3.select(this.parentNode)
                        .selectAll(".ac-item-bg")
                        .attr("class", function () {
                            return d3
                                .select(this)
                                .attr("class")
                                .split(" clicked")[0];
                        });
                    // Change color
                    d3.select(this)
                        .select(".ac-item-bg")
                        .attr("class", function () {
                            return d3.select(this).attr("class") + " clicked";
                        });

                    var detail =
                        "<h2>" +
                        d.host.name +
                        "</h2>" +
                        "<b>Status Code: </b>" +
                        "<mark style='color: white; background-color: " +
                        (d.status_code === 200
                            ? blueCol
                            : d.status_code === 501
                            ? redCol
                            : greenCol) +
                        "'>" +
                        d.status_code +
                        "</mark></br>" +
                        "<b>Status Text: </b>" +
                        "<q>" +
                        d.status_text +
                        "</q></br>" +
                        "<b>Requested Time: </b>" +
                        "<mark>" +
                        d.requested_at +
                        "</mark></br>" +
                        "<b>Completed Time: </b>" +
                        "<mark>" +
                        d.completed_at +
                        "</mark></br>" +
                        "<b>Total Alerts: </b>" +
                        "<mark>" +
                        d.total_alerts +
                        "</mark></br>" +
                        "<b>Downstream Protocol: </b>" +
                        "<mark>" +
                        d.host.downstream_protocol +
                        "</mark></br>" +
                        "<b>Downstream Host: </b>" +
                        "<mark>" +
                        d.host.downstream_host +
                        "</mark></br>" +
                        "<b>Downstream Port: </b>" +
                        "<mark>" +
                        d.host.downstream_port +
                        "</mark></br>" +
                        "<b>Upstream Protocol: </b>" +
                        "<mark>" +
                        d.host.upstream_protocol +
                        "</mark></br>" +
                        "<b>Upstream Host: </b>" +
                        "<mark>" +
                        d.host.upstream_host +
                        "</mark></br>" +
                        "<b>Upstream Port: </b>" +
                        "<mark>" +
                        d.host.upstream_port +
                        "</mark></br>" +
                        "<b>JWT Auth: </b>" +
                        "<mark>" +
                        (d.host.auth_schema_jwt ? "Yes" : "No") +
                        "</mark></br>" +
                        "<b>OAuth2: </b>" +
                        "<mark>" +
                        (d.host.auth_schema_oauth2 ? "Yes" : "No") +
                        "</mark></br>" +
                        "<b>Service Enabled: </b>" +
                        "<mark>" +
                        (d.host.enabled ? "Yes" : "No") +
                        "</mark></br>" +
                        "<b>Block Guest Access: </b>" +
                        "<mark>" +
                        (d.host.block_guest_access ? "Yes" : "No") +
                        "</mark></br>" +
                        "<b>Failover To: </b>" +
                        "<mark>" +
                        d.host.options.failover_to +
                        "</mark></br>" +
                        "<b>Service Key: </b>" +
                        "<mark>" +
                        d.host.options.service_key +
                        "</mark></br>" +
                        "<b>Web App Firewall: </b>" +
                        "<mark>" +
                        (d.host.options.waf_enabled ? "Yes" : "No") +
                        "</mark></br>" +
                        "<h3>Nodes</h3>";
                    if (!d.nodes.length) detail += "No nodes</br>";
                    else {
                        d.nodes.forEach(function (node) {
                            if (node.hasOwnProperty("web_node"))
                                detail +=
                                    "<b>Web Node: </b>" +
                                    "<mark>" +
                                    node.web_node +
                                    "</mark></br>";
                            if (node.hasOwnProperty("status_code"))
                                detail +=
                                    "<b>Status Code: </b>" +
                                    "<mark style='color: white; background-color: " +
                                    (node.status_code === 200
                                        ? blueCol
                                        : node.status_code === 501
                                        ? redCol
                                        : greenCol) +
                                    "'>" +
                                    node.status_code +
                                    "</mark></br>";
                            if (node.hasOwnProperty("status_text"))
                                detail +=
                                    "<b>Statue Text: </b>" +
                                    "<q>" +
                                    node.status_text +
                                    "</q></br>";
                            if (node.hasOwnProperty("requested_at"))
                                detail +=
                                    "<b>Requested Time: </b>" +
                                    "<mark>" +
                                    node.requested_at +
                                    "</mark></br>";
                            if (node.hasOwnProperty("completed_at"))
                                detail +=
                                    "<b>Completed Time: </b>" +
                                    "<mark>" +
                                    node.completed_at +
                                    "</mark></br>";
                            if (node.hasOwnProperty("total_alerts"))
                                detail +=
                                    "<b>Total Alerts: </b>" +
                                    "<mark>" +
                                    node.total_alerts +
                                    "</mark></br>";
                            detail += "<h4>Checks: </h4>";
                            if (
                                !node.hasOwnProperty("checks") ||
                                !node.checks.length
                            )
                                detail += "No checks</br>";
                            else
                                node.checks.forEach(function (check) {
                                    if (check.hasOwnProperty("name"))
                                        detail +=
                                            "<b>Check Name: </b>" +
                                            "<mark>" +
                                            check.name +
                                            "</mark></br>";
                                    if (check.hasOwnProperty("state"))
                                        detail +=
                                            "<b>State: </b>" +
                                            "<mark>" +
                                            check.state +
                                            "</mark></br>";
                                    if (check.hasOwnProperty("message"))
                                        detail +=
                                            "<b>Message: </b>" +
                                            "<q>" +
                                            check.message +
                                            "</q></br>";
                                    if (check.hasOwnProperty("started_at"))
                                        detail +=
                                            "<b>Started Time: </b>" +
                                            "<mark>" +
                                            check.started_at +
                                            "</mark></br>";
                                    if (check.hasOwnProperty("completed_at"))
                                        detail +=
                                            "<b>Completed Time: </b>" +
                                            "<mark>" +
                                            check.completed_at +
                                            "</mark></br>";
                                });
                            detail += "<hr/>";
                        });
                    }

                    d3.select(dtDiv).html(detail);
                    if (portrait) {
                        dtModal.css("display", "flex");
                        overlay.css("display", "flex");
                    }
                });
            var acItemBGs = acItems
                .append("rect")
                .attr("class", function (d, i) {
                    if (i % 2 === 0) return "ac-item-bg odd";
                    else return "ac-item-bg even";
                })
                .attr("x", 1)
                .attr("y", 1)
                .attr("width", width)
                .attr("height", cellHeight)
                .attr("stroke", "none")
                .attr("opacity", 0.5)
                .on("mousemove", function (e, d) {
                    if (portrait) return;

                    var tag =
                        "Service Name: " +
                        d.host.name +
                        "<br/>" +
                        "Status Code: " +
                        d.status_code +
                        "<br/>" +
                        "Status Text: " +
                        d.status_text +
                        "<br/>" +
                        "Service Available: " +
                        d.host.enabled +
                        "<br/>" +
                        "Total Alerts: " +
                        d.total_alerts +
                        "<br/>" +
                        "JWT Authentication: " +
                        d.host.auth_schema_jwt +
                        "<br/>" +
                        "OAuth2 authentication: " +
                        d.host.auth_schema_oauth2 +
                        "<br/>" +
                        "Block Guest Access: " +
                        d.host.block_guest_access +
                        "<br/>" +
                        "Firewall: " +
                        d.host.options.waf_enabled;

                    d3.select(tagDiv)
                        .style("display", "flex")
                        .style(
                            "top",
                            e.y + 20 > window.innerHeight - 150
                                ? e.y - 20
                                : e.y + 20 + "px"
                        )
                        .style("left", e.x + 20 + "px")
                        .html(tag);
                })
                .on("mouseout", function (e, d) {
                    if (portrait) return;

                    d3.select(tagDiv).style("display", "none");
                });
            var acItemBars = acItems
                .append("rect")
                .attr("class", "ac-item-bar")
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("x", 0)
                .attr("y", cellHeight / 6)
                .attr("height", cellHeight / (22 / 10))
                .attr("fill", function (d, i) {
                    return d.status_code === 200
                        ? blueCol
                        : d.status_code === 501
                        ? redCol
                        : greenCol;
                })
                .on("mousemove", function (e, d) {
                    if (portrait) return;

                    var tag =
                        "Status Code: " +
                        d.status_code +
                        "</br>" +
                        "Total Alerts: " +
                        d.total_alerts;

                    d3.select(tagDiv)
                        .style("display", "flex")
                        .style(
                            "top",
                            e.y + 20 > window.innerHeight - 150
                                ? e.y
                                : e.y + "px"
                        )
                        .style("left", e.x + 20 + "px")
                        .html(tag);
                })
                .on("mouseout", function (e, d) {
                    if (portrait) return;

                    d3.select(tagDiv).style("display", "none");
                })
                .transition()
                .duration(1500)
                .ease(d3.easeLinear)
                .attr("width", function (d) {
                    return itemBarWidth * (d.total_alerts + 1);
                });
            var acItemSmallBars = acItems
                .selectAll(".ac-item-small-bar")
                .data(function (d) {
                    return [
                        {
                            name: "enabled",
                            label: "Service Enabled",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                            val: d.host.enabled,
                        },
                        {
                            name: "auth_schema_jwt",
                            label: "JWT Auth",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                            val: d.host.auth_schema_jwt,
                        },
                        {
                            name: "auth_schema_oauth2",
                            label: "OAuth2",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                            val: d.host.auth_schema_oauth2,
                        },
                        {
                            name: "block_guest_access",
                            label: "Block Guest Access",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                            val: d.host.block_guest_access,
                        },
                        {
                            name: "waf_enabled",
                            label: "Firewall",
                            enabledColor: yellowCol,
                            disabledColor: "#888888",
                            val: d.host.options.waf_enabled,
                        },
                    ];
                })
                .enter()
                .append("rect")
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("x", function (d, i) {
                    return i * (smallBarWidth + smallBarSpacing);
                })
                .attr("y", cellHeight * 0.7)
                .attr("width", smallBarWidth)
                .attr("height", cellHeight * 0.15)
                .attr("fill", function (d, i) {
                    if (d.val) return d.enabledColor;
                    else return d.disabledColor;
                })
                .attr("class", function (d) {
                    return "ac-item-small-bar acisb-" + d.name;
                })
                .style("opacity", 0)
                .on("mousemove", function (e, d) {
                    if (portrait) return;

                    var tag = d.label + ": " + (d.val ? "Yes" : "No");

                    d3.select(tagDiv)
                        .style("display", "flex")
                        .style(
                            "top",
                            e.y + 20 > window.innerHeight - 150
                                ? e.y
                                : e.y + "px"
                        )
                        .style("left", e.x + 20 + "px")
                        .html(tag);
                })
                .on("mouseout", function (e, d) {
                    if (portrait) return;

                    d3.select(tagDiv).style("display", "none");
                })
                .transition()
                .duration(function (d, i) {
                    return 500 + i * 500;
                })
                .delay(500)
                .ease(d3.easeLinear)
                .style("opacity", 1);
            var acItemLabel = acItems
                .append("text")
                .attr("class", "ac-item-label")
                .attr("x", 10)
                .attr("y", cellHeight / 2)
                .attr("width", function (d) {
                    return itemBarWidth * (d.total_alerts + 1) - 10;
                })
                .text(function (d) {
                    return d.host.name;
                })
                .style("opacity", 0)
                .call(ellipsis)
                .transition()
                .duration(750)
                .delay(1500)
                .ease(d3.easeLinear)
                .style("opacity", 1);
        }

        // Draw summary charts
        function drawSumCharts() {
            scSVG1 = d3
                .select(scDiv1)
                .append("svg")
                .attr("height", scDiv1.clientHeight * 0.9)
                .attr("width", scDiv1.clientWidth * 0.9)
                .attr("id", "sumChartSVG1")
                .style("position", "relative")
                .style("top", "50%")
                .style("left", "50%")
                .style("transform", "translate(-50%, -50%)");

            scSVG2 = d3
                .select(scDiv2)
                .append("svg")
                .attr("height", scDiv2.clientHeight * 0.8)
                .attr("width", scDiv2.clientWidth * 0.8)
                .attr("id", "sumChartSVG2")
                .style("position", "relative")
                .style("top", "50%")
                .style("left", "50%")
                .style("transform", "translate(-50%, -50%)");

            scSVG3 = d3
                .select(scDiv3)
                .append("svg")
                .attr("height", scDiv3.clientHeight * 0.8)
                .attr("width", scDiv3.clientWidth * 0.8)
                .attr("id", "sumChartSVG3")
                .style("position", "relative")
                .style("top", "50%")
                .style("left", "50%")
                .style("transform", "translate(-50%, -50%)");

            var config1 = liquidFillGaugeDefaultSettings();
            config1.circleThickness = 0.4;
            config1.textColor = blueCol;
            config1.waveTextColor = "#ffffff";
            config1.startWaveColor = blueCol;
            config1.endWaveColor = blueCol;
            config1.textVertPosition = 0.52;
            config1.waveAnimateTime = 1000;
            config1.waveHeight = 0.1;
            config1.waveAnimate = true;
            config1.waveCount = 3;
            config1.waveOffset = 0.1;
            config1.textSize = 1;
            config1.minValue = 0;
            config1.maxValue = parseInt(tServices);
            config1.displayPercent = false;
            loadLiquidFillGauge(
                "sumChartSVG1",
                tStatusCount,
                tStatus,
                config1,
                statusData
            );

            var config2 = liquidFillGaugeDefaultSettings();
            config2.circleThickness = 0.4;
            config2.startCircleColor = purpleCol;
            config2.endCircleColor = purpleCol;
            config2.textColor = purpleCol;
            config2.waveTextColor = "#ffffff";
            config2.startWaveColor = purpleCol;
            config2.endWaveColor = purpleCol;
            config2.textVertPosition = 0.52;
            config2.waveAnimateTime = 1000;
            config2.waveHeight = 0.12;
            config2.waveAnimate = true;
            config2.waveCount = 2;
            config2.waveOffset = 0.1;
            config2.textSize = 1;
            config2.minValue = 0;
            config2.maxValue = tServices * 2;
            config2.displayPercent = false;
            loadLiquidFillGauge("sumChartSVG2", tServices, tServices, config2);

            var config3 = liquidFillGaugeDefaultSettings();
            config3.circleThickness = 0.4;
            config3.startCircleColor = redCol;
            config3.endCircleColor = redCol;
            config3.textColor = redCol;
            config3.waveTextColor = "#ffffff";
            config3.startWaveColor = redCol;
            config3.endWaveColor = redCol;
            config3.textVertPosition = 0.52;
            config3.waveAnimateTime = 1000;
            config3.waveHeight = 0.15;
            config3.waveAnimate = true;
            config3.waveCount = 2;
            config3.waveOffset = 0.1;
            config3.textSize = 1;
            config3.minValue = Math.floor(tAlerts / 100) * 100;
            config3.maxValue = config3.minValue + 100;
            config3.displayPercent = false;
            loadLiquidFillGauge("sumChartSVG3", tAlerts, tAlerts, config3);
        }

        // Draw all report items' charts
        function drawMainCharts() {
            var containerW = acDiv.clientWidth,
                containerH = acDiv.clientHeight,
                sidePadding = 20,
                topPadding = 70,
                viewW = containerW - 2 * sidePadding,
                cellH = 50,
                maxAlerts = sortedReports[1][0].total_alerts,
                minAlerts = 0,
                itemBarW = viewW / (maxAlerts + 1),
                smallBarW = itemBarW > 200 ? itemBarW / 7 : 25,
                smallBarS = 2;

            xaSVG = d3
                .select(xaDiv)
                .append("svg")
                .attr("width", containerW)
                .attr("id", "xAxisSVG");

            acSVG = d3
                .select(acDiv)
                .append("svg")
                .attr("width", containerW)
                .attr("id", "allChartSVG");

            drawAxis(
                viewW,
                reports.length * cellH,
                cellH,
                sidePadding,
                topPadding,
                minAlerts,
                maxAlerts + 1,
                smallBarW,
                smallBarS
            );

            drawBars(
                rpDataFiltered,
                viewW,
                itemBarW,
                smallBarW,
                cellH,
                sidePadding,
                smallBarS
            );

            var acSVGDom = acSVG.node();
            var acBbox = acSVGDom.getBBox();
            acSVGDom.setAttribute("height", acBbox.height + 2 * acBbox.y);
        }

        // If charts were drawn already, remove them first
        function removeAllSVGs() {
            if (scSVG1) scSVG1.remove();
            if (scSVG2) scSVG2.remove();
            if (scSVG3) scSVG3.remove();
            if (acSVG) acSVG.remove();
            if (xaSVG) xaSVG.remove();
        }

        // Draw all charts
        function draw() {
            // Check screen orientation
            portrait = window.innerHeight > window.innerWidth ? true : false;

            removeAllSVGs();

            drawSumCharts();
            drawMainCharts();
        }

        draw();

        window.addEventListener("resize", draw);
    });
});
