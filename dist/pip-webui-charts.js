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
                    left: 50
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
                if (_this.onlyZeroY()) {
                    _this.chart.yDomain([0, 5]);
                }
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
        LineChartController.prototype.onlyZeroY = function () {
            for (var seria in this.data) {
                for (var v in this.data[seria]['values']) {
                    if (this.data[seria]['values'][v]['value'] != 0)
                        return false;
                }
                ;
            }
            ;
            return true;
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



},{}]},{},[8,1,2,3,4,5,6,7])(8)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYmFyX2NoYXJ0L0JhckNoYXJ0LnRzIiwic3JjL2NoYXJ0X2NvbG9ycy9DaGFydENvbG9yc1NlcnZpY2UudHMiLCJzcmMvY2hhcnRfbGVnZW5kL0NoYXJ0SW50ZXJhY3RpdmVMZWdlbmQudHMiLCJzcmMvaW5kZXgudHMiLCJzcmMvbGluZV9jaGFydC9MaW5lQ2hhcnQudHMiLCJzcmMvcGllX2NoYXJ0L1BpZUNoYXJ0LnRzIiwidGVtcC9waXAtd2VidWktY2hhcnRzLWh0bWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDRUEsQ0FBQztJQVVHLElBQU0sZ0JBQWdCLEdBQXNCO1FBQ3hDLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0IsV0FBVyxFQUFFLGtCQUFrQjtRQUMvQixpQkFBaUIsRUFBRSxrQkFBa0I7S0FDeEMsQ0FBQTtJQUVEO1FBQUE7UUFPQSxDQUFDO1FBQUQsOEJBQUM7SUFBRCxDQVBBLEFBT0MsSUFBQTtJQUVEO1FBYUksNEJBQ1ksUUFBZ0IsRUFDaEIsTUFBaUIsRUFDakIsUUFBNEIsRUFDNUIsY0FBbUM7WUFFM0MsVUFBVSxDQUFDO1lBTmYsaUJBaUJDO1lBaEJXLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBVztZQUNqQixhQUFRLEdBQVIsUUFBUSxDQUFvQjtZQUM1QixtQkFBYyxHQUFkLGNBQWMsQ0FBcUI7WUFUdkMsVUFBSyxHQUF3QixJQUFJLENBQUM7WUFHbEMsV0FBTSxHQUFXLEdBQUcsQ0FBQztZQVV6QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUMzRCxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxVQUFDLGFBQWE7Z0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO29CQUFD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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgSUNoYXJ0Q29sb3JzU2VydmljZSB9IGZyb20gJy4uL2NoYXJ0X2NvbG9ycy9JQ2hhcnRDb2xvcnNTZXJ2aWNlJztcclxuXHJcbntcclxuICAgIGludGVyZmFjZSBJQmFyQ2hhcnRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBzZXJpZXM6IGFueTtcclxuICAgICAgICB4VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIHlUaWNrRm9ybWF0OiBhbnk7XHJcbiAgICAgICAgaW50ZXJhY3RpdmVMZWdlbmQ6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBCYXJDaGFydEJpbmRpbmdzOiBJQmFyQ2hhcnRCaW5kaW5ncyA9IHtcclxuICAgICAgICBzZXJpZXM6ICc8cGlwU2VyaWVzJyxcclxuICAgICAgICB4VGlja0Zvcm1hdDogJzw/cGlwWFRpY2tGb3JtYXQnLFxyXG4gICAgICAgIHlUaWNrRm9ybWF0OiAnPD9waXBZVGlja0Zvcm1hdCcsXHJcbiAgICAgICAgaW50ZXJhY3RpdmVMZWdlbmQ6ICc8P3BpcEludGVyTGVnZW5kJ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIEJhckNoYXJ0QmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgSUJhckNoYXJ0QmluZGluZ3MsIG5nLklPbkNoYW5nZXNPYmplY3Qge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgc2VyaWVzOiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICB4VGlja0Zvcm1hdDogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgeVRpY2tGb3JtYXQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgQmFyQ2hhcnRDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIsIElCYXJDaGFydEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgc2VyaWVzOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHhUaWNrRm9ybWF0OiBhbnk7XHJcbiAgICAgICAgcHVibGljIHlUaWNrRm9ybWF0OiBhbnk7XHJcbiAgICAgICAgcHVibGljIGludGVyYWN0aXZlTGVnZW5kOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBsZWdlbmQ6IGFueTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkYXRhOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBjaGFydDogbnYuRGlzY3JldGVCYXJDaGFydCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBjaGFydEVsZW06IGFueTtcclxuICAgICAgICBwcml2YXRlIGNvbG9yczogc3RyaW5nW107XHJcbiAgICAgICAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlciA9IDI3MDtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlIHBpcENoYXJ0Q29sb3JzOiBJQ2hhcnRDb2xvcnNTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzID0gdGhpcy5waXBDaGFydENvbG9ycy5nZW5lcmF0ZU1hdGVyaWFsQ29sb3JzKCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLmxlZ2VuZCcsICh1cGRhdGVkTGVnZW5kKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVwZGF0ZWRMZWdlbmQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnByZXBhcmVEYXRhKHVwZGF0ZWRMZWdlbmQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sZWdlbmQgPSB1cGRhdGVkTGVnZW5kO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2hhcnQoKTtcclxuICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uSW5pdCgpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh0aGlzLnNlcmllcyk7XHJcbiAgICAgICAgICAgIHRoaXMubGVnZW5kID0gXy5jbG9uZSh0aGlzLnNlcmllcyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKHRoaXMuY29sb3JzLm1hcCgoY29sb3IpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5waXBDaGFydENvbG9ycy5tYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFudGlhdGVDaGFydCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogQmFyQ2hhcnRCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy54VGlja0Zvcm1hdCA9IGNoYW5nZXMueFRpY2tGb3JtYXQgPyBjaGFuZ2VzLnhUaWNrRm9ybWF0LmN1cnJlbnRWYWx1ZSA6IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMueVRpY2tGb3JtYXQgPSBjaGFuZ2VzLnlUaWNrRm9ybWF0ID8gY2hhbmdlcy55VGlja0Zvcm1hdC5jdXJyZW50VmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aXZlTGVnZW5kID0gY2hhbmdlcy5pbnRlcmFjdGl2ZUxlZ2VuZCA/IGNoYW5nZXMuaW50ZXJhY3RpdmVMZWdlbmQuY3VycmVudFZhbHVlIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnNlcmllcyAmJiBjaGFuZ2VzLnNlcmllcy5jdXJyZW50VmFsdWUgIT09IGNoYW5nZXMuc2VyaWVzLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VyaWVzID0gY2hhbmdlcy5zZXJpZXMuY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh0aGlzLnNlcmllcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZ2VuZCA9IF8uY2xvbmUodGhpcy5zZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdXBkYXRlQ2hhcnQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoYXJ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbS5kYXR1bSh0aGlzLmRhdGEpLmNhbGwodGhpcy5jaGFydCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ0JhcldpZHRoQW5kTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbnN0YW50aWF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICBudi5hZGRHcmFwaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0ID0gbnYubW9kZWxzLmRpc2NyZXRlQmFyQ2hhcnQoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXJnaW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogNTBcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC54KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmxhYmVsIHx8IGQua2V5IHx8IGQueDtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC55KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnNob3dWYWx1ZXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc3RhZ2dlckxhYmVscyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zaG93WEF4aXModHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc2hvd1lBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLnZhbHVlRm9ybWF0KCA8IGFueSA+IGQzLmZvcm1hdCgnZCcpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbigwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQodGhpcy5oZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNvbG9yKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbZC5zZXJpZXNdLmNvbG9yIHx8IHRoaXMucGlwQ2hhcnRDb2xvcnMubWF0ZXJpYWxDb2xvclRvUmdiYSh0aGlzLmNvbG9yc1tkLnNlcmllc10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQudG9vbHRpcC5lbmFibGVkKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQubm9EYXRhKCdUaGVyZSBpcyBubyBkYXRhIHJpZ2h0IG5vdy4uLicpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQueUF4aXNcclxuICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy55VGlja0Zvcm1hdCA/IHRoaXMueVRpY2tGb3JtYXQoZCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQueEF4aXNcclxuICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy54VGlja0Zvcm1hdCA/IHRoaXMueFRpY2tGb3JtYXQoZCkgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtID0gPCBhbnkgPiBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5nZXQoMCkpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnLmJhci1jaGFydCBzdmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXR1bSh0aGlzLmRhdGEpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdoZWlnaHQnLCAnMjg1cHgnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKHRoaXMuY2hhcnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFydC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ0JhcldpZHRoQW5kTGFiZWwoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RW1wdHlTdGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcnQ7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnQmFyV2lkdGhBbmRMYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBwcmVwYXJlRGF0YShkYXRhKTogYW55IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIF8uZWFjaChkYXRhLCAoc2VyaWEpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghc2VyaWEuZGlzYWJsZWQgJiYgc2VyaWEudmFsdWVzKSByZXN1bHQucHVzaChzZXJpYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gXy5jbG9uZURlZXAocmVzdWx0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZHJhd0VtcHR5U3RhdGUoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLiRlbGVtZW50LmZpbmQoJy5udi1ub0RhdGEnKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpWzBdKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGcgPSB0aGlzLmNoYXJ0RWxlbS5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdlbXB0eS1zdGF0ZScsIHRydWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGhpcy4kZWxlbWVudC5maW5kKCcubnZkMy1zdmcnKS5pbm5lcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luID0gd2lkdGggKiAwLjE7XHJcblxyXG4gICAgICAgICAgICAgICAgZy5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdyZ2JhKDAsIDAsIDAsIDAuMDgpJylcclxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy5oZWlnaHQgLSAxMClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAzOCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZy5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDQyLCA2MCknKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdyZ2JhKDAsIDAsIDAsIDAuMDgpJylcclxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgMjAwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIDM4KTtcclxuXHJcbiAgICAgICAgICAgICAgICBnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoODQsIDE2MCknKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdyZ2JhKDAsIDAsIDAsIDAuMDgpJylcclxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgMTAwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIDM4KTtcclxuXHJcbiAgICAgICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArICg1MCArIG1hcmdpbikgKyAnLCAwKSwgJyArICdzY2FsZSgnICsgKCh3aWR0aCAtIDIgKiBtYXJnaW4pIC8gMTI2KSArICcsIDEpJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgY29uZmlnQmFyV2lkdGhBbmRMYWJlbCh0aW1lb3V0OiBudW1iZXIgPSAxMDAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxhYmVscyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLm52LWJhciB0ZXh0JyksXHJcbiAgICAgICAgICAgICAgICBjaGFydEJhcnMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5udi1iYXInKSxcclxuICAgICAgICAgICAgICAgIHBhcmVudEhlaWdodCA9ICggPCBhbnkgPiB0aGlzLiRlbGVtZW50LmZpbmQoJy5udmQzLXN2ZycpWzBdKS5nZXRCQm94KCkuaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZmluZCgnLmJhci1jaGFydCcpWzBdKS5jbGFzc2VkKCd2aXNpYmxlJywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICBfLmVhY2goY2hhcnRCYXJzLCAoaXRlbTogRXZlbnRUYXJnZXQsIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJhckhlaWdodCA9IE51bWJlcihkMy5zZWxlY3QoaXRlbSkuc2VsZWN0KCdyZWN0JykuYXR0cignaGVpZ2h0JykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhcldpZHRoID0gTnVtYmVyKGQzLnNlbGVjdChpdGVtKS5zZWxlY3QoJ3JlY3QnKS5hdHRyKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZDMuc2VsZWN0KGl0ZW0pLFxyXG4gICAgICAgICAgICAgICAgICAgIHggPSBkMy50cmFuc2Zvcm0oZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nKSkudHJhbnNsYXRlWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHkgPSBkMy50cmFuc2Zvcm0oZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nKSkudHJhbnNsYXRlWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgTnVtYmVyKHggKyBpbmRleCAqIChiYXJXaWR0aCArIDE1KSkgKyAnLCAnICsgKHRoaXMuaGVpZ2h0IC0gMjApICsgJyknKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ3JlY3QnKS5hdHRyKCdoZWlnaHQnLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLnRyYW5zaXRpb24oKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbih0aW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBOdW1iZXIoeCArIGluZGV4ICogKGJhcldpZHRoICsgMTUpKSArICcsICcgKyB5ICsgJyknKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ3JlY3QnKS5hdHRyKCdoZWlnaHQnLCBiYXJIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdChsYWJlbHNbaW5kZXhdKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIGJhckhlaWdodCAvIDIgKyAxMClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cigneCcsIGJhcldpZHRoIC8gMik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZGF0YSwgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0udmFsdWVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS52YWx1ZXNbMF0uY29sb3IgPSBpdGVtLnZhbHVlc1swXS5jb2xvciB8fCB0aGlzLnBpcENoYXJ0Q29sb3JzLmdldE1hdGVyaWFsQ29sb3IoaW5kZXgsIHRoaXMuY29sb3JzKTtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbG9yID0gaXRlbS52YWx1ZXNbMF0uY29sb3I7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgQmFyQ2hhcnQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIGJpbmRpbmdzOiBCYXJDaGFydEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnYmFyX2NoYXJ0L0JhckNoYXJ0Lmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IEJhckNoYXJ0Q29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBCYXJDaGFydHMnLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBCYXJDaGFydCcsIEJhckNoYXJ0KTtcclxufSIsImltcG9ydCB7IElDaGFydENvbG9yc1NlcnZpY2UgfSBmcm9tICcuL0lDaGFydENvbG9yc1NlcnZpY2UnO1xyXG5cclxue1xyXG4gICAgY2xhc3MgQ2hhcnRDb2xvcnNTZXJ2aWNlIGltcGxlbWVudHMgSUNoYXJ0Q29sb3JzU2VydmljZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJG1kQ29sb3JQYWxldHRlOiBhbmd1bGFyLm1hdGVyaWFsLklDb2xvclBhbGV0dGVcclxuICAgICAgICApIHsgXHJcbiAgICAgICAgICAgIFwibmdJbmplY3RcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXRlcmlhbENvbG9yKGluZGV4OiBudW1iZXIsIGNvbG9yczogc3RyaW5nW10pOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBpZiAoIWNvbG9ycyB8fCBjb2xvcnMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yc1tpbmRleF0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiAncmdiYSgnICsgdGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMF0gKyAnLCcgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMV0gKyAnLCcgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWVbMl0gKyAnLCcgK1xyXG4gICAgICAgICAgICAgICAgKHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdLnZhbHVlWzNdIHx8IDEpICsgJyknO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdlbmVyYXRlTWF0ZXJpYWxDb2xvcnMoKTogc3RyaW5nW10ge1xyXG4gICAgICAgICAgICBsZXQgY29sb3JzID0gXy5tYXAoKDxhbnk+dGhpcy4kbWRDb2xvclBhbGV0dGUpLCAocGFsZXR0ZSwgY29sb3I6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29sb3JzID0gXy5maWx0ZXIoY29sb3JzLCAoY29sb3I6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNPYmplY3QodGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdKSAmJiBfLmlzT2JqZWN0KHRoaXMuJG1kQ29sb3JQYWxldHRlW2NvbG9yXVs1MDBdKSAmJiBfLmlzQXJyYXkodGhpcy4kbWRDb2xvclBhbGV0dGVbY29sb3JdWzUwMF0udmFsdWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb2xvcnM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBDaGFydENvbG9ycycsIFtdKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdwaXBDaGFydENvbG9ycycsIENoYXJ0Q29sb3JzU2VydmljZSk7XHJcbn0iLCJpbXBvcnQgeyBJQ2hhcnRDb2xvcnNTZXJ2aWNlIH0gZnJvbSAnLi4vY2hhcnRfY29sb3JzL0lDaGFydENvbG9yc1NlcnZpY2UnO1xyXG5cclxue1xyXG4gICAgaW50ZXJmYWNlIElDaGFydExlZ2VuZEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHNlcmllczogYW55O1xyXG4gICAgICAgIGludGVyYWN0aXZlOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgQ2hhcnRMZWdlbmRCaW5kaW5nczogSUNoYXJ0TGVnZW5kQmluZGluZ3MgPSB7XHJcbiAgICAgICAgc2VyaWVzOiAnPHBpcFNlcmllcycsXHJcbiAgICAgICAgaW50ZXJhY3RpdmU6ICc8cGlwSW50ZXJhY3RpdmUnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgQ2hhcnRMZWdlbmRCaW5kaW5nc0NoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJQ2hhcnRMZWdlbmRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBzZXJpZXM6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIGludGVyYWN0aXZlOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgQ2hhcnRMZWdlbmRDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIsIElDaGFydExlZ2VuZEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgc2VyaWVzOiBhbnk7XHJcbiAgICAgICAgcHVibGljIGludGVyYWN0aXZlOiBib29sZWFuO1xyXG5cclxuICAgICAgICBwcml2YXRlIGNvbG9yczogc3RyaW5nW107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSBwaXBDaGFydENvbG9yczogSUNoYXJ0Q29sb3JzU2VydmljZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBcIm5nSW5qZWN0XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzID0gdGhpcy5waXBDaGFydENvbG9ycy5nZW5lcmF0ZU1hdGVyaWFsQ29sb3JzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uSW5pdCgpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMZWdlbmRzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBDaGFydExlZ2VuZEJpbmRpbmdzQ2hhbmdlcykge1xyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5zZXJpZXMgJiYgY2hhbmdlcy5zZXJpZXMuY3VycmVudFZhbHVlICE9PSBjaGFuZ2VzLnNlcmllcy5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcmllcyA9IGNoYW5nZXMuc2VyaWVzLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlTGVnZW5kcygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5pbnRlcmFjdGl2ZSAmJiBjaGFuZ2VzLmludGVyYWN0aXZlLmN1cnJlbnRWYWx1ZSAhPT0gY2hhbmdlcy5pbnRlcmFjdGl2ZS5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gY2hhbmdlcy5pbnRlcmFjdGl2ZS5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbnRlcmFjdGl2ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbG9yQ2hlY2tib3hlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZUxlZ2VuZHMoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yQ2hlY2tib3hlcygpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgdGhpcy5wcmVwYXJlU2VyaWVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNvbG9yQ2hlY2tib3hlcygpIHtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tib3hDb250YWluZXJzID0gdGhpcy4kZWxlbWVudC5maW5kKCdtZC1jaGVja2JveCAubWQtY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICBfLmVhY2goY2hlY2tib3hDb250YWluZXJzLCAoaXRlbTogRXZlbnRUYXJnZXQsIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSB0aGlzLnNlcmllcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoaXRlbSlcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdjb2xvcicsIHRoaXMuc2VyaWVzW2luZGV4XS5jb2xvciB8fCB0aGlzLmNvbG9yc1tpbmRleF0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbmQoJy5tZC1pY29uJylcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgdGhpcy5zZXJpZXNbaW5kZXhdLmNvbG9yIHx8IHRoaXMuY29sb3JzW2luZGV4XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhbmltYXRlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBsZWdlbmRUaXRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5jaGFydC1sZWdlbmQtaXRlbScpO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKGxlZ2VuZFRpdGxlcywgKGl0ZW06IEV2ZW50VGFyZ2V0LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB9LCAyMDAgKiBpbmRleCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBwcmVwYXJlU2VyaWVzKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VyaWVzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBfLmVhY2godGhpcy5zZXJpZXMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGVyaWFsQ29sb3IgPSB0aGlzLnBpcENoYXJ0Q29sb3JzLmdldE1hdGVyaWFsQ29sb3IoaW5kZXgsIHRoaXMuY29sb3JzKTtcclxuICAgICAgICAgICAgICAgIGl0ZW0uY29sb3IgPSBpdGVtLmNvbG9yIHx8IChpdGVtLnZhbHVlcyAmJiBpdGVtLnZhbHVlc1swXSAmJiBpdGVtLnZhbHVlc1swXS5jb2xvciA/IGl0ZW0udmFsdWVzWzBdLmNvbG9yIDogbWF0ZXJpYWxDb2xvcik7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmRpc2FibGVkID0gaXRlbS5kaXNhYmxlZCB8fCBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IENoYXJ0TGVnZW5kOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogQ2hhcnRMZWdlbmRCaW5kaW5ncyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2NoYXJ0X2xlZ2VuZC9DaGFydEludGVyYWN0aXZlTGVnZW5kLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IENoYXJ0TGVnZW5kQ29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBDaGFydExlZ2VuZHMnLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBDaGFydExlZ2VuZCcsIENoYXJ0TGVnZW5kKTtcclxufSIsIu+7v2FuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMnLCBbXHJcbiAgICAncGlwQmFyQ2hhcnRzJyxcclxuICAgICdwaXBMaW5lQ2hhcnRzJyxcclxuICAgICdwaXBQaWVDaGFydHMnLFxyXG4gICAgJ3BpcENoYXJ0TGVnZW5kcycsXHJcbiAgICAncGlwQ2hhcnRDb2xvcnMnLFxyXG4gICAgJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnXHJcbl0pOyIsImltcG9ydCB7IElDaGFydENvbG9yc1NlcnZpY2UgfSBmcm9tICcuLi9jaGFydF9jb2xvcnMvSUNoYXJ0Q29sb3JzU2VydmljZSc7XHJcblxyXG57XHJcbiAgICBpbnRlcmZhY2UgSUxpbmVDaGFydEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHNlcmllczogYW55O1xyXG4gICAgICAgIHNob3dZQXhpczogYW55O1xyXG4gICAgICAgIHNob3dYQXhpczogYW55O1xyXG4gICAgICAgIHhGb3JtYXQ6IGFueTtcclxuICAgICAgICB4VGlja0Zvcm1hdDogYW55O1xyXG4gICAgICAgIHlUaWNrRm9ybWF0OiBhbnk7XHJcbiAgICAgICAgeFRpY2tWYWx1ZXM6IGFueTtcclxuICAgICAgICBkeW5hbWljOiBhbnk7XHJcbiAgICAgICAgZml4ZWRIZWlnaHQ6IGFueTtcclxuICAgICAgICBkeW5hbWljSGVpZ2h0OiBhbnk7XHJcbiAgICAgICAgbWluSGVpZ2h0OiBhbnk7XHJcbiAgICAgICAgbWF4SGVpZ2h0OiBhbnk7XHJcbiAgICAgICAgaW50ZXJhY3RpdmVMZWdlbmQ6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMaW5lQ2hhcnRCaW5kaW5nczogSUxpbmVDaGFydEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHNlcmllczogJzxwaXBTZXJpZXMnLFxyXG4gICAgICAgIHNob3dZQXhpczogJzw/cGlwWUF4aXMnLFxyXG4gICAgICAgIHNob3dYQXhpczogJzw/cGlwWEF4aXMnLFxyXG4gICAgICAgIHhGb3JtYXQ6ICc8P3BpcFhGb3JtYXQnLFxyXG4gICAgICAgIHhUaWNrRm9ybWF0OiAnPD9waXBYVGlja0Zvcm1hdCcsXHJcbiAgICAgICAgeVRpY2tGb3JtYXQ6ICc8P3BpcFlUaWNrRm9ybWF0JyxcclxuICAgICAgICB4VGlja1ZhbHVlczogJzw/cGlwWFRpY2tWYWx1ZXMnLFxyXG4gICAgICAgIGR5bmFtaWM6ICc8P3BpcER5bmFtaWMnLFxyXG4gICAgICAgIGZpeGVkSGVpZ2h0OiAnPD9waXBEaWFncmFtSGVpZ2h0JyxcclxuICAgICAgICBkeW5hbWljSGVpZ2h0OiAnPD9waXBEeW5hbWljSGVpZ2h0JyxcclxuICAgICAgICBtaW5IZWlnaHQ6ICc8P3BpcE1pbkhlaWdodCcsXHJcbiAgICAgICAgbWF4SGVpZ2h0OiAnPD9waXBNYXhIZWlnaHQnLFxyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiAnPD9waXBJbnRlckxlZ2VuZCdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMaW5lQ2hhcnRCaW5kaW5nc0NoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJTGluZUNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgZml4ZWRIZWlnaHQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgbnVtYmVyID4gO1xyXG4gICAgICAgIGR5bmFtaWNIZWlnaHQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgICAgICBtaW5IZWlnaHQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgbnVtYmVyID4gO1xyXG4gICAgICAgIG1heEhlaWdodDogbmcuSUNoYW5nZXNPYmplY3QgPCBudW1iZXIgPiA7XHJcblxyXG4gICAgICAgIHNlcmllczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgc2hvd1lBeGlzOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgc2hvd1hBeGlzOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgeEZvcm1hdDogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgeFRpY2tGb3JtYXQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYW55ID4gO1xyXG4gICAgICAgIHlUaWNrRm9ybWF0OiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICB4VGlja1ZhbHVlczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgZHluYW1pYzogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIGludGVyYWN0aXZlTGVnZW5kOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTGluZUNoYXJ0Q29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJTGluZUNoYXJ0QmluZGluZ3Mge1xyXG4gICAgICAgIHByaXZhdGUgSEVJR0hUID0gMjcwO1xyXG4gICAgICAgIHByaXZhdGUgY2hhcnQ6IG52LkxpbmVDaGFydCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBjaGFydEVsZW06IGFueSA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBzZXRab29tOiBGdW5jdGlvbiA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVab29tT3B0aW9uczogRnVuY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgY29sb3JzOiBzdHJpbmdbXTtcclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZml4ZWRIZWlnaHQ6IG51bWJlciA9IHRoaXMuSEVJR0hUO1xyXG4gICAgICAgIHB1YmxpYyBkeW5hbWljSGVpZ2h0OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgcHVibGljIG1pbkhlaWdodDogbnVtYmVyID0gdGhpcy5IRUlHSFQ7XHJcbiAgICAgICAgcHVibGljIG1heEhlaWdodDogbnVtYmVyID0gdGhpcy5IRUlHSFQ7XHJcbiAgICAgICAgcHVibGljIHNlcmllczogYW55O1xyXG4gICAgICAgIHB1YmxpYyBzaG93WUF4aXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyBzaG93WEF4aXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyB4Rm9ybWF0OiBGdW5jdGlvbjtcclxuICAgICAgICBwdWJsaWMgeFRpY2tGb3JtYXQ6IEZ1bmN0aW9uO1xyXG4gICAgICAgIHB1YmxpYyB5VGlja0Zvcm1hdDogRnVuY3Rpb247XHJcbiAgICAgICAgcHVibGljIHhUaWNrVmFsdWVzOiBudW1iZXJbXTtcclxuICAgICAgICBwdWJsaWMgZHluYW1pYzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRlcmFjdGl2ZUxlZ2VuZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHB1YmxpYyBkYXRhOiBhbnk7XHJcbiAgICAgICAgcHVibGljIGxlZ2VuZDogYW55O1xyXG4gICAgICAgIHB1YmxpYyBzb3VyY2VFdmVudHM6IGFueTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlIHBpcENoYXJ0Q29sb3JzOiBJQ2hhcnRDb2xvcnNTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzID0gdGhpcy5waXBDaGFydENvbG9ycy5nZW5lcmF0ZU1hdGVyaWFsQ29sb3JzKCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5sZWdlbmQnLCAodXBkYXRlZExlZ2VuZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh1cGRhdGVkTGVnZW5kKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kID0gdXBkYXRlZExlZ2VuZDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0QWxsKCcubnZ0b29sdGlwJykuc3R5bGUoJ29wYWNpdHknLCAwKTtcclxuICAgICAgICAgICAgICAgIH0sIDgwMClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uSW5pdCgpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh0aGlzLnNlcmllcykgfHwgW107XHJcbiAgICAgICAgICAgIHRoaXMubGVnZW5kID0gXy5jbG9uZSh0aGlzLnNlcmllcyk7XHJcbiAgICAgICAgICAgIHRoaXMuc291cmNlRXZlbnRzID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuXHJcbiAgICAgICAgICAgICggPCBhbnkgPiBkMy5zY2FsZSkucGFsZXR0ZUNvbG9ycyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkMy5zY2FsZS5vcmRpbmFsKCkucmFuZ2UodGhpcy5jb2xvcnMubWFwKChjb2xvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBpcENoYXJ0Q29sb3JzLm1hdGVyaWFsQ29sb3JUb1JnYmEoY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbnN0YW50aWF0ZUNoYXJ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBMaW5lQ2hhcnRCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5maXhlZEhlaWdodCA9IGNoYW5nZXMuZml4ZWRIZWlnaHQgPyBjaGFuZ2VzLmZpeGVkSGVpZ2h0LmN1cnJlbnRWYWx1ZSA6IHRoaXMuSEVJR0hUO1xyXG4gICAgICAgICAgICB0aGlzLm1pbkhlaWdodCA9IGNoYW5nZXMubWluSGVpZ2h0ID8gY2hhbmdlcy5taW5IZWlnaHQuY3VycmVudFZhbHVlIDogdGhpcy5IRUlHSFQ7XHJcbiAgICAgICAgICAgIHRoaXMubWF4SGVpZ2h0ID0gY2hhbmdlcy5tYXhIZWlnaHQgPyBjaGFuZ2VzLm1heEhlaWdodC5jdXJyZW50VmFsdWUgOiB0aGlzLkhFSUdIVDtcclxuICAgICAgICAgICAgdGhpcy5keW5hbWljSGVpZ2h0ID0gY2hhbmdlcy5keW5hbWljSGVpZ2h0ID8gY2hhbmdlcy5keW5hbWljSGVpZ2h0LmN1cnJlbnRWYWx1ZSA6IHRoaXMuZHluYW1pY0hlaWdodDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1hBeGlzID0gY2hhbmdlcy5zaG93WEF4aXMgPyBjaGFuZ2VzLnNob3dYQXhpcy5jdXJyZW50VmFsdWUgOiB0aGlzLnNob3dYQXhpcztcclxuICAgICAgICAgICAgdGhpcy5zaG93WUF4aXMgPSBjaGFuZ2VzLnNob3dZQXhpcyA/IGNoYW5nZXMuc2hvd1lBeGlzLmN1cnJlbnRWYWx1ZSA6IHRoaXMuc2hvd1lBeGlzO1xyXG4gICAgICAgICAgICB0aGlzLmR5bmFtaWMgPSBjaGFuZ2VzLmR5bmFtaWMgPyBjaGFuZ2VzLmR5bmFtaWMuY3VycmVudFZhbHVlIDogdGhpcy5keW5hbWljO1xyXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aXZlTGVnZW5kID0gY2hhbmdlcy5pbnRlcmFjdGl2ZUxlZ2VuZCA/IGNoYW5nZXMuaW50ZXJhY3RpdmVMZWdlbmQuY3VycmVudFZhbHVlIDogdGhpcy5pbnRlcmFjdGl2ZUxlZ2VuZDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMueEZvcm1hdCA9IGNoYW5nZXMueEZvcm1hdCA/IGNoYW5nZXMueEZvcm1hdC5jdXJyZW50VmFsdWUgOiB0aGlzLnhGb3JtYXQ7XHJcbiAgICAgICAgICAgIHRoaXMueFRpY2tGb3JtYXQgPSBjaGFuZ2VzLnhUaWNrRm9ybWF0ID8gY2hhbmdlcy54VGlja0Zvcm1hdC5jdXJyZW50VmFsdWUgOiB0aGlzLnhUaWNrRm9ybWF0O1xyXG4gICAgICAgICAgICB0aGlzLnlUaWNrRm9ybWF0ID0gY2hhbmdlcy55VGlja0Zvcm1hdCA/IGNoYW5nZXMueVRpY2tGb3JtYXQuY3VycmVudFZhbHVlIDogdGhpcy55VGlja0Zvcm1hdDtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnhUaWNrVmFsdWVzICYmIGNoYW5nZXMueFRpY2tWYWx1ZXMuY3VycmVudFZhbHVlICE9PSBjaGFuZ2VzLnhUaWNrVmFsdWVzLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueFRpY2tWYWx1ZXMgPSBjaGFuZ2VzLnhUaWNrVmFsdWVzLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlWFRpY2tWYWx1ZXMoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXJ0RWxlbSAmJiB0aGlzLmNoYXJ0KSB0aGlzLmNoYXJ0RWxlbS5kYXR1bSh0aGlzLmRhdGEgfHwgW10pLmNhbGwodGhpcy5jaGFydCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnNlcmllcyAmJiBjaGFuZ2VzLnNlcmllcy5jdXJyZW50VmFsdWUgIT09IGNoYW5nZXMuc2VyaWVzLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VyaWVzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcHJlcGFyZURhdGEoZGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgXy5lYWNoKGRhdGEsIChzZXJpYSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZXJpYS5kaXNhYmxlZCAmJiBzZXJpYS52YWx1ZXMpIHJlc3VsdC5wdXNoKHNlcmlhKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXy5jbG9uZURlZXAocmVzdWx0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgICAgICAvKmlmICh0aGlzLmR5bmFtaWNIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhlaWd0aCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMubWluSGVpZ2h0LCB0aGlzLiRlbGVtZW50LnBhcmVudCgpLmlubmVySGVpZ2h0KCkpLCB0aGlzLm1heEhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGVpZ3RoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZml4ZWRIZWlnaHQ7XHJcbiAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5keW5hbWljSGVpZ2h0ID8gTWF0aC5taW4oTWF0aC5tYXgodGhpcy5taW5IZWlnaHQsIHRoaXMuJGVsZW1lbnQucGFyZW50KCkuaW5uZXJIZWlnaHQoKSksIHRoaXMubWF4SGVpZ2h0KSA6IHRoaXMuZml4ZWRIZWlnaHQ7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHpvb21JbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0Wm9vbSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRab29tKCdpbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHpvb21PdXQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldFpvb20pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Wm9vbSgnb3V0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwcml2YXRlIGluc3RhbnRpYXRlQ2hhcnQoKSB7XHJcbiAgICAgICAgICAgIG52LmFkZEdyYXBoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQgPSBudi5tb2RlbHMubGluZUNoYXJ0KClcclxuICAgICAgICAgICAgICAgICAgICAubWFyZ2luKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAyMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IDIwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b206IDMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiA1MFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLngoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChkICE9PSB1bmRlZmluZWQgJiYgZC54ICE9PSB1bmRlZmluZWQpID8gKHRoaXMueEZvcm1hdCA/IHRoaXMueEZvcm1hdChkLngpIDogZC54KSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAueSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGQgIT09IHVuZGVmaW5lZCAmJiBkLnZhbHVlICE9PSB1bmRlZmluZWQpID8gZC52YWx1ZSA6IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KHRoaXMuZ2V0SGVpZ2h0KCkgLSA1MClcclxuICAgICAgICAgICAgICAgICAgICAudXNlSW50ZXJhY3RpdmVHdWlkZWxpbmUodHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc2hvd1hBeGlzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNob3dZQXhpcyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zaG93TGVnZW5kKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jb2xvcigoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5jb2xvciB8fCAoIDwgYW55ID4gZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMoKS5yYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25seVplcm9ZKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnlEb21haW4oWzAsIDVdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnRvb2x0aXAuZW5hYmxlZChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0Lm5vRGF0YSgnVGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnlBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueVRpY2tGb3JtYXQgPyB0aGlzLnlUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnhBeGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueFRpY2tGb3JtYXQgPyB0aGlzLnhUaWNrRm9ybWF0KGQpIDogZDtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aWNrVmFsdWVzKHRoaXMueFRpY2tWYWx1ZXMgJiYgXy5pc0FycmF5KHRoaXMueFRpY2tWYWx1ZXMpICYmIHRoaXMueFRpY2tWYWx1ZXMubGVuZ3RoID4gMiA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnJhbmdlKHRoaXMueFRpY2tWYWx1ZXNbMF0sIHRoaXMueFRpY2tWYWx1ZXNbMV0sIHRoaXMueFRpY2tWYWx1ZXNbMl0pIDogbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0gPSBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLmxpbmUtY2hhcnQgc3ZnJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbS5kYXR1bSh0aGlzLmRhdGEgfHwgW10pLnN0eWxlKCdoZWlnaHQnLCAodGhpcy5nZXRIZWlnaHQoKSAtIDUwKSArICdweCcpLmNhbGwodGhpcy5jaGFydCk7XHJcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdG91Y2hlcyBmb3IgY29ycmVjdGluZyB0b29sdGlwIHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAkKCcubGluZS1jaGFydCBzdmcnKS5vbigndG91Y2hzdGFydCB0b3VjaG1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sdGlwID0gJCgnLm52dG9vbHRpcCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcFcgPSB0b29sdGlwLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlXaWR0aCA9ICQoJ2JvZHknKS5pbm5lcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gZS5vcmlnaW5hbEV2ZW50Wyd0b3VjaGVzJ11bMF1bJ3BhZ2VYJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gZS5vcmlnaW5hbEV2ZW50Wyd0b3VjaGVzJ11bMF1bJ3BhZ2VZJ107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh4ICsgdG9vbHRpcFcgPj0gYm9keVdpZHRoID8gKHggLSB0b29sdGlwVykgOiB4KSArICcsJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ICsgJyknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5jc3MoJ2xlZnQnLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5jc3MoJ3RvcCcsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLmxpbmUtY2hhcnQgc3ZnJykub24oJ3RvdWNoc3RhcnQgdG91Y2hlbmQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZVRvb2x0aXAgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5udnRvb2x0aXAnKS5jc3MoJ29wYWNpdHknLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVUb29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVUb29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmR5bmFtaWMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFpvb20odGhpcy5jaGFydCwgdGhpcy5jaGFydEVsZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJG9uKCdwaXBNYWluUmVzaXplZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFydDtcclxuICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3RW1wdHlTdGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgb25seVplcm9ZKCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzZXJpYSBpbiB0aGlzLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHYgaW4gdGhpcy5kYXRhW3NlcmlhXVsndmFsdWVzJ10pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhW3NlcmlhXVsndmFsdWVzJ11bdl1bJ3ZhbHVlJ10gIT0gMCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVYVGlja1ZhbHVlcygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNoYXJ0KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYXJ0LnhBeGlzXHJcbiAgICAgICAgICAgICAgICAudGlja1ZhbHVlcyh0aGlzLnhUaWNrVmFsdWVzICYmIF8uaXNBcnJheSh0aGlzLnhUaWNrVmFsdWVzKSAmJiB0aGlzLnhUaWNrVmFsdWVzLmxlbmd0aCA+IDIgP1xyXG4gICAgICAgICAgICAgICAgICAgIGQzLnJhbmdlKHRoaXMueFRpY2tWYWx1ZXNbMF0sIHRoaXMueFRpY2tWYWx1ZXNbMV0sIHRoaXMueFRpY2tWYWx1ZXNbMl0pIDogbnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZUNoYXJ0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGFydCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVYVGlja1ZhbHVlcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtLmRhdHVtKHRoaXMuZGF0YSB8fCBbXSkuY2FsbCh0aGlzLmNoYXJ0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51cGRhdGVab29tT3B0aW9ucykgdGhpcy51cGRhdGVab29tT3B0aW9ucyh0aGlzLmRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZVNlcmllcygpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wcmVwYXJlRGF0YSh0aGlzLnNlcmllcyk7XHJcbiAgICAgICAgICAgIHRoaXMubGVnZW5kID0gXy5jbG9uZSh0aGlzLnNlcmllcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVDaGFydCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBvblJlc2l6ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFydC5oZWlnaHQodGhpcy5nZXRIZWlnaHQoKSAtIDUwKTtcclxuICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0uc3R5bGUoJ2hlaWdodCcsICh0aGlzLmdldEhlaWdodCgpIC0gNTApICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcnQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZHJhd0VtcHR5U3RhdGUoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy4kZWxlbWVudC5maW5kKCd0ZXh0Lm52LW5vRGF0YScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZmluZCgnLmVtcHR5LXN0YXRlJylbMF0pLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyV2lkdGggPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5saW5lLWNoYXJ0JykuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmxpbmUtY2hhcnQnKS5pbm5lckhlaWdodCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRlbGVtZW50LmZpbmQoJy5lbXB0eS1zdGF0ZScpLmdldCgwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ2ltYWdlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgKGNvbnRhaW5lcldpZHRoIC8gMTE1MSkgKyAnLCcgKyAoY29udGFpbmVySGVpZ2h0IC8gMjE2KSArICcpJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJkZWZzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJwYXR0ZXJuXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIFwiMFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgXCIwXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaWRcIiwgXCJiZ1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiaW1hZ2VcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCAxNylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgXCIyMTZweFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBcIjExNTFweFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyAoY29udGFpbmVyV2lkdGggLyAxMTUxKSArICcsJyArIChjb250YWluZXJIZWlnaHQgLyAyMTYpICsgJyknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgXCJpbWFnZXMvbGluZV9jaGFydF9lbXB0eV9zdGF0ZS5zdmdcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnZW1wdHktc3RhdGUnLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgXCIxMDAlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIFwiMTAwJVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZmlsbCcsICd1cmwoI2JnKScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHVwZGF0ZVNjcm9sbChkb21haW5zLCBib3VuZGFyeSkge1xyXG4gICAgICAgICAgICBjb25zdCBiRGlmZiA9IGJvdW5kYXJ5WzFdIC0gYm91bmRhcnlbMF0sXHJcbiAgICAgICAgICAgICAgICBkb21EaWZmID0gZG9tYWluc1sxXSAtIGRvbWFpbnNbMF0sXHJcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZG9tRGlmZiAvIGJEaWZmID09PSAxO1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzLiRlbGVtZW50WzBdKS5maW5kKCcudmlzdWFsLXNjcm9sbCcpXHJcbiAgICAgICAgICAgICAgICAuY3NzKCdvcGFjaXR5JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc0VxdWFsID8gMCA6IDE7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0VxdWFsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAkKHRoaXMuJGVsZW1lbnRbMF0pLmZpbmQoJy5zY3JvbGxlZC1ibG9jaycpXHJcbiAgICAgICAgICAgICAgICAuY3NzKCdsZWZ0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoZG9tYWluc1swXSAtIGJvdW5kYXJ5WzBdKSAvIGJEaWZmICogMTAwICsgJyUnO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb21EaWZmIC8gYkRpZmYgKiAxMDAgKyAnJSc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGEpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLmRhdGEsIChpdGVtLCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmNvbG9yID0gaXRlbS5jb2xvciB8fCB0aGlzLnBpcENoYXJ0Q29sb3JzLmdldE1hdGVyaWFsQ29sb3IoaW5kZXgsIHRoaXMuY29sb3JzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFkZFpvb20oY2hhcnQsIHN2Zykge1xyXG4gICAgICAgICAgICAvLyBTY2FsZSBFeHRlbnRcclxuICAgICAgICAgICAgY29uc3Qgc2NhbGVFeHRlbnQgPSA0O1xyXG5cclxuICAgICAgICAgICAgLy8gUGFyYW1ldGVyc1xyXG4gICAgICAgICAgICBsZXQgeUF4aXMgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgeEF4aXMgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgeERvbWFpbiA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCB5RG9tYWluID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHJlZHJhdyA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBTY2FsZXNcclxuICAgICAgICAgICAgbGV0IHhTY2FsZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCB5U2NhbGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gTWluL21heCBib3VuZGFyaWVzXHJcbiAgICAgICAgICAgIGxldCB4X2JvdW5kYXJ5ID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHlfYm91bmRhcnkgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGQzIHpvb20gaGFuZGxlclxyXG4gICAgICAgICAgICBsZXQgZDN6b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpO1xyXG4gICAgICAgICAgICBsZXQgcHJldlhEb21haW4gPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgcHJldlNjYWxlID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHByZXZUcmFuc2xhdGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2V0RGF0YSA9IChuZXdDaGFydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gUGFyYW1ldGVyc1xyXG4gICAgICAgICAgICAgICAgeUF4aXMgPSBuZXdDaGFydC55QXhpcztcclxuICAgICAgICAgICAgICAgIHhBeGlzID0gbmV3Q2hhcnQueEF4aXM7XHJcbiAgICAgICAgICAgICAgICB4RG9tYWluID0gbmV3Q2hhcnQueERvbWFpbiB8fCB4QXhpcy5zY2FsZSgpLmRvbWFpbjtcclxuICAgICAgICAgICAgICAgIHlEb21haW4gPSBuZXdDaGFydC55RG9tYWluIHx8IHlBeGlzLnNjYWxlKCkuZG9tYWluO1xyXG4gICAgICAgICAgICAgICAgcmVkcmF3ID0gbmV3Q2hhcnQudXBkYXRlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNjYWxlc1xyXG4gICAgICAgICAgICAgICAgeFNjYWxlID0geEF4aXMuc2NhbGUoKTtcclxuICAgICAgICAgICAgICAgIHlTY2FsZSA9IHlBeGlzLnNjYWxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTWluL21heCBib3VuZGFyaWVzXHJcbiAgICAgICAgICAgICAgICB4X2JvdW5kYXJ5ID0geEF4aXMuc2NhbGUoKS5kb21haW4oKS5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgeV9ib3VuZGFyeSA9IHlBeGlzLnNjYWxlKCkuZG9tYWluKCkuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZDMgem9vbSBoYW5kbGVyXHJcbiAgICAgICAgICAgICAgICBwcmV2WERvbWFpbiA9IHhfYm91bmRhcnk7XHJcbiAgICAgICAgICAgICAgICBwcmV2U2NhbGUgPSBkM3pvb20uc2NhbGUoKTtcclxuICAgICAgICAgICAgICAgIHByZXZUcmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIG5pY2UgYXhpc1xyXG4gICAgICAgICAgICAgICAgeFNjYWxlLm5pY2UoKTtcclxuICAgICAgICAgICAgICAgIHlTY2FsZS5uaWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNldERhdGEoY2hhcnQpO1xyXG5cclxuICAgICAgICAgICAgLy8gRml4IGRvbWFpblxyXG4gICAgICAgICAgICBjb25zdCBmaXhEb21haW4gPSAoZG9tYWluLCBib3VuZGFyeSwgc2NhbGUsIHRyYW5zbGF0ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpblswXSA8IGJvdW5kYXJ5WzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdID0gYm91bmRhcnlbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZYRG9tYWluWzBdICE9PSBib3VuZGFyeVswXSB8fCBzY2FsZSAhPT0gcHJldlNjYWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblsxXSArPSAoYm91bmRhcnlbMF0gLSBkb21haW5bMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblsxXSA9IHByZXZYRG9tYWluWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBfLmNsb25lKHByZXZUcmFuc2xhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluWzFdID4gYm91bmRhcnlbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICBkb21haW5bMV0gPSBib3VuZGFyeVsxXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlhEb21haW5bMV0gIT09IGJvdW5kYXJ5WzFdIHx8IHNjYWxlICE9PSBwcmV2U2NhbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdIC09IChkb21haW5bMV0gLSBib3VuZGFyeVsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluWzBdID0gcHJldlhEb21haW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSA9IF8uY2xvbmUocHJldlRyYW5zbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUodHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZYRG9tYWluID0gXy5jbG9uZShkb21haW4pO1xyXG4gICAgICAgICAgICAgICAgcHJldlNjYWxlID0gXy5jbG9uZShzY2FsZSk7XHJcbiAgICAgICAgICAgICAgICBwcmV2VHJhbnNsYXRlID0gXy5jbG9uZSh0cmFuc2xhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkb21haW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUNoYXJ0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZDN6b29tLnNjYWxlKDEpO1xyXG4gICAgICAgICAgICAgICAgZDN6b29tLnRyYW5zbGF0ZShbMCwgMF0pO1xyXG4gICAgICAgICAgICAgICAgeFNjYWxlLmRvbWFpbih4X2JvdW5kYXJ5KTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS54KHhTY2FsZSkueSh5U2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gWm9vbSBldmVudCBoYW5kbGVyXHJcbiAgICAgICAgICAgIGNvbnN0IHpvb21lZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgoIDwgYW55ID4gZDMuZXZlbnQpLnNjYWxlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW56b29tZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDaGFydCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4RG9tYWluKGZpeERvbWFpbih4U2NhbGUuZG9tYWluKCksIHhfYm91bmRhcnksICggPCBhbnkgPiBkMy5ldmVudCkuc2NhbGUsICggPCBhbnkgPiBkMy5ldmVudCkudHJhbnNsYXRlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVkcmF3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTY3JvbGwoeFNjYWxlLmRvbWFpbigpLCB4X2JvdW5kYXJ5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRGVzY3JpYmUgc2V0IHpvb20gZnVuY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5zZXRab29tID0gKHdoaWNoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXIwID0gW3N2Z1swXVswXS5nZXRCQm94KCkud2lkdGggLyAyLCBzdmdbMF1bMF0uZ2V0QkJveCgpLmhlaWdodCAvIDJdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlMCA9IGQzem9vbS50cmFuc2xhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczAgPSBjb29yZGluYXRlcyhjZW50ZXIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAod2hpY2ggPT09ICdpbicpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNjYWxlIDwgc2NhbGVFeHRlbnQpIGQzem9vbS5zY2FsZShwcmV2U2NhbGUgKyAwLjIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNjYWxlID4gMSkgZDN6b29tLnNjYWxlKHByZXZTY2FsZSAtIDAuMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2VudGVyMSA9IHBvaW50KGNvb3JkaW5hdGVzMCk7XHJcbiAgICAgICAgICAgICAgICBkM3pvb20udHJhbnNsYXRlKFt0cmFuc2xhdGUwWzBdICsgY2VudGVyMFswXSAtIGNlbnRlcjFbMF0sIHRyYW5zbGF0ZTBbMV0gKyBjZW50ZXIwWzFdIC0gY2VudGVyMVsxXV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc3RlcCA9ICh3aGljaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh3aGljaCA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVswXSAtPSAyMDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlWzBdICs9IDIwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUodHJhbnNsYXRlKTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IChwb2ludCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBkM3pvb20uc2NhbGUoKSxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBkM3pvb20udHJhbnNsYXRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhwb2ludFswXSAtIHRyYW5zbGF0ZVswXSkgLyBzY2FsZSwgKHBvaW50WzFdIC0gdHJhbnNsYXRlWzFdKSAvIHNjYWxlXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSAoY29vcmRpbmF0ZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gZDN6b29tLnNjYWxlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gZDN6b29tLnRyYW5zbGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtjb29yZGluYXRlc1swXSAqIHNjYWxlICsgdHJhbnNsYXRlWzBdLCBjb29yZGluYXRlc1sxXSAqIHNjYWxlICsgdHJhbnNsYXRlWzFdXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qga2V5cHJlc3MgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKCggPCBhbnkgPiBkMy5ldmVudCkua2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXAoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXAoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Wm9vbSgnaW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Wm9vbSgnb3V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFpvb20gZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICBjb25zdCB1bnpvb21lZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHhEb21haW4oeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgICAgICAgICByZWRyYXcoKTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS5zY2FsZSgxKTtcclxuICAgICAgICAgICAgICAgIGQzem9vbS50cmFuc2xhdGUoWzAsIDBdKTtcclxuICAgICAgICAgICAgICAgIHByZXZTY2FsZSA9IDE7XHJcbiAgICAgICAgICAgICAgICBwcmV2VHJhbnNsYXRlID0gWzAsIDBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHdyYXBwZXJcclxuICAgICAgICAgICAgZDN6b29tLngoeFNjYWxlKVxyXG4gICAgICAgICAgICAgICAgLnkoeVNjYWxlKVxyXG4gICAgICAgICAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCBzY2FsZUV4dGVudF0pXHJcbiAgICAgICAgICAgICAgICAub24oJ3pvb20nLCB6b29tZWQpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGhhbmRsZXJcclxuICAgICAgICAgICAgc3ZnLmNhbGwoZDN6b29tKS5vbignZGJsY2xpY2suem9vbScsIHVuem9vbWVkKTtcclxuICAgICAgICAgICAgJCh0aGlzLiRlbGVtZW50LmdldCgwKSkuYWRkQ2xhc3MoJ2R5bmFtaWMnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBrZXlib2FyZCBoYW5kbGVyc1xyXG4gICAgICAgICAgICBzdmdcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdmb2N1c2FibGUnLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIC5zdHlsZSgnb3V0bGluZScsICdub25lJylcclxuICAgICAgICAgICAgICAgIC5vbigna2V5ZG93bicsIGtleXByZXNzKVxyXG4gICAgICAgICAgICAgICAgLm9uKCdmb2N1cycsICgpID0+IHt9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdldFhNaW5NYXggPSAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heFZhbCwgbWluVmFsID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGFbaV0uZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcE1pblZhbCA9IGQzLm1heChkYXRhW2ldLnZhbHVlcywgKGQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueEZvcm1hdCA/IHRoaXMueEZvcm1hdChkLngpIDogZC54O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcE1heFZhbCA9IGQzLm1pbihkYXRhW2ldLnZhbHVlcywgKGQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueEZvcm1hdCA/IHRoaXMueEZvcm1hdChkLngpIDogZC54O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluVmFsID0gKCFtaW5WYWwgfHwgdGVtcE1pblZhbCA8IG1pblZhbCkgPyB0ZW1wTWluVmFsIDogbWluVmFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWwgPSAoIW1heFZhbCB8fCB0ZW1wTWF4VmFsID4gbWF4VmFsKSA/IHRlbXBNYXhWYWwgOiBtYXhWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFttYXhWYWwsIG1pblZhbF07XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVab29tT3B0aW9ucyA9IChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB5QXhpcyA9IGNoYXJ0LnlBeGlzO1xyXG4gICAgICAgICAgICAgICAgeEF4aXMgPSBjaGFydC54QXhpcztcclxuXHJcbiAgICAgICAgICAgICAgICB4U2NhbGUgPSB4QXhpcy5zY2FsZSgpO1xyXG4gICAgICAgICAgICAgICAgeVNjYWxlID0geUF4aXMuc2NhbGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB4X2JvdW5kYXJ5ID0gZ2V0WE1pbk1heChkYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZDN6b29tLnNjYWxlKCkgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBkM3pvb20ueCh4U2NhbGUpLnkoeVNjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBzdmcuY2FsbChkM3pvb20pO1xyXG4gICAgICAgICAgICAgICAgICAgIGQzem9vbS5ldmVudChzdmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2Nyb2xsKHhTY2FsZS5kb21haW4oKSwgeF9ib3VuZGFyeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTGluZUNoYXJ0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogTGluZUNoYXJ0QmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdsaW5lX2NoYXJ0L0xpbmVDaGFydC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBMaW5lQ2hhcnRDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcExpbmVDaGFydHMnLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBMaW5lQ2hhcnQnLCBMaW5lQ2hhcnQpO1xyXG59IiwiaW1wb3J0IHsgSUNoYXJ0Q29sb3JzU2VydmljZSB9IGZyb20gJy4uL2NoYXJ0X2NvbG9ycy9JQ2hhcnRDb2xvcnNTZXJ2aWNlJztcclxuXHJcbntcclxuICAgIGludGVyZmFjZSBJUGllQ2hhcnRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBzZXJpZXM6IGFueTtcclxuICAgICAgICBkb251dDogYW55O1xyXG4gICAgICAgIGxlZ2VuZDogYW55O1xyXG4gICAgICAgIHRvdGFsOiBhbnk7XHJcbiAgICAgICAgc2l6ZTogYW55O1xyXG4gICAgICAgIGNlbnRlcmVkOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgUGllQ2hhcnRCaW5kaW5nczogSVBpZUNoYXJ0QmluZGluZ3MgPSB7XHJcbiAgICAgICAgc2VyaWVzOiAnPHBpcFNlcmllcycsXHJcbiAgICAgICAgZG9udXQ6ICc8P3BpcERvbnV0JyxcclxuICAgICAgICBsZWdlbmQ6ICc8P3BpcFNob3dMZWdlbmQnLFxyXG4gICAgICAgIHRvdGFsOiAnPD9waXBTaG93VG90YWwnLFxyXG4gICAgICAgIHNpemU6ICc8P3BpcFBpZVNpemUnLFxyXG4gICAgICAgIGNlbnRlcmVkOiAnPD9waXBDZW50ZXJlZCdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBQaWVDaGFydEJpbmRpbmdzQ2hhbmdlcyBpbXBsZW1lbnRzIG5nLklPbkNoYW5nZXNPYmplY3QsIElQaWVDaGFydEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHNlcmllczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgZG9udXQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgICAgICBsZWdlbmQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgICAgICB0b3RhbDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIHNpemU6IG5nLklDaGFuZ2VzT2JqZWN0IDwgbnVtYmVyIHwgc3RyaW5nID4gO1xyXG4gICAgICAgIGNlbnRlcmVkOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgUGllQ2hhcnRDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIsIElQaWVDaGFydEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgc2VyaWVzOiBhbnk7XHJcbiAgICAgICAgcHVibGljIGRvbnV0OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgcHVibGljIGxlZ2VuZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHVibGljIHRvdGFsOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICBwdWJsaWMgc2l6ZTogbnVtYmVyIHwgc3RyaW5nID0gMjUwO1xyXG4gICAgICAgIHB1YmxpYyBjZW50ZXJlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBwcml2YXRlIGRhdGE6IGFueTtcclxuICAgICAgICBwcml2YXRlIGNoYXJ0OiBudi5QaWVDaGFydCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBjaGFydEVsZW06IGFueTtcclxuICAgICAgICBwcml2YXRlIHRpdGxlRWxlbTogYW55O1xyXG4gICAgICAgIHByaXZhdGUgY29sb3JzOiBzdHJpbmdbXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlIHBpcENoYXJ0Q29sb3JzOiBJQ2hhcnRDb2xvcnNTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzID0gdGhpcy5waXBDaGFydENvbG9ycy5nZW5lcmF0ZU1hdGVyaWFsQ29sb3JzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uSW5pdCgpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5zZXJpZXM7XHJcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVQYXJhbWV0ZXJDb2xvcigpO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gZDMuc2NhbGUpLnBhbGV0dGVDb2xvcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKHRoaXMuY29sb3JzLm1hcCgoY29sb3IpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5waXBDaGFydENvbG9ycy5tYXRlcmlhbENvbG9yVG9SZ2JhKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFudGlhdGVDaGFydCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogUGllQ2hhcnRCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5sZWdlbmQgPSBjaGFuZ2VzLmxlZ2VuZCA/IGNoYW5nZXMubGVnZW5kLmN1cnJlbnRWYWx1ZSA6IHRoaXMubGVnZW5kO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlcmVkID0gY2hhbmdlcy5jZW50ZXJlZCA/IGNoYW5nZXMuY2VudGVyZWQuY3VycmVudFZhbHVlIDogdGhpcy5jZW50ZXJlZDtcclxuICAgICAgICAgICAgdGhpcy5kb251dCA9IGNoYW5nZXMuZG9udXQgPyBjaGFuZ2VzLmRvbnV0LmN1cnJlbnRWYWx1ZSA6IHRoaXMuZG9udXQ7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IGNoYW5nZXMuc2l6ZSA/IGNoYW5nZXMuc2l6ZS5jdXJyZW50VmFsdWUgOiB0aGlzLnNpemU7XHJcbiAgICAgICAgICAgIHRoaXMudG90YWwgPSBjaGFuZ2VzLnRvdGFsID8gY2hhbmdlcy50b3RhbC5jdXJyZW50VmFsdWUgOiB0aGlzLnRvdGFsO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNoYW5nZXMuc2VyaWVzICYmIGNoYW5nZXMuc2VyaWVzLmN1cnJlbnRWYWx1ZSAhPT0gY2hhbmdlcy5zZXJpZXMucHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gY2hhbmdlcy5zZXJpZXMuY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlckNvbG9yKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RWxlbS5kYXR1bSh0aGlzLmRhdGEpLmNhbGwodGhpcy5jaGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzaXplVGl0bGVMYWJlbFVud3JhcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5U3RhdGUoZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKS5zZWxlY3QoJy5waWUtY2hhcnQgc3ZnJylbMF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluc3RhbnRpYXRlQ2hhcnQoKSB7XHJcbiAgICAgICAgICAgIG52LmFkZEdyYXBoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQgPSBudi5tb2RlbHMucGllQ2hhcnQoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXJnaW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b206IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IDBcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC54KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRvbnV0ID8gZC52YWx1ZSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAueSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoTnVtYmVyKHRoaXMuc2l6ZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgLndpZHRoKE51bWJlcih0aGlzLnNpemUpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zaG93TGFiZWxzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmxhYmVsVGhyZXNob2xkKC4wMDEpXHJcbiAgICAgICAgICAgICAgICAgICAgLmdyb3dPbkhvdmVyKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kb251dCh0aGlzLmRvbnV0KVxyXG4gICAgICAgICAgICAgICAgICAgIC5kb251dFJhdGlvKDAuNSlcclxuICAgICAgICAgICAgICAgICAgICAuY29sb3IoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQuY29sb3IgfHwgKCA8IGFueSA+IGQzLnNjYWxlKS5wYWxldHRlQ29sb3JzKCkucmFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnRvb2x0aXAuZW5hYmxlZChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0Lm5vRGF0YSgnVGhlcmUgaXMgbm8gZGF0YSByaWdodCBub3cuLi4nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcnQuc2hvd0xlZ2VuZChmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFydEVsZW0gPSBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5nZXQoMCkpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnLnBpZS1jaGFydCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdoZWlnaHQnLCAodGhpcy5zaXplKSArICdweCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCd3aWR0aCcsIHRoaXMuY2VudGVyZWQgPyAnMTAwJScgOiAodGhpcy5zaXplKSArICdweCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnc3ZnJylcclxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXR1bSh0aGlzLmRhdGEgfHwgW10pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwodGhpcy5jaGFydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbnYudXRpbHMud2luZG93UmVzaXplKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZVRpdGxlTGFiZWxVbndyYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNlbnRlckNoYXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RW1wdHlTdGF0ZShkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5nZXQoMCkpLnNlbGVjdCgnLnBpZS1jaGFydCBzdmcnKVswXVswXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFydDtcclxuICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ZnRWxlbSA9IGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmdldCgwKSkuc2VsZWN0KCcucGllLWNoYXJ0IHN2ZycpWzBdWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVG90YWxMYWJlbChzdmdFbGVtKTtcclxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3Qoc3ZnRWxlbSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRyYW5zaXRpb24oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZHVyYXRpb24oMTAwMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZVRpdGxlTGFiZWxVbndyYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCA4MDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2VudGVyQ2hhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFbXB0eVN0YXRlKHN2Z0VsZW0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkcmF3RW1wdHlTdGF0ZShzdmcpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLiRlbGVtZW50LmZpbmQoJ3RleHQubnYtbm9EYXRhJykuZ2V0KDApKSB7XHJcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcy4kZWxlbWVudC5maW5kKCcuZW1wdHktc3RhdGUnKVswXSkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5waXAtZW1wdHktcGllLXRleHQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRlbGVtZW50LmZpbmQoJy5waXAtZW1wdHktcGllLXRleHQnKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5waWUtY2hhcnQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiPGRpdiBjbGFzcz0ncGlwLWVtcHR5LXBpZS10ZXh0Jz5UaGVyZSBpcyBubyBkYXRhIHJpZ2h0IG5vdy4uLjwvZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwaWUgPSBkMy5sYXlvdXQucGllKCkuc29ydChudWxsKSxcclxuICAgICAgICAgICAgICAgICAgICBzaXplID0gTnVtYmVyKHRoaXMuc2l6ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgYXJjID0gZDMuc3ZnLmFyYygpXHJcbiAgICAgICAgICAgICAgICAgICAgLmlubmVyUmFkaXVzKHNpemUgLyAyIC0gMjApXHJcbiAgICAgICAgICAgICAgICAgICAgLm91dGVyUmFkaXVzKHNpemUgLyAyIC0gNTcpO1xyXG5cclxuICAgICAgICAgICAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnZW1wdHktc3RhdGUnLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBcInRyYW5zbGF0ZShcIiArIHNpemUgLyAyICsgXCIsXCIgKyBzaXplIC8gMiArIFwiKVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gc3ZnLnNlbGVjdEFsbChcInBhdGhcIilcclxuICAgICAgICAgICAgICAgICAgICAuZGF0YShwaWUoWzFdKSlcclxuICAgICAgICAgICAgICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJwYXRoXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwicmdiYSgwLCAwLCAwLCAwLjA4KVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZFwiLCA8IGFueSA+IGFyYyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2VudGVyQ2hhcnQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdmdFbGVtID0gZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKS5zZWxlY3QoJy5waWUtY2hhcnQgc3ZnJylbMF1bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdE1hcmdpbiA9ICQoc3ZnRWxlbSkuaW5uZXJXaWR0aCgpIC8gMiAtIChOdW1iZXIodGhpcy5zaXplKSB8fCAyNTApIC8gMjtcclxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzLiRlbGVtZW50LmZpbmQoJy5udi1waWVDaGFydCcpWzBdKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBsZWZ0TWFyZ2luICsgJywgMCknKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZW5kZXJUb3RhbExhYmVsKHN2Z0VsZW0pIHtcclxuICAgICAgICAgICAgaWYgKCghdGhpcy50b3RhbCAmJiAhdGhpcy5kb251dCkgfHwgIXRoaXMuZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRvdGFsVmFsID0gdGhpcy5kYXRhLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBjdXJyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VtICsgY3Vyci52YWx1ZTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodG90YWxWYWwgPj0gMTAwMDApIHRvdGFsVmFsID0gKHRvdGFsVmFsIC8gMTAwMCkudG9GaXhlZCgxKSArICdrJztcclxuXHJcbiAgICAgICAgICAgIGQzLnNlbGVjdChzdmdFbGVtKVxyXG4gICAgICAgICAgICAgICAgLnNlbGVjdCgnLm52LXBpZTpub3QoLm52ZDMpJylcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2xhYmVsLXRvdGFsJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxyXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdkb21pbmFudC1iYXNlbGluZScsICdjZW50cmFsJylcclxuICAgICAgICAgICAgICAgIC50ZXh0KHRvdGFsVmFsKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudGl0bGVFbGVtID0gZDMuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZmluZCgndGV4dC5sYWJlbC10b3RhbCcpLmdldCgwKSkuc3R5bGUoJ29wYWNpdHknLCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVzaXplVGl0bGVMYWJlbFVud3JhcCgpIHtcclxuICAgICAgICAgICAgaWYgKCghdGhpcy50b3RhbCAmJiAhdGhpcy5kb251dCkgfHwgIXRoaXMuZGF0YSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgYm94U2l6ZSA9ICggPCBhbnkgPiB0aGlzLiRlbGVtZW50LmZpbmQoJy5udmQzLm52LXBpZUNoYXJ0JykuZ2V0KDApKS5nZXRCQm94KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWJveFNpemUud2lkdGggfHwgIWJveFNpemUuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudGl0bGVFbGVtLnN0eWxlKCdmb250LXNpemUnLCB+fmJveFNpemUud2lkdGggLyA0LjUpLnN0eWxlKCdvcGFjaXR5JywgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGdlbmVyYXRlUGFyYW1ldGVyQ29sb3IoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kYXRhKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBfLmVhY2godGhpcy5kYXRhLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmNvbG9yID0gaXRlbS5jb2xvciB8fCB0aGlzLnBpcENoYXJ0Q29sb3JzLmdldE1hdGVyaWFsQ29sb3IoaW5kZXgsIHRoaXMuY29sb3JzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBQaWVDaGFydDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IFBpZUNoYXJ0QmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwaWVfY2hhcnQvUGllQ2hhcnQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogUGllQ2hhcnRDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcFBpZUNoYXJ0cycsIFtdKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcFBpZUNoYXJ0JywgUGllQ2hhcnQpO1xyXG59IiwiKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Jhcl9jaGFydC9CYXJDaGFydC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cImJhci1jaGFydFwiPlxcbicgK1xuICAgICcgICAgPHN2ZyA+PC9zdmc+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHBpcC1jaGFydC1sZWdlbmQgbmctc2hvdz1cIiRjdHJsLmxlZ2VuZFwiIHBpcC1zZXJpZXM9XCIkY3RybC5sZWdlbmRcIiBwaXAtaW50ZXJhY3RpdmU9XCIkY3RybC5pbnRlcmFjdGl2ZUxlZ2VuZFwiPjwvcGlwLWNoYXJ0LWxlZ2VuZD4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdjaGFydF9sZWdlbmQvQ2hhcnRJbnRlcmFjdGl2ZUxlZ2VuZC5odG1sJyxcbiAgICAnPGRpdiA+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiY2hhcnQtbGVnZW5kLWl0ZW1cIiBuZy1yZXBlYXQ9XCJpdGVtIGluICRjdHJsLnNlcmllc1wiIG5nLXNob3c9XCJpdGVtLnZhbHVlcyB8fCBpdGVtLnZhbHVlXCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWNoZWNrYm94IG5nLW1vZGVsPVwiaXRlbS5kaXNhYmxlZFwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgIG5nLXRydWUtdmFsdWU9XCJmYWxzZVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgIG5nLWZhbHNlLXZhbHVlPVwidHJ1ZVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgIG5nLWlmPVwiJGN0cmwuaW50ZXJhY3RpdmVcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwie3sgaXRlbS5sYWJlbCB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8cCBjbGFzcz1cImxlZ2VuZC1pdGVtLXZhbHVlXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWlmPVwiaXRlbS52YWx1ZVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgIG5nLXN0eWxlPVwie1xcJ2JhY2tncm91bmQtY29sb3JcXCc6IGl0ZW0uY29sb3J9XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICB7eyBpdGVtLnZhbHVlIH19XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvcD5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHAgY2xhc3M9XCJsZWdlbmQtaXRlbS1sYWJlbFwiPnt7OjogaXRlbS5sYWJlbCB8fCBpdGVtLmtleSB9fTwvcD5cXG4nICtcbiAgICAnICAgICAgICA8L21kLWNoZWNrYm94PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICA8ZGl2IG5nLWlmPVwiISRjdHJsLmludGVyYWN0aXZlXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYnVsbGV0XCIgbmctc3R5bGU9XCJ7XFwnYmFja2dyb3VuZC1jb2xvclxcJzogaXRlbS5jb2xvcn1cIj48L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxzcGFuPnt7OjogaXRlbS5sYWJlbCB8fCBpdGVtLmtleX19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcENoYXJ0cy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2xpbmVfY2hhcnQvTGluZUNoYXJ0Lmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwibGluZS1jaGFydFwiIGZsZXg9XCJhdXRvXCIgbGF5b3V0PVwiY29sdW1uXCI+XFxuJyArXG4gICAgJyAgICA8c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCIgbmctY2xhc3M9XCJ7XFwndmlzaWJsZS14LWF4aXNcXCc6ICRjdHJsLnNob3dYQXhpcywgXFwndmlzaWJsZS15LWF4aXNcXCc6ICRjdHJsLnNob3dZQXhpc31cIj5cXG4nICtcbiAgICAnICAgIDwvc3ZnPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInNjcm9sbC1jb250YWluZXJcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidmlzdWFsLXNjcm9sbFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsZWQtYmxvY2tcIj48L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWZhYiBtZC1taW5pIG1pbnVzLWJ1dHRvblwiIG5nLWNsaWNrPVwiJGN0cmwuem9vbU91dCgpXCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51cy1jaXJjbGVcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1mYWIgbWQtbWluaSBwbHVzLWJ1dHRvblwiIG5nLWNsaWNrPVwiJGN0cmwuem9vbUluKClcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXMtY2lyY2xlXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHBpcC1jaGFydC1sZWdlbmQgcGlwLXNlcmllcz1cIiRjdHJsLmxlZ2VuZFwiIHBpcC1pbnRlcmFjdGl2ZT1cIiRjdHJsLmludGVyYWN0aXZlTGVnZW5kXCI+PC9waXAtY2hhcnQtbGVnZW5kPlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBDaGFydHMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdwaWVfY2hhcnQvUGllQ2hhcnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaWUtY2hhcnRcIiBjbGFzcz1cImxheW91dC1jb2x1bW4gZmxleC1hdXRvXCIgbmctY2xhc3M9XCJ7XFwnY2lyY2xlXFwnOiAhJGN0cmwuZG9udXR9XCI+XFxuJyArXG4gICAgJyAgICA8c3ZnIGNsYXNzPVwiZmxleC1hdXRvXCI+PC9zdmc+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHBpcC1jaGFydC1sZWdlbmQgcGlwLXNlcmllcz1cIiRjdHJsLmRhdGFcIiBwaXAtaW50ZXJhY3RpdmU9XCJmYWxzZVwiIG5nLWlmPVwiJGN0cmwubGVnZW5kXCI+PC9waXAtY2hhcnQtbGVnZW5kPicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWNoYXJ0cy1odG1sLmpzLm1hcFxuIl19