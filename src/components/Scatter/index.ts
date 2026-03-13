/**
 * 散点图组件入口
 * 支持按需引入: import { Scatter } from '@zjpcy/charts-design/scatter'
 */

// 重新导出组件
export { default, default as Scatter } from './Scatter';

// 重新导出类型
export type {
  ScatterProps,
  ScatterChartData,
  ScatterDataset,
  ScatterDataPoint,
  ScatterPointConfig,
  ScatterAxisConfig,
  ScatterGridConfig,
  ScatterLegendConfig,
  ScatterTooltipConfig,
  ScatterTooltipItem,
  ScatterTrendlineConfig,
  ScatterQuadrantConfig,
  ScatterSelectionConfig,
  ScatterSelectedPoint,
  ComputedScatterPoint,
  ScatterChartConfig,
  ScatterLabelConfig,
} from './Scatter.type';
