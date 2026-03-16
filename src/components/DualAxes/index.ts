/**
 * 双轴图组件入口
 * 支持按需引入: import { DualAxes } from '@zjpcy/charts-design/dual-axes'
 */

// 重新导出组件
export { default, default as DualAxes } from './DualAxes';

// 导出类型
export type {
  DualAxesProps,
  DualAxesChartData,
  DualAxesChartConfig,
  DualAxesLeftDataset,
  DualAxesRightDataset,
  DualAxesAxisConfig,
  DualAxesLegendConfig,
  DualAxesTooltipConfig,
  DualAxesTooltipItem,
  DualAxesGridConfig,
  DualAxesVerticalLineConfig,
  DualAxesPointConfig,
  DualAxesTrackConfig,
  DualAxesDatasetType,
  ComputedPoint,
} from './DualAxes.type';
