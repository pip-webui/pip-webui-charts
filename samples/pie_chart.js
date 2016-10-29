/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appPieChart', ['pipServices']);

    thisModule.controller('PieChartController',
        function ($scope) {
            $scope.series = [
                {
                    label: 'Completed',
                    value: 125,
                    color: '#4caf50'
                },
                {
                    label: 'Uncompleted',
                    value: 20,
                    color: '#fe9702'
                },
                {
                    label: 'Failures',
                    value: 5,
                    color: '#ef5350'
                }
            ];

            $scope.series2 = [
                {
                    label: 'Uncompleted',
                    value: 15,
                    color: '#fe9702'
                },
                {
                    label: 'Failures',
                    value: 5,
                    color: '#ef5350'
                }
            ];
        })


})();