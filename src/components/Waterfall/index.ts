/**
 * 瀑布图组件入口
 * 支持按需引入: import { Waterfall } from '@zjpcy/charts-design/waterfall'
 */

// 重新导出组件
export { default, default as Waterfall } from './Waterfall';

// 导出类型
export type {
  WaterfallProps,
  WaterfallChartData,
  WaterfallDataItem,
  WaterfallAxisConfig,
  WaterfallGridConfig,
  WaterfallLegendConfig,
  WaterfallTooltipConfig,
  WaterfallConnectorConfig,
  WaterfallColumnConfig,
  WaterfallLabelConfig,
  ComputedWaterfallColumn,
} from './Waterfall.type';
