/**
 * 对称条形图（BidirectionalBar）类型定义
 * 以坐标轴为中心，向左右两侧延伸条形的图表类型
 * 用于展示正负值数据或双向对比关系
 */

/**
 * 对称条形图数据集配置
 */
export interface BidirectionalBarDataset {
  /** 数据标签 */
  label: string;
  /** 数据数组（正数为右侧，负数为左侧，或根据左右数据集配置） */
  data: number[];
  /** 条形填充颜色 */
  backgroundColor?: string;
  /** 条形边框颜色 */
  borderColor?: string;
  /** 条形边框宽度 */
  borderWidth?: number;
  /** 条形圆角半径 */
  borderRadius?: number | number[];
}

/**
 * 对称条形图数据结构（单数据集模式）
 * 左右两侧分别使用不同的数据集
 */
export interface BidirectionalBarChartData {
  /** Y轴标签（分类标签） */
  labels: string[];
  /** 左侧数据集（显示在中心轴左侧） */
  leftData: BidirectionalBarDataset;
  /** 右侧数据集（显示在中心轴右侧） */
  rightData: BidirectionalBarDataset;
}

/**
 * 对称条形图数据结构（镜像模式）
 * 标签在中心，左右两侧分别显示不同的数值
 */
export interface BidirectionalBarMirrorData {
  /** Y轴标签（分类标签）- 显示在中心 */
  labels: string[];
  /** 左侧数据集（显示在标签左侧） */
  leftData: BidirectionalBarDataset;
  /** 右侧数据集（显示在标签右侧） */
  rightData: BidirectionalBarDataset;
}

/**
 * 对称条形图数据结构（垂直模式）
 * X轴标签在中心，上下两侧分别显示不同的数值
 * 与镜像模式类似，但是上下排列
 */
export interface BidirectionalBarVerticalData {
  /** X轴标签（分类标签）- 显示在中心 */
  labels: string[];
  /** 上方数据集（正数值，向上延伸） */
  topData: BidirectionalBarDataset;
  /** 下方数据集（负数值，向下延伸） */
  bottomData: BidirectionalBarDataset;
}

/**
 * 对称条形图数据结构（正负值模式）
 */
export interface BidirectionalBarSignedData {
  /** Y轴标签（分类标签） */
  labels: string[];
  /** 数据集（正值显示在右侧，负值显示在左侧） */
  datasets: BidirectionalBarDataset[];
}

/**
 * 网格线配置
 */
export interface BidirectionalBarGridConfig {
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
export interface BidirectionalBarAxisConfig {
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
  grid?: BidirectionalBarGridConfig;
  /** 标签间隔 */
  tickInterval?: number;
}

/**
 * 图例配置
 */
export interface BidirectionalBarLegendConfig {
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
export interface BidirectionalBarTooltipConfig {
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
    items: BidirectionalBarTooltipItem[];
  }) => React.ReactNode;
}

/**
 * 数据标签配置
 */
export interface BidirectionalBarDataLabelConfig {
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
export interface BidirectionalBarConfig {
  /** 条形高度 (0-1，相对于分类高度的比例) */
  height?: number;
  /** 条形圆角半径 */
  borderRadius?: number | number[];
  /** 条形间距 */
  spacing?: number;
  /** 数据标签配置 */
  dataLabel?: BidirectionalBarDataLabelConfig;
}

/**
 * 垂直线配置（在双向条形图中显示为水平线，用于对比不同分类）
 * 启用后，鼠标移入时会显示该分类位置的所有数据点
 */
export interface BidirectionalBarVerticalLineConfig {
  /** 是否启用垂直线模式（默认 false） */
  enabled?: boolean;
  /** 线条颜色 */
  color?: string;
  /** 线条宽度 */
  lineWidth?: number;
  /** 线条样式（实线/虚线） */
  dash?: number[];
}

/**
 * Tooltip 数据项
 */
export interface BidirectionalBarTooltipItem {
  /** 数据集标签 */
  label: string;
  /** 数据值 */
  value: number;
  /** 数据集颜色 */
  color: string;
  /** 方向：left 或 right */
  direction: 'left' | 'right';
}

/**
 * 计算后的条形数据
 */
export interface ComputedBidirectionalBar {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 数据值 */
  value: number;
  /** 分类标签 */
  label: string;
  /** 方向：left 或 right */
  direction: 'left' | 'right';
  /** 数据索引 */
  dataIndex: number;
  /** 颜色 */
  color: string;
}

/**
 * 图表配置
 */
export interface BidirectionalBarChartConfig {
  /** 内边距 */
  padding: number;
  /** 图表宽度 */
  chartWidth: number;
  /** 图表高度 */
  chartHeight: number;
  /** 左侧/上方最大值 */
  leftMaxValue: number;
  /** 右侧/下方最大值 */
  rightMaxValue: number;
  /** 左侧/上方数值范围 */
  leftValueRange: number;
  /** 右侧/下方数值范围 */
  rightValueRange: number;
  /** 中心轴 X 坐标（水平模式） */
  centerX: number;
  /** 中心轴 Y 坐标（垂直模式） */
  centerY?: number;
}

/**
 * 对称条形图组件属性
 */
export interface BidirectionalBarProps {
  /** 图表数据（左右分离模式） */
  data?: BidirectionalBarChartData;
  /** 图表数据（正负值模式） */
  signedData?: BidirectionalBarSignedData;
  /** 图表数据（镜像模式） */
  mirrorData?: BidirectionalBarMirrorData;
  /** 图表数据（垂直模式） */
  verticalData?: BidirectionalBarVerticalData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** X轴配置 */
  xAxis?: BidirectionalBarAxisConfig;
  /** Y轴配置（分类轴） */
  yAxis?: BidirectionalBarAxisConfig;
  /** 图例配置 */
  legend?: BidirectionalBarLegendConfig;
  /** 提示框配置 */
  tooltip?: BidirectionalBarTooltipConfig;
  /** 条形配置 */
  bar?: BidirectionalBarConfig;
  /** 垂直线配置（在双向条形图中显示为水平线，用于对比不同分类） */
  verticalLine?: BidirectionalBarVerticalLineConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 数据模式：'split' 为左右分离模式，'signed' 为正负值模式，'mirror' 为镜像模式，'vertical' 为垂直模式 */
  mode?: 'split' | 'signed' | 'mirror' | 'vertical';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数据点击回调 */
  onDataClick?: (direction: 'left' | 'right', dataIndex: number, value: number) => void;
  /** 图表渲染完成回调 */
  onChartReady?: () => void;
}
