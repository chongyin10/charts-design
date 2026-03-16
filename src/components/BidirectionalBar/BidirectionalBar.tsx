/**
 * 对称条形图（BidirectionalBar）组件
 * 以坐标轴为中心，向左右两侧延伸条形的图表类型
 * 用于展示正负值数据或双向对比关系
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  BidirectionalBarProps,
  BidirectionalBarChartData,
  BidirectionalBarSignedData,
  BidirectionalBarMirrorData,
  BidirectionalBarChartConfig,
  ComputedBidirectionalBar,
  BidirectionalBarDataset,
  BidirectionalBarConfig,
  BidirectionalBarTooltipItem,
} from './BidirectionalBar.type';

/**
 * 默认配置
 */
const DEFAULT_COLORS = {
  left: '#ef4444', // red - 默认左侧颜色
  right: '#3b82f6', // blue - 默认右侧颜色
};

const DEFAULT_CONFIG = {
  padding: 60,
  borderWidth: 0,
  borderRadius: 4,
  animationDuration: 1000,
  gridColor: '#e5e7eb',
  textColor: '#6b7280',
  axisColor: '#d1d5db',
  tooltipBackground: '#ffffff',
  tooltipTitleColor: '#111827',
  tooltipBodyColor: '#374151',
  fontSize: 12,
  titleFontSize: 14,
  barHeight: 0.7,
  barSpacing: 4,
};

/**
 * 计算图表配置（左右分离模式）
 */
const calculateSplitChartConfig = (
  data: BidirectionalBarChartData,
  width: number,
  height: number,
  padding: number,
  xAxisMin?: number,
  xAxisMax?: number
): BidirectionalBarChartConfig => {
  const leftValues = data.leftData.data;
  const rightValues = data.rightData.data;

  // 计算左右两侧的最大值
  const leftMaxValue = xAxisMax ?? Math.max(...leftValues, 0);
  const rightMaxValue = xAxisMax ?? Math.max(...rightValues, 0);

  const leftValueRange = leftMaxValue || 1;
  const rightValueRange = rightMaxValue || 1;

  // 中心轴位置：图表中心
  const centerX = width / 2;

  return {
    padding,
    chartWidth: width - padding * 2,
    chartHeight: height - padding * 2,
    leftMaxValue,
    rightMaxValue,
    leftValueRange,
    rightValueRange,
    centerX,
  };
};

/**
 * 计算图表配置（正负值模式）
 */
const calculateSignedChartConfig = (
  data: BidirectionalBarSignedData,
  width: number,
  height: number,
  padding: number,
  xAxisMin?: number,
  xAxisMax?: number
): BidirectionalBarChartConfig => {
  // 计算所有数据的正负最大绝对值
  const allValues = data.datasets.flatMap((d) => d.data);
  const positiveMax = Math.max(...allValues.filter((v) => v >= 0), 0);
  const negativeMax = Math.max(...allValues.filter((v) => v < 0).map((v) => Math.abs(v)), 0);

  const leftMaxValue = xAxisMax ?? Math.max(negativeMax, 0);
  const rightMaxValue = xAxisMax ?? Math.max(positiveMax, 0);

  const leftValueRange = leftMaxValue || 1;
  const rightValueRange = rightMaxValue || 1;

  // 中心轴位置：图表中心
  const centerX = width / 2;

  return {
    padding,
    chartWidth: width - padding * 2,
    chartHeight: height - padding * 2,
    leftMaxValue,
    rightMaxValue,
    leftValueRange,
    rightValueRange,
    centerX,
  };
};

/**
 * 计算图表配置（镜像模式）
 * 标签在中间，左右两侧各自有独立的坐标轴
 */
