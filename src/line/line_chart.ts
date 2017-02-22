(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name pipLineCharts
     *
     * @description
     * Line chart on top of Rickshaw charts
     */
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
                xTickValues: '=pipXTickValues',
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
            controller: function ($element, $scope, $timeout, $interval, $mdColorPalette) {
                var vm        = this;
                var chart     = null;
                var chartElem = null;
                var setZoom = null;
                var updateZoomOptions = null;
                var fixedHeight = vm.fixedHeight || 270;
                var dynamicHeight = vm.dynamicHeight || false;
                var minHeight = vm.minHeight || fixedHeight;
                var maxHeight = vm.maxHeight || fixedHeight;

                var filteredColor = _.filter($mdColorPalette, function(palette, color){
                    return _.isObject(color) && _.isObject(color[500] && _.isArray(color[500].value));
                });
                var colors = _.map(filteredColor, function (palette, color) {
                    return color;
                });
                colors = _.filter(colors, function(color){
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

                // Sets colors of items
                generateParameterColor();

                (<any>d3.scale).paletteColors = function () {
                    return d3.scale.ordinal().range(colors.map(materialColorToRgba));
                };

                $scope.$watch('lineChart.series', function (updatedSeries) {
                    vm.data = prepareData(updatedSeries);
                    vm.legend = _.clone(vm.series);

                    generateParameterColor();

                    if (chart) {
                        chartElem.datum(vm.data || []).call(chart);
                        drawEmptyState();

                        if (updateZoomOptions) updateZoomOptions(vm.data);
                    }
                }, true);

                $scope.$watch('lineChart.legend', function(updatedLegend) {
                    vm.data = prepareData(updatedLegend);
                    vm.legend = updatedLegend;

                    if (chart) {
                        chartElem.datum(vm.data || []).call(chart);
                        drawEmptyState();

                        if (updateZoomOptions) updateZoomOptions(vm.data);
                    }
                }, true);

                $scope.$on('$destroy', () => {
                   setTimeout(()=> {d3.selectAll('.nvtooltip').style('opacity', 0); }, 800)
                });

                function prepareData(data) {
                    let result = [];
                    _.each(data, (seria) => {
                        if (!seria.disabled && seria.values) result.push(seria);
                    });

                    return _.cloneDeep(result);
                }

                var getHeight = () => {
                    if (dynamicHeight) {
                        const heigth = Math.min(Math.max(minHeight, $element.parent().innerHeight()), maxHeight);
                        return heigth;
                    } else {
                        return fixedHeight;
                    }
                };

                /**
                 * Instantiate chart
                 */
                nv.addGraph(() => {
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
                        .color(function(d) {
                            return d.color || (<any>d3.scale).paletteColors().range();
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
                        })
                        .tickValues(vm.xTickValues && _.isArray(vm.xTickValues) && vm.xTickValues.length > 2 ? 
                                d3.range(vm.xTickValues[0], vm.xTickValues[1], vm.xTickValues[2]) : null);

                    chartElem = d3.select($element.get(0)).select('.line-chart svg');
                    chartElem.datum(vm.data || []).style('height', (getHeight() - 50) + 'px').call(chart);
                    // Handle touches for correcting tooltip position
                    $('.line-chart svg').on('touchstart touchmove', (e) => { 
                        setTimeout(() => {
                            let tooltip = $('.nvtooltip'),
                                tooltipW = tooltip.innerWidth(),
                                bodyWidth = $('body').innerWidth(),
                                x = e.originalEvent['touches'][0]['pageX'],
                                y = e.originalEvent['touches'][0]['pageY'];

                            tooltip.css('transform', 'translate(' 
                                + (x + tooltipW >= bodyWidth ? (x - tooltipW) : x) + ',' 
                                + y + ')');
                            tooltip.css('left', 0); 
                            tooltip.css('top', 0);
                        }); 
                    });

                    $('.line-chart svg').on('touchstart touchend', (e) => { 
                        let removeTooltip = () => {
                            let tooltip = $('.nvtooltip');
                            tooltip.css('opacity', 0);
                        };

                        removeTooltip();

                        setTimeout(() => {
                            removeTooltip();
                        }, 500); 
                    });

                    if (vm.dynamic) {
                        addZoom(chart, chartElem);
                    }

                    nv.utils.windowResize(() => { onResize(); });

                    $scope.$on('pipMainResized', () => { onResize(); });

                    return chart;
                }, () => {
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
                    } else {
                        let containerWidth = $element.find('.line-chart').innerWidth(),
                            containerHeight = $element.find('.line-chart').innerHeight();
                        
                        if ($element.find('.empty-state').get(0)) {
                            chartElem
                                .select('image')
                                .attr('transform', 'scale(' + (containerWidth / 1151) + ',' + (containerHeight / 216) + ')');
                        } else {
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
                    var bDiff = boundary[1] - boundary[0],
                        domDiff = domains[1] - domains[0],
                        isEqual = (domains[1] - domains[0])/bDiff === 1;

                    $($element[0]).find('.visual-scroll')
                        .css('opacity', function () {
                            return isEqual ? 0 : 1;
                        });

                    if (isEqual) return;
                    
                    $($element[0]).find('.scrolled-block')
                        .css('left', function () {
                            return domains[0]/bDiff * 100 + '%';
                        })
                        .css('width', function () {
                            return domDiff/bDiff * 100 + '%';
                        });
                }

                function addZoom(chart, svg) {
                    // scaleExtent
                    var scaleExtent = 4;

                    // parameters
                    var yAxis       = null;
                    var xAxis       = null;
                    var xDomain     = null;
                    var yDomain     = null;
                    var redraw      = null;
                    var svg         = svg;

                    // scales
                    var xScale = null;
                    var yScale = null;

                    // min/max boundaries
                    var x_boundary = null;
                    var y_boundary = null;

                    // create d3 zoom handler
                    var d3zoom = d3.behavior.zoom();
                    var prevXDomain = null;
                    var prevScale = null;
                    var prevTranslate = null;

                    setData(chart);

                    function setData(newChart) {
                        // parameters
                        yAxis       = newChart.yAxis;
                        xAxis       = newChart.xAxis;
                        xDomain     = newChart.xDomain || xAxis.scale().domain;
                        yDomain     = newChart.yDomain || yAxis.scale().domain;
                        redraw      = newChart.update;

                        // scales
                        xScale = xAxis.scale();
                        yScale = yAxis.scale();

                        // min/max boundaries
                        x_boundary = xAxis.scale().domain().slice();
                        y_boundary = yAxis.scale().domain().slice();

                        // create d3 zoom handler
                        prevXDomain = x_boundary;
                        prevScale = d3zoom.scale();
                        prevTranslate = d3zoom.translate();

                        // ensure nice axis
                        xScale.nice();
                        yScale.nice();
                    }

                    // fix domain
                    function fixDomain(domain, boundary, scale, translate) {
                        if (domain[0] < boundary[0]) {
                            domain[0] = boundary[0];
                            if (prevXDomain[0] !== boundary[0] || scale !== prevScale) {
                                domain[1] += (boundary[0] - domain[0]);
                            } else {
                                domain[1] = prevXDomain[1];
                                translate = _.clone(prevTranslate);
                            }

                        }
                        if (domain[1] > boundary[1]) {
                            domain[1] = boundary[1];
                            if (prevXDomain[1] !== boundary[1] || scale !== prevScale) {
                                domain[0] -= (domain[1] - boundary[1]);
                            } else {
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
                        d3zoom.translate([0,0]);
                        xScale.domain(x_boundary);
                        d3zoom.x(xScale).y(yScale);
                        svg.call(d3zoom);
                    }

                    // zoom event handler
                    function zoomed() {
                        // Switch off vertical zooming temporary
                        // yDomain(yScale.domain());

                        if ((<any>d3.event).scale === 1) {
                            unzoomed();
                            updateChart();
                        } else {
                            xDomain(fixDomain(xScale.domain(), x_boundary, (<any>d3.event).scale, (<any>d3.event).translate));
                            redraw();
                        }

                        updateScroll(xScale.domain(), x_boundary);
                    }

                    //
                    setZoom = function(which) {
                        var center0 = [svg[0][0].getBBox().width / 2, svg[0][0].getBBox().height / 2];
                        var translate0 = d3zoom.translate(), coordinates0 = coordinates(center0);

                        if (which === 'in') {
                            if (prevScale < scaleExtent) d3zoom.scale(prevScale + 0.2);
                        } else {
                            if (prevScale > 1) d3zoom.scale(prevScale - 0.2);
                        }

                        var center1 = point(coordinates0);
                        d3zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

                        d3zoom.event(svg);
                    };

                    function step(which) {
                        var translate = d3zoom.translate();

                        if (which === 'right') {
                            translate[0] -= 20;
                        } else {
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
                        switch((<any>d3.event).keyCode) {
                            case 39: step('right'); break;
                            case 37: step('left'); break;
                            case 107: setZoom('in'); break;
                            case 109: setZoom('out');
                        }
                    }

                    // zoom event handler
                    function unzoomed() {
                        xDomain(x_boundary);
                        redraw();
                        d3zoom.scale(1);
                        d3zoom.translate([0,0]);
                        prevScale = 1;
                        prevTranslate = [0,0];
                    }

                    // initialize wrapper
                    d3zoom.x(xScale)
                        .y(yScale)
                        .scaleExtent([1, scaleExtent])
                        .on('zoom', zoomed);

                    // add handler
                    svg.call(d3zoom).on('dblclick.zoom', unzoomed);
                    $($element.get(0)).addClass('dynamic');

                    // add keyboard handlers
                    svg
                        .attr('focusable', false)
                        .style('outline', 'none')
                        .on('keydown', keypress)
                        .on('focus', function () {});

                    var getXMinMax = function(data) {
                        var maxVal, minVal = null;

                        for(var i=0;i<data.length;i++) {
                            if (!data[i].disabled) {
                                var tempMinVal = d3.max(data[i].values, function(d: any) { return vm.xFormat ? vm.xFormat(d.x) : d.x;} );
                                var tempMaxVal = d3.min(data[i].values, function(d: any) { return vm.xFormat ? vm.xFormat(d.x) : d.x;} );
                                minVal = (!minVal || tempMinVal < minVal) ? tempMinVal : minVal;
                                maxVal = (!maxVal || tempMaxVal > maxVal) ? tempMaxVal : maxVal;
                            }
                        }
                        return [maxVal, minVal];
                    };

                    updateZoomOptions = function(data) {
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
                    }
                }

                /**
                 * Converts palette color name into RGBA color representation.
                 * Should by replaced by palette for charts.
                 *
                 * @param {string} color    Name of color from AM palette
                 * @returns {string} RGBa format
                 */
                function materialColorToRgba(color) {
                    return 'rgba(' + $mdColorPalette[color][500].value[0] + ','
                        + $mdColorPalette[color][500].value[1] + ','
                        + $mdColorPalette[color][500].value[2] + ','
                        + ($mdColorPalette[color][500].value[3] || 1) + ')';
                }

                /**
                 * Helpful method
                 * @private
                 */
                function getMaterialColor(index) {
                    if (!colors || colors.length < 1) return null;

                    if (index >= colors.length) {
                        index = 0;
                    }

                    return materialColorToRgba(colors[index]);
                }                
                /**
                 * Helpful method
                 * @private
                 */
                function generateParameterColor() {
                    if (!vm.data) return;

                    vm.data.forEach(function (item, index) {
                        item.color = item.color || getMaterialColor(index);
                    });
                }
            }
        };
    }
})();