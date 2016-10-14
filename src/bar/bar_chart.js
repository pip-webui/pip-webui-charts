(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name pipStaticCharts
     *
     * @description
     * Bar chart on top of Rickshaw charts
     */
    angular.module('pipStaticCharts', [])
        .directive('pipBarChart', pipBarChart);

    function pipBarChart() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries'
            },
            bindToController: true,
            controllerAs: 'barChart',
            templateUrl: 'bar/bar_chart.html',
            controller: function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                var vm = this;
                var chart = null;
                var chartElem = null;
                var setLabelPosition = _.debounce(setLabelPositionUnwrap, 150);
                var colors = _.map($mdColorPalette, function (palette, color) {
                    return color;
                });

                console.log('colors', colors);

                vm.data = vm.series || [];

                if ((vm.series || []).length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }

                // TODO [apidhirnyi] Ask Alex about colors for charts
                //colors = _.sample(colors, colors.length);

                // Sets colors of items
                generateParameterColor();

                // sets legend params
                vm.legend = vm.data[0].values;

                d3.scale.paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };

                $scope.$watch('barChart.series', function (updatedSeries) {
                    vm.data = updatedSeries || [];

                    generateParameterColor();

                    if (chart) {
                        chartElem.datum(vm.data).call(chart);
                        chart.update();
                        intervalUpdate(chart.update, 10); // TODO [apidhirnyi] Temp dirty hack
                    }
                });


                /**
                 * Instantiate chart
                 */
                nv.addGraph(function () {
                    chart = nv.models.discreteBarChart()
                        .margin({top: 10, right: 0, bottom: 10, left: 0})
                        .x(function (d) {
                            return d.label;
                        })
                        .y(function (d) {
                            return d.value;
                        })
                        .showValues(true)
                        .showXAxis(false)
                        .showYAxis(false)
                        .valueFormat(d3.format('d'))
                        .color(d3.scale.paletteColors().range());

                    chart.tooltip.enabled(false);
                    chart.noData('There are no readings for this moment...');

                    chartElem = d3.select($element.get(0))
                        .select('.bar-chart svg')
                        .datum(vm.data)
                        .call(chart);

                    nv.utils.windowResize(chart.update);

                    intervalUpdate(chart.update, 10);

                    return chart;
                }, function () {
                    chart.dispatch.on('beforeUpdate', function () {
                        $timeout(setLabelPosition, 100);    // dirty hack. Replace by callback
                    });

                    $timeout(setLabelPosition, 100);        // dirty hack. Replace by callback
                });

                /**
                 * Aligns value label according to parent container size.
                 * @return {void}
                 */
                function setLabelPositionUnwrap() {
                    var labels = d3.selectAll('.nv-bar text')[0];
                    var chartBars = d3.selectAll('.nv-bar')[0];

                    chartBars.forEach(function (item, index) {
                        var barSize = item.getBBox();

                        d3.select(labels[index]).attr('dy', barSize.height / 2 + 6);   // 6px = magic float to align text
                    });
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
                 * Temp huck for demo
                 * Dirty way to overcome async in charts
                 */
                function intervalUpdate(cb, times) {
                    var counter = 0;

                    var intervalID = $interval(function () {
                        if (counter <= times) {
                            cb();
                            counter++;
                        } else {
                            $interval.cancel(intervalID);
                        }
                    }, 200);
                }

                /**
                 * Helpful method
                 * @private
                 */
                function generateParameterColor() {
                    console.log('colors', colors);
                    vm.data.forEach(function (item, index) {
                        item.color = materialColorToRgba(colors[index]);
                    });
                }
            }
        };
    }
})();