/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appLineChart', ['pipServices']);

    thisModule.controller('LineChartController',
        function ($scope, $interval) {
            var startYear = 2022;

            $scope.showX = true;
            $scope.showY = true;
            
            $scope.formatX = function(x) {
                return new Date(x).getFullYear();
            }

            $scope.formatXTick = function(x) {
                return x + ' y.';
            }

            $scope.xTickValues = [2014, 2020, 2];

            $scope.series = [
                {
                    key: 'Uncompleted',
                    values: [
                        {value: 500, x: new Date(2015, 0, 0, 0)},
                        {value: 400, x: new Date(2016, 0, 0, 0)},
                        {value: 1200, x: new Date(2017, 0, 0, 0)},
                        {value: 300, x: new Date(2018, 0, 0, 0)},
                        {value: 100, x: new Date(2019, 0, 0, 0)},
                        {value: 280, x: new Date(2020, 0, 0, 0)},
                        {value: 500, x: new Date(2021, 0, 0, 0)}
                    ],
                    color: '#fe9702'
                },
                {
                    key: 'Failures',
                    values: [
                        {value: 100, x: new Date(2015, 0, 0, 0)},
                        {value: 200, x: new Date(2016, 0, 0, 0)},
                        {value: 150, x: new Date(2017, 0, 0, 0)},
                        {value: 120, x: new Date(2018, 0, 0, 0)},
                        {value: 50, x: new Date(2019, 0, 0, 0)},
                        {value: 300, x: new Date(2020, 0, 0, 0)},
                        {value: 20, x: new Date(2021, 0, 0, 0)}
                    ],
                    color: '#ef5350'
                }
            ];

            $scope.series2 = _.cloneDeep($scope.series);

            $scope.update = () => {
                $scope.xTickValues = [2014, 2020, 1];
                $scope.series = [];
                setTimeout(() => {
                    $scope.series = _.cloneDeep($scope.series2);
                });
            }

            function nextStep() {
                $scope.series.forEach(function (seria) {
                    seria.values.push({value: Math.random() * 3000, x: new Date(startYear, 0, 0, 0)});
                });

                $scope.series2.forEach(function (seria) {
                    seria.values.push({value: Math.random() * 3000, x: new Date(startYear, 0, 0, 0)});
                });
                startYear++;
            }

            //$interval(nextStep, 15000);
        })
})();