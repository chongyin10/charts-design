/**
 * 仪表盘组件类型定义
 * 用于展示数据的进度、比例或比较情况
 */

/**
 * 仪表盘刻度配置
 */
export interface GaugeAxisConfig {
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 刻度线颜色 */
  lineColor?: string;
  /** 刻度线宽度 */
  lineWidth?: number;
  /** 刻度标签颜色 */
  labelColor?: string;
  /** 刻度标签字体大小 */
  labelFontSize?: number;
  /** 刻度标签格式化函数 */
  labelFormatter?: (value: number) => string;
  /** 是否显示刻度线 */
  tickVisible?: boolean;
  /** 主刻度间隔 */
  tickInterval?: number;
  /** 次刻度数量 */
  subTickCount?: number;
}

/**
 * 仪表盘进度条配置
 */
export interface GaugeProgressConfig {
  /** 进度条宽度 */
  width?: number;
  /** 进度条颜色，支持单色或渐变色数组 */
  color?: string | string[];
  /** 背景轨道颜色 */
  backgroundColor?: string;
  /** 是否圆角 */
  rounded?: boolean;
  /** 是否显示阴影 */
  shadow?: boolean;
}

/**
 * 仪表盘指针配置
 */
export interface GaugePointerConfig {
  /** 指针长度（相对于半径的比例 0-1） */
  length?: number;
  /** 指针宽度 */
  width?: number;
  /** 指针颜色 */
  color?: string;
  /** 是否显示指针 */
  visible?: boolean;
  /** 指针尾部长度 */
  tailLength?: number;
}

/**
 * 仪表盘中心点配置
 */
export interface GaugePivotConfig {
  /** 中心点半径 */
  radius?: number;
  /** 中心点颜色 */
  color?: string;
  /** 是否显示中心点 */
  visible?: boolean;
}

/**
 * 仪表盘文本配置
 */
export interface GaugeTextConfig {
  /** 文本内容，支持格式化字符串如 {value}、{percent}% */
  format?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 字体颜色 */
  color?: string;
  /** 字体粗细 */
  fontWeight?: string | number;
  /** 是否显示 */
  visible?: boolean;
  /** 垂直偏移 */
  offsetY?: number;
}

/**
 * 仪表盘区间颜色配置
 */
export interface GaugeRangeConfig {
  /** 区间起始值 */
  from: number;
  /** 区间结束值 */
  to: number;
  /** 区间颜色 */
  color: string;
  /** 区间名称（可选） */
  name?: string;
}

/**
 * 仪表盘数据
 */
export interface GaugeData {
  /** 当前数值 */
  value: number;
  /** 数据名称 */
  name?: string;
  /** 单位 */
  unit?: string;
}

/**
 * 仪表盘配置
 */
export interface GaugeChartConfig {
  /** 图表宽度（像素） */
  width?: number;
  /** 图表高度（像素） */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** 起始角度（度，0为3点钟方向） */
  startAngle?: number;
  /** 结束角度（度） */
  endAngle?: number;
  /** 仪表类型：半圆或整圆 */
  type?: 'semi' | 'full';
  /** 半径（相对于容器最小边的比例 0-1） */
  radius?: number;
  /** 坐标轴配置 */
  axis?: GaugeAxisConfig;
  /** 进度条配置 */
  progress?: GaugeProgressConfig;
  /** 指针配置 */
  pointer?: GaugePointerConfig;
  /** 中心点配置 */
  pivot?: GaugePivotConfig;
  /** 数值文本配置 */
  valueText?: GaugeTextConfig;
  /** 标题文本配置 */
  titleText?: GaugeTextConfig;
  /** 区间颜色配置 */
  ranges?: GaugeRangeConfig[];
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  /** 是否开启动画 */
  animation?: boolean;
  /** 是否开启响应式 */
  responsive?: boolean;
}

/**
 * 仪表盘组件 Props
 */
export interface GaugeProps {
  /** 图表数据 */
  data: GaugeData;
  /** 图表配置 */
  config?: GaugeChartConfig;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数值变化回调 */
  onChange?: (value: number) => void;
  /** 点击回调 */
  onClick?: (data: GaugeData) => void;
  /** 图表渲染完成回调 */
  onReady?: () => void;
}

/**
 * 内部使用的计算后坐标轴配置
 */
export interface ComputedAxis {
  min: number;
  max: number;
  lineColor: string;
  lineWidth: number;
  labelColor: string;
  labelFontSize: number;
  labelFormatter: (value: number) => string;
  tickVisible: boolean;
  tickInterval: number;
  subTickCount: number;
}

/**
 * 内部使用的计算后进度条配置
 */
export interface ComputedProgress {
  width: number;
  colors: string[];
  backgroundColor: string;
  rounded: boolean;
  shadow: boolean;
}

/**
 * 内部使用的计算后指针配置
 */
export interface ComputedPointer {
  length: number;
  width: number;
  color: string;
  visible: boolean;
  tailLength: number;
}

/**
 * 内部使用的计算后中心点配置
 */
export interface ComputedPivot {
  radius: number;
  color: string;
  visible: boolean;
}

/**
 * 内部使用的计算后文本配置
 */
export interface ComputedText {
  format: string;
  fontSize: number;
  color: string;
  fontWeight: string | number;
  visible: boolean;
  offsetY: number;
}

/**
 * 内部使用的计算后区间配置
 */
export interface ComputedRange {
  from: number;
  to: number;
  color: string;
  name?: string;
  startAngle: number;
  endAngle: number;
}

/**
 * 图表几何配置
 */
export interface GaugeGeometry {
  centerX: number;
  centerY: number;
  radius: number;
  innerRadius: number;
  startAngle: number;
  endAngle: number;
  angleRange: number;
}