const calculateMirrorChartConfig = (
  data: BidirectionalBarMirrorData,
  width: number,
  height: number,
  padding: number,
  xAxisMin?: number,
  xAxisMax?: number
): BidirectionalBarChartConfig => {
  const leftValues = data.leftData.data;
  const rightValues = data.rightData.data;

  // 计算左右两侧的最大值
  const leftMaxValue = xAxisMax ?? Math.max(...leftValues, 0);
  const rightMaxValue = xAxisMax ?? Math.max(...rightValues, 0);

  const leftValueRange = leftMaxValue || 1;
  const rightValueRange = rightMaxValue || 1;

  // 中心轴位置：图表中心
  const centerX = width / 2;

  return {
    padding,
    chartWidth: width - padding * 2,
    chartHeight: height - padding * 2,
    leftMaxValue,
    rightMaxValue,
    leftValueRange,
    rightValueRange,
    centerX,
  };
};

/**
 * 计算条形数据（左右分离模式）
 */
const computeSplitBars = (
  data: BidirectionalBarChartData,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  barHeight: number
): ComputedBidirectionalBar[] => {
  const { padding, chartHeight, centerX, leftValueRange, rightValueRange } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const categoryHeight = chartHeight / categoryCount;
  const effectiveBarHeight = categoryHeight * barHeight;

  const bars: ComputedBidirectionalBar[] = [];

  // 左侧条形
  const leftColor = data.leftData.backgroundColor || DEFAULT_COLORS.left;
  data.leftData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / leftValueRange;
    const barWidth = (normalizedValue * (centerX - padding)) || 0;
    const barX = centerX - barWidth;
    const barY = padding + index * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;

    bars.push({
      x: barX,
      y: barY,
      width: barWidth,
      height: effectiveBarHeight,
      value,
      label: data.labels[index] || '',
      direction: 'left',
      dataIndex: index,
      color: leftColor,
    });
  });

  // 右侧条形
  const rightColor = data.rightData.backgroundColor || DEFAULT_COLORS.right;
  data.rightData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / rightValueRange;
    const barWidth = (normalizedValue * (width - padding - centerX)) || 0;
    const barX = centerX;
    const barY = padding + index * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;

    bars.push({
      x: barX,
      y: barY,
      width: barWidth,
      height: effectiveBarHeight,
      value,
      label: data.labels[index] || '',
      direction: 'right',
      dataIndex: index,
      color: rightColor,
    });
  });

  return bars;
};

/**
 * 计算条形数据（正负值模式）
 */
const computeSignedBars = (
  data: BidirectionalBarSignedData,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  barHeight: number,
  barSpacing: number
): ComputedBidirectionalBar[][] => {
  const { padding, chartHeight, centerX, leftValueRange, rightValueRange } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const datasetCount = data.datasets.length;
  const categoryHeight = chartHeight / categoryCount;
  const groupHeight = categoryHeight * barHeight;
  const singleBarHeight = (groupHeight - (datasetCount - 1) * barSpacing) / datasetCount;

  return data.datasets.map((dataset, datasetIndex) => {
    const color = dataset.backgroundColor || DEFAULT_COLORS.right;

    return dataset.data.map((value, dataIndex) => {
      const isNegative = value < 0;
      const normalizedValue = Math.abs(value) / (isNegative ? leftValueRange : rightValueRange);
      const barWidth = isNegative
        ? normalizedValue * (centerX - padding)
        : normalizedValue * (width - padding - centerX);
      const barX = isNegative ? centerX - barWidth : centerX;
      const groupStartY = padding + dataIndex * categoryHeight + (categoryHeight - groupHeight) / 2;
      const barY = groupStartY + datasetIndex * (singleBarHeight + barSpacing);

      return {
        x: barX,
        y: barY,
        width: barWidth || 0,
        height: singleBarHeight,
        value,
        label: data.labels[dataIndex] || '',
        direction: isNegative ? 'left' : 'right',
        dataIndex,
        color,
      };
    });
  });
};

/**
 * 计算条形数据（镜像模式）
 * 标签在中间，左右两侧分别显示不同的数值
 */
