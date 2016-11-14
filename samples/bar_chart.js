/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appBarChart', ['pipServices']);

    thisModule.controller('BarChartController',
        function ($scope) {
            $scope.series = [{
                key: 'Completed',
                values: [{value: 980, color: '#4caf50'}]
            }, {
            	key: 'Uncompleted',
            	values: [{value: 710, color: '#fe9702'}]
            }, {
            	key: 'Failures',
            	values: [{value: 250, color: '#ef5350'}]
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
