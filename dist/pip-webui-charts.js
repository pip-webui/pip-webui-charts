(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).charts = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
    'use strict';
    angular.module('pipBarCharts', [])
        .directive('pipBarChart', pipBarChart);
    function pipBarChart() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries',
                xTickFormat: '=pipXTickFormat',
                yTickFormat: '=pipYTickFormat',
                interactiveLegend: '=pipInterLegend'
            },
            bindToController: true,
            controllerAs: 'barChart',
            templateUrl: 'bar/bar_chart.html',
            controller: ['$element', '$scope', '$timeout', '$interval', '$mdColorPalette', function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                var vm = this;
                var chart = null;
                var chartElem = null;
                var colors = _.map($mdColorPalette, function (palette, color) {
                    return color;
                });
                var height = 270;
                vm.data = prepareData(vm.series) || [];
                vm.legend = _.clone(vm.series);
                if ((vm.series || []).length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }
                generateParameterColor();
                d3.scale.paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };
                $scope.$watch('barChart.series', function (updatedSeries) {
                    vm.data = prepareData(updatedSeries);
                    vm.legend = _.clone(vm.series);
                    generateParameterColor();
                    if (chart) {
                        chartElem.datum(vm.data).call(chart);
                        configBarWidthAndLabel();
                        drawEmptyState();
                    }
                });
                $scope.$watch('barChart.legend', function (updatedLegend) {
                    vm.data = prepareData(updatedLegend);
                    vm.legend = updatedLegend;
                    if (chart) {
                        chartElem.datum(vm.data).call(chart);
                        configBarWidthAndLabel();
                        drawEmptyState();
                    }
                }, true);
                function prepareData(data) {
                    var result = [];
                    _.each(data, function (seria) {
                        if (!seria.disabled && seria.values)
                            result.push(seria);
                    });
                    return _.cloneDeep(result);
                }
                nv.addGraph(function () {
                    chart = nv.models.discreteBarChart()
                        .margin({ top: 10, right: 0, bottom: 10, left: 50 })
                        .x(function (d) { return d.label || d.key || d.x; })
                        .y(function (d) { return d.value; })
                        .showValues(true)
                        .staggerLabels(true)
                        .showXAxis(true)
                        .showYAxis(true)
                        .valueFormat(d3.format('d'))
                        .duration(0)
                        .height(height)
                        .color(function (d) {
                        return vm.data[d.series].color || materialColorToRgba(colors[d.series]);
                    });
                    chart.tooltip.enabled(false);
                    chart.noData('There is no data right now...');
                    chart.yAxis
                        .tickFormat(function (d) {
                        return vm.yTickFormat ? vm.yTickFormat(d) : d;
                    });
                    chart.xAxis
                        .tickFormat(function (d) {
                        return vm.xTickFormat ? vm.xTickFormat(d) : d;
                    });
                    chartElem = d3.select($element.get(0))
                        .select('.bar-chart svg')
                        .datum(vm.data)
                        .style('height', '285px')
                        .call(chart);
                    nv.utils.windowResize(function () {
                        chart.update();
                        configBarWidthAndLabel(0);
                        drawEmptyState();
                    });
                    return chart;
                }, function () {
                    $timeout(configBarWidthAndLabel, 0);
                    drawEmptyState();
                });
                function drawEmptyState() {
                    if ($element.find('.nv-noData').length === 0) {
                        d3.select($element.find('.empty-state')[0]).remove();
                    }
                    else {
                        var g = chartElem.append('g').classed('empty-state', true), width = $element.find('.nvd3-svg').innerWidth(), margin = width * 0.1;
                        g.append('g')
                            .style('fill', 'rgba(0, 0, 0, 0.08)')
                            .append('rect')
                            .attr('height', height - 10)
                            .attr('width', 38);
                        g.append('g')
                            .attr('transform', 'translate(42, 60)')
                            .style('fill', 'rgba(0, 0, 0, 0.08)')
                            .append('rect')
                            .attr('height', 200)
                            .attr('width', 38);
                        g.append('g')
                            .attr('transform', 'translate(84, 160)')
                            .style('fill', 'rgba(0, 0, 0, 0.08)')
                            .append('rect')
                            .attr('height', 100)
                            .attr('width', 38);
                        g.attr('transform', 'translate(' + (50 + margin) + ', 0), ' + 'scale(' + ((width - 2 * margin) / 126) + ', 1)');
                    }
                }
                function configBarWidthAndLabel(timeout) {
                    if (timeout === void 0) { timeout = 1000; }
                    var labels = $element.find('.nv-bar text'), chartBars = $element.find('.nv-bar'), parentHeight = $element.find('.nvd3-svg')[0].getBBox().height;
                    d3.select($element.find('.bar-chart')[0]).classed('visible', true);
                    chartBars.each(function (index, item) {
                        var barHeight = Number(d3.select(item).select('rect').attr('height')), barWidth = Number(d3.select(item).select('rect').attr('width')), element = d3.select(item), x = d3.transform(element.attr('transform')).translate[0], y = d3.transform(element.attr('transform')).translate[1];
                        element
                            .attr('transform', 'translate(' + Number(x + index * (barWidth + 15)) + ', ' + (height - 20) + ')')
                            .select('rect').attr('height', 0);
                        element
                            .transition()
                            .duration(timeout)
                            .attr('transform', 'translate(' + Number(x + index * (barWidth + 15)) + ', ' + y + ')')
                            .select('rect').attr('height', barHeight);
                        d3.select(labels[index])
                            .attr('dy', barHeight / 2 + 10)
                            .attr('x', barWidth / 2);
                    });
                }
                function materialColorToRgba(color) {
                    return 'rgba(' + $mdColorPalette[color][500].value[0] + ','
                        + $mdColorPalette[color][500].value[1] + ','
                        + $mdColorPalette[color][500].value[2] + ','
                        + ($mdColorPalette[color][500].value[3] || 1) + ')';
                }
                function generateParameterColor() {
                    if (!vm.data)
                        return;
                    vm.data.forEach(function (item, index) {
                        if (item.values[0]) {
                            item.values[0].color = item.values[0].color || materialColorToRgba(colors[index]);
                            item.color = item.values[0].color;
                        }
                    });
                }
            }]
        };
    }
})();
},{}],2:[function(require,module,exports){
(function () {
    'use strict';
    angular.module('pipCharts', [
        'pipBarCharts',
        'pipLineCharts',
        'pipPieCharts',
        'pipChartLegends',
        'pipCharts.Templates'
    ]);
})();
},{}],3:[function(require,module,exports){
(function () {
    'use strict';
    angular.module('pipChartLegends', [])
        .directive('pipChartLegend', pipChartLegend);
    function pipChartLegend() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries',
                interactive: '=pipInteractive'
            },
            templateUrl: 'legend/interactive_legend.html',
            controller: ['$element', '$scope', '$timeout', '$mdColorPalette', function ($element, $scope, $timeout, $mdColorPalette) {
                var colors = _.map($mdColorPalette, function (palette) {
                    return palette[500].hex;
                });
                function colorCheckboxes() {
                    var checkboxContainers = $($element).find('md-checkbox .md-container');
                    checkboxContainers.each(function (index, item) {
                        $(item)
                            .css('color', $scope.series[index].color || colors[index])
                            .find('.md-icon')
                            .css('background-color', $scope.series[index].color || colors[index]);
                    });
                }
                function animate() {
                    var legendTitles = $($element).find('.chart-legend-item');
                    legendTitles.each(function (index, item) {
                        $timeout(function () {
                            $(item).addClass('visible');
                        }, 200 * index);
                    });
                }
                function prepareSeries() {
                    if (!$scope.series)
                        return;
                    $scope.series.forEach(function (item, index) {
                        item.color = item.color || (item.values && item.values[0] && item.values[0].color ? item.values[0].color : colors[index]);
                        item.disabled = item.disabled || false;
                    });
                }
                $scope.$watch('series', function () {
                    $timeout(function () {
                        animate();
                        colorCheckboxes();
                    }, 0);
                    prepareSeries();
                }, true);
                $scope.$watch('interactive', function (newValue, oldValue) {
                    if (newValue == true && newValue != oldValue) {
                        $timeout(colorCheckboxes, 0);
                    }
                });
                $timeout(function () {
                    animate();
                    colorCheckboxes();
                }, 0);
                prepareSeries();
            }]
        };
    }
})();
},{}],4:[function(require,module,exports){
(function () {
    'use strict';
    angular.module('pipLineCharts', [])
        .directive('pipLineChart', pipLineChart);
    function pipLineChart() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries',
                showYAxis: '=pipYAxis',
                showXAxis: '=pipXAxis',
                xFormat: '=pipXFormat',
                xTickFormat: '=pipXTickFormat',
                yTickFormat: '=pipYTickFormat',
                dynamic: '=pipDynamic',
                fixedHeight: '@pipDiagramHeight',
                dynamicHeight: '@pipDynamicHeight',
                minHeight: '@pipMinHeight',
                maxHeight: '@pipMaxHeight',
                interactiveLegend: '=pipInterLegend'
            },
            bindToController: true,
            controllerAs: 'lineChart',
            templateUrl: 'line/line_chart.html',
            controller: ['$element', '$scope', '$timeout', '$interval', '$mdColorPalette', function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                var vm = this;
                var chart = null;
                var chartElem = null;
                var setZoom = null;
                var updateZoomOptions = null;
                var fixedHeight = vm.fixedHeight || 270;
                var dynamicHeight = vm.dynamicHeight || false;
                var minHeight = vm.minHeight || fixedHeight;
                var maxHeight = vm.maxHeight || fixedHeight;
                var colors = _.map($mdColorPalette, function (palette, color) {
                    return color;
                });
                vm.data = prepareData(vm.series) || [];
                vm.legend = _.clone(vm.series);
                vm.sourceEvents = [];
                vm.isVisibleX = function () {
                    return vm.showXAxis == undefined ? true : vm.showXAxis;
                };
                vm.isVisibleY = function () {
                    return vm.showYAxis == undefined ? true : vm.showYAxis;
                };
                vm.zoomIn = function () {
                    if (setZoom) {
                        setZoom('in');
                    }
                };
                vm.zoomOut = function () {
                    if (setZoom) {
                        setZoom('out');
                    }
                };
                if (vm.series && vm.series.length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }
                generateParameterColor();
                d3.scale.paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };
                $scope.$watch('lineChart.series', function (updatedSeries) {
                    vm.data = prepareData(updatedSeries);
                    vm.legend = _.clone(vm.series);
                    generateParameterColor();
                    if (chart) {
                        chartElem.datum(vm.data || []).call(chart);
                        drawEmptyState();
                        if (updateZoomOptions)
                            updateZoomOptions(vm.data);
                    }
                }, true);
                $scope.$watch('lineChart.legend', function (updatedLegend) {
                    vm.data = prepareData(updatedLegend);
                    vm.legend = updatedLegend;
                    if (chart) {
                        chartElem.datum(vm.data || []).call(chart);
                        drawEmptyState();
                        if (updateZoomOptions)
                            updateZoomOptions(vm.data);
                    }
                }, true);
                $scope.$on('$destroy', function () {
                    d3.selectAll('.nvtooltip').style('opacity', 0);
                });
                function prepareData(data) {
                    var result = [];
                    _.each(data, function (seria) {
                        if (!seria.disabled && seria.values)
                            result.push(seria);
                    });
                    return _.cloneDeep(result);
                }
                var getHeight = function () {
                    if (dynamicHeight) {
                        var heigth = Math.min(Math.max(minHeight, $element.parent().innerHeight()), maxHeight);
                        return heigth;
                    }
                    else {
                        return fixedHeight;
                    }
                };
                nv.addGraph(function () {
                    chart = nv.models.lineChart()
                        .margin({ top: 20, right: 20, bottom: 30, left: 30 })
                        .x(function (d) {
                        return (d !== undefined && d.x !== undefined) ? (vm.xFormat ? vm.xFormat(d.x) : d.x) : d;
                    })
                        .y(function (d) {
                        return (d !== undefined && d.value !== undefined) ? d.value : d;
                    })
                        .height(getHeight() - 50)
                        .useInteractiveGuideline(true)
                        .showXAxis(true)
                        .showYAxis(true)
                        .showLegend(false)
                        .color(function (d) {
                        return d.color || d3.scale.paletteColors().range();
                    });
                    chart.tooltip.enabled(false);
                    chart.noData('There is no data right now...');
                    chart.yAxis
                        .tickFormat(function (d) {
                        return vm.yTickFormat ? vm.yTickFormat(d) : d;
                    });
                    chart.xAxis
                        .tickFormat(function (d) {
                        return vm.xTickFormat ? vm.xTickFormat(d) : d;
                    });
                    chartElem = d3.select($element.get(0)).select('.line-chart svg');
                    chartElem.datum(vm.data || []).style('height', (getHeight() - 50) + 'px').call(chart);
                    if (vm.dynamic) {
                        addZoom(chart, chartElem);
                    }
                    nv.utils.windowResize(function () { onResize(); });
                    $scope.$on('pipMainResized', function () { onResize(); });
                    return chart;
                }, function () {
                    drawEmptyState();
                });
                function onResize() {
                    chart.height(getHeight() - 50);
                    chartElem.style('height', (getHeight() - 50) + 'px');
                    chart.update();
                    drawEmptyState();
                }
                function drawEmptyState() {
                    if (!$element.find('text.nv-noData').get(0)) {
                        d3.select($element.find('.empty-state')[0]).remove();
                    }
                    else {
                        var containerWidth = $element.find('.line-chart').innerWidth(), containerHeight = $element.find('.line-chart').innerHeight();
                        if ($element.find('.empty-state').get(0)) {
                            chartElem
                                .select('image')
                                .attr('transform', 'scale(' + (containerWidth / 1151) + ',' + (containerHeight / 216) + ')');
                        }
                        else {
                            chartElem
                                .append("defs")
                                .append("pattern")
                                .attr("height", 1)
                                .attr("width", 1)
                                .attr("x", "0")
                                .attr("y", "0")
                                .attr("id", "bg")
                                .append("image")
                                .attr('x', 17)
                                .attr('y', 0)
                                .attr('height', "216px")
                                .attr('width', "1151px")
                                .attr('transform', 'scale(' + (containerWidth / 1151) + ',' + (containerHeight / 216) + ')')
                                .attr("xlink:href", "images/line_chart_empty_state.svg");
                            chartElem
                                .append('rect')
                                .classed('empty-state', true)
                                .attr('height', "100%")
                                .attr('width', "100%")
                                .attr('fill', 'url(#bg)');
                        }
                    }
                }
                function updateScroll(domains, boundary) {
                    var bDiff = boundary[1] - boundary[0], domDiff = domains[1] - domains[0], isEqual = (domains[1] - domains[0]) / bDiff === 1;
                    $($element[0]).find('.visual-scroll')
                        .css('opacity', function () {
                        return isEqual ? 0 : 1;
                    });
                    if (isEqual)
                        return;
                    $($element[0]).find('.scrolled-block')
                        .css('left', function () {
                        return domains[0] / bDiff * 100 + '%';
                    })
                        .css('width', function () {
                        return domDiff / bDiff * 100 + '%';
                    });
                }
                function addZoom(chart, svg) {
                    var scaleExtent = 4;
                    var yAxis = null;
                    var xAxis = null;
                    var xDomain = null;
                    var yDomain = null;
                    var redraw = null;
                    var svg = svg;
                    var xScale = null;
                    var yScale = null;
                    var x_boundary = null;
                    var y_boundary = null;
                    var d3zoom = d3.behavior.zoom();
                    var prevXDomain = null;
                    var prevScale = null;
                    var prevTranslate = null;
                    setData(chart);
                    function setData(newChart) {
                        yAxis = newChart.yAxis;
                        xAxis = newChart.xAxis;
                        xDomain = newChart.xDomain || xAxis.scale().domain;
                        yDomain = newChart.yDomain || yAxis.scale().domain;
                        redraw = newChart.update;
                        xScale = xAxis.scale();
                        yScale = yAxis.scale();
                        x_boundary = xAxis.scale().domain().slice();
                        y_boundary = yAxis.scale().domain().slice();
                        prevXDomain = x_boundary;
                        prevScale = d3zoom.scale();
                        prevTranslate = d3zoom.translate();
                        xScale.nice();
                        yScale.nice();
                    }
                    function fixDomain(domain, boundary, scale, translate) {
                        if (domain[0] < boundary[0]) {
                            domain[0] = boundary[0];
                            if (prevXDomain[0] !== boundary[0] || scale !== prevScale) {
                                domain[1] += (boundary[0] - domain[0]);
                            }
                            else {
                                domain[1] = prevXDomain[1];
                                translate = _.clone(prevTranslate);
                            }
                        }
                        if (domain[1] > boundary[1]) {
                            domain[1] = boundary[1];
                            if (prevXDomain[1] !== boundary[1] || scale !== prevScale) {
                                domain[0] -= (domain[1] - boundary[1]);
                            }
                            else {
                                domain[0] = prevXDomain[0];
                                translate = _.clone(prevTranslate);
                            }
                        }
                        d3zoom.translate(translate);
                        prevXDomain = _.clone(domain);
                        prevScale = _.clone(scale);
                        prevTranslate = _.clone(translate);
                        return domain;
                    }
                    function updateChart() {
                        d3zoom.scale(1);
                        d3zoom.translate([0, 0]);
                        xScale.domain(x_boundary);
                        d3zoom.x(xScale).y(yScale);
                        svg.call(d3zoom);
                    }
                    function zoomed() {
                        if (d3.event.scale === 1) {
                            unzoomed();
                            updateChart();
                        }
                        else {
                            xDomain(fixDomain(xScale.domain(), x_boundary, d3.event.scale, d3.event.translate));
                            redraw();
                        }
                        updateScroll(xScale.domain(), x_boundary);
                    }
                    setZoom = function (which) {
                        var center0 = [svg[0][0].getBBox().width / 2, svg[0][0].getBBox().height / 2];
                        var translate0 = d3zoom.translate(), coordinates0 = coordinates(center0);
                        if (which === 'in') {
                            if (prevScale < scaleExtent)
                                d3zoom.scale(prevScale + 0.2);
                        }
                        else {
                            if (prevScale > 1)
                                d3zoom.scale(prevScale - 0.2);
                        }
                        var center1 = point(coordinates0);
                        d3zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);
                        d3zoom.event(svg);
                    };
                    function step(which) {
                        var translate = d3zoom.translate();
                        if (which === 'right') {
                            translate[0] -= 20;
                        }
                        else {
                            translate[0] += 20;
                        }
                        d3zoom.translate(translate);
                        d3zoom.event(svg);
                    }
                    function coordinates(point) {
                        var scale = d3zoom.scale(), translate = d3zoom.translate();
                        return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
                    }
                    function point(coordinates) {
                        var scale = d3zoom.scale(), translate = d3zoom.translate();
                        return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
                    }
                    function keypress() {
                        switch (d3.event.keyCode) {
                            case 39:
                                step('right');
                                break;
                            case 37:
                                step('left');
                                break;
                            case 107:
                                setZoom('in');
                                break;
                            case 109: setZoom('out');
                        }
                    }
                    function unzoomed() {
                        xDomain(x_boundary);
                        redraw();
                        d3zoom.scale(1);
                        d3zoom.translate([0, 0]);
                        prevScale = 1;
                        prevTranslate = [0, 0];
                    }
                    d3zoom.x(xScale)
                        .y(yScale)
                        .scaleExtent([1, scaleExtent])
                        .on('zoom', zoomed);
                    svg.call(d3zoom).on('dblclick.zoom', unzoomed);
                    $($element.get(0)).addClass('dynamic');
                    svg
                        .attr('focusable', false)
                        .style('outline', 'none')
                        .on('keydown', keypress)
                        .on('focus', function () { });
                    var getXMinMax = function (data) {
                        var maxVal, minVal = null;
                        for (var i = 0; i < data.length; i++) {
                            if (!data[i].disabled) {
                                var tempMinVal = d3.max(data[i].values, function (d) { return vm.xFormat ? vm.xFormat(d.x) : d.x; });
                                var tempMaxVal = d3.min(data[i].values, function (d) { return vm.xFormat ? vm.xFormat(d.x) : d.x; });
                                minVal = (!minVal || tempMinVal < minVal) ? tempMinVal : minVal;
                                maxVal = (!maxVal || tempMaxVal > maxVal) ? tempMaxVal : maxVal;
                            }
                        }
                        return [maxVal, minVal];
                    };
                    updateZoomOptions = function (data) {
                        yAxis = chart.yAxis;
                        xAxis = chart.xAxis;
                        xScale = xAxis.scale();
                        yScale = yAxis.scale();
                        x_boundary = getXMinMax(data);
                        if (d3zoom.scale() === 1) {
                            d3zoom.x(xScale).y(yScale);
                            svg.call(d3zoom);
                            d3zoom.event(svg);
                        }
                        updateScroll(xScale.domain(), x_boundary);
                    };
                }
                function materialColorToRgba(color) {
                    return 'rgba(' + $mdColorPalette[color][500].value[0] + ','
                        + $mdColorPalette[color][500].value[1] + ','
                        + $mdColorPalette[color][500].value[2] + ','
                        + ($mdColorPalette[color][500].value[3] || 1) + ')';
                }
                function generateParameterColor() {
                    if (!vm.data)
                        return;
                    vm.data.forEach(function (item, index) {
                        item.color = item.color || materialColorToRgba(colors[index]);
                    });
                }
            }]
        };
    }
})();
},{}],5:[function(require,module,exports){
(function () {
    'use strict';
    angular.module('pipPieCharts', [])
        .directive('pipPieChart', pipPieChart);
    function pipPieChart() {
        return {
            restrict: 'E',
            scope: {
                series: '=pipSeries',
                donut: '=pipDonut',
                legend: '=pipShowLegend',
                total: '=pipShowTotal',
                size: '=pipPieSize',
                centered: '=pipCentered'
            },
            bindToController: true,
            controllerAs: 'pieChart',
            templateUrl: 'pie/pie_chart.html',
            controller: ['$element', '$scope', '$timeout', '$interval', '$mdColorPalette', function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                var vm = this;
                var chart = null;
                var titleElem = null;
                var chartElem = null;
                var colors = _.map($mdColorPalette, function (palette, color) {
                    return color;
                });
                var resizeTitleLabel = resizeTitleLabelUnwrap;
                vm.data = vm.data || [];
                vm.showLegend = function () {
                    return vm.legend !== undefined ? vm.legend : true;
                };
                if (vm.series && vm.series.length > colors.length) {
                    vm.data = vm.series.slice(0, 9);
                }
                $scope.$watch('pieChart.series', function (newVal) {
                    vm.data = newVal;
                    generateParameterColor();
                    if (chart) {
                        chartElem.datum(vm.data).call(chart);
                        $timeout(resizeTitleLabel);
                        drawEmptyState(d3.select($element.get(0)).select('.pie-chart svg')[0][0]);
                    }
                }, true);
                generateParameterColor();
                d3.scale.paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };
                nv.addGraph(function () {
                    chart = nv.models.pieChart()
                        .margin({ top: 0, right: 0, bottom: 0, left: 0 })
                        .x(function (d) {
                        return vm.donut ? d.value : null;
                    })
                        .y(function (d) {
                        return d.value;
                    })
                        .height(vm.size || 250)
                        .width(vm.size || 250)
                        .showLabels(true)
                        .labelThreshold(.001)
                        .growOnHover(false)
                        .donut(vm.donut)
                        .donutRatio(0.5)
                        .color(function (d) {
                        return d.color || d3.scale.paletteColors().range();
                    });
                    chart.tooltip.enabled(false);
                    chart.noData('There is no data right now...');
                    chart.showLegend(false);
                    chartElem = d3.select($element.get(0))
                        .select('.pie-chart')
                        .style('height', (vm.size || 250) + 'px')
                        .style('width', vm.centered ? '100%' : (vm.size || 250) + 'px')
                        .select('svg')
                        .style('opacity', 0)
                        .datum(vm.data || [])
                        .call(chart);
                    nv.utils.windowResize(function () {
                        chart.update();
                        $timeout(resizeTitleLabel);
                        centerChart();
                        drawEmptyState(d3.select($element.get(0)).select('.pie-chart svg')[0][0]);
                    });
                    return chart;
                }, function () {
                    $timeout(function () {
                        var svgElem = d3.select($element.get(0)).select('.pie-chart svg')[0][0];
                        renderTotalLabel(svgElem);
                        d3.select(svgElem)
                            .transition()
                            .duration(1000)
                            .style('opacity', 1);
                        $timeout(resizeTitleLabelUnwrap, 800);
                        centerChart();
                        drawEmptyState(svgElem);
                    });
                });
                function drawEmptyState(svg) {
                    if (!$element.find('text.nv-noData').get(0)) {
                        d3.select($element.find('.empty-state')[0]).remove();
                        $element.find('.pip-empty-pie-text').remove();
                    }
                    else {
                        if ($element.find('.pip-empty-pie-text').length === 0) {
                            $element.find('.pie-chart')
                                .append("<div class='pip-empty-pie-text'>There is no data right now...</div>");
                        }
                        var pie = d3.layout.pie().sort(null), size = Number(vm.size || 250);
                        var arc = d3.svg.arc()
                            .innerRadius(size / 2 - 20)
                            .outerRadius(size / 2 - 57);
                        svg = d3.select(svg)
                            .append("g")
                            .classed('empty-state', true)
                            .attr('transform', "translate(" + size / 2 + "," + size / 2 + ")");
                        var path = svg.selectAll("path")
                            .data(pie([1]))
                            .enter().append("path")
                            .attr("fill", "rgba(0, 0, 0, 0.08)")
                            .attr("d", arc);
                    }
                }
                function centerChart() {
                    if (vm.centered) {
                        var svgElem = d3.select($element.get(0)).select('.pie-chart svg')[0][0], leftMargin = $(svgElem).innerWidth() / 2 - (vm.size || 250) / 2;
                        d3.select($element.find('.nv-pieChart')[0]).attr('transform', 'translate(' + leftMargin + ', 0)');
                    }
                }
                function renderTotalLabel(svgElem) {
                    if ((!vm.total && !vm.donut) || !vm.data)
                        return;
                    var totalVal = vm.data.reduce(function (sum, curr) {
                        return sum + curr.value;
                    }, 0);
                    if (totalVal >= 10000)
                        totalVal = (totalVal / 1000).toFixed(1) + 'k';
                    d3.select(svgElem)
                        .select('.nv-pie:not(.nvd3)')
                        .append('text')
                        .classed('label-total', true)
                        .attr('text-anchor', 'middle')
                        .style('dominant-baseline', 'central')
                        .text(totalVal);
                    titleElem = d3.select($element.find('text.label-total').get(0)).style('opacity', 0);
                }
                function resizeTitleLabelUnwrap() {
                    if ((!vm.total && !vm.donut) || !vm.data)
                        return;
                    var boxSize = $element.find('.nvd3.nv-pieChart').get(0).getBBox();
                    if (!boxSize.width || !boxSize.height) {
                        return;
                    }
                    titleElem.style('font-size', ~~boxSize.width / 4.5).style('opacity', 1);
                }
                function materialColorToRgba(color) {
                    return 'rgba(' + $mdColorPalette[color][500].value[0] + ','
                        + $mdColorPalette[color][500].value[1] + ','
                        + $mdColorPalette[color][500].value[2] + ','
                        + ($mdColorPalette[color][500].value[3] || 1) + ')';
                }
                function generateParameterColor() {
                    if (!vm.data)
                        return;
                    vm.data.forEach(function (item, index) {
                        item.color = item.color || materialColorToRgba(colors[index]);
                    });
                }
            }]
        };
    }
})();
},{}],6:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('bar/bar_chart.html',
    '<div class="bar-chart"><svg></svg></div><pip-chart-legend pip-series="barChart.legend" pip-interactive="barChart.interactiveLegend"></pip-chart-legend>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pie/pie_chart.html',
    '<div class="pie-chart" ng-class="{\'circle\': !pieChart.donut}"><svg class="flex-auto"></svg></div><pip-chart-legend pip-series="pieChart.data" pip-interactive="false" ng-if="pieChart.showLegend()"></pip-chart-legend>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('legend/interactive_legend.html',
    '<div><div class="chart-legend-item" ng-repeat="item in series" ng-show="item.values || item.value"><md-checkbox class="lp16 m8" ng-model="item.disabled" ng-true-value="false" ng-false-value="true" ng-if="interactive" aria-label="{{ item.label }}"><p class="legend-item-value" ng-if="item.value" ng-style="{\'background-color\': item.color}">{{ item.value }}</p><p class="legend-item-label">{{:: item.label || item.key }}</p></md-checkbox><div ng-if="!interactive"><span class="bullet" ng-style="{\'background-color\': item.color}"></span> <span>{{:: item.label || item.key}}</span></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('line/line_chart.html',
    '<div class="line-chart" flex="auto" layout="column"><svg class="flex-auto" ng-class="{\'visible-x-axis\': lineChart.isVisibleX(), \'visible-y-axis\': lineChart.isVisibleY()}"></svg><div class="scroll-container"><div class="visual-scroll"><div class="scrolled-block"></div></div></div><md-button class="md-fab md-mini minus-button" ng-click="lineChart.zoomOut()"><md-icon md-svg-icon="icons:minus-circle"></md-icon></md-button><md-button class="md-fab md-mini plus-button" ng-click="lineChart.zoomIn()"><md-icon md-svg-icon="icons:plus-circle"></md-icon></md-button></div><pip-chart-legend pip-series="lineChart.legend" pip-interactive="lineChart.interactiveLegend"></pip-chart-legend>');
}]);
})();



},{}]},{},[6,1,2,3,4,5])(6)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYmFyL2Jhcl9jaGFydC50cyIsInNyYy9jaGFydHMudHMiLCJzcmMvbGVnZW5kL2ludGVyYWN0aXZlX2xlZ2VuZC50cyIsInNyYy9saW5lL2xpbmVfY2hhcnQudHMiLCJzcmMvcGllL3BpZV9jaGFydC50cyIsInRlbXAvcGlwLXdlYnVpLWNoYXJ0cy1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLENBQUM7SUFDRyxZQUFZLENBQUM7SUFTYixPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUM7U0FDN0IsU0FBUyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUUzQztRQUNJLE1BQU0sQ0FBQztZQUNILFFBQVEsRUFBRSxHQUFHO1lBQ2IsS0FBSyxFQUFFO2dCQUNILE1BQU0sRUFBRSxZQUFZO2dCQUNwQixXQUFXLEVBQUUsaUJBQWlCO2dCQUM5QixXQUFXLEVBQUUsaUJBQWlCO2dCQUM5QixpQkFBaUIsRUFBRSxpQkFBaUI7YUFDdkM7WUFDRCxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFlBQVksRUFBRSxVQUFVO1lBQ3hCLFdBQVcsRUFBRSxvQkFBb0I7WUFDakMsVUFBVSxFQUFFLFVBQVUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGVBQWU7Z0JBQ3hFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDZCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDckIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBVSxPQUFPLEVBQUUsS0FBSztvQkFDeEQsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDakIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFD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QyxFQUFFLENBQUMsSUFBSSxDQUFDO3dCQUFDLE1BQU0sQ0FBQztvQkFFckIsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUUsS0FBSzt3QkFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNsRSxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDO1lBQ0wsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNqT0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG5nZG9jIG1vZHVsZVxyXG4gICAgICogQG5hbWUgcGlwQmFyQ2hhcnRzXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBCYXIgY2hhcnQgb24gdG9wIG9mIFJpY2tzaGF3IGNoYXJ0c1xyXG4gICAgICovXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwQmFyQ2hhcnRzJywgW10pXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgncGlwQmFyQ2hhcnQnLCBwaXBCYXJDaGFydCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGlwQmFyQ2hhcnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNlcmllczogJz1waXBTZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgeFRpY2tGb3JtYXQ6ICc9cGlwWFRpY2tGb3JtYXQnLFxyXG4gICAgICAgICAgICAgICAgeVRpY2tGb3JtYXQ6ICc9cGlwWVRpY2tGb3JtYXQnLFxyXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmVMZWdlbmQ6ICc9cGlwSW50ZXJMZWdlbmQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2JhckNoYXJ0JyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdiYXIvYmFyX2NoYXJ0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQsICRzY29wZSwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJG1kQ29sb3JQYWxldHRlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdm0gPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGxldCBjaGFydEVsZW0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbG9ycyA9IF8ubWFwKCRtZENvbG9yUGFsZXR0ZSwgZnVuY3Rpb24gKHBhbGV0dGUsIGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0ID0gMjcwO1xyXG5cclxuICAgICAgICAgICAgICAgIHZtLmRhdGEgPSBwcmVwYXJlRGF0YSh2bS5zZXJpZXMpIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgdm0ubGVnZW5kID0gXy5jbG9uZSh2bS5zZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoKHZtLnNlcmllcyB8fCBbXSkubGVuZ3RoID4gY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEgPSB2bS5zZXJpZXMuc2xpY2UoMCwgOSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICg8YW55PmQzLnNjYWxlKS5wYWxldHRlQ29sb3JzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5zY2FsZS5vcmRpbmFsKCkucmFuZ2UoY29sb3JzLm1hcChtYXRlcmlhbENvbG9yVG9SZ2JhKSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goJ2JhckNoYXJ0LnNlcmllcycsIGZ1bmN0aW9uICh1cGRhdGVkU2VyaWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHVwZGF0ZWRTZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmxlZ2VuZCA9IF8uY2xvbmUodm0uc2VyaWVzKTtcclxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0uZGF0dW0odm0uZGF0YSkuY2FsbChjaGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ0JhcldpZHRoQW5kTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdiYXJDaGFydC5sZWdlbmQnLCBmdW5jdGlvbih1cGRhdGVkTGVnZW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHVwZGF0ZWRMZWdlbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmxlZ2VuZCA9IHVwZGF0ZWRMZWdlbmQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0uZGF0dW0odm0uZGF0YSkuY2FsbChjaGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ0JhcldpZHRoQW5kTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcmVwYXJlRGF0YShkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIF8uZWFjaChkYXRhLCAoc2VyaWEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzZXJpYS5kaXNhYmxlZCAmJiBzZXJpYS52YWx1ZXMpIHJlc3VsdC5wdXNoKHNlcmlhKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uY2xvbmVEZWVwKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBJbnN0YW50aWF0ZSBjaGFydFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBudi5hZGRHcmFwaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQgPSBudi5tb2RlbHMuZGlzY3JldGVCYXJDaGFydCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4oe3RvcDogMTAsIHJpZ2h0OiAwLCBib3R0b206IDEwLCBsZWZ0OiA1MH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmxhYmVsIHx8IGQua2V5IHx8IGQueDsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnkoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQudmFsdWU7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93VmFsdWVzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdGFnZ2VyTGFiZWxzKHRydWUpIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvd1hBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93WUF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnZhbHVlRm9ybWF0KDxhbnk+ZDMuZm9ybWF0KCdkJykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbigwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbG9yKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS5kYXRhW2Quc2VyaWVzXS5jb2xvciB8fCBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tkLnNlcmllc10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQudG9vbHRpcC5lbmFibGVkKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFydC5ub0RhdGEoJ1RoZXJlIGlzIG5vIGRhdGEgcmlnaHQgbm93Li4uJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnlBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0ueVRpY2tGb3JtYXQgPyB2bS55VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydC54QXhpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLnhUaWNrRm9ybWF0ID8gdm0ueFRpY2tGb3JtYXQoZCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtID0gZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnLmJhci1jaGFydCBzdmcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0dW0odm0uZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdoZWlnaHQnLCAnMjg1cHgnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChjaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnQmFyV2lkdGhBbmRMYWJlbCgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGFydDtcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoY29uZmlnQmFyV2lkdGhBbmRMYWJlbCwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRyYXdFbXB0eVN0YXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5maW5kKCcubnYtbm9EYXRhJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgkZWxlbWVudC5maW5kKCcuZW1wdHktc3RhdGUnKVswXSkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGcgPSBjaGFydEVsZW0uYXBwZW5kKCdnJykuY2xhc3NlZCgnZW1wdHktc3RhdGUnLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gJGVsZW1lbnQuZmluZCgnLm52ZDMtc3ZnJykuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luID0gd2lkdGggKiAwLjE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmdiYSgwLCAwLCAwLCAwLjA4KScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgLSAxMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIDM4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDQyLCA2MCknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JnYmEoMCwgMCwgMCwgMC4wOCknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgMjAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZy5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoODQsIDE2MCknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JnYmEoMCwgMCwgMCwgMC4wOCknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgMTAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAoNTAgKyBtYXJnaW4pICsgJywgMCksICcgKyAnc2NhbGUoJyArICgod2lkdGggLSAyKm1hcmdpbikgLyAxMjYpICsgJywgMSknICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogQWxpZ25zIHZhbHVlIGxhYmVsIGFjY29yZGluZyB0byBwYXJlbnQgY29udGFpbmVyIHNpemUuXHJcbiAgICAgICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjb25maWdCYXJXaWR0aEFuZExhYmVsKHRpbWVvdXQ6IG51bWJlciA9IDEwMDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWxzID0gJGVsZW1lbnQuZmluZCgnLm52LWJhciB0ZXh0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0QmFycyA9ICRlbGVtZW50LmZpbmQoJy5udi1iYXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SGVpZ2h0ID0gKDxhbnk+JGVsZW1lbnQuZmluZCgnLm52ZDMtc3ZnJylbMF0pLmdldEJCb3goKS5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgkZWxlbWVudC5maW5kKCcuYmFyLWNoYXJ0JylbMF0pLmNsYXNzZWQoJ3Zpc2libGUnLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRCYXJzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiYXJIZWlnaHQgPSBOdW1iZXIoZDMuc2VsZWN0KDxhbnk+aXRlbSkuc2VsZWN0KCdyZWN0JykuYXR0cignaGVpZ2h0JykpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGggPSBOdW1iZXIoZDMuc2VsZWN0KDxhbnk+aXRlbSkuc2VsZWN0KCdyZWN0JykuYXR0cignd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZDMuc2VsZWN0KDxhbnk+aXRlbSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gZDMudHJhbnNmb3JtKGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJykpLnRyYW5zbGF0ZVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgPSBkMy50cmFuc2Zvcm0oZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nKSkudHJhbnNsYXRlWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE51bWJlcih4ICsgaW5kZXggKiAoYmFyV2lkdGggKyAxNSkpICsgJywgJyArIChoZWlnaHQgLSAyMCkgKyAnKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdyZWN0JykuYXR0cignaGVpZ2h0JywgMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZHVyYXRpb24odGltZW91dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBOdW1iZXIoeCArIGluZGV4ICogKGJhcldpZHRoICsgMTUpKSArICcsICcgKyB5ICsgJyknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgncmVjdCcpLmF0dHIoJ2hlaWdodCcsIGJhckhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QobGFiZWxzW2luZGV4XSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIGJhckhlaWdodCAvIDIgKyAxMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgYmFyV2lkdGggLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIENvbnZlcnRzIHBhbGV0dGUgY29sb3IgbmFtZSBpbnRvIFJHQkEgY29sb3IgcmVwcmVzZW50YXRpb24uXHJcbiAgICAgICAgICAgICAgICAgKiBTaG91bGQgYnkgcmVwbGFjZWQgYnkgcGFsZXR0ZSBmb3IgY2hhcnRzLlxyXG4gICAgICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAgICBOYW1lIG9mIGNvbG9yIGZyb20gQU0gcGFsZXR0ZVxyXG4gICAgICAgICAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gUkdCYSBmb3JtYXRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gbWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAncmdiYSgnICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzBdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzFdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzJdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgKCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVszXSB8fCAxKSArICcpJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEhlbHBmdWwgbWV0aG9kXHJcbiAgICAgICAgICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdm0uZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2bS5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnZhbHVlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS52YWx1ZXNbMF0uY29sb3IgPSBpdGVtLnZhbHVlc1swXS5jb2xvciB8fCBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0udmFsdWVzWzBdLmNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIu+7vy8qKlxyXG4gKiBAZmlsZSBSZWdpc3RyYXRpb24gb2YgY2hhcnQgV2ViVUkgY29udHJvbHNcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICovXHJcblxyXG4vKiBnbG9iYWwgYW5ndWxhciAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzJywgW1xyXG4gICAgICAgICdwaXBCYXJDaGFydHMnLFxyXG4gICAgICAgICdwaXBMaW5lQ2hhcnRzJyxcclxuICAgICAgICAncGlwUGllQ2hhcnRzJyxcclxuICAgICAgICAncGlwQ2hhcnRMZWdlbmRzJyxcclxuICAgICAgICAncGlwQ2hhcnRzLlRlbXBsYXRlcydcclxuICAgIF0pO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2MgbW9kdWxlXHJcbiAgICAgKiBAbmFtZSBwaXBMZWdlbmRzXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBMZWdlbmQgb2YgY2hhcnRzXHJcbiAgICAgKi9cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydExlZ2VuZHMnLCBbXSlcclxuICAgICAgICAuZGlyZWN0aXZlKCdwaXBDaGFydExlZ2VuZCcsIHBpcENoYXJ0TGVnZW5kKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwaXBDaGFydExlZ2VuZCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAnPXBpcFNlcmllcycsXHJcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZTogJz1waXBJbnRlcmFjdGl2ZSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdsZWdlbmQvaW50ZXJhY3RpdmVfbGVnZW5kLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQsICRzY29wZSwgJHRpbWVvdXQsICRtZENvbG9yUGFsZXR0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyA9IF8ubWFwKCRtZENvbG9yUGFsZXR0ZSwgZnVuY3Rpb24gKHBhbGV0dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFsZXR0ZVs1MDBdLmhleDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvbG9yQ2hlY2tib3hlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hlY2tib3hDb250YWluZXJzID0gJCgkZWxlbWVudCkuZmluZCgnbWQtY2hlY2tib3ggLm1kLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94Q29udGFpbmVycy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGl0ZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCdjb2xvcicsICRzY29wZS5zZXJpZXNbaW5kZXhdLmNvbG9yIHx8IGNvbG9yc1tpbmRleF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZCgnLm1kLWljb24nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnYmFja2dyb3VuZC1jb2xvcicsICRzY29wZS5zZXJpZXNbaW5kZXhdLmNvbG9yIHx8IGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGFuaW1hdGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxlZ2VuZFRpdGxlcyA9ICQoJGVsZW1lbnQpLmZpbmQoJy5jaGFydC1sZWdlbmQtaXRlbScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRUaXRsZXMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygndmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyMDAgKiBpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBhcmVTZXJpZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuc2VyaWVzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zZXJpZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0uY29sb3IgfHwgKGl0ZW0udmFsdWVzICYmIGl0ZW0udmFsdWVzWzBdICYmIGl0ZW0udmFsdWVzWzBdLmNvbG9yID8gaXRlbS52YWx1ZXNbMF0uY29sb3IgOiBjb2xvcnNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5kaXNhYmxlZCA9IGl0ZW0uZGlzYWJsZWQgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7ICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnc2VyaWVzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvckNoZWNrYm94ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBwcmVwYXJlU2VyaWVzKCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdpbnRlcmFjdGl2ZScsIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWUgPT0gdHJ1ZSAmJiBuZXdWYWx1ZSAhPSBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChjb2xvckNoZWNrYm94ZXMsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmltYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3JDaGVja2JveGVzKCk7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgIHByZXBhcmVTZXJpZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBtb2R1bGVcclxuICAgICAqIEBuYW1lIHBpcExpbmVDaGFydHNcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIExpbmUgY2hhcnQgb24gdG9wIG9mIFJpY2tzaGF3IGNoYXJ0c1xyXG4gICAgICovXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwTGluZUNoYXJ0cycsIFtdKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3BpcExpbmVDaGFydCcsIHBpcExpbmVDaGFydCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGlwTGluZUNoYXJ0KCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXM6ICc9cGlwU2VyaWVzJyxcclxuICAgICAgICAgICAgICAgIHNob3dZQXhpczogJz1waXBZQXhpcycsXHJcbiAgICAgICAgICAgICAgICBzaG93WEF4aXM6ICc9cGlwWEF4aXMnLFxyXG4gICAgICAgICAgICAgICAgeEZvcm1hdDogJz1waXBYRm9ybWF0JyxcclxuICAgICAgICAgICAgICAgIHhUaWNrRm9ybWF0OiAnPXBpcFhUaWNrRm9ybWF0JyxcclxuICAgICAgICAgICAgICAgIHlUaWNrRm9ybWF0OiAnPXBpcFlUaWNrRm9ybWF0JyxcclxuICAgICAgICAgICAgICAgIGR5bmFtaWM6ICc9cGlwRHluYW1pYycsXHJcbiAgICAgICAgICAgICAgICBmaXhlZEhlaWdodDogJ0BwaXBEaWFncmFtSGVpZ2h0JyxcclxuICAgICAgICAgICAgICAgIGR5bmFtaWNIZWlnaHQ6ICdAcGlwRHluYW1pY0hlaWdodCcsXHJcbiAgICAgICAgICAgICAgICBtaW5IZWlnaHQ6ICdAcGlwTWluSGVpZ2h0JyxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogJ0BwaXBNYXhIZWlnaHQnLFxyXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmVMZWdlbmQ6ICc9cGlwSW50ZXJMZWdlbmQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2xpbmVDaGFydCcsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbGluZS9saW5lX2NoYXJ0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQsICRzY29wZSwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJG1kQ29sb3JQYWxldHRlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdm0gICAgICAgID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHZhciBjaGFydCAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoYXJ0RWxlbSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2V0Wm9vbSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgdXBkYXRlWm9vbU9wdGlvbnMgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpeGVkSGVpZ2h0ID0gdm0uZml4ZWRIZWlnaHQgfHwgMjcwO1xyXG4gICAgICAgICAgICAgICAgdmFyIGR5bmFtaWNIZWlnaHQgPSB2bS5keW5hbWljSGVpZ2h0IHx8IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbkhlaWdodCA9IHZtLm1pbkhlaWdodCB8fCBmaXhlZEhlaWdodDtcclxuICAgICAgICAgICAgICAgIHZhciBtYXhIZWlnaHQgPSB2bS5tYXhIZWlnaHQgfHwgZml4ZWRIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyAgICA9IF8ubWFwKCRtZENvbG9yUGFsZXR0ZSwgZnVuY3Rpb24gKHBhbGV0dGUsIGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHZtLnNlcmllcykgfHwgW107XHJcbiAgICAgICAgICAgICAgICB2bS5sZWdlbmQgPSBfLmNsb25lKHZtLnNlcmllcyk7XHJcbiAgICAgICAgICAgICAgICB2bS5zb3VyY2VFdmVudHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdm0uaXNWaXNpYmxlWCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0uc2hvd1hBeGlzID09IHVuZGVmaW5lZCA/IHRydWUgOiB2bS5zaG93WEF4aXM7IFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2bS5pc1Zpc2libGVZID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS5zaG93WUF4aXMgPT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHZtLnNob3dZQXhpcztcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdm0uem9vbUluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXRab29tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFpvb20oJ2luJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2bS56b29tT3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXRab29tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFpvb20oJ291dCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh2bS5zZXJpZXMgJiYgdm0uc2VyaWVzLmxlbmd0aCA+IGNvbG9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS5kYXRhID0gdm0uc2VyaWVzLnNsaWNlKDAsIDkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNldHMgY29sb3JzIG9mIGl0ZW1zXHJcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgKDxhbnk+ZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZShjb2xvcnMubWFwKG1hdGVyaWFsQ29sb3JUb1JnYmEpKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnbGluZUNoYXJ0LnNlcmllcycsIGZ1bmN0aW9uICh1cGRhdGVkU2VyaWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHVwZGF0ZWRTZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmxlZ2VuZCA9IF8uY2xvbmUodm0uc2VyaWVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtLmRhdHVtKHZtLmRhdGEgfHwgW10pLmNhbGwoY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZVpvb21PcHRpb25zKSB1cGRhdGVab29tT3B0aW9ucyh2bS5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdsaW5lQ2hhcnQubGVnZW5kJywgZnVuY3Rpb24odXBkYXRlZExlZ2VuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEgPSBwcmVwYXJlRGF0YSh1cGRhdGVkTGVnZW5kKTtcclxuICAgICAgICAgICAgICAgICAgICB2bS5sZWdlbmQgPSB1cGRhdGVkTGVnZW5kO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtLmRhdHVtKHZtLmRhdGEgfHwgW10pLmNhbGwoY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZVpvb21PcHRpb25zKSB1cGRhdGVab29tT3B0aW9ucyh2bS5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3RBbGwoJy5udnRvb2x0aXAnKS5zdHlsZSgnb3BhY2l0eScsIDApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcHJlcGFyZURhdGEoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBfLmVhY2goZGF0YSwgKHNlcmlhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2VyaWEuZGlzYWJsZWQgJiYgc2VyaWEudmFsdWVzKSByZXN1bHQucHVzaChzZXJpYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmNsb25lRGVlcChyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBnZXRIZWlnaHQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGR5bmFtaWNIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhlaWd0aCA9IE1hdGgubWluKE1hdGgubWF4KG1pbkhlaWdodCwgJGVsZW1lbnQucGFyZW50KCkuaW5uZXJIZWlnaHQoKSksIG1heEhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoZWlndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVkSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBJbnN0YW50aWF0ZSBjaGFydFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBudi5hZGRHcmFwaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQgPSBudi5tb2RlbHMubGluZUNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbih7IHRvcDogMjAsIHJpZ2h0OiAyMCwgYm90dG9tOiAzMCwgbGVmdDogMzAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLngoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoZCAhPT0gdW5kZWZpbmVkICYmIGQueCAhPT0gdW5kZWZpbmVkKSA/ICh2bS54Rm9ybWF0ID8gdm0ueEZvcm1hdChkLngpIDogZC54KSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGQgIT09IHVuZGVmaW5lZCAmJiBkLnZhbHVlICE9PSB1bmRlZmluZWQpID8gZC52YWx1ZSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoZ2V0SGVpZ2h0KCkgLSA1MClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnVzZUludGVyYWN0aXZlR3VpZGVsaW5lKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93WEF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNob3dZQXhpcyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvd0xlZ2VuZChmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbG9yKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmNvbG9yIHx8ICg8YW55PmQzLnNjYWxlKS5wYWxldHRlQ29sb3JzKCkucmFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnRvb2x0aXAuZW5hYmxlZChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQubm9EYXRhKCdUaGVyZSBpcyBubyBkYXRhIHJpZ2h0IG5vdy4uLicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydC55QXhpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLnlUaWNrRm9ybWF0ID8gdm0ueVRpY2tGb3JtYXQoZCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQueEF4aXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS54VGlja0Zvcm1hdCA/IHZtLnhUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbSA9IGQzLnNlbGVjdCgkZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLmxpbmUtY2hhcnQgc3ZnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtLmRhdHVtKHZtLmRhdGEgfHwgW10pLnN0eWxlKCdoZWlnaHQnLCAoZ2V0SGVpZ2h0KCkgLSA1MCkgKyAncHgnKS5jYWxsKGNoYXJ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZtLmR5bmFtaWMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkWm9vbShjaGFydCwgY2hhcnRFbGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7IG9uUmVzaXplKCk7IH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdwaXBNYWluUmVzaXplZCcsICgpID0+IHsgb25SZXNpemUoKTsgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGFydDtcclxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNpemUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQuaGVpZ2h0KGdldEhlaWdodCgpIC0gNTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5zdHlsZSgnaGVpZ2h0JywgKGdldEhlaWdodCgpIC0gNTApICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkcmF3RW1wdHlTdGF0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISRlbGVtZW50LmZpbmQoJ3RleHQubnYtbm9EYXRhJykuZ2V0KDApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgkZWxlbWVudC5maW5kKCcuZW1wdHktc3RhdGUnKVswXSkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lcldpZHRoID0gJGVsZW1lbnQuZmluZCgnLmxpbmUtY2hhcnQnKS5pbm5lcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkZWxlbWVudC5maW5kKCcubGluZS1jaGFydCcpLmlubmVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJykuZ2V0KDApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdpbWFnZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgKGNvbnRhaW5lcldpZHRoIC8gMTE1MSkgKyAnLCcgKyAoY29udGFpbmVySGVpZ2h0IC8gMjE2KSArICcpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZGVmc1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJwYXR0ZXJuXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIFwiMFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBcIjBcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImlkXCIsIFwiYmdcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiaW1hZ2VcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneCcsIDE3KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgXCIyMTZweFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIFwiMTE1MXB4XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgKGNvbnRhaW5lcldpZHRoIC8gMTE1MSkgKyAnLCcgKyAoY29udGFpbmVySGVpZ2h0IC8gMjE2KSArICcpJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgXCJpbWFnZXMvbGluZV9jaGFydF9lbXB0eV9zdGF0ZS5zdmdcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2VtcHR5LXN0YXRlJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgXCIxMDAlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgXCIxMDAlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAndXJsKCNiZyknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVTY3JvbGwoZG9tYWlucywgYm91bmRhcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYkRpZmYgPSBib3VuZGFyeVsxXSAtIGJvdW5kYXJ5WzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21EaWZmID0gZG9tYWluc1sxXSAtIGRvbWFpbnNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSAoZG9tYWluc1sxXSAtIGRvbWFpbnNbMF0pL2JEaWZmID09PSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKCRlbGVtZW50WzBdKS5maW5kKCcudmlzdWFsLXNjcm9sbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ29wYWNpdHknLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNFcXVhbCA/IDAgOiAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAkKCRlbGVtZW50WzBdKS5maW5kKCcuc2Nyb2xsZWQtYmxvY2snKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCdsZWZ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbWFpbnNbMF0vYkRpZmYgKiAxMDAgKyAnJSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbURpZmYvYkRpZmYgKiAxMDAgKyAnJSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGFkZFpvb20oY2hhcnQsIHN2Zykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNjYWxlRXh0ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjYWxlRXh0ZW50ID0gNDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFyYW1ldGVyc1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB5QXhpcyAgICAgICA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHhBeGlzICAgICAgID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeERvbWFpbiAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB5RG9tYWluICAgICA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlZHJhdyAgICAgID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3ZnICAgICAgICAgPSBzdmc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNjYWxlc1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB4U2NhbGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB5U2NhbGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBtaW4vbWF4IGJvdW5kYXJpZXNcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeF9ib3VuZGFyeSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHlfYm91bmRhcnkgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgZDMgem9vbSBoYW5kbGVyXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQzem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJldlhEb21haW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmV2U2NhbGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmV2VHJhbnNsYXRlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0RGF0YShjaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldERhdGEobmV3Q2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGFyYW1ldGVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5QXhpcyAgICAgICA9IG5ld0NoYXJ0LnlBeGlzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4QXhpcyAgICAgICA9IG5ld0NoYXJ0LnhBeGlzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4RG9tYWluICAgICA9IG5ld0NoYXJ0LnhEb21haW4gfHwgeEF4aXMuc2NhbGUoKS5kb21haW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlEb21haW4gICAgID0gbmV3Q2hhcnQueURvbWFpbiB8fCB5QXhpcy5zY2FsZSgpLmRvbWFpbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVkcmF3ICAgICAgPSBuZXdDaGFydC51cGRhdGU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgeFNjYWxlID0geEF4aXMuc2NhbGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeVNjYWxlID0geUF4aXMuc2NhbGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1pbi9tYXggYm91bmRhcmllc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4X2JvdW5kYXJ5ID0geEF4aXMuc2NhbGUoKS5kb21haW4oKS5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5X2JvdW5kYXJ5ID0geUF4aXMuc2NhbGUoKS5kb21haW4oKS5zbGljZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGQzIHpvb20gaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2WERvbWFpbiA9IHhfYm91bmRhcnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZTY2FsZSA9IGQzem9vbS5zY2FsZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2VHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW5zdXJlIG5pY2UgYXhpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4U2NhbGUubmljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5U2NhbGUubmljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZml4IGRvbWFpblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpeERvbWFpbihkb21haW4sIGJvdW5kYXJ5LCBzY2FsZSwgdHJhbnNsYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb21haW5bMF0gPCBib3VuZGFyeVswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdID0gYm91bmRhcnlbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldlhEb21haW5bMF0gIT09IGJvdW5kYXJ5WzBdIHx8IHNjYWxlICE9PSBwcmV2U2NhbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21haW5bMV0gKz0gKGJvdW5kYXJ5WzBdIC0gZG9tYWluWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzFdID0gcHJldlhEb21haW5bMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gXy5jbG9uZShwcmV2VHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbWFpblsxXSA+IGJvdW5kYXJ5WzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21haW5bMV0gPSBib3VuZGFyeVsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2WERvbWFpblsxXSAhPT0gYm91bmRhcnlbMV0gfHwgc2NhbGUgIT09IHByZXZTY2FsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblswXSAtPSAoZG9tYWluWzFdIC0gYm91bmRhcnlbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21haW5bMF0gPSBwcmV2WERvbWFpblswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBfLmNsb25lKHByZXZUcmFuc2xhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKHRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZYRG9tYWluID0gXy5jbG9uZShkb21haW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2U2NhbGUgPSBfLmNsb25lKHNjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlRyYW5zbGF0ZSA9IF8uY2xvbmUodHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbWFpbjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20uc2NhbGUoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUoWzAsMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4U2NhbGUuZG9tYWluKHhfYm91bmRhcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20ueCh4U2NhbGUpLnkoeVNjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHpvb20gZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHpvb21lZCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3dpdGNoIG9mZiB2ZXJ0aWNhbCB6b29taW5nIHRlbXBvcmFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB5RG9tYWluKHlTY2FsZS5kb21haW4oKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKDxhbnk+ZDMuZXZlbnQpLnNjYWxlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bnpvb21lZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhEb21haW4oZml4RG9tYWluKHhTY2FsZS5kb21haW4oKSwgeF9ib3VuZGFyeSwgKDxhbnk+ZDMuZXZlbnQpLnNjYWxlLCAoPGFueT5kMy5ldmVudCkudHJhbnNsYXRlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWRyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlU2Nyb2xsKHhTY2FsZS5kb21haW4oKSwgeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFpvb20gPSBmdW5jdGlvbih3aGljaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2VudGVyMCA9IFtzdmdbMF1bMF0uZ2V0QkJveCgpLndpZHRoIC8gMiwgc3ZnWzBdWzBdLmdldEJCb3goKS5oZWlnaHQgLyAyXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZTAgPSBkM3pvb20udHJhbnNsYXRlKCksIGNvb3JkaW5hdGVzMCA9IGNvb3JkaW5hdGVzKGNlbnRlcjApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdoaWNoID09PSAnaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNjYWxlIDwgc2NhbGVFeHRlbnQpIGQzem9vbS5zY2FsZShwcmV2U2NhbGUgKyAwLjIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZTY2FsZSA+IDEpIGQzem9vbS5zY2FsZShwcmV2U2NhbGUgLSAwLjIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2VudGVyMSA9IHBvaW50KGNvb3JkaW5hdGVzMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUoW3RyYW5zbGF0ZTBbMF0gKyBjZW50ZXIwWzBdIC0gY2VudGVyMVswXSwgdHJhbnNsYXRlMFsxXSArIGNlbnRlcjBbMV0gLSBjZW50ZXIxWzFdXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20uZXZlbnQoc3ZnKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHdoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2hpY2ggPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVswXSAtPSAyMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVswXSArPSAyMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLnRyYW5zbGF0ZSh0cmFuc2xhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20uZXZlbnQoc3ZnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvb3JkaW5hdGVzKHBvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY2FsZSA9IGQzem9vbS5zY2FsZSgpLCB0cmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbKHBvaW50WzBdIC0gdHJhbnNsYXRlWzBdKSAvIHNjYWxlLCAocG9pbnRbMV0gLSB0cmFuc2xhdGVbMV0pIC8gc2NhbGVdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcG9pbnQoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjYWxlID0gZDN6b29tLnNjYWxlKCksIHRyYW5zbGF0ZSA9IGQzem9vbS50cmFuc2xhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtjb29yZGluYXRlc1swXSAqIHNjYWxlICsgdHJhbnNsYXRlWzBdLCBjb29yZGluYXRlc1sxXSAqIHNjYWxlICsgdHJhbnNsYXRlWzFdXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGtleXByZXNzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2goKDxhbnk+ZDMuZXZlbnQpLmtleUNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6IHN0ZXAoJ3JpZ2h0Jyk7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzNzogc3RlcCgnbGVmdCcpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA3OiBzZXRab29tKCdpbicpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA5OiBzZXRab29tKCdvdXQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gem9vbSBldmVudCBoYW5kbGVyXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gdW56b29tZWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhEb21haW4oeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZHJhdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20uc2NhbGUoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUoWzAsMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2U2NhbGUgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2VHJhbnNsYXRlID0gWzAsMF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHdyYXBwZXJcclxuICAgICAgICAgICAgICAgICAgICBkM3pvb20ueCh4U2NhbGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC55KHlTY2FsZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCBzY2FsZUV4dGVudF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignem9vbScsIHpvb21lZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBoYW5kbGVyXHJcbiAgICAgICAgICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKS5vbignZGJsY2xpY2suem9vbScsIHVuem9vbWVkKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCRlbGVtZW50LmdldCgwKSkuYWRkQ2xhc3MoJ2R5bmFtaWMnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGtleWJvYXJkIGhhbmRsZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgc3ZnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdmb2N1c2FibGUnLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdvdXRsaW5lJywgJ25vbmUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2tleWRvd24nLCBrZXlwcmVzcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHt9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdldFhNaW5NYXggPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXhWYWwsIG1pblZhbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhW2ldLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBNaW5WYWwgPSBkMy5tYXgoZGF0YVtpXS52YWx1ZXMsIGZ1bmN0aW9uKGQ6IGFueSkgeyByZXR1cm4gdm0ueEZvcm1hdCA/IHZtLnhGb3JtYXQoZC54KSA6IGQueDt9ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBNYXhWYWwgPSBkMy5taW4oZGF0YVtpXS52YWx1ZXMsIGZ1bmN0aW9uKGQ6IGFueSkgeyByZXR1cm4gdm0ueEZvcm1hdCA/IHZtLnhGb3JtYXQoZC54KSA6IGQueDt9ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluVmFsID0gKCFtaW5WYWwgfHwgdGVtcE1pblZhbCA8IG1pblZhbCkgPyB0ZW1wTWluVmFsIDogbWluVmFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbCA9ICghbWF4VmFsIHx8IHRlbXBNYXhWYWwgPiBtYXhWYWwpID8gdGVtcE1heFZhbCA6IG1heFZhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW21heFZhbCwgbWluVmFsXTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVab29tT3B0aW9ucyA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeUF4aXMgPSBjaGFydC55QXhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXMgPSBjaGFydC54QXhpcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhTY2FsZSA9IHhBeGlzLnNjYWxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlTY2FsZSA9IHlBeGlzLnNjYWxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4X2JvdW5kYXJ5ID0gZ2V0WE1pbk1heChkYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkM3pvb20uc2NhbGUoKSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKS55KHlTY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmcuY2FsbChkM3pvb20pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLmV2ZW50KHN2Zyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVNjcm9sbCh4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIENvbnZlcnRzIHBhbGV0dGUgY29sb3IgbmFtZSBpbnRvIFJHQkEgY29sb3IgcmVwcmVzZW50YXRpb24uXHJcbiAgICAgICAgICAgICAgICAgKiBTaG91bGQgYnkgcmVwbGFjZWQgYnkgcGFsZXR0ZSBmb3IgY2hhcnRzLlxyXG4gICAgICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAgICBOYW1lIG9mIGNvbG9yIGZyb20gQU0gcGFsZXR0ZVxyXG4gICAgICAgICAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gUkdCYSBmb3JtYXRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gbWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAncmdiYSgnICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzBdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzFdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzJdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgKCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVszXSB8fCAxKSArICcpJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEhlbHBmdWwgbWV0aG9kXHJcbiAgICAgICAgICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdm0uZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2bS5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY29sb3IgPSBpdGVtLmNvbG9yIHx8IG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3JzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2MgbW9kdWxlXHJcbiAgICAgKiBAbmFtZSBwaXBQaWVDaGFydHNcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIExpbmUgY2hhcnQgb24gdG9wIG9mIFJpY2tzaGF3IGNoYXJ0c1xyXG4gICAgICovXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwUGllQ2hhcnRzJywgW10pXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgncGlwUGllQ2hhcnQnLCBwaXBQaWVDaGFydCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGlwUGllQ2hhcnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNlcmllczogJz1waXBTZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgZG9udXQ6ICc9cGlwRG9udXQnLFxyXG4gICAgICAgICAgICAgICAgbGVnZW5kOiAnPXBpcFNob3dMZWdlbmQnLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6ICc9cGlwU2hvd1RvdGFsJyxcclxuICAgICAgICAgICAgICAgIHNpemU6ICc9cGlwUGllU2l6ZScsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJlZDogJz1waXBDZW50ZXJlZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAncGllQ2hhcnQnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BpZS9waWVfY2hhcnQuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkZWxlbWVudCwgJHNjb3BlLCAkdGltZW91dCwgJGludGVydmFsLCAkbWRDb2xvclBhbGV0dGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2bSAgICAgICAgICAgICAgID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHZhciBjaGFydCAgICAgICAgICAgID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciB0aXRsZUVsZW0gICAgICAgID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciBjaGFydEVsZW0gICAgICAgID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciBjb2xvcnMgICAgICAgICAgID0gXy5tYXAoJG1kQ29sb3JQYWxldHRlLCBmdW5jdGlvbiAocGFsZXR0ZSwgY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZhciByZXNpemVUaXRsZUxhYmVsID0gcmVzaXplVGl0bGVMYWJlbFVud3JhcDtcclxuXHJcbiAgICAgICAgICAgICAgICB2bS5kYXRhID0gdm0uZGF0YSB8fCBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICB2bS5zaG93TGVnZW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS5sZWdlbmQgIT09IHVuZGVmaW5lZCA/IHZtLmxlZ2VuZDogdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHZtLnNlcmllcyAmJiB2bS5zZXJpZXMubGVuZ3RoID4gY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEgPSB2bS5zZXJpZXMuc2xpY2UoMCwgOSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgncGllQ2hhcnQuc2VyaWVzJywgZnVuY3Rpb24gKG5ld1ZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEgPSBuZXdWYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5kYXR1bSh2bS5kYXRhKS5jYWxsKGNoYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQocmVzaXplVGl0bGVMYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdFbXB0eVN0YXRlKGQzLnNlbGVjdCgkZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLnBpZS1jaGFydCBzdmcnKVswXVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2V0cyBjb2xvcnMgb2YgaXRlbXNcclxuICAgICAgICAgICAgICAgIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAoPGFueT5kMy5zY2FsZSkucGFsZXR0ZUNvbG9ycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKGNvbG9ycy5tYXAobWF0ZXJpYWxDb2xvclRvUmdiYSkpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEluc3RhbnRpYXRlIGNoYXJ0XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIG52LmFkZEdyYXBoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFydCA9IG52Lm1vZGVscy5waWVDaGFydCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4oeyB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGxlZnQ6IDAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLngoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS5kb251dCA/IGQudmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAueShmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQodm0uc2l6ZSB8fCAyNTApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh2bS5zaXplIHx8IDI1MClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNob3dMYWJlbHModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmxhYmVsVGhyZXNob2xkKC4wMDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5ncm93T25Ib3ZlcihmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmRvbnV0KHZtLmRvbnV0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9udXRSYXRpbygwLjUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb2xvcihmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5jb2xvciB8fCAoPGFueT5kMy5zY2FsZSkucGFsZXR0ZUNvbG9ycygpLnJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydC50b29sdGlwLmVuYWJsZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0Lm5vRGF0YSgnVGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFydC5zaG93TGVnZW5kKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtID0gZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnLnBpZS1jaGFydCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnaGVpZ2h0JywgKHZtLnNpemUgfHwgMjUwKSArICdweCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnd2lkdGgnLCB2bS5jZW50ZXJlZCA/ICcxMDAlJyA6ICh2bS5zaXplIHx8IDI1MCkgKyAncHgnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdzdmcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0dW0odm0uZGF0YSB8fCBbXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoY2hhcnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBudi51dGlscy53aW5kb3dSZXNpemUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQocmVzaXplVGl0bGVMYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlckNoYXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdFbXB0eVN0YXRlKGQzLnNlbGVjdCgkZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLnBpZS1jaGFydCBzdmcnKVswXVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGFydDtcclxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdmdFbGVtICA9IGQzLnNlbGVjdCgkZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLnBpZS1jaGFydCBzdmcnKVswXVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyVG90YWxMYWJlbChzdmdFbGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHN2Z0VsZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZHVyYXRpb24oMTAwMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQocmVzaXplVGl0bGVMYWJlbFVud3JhcCwgODAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyQ2hhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoc3ZnRWxlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkcmF3RW1wdHlTdGF0ZShzdmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISRlbGVtZW50LmZpbmQoJ3RleHQubnYtbm9EYXRhJykuZ2V0KDApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgkZWxlbWVudC5maW5kKCcuZW1wdHktc3RhdGUnKVswXSkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJy5waXAtZW1wdHktcGllLXRleHQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGVsZW1lbnQuZmluZCgnLnBpcC1lbXB0eS1waWUtdGV4dCcpLmxlbmd0aCA9PT0gMCkgeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJy5waWUtY2hhcnQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwaXAtZW1wdHktcGllLXRleHQnPlRoZXJlIGlzIG5vIGRhdGEgcmlnaHQgbm93Li4uPC9kaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGllID0gZDMubGF5b3V0LnBpZSgpLnNvcnQobnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gTnVtYmVyKHZtLnNpemUgfHwgMjUwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcmMgPSBkMy5zdmcuYXJjKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5pbm5lclJhZGl1cyhzaXplIC8gMiAtIDIwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm91dGVyUmFkaXVzKHNpemUgLyAyIC0gNTcpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcgPSBkMy5zZWxlY3Qoc3ZnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdlbXB0eS1zdGF0ZScsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgXCJ0cmFuc2xhdGUoXCIgKyBzaXplIC8gMiArIFwiLFwiICsgc2l6ZSAvIDIgKyBcIilcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXRoID0gc3ZnLnNlbGVjdEFsbChcInBhdGhcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKHBpZShbMV0pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwicGF0aFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwicmdiYSgwLCAwLCAwLCAwLjA4KVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkXCIsIDxhbnk+YXJjKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY2VudGVyQ2hhcnQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZtLmNlbnRlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdmdFbGVtICA9IGQzLnNlbGVjdCgkZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLnBpZS1jaGFydCBzdmcnKVswXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdE1hcmdpbiA9ICQoc3ZnRWxlbSkuaW5uZXJXaWR0aCgpIC8gMiAtICh2bS5zaXplIHx8IDI1MCkgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJGVsZW1lbnQuZmluZCgnLm52LXBpZUNoYXJ0JylbMF0pLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGxlZnRNYXJnaW4gKyAnLCAwKScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiByZW5kZXJUb3RhbExhYmVsKHN2Z0VsZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKCF2bS50b3RhbCAmJiAhdm0uZG9udXQpIHx8ICF2bS5kYXRhKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3RhbFZhbCA9IHZtLmRhdGEucmVkdWNlKGZ1bmN0aW9uIChzdW0sIGN1cnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1bSArIGN1cnIudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3RhbFZhbCA+PSAxMDAwMCkgdG90YWxWYWwgPSAodG90YWxWYWwgLyAxMDAwKS50b0ZpeGVkKDEpICsgJ2snO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdChzdmdFbGVtKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCcubnYtcGllOm5vdCgubnZkMyknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2xhYmVsLXRvdGFsJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnZG9taW5hbnQtYmFzZWxpbmUnLCAnY2VudHJhbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KHRvdGFsVmFsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVFbGVtID0gZDMuc2VsZWN0KCRlbGVtZW50LmZpbmQoJ3RleHQubGFiZWwtdG90YWwnKS5nZXQoMCkpLnN0eWxlKCdvcGFjaXR5JywgMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVzaXplVGl0bGVMYWJlbFVud3JhcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKCF2bS50b3RhbCAmJiAhdm0uZG9udXQpIHx8ICF2bS5kYXRhKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBib3hTaXplID0gICRlbGVtZW50LmZpbmQoJy5udmQzLm52LXBpZUNoYXJ0JykuZ2V0KDApLmdldEJCb3goKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFib3hTaXplLndpZHRoIHx8ICFib3hTaXplLmhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aXRsZUVsZW0uc3R5bGUoJ2ZvbnQtc2l6ZScsIH5+Ym94U2l6ZS53aWR0aCAvIDQuNSkuc3R5bGUoJ29wYWNpdHknLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIENvbnZlcnRzIHBhbGV0dGUgY29sb3IgbmFtZSBpbnRvIFJHQkEgY29sb3IgcmVwcmVzZW50YXRpb24uXHJcbiAgICAgICAgICAgICAgICAgKiBTaG91bGQgYnkgcmVwbGFjZWQgYnkgcGFsZXR0ZSBmb3IgY2hhcnRzLlxyXG4gICAgICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAgICBOYW1lIG9mIGNvbG9yIGZyb20gQU0gcGFsZXR0ZVxyXG4gICAgICAgICAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gUkdCYSBmb3JtYXRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gbWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAncmdiYSgnICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzBdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzFdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzJdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgKCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVszXSB8fCAxKSArICcpJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBIZWxwZnVsIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZtLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbG9yID0gaXRlbS5jb2xvciB8fCBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnYmFyL2Jhcl9jaGFydC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cImJhci1jaGFydFwiPjxzdmc+PC9zdmc+PC9kaXY+PHBpcC1jaGFydC1sZWdlbmQgcGlwLXNlcmllcz1cImJhckNoYXJ0LmxlZ2VuZFwiIHBpcC1pbnRlcmFjdGl2ZT1cImJhckNoYXJ0LmludGVyYWN0aXZlTGVnZW5kXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3BpZS9waWVfY2hhcnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaWUtY2hhcnRcIiBuZy1jbGFzcz1cIntcXCdjaXJjbGVcXCc6ICFwaWVDaGFydC5kb251dH1cIj48c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCI+PC9zdmc+PC9kaXY+PHBpcC1jaGFydC1sZWdlbmQgcGlwLXNlcmllcz1cInBpZUNoYXJ0LmRhdGFcIiBwaXAtaW50ZXJhY3RpdmU9XCJmYWxzZVwiIG5nLWlmPVwicGllQ2hhcnQuc2hvd0xlZ2VuZCgpXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2xlZ2VuZC9pbnRlcmFjdGl2ZV9sZWdlbmQuaHRtbCcsXG4gICAgJzxkaXY+PGRpdiBjbGFzcz1cImNoYXJ0LWxlZ2VuZC1pdGVtXCIgbmctcmVwZWF0PVwiaXRlbSBpbiBzZXJpZXNcIiBuZy1zaG93PVwiaXRlbS52YWx1ZXMgfHwgaXRlbS52YWx1ZVwiPjxtZC1jaGVja2JveCBjbGFzcz1cImxwMTYgbThcIiBuZy1tb2RlbD1cIml0ZW0uZGlzYWJsZWRcIiBuZy10cnVlLXZhbHVlPVwiZmFsc2VcIiBuZy1mYWxzZS12YWx1ZT1cInRydWVcIiBuZy1pZj1cImludGVyYWN0aXZlXCIgYXJpYS1sYWJlbD1cInt7IGl0ZW0ubGFiZWwgfX1cIj48cCBjbGFzcz1cImxlZ2VuZC1pdGVtLXZhbHVlXCIgbmctaWY9XCJpdGVtLnZhbHVlXCIgbmctc3R5bGU9XCJ7XFwnYmFja2dyb3VuZC1jb2xvclxcJzogaXRlbS5jb2xvcn1cIj57eyBpdGVtLnZhbHVlIH19PC9wPjxwIGNsYXNzPVwibGVnZW5kLWl0ZW0tbGFiZWxcIj57ezo6IGl0ZW0ubGFiZWwgfHwgaXRlbS5rZXkgfX08L3A+PC9tZC1jaGVja2JveD48ZGl2IG5nLWlmPVwiIWludGVyYWN0aXZlXCI+PHNwYW4gY2xhc3M9XCJidWxsZXRcIiBuZy1zdHlsZT1cIntcXCdiYWNrZ3JvdW5kLWNvbG9yXFwnOiBpdGVtLmNvbG9yfVwiPjwvc3Bhbj4gPHNwYW4+e3s6OiBpdGVtLmxhYmVsIHx8IGl0ZW0ua2V5fX08L3NwYW4+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbGluZS9saW5lX2NoYXJ0Lmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwibGluZS1jaGFydFwiIGZsZXg9XCJhdXRvXCIgbGF5b3V0PVwiY29sdW1uXCI+PHN2ZyBjbGFzcz1cImZsZXgtYXV0b1wiIG5nLWNsYXNzPVwie1xcJ3Zpc2libGUteC1heGlzXFwnOiBsaW5lQ2hhcnQuaXNWaXNpYmxlWCgpLCBcXCd2aXNpYmxlLXktYXhpc1xcJzogbGluZUNoYXJ0LmlzVmlzaWJsZVkoKX1cIj48L3N2Zz48ZGl2IGNsYXNzPVwic2Nyb2xsLWNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJ2aXN1YWwtc2Nyb2xsXCI+PGRpdiBjbGFzcz1cInNjcm9sbGVkLWJsb2NrXCI+PC9kaXY+PC9kaXY+PC9kaXY+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWZhYiBtZC1taW5pIG1pbnVzLWJ1dHRvblwiIG5nLWNsaWNrPVwibGluZUNoYXJ0Lnpvb21PdXQoKVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bWludXMtY2lyY2xlXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1mYWIgbWQtbWluaSBwbHVzLWJ1dHRvblwiIG5nLWNsaWNrPVwibGluZUNoYXJ0Lnpvb21JbigpXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzLWNpcmNsZVwiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48L2Rpdj48cGlwLWNoYXJ0LWxlZ2VuZCBwaXAtc2VyaWVzPVwibGluZUNoYXJ0LmxlZ2VuZFwiIHBpcC1pbnRlcmFjdGl2ZT1cImxpbmVDaGFydC5pbnRlcmFjdGl2ZUxlZ2VuZFwiPjwvcGlwLWNoYXJ0LWxlZ2VuZD4nKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1jaGFydHMtaHRtbC5taW4uanMubWFwXG4iXX0=