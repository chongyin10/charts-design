/**
 * 面积图组件入口
 * 支持按需引入: import { Area } from '@zjpcy/charts-design/area'
 */

// 重新导出组件
export { default, default as Area } from './Area';

// 导出类型
export type {
    AreaProps,
    AreaChartData,
    AreaDataset,
    AreaPointConfig,
    AreaGridConfig,
    AreaAxisConfig,
    AreaLegendConfig,
    AreaTooltipConfig,
    AreaTooltipItem,
    AreaVerticalLineConfig,
    AreaCrosshairConfig,
    ComputedPoint,
    AreaChartConfig,
} from './Area.type';
