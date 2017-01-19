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
                    setTimeout(function () { d3.selectAll('.nvtooltip').style('opacity', 0); }, 300);
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
    '<div><div class="chart-legend-item" ng-repeat="item in series" ng-show="item.values || item.value"><md-checkbox ng-model="item.disabled" ng-true-value="false" ng-false-value="true" ng-if="interactive" aria-label="{{ item.label }}"><p class="legend-item-value" ng-if="item.value" ng-style="{\'background-color\': item.color}">{{ item.value }}</p><p class="legend-item-label">{{:: item.label || item.key }}</p></md-checkbox><div ng-if="!interactive"><span class="bullet" ng-style="{\'background-color\': item.color}"></span> <span>{{:: item.label || item.key}}</span></div></div></div>');
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYmFyL2Jhcl9jaGFydC50cyIsInNyYy9jaGFydHMudHMiLCJzcmMvbGVnZW5kL2ludGVyYWN0aXZlX2xlZ2VuZC50cyIsInNyYy9saW5lL2xpbmVfY2hhcnQudHMiLCJzcmMvcGllL3BpZV9jaGFydC50cyIsInRlbXAvcGlwLXdlYnVpLWNoYXJ0cy1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLENBQUM7SUFDRyxZQUFZLENBQUM7SUFTYixPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUM7U0FDN0IsU0FBUyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUUzQztRQUNJLE1BQU0sQ0FBQztZQUNILFFBQVEsRUFBRSxHQUFHO1lBQ2IsS0FBSyxFQUFFO2dCQUNILE1BQU0sRUFBRSxZQUFZO2dCQUNwQixXQUFXLEVBQUUsaUJBQWlCO2dCQUM5QixXQUFXLEVBQUUsaUJBQWlCO2dCQUM5QixpQkFBaUIsRUFBRSxpQkFBaUI7YUFDdkM7WUFDRCxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFlBQVksRUFBRSxVQUFVO1lBQ3hCLFdBQVcsRUFBRSxvQkFBb0I7WUFDakMsVUFBVSxFQUFFLFVBQVUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGVBQWU7Z0JBQ3hFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDZCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDckIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBVSxPQUFPLEVBQUUsS0FBSztvQkFDeEQsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDakIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFN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QUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzFCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3hCLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3hELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDM0MsQ0FBQzs0QkFBQyxJQUFJLENBQUMsQ0FBQztnQ0FDSixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUMzQixTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDdkMsQ0FBQzt3QkFFTCxDQUFDO3dCQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMxQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN4QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dDQUN4RCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzNDLENBQUM7NEJBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMs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O0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG5nZG9jIG1vZHVsZVxyXG4gICAgICogQG5hbWUgcGlwQmFyQ2hhcnRzXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBCYXIgY2hhcnQgb24gdG9wIG9mIFJpY2tzaGF3IGNoYXJ0c1xyXG4gICAgICovXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwQmFyQ2hhcnRzJywgW10pXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgncGlwQmFyQ2hhcnQnLCBwaXBCYXJDaGFydCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGlwQmFyQ2hhcnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNlcmllczogJz1waXBTZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgeFRpY2tGb3JtYXQ6ICc9cGlwWFRpY2tGb3JtYXQnLFxyXG4gICAgICAgICAgICAgICAgeVRpY2tGb3JtYXQ6ICc9cGlwWVRpY2tGb3JtYXQnLFxyXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmVMZWdlbmQ6ICc9cGlwSW50ZXJMZWdlbmQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2JhckNoYXJ0JyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdiYXIvYmFyX2NoYXJ0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQsICRzY29wZSwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJG1kQ29sb3JQYWxldHRlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdm0gPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoYXJ0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGxldCBjaGFydEVsZW0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbG9ycyA9IF8ubWFwKCRtZENvbG9yUGFsZXR0ZSwgZnVuY3Rpb24gKHBhbGV0dGUsIGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb2xvcnMgPSBfLmZpbHRlcihjb2xvcnMsIGZ1bmN0aW9uKGNvbG9yKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5pc09iamVjdCgkbWRDb2xvclBhbGV0dGVbY29sb3JdKSAmJiBfLmlzT2JqZWN0KCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXSAmJiBfLmlzQXJyYXkoJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0ID0gMjcwO1xyXG5cclxuICAgICAgICAgICAgICAgIHZtLmRhdGEgPSBwcmVwYXJlRGF0YSh2bS5zZXJpZXMpIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgdm0ubGVnZW5kID0gXy5jbG9uZSh2bS5zZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoKHZtLnNlcmllcyB8fCBbXSkubGVuZ3RoID4gY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEgPSB2bS5zZXJpZXMuc2xpY2UoMCwgOSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICg8YW55PmQzLnNjYWxlKS5wYWxldHRlQ29sb3JzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5zY2FsZS5vcmRpbmFsKCkucmFuZ2UoY29sb3JzLm1hcChtYXRlcmlhbENvbG9yVG9SZ2JhKSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goJ2JhckNoYXJ0LnNlcmllcycsIGZ1bmN0aW9uICh1cGRhdGVkU2VyaWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHVwZGF0ZWRTZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmxlZ2VuZCA9IF8uY2xvbmUodm0uc2VyaWVzKTtcclxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0uZGF0dW0odm0uZGF0YSkuY2FsbChjaGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ0JhcldpZHRoQW5kTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdiYXJDaGFydC5sZWdlbmQnLCBmdW5jdGlvbih1cGRhdGVkTGVnZW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHVwZGF0ZWRMZWdlbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmxlZ2VuZCA9IHVwZGF0ZWRMZWdlbmQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0uZGF0dW0odm0uZGF0YSkuY2FsbChjaGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ0JhcldpZHRoQW5kTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcmVwYXJlRGF0YShkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIF8uZWFjaChkYXRhLCAoc2VyaWEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzZXJpYS5kaXNhYmxlZCAmJiBzZXJpYS52YWx1ZXMpIHJlc3VsdC5wdXNoKHNlcmlhKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uY2xvbmVEZWVwKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBJbnN0YW50aWF0ZSBjaGFydFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBudi5hZGRHcmFwaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQgPSBudi5tb2RlbHMuZGlzY3JldGVCYXJDaGFydCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4oe3RvcDogMTAsIHJpZ2h0OiAwLCBib3R0b206IDEwLCBsZWZ0OiA1MH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmxhYmVsIHx8IGQua2V5IHx8IGQueDsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnkoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQudmFsdWU7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93VmFsdWVzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdGFnZ2VyTGFiZWxzKHRydWUpIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvd1hBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93WUF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnZhbHVlRm9ybWF0KDxhbnk+ZDMuZm9ybWF0KCdkJykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbigwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbG9yKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS5kYXRhW2Quc2VyaWVzXS5jb2xvciB8fCBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tkLnNlcmllc10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQudG9vbHRpcC5lbmFibGVkKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFydC5ub0RhdGEoJ1RoZXJlIGlzIG5vIGRhdGEgcmlnaHQgbm93Li4uJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnlBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0ueVRpY2tGb3JtYXQgPyB2bS55VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydC54QXhpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLnhUaWNrRm9ybWF0ID8gdm0ueFRpY2tGb3JtYXQoZCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtID0gZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnLmJhci1jaGFydCBzdmcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0dW0odm0uZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdoZWlnaHQnLCAnMjg1cHgnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChjaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnQmFyV2lkdGhBbmRMYWJlbCgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGFydDtcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoY29uZmlnQmFyV2lkdGhBbmRMYWJlbCwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRyYXdFbXB0eVN0YXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5maW5kKCcubnYtbm9EYXRhJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgkZWxlbWVudC5maW5kKCcuZW1wdHktc3RhdGUnKVswXSkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGcgPSBjaGFydEVsZW0uYXBwZW5kKCdnJykuY2xhc3NlZCgnZW1wdHktc3RhdGUnLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gJGVsZW1lbnQuZmluZCgnLm52ZDMtc3ZnJykuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luID0gd2lkdGggKiAwLjE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmdiYSgwLCAwLCAwLCAwLjA4KScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgLSAxMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIDM4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDQyLCA2MCknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JnYmEoMCwgMCwgMCwgMC4wOCknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgMjAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZy5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoODQsIDE2MCknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JnYmEoMCwgMCwgMCwgMC4wOCknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgMTAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAoNTAgKyBtYXJnaW4pICsgJywgMCksICcgKyAnc2NhbGUoJyArICgod2lkdGggLSAyKm1hcmdpbikgLyAxMjYpICsgJywgMSknICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogQWxpZ25zIHZhbHVlIGxhYmVsIGFjY29yZGluZyB0byBwYXJlbnQgY29udGFpbmVyIHNpemUuXHJcbiAgICAgICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjb25maWdCYXJXaWR0aEFuZExhYmVsKHRpbWVvdXQ6IG51bWJlciA9IDEwMDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWxzID0gJGVsZW1lbnQuZmluZCgnLm52LWJhciB0ZXh0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0QmFycyA9ICRlbGVtZW50LmZpbmQoJy5udi1iYXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SGVpZ2h0ID0gKDxhbnk+JGVsZW1lbnQuZmluZCgnLm52ZDMtc3ZnJylbMF0pLmdldEJCb3goKS5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgkZWxlbWVudC5maW5kKCcuYmFyLWNoYXJ0JylbMF0pLmNsYXNzZWQoJ3Zpc2libGUnLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRCYXJzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiYXJIZWlnaHQgPSBOdW1iZXIoZDMuc2VsZWN0KDxhbnk+aXRlbSkuc2VsZWN0KCdyZWN0JykuYXR0cignaGVpZ2h0JykpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGggPSBOdW1iZXIoZDMuc2VsZWN0KDxhbnk+aXRlbSkuc2VsZWN0KCdyZWN0JykuYXR0cignd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZDMuc2VsZWN0KDxhbnk+aXRlbSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gZDMudHJhbnNmb3JtKGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJykpLnRyYW5zbGF0ZVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgPSBkMy50cmFuc2Zvcm0oZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nKSkudHJhbnNsYXRlWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE51bWJlcih4ICsgaW5kZXggKiAoYmFyV2lkdGggKyAxNSkpICsgJywgJyArIChoZWlnaHQgLSAyMCkgKyAnKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdyZWN0JykuYXR0cignaGVpZ2h0JywgMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZHVyYXRpb24odGltZW91dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBOdW1iZXIoeCArIGluZGV4ICogKGJhcldpZHRoICsgMTUpKSArICcsICcgKyB5ICsgJyknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgncmVjdCcpLmF0dHIoJ2hlaWdodCcsIGJhckhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QobGFiZWxzW2luZGV4XSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIGJhckhlaWdodCAvIDIgKyAxMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgYmFyV2lkdGggLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIENvbnZlcnRzIHBhbGV0dGUgY29sb3IgbmFtZSBpbnRvIFJHQkEgY29sb3IgcmVwcmVzZW50YXRpb24uXHJcbiAgICAgICAgICAgICAgICAgKiBTaG91bGQgYnkgcmVwbGFjZWQgYnkgcGFsZXR0ZSBmb3IgY2hhcnRzLlxyXG4gICAgICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAgICBOYW1lIG9mIGNvbG9yIGZyb20gQU0gcGFsZXR0ZVxyXG4gICAgICAgICAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gUkdCYSBmb3JtYXRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gbWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAncmdiYSgnICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzBdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzFdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzJdICsgJywnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgKCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVszXSB8fCAxKSArICcpJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEhlbHBmdWwgbWV0aG9kXHJcbiAgICAgICAgICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZXRNYXRlcmlhbENvbG9yKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb2xvcnMgfHwgY29sb3JzLmxlbmd0aCA8IDEpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcnNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEhlbHBmdWwgbWV0aG9kXHJcbiAgICAgICAgICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdm0uZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2bS5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnZhbHVlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS52YWx1ZXNbMF0uY29sb3IgPSBpdGVtLnZhbHVlc1swXS5jb2xvciB8fCBnZXRNYXRlcmlhbENvbG9yKGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY29sb3IgPSBpdGVtLnZhbHVlc1swXS5jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCLvu78vKipcclxuICogQGZpbGUgUmVnaXN0cmF0aW9uIG9mIGNoYXJ0IFdlYlVJIGNvbnRyb2xzXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqL1xyXG5cclxuLyogZ2xvYmFsIGFuZ3VsYXIgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cycsIFtcclxuICAgICAgICAncGlwQmFyQ2hhcnRzJyxcclxuICAgICAgICAncGlwTGluZUNoYXJ0cycsXHJcbiAgICAgICAgJ3BpcFBpZUNoYXJ0cycsXHJcbiAgICAgICAgJ3BpcENoYXJ0TGVnZW5kcycsXHJcbiAgICAgICAgJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnXHJcbiAgICBdKTtcclxuXHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG5nZG9jIG1vZHVsZVxyXG4gICAgICogQG5hbWUgcGlwTGVnZW5kc1xyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogTGVnZW5kIG9mIGNoYXJ0c1xyXG4gICAgICovXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRMZWdlbmRzJywgW10pXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgncGlwQ2hhcnRMZWdlbmQnLCBwaXBDaGFydExlZ2VuZCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGlwQ2hhcnRMZWdlbmQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNlcmllczogJz1waXBTZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmU6ICc9cGlwSW50ZXJhY3RpdmUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbGVnZW5kL2ludGVyYWN0aXZlX2xlZ2VuZC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbWRDb2xvclBhbGV0dGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb2xvcnMgPSBfLm1hcCgkbWRDb2xvclBhbGV0dGUsIGZ1bmN0aW9uIChwYWxldHRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhbGV0dGVbNTAwXS5oZXg7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvbG9ycyA9IF8uZmlsdGVyKGNvbG9ycywgZnVuY3Rpb24oY29sb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvciAhPT0gdW5kZWZpbmVkICYmIGNvbG9yICE9PSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSk7ICBcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvbG9yQ2hlY2tib3hlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hlY2tib3hDb250YWluZXJzID0gJCgkZWxlbWVudCkuZmluZCgnbWQtY2hlY2tib3ggLm1kLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGVja2JveENvbnRhaW5lcnMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID49ICRzY29wZS5zZXJpZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJChpdGVtKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnY29sb3InLCAkc2NvcGUuc2VyaWVzW2luZGV4XS5jb2xvciB8fCBjb2xvcnNbaW5kZXhdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoJy5tZC1pY29uJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAkc2NvcGUuc2VyaWVzW2luZGV4XS5jb2xvciB8fCBjb2xvcnNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBhbmltYXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsZWdlbmRUaXRsZXMgPSAkKCRlbGVtZW50KS5maW5kKCcuY2hhcnQtbGVnZW5kLWl0ZW0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kVGl0bGVzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3Zpc2libGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMjAwICogaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcmVwYXJlU2VyaWVzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLnNlcmllcykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2VyaWVzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY29sb3IgPSBpdGVtLmNvbG9yIHx8IChpdGVtLnZhbHVlcyAmJiBpdGVtLnZhbHVlc1swXSAmJiBpdGVtLnZhbHVlc1swXS5jb2xvciA/IGl0ZW0udmFsdWVzWzBdLmNvbG9yIDogY29sb3JzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGlzYWJsZWQgPSBpdGVtLmRpc2FibGVkIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pOyAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goJ3NlcmllcycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3JDaGVja2JveGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlcGFyZVNlcmllcygpO1xyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnaW50ZXJhY3RpdmUnLCBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlID09IHRydWUgJiYgbmV3VmFsdWUgIT0gb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoY29sb3JDaGVja2JveGVzLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yQ2hlY2tib3hlcygpO1xyXG4gICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgICAgICBwcmVwYXJlU2VyaWVzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2MgbW9kdWxlXHJcbiAgICAgKiBAbmFtZSBwaXBMaW5lQ2hhcnRzXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBMaW5lIGNoYXJ0IG9uIHRvcCBvZiBSaWNrc2hhdyBjaGFydHNcclxuICAgICAqL1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcExpbmVDaGFydHMnLCBbXSlcclxuICAgICAgICAuZGlyZWN0aXZlKCdwaXBMaW5lQ2hhcnQnLCBwaXBMaW5lQ2hhcnQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHBpcExpbmVDaGFydCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAnPXBpcFNlcmllcycsXHJcbiAgICAgICAgICAgICAgICBzaG93WUF4aXM6ICc9cGlwWUF4aXMnLFxyXG4gICAgICAgICAgICAgICAgc2hvd1hBeGlzOiAnPXBpcFhBeGlzJyxcclxuICAgICAgICAgICAgICAgIHhGb3JtYXQ6ICc9cGlwWEZvcm1hdCcsXHJcbiAgICAgICAgICAgICAgICB4VGlja0Zvcm1hdDogJz1waXBYVGlja0Zvcm1hdCcsXHJcbiAgICAgICAgICAgICAgICB5VGlja0Zvcm1hdDogJz1waXBZVGlja0Zvcm1hdCcsXHJcbiAgICAgICAgICAgICAgICBkeW5hbWljOiAnPXBpcER5bmFtaWMnLFxyXG4gICAgICAgICAgICAgICAgZml4ZWRIZWlnaHQ6ICdAcGlwRGlhZ3JhbUhlaWdodCcsXHJcbiAgICAgICAgICAgICAgICBkeW5hbWljSGVpZ2h0OiAnQHBpcER5bmFtaWNIZWlnaHQnLFxyXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0OiAnQHBpcE1pbkhlaWdodCcsXHJcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6ICdAcGlwTWF4SGVpZ2h0JyxcclxuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiAnPXBpcEludGVyTGVnZW5kJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdsaW5lQ2hhcnQnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2xpbmUvbGluZV9jaGFydC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkaW50ZXJ2YWwsICRtZENvbG9yUGFsZXR0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZtICAgICAgICA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hhcnQgICAgID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciBjaGFydEVsZW0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNldFpvb20gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIHVwZGF0ZVpvb21PcHRpb25zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciBmaXhlZEhlaWdodCA9IHZtLmZpeGVkSGVpZ2h0IHx8IDI3MDtcclxuICAgICAgICAgICAgICAgIHZhciBkeW5hbWljSGVpZ2h0ID0gdm0uZHluYW1pY0hlaWdodCB8fCBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhciBtaW5IZWlnaHQgPSB2bS5taW5IZWlnaHQgfHwgZml4ZWRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWF4SGVpZ2h0ID0gdm0ubWF4SGVpZ2h0IHx8IGZpeGVkSGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBmaWx0ZXJlZENvbG9yID0gXy5maWx0ZXIoJG1kQ29sb3JQYWxldHRlLCBmdW5jdGlvbihwYWxldHRlLCBjb2xvcil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNPYmplY3QoY29sb3IpICYmIF8uaXNPYmplY3QoY29sb3JbNTAwXSAmJiBfLmlzQXJyYXkoY29sb3JbNTAwXS52YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sb3JzID0gXy5tYXAoZmlsdGVyZWRDb2xvciwgZnVuY3Rpb24gKHBhbGV0dGUsIGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb2xvcnMgPSBfLmZpbHRlcihjb2xvcnMsIGZ1bmN0aW9uKGNvbG9yKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5pc09iamVjdCgkbWRDb2xvclBhbGV0dGVbY29sb3JdKSAmJiBfLmlzT2JqZWN0KCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXSAmJiBfLmlzQXJyYXkoJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZtLmRhdGEgPSBwcmVwYXJlRGF0YSh2bS5zZXJpZXMpIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgdm0ubGVnZW5kID0gXy5jbG9uZSh2bS5zZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgdm0uc291cmNlRXZlbnRzID0gW107XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHZtLmlzVmlzaWJsZVggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLnNob3dYQXhpcyA9PSB1bmRlZmluZWQgPyB0cnVlIDogdm0uc2hvd1hBeGlzOyBcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdm0uaXNWaXNpYmxlWSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0uc2hvd1lBeGlzID09IHVuZGVmaW5lZCA/IHRydWUgOiB2bS5zaG93WUF4aXM7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZtLnpvb21JbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0Wm9vbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRab29tKCdpbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdm0uem9vbU91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0Wm9vbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRab29tKCdvdXQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAodm0uc2VyaWVzICYmIHZtLnNlcmllcy5sZW5ndGggPiBjb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHZtLnNlcmllcy5zbGljZSgwLCA5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZXRzIGNvbG9ycyBvZiBpdGVtc1xyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICg8YW55PmQzLnNjYWxlKS5wYWxldHRlQ29sb3JzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5zY2FsZS5vcmRpbmFsKCkucmFuZ2UoY29sb3JzLm1hcChtYXRlcmlhbENvbG9yVG9SZ2JhKSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goJ2xpbmVDaGFydC5zZXJpZXMnLCBmdW5jdGlvbiAodXBkYXRlZFNlcmllcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEgPSBwcmVwYXJlRGF0YSh1cGRhdGVkU2VyaWVzKTtcclxuICAgICAgICAgICAgICAgICAgICB2bS5sZWdlbmQgPSBfLmNsb25lKHZtLnNlcmllcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5kYXR1bSh2bS5kYXRhIHx8IFtdKS5jYWxsKGNoYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVab29tT3B0aW9ucykgdXBkYXRlWm9vbU9wdGlvbnModm0uZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnbGluZUNoYXJ0LmxlZ2VuZCcsIGZ1bmN0aW9uKHVwZGF0ZWRMZWdlbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS5kYXRhID0gcHJlcGFyZURhdGEodXBkYXRlZExlZ2VuZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubGVnZW5kID0gdXBkYXRlZExlZ2VuZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5kYXR1bSh2bS5kYXRhIHx8IFtdKS5jYWxsKGNoYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVab29tT3B0aW9ucykgdXBkYXRlWm9vbU9wdGlvbnModm0uZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge2QzLnNlbGVjdEFsbCgnLm52dG9vbHRpcCcpLnN0eWxlKCdvcGFjaXR5JywgMCk7IH0sIDMwMClcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBhcmVEYXRhKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgXy5lYWNoKGRhdGEsIChzZXJpYSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlcmlhLmRpc2FibGVkICYmIHNlcmlhLnZhbHVlcykgcmVzdWx0LnB1c2goc2VyaWEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5jbG9uZURlZXAocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZ2V0SGVpZ2h0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkeW5hbWljSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoZWlndGggPSBNYXRoLm1pbihNYXRoLm1heChtaW5IZWlnaHQsICRlbGVtZW50LnBhcmVudCgpLmlubmVySGVpZ2h0KCkpLCBtYXhIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGVpZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaXhlZEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSW5zdGFudGlhdGUgY2hhcnRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbnYuYWRkR3JhcGgoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbnYubW9kZWxzLmxpbmVDaGFydCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4oeyB0b3A6IDIwLCByaWdodDogMjAsIGJvdHRvbTogMzAsIGxlZnQ6IDMwIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGQgIT09IHVuZGVmaW5lZCAmJiBkLnggIT09IHVuZGVmaW5lZCkgPyAodm0ueEZvcm1hdCA/IHZtLnhGb3JtYXQoZC54KSA6IGQueCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAueShmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChkICE9PSB1bmRlZmluZWQgJiYgZC52YWx1ZSAhPT0gdW5kZWZpbmVkKSA/IGQudmFsdWUgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGdldEhlaWdodCgpIC0gNTApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC51c2VJbnRlcmFjdGl2ZUd1aWRlbGluZSh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvd1hBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93WUF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNob3dMZWdlbmQoZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb2xvcihmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5jb2xvciB8fCAoPGFueT5kMy5zY2FsZSkucGFsZXR0ZUNvbG9ycygpLnJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydC50b29sdGlwLmVuYWJsZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0Lm5vRGF0YSgnVGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQueUF4aXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS55VGlja0Zvcm1hdCA/IHZtLnlUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnhBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0ueFRpY2tGb3JtYXQgPyB2bS54VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0gPSBkMy5zZWxlY3QoJGVsZW1lbnQuZ2V0KDApKS5zZWxlY3QoJy5saW5lLWNoYXJ0IHN2ZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5kYXR1bSh2bS5kYXRhIHx8IFtdKS5zdHlsZSgnaGVpZ2h0JywgKGdldEhlaWdodCgpIC0gNTApICsgJ3B4JykuY2FsbChjaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2bS5keW5hbWljKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFpvb20oY2hhcnQsIGNoYXJ0RWxlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBudi51dGlscy53aW5kb3dSZXNpemUoKCkgPT4geyBvblJlc2l6ZSgpOyB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbigncGlwTWFpblJlc2l6ZWQnLCAoKSA9PiB7IG9uUmVzaXplKCk7IH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hhcnQ7XHJcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzaXplKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmhlaWdodChnZXRIZWlnaHQoKSAtIDUwKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0uc3R5bGUoJ2hlaWdodCcsIChnZXRIZWlnaHQoKSAtIDUwKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZHJhd0VtcHR5U3RhdGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkZWxlbWVudC5maW5kKCd0ZXh0Lm52LW5vRGF0YScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJylbMF0pLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb250YWluZXJXaWR0aCA9ICRlbGVtZW50LmZpbmQoJy5saW5lLWNoYXJ0JykuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGVsZW1lbnQuZmluZCgnLmxpbmUtY2hhcnQnKS5pbm5lckhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnaW1hZ2UnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIChjb250YWluZXJXaWR0aCAvIDExNTEpICsgJywnICsgKGNvbnRhaW5lckhlaWdodCAvIDIxNikgKyAnKScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImRlZnNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwicGF0dGVyblwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBcIjBcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgXCIwXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJpZFwiLCBcImJnXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImltYWdlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCAxNylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneScsIDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIFwiMjE2cHhcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBcIjExNTFweFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIChjb250YWluZXJXaWR0aCAvIDExNTEpICsgJywnICsgKGNvbnRhaW5lckhlaWdodCAvIDIxNikgKyAnKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4bGluazpocmVmXCIsIFwiaW1hZ2VzL2xpbmVfY2hhcnRfZW1wdHlfc3RhdGUuc3ZnXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdlbXB0eS1zdGF0ZScsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIFwiMTAwJVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIFwiMTAwJVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ3VybCgjYmcpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlU2Nyb2xsKGRvbWFpbnMsIGJvdW5kYXJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJEaWZmID0gYm91bmRhcnlbMV0gLSBib3VuZGFyeVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tRGlmZiA9IGRvbWFpbnNbMV0gLSBkb21haW5zWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gKGRvbWFpbnNbMV0gLSBkb21haW5zWzBdKS9iRGlmZiA9PT0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgkZWxlbWVudFswXSkuZmluZCgnLnZpc3VhbC1zY3JvbGwnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCdvcGFjaXR5JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzRXF1YWwgPyAwIDogMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0VxdWFsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgJCgkZWxlbWVudFswXSkuZmluZCgnLnNjcm9sbGVkLWJsb2NrJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkb21haW5zWzBdL2JEaWZmICogMTAwICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCd3aWR0aCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkb21EaWZmL2JEaWZmICogMTAwICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBhZGRab29tKGNoYXJ0LCBzdmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZUV4dGVudFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzY2FsZUV4dGVudCA9IDQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeUF4aXMgICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB4QXhpcyAgICAgICA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHhEb21haW4gICAgID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeURvbWFpbiAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWRyYXcgICAgICA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN2ZyAgICAgICAgID0gc3ZnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZXNcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeFNjYWxlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeVNjYWxlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWluL21heCBib3VuZGFyaWVzXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHhfYm91bmRhcnkgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB5X2JvdW5kYXJ5ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGQzIHpvb20gaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkM3pvb20gPSBkMy5iZWhhdmlvci56b29tKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZYRG9tYWluID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJldlNjYWxlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJldlRyYW5zbGF0ZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldERhdGEoY2hhcnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXREYXRhKG5ld0NoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgeUF4aXMgICAgICAgPSBuZXdDaGFydC55QXhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXMgICAgICAgPSBuZXdDaGFydC54QXhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgeERvbWFpbiAgICAgPSBuZXdDaGFydC54RG9tYWluIHx8IHhBeGlzLnNjYWxlKCkuZG9tYWluO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5RG9tYWluICAgICA9IG5ld0NoYXJ0LnlEb21haW4gfHwgeUF4aXMuc2NhbGUoKS5kb21haW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZHJhdyAgICAgID0gbmV3Q2hhcnQudXBkYXRlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2NhbGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhTY2FsZSA9IHhBeGlzLnNjYWxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlTY2FsZSA9IHlBeGlzLnNjYWxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtaW4vbWF4IGJvdW5kYXJpZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgeF9ib3VuZGFyeSA9IHhBeGlzLnNjYWxlKCkuZG9tYWluKCkuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeV9ib3VuZGFyeSA9IHlBeGlzLnNjYWxlKCkuZG9tYWluKCkuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBkMyB6b29tIGhhbmRsZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlhEb21haW4gPSB4X2JvdW5kYXJ5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2U2NhbGUgPSBkM3pvb20uc2NhbGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlRyYW5zbGF0ZSA9IGQzem9vbS50cmFuc2xhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSBuaWNlIGF4aXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgeFNjYWxlLm5pY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeVNjYWxlLm5pY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpeCBkb21haW5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBmaXhEb21haW4oZG9tYWluLCBib3VuZGFyeSwgc2NhbGUsIHRyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9tYWluWzBdIDwgYm91bmRhcnlbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblswXSA9IGJvdW5kYXJ5WzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZYRG9tYWluWzBdICE9PSBib3VuZGFyeVswXSB8fCBzY2FsZSAhPT0gcHJldlNjYWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzFdICs9IChib3VuZGFyeVswXSAtIGRvbWFpblswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblsxXSA9IHByZXZYRG9tYWluWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSA9IF8uY2xvbmUocHJldlRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb21haW5bMV0gPiBib3VuZGFyeVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzFdID0gYm91bmRhcnlbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldlhEb21haW5bMV0gIT09IGJvdW5kYXJ5WzFdIHx8IHNjYWxlICE9PSBwcmV2U2NhbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21haW5bMF0gLT0gKGRvbWFpblsxXSAtIGJvdW5kYXJ5WzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdID0gcHJldlhEb21haW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gXy5jbG9uZShwcmV2VHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLnRyYW5zbGF0ZSh0cmFuc2xhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2WERvbWFpbiA9IF8uY2xvbmUoZG9tYWluKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlNjYWxlID0gXy5jbG9uZShzY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZUcmFuc2xhdGUgPSBfLmNsb25lKHRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkb21haW47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVDaGFydCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLnNjYWxlKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFswLDBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeFNjYWxlLmRvbWFpbih4X2JvdW5kYXJ5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKS55KHlTY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5jYWxsKGQzem9vbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyB6b29tIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiB6b29tZWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN3aXRjaCBvZmYgdmVydGljYWwgem9vbWluZyB0ZW1wb3JhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geURvbWFpbih5U2NhbGUuZG9tYWluKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCg8YW55PmQzLmV2ZW50KS5zY2FsZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW56b29tZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4RG9tYWluKGZpeERvbWFpbih4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnksICg8YW55PmQzLmV2ZW50KS5zY2FsZSwgKDxhbnk+ZDMuZXZlbnQpLnRyYW5zbGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkcmF3KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVNjcm9sbCh4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgICAgICBzZXRab29tID0gZnVuY3Rpb24od2hpY2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNlbnRlcjAgPSBbc3ZnWzBdWzBdLmdldEJCb3goKS53aWR0aCAvIDIsIHN2Z1swXVswXS5nZXRCQm94KCkuaGVpZ2h0IC8gMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2xhdGUwID0gZDN6b29tLnRyYW5zbGF0ZSgpLCBjb29yZGluYXRlczAgPSBjb29yZGluYXRlcyhjZW50ZXIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aGljaCA9PT0gJ2luJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZTY2FsZSA8IHNjYWxlRXh0ZW50KSBkM3pvb20uc2NhbGUocHJldlNjYWxlICsgMC4yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2U2NhbGUgPiAxKSBkM3pvb20uc2NhbGUocHJldlNjYWxlIC0gMC4yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNlbnRlcjEgPSBwb2ludChjb29yZGluYXRlczApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFt0cmFuc2xhdGUwWzBdICsgY2VudGVyMFswXSAtIGNlbnRlcjFbMF0sIHRyYW5zbGF0ZTBbMV0gKyBjZW50ZXIwWzFdIC0gY2VudGVyMVsxXV0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLmV2ZW50KHN2Zyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gc3RlcCh3aGljaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdoaWNoID09PSAncmlnaHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVbMF0gLT0gMjA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVbMF0gKz0gMjA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUodHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLmV2ZW50KHN2Zyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjb29yZGluYXRlcyhwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NhbGUgPSBkM3pvb20uc2NhbGUoKSwgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWyhwb2ludFswXSAtIHRyYW5zbGF0ZVswXSkgLyBzY2FsZSwgKHBvaW50WzFdIC0gdHJhbnNsYXRlWzFdKSAvIHNjYWxlXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHBvaW50KGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY2FsZSA9IGQzem9vbS5zY2FsZSgpLCB0cmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbY29vcmRpbmF0ZXNbMF0gKiBzY2FsZSArIHRyYW5zbGF0ZVswXSwgY29vcmRpbmF0ZXNbMV0gKiBzY2FsZSArIHRyYW5zbGF0ZVsxXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBrZXlwcmVzcygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoKCg8YW55PmQzLmV2ZW50KS5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM5OiBzdGVwKCdyaWdodCcpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6IHN0ZXAoJ2xlZnQnKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEwNzogc2V0Wm9vbSgnaW4nKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEwOTogc2V0Wm9vbSgnb3V0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHpvb20gZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHVuem9vbWVkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4RG9tYWluKHhfYm91bmRhcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWRyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDN6b29tLnNjYWxlKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFswLDBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlNjYWxlID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlRyYW5zbGF0ZSA9IFswLDBdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB3cmFwcGVyXHJcbiAgICAgICAgICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAueSh5U2NhbGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZUV4dGVudChbMSwgc2NhbGVFeHRlbnRdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ3pvb20nLCB6b29tZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgICAgIHN2Zy5jYWxsKGQzem9vbSkub24oJ2RibGNsaWNrLnpvb20nLCB1bnpvb21lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgkZWxlbWVudC5nZXQoMCkpLmFkZENsYXNzKCdkeW5hbWljJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBrZXlib2FyZCBoYW5kbGVyc1xyXG4gICAgICAgICAgICAgICAgICAgIHN2Z1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZm9jdXNhYmxlJywgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnb3V0bGluZScsICdub25lJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdrZXlkb3duJywga2V5cHJlc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7fSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBnZXRYTWluTWF4ID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWF4VmFsLCBtaW5WYWwgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGF0YVtpXS5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wTWluVmFsID0gZDMubWF4KGRhdGFbaV0udmFsdWVzLCBmdW5jdGlvbihkOiBhbnkpIHsgcmV0dXJuIHZtLnhGb3JtYXQgPyB2bS54Rm9ybWF0KGQueCkgOiBkLng7fSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wTWF4VmFsID0gZDMubWluKGRhdGFbaV0udmFsdWVzLCBmdW5jdGlvbihkOiBhbnkpIHsgcmV0dXJuIHZtLnhGb3JtYXQgPyB2bS54Rm9ybWF0KGQueCkgOiBkLng7fSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblZhbCA9ICghbWluVmFsIHx8IHRlbXBNaW5WYWwgPCBtaW5WYWwpID8gdGVtcE1pblZhbCA6IG1pblZhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWwgPSAoIW1heFZhbCB8fCB0ZW1wTWF4VmFsID4gbWF4VmFsKSA/IHRlbXBNYXhWYWwgOiBtYXhWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttYXhWYWwsIG1pblZhbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlWm9vbU9wdGlvbnMgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlBeGlzID0gY2hhcnQueUF4aXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzID0gY2hhcnQueEF4aXM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4U2NhbGUgPSB4QXhpcy5zY2FsZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5U2NhbGUgPSB5QXhpcy5zY2FsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgeF9ib3VuZGFyeSA9IGdldFhNaW5NYXgoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZDN6b29tLnNjYWxlKCkgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS54KHhTY2FsZSkueSh5U2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVTY3JvbGwoeFNjYWxlLmRvbWFpbigpLCB4X2JvdW5kYXJ5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBDb252ZXJ0cyBwYWxldHRlIGNvbG9yIG5hbWUgaW50byBSR0JBIGNvbG9yIHJlcHJlc2VudGF0aW9uLlxyXG4gICAgICAgICAgICAgICAgICogU2hvdWxkIGJ5IHJlcGxhY2VkIGJ5IHBhbGV0dGUgZm9yIGNoYXJ0cy5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgICAgTmFtZSBvZiBjb2xvciBmcm9tIEFNIHBhbGV0dGVcclxuICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJHQmEgZm9ybWF0XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3JnYmEoJyArICRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVswXSArICcsJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArICRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVsxXSArICcsJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArICRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVsyXSArICcsJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArICgkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbM10gfHwgMSkgKyAnKSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBIZWxwZnVsIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0TWF0ZXJpYWxDb2xvcihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY29sb3JzIHx8IGNvbG9ycy5sZW5ndGggPCAxKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IGNvbG9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3JzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBIZWxwZnVsIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZtLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbG9yID0gaXRlbS5jb2xvciB8fCBnZXRNYXRlcmlhbENvbG9yKGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBtb2R1bGVcclxuICAgICAqIEBuYW1lIHBpcFBpZUNoYXJ0c1xyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogTGluZSBjaGFydCBvbiB0b3Agb2YgUmlja3NoYXcgY2hhcnRzXHJcbiAgICAgKi9cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBQaWVDaGFydHMnLCBbXSlcclxuICAgICAgICAuZGlyZWN0aXZlKCdwaXBQaWVDaGFydCcsIHBpcFBpZUNoYXJ0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBwaXBQaWVDaGFydCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAnPXBpcFNlcmllcycsXHJcbiAgICAgICAgICAgICAgICBkb251dDogJz1waXBEb251dCcsXHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6ICc9cGlwU2hvd0xlZ2VuZCcsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogJz1waXBTaG93VG90YWwnLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTogJz1waXBQaWVTaXplJyxcclxuICAgICAgICAgICAgICAgIGNlbnRlcmVkOiAnPXBpcENlbnRlcmVkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdwaWVDaGFydCcsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGllL3BpZV9jaGFydC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkaW50ZXJ2YWwsICRtZENvbG9yUGFsZXR0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZtICAgICAgICAgICAgICAgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoYXJ0ICAgICAgICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpdGxlRWxlbSAgICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoYXJ0RWxlbSAgICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyAgICAgICAgICAgPSBfLm1hcCgkbWRDb2xvclBhbGV0dGUsIGZ1bmN0aW9uIChwYWxldHRlLCBjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29sb3JzID0gXy5maWx0ZXIoY29sb3JzLCBmdW5jdGlvbihjb2xvcil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNPYmplY3QoJG1kQ29sb3JQYWxldHRlW2NvbG9yXSkgJiYgXy5pc09iamVjdCgkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0gJiYgXy5pc0FycmF5KCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdmFyIHJlc2l6ZVRpdGxlTGFiZWwgPSByZXNpemVUaXRsZUxhYmVsVW53cmFwO1xyXG5cclxuICAgICAgICAgICAgICAgIHZtLmRhdGEgPSB2bS5kYXRhIHx8IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIHZtLnNob3dMZWdlbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLmxlZ2VuZCAhPT0gdW5kZWZpbmVkID8gdm0ubGVnZW5kOiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodm0uc2VyaWVzICYmIHZtLnNlcmllcy5sZW5ndGggPiBjb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHZtLnNlcmllcy5zbGljZSgwLCA5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdwaWVDaGFydC5zZXJpZXMnLCBmdW5jdGlvbiAobmV3VmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IG5ld1ZhbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRFbGVtLmRhdHVtKHZtLmRhdGEpLmNhbGwoY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChyZXNpemVUaXRsZUxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZXRzIGNvbG9ycyBvZiBpdGVtc1xyXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICg8YW55PmQzLnNjYWxlKS5wYWxldHRlQ29sb3JzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5zY2FsZS5vcmRpbmFsKCkucmFuZ2UoY29sb3JzLm1hcChtYXRlcmlhbENvbG9yVG9SZ2JhKSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSW5zdGFudGlhdGUgY2hhcnRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbnYuYWRkR3JhcGgoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbnYubW9kZWxzLnBpZUNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbih7IHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogMCB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAueChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLmRvbnV0ID8gZC52YWx1ZSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodCh2bS5zaXplIHx8IDI1MClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHZtLnNpemUgfHwgMjUwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvd0xhYmVscyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubGFiZWxUaHJlc2hvbGQoLjAwMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmdyb3dPbkhvdmVyKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9udXQodm0uZG9udXQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kb251dFJhdGlvKDAuNSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbG9yKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmNvbG9yIHx8ICg8YW55PmQzLnNjYWxlKS5wYWxldHRlQ29sb3JzKCkucmFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnRvb2x0aXAuZW5hYmxlZChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQubm9EYXRhKCdUaGVyZSBpcyBubyBkYXRhIHJpZ2h0IG5vdy4uLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnNob3dMZWdlbmQoZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFydEVsZW0gPSBkMy5zZWxlY3QoJGVsZW1lbnQuZ2V0KDApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCcucGllLWNoYXJ0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdoZWlnaHQnLCAodm0uc2l6ZSB8fCAyNTApICsgJ3B4JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCd3aWR0aCcsIHZtLmNlbnRlcmVkID8gJzEwMCUnIDogKHZtLnNpemUgfHwgMjUwKSArICdweCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ3N2ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bSh2bS5kYXRhIHx8IFtdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChjaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChyZXNpemVUaXRsZUxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyQ2hhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoYXJ0O1xyXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN2Z0VsZW0gID0gZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJUb3RhbExhYmVsKHN2Z0VsZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3Qoc3ZnRWxlbSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50cmFuc2l0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbigxMDAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChyZXNpemVUaXRsZUxhYmVsVW53cmFwLCA4MDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJDaGFydCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3RW1wdHlTdGF0ZShzdmdFbGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRyYXdFbXB0eVN0YXRlKHN2Zykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJGVsZW1lbnQuZmluZCgndGV4dC5udi1ub0RhdGEnKS5nZXQoMCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KCRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpWzBdKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnLnBpcC1lbXB0eS1waWUtdGV4dCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5maW5kKCcucGlwLWVtcHR5LXBpZS10ZXh0JykubGVuZ3RoID09PSAwKSB7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnLnBpZS1jaGFydCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcIjxkaXYgY2xhc3M9J3BpcC1lbXB0eS1waWUtdGV4dCc+VGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaWUgPSBkMy5sYXlvdXQucGllKCkuc29ydChudWxsKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgPSBOdW1iZXIodm0uc2l6ZSB8fCAyNTApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFyYyA9IGQzLnN2Zy5hcmMoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmlubmVyUmFkaXVzKHNpemUgLyAyIC0gMjApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAub3V0ZXJSYWRpdXMoc2l6ZSAvIDIgLSA1Nyk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2VtcHR5LXN0YXRlJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBcInRyYW5zbGF0ZShcIiArIHNpemUgLyAyICsgXCIsXCIgKyBzaXplIC8gMiArIFwiKVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhdGggPSBzdmcuc2VsZWN0QWxsKFwicGF0aFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGEocGllKFsxXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJwYXRoXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJyZ2JhKDAsIDAsIDAsIDAuMDgpXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgPGFueT5hcmMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjZW50ZXJDaGFydCgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodm0uY2VudGVyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN2Z0VsZW0gID0gZDMuc2VsZWN0KCRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0TWFyZ2luID0gJChzdmdFbGVtKS5pbm5lcldpZHRoKCkgLyAyIC0gKHZtLnNpemUgfHwgMjUwKSAvIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgkZWxlbWVudC5maW5kKCcubnYtcGllQ2hhcnQnKVswXSkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbGVmdE1hcmdpbiArICcsIDApJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlbmRlclRvdGFsTGFiZWwoc3ZnRWxlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoIXZtLnRvdGFsICYmICF2bS5kb251dCkgfHwgIXZtLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdGFsVmFsID0gdm0uZGF0YS5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgY3Vycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VtICsgY3Vyci52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdGFsVmFsID49IDEwMDAwKSB0b3RhbFZhbCA9ICh0b3RhbFZhbCAvIDEwMDApLnRvRml4ZWQoMSkgKyAnayc7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHN2Z0VsZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5udi1waWU6bm90KC5udmQzKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnbGFiZWwtdG90YWwnLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdkb21pbmFudC1iYXNlbGluZScsICdjZW50cmFsJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQodG90YWxWYWwpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aXRsZUVsZW0gPSBkMy5zZWxlY3QoJGVsZW1lbnQuZmluZCgndGV4dC5sYWJlbC10b3RhbCcpLmdldCgwKSkuc3R5bGUoJ29wYWNpdHknLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiByZXNpemVUaXRsZUxhYmVsVW53cmFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoIXZtLnRvdGFsICYmICF2bS5kb251dCkgfHwgIXZtLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJveFNpemUgPSAgJGVsZW1lbnQuZmluZCgnLm52ZDMubnYtcGllQ2hhcnQnKS5nZXQoMCkuZ2V0QkJveCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJveFNpemUud2lkdGggfHwgIWJveFNpemUuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlRWxlbS5zdHlsZSgnZm9udC1zaXplJywgfn5ib3hTaXplLndpZHRoIC8gNC41KS5zdHlsZSgnb3BhY2l0eScsIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogQ29udmVydHMgcGFsZXR0ZSBjb2xvciBuYW1lIGludG8gUkdCQSBjb2xvciByZXByZXNlbnRhdGlvbi5cclxuICAgICAgICAgICAgICAgICAqIFNob3VsZCBieSByZXBsYWNlZCBieSBwYWxldHRlIGZvciBjaGFydHMuXHJcbiAgICAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yICAgIE5hbWUgb2YgY29sb3IgZnJvbSBBTSBwYWxldHRlXHJcbiAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSR0JhIGZvcm1hdFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdyZ2JhKCcgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMF0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMV0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMl0gKyAnLCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyAoJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzNdIHx8IDEpICsgJyknO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSGVscGZ1bCBtZXRob2RcclxuICAgICAgICAgICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldE1hdGVyaWFsQ29sb3IoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbG9ycyB8fCBjb2xvcnMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBjb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSGVscGZ1bCBtZXRob2RcclxuICAgICAgICAgICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2bS5kYXRhKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0uY29sb3IgfHwgZ2V0TWF0ZXJpYWxDb2xvcihpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdiYXIvYmFyX2NoYXJ0Lmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwiYmFyLWNoYXJ0XCI+PHN2Zz48L3N2Zz48L2Rpdj48cGlwLWNoYXJ0LWxlZ2VuZCBwaXAtc2VyaWVzPVwiYmFyQ2hhcnQubGVnZW5kXCIgcGlwLWludGVyYWN0aXZlPVwiYmFyQ2hhcnQuaW50ZXJhY3RpdmVMZWdlbmRcIj48L3BpcC1jaGFydC1sZWdlbmQ+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbGVnZW5kL2ludGVyYWN0aXZlX2xlZ2VuZC5odG1sJyxcbiAgICAnPGRpdj48ZGl2IGNsYXNzPVwiY2hhcnQtbGVnZW5kLWl0ZW1cIiBuZy1yZXBlYXQ9XCJpdGVtIGluIHNlcmllc1wiIG5nLXNob3c9XCJpdGVtLnZhbHVlcyB8fCBpdGVtLnZhbHVlXCI+PG1kLWNoZWNrYm94IG5nLW1vZGVsPVwiaXRlbS5kaXNhYmxlZFwiIG5nLXRydWUtdmFsdWU9XCJmYWxzZVwiIG5nLWZhbHNlLXZhbHVlPVwidHJ1ZVwiIG5nLWlmPVwiaW50ZXJhY3RpdmVcIiBhcmlhLWxhYmVsPVwie3sgaXRlbS5sYWJlbCB9fVwiPjxwIGNsYXNzPVwibGVnZW5kLWl0ZW0tdmFsdWVcIiBuZy1pZj1cIml0ZW0udmFsdWVcIiBuZy1zdHlsZT1cIntcXCdiYWNrZ3JvdW5kLWNvbG9yXFwnOiBpdGVtLmNvbG9yfVwiPnt7IGl0ZW0udmFsdWUgfX08L3A+PHAgY2xhc3M9XCJsZWdlbmQtaXRlbS1sYWJlbFwiPnt7OjogaXRlbS5sYWJlbCB8fCBpdGVtLmtleSB9fTwvcD48L21kLWNoZWNrYm94PjxkaXYgbmctaWY9XCIhaW50ZXJhY3RpdmVcIj48c3BhbiBjbGFzcz1cImJ1bGxldFwiIG5nLXN0eWxlPVwie1xcJ2JhY2tncm91bmQtY29sb3JcXCc6IGl0ZW0uY29sb3J9XCI+PC9zcGFuPiA8c3Bhbj57ezo6IGl0ZW0ubGFiZWwgfHwgaXRlbS5rZXl9fTwvc3Bhbj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsaW5lL2xpbmVfY2hhcnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJsaW5lLWNoYXJ0XCIgZmxleD1cImF1dG9cIiBsYXlvdXQ9XCJjb2x1bW5cIj48c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCIgbmctY2xhc3M9XCJ7XFwndmlzaWJsZS14LWF4aXNcXCc6IGxpbmVDaGFydC5pc1Zpc2libGVYKCksIFxcJ3Zpc2libGUteS1heGlzXFwnOiBsaW5lQ2hhcnQuaXNWaXNpYmxlWSgpfVwiPjwvc3ZnPjxkaXYgY2xhc3M9XCJzY3JvbGwtY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cInZpc3VhbC1zY3JvbGxcIj48ZGl2IGNsYXNzPVwic2Nyb2xsZWQtYmxvY2tcIj48L2Rpdj48L2Rpdj48L2Rpdj48bWQtYnV0dG9uIGNsYXNzPVwibWQtZmFiIG1kLW1pbmkgbWludXMtYnV0dG9uXCIgbmctY2xpY2s9XCJsaW5lQ2hhcnQuem9vbU91dCgpXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51cy1jaXJjbGVcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWZhYiBtZC1taW5pIHBsdXMtYnV0dG9uXCIgbmctY2xpY2s9XCJsaW5lQ2hhcnQuem9vbUluKClcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXMtY2lyY2xlXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjwvZGl2PjxwaXAtY2hhcnQtbGVnZW5kIHBpcC1zZXJpZXM9XCJsaW5lQ2hhcnQubGVnZW5kXCIgcGlwLWludGVyYWN0aXZlPVwibGluZUNoYXJ0LmludGVyYWN0aXZlTGVnZW5kXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3BpZS9waWVfY2hhcnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaWUtY2hhcnRcIiBuZy1jbGFzcz1cIntcXCdjaXJjbGVcXCc6ICFwaWVDaGFydC5kb251dH1cIj48c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCI+PC9zdmc+PC9kaXY+PHBpcC1jaGFydC1sZWdlbmQgcGlwLXNlcmllcz1cInBpZUNoYXJ0LmRhdGFcIiBwaXAtaW50ZXJhY3RpdmU9XCJmYWxzZVwiIG5nLWlmPVwicGllQ2hhcnQuc2hvd0xlZ2VuZCgpXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWNoYXJ0cy1odG1sLm1pbi5qcy5tYXBcbiJdfQ==