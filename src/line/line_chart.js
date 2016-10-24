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
                showXAxis: '=pipXAxis'
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
                
                vm.isVisibleX = function () {
                    return vm.showXAxis == undefined ? true : vm.showXAxis; 
                };

                vm.isVisibleY = function () {
                    return vm.showYAxis == undefined ? true : vm.showYAxis;
                };
                
                if (vm.series.length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }
                
                //colors = _.sample(colors, colors.length);

                // Sets colors of items
                generateParameterColor();

                d3.scale.paletteColors = function () {
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
                        .useInteractiveGuideline(true)
                        .showXAxis(true)
                        .showYAxis(true)
                        .showLegend(false)
                        .color(function(d) {
                            return d.color || d3.scale.paletteColors().range();
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

                    addZoom({
                        xAxis  : chart.xAxis,
                        yAxis  : chart.yAxis,
                        yDomain: chart.yDomain,
                        xDomain: chart.xDomain,
                        redraw : function() { chart.update(); },
                        svg    : chartElem
                    });

                    nv.utils.windowResize(chart.update);

                    return chart;
                }, function () {
                    var legendTitles = d3.selectAll('.legend-title')[0];
                    
                    legendTitles.forEach(function (item, index) {
                        $timeout(function () {
                            $(item).addClass('visible');
                        }, 200 * index);
                    });
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
                    var x_boundary = xScale.domain().slice();
                    var y_boundary = yScale.domain().slice();

                    // create d3 zoom handler
                    var d3zoom = d3.behavior.zoom();

                    // ensure nice axis
                    xScale.nice();
                    yScale.nice();

                    // fix domain
                    function fixDomain(domain, boundary) {
                        if (discrete) {
                            domain[0] = parseInt(domain[0]);
                            domain[1] = parseInt(domain[1]);
                        }
                        domain[0] = Math.min(Math.max(domain[0], boundary[0]), boundary[1] - boundary[1]/scaleExtent);
                        domain[1] = Math.max(boundary[0] + boundary[1]/scaleExtent, Math.min(domain[1], boundary[1]));

                        return domain;
                    }

                    // zoom event handler
                    function zoomed() {
                        console.log('event', d3.event);

                        if (d3.event.sourceEvent.type === 'wheel') {
                            if (d3.event.scale === 1) {
                                unzoomed();
                            } else {
                                yDomain(fixDomain(yScale.domain(), y_boundary));
                                xDomain(fixDomain(xScale.domain(), x_boundary));
                                redraw();
                            }
                        } else {
                            console.log('mousemove');
                        }
                    }

                    // zoom event handler
                    function unzoomed() {
                        xDomain(x_boundary);
                        yDomain(y_boundary);
                        redraw();
                        d3zoom.scale(1);
                        d3zoom.translate([0,0]);
                    }

                    // initialize wrapper
                    d3zoom.x(xScale)
                        .y(yScale)
                        .scaleExtent([1, scaleExtent])
                        .on('zoom', zoomed);

                    // add handler
                    d3.select($element.get(0)).call(d3zoom).on('dblclick.zoom', unzoomed);
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