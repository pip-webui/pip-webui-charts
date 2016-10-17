(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name pipPieCharts
     *
     * @description
     * Line chart on top of Rickshaw charts
     */
    angular.module('pipPieCharts', [])
        .directive('pipPieChart', pipPieChart);

    function pipPieChart() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries'
            },
            bindToController: true,
            controllerAs: 'pieChart',
            templateUrl: 'pie/pie_chart.html',
            controller: function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                var vm               = this;
                var chart            = null;
                var titleElem        = null;
                var chartElem        = null;
                var colors           = _.map($mdColorPalette, function (palette, color) {
                    return color;
                });
                var resizeTitleLabel = resizeTitleLabelUnwrap;

                vm.data = vm.data || [];

                if (vm.series.length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }

                $scope.$watch('pieChart.series', function (newVal) {
                    vm.data = newVal;

                    generateParameterColor();

                    if (chart) {
                        chartElem.datum(vm.data).call(chart);
                        $timeout(resizeTitleLabel);
                    }
                }, true);

                // Sets colors of items
                generateParameterColor();

                d3.scale.paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };

                /**
                 * Instantiate chart
                 */
                nv.addGraph(function () {
                    chart = nv.models.pieChart()
                        .margin({ top: 0, right: 0, bottom: 0, left: 0 })
                        .x(function (d) {
                            return d.value;
                        })
                        .y(function (d) {
                            return d.value;
                        })
                        .showLabels(true)
                        .growOnHover(false)
                        .donut(true)
                        .donutRatio(0.55)
                        .color(d3.scale.paletteColors().range());

                    chart.tooltip.enabled(false);
                    chart.noData('There are no readings for this moment...');
                    chart.showLegend(false);

                    chartElem = d3.select($element.get(0))
                        .select('.pie-chart svg')
                        .datum(vm.data)
                        .call(chart);

                    nv.utils.windowResize(function () {
                        chart.update();
                        $timeout(resizeTitleLabel);
                    });

                    return chart;
                }, function () {
                    $timeout(_.debounce(renderTotalLabel, 250));
                });

                function renderTotalLabel() {
                    var svgElem  = d3.select($element.get(0)).select('.pie-chart svg')[0][0];
                    var totalVal = vm.data.reduce(function (sum, curr) {
                        return sum + curr.value;
                    }, 0);

                    d3.select(svgElem)
                        .select('.nv-pie:not(.nvd3)')
                        .append('text')
                        .classed('label-total', true)
                        .attr('text-anchor', 'middle')
                        .style('dominant-baseline', 'central')
                        .text(totalVal);

                    titleElem = d3.select($element.find('text.label-total').get(0));
                    resizeTitleLabel();
                }

                function resizeTitleLabelUnwrap() {
                    var boxSize = $element.find('.nv-pieLabels').get(0).getBBox();

                    if (!boxSize.width || !boxSize.height) {
                        return;
                    }

                    titleElem.style('font-size', ~~boxSize.width / 2);
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
                        item.color = materialColorToRgba(colors[index]);
                    });
                }
            }
        };
    }
})();