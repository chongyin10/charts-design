/**
 * 瀑布图组件类型定义
 * 瀑布图（Waterfall Chart）用于展示数据从初始值到最终值的演变过程及各因素影响
 */

/**
 * 瀑布图数据项
 */
export interface WaterfallDataItem {
  /** 数据项标签 */
  label: string;
  /** 数据值 */
  value: number;
  /** 是否为总计项（true时显示为完整柱形，不从之前的累计值开始） */
  isTotal?: boolean;
  /** 自定义颜色（可选） */
  color?: string;
}

/**
 * 瀑布图数据
 */
export interface WaterfallChartData {
  /** 数据项数组 */
  items: WaterfallDataItem[];
}

/**
 * 网格线配置
 */
export interface WaterfallGridConfig {
  /** 是否显示网格线 */
  display?: boolean;
  /** 网格线颜色 */
  color?: string;
  /** 网格线宽度 */
  lineWidth?: number;
  /** 网格线透明度 (0-1) */
  opacity?: number;
}

/**
 * 坐标轴配置
 */
export interface WaterfallAxisConfig {
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
  /** 最小值（默认为自动计算） */
  min?: number;
  /** 最大值（默认为自动计算） */
  max?: number;
  /** 网格线配置 */
  grid?: WaterfallGridConfig;
  /** 标签间隔，每 n 个标签显示一个（默认为1，显示所有标签） */
  tickInterval?: number;
}

/**
 * 图例配置
 */
export interface WaterfallLegendConfig {
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
export interface WaterfallTooltipConfig {
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
    /** 当前悬停的数据索引 */
    dataIndex: number;
    /** X轴标签 */
    label: string;
    /** 数据项 */
    item: WaterfallDataItem;
    /** 累计值 */
    cumulative: number;
    /** 前一个累计值 */
    previousCumulative: number;
  }) => React.ReactNode;
}

/**
 * 连接线配置
 */
export interface WaterfallConnectorConfig {
  /** 是否显示连接线 */
  display?: boolean;
  /** 连接线颜色 */
  color?: string;
  /** 连接线宽度 */
  width?: number;
  /** 连接线样式（虚线） */
  dash?: number[];
}

/**
 * 柱体配置
 */
export interface WaterfallColumnConfig {
  /** 柱体宽度 (0-1，相对于分类宽度的比例) */
  width?: number;
  /** 柱体圆角半径 */
  borderRadius?: number | number[];
  /** 正值柱体颜色（增长） */
  positiveColor?: string;
  /** 负值柱体颜色（衰减） */
  negativeColor?: string;
  /** 总计柱体颜色 */
  totalColor?: string;
}

/**
 * 标签配置
 */
export interface WaterfallLabelConfig {
  /** 是否显示数值标签 */
  display?: boolean;
  /** 标签颜色 */
  color?: string;
  /** 标签字体大小 */
  fontSize?: number;
  /** 标签位置：内部或外部 */
  position?: 'inside' | 'outside';
  /** 数值格式化函数 */
  formatter?: (value: number) => string;
}

/**
 * 瀑布图组件属性
 */
export interface WaterfallProps {
  /** 图表数据 */
  data: WaterfallChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** X轴配置 */
  xAxis?: WaterfallAxisConfig;
  /** Y轴配置 */
  yAxis?: WaterfallAxisConfig;
  /** 图例配置 */
  legend?: WaterfallLegendConfig;
  /** 提示框配置 */
  tooltip?: WaterfallTooltipConfig;
  /** 连接线配置 */
  connector?: WaterfallConnectorConfig;
  /** 柱体配置 */
  column?: WaterfallColumnConfig;
  /** 标签配置 */
  label?: WaterfallLabelConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数据点击回调 */
  onDataClick?: (index: number, item: WaterfallDataItem, cumulative: number) => void;
  /** 图表渲染完成回调 */
  onChartReady?: () => void;
}

/**
 * 计算后的柱体数据
 */
export interface ComputedWaterfallColumn {
  x: number;
  y: number;
  width: number;
  height: number;
  /** 柱体起始值（底部） */
  fromValue: number;
  /** 柱体结束值（顶部） */
  toValue: number;
  value: number;
  label: string;
  index: number;
  color: string;
  /** 是否为总计项 */
  isTotal: boolean;
  /** 累计值 */
  cumulative: number;
}

/**
 * 图表配置
 */
export interface WaterfallChartConfig {
  padding: number;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  minValue: number;
  valueRange: number;
}

/**
 * Tooltip 数据
 */
export interface WaterfallTooltipData {
  x: number;
  y: number;
  index: number;
  item: WaterfallDataItem;
  cumulative: number;
  previousCumulative: number;
  color: string;
}
