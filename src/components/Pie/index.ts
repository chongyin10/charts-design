/**
 * 饼图组件入口
 * 支持按需引入: import { Pie } from '@zjpcy/charts/pie'
 */

// 重新导出组件
export { default, default as Pie } from './Pie';

// 导出类型
export type {
    PieProps,
    PieChartData,
    PieDataItem,
    PieMultiRingData,
    PieRingLayer,
    PieLabelConfig,
    PieLegendConfig,
    PieTooltipConfig,
} from './Pie.type';
