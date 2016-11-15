/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appBarChart', ['pipServices']);

    thisModule.controller('BarChartController',
        function ($scope) {
            $scope.series = [{
                key: 'Completed',
                values: [{value: 980, label: '5 am'}]
            }, {
            	key: 'Uncompleted',
            	values: [{value: 710, label: '5 am'}]
            }, {
            	key: 'Failures',
            	values: [{value: 250, label: '5 am'}]
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
