/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appBarChart', ['pipCore']);

    thisModule.controller('BarChartController',
        function ($scope) {
            $scope.series = [
                {value: 25, label: 'Completed'},
                {value: 10, label: 'Uncompleted'}
            ];
        })


})();
