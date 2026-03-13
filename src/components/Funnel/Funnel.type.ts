/**
 * 漏斗图组件类型定义
 * 用于展示业务流程中各环节的转化效率
 */

/**
 * 漏斗图数据项
 */
export interface FunnelDataItem {
  /** 环节名称 */
  label: string;
  /** 环节数值 */
  value: number;
  /** 自定义颜色 */
  color?: string;
}

/**
 * 漏斗图数据
 */
export interface FunnelChartData {
  /** 数据项数组 */
  items: FunnelDataItem[];
}

/**
 * 漏斗图标签配置
 */
export interface FunnelLabelConfig {
  /** 是否显示标签 */
  display?: boolean;
  /** 标签颜色 */
  color?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 标签格式，支持占位符: {label}, {value}, {percentage} */
  formatter?: string | ((item: FunnelDataItem, percentage: number) => string);
  /** 标签位置: left-左侧, right-右侧, inside-内部 */
  position?: 'left' | 'right' | 'inside';
}

/**
 * 转化率配置
 */
export interface FunnelConversionConfig {
  /** 是否显示转化率 */
  display?: boolean;
  /** 转化率文字颜色 */
  color?: string;
  /** 转化率字体大小 */
  fontSize?: number;
  /** 转化率前缀文字 */
  prefix?: string;
  /** 转化率后缀文字 */
  suffix?: string;
  /** 格式化函数 */
  formatter?: (rate: number) => string;
}

/**
 * 图例配置
 */
export interface FunnelLegendConfig {
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
export interface FunnelTooltipConfig {
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
    item: FunnelDataItem;
    /** 百分比 (0-100) */
    percentage: number;
    /** 转化率 (相对于上一环节，首项为100%) */
    conversionRate: number;
    /** 数据索引 */
    index: number;
  }) => React.ReactNode;
}

/**
 * 漏斗图组件属性
 */
export interface FunnelProps {
  /** 图表数据 */
  data: FunnelChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** 漏斗图占容器的比例 (0-1) */
  funnelRatio?: number;
  /** 漏斗颈宽比例 (0-1，相对于最宽处) */
  neckRatio?: number;
  /** 扇区间隙 (像素) */
  gap?: number;
  /** 标签配置 */
  label?: FunnelLabelConfig;
  /** 转化率配置 */
  conversion?: FunnelConversionConfig;
  /** 图例配置 */
  legend?: FunnelLegendConfig;
  /** 提示框配置 */
  tooltip?: FunnelTooltipConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 排序方式: desc-降序(默认), asc-升序, none-不排序 */
  sort?: 'desc' | 'asc' | 'none';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数据点击回调 */
  onDataClick?: (index: number, item: FunnelDataItem) => void;
  /** 图表渲染完成回调 */
  onChartReady?: () => void;
}

/**
 * 计算后的扇区数据
 */
export interface ComputedSlice {
  /** 数据项 */
  item: FunnelDataItem;
  /** 数据索引 */
  index: number;
  /** 百分比 (0-1) */
  percentage: number;
  /** 转化率 (相对于上一环节，首项为1) */
  conversionRate: number;
  /** 上宽 */
  topWidth: number;
  /** 下宽 */
  bottomWidth: number;
  /** Y轴起始位置 */
  y: number;
  /** 高度 */
  height: number;
  /** 中心点 X */
  centerX: number;
  /** 中心点 Y */
  centerY: number;
  /** 左侧 X 坐标 */
  leftX: number;
  /** 右侧 X 坐标 */
  rightX: number;
}

/**
 * 图表配置
 */
export interface FunnelChartConfig {
  /** 内边距 */
  padding: number;
  /** 漏斗绘制区域宽度 */
  chartWidth: number;
  /** 漏斗绘制区域高度 */
  chartHeight: number;
  /** 最大数值 */
  maxValue: number;
  /** 最小数值 */
  minValue: number;
  /** 总数值 */
  totalValue: number;
}
