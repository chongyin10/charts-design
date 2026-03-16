/**
 * 双轴图组件
 * 支持左右两个 Y 轴，用于展示不同量级或单位的数据
 * 左侧 Y 轴支持柱状图和折线图，右侧 Y 轴默认为折线图
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  DualAxesProps,
  DualAxesChartData,
  DualAxesChartConfig,
  ComputedPoint,
  DualAxesLeftDataset,
  DualAxesRightDataset,
  DualAxesTooltipItem,
} from './DualAxes.type';

/**
 * 默认颜色配置
 */
const DEFAULT_COLORS = {
  left: [
    '#3b82f6', // blue
    '#10b981', // green
    '#06b6d4', // cyan
  ],
  right: [
    '#ef4444', // red
    '#f59e0b', // yellow
    '#8b5cf6', // purple
  ],
};

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  padding: 60,
  rightAxisOffset: 60,
  borderWidth: 2,
  pointRadius: 4,
  pointHoverRadius: 6,
  barWidthRatio: 0.6,
  animationDuration: 1000,
  gridColor: '#e5e7eb',
  textColor: '#6b7280',
  axisColor: '#d1d5db',
  tooltipBackground: '#ffffff',
  tooltipTitleColor: '#111827',
  tooltipBodyColor: '#374151',
  fontSize: 12,
  titleFontSize: 14,
};

/**
 * 获取左侧数据集颜色
 */
const getLeftDatasetColor = (index: number, dataset: DualAxesLeftDataset): string => {
  return dataset.borderColor || dataset.backgroundColor || DEFAULT_COLORS.left[index % DEFAULT_COLORS.left.length];
};

/**
 * 获取右侧数据集颜色
 */
