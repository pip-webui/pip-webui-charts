export interface IChartsUtilityService {
    getMaterialColor(index: number, colors: string[]): string;
    materialColorToRgba(color: string): string;
    generateMaterialColors(): string[];
}