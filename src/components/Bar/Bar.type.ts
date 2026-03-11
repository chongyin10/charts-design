/**
 * 条形图组件类型定义
 * 与 Column 配置一致，但条形方向为水平
 */

/**
 * 数据集配置
 */
export interface BarDataset {
  /** 数据标签 */
  label: string;
  /** 数据数组 */
  data: number[];
  /** 条形填充颜色 */
  backgroundColor?: string;
  /** 条形边框颜色 */
  borderColor?: string;
  /** 条形边框宽度 */
  borderWidth?: number;
  /** 条形圆角半径 */
  borderRadius?: number | number[];
  /** 是否堆叠 */
  stack?: string;
}

/**
 * 图表数据
 */
export interface BarChartData {
  /** Y轴标签（条形图Y轴显示分类） */
  labels: string[];
  /** 数据集数组 */
  datasets: BarDataset[];
}

/**
 * 网格线配置
 */
export interface BarGridConfig {
  /** 是否显示网格线 */
  display?: boolean;
  /** 网格线颜色 */
  color?: string;
  /** 网格线宽度 */
  lineWidth?: number;
  /** 网格线透明度 (0-1) */
  opacity?: number;
  /** 是否显示垂直网格线 (X轴方向) */
  vertical?: boolean;
  /** 是否显示水平网格线 (Y轴方向) */
  horizontal?: boolean;
}

/**
 * 坐标轴配置
 */
export interface BarAxisConfig {
  /** 是否显示 */
  display?: boolean;
  /** 轴标题 */
  title?: {
    text: string;
    color?: string;
    fontSize?: number;
  };
  /** 标签颜色 */
  tickColor?: string;
  /** 标签字体大小 */
  tickFontSize?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 网格线配置 */
  grid?: BarGridConfig;
  /** 标签间隔，每 n 个标签显示一个（默认为1，显示所有标签） */
  tickInterval?: number;
  /** 坐标轴位置，X轴默认为 'bottom'，Y轴默认为 'left' */
  position?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * 图例配置
 */
export interface BarLegendConfig {
  /** 是否显示 */
  display?: boolean;
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
}

/**
 * 提示框配置
 */
export interface BarTooltipConfig {
  /** 是否显示 */
  enabled?: boolean;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 标题颜色 */
  titleColor?: string;
  /** 内容颜色 */
  bodyColor?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 自定义内容渲染函数，返回 React 节点 */
  customContent?: (data: {
    /** 当前悬停的数据索引 */
    dataIndex: number;
    /** Y轴标签 */
    label: string;
    /** 数据项列表 */
    items: BarTooltipItem[];
  }) => React.ReactNode;
}

/**
 * 数据标签配置
 */
export interface BarDataLabelConfig {
  /** 是否显示数据标签 */
  display?: boolean;
  /** 标签颜色 */
  color?: string;
  /** 标签字体大小 */
  fontSize?: number;
  /** 标签与条形的间距 */
  offset?: number;
  /** 自定义格式化函数 */
  formatter?: (value: number) => string;
}

/**
 * 条形配置
 */
export interface BarConfig {
  /** 条形高度 (0-1，相对于分类高度的比例) */
  height?: number;
  /** 条形圆角半径 */
  borderRadius?: number | number[];
  /** 条形间距 (分组条形图中组内条形间距) */
  spacing?: number;
  /** 数据标签配置 */
  dataLabel?: BarDataLabelConfig;
}

/**
 * Tooltip 数据项
 */
export interface BarTooltipItem {
  /** 数据集标签 */
  label: string;
  /** 数据值 */
  value: number;
  /** 数据集颜色 */
  color: string;
  /** 数据集索引 */
  datasetIndex: number;
}

/**
 * 条形图组件属性
 */
export interface BarProps {
  /** 图表数据 */
  data: BarChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** X轴配置（条形图中X轴为数值轴） */
  xAxis?: BarAxisConfig;
  /** Y轴配置（条形图中Y轴为分类轴） */
  yAxis?: BarAxisConfig;
  /** 图例配置 */
  legend?: BarLegendConfig;
  /** 提示框配置 */
  tooltip?: BarTooltipConfig;
  /** 条形配置 */
  bar?: BarConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 是否堆叠显示 */
  stacked?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数据点击回调 */
  onDataClick?: (datasetIndex: number, dataIndex: number, value: number) => void;
  /** 图表渲染完成回调 */
  onChartReady?: () => void;
}

/**
 * 计算后的条形数据
 */
export interface ComputedBar {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  label: string;
  datasetIndex: number;
  dataIndex: number;
  color: string;
}

/**
 * 图表配置
 */
export interface BarChartConfig {
  padding: number;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  minValue: number;
  valueRange: number;
}
