(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name pipLegends
     *
     * @description
     * Legend of charts
     */
    angular.module('pipChartLegends', [])
        .directive('pipChartLegend', pipChartLegend);

    function pipChartLegend() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries',
                interactive: '=pipInteractive'
            },
            templateUrl: 'legend/interactive_legend.html',
            controller: function ($element, $scope, $timeout, $mdColorPalette) {
                var colors = _.map($mdColorPalette, function (palette) {
                    return palette[500].hex;
                });

                function colorCheckboxes() {
                    var checkboxContainers = $($element).find('md-checkbox .md-container');
                    
                    checkboxContainers.each(function (index, item) {
                        $(item)
                            .css('color', $scope.series[index].color || colors[index])
                            .find('.md-icon')
                            .css('background-color', $scope.series[index].color || colors[index]);
                    });
                }

                function animateAndColor() {
                    var legendTitles = $($element).find('.chart-legend-item');

                    legendTitles.each(function (index, item) {
                        $timeout(function () {
                            $(item).addClass('visible');
                        }, 200 * index);
                    });
                }

                $timeout(function () {
                    animateAndColor();
                    colorCheckboxes();
                }, 0);

                $scope.series.forEach(function (item, index) {
                    item.color = item.color || colors[index];
                });

                $scope.$watch('interactive', function (newValue, oldValue) {
                    if (newValue == true && newValue != oldValue) {
                        $timeout(colorCheckboxes, 0);
                    }
                });
            }
        };
    }
})();