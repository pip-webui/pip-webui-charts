(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name pipBarCharts
     *
     * @description
     * Bar chart on top of Rickshaw charts
     */
    angular.module('pipBarCharts', [])
        .directive('pipBarChart', pipBarChart);

    function pipBarChart() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries',
                xTickFormat: '=pipXTickFormat',
                yTickFormat: '=pipYTickFormat',
                interactiveLegend: '=pipInterLegend'
            },
            bindToController: true,
            controllerAs: 'barChart',
            templateUrl: 'bar/bar_chart.html',
            controller: function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                let vm = this;
                let chart = null;
                let chartElem = null;
                let colors = _.map($mdColorPalette, function (palette, color) {
                    return color;
                });
                let height = 270;

                vm.data = prepareData(vm.series) || [];
                // Sets colors of items
                generateParameterColor();
                vm.legend = _.clone(vm.series);
                
                if ((vm.series || []).length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }

                (<any>d3.scale).paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };

                $scope.$watch('barChart.series', function (updatedSeries) {
                    vm.data = prepareData(updatedSeries);
                    vm.legend = _.clone(vm.series);
                    generateParameterColor();

                    if (chart) {
                        chartElem.datum(vm.data).call(chart);
                        configBarWidthAndLabel();
                        drawEmptyState();
                    }
                });

                $scope.$watch('barChart.legend', function(updatedLegend) {
                    vm.data = prepareData(updatedLegend);
                    vm.legend = updatedLegend;

                    if (chart) {
                        chartElem.datum(vm.data).call(chart);
                        configBarWidthAndLabel();
                        drawEmptyState();
                    }
                }, true);

                function prepareData(data) {
                    let result = [];
                    _.each(data, (seria) => {
                        if (!seria.disabled) result.push(seria);
                    });

                    return _.cloneDeep(result);
                }

                /**
                 * Instantiate chart
                 */
                nv.addGraph(function () {
                    chart = nv.models.discreteBarChart()
                        .margin({top: 10, right: 0, bottom: 10, left: 50})
                        .x(function (d) { return d.label || d.key || d.x; })
                        .y(function (d) { return d.value; })
                        .showValues(true)
                        .staggerLabels(true) 
                        .showXAxis(true)
                        .showYAxis(true)
                        .valueFormat(<any>d3.format('d'))
                        .duration(0)
                        .height(height)
                        .color(function(d) {
                            return d.color || (<any>d3.scale).paletteColors().range();
                        });

                    chart.tooltip.enabled(false);
                    chart.noData('There is no data right now...');

                    chart.yAxis
                        .tickFormat(function (d) {
                            return vm.yTickFormat ? vm.yTickFormat(d) : d;
                        });

                    chart.xAxis
                        .tickFormat(function (d) {
                            return vm.xTickFormat ? vm.xTickFormat(d) : d;
                        });

                    chartElem = d3.select($element.get(0))
                        .select('.bar-chart svg')
                        .datum(vm.data)
                        .style('height', '285px')
                        .call(chart);

                    nv.utils.windowResize(() => {
                        chart.update();
                         configBarWidthAndLabel(0);
                    });

                    return chart;
                }, function () {

                    $timeout(configBarWidthAndLabel, 0);
                    drawEmptyState();
                });

                function drawEmptyState() {
                    if ($element.find('.nv-noData').length === 0) {
                        d3.select($element.find('.empty-state')[0]).remove();
                    } else {
                        $element.find('.nv-noData').attr('x', 100);

                        let g = chartElem.append('g').classed('empty-state', true);

                        g.append('g')
                            .style('fill', 'rgba(0, 0, 0, 0.08)')
                            .append('rect')
                            .attr('height', height - 10)
                            .attr('width', 38);

                        g.append('g')
                            .attr('transform', 'translate(46, 60)')
                            .style('fill', 'rgba(0, 0, 0, 0.08)')
                            .append('rect')
                            .attr('height', 200)
                            .attr('width', 38);

                        g.append('g')
                            .attr('transform', 'translate(92, 160)')
                            .style('fill', 'rgba(0, 0, 0, 0.08)')
                            .append('rect')
                            .attr('height', 100)
                            .attr('width', 38);
                    }
                }

                /**
                 * Aligns value label according to parent container size.
                 * @return {void}
                 */
                function configBarWidthAndLabel(timeout: number = 1000) {
                    var labels = $element.find('.nv-bar text'),
                        chartBars = $element.find('.nv-bar'),
                        parentHeight = (<any>$element.find('.nvd3-svg')[0]).getBBox().height;

                    d3.select($element.find('.bar-chart')[0]).classed('visible', true);

                    chartBars.each(function (index, item) {
                        var barHeight = Number(d3.select(<any>item).select('rect').attr('height')),
                            barWidth = Number(d3.select(<any>item).select('rect').attr('width')),
                            element = d3.select(<any>item),
                            x = d3.transform(element.attr('transform')).translate[0],
                            y = d3.transform(element.attr('transform')).translate[1];

                        element
                            .attr('transform', 'translate(' + Number(x + index * (barWidth + 15)) + ', ' + (height - 20) + ')')
                            .select('rect').attr('height', 0);

                        element
                            .transition()
                            .duration(timeout)
                            .attr('transform', 'translate(' + Number(x + index * (barWidth + 15)) + ', ' + y + ')')
                            .select('rect').attr('height', barHeight);

                        d3.select(labels[index])
                            .attr('dy', barHeight / 2 + 10)
                            .attr('x', barWidth / 2);
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
                 * Helpful method
                 * @private
                 */
                function generateParameterColor() {
                    if (!vm.data) return;

                    vm.data.forEach(function (item, index) {
                        if (item.values[0]) {
                            item.values[0].color = item.values[0].color || materialColorToRgba(colors[index]);
                            item.color = item.values[0].color;
                        }
                    });
                }
            }
        };
    }
})();