const computeMirrorBars = (
  data: BidirectionalBarMirrorData,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  barHeight: number
): ComputedBidirectionalBar[] => {
  const { padding, chartHeight, centerX, leftValueRange, rightValueRange } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const categoryHeight = chartHeight / categoryCount;
  const effectiveBarHeight = categoryHeight * barHeight;

  const bars: ComputedBidirectionalBar[] = [];

  // 中间标签区域宽度（左右条形之间的间隙）
  const labelGap = 80;
  const halfLabelGap = labelGap / 2;

  // 左侧条形 - 从中心左侧向左延伸，留出中间间隙
  const leftColor = data.leftData.backgroundColor || DEFAULT_COLORS.left;
  data.leftData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / leftValueRange;
    const availableWidth = centerX - padding - halfLabelGap;
    const barWidth = (normalizedValue * availableWidth) || 0;
    const barX = centerX - halfLabelGap - barWidth;
    const barY = padding + index * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;

    bars.push({
      x: barX,
      y: barY,
      width: barWidth,
      height: effectiveBarHeight,
      value,
      label: data.labels[index] || '',
      direction: 'left',
      dataIndex: index,
      color: leftColor,
    });
  });

  // 右侧条形 - 从中心右侧向右延伸，留出中间间隙
  const rightColor = data.rightData.backgroundColor || DEFAULT_COLORS.right;
  data.rightData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / rightValueRange;
    const availableWidth = width - padding - centerX - halfLabelGap;
    const barWidth = (normalizedValue * availableWidth) || 0;
    const barX = centerX + halfLabelGap;
    const barY = padding + index * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;

    bars.push({
      x: barX,
      y: barY,
      width: barWidth,
      height: effectiveBarHeight,
      value,
      label: data.labels[index] || '',
      direction: 'right',
      dataIndex: index,
      color: rightColor,
    });
  });

  return bars;
};

/**
 * 绘制圆角矩形
 */
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[]
): void => {
  let tl: number, tr: number, br: number, bl: number;

  if (Array.isArray(radius)) {
    [tl, tr, br, bl] = radius;
  } else {
    tl = tr = br = bl = radius;
  }

  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
};

