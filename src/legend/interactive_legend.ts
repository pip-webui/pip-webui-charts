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

                function animate() {
                    var legendTitles = $($element).find('.chart-legend-item');

                    legendTitles.each(function (index, item) {
                        $timeout(function () {
                            $(item).addClass('visible');
                        }, 200 * index);
                    });
                }
                
                function prepareSeries() {
                    if (!$scope.series) return;

                    $scope.series.forEach(function (item, index) {
                        item.color = item.color || (item.values && item.values[0] && item.values[0].color ? item.values[0].color : colors[index]);
                        item.disabled = item.disabled || false;
                    });   
                }

                $scope.$watch('series', function () {
                    $timeout(function () {
                        animate();
                        colorCheckboxes();
                    }, 0);
                    prepareSeries();
                }, true);

                $scope.$watch('interactive', function (newValue, oldValue) {
                    if (newValue == true && newValue != oldValue) {
                        $timeout(colorCheckboxes, 0);
                    }
                });

                $timeout(function () {
                    animate();
                    colorCheckboxes();
                }, 0);
                prepareSeries();
            }
        };
    }
})();