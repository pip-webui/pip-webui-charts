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
                        .interactive(true)
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
                            return d;
                        });

                    chartElem = d3.select($element.get(0)).select('.line-chart svg');
                    chartElem.datum(vm.data).style('height', 270).call(chart);

                    if (vm.dynamic) {
                        addZoom({
                            xAxis: chart.xAxis,
                            yAxis: chart.yAxis,
                            yDomain: chart.yDomain,
                            xDomain: chart.xDomain,
                            redraw: function () {
                                chart.update();
                            },
                            svg: chartElem
                        });
                    }

                    nv.utils.windowResize(chart.update);

                    return chart;
                });

                function addZoom(options) {
                    // scaleExtent
                    var scaleExtent = 4;

                    // parameters
                    var yAxis       = options.yAxis;
                    var xAxis       = options.xAxis;
                    var xDomain     = options.xDomain || xAxis.scale().domain;
                    var yDomain     = options.yDomain || yAxis.scale().domain;
                    var redraw      = options.redraw;
                    var svg         = options.svg;
                    var discrete    = options.discrete;

                    // scales
                    var xScale = xAxis.scale();
                    var yScale = yAxis.scale();

                    // min/max boundaries
                    var x_boundary = xAxis.scale().domain().slice();
                    var y_boundary = yAxis.scale().domain().slice();

                    // create d3 zoom handler
                    var d3zoom = d3.behavior.zoom();
                    var prevXDomain = x_boundary;
                    var prevScale = d3zoom.scale();
                    var prevTranslate = d3zoom.translate();

                    // ensure nice axis
                    xScale.nice();
                    yScale.nice();

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

                    // zoom event handler
                    function zoomed() {
                        // Switch off vertical zooming temporary
                        // yDomain(yScale.domain());
                        if ((<any>d3.event).scale === 1) {
                            unzoomed();
                        } else {
                            xDomain(fixDomain(xScale.domain(), x_boundary, (<any>d3.event).scale, (<any>d3.event).translate));
                            redraw();
                        }
                    }

                    // zoom event handler
                    function unzoomed() {
                        xDomain(x_boundary);
                        yDomain(y_boundary);
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