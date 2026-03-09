/**
 * 折线图组件类型定义
 */

/**
 * 数据集配置
 */
export interface LineDataset {
  /** 数据标签 */
  label: string;
  /** 数据数组 */
  data: number[];
  /** 线条颜色 */
  borderColor?: string;
  /** 线条宽度 */
  borderWidth?: number;
  /** 填充颜色 */
  backgroundColor?: string;
  /** 是否填充区域 */
  fill?: boolean;
  /** 数据点样式 */
  pointStyle?: 'circle' | 'rect' | 'triangle' | 'none';
  /** 数据点大小 */
  pointRadius?: number;
  /** 数据点边框颜色 */
  pointBorderColor?: string;
  /** 数据点填充颜色 */
  pointBackgroundColor?: string;
}

/**
 * 图表数据
 */
export interface LineChartData {
  /** X轴标签 */
  labels: string[];
  /** 数据集数组 */
  datasets: LineDataset[];
}

/**
 * 坐标轴配置
 */
export interface LineAxisConfig {
  /** 是否显示 */
  display?: boolean;
  /** 轴标题 */
  title?: {
    text: string;
    color?: string;
    fontSize?: number;
  };
  /** 网格线颜色 */
  gridColor?: string;
  /** 标签颜色 */
  tickColor?: string;
  /** 标签字体大小 */
  tickFontSize?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
}

/**
 * 图例配置
 */
export interface LineLegendConfig {
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
export interface LineTooltipConfig {
  /** 是否显示 */
  enabled?: boolean;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 文字颜色 */
  titleColor?: string;
  /** 内容颜色 */
  bodyColor?: string;
  /** 字体大小 */
  fontSize?: number;
}

/**
 * 折线图组件属性
 */
export interface LineProps {
  /** 图表数据 */
  data: LineChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** X轴配置 */
  xAxis?: LineAxisConfig;
  /** Y轴配置 */
  yAxis?: LineAxisConfig;
  /** 图例配置 */
  legend?: LineLegendConfig;
  /** 提示框配置 */
  tooltip?: LineTooltipConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 是否平滑曲线 */
  smooth?: boolean;
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
 * 计算后的数据点
 */
export interface ComputedPoint {
  x: number;
  y: number;
  value: number;
  label: string;
  datasetIndex: number;
  dataIndex: number;
}

/**
 * 图表配置
 */
export interface LineChartConfig {
  padding: number;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  minValue: number;
  valueRange: number;
}
