/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appBarChart', ['pipCore']);

    thisModule.controller('BarChartController',
        function ($scope) {
            //$scope.series = [
            //    {values: 25, label: 'Completed'},
            //    {values: 10, label: 'Uncompleted'}
            //];

            $scope.series = [{
                key: 'Some key',
                values: [
                    {value: 980, label: 'Completed', color: '#4caf50'},
                    {value: 710, label: 'Uncompleted', color: '#fe9702'},
                    {value: 250, label: 'Failures', color: '#ef5350'}
                ]
            }];
        }
    )

})();
