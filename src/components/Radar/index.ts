/**
 * 雷达图组件入口
 * 支持按需引入: import { Radar } from '@zjpcy/charts/radar'
 */

// 重新导出组件
export { default, default as Radar } from './Radar';

// 导出类型
export type {
    RadarProps,
    RadarChartData,
    RadarSeries,
    RadarDataItem,
    RadarIndicator,
    RadarLabelConfig,
    RadarAxisConfig,
    RadarTickConfig,
    RadarGridConfig,
    RadarLegendConfig,
    RadarTooltipConfig,
    RadarChartConfig,
    RadarPointConfig,
    RadarScanConfig,
    RadarPointLabelConfig,
    RadarTitleConfig,
    RadarDimensionLabelConfig,
} from './Radar.type';
