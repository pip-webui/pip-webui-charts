/* global angular */

(function () {
    'use strict';

    var content = [
        { title: 'Bar chart', state: 'bar', url: '/bar', controller: 'BarChartController', templateUrl: 'bar_chart.html' },
        { title: 'Line chart', state: 'line', url: '/line', controller: 'LineChartController', templateUrl: 'line_chart.html'},
        { title: 'Pie chart', state: 'pie', url: '/pie', controller: 'PieChartController', templateUrl: 'pie_chart.html'},
        { title: 'Legend', state: 'legend', url: '/legend', controller: 'LegendController', templateUrl: 'legend.html'}
    ];


    var thisModule = angular.module('app', ['ngMaterial',
        'pipServices', 'pipCharts',
        'appLineChart', 'appBarChart', 'appPieChart', 'appLegend']);

    thisModule.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider, $mdIconProvider) {

            $mdIconProvider.iconSet('icons', 'images/icons.svg', 512);

            for (var i = 0; i < content.length; i++) {
                var contentItem = content[i];
                $stateProvider.state(contentItem.state, contentItem);
            }

            $urlRouterProvider.otherwise('/bar');
        }
    );

    thisModule.controller('AppController',
        function ($scope, $rootScope, $state, $mdSidenav) {

            $scope.content = content;
            $scope.onThemeClick = function(theme) {
                $rootScope.$theme = theme;
            };

            // Update page after language changed
            $rootScope.$on('languageChanged', function(event) {

                $state.reload();
            });

            // Update page after theme changed
            $rootScope.$on('themeChanged', function(event) {
                $state.reload();
            });

            $scope.onSwitchPage = function(state) {
                $mdSidenav('left').close();
                $state.go(state);
            };

            $scope.onToggleMenu = function() {
                $mdSidenav('left').toggle();
            };

            $scope.isActiveState = function(state) {
                return $state.current.name == state;
            };
        }
    );

})();