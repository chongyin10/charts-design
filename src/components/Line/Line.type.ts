/**
 * 折线图组件类型定义
 */

/**
 * 数据点配置（用于数据集内部）
 */
export interface DatasetPointConfig {
  /** 数据点填充颜色 */
  backgroundColor?: string;
  /** 悬停时数据点填充颜色 */
  hoverBackgroundColor?: string;
  /** 数据点边框颜色 */
  color?: string;
  /** 数据点边框宽度 */
  width?: number;
  /** 数据点样式 */
  style?: 'circle' | 'rect' | 'triangle';
  /** 数据点大小 */
  radius?: number;
  /** 悬停时数据点大小 */
  hoverRadius?: number;
}

/**
 * 数据集配置
 */
export interface LineDataset {
  /** 数据标签 */
  label: string;
  /** 数据数组 */
  data: number[];
  /** 填充颜色 */
  backgroundColor?: string;
  /** 是否填充区域 */
  fill?: boolean;
  /** 数据点样式（已废弃，请使用 point 配置） */
  pointStyle?: 'circle' | 'rect' | 'triangle' | 'none';
  /** 数据点大小（已废弃，请使用 point 配置） */
  pointRadius?: number;
  /** 数据点边框颜色（已废弃，请使用 point.color 配置） */
  pointBorderColor?: string;
  /** 数据点填充颜色（已废弃，请使用 point 配置） */
  pointBackgroundColor?: string;
  /** 数据点配置，设置为 false 隐藏数据点 */
  point?: DatasetPointConfig | false;
  /** 轨道样式配置 */
  track?: LineTrackConfig;
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
 * 网格线配置
 */
export interface LineGridConfig {
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
export interface LineAxisConfig {
  /** 是否显示 */
  display?: boolean;
  /** 轴标题 */
  title?: {
    text: string;
    color?: string;
    fontSize?: number;
  };
  /** 网格线颜色 (已废弃，请使用 grid 配置) */
  gridColor?: string;
  /** 标签颜色 */
  tickColor?: string;
  /** 标签字体大小 */
  tickFontSize?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 网格线配置 */
  grid?: LineGridConfig;
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
 * 预警线配置
 */
export interface LineThresholdConfig {
  /** 预警线数值（Y轴数值） */
  value: number;
  /** 预警线颜色 */
  lineColor?: string;
  /** 预警线宽度 */
  lineWidth?: number;
  /** 预警线上方线条颜色（覆盖数据集默认颜色） */
  aboveLineColor?: string;
  /** 预警线下方线条颜色（使用数据集默认颜色） */
  belowLineColor?: string;
  /** 预警线上方区域填充颜色 */
  aboveFillColor?: string;
  /** 是否显示预警线标签 */
  showLabel?: boolean;
  /** 预警线标签文字 */
  label?: string;
}

/**
 * 轨迹动画配置
 */
export interface LineTrailAnimationConfig {
  /** 是否启用轨迹动画（默认 false） */
  enabled?: boolean;
  /** 轨迹动画时长（毫秒） */
  duration?: number;
  /** 轨迹颜色（默认与线条颜色相同） */
  trailColor?: string;
  /** 轨迹宽度（默认比线条宽 2px） */
  trailWidth?: number;
  /** 轨迹长度（像素，默认 20） */
  trailLength?: number;
  /** 轨迹透明度（0-1，默认 0.6） */
  trailOpacity?: number;
  /** 是否循环播放（默认 false） */
  loop?: boolean;
}

/**
 * 轨道样式配置
 * 用于配置数据点之间的轨道连接线样式
 */
export interface LineTrackConfig {
  /** 轨道颜色（默认与线条颜色相同） */
  color?: string;
  /** 轨道宽度 */
  width?: number;
  /** 悬停时轨道颜色 */
  hoverColor?: string;
  /** 悬停时轨道宽度 */
  hoverWidth?: number;
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
  /** 预警线配置 */
  threshold?: LineThresholdConfig;
  /** 轨迹动画配置 */
  trailAnimation?: LineTrailAnimationConfig;
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
