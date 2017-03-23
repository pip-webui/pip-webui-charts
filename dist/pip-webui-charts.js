(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).charts = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
{
    var BarChartBindings = {
        series: '<pipSeries',
        xTickFormat: '<?pipXTickFormat',
        yTickFormat: '<?pipYTickFormat',
        interactiveLegend: '<?pipInterLegend'
    };
    var BarChartBindingsChanges = (function () {
        function BarChartBindingsChanges() {
        }
        return BarChartBindingsChanges;
    }());
    var BarChartController = (function () {
        function BarChartController($element, $scope, $timeout, pipChartsUtility) {
            var _this = this;
            this.$element = $element;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipChartsUtility = pipChartsUtility;
            this.chart = null;
            this.height = 270;
            this.colors = this.pipChartsUtility.generateMaterialColors();
            $scope.$watch('$ctrl.legend', function (updatedLegend) {
                if (!updatedLegend)
                    return;
                _this.data = _this.prepareData(updatedLegend);
                _this.legend = updatedLegend;
                _this.updateChart();
            }, true);
        }
        BarChartController.prototype.$onInit = function () {
            var _this = this;
            this.data = this.prepareData(this.series);
            this.legend = _.clone(this.series);
            this.generateParameterColor();
            d3.scale.paletteColors = function () {
                return d3.scale.ordinal().range(_this.colors.map(function (color) {
                    return _this.pipChartsUtility.materialColorToRgba(color);
                }));
            };
            this.instantiateChart();
        };
        BarChartController.prototype.$onChanges = function (changes) {
            this.xTickFormat = changes.xTickFormat ? changes.xTickFormat.currentValue : null;
            this.yTickFormat = changes.yTickFormat ? changes.yTickFormat.currentValue : null;
            this.interactiveLegend = changes.interactiveLegend ? changes.interactiveLegend.currentValue : null;
            if (changes.series && changes.series.currentValue !== changes.series.previousValue) {
                this.series = changes.series.currentValue;
                this.data = this.prepareData(this.series);
                this.legend = _.clone(this.series);
                this.generateParameterColor();
                this.updateChart();
            }
        };
        BarChartController.prototype.updateChart = function () {
            if (this.chart) {
                this.chartElem.datum(this.data).call(this.chart);
                this.configBarWidthAndLabel();
                this.drawEmptyState();
            }
        };
        BarChartController.prototype.instantiateChart = function () {
            var _this = this;
            nv.addGraph(function () {
                _this.chart = nv.models.discreteBarChart()
                    .margin({
                    top: 10,
                    right: 0,
                    bottom: 10,
                    left: 50
                })
                    .x(function (d) {
                    return d.label || d.key || d.x;
                })
                    .y(function (d) {
                    return d.value;
                })
                    .showValues(true)
                    .staggerLabels(true)
                    .showXAxis(true)
                    .showYAxis(true)
                    .valueFormat(d3.format('d'))
                    .duration(0)
                    .height(_this.height)
                    .color(function (d) {
                    return _this.data[d.series].color || _this.pipChartsUtility.materialColorToRgba(_this.colors[d.series]);
                });
                _this.chart.tooltip.enabled(false);
                _this.chart.noData('There is no data right now...');
                _this.chart.yAxis
                    .tickFormat(function (d) {
                    return _this.yTickFormat ? _this.yTickFormat(d) : d;
                });
                _this.chart.xAxis
                    .tickFormat(function (d) {
                    return _this.xTickFormat ? _this.xTickFormat(d) : d;
                });
                _this.chartElem = d3.select(_this.$element.get(0))
                    .select('.bar-chart svg')
                    .datum(_this.data)
                    .style('height', '285px')
                    .call(_this.chart);
                nv.utils.windowResize(function () {
                    _this.chart.update();
                    _this.configBarWidthAndLabel(0);
                    _this.drawEmptyState();
                });
                return _this.chart;
            }, function () {
                _this.$timeout(function () {
                    _this.configBarWidthAndLabel();
                }, 0);
                _this.drawEmptyState();
            });
        };
        BarChartController.prototype.prepareData = function (data) {
            var result = [];
            _.each(data, function (seria) {
                if (!seria.disabled && seria.values)
                    result.push(seria);
            });
            return _.cloneDeep(result);
        };
        BarChartController.prototype.drawEmptyState = function () {
            if (this.$element.find('.nv-noData').length === 0) {
                d3.select(this.$element.find('.empty-state')[0]).remove();
            }
            else {
                var g = this.chartElem.append('g').classed('empty-state', true), width = this.$element.find('.nvd3-svg').innerWidth(), margin = width * 0.1;
                g.append('g')
                    .style('fill', 'rgba(0, 0, 0, 0.08)')
                    .append('rect')
                    .attr('height', this.height - 10)
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
        };
        BarChartController.prototype.configBarWidthAndLabel = function (timeout) {
            var _this = this;
            if (timeout === void 0) { timeout = 1000; }
            var labels = this.$element.find('.nv-bar text'), chartBars = this.$element.find('.nv-bar'), parentHeight = this.$element.find('.nvd3-svg')[0].getBBox().height;
            d3.select(this.$element.find('.bar-chart')[0]).classed('visible', true);
            _.each(chartBars, function (item, index) {
                var barHeight = Number(d3.select(item).select('rect').attr('height')), barWidth = Number(d3.select(item).select('rect').attr('width')), element = d3.select(item), x = d3.transform(element.attr('transform')).translate[0], y = d3.transform(element.attr('transform')).translate[1];
                element
                    .attr('transform', 'translate(' + Number(x + index * (barWidth + 15)) + ', ' + (_this.height - 20) + ')')
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
        };
        BarChartController.prototype.generateParameterColor = function () {
            var _this = this;
            if (!this.data)
                return;
            _.each(this.data, function (item, index) {
                if (item.values[0]) {
                    item.values[0].color = item.values[0].color || _this.pipChartsUtility.getMaterialColor(index, _this.colors);
                    item.color = item.values[0].color;
                }
            });
        };
        return BarChartController;
    }());
    var BarChart = {
        bindings: BarChartBindings,
        templateUrl: 'bar/barChart.html',
        controller: BarChartController
    };
    angular.module('pipBarCharts', [])
        .component('pipBarChart', BarChart);
}
},{}],2:[function(require,module,exports){
angular.module('pipCharts', [
    'pipBarCharts',
    'pipLineCharts',
    'pipPieCharts',
    'pipChartLegends',
    'pipChartsUtility',
    'pipCharts.Templates'
]);
},{}],3:[function(require,module,exports){
"use strict";
{
    var ChartLegendBindings = {
        series: '<pipSeries',
        interactive: '<pipInteractive'
    };
    var ChartLegendBindingsChanges = (function () {
        function ChartLegendBindingsChanges() {
        }
        return ChartLegendBindingsChanges;
    }());
    var ChartLegendController = (function () {
        function ChartLegendController($element, $scope, $timeout, pipChartsUtility) {
            this.$element = $element;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipChartsUtility = pipChartsUtility;
            this.colors = this.pipChartsUtility.generateMaterialColors();
        }
        ChartLegendController.prototype.$onInit = function () {
            this.updateLegends();
        };
        ChartLegendController.prototype.$onChanges = function (changes) {
            var _this = this;
            if (changes.series && changes.series.currentValue !== changes.series.previousValue) {
                this.series = changes.series.currentValue;
                this.updateLegends();
            }
            if (changes.interactive && changes.interactive.currentValue !== changes.interactive.previousValue) {
                this.interactive = changes.interactive.currentValue;
                if (this.interactive === true) {
                    this.$timeout(function () {
                        _this.colorCheckboxes();
                    }, 0);
                }
            }
        };
        ChartLegendController.prototype.updateLegends = function () {
            var _this = this;
            this.$timeout(function () {
                _this.animate();
                _this.colorCheckboxes();
            }, 0);
            this.prepareSeries();
        };
        ChartLegendController.prototype.colorCheckboxes = function () {
            var _this = this;
            var checkboxContainers = this.$element.find('md-checkbox .md-container');
            _.each(checkboxContainers, function (item, index) {
                if (index >= _this.series.length) {
                    return;
                }
                $(item)
                    .css('color', _this.series[index].color || _this.colors[index])
                    .find('.md-icon')
                    .css('background-color', _this.series[index].color || _this.colors[index]);
            });
        };
        ChartLegendController.prototype.animate = function () {
            var _this = this;
            var legendTitles = this.$element.find('.chart-legend-item');
            _.each(legendTitles, function (item, index) {
                _this.$timeout(function () {
                    $(item).addClass('visible');
                }, 200 * index);
            });
        };
        ChartLegendController.prototype.prepareSeries = function () {
            var _this = this;
            if (!this.series)
                return;
            _.each(this.series, function (item, index) {
                var materialColor = _this.pipChartsUtility.getMaterialColor(index, _this.colors);
                item.color = item.color || (item.values && item.values[0] && item.values[0].color ? item.values[0].color : materialColor);
                item.disabled = item.disabled || false;
            });
        };
        return ChartLegendController;
    }());
    var ChartLegend = {
        bindings: ChartLegendBindings,
        templateUrl: 'legend/interactiveLegend.html',
        controller: ChartLegendController
    };
    angular.module('pipChartLegends', [])
        .component('pipChartLegend', ChartLegend);
}
},{}],4:[function(require,module,exports){
"use strict";
{
    var LineChartBindings = {
        series: '<pipSeries',
        showYAxis: '<?pipYAxis',
        showXAxis: '<?pipXAxis',
        xFormat: '<?pipXFormat',
        xTickFormat: '<?pipXTickFormat',
        yTickFormat: '<?pipYTickFormat',
        xTickValues: '<?pipXTickValues',
        dynamic: '<?pipDynamic',
        fixedHeight: '<?pipDiagramHeight',
        dynamicHeight: '<?pipDynamicHeight',
        minHeight: '<?pipMinHeight',
        maxHeight: '<?pipMaxHeight',
        interactiveLegend: '<?pipInterLegend'
    };
    var LineChartBindingsChanges = (function () {
        function LineChartBindingsChanges() {
        }
        return LineChartBindingsChanges;
    }());
    var LineChartController = (function () {
        function LineChartController($element, $scope, $timeout, pipChartsUtility) {
            var _this = this;
            this.$element = $element;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipChartsUtility = pipChartsUtility;
            this.fixedHeight = this.HEIGHT;
            this.dynamicHeight = false;
            this.minHeight = this.HEIGHT;
            this.maxHeight = this.HEIGHT;
            this.showYAxis = true;
            this.showXAxis = true;
            this.dynamic = false;
            this.interactiveLegend = false;
            this.HEIGHT = 270;
            this.chart = null;
            this.chartElem = null;
            this.setZoom = null;
            this.updateZoomOptions = null;
            this.colors = this.pipChartsUtility.generateMaterialColors();
            $scope.$watch('$ctrl.legend', function (updatedLegend) {
                _this.data = _this.prepareData(updatedLegend);
                _this.legend = updatedLegend;
                _this.updateChart();
            }, true);
            $scope.$on('$destroy', function () {
                $timeout(function () {
                    d3.selectAll('.nvtooltip').style('opacity', 0);
                }, 800);
            });
        }
        LineChartController.prototype.$onInit = function () {
            var _this = this;
            this.data = this.prepareData(this.series) || [];
            this.legend = _.clone(this.series);
            this.sourceEvents = [];
            this.generateParameterColor();
            d3.scale.paletteColors = function () {
                return d3.scale.ordinal().range(_this.colors.map(function (color) {
                    return _this.pipChartsUtility.materialColorToRgba(color);
                }));
            };
            this.instantiateChart();
        };
        LineChartController.prototype.$onChanges = function (changes) {
            this.fixedHeight = changes.fixedHeight ? changes.fixedHeight.currentValue : this.HEIGHT;
            this.minHeight = changes.minHeight ? changes.minHeight.currentValue : this.HEIGHT;
            this.maxHeight = changes.maxHeight ? changes.maxHeight.currentValue : this.HEIGHT;
            this.dynamicHeight = changes.dynamicHeight ? changes.dynamicHeight.currentValue : false;
            this.showXAxis = changes.showXAxis ? changes.showXAxis.currentValue : true;
            this.showYAxis = changes.showYAxis ? changes.showYAxis.currentValue : true;
            this.dynamic = changes.dynamic ? changes.dynamic.currentValue : false;
            this.interactiveLegend = changes.interactiveLegend ? changes.interactiveLegend.currentValue : false;
            this.xFormat = changes.xFormat ? changes.xFormat.currentValue : null;
            this.xTickFormat = changes.xTickFormat ? changes.xTickFormat.currentValue : null;
            this.yTickFormat = changes.yTickFormat ? changes.yTickFormat.currentValue : null;
            if (changes.xTickValues && changes.xTickValues.currentValue !== changes.xTickValues.previousValue) {
                this.xTickValues = changes.xTickValues.currentValue;
                this.updateXTickValues();
            }
            if (changes.series && changes.series.currentValue !== changes.series.previousValue) {
                this.updateSeries();
            }
        };
        LineChartController.prototype.prepareData = function (data) {
            var result = [];
            _.each(data, function (seria) {
                if (!seria.disabled && seria.values)
                    result.push(seria);
            });
            return _.cloneDeep(result);
        };
        LineChartController.prototype.getHeight = function () {
            return this.dynamicHeight ? Math.min(Math.max(this.minHeight, this.$element.parent().innerHeight()), this.maxHeight) : this.fixedHeight;
        };
        ;
        LineChartController.prototype.zoomIn = function () {
            if (this.setZoom) {
                this.setZoom('in');
            }
        };
        ;
        LineChartController.prototype.zoomOut = function () {
            if (this.setZoom) {
                this.setZoom('out');
            }
        };
        ;
        LineChartController.prototype.instantiateChart = function () {
            var _this = this;
            nv.addGraph(function () {
                _this.chart = nv.models.lineChart()
                    .margin({
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 30
                })
                    .x(function (d) {
                    return (d !== undefined && d.x !== undefined) ? (_this.xFormat ? _this.xFormat(d.x) : d.x) : d;
                })
                    .y(function (d) {
                    return (d !== undefined && d.value !== undefined) ? d.value : d;
                })
                    .height(_this.getHeight() - 50)
                    .useInteractiveGuideline(true)
                    .showXAxis(true)
                    .showYAxis(true)
                    .showLegend(false)
                    .color(function (d) {
                    return d.color || d3.scale.paletteColors().range();
                });
                _this.chart.tooltip.enabled(false);
                _this.chart.noData('There is no data right now...');
                _this.chart.yAxis
                    .tickFormat(function (d) {
                    return _this.yTickFormat ? _this.yTickFormat(d) : d;
                });
                _this.chart.xAxis
                    .tickFormat(function (d) {
                    return _this.xTickFormat ? _this.xTickFormat(d) : d;
                })
                    .tickValues(_this.xTickValues && _.isArray(_this.xTickValues) && _this.xTickValues.length > 2 ?
                    d3.range(_this.xTickValues[0], _this.xTickValues[1], _this.xTickValues[2]) : null);
                _this.chartElem = d3.select(_this.$element.get(0)).select('.line-chart svg');
                _this.chartElem.datum(_this.data || []).style('height', (_this.getHeight() - 50) + 'px').call(_this.chart);
                $('.line-chart svg').on('touchstart touchmove', function (e) {
                    _this.$timeout(function () {
                        var tooltip = $('.nvtooltip'), tooltipW = tooltip.innerWidth(), bodyWidth = $('body').innerWidth(), x = e.originalEvent['touches'][0]['pageX'], y = e.originalEvent['touches'][0]['pageY'];
                        tooltip.css('transform', 'translate(' +
                            (x + tooltipW >= bodyWidth ? (x - tooltipW) : x) + ',' +
                            y + ')');
                        tooltip.css('left', 0);
                        tooltip.css('top', 0);
                    });
                });
                $('.line-chart svg').on('touchstart touchend', function (e) {
                    var removeTooltip = function () {
                        $('.nvtooltip').css('opacity', 0);
                    };
                    removeTooltip();
                    _this.$timeout(function () {
                        removeTooltip();
                    }, 500);
                });
                if (_this.dynamic) {
                    _this.addZoom(_this.chart, _this.chartElem);
                }
                nv.utils.windowResize(function () {
                    _this.onResize();
                });
                _this.$scope.$on('pipMainResized', function () {
                    _this.onResize();
                });
                return _this.chart;
            }, function () {
                _this.drawEmptyState();
            });
        };
        LineChartController.prototype.updateXTickValues = function () {
            if (!this.chart)
                return;
            this.chart.xAxis
                .tickValues(this.xTickValues && _.isArray(this.xTickValues) && this.xTickValues.length > 2 ?
                d3.range(this.xTickValues[0], this.xTickValues[1], this.xTickValues[2]) : null);
        };
        LineChartController.prototype.updateChart = function () {
            if (this.chart) {
                this.updateXTickValues();
                this.chartElem.datum(this.data || []).call(this.chart);
                this.drawEmptyState();
                if (this.updateZoomOptions)
                    this.updateZoomOptions(this.data);
            }
        };
        LineChartController.prototype.updateSeries = function () {
            this.data = this.prepareData(this.series);
            this.legend = _.clone(this.series);
            this.generateParameterColor();
            this.updateChart();
        };
        LineChartController.prototype.onResize = function () {
            this.chart.height(this.getHeight() - 50);
            this.chartElem.style('height', (this.getHeight() - 50) + 'px');
            this.chart.update();
            this.drawEmptyState();
        };
        LineChartController.prototype.drawEmptyState = function () {
            if (!this.$element.find('text.nv-noData').get(0)) {
                d3.select(this.$element.find('.empty-state')[0]).remove();
            }
            else {
                var containerWidth = this.$element.find('.line-chart').innerWidth(), containerHeight = this.$element.find('.line-chart').innerHeight();
                if (this.$element.find('.empty-state').get(0)) {
                    this.chartElem
                        .select('image')
                        .attr('transform', 'scale(' + (containerWidth / 1151) + ',' + (containerHeight / 216) + ')');
                }
                else {
                    this.chartElem
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
                    this.chartElem
                        .append('rect')
                        .classed('empty-state', true)
                        .attr('height', "100%")
                        .attr('width', "100%")
                        .attr('fill', 'url(#bg)');
                }
            }
        };
        LineChartController.prototype.updateScroll = function (domains, boundary) {
            var bDiff = boundary[1] - boundary[0], domDiff = domains[1] - domains[0], isEqual = (domains[1] - domains[0]) / bDiff === 1;
            $(this.$element[0]).find('.visual-scroll')
                .css('opacity', function () {
                return isEqual ? 0 : 1;
            });
            if (isEqual)
                return;
            $(this.$element[0]).find('.scrolled-block')
                .css('left', function () {
                return domains[0] / bDiff * 100 + '%';
            })
                .css('width', function () {
                return domDiff / bDiff * 100 + '%';
            });
        };
        LineChartController.prototype.generateParameterColor = function () {
            var _this = this;
            if (!this.data)
                return;
            _.each(this.data, function (item, index) {
                item.color = item.color || _this.pipChartsUtility.getMaterialColor(index, _this.colors);
            });
        };
        LineChartController.prototype.addZoom = function (chart, svg) {
            var _this = this;
            var scaleExtent = 4;
            var yAxis = null;
            var xAxis = null;
            var xDomain = null;
            var yDomain = null;
            var redraw = null;
            var xScale = null;
            var yScale = null;
            var x_boundary = null;
            var y_boundary = null;
            var d3zoom = d3.behavior.zoom();
            var prevXDomain = null;
            var prevScale = null;
            var prevTranslate = null;
            var setData = function (newChart) {
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
            };
            setData(chart);
            var fixDomain = function (domain, boundary, scale, translate) {
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
            };
            var updateChart = function () {
                d3zoom.scale(1);
                d3zoom.translate([0, 0]);
                xScale.domain(x_boundary);
                d3zoom.x(xScale).y(yScale);
                svg.call(d3zoom);
            };
            var zoomed = function () {
                if (d3.event.scale === 1) {
                    unzoomed();
                    updateChart();
                }
                else {
                    xDomain(fixDomain(xScale.domain(), x_boundary, d3.event.scale, d3.event.translate));
                    redraw();
                }
                _this.updateScroll(xScale.domain(), x_boundary);
            };
            this.setZoom = function (which) {
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
            var step = function (which) {
                var translate = d3zoom.translate();
                if (which === 'right') {
                    translate[0] -= 20;
                }
                else {
                    translate[0] += 20;
                }
                d3zoom.translate(translate);
                d3zoom.event(svg);
            };
            var coordinates = function (point) {
                var scale = d3zoom.scale(), translate = d3zoom.translate();
                return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
            };
            var point = function (coordinates) {
                var scale = d3zoom.scale(), translate = d3zoom.translate();
                return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
            };
            var keypress = function () {
                switch (d3.event.keyCode) {
                    case 39:
                        step('right');
                        break;
                    case 37:
                        step('left');
                        break;
                    case 107:
                        _this.setZoom('in');
                        break;
                    case 109:
                        _this.setZoom('out');
                }
            };
            var unzoomed = function () {
                xDomain(x_boundary);
                redraw();
                d3zoom.scale(1);
                d3zoom.translate([0, 0]);
                prevScale = 1;
                prevTranslate = [0, 0];
            };
            d3zoom.x(xScale)
                .y(yScale)
                .scaleExtent([1, scaleExtent])
                .on('zoom', zoomed);
            svg.call(d3zoom).on('dblclick.zoom', unzoomed);
            $(this.$element.get(0)).addClass('dynamic');
            svg
                .attr('focusable', false)
                .style('outline', 'none')
                .on('keydown', keypress)
                .on('focus', function () { });
            var getXMinMax = function (data) {
                var maxVal, minVal = null;
                for (var i = 0; i < data.length; i++) {
                    if (!data[i].disabled) {
                        var tempMinVal = d3.max(data[i].values, function (d) {
                            return _this.xFormat ? _this.xFormat(d.x) : d.x;
                        });
                        var tempMaxVal = d3.min(data[i].values, function (d) {
                            return _this.xFormat ? _this.xFormat(d.x) : d.x;
                        });
                        minVal = (!minVal || tempMinVal < minVal) ? tempMinVal : minVal;
                        maxVal = (!maxVal || tempMaxVal > maxVal) ? tempMaxVal : maxVal;
                    }
                }
                return [maxVal, minVal];
            };
            var updateZoomOptions = function (data) {
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
                _this.updateScroll(xScale.domain(), x_boundary);
            };
        };
        return LineChartController;
    }());
    var LineChart = {
        bindings: LineChartBindings,
        templateUrl: 'line/lineChart.html',
        controller: LineChartController
    };
    angular.module('pipLineCharts', [])
        .component('pipLineChart', LineChart);
}
},{}],5:[function(require,module,exports){
"use strict";
{
    var PieChartBindings = {
        series: '<pipSeries',
        donut: '<?pipDonut',
        legend: '<?pipShowLegend',
        total: '<?pipShowTotal',
        size: '<?pipPieSize',
        centered: '<?pipCentered'
    };
    var PieChartBindingsChanges = (function () {
        function PieChartBindingsChanges() {
        }
        return PieChartBindingsChanges;
    }());
    var PieChartController = (function () {
        function PieChartController($element, $scope, $timeout, pipChartsUtility) {
            this.$element = $element;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipChartsUtility = pipChartsUtility;
            this.donut = false;
            this.legend = true;
            this.total = true;
            this.size = 250;
            this.centered = false;
            this.chart = null;
            this.colors = this.pipChartsUtility.generateMaterialColors();
        }
        PieChartController.prototype.$onInit = function () {
            var _this = this;
            this.data = this.series;
            this.generateParameterColor();
            d3.scale.paletteColors = function () {
                return d3.scale.ordinal().range(_this.colors.map(function (color) {
                    return _this.pipChartsUtility.materialColorToRgba(color);
                }));
            };
            this.instantiateChart();
        };
        PieChartController.prototype.$onChanges = function (changes) {
            var _this = this;
            this.legend = changes.legend ? changes.legend.currentValue : this.legend;
            this.centered = changes.centered ? changes.centered.currentValue : this.centered;
            this.donut = changes.donut ? changes.donut.currentValue : this.donut;
            this.size = changes.size ? changes.size.currentValue : this.size;
            this.total = changes.total ? changes.total.currentValue : this.total;
            if (changes.series && changes.series.currentValue !== changes.series.previousValue) {
                this.data = changes.series.currentValue;
                this.generateParameterColor();
                if (this.chart) {
                    this.chartElem.datum(this.data).call(this.chart);
                    this.$timeout(function () {
                        _this.resizeTitleLabelUnwrap();
                    });
                    this.drawEmptyState(d3.select(this.$element.get(0)).select('.pie-chart svg')[0][0]);
                }
            }
        };
        PieChartController.prototype.instantiateChart = function () {
            var _this = this;
            nv.addGraph(function () {
                _this.chart = nv.models.pieChart()
                    .margin({
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                })
                    .x(function (d) {
                    return _this.donut ? d.value : null;
                })
                    .y(function (d) {
                    return d.value;
                })
                    .height(Number(_this.size))
                    .width(Number(_this.size))
                    .showLabels(true)
                    .labelThreshold(.001)
                    .growOnHover(false)
                    .donut(_this.donut)
                    .donutRatio(0.5)
                    .color(function (d) {
                    return d.color || d3.scale.paletteColors().range();
                });
                _this.chart.tooltip.enabled(false);
                _this.chart.noData('There is no data right now...');
                _this.chart.showLegend(false);
                _this.chartElem = d3.select(_this.$element.get(0))
                    .select('.pie-chart')
                    .style('height', (_this.size) + 'px')
                    .style('width', _this.centered ? '100%' : (_this.size) + 'px')
                    .select('svg')
                    .style('opacity', 0)
                    .datum(_this.data || [])
                    .call(_this.chart);
                nv.utils.windowResize(function () {
                    _this.chart.update();
                    _this.$timeout(function () {
                        _this.resizeTitleLabelUnwrap();
                    });
                    _this.centerChart();
                    _this.drawEmptyState(d3.select(_this.$element.get(0)).select('.pie-chart svg')[0][0]);
                });
                return _this.chart;
            }, function () {
                _this.$timeout(function () {
                    var svgElem = d3.select(_this.$element.get(0)).select('.pie-chart svg')[0][0];
                    _this.renderTotalLabel(svgElem);
                    d3.select(svgElem)
                        .transition()
                        .duration(1000)
                        .style('opacity', 1);
                    _this.$timeout(function () {
                        _this.resizeTitleLabelUnwrap();
                    }, 800);
                    _this.centerChart();
                    _this.drawEmptyState(svgElem);
                });
            });
        };
        PieChartController.prototype.drawEmptyState = function (svg) {
            if (!this.$element.find('text.nv-noData').get(0)) {
                d3.select(this.$element.find('.empty-state')[0]).remove();
                this.$element.find('.pip-empty-pie-text').remove();
            }
            else {
                if (this.$element.find('.pip-empty-pie-text').length === 0) {
                    this.$element.find('.pie-chart')
                        .append("<div class='pip-empty-pie-text'>There is no data right now...</div>");
                }
                var pie = d3.layout.pie().sort(null), size = Number(this.size);
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
        };
        PieChartController.prototype.centerChart = function () {
            if (this.centered) {
                var svgElem = d3.select(this.$element.get(0)).select('.pie-chart svg')[0][0], leftMargin = $(svgElem).innerWidth() / 2 - (Number(this.size) || 250) / 2;
                d3.select(this.$element.find('.nv-pieChart')[0]).attr('transform', 'translate(' + leftMargin + ', 0)');
            }
        };
        PieChartController.prototype.renderTotalLabel = function (svgElem) {
            if ((!this.total && !this.donut) || !this.data)
                return;
            var totalVal = this.data.reduce(function (sum, curr) {
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
            this.titleElem = d3.select(this.$element.find('text.label-total').get(0)).style('opacity', 0);
        };
        PieChartController.prototype.resizeTitleLabelUnwrap = function () {
            if ((!this.total && !this.donut) || !this.data)
                return;
            var boxSize = this.$element.find('.nvd3.nv-pieChart').get(0).getBBox();
            if (!boxSize.width || !boxSize.height) {
                return;
            }
            this.titleElem.style('font-size', ~~boxSize.width / 4.5).style('opacity', 1);
        };
        PieChartController.prototype.generateParameterColor = function () {
            var _this = this;
            if (!this.data)
                return;
            _.each(this.data, function (item, index) {
                item.color = item.color || _this.pipChartsUtility.getMaterialColor(index, _this.colors);
            });
        };
        return PieChartController;
    }());
    var PieChart = {
        bindings: PieChartBindings,
        templateUrl: 'pie/pieChart.html',
        controller: PieChartController
    };
    angular.module('pipPieCharts', [])
        .component('pipPieChart', PieChart);
}
},{}],6:[function(require,module,exports){
"use strict";
{
    var ChartsUtilityService = (function () {
        ChartsUtilityService.$inject = ['$mdColorPalette'];
        function ChartsUtilityService($mdColorPalette) {
            this.$mdColorPalette = $mdColorPalette;
        }
        ChartsUtilityService.prototype.getMaterialColor = function (index, colors) {
            if (!colors || colors.length < 1)
                return null;
            if (index >= colors.length) {
                index = 0;
            }
            return this.materialColorToRgba(colors[index]);
        };
        ChartsUtilityService.prototype.materialColorToRgba = function (color) {
            return 'rgba(' + this.$mdColorPalette[color][500].value[0] + ',' +
                this.$mdColorPalette[color][500].value[1] + ',' +
                this.$mdColorPalette[color][500].value[2] + ',' +
                (this.$mdColorPalette[color][500].value[3] || 1) + ')';
        };
        ChartsUtilityService.prototype.generateMaterialColors = function () {
            var _this = this;
            var colors = _.map(this.$mdColorPalette, function (palette, color) {
                return color;
            });
            colors = _.filter(colors, function (color) {
                return _.isObject(_this.$mdColorPalette[color]) && _.isObject(_this.$mdColorPalette[color][500]) && _.isArray(_this.$mdColorPalette[color][500].value);
            });
            return colors;
        };
        return ChartsUtilityService;
    }());
    angular
        .module('pipChartsUtility', [])
        .service('pipChartsUtility', ChartsUtilityService);
}
},{}],7:[function(require,module,exports){
"use strict";
},{}],8:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('bar/barChart.html',
    '<div class="bar-chart">\n' +
    '    <svg ></svg>\n' +
    '</div>\n' +
    '\n' +
    '<pip-chart-legend ng-show="$ctrl.legend" pip-series="$ctrl.legend" pip-interactive="$ctrl.interactiveLegend"></pip-chart-legend>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('legend/interactiveLegend.html',
    '<div >\n' +
    '    <div class="chart-legend-item" ng-repeat="item in $ctrl.series" ng-show="item.values || item.value">\n' +
    '        <md-checkbox ng-model="item.disabled"\n' +
    '                     ng-true-value="false"\n' +
    '                     ng-false-value="true"\n' +
    '                     ng-if="$ctrl.interactive"\n' +
    '                     aria-label="{{ item.label }}">\n' +
    '            <p class="legend-item-value"\n' +
    '                ng-if="item.value"\n' +
    '               ng-style="{\'background-color\': item.color}">\n' +
    '                {{ item.value }}\n' +
    '            </p>\n' +
    '            <p class="legend-item-label">{{:: item.label || item.key }}</p>\n' +
    '        </md-checkbox>\n' +
    '\n' +
    '        <div ng-if="!$ctrl.interactive">\n' +
    '            <span class="bullet" ng-style="{\'background-color\': item.color}"></span>\n' +
    '            <span>{{:: item.label || item.key}}</span>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('line/lineChart.html',
    '<div class="line-chart" flex="auto" layout="column">\n' +
    '    <svg class="flex-auto" ng-class="{\'visible-x-axis\': $ctrl.showXAxis, \'visible-y-axis\': $ctrl.showYAxis}">\n' +
    '    </svg>\n' +
    '    <div class="scroll-container">\n' +
    '        <div class="visual-scroll">\n' +
    '            <div class="scrolled-block"></div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <md-button class="md-fab md-mini minus-button" ng-click="$ctrl.zoomOut()">\n' +
    '        <md-icon md-svg-icon="icons:minus-circle"></md-icon>\n' +
    '    </md-button>\n' +
    '    <md-button class="md-fab md-mini plus-button" ng-click="$ctrl.zoomIn()">\n' +
    '        <md-icon md-svg-icon="icons:plus-circle"></md-icon>\n' +
    '    </md-button>\n' +
    '</div>\n' +
    '\n' +
    '<pip-chart-legend pip-series="$ctrl.legend" pip-interactive="$ctrl.interactiveLegend"></pip-chart-legend>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('pie/pieChart.html',
    '<div class="pie-chart" class="layout-column flex-auto" ng-class="{\'circle\': !$ctrl.donut}">\n' +
    '    <svg class="flex-auto"></svg>\n' +
    '</div>\n' +
    '\n' +
    '<pip-chart-legend pip-series="$ctrl.data" pip-interactive="false" ng-if="$ctrl.legend"></pip-chart-legend>');
}]);
})();



},{}]},{},[8,1,2,3,4,5,6,7])(8)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYmFyL2JhckNoYXJ0LnRzIiwic3JjL2luZGV4LnRzIiwic3JjL2xlZ2VuZC9pbnRlcmFjdGl2ZUxlZ2VuZC50cyIsInNyYy9saW5lL2xpbmVDaGFydC50cyIsInNyYy9waWUvcGllQ2hhcnQudHMiLCJzcmMvdXRpbGl0eS9DaGFydHNVdGlsaXR5U2VydmljZS50cyIsInRlbXAvcGlwLXdlYnVpLWNoYXJ0cy1odG1sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0lBLENBQUM7SUFVRyxJQUFNLGdCQUFnQixHQUFzQjtRQUN4QyxNQUFNLEVBQUUsWUFBWTtRQUNwQixXQUFXLEVBQUUsa0JBQWtCO1FBQy9CLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0IsaUJBQWlCLEVBQUUsa0JBQWtCO0tBQ3hDLENBQUE7SUFFRDtRQUFBO1FBT0EsQ0FBQztRQUFELDhCQUFDO0lBQUQsQ0FQQSxBQU9DLElBQUE7SUFFRDtRQWFJLDRCQUNZLFFBQWdCLEVBQ2hCLE1BQWlCLEVBQ2pCLFFBQTRCLEVBQzVCLGdCQUF1QztZQUpuRCxpQkFlQztZQWRXLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBVztZQUNqQixhQUFRLEdBQVIsUUFBUSxDQUFvQjtZQUM1QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXVCO1lBVDNDLFVBQUssR0FBd0IsSUFBSSxDQUFDO1lBR2xDLFdBQU0sR0FBVyxHQUFHLENBQUM7WUFRekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUM3RCxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxVQUFDLGFBQWE7Z0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO29CQUFDLE1BQU0sQ0FBQztnQkFFM0IsS0FBSSxDQUFDLElBQUksR0FBRyxLQUFJ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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7XHJcbiAgICBJQ2hhcnRzVXRpbGl0eVNlcnZpY2VcclxufSBmcm9tICcuLi91dGlsaXR5L0lDaGFydHNVdGlsaXR5U2VydmljZSc7XHJcblxyXG57XHJcbiAgICBpbnRlcmZhY2UgSUJhckNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgc2VyaWVzOiBhbnk7XHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6IGFueTtcclxuICAgICAgICB5VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgQmFyQ2hhcnRCaW5kaW5nczogSUJhckNoYXJ0QmluZGluZ3MgPSB7XHJcbiAgICAgICAgc2VyaWVzOiAnPHBpcFNlcmllcycsXHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6ICc8P3BpcFhUaWNrRm9ybWF0JyxcclxuICAgICAgICB5VGlja0Zvcm1hdDogJzw/cGlwWVRpY2tGb3JtYXQnLFxyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiAnPD9waXBJbnRlckxlZ2VuZCdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBCYXJDaGFydEJpbmRpbmdzQ2hhbmdlcyBpbXBsZW1lbnRzIElCYXJDaGFydEJpbmRpbmdzLCBuZy5JT25DaGFuZ2VzT2JqZWN0IHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHNlcmllczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIHlUaWNrRm9ybWF0OiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICBpbnRlcmFjdGl2ZUxlZ2VuZDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIEJhckNoYXJ0Q29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJQmFyQ2hhcnRCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHNlcmllczogYW55O1xyXG4gICAgICAgIHB1YmxpYyB4VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIHB1YmxpYyB5VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIHB1YmxpYyBpbnRlcmFjdGl2ZUxlZ2VuZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgbGVnZW5kOiBhbnk7XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGF0YTogYW55O1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnQ6IG52LkRpc2NyZXRlQmFyQ2hhcnQgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnRFbGVtOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBjb2xvcnM6IHN0cmluZ1tdO1xyXG4gICAgICAgIHByaXZhdGUgaGVpZ2h0OiBudW1iZXIgPSAyNzA7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSBwaXBDaGFydHNVdGlsaXR5OiBJQ2hhcnRzVXRpbGl0eVNlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xvcnMgPSB0aGlzLnBpcENoYXJ0c1V0aWxpdHkuZ2VuZXJhdGVNYXRlcmlhbENvbG9ycygpO1xyXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5sZWdlbmQnLCAodXBkYXRlZExlZ2VuZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1cGRhdGVkTGVnZW5kKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh1cGRhdGVkTGVnZW5kKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kID0gdXBkYXRlZExlZ2VuZDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkluaXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucHJlcGFyZURhdGEodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IF8uY2xvbmUodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuICAgICAgICAgICAgKCA8IGFueSA+IGQzLnNjYWxlKS5wYWxldHRlQ29sb3JzID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZSh0aGlzLmNvbG9ycy5tYXAoKGNvbG9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGlwQ2hhcnRzVXRpbGl0eS5tYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFudGlhdGVDaGFydCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogQmFyQ2hhcnRCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy54VGlja0Zvcm1hdCA9IGNoYW5nZXMueFRpY2tGb3JtYXQgPyBjaGFuZ2VzLnhUaWNrRm9ybWF0LmN1cnJlbnRWYWx1ZSA6IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMueVRpY2tGb3JtYXQgPSBjaGFuZ2VzLnlUaWNrRm9ybWF0ID8gY2hhbmdlcy55VGlja0Zvcm1hdC5jdXJyZW50VmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aXZlTGVnZW5kID0gY2hhbmdlcy5pbnRlcmFjdGl2ZUxlZ2VuZCA/IGNoYW5nZXMuaW50ZXJhY3RpdmVMZWdlbmQuY3VycmVudFZhbHVlIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnNlcmllcyAmJiBjaGFuZ2VzLnNlcmllcy5jdXJyZW50VmFsdWUgIT09IGNoYW5nZXMuc2VyaWVzLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VyaWVzID0gY2hhbmdlcy5zZXJpZXMuY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh0aGlzLnNlcmllcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IF8uY2xvbmUodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdXBkYXRlQ2hhcnQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbS5kYXR1bSh0aGlzLmRhdGEpLmNhbGwodGhpcy5jaGFydCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ0JhcldpZHRoQW5kTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbnN0YW50aWF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICBudi5hZGRHcmFwaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0ID0gbnYubW9kZWxzLmRpc2NyZXRlQmFyQ2hhcnQoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXJnaW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogNTBcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC54KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmxhYmVsIHx8IGQua2V5IHx8IGQueDtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC55KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnNob3dWYWx1ZXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc3RhZ2dlckxhYmVscyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zaG93WEF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc2hvd1lBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLnZhbHVlRm9ybWF0KCA8IGFueSA+IGQzLmZvcm1hdCgnZCcpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbigwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQodGhpcy5oZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNvbG9yKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbZC5zZXJpZXNdLmNvbG9yIHx8IHRoaXMucGlwQ2hhcnRzVXRpbGl0eS5tYXRlcmlhbENvbG9yVG9SZ2JhKHRoaXMuY29sb3JzW2Quc2VyaWVzXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydC50b29sdGlwLmVuYWJsZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydC5ub0RhdGEoJ1RoZXJlIGlzIG5vIGRhdGEgcmlnaHQgbm93Li4uJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydC55QXhpc1xyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnlUaWNrRm9ybWF0ID8gdGhpcy55VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydC54QXhpc1xyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnhUaWNrRm9ybWF0ID8gdGhpcy54VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0gPSA8IGFueSA+IGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmdldCgwKSlcclxuICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCcuYmFyLWNoYXJ0IHN2ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdHVtKHRoaXMuZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2hlaWdodCcsICcyODVweCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwodGhpcy5jaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbnYudXRpbHMud2luZG93UmVzaXplKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnQmFyV2lkdGhBbmRMYWJlbCgwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFydDtcclxuICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWdCYXJXaWR0aEFuZExhYmVsKCk7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHByZXBhcmVEYXRhKGRhdGEpOiBhbnkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgXy5lYWNoKGRhdGEsIChzZXJpYSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZXJpYS5kaXNhYmxlZCAmJiBzZXJpYS52YWx1ZXMpIHJlc3VsdC5wdXNoKHNlcmlhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBfLmNsb25lRGVlcChyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkcmF3RW1wdHlTdGF0ZSgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuZmluZCgnLm52LW5vRGF0YScpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJylbMF0pLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZyA9IHRoaXMuY2hhcnRFbGVtLmFwcGVuZCgnZycpLmNsYXNzZWQoJ2VtcHR5LXN0YXRlJywgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5udmQzLXN2ZycpLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW4gPSB3aWR0aCAqIDAuMTtcclxuXHJcbiAgICAgICAgICAgICAgICBnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JnYmEoMCwgMCwgMCwgMC4wOCknKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLmhlaWdodCAtIDEwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIDM4KTtcclxuXHJcbiAgICAgICAgICAgICAgICBnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoNDIsIDYwKScpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JnYmEoMCwgMCwgMCwgMC4wOCknKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAyMDApXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSg4NCwgMTYwKScpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JnYmEoMCwgMCwgMCwgMC4wOCknKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAxMDApXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgKDUwICsgbWFyZ2luKSArICcsIDApLCAnICsgJ3NjYWxlKCcgKyAoKHdpZHRoIC0gMiAqIG1hcmdpbikgLyAxMjYpICsgJywgMSknKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjb25maWdCYXJXaWR0aEFuZExhYmVsKHRpbWVvdXQ6IG51bWJlciA9IDEwMDApIHtcclxuICAgICAgICAgICAgY29uc3QgbGFiZWxzID0gdGhpcy4kZWxlbWVudC5maW5kKCcubnYtYmFyIHRleHQnKSxcclxuICAgICAgICAgICAgICAgIGNoYXJ0QmFycyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLm52LWJhcicpLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50SGVpZ2h0ID0gKCA8IGFueSA+IHRoaXMuJGVsZW1lbnQuZmluZCgnLm52ZDMtc3ZnJylbMF0pLmdldEJCb3goKS5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5maW5kKCcuYmFyLWNoYXJ0JylbMF0pLmNsYXNzZWQoJ3Zpc2libGUnLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIF8uZWFjaChjaGFydEJhcnMsIChpdGVtOiBFdmVudFRhcmdldCwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYmFySGVpZ2h0ID0gTnVtYmVyKGQzLnNlbGVjdChpdGVtKS5zZWxlY3QoJ3JlY3QnKS5hdHRyKCdoZWlnaHQnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGggPSBOdW1iZXIoZDMuc2VsZWN0KGl0ZW0pLnNlbGVjdCgncmVjdCcpLmF0dHIoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBkMy5zZWxlY3QoaXRlbSksXHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IGQzLnRyYW5zZm9ybShlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScpKS50cmFuc2xhdGVbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgeSA9IGQzLnRyYW5zZm9ybShlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScpKS50cmFuc2xhdGVbMV07XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBOdW1iZXIoeCArIGluZGV4ICogKGJhcldpZHRoICsgMTUpKSArICcsICcgKyAodGhpcy5oZWlnaHQgLSAyMCkgKyAnKScpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgncmVjdCcpLmF0dHIoJ2hlaWdodCcsIDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgLmR1cmF0aW9uKHRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE51bWJlcih4ICsgaW5kZXggKiAoYmFyV2lkdGggKyAxNSkpICsgJywgJyArIHkgKyAnKScpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgncmVjdCcpLmF0dHIoJ2hlaWdodCcsIGJhckhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KGxhYmVsc1tpbmRleF0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgYmFySGVpZ2h0IC8gMiArIDEwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgYmFyV2lkdGggLyAyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kYXRhKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBfLmVhY2godGhpcy5kYXRhLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS52YWx1ZXNbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnZhbHVlc1swXS5jb2xvciA9IGl0ZW0udmFsdWVzWzBdLmNvbG9yIHx8IHRoaXMucGlwQ2hhcnRzVXRpbGl0eS5nZXRNYXRlcmlhbENvbG9yKGluZGV4LCB0aGlzLmNvbG9ycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0udmFsdWVzWzBdLmNvbG9yO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IEJhckNoYXJ0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogQmFyQ2hhcnRCaW5kaW5ncyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2Jhci9iYXJDaGFydC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBCYXJDaGFydENvbnRyb2xsZXJcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwQmFyQ2hhcnRzJywgW10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwQmFyQ2hhcnQnLCBCYXJDaGFydCk7XHJcbn0iLCLvu79hbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzJywgW1xyXG4gICAgJ3BpcEJhckNoYXJ0cycsXHJcbiAgICAncGlwTGluZUNoYXJ0cycsXHJcbiAgICAncGlwUGllQ2hhcnRzJyxcclxuICAgICdwaXBDaGFydExlZ2VuZHMnLFxyXG4gICAgJ3BpcENoYXJ0c1V0aWxpdHknLFxyXG4gICAgJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnXHJcbl0pOyIsImltcG9ydCB7XHJcbiAgICBJQ2hhcnRzVXRpbGl0eVNlcnZpY2VcclxufSBmcm9tICcuLi91dGlsaXR5L0lDaGFydHNVdGlsaXR5U2VydmljZSc7XHJcblxyXG57XHJcbiAgICBpbnRlcmZhY2UgSUNoYXJ0TGVnZW5kQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgc2VyaWVzOiBhbnk7XHJcbiAgICAgICAgaW50ZXJhY3RpdmU6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBDaGFydExlZ2VuZEJpbmRpbmdzOiBJQ2hhcnRMZWdlbmRCaW5kaW5ncyA9IHtcclxuICAgICAgICBzZXJpZXM6ICc8cGlwU2VyaWVzJyxcclxuICAgICAgICBpbnRlcmFjdGl2ZTogJzxwaXBJbnRlcmFjdGl2ZSdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBDaGFydExlZ2VuZEJpbmRpbmdzQ2hhbmdlcyBpbXBsZW1lbnRzIG5nLklPbkNoYW5nZXNPYmplY3QsIElDaGFydExlZ2VuZEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHNlcmllczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgaW50ZXJhY3RpdmU6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBDaGFydExlZ2VuZENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUNoYXJ0TGVnZW5kQmluZGluZ3Mge1xyXG4gICAgICAgIHB1YmxpYyBzZXJpZXM6IGFueTtcclxuICAgICAgICBwdWJsaWMgaW50ZXJhY3RpdmU6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIHByaXZhdGUgY29sb3JzOiBzdHJpbmdbXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlIHBpcENoYXJ0c1V0aWxpdHk6IElDaGFydHNVdGlsaXR5U2VydmljZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9ycyA9IHRoaXMucGlwQ2hhcnRzVXRpbGl0eS5nZW5lcmF0ZU1hdGVyaWFsQ29sb3JzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uSW5pdCgpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMZWdlbmRzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBDaGFydExlZ2VuZEJpbmRpbmdzQ2hhbmdlcykge1xyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5zZXJpZXMgJiYgY2hhbmdlcy5zZXJpZXMuY3VycmVudFZhbHVlICE9PSBjaGFuZ2VzLnNlcmllcy5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcmllcyA9IGNoYW5nZXMuc2VyaWVzLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlTGVnZW5kcygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5pbnRlcmFjdGl2ZSAmJiBjaGFuZ2VzLmludGVyYWN0aXZlLmN1cnJlbnRWYWx1ZSAhPT0gY2hhbmdlcy5pbnRlcmFjdGl2ZS5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gY2hhbmdlcy5pbnRlcmFjdGl2ZS5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbnRlcmFjdGl2ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbG9yQ2hlY2tib3hlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZUxlZ2VuZHMoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yQ2hlY2tib3hlcygpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgdGhpcy5wcmVwYXJlU2VyaWVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNvbG9yQ2hlY2tib3hlcygpIHtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tib3hDb250YWluZXJzID0gdGhpcy4kZWxlbWVudC5maW5kKCdtZC1jaGVja2JveCAubWQtY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICBfLmVhY2goY2hlY2tib3hDb250YWluZXJzLCAoaXRlbTogRXZlbnRUYXJnZXQsIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSB0aGlzLnNlcmllcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoaXRlbSlcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdjb2xvcicsIHRoaXMuc2VyaWVzW2luZGV4XS5jb2xvciB8fCB0aGlzLmNvbG9yc1tpbmRleF0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbmQoJy5tZC1pY29uJylcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgdGhpcy5zZXJpZXNbaW5kZXhdLmNvbG9yIHx8IHRoaXMuY29sb3JzW2luZGV4XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhbmltYXRlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBsZWdlbmRUaXRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5jaGFydC1sZWdlbmQtaXRlbScpO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKGxlZ2VuZFRpdGxlcywgKGl0ZW06IEV2ZW50VGFyZ2V0LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB9LCAyMDAgKiBpbmRleCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBwcmVwYXJlU2VyaWVzKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VyaWVzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBfLmVhY2godGhpcy5zZXJpZXMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGVyaWFsQ29sb3IgPSB0aGlzLnBpcENoYXJ0c1V0aWxpdHkuZ2V0TWF0ZXJpYWxDb2xvcihpbmRleCwgdGhpcy5jb2xvcnMpO1xyXG4gICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0uY29sb3IgfHwgKGl0ZW0udmFsdWVzICYmIGl0ZW0udmFsdWVzWzBdICYmIGl0ZW0udmFsdWVzWzBdLmNvbG9yID8gaXRlbS52YWx1ZXNbMF0uY29sb3IgOiBtYXRlcmlhbENvbG9yKTtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGlzYWJsZWQgPSBpdGVtLmRpc2FibGVkIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgQ2hhcnRMZWdlbmQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIGJpbmRpbmdzOiBDaGFydExlZ2VuZEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbGVnZW5kL2ludGVyYWN0aXZlTGVnZW5kLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IENoYXJ0TGVnZW5kQ29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydExlZ2VuZHMnLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBDaGFydExlZ2VuZCcsIENoYXJ0TGVnZW5kKTtcclxufSIsImltcG9ydCB7XHJcbiAgICBJQ2hhcnRzVXRpbGl0eVNlcnZpY2VcclxufSBmcm9tICcuLi91dGlsaXR5L0lDaGFydHNVdGlsaXR5U2VydmljZSc7XHJcblxyXG57XHJcbiAgICBpbnRlcmZhY2UgSUxpbmVDaGFydEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHNlcmllczogYW55O1xyXG4gICAgICAgIHNob3dZQXhpczogYW55O1xyXG4gICAgICAgIHNob3dYQXhpczogYW55O1xyXG4gICAgICAgIHhGb3JtYXQ6IGFueTtcclxuICAgICAgICB4VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIHlUaWNrRm9ybWF0OiBhbnk7XHJcbiAgICAgICAgeFRpY2tWYWx1ZXM6IGFueTtcclxuICAgICAgICBkeW5hbWljOiBhbnk7XHJcbiAgICAgICAgZml4ZWRIZWlnaHQ6IGFueTtcclxuICAgICAgICBkeW5hbWljSGVpZ2h0OiBhbnk7XHJcbiAgICAgICAgbWluSGVpZ2h0OiBhbnk7XHJcbiAgICAgICAgbWF4SGVpZ2h0OiBhbnk7XHJcbiAgICAgICAgaW50ZXJhY3RpdmVMZWdlbmQ6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMaW5lQ2hhcnRCaW5kaW5nczogSUxpbmVDaGFydEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHNlcmllczogJzxwaXBTZXJpZXMnLFxyXG4gICAgICAgIHNob3dZQXhpczogJzw/cGlwWUF4aXMnLFxyXG4gICAgICAgIHNob3dYQXhpczogJzw/cGlwWEF4aXMnLFxyXG4gICAgICAgIHhGb3JtYXQ6ICc8P3BpcFhGb3JtYXQnLFxyXG4gICAgICAgIHhUaWNrRm9ybWF0OiAnPD9waXBYVGlja0Zvcm1hdCcsXHJcbiAgICAgICAgeVRpY2tGb3JtYXQ6ICc8P3BpcFlUaWNrRm9ybWF0JyxcclxuICAgICAgICB4VGlja1ZhbHVlczogJzw/cGlwWFRpY2tWYWx1ZXMnLFxyXG4gICAgICAgIGR5bmFtaWM6ICc8P3BpcER5bmFtaWMnLFxyXG4gICAgICAgIGZpeGVkSGVpZ2h0OiAnPD9waXBEaWFncmFtSGVpZ2h0JyxcclxuICAgICAgICBkeW5hbWljSGVpZ2h0OiAnPD9waXBEeW5hbWljSGVpZ2h0JyxcclxuICAgICAgICBtaW5IZWlnaHQ6ICc8P3BpcE1pbkhlaWdodCcsXHJcbiAgICAgICAgbWF4SGVpZ2h0OiAnPD9waXBNYXhIZWlnaHQnLFxyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiAnPD9waXBJbnRlckxlZ2VuZCdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMaW5lQ2hhcnRCaW5kaW5nc0NoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJTGluZUNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgZml4ZWRIZWlnaHQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgbnVtYmVyID4gO1xyXG4gICAgICAgIGR5bmFtaWNIZWlnaHQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgICAgICBtaW5IZWlnaHQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgbnVtYmVyID4gO1xyXG4gICAgICAgIG1heEhlaWdodDogbmcuSUNoYW5nZXNPYmplY3QgPCBudW1iZXIgPiA7XHJcblxyXG4gICAgICAgIHNlcmllczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgc2hvd1lBeGlzOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgc2hvd1hBeGlzOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgeEZvcm1hdDogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIHlUaWNrRm9ybWF0OiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICB4VGlja1ZhbHVlczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgZHluYW1pYzogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTGluZUNoYXJ0Q29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJTGluZUNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIHB1YmxpYyBmaXhlZEhlaWdodDogbnVtYmVyID0gdGhpcy5IRUlHSFQ7XHJcbiAgICAgICAgcHVibGljIGR5bmFtaWNIZWlnaHQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBwdWJsaWMgbWluSGVpZ2h0OiBudW1iZXIgPSB0aGlzLkhFSUdIVDtcclxuICAgICAgICBwdWJsaWMgbWF4SGVpZ2h0OiBudW1iZXIgPSB0aGlzLkhFSUdIVDtcclxuICAgICAgICBwdWJsaWMgc2VyaWVzOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHNob3dZQXhpczogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHVibGljIHNob3dYQXhpczogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHVibGljIHhGb3JtYXQ6IEZ1bmN0aW9uO1xyXG4gICAgICAgIHB1YmxpYyB4VGlja0Zvcm1hdDogRnVuY3Rpb247XHJcbiAgICAgICAgcHVibGljIHlUaWNrRm9ybWF0OiBGdW5jdGlvbjtcclxuICAgICAgICBwdWJsaWMgeFRpY2tWYWx1ZXM6IG51bWJlcltdO1xyXG4gICAgICAgIHB1YmxpYyBkeW5hbWljOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgcHVibGljIGludGVyYWN0aXZlTGVnZW5kOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgcHVibGljIGRhdGE6IGFueTtcclxuICAgICAgICBwdWJsaWMgbGVnZW5kOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHNvdXJjZUV2ZW50czogYW55O1xyXG5cclxuICAgICAgICBwcml2YXRlIEhFSUdIVCA9IDI3MDtcclxuICAgICAgICBwcml2YXRlIGNoYXJ0OiBudi5MaW5lQ2hhcnQgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnRFbGVtOiBhbnkgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgc2V0Wm9vbTogRnVuY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgdXBkYXRlWm9vbU9wdGlvbnM6IEZ1bmN0aW9uID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIGNvbG9yczogc3RyaW5nW107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSBwaXBDaGFydHNVdGlsaXR5OiBJQ2hhcnRzVXRpbGl0eVNlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xvcnMgPSB0aGlzLnBpcENoYXJ0c1V0aWxpdHkuZ2VuZXJhdGVNYXRlcmlhbENvbG9ycygpO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwubGVnZW5kJywgKHVwZGF0ZWRMZWdlbmQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucHJlcGFyZURhdGEodXBkYXRlZExlZ2VuZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IHVwZGF0ZWRMZWdlbmQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDaGFydCgpO1xyXG4gICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdEFsbCgnLm52dG9vbHRpcCcpLnN0eWxlKCdvcGFjaXR5JywgMCk7XHJcbiAgICAgICAgICAgICAgICB9LCA4MDApXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkluaXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucHJlcGFyZURhdGEodGhpcy5zZXJpZXMpIHx8IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IF8uY2xvbmUodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICB0aGlzLnNvdXJjZUV2ZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcblxyXG4gICAgICAgICAgICAoIDwgYW55ID4gZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKHRoaXMuY29sb3JzLm1hcCgoY29sb3IpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5waXBDaGFydHNVdGlsaXR5Lm1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbnN0YW50aWF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBMaW5lQ2hhcnRCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5maXhlZEhlaWdodCA9IGNoYW5nZXMuZml4ZWRIZWlnaHQgPyBjaGFuZ2VzLmZpeGVkSGVpZ2h0LmN1cnJlbnRWYWx1ZSA6IHRoaXMuSEVJR0hUO1xyXG4gICAgICAgICAgICB0aGlzLm1pbkhlaWdodCA9IGNoYW5nZXMubWluSGVpZ2h0ID8gY2hhbmdlcy5taW5IZWlnaHQuY3VycmVudFZhbHVlIDogdGhpcy5IRUlHSFQ7XHJcbiAgICAgICAgICAgIHRoaXMubWF4SGVpZ2h0ID0gY2hhbmdlcy5tYXhIZWlnaHQgPyBjaGFuZ2VzLm1heEhlaWdodC5jdXJyZW50VmFsdWUgOiB0aGlzLkhFSUdIVDtcclxuICAgICAgICAgICAgdGhpcy5keW5hbWljSGVpZ2h0ID0gY2hhbmdlcy5keW5hbWljSGVpZ2h0ID8gY2hhbmdlcy5keW5hbWljSGVpZ2h0LmN1cnJlbnRWYWx1ZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zaG93WEF4aXMgPSBjaGFuZ2VzLnNob3dYQXhpcyA/IGNoYW5nZXMuc2hvd1hBeGlzLmN1cnJlbnRWYWx1ZSA6IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1lBeGlzID0gY2hhbmdlcy5zaG93WUF4aXMgPyBjaGFuZ2VzLnNob3dZQXhpcy5jdXJyZW50VmFsdWUgOiB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmR5bmFtaWMgPSBjaGFuZ2VzLmR5bmFtaWMgPyBjaGFuZ2VzLmR5bmFtaWMuY3VycmVudFZhbHVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJhY3RpdmVMZWdlbmQgPSBjaGFuZ2VzLmludGVyYWN0aXZlTGVnZW5kID8gY2hhbmdlcy5pbnRlcmFjdGl2ZUxlZ2VuZC5jdXJyZW50VmFsdWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMueEZvcm1hdCA9IGNoYW5nZXMueEZvcm1hdCA/IGNoYW5nZXMueEZvcm1hdC5jdXJyZW50VmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnhUaWNrRm9ybWF0ID0gY2hhbmdlcy54VGlja0Zvcm1hdCA/IGNoYW5nZXMueFRpY2tGb3JtYXQuY3VycmVudFZhbHVlIDogbnVsbDtcclxuICAgICAgICAgICAgdGhpcy55VGlja0Zvcm1hdCA9IGNoYW5nZXMueVRpY2tGb3JtYXQgPyBjaGFuZ2VzLnlUaWNrRm9ybWF0LmN1cnJlbnRWYWx1ZSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy54VGlja1ZhbHVlcyAmJiBjaGFuZ2VzLnhUaWNrVmFsdWVzLmN1cnJlbnRWYWx1ZSAhPT0gY2hhbmdlcy54VGlja1ZhbHVlcy5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnhUaWNrVmFsdWVzID0gY2hhbmdlcy54VGlja1ZhbHVlcy5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVhUaWNrVmFsdWVzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnNlcmllcyAmJiBjaGFuZ2VzLnNlcmllcy5jdXJyZW50VmFsdWUgIT09IGNoYW5nZXMuc2VyaWVzLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VyaWVzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcHJlcGFyZURhdGEoZGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgXy5lYWNoKGRhdGEsIChzZXJpYSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZXJpYS5kaXNhYmxlZCAmJiBzZXJpYS52YWx1ZXMpIHJlc3VsdC5wdXNoKHNlcmlhKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXy5jbG9uZURlZXAocmVzdWx0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgICAgICAvKmlmICh0aGlzLmR5bmFtaWNIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhlaWd0aCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMubWluSGVpZ2h0LCB0aGlzLiRlbGVtZW50LnBhcmVudCgpLmlubmVySGVpZ2h0KCkpLCB0aGlzLm1heEhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGVpZ3RoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZml4ZWRIZWlnaHQ7XHJcbiAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5keW5hbWljSGVpZ2h0ID8gTWF0aC5taW4oTWF0aC5tYXgodGhpcy5taW5IZWlnaHQsIHRoaXMuJGVsZW1lbnQucGFyZW50KCkuaW5uZXJIZWlnaHQoKSksIHRoaXMubWF4SGVpZ2h0KSA6IHRoaXMuZml4ZWRIZWlnaHQ7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHpvb21JbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0Wm9vbSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRab29tKCdpbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHpvb21PdXQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldFpvb20pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Wm9vbSgnb3V0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwcml2YXRlIGluc3RhbnRpYXRlQ2hhcnQoKSB7XHJcbiAgICAgICAgICAgIG52LmFkZEdyYXBoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQgPSBudi5tb2RlbHMubGluZUNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAubWFyZ2luKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAyMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IDIwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b206IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAzMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLngoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChkICE9PSB1bmRlZmluZWQgJiYgZC54ICE9PSB1bmRlZmluZWQpID8gKHRoaXMueEZvcm1hdCA/IHRoaXMueEZvcm1hdChkLngpIDogZC54KSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAueSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGQgIT09IHVuZGVmaW5lZCAmJiBkLnZhbHVlICE9PSB1bmRlZmluZWQpID8gZC52YWx1ZSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KHRoaXMuZ2V0SGVpZ2h0KCkgLSA1MClcclxuICAgICAgICAgICAgICAgICAgICAudXNlSW50ZXJhY3RpdmVHdWlkZWxpbmUodHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc2hvd1hBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNob3dZQXhpcyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zaG93TGVnZW5kKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jb2xvcigoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5jb2xvciB8fCAoIDwgYW55ID4gZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMoKS5yYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQudG9vbHRpcC5lbmFibGVkKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQubm9EYXRhKCdUaGVyZSBpcyBubyBkYXRhIHJpZ2h0IG5vdy4uLicpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQueUF4aXNcclxuICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy55VGlja0Zvcm1hdCA/IHRoaXMueVRpY2tGb3JtYXQoZCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQueEF4aXNcclxuICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy54VGlja0Zvcm1hdCA/IHRoaXMueFRpY2tGb3JtYXQoZCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tWYWx1ZXModGhpcy54VGlja1ZhbHVlcyAmJiBfLmlzQXJyYXkodGhpcy54VGlja1ZhbHVlcykgJiYgdGhpcy54VGlja1ZhbHVlcy5sZW5ndGggPiAyID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgZDMucmFuZ2UodGhpcy54VGlja1ZhbHVlc1swXSwgdGhpcy54VGlja1ZhbHVlc1sxXSwgdGhpcy54VGlja1ZhbHVlc1syXSkgOiBudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbSA9IGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcubGluZS1jaGFydCBzdmcnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtLmRhdHVtKHRoaXMuZGF0YSB8fCBbXSkuc3R5bGUoJ2hlaWdodCcsICh0aGlzLmdldEhlaWdodCgpIC0gNTApICsgJ3B4JykuY2FsbCh0aGlzLmNoYXJ0KTtcclxuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSB0b3VjaGVzIGZvciBjb3JyZWN0aW5nIHRvb2x0aXAgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgICQoJy5saW5lLWNoYXJ0IHN2ZycpLm9uKCd0b3VjaHN0YXJ0IHRvdWNobW92ZScsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2x0aXAgPSAkKCcubnZ0b29sdGlwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwVyA9IHRvb2x0aXAuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keVdpZHRoID0gJCgnYm9keScpLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggPSBlLm9yaWdpbmFsRXZlbnRbJ3RvdWNoZXMnXVswXVsncGFnZVgnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgPSBlLm9yaWdpbmFsRXZlbnRbJ3RvdWNoZXMnXVswXVsncGFnZVknXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHggKyB0b29sdGlwVyA+PSBib2R5V2lkdGggPyAoeCAtIHRvb2x0aXBXKSA6IHgpICsgJywnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgKyAnKScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmNzcygnbGVmdCcsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmNzcygndG9wJywgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcubGluZS1jaGFydCBzdmcnKS5vbigndG91Y2hzdGFydCB0b3VjaGVuZCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlVG9vbHRpcCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLm52dG9vbHRpcCcpLmNzcygnb3BhY2l0eScsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZVRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZHluYW1pYykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkWm9vbSh0aGlzLmNoYXJ0LCB0aGlzLmNoYXJ0RWxlbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbnYudXRpbHMud2luZG93UmVzaXplKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kb24oJ3BpcE1haW5SZXNpemVkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYXJ0O1xyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVYVGlja1ZhbHVlcygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNoYXJ0KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYXJ0LnhBeGlzXHJcbiAgICAgICAgICAgICAgICAudGlja1ZhbHVlcyh0aGlzLnhUaWNrVmFsdWVzICYmIF8uaXNBcnJheSh0aGlzLnhUaWNrVmFsdWVzKSAmJiB0aGlzLnhUaWNrVmFsdWVzLmxlbmd0aCA+IDIgP1xyXG4gICAgICAgICAgICAgICAgICAgIGQzLnJhbmdlKHRoaXMueFRpY2tWYWx1ZXNbMF0sIHRoaXMueFRpY2tWYWx1ZXNbMV0sIHRoaXMueFRpY2tWYWx1ZXNbMl0pIDogbnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGFydCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVYVGlja1ZhbHVlcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtLmRhdHVtKHRoaXMuZGF0YSB8fCBbXSkuY2FsbCh0aGlzLmNoYXJ0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51cGRhdGVab29tT3B0aW9ucykgdGhpcy51cGRhdGVab29tT3B0aW9ucyh0aGlzLmRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZVNlcmllcygpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh0aGlzLnNlcmllcyk7XHJcbiAgICAgICAgICAgIHRoaXMubGVnZW5kID0gXy5jbG9uZSh0aGlzLnNlcmllcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVDaGFydCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBvblJlc2l6ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFydC5oZWlnaHQodGhpcy5nZXRIZWlnaHQoKSAtIDUwKTtcclxuICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0uc3R5bGUoJ2hlaWdodCcsICh0aGlzLmdldEhlaWdodCgpIC0gNTApICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcnQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZHJhd0VtcHR5U3RhdGUoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy4kZWxlbWVudC5maW5kKCd0ZXh0Lm52LW5vRGF0YScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJylbMF0pLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyV2lkdGggPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5saW5lLWNoYXJ0JykuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmxpbmUtY2hhcnQnKS5pbm5lckhlaWdodCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ2ltYWdlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgKGNvbnRhaW5lcldpZHRoIC8gMTE1MSkgKyAnLCcgKyAoY29udGFpbmVySGVpZ2h0IC8gMjE2KSArICcpJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJkZWZzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJwYXR0ZXJuXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIFwiMFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgXCIwXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaWRcIiwgXCJiZ1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiaW1hZ2VcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCAxNylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgXCIyMTZweFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBcIjExNTFweFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyAoY29udGFpbmVyV2lkdGggLyAxMTUxKSArICcsJyArIChjb250YWluZXJIZWlnaHQgLyAyMTYpICsgJyknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgXCJpbWFnZXMvbGluZV9jaGFydF9lbXB0eV9zdGF0ZS5zdmdcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnZW1wdHktc3RhdGUnLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgXCIxMDAlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIFwiMTAwJVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZmlsbCcsICd1cmwoI2JnKScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZVNjcm9sbChkb21haW5zLCBib3VuZGFyeSkge1xyXG4gICAgICAgICAgICBjb25zdCBiRGlmZiA9IGJvdW5kYXJ5WzFdIC0gYm91bmRhcnlbMF0sXHJcbiAgICAgICAgICAgICAgICBkb21EaWZmID0gZG9tYWluc1sxXSAtIGRvbWFpbnNbMF0sXHJcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gKGRvbWFpbnNbMV0gLSBkb21haW5zWzBdKSAvIGJEaWZmID09PSAxO1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzLiRlbGVtZW50WzBdKS5maW5kKCcudmlzdWFsLXNjcm9sbCcpXHJcbiAgICAgICAgICAgICAgICAuY3NzKCdvcGFjaXR5JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc0VxdWFsID8gMCA6IDE7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0VxdWFsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAkKHRoaXMuJGVsZW1lbnRbMF0pLmZpbmQoJy5zY3JvbGxlZC1ibG9jaycpXHJcbiAgICAgICAgICAgICAgICAuY3NzKCdsZWZ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb21haW5zWzBdIC8gYkRpZmYgKiAxMDAgKyAnJSc7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNzcygnd2lkdGgnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbURpZmYgLyBiRGlmZiAqIDEwMCArICclJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZGF0YSwgKGl0ZW0sIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uY29sb3IgPSBpdGVtLmNvbG9yIHx8IHRoaXMucGlwQ2hhcnRzVXRpbGl0eS5nZXRNYXRlcmlhbENvbG9yKGluZGV4LCB0aGlzLmNvbG9ycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhZGRab29tKGNoYXJ0LCBzdmcpIHtcclxuICAgICAgICAgICAgLy8gc2NhbGVFeHRlbnRcclxuICAgICAgICAgICAgY29uc3Qgc2NhbGVFeHRlbnQgPSA0O1xyXG5cclxuICAgICAgICAgICAgLy8gcGFyYW1ldGVyc1xyXG4gICAgICAgICAgICBsZXQgeUF4aXMgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgeEF4aXMgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgeERvbWFpbiA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCB5RG9tYWluID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHJlZHJhdyA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBzY2FsZXNcclxuICAgICAgICAgICAgbGV0IHhTY2FsZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCB5U2NhbGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gbWluL21heCBib3VuZGFyaWVzXHJcbiAgICAgICAgICAgIGxldCB4X2JvdW5kYXJ5ID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHlfYm91bmRhcnkgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gY3JlYXRlIGQzIHpvb20gaGFuZGxlclxyXG4gICAgICAgICAgICBsZXQgZDN6b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpO1xyXG4gICAgICAgICAgICBsZXQgcHJldlhEb21haW4gPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgcHJldlNjYWxlID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHByZXZUcmFuc2xhdGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2V0RGF0YSA9IChuZXdDaGFydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gcGFyYW1ldGVyc1xyXG4gICAgICAgICAgICAgICAgeUF4aXMgPSBuZXdDaGFydC55QXhpcztcclxuICAgICAgICAgICAgICAgIHhBeGlzID0gbmV3Q2hhcnQueEF4aXM7XHJcbiAgICAgICAgICAgICAgICB4RG9tYWluID0gbmV3Q2hhcnQueERvbWFpbiB8fCB4QXhpcy5zY2FsZSgpLmRvbWFpbjtcclxuICAgICAgICAgICAgICAgIHlEb21haW4gPSBuZXdDaGFydC55RG9tYWluIHx8IHlBeGlzLnNjYWxlKCkuZG9tYWluO1xyXG4gICAgICAgICAgICAgICAgcmVkcmF3ID0gbmV3Q2hhcnQudXBkYXRlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNjYWxlc1xyXG4gICAgICAgICAgICAgICAgeFNjYWxlID0geEF4aXMuc2NhbGUoKTtcclxuICAgICAgICAgICAgICAgIHlTY2FsZSA9IHlBeGlzLnNjYWxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gbWluL21heCBib3VuZGFyaWVzXHJcbiAgICAgICAgICAgICAgICB4X2JvdW5kYXJ5ID0geEF4aXMuc2NhbGUoKS5kb21haW4oKS5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgeV9ib3VuZGFyeSA9IHlBeGlzLnNjYWxlKCkuZG9tYWluKCkuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgZDMgem9vbSBoYW5kbGVyXHJcbiAgICAgICAgICAgICAgICBwcmV2WERvbWFpbiA9IHhfYm91bmRhcnk7XHJcbiAgICAgICAgICAgICAgICBwcmV2U2NhbGUgPSBkM3pvb20uc2NhbGUoKTtcclxuICAgICAgICAgICAgICAgIHByZXZUcmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZW5zdXJlIG5pY2UgYXhpc1xyXG4gICAgICAgICAgICAgICAgeFNjYWxlLm5pY2UoKTtcclxuICAgICAgICAgICAgICAgIHlTY2FsZS5uaWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNldERhdGEoY2hhcnQpO1xyXG5cclxuICAgICAgICAgICAgLy8gZml4IGRvbWFpblxyXG4gICAgICAgICAgICBjb25zdCBmaXhEb21haW4gPSAoZG9tYWluLCBib3VuZGFyeSwgc2NhbGUsIHRyYW5zbGF0ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpblswXSA8IGJvdW5kYXJ5WzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdID0gYm91bmRhcnlbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZYRG9tYWluWzBdICE9PSBib3VuZGFyeVswXSB8fCBzY2FsZSAhPT0gcHJldlNjYWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblsxXSArPSAoYm91bmRhcnlbMF0gLSBkb21haW5bMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblsxXSA9IHByZXZYRG9tYWluWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBfLmNsb25lKHByZXZUcmFuc2xhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluWzFdID4gYm91bmRhcnlbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICBkb21haW5bMV0gPSBib3VuZGFyeVsxXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlhEb21haW5bMV0gIT09IGJvdW5kYXJ5WzFdIHx8IHNjYWxlICE9PSBwcmV2U2NhbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdIC09IChkb21haW5bMV0gLSBib3VuZGFyeVsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdID0gcHJldlhEb21haW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSA9IF8uY2xvbmUocHJldlRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUodHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZYRG9tYWluID0gXy5jbG9uZShkb21haW4pO1xyXG4gICAgICAgICAgICAgICAgcHJldlNjYWxlID0gXy5jbG9uZShzY2FsZSk7XHJcbiAgICAgICAgICAgICAgICBwcmV2VHJhbnNsYXRlID0gXy5jbG9uZSh0cmFuc2xhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkb21haW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUNoYXJ0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZDN6b29tLnNjYWxlKDEpO1xyXG4gICAgICAgICAgICAgICAgZDN6b29tLnRyYW5zbGF0ZShbMCwgMF0pO1xyXG4gICAgICAgICAgICAgICAgeFNjYWxlLmRvbWFpbih4X2JvdW5kYXJ5KTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS54KHhTY2FsZSkueSh5U2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gem9vbSBldmVudCBoYW5kbGVyXHJcbiAgICAgICAgICAgIGNvbnN0IHpvb21lZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgoIDwgYW55ID4gZDMuZXZlbnQpLnNjYWxlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW56b29tZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDaGFydCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4RG9tYWluKGZpeERvbWFpbih4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnksICggPCBhbnkgPiBkMy5ldmVudCkuc2NhbGUsICggPCBhbnkgPiBkMy5ldmVudCkudHJhbnNsYXRlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVkcmF3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTY3JvbGwoeFNjYWxlLmRvbWFpbigpLCB4X2JvdW5kYXJ5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgdGhpcy5zZXRab29tID0gKHdoaWNoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXIwID0gW3N2Z1swXVswXS5nZXRCQm94KCkud2lkdGggLyAyLCBzdmdbMF1bMF0uZ2V0QkJveCgpLmhlaWdodCAvIDJdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlMCA9IGQzem9vbS50cmFuc2xhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczAgPSBjb29yZGluYXRlcyhjZW50ZXIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAod2hpY2ggPT09ICdpbicpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNjYWxlIDwgc2NhbGVFeHRlbnQpIGQzem9vbS5zY2FsZShwcmV2U2NhbGUgKyAwLjIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNjYWxlID4gMSkgZDN6b29tLnNjYWxlKHByZXZTY2FsZSAtIDAuMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2VudGVyMSA9IHBvaW50KGNvb3JkaW5hdGVzMCk7XHJcbiAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFt0cmFuc2xhdGUwWzBdICsgY2VudGVyMFswXSAtIGNlbnRlcjFbMF0sIHRyYW5zbGF0ZTBbMV0gKyBjZW50ZXIwWzFdIC0gY2VudGVyMVsxXV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc3RlcCA9ICh3aGljaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh3aGljaCA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVswXSAtPSAyMDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlWzBdICs9IDIwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUodHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IChwb2ludCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBkM3pvb20uc2NhbGUoKSxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhwb2ludFswXSAtIHRyYW5zbGF0ZVswXSkgLyBzY2FsZSwgKHBvaW50WzFdIC0gdHJhbnNsYXRlWzFdKSAvIHNjYWxlXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSAoY29vcmRpbmF0ZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gZDN6b29tLnNjYWxlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtjb29yZGluYXRlc1swXSAqIHNjYWxlICsgdHJhbnNsYXRlWzBdLCBjb29yZGluYXRlc1sxXSAqIHNjYWxlICsgdHJhbnNsYXRlWzFdXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qga2V5cHJlc3MgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKCggPCBhbnkgPiBkMy5ldmVudCkua2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXAoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXAoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Wm9vbSgnaW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Wm9vbSgnb3V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHpvb20gZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICBjb25zdCB1bnpvb21lZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHhEb21haW4oeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgICAgICAgICByZWRyYXcoKTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS5zY2FsZSgxKTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUoWzAsIDBdKTtcclxuICAgICAgICAgICAgICAgIHByZXZTY2FsZSA9IDE7XHJcbiAgICAgICAgICAgICAgICBwcmV2VHJhbnNsYXRlID0gWzAsIDBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHdyYXBwZXJcclxuICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKVxyXG4gICAgICAgICAgICAgICAgLnkoeVNjYWxlKVxyXG4gICAgICAgICAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCBzY2FsZUV4dGVudF0pXHJcbiAgICAgICAgICAgICAgICAub24oJ3pvb20nLCB6b29tZWQpO1xyXG5cclxuICAgICAgICAgICAgLy8gYWRkIGhhbmRsZXJcclxuICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKS5vbignZGJsY2xpY2suem9vbScsIHVuem9vbWVkKTtcclxuICAgICAgICAgICAgJCh0aGlzLiRlbGVtZW50LmdldCgwKSkuYWRkQ2xhc3MoJ2R5bmFtaWMnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBrZXlib2FyZCBoYW5kbGVyc1xyXG4gICAgICAgICAgICBzdmdcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdmb2N1c2FibGUnLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIC5zdHlsZSgnb3V0bGluZScsICdub25lJylcclxuICAgICAgICAgICAgICAgIC5vbigna2V5ZG93bicsIGtleXByZXNzKVxyXG4gICAgICAgICAgICAgICAgLm9uKCdmb2N1cycsICgpID0+IHt9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdldFhNaW5NYXggPSAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heFZhbCwgbWluVmFsID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGFbaV0uZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcE1pblZhbCA9IGQzLm1heChkYXRhW2ldLnZhbHVlcywgKGQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueEZvcm1hdCA/IHRoaXMueEZvcm1hdChkLngpIDogZC54O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcE1heFZhbCA9IGQzLm1pbihkYXRhW2ldLnZhbHVlcywgKGQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueEZvcm1hdCA/IHRoaXMueEZvcm1hdChkLngpIDogZC54O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluVmFsID0gKCFtaW5WYWwgfHwgdGVtcE1pblZhbCA8IG1pblZhbCkgPyB0ZW1wTWluVmFsIDogbWluVmFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWwgPSAoIW1heFZhbCB8fCB0ZW1wTWF4VmFsID4gbWF4VmFsKSA/IHRlbXBNYXhWYWwgOiBtYXhWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFttYXhWYWwsIG1pblZhbF07XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVab29tT3B0aW9ucyA9IChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB5QXhpcyA9IGNoYXJ0LnlBeGlzO1xyXG4gICAgICAgICAgICAgICAgeEF4aXMgPSBjaGFydC54QXhpcztcclxuXHJcbiAgICAgICAgICAgICAgICB4U2NhbGUgPSB4QXhpcy5zY2FsZSgpO1xyXG4gICAgICAgICAgICAgICAgeVNjYWxlID0geUF4aXMuc2NhbGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB4X2JvdW5kYXJ5ID0gZ2V0WE1pbk1heChkYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZDN6b29tLnNjYWxlKCkgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBkM3pvb20ueCh4U2NhbGUpLnkoeVNjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBzdmcuY2FsbChkM3pvb20pO1xyXG4gICAgICAgICAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2Nyb2xsKHhTY2FsZS5kb21haW4oKSwgeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTGluZUNoYXJ0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogTGluZUNoYXJ0QmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdsaW5lL2xpbmVDaGFydC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBMaW5lQ2hhcnRDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcExpbmVDaGFydHMnLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBMaW5lQ2hhcnQnLCBMaW5lQ2hhcnQpO1xyXG59XHJcbi8qXHJcbiAgICBmdW5jdGlvbiBwaXBMaW5lQ2hhcnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNlcmllczogJz1waXBTZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgc2hvd1lBeGlzOiAnPXBpcFlBeGlzJyxcclxuICAgICAgICAgICAgICAgIHNob3dYQXhpczogJz1waXBYQXhpcycsXHJcbiAgICAgICAgICAgICAgICB4Rm9ybWF0OiAnPXBpcFhGb3JtYXQnLFxyXG4gICAgICAgICAgICAgICAgeFRpY2tGb3JtYXQ6ICc9cGlwWFRpY2tGb3JtYXQnLFxyXG4gICAgICAgICAgICAgICAgeVRpY2tGb3JtYXQ6ICc9cGlwWVRpY2tGb3JtYXQnLFxyXG4gICAgICAgICAgICAgICAgeFRpY2tWYWx1ZXM6ICc9cGlwWFRpY2tWYWx1ZXMnLFxyXG4gICAgICAgICAgICAgICAgZHluYW1pYzogJz1waXBEeW5hbWljJyxcclxuICAgICAgICAgICAgICAgIGZpeGVkSGVpZ2h0OiAnQHBpcERpYWdyYW1IZWlnaHQnLFxyXG4gICAgICAgICAgICAgICAgZHluYW1pY0hlaWdodDogJ0BwaXBEeW5hbWljSGVpZ2h0JyxcclxuICAgICAgICAgICAgICAgIG1pbkhlaWdodDogJ0BwaXBNaW5IZWlnaHQnLFxyXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAnQHBpcE1heEhlaWdodCcsXHJcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZUxlZ2VuZDogJz1waXBJbnRlckxlZ2VuZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnbGluZUNoYXJ0JyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdsaW5lL2xpbmVDaGFydC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkaW50ZXJ2YWwsICRtZENvbG9yUGFsZXR0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZtID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHZhciBjaGFydCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hhcnRFbGVtID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciBzZXRab29tID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciB1cGRhdGVab29tT3B0aW9ucyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgZml4ZWRIZWlnaHQgPSB2bS5maXhlZEhlaWdodCB8fCAyNzA7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHluYW1pY0hlaWdodCA9IHZtLmR5bmFtaWNIZWlnaHQgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluSGVpZ2h0ID0gdm0ubWluSGVpZ2h0IHx8IGZpeGVkSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdmFyIG1heEhlaWdodCA9IHZtLm1heEhlaWdodCB8fCBmaXhlZEhlaWdodDtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsdGVyZWRDb2xvciA9IF8uZmlsdGVyKCRtZENvbG9yUGFsZXR0ZSwgZnVuY3Rpb24gKHBhbGV0dGUsIGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNPYmplY3QoY29sb3IpICYmIF8uaXNPYmplY3QoY29sb3JbNTAwXSAmJiBfLmlzQXJyYXkoY29sb3JbNTAwXS52YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sb3JzID0gXy5tYXAoZmlsdGVyZWRDb2xvciwgZnVuY3Rpb24gKHBhbGV0dGUsIGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2bS5kYXRhID0gcHJlcGFyZURhdGEodm0uc2VyaWVzKSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIHZtLmxlZ2VuZCA9IF8uY2xvbmUodm0uc2VyaWVzKTtcclxuICAgICAgICAgICAgICAgIHZtLnNvdXJjZUV2ZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIHZtLmlzVmlzaWJsZVggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLnNob3dYQXhpcyA9PSB1bmRlZmluZWQgPyB0cnVlIDogdm0uc2hvd1hBeGlzO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2bS5pc1Zpc2libGVZID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS5zaG93WUF4aXMgPT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHZtLnNob3dZQXhpcztcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdm0uem9vbUluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXRab29tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFpvb20oJ2luJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2bS56b29tT3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXRab29tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFpvb20oJ291dCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHZtLnNlcmllcyAmJiB2bS5zZXJpZXMubGVuZ3RoID4gY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmRhdGEgPSB2bS5zZXJpZXMuc2xpY2UoMCwgOSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2V0cyBjb2xvcnMgb2YgaXRlbXNcclxuICAgICAgICAgICAgICAgIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAoIDwgYW55ID4gZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZShjb2xvcnMubWFwKG1hdGVyaWFsQ29sb3JUb1JnYmEpKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnbGluZUNoYXJ0LnNlcmllcycsIGZ1bmN0aW9uICh1cGRhdGVkU2VyaWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YSA9IHByZXBhcmVEYXRhKHVwZGF0ZWRTZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmxlZ2VuZCA9IF8uY2xvbmUodm0uc2VyaWVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQueEF4aXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrVmFsdWVzKHZtLnhUaWNrVmFsdWVzICYmIF8uaXNBcnJheSh2bS54VGlja1ZhbHVlcykgJiYgdm0ueFRpY2tWYWx1ZXMubGVuZ3RoID4gMiA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZDMucmFuZ2Uodm0ueFRpY2tWYWx1ZXNbMF0sIHZtLnhUaWNrVmFsdWVzWzFdLCB2bS54VGlja1ZhbHVlc1syXSkgOiBudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0RWxlbS5kYXR1bSh2bS5kYXRhIHx8IFtdKS5jYWxsKGNoYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0VtcHR5U3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVab29tT3B0aW9ucykgdXBkYXRlWm9vbU9wdGlvbnModm0uZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdEFsbCgnLm52dG9vbHRpcCcpLnN0eWxlKCdvcGFjaXR5JywgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgODAwKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcHJlcGFyZURhdGEoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBfLmVhY2goZGF0YSwgKHNlcmlhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2VyaWEuZGlzYWJsZWQgJiYgc2VyaWEudmFsdWVzKSByZXN1bHQucHVzaChzZXJpYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmNsb25lRGVlcChyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBnZXRIZWlnaHQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGR5bmFtaWNIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVpZ3RoID0gTWF0aC5taW4oTWF0aC5tYXgobWluSGVpZ2h0LCAkZWxlbWVudC5wYXJlbnQoKS5pbm5lckhlaWdodCgpKSwgbWF4SGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhlaWd0aDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZml4ZWRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEluc3RhbnRpYXRlIGNoYXJ0XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuLypcclxubnYuYWRkR3JhcGgoKCkgPT4ge1xyXG4gICAgY2hhcnQgPSBudi5tb2RlbHMubGluZUNoYXJ0KClcclxuICAgICAgICAubWFyZ2luKHtcclxuICAgICAgICAgICAgdG9wOiAyMCxcclxuICAgICAgICAgICAgcmlnaHQ6IDIwLFxyXG4gICAgICAgICAgICBib3R0b206IDMwLFxyXG4gICAgICAgICAgICBsZWZ0OiAzMFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLngoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChkICE9PSB1bmRlZmluZWQgJiYgZC54ICE9PSB1bmRlZmluZWQpID8gKHZtLnhGb3JtYXQgPyB2bS54Rm9ybWF0KGQueCkgOiBkLngpIDogZDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoZCAhPT0gdW5kZWZpbmVkICYmIGQudmFsdWUgIT09IHVuZGVmaW5lZCkgPyBkLnZhbHVlIDogZDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5oZWlnaHQoZ2V0SGVpZ2h0KCkgLSA1MClcclxuICAgICAgICAudXNlSW50ZXJhY3RpdmVHdWlkZWxpbmUodHJ1ZSlcclxuICAgICAgICAuc2hvd1hBeGlzKHRydWUpXHJcbiAgICAgICAgLnNob3dZQXhpcyh0cnVlKVxyXG4gICAgICAgIC5zaG93TGVnZW5kKGZhbHNlKVxyXG4gICAgICAgIC5jb2xvcihmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZC5jb2xvciB8fCAoIDwgYW55ID4gZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMoKS5yYW5nZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIGNoYXJ0LnRvb2x0aXAuZW5hYmxlZChmYWxzZSk7XHJcbiAgICBjaGFydC5ub0RhdGEoJ1RoZXJlIGlzIG5vIGRhdGEgcmlnaHQgbm93Li4uJyk7XHJcblxyXG4gICAgY2hhcnQueUF4aXNcclxuICAgICAgICAudGlja0Zvcm1hdChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdm0ueVRpY2tGb3JtYXQgPyB2bS55VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgY2hhcnQueEF4aXNcclxuICAgICAgICAudGlja0Zvcm1hdChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdm0ueFRpY2tGb3JtYXQgPyB2bS54VGlja0Zvcm1hdChkKSA6IGQ7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGlja1ZhbHVlcyh2bS54VGlja1ZhbHVlcyAmJiBfLmlzQXJyYXkodm0ueFRpY2tWYWx1ZXMpICYmIHZtLnhUaWNrVmFsdWVzLmxlbmd0aCA+IDIgP1xyXG4gICAgICAgICAgICBkMy5yYW5nZSh2bS54VGlja1ZhbHVlc1swXSwgdm0ueFRpY2tWYWx1ZXNbMV0sIHZtLnhUaWNrVmFsdWVzWzJdKSA6IG51bGwpO1xyXG5cclxuICAgIGNoYXJ0RWxlbSA9IGQzLnNlbGVjdCgkZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLmxpbmUtY2hhcnQgc3ZnJyk7XHJcbiAgICBjaGFydEVsZW0uZGF0dW0odm0uZGF0YSB8fCBbXSkuc3R5bGUoJ2hlaWdodCcsIChnZXRIZWlnaHQoKSAtIDUwKSArICdweCcpLmNhbGwoY2hhcnQpO1xyXG4gICAgLy8gSGFuZGxlIHRvdWNoZXMgZm9yIGNvcnJlY3RpbmcgdG9vbHRpcCBwb3NpdGlvblxyXG4gICAgJCgnLmxpbmUtY2hhcnQgc3ZnJykub24oJ3RvdWNoc3RhcnQgdG91Y2htb3ZlJywgKGUpID0+IHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRvb2x0aXAgPSAkKCcubnZ0b29sdGlwJyksXHJcbiAgICAgICAgICAgICAgICB0b29sdGlwVyA9IHRvb2x0aXAuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgYm9keVdpZHRoID0gJCgnYm9keScpLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgIHggPSBlLm9yaWdpbmFsRXZlbnRbJ3RvdWNoZXMnXVswXVsncGFnZVgnXSxcclxuICAgICAgICAgICAgICAgIHkgPSBlLm9yaWdpbmFsRXZlbnRbJ3RvdWNoZXMnXVswXVsncGFnZVknXTtcclxuXHJcbiAgICAgICAgICAgIHRvb2x0aXAuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgK1xyXG4gICAgICAgICAgICAgICAgKHggKyB0b29sdGlwVyA+PSBib2R5V2lkdGggPyAoeCAtIHRvb2x0aXBXKSA6IHgpICsgJywnICtcclxuICAgICAgICAgICAgICAgIHkgKyAnKScpO1xyXG4gICAgICAgICAgICB0b29sdGlwLmNzcygnbGVmdCcsIDApO1xyXG4gICAgICAgICAgICB0b29sdGlwLmNzcygndG9wJywgMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcubGluZS1jaGFydCBzdmcnKS5vbigndG91Y2hzdGFydCB0b3VjaGVuZCcsIChlKSA9PiB7XHJcbiAgICAgICAgbGV0IHJlbW92ZVRvb2x0aXAgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0b29sdGlwID0gJCgnLm52dG9vbHRpcCcpO1xyXG4gICAgICAgICAgICB0b29sdGlwLmNzcygnb3BhY2l0eScsIDApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlbW92ZVRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHJlbW92ZVRvb2x0aXAoKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHZtLmR5bmFtaWMpIHtcclxuICAgICAgICBhZGRab29tKGNoYXJ0LCBjaGFydEVsZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7XHJcbiAgICAgICAgb25SZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgICRzY29wZS4kb24oJ3BpcE1haW5SZXNpemVkJywgKCkgPT4ge1xyXG4gICAgICAgIG9uUmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gY2hhcnQ7XHJcbn0sICgpID0+IHtcclxuICAgIGRyYXdFbXB0eVN0YXRlKCk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gb25SZXNpemUoKSB7XHJcbiAgICBjaGFydC5oZWlnaHQoZ2V0SGVpZ2h0KCkgLSA1MCk7XHJcbiAgICBjaGFydEVsZW0uc3R5bGUoJ2hlaWdodCcsIChnZXRIZWlnaHQoKSAtIDUwKSArICdweCcpO1xyXG4gICAgY2hhcnQudXBkYXRlKCk7XHJcbiAgICBkcmF3RW1wdHlTdGF0ZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3RW1wdHlTdGF0ZSgpIHtcclxuICAgIGlmICghJGVsZW1lbnQuZmluZCgndGV4dC5udi1ub0RhdGEnKS5nZXQoMCkpIHtcclxuICAgICAgICBkMy5zZWxlY3QoJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJylbMF0pLnJlbW92ZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSAkZWxlbWVudC5maW5kKCcubGluZS1jaGFydCcpLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGVsZW1lbnQuZmluZCgnLmxpbmUtY2hhcnQnKS5pbm5lckhlaWdodCgpO1xyXG5cclxuICAgICAgICBpZiAoJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJykuZ2V0KDApKSB7XHJcbiAgICAgICAgICAgIGNoYXJ0RWxlbVxyXG4gICAgICAgICAgICAgICAgLnNlbGVjdCgnaW1hZ2UnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgKGNvbnRhaW5lcldpZHRoIC8gMTE1MSkgKyAnLCcgKyAoY29udGFpbmVySGVpZ2h0IC8gMjE2KSArICcpJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZGVmc1wiKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcInBhdHRlcm5cIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDEpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDEpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgXCIwXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgXCIwXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImlkXCIsIFwiYmdcIilcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJpbWFnZVwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCAxNylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgMClcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBcIjIxNnB4XCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBcIjExNTFweFwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgKGNvbnRhaW5lcldpZHRoIC8gMTE1MSkgKyAnLCcgKyAoY29udGFpbmVySGVpZ2h0IC8gMjE2KSArICcpJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwieGxpbms6aHJlZlwiLCBcImltYWdlcy9saW5lX2NoYXJ0X2VtcHR5X3N0YXRlLnN2Z1wiKTtcclxuXHJcbiAgICAgICAgICAgIGNoYXJ0RWxlbVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAuY2xhc3NlZCgnZW1wdHktc3RhdGUnLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIFwiMTAwJVwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgXCIxMDAlXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignZmlsbCcsICd1cmwoI2JnKScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlU2Nyb2xsKGRvbWFpbnMsIGJvdW5kYXJ5KSB7XHJcbiAgICB2YXIgYkRpZmYgPSBib3VuZGFyeVsxXSAtIGJvdW5kYXJ5WzBdLFxyXG4gICAgICAgIGRvbURpZmYgPSBkb21haW5zWzFdIC0gZG9tYWluc1swXSxcclxuICAgICAgICBpc0VxdWFsID0gKGRvbWFpbnNbMV0gLSBkb21haW5zWzBdKSAvIGJEaWZmID09PSAxO1xyXG5cclxuICAgICQoJGVsZW1lbnRbMF0pLmZpbmQoJy52aXN1YWwtc2Nyb2xsJylcclxuICAgICAgICAuY3NzKCdvcGFjaXR5JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXNFcXVhbCA/IDAgOiAxO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIGlmIChpc0VxdWFsKSByZXR1cm47XHJcblxyXG4gICAgJCgkZWxlbWVudFswXSkuZmluZCgnLnNjcm9sbGVkLWJsb2NrJylcclxuICAgICAgICAuY3NzKCdsZWZ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZG9tYWluc1swXSAvIGJEaWZmICogMTAwICsgJyUnO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNzcygnd2lkdGgnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkb21EaWZmIC8gYkRpZmYgKiAxMDAgKyAnJSc7XHJcbiAgICAgICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFpvb20oY2hhcnQsIHN2Zykge1xyXG4gICAgLy8gc2NhbGVFeHRlbnRcclxuICAgIHZhciBzY2FsZUV4dGVudCA9IDQ7XHJcblxyXG4gICAgLy8gcGFyYW1ldGVyc1xyXG4gICAgdmFyIHlBeGlzID0gbnVsbDtcclxuICAgIHZhciB4QXhpcyA9IG51bGw7XHJcbiAgICB2YXIgeERvbWFpbiA9IG51bGw7XHJcbiAgICB2YXIgeURvbWFpbiA9IG51bGw7XHJcbiAgICB2YXIgcmVkcmF3ID0gbnVsbDtcclxuICAgIHZhciBzdmcgPSBzdmc7XHJcblxyXG4gICAgLy8gc2NhbGVzXHJcbiAgICB2YXIgeFNjYWxlID0gbnVsbDtcclxuICAgIHZhciB5U2NhbGUgPSBudWxsO1xyXG5cclxuICAgIC8vIG1pbi9tYXggYm91bmRhcmllc1xyXG4gICAgdmFyIHhfYm91bmRhcnkgPSBudWxsO1xyXG4gICAgdmFyIHlfYm91bmRhcnkgPSBudWxsO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBkMyB6b29tIGhhbmRsZXJcclxuICAgIHZhciBkM3pvb20gPSBkMy5iZWhhdmlvci56b29tKCk7XHJcbiAgICB2YXIgcHJldlhEb21haW4gPSBudWxsO1xyXG4gICAgdmFyIHByZXZTY2FsZSA9IG51bGw7XHJcbiAgICB2YXIgcHJldlRyYW5zbGF0ZSA9IG51bGw7XHJcblxyXG4gICAgc2V0RGF0YShjaGFydCk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0RGF0YShuZXdDaGFydCkge1xyXG4gICAgICAgIC8vIHBhcmFtZXRlcnNcclxuICAgICAgICB5QXhpcyA9IG5ld0NoYXJ0LnlBeGlzO1xyXG4gICAgICAgIHhBeGlzID0gbmV3Q2hhcnQueEF4aXM7XHJcbiAgICAgICAgeERvbWFpbiA9IG5ld0NoYXJ0LnhEb21haW4gfHwgeEF4aXMuc2NhbGUoKS5kb21haW47XHJcbiAgICAgICAgeURvbWFpbiA9IG5ld0NoYXJ0LnlEb21haW4gfHwgeUF4aXMuc2NhbGUoKS5kb21haW47XHJcbiAgICAgICAgcmVkcmF3ID0gbmV3Q2hhcnQudXBkYXRlO1xyXG5cclxuICAgICAgICAvLyBzY2FsZXNcclxuICAgICAgICB4U2NhbGUgPSB4QXhpcy5zY2FsZSgpO1xyXG4gICAgICAgIHlTY2FsZSA9IHlBeGlzLnNjYWxlKCk7XHJcblxyXG4gICAgICAgIC8vIG1pbi9tYXggYm91bmRhcmllc1xyXG4gICAgICAgIHhfYm91bmRhcnkgPSB4QXhpcy5zY2FsZSgpLmRvbWFpbigpLnNsaWNlKCk7XHJcbiAgICAgICAgeV9ib3VuZGFyeSA9IHlBeGlzLnNjYWxlKCkuZG9tYWluKCkuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIGQzIHpvb20gaGFuZGxlclxyXG4gICAgICAgIHByZXZYRG9tYWluID0geF9ib3VuZGFyeTtcclxuICAgICAgICBwcmV2U2NhbGUgPSBkM3pvb20uc2NhbGUoKTtcclxuICAgICAgICBwcmV2VHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG5cclxuICAgICAgICAvLyBlbnN1cmUgbmljZSBheGlzXHJcbiAgICAgICAgeFNjYWxlLm5pY2UoKTtcclxuICAgICAgICB5U2NhbGUubmljZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpeCBkb21haW5cclxuICAgIGZ1bmN0aW9uIGZpeERvbWFpbihkb21haW4sIGJvdW5kYXJ5LCBzY2FsZSwgdHJhbnNsYXRlKSB7XHJcbiAgICAgICAgaWYgKGRvbWFpblswXSA8IGJvdW5kYXJ5WzBdKSB7XHJcbiAgICAgICAgICAgIGRvbWFpblswXSA9IGJvdW5kYXJ5WzBdO1xyXG4gICAgICAgICAgICBpZiAocHJldlhEb21haW5bMF0gIT09IGJvdW5kYXJ5WzBdIHx8IHNjYWxlICE9PSBwcmV2U2NhbGUpIHtcclxuICAgICAgICAgICAgICAgIGRvbWFpblsxXSArPSAoYm91bmRhcnlbMF0gLSBkb21haW5bMF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZG9tYWluWzFdID0gcHJldlhEb21haW5bMV07XHJcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBfLmNsb25lKHByZXZUcmFuc2xhdGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZG9tYWluWzFdID4gYm91bmRhcnlbMV0pIHtcclxuICAgICAgICAgICAgZG9tYWluWzFdID0gYm91bmRhcnlbMV07XHJcbiAgICAgICAgICAgIGlmIChwcmV2WERvbWFpblsxXSAhPT0gYm91bmRhcnlbMV0gfHwgc2NhbGUgIT09IHByZXZTY2FsZSkge1xyXG4gICAgICAgICAgICAgICAgZG9tYWluWzBdIC09IChkb21haW5bMV0gLSBib3VuZGFyeVsxXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkb21haW5bMF0gPSBwcmV2WERvbWFpblswXTtcclxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSA9IF8uY2xvbmUocHJldlRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGQzem9vbS50cmFuc2xhdGUodHJhbnNsYXRlKTtcclxuICAgICAgICBwcmV2WERvbWFpbiA9IF8uY2xvbmUoZG9tYWluKTtcclxuICAgICAgICBwcmV2U2NhbGUgPSBfLmNsb25lKHNjYWxlKTtcclxuICAgICAgICBwcmV2VHJhbnNsYXRlID0gXy5jbG9uZSh0cmFuc2xhdGUpO1xyXG4gICAgICAgIHJldHVybiBkb21haW47XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hhcnQoKSB7XHJcbiAgICAgICAgZDN6b29tLnNjYWxlKDEpO1xyXG4gICAgICAgIGQzem9vbS50cmFuc2xhdGUoWzAsIDBdKTtcclxuICAgICAgICB4U2NhbGUuZG9tYWluKHhfYm91bmRhcnkpO1xyXG4gICAgICAgIGQzem9vbS54KHhTY2FsZSkueSh5U2NhbGUpO1xyXG4gICAgICAgIHN2Zy5jYWxsKGQzem9vbSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gem9vbSBldmVudCBoYW5kbGVyXHJcbiAgICBmdW5jdGlvbiB6b29tZWQoKSB7XHJcbiAgICAgICAgLy8gU3dpdGNoIG9mZiB2ZXJ0aWNhbCB6b29taW5nIHRlbXBvcmFyeVxyXG4gICAgICAgIC8vIHlEb21haW4oeVNjYWxlLmRvbWFpbigpKTtcclxuXHJcbiAgICAgICAgaWYgKCggPCBhbnkgPiBkMy5ldmVudCkuc2NhbGUgPT09IDEpIHtcclxuICAgICAgICAgICAgdW56b29tZWQoKTtcclxuICAgICAgICAgICAgdXBkYXRlQ2hhcnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB4RG9tYWluKGZpeERvbWFpbih4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnksICggPCBhbnkgPiBkMy5ldmVudCkuc2NhbGUsICggPCBhbnkgPiBkMy5ldmVudCkudHJhbnNsYXRlKSk7XHJcbiAgICAgICAgICAgIHJlZHJhdygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlU2Nyb2xsKHhTY2FsZS5kb21haW4oKSwgeF9ib3VuZGFyeSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9cclxuICAgIHNldFpvb20gPSBmdW5jdGlvbiAod2hpY2gpIHtcclxuICAgICAgICB2YXIgY2VudGVyMCA9IFtzdmdbMF1bMF0uZ2V0QkJveCgpLndpZHRoIC8gMiwgc3ZnWzBdWzBdLmdldEJCb3goKS5oZWlnaHQgLyAyXTtcclxuICAgICAgICB2YXIgdHJhbnNsYXRlMCA9IGQzem9vbS50cmFuc2xhdGUoKSxcclxuICAgICAgICAgICAgY29vcmRpbmF0ZXMwID0gY29vcmRpbmF0ZXMoY2VudGVyMCk7XHJcblxyXG4gICAgICAgIGlmICh3aGljaCA9PT0gJ2luJykge1xyXG4gICAgICAgICAgICBpZiAocHJldlNjYWxlIDwgc2NhbGVFeHRlbnQpIGQzem9vbS5zY2FsZShwcmV2U2NhbGUgKyAwLjIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChwcmV2U2NhbGUgPiAxKSBkM3pvb20uc2NhbGUocHJldlNjYWxlIC0gMC4yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjZW50ZXIxID0gcG9pbnQoY29vcmRpbmF0ZXMwKTtcclxuICAgICAgICBkM3pvb20udHJhbnNsYXRlKFt0cmFuc2xhdGUwWzBdICsgY2VudGVyMFswXSAtIGNlbnRlcjFbMF0sIHRyYW5zbGF0ZTBbMV0gKyBjZW50ZXIwWzFdIC0gY2VudGVyMVsxXV0pO1xyXG5cclxuICAgICAgICBkM3pvb20uZXZlbnQoc3ZnKTtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gc3RlcCh3aGljaCkge1xyXG4gICAgICAgIHZhciB0cmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcblxyXG4gICAgICAgIGlmICh3aGljaCA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgICAgICB0cmFuc2xhdGVbMF0gLT0gMjA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJhbnNsYXRlWzBdICs9IDIwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZDN6b29tLnRyYW5zbGF0ZSh0cmFuc2xhdGUpO1xyXG4gICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvb3JkaW5hdGVzKHBvaW50KSB7XHJcbiAgICAgICAgdmFyIHNjYWxlID0gZDN6b29tLnNjYWxlKCksXHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZSA9IGQzem9vbS50cmFuc2xhdGUoKTtcclxuICAgICAgICByZXR1cm4gWyhwb2ludFswXSAtIHRyYW5zbGF0ZVswXSkgLyBzY2FsZSwgKHBvaW50WzFdIC0gdHJhbnNsYXRlWzFdKSAvIHNjYWxlXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwb2ludChjb29yZGluYXRlcykge1xyXG4gICAgICAgIHZhciBzY2FsZSA9IGQzem9vbS5zY2FsZSgpLFxyXG4gICAgICAgICAgICB0cmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcbiAgICAgICAgcmV0dXJuIFtjb29yZGluYXRlc1swXSAqIHNjYWxlICsgdHJhbnNsYXRlWzBdLCBjb29yZGluYXRlc1sxXSAqIHNjYWxlICsgdHJhbnNsYXRlWzFdXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBrZXlwcmVzcygpIHtcclxuICAgICAgICBzd2l0Y2ggKCggPCBhbnkgPiBkMy5ldmVudCkua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDM5OlxyXG4gICAgICAgICAgICAgICAgc3RlcCgncmlnaHQnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM3OlxyXG4gICAgICAgICAgICAgICAgc3RlcCgnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTA3OlxyXG4gICAgICAgICAgICAgICAgc2V0Wm9vbSgnaW4nKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDEwOTpcclxuICAgICAgICAgICAgICAgIHNldFpvb20oJ291dCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB6b29tIGV2ZW50IGhhbmRsZXJcclxuICAgIGZ1bmN0aW9uIHVuem9vbWVkKCkge1xyXG4gICAgICAgIHhEb21haW4oeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgcmVkcmF3KCk7XHJcbiAgICAgICAgZDN6b29tLnNjYWxlKDEpO1xyXG4gICAgICAgIGQzem9vbS50cmFuc2xhdGUoWzAsIDBdKTtcclxuICAgICAgICBwcmV2U2NhbGUgPSAxO1xyXG4gICAgICAgIHByZXZUcmFuc2xhdGUgPSBbMCwgMF07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSB3cmFwcGVyXHJcbiAgICBkM3pvb20ueCh4U2NhbGUpXHJcbiAgICAgICAgLnkoeVNjYWxlKVxyXG4gICAgICAgIC5zY2FsZUV4dGVudChbMSwgc2NhbGVFeHRlbnRdKVxyXG4gICAgICAgIC5vbignem9vbScsIHpvb21lZCk7XHJcblxyXG4gICAgLy8gYWRkIGhhbmRsZXJcclxuICAgIHN2Zy5jYWxsKGQzem9vbSkub24oJ2RibGNsaWNrLnpvb20nLCB1bnpvb21lZCk7XHJcbiAgICAkKCRlbGVtZW50LmdldCgwKSkuYWRkQ2xhc3MoJ2R5bmFtaWMnKTtcclxuXHJcbiAgICAvLyBhZGQga2V5Ym9hcmQgaGFuZGxlcnNcclxuICAgIHN2Z1xyXG4gICAgICAgIC5hdHRyKCdmb2N1c2FibGUnLCBmYWxzZSlcclxuICAgICAgICAuc3R5bGUoJ291dGxpbmUnLCAnbm9uZScpXHJcbiAgICAgICAgLm9uKCdrZXlkb3duJywga2V5cHJlc3MpXHJcbiAgICAgICAgLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHt9KTtcclxuXHJcbiAgICB2YXIgZ2V0WE1pbk1heCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIG1heFZhbCwgbWluVmFsID0gbnVsbDtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghZGF0YVtpXS5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBNaW5WYWwgPSBkMy5tYXgoZGF0YVtpXS52YWx1ZXMsIGZ1bmN0aW9uIChkOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0ueEZvcm1hdCA/IHZtLnhGb3JtYXQoZC54KSA6IGQueDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBNYXhWYWwgPSBkMy5taW4oZGF0YVtpXS52YWx1ZXMsIGZ1bmN0aW9uIChkOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0ueEZvcm1hdCA/IHZtLnhGb3JtYXQoZC54KSA6IGQueDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbWluVmFsID0gKCFtaW5WYWwgfHwgdGVtcE1pblZhbCA8IG1pblZhbCkgPyB0ZW1wTWluVmFsIDogbWluVmFsO1xyXG4gICAgICAgICAgICAgICAgbWF4VmFsID0gKCFtYXhWYWwgfHwgdGVtcE1heFZhbCA+IG1heFZhbCkgPyB0ZW1wTWF4VmFsIDogbWF4VmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbbWF4VmFsLCBtaW5WYWxdO1xyXG4gICAgfTtcclxuXHJcbiAgICB1cGRhdGVab29tT3B0aW9ucyA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgeUF4aXMgPSBjaGFydC55QXhpcztcclxuICAgICAgICB4QXhpcyA9IGNoYXJ0LnhBeGlzO1xyXG5cclxuICAgICAgICB4U2NhbGUgPSB4QXhpcy5zY2FsZSgpO1xyXG4gICAgICAgIHlTY2FsZSA9IHlBeGlzLnNjYWxlKCk7XHJcblxyXG4gICAgICAgIHhfYm91bmRhcnkgPSBnZXRYTWluTWF4KGRhdGEpO1xyXG5cclxuICAgICAgICBpZiAoZDN6b29tLnNjYWxlKCkgPT09IDEpIHtcclxuICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKS55KHlTY2FsZSk7XHJcbiAgICAgICAgICAgIHN2Zy5jYWxsKGQzem9vbSk7XHJcbiAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlU2Nyb2xsKHhTY2FsZS5kb21haW4oKSwgeF9ib3VuZGFyeSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0cyBwYWxldHRlIGNvbG9yIG5hbWUgaW50byBSR0JBIGNvbG9yIHJlcHJlc2VudGF0aW9uLlxyXG4gKiBTaG91bGQgYnkgcmVwbGFjZWQgYnkgcGFsZXR0ZSBmb3IgY2hhcnRzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgICAgTmFtZSBvZiBjb2xvciBmcm9tIEFNIHBhbGV0dGVcclxuICogQHJldHVybnMge3N0cmluZ30gUkdCYSBmb3JtYXRcclxuICovXHJcbi8qXHJcbmZ1bmN0aW9uIG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3IpIHtcclxuICAgIHJldHVybiAncmdiYSgnICsgJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzBdICsgJywnICtcclxuICAgICAgICAkbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMV0gKyAnLCcgK1xyXG4gICAgICAgICRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVsyXSArICcsJyArXHJcbiAgICAgICAgKCRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVszXSB8fCAxKSArICcpJztcclxufVxyXG5cclxuLyoqXHJcbiAqIEhlbHBmdWwgbWV0aG9kXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG4vKlxyXG5mdW5jdGlvbiBnZXRNYXRlcmlhbENvbG9yKGluZGV4KSB7XHJcbiAgICBpZiAoIWNvbG9ycyB8fCBjb2xvcnMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgaWYgKGluZGV4ID49IGNvbG9ycy5sZW5ndGgpIHtcclxuICAgICAgICBpbmRleCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3JzW2luZGV4XSk7XHJcbn1cclxuLyoqXHJcbiAqIEhlbHBmdWwgbWV0aG9kXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG4vKlxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZtLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdm0uZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbG9yID0gaXRlbS5jb2xvciB8fCBnZXRNYXRlcmlhbENvbG9yKGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuKi8iLCJpbXBvcnQge1xyXG4gICAgSUNoYXJ0c1V0aWxpdHlTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vdXRpbGl0eS9JQ2hhcnRzVXRpbGl0eVNlcnZpY2UnO1xyXG5cclxue1xyXG4gICAgaW50ZXJmYWNlIElQaWVDaGFydEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHNlcmllczogYW55O1xyXG4gICAgICAgIGRvbnV0OiBhbnk7XHJcbiAgICAgICAgbGVnZW5kOiBhbnk7XHJcbiAgICAgICAgdG90YWw6IGFueTtcclxuICAgICAgICBzaXplOiBhbnk7XHJcbiAgICAgICAgY2VudGVyZWQ6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBQaWVDaGFydEJpbmRpbmdzOiBJUGllQ2hhcnRCaW5kaW5ncyA9IHtcclxuICAgICAgICBzZXJpZXM6ICc8cGlwU2VyaWVzJyxcclxuICAgICAgICBkb251dDogJzw/cGlwRG9udXQnLFxyXG4gICAgICAgIGxlZ2VuZDogJzw/cGlwU2hvd0xlZ2VuZCcsXHJcbiAgICAgICAgdG90YWw6ICc8P3BpcFNob3dUb3RhbCcsXHJcbiAgICAgICAgc2l6ZTogJzw/cGlwUGllU2l6ZScsXHJcbiAgICAgICAgY2VudGVyZWQ6ICc8P3BpcENlbnRlcmVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFBpZUNoYXJ0QmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSVBpZUNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgc2VyaWVzOiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICBkb251dDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIGxlZ2VuZDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIHRvdGFsOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgc2l6ZTogbmcuSUNoYW5nZXNPYmplY3QgPCBudW1iZXIgfCBzdHJpbmcgPiA7XHJcbiAgICAgICAgY2VudGVyZWQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBQaWVDaGFydENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSVBpZUNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIHB1YmxpYyBzZXJpZXM6IGFueTtcclxuICAgICAgICBwdWJsaWMgZG9udXQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBwdWJsaWMgbGVnZW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICBwdWJsaWMgdG90YWw6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyBzaXplOiBudW1iZXIgfCBzdHJpbmcgPSAyNTA7XHJcbiAgICAgICAgcHVibGljIGNlbnRlcmVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGF0YTogYW55O1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnQ6IG52LlBpZUNoYXJ0ID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIGNoYXJ0RWxlbTogYW55O1xyXG4gICAgICAgIHByaXZhdGUgdGl0bGVFbGVtOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBjb2xvcnM6IHN0cmluZ1tdO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgICAgICBwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLFxyXG4gICAgICAgICAgICBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgcGlwQ2hhcnRzVXRpbGl0eTogSUNoYXJ0c1V0aWxpdHlTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzID0gdGhpcy5waXBDaGFydHNVdGlsaXR5LmdlbmVyYXRlTWF0ZXJpYWxDb2xvcnMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25Jbml0KCkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnNlcmllcztcclxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcbiAgICAgICAgICAgICggPCBhbnkgPiBkMy5zY2FsZSkucGFsZXR0ZUNvbG9ycyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkMy5zY2FsZS5vcmRpbmFsKCkucmFuZ2UodGhpcy5jb2xvcnMubWFwKChjb2xvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBpcENoYXJ0c1V0aWxpdHkubWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcik7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluc3RhbnRpYXRlQ2hhcnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IFBpZUNoYXJ0QmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVnZW5kID0gY2hhbmdlcy5sZWdlbmQgPyBjaGFuZ2VzLmxlZ2VuZC5jdXJyZW50VmFsdWUgOiB0aGlzLmxlZ2VuZDtcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXJlZCA9IGNoYW5nZXMuY2VudGVyZWQgPyBjaGFuZ2VzLmNlbnRlcmVkLmN1cnJlbnRWYWx1ZSA6IHRoaXMuY2VudGVyZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuZG9udXQgPSBjaGFuZ2VzLmRvbnV0ID8gY2hhbmdlcy5kb251dC5jdXJyZW50VmFsdWUgOiB0aGlzLmRvbnV0O1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSBjaGFuZ2VzLnNpemUgPyBjaGFuZ2VzLnNpemUuY3VycmVudFZhbHVlIDogdGhpcy5zaXplO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsID0gY2hhbmdlcy50b3RhbCA/IGNoYW5nZXMudG90YWwuY3VycmVudFZhbHVlIDogdGhpcy50b3RhbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnNlcmllcyAmJiBjaGFuZ2VzLnNlcmllcy5jdXJyZW50VmFsdWUgIT09IGNoYW5nZXMuc2VyaWVzLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGNoYW5nZXMuc2VyaWVzLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0uZGF0dW0odGhpcy5kYXRhKS5jYWxsKHRoaXMuY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZVRpdGxlTGFiZWxVbndyYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbnN0YW50aWF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICBudi5hZGRHcmFwaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0ID0gbnYubW9kZWxzLnBpZUNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAubWFyZ2luKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAueCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kb251dCA/IGQudmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnkoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KE51bWJlcih0aGlzLnNpemUpKVxyXG4gICAgICAgICAgICAgICAgICAgIC53aWR0aChOdW1iZXIodGhpcy5zaXplKSlcclxuICAgICAgICAgICAgICAgICAgICAuc2hvd0xhYmVscyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5sYWJlbFRocmVzaG9sZCguMDAxKVxyXG4gICAgICAgICAgICAgICAgICAgIC5ncm93T25Ib3ZlcihmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAuZG9udXQodGhpcy5kb251dClcclxuICAgICAgICAgICAgICAgICAgICAuZG9udXRSYXRpbygwLjUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNvbG9yKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmNvbG9yIHx8ICggPCBhbnkgPiBkMy5zY2FsZSkucGFsZXR0ZUNvbG9ycygpLnJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydC50b29sdGlwLmVuYWJsZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydC5ub0RhdGEoJ1RoZXJlIGlzIG5vIGRhdGEgcmlnaHQgbm93Li4uJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnNob3dMZWdlbmQoZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtID0gZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5waWUtY2hhcnQnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnaGVpZ2h0JywgKHRoaXMuc2l6ZSkgKyAncHgnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnd2lkdGgnLCB0aGlzLmNlbnRlcmVkID8gJzEwMCUnIDogKHRoaXMuc2l6ZSkgKyAncHgnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ3N2ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMClcclxuICAgICAgICAgICAgICAgICAgICAuZGF0dW0odGhpcy5kYXRhIHx8IFtdKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKHRoaXMuY2hhcnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFydC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNpemVUaXRsZUxhYmVsVW53cmFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jZW50ZXJDaGFydCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKS5zZWxlY3QoJy5waWUtY2hhcnQgc3ZnJylbMF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcnQ7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN2Z0VsZW0gPSBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLnBpZS1jaGFydCBzdmcnKVswXVswXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRvdGFsTGFiZWwoc3ZnRWxlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHN2Z0VsZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50cmFuc2l0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmR1cmF0aW9uKDEwMDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNpemVUaXRsZUxhYmVsVW53cmFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgODAwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNlbnRlckNoYXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RW1wdHlTdGF0ZShzdmdFbGVtKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZHJhd0VtcHR5U3RhdGUoc3ZnKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy4kZWxlbWVudC5maW5kKCd0ZXh0Lm52LW5vRGF0YScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJylbMF0pLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcucGlwLWVtcHR5LXBpZS10ZXh0JykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5maW5kKCcucGlwLWVtcHR5LXBpZS10ZXh0JykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcucGllLWNoYXJ0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcIjxkaXYgY2xhc3M9J3BpcC1lbXB0eS1waWUtdGV4dCc+VGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGllID0gZDMubGF5b3V0LnBpZSgpLnNvcnQobnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IE51bWJlcih0aGlzLnNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGFyYyA9IGQzLnN2Zy5hcmMoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5pbm5lclJhZGl1cyhzaXplIC8gMiAtIDIwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vdXRlclJhZGl1cyhzaXplIC8gMiAtIDU3KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdmcgPSBkMy5zZWxlY3Qoc3ZnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2VtcHR5LXN0YXRlJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgXCJ0cmFuc2xhdGUoXCIgKyBzaXplIC8gMiArIFwiLFwiICsgc2l6ZSAvIDIgKyBcIilcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IHN2Zy5zZWxlY3RBbGwoXCJwYXRoXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGEocGllKFsxXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwicGF0aFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcInJnYmEoMCwgMCwgMCwgMC4wOClcIilcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgPCBhbnkgPiBhcmMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNlbnRlckNoYXJ0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jZW50ZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3ZnRWxlbSA9IGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnRNYXJnaW4gPSAkKHN2Z0VsZW0pLmlubmVyV2lkdGgoKSAvIDIgLSAoTnVtYmVyKHRoaXMuc2l6ZSkgfHwgMjUwKSAvIDI7XHJcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5maW5kKCcubnYtcGllQ2hhcnQnKVswXSkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbGVmdE1hcmdpbiArICcsIDApJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVuZGVyVG90YWxMYWJlbChzdmdFbGVtKSB7XHJcbiAgICAgICAgICAgIGlmICgoIXRoaXMudG90YWwgJiYgIXRoaXMuZG9udXQpIHx8ICF0aGlzLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCB0b3RhbFZhbCA9IHRoaXMuZGF0YS5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgY3Vycikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1bSArIGN1cnIudmFsdWU7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRvdGFsVmFsID49IDEwMDAwKSB0b3RhbFZhbCA9ICh0b3RhbFZhbCAvIDEwMDApLnRvRml4ZWQoMSkgKyAnayc7XHJcblxyXG4gICAgICAgICAgICBkMy5zZWxlY3Qoc3ZnRWxlbSlcclxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5udi1waWU6bm90KC5udmQzKScpXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcclxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdsYWJlbC10b3RhbCcsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcclxuICAgICAgICAgICAgICAgIC5zdHlsZSgnZG9taW5hbnQtYmFzZWxpbmUnLCAnY2VudHJhbCcpXHJcbiAgICAgICAgICAgICAgICAudGV4dCh0b3RhbFZhbCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRpdGxlRWxlbSA9IGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmZpbmQoJ3RleHQubGFiZWwtdG90YWwnKS5nZXQoMCkpLnN0eWxlKCdvcGFjaXR5JywgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlc2l6ZVRpdGxlTGFiZWxVbndyYXAoKSB7XHJcbiAgICAgICAgICAgIGlmICgoIXRoaXMudG90YWwgJiYgIXRoaXMuZG9udXQpIHx8ICF0aGlzLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGJveFNpemUgPSAoIDwgYW55ID4gdGhpcy4kZWxlbWVudC5maW5kKCcubnZkMy5udi1waWVDaGFydCcpLmdldCgwKSkuZ2V0QkJveCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFib3hTaXplLndpZHRoIHx8ICFib3hTaXplLmhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRpdGxlRWxlbS5zdHlsZSgnZm9udC1zaXplJywgfn5ib3hTaXplLndpZHRoIC8gNC41KS5zdHlsZSgnb3BhY2l0eScsIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZGF0YSwgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0uY29sb3IgfHwgdGhpcy5waXBDaGFydHNVdGlsaXR5LmdldE1hdGVyaWFsQ29sb3IoaW5kZXgsIHRoaXMuY29sb3JzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBQaWVDaGFydDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IFBpZUNoYXJ0QmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwaWUvcGllQ2hhcnQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogUGllQ2hhcnRDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcFBpZUNoYXJ0cycsIFtdKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcFBpZUNoYXJ0JywgUGllQ2hhcnQpO1xyXG59IiwiaW1wb3J0IHtcclxuICAgIElDaGFydHNVdGlsaXR5U2VydmljZVxyXG59IGZyb20gJy4vSUNoYXJ0c1V0aWxpdHlTZXJ2aWNlJztcclxuXHJcbntcclxuICAgIGNsYXNzIENoYXJ0c1V0aWxpdHlTZXJ2aWNlIGltcGxlbWVudHMgSUNoYXJ0c1V0aWxpdHlTZXJ2aWNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkbWRDb2xvclBhbGV0dGU6IGFuZ3VsYXIubWF0ZXJpYWwuSUNvbG9yUGFsZXR0ZVxyXG4gICAgICAgICkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXRlcmlhbENvbG9yKGluZGV4OiBudW1iZXIsIGNvbG9yczogc3RyaW5nW10pOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBpZiAoIWNvbG9ycyB8fCBjb2xvcnMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiAncmdiYSgnICsgdGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMF0gKyAnLCcgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMV0gKyAnLCcgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMl0gKyAnLCcgK1xyXG4gICAgICAgICAgICAgICAgKHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzNdIHx8IDEpICsgJyknO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdlbmVyYXRlTWF0ZXJpYWxDb2xvcnMoKTogc3RyaW5nW10ge1xyXG4gICAgICAgICAgICBsZXQgY29sb3JzID0gXy5tYXAoKDxhbnk+dGhpcy4kbWRDb2xvclBhbGV0dGUpLCAocGFsZXR0ZSwgY29sb3I6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29sb3JzID0gXy5maWx0ZXIoY29sb3JzLCAoY29sb3I6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNPYmplY3QodGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdKSAmJiBfLmlzT2JqZWN0KHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdKSAmJiBfLmlzQXJyYXkodGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb2xvcnM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBDaGFydHNVdGlsaXR5JywgW10pXHJcbiAgICAgICAgLnNlcnZpY2UoJ3BpcENoYXJ0c1V0aWxpdHknLCBDaGFydHNVdGlsaXR5U2VydmljZSk7XHJcbn0iLCIoZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnYmFyL2JhckNoYXJ0Lmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwiYmFyLWNoYXJ0XCI+XFxuJyArXG4gICAgJyAgICA8c3ZnID48L3N2Zz5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8cGlwLWNoYXJ0LWxlZ2VuZCBuZy1zaG93PVwiJGN0cmwubGVnZW5kXCIgcGlwLXNlcmllcz1cIiRjdHJsLmxlZ2VuZFwiIHBpcC1pbnRlcmFjdGl2ZT1cIiRjdHJsLmludGVyYWN0aXZlTGVnZW5kXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2xlZ2VuZC9pbnRlcmFjdGl2ZUxlZ2VuZC5odG1sJyxcbiAgICAnPGRpdiA+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiY2hhcnQtbGVnZW5kLWl0ZW1cIiBuZy1yZXBlYXQ9XCJpdGVtIGluICRjdHJsLnNlcmllc1wiIG5nLXNob3c9XCJpdGVtLnZhbHVlcyB8fCBpdGVtLnZhbHVlXCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWNoZWNrYm94IG5nLW1vZGVsPVwiaXRlbS5kaXNhYmxlZFwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgIG5nLXRydWUtdmFsdWU9XCJmYWxzZVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgIG5nLWZhbHNlLXZhbHVlPVwidHJ1ZVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgIG5nLWlmPVwiJGN0cmwuaW50ZXJhY3RpdmVcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwie3sgaXRlbS5sYWJlbCB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8cCBjbGFzcz1cImxlZ2VuZC1pdGVtLXZhbHVlXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWlmPVwiaXRlbS52YWx1ZVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgIG5nLXN0eWxlPVwie1xcJ2JhY2tncm91bmQtY29sb3JcXCc6IGl0ZW0uY29sb3J9XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICB7eyBpdGVtLnZhbHVlIH19XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvcD5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHAgY2xhc3M9XCJsZWdlbmQtaXRlbS1sYWJlbFwiPnt7OjogaXRlbS5sYWJlbCB8fCBpdGVtLmtleSB9fTwvcD5cXG4nICtcbiAgICAnICAgICAgICA8L21kLWNoZWNrYm94PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICA8ZGl2IG5nLWlmPVwiISRjdHJsLmludGVyYWN0aXZlXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYnVsbGV0XCIgbmctc3R5bGU9XCJ7XFwnYmFja2dyb3VuZC1jb2xvclxcJzogaXRlbS5jb2xvcn1cIj48L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxzcGFuPnt7OjogaXRlbS5sYWJlbCB8fCBpdGVtLmtleX19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2xpbmUvbGluZUNoYXJ0Lmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwibGluZS1jaGFydFwiIGZsZXg9XCJhdXRvXCIgbGF5b3V0PVwiY29sdW1uXCI+XFxuJyArXG4gICAgJyAgICA8c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCIgbmctY2xhc3M9XCJ7XFwndmlzaWJsZS14LWF4aXNcXCc6ICRjdHJsLnNob3dYQXhpcywgXFwndmlzaWJsZS15LWF4aXNcXCc6ICRjdHJsLnNob3dZQXhpc31cIj5cXG4nICtcbiAgICAnICAgIDwvc3ZnPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInNjcm9sbC1jb250YWluZXJcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidmlzdWFsLXNjcm9sbFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsZWQtYmxvY2tcIj48L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWZhYiBtZC1taW5pIG1pbnVzLWJ1dHRvblwiIG5nLWNsaWNrPVwiJGN0cmwuem9vbU91dCgpXCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51cy1jaXJjbGVcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1mYWIgbWQtbWluaSBwbHVzLWJ1dHRvblwiIG5nLWNsaWNrPVwiJGN0cmwuem9vbUluKClcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXMtY2lyY2xlXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHBpcC1jaGFydC1sZWdlbmQgcGlwLXNlcmllcz1cIiRjdHJsLmxlZ2VuZFwiIHBpcC1pbnRlcmFjdGl2ZT1cIiRjdHJsLmludGVyYWN0aXZlTGVnZW5kXCI+PC9waXAtY2hhcnQtbGVnZW5kPlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdwaWUvcGllQ2hhcnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaWUtY2hhcnRcIiBjbGFzcz1cImxheW91dC1jb2x1bW4gZmxleC1hdXRvXCIgbmctY2xhc3M9XCJ7XFwnY2lyY2xlXFwnOiAhJGN0cmwuZG9udXR9XCI+XFxuJyArXG4gICAgJyAgICA8c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCI+PC9zdmc+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHBpcC1jaGFydC1sZWdlbmQgcGlwLXNlcmllcz1cIiRjdHJsLmRhdGFcIiBwaXAtaW50ZXJhY3RpdmU9XCJmYWxzZVwiIG5nLWlmPVwiJGN0cmwubGVnZW5kXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWNoYXJ0cy1odG1sLmpzLm1hcFxuIl19