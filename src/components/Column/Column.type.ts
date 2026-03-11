/**
 * 柱状图组件类型定义
 */

/**
 * 数据集配置
 */
export interface ColumnDataset {
  /** 数据标签 */
  label: string;
  /** 数据数组 */
  data: number[];
  /** 柱体填充颜色 */
  backgroundColor?: string;
  /** 柱体边框颜色 */
  borderColor?: string;
  /** 柱体边框宽度 */
  borderWidth?: number;
  /** 柱体圆角半径 */
  borderRadius?: number | number[];
  /** 是否堆叠 */
  stack?: string;
}

/**
 * 图表数据
 */
export interface ColumnChartData {
  /** X轴标签 */
  labels: string[];
  /** 数据集数组 */
  datasets: ColumnDataset[];
}

/**
 * 网格线配置
 */
export interface ColumnGridConfig {
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
export interface ColumnAxisConfig {
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
  grid?: ColumnGridConfig;
  /** 标签间隔，每 n 个标签显示一个（默认为1，显示所有标签） */
  tickInterval?: number;
}

/**
 * 图例配置
 */
export interface ColumnLegendConfig {
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
export interface ColumnTooltipConfig {
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
    /** X轴标签 */
    label: string;
    /** 数据项列表 */
    items: ColumnTooltipItem[];
  }) => React.ReactNode;
}

/**
 * 柱体配置
 */
export interface ColumnConfig {
  /** 柱体宽度 (0-1，相对于分类宽度的比例) */
  width?: number;
  /** 柱体圆角半径 */
  borderRadius?: number | number[];
  /** 柱体间距 (分组柱状图中组内柱体间距) */
  spacing?: number;
}

/**
 * Tooltip 数据项
 */
export interface ColumnTooltipItem {
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
 * 柱状图组件属性
 */
export interface ColumnProps {
  /** 图表数据 */
  data: ColumnChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** X轴配置 */
  xAxis?: ColumnAxisConfig;
  /** Y轴配置 */
  yAxis?: ColumnAxisConfig;
  /** 图例配置 */
  legend?: ColumnLegendConfig;
  /** 提示框配置 */
  tooltip?: ColumnTooltipConfig;
  /** 柱体配置 */
  column?: ColumnConfig;
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
 * 计算后的柱体数据
 */
export interface ComputedColumn {
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
export interface ColumnChartConfig {
  padding: number;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  minValue: number;
  valueRange: number;
}
