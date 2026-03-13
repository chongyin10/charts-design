/**
 * 水波图组件类型定义
 * 用于展示数据进度或强度，通过水波纹扩散效果可视化
 */

/**
 * 波浪配置
 */
export interface LiquidWaveConfig {
  /** 波浪振幅（波峰高度） */
  amplitude?: number;
  /** 波浪周期（波长） */
  period?: number;
  /** 波浪颜色，支持单个颜色或颜色数组实现渐变 */
  color?: string | string[];
  /** 波浪透明度 (0-1) */
  opacity?: number;
  /** 波浪动画速度 */
  speed?: number;
  /** 波浪方向：1 向右，-1 向左 */
  direction?: 1 | -1;
}

/**
 * 边框配置
 */
export interface LiquidBorderConfig {
  /** 边框宽度 */
  width?: number;
  /** 边框颜色 */
  color?: string;
  /** 边框透明度 (0-1) */
  opacity?: number;
  /** 是否显示内部间隙 */
  gap?: boolean;
  /** 间隙大小 */
  gapSize?: number;
}

/**
 * 文本配置
 */
export interface LiquidTextConfig {
  /** 文本内容，支持格式化字符串如 {value}%、{value} */
  format?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 字体颜色 */
  color?: string;
  /** 字体粗细 */
  fontWeight?: string | number;
  /** 是否显示 */
  visible?: boolean;
  /** 偏移量 */
  offsetY?: number;
}

/**
 * 水波图数据
 */
export interface LiquidData {
  /** 数值 (0-100) */
  value: number;
  /** 标签名称 */
  label?: string;
}

/**
 * 水波图配置
 */
export interface LiquidChartConfig {
  /** 图表宽度（像素） */
  width?: number;
  /** 图表高度（像素） */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** 圆形大小（相对于容器的比例 0-1） */
  size?: number;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 水波配置 */
  wave?: LiquidWaveConfig;
  /** 边框配置 */
  border?: LiquidBorderConfig;
  /** 文本配置 */
  text?: LiquidTextConfig;
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  /** 是否开启动画 */
  animation?: boolean;
}

/**
 * 水波图组件 Props
 */
export interface LiquidProps {
  /** 图表数据 */
  data: LiquidData;
  /** 图表配置 */
  config?: LiquidChartConfig;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数值变化回调 */
  onChange?: (value: number) => void;
  /** 点击回调 */
  onClick?: (data: LiquidData) => void;
}

/**
 * 内部使用的计算后波浪配置
 */
export interface ComputedWave {
  amplitude: number;
  period: number;
  colors: string[];
  opacity: number;
  speed: number;
  direction: 1 | -1;
  phase: number;
}

/**
 * 内部使用的计算后边框配置
 */
export interface ComputedBorder {
  width: number;
  color: string;
  opacity: number;
  gap: boolean;
  gapSize: number;
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
