/**
 * @file Registration of chart WebUI controls
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function (angular) {
    'use strict';

    angular.module('pipCharts', [
        'pipBarCharts',
        'pipLineCharts'
    ]);

})(window.angular);


(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('bar/bar_chart.html',
    '<div class="bar-chart flex-auto layout-column">\n' +
    '    <svg class="flex-auto"></svg>\n' +
    '</div>\n' +
    '\n' +
    '<div class="pip-chart-legend">\n' +
    '    <div class="legend-title" ng-repeat="item in barChart.legend">\n' +
    '        <span class="bullet" ng-style="{\'background-color\': item.color}"></span>\n' +
    '        <span>{{:: item.label}}</span>\n' +
    '    </div>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('line/line_chart.html',
    '<div class="line-chart" flex="auto" layout="column">\n' +
    '    <svg class="flex-auto"></svg>\n' +
    '</div>\n' +
    '\n' +
    '<div class="pip-chart-legend">\n' +
    '    <div class="legend-title" ng-repeat="item in lineChart.data">\n' +
    '        <span class="bullet" ng-style="{\'background-color\': item.color}"></span>\n' +
    '        <span>{{:: item.key}}</span>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);
})();

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
                series: '=pipSeries'
            },
            bindToController: true,
            controllerAs: 'barChart',
            templateUrl: 'bar/bar_chart.html',
            controller: ['$element', '$scope', '$timeout', '$interval', '$mdColorPalette', function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                var vm = this;
                var chart = null;
                var chartElem = null;
                var colors = _.map($mdColorPalette, function (palette, color) {
                    return color;
                });

                vm.data = vm.series || [];

                if ((vm.series || []).length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }

                //colors = _.sample(colors, colors.length);

                // sets legend params
                vm.legend = vm.data[0].values;
                
                // Sets colors of items
                generateParameterColor();

                d3.scale.paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };

                $scope.$watch('barChart.series', function (updatedSeries) {
                    vm.data = updatedSeries || [];

                    generateParameterColor();

                    if (chart) {
                        chartElem.datum(vm.data).call(chart);
                        chart.update();
                        intervalUpdate(chart.update, 10);
                    }
                });


                /**
                 * Instantiate chart
                 */
                nv.addGraph(function () {
                    chart = nv.models.discreteBarChart()
                        .margin({top: 10, right: 0, bottom: 0, left: -50})
                        .x(function (d) { return d.label; })
                        .y(function (d) { return d.value; })
                        .showValues(true)
                        .showXAxis(false)
                        .showYAxis(false)
                        .valueFormat(d3.format('d'))
                        .duration(0)
                        .height(270)
                        .color(function(d) {
                            return d.color || d3.scale.paletteColors().range();
                        });

                    chart.tooltip.enabled(false);
                    chart.noData('No data for this moment...');

                    chartElem = d3.select($element.get(0))
                        .select('.bar-chart svg')
                        .datum(vm.data)
                        .style('height', 270)
                        .call(chart);

                    //nv.utils.windowResize(chart.update);

                    return chart;
                }, function () {
                    chart.dispatch.on('beforeUpdate', function () {
                        $timeout(configBarWidthAndLabel, 0);
                    });

                    $timeout(configBarWidthAndLabel, 0);
                });

                /**
                 * Aligns value label according to parent container size.
                 * @return {void}
                 */
                function configBarWidthAndLabel() {
                    var labels = d3.selectAll('.nv-bar text')[0],
                        chartBars = d3.selectAll('.nv-bar')[0],
                        legendTitles = d3.selectAll('.legend-title')[0],
                        parentHeight = d3.select('.nvd3-svg')[0][0].getBBox().height;

                    d3.select('.bar-chart').classed('visible', true);

                    chartBars.forEach(function (item, index) {
                        var barSize = item.getBBox(),
                            element = d3.select(item),
                            y = d3.transform(element.attr('transform')).translate[1];
                        
                        element
                            .attr('transform', 'translate(' + Number(index * (38 + 8) + 50) + ', ' + parentHeight + ')')
                            .select('rect')
                            .attr('width', 38);

                        element
                            .transition()
                            .duration(1000)
                            .attr('transform', 'translate(' + Number(index * (38 + 8) + 50) + ', ' + y + ')');

                        d3.select(labels[index])
                            .attr('dy', barSize.height / 2)
                            .attr('x', 19);
                    });

                    legendTitles.forEach(function (item, index) {
                        $timeout(function () {
                            $(item).addClass('visible');
                        }, 200 * index);
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
                    vm.legend.forEach(function (item, index) {
                        item.color = item.color || materialColorToRgba(colors[index]);
                    });
                }
            }]
        };
    }
})();
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
            controller: ['$element', '$scope', '$timeout', '$interval', '$mdColorPalette', function ($element, $scope, $timeout, $interval, $mdColorPalette) {
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
                        .interactive(true)
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
                            return Math.round(d % 1 * 100);
                        });

                    chart.xAxis
                        .tickFormat(function (d) {
                            return Math.round(d);
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
            }]
        };
    }
})();
//# sourceMappingURL=pip-webui-charts.js.map
