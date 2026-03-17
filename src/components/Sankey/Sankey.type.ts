/**
 * 桑基图组件类型定义
 * 用于描述一组值到另一组值的流向，通常应用于能源、材料成分、金融等数据的可视化分析
 */

/**
 * 桑基图节点数据
 */
export interface SankeyNode {
  /** 节点唯一标识 */
  id: string;
  /** 节点显示名称 */
  name: string;
  /** 节点颜色 */
  color?: string;
  /** 自定义节点样式 */
  style?: React.CSSProperties;
}

/**
 * 桑基图链接数据
 */
export interface SankeyLink {
  /** 源节点 ID */
  source: string;
  /** 目标节点 ID */
  target: string;
  /** 流量值 */
  value: number;
  /** 自定义颜色（如果不设置则使用源节点颜色） */
  color?: string;
}

/**
 * 桑基图数据
 */
export interface SankeyChartData {
  /** 节点数组 */
  nodes: SankeyNode[];
  /** 链接数组 */
  links: SankeyLink[];
}

/**
 * 节点配置
 */
export interface SankeyNodeConfig {
  /** 节点宽度 */
  width?: number;
  /** 节点圆角 */
  cornerRadius?: number;
  /** 节点之间的间距 */
  padding?: number;
  /** 节点之间的间隙（像柱状图一样，默认0表示无间隙） */
  gap?: number;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
  /** 标签位置: left-左侧, right-右侧, inside-内部 */
  labelPosition?: 'left' | 'right' | 'inside';
  /** 标签格式化函数 */
  labelFormatter?: (node: SankeyNode, value: number) => string;
  /** 是否显示节点名称 */
  showName?: boolean;
  /** 是否显示节点值 */
  showValue?: boolean;
}

/**
 * 链接配置
 */
export interface SankeyLinkConfig {
  /** 链接颜色（如果不设置则使用源节点颜色） */
  color?: string;
  /** 链接透明度 (0-1) */
  opacity?: number;
  /** 链接渐变效果 */
  gradient?: boolean;
  /** 链接曲线类型 */
  curveType?: 'cubic' | 'quadratic';
  /** 链接之间的间距 */
  padding?: number;
}

/**
 * 布局配置
 */
export interface SankeyLayoutConfig {
  /** 布局方向: horizontal-水平, vertical-垂直 */
  direction?: 'horizontal' | 'vertical';
  /** 对齐方式: left-左对齐, right-右对齐, center-居中对齐, justify-两端对齐 */
  align?: 'left' | 'right' | 'center' | 'justify';
  /** 节点层间距 */
  nodePadding?: number;
  /** 迭代次数（用于优化布局） */
  iterations?: number;
}

/**
 * 提示框配置
 */
export interface SankeyTooltipConfig {
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
  /** 自定义节点提示内容渲染函数 */
  customNodeContent?: (data: {
    /** 节点数据 */
    node: SankeyNode;
    /** 输入流量总和 */
    inputValue: number;
    /** 输出流量总和 */
    outputValue: number;
  }) => React.ReactNode;
  /** 自定义链接提示内容渲染函数 */
  customLinkContent?: (data: {
    /** 链接数据 */
    link: SankeyLink;
    /** 源节点 */
    sourceNode: SankeyNode;
    /** 目标节点 */
    targetNode: SankeyNode;
    /** 占总流量的百分比 */
    percentage: number;
  }) => React.ReactNode;
}

/**
 * 图例配置
 */
export interface SankeyLegendConfig {
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
 * 动画配置
 */
export interface SankeyAnimationConfig {
  /** 是否启用动画 */
  enabled?: boolean;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 动画缓动函数 */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * 计算后的节点位置信息
 */
export interface ComputedNode extends SankeyNode {
  /** 列索引（层级） */
  column: number;
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 节点高度 */
  height: number;
  /** 输入流量总和 */
  inputValue: number;
  /** 输出流量总和 */
  outputValue: number;
  /** 源链接索引 */
  sourceLinks: ComputedLink[];
  /** 目标链接索引 */
  targetLinks: ComputedLink[];
}

/**
 * 计算后的链接路径信息
 */
export interface ComputedLink extends SankeyLink {
  /** 源节点对象 */
  sourceNode: ComputedNode;
  /** 目标节点对象 */
  targetNode: ComputedNode;
  /** 链接高度 */
  height: number;
  /** 源节点上的起始 Y 坐标 */
  sourceY: number;
  /** 目标节点上的结束 Y 坐标 */
  targetY: number;
  /** SVG 路径数据 */
  path: string;
  /** 占总流量的百分比 */
  percentage: number;
  /** 源节点 X 坐标（Canvas 用） */
  sourceX: number;
  /** 源节点上边缘 Y 坐标（Canvas 用） */
  sourceYTop: number;
  /** 源节点下边缘 Y 坐标（Canvas 用） */
  sourceYBottom: number;
  /** 目标节点 X 坐标（Canvas 用） */
  targetX: number;
  /** 目标节点上边缘 Y 坐标（Canvas 用） */
  targetYTop: number;
  /** 目标节点下边缘 Y 坐标（Canvas 用） */
  targetYBottom: number;
  /** 控制点 1 X 坐标（Canvas 用） */
  controlPoint1X: number;
  /** 控制点 2 X 坐标（Canvas 用） */
  controlPoint2X: number;
}

/**
 * 图表配置
 */
export interface SankeyChartConfig {
  padding: number;
  width: number;
  height: number;
  nodeWidth: number;
  nodePadding: number;
  linkOpacity: number;
  colors: string[];
}

/**
 * 组件属性
 */
export interface SankeyProps {
  /** 图表数据 */
  data: SankeyChartData;
  /** 容器宽度 */
  width?: number;
  /** 容器高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** 节点配置 */
  node?: SankeyNodeConfig;
  /** 链接配置 */
  link?: SankeyLinkConfig;
  /** 布局配置 */
  layout?: SankeyLayoutConfig;
  /** 提示框配置 */
  tooltip?: SankeyTooltipConfig;
  /** 图例配置 */
  legend?: SankeyLegendConfig;
  /** 动画配置 */
  animation?: SankeyAnimationConfig;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 节点点击事件 */
  onNodeClick?: (node: SankeyNode, inputValue: number, outputValue: number) => void;
  /** 链接点击事件 */
  onLinkClick?: (link: SankeyLink, sourceNode: SankeyNode, targetNode: SankeyNode) => void;
  /** 图表渲染完成回调 */
  onRenderComplete?: () => void;
}
