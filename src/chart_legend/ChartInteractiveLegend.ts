import { IChartColorsService } from '../chart_colors/IChartColorsService';

{
    interface IChartLegendBindings {
        [key: string]: any;

        series: any;
        interactive: any;
    }

    const ChartLegendBindings: IChartLegendBindings = {
        series: '<pipSeries',
        interactive: '<pipInteractive'
    }

    class ChartLegendBindingsChanges implements ng.IOnChangesObject, IChartLegendBindings {
        [key: string]: any;

        series: ng.IChangesObject < any > ;
        interactive: ng.IChangesObject < boolean > ;
    }

    class ChartLegendController implements ng.IController, IChartLegendBindings {
        public series: any;
        public interactive: boolean;

        private colors: string[];

        constructor(
            private $element: JQuery,
            private $scope: ng.IScope,
            private $timeout: ng.ITimeoutService,
            private pipChartColors: IChartColorsService
        ) {
            "ngInject";
            this.colors = this.pipChartColors.generateMaterialColors();
        }

        public $onInit() {
            this.updateLegends();
        }

        public $onChanges(changes: ChartLegendBindingsChanges) {
            if (changes.series && changes.series.currentValue !== changes.series.previousValue) {
                this.series = changes.series.currentValue;
                this.updateLegends();
            }

            if (changes.interactive && changes.interactive.currentValue !== changes.interactive.previousValue) {
                this.interactive = changes.interactive.currentValue;
                if (this.interactive === true) {
                    this.$timeout(() => {
                        this.colorCheckboxes();
                    }, 0);
                }
            }
        }

        private updateLegends() {
            this.$timeout(() => {
                this.animate();
                this.colorCheckboxes();
            }, 0);
            this.prepareSeries();
        }

        private colorCheckboxes() {
            const checkboxContainers = this.$element.find('md-checkbox .md-container');

            _.each(checkboxContainers, (item: EventTarget, index: number) => {
                if (index >= this.series.length) {
                    return
                }
                $(item)
                    .css('color', this.series[index].color || this.colors[index])
                    .find('.md-icon')
                    .css('background-color', this.series[index].color || this.colors[index]);
            });
        }

        private animate() {
            const legendTitles = this.$element.find('.chart-legend-item');

            _.each(legendTitles, (item: EventTarget, index: number) => {
                this.$timeout(() => {
                    $(item).addClass('visible');
                }, 200 * index);
            });
        }

        private prepareSeries() {
            if (!this.series) return;

            _.each(this.series, (item: any, index: number) => {
                const materialColor = this.pipChartColors.getMaterialColor(index, this.colors);
                item.color = item.color || (item.values && item.values[0] && item.values[0].color ? item.values[0].color : materialColor);
                item.disabled = item.disabled || false;
            });
        }
    }

    const ChartLegend: ng.IComponentOptions = {
        bindings: ChartLegendBindings,
        templateUrl: 'chart_legend/ChartInteractiveLegend.html',
        controller: ChartLegendController
    }

    angular
        .module('pipChartLegends', [])
        .component('pipChartLegend', ChartLegend);
}