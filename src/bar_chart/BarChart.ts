import { IChartColorsService } from '../chart_colors/IChartColorsService';

{
    interface IBarChartBindings {
        [key: string]: any;

        series: any;
        xTickFormat: any;
        yTickFormat: any;
        interactiveLegend: any;
    }

    const BarChartBindings: IBarChartBindings = {
        series: '<pipSeries',
        xTickFormat: '<?pipXTickFormat',
        yTickFormat: '<?pipYTickFormat',
        interactiveLegend: '<?pipInterLegend'
    }

    class BarChartBindingsChanges implements IBarChartBindings, ng.IOnChangesObject {
        [key: string]: any;

        series: ng.IChangesObject<any>;
        xTickFormat: ng.IChangesObject<any>;
        yTickFormat: ng.IChangesObject<any>;
        interactiveLegend: ng.IChangesObject<boolean>;
    }

    class BarChartController implements ng.IController, IBarChartBindings {
        public series: any;
        public xTickFormat: any;
        public yTickFormat: any;
        public interactiveLegend: boolean;
        public legend: any;

        private data: any;
        private chart: nv.DiscreteBarChart = null;
        private chartElem: any;
        private colors: string[];
        private height: number = 270;

        private spaceAfterBar: number = 15;
        private spaceAfterMultiBar: number = 1;

        constructor(
            private $element: JQuery,
            private $scope: ng.IScope,
            private $rootScope: ng.IRootScopeService,
            private $timeout: ng.ITimeoutService,
            private pipChartColors: IChartColorsService
        ) {
            "ngInject";

            this.colors = this.pipChartColors.generateMaterialColors();
            $scope.$watch('$ctrl.legend', (updatedLegend) => {
                if (!updatedLegend) return;

                this.data = this.prepareData(updatedLegend);
                this.legend = updatedLegend;

                this.updateChart();
            }, true);
        }

        public $onInit() {
            this.data = this.prepareData(this.series);
            this.legend = _.clone(this.series);
            this.generateParameterColor();
            (<any>d3.scale).paletteColors = () => {
                return d3.scale.ordinal().range(this.colors.map((color) => {
                    return this.pipChartColors.materialColorToRgba(color);
                }));
            };

            this.instantiateChart();
        }

        public $onChanges(changes: BarChartBindingsChanges) {
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
        }

        private updateChart() {
            if (this.chart) {
                this.chartElem.datum(this.data).call(this.chart);
                this.configBarWidthAndLabel();
                this.drawEmptyState();
            }
        }

        private instantiateChart() {
            nv.addGraph(() => {
                this.chart = nv.models.discreteBarChart()
                    .margin({
                        top: 10,
                        right: 0,
                        bottom: 10,
                        left: 50
                    })
                    .x((d) => {
                        return d.label || d.key || d.x;
                    })
                    .y((d) => {
                        return d.value;
                    })
                    .showValues(true)
                    .staggerLabels(true)
                    .showXAxis(true)
                    .showYAxis(true)
                    .valueFormat(<any>d3.format('d'))
                    .duration(0)
                    .height(this.height)
                    .color((d) => {
                        return this.data[d.series].color || this.pipChartColors.materialColorToRgba(this.colors[d.series]);
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
                    });

                this.chartElem = <any>d3.select(this.$element.get(0))
                    .select('.bar-chart svg')
                    .datum(this.data)
                    .style('height', '305px')
                    .call(this.chart);

                // nv.utils.windowResize(() => {
                //     this.chart.update();
                //     this.configBarWidthAndLabel(0);
                //     this.drawEmptyState();
                // });

                nv.utils.windowResize(() => {
                    this.$timeout(() => {
                        this.onResize();
                    }, 100);
                });

                this.$rootScope.$on('pipMainResized', () => {
                    this.$timeout(() => {
                        this.onResize();
                    }, 1500);
                });

                this.$rootScope.$on('pipAuxPanelOpened', () => {
                    this.$timeout(() => {
                        this.onResize();
                    }, 100);
                });

                this.$rootScope.$on('pipAuxPanelClosed', () => {
                    this.$timeout(() => {
                        this.onResize();
                    }, 100);
                });

                return this.chart;
            }, () => {
                this.$timeout(() => {
                    this.configBarWidthAndLabel(0);
                }, 1000);
                this.drawEmptyState();
            });
        }

        private onResize() {
            this.chart.update();
            this.configBarWidthAndLabel(0);
            this.drawEmptyState();
        }

        private prepareData(data): any {
            const result = [];
            _.each(data, (seria) => {
                if (!seria.disabled && seria.values) result.push(seria);
            });
            return _.cloneDeep(result);
        }

        private drawEmptyState() {
            if (this.$element.find('.nv-noData').length === 0) {
                d3.select(this.$element.find('.empty-state')[0]).remove();
            } else {
                const g = this.chartElem.append('g').classed('empty-state', true),
                    width = this.$element.find('.nvd3-svg').innerWidth(),
                    margin = width * 0.1;

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
        }

        private getGroupSize(): number {
            let n: number = 1;

            for (let i = 0; i <this.data.length; i ++) {
                if (this.data[i] && this.data[i].values && this.data[i].values.length > 0) {
                    if (this.data[i].values.length > n) {
                        n = this.data[i].values.length;
                    }
                }
            }

            return n;
        }

        private configBarWidthAndLabel(timeout: number = 1000) {
            const labels = this.$element.find('.nv-bar text'),
                chartBars = this.$element.find('.nv-bar'),
                parentHeight = (<any>this.$element.find('.nvd3-svg')[0]).getBBox().height;

            d3.select(this.$element.find('.bar-chart')[0]).classed('visible', true);

            let groupSize = this.getGroupSize();
            let space: number = groupSize == 1 ? this.spaceAfterBar : this.spaceAfterMultiBar;
            let correction = groupSize == 1 ? 0 : this.spaceAfterMultiBar;

            _.each(chartBars, (item: EventTarget, index: number) => {
                const barHeight = Number(d3.select(item).select('rect').attr('height')),
                    barWidth = Number(d3.select(item).select('rect').attr('width'))/groupSize - correction,
                    element = d3.select(item),
                    x = d3.transform(element.attr('transform')).translate[0],
                    y = d3.transform(element.attr('transform')).translate[1];

                element
                    .attr('transform', 'translate(' + Number(x + index * (barWidth + space)) + ', ' + (this.height - 20) + ')')
                    .select('rect').attr('height', 0);

                element
                    .transition()
                    .duration(timeout)
                    .attr('transform', 'translate(' + Number(x + index * (barWidth + space)) + ', ' + y + ')')
                    .select('rect').attr('height', barHeight);

                d3.select(labels[index])
                    .attr('dy', barHeight / 2 + 10)
                    .attr('x', barWidth * groupSize  / 2);
            });
        }

        private generateParameterColor() {
            if (!this.data) return;

            _.each(this.data, (item: any, index: number) => {
                if (item.values[0]) {
                    item.values[0].color = item.values[0].color || this.pipChartColors.getMaterialColor(index, this.colors);
                    item.color = item.values[0].color;
                }
            });
        }

    }

    const BarChart: ng.IComponentOptions = {
        bindings: BarChartBindings,
        templateUrl: 'bar_chart/BarChart.html',
        controller: BarChartController
    }

    angular
        .module('pipBarCharts', [])
        .component('pipBarChart', BarChart);
}