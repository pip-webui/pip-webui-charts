/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appBarChart', ['pipServices']);

    thisModule.controller('BarChartController',
        function ($scope) {
            // $scope.series = [{
            //     key: 'Completed',
            //     values: [{value: 980, label: '5 am'}]
            // }, {
            // 	key: 'Uncompleted',
            // 	values: [{value: 710, label: '5 am'}]
            // }, {
            // 	key: 'Failures',
            // 	values: [{value: 250, label: '5 am'}]
            // }];
            $scope.series2 = [
                { key: '1', values: [{value: 980, color: '#234567'}] },
                { key: '2', values: [{value: 1000, color: '#aa346e'}] },
                { key: '3', values: [{value: 1980, color: '#e5aa23'}] },
                { key: '4', values: [{value: 2980, color: '#6622bb'}] },
                { key: '5', values: [{value: 3980, color: '#dd55ee'}] },
            ];
            // $scope.series = [
            //     { key: '1', values: [{value: 10}, {value: 20}], color: '#234567' },
            //     { key: '2', values: [{value: 20}, {value: 30}], color: '#aa567' },
            //     { key: '3', values: [{value: 40}, {value: 50}], color: '#2a5aa7' },
            //     { key: '4', values: [{value: 60}, {value: 5}], color: '#234aa7' },
            //     { key: '5', values: [{value: 70}, {value: 15}], color: '#11ea45' },
            // ];
            // $scope.series = [
            //     { key: '1', values: [{x: 10, value: 10}, {x: 20, value: 21}], color: '#234567' },
            //     { key: '2', values: [{x: 10, value: 11}, {x: 20, value: 22}], color: '#aa567' },
            // ];

            $scope.series = [
                { key: '111', values: [{x: 10, value: 10}, {x: 20, value: 21}, {x: 30, value: 10}, {x: 40, value: 21}], color: '#234567' },
                { key: '222', values: [{x: 10, value: 11}, {x: 20, value: 22}, {x: 30, value: 10}, {x: 40, value: 21}], color: '#aa567' },
                { key: '3', values: [{x: 10, value: 12}, {x: 20, value: 23}, {x: 30, value: 10}, {x: 40, value: 21}], color: '#2a5aa7' },
                { key: '4', values: [{x: 10, value: 13}, {x: 20, value: 24}, {x: 30, value: 10}, {x: 40, value: 21}], color: '#234aa7' },
                { key: '5', values: [{x: 10, value: 14}, {x: 20, value: 25}, {x: 30, value: 10}, {x: 40, value: 21}], color: '#11ea45' },
            ];

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
