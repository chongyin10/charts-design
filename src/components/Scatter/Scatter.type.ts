/**
 * 散点图组件类型定义
 */

/**
 * 散点数据点
 */
export interface ScatterDataPoint {
  /** X 坐标值 */
  x: number;
  /** Y 坐标值 */
  y: number;
}

/**
 * 数据点配置
 */
export interface ScatterPointConfig {
  /** 数据点填充颜色 */
  backgroundColor?: string;
  /** 悬停时数据点填充颜色 */
  hoverBackgroundColor?: string;
  /** 数据点边框颜色 */
  borderColor?: string;
  /** 数据点边框宽度 */
  borderWidth?: number;
  /** 数据点样式 */
  style?: 'circle' | 'rect' | 'triangle';
  /** 数据点半径（大小） */
  radius?: number;
  /** 悬停时数据点半径 */
  hoverRadius?: number;
}

/**
 * 数据集配置
 */
export interface ScatterDataset {
  /** 数据标签 */
  label: string;
  /** 数据点数组，每个点包含 x 和 y 坐标 */
  data: ScatterDataPoint[];
  /** 数据点填充颜色（可覆盖 point 配置） */
  backgroundColor?: string;
  /** 数据点边框颜色（可覆盖 point 配置） */
  borderColor?: string;
  /** 数据点配置 */
  point?: ScatterPointConfig;
}

/**
 * 图表数据
 */
export interface ScatterChartData {
  /** 数据集数组 */
  datasets: ScatterDataset[];
}

/**
 * 网格线配置
 */
export interface ScatterGridConfig {
  /** 是否显示网格线 */
  display?: boolean;
  /** 网格线颜色 */
  color?: string;
  /** 网格线宽度 */
  lineWidth?: number;
  /** 网格线透明度 (0-1) */
  opacity?: number;
  /** 是否显示垂直网格线 */
  vertical?: boolean;
  /** 是否显示水平网格线 */
  horizontal?: boolean;
}

/**
 * 坐标轴配置
 */
export interface ScatterAxisConfig {
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
  /** 最小值（如果不设置则自动计算） */
  min?: number;
  /** 最大值（如果不设置则自动计算） */
  max?: number;
  /** 网格线配置 */
  grid?: ScatterGridConfig;
}

/**
 * 图例配置
 */
export interface ScatterLegendConfig {
  /** 是否显示 */
  display?: boolean;
  /** 位置 */
  position?: 'top' | 'bottom';
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
}

/**
 * 提示框配置
 */
export interface ScatterTooltipConfig {
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
    /** 当前悬停的数据点索引 */
    dataIndex: number;
    /** 数据集标签 */
    label: string;
    /** 数据点 */
    point: ScatterDataPoint;
    /** 数据项列表 */
    items: ScatterTooltipItem[];
  }) => React.ReactNode;
}

/**
 * Tooltip 数据项
 */
export interface ScatterTooltipItem {
  /** 数据集标签 */
  label: string;
  /** X 坐标值 */
  x: number;
  /** Y 坐标值 */
  y: number;
  /** 数据集颜色 */
  color: string;
  /** 数据集索引 */
  datasetIndex: number;
}

/**
 * 回归线配置
 * 用于在散点图上绘制趋势线
 */
export interface ScatterTrendlineConfig {
  /** 是否显示回归线 */
  enabled?: boolean;
  /** 回归线颜色 */
  color?: string;
  /** 回归线宽度 */
  width?: number;
  /** 是否显示为虚线 */
  dashed?: boolean;
}

/**
 * 象限配置
 * 用于将图表划分为四个象限并分别着色
 */
export interface ScatterQuadrantConfig {
  /** 是否启用象限背景 */
  enabled?: boolean;
  /** X 轴分割线位置（默认为 0） */
  xDivider?: number;
  /** Y 轴分割线位置（默认为 0） */
  yDivider?: number;
  /** 四个象限的背景颜色（左上、右上、右下、左下） */
  colors?: [string, string, string, string];
  /** 象限透明度 */
  opacity?: number;
}

/**
 * 散点图组件属性
 */
export interface ScatterProps {
  /** 图表数据 */
  data: ScatterChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** X轴配置 */
  xAxis?: ScatterAxisConfig;
  /** Y轴配置 */
  yAxis?: ScatterAxisConfig;
  /** 图例配置 */
  legend?: ScatterLegendConfig;
  /** 提示框配置 */
  tooltip?: ScatterTooltipConfig;
  /** 回归线配置 */
  trendline?: ScatterTrendlineConfig;
  /** 象限配置 */
  quadrant?: ScatterQuadrantConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数据点击回调 */
  onDataClick?: (datasetIndex: number, dataIndex: number, point: ScatterDataPoint) => void;
  /** 图表渲染完成回调 */
  onChartReady?: () => void;
}

/**
 * 计算后的数据点
 */
export interface ComputedScatterPoint {
  /** 画布 X 坐标 */
  x: number;
  /** 画布 Y 坐标 */
  y: number;
  /** 原始数据 X 值 */
  dataX: number;
  /** 原始数据 Y 值 */
  dataY: number;
  /** 数据集索引 */
  datasetIndex: number;
  /** 数据点索引 */
  dataIndex: number;
}

/**
 * 图表配置
 */
export interface ScatterChartConfig {
  padding: number;
  chartWidth: number;
  chartHeight: number;
  xMin: number;
  xMax: number;
  xRange: number;
  yMin: number;
  yMax: number;
  yRange: number;
}
