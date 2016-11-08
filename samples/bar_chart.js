/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appBarChart', ['pipServices']);

    thisModule.controller('BarChartController',
        function ($scope) {
            $scope.series = [{
                key: 'Some key',
                values: [
                    {value: 980, label: 'Completed', color: '#4caf50'},
                    {value: 710, label: 'Uncompleted', color: '#fe9702'},
                    {value: 250, label: 'Failures', color: '#ef5350'}
                ]
            }];

            $scope.setOrUnset = "Set";

            $scope.setSecSeries = function() {
                if (!$scope.series2) {
                    $scope.series2 = $scope.series;
                    $scope.setOrUnset = "Unset";
                } else {
                    $scope.series2 = undefined;
                    $scope.setOrUnset = "Set";
                }
            }
        }
    )

})();
