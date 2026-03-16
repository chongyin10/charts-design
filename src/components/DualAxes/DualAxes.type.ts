/**
 * 双轴图组件类型定义
 */

/**
 * 数据点配置（用于数据集内部）
 */
export interface DualAxesPointConfig {
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
 * 数据集轨道配置
 */
export interface DualAxesTrackConfig {
  /** 轨道颜色 */
  color?: string;
  /** 轨道宽度 */
  width?: number;
  /** 悬停时轨道颜色 */
  hoverColor?: string;
  /** 悬停时轨道宽度 */
  hoverWidth?: number;
}

/**
 * 双轴图数据集类型
 */
export type DualAxesDatasetType = 'line' | 'column';

/**
 * 左侧 Y 轴数据集配置（主轴）
 */
export interface DualAxesLeftDataset {
  /** 数据标签 */
  label: string;
  /** 数据数组 */
  data: number[];
  /** 数据集类型 */
  type?: 'line' | 'column';
  /** 填充颜色（用于柱状图或面积填充） */
  backgroundColor?: string;
  /** 边框颜色（用于折线图） */
  borderColor?: string;
  /** 是否填充区域（仅对折线图有效） */
  fill?: boolean;
  /** 数据点样式 */
  pointStyle?: 'circle' | 'rect' | 'triangle' | 'none';
  /** 数据点大小 */
  pointRadius?: number;
  /** 数据点配置 */
  point?: DualAxesPointConfig | false;
  /** 轨道样式配置 */
  track?: DualAxesTrackConfig;
  /** 柱状图宽度比例 (0-1)，默认 0.6 */
  barWidth?: number;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * 右侧 Y 轴数据集配置（副轴）
 */
export interface DualAxesRightDataset {
  /** 数据标签 */
  label: string;
  /** 数据数组 */
  data: number[];
  /** 数据集类型，右侧默认为折线图 */
  type?: 'line';
  /** 边框颜色 */
  borderColor?: string;
  /** 是否填充区域 */
  fill?: boolean;
  /** 填充颜色 */
  backgroundColor?: string;
  /** 数据点样式 */
  pointStyle?: 'circle' | 'rect' | 'triangle' | 'none';
  /** 数据点大小 */
  pointRadius?: number;
  /** 数据点配置 */
  point?: DualAxesPointConfig | false;
  /** 轨道样式配置 */
  track?: DualAxesTrackConfig;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * 双轴图数据
 */
export interface DualAxesChartData {
  /** X轴标签 */
  labels: string[];
  /** 左侧 Y 轴数据集（主轴） */
  leftDatasets: DualAxesLeftDataset[];
  /** 右侧 Y 轴数据集（副轴） */
  rightDatasets: DualAxesRightDataset[];
}

/**
 * 网格线配置
 */
export interface DualAxesGridConfig {
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
export interface DualAxesAxisConfig {
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
  /** 网格线配置 */
  grid?: DualAxesGridConfig;
  /** 标签间隔 */
  tickInterval?: number;
  /** 标签格式化函数 */
  tickFormatter?: (value: number) => string;
}

/**
 * 图例配置
 */
export interface DualAxesLegendConfig {
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
 * 提示框数据项
 */
export interface DualAxesTooltipItem {
  /** 数据集标签 */
  label: string;
  /** 数据值 */
  value: number;
  /** 数据集颜色 */
  color: string;
  /** 数据集索引 */
  datasetIndex: number;
  /** 所属轴（left/right） */
  axis: 'left' | 'right';
}

/**
 * 提示框配置
 */
export interface DualAxesTooltipConfig {
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
  /** 自定义内容渲染函数 */
  customContent?: (data: {
    dataIndex: number;
    label: string;
    items: DualAxesTooltipItem[];
  }) => React.ReactNode;
}

/**
 * 竖线配置
 */
export interface DualAxesVerticalLineConfig {
  /** 是否启用竖线模式 */
  enabled?: boolean;
  /** 竖线颜色 */
  color?: string;
  /** 竖线宽度 */
  lineWidth?: number;
  /** 竖线样式（实线/虚线） */
  dash?: number[];
}

/**
 * 双轴图组件属性
 */
export interface DualAxesProps {
  /** 图表数据 */
  data: DualAxesChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** X轴配置 */
  xAxis?: DualAxesAxisConfig;
  /** 左侧 Y 轴配置 */
  leftYAxis?: DualAxesAxisConfig;
  /** 右侧 Y 轴配置 */
  rightYAxis?: DualAxesAxisConfig;
  /** 图例配置 */
  legend?: DualAxesLegendConfig;
  /** 提示框配置 */
  tooltip?: DualAxesTooltipConfig;
  /** 竖线配置 */
  verticalLine?: DualAxesVerticalLineConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 是否平滑曲线 */
  smooth?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数据点击回调 */
  onDataClick?: (
    axis: 'left' | 'right',
    datasetIndex: number,
    dataIndex: number,
    value: number
  ) => void;
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
  axis: 'left' | 'right';
  /** 柱状图专用：柱子中心 X 坐标 */
  barX?: number;
  /** 柱状图专用：柱子宽度 */
  barWidth?: number;
  /** 柱状图专用：柱子高度 */
  barHeight?: number;
}

/**
 * 图表配置
 */
export interface DualAxesChartConfig {
  padding: number;
  chartWidth: number;
  chartHeight: number;
  leftMinValue: number;
  leftMaxValue: number;
  leftValueRange: number;
  rightMinValue: number;
  rightMaxValue: number;
  rightValueRange: number;
  rightAxisOffset: number;
}
