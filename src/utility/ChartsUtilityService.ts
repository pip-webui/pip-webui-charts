import {
    IChartsUtilityService
} from './IChartsUtilityService';

{
    class ChartsUtilityService implements IChartsUtilityService {
        constructor(
            private $mdColorPalette: angular.material.IColorPalette
        ) { }

        public getMaterialColor(index: number, colors: string[]): string {
            if (!colors || colors.length < 1) return null;

            if (index >= colors.length) {
                index = 0;
            }

            return this.materialColorToRgba(colors[index]);
        }

        public materialColorToRgba(color: string): string {
            return 'rgba(' + this.$mdColorPalette[color][500].value[0] + ',' +
                this.$mdColorPalette[color][500].value[1] + ',' +
                this.$mdColorPalette[color][500].value[2] + ',' +
                (this.$mdColorPalette[color][500].value[3] || 1) + ')';
        }

        public generateMaterialColors(): string[] {
            let colors = _.map((<any>this.$mdColorPalette), (palette, color: string) => {
                return color;
            });
            colors = _.filter(colors, (color: string) => {
                return _.isObject(this.$mdColorPalette[color]) && _.isObject(this.$mdColorPalette[color][500]) && _.isArray(this.$mdColorPalette[color][500].value);
            });

            return colors;
        }
    }

    angular
        .module('pipChartsUtility', [])
        .service('pipChartsUtility', ChartsUtilityService);
}