/**
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  labels: string[],
  textColor: string,
  fontSize: number,
  xAxisTitle?: string,
  yAxisTitle?: string,
  xAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
  yAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
  yAxisTickInterval?: number,
  isMirrorMode?: boolean
): void => {
  const { padding, chartHeight, centerX, leftMaxValue, rightMaxValue } = config;

  const showGrid = xAxisGrid?.display !== false || yAxisGrid?.display !== false;
  const defaultGridColor = '#e5e7eb';
  const defaultLineWidth = 1;
  const defaultOpacity = 1;

  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;

  // 绘制 Y 轴标签（分类标签）
  const categoryHeight = chartHeight / Math.max(1, labels.length);
  const tickInterval = Math.max(1, yAxisTickInterval || 1);

  // 镜像模式下，标签显示在中心轴位置
  if (isMirrorMode) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    labels.forEach((label, index) => {
      if (index % tickInterval !== 0) return;
      const y = padding + index * categoryHeight + categoryHeight / 2;
      ctx.fillText(label, centerX, y);
    });
  } else {
    // 普通模式下，标签显示在左侧
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    labels.forEach((label, index) => {
      if (index % tickInterval !== 0) return;
      const y = padding + index * categoryHeight + categoryHeight / 2;
      ctx.fillText(label, padding - 8, y);
    });
  }

  // 绘制 X 轴标签（数值标签）- 左右对称
  const xGridCount = 5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // 计算对称刻度的最大基准值（取左右最大值的较大者）
  const maxValue = Math.max(leftMaxValue, rightMaxValue);
  // 计算美观的刻度间隔（向上取整到合适的整数）
  const rawStep = maxValue / xGridCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalizedStep = rawStep / magnitude;
  let step: number;
  if (normalizedStep <= 1) step = magnitude;
  else if (normalizedStep <= 2) step = 2 * magnitude;
  else if (normalizedStep <= 5) step = 5 * magnitude;
  else step = 10 * magnitude;

  // 镜像模式下中间的 labels 区域宽度
  const labelGap = isMirrorMode ? 80 : 0;
  const halfLabelGap = labelGap / 2;

  // 左侧标签（从中心轴向外：0 -> step -> 2*step ...）
  for (let i = 0; i <= xGridCount; i++) {
    const ratio = i / xGridCount;
    // 镜像模式下，从中心左侧留出 labelGap 空间开始绘制，0 刻度在 labels 左边缘
    const x = isMirrorMode
      ? centerX - halfLabelGap - ratio * (centerX - halfLabelGap - padding)
      : centerX - ratio * (centerX - padding);
    const value = i * step;
    ctx.fillText(value.toString(), x, height - padding + 8);
  }

  // 右侧标签（从中心轴向外：0 -> step -> 2*step ...）
  for (let i = 0; i <= xGridCount; i++) {
    const ratio = i / xGridCount;
    // 镜像模式下，从中心右侧留出 labelGap 空间开始绘制，0 刻度在 labels 右边缘
    const x = isMirrorMode
      ? centerX + halfLabelGap + ratio * (width - padding - centerX - halfLabelGap)
      : centerX + ratio * (width - padding - centerX);
    const value = i * step;
    ctx.fillText(value.toString(), x, height - padding + 8);
  }

  // 绘制水平网格线
  const showHorizontalGrid = yAxisGrid?.horizontal !== false && showGrid;
  if (showHorizontalGrid) {
    ctx.save();
    ctx.strokeStyle = yAxisGrid?.color || defaultGridColor;
    ctx.lineWidth = yAxisGrid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = yAxisGrid?.opacity ?? defaultOpacity;

    // 镜像模式下中间的 labels 区域宽度
    const labelGap = isMirrorMode ? 80 : 0;
    const halfLabelGap = labelGap / 2;

    labels.forEach((_, index) => {
      const y = padding + index * categoryHeight;
      ctx.beginPath();
      if (isMirrorMode) {
        // 镜像模式下，水平网格线分成两段，中间留出 labels 区域
        ctx.moveTo(padding, y);
        ctx.lineTo(centerX - halfLabelGap, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + halfLabelGap, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      } else {
        // 普通模式，水平网格线贯穿整个图表
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // 绘制垂直网格线
  const showVerticalGrid = xAxisGrid?.vertical !== false && showGrid;
  if (showVerticalGrid) {
    ctx.save();
    ctx.strokeStyle = xAxisGrid?.color || yAxisGrid?.color || defaultGridColor;
    ctx.lineWidth = xAxisGrid?.lineWidth || yAxisGrid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = xAxisGrid?.opacity ?? yAxisGrid?.opacity ?? defaultOpacity;

    // 镜像模式下中间的 labels 区域宽度
    const labelGap = isMirrorMode ? 80 : 0;
    const halfLabelGap = labelGap / 2;

    // 左侧垂直网格线
    for (let i = 0; i <= xGridCount; i++) {
      const ratio = i / xGridCount;
      // 镜像模式下，从中心左侧留出 labelGap 空间开始绘制
      const x = isMirrorMode
        ? centerX - halfLabelGap - ratio * (centerX - halfLabelGap - padding)
        : centerX - ratio * (centerX - padding);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // 右侧垂直网格线
    for (let i = 0; i <= xGridCount; i++) {
      const ratio = i / xGridCount;
      // 镜像模式下，从中心右侧留出 labelGap 空间开始绘制
      const x = isMirrorMode
        ? centerX + halfLabelGap + ratio * (width - padding - centerX - halfLabelGap)
        : centerX + ratio * (width - padding - centerX);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 绘制轴标题
  if (xAxisTitle) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillText(xAxisTitle, width / 2, height - 15);
    ctx.restore();
  }

  if (yAxisTitle) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillText(yAxisTitle, padding, padding - 10);
    ctx.restore();
  }
};

/**
 * 绘制坐标轴
 */
