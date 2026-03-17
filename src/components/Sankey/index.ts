/**
 * 桑基图组件入口
 * 用于描述一组值到另一组值的流向，通常应用于能源、材料成分、金融等数据的可视化分析
 * 支持按需引入: import { Sankey } from '@zjpcy/charts-design/sankey'
 */

// 重新导出组件
export { default, default as Sankey } from './Sankey';

// 导出类型
export type {
  SankeyProps,
  SankeyChartData,
  SankeyNode,
  SankeyLink,
  SankeyNodeConfig,
  SankeyLinkConfig,
  SankeyLayoutConfig,
  SankeyTooltipConfig,
  SankeyLegendConfig,
  SankeyAnimationConfig,
  ComputedNode,
  ComputedLink,
  SankeyChartConfig,
} from './Sankey.type';
