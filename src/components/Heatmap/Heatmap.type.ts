/**
 * 热力图组件类型定义
 */

/**
 * 热力图数据单元格
 */
export interface HeatmapCell {
  /** X轴索引 */
  x: number;
  /** Y轴索引 */
  y: number;
  /** 数值 */
  value: number;
}

/**
 * 密度数据点 - 用于密度热力图
 */
export interface DensityPoint {
  /** X轴坐标值 */
  x: number;
  /** Y轴坐标值 */
  y: number;
  /** 权重值（可选，用于加权密度计算） */
  value?: number;
}

/**
 * 层次聚类树节点
 */
export interface ClusterNode {
  /** 节点ID */
  id: number;
  /** 原始索引（叶子节点） */
  index?: number;
  /** 标签（叶子节点） */
  label?: string;
  /** 左子节点 */
  left?: ClusterNode;
  /** 右子节点 */
  right?: ClusterNode;
  /** 合并高度/距离 */
  height: number;
  /** 节点包含的原始索引列表 */
  indices: number[];
  /** 节点深度 */
  depth?: number;
  /** 节点位置（0-1 之间） */
  position?: number;
}

/**
 * 层次聚类结果
 */
export interface HierarchicalClusteringResult {
  /** 行的聚类树 */
  rowTree: ClusterNode;
  /** 列的聚类树 */
  colTree: ClusterNode;
  /** 行排序后的索引 */
  rowOrder: number[];
  /** 列排序后的索引 */
  colOrder: number[];
}

/**
 * 聚类配置
 */
export interface ClusteringConfig {
  /** 是否对行进行聚类 */
  clusterRows?: boolean;
  /** 是否对列进行聚类 */
  clusterCols?: boolean;
  /** 距离度量方法: euclidean(欧氏距离) | correlation(相关系数距离) | manhattan(曼哈顿距离) */
  distanceMetric?: 'euclidean' | 'correlation' | 'manhattan';
  /** 连接方法: single(最短距离) | complete(最长距离) | average(平均距离) | ward(Ward法) */
  linkageMethod?: 'single' | 'complete' | 'average' | 'ward';
  /** 树状图宽度（像素） */
  dendrogramWidth?: number;
  /** 树状图高度（像素） */
  dendrogramHeight?: number;
  /** 树状图线条颜色 */
  dendrogramColor?: string;
  /** 树状图线条宽度 */
  dendrogramLineWidth?: number;
  /** 是否显示行标签在树状图左侧 */
  showRowLabels?: boolean;
  /** 行标签字体大小 */
  rowLabelFontSize?: number;
  /** 行标签颜色 */
  rowLabelColor?: string;
  /** 聚类阈值（用于剪枝高亮） */
  clusterThreshold?: number;
  /** 行标签位置：left(左) | right(右，默认) */
  rowLabelPosition?: 'left' | 'right';
}

/**
 * 数据集配置
 */
export interface HeatmapDataset {
  /** 数据标签 */
  label: string;
  /** 二维数据矩阵，每个元素代表一个单元格的值 */
  data: number[][];
  /** 自定义颜色映射函数 */
  colorScale?: (value: number, min: number, max: number) => string;
}

/**
 * 图表数据
 */
export interface HeatmapChartData {
  /** X轴标签 */
  xLabels: string[];
  /** Y轴标签 */
  yLabels: string[];
  /** 数据集数组 */
  datasets: HeatmapDataset[];
  /** 密度数据点数组（用于密度热力图） */
  densityPoints?: DensityPoint[];
  /** X轴数据范围（用于密度热力图） */
  xRange?: [number, number];
  /** Y轴数据范围（用于密度热力图） */
  yRange?: [number, number];
}

/**
 * 密度热力图配置
 */
export interface DensityConfig {
  /** 网格分辨率（每行/列的单元格数量） */
  gridSize?: number;
  /** 搜索半径（用于计算密度） */
  radius?: number;
  /** 是否使用加权密度 */
  weighted?: boolean;
  /** 最小透明度 */
  minOpacity?: number;
  /** 最大透明度 */
  maxOpacity?: number;
}

/**
 * 网格线配置
 */
