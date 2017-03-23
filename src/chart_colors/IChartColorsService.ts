export interface IChartColorsService {
    getMaterialColor(index: number, colors: string[]): string;
    materialColorToRgba(color: string): string;
    generateMaterialColors(): string[];
}