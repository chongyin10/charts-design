/**
 * 饼图组件类型定义
 */

/**
 * 饼图数据项
 */
export interface PieDataItem {
  /** 数据标签 */
  label: string;
  /** 数据值 */
  value: number;
  /** 自定义颜色 */
  color?: string;
}

/**
 * 饼图数据
 */
export interface PieChartData {
  /** 数据项数组 */
  items: PieDataItem[];
}

/**
 * 多层环形图数据层
 */
export interface PieRingLayer {
  /** 层名称（用于图例） */
  name?: string;
  /** 该层的数据项 */
  items: PieDataItem[];
  /** 该层的内半径比例（相对于图表半径，0-1之间） */
  innerRadius?: number;
  /** 该层的外半径比例（相对于图表半径，0-1之间） */
  outerRadius?: number;
}

/**
 * 多层环形图数据
 */
export interface PieMultiRingData {
  /** 多层数据 */
  layers: PieRingLayer[];
}

/**
 * 饼图标签配置
 */
export interface PieLabelConfig {
  /** 是否显示标签 */
  display?: boolean;
  /** 标签颜色 */
  color?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 标签格式，支持占位符: {label}, {value}, {percentage} */
  formatter?: string | ((item: PieDataItem, percentage: number) => string);
  /** 标签位置: inside-内部, outside-外部 */
  position?: 'inside' | 'outside';
  /** 外部标签连接线长度 */
  lineLength?: number;
}

/**
 * 图例配置
 */
export interface PieLegendConfig {
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
export interface PieTooltipConfig {
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
    /** 数据项 */
    item: PieDataItem;
    /** 百分比 (0-100) */
    percentage: number;
    /** 数据索引 */
    index: number;
  }) => React.ReactNode;
}

/**
 * 饼图组件属性
 */
export interface PieProps {
  /** 图表数据（单层饼图/环形图） */
  data?: PieChartData;
  /** 多层环形图数据 */
  multiRingData?: PieMultiRingData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** 饼图半径 (0-1之间的比例，相对于较小边的一半) */
  radius?: number;
  /** 是否显示为环形图 (donut)，内圆半径比例 */
  innerRadius?: number;
  /** 起始角度 (度数，0表示3点钟方向) */
  startAngle?: number;
  /** 是否顺时针绘制 */
  clockwise?: boolean;
  /** 扇区间隙 (像素) */
  gap?: number;
  /** 标签配置 */
  label?: PieLabelConfig;
  /** 图例配置 */
  legend?: PieLegendConfig;
  /** 提示框配置 */
  tooltip?: PieTooltipConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数据点击回调（单层数据） */
  onDataClick?: (index: number, item: PieDataItem) => void;
  /** 多层数据点击回调 */
  onMultiRingDataClick?: (layerIndex: number, dataIndex: number, item: PieDataItem) => void;
  /** 图表渲染完成回调 */
  onChartReady?: () => void;
}

/**
 * 计算后的扇区数据
 */
export interface ComputedSlice {
  /** 扇区起始角度 (弧度) */
  startAngle: number;
  /** 扇区结束角度 (弧度) */
  endAngle: number;
  /** 扇区中间角度 (弧度) */
  middleAngle: number;
  /** 扇区占比 (0-1) */
  ratio: number;
  /** 百分比 (0-100) */
  percentage: number;
  /** 颜色 */
  color: string;
  /** 数据项 */
  item: PieDataItem;
  /** 数据索引 */
  index: number;
  /** 标签位置 (仅外部标签) */
  labelPos?: { x: number; y: number };
  /** 连接线终点位置 (仅外部标签) */
  lineEndPos?: { x: number; y: number };
  /** 层索引（多层环形图） */
  layerIndex?: number;
  /** 层内半径比例（多层环形图） */
  layerInnerRadius?: number;
  /** 层外半径比例（多层环形图） */
  layerOuterRadius?: number;
}

/**
 * 图表配置
 */
export interface PieChartConfig {
  /** 中心点 X */
  centerX: number;
  /** 中心点 Y */
  centerY: number;
  /** 饼图半径 */
  radius: number;
  /** 内圆半径 (环形图) */
  innerRadius: number;
}
