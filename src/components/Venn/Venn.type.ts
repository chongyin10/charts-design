/**
 * 韦恩图组件类型定义
 * 用于展示集合之间的交集、并集等关系
 */

/**
 * 集合数据项
 */
export interface VennSet {
  /** 集合名称 */
  name: string;
  /** 集合值（仅用于显示） */
  value?: number;
  /** 自定义颜色 */
  color?: string;
}

/**
 * 交集数据项
 */
export interface VennIntersection {
  /** 参与交集的集合名称数组，如 ['A', 'B'] 表示 A&B */
  sets: string[];
  /** 交集的值（用于显示和 tooltip） */
  value?: number;
  /** 自定义颜色（可选，默认会自动计算混合色） */
  color?: string;
  /** 交集标签（可选） */
  label?: string;
}

/**
 * 韦恩图数据
 */
export interface VennData {
  /** 集合数组 */
  sets: VennSet[];
  /** 交集数组（可选） */
  intersections?: VennIntersection[];
}

/**
 * 图例配置
 */
export interface VennLegendConfig {
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
export interface VennTooltipConfig {
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
    /** 区域类型: 'set' | 'intersection' */
    type: 'set' | 'intersection';
    /** 集合或交集名称 */
    name: string;
    /** 值 */
    value?: number;
    /** 涉及的集合 */
    sets: string[];
  }) => React.ReactNode;
}

/**
 * 标签配置
 */
export interface VennLabelConfig {
  /** 是否显示标签 */
  display?: boolean;
  /** 标签颜色 */
  color?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 标签格式，支持占位符: {name}, {value} */
  formatter?: string | ((name: string, value?: number) => string);
}

/**
 * 韦恩图配置
 */
export interface VennConfig {
  /** 内边距 */
  padding?: number;
  /** 圆的半径（相对于容器大小的比例，0-1之间） */
  radius?: number;
  /** 不透明度 (0-1) */
  opacity?: number;
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  /** 标签配置 */
  label?: VennLabelConfig;
  /** 图例配置 */
  legend?: VennLegendConfig;
  /** 提示框配置 */
  tooltip?: VennTooltipConfig;
}

/**
 * 韦恩图组件属性
 */
export interface VennProps {
  /** 图表数据 */
  data: VennData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 图表配置 */
  config?: VennConfig;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 点击事件回调 */
  onClick?: (data: {
    type: 'set' | 'intersection';
    name: string;
    value?: number;
    sets: string[];
  }) => void;
  /** 鼠标移入事件回调 */
  onMouseEnter?: (data: {
    type: 'set' | 'intersection';
    name: string;
    value?: number;
    sets: string[];
  }) => void;
  /** 鼠标移出事件回调 */
  onMouseLeave?: () => void;
}

/**
 * 计算后的圆配置
 */
export interface ComputedCircle {
  /** 圆心 X 坐标 */
  cx: number;
  /** 圆心 Y 坐标 */
  cy: number;
  /** 半径 */
  r: number;
  /** 集合名称 */
  name: string;
  /** 颜色 */
  color: string;
  /** 值 */
  value?: number;
}

/**
 * 计算后的交集配置
 */
export interface ComputedIntersection {
  /** 路径数据（SVG path） */
  path: string;
  /** 交集涉及的集合 */
  sets: string[];
  /** 颜色 */
  color: string;
  /** 标签 */
  label: string;
  /** 值 */
  value?: number;
  /** 中心点坐标（用于放置标签） */
  centerX: number;
  centerY: number;
}
