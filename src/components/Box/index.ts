/**
 * 箱线图组件入口
 * 支持按需引入: import { BoxPlot } from '@zjpcy/charts/box'
 */

// 重新导出组件
export { default, default as BoxPlot } from './Box';

// 导出类型
export type {
  BoxPlotProps,
  BoxPlotChartData,
  BoxPlotDataset,
  BoxPlotItem,
  BoxPlotChartConfig,
  ComputedBox,
  BoxPlotTooltipItem,
  BoxPlotGridConfig,
  BoxPlotXAxisConfig,
  BoxPlotYAxisConfig,
  BoxPlotTooltipConfig,
} from './Box.type';
