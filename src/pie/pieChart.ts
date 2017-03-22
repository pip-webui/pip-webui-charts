import {
    IChartsUtilityService
} from '../utility/IChartsUtilityService';

{
    interface IPieChartBindings {
        [key: string]: any;

        series: any;
        donut: any;
        legend: any;
        total: any;
        size: any;
        centered: any;
    }

    const PieChartBindings: IPieChartBindings = {
        series: '<pipSeries',
        donut: '<?pipDonut',
        legend: '<?pipShowLegend',
        total: '<?pipShowTotal',
        size: '<?pipPieSize',
        centered: '<?pipCentered'
    }

    class PieChartBindingsChanges implements ng.IOnChangesObject, IPieChartBindings {
        [key: string]: any;

        series: ng.IChangesObject < any > ;
        donut: ng.IChangesObject < boolean > ;
        legend: ng.IChangesObject < boolean > ;
        total: ng.IChangesObject < boolean > ;
        size: ng.IChangesObject < number | string > ;
        centered: ng.IChangesObject < boolean > ;
    }

    class PieChartController implements ng.IController, IPieChartBindings {
        public series: any;
        public donut: boolean = false;
        public legend: boolean = true;
        public total: boolean = true;
        public size: number | string = 250;
        public centered: boolean = false;

        private data: any;
        private chart: nv.PieChart = null;
        private chartElem: any;
        private titleElem: any;
        private colors: string[];

        constructor(
            private $element: JQuery,
            private $scope: ng.IScope,
            private $timeout: ng.ITimeoutService,
            private pipChartsUtility: IChartsUtilityService
        ) {
            this.colors = this.pipChartsUtility.generateMaterialColors();
        }

        public $onInit() {
            this.data = this.series;
            this.generateParameterColor();
            ( < any > d3.scale).paletteColors = () => {
                return d3.scale.ordinal().range(this.colors.map((color) => {
                    return this.pipChartsUtility.materialColorToRgba(color);
                }));
            };

            this.instantiateChart();
        }

        public $onChanges(changes: PieChartBindingsChanges) {
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
                    this.$timeout(() => {
                        this.resizeTitleLabelUnwrap();
                    });
                    this.drawEmptyState(d3.select(this.$element.get(0)).select('.pie-chart svg')[0][0]);
                }
            }
        }

        private instantiateChart() {
            nv.addGraph(() => {
                this.chart = nv.models.pieChart()
                    .margin({
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    })
                    .x((d) => {
                        return this.donut ? d.value : null;
                    })
                    .y((d) => {
                        return d.value;
                    })
                    .height(Number(this.size))
                    .width(Number(this.size))
                    .showLabels(true)
                    .labelThreshold(.001)
                    .growOnHover(false)
                    .donut(this.donut)
                    .donutRatio(0.5)
                    .color((d) => {
                        return d.color || ( < any > d3.scale).paletteColors().range();
                    });

                this.chart.tooltip.enabled(false);
                this.chart.noData('There is no data right now...');
                this.chart.showLegend(false);

                this.chartElem = d3.select(this.$element.get(0))
                    .select('.pie-chart')
                    .style('height', (this.size) + 'px')
                    .style('width', this.centered ? '100%' : (this.size) + 'px')
                    .select('svg')
                    .style('opacity', 0)
                    .datum(this.data || [])
                    .call(this.chart);

                nv.utils.windowResize(() => {
                    this.chart.update();
                    this.$timeout(() => {
                        this.resizeTitleLabelUnwrap();
                    });
                    this.centerChart();
                    this.drawEmptyState(d3.select(this.$element.get(0)).select('.pie-chart svg')[0][0]);
                });

                return this.chart;
            }, () => {
                this.$timeout(() => {
                    const svgElem = d3.select(this.$element.get(0)).select('.pie-chart svg')[0][0];
                    this.renderTotalLabel(svgElem);
                    d3.select(svgElem)
                        .transition()
                        .duration(1000)
                        .style('opacity', 1);

                    this.$timeout(() => {
                        this.resizeTitleLabelUnwrap();
                    }, 800);
                    this.centerChart();
                    this.drawEmptyState(svgElem);
                });
            });
        }

        private drawEmptyState(svg) {
            if (!this.$element.find('text.nv-noData').get(0)) {
                d3.select(this.$element.find('.empty-state')[0]).remove();
                this.$element.find('.pip-empty-pie-text').remove();
            } else {
                if (this.$element.find('.pip-empty-pie-text').length === 0) {
                    this.$element.find('.pie-chart')
                        .append("<div class='pip-empty-pie-text'>There is no data right now...</div>");
                }

                const pie = d3.layout.pie().sort(null),
                    size = Number(this.size);

                const arc = d3.svg.arc()
                    .innerRadius(size / 2 - 20)
                    .outerRadius(size / 2 - 57);

                svg = d3.select(svg)
                    .append("g")
                    .classed('empty-state', true)
                    .attr('transform', "translate(" + size / 2 + "," + size / 2 + ")");

                const path = svg.selectAll("path")
                    .data(pie([1]))
                    .enter().append("path")
                    .attr("fill", "rgba(0, 0, 0, 0.08)")
                    .attr("d", < any > arc);
            }
        }

        private centerChart() {
            if (this.centered) {
                const svgElem = d3.select(this.$element.get(0)).select('.pie-chart svg')[0][0],
                    leftMargin = $(svgElem).innerWidth() / 2 - (Number(this.size) || 250) / 2;
                d3.select(this.$element.find('.nv-pieChart')[0]).attr('transform', 'translate(' + leftMargin + ', 0)');
            }
        }

        private renderTotalLabel(svgElem) {
            if ((!this.total && !this.donut) || !this.data) return;

            let totalVal = this.data.reduce(function (sum, curr) {
                return sum + curr.value;
            }, 0);

            if (totalVal >= 10000) totalVal = (totalVal / 1000).toFixed(1) + 'k';

            d3.select(svgElem)
                .select('.nv-pie:not(.nvd3)')
                .append('text')
                .classed('label-total', true)
                .attr('text-anchor', 'middle')
                .style('dominant-baseline', 'central')
                .text(totalVal);

            this.titleElem = d3.select(this.$element.find('text.label-total').get(0)).style('opacity', 0);
        }

        private resizeTitleLabelUnwrap() {
            if ((!this.total && !this.donut) || !this.data) return;

            const boxSize = ( < any > this.$element.find('.nvd3.nv-pieChart').get(0)).getBBox();

            if (!boxSize.width || !boxSize.height) {
                return;
            }

            this.titleElem.style('font-size', ~~boxSize.width / 4.5).style('opacity', 1);
        }

        private generateParameterColor() {
            if (!this.data) return;

            _.each(this.data, (item: any, index: number) => {
                item.color = item.color || this.pipChartsUtility.getMaterialColor(index, this.colors);
            });
        }

    }

    const PieChart: ng.IComponentOptions = {
        bindings: PieChartBindings,
        templateUrl: 'pie/pieChart.html',
        controller: PieChartController
    }

    angular.module('pipPieCharts', [])
        .component('pipPieChart', PieChart);
}