/**
 * 股票图组件类型定义
 * 用于展示金融市场中证券（如股票、期货、外汇等）价格走势及相关交易数据的专业图表
 */

/**
 * K线数据点
 * 包含开盘价、最高价、最低价、收盘价、成交量等关键交易数据
 */
export interface StockDataPoint {
  /** 时间戳（毫秒） */
  timestamp: number;
  /** 开盘价 */
  open: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 收盘价 */
  close: number;
  /** 成交量 */
  volume?: number;
  /** 成交额 */
  turnover?: number;
  /** 涨跌幅（百分比） */
  change?: number;
  /** 涨跌额 */
  changeAmount?: number;
  /** 自定义数据 */
  [key: string]: unknown;
}

/**
 * 股票图数据
 */
export interface StockChartData {
  /** K线数据数组 */
  data: StockDataPoint[];
  /** 股票名称 */
  name?: string;
  /** 股票代码 */
  code?: string;
  /** 市场类型 */
  market?: string;
}

/**
 * 移动平均线配置
 */
export interface MovingAverageConfig {
  /** 是否显示移动平均线 */
  visible?: boolean;
  /** 周期数组，如 [5, 10, 20, 60] */
  periods?: number[];
  /** 线条颜色数组 */
  colors?: string[];
  /** 线条宽度 */
  lineWidth?: number;
}

/**
 * 成交量配置
 */
export interface VolumeConfig {
  /** 是否显示成交量 */
  visible?: boolean;
  /** 成交量区域高度占比（相对于主图） */
  heightRatio?: number;
  /** 上涨颜色 */
  upColor?: string;
  /** 下跌颜色 */
  downColor?: string;
  /** 柱子宽度比例 (0-1) */
  barWidthRatio?: number;
}

/**
 * K线样式配置
 */
export interface CandlestickConfig {
  /** 上涨颜色 */
  upColor?: string;
  /** 下跌颜色 */
  downColor?: string;
  /** 实体宽度比例 (0-1) */
  barWidthRatio?: number;
  /** 是否显示影线 */
  showWick?: boolean;
  /** 影线宽度 */
  wickWidth?: number;
}

/**
 * 网格配置
 */
export interface GridConfig {
  /** 是否显示网格 */
  visible?: boolean;
  /** 水平网格线数量 */
  horizontalLines?: number;
  /** 垂直网格线数量 */
  verticalLines?: number;
  /** 网格线颜色 */
  lineColor?: string;
  /** 网格线类型: solid-实线, dashed-虚线, dotted-点线 */
  lineType?: 'solid' | 'dashed' | 'dotted';
}

/**
 * X轴配置
 */
export interface XAxisConfig {
  /** 是否显示 */
  visible?: boolean;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
  /** 日期格式化 */
  dateFormatter?: (timestamp: number) => string;
  /** 显示的标签数量 */
  maxLabels?: number;
}

/**
 * Y轴配置
 */
export interface YAxisConfig {
  /** 是否显示 */
  visible?: boolean;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
  /** 价格格式化 */
  priceFormatter?: (price: number) => string;
  /** 显示位置: left-左侧, right-右侧 */
  position?: 'left' | 'right';
  /** 是否显示零线 */
  showZeroLine?: boolean;
}

/**
 * 坐标轴配置
 */
export interface AxisConfig {
  /** X轴配置 */
  x?: XAxisConfig;
  /** Y轴配置 */
  y?: YAxisConfig;
}

/**
 * 提示框配置
 */
export interface TooltipConfig {
  /** 是否显示提示框 */
  visible?: boolean;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 标题颜色 */
  titleColor?: string;
  /** 文本颜色 */
  textColor?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 是否显示开盘价 */
  showOpen?: boolean;
  /** 是否显示最高价 */
  showHigh?: boolean;
  /** 是否显示最低价 */
  showLow?: boolean;
  /** 是否显示收盘价 */
  showClose?: boolean;
  /** 是否显示涨跌幅 */
  showChange?: boolean;
  /** 是否显示成交量 */
  showVolume?: boolean;
}

/**
 * 十字光标配置
 */
