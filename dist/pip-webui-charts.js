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
                colors = _.filter(colors, function (color) {
                    return _.isObject($mdColorPalette[color]) && _.isObject($mdColorPalette[color][500] && _.isArray($mdColorPalette[color][500].value));
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
                function getMaterialColor(index) {
                    if (!colors || colors.length < 1)
                        return null;
                    if (index >= colors.length) {
                        index = 0;
                    }
                    return materialColorToRgba(colors[index]);
                }
                function generateParameterColor() {
                    if (!vm.data)
                        return;
                    vm.data.forEach(function (item, index) {
                        if (item.values[0]) {
                            item.values[0].color = item.values[0].color || getMaterialColor(index);
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
                colors = _.filter(colors, function (color) {
                    return color !== undefined && color !== null;
                });
                function colorCheckboxes() {
                    var checkboxContainers = $($element).find('md-checkbox .md-container');
                    checkboxContainers.each(function (index, item) {
                        if (index >= $scope.series.length) {
                            return;
                        }
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
                var filteredColor = _.filter($mdColorPalette, function (palette, color) {
                    return _.isObject(color) && _.isObject(color[500] && _.isArray(color[500].value));
                });
                var colors = _.map(filteredColor, function (palette, color) {
                    return color;
                });
                colors = _.filter(colors, function (color) {
                    return _.isObject($mdColorPalette[color]) && _.isObject($mdColorPalette[color][500] && _.isArray($mdColorPalette[color][500].value));
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
                    console.log('destroy', d3.selectAll('.nvtooltip'));
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
                function getMaterialColor(index) {
                    if (!colors || colors.length < 1)
                        return null;
                    if (index >= colors.length) {
                        index = 0;
                    }
                    return materialColorToRgba(colors[index]);
                }
                function generateParameterColor() {
                    if (!vm.data)
                        return;
                    vm.data.forEach(function (item, index) {
                        item.color = item.color || getMaterialColor(index);
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
                colors = _.filter(colors, function (color) {
                    return _.isObject($mdColorPalette[color]) && _.isObject($mdColorPalette[color][500] && _.isArray($mdColorPalette[color][500].value));
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
                function getMaterialColor(index) {
                    if (!colors || colors.length < 1)
                        return null;
                    if (index >= colors.length) {
                        index = 0;
                    }
                    return materialColorToRgba(colors[index]);
                }
                function generateParameterColor() {
                    if (!vm.data)
                        return;
                    vm.data.forEach(function (item, index) {
                        item.color = item.color || getMaterialColor(index);
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



},{}]},{},[6,1,2,3,4,5])(6)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYmFyL2Jhcl9jaGFydC50cyIsInNyYy9jaGFydHMudHMiLCJzcmMvbGVnZW5kL2ludGVyYWN0aXZlX2xlZ2VuZC50cyIsInNyYy9saW5lL2xpbmVfY2hhcnQudHMiLCJzcmMvcGllL3BpZV9jaGFydC50cyIsInRlbXAvcGlwLXdlYnVpLWNoYXJ0cy1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLENBQUM7SUFDRyxZQUFZLENBQUM7SUFTYixPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUM7U0FDN0IsU0FBUyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUUzQztRQUNJLE1BQU0sQ0FBQztZQUNILFFBQVEsRUFBRSxHQUFHO1lBQ2IsS0FBSyxFQUFFO2dCQUNILE1BQU0sRUFBRSxZQUFZO2dCQUNwQixXQUFXLEVBQUUsaUJBQWlCO2dCQUM5QixXQUFXLEVBQUUsaUJBQWlCO2dCQUM5QixpQkFBaUIsRUFBRSxpQkFBaUI7YUFDdkM7WUFDRCxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFlBQVksRUFBRSxVQUFVO1lBQ3hCLFdBQVcsRUFBRSxvQkFBb0I7WUFDakMsVUFBVSxFQUFFLFVBQVUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGVBQWU7Z0JBQ3hFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDZCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDckIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBVSxPQUFPLEVBQUUsS0FBSztvQkFDeEQsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDakIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFN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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2MgbW9kdWxlXHJcbiAgICAgKiBAbmFtZSBwaXBCYXJDaGFydHNcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIEJhciBjaGFydCBvbiB0b3Agb2YgUmlja3NoYXcgY2hhcnRzXHJcbiAgICAgKi9cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBCYXJDaGFydHMnLCBbXSlcclxuICAgICAgICAuZGlyZWN0aXZlKCdwaXBCYXJDaGFydCcsIHBpcEJhckNoYXJ0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBwaXBCYXJDaGFydCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAnPXBpcFNlcmllcycsXHJcbiAgICAgICAgICAgICAgICB4VGlja0Zvcm1hdDogJz1waXBYVGlja0Zvcm1hdCcsXHJcbiAgICAgICAgICAgICAgICB5VGlja0Zvcm1hdDogJz1waXBZVGlja0Zvcm1hdCcsXHJcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZUxlZ2VuZDogJz1waXBJbnRlckxlZ2VuZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnYmFyQ2hhcnQnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Jhci9iYXJfY2hhcnQuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkZWxlbWVudCwgJHNjb3BlLCAkdGltZW91dCwgJGludGVydmFsLCAkbWRDb2xvclBhbGV0dGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2bSA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hhcnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoYXJ0RWxlbSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29sb3JzID0gXy5tYXAoJG1kQ29sb3JQYWxldHRlLCBmdW5jdGlvbiAocGFsZXR0ZSwgY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvbG9ycyA9IF8uZmlsdGVyKGNvbG9ycywgZnVuY3Rpb24oY29sb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmlzT2JqZWN0KCRtZENvbG9yUGFsZXR0ZVtjb2xvcl0pICYmIF8uaXNPYmplY3QoJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdICYmIF8uaXNBcnJheSgkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBoZWlnaHQgPSAyNzA7XHJcblxyXG4gICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHZtLnNlcmllcykgfHwgW107XHJcbiAgICAgICAgICAgICAgICB2bS5sZWdlbmQgPSBfLmNsb25lKHZtLnNlcmllcyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICgodm0uc2VyaWVzIHx8IFtdKS5sZW5ndGggPiBjb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHZtLnNlcmllcy5zbGljZSgwLCA5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgKDxhbnk+ZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZShjb2xvcnMubWFwKG1hdGVyaWFsQ29sb3JUb1JnYmEpKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnYmFyQ2hhcnQuc2VyaWVzJywgZnVuY3Rpb24gKHVwZGF0ZWRTZXJpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS5kYXRhID0gcHJlcGFyZURhdGEodXBkYXRlZFNlcmllcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubGVnZW5kID0gXy5jbG9uZSh2bS5zZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5kYXR1bSh2bS5kYXRhKS5jYWxsKGNoYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnQmFyV2lkdGhBbmRMYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goJ2JhckNoYXJ0LmxlZ2VuZCcsIGZ1bmN0aW9uKHVwZGF0ZWRMZWdlbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS5kYXRhID0gcHJlcGFyZURhdGEodXBkYXRlZExlZ2VuZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubGVnZW5kID0gdXBkYXRlZExlZ2VuZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5kYXR1bSh2bS5kYXRhKS5jYWxsKGNoYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnQmFyV2lkdGhBbmRMYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBhcmVEYXRhKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgXy5lYWNoKGRhdGEsIChzZXJpYSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlcmlhLmRpc2FibGVkICYmIHNlcmlhLnZhbHVlcykgcmVzdWx0LnB1c2goc2VyaWEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5jbG9uZURlZXAocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEluc3RhbnRpYXRlIGNoYXJ0XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIG52LmFkZEdyYXBoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFydCA9IG52Lm1vZGVscy5kaXNjcmV0ZUJhckNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbih7dG9wOiAxMCwgcmlnaHQ6IDAsIGJvdHRvbTogMTAsIGxlZnQ6IDUwfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLngoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQubGFiZWwgfHwgZC5rZXkgfHwgZC54OyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAueShmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC52YWx1ZTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNob3dWYWx1ZXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0YWdnZXJMYWJlbHModHJ1ZSkgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93WEF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNob3dZQXhpcyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudmFsdWVGb3JtYXQoPGFueT5kMy5mb3JtYXQoJ2QnKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmR1cmF0aW9uKDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29sb3IoZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLmRhdGFbZC5zZXJpZXNdLmNvbG9yIHx8IG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3JzW2Quc2VyaWVzXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydC50b29sdGlwLmVuYWJsZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0Lm5vRGF0YSgnVGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQueUF4aXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS55VGlja0Zvcm1hdCA/IHZtLnlUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnhBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0ueFRpY2tGb3JtYXQgPyB2bS54VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0gPSBkMy5zZWxlY3QoJGVsZW1lbnQuZ2V0KDApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCcuYmFyLWNoYXJ0IHN2ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bSh2bS5kYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2hlaWdodCcsICcyODVweCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsKGNoYXJ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbnYudXRpbHMud2luZG93UmVzaXplKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWdCYXJXaWR0aEFuZExhYmVsKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChjb25maWdCYXJXaWR0aEFuZExhYmVsLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZHJhd0VtcHR5U3RhdGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmZpbmQoJy5udi1ub0RhdGEnKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KCRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpWzBdKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZyA9IGNoYXJ0RWxlbS5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdlbXB0eS1zdGF0ZScsIHRydWUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggPSAkZWxlbWVudC5maW5kKCcubnZkMy1zdmcnKS5pbm5lcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4gPSB3aWR0aCAqIDAuMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdyZ2JhKDAsIDAsIDAsIDAuMDgpJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCAtIDEwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZy5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoNDIsIDYwKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmdiYSgwLCAwLCAwLCAwLjA4KScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAyMDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAzOCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSg4NCwgMTYwKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmdiYSgwLCAwLCAwLCAwLjA4KScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAxMDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAzOCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArICg1MCArIG1hcmdpbikgKyAnLCAwKSwgJyArICdzY2FsZSgnICsgKCh3aWR0aCAtIDIqbWFyZ2luKSAvIDEyNikgKyAnLCAxKScgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBBbGlnbnMgdmFsdWUgbGFiZWwgYWNjb3JkaW5nIHRvIHBhcmVudCBjb250YWluZXIgc2l6ZS5cclxuICAgICAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvbmZpZ0JhcldpZHRoQW5kTGFiZWwodGltZW91dDogbnVtYmVyID0gMTAwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbHMgPSAkZWxlbWVudC5maW5kKCcubnYtYmFyIHRleHQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRCYXJzID0gJGVsZW1lbnQuZmluZCgnLm52LWJhcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRIZWlnaHQgPSAoPGFueT4kZWxlbWVudC5maW5kKCcubnZkMy1zdmcnKVswXSkuZ2V0QkJveCgpLmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KCRlbGVtZW50LmZpbmQoJy5iYXItY2hhcnQnKVswXSkuY2xhc3NlZCgndmlzaWJsZScsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydEJhcnMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJhckhlaWdodCA9IE51bWJlcihkMy5zZWxlY3QoPGFueT5pdGVtKS5zZWxlY3QoJ3JlY3QnKS5hdHRyKCdoZWlnaHQnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXJXaWR0aCA9IE51bWJlcihkMy5zZWxlY3QoPGFueT5pdGVtKS5zZWxlY3QoJ3JlY3QnKS5hdHRyKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBkMy5zZWxlY3QoPGFueT5pdGVtKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggPSBkMy50cmFuc2Zvcm0oZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nKSkudHJhbnNsYXRlWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA9IGQzLnRyYW5zZm9ybShlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScpKS50cmFuc2xhdGVbMV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgTnVtYmVyKHggKyBpbmRleCAqIChiYXJXaWR0aCArIDE1KSkgKyAnLCAnICsgKGhlaWdodCAtIDIwKSArICcpJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ3JlY3QnKS5hdHRyKCdoZWlnaHQnLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50cmFuc2l0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbih0aW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE51bWJlcih4ICsgaW5kZXggKiAoYmFyV2lkdGggKyAxNSkpICsgJywgJyArIHkgKyAnKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdyZWN0JykuYXR0cignaGVpZ2h0JywgYmFySGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdChsYWJlbHNbaW5kZXhdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgYmFySGVpZ2h0IC8gMiArIDEwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBiYXJXaWR0aCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogQ29udmVydHMgcGFsZXR0ZSBjb2xvciBuYW1lIGludG8gUkdCQSBjb2xvciByZXByZXNlbnRhdGlvbi5cclxuICAgICAgICAgICAgICAgICAqIFNob3VsZCBieSByZXBsYWNlZCBieSBwYWxldHRlIGZvciBjaGFydHMuXHJcbiAgICAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yICAgIE5hbWUgb2YgY29sb3IgZnJvbSBBTSBwYWxldHRlXHJcbiAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSR0JhIGZvcm1hdFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdyZ2JhKCcgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMF0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMV0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMl0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAoJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzNdIHx8IDEpICsgJyknO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSGVscGZ1bCBtZXRob2RcclxuICAgICAgICAgICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldE1hdGVyaWFsQ29sb3IoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbG9ycyB8fCBjb2xvcnMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBjb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSGVscGZ1bCBtZXRob2RcclxuICAgICAgICAgICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2bS5kYXRhKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udmFsdWVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnZhbHVlc1swXS5jb2xvciA9IGl0ZW0udmFsdWVzWzBdLmNvbG9yIHx8IGdldE1hdGVyaWFsQ29sb3IoaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0udmFsdWVzWzBdLmNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIu+7vy8qKlxyXG4gKiBAZmlsZSBSZWdpc3RyYXRpb24gb2YgY2hhcnQgV2ViVUkgY29udHJvbHNcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICovXHJcblxyXG4vKiBnbG9iYWwgYW5ndWxhciAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzJywgW1xyXG4gICAgICAgICdwaXBCYXJDaGFydHMnLFxyXG4gICAgICAgICdwaXBMaW5lQ2hhcnRzJyxcclxuICAgICAgICAncGlwUGllQ2hhcnRzJyxcclxuICAgICAgICAncGlwQ2hhcnRMZWdlbmRzJyxcclxuICAgICAgICAncGlwQ2hhcnRzLlRlbXBsYXRlcydcclxuICAgIF0pO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2MgbW9kdWxlXHJcbiAgICAgKiBAbmFtZSBwaXBMZWdlbmRzXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBMZWdlbmQgb2YgY2hhcnRzXHJcbiAgICAgKi9cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydExlZ2VuZHMnLCBbXSlcclxuICAgICAgICAuZGlyZWN0aXZlKCdwaXBDaGFydExlZ2VuZCcsIHBpcENoYXJ0TGVnZW5kKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwaXBDaGFydExlZ2VuZCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAnPXBpcFNlcmllcycsXHJcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZTogJz1waXBJbnRlcmFjdGl2ZSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdsZWdlbmQvaW50ZXJhY3RpdmVfbGVnZW5kLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQsICRzY29wZSwgJHRpbWVvdXQsICRtZENvbG9yUGFsZXR0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyA9IF8ubWFwKCRtZENvbG9yUGFsZXR0ZSwgZnVuY3Rpb24gKHBhbGV0dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFsZXR0ZVs1MDBdLmhleDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29sb3JzID0gXy5maWx0ZXIoY29sb3JzLCBmdW5jdGlvbihjb2xvcil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yICE9PSB1bmRlZmluZWQgJiYgY29sb3IgIT09IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KTsgIFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY29sb3JDaGVja2JveGVzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGVja2JveENvbnRhaW5lcnMgPSAkKCRlbGVtZW50KS5maW5kKCdtZC1jaGVja2JveCAubWQtY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94Q29udGFpbmVycy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gJHNjb3BlLnNlcmllcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGl0ZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCdjb2xvcicsICRzY29wZS5zZXJpZXNbaW5kZXhdLmNvbG9yIHx8IGNvbG9yc1tpbmRleF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZCgnLm1kLWljb24nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnYmFja2dyb3VuZC1jb2xvcicsICRzY29wZS5zZXJpZXNbaW5kZXhdLmNvbG9yIHx8IGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGFuaW1hdGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxlZ2VuZFRpdGxlcyA9ICQoJGVsZW1lbnQpLmZpbmQoJy5jaGFydC1sZWdlbmQtaXRlbScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRUaXRsZXMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygndmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyMDAgKiBpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBhcmVTZXJpZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuc2VyaWVzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zZXJpZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0uY29sb3IgfHwgKGl0ZW0udmFsdWVzICYmIGl0ZW0udmFsdWVzWzBdICYmIGl0ZW0udmFsdWVzWzBdLmNvbG9yID8gaXRlbS52YWx1ZXNbMF0uY29sb3IgOiBjb2xvcnNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5kaXNhYmxlZCA9IGl0ZW0uZGlzYWJsZWQgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7ICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnc2VyaWVzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvckNoZWNrYm94ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBwcmVwYXJlU2VyaWVzKCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdpbnRlcmFjdGl2ZScsIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWUgPT0gdHJ1ZSAmJiBuZXdWYWx1ZSAhPSBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChjb2xvckNoZWNrYm94ZXMsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmltYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3JDaGVja2JveGVzKCk7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgIHByZXBhcmVTZXJpZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBtb2R1bGVcclxuICAgICAqIEBuYW1lIHBpcExpbmVDaGFydHNcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIExpbmUgY2hhcnQgb24gdG9wIG9mIFJpY2tzaGF3IGNoYXJ0c1xyXG4gICAgICovXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwTGluZUNoYXJ0cycsIFtdKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3BpcExpbmVDaGFydCcsIHBpcExpbmVDaGFydCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGlwTGluZUNoYXJ0KCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXM6ICc9cGlwU2VyaWVzJyxcclxuICAgICAgICAgICAgICAgIHNob3dZQXhpczogJz1waXBZQXhpcycsXHJcbiAgICAgICAgICAgICAgICBzaG93WEF4aXM6ICc9cGlwWEF4aXMnLFxyXG4gICAgICAgICAgICAgICAgeEZvcm1hdDogJz1waXBYRm9ybWF0JyxcclxuICAgICAgICAgICAgICAgIHhUaWNrRm9ybWF0OiAnPXBpcFhUaWNrRm9ybWF0JyxcclxuICAgICAgICAgICAgICAgIHlUaWNrRm9ybWF0OiAnPXBpcFlUaWNrRm9ybWF0JyxcclxuICAgICAgICAgICAgICAgIGR5bmFtaWM6ICc9cGlwRHluYW1pYycsXHJcbiAgICAgICAgICAgICAgICBmaXhlZEhlaWdodDogJ0BwaXBEaWFncmFtSGVpZ2h0JyxcclxuICAgICAgICAgICAgICAgIGR5bmFtaWNIZWlnaHQ6ICdAcGlwRHluYW1pY0hlaWdodCcsXHJcbiAgICAgICAgICAgICAgICBtaW5IZWlnaHQ6ICdAcGlwTWluSGVpZ2h0JyxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogJ0BwaXBNYXhIZWlnaHQnLFxyXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmVMZWdlbmQ6ICc9cGlwSW50ZXJMZWdlbmQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2xpbmVDaGFydCcsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbGluZS9saW5lX2NoYXJ0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQsICRzY29wZSwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJG1kQ29sb3JQYWxldHRlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdm0gICAgICAgID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHZhciBjaGFydCAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoYXJ0RWxlbSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2V0Wm9vbSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgdXBkYXRlWm9vbU9wdGlvbnMgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpeGVkSGVpZ2h0ID0gdm0uZml4ZWRIZWlnaHQgfHwgMjcwO1xyXG4gICAgICAgICAgICAgICAgdmFyIGR5bmFtaWNIZWlnaHQgPSB2bS5keW5hbWljSGVpZ2h0IHx8IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbkhlaWdodCA9IHZtLm1pbkhlaWdodCB8fCBmaXhlZEhlaWdodDtcclxuICAgICAgICAgICAgICAgIHZhciBtYXhIZWlnaHQgPSB2bS5tYXhIZWlnaHQgfHwgZml4ZWRIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGZpbHRlcmVkQ29sb3IgPSBfLmZpbHRlcigkbWRDb2xvclBhbGV0dGUsIGZ1bmN0aW9uKHBhbGV0dGUsIGNvbG9yKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5pc09iamVjdChjb2xvcikgJiYgXy5pc09iamVjdChjb2xvcls1MDBdICYmIF8uaXNBcnJheShjb2xvcls1MDBdLnZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZhciBjb2xvcnMgPSBfLm1hcChmaWx0ZXJlZENvbG9yLCBmdW5jdGlvbiAocGFsZXR0ZSwgY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvbG9ycyA9IF8uZmlsdGVyKGNvbG9ycywgZnVuY3Rpb24oY29sb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmlzT2JqZWN0KCRtZENvbG9yUGFsZXR0ZVtjb2xvcl0pICYmIF8uaXNPYmplY3QoJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdICYmIF8uaXNBcnJheSgkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHZtLnNlcmllcykgfHwgW107XHJcbiAgICAgICAgICAgICAgICB2bS5sZWdlbmQgPSBfLmNsb25lKHZtLnNlcmllcyk7XHJcbiAgICAgICAgICAgICAgICB2bS5zb3VyY2VFdmVudHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdm0uaXNWaXNpYmxlWCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0uc2hvd1hBeGlzID09IHVuZGVmaW5lZCA/IHRydWUgOiB2bS5zaG93WEF4aXM7IFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2bS5pc1Zpc2libGVZID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS5zaG93WUF4aXMgPT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHZtLnNob3dZQXhpcztcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdm0uem9vbUluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXRab29tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFpvb20oJ2luJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2bS56b29tT3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXRab29tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFpvb20oJ291dCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh2bS5zZXJpZXMgJiYgdm0uc2VyaWVzLmxlbmd0aCA+IGNvbG9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS5kYXRhID0gdm0uc2VyaWVzLnNsaWNlKDAsIDkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNldHMgY29sb3JzIG9mIGl0ZW1zXHJcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgKDxhbnk+ZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZShjb2xvcnMubWFwKG1hdGVyaWFsQ29sb3JUb1JnYmEpKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnbGluZUNoYXJ0LnNlcmllcycsIGZ1bmN0aW9uICh1cGRhdGVkU2VyaWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHVwZGF0ZWRTZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmxlZ2VuZCA9IF8uY2xvbmUodm0uc2VyaWVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtLmRhdHVtKHZtLmRhdGEgfHwgW10pLmNhbGwoY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZVpvb21PcHRpb25zKSB1cGRhdGVab29tT3B0aW9ucyh2bS5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdsaW5lQ2hhcnQubGVnZW5kJywgZnVuY3Rpb24odXBkYXRlZExlZ2VuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEgPSBwcmVwYXJlRGF0YSh1cGRhdGVkTGVnZW5kKTtcclxuICAgICAgICAgICAgICAgICAgICB2bS5sZWdlbmQgPSB1cGRhdGVkTGVnZW5kO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtLmRhdHVtKHZtLmRhdGEgfHwgW10pLmNhbGwoY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZVpvb21PcHRpb25zKSB1cGRhdGVab29tT3B0aW9ucyh2bS5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZGVzdHJveScsIGQzLnNlbGVjdEFsbCgnLm52dG9vbHRpcCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0QWxsKCcubnZ0b29sdGlwJykuc3R5bGUoJ29wYWNpdHknLCAwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBhcmVEYXRhKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgXy5lYWNoKGRhdGEsIChzZXJpYSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlcmlhLmRpc2FibGVkICYmIHNlcmlhLnZhbHVlcykgcmVzdWx0LnB1c2goc2VyaWEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5jbG9uZURlZXAocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZ2V0SGVpZ2h0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkeW5hbWljSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoZWlndGggPSBNYXRoLm1pbihNYXRoLm1heChtaW5IZWlnaHQsICRlbGVtZW50LnBhcmVudCgpLmlubmVySGVpZ2h0KCkpLCBtYXhIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGVpZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaXhlZEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSW5zdGFudGlhdGUgY2hhcnRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbnYuYWRkR3JhcGgoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbnYubW9kZWxzLmxpbmVDaGFydCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4oeyB0b3A6IDIwLCByaWdodDogMjAsIGJvdHRvbTogMzAsIGxlZnQ6IDMwIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGQgIT09IHVuZGVmaW5lZCAmJiBkLnggIT09IHVuZGVmaW5lZCkgPyAodm0ueEZvcm1hdCA/IHZtLnhGb3JtYXQoZC54KSA6IGQueCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAueShmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChkICE9PSB1bmRlZmluZWQgJiYgZC52YWx1ZSAhPT0gdW5kZWZpbmVkKSA/IGQudmFsdWUgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGdldEhlaWdodCgpIC0gNTApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC51c2VJbnRlcmFjdGl2ZUd1aWRlbGluZSh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvd1hBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93WUF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNob3dMZWdlbmQoZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb2xvcihmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5jb2xvciB8fCAoPGFueT5kMy5zY2FsZSkucGFsZXR0ZUNvbG9ycygpLnJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydC50b29sdGlwLmVuYWJsZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0Lm5vRGF0YSgnVGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQueUF4aXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS55VGlja0Zvcm1hdCA/IHZtLnlUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnhBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0ueFRpY2tGb3JtYXQgPyB2bS54VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0gPSBkMy5zZWxlY3QoJGVsZW1lbnQuZ2V0KDApKS5zZWxlY3QoJy5saW5lLWNoYXJ0IHN2ZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5kYXR1bSh2bS5kYXRhIHx8IFtdKS5zdHlsZSgnaGVpZ2h0JywgKGdldEhlaWdodCgpIC0gNTApICsgJ3B4JykuY2FsbChjaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2bS5keW5hbWljKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFpvb20oY2hhcnQsIGNoYXJ0RWxlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBudi51dGlscy53aW5kb3dSZXNpemUoKCkgPT4geyBvblJlc2l6ZSgpOyB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbigncGlwTWFpblJlc2l6ZWQnLCAoKSA9PiB7IG9uUmVzaXplKCk7IH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hhcnQ7XHJcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzaXplKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmhlaWdodChnZXRIZWlnaHQoKSAtIDUwKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0uc3R5bGUoJ2hlaWdodCcsIChnZXRIZWlnaHQoKSAtIDUwKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZHJhd0VtcHR5U3RhdGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkZWxlbWVudC5maW5kKCd0ZXh0Lm52LW5vRGF0YScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJylbMF0pLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb250YWluZXJXaWR0aCA9ICRlbGVtZW50LmZpbmQoJy5saW5lLWNoYXJ0JykuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGVsZW1lbnQuZmluZCgnLmxpbmUtY2hhcnQnKS5pbm5lckhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnaW1hZ2UnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIChjb250YWluZXJXaWR0aCAvIDExNTEpICsgJywnICsgKGNvbnRhaW5lckhlaWdodCAvIDIxNikgKyAnKScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImRlZnNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwicGF0dGVyblwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBcIjBcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgXCIwXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJpZFwiLCBcImJnXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImltYWdlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCAxNylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneScsIDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIFwiMjE2cHhcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBcIjExNTFweFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIChjb250YWluZXJXaWR0aCAvIDExNTEpICsgJywnICsgKGNvbnRhaW5lckhlaWdodCAvIDIxNikgKyAnKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4bGluazpocmVmXCIsIFwiaW1hZ2VzL2xpbmVfY2hhcnRfZW1wdHlfc3RhdGUuc3ZnXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdlbXB0eS1zdGF0ZScsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIFwiMTAwJVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIFwiMTAwJVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ3VybCgjYmcpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlU2Nyb2xsKGRvbWFpbnMsIGJvdW5kYXJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJEaWZmID0gYm91bmRhcnlbMV0gLSBib3VuZGFyeVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tRGlmZiA9IGRvbWFpbnNbMV0gLSBkb21haW5zWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gKGRvbWFpbnNbMV0gLSBkb21haW5zWzBdKS9iRGlmZiA9PT0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgkZWxlbWVudFswXSkuZmluZCgnLnZpc3VhbC1zY3JvbGwnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCdvcGFjaXR5JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzRXF1YWwgPyAwIDogMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0VxdWFsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgJCgkZWxlbWVudFswXSkuZmluZCgnLnNjcm9sbGVkLWJsb2NrJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkb21haW5zWzBdL2JEaWZmICogMTAwICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCd3aWR0aCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkb21EaWZmL2JEaWZmICogMTAwICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBhZGRab29tKGNoYXJ0LCBzdmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZUV4dGVudFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzY2FsZUV4dGVudCA9IDQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeUF4aXMgICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB4QXhpcyAgICAgICA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHhEb21haW4gICAgID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeURvbWFpbiAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWRyYXcgICAgICA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN2ZyAgICAgICAgID0gc3ZnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZXNcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeFNjYWxlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeVNjYWxlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWluL21heCBib3VuZGFyaWVzXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHhfYm91bmRhcnkgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB5X2JvdW5kYXJ5ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGQzIHpvb20gaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkM3pvb20gPSBkMy5iZWhhdmlvci56b29tKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZYRG9tYWluID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJldlNjYWxlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJldlRyYW5zbGF0ZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldERhdGEoY2hhcnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXREYXRhKG5ld0NoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgeUF4aXMgICAgICAgPSBuZXdDaGFydC55QXhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXMgICAgICAgPSBuZXdDaGFydC54QXhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgeERvbWFpbiAgICAgPSBuZXdDaGFydC54RG9tYWluIHx8IHhBeGlzLnNjYWxlKCkuZG9tYWluO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5RG9tYWluICAgICA9IG5ld0NoYXJ0LnlEb21haW4gfHwgeUF4aXMuc2NhbGUoKS5kb21haW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZHJhdyAgICAgID0gbmV3Q2hhcnQudXBkYXRlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2NhbGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhTY2FsZSA9IHhBeGlzLnNjYWxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlTY2FsZSA9IHlBeGlzLnNjYWxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtaW4vbWF4IGJvdW5kYXJpZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgeF9ib3VuZGFyeSA9IHhBeGlzLnNjYWxlKCkuZG9tYWluKCkuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeV9ib3VuZGFyeSA9IHlBeGlzLnNjYWxlKCkuZG9tYWluKCkuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBkMyB6b29tIGhhbmRsZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlhEb21haW4gPSB4X2JvdW5kYXJ5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2U2NhbGUgPSBkM3pvb20uc2NhbGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlRyYW5zbGF0ZSA9IGQzem9vbS50cmFuc2xhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSBuaWNlIGF4aXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgeFNjYWxlLm5pY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeVNjYWxlLm5pY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpeCBkb21haW5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBmaXhEb21haW4oZG9tYWluLCBib3VuZGFyeSwgc2NhbGUsIHRyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9tYWluWzBdIDwgYm91bmRhcnlbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblswXSA9IGJvdW5kYXJ5WzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZYRG9tYWluWzBdICE9PSBib3VuZGFyeVswXSB8fCBzY2FsZSAhPT0gcHJldlNjYWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzFdICs9IChib3VuZGFyeVswXSAtIGRvbWFpblswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblsxXSA9IHByZXZYRG9tYWluWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSA9IF8uY2xvbmUocHJldlRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb21haW5bMV0gPiBib3VuZGFyeVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzFdID0gYm91bmRhcnlbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldlhEb21haW5bMV0gIT09IGJvdW5kYXJ5WzFdIHx8IHNjYWxlICE9PSBwcmV2U2NhbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21haW5bMF0gLT0gKGRvbWFpblsxXSAtIGJvdW5kYXJ5WzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdID0gcHJldlhEb21haW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gXy5jbG9uZShwcmV2VHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLnRyYW5zbGF0ZSh0cmFuc2xhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2WERvbWFpbiA9IF8uY2xvbmUoZG9tYWluKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlNjYWxlID0gXy5jbG9uZShzY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZUcmFuc2xhdGUgPSBfLmNsb25lKHRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkb21haW47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVDaGFydCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLnNjYWxlKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFswLDBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeFNjYWxlLmRvbWFpbih4X2JvdW5kYXJ5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKS55KHlTY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5jYWxsKGQzem9vbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyB6b29tIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiB6b29tZWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN3aXRjaCBvZmYgdmVydGljYWwgem9vbWluZyB0ZW1wb3JhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geURvbWFpbih5U2NhbGUuZG9tYWluKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCg8YW55PmQzLmV2ZW50KS5zY2FsZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW56b29tZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4RG9tYWluKGZpeERvbWFpbih4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnksICg8YW55PmQzLmV2ZW50KS5zY2FsZSwgKDxhbnk+ZDMuZXZlbnQpLnRyYW5zbGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkcmF3KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVNjcm9sbCh4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgICAgICBzZXRab29tID0gZnVuY3Rpb24od2hpY2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNlbnRlcjAgPSBbc3ZnWzBdWzBdLmdldEJCb3goKS53aWR0aCAvIDIsIHN2Z1swXVswXS5nZXRCQm94KCkuaGVpZ2h0IC8gMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2xhdGUwID0gZDN6b29tLnRyYW5zbGF0ZSgpLCBjb29yZGluYXRlczAgPSBjb29yZGluYXRlcyhjZW50ZXIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aGljaCA9PT0gJ2luJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZTY2FsZSA8IHNjYWxlRXh0ZW50KSBkM3pvb20uc2NhbGUocHJldlNjYWxlICsgMC4yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2U2NhbGUgPiAxKSBkM3pvb20uc2NhbGUocHJldlNjYWxlIC0gMC4yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNlbnRlcjEgPSBwb2ludChjb29yZGluYXRlczApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFt0cmFuc2xhdGUwWzBdICsgY2VudGVyMFswXSAtIGNlbnRlcjFbMF0sIHRyYW5zbGF0ZTBbMV0gKyBjZW50ZXIwWzFdIC0gY2VudGVyMVsxXV0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLmV2ZW50KHN2Zyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gc3RlcCh3aGljaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdoaWNoID09PSAncmlnaHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVbMF0gLT0gMjA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVbMF0gKz0gMjA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUodHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLmV2ZW50KHN2Zyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjb29yZGluYXRlcyhwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NhbGUgPSBkM3pvb20uc2NhbGUoKSwgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWyhwb2ludFswXSAtIHRyYW5zbGF0ZVswXSkgLyBzY2FsZSwgKHBvaW50WzFdIC0gdHJhbnNsYXRlWzFdKSAvIHNjYWxlXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHBvaW50KGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY2FsZSA9IGQzem9vbS5zY2FsZSgpLCB0cmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbY29vcmRpbmF0ZXNbMF0gKiBzY2FsZSArIHRyYW5zbGF0ZVswXSwgY29vcmRpbmF0ZXNbMV0gKiBzY2FsZSArIHRyYW5zbGF0ZVsxXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBrZXlwcmVzcygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoKCg8YW55PmQzLmV2ZW50KS5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM5OiBzdGVwKCdyaWdodCcpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6IHN0ZXAoJ2xlZnQnKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEwNzogc2V0Wm9vbSgnaW4nKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEwOTogc2V0Wm9vbSgnb3V0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHpvb20gZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHVuem9vbWVkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4RG9tYWluKHhfYm91bmRhcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWRyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLnNjYWxlKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFswLDBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlNjYWxlID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlRyYW5zbGF0ZSA9IFswLDBdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB3cmFwcGVyXHJcbiAgICAgICAgICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAueSh5U2NhbGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZUV4dGVudChbMSwgc2NhbGVFeHRlbnRdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ3pvb20nLCB6b29tZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgICAgIHN2Zy5jYWxsKGQzem9vbSkub24oJ2RibGNsaWNrLnpvb20nLCB1bnpvb21lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgkZWxlbWVudC5nZXQoMCkpLmFkZENsYXNzKCdkeW5hbWljJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBrZXlib2FyZCBoYW5kbGVyc1xyXG4gICAgICAgICAgICAgICAgICAgIHN2Z1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZm9jdXNhYmxlJywgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnb3V0bGluZScsICdub25lJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdrZXlkb3duJywga2V5cHJlc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7fSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBnZXRYTWluTWF4ID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWF4VmFsLCBtaW5WYWwgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGF0YVtpXS5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wTWluVmFsID0gZDMubWF4KGRhdGFbaV0udmFsdWVzLCBmdW5jdGlvbihkOiBhbnkpIHsgcmV0dXJuIHZtLnhGb3JtYXQgPyB2bS54Rm9ybWF0KGQueCkgOiBkLng7fSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wTWF4VmFsID0gZDMubWluKGRhdGFbaV0udmFsdWVzLCBmdW5jdGlvbihkOiBhbnkpIHsgcmV0dXJuIHZtLnhGb3JtYXQgPyB2bS54Rm9ybWF0KGQueCkgOiBkLng7fSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblZhbCA9ICghbWluVmFsIHx8IHRlbXBNaW5WYWwgPCBtaW5WYWwpID8gdGVtcE1pblZhbCA6IG1pblZhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWwgPSAoIW1heFZhbCB8fCB0ZW1wTWF4VmFsID4gbWF4VmFsKSA/IHRlbXBNYXhWYWwgOiBtYXhWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttYXhWYWwsIG1pblZhbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlWm9vbU9wdGlvbnMgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlBeGlzID0gY2hhcnQueUF4aXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzID0gY2hhcnQueEF4aXM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4U2NhbGUgPSB4QXhpcy5zY2FsZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5U2NhbGUgPSB5QXhpcy5zY2FsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgeF9ib3VuZGFyeSA9IGdldFhNaW5NYXgoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZDN6b29tLnNjYWxlKCkgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS54KHhTY2FsZSkueSh5U2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVTY3JvbGwoeFNjYWxlLmRvbWFpbigpLCB4X2JvdW5kYXJ5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBDb252ZXJ0cyBwYWxldHRlIGNvbG9yIG5hbWUgaW50byBSR0JBIGNvbG9yIHJlcHJlc2VudGF0aW9uLlxyXG4gICAgICAgICAgICAgICAgICogU2hvdWxkIGJ5IHJlcGxhY2VkIGJ5IHBhbGV0dGUgZm9yIGNoYXJ0cy5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgICAgTmFtZSBvZiBjb2xvciBmcm9tIEFNIHBhbGV0dGVcclxuICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJHQmEgZm9ybWF0XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3JnYmEoJyArICRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVswXSArICcsJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArICRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVsxXSArICcsJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArICRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVsyXSArICcsJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArICgkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbM10gfHwgMSkgKyAnKSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBIZWxwZnVsIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0TWF0ZXJpYWxDb2xvcihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY29sb3JzIHx8IGNvbG9ycy5sZW5ndGggPCAxKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IGNvbG9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3JzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBIZWxwZnVsIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZtLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbG9yID0gaXRlbS5jb2xvciB8fCBnZXRNYXRlcmlhbENvbG9yKGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBtb2R1bGVcclxuICAgICAqIEBuYW1lIHBpcFBpZUNoYXJ0c1xyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogTGluZSBjaGFydCBvbiB0b3Agb2YgUmlja3NoYXcgY2hhcnRzXHJcbiAgICAgKi9cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBQaWVDaGFydHMnLCBbXSlcclxuICAgICAgICAuZGlyZWN0aXZlKCdwaXBQaWVDaGFydCcsIHBpcFBpZUNoYXJ0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBwaXBQaWVDaGFydCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAnPXBpcFNlcmllcycsXHJcbiAgICAgICAgICAgICAgICBkb251dDogJz1waXBEb251dCcsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6ICc9cGlwU2hvd0xlZ2VuZCcsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogJz1waXBTaG93VG90YWwnLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTogJz1waXBQaWVTaXplJyxcclxuICAgICAgICAgICAgICAgIGNlbnRlcmVkOiAnPXBpcENlbnRlcmVkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdwaWVDaGFydCcsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGllL3BpZV9jaGFydC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkaW50ZXJ2YWwsICRtZENvbG9yUGFsZXR0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZtICAgICAgICAgICAgICAgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoYXJ0ICAgICAgICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpdGxlRWxlbSAgICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoYXJ0RWxlbSAgICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyAgICAgICAgICAgPSBfLm1hcCgkbWRDb2xvclBhbGV0dGUsIGZ1bmN0aW9uIChwYWxldHRlLCBjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29sb3JzID0gXy5maWx0ZXIoY29sb3JzLCBmdW5jdGlvbihjb2xvcil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNPYmplY3QoJG1kQ29sb3JQYWxldHRlW2NvbG9yXSkgJiYgXy5pc09iamVjdCgkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0gJiYgXy5pc0FycmF5KCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdmFyIHJlc2l6ZVRpdGxlTGFiZWwgPSByZXNpemVUaXRsZUxhYmVsVW53cmFwO1xyXG5cclxuICAgICAgICAgICAgICAgIHZtLmRhdGEgPSB2bS5kYXRhIHx8IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIHZtLnNob3dMZWdlbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLmxlZ2VuZCAhPT0gdW5kZWZpbmVkID8gdm0ubGVnZW5kOiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodm0uc2VyaWVzICYmIHZtLnNlcmllcy5sZW5ndGggPiBjb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHZtLnNlcmllcy5zbGljZSgwLCA5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdwaWVDaGFydC5zZXJpZXMnLCBmdW5jdGlvbiAobmV3VmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IG5ld1ZhbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtLmRhdHVtKHZtLmRhdGEpLmNhbGwoY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChyZXNpemVUaXRsZUxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZXRzIGNvbG9ycyBvZiBpdGVtc1xyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICg8YW55PmQzLnNjYWxlKS5wYWxldHRlQ29sb3JzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5zY2FsZS5vcmRpbmFsKCkucmFuZ2UoY29sb3JzLm1hcChtYXRlcmlhbENvbG9yVG9SZ2JhKSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSW5zdGFudGlhdGUgY2hhcnRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbnYuYWRkR3JhcGgoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbnYubW9kZWxzLnBpZUNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbih7IHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogMCB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAueChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLmRvbnV0ID8gZC52YWx1ZSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodCh2bS5zaXplIHx8IDI1MClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHZtLnNpemUgfHwgMjUwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvd0xhYmVscyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubGFiZWxUaHJlc2hvbGQoLjAwMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmdyb3dPbkhvdmVyKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9udXQodm0uZG9udXQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kb251dFJhdGlvKDAuNSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbG9yKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmNvbG9yIHx8ICg8YW55PmQzLnNjYWxlKS5wYWxldHRlQ29sb3JzKCkucmFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnRvb2x0aXAuZW5hYmxlZChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQubm9EYXRhKCdUaGVyZSBpcyBubyBkYXRhIHJpZ2h0IG5vdy4uLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnNob3dMZWdlbmQoZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0gPSBkMy5zZWxlY3QoJGVsZW1lbnQuZ2V0KDApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCcucGllLWNoYXJ0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdoZWlnaHQnLCAodm0uc2l6ZSB8fCAyNTApICsgJ3B4JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCd3aWR0aCcsIHZtLmNlbnRlcmVkID8gJzEwMCUnIDogKHZtLnNpemUgfHwgMjUwKSArICdweCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ3N2ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bSh2bS5kYXRhIHx8IFtdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChjaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChyZXNpemVUaXRsZUxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyQ2hhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xyXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN2Z0VsZW0gID0gZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJUb3RhbExhYmVsKHN2Z0VsZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3Qoc3ZnRWxlbSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50cmFuc2l0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbigxMDAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChyZXNpemVUaXRsZUxhYmVsVW53cmFwLCA4MDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJDaGFydCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZShzdmdFbGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRyYXdFbXB0eVN0YXRlKHN2Zykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJGVsZW1lbnQuZmluZCgndGV4dC5udi1ub0RhdGEnKS5nZXQoMCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KCRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpWzBdKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnLnBpcC1lbXB0eS1waWUtdGV4dCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5maW5kKCcucGlwLWVtcHR5LXBpZS10ZXh0JykubGVuZ3RoID09PSAwKSB7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnLnBpZS1jaGFydCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcIjxkaXYgY2xhc3M9J3BpcC1lbXB0eS1waWUtdGV4dCc+VGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaWUgPSBkMy5sYXlvdXQucGllKCkuc29ydChudWxsKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgPSBOdW1iZXIodm0uc2l6ZSB8fCAyNTApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFyYyA9IGQzLnN2Zy5hcmMoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmlubmVyUmFkaXVzKHNpemUgLyAyIC0gMjApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAub3V0ZXJSYWRpdXMoc2l6ZSAvIDIgLSA1Nyk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2VtcHR5LXN0YXRlJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBcInRyYW5zbGF0ZShcIiArIHNpemUgLyAyICsgXCIsXCIgKyBzaXplIC8gMiArIFwiKVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhdGggPSBzdmcuc2VsZWN0QWxsKFwicGF0aFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGEocGllKFsxXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJwYXRoXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJyZ2JhKDAsIDAsIDAsIDAuMDgpXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgPGFueT5hcmMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjZW50ZXJDaGFydCgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodm0uY2VudGVyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN2Z0VsZW0gID0gZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0TWFyZ2luID0gJChzdmdFbGVtKS5pbm5lcldpZHRoKCkgLyAyIC0gKHZtLnNpemUgfHwgMjUwKSAvIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgkZWxlbWVudC5maW5kKCcubnYtcGllQ2hhcnQnKVswXSkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbGVmdE1hcmdpbiArICcsIDApJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlbmRlclRvdGFsTGFiZWwoc3ZnRWxlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoIXZtLnRvdGFsICYmICF2bS5kb251dCkgfHwgIXZtLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdGFsVmFsID0gdm0uZGF0YS5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgY3Vycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VtICsgY3Vyci52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdGFsVmFsID49IDEwMDAwKSB0b3RhbFZhbCA9ICh0b3RhbFZhbCAvIDEwMDApLnRvRml4ZWQoMSkgKyAnayc7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHN2Z0VsZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5udi1waWU6bm90KC5udmQzKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnbGFiZWwtdG90YWwnLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdkb21pbmFudC1iYXNlbGluZScsICdjZW50cmFsJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQodG90YWxWYWwpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aXRsZUVsZW0gPSBkMy5zZWxlY3QoJGVsZW1lbnQuZmluZCgndGV4dC5sYWJlbC10b3RhbCcpLmdldCgwKSkuc3R5bGUoJ29wYWNpdHknLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiByZXNpemVUaXRsZUxhYmVsVW53cmFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoIXZtLnRvdGFsICYmICF2bS5kb251dCkgfHwgIXZtLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJveFNpemUgPSAgJGVsZW1lbnQuZmluZCgnLm52ZDMubnYtcGllQ2hhcnQnKS5nZXQoMCkuZ2V0QkJveCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJveFNpemUud2lkdGggfHwgIWJveFNpemUuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlRWxlbS5zdHlsZSgnZm9udC1zaXplJywgfn5ib3hTaXplLndpZHRoIC8gNC41KS5zdHlsZSgnb3BhY2l0eScsIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogQ29udmVydHMgcGFsZXR0ZSBjb2xvciBuYW1lIGludG8gUkdCQSBjb2xvciByZXByZXNlbnRhdGlvbi5cclxuICAgICAgICAgICAgICAgICAqIFNob3VsZCBieSByZXBsYWNlZCBieSBwYWxldHRlIGZvciBjaGFydHMuXHJcbiAgICAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yICAgIE5hbWUgb2YgY29sb3IgZnJvbSBBTSBwYWxldHRlXHJcbiAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSR0JhIGZvcm1hdFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdyZ2JhKCcgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMF0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMV0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMl0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAoJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzNdIHx8IDEpICsgJyknO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSGVscGZ1bCBtZXRob2RcclxuICAgICAgICAgICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldE1hdGVyaWFsQ29sb3IoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbG9ycyB8fCBjb2xvcnMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBjb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSGVscGZ1bCBtZXRob2RcclxuICAgICAgICAgICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2bS5kYXRhKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0uY29sb3IgfHwgZ2V0TWF0ZXJpYWxDb2xvcihpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdiYXIvYmFyX2NoYXJ0Lmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwiYmFyLWNoYXJ0XCI+PHN2Zz48L3N2Zz48L2Rpdj48cGlwLWNoYXJ0LWxlZ2VuZCBwaXAtc2VyaWVzPVwiYmFyQ2hhcnQubGVnZW5kXCIgcGlwLWludGVyYWN0aXZlPVwiYmFyQ2hhcnQuaW50ZXJhY3RpdmVMZWdlbmRcIj48L3BpcC1jaGFydC1sZWdlbmQ+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbGVnZW5kL2ludGVyYWN0aXZlX2xlZ2VuZC5odG1sJyxcbiAgICAnPGRpdj48ZGl2IGNsYXNzPVwiY2hhcnQtbGVnZW5kLWl0ZW1cIiBuZy1yZXBlYXQ9XCJpdGVtIGluIHNlcmllc1wiIG5nLXNob3c9XCJpdGVtLnZhbHVlcyB8fCBpdGVtLnZhbHVlXCI+PG1kLWNoZWNrYm94IGNsYXNzPVwibHAxNiBtOFwiIG5nLW1vZGVsPVwiaXRlbS5kaXNhYmxlZFwiIG5nLXRydWUtdmFsdWU9XCJmYWxzZVwiIG5nLWZhbHNlLXZhbHVlPVwidHJ1ZVwiIG5nLWlmPVwiaW50ZXJhY3RpdmVcIiBhcmlhLWxhYmVsPVwie3sgaXRlbS5sYWJlbCB9fVwiPjxwIGNsYXNzPVwibGVnZW5kLWl0ZW0tdmFsdWVcIiBuZy1pZj1cIml0ZW0udmFsdWVcIiBuZy1zdHlsZT1cIntcXCdiYWNrZ3JvdW5kLWNvbG9yXFwnOiBpdGVtLmNvbG9yfVwiPnt7IGl0ZW0udmFsdWUgfX08L3A+PHAgY2xhc3M9XCJsZWdlbmQtaXRlbS1sYWJlbFwiPnt7OjogaXRlbS5sYWJlbCB8fCBpdGVtLmtleSB9fTwvcD48L21kLWNoZWNrYm94PjxkaXYgbmctaWY9XCIhaW50ZXJhY3RpdmVcIj48c3BhbiBjbGFzcz1cImJ1bGxldFwiIG5nLXN0eWxlPVwie1xcJ2JhY2tncm91bmQtY29sb3JcXCc6IGl0ZW0uY29sb3J9XCI+PC9zcGFuPiA8c3Bhbj57ezo6IGl0ZW0ubGFiZWwgfHwgaXRlbS5rZXl9fTwvc3Bhbj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsaW5lL2xpbmVfY2hhcnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJsaW5lLWNoYXJ0XCIgZmxleD1cImF1dG9cIiBsYXlvdXQ9XCJjb2x1bW5cIj48c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCIgbmctY2xhc3M9XCJ7XFwndmlzaWJsZS14LWF4aXNcXCc6IGxpbmVDaGFydC5pc1Zpc2libGVYKCksIFxcJ3Zpc2libGUteS1heGlzXFwnOiBsaW5lQ2hhcnQuaXNWaXNpYmxlWSgpfVwiPjwvc3ZnPjxkaXYgY2xhc3M9XCJzY3JvbGwtY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cInZpc3VhbC1zY3JvbGxcIj48ZGl2IGNsYXNzPVwic2Nyb2xsZWQtYmxvY2tcIj48L2Rpdj48L2Rpdj48L2Rpdj48bWQtYnV0dG9uIGNsYXNzPVwibWQtZmFiIG1kLW1pbmkgbWludXMtYnV0dG9uXCIgbmctY2xpY2s9XCJsaW5lQ2hhcnQuem9vbU91dCgpXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51cy1jaXJjbGVcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWZhYiBtZC1taW5pIHBsdXMtYnV0dG9uXCIgbmctY2xpY2s9XCJsaW5lQ2hhcnQuem9vbUluKClcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXMtY2lyY2xlXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjwvZGl2PjxwaXAtY2hhcnQtbGVnZW5kIHBpcC1zZXJpZXM9XCJsaW5lQ2hhcnQubGVnZW5kXCIgcGlwLWludGVyYWN0aXZlPVwibGluZUNoYXJ0LmludGVyYWN0aXZlTGVnZW5kXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3BpZS9waWVfY2hhcnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaWUtY2hhcnRcIiBuZy1jbGFzcz1cIntcXCdjaXJjbGVcXCc6ICFwaWVDaGFydC5kb251dH1cIj48c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCI+PC9zdmc+PC9kaXY+PHBpcC1jaGFydC1sZWdlbmQgcGlwLXNlcmllcz1cInBpZUNoYXJ0LmRhdGFcIiBwaXAtaW50ZXJhY3RpdmU9XCJmYWxzZVwiIG5nLWlmPVwicGllQ2hhcnQuc2hvd0xlZ2VuZCgpXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWNoYXJ0cy1odG1sLm1pbi5qcy5tYXBcbiJdfQ==