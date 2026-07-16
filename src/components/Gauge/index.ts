/**
 * 仪表盘组件入口
 * 用于展示数据的进度、比例或比较情况
 * 支持按需引入: import { Gauge } from '@zjpcy/charts/gauge'
 */

// 重新导出组件
export { default, default as Gauge } from './Gauge';

// 导出类型
export type {
  GaugeProps,
  GaugeData,
  GaugeChartConfig,
  GaugeAxisConfig,
  GaugeProgressConfig,
  GaugePointerConfig,
  GaugePivotConfig,
  GaugeTextConfig,
  GaugeRangeConfig,
  GaugePanelConfig,
  GaugePanelWaveConfig,
  ComputedAxis,
  ComputedProgress,
  ComputedPointer,
  ComputedPivot,
  ComputedText,
  ComputedRange,
  ComputedPanel,
  GaugeGeometry,
} from './Gauge.type';
