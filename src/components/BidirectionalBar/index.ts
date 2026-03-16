/**
 * 对称条形图组件入口
 * 支持按需引入: import { BidirectionalBar } from '@zjpcy/charts-design/bidirectionalBar'
 */

// 重新导出组件
export { default, default as BidirectionalBar } from './BidirectionalBar';

// 重新导出类型
export type {
  BidirectionalBarProps,
  BidirectionalBarChartData,
  BidirectionalBarSignedData,
  BidirectionalBarMirrorData,
  BidirectionalBarChartConfig,
  BidirectionalBarDataset,
  BidirectionalBarConfig,
  BidirectionalBarDataLabelConfig,
  BidirectionalBarAxisConfig,
  BidirectionalBarGridConfig,
  BidirectionalBarLegendConfig,
  BidirectionalBarTooltipConfig,
  BidirectionalBarTooltipItem,
  BidirectionalBarVerticalLineConfig,
  ComputedBidirectionalBar,
} from './BidirectionalBar.type';
