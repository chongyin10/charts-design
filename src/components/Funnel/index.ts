/**
 * 漏斗图组件入口
 * 支持按需引入: import { Funnel } from '@zjpcy/charts/funnel'
 */

// 重新导出组件
export { default, default as Funnel } from './Funnel';

// 导出类型
export type {
  FunnelProps,
  FunnelChartData,
  FunnelDataItem,
  FunnelLabelConfig,
  FunnelConversionConfig,
  FunnelLegendConfig,
  FunnelTooltipConfig,
  ComputedSlice,
  FunnelChartConfig,
} from './Funnel.type';
