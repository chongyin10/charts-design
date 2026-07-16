/**
 * 热力图组件入口
 * 支持按需引入: import { Heatmap } from '@zjpcy/charts/heatmap'
 */

// 重新导出组件
export { default, default as Heatmap } from './Heatmap';

// 重新导出类型
export type {
  HeatmapProps,
  HeatmapChartData,
  HeatmapDataset,
  HeatmapColorScaleConfig,
  HeatmapAxisConfig,
  HeatmapGridConfig,
  HeatmapLegendConfig,
  HeatmapTooltipConfig,
  HeatmapLabelConfig,
  DensityPoint,
  DensityConfig,
  ClusteringConfig,
  ClusterNode,
  HierarchicalClusteringResult,
} from './Heatmap.type';
