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
                series: '=pipSeries'
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

                    nv.utils.windowResize(chart.update);

                    return chart;
                }, function () {
                    var legendTitles = d3.selectAll('.legend-title')[0];
                    
                    legendTitles.forEach(function (item, index) {
                        $timeout(function () {
                            $(item).addClass('visible');
                        }, 200 * index);
                    });

                    d3.select('.nv-groups')
                        .on('mouseenter', function () {
                            console.log('1', d3.select(d3.select('.nv-interactiveGuideLine')[0][0]));
                            console.log('2', d3.select('.nv-interactiveGuideLine')[0][0]);
                        })
                });

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