export interface HeatmapGridConfig {
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
export interface HeatmapAxisConfig {
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
  /** 标签旋转角度 (0-360) */
  tickRotation?: number;
}

/**
 * 颜色停止点
 */
export interface ColorStop {
  /** 位置 (0-1) */
  offset: number;
  /** 颜色值 */
  color: string;
}

/**
 * 颜色比例尺配置
 */
export interface HeatmapColorScaleConfig {
  /** 最小值对应的颜色 */
  minColor: string;
  /** 最大值对应的颜色 */
  maxColor: string;
  /** 中间值对应的颜色（可选） */
  midColor?: string;
  /** 是否使用发散型颜色比例尺（支持负值） */
  diverging?: boolean;
  /** 发散型颜色比例尺的中间颜色（用于0值） */
  neutralColor?: string;
  /** 自定义颜色停止点数组，用于多色阶渐变 */
  colorStops?: ColorStop[];
}

/**
 * 图例配置
 */
export interface HeatmapLegendConfig {
  /** 是否显示 */
  display?: boolean;
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** 是否显示数值范围 */
  showValues?: boolean;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
}

/**
 * 提示框配置
 */
export interface HeatmapTooltipConfig {
  /** 是否显示 */
  enabled?: boolean;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 标题颜色 */
  titleColor?: string;
  /** 内容颜色 */
  bodyColor?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 边框宽度 */
  borderWidth?: number;
  /** 圆角半径 */
  borderRadius?: number;
  /** 内边距 */
  padding?: number;
  /** 自定义提示框内容 */
  customContent?: (xLabel: string, yLabel: string, value: number) => string;
}

/**
 * 标签配置
 */
export interface HeatmapLabelConfig {
  /** 是否显示单元格内的数值标签 */
  display?: boolean;
  /** 字体大小 */
  fontSize?: number;
  /** 字体颜色 */
  color?: string;
  /** 格式化函数 */
  formatter?: (value: number) => string;
  /** 最小显示阈值（当单元格值大于此阈值时显示标签） */
  minDisplayValue?: number;
}

/**
 * 热力图组件属性
 */
export interface HeatmapProps {
  /** 图表数据 */
  data: HeatmapChartData;
  /** 图表宽度（像素） */
  width?: number;
  /** 图表高度（像素） */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** 颜色比例尺配置 */
  colorScale?: HeatmapColorScaleConfig;
  /** X轴配置 */
  xAxis?: HeatmapAxisConfig;
  /** Y轴配置 */
  yAxis?: HeatmapAxisConfig;
  /** 网格线配置 */
  grid?: HeatmapGridConfig;
  /** 图例配置 */
  legend?: HeatmapLegendConfig;
  /** 提示框配置 */
  tooltip?: HeatmapTooltipConfig;
  /** 单元格标签配置 */
  cellLabels?: HeatmapLabelConfig;
  /** 单元格圆角半径 */
  borderRadius?: number;
  /** 单元格间距 */
  cellSpacing?: number;
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  /** 是否开启动画 */
  animationEnabled?: boolean;
  /** 是否启用密度热力图模式 */
  densityMode?: boolean;
  /** 密度热力图配置 */
  densityConfig?: DensityConfig;
  /** 是否启用聚类热力图模式 */
  clusteringMode?: boolean;
  /** 聚类配置 */
  clusteringConfig?: ClusteringConfig;
  /** 预计算的聚类结果（可选，用于外部控制） */
  precomputedClustering?: HierarchicalClusteringResult;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 点击单元格回调 */
  onCellClick?: (xIndex: number, yIndex: number, value: number) => void;
  /** 点击密度区域回调 */
  onDensityClick?: (x: number, y: number, density: number) => void;
  /** 聚类完成回调 */
  onClusteringComplete?: (result: HierarchicalClusteringResult) => void;
}

/**
 * 图表配置（内部计算使用）
 */
export interface HeatmapChartConfig {
  padding: number;
  chartWidth: number;
  chartHeight: number;
  cellWidth: number;
  cellHeight: number;
  minValue: number;
  maxValue: number;
  valueRange: number;
  /** 左侧布局偏移量（用于聚类模式的树状图） */
  leftOffset?: number;
  /** 顶部布局偏移量（用于聚类模式的树状图） */
  topOffset?: number;
  /** 有效左侧内边距（聚类模式下为0，非聚类模式下为padding） */
  effectivePaddingLeft?: number;
  /** 有效顶部内边距（聚类模式下为0，非聚类模式下为padding） */
  effectivePaddingTop?: number;
}

/**
 * 计算后的单元格信息
 */
export interface ComputedCell {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  color: string;
  xLabel: string;
  yLabel: string;
  xIndex: number;
  yIndex: number;
}

/**
 * 提示框状态
 */
export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  xLabel: string;
  yLabel: string;
  value: number;
  color: string;
}
