import {
    IChartsUtilityService
} from '../utility/IChartsUtilityService';

{
    interface ILineChartBindings {
        [key: string]: any;

        series: any;
        showYAxis: any;
        showXAxis: any;
        xFormat: any;
        xTickFormat: any;
        yTickFormat: any;
        xTickValues: any;
        dynamic: any;
        fixedHeight: any;
        dynamicHeight: any;
        minHeight: any;
        maxHeight: any;
        interactiveLegend: any;
    }

    const LineChartBindings: ILineChartBindings = {
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
    }

    class LineChartBindingsChanges implements ng.IOnChangesObject, ILineChartBindings {
        [key: string]: any;

        fixedHeight: ng.IChangesObject < number > ;
        dynamicHeight: ng.IChangesObject < boolean > ;
        minHeight: ng.IChangesObject < number > ;
        maxHeight: ng.IChangesObject < number > ;

        series: ng.IChangesObject < any > ;
        showYAxis: ng.IChangesObject < boolean > ;
        showXAxis: ng.IChangesObject < boolean > ;
        xFormat: ng.IChangesObject < any > ;
        xTickFormat: ng.IChangesObject < any > ;
        yTickFormat: ng.IChangesObject < any > ;
        xTickValues: ng.IChangesObject < any > ;
        dynamic: ng.IChangesObject < boolean > ;
        interactiveLegend: ng.IChangesObject < boolean > ;
    }

    class LineChartController implements ng.IController, ILineChartBindings {
        private HEIGHT = 270;
        private chart: nv.LineChart = null;
        private chartElem: any = null;
        private setZoom: Function = null;
        private updateZoomOptions: Function = null;
        private colors: string[];
        
        public fixedHeight: number = this.HEIGHT;
        public dynamicHeight: boolean = false;
        public minHeight: number = this.HEIGHT;
        public maxHeight: number = this.HEIGHT;
        public series: any;
        public showYAxis: boolean = true;
        public showXAxis: boolean = true;
        public xFormat: Function;
        public xTickFormat: Function;
        public yTickFormat: Function;
        public xTickValues: number[];
        public dynamic: boolean = false;
        public interactiveLegend: boolean = false;
        public data: any;
        public legend: any;
        public sourceEvents: any;

        constructor(
            private $element: JQuery,
            private $scope: ng.IScope,
            private $timeout: ng.ITimeoutService,
            private pipChartsUtility: IChartsUtilityService
        ) {
            this.colors = this.pipChartsUtility.generateMaterialColors();

            $scope.$watch('$ctrl.legend', (updatedLegend) => {
                this.data = this.prepareData(updatedLegend);
                this.legend = updatedLegend;

                this.updateChart();
            }, true);

            $scope.$on('$destroy', () => {
                $timeout(() => {
                    d3.selectAll('.nvtooltip').style('opacity', 0);
                }, 800)
            });
        }

        public $onInit() {
            this.data = this.prepareData(this.series) || [];
            this.legend = _.clone(this.series);
            this.sourceEvents = [];

            this.generateParameterColor();

            ( < any > d3.scale).paletteColors = () => {
                return d3.scale.ordinal().range(this.colors.map((color) => {
                    return this.pipChartsUtility.materialColorToRgba(color);
                }));
            };

            this.instantiateChart();
        }

        public $onChanges(changes: LineChartBindingsChanges) {
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
                if (this.chartElem && this.chart) this.chartElem.datum(this.data || []).call(this.chart);
            }

            if (changes.series && changes.series.currentValue !== changes.series.previousValue) {
                this.updateSeries();
            }
        }

        private prepareData(data) {
            const result = [];
            _.each(data, (seria) => {
                if (!seria.disabled && seria.values) result.push(seria);
            });

            return _.cloneDeep(result);
        }

        private getHeight() {
            /*if (this.dynamicHeight) {
                const heigth = Math.min(Math.max(this.minHeight, this.$element.parent().innerHeight()), this.maxHeight);
                return heigth;
            } else {
                return this.fixedHeight;
            }*/
            return this.dynamicHeight ? Math.min(Math.max(this.minHeight, this.$element.parent().innerHeight()), this.maxHeight) : this.fixedHeight;
        };

        public zoomIn() {
            if (this.setZoom) {
                this.setZoom('in');
            }
        };

        public zoomOut() {
            if (this.setZoom) {
                this.setZoom('out');
            }
        };

        private instantiateChart() {
            nv.addGraph(() => {
                this.chart = nv.models.lineChart()
                    .margin({
                        top: 20,
                        right: 20,
                        bottom: 30,
                        left: 30
                    })
                    .x((d) => {
                        return (d !== undefined && d.x !== undefined) ? (this.xFormat ? this.xFormat(d.x) : d.x) : d;
                    })
                    .y((d) => {
                        return (d !== undefined && d.value !== undefined) ? d.value : d;
                    })
                    .height(this.getHeight() - 50)
                    .useInteractiveGuideline(true)
                    .showXAxis(true)
                    .showYAxis(true)
                    .showLegend(false)
                    .color((d) => {
                        return d.color || ( < any > d3.scale).paletteColors().range();
                    });

                this.chart.tooltip.enabled(false);
                this.chart.noData('There is no data right now...');

                this.chart.yAxis
                    .tickFormat((d) => {
                        return this.yTickFormat ? this.yTickFormat(d) : d;
                    });

                this.chart.xAxis
                    .tickFormat((d) => {
                        return this.xTickFormat ? this.xTickFormat(d) : d;
                    })
                    .tickValues(this.xTickValues && _.isArray(this.xTickValues) && this.xTickValues.length > 2 ?
                        d3.range(this.xTickValues[0], this.xTickValues[1], this.xTickValues[2]) : null);

                this.chartElem = d3.select(this.$element.get(0)).select('.line-chart svg');
                this.chartElem.datum(this.data || []).style('height', (this.getHeight() - 50) + 'px').call(this.chart);
                // Handle touches for correcting tooltip position
                $('.line-chart svg').on('touchstart touchmove', (e) => {
                    this.$timeout(() => {
                        const tooltip = $('.nvtooltip'),
                            tooltipW = tooltip.innerWidth(),
                            bodyWidth = $('body').innerWidth(),
                            x = e.originalEvent['touches'][0]['pageX'],
                            y = e.originalEvent['touches'][0]['pageY'];

                        tooltip.css('transform', 'translate(' +
                            (x + tooltipW >= bodyWidth ? (x - tooltipW) : x) + ',' +
                            y + ')');
                        tooltip.css('left', 0);
                        tooltip.css('top', 0);
                    });
                });

                $('.line-chart svg').on('touchstart touchend', (e) => {
                    const removeTooltip = () => {
                        $('.nvtooltip').css('opacity', 0);
                    };

                    removeTooltip();

                    this.$timeout(() => {
                        removeTooltip();
                    }, 500);
                });

                if (this.dynamic) {
                    this.addZoom(this.chart, this.chartElem);
                }

                nv.utils.windowResize(() => {
                    this.onResize();
                });

                this.$scope.$on('pipMainResized', () => {
                    this.onResize();
                });

                return this.chart;
            }, () => {
                this.drawEmptyState();
            });
        }

        private updateXTickValues() {
            if (!this.chart) return;

            this.chart.xAxis
                .tickValues(this.xTickValues && _.isArray(this.xTickValues) && this.xTickValues.length > 2 ?
                    d3.range(this.xTickValues[0], this.xTickValues[1], this.xTickValues[2]) : null);
        }

        private updateChart() {
            if (this.chart) {
                this.updateXTickValues();

                this.chartElem.datum(this.data || []).call(this.chart);
                this.drawEmptyState();

                if (this.updateZoomOptions) this.updateZoomOptions(this.data);
            }
        }

        private updateSeries() {
            this.data = this.prepareData(this.series);
            this.legend = _.clone(this.series);

            this.generateParameterColor();
            this.updateChart();
        }

        private onResize() {
            this.chart.height(this.getHeight() - 50);
            this.chartElem.style('height', (this.getHeight() - 50) + 'px');
            this.chart.update();
            this.drawEmptyState();
        }

        private drawEmptyState() {
            if (!this.$element.find('text.nv-noData').get(0)) {
                d3.select(this.$element.find('.empty-state')[0]).remove();
            } else {
                const containerWidth = this.$element.find('.line-chart').innerWidth(),
                    containerHeight = this.$element.find('.line-chart').innerHeight();

                if (this.$element.find('.empty-state').get(0)) {
                    this.chartElem
                        .select('image')
                        .attr('transform', 'scale(' + (containerWidth / 1151) + ',' + (containerHeight / 216) + ')');
                } else {
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
        }

        private updateScroll(domains, boundary) {
            const bDiff = boundary[1] - boundary[0],
                domDiff = domains[1] - domains[0],
                isEqual = domDiff / bDiff === 1;

            $(this.$element[0]).find('.visual-scroll')
                .css('opacity', function () {
                    return isEqual ? 0 : 1;
                });

            if (isEqual) return;

            $(this.$element[0]).find('.scrolled-block')
                .css('left', () => {
                    return (domains[0] - boundary[0]) / bDiff * 100 + '%';
                })
                .css('width', () => {
                    return domDiff / bDiff * 100 + '%';
                });
        }

        private generateParameterColor() {
            if (!this.data) return;

            _.each(this.data, (item, index: number) => {
                item.color = item.color || this.pipChartsUtility.getMaterialColor(index, this.colors);
            });
        }

        private addZoom(chart, svg) {
            // Scale Extent
            const scaleExtent = 4;

            // Parameters
            let yAxis = null;
            let xAxis = null;
            let xDomain = null;
            let yDomain = null;
            let redraw = null;

            // Scales
            let xScale = null;
            let yScale = null;

            // Min/max boundaries
            let x_boundary = null;
            let y_boundary = null;

            // Create d3 zoom handler
            let d3zoom = d3.behavior.zoom();
            let prevXDomain = null;
            let prevScale = null;
            let prevTranslate = null;

            const setData = (newChart) => {
                // Parameters
                yAxis = newChart.yAxis;
                xAxis = newChart.xAxis;
                xDomain = newChart.xDomain || xAxis.scale().domain;
                yDomain = newChart.yDomain || yAxis.scale().domain;
                redraw = newChart.update;

                // Scales
                xScale = xAxis.scale();
                yScale = yAxis.scale();

                // Min/max boundaries
                x_boundary = xAxis.scale().domain().slice();
                y_boundary = yAxis.scale().domain().slice();

                // Create d3 zoom handler
                prevXDomain = x_boundary;
                prevScale = d3zoom.scale();
                prevTranslate = d3zoom.translate();

                // Ensure nice axis
                xScale.nice();
                yScale.nice();
            }

            setData(chart);

            // Fix domain
            const fixDomain = (domain, boundary, scale, translate) => {
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

            const updateChart = () => {
                d3zoom.scale(1);
                d3zoom.translate([0, 0]);
                xScale.domain(x_boundary);
                d3zoom.x(xScale).y(yScale);
                svg.call(d3zoom);
            }

            // Zoom event handler
            const zoomed = () => {
                if (( < any > d3.event).scale === 1) {
                    unzoomed();
                    updateChart();
                } else {
                    xDomain(fixDomain(xScale.domain(), x_boundary, ( < any > d3.event).scale, ( < any > d3.event).translate));
                    redraw();
                }

                this.updateScroll(xScale.domain(), x_boundary);
            }

            // Describe set zoom function
            this.setZoom = (which) => {
                const center0 = [svg[0][0].getBBox().width / 2, svg[0][0].getBBox().height / 2];
                const translate0 = d3zoom.translate(),
                    coordinates0 = coordinates(center0);

                if (which === 'in') {
                    if (prevScale < scaleExtent) d3zoom.scale(prevScale + 0.2);
                } else {
                    if (prevScale > 1) d3zoom.scale(prevScale - 0.2);
                }

                const center1 = point(coordinates0);
                d3zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

                d3zoom.event(svg);
            };

            const step = (which) => {
                const translate = d3zoom.translate();

                if (which === 'right') {
                    translate[0] -= 20;
                } else {
                    translate[0] += 20;
                }

                d3zoom.translate(translate);
                d3zoom.event(svg);
            }

            const coordinates = (point) => {
                const scale = d3zoom.scale(),
                    translate = d3zoom.translate();
                return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
            }

            const point = (coordinates) => {
                const scale = d3zoom.scale(),
                    translate = d3zoom.translate();
                return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
            }

            const keypress = () => {
                switch (( < any > d3.event).keyCode) {
                    case 39:
                        step('right');
                        break;
                    case 37:
                        step('left');
                        break;
                    case 107:
                        this.setZoom('in');
                        break;
                    case 109:
                        this.setZoom('out');
                }
            }

            // Zoom event handler
            const unzoomed = () => {
                xDomain(x_boundary);
                redraw();
                d3zoom.scale(1);
                d3zoom.translate([0, 0]);
                prevScale = 1;
                prevTranslate = [0, 0];
            }

            // Initialize wrapper
            d3zoom.x(xScale)
                .y(yScale)
                .scaleExtent([1, scaleExtent])
                .on('zoom', zoomed);

            // Add handler
            svg.call(d3zoom).on('dblclick.zoom', unzoomed);
            $(this.$element.get(0)).addClass('dynamic');

            // Add keyboard handlers
            svg
                .attr('focusable', false)
                .style('outline', 'none')
                .on('keydown', keypress)
                .on('focus', () => {});

            const getXMinMax = (data) => {
                let maxVal, minVal = null;

                for (let i = 0; i < data.length; i++) {
                    if (!data[i].disabled) {
                        const tempMinVal = d3.max(data[i].values, (d: any) => {
                            return this.xFormat ? this.xFormat(d.x) : d.x;
                        });
                        const tempMaxVal = d3.min(data[i].values, (d: any) => {
                            return this.xFormat ? this.xFormat(d.x) : d.x;
                        });
                        minVal = (!minVal || tempMinVal < minVal) ? tempMinVal : minVal;
                        maxVal = (!maxVal || tempMaxVal > maxVal) ? tempMaxVal : maxVal;
                    }
                }
                return [maxVal, minVal];
            };

            const updateZoomOptions = (data) => {
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

                this.updateScroll(xScale.domain(), x_boundary);
            }
        }
    }

    const LineChart: ng.IComponentOptions = {
        bindings: LineChartBindings,
        templateUrl: 'line/lineChart.html',
        controller: LineChartController
    }

    angular.module('pipLineCharts', [])
        .component('pipLineChart', LineChart);
}