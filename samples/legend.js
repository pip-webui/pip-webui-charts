/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appLegend', ['pipServices']);

    thisModule.controller('LegendController',
        function ($scope) {
            $scope.interactive = true;
            
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
        })


})();