const drawAxes = (
  ctx: CanvasRenderingContext2D,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  axisColor: string
): void => {
  const { padding, centerX } = config;

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 2;

  // X 轴
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // 中心轴（Y轴）
  ctx.beginPath();
  ctx.moveTo(centerX, padding);
  ctx.lineTo(centerX, height - padding);
  ctx.stroke();

  // 左边界
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();

  // 右边界
  ctx.beginPath();
  ctx.moveTo(width - padding, padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
};

/**
 * 绘制条形
 */
const drawBar = (
  ctx: CanvasRenderingContext2D,
  bar: ComputedBidirectionalBar,
  animationProgress: number,
  borderRadius: number | number[],
  centerX: number,
  isMirrorMode?: boolean
): void => {
  const animatedWidth = bar.width * animationProgress;
  let animatedX: number;

  if (isMirrorMode) {
    // 镜像模式：条形从实际位置开始（已经在 computeMirrorBars 中计算好）
    animatedX = bar.x;
  } else {
    // 普通模式：左侧条形从中心轴向左延伸，右侧从中心轴向右延伸
    if (bar.direction === 'left') {
      animatedX = centerX - animatedWidth;
    } else {
      animatedX = centerX;
    }
  }

  ctx.fillStyle = bar.color;
  drawRoundedRect(ctx, animatedX, bar.y, animatedWidth, bar.height, borderRadius);
  ctx.fill();
};

/**
 * 绘制数据标签
 */
const drawDataLabels = (
  ctx: CanvasRenderingContext2D,
  bars: ComputedBidirectionalBar[],
  animationProgress: number,
  dataLabelConfig: BidirectionalBarConfig['dataLabel'],
  defaultTextColor: string,
  defaultFontSize: number,
  centerX: number
): void => {
  if (!dataLabelConfig?.display) return;

  const color = dataLabelConfig.color || defaultTextColor;
  const fontSize = dataLabelConfig.fontSize || defaultFontSize;
  const offset = dataLabelConfig.offset ?? 6;
  const formatter = dataLabelConfig.formatter || ((value: number) => value.toString());

  ctx.fillStyle = color;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'middle';

  bars.forEach((bar) => {
    if (animationProgress < 1) return;

    const text = formatter(bar.value);
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;

    let labelX: number;
    if (bar.direction === 'left') {
      // 左侧条形：标签显示在条形左侧
      labelX = bar.x - offset - textWidth;
      ctx.textAlign = 'right';
    } else {
      // 右侧条形：标签显示在条形右侧
      labelX = bar.x + bar.width + offset;
      ctx.textAlign = 'left';
    }

    const labelY = bar.y + bar.height / 2;
    ctx.fillText(text, labelX, labelY);
  });
};

/**
 * 绘制高亮条形
 */
const drawHighlightedBar = (
  ctx: CanvasRenderingContext2D,
  bar: ComputedBidirectionalBar,
  borderRadius: number | number[]
): void => {
  ctx.save();
  ctx.fillStyle = bar.color;
  ctx.globalAlpha = 0.9;
  drawRoundedRect(ctx, bar.x, bar.y, bar.width, bar.height, borderRadius);
  ctx.fill();

  // 添加白色边框效果
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
};

/**
 * 对称条形图组件
 */
export const BidirectionalBar: React.FC<BidirectionalBarProps> = ({
  data,
  signedData,
  mirrorData,
  width = 600,
  height = 400,
  padding = DEFAULT_CONFIG.padding,
  xAxis,
  yAxis,
  legend,
  tooltip,
  bar,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  mode = 'split',
  className,
  style,
  onDataClick,
  onChartReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<ComputedBidirectionalBar | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);
  const barsRef = useRef<ComputedBidirectionalBar[]>([]);

  // 计算图表配置
  const chartConfig = useMemo(() => {
    if (mode === 'signed' && signedData) {
      return calculateSignedChartConfig(signedData, width, height, padding, xAxis?.min, xAxis?.max);
    } else if (mode === 'mirror' && mirrorData) {
      return calculateMirrorChartConfig(mirrorData, width, height, padding, xAxis?.min, xAxis?.max);
    } else if (data) {
      return calculateSplitChartConfig(data, width, height, padding, xAxis?.min, xAxis?.max);
    }
    return null;
  }, [data, signedData, mirrorData, width, height, padding, mode, xAxis?.min, xAxis?.max]);

  // 计算条形数据
  const bars = useMemo(() => {
    if (!chartConfig) return [];

    if (mode === 'signed' && signedData) {
      const signedBars = computeSignedBars(
        signedData,
        chartConfig,
        width,
        height,
        bar?.height ?? DEFAULT_CONFIG.barHeight,
        bar?.spacing ?? DEFAULT_CONFIG.barSpacing
      );
      return signedBars.flat();
    } else if (mode === 'mirror' && mirrorData) {
      return computeMirrorBars(
        mirrorData,
        chartConfig,
        width,
        height,
        bar?.height ?? DEFAULT_CONFIG.barHeight
      );
    } else if (data) {
      return computeSplitBars(
        data,
        chartConfig,
        width,
        height,
        bar?.height ?? DEFAULT_CONFIG.barHeight
      );
    }
    return [];
  }, [data, signedData, mirrorData, chartConfig, width, height, mode, bar?.height, bar?.spacing]);

  // 动画效果
  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setAnimationProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [animationDuration, data, signedData, mirrorData]);

  // 绘制图表
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !chartConfig) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 获取标签
    const labels = mode === 'signed' && signedData
      ? signedData.labels
      : mode === 'mirror' && mirrorData
        ? mirrorData.labels
        : data?.labels || [];
    const isMirrorMode = mode === 'mirror';

    // 绘制网格
    drawGrid(
      ctx,
      chartConfig,
      width,
      height,
      labels,
      yAxis?.tickColor || DEFAULT_CONFIG.textColor,
      yAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
      xAxis?.display !== false ? xAxis?.title?.text : undefined,
      yAxis?.display !== false ? yAxis?.title?.text : undefined,
      xAxis?.grid,
      yAxis?.grid,
      yAxis?.tickInterval,
      isMirrorMode
    );

    // 绘制坐标轴（mirror 模式下不绘制中心轴线）
    if (!isMirrorMode) {
      drawAxes(ctx, chartConfig, width, height, xAxis?.grid?.color || DEFAULT_CONFIG.axisColor);
    }

    // 绘制条形
    bars.forEach((barItem) => {
      drawBar(
        ctx,
        barItem,
        animationProgress,
        bar?.borderRadius ?? DEFAULT_CONFIG.borderRadius,
        chartConfig.centerX,
        isMirrorMode
      );
    });

    // 绘制数据标签
    drawDataLabels(
      ctx,
      bars,
      animationProgress,
      bar?.dataLabel,
      yAxis?.tickColor || DEFAULT_CONFIG.textColor,
      yAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
      chartConfig.centerX
    );

    // 绘制高亮条形
    if (hoveredBar && animationProgress >= 1) {
      drawHighlightedBar(
        ctx,
        hoveredBar,
        bar?.borderRadius ?? DEFAULT_CONFIG.borderRadius
      );
    }

    // 保存计算的数据用于交互
    barsRef.current = bars;

    if (isLoading) {
      setIsLoading(false);
      onChartReady?.();
    }
  }, [
    data,
    signedData,
    mirrorData,
    width,
    height,
    padding,
    chartConfig,
    bars,
    xAxis,
    yAxis,
    legend,
    bar,
    animationProgress,
    hoveredBar,
    isLoading,
    onChartReady,
    mode,
  ]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || animationProgress < 1) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 查找鼠标下的条形
      let closestBar: ComputedBidirectionalBar | null = null;

      barsRef.current.forEach((barItem) => {
        if (
          x >= barItem.x &&
          x <= barItem.x + barItem.width &&
          y >= barItem.y &&
          y <= barItem.y + barItem.height
        ) {
          closestBar = barItem;
        }
      });

      setHoveredBar(closestBar);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      // 更改鼠标样式
      canvas.style.cursor = closestBar ? 'pointer' : 'default';
    },
    [animationProgress]
  );

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setHoveredBar(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  }, []);

  // 处理点击
  const handleClick = useCallback(() => {
    if (!hoveredBar || !onDataClick) return;
    onDataClick(hoveredBar.direction, hoveredBar.dataIndex, hoveredBar.value);
  }, [hoveredBar, onDataClick]);

  // 生成提示框内容
  const tooltipContent = useMemo(() => {
    if (!hoveredBar) return null;

    const items: BidirectionalBarTooltipItem[] = [{
      label: hoveredBar.direction === 'left'
        ? (mode === 'signed' && signedData ? signedData.datasets[0].label
          : mode === 'mirror' && mirrorData ? mirrorData.leftData.label
          : data?.leftData.label || '左侧')
        : (mode === 'signed' && signedData ? signedData.datasets[0].label
          : mode === 'mirror' && mirrorData ? mirrorData.rightData.label
          : data?.rightData.label || '右侧'),
      value: hoveredBar.value,
      color: hoveredBar.color,
      direction: hoveredBar.direction,
    }];

    return {
      dataIndex: hoveredBar.dataIndex,
      label: hoveredBar.label,
      title: hoveredBar.label,
      items,
    };
  }, [hoveredBar, data, signedData, mirrorData, mode]);

  // 获取图例数据
  const legendItems = useMemo(() => {
    if (mode === 'signed' && signedData) {
      return signedData.datasets.map((dataset, index) => ({
        label: dataset.label,
        color: dataset.backgroundColor || (index === 0 ? DEFAULT_COLORS.right : DEFAULT_COLORS.left),
      }));
    } else if (mode === 'mirror' && mirrorData) {
      return [
        {
          label: mirrorData.leftData.label,
          color: mirrorData.leftData.backgroundColor || DEFAULT_COLORS.left,
        },
        {
          label: mirrorData.rightData.label,
          color: mirrorData.rightData.backgroundColor || DEFAULT_COLORS.right,
        },
      ];
    } else if (data) {
      return [
        {
          label: data.leftData.label,
          color: data.leftData.backgroundColor || DEFAULT_COLORS.left,
        },
        {
          label: data.rightData.label,
          color: data.rightData.backgroundColor || DEFAULT_COLORS.right,
        },
      ];
    }
    return [];
  }, [data, signedData, mirrorData, mode]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsBidirectionalBarContainer, className)}
      style={{ ...style, width }}
    >
      {/* 图例区域 */}
      {legend?.display !== false && legendItems.length > 0 && (
        <div
          className={styles.zcpcyChatsLegend}
          style={{
            justifyContent: 'center',
            marginBottom: legend?.position === 'bottom' ? 0 : 12,
            marginTop: legend?.position === 'top' ? 0 : 12,
            order: legend?.position === 'bottom' ? 2 : 0,
          }}
        >
          {legendItems.map((item, index) => (
            <div
              key={index}
              className={styles.zcpcyChatsLegendItem}
            >
              <span
                className={styles.zcpcyChatsLegendColor}
                style={{ backgroundColor: item.color }}
              />
              <span style={{ color: legend?.labelColor || '#374151', fontSize: legend?.labelFontSize || 12 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsBidirectionalBarCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* 提示框 */}
      {tooltip?.enabled !== false && tooltipContent && hoveredBar && (
        <div
          className={classNames(styles.zcpcyChatsTooltip, styles.zcpcyChatsTooltipVisible)}
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y - 40,
            backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
          }}
        >
          {tooltip?.customContent ? (
            tooltip.customContent({
              dataIndex: tooltipContent.dataIndex,
              label: tooltipContent.label,
              items: tooltipContent.items,
            })
          ) : (
            <>
              <div
                className={styles.zcpcyChatsTooltipTitle}
                style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
              >
                {tooltipContent.title}
              </div>
              {tooltipContent.items.map((item, index) => (
                <div key={index} className={styles.zcpcyChatsTooltipItem}>
                  <span
                    className={styles.zcpcyChatsTooltipColor}
                    style={{ backgroundColor: item.color }}
                  />
                  <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                    {item.label}: {item.value}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && <div className={styles.zcpcyChatsLoading}>加载中...</div>}
    </div>
  );
};

export default BidirectionalBar;
