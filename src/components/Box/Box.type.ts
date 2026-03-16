/**
 * 箱线图组件类型定义
 */

/**
 * 箱线图数据项
 * min: 最小值（下边界）
 * q1: 第一四分位数（箱体下边界）
 * median: 中位数（箱体中间横线）
 * q3: 第三四分位数（箱体上边界）
 * max: 最大值（上边界）
 */
export interface BoxPlotItem {
  /** 最小值 */
  min: number;
  /** 第一四分位数 (25%) */
  q1: number;
  /** 中位数 (50%) */
  median: number;
  /** 第三四分位数 (75%) */
  q3: number;
  /** 最大值 */
  max: number;
  /** 异常值数组（可选） */
  outliers?: number[];
}

/**
 * 数据集配置
 */
export interface BoxPlotDataset {
  /** 数据标签 */
  label: string;
  /** 箱线图数据数组 */
  data: BoxPlotItem[];
  /** 箱体填充颜色 */
  backgroundColor?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 边框宽度 */
  borderWidth?: number;
  /** 中位线颜色 */
  medianColor?: string;
  /** 中位线宽度 */
  medianWidth?: number;
  /** 须线颜色 (上下边界线) */
  whiskerColor?: string;
  /** 须线宽度 */
  whiskerWidth?: number;
}

/**
 * 图表数据
 */
export interface BoxPlotChartData {
  /** X轴标签 */
  labels: string[];
  /** 数据集数组 */
  datasets: BoxPlotDataset[];
}

/**
 * 网格线配置
 */
export interface BoxPlotGridConfig {
  /** 是否显示网格线 */
  display?: boolean;
  /** 网格线颜色 */
  color?: string;
  /** 网格线宽度 */
  lineWidth?: number;
  /** 是否显示垂直网格线 */
  vertical?: boolean;
  /** 是否显示水平网格线 */
  horizontal?: boolean;
}

/**
 * X轴配置
 */
export interface BoxPlotXAxisConfig {
  /** 是否显示X轴 */
  display?: boolean;
  /** 轴标题 */
  title?: string;
  /** 轴颜色 */
  color?: string;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
  /** 轴宽度 */
  lineWidth?: number;
}

/**
 * Y轴配置
 */
export interface BoxPlotYAxisConfig {
  /** 是否显示Y轴 */
  display?: boolean;
  /** 轴标题 */
  title?: string;
  /** 轴颜色 */
  color?: string;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
  /** 轴宽度 */
  lineWidth?: number;
  /** Y轴最小值 */
  min?: number;
  /** Y轴最大值 */
  max?: number;
  /** 刻度步长 */
  stepSize?: number;
}

/**
 * Tooltip配置
 */
export interface BoxPlotTooltipConfig {
  /** 是否显示提示框 */
  enabled?: boolean;
  /** 背景色 */
  backgroundColor?: string;
  /** 标题颜色 */
  titleColor?: string;
  /** 正文颜色 */
  bodyColor?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 边框宽度 */
  borderWidth?: number;
  /** 圆角 */
  borderRadius?: number;
  /** 格式化标题函数 */
  titleFormatter?: (label: string) => string;
  /** 格式化值函数 */
  valueFormatter?: (value: number, type: string) => string;
}

/**
 * 图表配置
 */
export interface BoxPlotChartConfig {
  padding: number;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  minValue: number;
  valueRange: number;
}

/**
 * 计算后的箱体数据
 */
export interface ComputedBox {
  x: number;
  y: number;
  width: number;
  height: number;
  medianY: number;
  whiskerTopY: number;
  whiskerBottomY: number;
  centerX: number;
  data: BoxPlotItem;
  datasetIndex: number;
  dataIndex: number;
}

/**
 * Tooltip数据项
 */
export interface BoxPlotTooltipItem {
  label: string;
  datasetLabel: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  color: string;
}

/**
 * 箱线图组件属性
 */
export interface BoxPlotProps {
  /** 图表数据 */
  data: BoxPlotChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** 箱体宽度比例 (0-1) */
  boxWidth?: number;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 网格线配置 */
  grid?: BoxPlotGridConfig;
  /** X轴配置 */
  xAxis?: BoxPlotXAxisConfig;
  /** Y轴配置 */
  yAxis?: BoxPlotYAxisConfig;
  /** Tooltip配置 */
  tooltip?: BoxPlotTooltipConfig;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 点击事件回调 */
  onClick?: (item: BoxPlotTooltipItem, index: number) => void;
}
