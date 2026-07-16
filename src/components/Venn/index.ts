/**
 * 韦恩图组件入口
 * 支持按需引入: import { Venn } from '@zjpcy/charts/venn'
 */

// 重新导出组件
export { default, default as Venn } from './Venn';

// 导出类型
export type {
  VennProps,
  VennData,
  VennSet,
  VennIntersection,
  VennConfig,
  VennLabelConfig,
  VennLegendConfig,
  VennTooltipConfig,
  ComputedCircle,
  ComputedIntersection,
} from './Venn.type';
