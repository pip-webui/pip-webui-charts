/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appLineChart', ['pipServices']);

    thisModule.controller('LineChartController',
        function ($scope) {
            $scope.series = [{
                key: 'Completed',
                values: [
                    {value: 1000, x: 0},
                    {value: 3000, x: 100},
                    {value: 2200, x: 200, color: '#ef5350'},
                    {value: 1500, x: 300},
                    {value: 1800, x: 400},
                    {value: 2800, x: 500},
                    {value: 900, x: 600}
                ],
                color: '#4caf50'
            },
                {
                    key: 'Uncompleted',
                    values: [
                        {value: 500, x: 0},
                        {value: 400, x: 100},
                        {value: 1200, x: 200},
                        {value: 300, x: 300},
                        {value: 100, x: 400},
                        {value: 280, x: 500},
                        {value: 500, x: 600}
                    ],
                    color: '#fe9702'
                },
                {
                    key: 'Failures',
                    values: [
                        {value: 100, x: 0},
                        {value: 200, x: 100},
                        {value: 150, x: 200},
                        {value: 120, x: 300},
                        {value: 50, x: 400},
                        {value: 300, x: 500},
                        {value: 20, x: 600}
                    ],
                    color: '#ef5350'
                }
            ];
        })


})();