const getRightDatasetColor = (index: number, dataset: DualAxesRightDataset): string => {
  return dataset.borderColor || DEFAULT_COLORS.right[index % DEFAULT_COLORS.right.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: DualAxesChartData,
  width: number,
  height: number,
  padding: number,
  rightAxisOffset: number,
  leftYAxisMin?: number,
  leftYAxisMax?: number,
  rightYAxisMin?: number,
  rightYAxisMax?: number
): DualAxesChartConfig => {
  // 计算左侧数据范围
  const leftValues = data.leftDatasets.flatMap((d) => d.data);
  const leftMaxValue = leftYAxisMax ?? Math.max(...leftValues, 0);
  const leftMinValue = leftYAxisMin ?? Math.min(...leftValues, 0);
  const leftValueRange = leftMaxValue - leftMinValue || 1;

  // 计算右侧数据范围
  const rightValues = data.rightDatasets.flatMap((d) => d.data);
  const rightMaxValue = rightYAxisMax ?? Math.max(...rightValues, 0);
  const rightMinValue = rightYAxisMin ?? Math.min(...rightValues, 0);
  const rightValueRange = rightMaxValue - rightMinValue || 1;

  return {
    padding,
    chartWidth: width - padding - rightAxisOffset,
    chartHeight: height - padding * 2,
    leftMinValue,
    leftMaxValue,
    leftValueRange,
    rightMinValue,
    rightMaxValue,
    rightValueRange,
    rightAxisOffset,
  };
};

/**
 * 将数据值转换为 Y 坐标（左侧 Y 轴）
 */
const leftValueToY = (
  value: number,
  config: DualAxesChartConfig,
  height: number
): number => {
  const normalizedValue = (value - config.leftMinValue) / config.leftValueRange;
  return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 将数据值转换为 Y 坐标（右侧 Y 轴）
 */
const rightValueToY = (
  value: number,
  config: DualAxesChartConfig,
  height: number
): number => {
  const normalizedValue = (value - config.rightMinValue) / config.rightValueRange;
  return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 将数据索引转换为 X 坐标（居中对齐）
 */
const indexToX = (
  index: number,
  config: DualAxesChartConfig,
  labelsLength: number
): number => {
  const dataCount = Math.max(1, labelsLength);
  const step = config.chartWidth / dataCount;
  return config.padding + step / 2 + index * step;
};

/**
 * 计算左侧数据点坐标
 */
const computeLeftPoints = (
  data: DualAxesChartData,
  config: DualAxesChartConfig,
  width: number,
  height: number
): ComputedPoint[][] => {
  return data.leftDatasets.map((dataset, datasetIndex) =>
    dataset.data.map((value, dataIndex) => ({
      x: indexToX(dataIndex, config, data.labels.length),
      y: leftValueToY(value, config, height),
      value,
      label: data.labels[dataIndex] || '',
      datasetIndex,
      dataIndex,
      axis: 'left' as const,
    }))
  );
};

/**
 * 计算右侧数据点坐标
 */
const computeRightPoints = (
  data: DualAxesChartData,
  config: DualAxesChartConfig,
  width: number,
  height: number
): ComputedPoint[][] => {
  return data.rightDatasets.map((dataset, datasetIndex) =>
    dataset.data.map((value, dataIndex) => ({
      x: indexToX(dataIndex, config, data.labels.length),
      y: rightValueToY(value, config, height),
      value,
      label: data.labels[dataIndex] || '',
      datasetIndex,
      dataIndex,
      axis: 'right' as const,
    }))
  );
};

/**
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: DualAxesChartConfig,
  width: number,
  height: number,
  labels: string[],
  textColor: string,
  fontSize: number,
  xAxis?: DualAxesProps['xAxis'],
  leftYAxis?: DualAxesProps['leftYAxis'],
  rightYAxis?: DualAxesProps['rightYAxis']
): void => {
  const {
    padding,
    chartWidth,
    chartHeight,
    leftMinValue,
    leftMaxValue,
    rightMinValue,
    rightMaxValue,
    rightAxisOffset,
  } = config;

  const showGrid = xAxis?.grid?.display !== false || leftYAxis?.grid?.display !== false;
  const defaultGridColor = '#e5e7eb';
  const defaultLineWidth = 1;
  const defaultOpacity = 0.5;

  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // 计算 X 轴标签步长
  const tickInterval = Math.max(1, xAxis?.tickInterval || 1);
  // 柱状图模式：使用等分方式，刻度在柱子中间
  const xStep = chartWidth / Math.max(1, labels.length);

  // 计算是否需要旋转标签
  const visibleLabels = labels.filter((_, index) => index % tickInterval === 0);
  const estimatedLabelWidth = fontSize * 8;
  const availableWidthPerLabel = chartWidth / visibleLabels.length;
  const shouldRotateLabels = visibleLabels.length > 6 || estimatedLabelWidth > availableWidthPerLabel;

  // 绘制 X 轴标签（与柱状图居中对齐）
  labels.forEach((label, index) => {
    if (index % tickInterval !== 0) return;
    // 柱状图模式下，标签位于柱子中心：padding + step/2 + index * step
    const x = padding + xStep / 2 + index * xStep;

    if (shouldRotateLabels) {
      ctx.save();
      ctx.translate(x, height - padding + 8);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(label, x, height - padding + 8);
    }
  });

  // 绘制 X 轴标题
  if (xAxis?.title?.text) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${xAxis.title.fontSize || fontSize}px sans-serif`;
    ctx.fillStyle = xAxis.title.color || textColor;
    ctx.fillText(xAxis.title.text, padding + chartWidth / 2, height - 15);
    ctx.restore();
  }

  // 绘制左侧 Y 轴标签
  const yGridCount = 5;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= yGridCount; i++) {
    const ratio = i / yGridCount;
    const y = height - padding - ratio * chartHeight;
    const value = leftMinValue + ratio * (leftMaxValue - leftMinValue);
    const formattedValue = leftYAxis?.tickFormatter
      ? leftYAxis.tickFormatter(value)
      : value.toFixed(0);
    ctx.fillStyle = leftYAxis?.tickColor || textColor;
    ctx.fillText(formattedValue, padding - 8, y);
  }

  // 绘制左侧 Y 轴标题
  if (leftYAxis?.title?.text) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `bold ${leftYAxis.title.fontSize || fontSize}px sans-serif`;
    ctx.fillStyle = leftYAxis.title.color || textColor;
    ctx.fillText(leftYAxis.title.text, padding, padding - 10);
    ctx.restore();
  }

  // 绘制右侧 Y 轴标签
  if (rightYAxis?.display !== false) {
    ctx.textAlign = 'left';
    for (let i = 0; i <= yGridCount; i++) {
      const ratio = i / yGridCount;
      const y = height - padding - ratio * chartHeight;
      const value = rightMinValue + ratio * (rightMaxValue - rightMinValue);
      const formattedValue = rightYAxis?.tickFormatter
        ? rightYAxis.tickFormatter(value)
        : value.toFixed(0);
      ctx.fillStyle = rightYAxis?.tickColor || textColor;
      ctx.fillText(formattedValue, width - rightAxisOffset + 8, y);
    }

    // 绘制右侧 Y 轴标题
    if (rightYAxis?.title?.text) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = `bold ${rightYAxis.title.fontSize || fontSize}px sans-serif`;
      ctx.fillStyle = rightYAxis.title.color || textColor;
      ctx.fillText(rightYAxis.title.text, width - rightAxisOffset, padding - 10);
      ctx.restore();
    }
  }

  // 绘制 X 轴刻度线（与柱状图居中对齐）
  ctx.save();
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  labels.forEach((_, index) => {
    if (index % tickInterval !== 0) return;
    // 柱状图模式下，刻度线位于柱子中心
    const x = padding + xStep / 2 + index * xStep;
    ctx.beginPath();
    ctx.moveTo(x, height - padding);
    ctx.lineTo(x, height - padding + 6);
    ctx.stroke();
  });
  ctx.restore();

  // 绘制 Y 轴刻度线
  ctx.save();
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  for (let i = 0; i <= yGridCount; i++) {
    const ratio = i / yGridCount;
    const y = height - padding - ratio * chartHeight;
    // 左侧刻度
    ctx.beginPath();
    ctx.moveTo(padding - 6, y);
    ctx.lineTo(padding, y);
    ctx.stroke();
    // 右侧刻度
    if (rightYAxis?.display !== false) {
      ctx.beginPath();
      ctx.moveTo(width - rightAxisOffset, y);
      ctx.lineTo(width - rightAxisOffset + 6, y);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 绘制垂直网格线（与柱状图居中对齐）
  const showVerticalGrid = xAxis?.grid?.vertical !== false && showGrid;
  if (showVerticalGrid) {
    ctx.save();
    ctx.strokeStyle = xAxis?.grid?.color || defaultGridColor;
    ctx.lineWidth = xAxis?.grid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = xAxis?.grid?.opacity ?? defaultOpacity;

    labels.forEach((_, index) => {
      // 柱状图模式下，网格线位于柱子中心
      const x = padding + xStep / 2 + index * xStep;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    });
    ctx.restore();
  }

  // 绘制水平网格线
  const showHorizontalGrid = leftYAxis?.grid?.horizontal !== false && showGrid;
  if (showHorizontalGrid) {
    ctx.save();
    ctx.strokeStyle = leftYAxis?.grid?.color || defaultGridColor;
    ctx.lineWidth = leftYAxis?.grid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = leftYAxis?.grid?.opacity ?? defaultOpacity;

    for (let i = 0; i <= yGridCount; i++) {
      const ratio = i / yGridCount;
      const y = height - padding - ratio * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - rightAxisOffset, y);
      ctx.stroke();
    }
    ctx.restore();
  }
};

/**
 * 绘制坐标轴
 */
const drawAxes = (
  ctx: CanvasRenderingContext2D,
  config: DualAxesChartConfig,
  width: number,
  height: number,
  axisColor: string,
  rightYAxis?: DualAxesProps['rightYAxis']
): void => {
  const { padding, rightAxisOffset } = config;

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1;

  // X 轴
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - rightAxisOffset, height - padding);
  ctx.stroke();

  // 左侧 Y 轴
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();

  // 右侧 Y 轴
  if (rightYAxis?.display !== false) {
    ctx.beginPath();
    ctx.moveTo(width - rightAxisOffset, padding);
    ctx.lineTo(width - rightAxisOffset, height - padding);
    ctx.stroke();
  }
};

/**
 * 绘制柱状图
 */
const drawBars = (
  ctx: CanvasRenderingContext2D,
  data: DualAxesChartData,
  dataset: DualAxesLeftDataset,
  datasetIndex: number,
  config: DualAxesChartConfig,
  height: number,
  animationProgress: number
): void => {
  const labelsLength = data.labels.length;
  if (labelsLength === 0) return;

  const color = dataset.backgroundColor || getLeftDatasetColor(datasetIndex, dataset);
  const barWidthRatio = dataset.barWidth || DEFAULT_CONFIG.barWidthRatio;

  // 计算柱子宽度（使用柱状图专用的x步长）
  const xStep = config.chartWidth / Math.max(1, labelsLength);
  const barWidth = xStep * barWidthRatio;

  dataset.data.forEach((value, index) => {
    // 计算柱状图专用的 X 坐标
    const x = indexToX(index, config, labelsLength);
    const y = leftValueToY(value, config, height);

    // 动画效果：从底部向上生长
    const baseY = height - config.padding;
    const animatedHeight = (baseY - y) * animationProgress;
    const animatedY = baseY - animatedHeight;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;

    // 绘制圆角矩形
    const radius = Math.min(4, barWidth / 4);
    const barX = x - barWidth / 2;
    const barY = animatedY;
    const w = barWidth;
    const h = animatedHeight;

    if (h > 0) {
      ctx.beginPath();
      if (h > radius * 2) {
        ctx.moveTo(barX + radius, barY);
        ctx.lineTo(barX + w - radius, barY);
        ctx.quadraticCurveTo(barX + w, barY, barX + w, barY + radius);
        ctx.lineTo(barX + w, barY + h);
        ctx.lineTo(barX, barY + h);
        ctx.lineTo(barX, barY + radius);
        ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
      } else {
        ctx.rect(barX, barY, w, h);
      }
      ctx.closePath();
      ctx.fill();
    }
  });

  ctx.globalAlpha = 1;
};

/**
 * 绘制平滑曲线
 */
const drawSmoothLine = (
  ctx: CanvasRenderingContext2D,
  points: ComputedPoint[],
  color: string,
  lineWidth: number
): void => {
  if (points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    if (next) {
      const cp1X = prev.x + (curr.x - prev.x) * 0.5;
      const cp1Y = prev.y;
      const cp2X = curr.x - (next.x - curr.x) * 0.5;
      const cp2Y = curr.y;
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, curr.x, curr.y);
    } else {
      const cpX = (prev.x + curr.x) / 2;
      ctx.quadraticCurveTo(cpX, (prev.y + curr.y) / 2, curr.x, curr.y);
    }
  }

  ctx.stroke();
};

/**
 * 绘制直线
 */
const drawStraightLine = (
  ctx: CanvasRenderingContext2D,
  points: ComputedPoint[],
  color: string,
  lineWidth: number
): void => {
  if (points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
};

/**
 * 绘制填充区域
 */
const drawFillArea = (
  ctx: CanvasRenderingContext2D,
  points: ComputedPoint[],
  color: string,
  height: number,
  padding: number
): void => {
  if (points.length < 2) return;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.2;

  ctx.beginPath();
  ctx.moveTo(points[0].x, height - padding);
  ctx.lineTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.lineTo(points[points.length - 1].x, height - padding);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
};

/**
 * 绘制数据点
 */
const drawPoints = (
  ctx: CanvasRenderingContext2D,
  points: ComputedPoint[],
  dataset: { point?: DualAxesLeftDataset['point']; pointStyle?: string; pointRadius?: number },
  color: string,
  isHovered: boolean
): void => {
  if (dataset.point === false) return;
  if (dataset.pointStyle === 'none') return;

  const pointConfig = dataset.point;
  const radius = isHovered
    ? pointConfig?.hoverRadius ?? DEFAULT_CONFIG.pointHoverRadius
    : pointConfig?.radius ?? dataset.pointRadius ?? DEFAULT_CONFIG.pointRadius;
  const backgroundColor = pointConfig?.backgroundColor ?? '#fff';
  const pointStyle = pointConfig?.style ?? dataset.pointStyle ?? 'circle';

  points.forEach((point) => {
    ctx.fillStyle = isHovered ? pointConfig?.hoverBackgroundColor ?? color : backgroundColor;
    ctx.strokeStyle = color;
    ctx.lineWidth = pointConfig?.width ?? 2;

    ctx.beginPath();

    switch (pointStyle) {
      case 'rect':
        ctx.rect(point.x - radius, point.y - radius, radius * 2, radius * 2);
        break;
      case 'triangle':
        ctx.moveTo(point.x, point.y - radius);
        ctx.lineTo(point.x + radius, point.y + radius);
        ctx.lineTo(point.x - radius, point.y + radius);
        ctx.closePath();
        break;
      case 'circle':
      default:
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        break;
    }

    ctx.fill();
    ctx.stroke();
  });
};

/**
 * 双轴图组件
 */
export const DualAxes: React.FC<DualAxesProps> = ({
  data,
  width: propWidth = 700,
  height: propHeight = 400,
  padding = DEFAULT_CONFIG.padding,
  xAxis,
  leftYAxis,
  rightYAxis,
  legend,
  tooltip,
  verticalLine,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  smooth = false,
  className,
  style,
  onDataClick,
  onChartReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<ComputedPoint | null>(null);
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const hoveredDataIndexRef = useRef<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<string>>(new Set());
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const leftPointsRef = useRef<ComputedPoint[][]>([]);
  const rightPointsRef = useRef<ComputedPoint[][]>([]);
  const hoveredPointRef = useRef<ComputedPoint | null>(null);

  // 响应式尺寸状态
  const [containerSize, setContainerSize] = useState({ width: propWidth, height: propHeight });

  // 使用 ResizeObserver 监听容器大小变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let debounceTimer: NodeJS.Timeout | null = null;

    const updateSize = (newWidth: number) => {
      if (!isMounted) return;
      // 宽度自适应容器，高度保持固定
      const width = Math.max(newWidth, 300); // 最小宽度 300
      setContainerSize({ width, height: propHeight });
    };

    // 防抖处理的尺寸更新
    const debouncedUpdateSize = (width: number) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        if (isMounted) {
          updateSize(width);
        }
      }, 100); // 100ms 防抖延迟
    };

    // 初始计算（不使用防抖）
    const rect = container.getBoundingClientRect();
    updateSize(rect.width);

    // 创建 ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      // 使用 entries 获取最新尺寸，避免闭包问题
      for (const entry of entries) {
        const { width } = entry.contentRect;
        debouncedUpdateSize(width);
      }
    });

    resizeObserver.observe(container);

    // 监听窗口大小变化
    const handleResize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        debouncedUpdateSize(rect.width);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [propWidth, propHeight]);

  // 使用容器尺寸或传入的尺寸
  const width = containerSize.width || propWidth;
  const height = containerSize.height || propHeight;

  // 计算图表配置
  const chartConfig = useMemo(
    () =>
      calculateChartConfig(
        data,
        width,
        height,
        padding,
        DEFAULT_CONFIG.rightAxisOffset,
        leftYAxis?.min,
        leftYAxis?.max,
        rightYAxis?.min,
        rightYAxis?.max
      ),
    [data, width, height, padding, leftYAxis?.min, leftYAxis?.max, rightYAxis?.min, rightYAxis?.max]
  );

  // 计算数据点
  const leftPoints = useMemo(
    () => computeLeftPoints(data, chartConfig, width, height),
    [data, chartConfig, width, height]
  );

  const rightPoints = useMemo(
    () => computeRightPoints(data, chartConfig, width, height),
    [data, chartConfig, width, height]
  );

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
      } else {
        setIsAnimationComplete(true);
        onChartReady?.();
      }
    };
    setIsAnimationComplete(false);
    requestAnimationFrame(animate);
  }, [animationDuration, data, onChartReady]);

  // 绘制图表
  const drawChart = useCallback(
    (progress: number = 1) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // 绘制网格
      drawGrid(
        ctx,
        chartConfig,
        width,
        height,
        data.labels,
        xAxis?.tickColor || DEFAULT_CONFIG.textColor,
        xAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
        xAxis,
        leftYAxis,
        rightYAxis
      );

      // 绘制坐标轴
      drawAxes(ctx, chartConfig, width, height, DEFAULT_CONFIG.axisColor, rightYAxis);

      // 绘制左侧数据集（柱状图或折线图）
      data.leftDatasets.forEach((dataset, datasetIndex) => {
        const key = `left-${datasetIndex}`;
        if (hiddenDatasets.has(key) || dataset.hidden) return;

        const points = leftPoints[datasetIndex];
        if (!points || points.length === 0) return;

        // 根据动画进度截取点
        const visibleCount = Math.max(1, Math.floor(points.length * progress));
        const animatedPoints = points.slice(0, visibleCount);

        const color = getLeftDatasetColor(datasetIndex, dataset);
        const lineWidth = dataset.track?.width || DEFAULT_CONFIG.borderWidth;

        // 根据类型绘制
        if (dataset.type === 'column' || !dataset.type) {
          // 默认为柱状图
          drawBars(ctx, data, dataset, datasetIndex, chartConfig, height, progress);
        } else {
          // 折线图
          if (dataset.fill && dataset.backgroundColor) {
            drawFillArea(ctx, animatedPoints, dataset.backgroundColor, height, padding);
          }

          if (smooth) {
            drawSmoothLine(ctx, animatedPoints, color, lineWidth);
          } else {
            drawStraightLine(ctx, animatedPoints, color, lineWidth);
          }

          // 绘制数据点（动画完成后）
          if (progress >= 1) {
            drawPoints(ctx, animatedPoints, dataset, color, false);
          }
        }
      });

      // 绘制右侧数据集（折线图）
      data.rightDatasets.forEach((dataset, datasetIndex) => {
        const key = `right-${datasetIndex}`;
        if (hiddenDatasets.has(key) || dataset.hidden) return;

        const points = rightPoints[datasetIndex];
        if (!points || points.length === 0) return;

        const visibleCount = Math.max(1, Math.floor(points.length * progress));
        const animatedPoints = points.slice(0, visibleCount);

        const color = getRightDatasetColor(datasetIndex, dataset);
        const lineWidth = dataset.track?.width || DEFAULT_CONFIG.borderWidth;

        // 绘制填充区域
        if (dataset.fill && dataset.backgroundColor) {
          drawFillArea(ctx, animatedPoints, dataset.backgroundColor, height, padding);
        }

        // 绘制线条
        if (smooth) {
          drawSmoothLine(ctx, animatedPoints, color, lineWidth);
        } else {
          drawStraightLine(ctx, animatedPoints, color, lineWidth);
        }

        // 绘制数据点
        if (progress >= 1) {
          drawPoints(ctx, animatedPoints, dataset, color, false);
        }
      });

      // 绘制竖线
      const currentHoveredIndex = hoveredDataIndexRef.current;
      if (verticalLine?.enabled && currentHoveredIndex !== null && isAnimationComplete) {
        const { padding: p, chartHeight, chartWidth } = chartConfig;
        const labelsLength = data.labels.length;
        const dataCount = Math.max(1, labelsLength);
        // 使用柱状图居中对齐的方式计算 X 坐标
        const step = chartWidth / dataCount;
        const lineX = p + step / 2 + currentHoveredIndex * step;

        ctx.save();
        ctx.strokeStyle = verticalLine.color || '#999';
        ctx.lineWidth = verticalLine.lineWidth || 1;
        if (verticalLine.dash && verticalLine.dash.length > 0) {
          ctx.setLineDash(verticalLine.dash);
        }
        ctx.beginPath();
        ctx.moveTo(lineX, p);
        ctx.lineTo(lineX, p + chartHeight);
        ctx.stroke();
        ctx.restore();

        // 绘制高亮点
        leftPointsRef.current.forEach((datasetPoints, datasetIndex) => {
          const key = `left-${datasetIndex}`;
          if (hiddenDatasets.has(key) || data.leftDatasets[datasetIndex]?.hidden) return;

          const point = datasetPoints[currentHoveredIndex];
          if (!point) return;

          const dataset = data.leftDatasets[datasetIndex];
          if (dataset.type === 'column' || !dataset.type) {
            // 柱状图高亮
            ctx.save();
            ctx.fillStyle = getLeftDatasetColor(datasetIndex, dataset);
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          } else if (dataset.point !== false && dataset.pointStyle !== 'none') {
            ctx.save();
            ctx.fillStyle = getLeftDatasetColor(datasetIndex, dataset);
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }
        });

        rightPointsRef.current.forEach((datasetPoints, datasetIndex) => {
          const key = `right-${datasetIndex}`;
          if (hiddenDatasets.has(key) || data.rightDatasets[datasetIndex]?.hidden) return;

          const point = datasetPoints[currentHoveredIndex];
          if (!point) return;

          const dataset = data.rightDatasets[datasetIndex];
          if (dataset.point !== false && dataset.pointStyle !== 'none') {
            ctx.save();
            ctx.fillStyle = getRightDatasetColor(datasetIndex, dataset);
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // 绘制单个悬停点
      const hoveredPt = hoveredPointRef.current;
      if (hoveredPt && !verticalLine?.enabled && isAnimationComplete) {
        const color =
          hoveredPt.axis === 'left'
            ? getLeftDatasetColor(hoveredPt.datasetIndex, data.leftDatasets[hoveredPt.datasetIndex])
            : getRightDatasetColor(hoveredPt.datasetIndex, data.rightDatasets[hoveredPt.datasetIndex]);

        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(hoveredPt.x, hoveredPt.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // 保存数据点引用
      leftPointsRef.current = leftPoints;
      rightPointsRef.current = rightPoints;

      if (isLoading) {
        setIsLoading(false);
      }
    },
    [
      data,
      width,
      height,
      chartConfig,
      leftPoints,
      rightPoints,
      xAxis,
      leftYAxis,
      rightYAxis,
      smooth,
      verticalLine,
      hiddenDatasets,
      isLoading,
      isAnimationComplete,
      padding,
      onChartReady,
    ]
  );

  useEffect(() => {
    drawChart(animationProgress);
  }, [drawChart, animationProgress]);

  // 鼠标移动处理
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !isAnimationComplete) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 竖线模式
      if (verticalLine?.enabled) {
        const { padding: p, chartWidth } = chartConfig;
        const labelsLength = data.labels.length;
        const dataCount = Math.max(1, labelsLength);
        // 使用柱状图居中对齐的方式计算步长
        const step = chartWidth / dataCount;

        let closestIndex = 0;
        if (step > 0) {
          // 根据柱子中心位置计算最近的索引
          closestIndex = Math.round((x - p - step / 2) / step);
          closestIndex = Math.max(0, Math.min(closestIndex, labelsLength - 1));
        }

        const isInChartArea =
          x >= p &&
          x <= width - chartConfig.rightAxisOffset &&
          y >= p &&
          y <= height - p;

        if (isInChartArea) {
          const prevIndex = hoveredDataIndexRef.current;
          if (prevIndex !== closestIndex) {
            hoveredDataIndexRef.current = closestIndex;
            setHoveredDataIndex(closestIndex);

            // 找参考点
            let referencePoint: ComputedPoint | null = null;
            for (let i = 0; i < leftPointsRef.current.length; i++) {
              if (!hiddenDatasets.has(`left-${i}`) && leftPointsRef.current[i][closestIndex]) {
                referencePoint = leftPointsRef.current[i][closestIndex];
                break;
              }
            }
            if (!referencePoint) {
              for (let i = 0; i < rightPointsRef.current.length; i++) {
                if (!hiddenDatasets.has(`right-${i}`) && rightPointsRef.current[i][closestIndex]) {
                  referencePoint = rightPointsRef.current[i][closestIndex];
                  break;
                }
              }
            }
            hoveredPointRef.current = referencePoint;
            setHoveredPoint(referencePoint);
            drawChart(1);

            // 设置 tooltip 位置
            if (referencePoint) {
              setTooltipPos({ x: referencePoint.x, y: referencePoint.y });
            }
          }
        } else {
          if (hoveredDataIndexRef.current !== null) {
            hoveredDataIndexRef.current = null;
            setHoveredDataIndex(null);
            hoveredPointRef.current = null;
            setHoveredPoint(null);
            drawChart(1);
          }
        }
        return;
      }

      // 普通模式：查找最近的数据点
      let foundPoint: ComputedPoint | null = null;
      let minDistance = Infinity;

      // 检查左侧数据点
      leftPointsRef.current.forEach((datasetPoints, datasetIndex) => {
        const key = `left-${datasetIndex}`;
        if (hiddenDatasets.has(key) || data.leftDatasets[datasetIndex]?.hidden) return;

        datasetPoints.forEach((point) => {
          const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
          if (distance < 20 && distance < minDistance) {
            minDistance = distance;
            foundPoint = point;
          }
        });
      });

      // 检查右侧数据点
      rightPointsRef.current.forEach((datasetPoints, datasetIndex) => {
        const key = `right-${datasetIndex}`;
        if (hiddenDatasets.has(key) || data.rightDatasets[datasetIndex]?.hidden) return;

        datasetPoints.forEach((point) => {
          const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
          if (distance < 20 && distance < minDistance) {
            minDistance = distance;
            foundPoint = point;
          }
        });
      });

      const prevHoveredPoint = hoveredPointRef.current;

      const hasPointChanged = (() => {
        if (prevHoveredPoint === null && foundPoint !== null) return true;
        if (prevHoveredPoint !== null && foundPoint === null) return true;
        if (prevHoveredPoint !== null && foundPoint !== null) {
          return (
            prevHoveredPoint.datasetIndex !== (foundPoint as ComputedPoint).datasetIndex ||
            prevHoveredPoint.dataIndex !== (foundPoint as ComputedPoint).dataIndex ||
            prevHoveredPoint.axis !== (foundPoint as ComputedPoint).axis
          );
        }
        return false;
      })();

      if (hasPointChanged) {
        hoveredPointRef.current = foundPoint;
        setHoveredPoint(foundPoint);
        drawChart(1);
      }

      if (foundPoint) {
        setTooltipPos({ x: (foundPoint as ComputedPoint).x, y: (foundPoint as ComputedPoint).y });
      }
    },
    [
      isAnimationComplete,
      verticalLine,
      chartConfig,
      data,
      width,
      height,
      hiddenDatasets,
      drawChart,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    hoveredPointRef.current = null;
    hoveredDataIndexRef.current = null;
    setHoveredPoint(null);
    setHoveredDataIndex(null);
    if (isAnimationComplete) {
      drawChart(1);
    }
  }, [drawChart, isAnimationComplete]);

  const handleClick = useCallback(() => {
    if (!hoveredPoint || !onDataClick) return;
    onDataClick(
      hoveredPoint.axis,
      hoveredPoint.datasetIndex,
      hoveredPoint.dataIndex,
      hoveredPoint.value
    );
  }, [hoveredPoint, onDataClick]);

  const toggleDataset = useCallback((key: string) => {
    setHiddenDatasets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // 生成 tooltip 内容
  const tooltipContent = useMemo(() => {
    if (!hoveredPoint && hoveredDataIndex === null) return null;

    const dataIndex = hoveredDataIndex ?? hoveredPoint?.dataIndex;
    if (dataIndex === undefined) return null;

    const items: DualAxesTooltipItem[] = [];

    // 竖线模式下显示所有可见数据
    if (verticalLine?.enabled) {
      data.leftDatasets.forEach((dataset, idx) => {
        const key = `left-${idx}`;
        if (hiddenDatasets.has(key) || dataset.hidden) return;
        items.push({
          label: dataset.label,
          value: dataset.data[dataIndex],
          color: getLeftDatasetColor(idx, dataset),
          datasetIndex: idx,
          axis: 'left',
        });
      });
      data.rightDatasets.forEach((dataset, idx) => {
        const key = `right-${idx}`;
        if (hiddenDatasets.has(key) || dataset.hidden) return;
        items.push({
          label: dataset.label,
          value: dataset.data[dataIndex],
          color: getRightDatasetColor(idx, dataset),
          datasetIndex: idx,
          axis: 'right',
        });
      });
    } else if (hoveredPoint) {
      // 普通模式显示单个数据点
      if (hoveredPoint.axis === 'left') {
        const dataset = data.leftDatasets[hoveredPoint.datasetIndex];
        items.push({
          label: dataset.label,
          value: hoveredPoint.value,
          color: getLeftDatasetColor(hoveredPoint.datasetIndex, dataset),
          datasetIndex: hoveredPoint.datasetIndex,
          axis: 'left',
        });
      } else {
        const dataset = data.rightDatasets[hoveredPoint.datasetIndex];
        items.push({
          label: dataset.label,
          value: hoveredPoint.value,
          color: getRightDatasetColor(hoveredPoint.datasetIndex, dataset),
          datasetIndex: hoveredPoint.datasetIndex,
          axis: 'right',
        });
      }
    }

    return {
      dataIndex,
      label: data.labels[dataIndex] || '',
      title: data.labels[dataIndex] || '',
      items,
    };
  }, [hoveredPoint, hoveredDataIndex, data, hiddenDatasets, verticalLine?.enabled]);

  const showTooltip =
    tooltip?.enabled !== false &&
    (verticalLine?.enabled ? hoveredDataIndex !== null : hoveredPoint !== null) &&
    tooltipContent;

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsDualAxesChartContainer, className)}
      style={style}
    >
      {/* 图例 */}
      {legend?.display !== false && (
        <div className={styles.zcpcyChatsLegend}>
          {data.leftDatasets.map((dataset, index) => {
            const key = `left-${index}`;
            const isHidden = hiddenDatasets.has(key) || dataset.hidden;
            const color = getLeftDatasetColor(index, dataset);
            const isColumn = dataset.type === 'column' || !dataset.type;
            return (
              <div
                key={key}
                className={classNames(styles.zcpcyChatsLegendItem, {
                  [styles.zcpcyChatsLegendDisabled]: isHidden,
                })}
                onClick={() => toggleDataset(key)}
              >
                <span
                  className={classNames(
                    isColumn ? styles.zcpcyChatsLegendColorBar : styles.zcpcyChatsLegendColor
                  )}
                  style={{ backgroundColor: color }}
                />
                <span>{dataset.label}</span>
              </div>
            );
          })}
          {data.rightDatasets.map((dataset, index) => {
            const key = `right-${index}`;
            const isHidden = hiddenDatasets.has(key) || dataset.hidden;
            const color = getRightDatasetColor(index, dataset);
            return (
              <div
                key={key}
                className={classNames(styles.zcpcyChatsLegendItem, {
                  [styles.zcpcyChatsLegendDisabled]: isHidden,
                })}
                onClick={() => toggleDataset(key)}
              >
                <span
                  className={styles.zcpcyChatsLegendColor}
                  style={{ backgroundColor: color }}
                />
                <span>{dataset.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsDualAxesChartCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* 提示框 */}
      {showTooltip && tooltipContent && (
        <div
          className={classNames(styles.zcpcyChatsTooltip, styles.zcpcyChatsTooltipVisible)}
          style={{
            left: tooltipPos.x + (verticalLine?.enabled ? 15 : 0),
            top: tooltipPos.y - (verticalLine?.enabled ? 0 : 50),
            transform: verticalLine?.enabled ? 'translate(0, -50%)' : 'translate(-50%, 0)',
            backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
          }}
        >
          {tooltip?.customContent ? (
            tooltip.customContent(tooltipContent)
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

export default DualAxes;
