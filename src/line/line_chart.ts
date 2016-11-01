(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name pipLineCharts
     *
     * @description
     * Line chart on top of Rickshaw charts
     */
    angular.module('pipLineCharts', [])
        .directive('pipLineChart', pipLineChart);

    function pipLineChart() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries',
                showYAxis: '=pipYAxis',
                showXAxis: '=pipXAxis',
                dynamic: '=pipDynamic'
            },
            bindToController: true,
            controllerAs: 'lineChart',
            templateUrl: 'line/line_chart.html',
            controller: function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                var vm        = this;
                var chart     = null;
                var chartElem = null;
                var setZoom = null;
                var updateZoomOptions = null;
                var colors    = _.map($mdColorPalette, function (palette, color) {
                    return color;
                });

                vm.data = vm.series || [];
                vm.sourceEvents = [];
                
                vm.isVisibleX = function () {
                    return vm.showXAxis == undefined ? true : vm.showXAxis; 
                };

                vm.isVisibleY = function () {
                    return vm.showYAxis == undefined ? true : vm.showYAxis;
                };

                vm.zoomIn = function () {
                    if (setZoom) {
                        setZoom('in');
                    }
                };

                vm.zoomOut = function () {
                    if (setZoom) {
                        setZoom('out');
                    }
                };
                
                if (vm.series.length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }

                // Sets colors of items
                generateParameterColor();

                (<any>d3.scale).paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };

                $scope.$watch('lineChart.series', function (updatedSeries) {
                    vm.data = updatedSeries;

                    generateParameterColor();

                    if (chart) {
                        chartElem.datum(vm.data).call(chart);

                        if (updateZoomOptions) updateZoomOptions(vm.data);
                    }
                }, true);

                /**
                 * Instantiate chart
                 */
                nv.addGraph(function () {
                    chart = nv.models.lineChart()
                        .margin({ top: 20, right: 20, bottom: 30, left: 30 })
                        .x(function (d) {
                            return d.x;
                        })
                        .y(function (d) {
                            return d.value;
                        })
                        .height(270)
                        .useInteractiveGuideline(true)
                        .showXAxis(true)
                        .showYAxis(true)
                        .showLegend(false)
                        .color(function(d) {
                            return d.color || (<any>d3.scale).paletteColors().range();
                        });

                    chart.tooltip.enabled(false);
                    chart.noData('No data for this moment...');

                    chart.yAxis
                        .tickFormat(function (d) {
                            return d / 1000 + 'k';
                        });

                    chart.xAxis
                        .tickFormat(function (d) {
                            return d.toFixed(2);
                        });

                    chartElem = d3.select($element.get(0)).select('.line-chart svg');
                    chartElem.datum(vm.data).style('height', 270).call(chart);

                    if (vm.dynamic) {
                        addZoom(chart, chartElem);
                    }

                    nv.utils.windowResize(chart.update);

                    return chart;
                });

                function updateScroll(domains, boundary) {
                    var bDiff = boundary[1] - boundary[0],
                        domDiff = domains[1] - domains[0],
                        isEqual = (domains[1] - domains[0])/bDiff === 1;

                    $($element[0]).find('.visual-scroll')
                        .css('opacity', function () {
                            return isEqual ? 0 : 1;
                        });

                    if (isEqual) return;
                    
                    $($element[0]).find('.scrolled-block')
                        .css('left', function () {
                            return domains[0]/bDiff * 100 + '%';
                        })
                        .css('width', function () {
                            return domDiff/bDiff * 100 + '%';
                        });
                }

                function addZoom(chart, svg) {
                    // scaleExtent
                    var scaleExtent = 4;

                    // parameters
                    var yAxis       = null;
                    var xAxis       = null;
                    var xDomain     = null;
                    var yDomain     = null;
                    var redraw      = null;
                    var svg         = svg;

                    // scales
                    var xScale = null;
                    var yScale = null;

                    // min/max boundaries
                    var x_boundary = null;
                    var y_boundary = null;

                    // create d3 zoom handler
                    var d3zoom = d3.behavior.zoom();
                    var prevXDomain = null;
                    var prevScale = null;
                    var prevTranslate = null;

                    setData(chart);

                    function setData(newChart) {
                        // parameters
                        yAxis       = newChart.yAxis;
                        xAxis       = newChart.xAxis;
                        xDomain     = newChart.xDomain || xAxis.scale().domain;
                        yDomain     = newChart.yDomain || yAxis.scale().domain;
                        redraw      = newChart.update;

                        // scales
                        xScale = xAxis.scale();
                        yScale = yAxis.scale();

                        // min/max boundaries
                        x_boundary = xAxis.scale().domain().slice();
                        y_boundary = yAxis.scale().domain().slice();

                        // create d3 zoom handler
                        prevXDomain = x_boundary;
                        prevScale = d3zoom.scale();
                        prevTranslate = d3zoom.translate();

                        // ensure nice axis
                        xScale.nice();
                        yScale.nice();
                    }

                    // fix domain
                    function fixDomain(domain, boundary, scale, translate) {
                        if (domain[0] < boundary[0]) {
                            domain[0] = boundary[0];
                            if (prevXDomain[0] !== boundary[0] || scale !== prevScale) {
                                domain[1] += (boundary[0] - domain[0]);
                            } else {
                                domain[1] = prevXDomain[1];
                                translate = _.clone(prevTranslate);
                            }

                        }
                        if (domain[1] > boundary[1]) {
                            domain[1] = boundary[1];
                            if (prevXDomain[1] !== boundary[1] || scale !== prevScale) {
                                domain[0] -= (domain[1] - boundary[1]);
                            } else {
                                domain[0] = prevXDomain[0];
                                translate = _.clone(prevTranslate);
                            }
                        }

                        d3zoom.translate(translate);
                        prevXDomain = _.clone(domain);
                        prevScale = _.clone(scale);
                        prevTranslate = _.clone(translate);
                        return domain;
                    }

                    function updateChart() {
                        d3zoom.scale(1);
                        d3zoom.translate([0,0]);
                        xScale.domain(x_boundary);
                        d3zoom.x(xScale).y(yScale);
                        svg.call(d3zoom);
                    }

                    // zoom event handler
                    function zoomed() {
                        // Switch off vertical zooming temporary
                        // yDomain(yScale.domain());

                        if ((<any>d3.event).scale === 1) {
                            unzoomed();
                            updateChart();
                        } else {
                            xDomain(fixDomain(xScale.domain(), x_boundary, (<any>d3.event).scale, (<any>d3.event).translate));
                            redraw();
                        }

                        updateScroll(xScale.domain(), x_boundary);
                    }

                    //
                    setZoom = function(which) {
                        var center0 = [svg[0][0].getBBox().width / 2, svg[0][0].getBBox().height / 2];
                        var translate0 = d3zoom.translate(), coordinates0 = coordinates(center0);

                        if (which === 'in') {
                            if (prevScale < scaleExtent) d3zoom.scale(prevScale + 0.2);
                        } else {
                            if (prevScale > 1) d3zoom.scale(prevScale - 0.2);
                        }

                        var center1 = point(coordinates0);
                        d3zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

                        d3zoom.event(svg);
                    };

                    function step(which) {
                        var translate = d3zoom.translate();

                        if (which === 'right') {
                            translate[0] -= 20;
                        } else {
                            translate[0] += 20;
                        }

                        d3zoom.translate(translate);
                        d3zoom.event(svg);
                    }

                    function coordinates(point) {
                        var scale = d3zoom.scale(), translate = d3zoom.translate();
                        return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
                    }

                    function point(coordinates) {
                        var scale = d3zoom.scale(), translate = d3zoom.translate();
                        return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
                    }

                    function keypress() {
                        switch((<any>d3.event).keyCode) {
                            case 39: step('right'); break;
                            case 37: step('left'); break;
                            case 107: setZoom('in'); break;
                            case 109: setZoom('out');
                        }
                    }

                    // zoom event handler
                    function unzoomed() {
                        xDomain(x_boundary);
                        redraw();
                        d3zoom.scale(1);
                        d3zoom.translate([0,0]);
                        prevScale = 1;
                        prevTranslate = [0,0];
                    }

                    // initialize wrapper
                    d3zoom.x(xScale)
                        .y(yScale)
                        .scaleExtent([1, scaleExtent])
                        .on('zoom', zoomed);

                    // add handler
                    svg.call(d3zoom).on('dblclick.zoom', unzoomed);
                    $($element.get(0)).addClass('dynamic');

                    // add keyboard handlers
                    svg
                        .attr('focusable', false)
                        .style('outline', 'none')
                        .on('keydown', keypress)
                        .on('focus', function () {});

                    var getXMinMax = function(data) {
                        var maxVal, minVal = null;

                        for(var i=0;i<data.length;i++) {
                            if (!data[i].disabled) {
                                var tempMinVal = d3.max(data[i].values, function(d: any) { return d.x;} );
                                var tempMaxVal = d3.min(data[i].values, function(d: any) { return d.x;} );
                                minVal = (!minVal || tempMinVal < minVal) ? tempMinVal : minVal;
                                maxVal = (!maxVal || tempMaxVal > maxVal) ? tempMaxVal : maxVal;
                            }
                        }
                        return [maxVal, minVal];
                    };

                    updateZoomOptions = function(data) {
                        yAxis = chart.yAxis;
                        xAxis = chart.xAxis;

                        xScale = xAxis.scale();
                        yScale = yAxis.scale();

                        x_boundary = getXMinMax(data);

                        if (d3zoom.scale() === 1) {
                            d3zoom.x(xScale).y(yScale);
                            svg.call(d3zoom);
                            d3zoom.event(svg);
                        }

                        updateScroll(xScale.domain(), x_boundary);
                    }
                }

                /**
                 * Converts palette color name into RGBA color representation.
                 * Should by replaced by palette for charts.
                 *
                 * @param {string} color    Name of color from AM palette
                 * @returns {string} RGBa format
                 */
                function materialColorToRgba(color) {
                    return 'rgba(' + $mdColorPalette[color][500].value[0] + ','
                        + $mdColorPalette[color][500].value[1] + ','
                        + $mdColorPalette[color][500].value[2] + ','
                        + ($mdColorPalette[color][500].value[3] || 1) + ')';
                }

                /**
                 * Helpful method
                 * @private
                 */
                function generateParameterColor() {
                    vm.data.forEach(function (item, index) {
                        item.color = item.color || materialColorToRgba(colors[index]);
                    });
                }
            }
        };
    }
})();