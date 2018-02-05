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

            // $scope.series2 = [
            //     { key: '1', values: [{value: 980}], color: '#234567' },
            //     { key: '2', values: [{value: 1000}], color: '#234567' },
            //     { key: '3', values: [{value: 1980}], color: '#234567' },
            //     { key: '4', values: [{value: 2980}], color: '#234567' },
            //     { key: '5', values: [{value: 3980}], color: '#234567' },
            //     { key: '11', values: [{value: 980}], color: '#234567' },
            //     { key: '12', values: [{value: 1000}], color: '#234567' },
            //     { key: '13', values: [{value: 1980}], color: '#234567' },
            //     { key: '14', values: [{value: 2980}], color: '#234567' },
            //     { key: '15', values: [{value: 3980}], color: '#234567' },
            //     { key: '21', values: [{value: 980}], color: '#234567' },
            //     { key: '22', values: [{value: 1000}], color: '#234567' },
            //     { key: '23', values: [{value: 1980}], color: '#234567' },
            //     { key: '24', values: [{value: 2980}], color: '#234567' },
            //     { key: '25', values: [{value: 3980}], color: '#234567' },
            //     { key: '31', values: [{value: 980}], color: '#234567' },
            //     { key: '32', values: [{value: 1000}], color: '#234567' },
            //     { key: '33', values: [{value: 1980}], color: '#234567' },
            //     { key: '34', values: [{value: 2980}], color: '#234567' },
            //     { key: '35', values: [{value: 3980}], color: '#234567' },                               
            // ];

            $scope.series2 = [ {
               values: [{value: 980, x: 2}, {value: 1000, x: 3},{value: 1980, x: 4},{value: 2980, x: 5},{value: 3980, x: 6},{value: 980, x: 7}
                //     {value: 1000},{value: 1980},{value: 2980},{value: 3980},{value: 980},{value: 1000},
                //    { value: 1980},{value: 2980},{value: 3980},{value: 980},{value: 1000},{value: 1980},{value: 2980},{value: 3980}
                ]                             
            }];

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

            // $scope.series = exampleData();

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
console.log ('exampleData', exampleData());

            function stream_layers(n, m, o) {
                if (arguments.length < 3) o = 0;
                function bump(a) {
                  var x = 1 / (.1 + Math.random()),
                      y = 2 * Math.random() - .5,
                      z = 10 / (.1 + Math.random());
                  for (var i = 0; i < m; i++) {
                    var w = (i / m - y) * z;
                    a[i] += x * Math.exp(-w * w);
                  }
                }
                return d3.range(n).map(function() {
                    var a = [], i;
                    for (i = 0; i < m; i++) a[i] = o + o * Math.random();
                    for (i = 0; i < 5; i++) bump(a);
                    return a.map(stream_index);
                  });
              }
              function stream_index(d, i) {
                return {x: i, y: Math.max(0, d)};
              }
            function exampleData() {
                return stream_layers(3,10+Math.random()*10,.1).map(function(data, i) {
                  return {
                    key: 'Stream #' + i,
                    values: data
                  };
                });
              }
        }
    )

})();
