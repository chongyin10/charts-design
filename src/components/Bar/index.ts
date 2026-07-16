/**
 * 条形图组件入口
 * 支持按需引入: import { Bar } from '@zjpcy/charts/bar'
 */

// 重新导出组件
export { default, default as Bar } from './Bar';

// 重新导出类型
export type {
  BarProps,
  BarChartData,
  BarChartConfig,
  BarDataset,
  BarConfig,
  BarDataLabelConfig,
  BarAxisConfig,
  BarGridConfig,
  BarLegendConfig,
  BarTooltipConfig,
  BarTooltipItem,
  ComputedBar,
} from './Bar.type';
