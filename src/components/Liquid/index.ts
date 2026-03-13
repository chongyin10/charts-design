/**
 * 水波图组件入口
 * 支持按需引入: import { Liquid } from '@zjpcy/charts-design/liquid'
 */

// 重新导出组件
export { default, default as Liquid } from './Liquid';

// 导出类型
export type {
  LiquidProps,
  LiquidData,
  LiquidChartConfig,
  LiquidWaveConfig,
  LiquidBorderConfig,
  LiquidTextConfig,
} from './Liquid.type';