export interface CrosshairConfig {
  /** 是否显示十字光标 */
  visible?: boolean;
  /** 水平线颜色 */
  horizontalColor?: string;
  /** 垂直线颜色 */
  verticalColor?: string;
  /** 线型: solid-实线, dashed-虚线, dotted-点线 */
  lineType?: 'solid' | 'dashed' | 'dotted';
  /** 标签背景颜色 */
  labelBackground?: string;
  /** 标签文字颜色 */
  labelColor?: string;
}

/**
 * 缩放和平移配置
 */
export interface InteractionConfig {
  /** 是否启用缩放 */
  zoomEnabled?: boolean;
  /** 最小显示数据点数 */
  minDataPoints?: number;
  /** 最大显示数据点数 */
  maxDataPoints?: number;
  /** 是否启用平移 */
  panEnabled?: boolean;
  /** 默认显示的数据点数 */
  defaultDataPoints?: number;
}

/**
 * 技术指标配置
 */
export interface TechnicalIndicatorConfig {
  /** MACD配置 */
  macd?: {
    visible?: boolean;
    fastPeriod?: number;
    slowPeriod?: number;
    signalPeriod?: number;
  };
  /** RSI配置 */
  rsi?: {
    visible?: boolean;
    period?: number;
  };
  /** KDJ配置 */
  kdj?: {
    visible?: boolean;
    kPeriod?: number;
    dPeriod?: number;
    jPeriod?: number;
  };
}

/**
 * 图表配置
 */
export interface StockChartConfig {
  /** 内边距 */
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  /** 背景颜色 */
  backgroundColor?: string;
  /** K线样式 */
  candlestick?: CandlestickConfig;
  /** 成交量配置 */
  volume?: VolumeConfig;
  /** 移动平均线配置 */
  movingAverage?: MovingAverageConfig;
  /** 网格配置 */
  grid?: GridConfig;
  /** 坐标轴配置 */
  axis?: AxisConfig;
  /** 提示框配置 */
  tooltip?: TooltipConfig;
  /** 十字光标配置 */
  crosshair?: CrosshairConfig;
  /** 交互配置 */
  interaction?: InteractionConfig;
  /** 技术指标配置 */
  indicator?: TechnicalIndicatorConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
}

/**
 * 计算后的K线数据
 */
export interface ComputedCandle {
  /** 原始数据索引 */
  index: number;
  /** X坐标 */
  x: number;
  /** 开盘价Y坐标 */
  openY: number;
  /** 收盘价Y坐标 */
  closeY: number;
  /** 最高价Y坐标 */
  highY: number;
  /** 最低价Y坐标 */
  lowY: number;
  /** 是否上涨 */
  isUp: boolean;
  /** 实体高度 */
  bodyHeight: number;
  /** K线宽度 */
  width: number;
  /** 原始数据 */
  data: StockDataPoint;
}

/**
 * 移动平均线数据点
 */
export interface MovingAveragePoint {
  /** 时间戳 */
  timestamp: number;
  /** 平均值 */
  value: number;
  /** X坐标 */
  x: number;
  /** Y坐标 */
  y: number;
}

/**
 * 计算后的布局数据
 */
export interface ComputedLayout {
  /** 主图区域 */
  mainChart: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** 成交量区域 */
  volumeChart?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** 价格范围 */
  priceRange: {
    min: number;
    max: number;
  };
  /** 可见数据索引范围 */
  visibleRange: {
    start: number;
    end: number;
  };
  /** K线计算数据 */
  candles: ComputedCandle[];
  /** 移动平均线数据 */
  movingAverages: Map<number, MovingAveragePoint[]>;
}

/**
 * 股票图组件属性
 */
export interface StockProps {
  /** 图表数据 */
  data: StockChartData;
  /** 图表配置 */
  config?: StockChartConfig;
  /** 容器宽度 */
  width?: number;
  /** 容器高度 */
  height?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 数据点点击事件 */
  onDataClick?: (data: StockDataPoint, index: number) => void;
  /** 可见范围变化事件 */
  onVisibleRangeChange?: (range: { start: number; end: number }) => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 时间范围类型
 */
export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL';

/**
 * 图表类型
 */
export type ChartType = 'candlestick' | 'line' | 'area';
