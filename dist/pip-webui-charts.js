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
        BarChartController.$inject = ['$element', '$scope', '$timeout', 'pipChartColors'];
        function BarChartController($element, $scope, $timeout, pipChartColors) {
            "ngInject";
            var _this = this;
            this.$element = $element;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipChartColors = pipChartColors;
            this.chart = null;
            this.height = 270;
            this.colors = this.pipChartColors.generateMaterialColors();
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
                    return _this.pipChartColors.materialColorToRgba(color);
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
                    return _this.data[d.series].color || _this.pipChartColors.materialColorToRgba(_this.colors[d.series]);
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
                    item.values[0].color = item.values[0].color || _this.pipChartColors.getMaterialColor(index, _this.colors);
                    item.color = item.values[0].color;
                }
            });
        };
        return BarChartController;
    }());
    var BarChart = {
        bindings: BarChartBindings,
        templateUrl: 'bar_chart/BarChart.html',
        controller: BarChartController
    };
    angular
        .module('pipBarCharts', [])
        .component('pipBarChart', BarChart);
}
},{}],2:[function(require,module,exports){
"use strict";
{
    var ChartColorsService = (function () {
        ChartColorsService.$inject = ['$mdColorPalette'];
        function ChartColorsService($mdColorPalette) {
            "ngInject";
            this.$mdColorPalette = $mdColorPalette;
        }
        ChartColorsService.prototype.getMaterialColor = function (index, colors) {
            if (!colors || colors.length < 1)
                return null;
            if (index >= colors.length) {
                index = 0;
            }
            return this.materialColorToRgba(colors[index]);
        };
        ChartColorsService.prototype.materialColorToRgba = function (color) {
            return 'rgba(' + this.$mdColorPalette[color][500].value[0] + ',' +
                this.$mdColorPalette[color][500].value[1] + ',' +
                this.$mdColorPalette[color][500].value[2] + ',' +
                (this.$mdColorPalette[color][500].value[3] || 1) + ')';
        };
        ChartColorsService.prototype.generateMaterialColors = function () {
            var _this = this;
            var colors = _.map(this.$mdColorPalette, function (palette, color) {
                return color;
            });
            colors = _.filter(colors, function (color) {
                return _.isObject(_this.$mdColorPalette[color]) && _.isObject(_this.$mdColorPalette[color][500]) && _.isArray(_this.$mdColorPalette[color][500].value);
            });
            return colors;
        };
        return ChartColorsService;
    }());
    angular
        .module('pipChartColors', [])
        .service('pipChartColors', ChartColorsService);
}
},{}],3:[function(require,module,exports){
"use strict";
},{}],4:[function(require,module,exports){
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
        ChartLegendController.$inject = ['$element', '$scope', '$timeout', 'pipChartColors'];
        function ChartLegendController($element, $scope, $timeout, pipChartColors) {
            "ngInject";
            this.$element = $element;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipChartColors = pipChartColors;
            this.colors = this.pipChartColors.generateMaterialColors();
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
                var materialColor = _this.pipChartColors.getMaterialColor(index, _this.colors);
                item.color = item.color || (item.values && item.values[0] && item.values[0].color ? item.values[0].color : materialColor);
                item.disabled = item.disabled || false;
            });
        };
        return ChartLegendController;
    }());
    var ChartLegend = {
        bindings: ChartLegendBindings,
        templateUrl: 'chart_legend/ChartInteractiveLegend.html',
        controller: ChartLegendController
    };
    angular
        .module('pipChartLegends', [])
        .component('pipChartLegend', ChartLegend);
}
},{}],5:[function(require,module,exports){
angular.module('pipCharts', [
    'pipBarCharts',
    'pipLineCharts',
    'pipPieCharts',
    'pipChartLegends',
    'pipChartColors',
    'pipCharts.Templates'
]);
},{}],6:[function(require,module,exports){
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
        LineChartController.$inject = ['$element', '$scope', '$timeout', 'pipChartColors'];
        function LineChartController($element, $scope, $timeout, pipChartColors) {
            "ngInject";
            var _this = this;
            this.$element = $element;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipChartColors = pipChartColors;
            this.HEIGHT = 270;
            this.chart = null;
            this.chartElem = null;
            this.setZoom = null;
            this.updateZoomOptions = null;
            this.fixedHeight = this.HEIGHT;
            this.dynamicHeight = false;
            this.minHeight = this.HEIGHT;
            this.maxHeight = this.HEIGHT;
            this.showYAxis = true;
            this.showXAxis = true;
            this.dynamic = false;
            this.interactiveLegend = false;
            this.colors = this.pipChartColors.generateMaterialColors();
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
                    return _this.pipChartColors.materialColorToRgba(color);
                }));
            };
            this.instantiateChart();
        };
        LineChartController.prototype.$onChanges = function (changes) {
            this.fixedHeight = changes.fixedHeight ? changes.fixedHeight.currentValue : this.HEIGHT;
            this.minHeight = changes.minHeight ? changes.minHeight.currentValue : this.HEIGHT;
            this.maxHeight = changes.maxHeight ? changes.maxHeight.currentValue : this.HEIGHT;
            this.dynamicHeight = changes.dynamicHeight ? changes.dynamicHeight.currentValue : this.dynamicHeight;
            this.showXAxis = changes.showXAxis ? changes.showXAxis.currentValue : this.showXAxis;
            this.showYAxis = changes.showYAxis ? changes.showYAxis.currentValue : this.showYAxis;
            this.dynamic = changes.dynamic ? changes.dynamic.currentValue : this.dynamic;
            this.interactiveLegend = changes.interactiveLegend ? changes.interactiveLegend.currentValue : this.interactiveLegend;
            this.xFormat = changes.xFormat ? changes.xFormat.currentValue : this.xFormat;
            this.xTickFormat = changes.xTickFormat ? changes.xTickFormat.currentValue : this.xTickFormat;
            this.yTickFormat = changes.yTickFormat ? changes.yTickFormat.currentValue : this.yTickFormat;
            if (changes.xTickValues && changes.xTickValues.currentValue !== changes.xTickValues.previousValue) {
                this.xTickValues = changes.xTickValues.currentValue;
                this.updateXTickValues();
                if (this.chartElem && this.chart)
                    this.chartElem.datum(this.data || []).call(this.chart);
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
            var bDiff = boundary[1] - boundary[0], domDiff = domains[1] - domains[0], isEqual = domDiff / bDiff === 1;
            $(this.$element[0]).find('.visual-scroll')
                .css('opacity', function () {
                return isEqual ? 0 : 1;
            });
            if (isEqual)
                return;
            $(this.$element[0]).find('.scrolled-block')
                .css('left', function () {
                return (domains[0] - boundary[0]) / bDiff * 100 + '%';
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
                item.color = item.color || _this.pipChartColors.getMaterialColor(index, _this.colors);
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
        templateUrl: 'line_chart/LineChart.html',
        controller: LineChartController
    };
    angular
        .module('pipLineCharts', [])
        .component('pipLineChart', LineChart);
}
},{}],7:[function(require,module,exports){
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
        PieChartController.$inject = ['$element', '$scope', '$timeout', 'pipChartColors'];
        function PieChartController($element, $scope, $timeout, pipChartColors) {
            "ngInject";
            this.$element = $element;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipChartColors = pipChartColors;
            this.donut = false;
            this.legend = true;
            this.total = true;
            this.size = 250;
            this.centered = false;
            this.chart = null;
            this.colors = this.pipChartColors.generateMaterialColors();
        }
        PieChartController.prototype.$onInit = function () {
            var _this = this;
            this.data = this.series;
            this.generateParameterColor();
            d3.scale.paletteColors = function () {
                return d3.scale.ordinal().range(_this.colors.map(function (color) {
                    return _this.pipChartColors.materialColorToRgba(color);
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
                item.color = item.color || _this.pipChartColors.getMaterialColor(index, _this.colors);
            });
        };
        return PieChartController;
    }());
    var PieChart = {
        bindings: PieChartBindings,
        templateUrl: 'pie_chart/PieChart.html',
        controller: PieChartController
    };
    angular
        .module('pipPieCharts', [])
        .component('pipPieChart', PieChart);
}
},{}],8:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('bar_chart/BarChart.html',
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
  $templateCache.put('chart_legend/ChartInteractiveLegend.html',
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
  $templateCache.put('pie_chart/PieChart.html',
    '<div class="pie-chart" class="layout-column flex-auto" ng-class="{\'circle\': !$ctrl.donut}">\n' +
    '    <svg class="flex-auto"></svg>\n' +
    '</div>\n' +
    '\n' +
    '<pip-chart-legend pip-series="$ctrl.data" pip-interactive="false" ng-if="$ctrl.legend"></pip-chart-legend>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipCharts.Templates');
} catch (e) {
  module = angular.module('pipCharts.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('line_chart/LineChart.html',
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



},{}]},{},[8,1,2,3,4,5,6,7])(8)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYmFyX2NoYXJ0L0JhckNoYXJ0LnRzIiwic3JjL2NoYXJ0X2NvbG9ycy9DaGFydENvbG9yc1NlcnZpY2UudHMiLCJzcmMvY2hhcnRfbGVnZW5kL0NoYXJ0SW50ZXJhY3RpdmVMZWdlbmQudHMiLCJzcmMvaW5kZXgudHMiLCJzcmMvbGluZV9jaGFydC9MaW5lQ2hhcnQudHMiLCJzcmMvcGllX2NoYXJ0L1BpZUNoYXJ0LnRzIiwidGVtcC9waXAtd2VidWktY2hhcnRzLWh0bWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDRUEsQ0FBQztJQVVHLElBQU0sZ0JBQWdCLEdBQXNCO1FBQ3hDLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0IsV0FBVyxFQUFFLGtCQUFrQjtRQUMvQixpQkFBaUIsRUFBRSxrQkFBa0I7S0FDeEMsQ0FBQTtJQUVEO1FBQUE7UUFPQSxDQUFDO1FBQUQsOEJBQUM7SUFBRCxDQVBBLEFBT0MsSUFBQTtJQUVEO1FBYUksNEJBQ1ksUUFBZ0IsRUFDaEIsTUFBaUIsRUFDakIsUUFBNEIsRUFDNUIsY0FBbUM7WUFFM0MsVUFBVSxDQUFDO1lBTmYsaUJBaUJDO1lBaEJXLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBVztZQUNqQixhQUFRLEdBQVIsUUFBUSxDQUFvQjtZQUM1QixtQkFBYyxHQUFkLGNBQWMsQ0FBcUI7WUFUdkMsVUFBSyxHQUF3QixJQUFJLENBQUM7WUFHbEMsV0FBTSxHQUFXLEdBQUcsQ0FBQztZQVV6QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUMzRCxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxVQUFDLGFBQWE7Z0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO29CQUFD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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7IElDaGFydENvbG9yc1NlcnZpY2UgfSBmcm9tICcuLi9jaGFydF9jb2xvcnMvSUNoYXJ0Q29sb3JzU2VydmljZSc7XHJcblxyXG57XHJcbiAgICBpbnRlcmZhY2UgSUJhckNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgc2VyaWVzOiBhbnk7XHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6IGFueTtcclxuICAgICAgICB5VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgQmFyQ2hhcnRCaW5kaW5nczogSUJhckNoYXJ0QmluZGluZ3MgPSB7XHJcbiAgICAgICAgc2VyaWVzOiAnPHBpcFNlcmllcycsXHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6ICc8P3BpcFhUaWNrRm9ybWF0JyxcclxuICAgICAgICB5VGlja0Zvcm1hdDogJzw/cGlwWVRpY2tGb3JtYXQnLFxyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiAnPD9waXBJbnRlckxlZ2VuZCdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBCYXJDaGFydEJpbmRpbmdzQ2hhbmdlcyBpbXBsZW1lbnRzIElCYXJDaGFydEJpbmRpbmdzLCBuZy5JT25DaGFuZ2VzT2JqZWN0IHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHNlcmllczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIHlUaWNrRm9ybWF0OiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICBpbnRlcmFjdGl2ZUxlZ2VuZDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIEJhckNoYXJ0Q29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJQmFyQ2hhcnRCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHNlcmllczogYW55O1xyXG4gICAgICAgIHB1YmxpYyB4VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIHB1YmxpYyB5VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIHB1YmxpYyBpbnRlcmFjdGl2ZUxlZ2VuZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgbGVnZW5kOiBhbnk7XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGF0YTogYW55O1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnQ6IG52LkRpc2NyZXRlQmFyQ2hhcnQgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnRFbGVtOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBjb2xvcnM6IHN0cmluZ1tdO1xyXG4gICAgICAgIHByaXZhdGUgaGVpZ2h0OiBudW1iZXIgPSAyNzA7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSBwaXBDaGFydENvbG9yczogSUNoYXJ0Q29sb3JzU2VydmljZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNvbG9ycyA9IHRoaXMucGlwQ2hhcnRDb2xvcnMuZ2VuZXJhdGVNYXRlcmlhbENvbG9ycygpO1xyXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5sZWdlbmQnLCAodXBkYXRlZExlZ2VuZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1cGRhdGVkTGVnZW5kKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh1cGRhdGVkTGVnZW5kKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kID0gdXBkYXRlZExlZ2VuZDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkluaXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucHJlcGFyZURhdGEodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IF8uY2xvbmUodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuICAgICAgICAgICAgKCA8IGFueSA+IGQzLnNjYWxlKS5wYWxldHRlQ29sb3JzID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZSh0aGlzLmNvbG9ycy5tYXAoKGNvbG9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGlwQ2hhcnRDb2xvcnMubWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcik7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluc3RhbnRpYXRlQ2hhcnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IEJhckNoYXJ0QmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMueFRpY2tGb3JtYXQgPSBjaGFuZ2VzLnhUaWNrRm9ybWF0ID8gY2hhbmdlcy54VGlja0Zvcm1hdC5jdXJyZW50VmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnlUaWNrRm9ybWF0ID0gY2hhbmdlcy55VGlja0Zvcm1hdCA/IGNoYW5nZXMueVRpY2tGb3JtYXQuY3VycmVudFZhbHVlIDogbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZUxlZ2VuZCA9IGNoYW5nZXMuaW50ZXJhY3RpdmVMZWdlbmQgPyBjaGFuZ2VzLmludGVyYWN0aXZlTGVnZW5kLmN1cnJlbnRWYWx1ZSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5zZXJpZXMgJiYgY2hhbmdlcy5zZXJpZXMuY3VycmVudFZhbHVlICE9PSBjaGFuZ2VzLnNlcmllcy5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcmllcyA9IGNoYW5nZXMuc2VyaWVzLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucHJlcGFyZURhdGEodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sZWdlbmQgPSBfLmNsb25lKHRoaXMuc2VyaWVzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDaGFydCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGFydCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0uZGF0dW0odGhpcy5kYXRhKS5jYWxsKHRoaXMuY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdCYXJXaWR0aEFuZExhYmVsKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW5zdGFudGlhdGVDaGFydCgpIHtcclxuICAgICAgICAgICAgbnYuYWRkR3JhcGgoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydCA9IG52Lm1vZGVscy5kaXNjcmV0ZUJhckNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAubWFyZ2luKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbTogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IDUwXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAueCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5sYWJlbCB8fCBkLmtleSB8fCBkLng7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAueSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5zaG93VmFsdWVzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0YWdnZXJMYWJlbHModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc2hvd1hBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNob3dZQXhpcyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC52YWx1ZUZvcm1hdCggPCBhbnkgPiBkMy5mb3JtYXQoJ2QnKSlcclxuICAgICAgICAgICAgICAgICAgICAuZHVyYXRpb24oMClcclxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KHRoaXMuaGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jb2xvcigoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhW2Quc2VyaWVzXS5jb2xvciB8fCB0aGlzLnBpcENoYXJ0Q29sb3JzLm1hdGVyaWFsQ29sb3JUb1JnYmEodGhpcy5jb2xvcnNbZC5zZXJpZXNdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnRvb2x0aXAuZW5hYmxlZChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0Lm5vRGF0YSgnVGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnlBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueVRpY2tGb3JtYXQgPyB0aGlzLnlUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnhBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueFRpY2tGb3JtYXQgPyB0aGlzLnhUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbSA9IDwgYW55ID4gZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5iYXItY2hhcnQgc3ZnJylcclxuICAgICAgICAgICAgICAgICAgICAuZGF0dW0odGhpcy5kYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnaGVpZ2h0JywgJzI4NXB4JylcclxuICAgICAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLmNoYXJ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBudi51dGlscy53aW5kb3dSZXNpemUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWdCYXJXaWR0aEFuZExhYmVsKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYXJ0O1xyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ0JhcldpZHRoQW5kTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3RW1wdHlTdGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcHJlcGFyZURhdGEoZGF0YSk6IGFueSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBfLmVhY2goZGF0YSwgKHNlcmlhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNlcmlhLmRpc2FibGVkICYmIHNlcmlhLnZhbHVlcykgcmVzdWx0LnB1c2goc2VyaWEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIF8uY2xvbmVEZWVwKHJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRyYXdFbXB0eVN0YXRlKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5maW5kKCcubnYtbm9EYXRhJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5maW5kKCcuZW1wdHktc3RhdGUnKVswXSkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBnID0gdGhpcy5jaGFydEVsZW0uYXBwZW5kKCdnJykuY2xhc3NlZCgnZW1wdHktc3RhdGUnLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLm52ZDMtc3ZnJykuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbiA9IHdpZHRoICogMC4xO1xyXG5cclxuICAgICAgICAgICAgICAgIGcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmdiYSgwLCAwLCAwLCAwLjA4KScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0IC0gMTApXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSg0MiwgNjApJylcclxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmdiYSgwLCAwLCAwLCAwLjA4KScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIDIwMClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAzOCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZy5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDg0LCAxNjApJylcclxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmdiYSgwLCAwLCAwLCAwLjA4KScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIDEwMClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAzOCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAoNTAgKyBtYXJnaW4pICsgJywgMCksICcgKyAnc2NhbGUoJyArICgod2lkdGggLSAyICogbWFyZ2luKSAvIDEyNikgKyAnLCAxKScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNvbmZpZ0JhcldpZHRoQW5kTGFiZWwodGltZW91dDogbnVtYmVyID0gMTAwMCkge1xyXG4gICAgICAgICAgICBjb25zdCBsYWJlbHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5udi1iYXIgdGV4dCcpLFxyXG4gICAgICAgICAgICAgICAgY2hhcnRCYXJzID0gdGhpcy4kZWxlbWVudC5maW5kKCcubnYtYmFyJyksXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRIZWlnaHQgPSAoIDwgYW55ID4gdGhpcy4kZWxlbWVudC5maW5kKCcubnZkMy1zdmcnKVswXSkuZ2V0QkJveCgpLmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmZpbmQoJy5iYXItY2hhcnQnKVswXSkuY2xhc3NlZCgndmlzaWJsZScsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKGNoYXJ0QmFycywgKGl0ZW06IEV2ZW50VGFyZ2V0LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBiYXJIZWlnaHQgPSBOdW1iZXIoZDMuc2VsZWN0KGl0ZW0pLnNlbGVjdCgncmVjdCcpLmF0dHIoJ2hlaWdodCcpKSxcclxuICAgICAgICAgICAgICAgICAgICBiYXJXaWR0aCA9IE51bWJlcihkMy5zZWxlY3QoaXRlbSkuc2VsZWN0KCdyZWN0JykuYXR0cignd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IGQzLnNlbGVjdChpdGVtKSxcclxuICAgICAgICAgICAgICAgICAgICB4ID0gZDMudHJhbnNmb3JtKGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJykpLnRyYW5zbGF0ZVswXSxcclxuICAgICAgICAgICAgICAgICAgICB5ID0gZDMudHJhbnNmb3JtKGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJykpLnRyYW5zbGF0ZVsxXTtcclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE51bWJlcih4ICsgaW5kZXggKiAoYmFyV2lkdGggKyAxNSkpICsgJywgJyArICh0aGlzLmhlaWdodCAtIDIwKSArICcpJylcclxuICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdyZWN0JykuYXR0cignaGVpZ2h0JywgMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgIC50cmFuc2l0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAuZHVyYXRpb24odGltZW91dClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgTnVtYmVyKHggKyBpbmRleCAqIChiYXJXaWR0aCArIDE1KSkgKyAnLCAnICsgeSArICcpJylcclxuICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdyZWN0JykuYXR0cignaGVpZ2h0JywgYmFySGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QobGFiZWxzW2luZGV4XSlcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignZHknLCBiYXJIZWlnaHQgLyAyICsgMTApXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBiYXJXaWR0aCAvIDIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLmRhdGEsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnZhbHVlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udmFsdWVzWzBdLmNvbG9yID0gaXRlbS52YWx1ZXNbMF0uY29sb3IgfHwgdGhpcy5waXBDaGFydENvbG9ycy5nZXRNYXRlcmlhbENvbG9yKGluZGV4LCB0aGlzLmNvbG9ycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0udmFsdWVzWzBdLmNvbG9yO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IEJhckNoYXJ0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogQmFyQ2hhcnRCaW5kaW5ncyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2Jhcl9jaGFydC9CYXJDaGFydC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBCYXJDaGFydENvbnRyb2xsZXJcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwQmFyQ2hhcnRzJywgW10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwQmFyQ2hhcnQnLCBCYXJDaGFydCk7XHJcbn0iLCJpbXBvcnQgeyBJQ2hhcnRDb2xvcnNTZXJ2aWNlIH0gZnJvbSAnLi9JQ2hhcnRDb2xvcnNTZXJ2aWNlJztcclxuXHJcbntcclxuICAgIGNsYXNzIENoYXJ0Q29sb3JzU2VydmljZSBpbXBsZW1lbnRzIElDaGFydENvbG9yc1NlcnZpY2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRtZENvbG9yUGFsZXR0ZTogYW5ndWxhci5tYXRlcmlhbC5JQ29sb3JQYWxldHRlXHJcbiAgICAgICAgKSB7IFxyXG4gICAgICAgICAgICBcIm5nSW5qZWN0XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TWF0ZXJpYWxDb2xvcihpbmRleDogbnVtYmVyLCBjb2xvcnM6IHN0cmluZ1tdKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgaWYgKCFjb2xvcnMgfHwgY29sb3JzLmxlbmd0aCA8IDEpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAgICAgaWYgKGluZGV4ID49IGNvbG9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcnNbaW5kZXhdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBtYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3JnYmEoJyArIHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzBdICsgJywnICtcclxuICAgICAgICAgICAgICAgIHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzFdICsgJywnICtcclxuICAgICAgICAgICAgICAgIHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzJdICsgJywnICtcclxuICAgICAgICAgICAgICAgICh0aGlzLiRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXS52YWx1ZVszXSB8fCAxKSArICcpJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZW5lcmF0ZU1hdGVyaWFsQ29sb3JzKCk6IHN0cmluZ1tdIHtcclxuICAgICAgICAgICAgbGV0IGNvbG9ycyA9IF8ubWFwKCg8YW55PnRoaXMuJG1kQ29sb3JQYWxldHRlKSwgKHBhbGV0dGUsIGNvbG9yOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbG9ycyA9IF8uZmlsdGVyKGNvbG9ycywgKGNvbG9yOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfLmlzT2JqZWN0KHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXSkgJiYgXy5pc09iamVjdCh0aGlzLiRtZENvbG9yUGFsZXR0ZVtjb2xvcl1bNTAwXSkgJiYgXy5pc0FycmF5KHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29sb3JzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwQ2hhcnRDb2xvcnMnLCBbXSlcclxuICAgICAgICAuc2VydmljZSgncGlwQ2hhcnRDb2xvcnMnLCBDaGFydENvbG9yc1NlcnZpY2UpO1xyXG59IiwiaW1wb3J0IHsgSUNoYXJ0Q29sb3JzU2VydmljZSB9IGZyb20gJy4uL2NoYXJ0X2NvbG9ycy9JQ2hhcnRDb2xvcnNTZXJ2aWNlJztcclxuXHJcbntcclxuICAgIGludGVyZmFjZSBJQ2hhcnRMZWdlbmRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBzZXJpZXM6IGFueTtcclxuICAgICAgICBpbnRlcmFjdGl2ZTogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IENoYXJ0TGVnZW5kQmluZGluZ3M6IElDaGFydExlZ2VuZEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHNlcmllczogJzxwaXBTZXJpZXMnLFxyXG4gICAgICAgIGludGVyYWN0aXZlOiAnPHBpcEludGVyYWN0aXZlJ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIENoYXJ0TGVnZW5kQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUNoYXJ0TGVnZW5kQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgc2VyaWVzOiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICBpbnRlcmFjdGl2ZTogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIENoYXJ0TGVnZW5kQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJQ2hhcnRMZWdlbmRCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHNlcmllczogYW55O1xyXG4gICAgICAgIHB1YmxpYyBpbnRlcmFjdGl2ZTogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjb2xvcnM6IHN0cmluZ1tdO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgICAgICBwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLFxyXG4gICAgICAgICAgICBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgcGlwQ2hhcnRDb2xvcnM6IElDaGFydENvbG9yc1NlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgXCJuZ0luamVjdFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9ycyA9IHRoaXMucGlwQ2hhcnRDb2xvcnMuZ2VuZXJhdGVNYXRlcmlhbENvbG9ycygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkluaXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGVnZW5kcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogQ2hhcnRMZWdlbmRCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgaWYgKGNoYW5nZXMuc2VyaWVzICYmIGNoYW5nZXMuc2VyaWVzLmN1cnJlbnRWYWx1ZSAhPT0gY2hhbmdlcy5zZXJpZXMucHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJpZXMgPSBjaGFuZ2VzLnNlcmllcy5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxlZ2VuZHMoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNoYW5nZXMuaW50ZXJhY3RpdmUgJiYgY2hhbmdlcy5pbnRlcmFjdGl2ZS5jdXJyZW50VmFsdWUgIT09IGNoYW5nZXMuaW50ZXJhY3RpdmUucHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9IGNoYW5nZXMuaW50ZXJhY3RpdmUuY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW50ZXJhY3RpdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xvckNoZWNrYm94ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVMZWdlbmRzKCkge1xyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvckNoZWNrYm94ZXMoKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMucHJlcGFyZVNlcmllcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjb2xvckNoZWNrYm94ZXMoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94Q29udGFpbmVycyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbWQtY2hlY2tib3ggLm1kLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKGNoZWNrYm94Q29udGFpbmVycywgKGl0ZW06IEV2ZW50VGFyZ2V0LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gdGhpcy5zZXJpZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKGl0ZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnY29sb3InLCB0aGlzLnNlcmllc1tpbmRleF0uY29sb3IgfHwgdGhpcy5jb2xvcnNbaW5kZXhdKVxyXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKCcubWQtaWNvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnYmFja2dyb3VuZC1jb2xvcicsIHRoaXMuc2VyaWVzW2luZGV4XS5jb2xvciB8fCB0aGlzLmNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYW5pbWF0ZSgpIHtcclxuICAgICAgICAgICAgY29uc3QgbGVnZW5kVGl0bGVzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuY2hhcnQtbGVnZW5kLWl0ZW0nKTtcclxuXHJcbiAgICAgICAgICAgIF8uZWFjaChsZWdlbmRUaXRsZXMsIChpdGVtOiBFdmVudFRhcmdldCwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygndmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgMjAwICogaW5kZXgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcHJlcGFyZVNlcmllcygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlcmllcykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuc2VyaWVzLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRlcmlhbENvbG9yID0gdGhpcy5waXBDaGFydENvbG9ycy5nZXRNYXRlcmlhbENvbG9yKGluZGV4LCB0aGlzLmNvbG9ycyk7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmNvbG9yID0gaXRlbS5jb2xvciB8fCAoaXRlbS52YWx1ZXMgJiYgaXRlbS52YWx1ZXNbMF0gJiYgaXRlbS52YWx1ZXNbMF0uY29sb3IgPyBpdGVtLnZhbHVlc1swXS5jb2xvciA6IG1hdGVyaWFsQ29sb3IpO1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kaXNhYmxlZCA9IGl0ZW0uZGlzYWJsZWQgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBDaGFydExlZ2VuZDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IENoYXJ0TGVnZW5kQmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdjaGFydF9sZWdlbmQvQ2hhcnRJbnRlcmFjdGl2ZUxlZ2VuZC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBDaGFydExlZ2VuZENvbnRyb2xsZXJcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwQ2hhcnRMZWdlbmRzJywgW10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwQ2hhcnRMZWdlbmQnLCBDaGFydExlZ2VuZCk7XHJcbn0iLCLvu79hbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzJywgW1xyXG4gICAgJ3BpcEJhckNoYXJ0cycsXHJcbiAgICAncGlwTGluZUNoYXJ0cycsXHJcbiAgICAncGlwUGllQ2hhcnRzJyxcclxuICAgICdwaXBDaGFydExlZ2VuZHMnLFxyXG4gICAgJ3BpcENoYXJ0Q29sb3JzJyxcclxuICAgICdwaXBDaGFydHMuVGVtcGxhdGVzJ1xyXG5dKTsiLCJpbXBvcnQgeyBJQ2hhcnRDb2xvcnNTZXJ2aWNlIH0gZnJvbSAnLi4vY2hhcnRfY29sb3JzL0lDaGFydENvbG9yc1NlcnZpY2UnO1xyXG5cclxue1xyXG4gICAgaW50ZXJmYWNlIElMaW5lQ2hhcnRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBzZXJpZXM6IGFueTtcclxuICAgICAgICBzaG93WUF4aXM6IGFueTtcclxuICAgICAgICBzaG93WEF4aXM6IGFueTtcclxuICAgICAgICB4Rm9ybWF0OiBhbnk7XHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6IGFueTtcclxuICAgICAgICB5VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIHhUaWNrVmFsdWVzOiBhbnk7XHJcbiAgICAgICAgZHluYW1pYzogYW55O1xyXG4gICAgICAgIGZpeGVkSGVpZ2h0OiBhbnk7XHJcbiAgICAgICAgZHluYW1pY0hlaWdodDogYW55O1xyXG4gICAgICAgIG1pbkhlaWdodDogYW55O1xyXG4gICAgICAgIG1heEhlaWdodDogYW55O1xyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTGluZUNoYXJ0QmluZGluZ3M6IElMaW5lQ2hhcnRCaW5kaW5ncyA9IHtcclxuICAgICAgICBzZXJpZXM6ICc8cGlwU2VyaWVzJyxcclxuICAgICAgICBzaG93WUF4aXM6ICc8P3BpcFlBeGlzJyxcclxuICAgICAgICBzaG93WEF4aXM6ICc8P3BpcFhBeGlzJyxcclxuICAgICAgICB4Rm9ybWF0OiAnPD9waXBYRm9ybWF0JyxcclxuICAgICAgICB4VGlja0Zvcm1hdDogJzw/cGlwWFRpY2tGb3JtYXQnLFxyXG4gICAgICAgIHlUaWNrRm9ybWF0OiAnPD9waXBZVGlja0Zvcm1hdCcsXHJcbiAgICAgICAgeFRpY2tWYWx1ZXM6ICc8P3BpcFhUaWNrVmFsdWVzJyxcclxuICAgICAgICBkeW5hbWljOiAnPD9waXBEeW5hbWljJyxcclxuICAgICAgICBmaXhlZEhlaWdodDogJzw/cGlwRGlhZ3JhbUhlaWdodCcsXHJcbiAgICAgICAgZHluYW1pY0hlaWdodDogJzw/cGlwRHluYW1pY0hlaWdodCcsXHJcbiAgICAgICAgbWluSGVpZ2h0OiAnPD9waXBNaW5IZWlnaHQnLFxyXG4gICAgICAgIG1heEhlaWdodDogJzw/cGlwTWF4SGVpZ2h0JyxcclxuICAgICAgICBpbnRlcmFjdGl2ZUxlZ2VuZDogJzw/cGlwSW50ZXJMZWdlbmQnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTGluZUNoYXJ0QmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxpbmVDaGFydEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIGZpeGVkSGVpZ2h0OiBuZy5JQ2hhbmdlc09iamVjdCA8IG51bWJlciA+IDtcclxuICAgICAgICBkeW5hbWljSGVpZ2h0OiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgbWluSGVpZ2h0OiBuZy5JQ2hhbmdlc09iamVjdCA8IG51bWJlciA+IDtcclxuICAgICAgICBtYXhIZWlnaHQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgbnVtYmVyID4gO1xyXG5cclxuICAgICAgICBzZXJpZXM6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIHNob3dZQXhpczogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIHNob3dYQXhpczogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIHhGb3JtYXQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIHhUaWNrRm9ybWF0OiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICB5VGlja0Zvcm1hdDogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgeFRpY2tWYWx1ZXM6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIGR5bmFtaWM6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgICAgICBpbnRlcmFjdGl2ZUxlZ2VuZDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExpbmVDaGFydENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUxpbmVDaGFydEJpbmRpbmdzIHtcclxuICAgICAgICBwcml2YXRlIEhFSUdIVCA9IDI3MDtcclxuICAgICAgICBwcml2YXRlIGNoYXJ0OiBudi5MaW5lQ2hhcnQgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnRFbGVtOiBhbnkgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgc2V0Wm9vbTogRnVuY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgdXBkYXRlWm9vbU9wdGlvbnM6IEZ1bmN0aW9uID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIGNvbG9yczogc3RyaW5nW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGZpeGVkSGVpZ2h0OiBudW1iZXIgPSB0aGlzLkhFSUdIVDtcclxuICAgICAgICBwdWJsaWMgZHluYW1pY0hlaWdodDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHB1YmxpYyBtaW5IZWlnaHQ6IG51bWJlciA9IHRoaXMuSEVJR0hUO1xyXG4gICAgICAgIHB1YmxpYyBtYXhIZWlnaHQ6IG51bWJlciA9IHRoaXMuSEVJR0hUO1xyXG4gICAgICAgIHB1YmxpYyBzZXJpZXM6IGFueTtcclxuICAgICAgICBwdWJsaWMgc2hvd1lBeGlzOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICBwdWJsaWMgc2hvd1hBeGlzOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICBwdWJsaWMgeEZvcm1hdDogRnVuY3Rpb247XHJcbiAgICAgICAgcHVibGljIHhUaWNrRm9ybWF0OiBGdW5jdGlvbjtcclxuICAgICAgICBwdWJsaWMgeVRpY2tGb3JtYXQ6IEZ1bmN0aW9uO1xyXG4gICAgICAgIHB1YmxpYyB4VGlja1ZhbHVlczogbnVtYmVyW107XHJcbiAgICAgICAgcHVibGljIGR5bmFtaWM6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBwdWJsaWMgaW50ZXJhY3RpdmVMZWdlbmQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBwdWJsaWMgZGF0YTogYW55O1xyXG4gICAgICAgIHB1YmxpYyBsZWdlbmQ6IGFueTtcclxuICAgICAgICBwdWJsaWMgc291cmNlRXZlbnRzOiBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSBwaXBDaGFydENvbG9yczogSUNoYXJ0Q29sb3JzU2VydmljZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNvbG9ycyA9IHRoaXMucGlwQ2hhcnRDb2xvcnMuZ2VuZXJhdGVNYXRlcmlhbENvbG9ycygpO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwubGVnZW5kJywgKHVwZGF0ZWRMZWdlbmQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucHJlcGFyZURhdGEodXBkYXRlZExlZ2VuZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IHVwZGF0ZWRMZWdlbmQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDaGFydCgpO1xyXG4gICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdEFsbCgnLm52dG9vbHRpcCcpLnN0eWxlKCdvcGFjaXR5JywgMCk7XHJcbiAgICAgICAgICAgICAgICB9LCA4MDApXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkluaXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucHJlcGFyZURhdGEodGhpcy5zZXJpZXMpIHx8IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IF8uY2xvbmUodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICB0aGlzLnNvdXJjZUV2ZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcblxyXG4gICAgICAgICAgICAoIDwgYW55ID4gZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKHRoaXMuY29sb3JzLm1hcCgoY29sb3IpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5waXBDaGFydENvbG9ycy5tYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFudGlhdGVDaGFydCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTGluZUNoYXJ0QmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZml4ZWRIZWlnaHQgPSBjaGFuZ2VzLmZpeGVkSGVpZ2h0ID8gY2hhbmdlcy5maXhlZEhlaWdodC5jdXJyZW50VmFsdWUgOiB0aGlzLkhFSUdIVDtcclxuICAgICAgICAgICAgdGhpcy5taW5IZWlnaHQgPSBjaGFuZ2VzLm1pbkhlaWdodCA/IGNoYW5nZXMubWluSGVpZ2h0LmN1cnJlbnRWYWx1ZSA6IHRoaXMuSEVJR0hUO1xyXG4gICAgICAgICAgICB0aGlzLm1heEhlaWdodCA9IGNoYW5nZXMubWF4SGVpZ2h0ID8gY2hhbmdlcy5tYXhIZWlnaHQuY3VycmVudFZhbHVlIDogdGhpcy5IRUlHSFQ7XHJcbiAgICAgICAgICAgIHRoaXMuZHluYW1pY0hlaWdodCA9IGNoYW5nZXMuZHluYW1pY0hlaWdodCA/IGNoYW5nZXMuZHluYW1pY0hlaWdodC5jdXJyZW50VmFsdWUgOiB0aGlzLmR5bmFtaWNIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNob3dYQXhpcyA9IGNoYW5nZXMuc2hvd1hBeGlzID8gY2hhbmdlcy5zaG93WEF4aXMuY3VycmVudFZhbHVlIDogdGhpcy5zaG93WEF4aXM7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1lBeGlzID0gY2hhbmdlcy5zaG93WUF4aXMgPyBjaGFuZ2VzLnNob3dZQXhpcy5jdXJyZW50VmFsdWUgOiB0aGlzLnNob3dZQXhpcztcclxuICAgICAgICAgICAgdGhpcy5keW5hbWljID0gY2hhbmdlcy5keW5hbWljID8gY2hhbmdlcy5keW5hbWljLmN1cnJlbnRWYWx1ZSA6IHRoaXMuZHluYW1pYztcclxuICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZUxlZ2VuZCA9IGNoYW5nZXMuaW50ZXJhY3RpdmVMZWdlbmQgPyBjaGFuZ2VzLmludGVyYWN0aXZlTGVnZW5kLmN1cnJlbnRWYWx1ZSA6IHRoaXMuaW50ZXJhY3RpdmVMZWdlbmQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnhGb3JtYXQgPSBjaGFuZ2VzLnhGb3JtYXQgPyBjaGFuZ2VzLnhGb3JtYXQuY3VycmVudFZhbHVlIDogdGhpcy54Rm9ybWF0O1xyXG4gICAgICAgICAgICB0aGlzLnhUaWNrRm9ybWF0ID0gY2hhbmdlcy54VGlja0Zvcm1hdCA/IGNoYW5nZXMueFRpY2tGb3JtYXQuY3VycmVudFZhbHVlIDogdGhpcy54VGlja0Zvcm1hdDtcclxuICAgICAgICAgICAgdGhpcy55VGlja0Zvcm1hdCA9IGNoYW5nZXMueVRpY2tGb3JtYXQgPyBjaGFuZ2VzLnlUaWNrRm9ybWF0LmN1cnJlbnRWYWx1ZSA6IHRoaXMueVRpY2tGb3JtYXQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy54VGlja1ZhbHVlcyAmJiBjaGFuZ2VzLnhUaWNrVmFsdWVzLmN1cnJlbnRWYWx1ZSAhPT0gY2hhbmdlcy54VGlja1ZhbHVlcy5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnhUaWNrVmFsdWVzID0gY2hhbmdlcy54VGlja1ZhbHVlcy5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVhUaWNrVmFsdWVzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGFydEVsZW0gJiYgdGhpcy5jaGFydCkgdGhpcy5jaGFydEVsZW0uZGF0dW0odGhpcy5kYXRhIHx8IFtdKS5jYWxsKHRoaXMuY2hhcnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5zZXJpZXMgJiYgY2hhbmdlcy5zZXJpZXMuY3VycmVudFZhbHVlICE9PSBjaGFuZ2VzLnNlcmllcy5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlcmllcygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHByZXBhcmVEYXRhKGRhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIF8uZWFjaChkYXRhLCAoc2VyaWEpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghc2VyaWEuZGlzYWJsZWQgJiYgc2VyaWEudmFsdWVzKSByZXN1bHQucHVzaChzZXJpYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIF8uY2xvbmVEZWVwKHJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGdldEhlaWdodCgpIHtcclxuICAgICAgICAgICAgLyppZiAodGhpcy5keW5hbWljSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlndGggPSBNYXRoLm1pbihNYXRoLm1heCh0aGlzLm1pbkhlaWdodCwgdGhpcy4kZWxlbWVudC5wYXJlbnQoKS5pbm5lckhlaWdodCgpKSwgdGhpcy5tYXhIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlaWd0aDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpeGVkSGVpZ2h0O1xyXG4gICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZHluYW1pY0hlaWdodCA/IE1hdGgubWluKE1hdGgubWF4KHRoaXMubWluSGVpZ2h0LCB0aGlzLiRlbGVtZW50LnBhcmVudCgpLmlubmVySGVpZ2h0KCkpLCB0aGlzLm1heEhlaWdodCkgOiB0aGlzLmZpeGVkSGVpZ2h0O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyB6b29tSW4oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldFpvb20pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Wm9vbSgnaW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyB6b29tT3V0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXRab29tKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFpvb20oJ291dCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbnN0YW50aWF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICBudi5hZGRHcmFwaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0ID0gbnYubW9kZWxzLmxpbmVDaGFydCgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm1hcmdpbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAyMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogMzBcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC54KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoZCAhPT0gdW5kZWZpbmVkICYmIGQueCAhPT0gdW5kZWZpbmVkKSA/ICh0aGlzLnhGb3JtYXQgPyB0aGlzLnhGb3JtYXQoZC54KSA6IGQueCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnkoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChkICE9PSB1bmRlZmluZWQgJiYgZC52YWx1ZSAhPT0gdW5kZWZpbmVkKSA/IGQudmFsdWUgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmhlaWdodCh0aGlzLmdldEhlaWdodCgpIC0gNTApXHJcbiAgICAgICAgICAgICAgICAgICAgLnVzZUludGVyYWN0aXZlR3VpZGVsaW5lKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNob3dYQXhpcyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zaG93WUF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc2hvd0xlZ2VuZChmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAuY29sb3IoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQuY29sb3IgfHwgKCA8IGFueSA+IGQzLnNjYWxlKS5wYWxldHRlQ29sb3JzKCkucmFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnRvb2x0aXAuZW5hYmxlZChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0Lm5vRGF0YSgnVGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnlBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueVRpY2tGb3JtYXQgPyB0aGlzLnlUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnhBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueFRpY2tGb3JtYXQgPyB0aGlzLnhUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrVmFsdWVzKHRoaXMueFRpY2tWYWx1ZXMgJiYgXy5pc0FycmF5KHRoaXMueFRpY2tWYWx1ZXMpICYmIHRoaXMueFRpY2tWYWx1ZXMubGVuZ3RoID4gMiA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnJhbmdlKHRoaXMueFRpY2tWYWx1ZXNbMF0sIHRoaXMueFRpY2tWYWx1ZXNbMV0sIHRoaXMueFRpY2tWYWx1ZXNbMl0pIDogbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0gPSBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLmxpbmUtY2hhcnQgc3ZnJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbS5kYXR1bSh0aGlzLmRhdGEgfHwgW10pLnN0eWxlKCdoZWlnaHQnLCAodGhpcy5nZXRIZWlnaHQoKSAtIDUwKSArICdweCcpLmNhbGwodGhpcy5jaGFydCk7XHJcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdG91Y2hlcyBmb3IgY29ycmVjdGluZyB0b29sdGlwIHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAkKCcubGluZS1jaGFydCBzdmcnKS5vbigndG91Y2hzdGFydCB0b3VjaG1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sdGlwID0gJCgnLm52dG9vbHRpcCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcFcgPSB0b29sdGlwLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlXaWR0aCA9ICQoJ2JvZHknKS5pbm5lcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gZS5vcmlnaW5hbEV2ZW50Wyd0b3VjaGVzJ11bMF1bJ3BhZ2VYJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gZS5vcmlnaW5hbEV2ZW50Wyd0b3VjaGVzJ11bMF1bJ3BhZ2VZJ107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh4ICsgdG9vbHRpcFcgPj0gYm9keVdpZHRoID8gKHggLSB0b29sdGlwVykgOiB4KSArICcsJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ICsgJyknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5jc3MoJ2xlZnQnLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5jc3MoJ3RvcCcsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLmxpbmUtY2hhcnQgc3ZnJykub24oJ3RvdWNoc3RhcnQgdG91Y2hlbmQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZVRvb2x0aXAgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5udnRvb2x0aXAnKS5jc3MoJ29wYWNpdHknLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVUb29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVUb29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmR5bmFtaWMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFpvb20odGhpcy5jaGFydCwgdGhpcy5jaGFydEVsZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJG9uKCdwaXBNYWluUmVzaXplZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFydDtcclxuICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3RW1wdHlTdGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdXBkYXRlWFRpY2tWYWx1ZXMoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jaGFydCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFydC54QXhpc1xyXG4gICAgICAgICAgICAgICAgLnRpY2tWYWx1ZXModGhpcy54VGlja1ZhbHVlcyAmJiBfLmlzQXJyYXkodGhpcy54VGlja1ZhbHVlcykgJiYgdGhpcy54VGlja1ZhbHVlcy5sZW5ndGggPiAyID9cclxuICAgICAgICAgICAgICAgICAgICBkMy5yYW5nZSh0aGlzLnhUaWNrVmFsdWVzWzBdLCB0aGlzLnhUaWNrVmFsdWVzWzFdLCB0aGlzLnhUaWNrVmFsdWVzWzJdKSA6IG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVDaGFydCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlWFRpY2tWYWx1ZXMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbS5kYXR1bSh0aGlzLmRhdGEgfHwgW10pLmNhbGwodGhpcy5jaGFydCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudXBkYXRlWm9vbU9wdGlvbnMpIHRoaXMudXBkYXRlWm9vbU9wdGlvbnModGhpcy5kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVTZXJpZXMoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucHJlcGFyZURhdGEodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IF8uY2xvbmUodGhpcy5zZXJpZXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2hhcnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgb25SZXNpemUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcnQuaGVpZ2h0KHRoaXMuZ2V0SGVpZ2h0KCkgLSA1MCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtLnN0eWxlKCdoZWlnaHQnLCAodGhpcy5nZXRIZWlnaHQoKSAtIDUwKSArICdweCcpO1xyXG4gICAgICAgICAgICB0aGlzLmNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRyYXdFbXB0eVN0YXRlKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuJGVsZW1lbnQuZmluZCgndGV4dC5udi1ub0RhdGEnKS5nZXQoMCkpIHtcclxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpWzBdKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lcldpZHRoID0gdGhpcy4kZWxlbWVudC5maW5kKCcubGluZS1jaGFydCcpLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5saW5lLWNoYXJ0JykuaW5uZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5maW5kKCcuZW1wdHktc3RhdGUnKS5nZXQoMCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdpbWFnZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIChjb250YWluZXJXaWR0aCAvIDExNTEpICsgJywnICsgKGNvbnRhaW5lckhlaWdodCAvIDIxNikgKyAnKScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZGVmc1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwicGF0dGVyblwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBcIjBcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIFwiMFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImlkXCIsIFwiYmdcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImltYWdlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgMTcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIFwiMjE2cHhcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgXCIxMTUxcHhcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgKGNvbnRhaW5lcldpZHRoIC8gMTE1MSkgKyAnLCcgKyAoY29udGFpbmVySGVpZ2h0IC8gMjE2KSArICcpJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4bGluazpocmVmXCIsIFwiaW1hZ2VzL2xpbmVfY2hhcnRfZW1wdHlfc3RhdGUuc3ZnXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2VtcHR5LXN0YXRlJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIFwiMTAwJVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBcIjEwMCVcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAndXJsKCNiZyknKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVTY3JvbGwoZG9tYWlucywgYm91bmRhcnkpIHtcclxuICAgICAgICAgICAgY29uc3QgYkRpZmYgPSBib3VuZGFyeVsxXSAtIGJvdW5kYXJ5WzBdLFxyXG4gICAgICAgICAgICAgICAgZG9tRGlmZiA9IGRvbWFpbnNbMV0gLSBkb21haW5zWzBdLFxyXG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGRvbURpZmYgLyBiRGlmZiA9PT0gMTtcclxuXHJcbiAgICAgICAgICAgICQodGhpcy4kZWxlbWVudFswXSkuZmluZCgnLnZpc3VhbC1zY3JvbGwnKVxyXG4gICAgICAgICAgICAgICAgLmNzcygnb3BhY2l0eScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNFcXVhbCA/IDAgOiAxO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNFcXVhbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzLiRlbGVtZW50WzBdKS5maW5kKCcuc2Nyb2xsZWQtYmxvY2snKVxyXG4gICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGRvbWFpbnNbMF0gLSBib3VuZGFyeVswXSkgLyBiRGlmZiAqIDEwMCArICclJztcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY3NzKCd3aWR0aCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9tRGlmZiAvIGJEaWZmICogMTAwICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kYXRhKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBfLmVhY2godGhpcy5kYXRhLCAoaXRlbSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0uY29sb3IgfHwgdGhpcy5waXBDaGFydENvbG9ycy5nZXRNYXRlcmlhbENvbG9yKGluZGV4LCB0aGlzLmNvbG9ycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhZGRab29tKGNoYXJ0LCBzdmcpIHtcclxuICAgICAgICAgICAgLy8gU2NhbGUgRXh0ZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlRXh0ZW50ID0gNDtcclxuXHJcbiAgICAgICAgICAgIC8vIFBhcmFtZXRlcnNcclxuICAgICAgICAgICAgbGV0IHlBeGlzID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHhBeGlzID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHhEb21haW4gPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgeURvbWFpbiA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCByZWRyYXcgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gU2NhbGVzXHJcbiAgICAgICAgICAgIGxldCB4U2NhbGUgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgeVNjYWxlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIE1pbi9tYXggYm91bmRhcmllc1xyXG4gICAgICAgICAgICBsZXQgeF9ib3VuZGFyeSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCB5X2JvdW5kYXJ5ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBkMyB6b29tIGhhbmRsZXJcclxuICAgICAgICAgICAgbGV0IGQzem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKTtcclxuICAgICAgICAgICAgbGV0IHByZXZYRG9tYWluID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHByZXZTY2FsZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBwcmV2VHJhbnNsYXRlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNldERhdGEgPSAobmV3Q2hhcnQpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFBhcmFtZXRlcnNcclxuICAgICAgICAgICAgICAgIHlBeGlzID0gbmV3Q2hhcnQueUF4aXM7XHJcbiAgICAgICAgICAgICAgICB4QXhpcyA9IG5ld0NoYXJ0LnhBeGlzO1xyXG4gICAgICAgICAgICAgICAgeERvbWFpbiA9IG5ld0NoYXJ0LnhEb21haW4gfHwgeEF4aXMuc2NhbGUoKS5kb21haW47XHJcbiAgICAgICAgICAgICAgICB5RG9tYWluID0gbmV3Q2hhcnQueURvbWFpbiB8fCB5QXhpcy5zY2FsZSgpLmRvbWFpbjtcclxuICAgICAgICAgICAgICAgIHJlZHJhdyA9IG5ld0NoYXJ0LnVwZGF0ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTY2FsZXNcclxuICAgICAgICAgICAgICAgIHhTY2FsZSA9IHhBeGlzLnNjYWxlKCk7XHJcbiAgICAgICAgICAgICAgICB5U2NhbGUgPSB5QXhpcy5zY2FsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE1pbi9tYXggYm91bmRhcmllc1xyXG4gICAgICAgICAgICAgICAgeF9ib3VuZGFyeSA9IHhBeGlzLnNjYWxlKCkuZG9tYWluKCkuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgIHlfYm91bmRhcnkgPSB5QXhpcy5zY2FsZSgpLmRvbWFpbigpLnNsaWNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGQzIHpvb20gaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgcHJldlhEb21haW4gPSB4X2JvdW5kYXJ5O1xyXG4gICAgICAgICAgICAgICAgcHJldlNjYWxlID0gZDN6b29tLnNjYWxlKCk7XHJcbiAgICAgICAgICAgICAgICBwcmV2VHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBuaWNlIGF4aXNcclxuICAgICAgICAgICAgICAgIHhTY2FsZS5uaWNlKCk7XHJcbiAgICAgICAgICAgICAgICB5U2NhbGUubmljZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZXREYXRhKGNoYXJ0KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZpeCBkb21haW5cclxuICAgICAgICAgICAgY29uc3QgZml4RG9tYWluID0gKGRvbWFpbiwgYm91bmRhcnksIHNjYWxlLCB0cmFuc2xhdGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkb21haW5bMF0gPCBib3VuZGFyeVswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpblswXSA9IGJvdW5kYXJ5WzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2WERvbWFpblswXSAhPT0gYm91bmRhcnlbMF0gfHwgc2NhbGUgIT09IHByZXZTY2FsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW5bMV0gKz0gKGJvdW5kYXJ5WzBdIC0gZG9tYWluWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW5bMV0gPSBwcmV2WERvbWFpblsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gXy5jbG9uZShwcmV2VHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpblsxXSA+IGJvdW5kYXJ5WzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluWzFdID0gYm91bmRhcnlbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZYRG9tYWluWzFdICE9PSBib3VuZGFyeVsxXSB8fCBzY2FsZSAhPT0gcHJldlNjYWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblswXSAtPSAoZG9tYWluWzFdIC0gYm91bmRhcnlbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblswXSA9IHByZXZYRG9tYWluWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBfLmNsb25lKHByZXZUcmFuc2xhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKHRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBwcmV2WERvbWFpbiA9IF8uY2xvbmUoZG9tYWluKTtcclxuICAgICAgICAgICAgICAgIHByZXZTY2FsZSA9IF8uY2xvbmUoc2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldlRyYW5zbGF0ZSA9IF8uY2xvbmUodHJhbnNsYXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9tYWluO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVDaGFydCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGQzem9vbS5zY2FsZSgxKTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUoWzAsIDBdKTtcclxuICAgICAgICAgICAgICAgIHhTY2FsZS5kb21haW4oeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgICAgICAgICBkM3pvb20ueCh4U2NhbGUpLnkoeVNjYWxlKTtcclxuICAgICAgICAgICAgICAgIHN2Zy5jYWxsKGQzem9vbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFpvb20gZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICBjb25zdCB6b29tZWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKCA8IGFueSA+IGQzLmV2ZW50KS5zY2FsZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVuem9vbWVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hhcnQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeERvbWFpbihmaXhEb21haW4oeFNjYWxlLmRvbWFpbigpLCB4X2JvdW5kYXJ5LCAoIDwgYW55ID4gZDMuZXZlbnQpLnNjYWxlLCAoIDwgYW55ID4gZDMuZXZlbnQpLnRyYW5zbGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZHJhdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2Nyb2xsKHhTY2FsZS5kb21haW4oKSwgeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERlc2NyaWJlIHNldCB6b29tIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbSA9ICh3aGljaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2VudGVyMCA9IFtzdmdbMF1bMF0uZ2V0QkJveCgpLndpZHRoIC8gMiwgc3ZnWzBdWzBdLmdldEJCb3goKS5oZWlnaHQgLyAyXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZTAgPSBkM3pvb20udHJhbnNsYXRlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMwID0gY29vcmRpbmF0ZXMoY2VudGVyMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHdoaWNoID09PSAnaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZTY2FsZSA8IHNjYWxlRXh0ZW50KSBkM3pvb20uc2NhbGUocHJldlNjYWxlICsgMC4yKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZTY2FsZSA+IDEpIGQzem9vbS5zY2FsZShwcmV2U2NhbGUgLSAwLjIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlcjEgPSBwb2ludChjb29yZGluYXRlczApO1xyXG4gICAgICAgICAgICAgICAgZDN6b29tLnRyYW5zbGF0ZShbdHJhbnNsYXRlMFswXSArIGNlbnRlcjBbMF0gLSBjZW50ZXIxWzBdLCB0cmFuc2xhdGUwWzFdICsgY2VudGVyMFsxXSAtIGNlbnRlcjFbMV1dKTtcclxuXHJcbiAgICAgICAgICAgICAgICBkM3pvb20uZXZlbnQoc3ZnKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAod2hpY2gpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZSA9IGQzem9vbS50cmFuc2xhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAod2hpY2ggPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVbMF0gLT0gMjA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVswXSArPSAyMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKHRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBkM3pvb20uZXZlbnQoc3ZnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSAocG9pbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gZDN6b29tLnNjYWxlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsocG9pbnRbMF0gLSB0cmFuc2xhdGVbMF0pIC8gc2NhbGUsIChwb2ludFsxXSAtIHRyYW5zbGF0ZVsxXSkgLyBzY2FsZV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gKGNvb3JkaW5hdGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzY2FsZSA9IGQzem9vbS5zY2FsZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSA9IGQzem9vbS50cmFuc2xhdGUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbY29vcmRpbmF0ZXNbMF0gKiBzY2FsZSArIHRyYW5zbGF0ZVswXSwgY29vcmRpbmF0ZXNbMV0gKiBzY2FsZSArIHRyYW5zbGF0ZVsxXV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGtleXByZXNzID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICgoIDwgYW55ID4gZDMuZXZlbnQpLmtleUNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwKCdyaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM3OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTA3OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFpvb20oJ2luJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTA5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFpvb20oJ291dCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBab29tIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgICAgY29uc3QgdW56b29tZWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB4RG9tYWluKHhfYm91bmRhcnkpO1xyXG4gICAgICAgICAgICAgICAgcmVkcmF3KCk7XHJcbiAgICAgICAgICAgICAgICBkM3pvb20uc2NhbGUoMSk7XHJcbiAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFswLCAwXSk7XHJcbiAgICAgICAgICAgICAgICBwcmV2U2NhbGUgPSAxO1xyXG4gICAgICAgICAgICAgICAgcHJldlRyYW5zbGF0ZSA9IFswLCAwXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB3cmFwcGVyXHJcbiAgICAgICAgICAgIGQzem9vbS54KHhTY2FsZSlcclxuICAgICAgICAgICAgICAgIC55KHlTY2FsZSlcclxuICAgICAgICAgICAgICAgIC5zY2FsZUV4dGVudChbMSwgc2NhbGVFeHRlbnRdKVxyXG4gICAgICAgICAgICAgICAgLm9uKCd6b29tJywgem9vbWVkKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBoYW5kbGVyXHJcbiAgICAgICAgICAgIHN2Zy5jYWxsKGQzem9vbSkub24oJ2RibGNsaWNrLnpvb20nLCB1bnpvb21lZCk7XHJcbiAgICAgICAgICAgICQodGhpcy4kZWxlbWVudC5nZXQoMCkpLmFkZENsYXNzKCdkeW5hbWljJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQga2V5Ym9hcmQgaGFuZGxlcnNcclxuICAgICAgICAgICAgc3ZnXHJcbiAgICAgICAgICAgICAgICAuYXR0cignZm9jdXNhYmxlJywgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ291dGxpbmUnLCAnbm9uZScpXHJcbiAgICAgICAgICAgICAgICAub24oJ2tleWRvd24nLCBrZXlwcmVzcylcclxuICAgICAgICAgICAgICAgIC5vbignZm9jdXMnLCAoKSA9PiB7fSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBnZXRYTWluTWF4ID0gKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXhWYWwsIG1pblZhbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhW2ldLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBNaW5WYWwgPSBkMy5tYXgoZGF0YVtpXS52YWx1ZXMsIChkOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnhGb3JtYXQgPyB0aGlzLnhGb3JtYXQoZC54KSA6IGQueDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBNYXhWYWwgPSBkMy5taW4oZGF0YVtpXS52YWx1ZXMsIChkOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnhGb3JtYXQgPyB0aGlzLnhGb3JtYXQoZC54KSA6IGQueDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pblZhbCA9ICghbWluVmFsIHx8IHRlbXBNaW5WYWwgPCBtaW5WYWwpID8gdGVtcE1pblZhbCA6IG1pblZhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VmFsID0gKCFtYXhWYWwgfHwgdGVtcE1heFZhbCA+IG1heFZhbCkgPyB0ZW1wTWF4VmFsIDogbWF4VmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBbbWF4VmFsLCBtaW5WYWxdO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdXBkYXRlWm9vbU9wdGlvbnMgPSAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgeUF4aXMgPSBjaGFydC55QXhpcztcclxuICAgICAgICAgICAgICAgIHhBeGlzID0gY2hhcnQueEF4aXM7XHJcblxyXG4gICAgICAgICAgICAgICAgeFNjYWxlID0geEF4aXMuc2NhbGUoKTtcclxuICAgICAgICAgICAgICAgIHlTY2FsZSA9IHlBeGlzLnNjYWxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgeF9ib3VuZGFyeSA9IGdldFhNaW5NYXgoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGQzem9vbS5zY2FsZSgpID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKS55KHlTY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKTtcclxuICAgICAgICAgICAgICAgICAgICBkM3pvb20uZXZlbnQoc3ZnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNjcm9sbCh4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExpbmVDaGFydDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IExpbmVDaGFydEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbGluZV9jaGFydC9MaW5lQ2hhcnQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogTGluZUNoYXJ0Q29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBMaW5lQ2hhcnRzJywgW10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwTGluZUNoYXJ0JywgTGluZUNoYXJ0KTtcclxufSIsImltcG9ydCB7IElDaGFydENvbG9yc1NlcnZpY2UgfSBmcm9tICcuLi9jaGFydF9jb2xvcnMvSUNoYXJ0Q29sb3JzU2VydmljZSc7XHJcblxyXG57XHJcbiAgICBpbnRlcmZhY2UgSVBpZUNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgc2VyaWVzOiBhbnk7XHJcbiAgICAgICAgZG9udXQ6IGFueTtcclxuICAgICAgICBsZWdlbmQ6IGFueTtcclxuICAgICAgICB0b3RhbDogYW55O1xyXG4gICAgICAgIHNpemU6IGFueTtcclxuICAgICAgICBjZW50ZXJlZDogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IFBpZUNoYXJ0QmluZGluZ3M6IElQaWVDaGFydEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHNlcmllczogJzxwaXBTZXJpZXMnLFxyXG4gICAgICAgIGRvbnV0OiAnPD9waXBEb251dCcsXHJcbiAgICAgICAgbGVnZW5kOiAnPD9waXBTaG93TGVnZW5kJyxcclxuICAgICAgICB0b3RhbDogJzw/cGlwU2hvd1RvdGFsJyxcclxuICAgICAgICBzaXplOiAnPD9waXBQaWVTaXplJyxcclxuICAgICAgICBjZW50ZXJlZDogJzw/cGlwQ2VudGVyZWQnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgUGllQ2hhcnRCaW5kaW5nc0NoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJUGllQ2hhcnRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBzZXJpZXM6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIGRvbnV0OiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgbGVnZW5kOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgdG90YWw6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgICAgICBzaXplOiBuZy5JQ2hhbmdlc09iamVjdCA8IG51bWJlciB8IHN0cmluZyA+IDtcclxuICAgICAgICBjZW50ZXJlZDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFBpZUNoYXJ0Q29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJUGllQ2hhcnRCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHNlcmllczogYW55O1xyXG4gICAgICAgIHB1YmxpYyBkb251dDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHB1YmxpYyBsZWdlbmQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyB0b3RhbDogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHVibGljIHNpemU6IG51bWJlciB8IHN0cmluZyA9IDI1MDtcclxuICAgICAgICBwdWJsaWMgY2VudGVyZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkYXRhOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBjaGFydDogbnYuUGllQ2hhcnQgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnRFbGVtOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSB0aXRsZUVsZW06IGFueTtcclxuICAgICAgICBwcml2YXRlIGNvbG9yczogc3RyaW5nW107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSBwaXBDaGFydENvbG9yczogSUNoYXJ0Q29sb3JzU2VydmljZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNvbG9ycyA9IHRoaXMucGlwQ2hhcnRDb2xvcnMuZ2VuZXJhdGVNYXRlcmlhbENvbG9ycygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkluaXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuc2VyaWVzO1xyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuICAgICAgICAgICAgKCA8IGFueSA+IGQzLnNjYWxlKS5wYWxldHRlQ29sb3JzID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZSh0aGlzLmNvbG9ycy5tYXAoKGNvbG9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGlwQ2hhcnRDb2xvcnMubWF0ZXJpYWxDb2xvclRvUmdiYShjb2xvcik7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluc3RhbnRpYXRlQ2hhcnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IFBpZUNoYXJ0QmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVnZW5kID0gY2hhbmdlcy5sZWdlbmQgPyBjaGFuZ2VzLmxlZ2VuZC5jdXJyZW50VmFsdWUgOiB0aGlzLmxlZ2VuZDtcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXJlZCA9IGNoYW5nZXMuY2VudGVyZWQgPyBjaGFuZ2VzLmNlbnRlcmVkLmN1cnJlbnRWYWx1ZSA6IHRoaXMuY2VudGVyZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuZG9udXQgPSBjaGFuZ2VzLmRvbnV0ID8gY2hhbmdlcy5kb251dC5jdXJyZW50VmFsdWUgOiB0aGlzLmRvbnV0O1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSBjaGFuZ2VzLnNpemUgPyBjaGFuZ2VzLnNpemUuY3VycmVudFZhbHVlIDogdGhpcy5zaXplO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsID0gY2hhbmdlcy50b3RhbCA/IGNoYW5nZXMudG90YWwuY3VycmVudFZhbHVlIDogdGhpcy50b3RhbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnNlcmllcyAmJiBjaGFuZ2VzLnNlcmllcy5jdXJyZW50VmFsdWUgIT09IGNoYW5nZXMuc2VyaWVzLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGNoYW5nZXMuc2VyaWVzLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0uZGF0dW0odGhpcy5kYXRhKS5jYWxsKHRoaXMuY2hhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZVRpdGxlTGFiZWxVbndyYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbnN0YW50aWF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICBudi5hZGRHcmFwaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0ID0gbnYubW9kZWxzLnBpZUNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAubWFyZ2luKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAueCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kb251dCA/IGQudmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnkoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KE51bWJlcih0aGlzLnNpemUpKVxyXG4gICAgICAgICAgICAgICAgICAgIC53aWR0aChOdW1iZXIodGhpcy5zaXplKSlcclxuICAgICAgICAgICAgICAgICAgICAuc2hvd0xhYmVscyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5sYWJlbFRocmVzaG9sZCguMDAxKVxyXG4gICAgICAgICAgICAgICAgICAgIC5ncm93T25Ib3ZlcihmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAuZG9udXQodGhpcy5kb251dClcclxuICAgICAgICAgICAgICAgICAgICAuZG9udXRSYXRpbygwLjUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNvbG9yKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmNvbG9yIHx8ICggPCBhbnkgPiBkMy5zY2FsZSkucGFsZXR0ZUNvbG9ycygpLnJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydC50b29sdGlwLmVuYWJsZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydC5ub0RhdGEoJ1RoZXJlIGlzIG5vIGRhdGEgcmlnaHQgbm93Li4uJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnNob3dMZWdlbmQoZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtID0gZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5waWUtY2hhcnQnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnaGVpZ2h0JywgKHRoaXMuc2l6ZSkgKyAncHgnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnd2lkdGgnLCB0aGlzLmNlbnRlcmVkID8gJzEwMCUnIDogKHRoaXMuc2l6ZSkgKyAncHgnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ3N2ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMClcclxuICAgICAgICAgICAgICAgICAgICAuZGF0dW0odGhpcy5kYXRhIHx8IFtdKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKHRoaXMuY2hhcnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFydC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNpemVUaXRsZUxhYmVsVW53cmFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jZW50ZXJDaGFydCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKS5zZWxlY3QoJy5waWUtY2hhcnQgc3ZnJylbMF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcnQ7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN2Z0VsZW0gPSBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLnBpZS1jaGFydCBzdmcnKVswXVswXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRvdGFsTGFiZWwoc3ZnRWxlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHN2Z0VsZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50cmFuc2l0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmR1cmF0aW9uKDEwMDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNpemVUaXRsZUxhYmVsVW53cmFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgODAwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNlbnRlckNoYXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RW1wdHlTdGF0ZShzdmdFbGVtKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZHJhd0VtcHR5U3RhdGUoc3ZnKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy4kZWxlbWVudC5maW5kKCd0ZXh0Lm52LW5vRGF0YScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJylbMF0pLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcucGlwLWVtcHR5LXBpZS10ZXh0JykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5maW5kKCcucGlwLWVtcHR5LXBpZS10ZXh0JykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcucGllLWNoYXJ0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcIjxkaXYgY2xhc3M9J3BpcC1lbXB0eS1waWUtdGV4dCc+VGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGllID0gZDMubGF5b3V0LnBpZSgpLnNvcnQobnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IE51bWJlcih0aGlzLnNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGFyYyA9IGQzLnN2Zy5hcmMoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5pbm5lclJhZGl1cyhzaXplIC8gMiAtIDIwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vdXRlclJhZGl1cyhzaXplIC8gMiAtIDU3KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdmcgPSBkMy5zZWxlY3Qoc3ZnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2VtcHR5LXN0YXRlJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgXCJ0cmFuc2xhdGUoXCIgKyBzaXplIC8gMiArIFwiLFwiICsgc2l6ZSAvIDIgKyBcIilcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IHN2Zy5zZWxlY3RBbGwoXCJwYXRoXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGEocGllKFsxXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwicGF0aFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcInJnYmEoMCwgMCwgMCwgMC4wOClcIilcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgPCBhbnkgPiBhcmMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNlbnRlckNoYXJ0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jZW50ZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3ZnRWxlbSA9IGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnRNYXJnaW4gPSAkKHN2Z0VsZW0pLmlubmVyV2lkdGgoKSAvIDIgLSAoTnVtYmVyKHRoaXMuc2l6ZSkgfHwgMjUwKSAvIDI7XHJcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5maW5kKCcubnYtcGllQ2hhcnQnKVswXSkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbGVmdE1hcmdpbiArICcsIDApJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVuZGVyVG90YWxMYWJlbChzdmdFbGVtKSB7XHJcbiAgICAgICAgICAgIGlmICgoIXRoaXMudG90YWwgJiYgIXRoaXMuZG9udXQpIHx8ICF0aGlzLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCB0b3RhbFZhbCA9IHRoaXMuZGF0YS5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgY3Vycikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1bSArIGN1cnIudmFsdWU7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRvdGFsVmFsID49IDEwMDAwKSB0b3RhbFZhbCA9ICh0b3RhbFZhbCAvIDEwMDApLnRvRml4ZWQoMSkgKyAnayc7XHJcblxyXG4gICAgICAgICAgICBkMy5zZWxlY3Qoc3ZnRWxlbSlcclxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5udi1waWU6bm90KC5udmQzKScpXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcclxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdsYWJlbC10b3RhbCcsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcclxuICAgICAgICAgICAgICAgIC5zdHlsZSgnZG9taW5hbnQtYmFzZWxpbmUnLCAnY2VudHJhbCcpXHJcbiAgICAgICAgICAgICAgICAudGV4dCh0b3RhbFZhbCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRpdGxlRWxlbSA9IGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmZpbmQoJ3RleHQubGFiZWwtdG90YWwnKS5nZXQoMCkpLnN0eWxlKCdvcGFjaXR5JywgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlc2l6ZVRpdGxlTGFiZWxVbndyYXAoKSB7XHJcbiAgICAgICAgICAgIGlmICgoIXRoaXMudG90YWwgJiYgIXRoaXMuZG9udXQpIHx8ICF0aGlzLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGJveFNpemUgPSAoIDwgYW55ID4gdGhpcy4kZWxlbWVudC5maW5kKCcubnZkMy5udi1waWVDaGFydCcpLmdldCgwKSkuZ2V0QkJveCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFib3hTaXplLndpZHRoIHx8ICFib3hTaXplLmhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRpdGxlRWxlbS5zdHlsZSgnZm9udC1zaXplJywgfn5ib3hTaXplLndpZHRoIC8gNC41KS5zdHlsZSgnb3BhY2l0eScsIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZGF0YSwgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5jb2xvciA9IGl0ZW0uY29sb3IgfHwgdGhpcy5waXBDaGFydENvbG9ycy5nZXRNYXRlcmlhbENvbG9yKGluZGV4LCB0aGlzLmNvbG9ycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgUGllQ2hhcnQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIGJpbmRpbmdzOiBQaWVDaGFydEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGllX2NoYXJ0L1BpZUNoYXJ0Lmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFBpZUNoYXJ0Q29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBQaWVDaGFydHMnLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBQaWVDaGFydCcsIFBpZUNoYXJ0KTtcclxufSIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdiYXJfY2hhcnQvQmFyQ2hhcnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJiYXItY2hhcnRcIj5cXG4nICtcbiAgICAnICAgIDxzdmcgPjwvc3ZnPlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJzxwaXAtY2hhcnQtbGVnZW5kIG5nLXNob3c9XCIkY3RybC5sZWdlbmRcIiBwaXAtc2VyaWVzPVwiJGN0cmwubGVnZW5kXCIgcGlwLWludGVyYWN0aXZlPVwiJGN0cmwuaW50ZXJhY3RpdmVMZWdlbmRcIj48L3BpcC1jaGFydC1sZWdlbmQ+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnY2hhcnRfbGVnZW5kL0NoYXJ0SW50ZXJhY3RpdmVMZWdlbmQuaHRtbCcsXG4gICAgJzxkaXYgPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImNoYXJ0LWxlZ2VuZC1pdGVtXCIgbmctcmVwZWF0PVwiaXRlbSBpbiAkY3RybC5zZXJpZXNcIiBuZy1zaG93PVwiaXRlbS52YWx1ZXMgfHwgaXRlbS52YWx1ZVwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1jaGVja2JveCBuZy1tb2RlbD1cIml0ZW0uZGlzYWJsZWRcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICBuZy10cnVlLXZhbHVlPVwiZmFsc2VcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICBuZy1mYWxzZS12YWx1ZT1cInRydWVcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICBuZy1pZj1cIiRjdHJsLmludGVyYWN0aXZlXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cInt7IGl0ZW0ubGFiZWwgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHAgY2xhc3M9XCJsZWdlbmQtaXRlbS12YWx1ZVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICBuZy1pZj1cIml0ZW0udmFsdWVcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICBuZy1zdHlsZT1cIntcXCdiYWNrZ3JvdW5kLWNvbG9yXFwnOiBpdGVtLmNvbG9yfVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgaXRlbS52YWx1ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L3A+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxwIGNsYXNzPVwibGVnZW5kLWl0ZW0tbGFiZWxcIj57ezo6IGl0ZW0ubGFiZWwgfHwgaXRlbS5rZXkgfX08L3A+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1jaGVja2JveD5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBuZy1pZj1cIiEkY3RybC5pbnRlcmFjdGl2ZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImJ1bGxldFwiIG5nLXN0eWxlPVwie1xcJ2JhY2tncm91bmQtY29sb3JcXCc6IGl0ZW0uY29sb3J9XCI+PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICA8c3Bhbj57ezo6IGl0ZW0ubGFiZWwgfHwgaXRlbS5rZXl9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsaW5lX2NoYXJ0L0xpbmVDaGFydC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cImxpbmUtY2hhcnRcIiBmbGV4PVwiYXV0b1wiIGxheW91dD1cImNvbHVtblwiPlxcbicgK1xuICAgICcgICAgPHN2ZyBjbGFzcz1cImZsZXgtYXV0b1wiIG5nLWNsYXNzPVwie1xcJ3Zpc2libGUteC1heGlzXFwnOiAkY3RybC5zaG93WEF4aXMsIFxcJ3Zpc2libGUteS1heGlzXFwnOiAkY3RybC5zaG93WUF4aXN9XCI+XFxuJyArXG4gICAgJyAgICA8L3N2Zz5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJzY3JvbGwtY29udGFpbmVyXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInZpc3VhbC1zY3JvbGxcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNjcm9sbGVkLWJsb2NrXCI+PC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1mYWIgbWQtbWluaSBtaW51cy1idXR0b25cIiBuZy1jbGljaz1cIiRjdHJsLnpvb21PdXQoKVwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bWludXMtY2lyY2xlXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtZmFiIG1kLW1pbmkgcGx1cy1idXR0b25cIiBuZy1jbGljaz1cIiRjdHJsLnpvb21JbigpXCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzLWNpcmNsZVwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJzxwaXAtY2hhcnQtbGVnZW5kIHBpcC1zZXJpZXM9XCIkY3RybC5sZWdlbmRcIiBwaXAtaW50ZXJhY3RpdmU9XCIkY3RybC5pbnRlcmFjdGl2ZUxlZ2VuZFwiPjwvcGlwLWNoYXJ0LWxlZ2VuZD5cXG4nICtcbiAgICAnJyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwQ2hhcnRzLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgncGllX2NoYXJ0L1BpZUNoYXJ0Lmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGllLWNoYXJ0XCIgY2xhc3M9XCJsYXlvdXQtY29sdW1uIGZsZXgtYXV0b1wiIG5nLWNsYXNzPVwie1xcJ2NpcmNsZVxcJzogISRjdHJsLmRvbnV0fVwiPlxcbicgK1xuICAgICcgICAgPHN2ZyBjbGFzcz1cImZsZXgtYXV0b1wiPjwvc3ZnPlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJzxwaXAtY2hhcnQtbGVnZW5kIHBpcC1zZXJpZXM9XCIkY3RybC5kYXRhXCIgcGlwLWludGVyYWN0aXZlPVwiZmFsc2VcIiBuZy1pZj1cIiRjdHJsLmxlZ2VuZFwiPjwvcGlwLWNoYXJ0LWxlZ2VuZD4nKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1jaGFydHMtaHRtbC5qcy5tYXBcbiJdfQ==