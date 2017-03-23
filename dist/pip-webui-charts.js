(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).charts = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
Object.defineProperty(exports, "__esModule", { value: true });
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
Object.defineProperty(exports, "__esModule", { value: true });

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
Object.defineProperty(exports, "__esModule", { value: true });
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
Object.defineProperty(exports, "__esModule", { value: true });
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
    '<div class="bar-chart"><svg></svg></div><pip-chart-legend ng-show="$ctrl.legend" pip-series="$ctrl.legend" pip-interactive="$ctrl.interactiveLegend"></pip-chart-legend>');
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
    '<div><div class="chart-legend-item" ng-repeat="item in $ctrl.series" ng-show="item.values || item.value"><md-checkbox ng-model="item.disabled" ng-true-value="false" ng-false-value="true" ng-if="$ctrl.interactive" aria-label="{{ item.label }}"><p class="legend-item-value" ng-if="item.value" ng-style="{\'background-color\': item.color}">{{ item.value }}</p><p class="legend-item-label">{{:: item.label || item.key }}</p></md-checkbox><div ng-if="!$ctrl.interactive"><span class="bullet" ng-style="{\'background-color\': item.color}"></span> <span>{{:: item.label || item.key}}</span></div></div></div>');
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
    '<div class="line-chart" flex="auto" layout="column"><svg class="flex-auto" ng-class="{\'visible-x-axis\': $ctrl.showXAxis, \'visible-y-axis\': $ctrl.showYAxis}"></svg><div class="scroll-container"><div class="visual-scroll"><div class="scrolled-block"></div></div></div><md-button class="md-fab md-mini minus-button" ng-click="$ctrl.zoomOut()"><md-icon md-svg-icon="icons:minus-circle"></md-icon></md-button><md-button class="md-fab md-mini plus-button" ng-click="$ctrl.zoomIn()"><md-icon md-svg-icon="icons:plus-circle"></md-icon></md-button></div><pip-chart-legend pip-series="$ctrl.legend" pip-interactive="$ctrl.interactiveLegend"></pip-chart-legend>');
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
    '<div class="pie-chart" ng-class="{\'circle\': !$ctrl.donut}"><svg class="flex-auto"></svg></div><pip-chart-legend pip-series="$ctrl.data" pip-interactive="false" ng-if="$ctrl.legend"></pip-chart-legend>');
}]);
})();



},{}]},{},[8,1,2,3,4,5,6,7])(8)
});

//# sourceMappingURL=pip-webui-charts.js.map
