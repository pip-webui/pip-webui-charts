/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appBarChart', ['pipServices']);

    thisModule.controller('BarChartController',
        function ($scope) {
            //$scope.series = [
            //    {values: 25, label: 'Completed'},
            //    {values: 10, label: 'Uncompleted'}
            //];

            $scope.series = [{
                key: 'Some key',
                values: [
                    {value: 25, label: 'Completed'},
                    {value: 10, label: 'Uncompleted'}
                ]
            }];
        }
    )

})();
