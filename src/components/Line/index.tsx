/**
 * 折线图组件
 * 用于展示数据的连续变化趋势，适用于时间序列分析、数据对比等场景
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  LineProps,
  LineChartData,
  LineChartConfig,
  ComputedPoint,
  LineDataset,
  LineThresholdConfig,
} from './Line.type';

/**
 * 默认配置
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

const DEFAULT_CONFIG = {
  padding: 60,
  borderWidth: 2,
  pointRadius: 4,
  pointHoverRadius: 6,
  animationDuration: 1000,
  gridColor: '#e5e7eb',
  textColor: '#6b7280',
  axisColor: '#d1d5db',
  tooltipBackground: 'rgba(0, 0, 0, 0.8)',
  fontSize: 12,
  titleFontSize: 14,
};

/**
 * 获取数据集颜色
 */
const getDatasetColor = (index: number, dataset: LineDataset): string => {
  return dataset.borderColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: LineChartData,
  width: number,
  height: number,
  padding: number,
  yAxisMin?: number,
  yAxisMax?: number
): LineChartConfig => {
  const allValues = data.datasets.flatMap((d) => d.data);
  const maxValue = yAxisMax ?? Math.max(...allValues, 0);
  const minValue = yAxisMin ?? Math.min(...allValues, 0);
  const valueRange = maxValue - minValue || 1;

  return {
    padding,
    chartWidth: width - padding * 2,
    chartHeight: height - padding * 2,
    maxValue,
    minValue,
    valueRange,
  };
};

/**
 * 将数据值转换为 Y 坐标
 */
const valueToY = (value: number, config: LineChartConfig, height: number): number => {
  const normalizedValue = (value - config.minValue) / config.valueRange;
  return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 将数据索引转换为 X 坐标
 * @param index - 数据点索引（对应 labels 数组的索引）
 * @param config - 图表配置
 * @param labelsLength - 数据标签数量
 */
const indexToX = (index: number, config: LineChartConfig, labelsLength: number): number => {
  const dataCount = Math.max(1, labelsLength);
  const step = dataCount > 1 ? config.chartWidth / (dataCount - 1) : 0;
  return config.padding + index * step;
};

/**
 * 计算数据点坐标
 */
const computePoints = (
  data: LineChartData,
  config: LineChartConfig,
  width: number,
  height: number
): ComputedPoint[][] => {
  return data.datasets.map((dataset, datasetIndex) =>
    dataset.data.map((value, dataIndex) => ({
      x: indexToX(dataIndex, config, data.labels.length),
      y: valueToY(value, config, height),
      value,
      label: data.labels[dataIndex] || '',
      datasetIndex,
      dataIndex,
    }))
  );
};

/**
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: LineChartConfig,
  width: number,
  height: number,
  labels: string[],
  gridColor: string,
  textColor: string,
  fontSize: number,
  xAxisTitle?: string,
  yAxisTitle?: string
): void => {
  const { padding, chartWidth, chartHeight, maxValue, minValue } = config;

  ctx.strokeStyle = gridColor;
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // 绘制 X 轴网格线和标签
  const xStep = chartWidth / Math.max(1, labels.length - 1);
  labels.forEach((label, index) => {
    const x = padding + index * xStep;

    // 垂直网格线
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();

    // X 轴标签
    ctx.fillText(label, x, height - padding + 8);
  });

  // 绘制 Y 轴网格线和标签
  const yGridCount = 5;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= yGridCount; i++) {
    const ratio = i / yGridCount;
    const y = height - padding - ratio * chartHeight;
    const value = minValue + ratio * (maxValue - minValue);

    // 水平网格线
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();

    // Y 轴标签
    ctx.fillText(value.toFixed(0), padding - 8, y);
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
    // 将标题放在 Y 轴上方
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
  config: LineChartConfig,
  width: number,
  height: number,
  axisColor: string
): void => {
  const { padding } = config;

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1;

  // X 轴
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Y 轴
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();
};

/**
 * 绘制预警线
 */
const drawThresholdLine = (
  ctx: CanvasRenderingContext2D,
  config: LineChartConfig,
  width: number,
  height: number,
  threshold: LineThresholdConfig
): number => {
  const { padding, chartHeight, maxValue, minValue } = config;
  
  // 计算预警线在Y轴上的位置
  const normalizedValue = (threshold.value - minValue) / (maxValue - minValue || 1);
  const y = height - padding - normalizedValue * chartHeight;
  
  // 绘制预警线
  ctx.save();
  ctx.strokeStyle = threshold.lineColor || '#ef4444';
  ctx.lineWidth = threshold.lineWidth || 2;
  ctx.setLineDash([5, 5]); // 虚线样式
  
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  
  // 绘制预警线标签
  if (threshold.showLabel !== false) {
    ctx.fillStyle = threshold.lineColor || '#ef4444';
    ctx.font = `bold ${DEFAULT_CONFIG.fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      threshold.label || `预警值: ${threshold.value}`,
      width - padding,
      y - 4
    );
  }
  
  ctx.restore();
  
  return y;
};

/**
 * 根据预警阈值分割数据点
 * 返回分割后的线段数组，每个线段包含点数组和是否在阈值上方的标志
 */
const splitPointsByThreshold = (
  points: ComputedPoint[],
  thresholdValue: number
): Array<{ points: ComputedPoint[]; isAbove: boolean }> => {
  if (points.length < 2) return [{ points, isAbove: points[0]?.value >= thresholdValue }];
  
  const segments: Array<{ points: ComputedPoint[]; isAbove: boolean }> = [];
  let currentSegment: ComputedPoint[] = [points[0]];
  let currentIsAbove = points[0].value >= thresholdValue;
  
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currPoint = points[i];
    const currIsAbove = currPoint.value >= thresholdValue;
    
    // 如果跨越了阈值，需要计算交点并分割
    if ((prevPoint.value >= thresholdValue) !== (currPoint.value >= thresholdValue)) {
      // 计算与预警线的交点
      const ratio = (thresholdValue - prevPoint.value) / (currPoint.value - prevPoint.value);
      const intersectX = prevPoint.x + ratio * (currPoint.x - prevPoint.x);
      const intersectY = prevPoint.y + ratio * (currPoint.y - prevPoint.y);
      
      const intersectPoint: ComputedPoint = {
        x: intersectX,
        y: intersectY,
        value: thresholdValue,
        label: '',
        datasetIndex: prevPoint.datasetIndex,
        dataIndex: -1, // 标记为交点
      };
      
      // 结束当前线段
      currentSegment.push(intersectPoint);
      segments.push({ points: [...currentSegment], isAbove: currentIsAbove });
      
      // 开始新线段
      currentSegment = [intersectPoint, currPoint];
      currentIsAbove = currIsAbove;
    } else {
      currentSegment.push(currPoint);
    }
  }
  
  // 添加最后一个线段
  if (currentSegment.length > 0) {
    segments.push({ points: currentSegment, isAbove: currentIsAbove });
  }
  
  return segments;
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

    if (i === 1) {
      // 第一个线段使用二次贝塞尔曲线
      const cpX = (prev.x + curr.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cpX, (prev.y + curr.y) / 2);
    }

    if (next) {
      // 使用三次贝塞尔曲线创建平滑连接
      const cp1X = prev.x + (curr.x - prev.x) * 0.5;
      const cp1Y = prev.y;
      const cp2X = curr.x - (next.x - curr.x) * 0.5;
      const cp2Y = curr.y;
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, curr.x, curr.y);
    } else {
      // 最后一个点
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
  dataset: LineDataset,
  datasetIndex: number,
  isHovered: boolean
): void => {
  if (dataset.pointStyle === 'none') return;

  const radius = isHovered
    ? DEFAULT_CONFIG.pointHoverRadius
    : dataset.pointRadius || DEFAULT_CONFIG.pointRadius;
  const borderColor = dataset.pointBorderColor || getDatasetColor(datasetIndex, dataset);
  const backgroundColor = dataset.pointBackgroundColor || '#fff';

  points.forEach((point) => {
    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;

    ctx.beginPath();

    switch (dataset.pointStyle) {
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
 * 绘制图例
 * 返回图例点击区域信息
 */
const drawLegend = (
  ctx: CanvasRenderingContext2D,
  data: LineChartData,
  width: number,
  config: LineChartConfig,
  textColor: string,
  fontSize: number,
  hiddenDatasets: Set<number>,
  datasetOpacity: (index: number) => number
): Array<{ x: number; y: number; width: number; height: number; datasetIndex: number }> => {
  const legendY = config.padding / 2;
  const itemSpacing = 100;
  const totalWidth = data.datasets.length * itemSpacing;
  const startX = (width - totalWidth) / 2 + 30;
  const hitAreas: Array<{ x: number; y: number; width: number; height: number; datasetIndex: number }> = [];

  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  data.datasets.forEach((dataset, index) => {
    const x = startX + index * itemSpacing;
    const color = getDatasetColor(index, dataset);
    const opacity = datasetOpacity(index);
    const isHidden = opacity < 0.5;

    // 测量文字宽度
    const textWidth = ctx.measureText(dataset.label).width;
    const hitAreaPadding = 8;
    const hitAreaX = x - 25 - hitAreaPadding;
    const hitAreaWidth = 20 + textWidth + hitAreaPadding * 2;
    const hitAreaHeight = fontSize + hitAreaPadding * 2;

    // 存储点击区域
    hitAreas.push({
      x: hitAreaX,
      y: legendY - hitAreaHeight / 2,
      width: hitAreaWidth,
      height: hitAreaHeight,
      datasetIndex: index,
    });

    ctx.save();
    ctx.globalAlpha = isHidden ? 0.3 : 1;

    // 绘制线条
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 25, legendY);
    ctx.lineTo(x - 5, legendY);
    ctx.stroke();

    // 绘制文字
    ctx.fillStyle = textColor;
    ctx.fillText(dataset.label, x, legendY);

    // 隐藏时绘制删除线
    if (isHidden) {
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 25, legendY);
      ctx.lineTo(x + textWidth, legendY);
      ctx.stroke();
    }

    ctx.restore();
  });

  return hitAreas;
};

/**
 * 折线图组件
 */
export const Line: React.FC<LineProps> = ({
  data,
  width = 600,
  height = 400,
  padding = DEFAULT_CONFIG.padding,
  xAxis,
  yAxis,
  legend,
  tooltip,
  threshold,
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
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);
  // 存储隐藏的数据集索引
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
  // 存储数据集的动画透明度（用于显示/隐藏动画）
  const datasetOpacityRef = useRef<Map<number, number>>(new Map());
  // 存储正在动画过渡中的数据集
  const animatingDatasetsRef = useRef<Set<number>>(new Set());
  // 用于触发透明度动画重绘
  const [opacityVersion, setOpacityVersion] = useState(0);

  const pointsRef = useRef<ComputedPoint[][]>([]);
  // 存储图例点击区域
  const legendHitAreasRef = useRef<Array<{ x: number; y: number; width: number; height: number; datasetIndex: number }>>([]);

  // 动画持续时间（毫秒）
  const ANIMATION_DURATION = 300;

  // 获取数据集的当前透明度
  const getDatasetOpacity = useCallback((datasetIndex: number): number => {
    if (hiddenDatasets.has(datasetIndex)) {
      return datasetOpacityRef.current.get(datasetIndex) ?? 0;
    }
    return datasetOpacityRef.current.get(datasetIndex) ?? 1;
  }, [hiddenDatasets, opacityVersion]);

  // 计算图表配置
  const chartConfig = useMemo(
    () => calculateChartConfig(data, width, height, padding, yAxis?.min, yAxis?.max),
    [data, width, height, padding, yAxis?.min, yAxis?.max]
  );

  // 计算所有数据点
  const allPoints = useMemo(
    () => computePoints(data, chartConfig, width, height),
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
      }
    };
    requestAnimationFrame(animate);
  }, [animationDuration, data]);

  // 绘制图表
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格（始终显示）
    drawGrid(
      ctx,
      chartConfig,
      width,
      height,
      data.labels,
      xAxis?.gridColor || DEFAULT_CONFIG.gridColor,
      xAxis?.tickColor || DEFAULT_CONFIG.textColor,
      xAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
      xAxis?.display !== false ? xAxis?.title?.text : undefined,
      yAxis?.display !== false ? yAxis?.title?.text : undefined
    );

    // 绘制坐标轴
    drawAxes(ctx, chartConfig, width, height, xAxis?.gridColor || DEFAULT_CONFIG.axisColor);

    // 绘制预警线（如果配置存在）
    let thresholdY = -1;
    if (threshold) {
      thresholdY = drawThresholdLine(ctx, chartConfig, width, height, threshold);
    }

    // 绘制数据线（支持透明度动画和预警线颜色分割）
    data.datasets.forEach((dataset, datasetIndex) => {
      const opacity = getDatasetOpacity(datasetIndex);
      // 跳过完全透明的数据集
      if (opacity <= 0.01) return;

      const fullPoints = allPoints[datasetIndex];
      if (!fullPoints || fullPoints.length === 0) return;

      // 根据动画进度截取点
      const visibleCount = Math.max(1, Math.floor(fullPoints.length * animationProgress));
      const points = fullPoints.slice(0, visibleCount);

      if (points.length < 2) return;

      const defaultColor = getDatasetColor(datasetIndex, dataset);
      const lineWidth = dataset.borderWidth || DEFAULT_CONFIG.borderWidth;

      ctx.save();
      ctx.globalAlpha = opacity;

      // 如果配置了预警线，根据阈值分割线条
      if (threshold) {
        const segments = splitPointsByThreshold(points, threshold.value);
        
        segments.forEach((segment) => {
          if (segment.points.length < 2) return;
          
          // 根据是否在阈值上方选择颜色
          // 上方（包括等于）使用预警颜色，下方使用默认颜色
          const segmentColor = segment.isAbove
            ? (threshold.aboveLineColor || '#ef4444')  // 预警颜色，默认红色
            : (threshold.belowLineColor || defaultColor);  // 正常颜色
          
          // 绘制线条
          if (smooth) {
            drawSmoothLine(ctx, segment.points, segmentColor, lineWidth);
          } else {
            drawStraightLine(ctx, segment.points, segmentColor, lineWidth);
          }
        });

        // 绘制上方区域的填充（如果配置）
        if (threshold.aboveFillColor) {
          const abovePoints = points.filter((p) => p.value >= threshold.value);
          if (abovePoints.length >= 2) {
            drawFillArea(ctx, abovePoints, threshold.aboveFillColor, height, padding);
          }
        }
      } else {
        // 没有预警线时的正常绘制
        // 绘制填充区域
        if (dataset.fill && dataset.backgroundColor) {
          drawFillArea(ctx, points, dataset.backgroundColor, height, padding);
        }

        // 绘制线条
        if (smooth) {
          drawSmoothLine(ctx, points, defaultColor, lineWidth);
        } else {
          drawStraightLine(ctx, points, defaultColor, lineWidth);
        }
      }

      // 绘制数据点（只在动画完成时显示）
      if (animationProgress >= 1) {
        drawPoints(ctx, points, dataset, datasetIndex, false);
      }

      ctx.restore();
    });

    // 绘制高亮点（只对可见数据集）
    const hoveredOpacity = hoveredPoint ? getDatasetOpacity(hoveredPoint.datasetIndex) : 0;
    if (hoveredPoint && animationProgress >= 1 && hoveredOpacity > 0.01) {
      ctx.save();
      ctx.globalAlpha = hoveredOpacity;
      ctx.fillStyle = getDatasetColor(hoveredPoint.datasetIndex, data.datasets[hoveredPoint.datasetIndex]);
      ctx.beginPath();
      ctx.arc(hoveredPoint.x, hoveredPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 绘制图例
    if (legend?.display !== false) {
      legendHitAreasRef.current = drawLegend(
        ctx,
        data,
        width,
        chartConfig,
        legend?.labelColor || DEFAULT_CONFIG.textColor,
        legend?.labelFontSize || DEFAULT_CONFIG.fontSize,
        hiddenDatasets,
        getDatasetOpacity
      );
    }

    // 保存计算的点用于交互
    pointsRef.current = allPoints;

    if (isLoading) {
      setIsLoading(false);
      onChartReady?.();
    }
  }, [
    data,
    width,
    height,
    padding,
    chartConfig,
    allPoints,
    xAxis,
    yAxis,
    legend,
    smooth,
    threshold,
    animationProgress,
    hoveredPoint,
    isLoading,
    onChartReady,
    getDatasetOpacity,
  ]);

  useEffect(() => {
    drawChart();
  }, [drawChart, opacityVersion]);

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || animationProgress < 1) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否在图例区域
      const isLegendArea = y < chartConfig.padding / 2 + 15 && y > chartConfig.padding / 2 - 15;
      if (isLegendArea) {
        canvas.style.cursor = legendHitAreasRef.current.some(
          (area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
        ) ? 'pointer' : 'default';
      } else {
        canvas.style.cursor = 'default';
      }

      // 查找最近的数据点（只对可见数据集）
      let closestPoint: ComputedPoint | null = null;
      let minDistance = Infinity;

      pointsRef.current.forEach((datasetPoints, datasetIndex) => {
        // 使用透明度判断数据集是否可见
        const opacity = getDatasetOpacity(datasetIndex);
        if (opacity < 0.1) return;
        datasetPoints.forEach((point) => {
          const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
          if (distance < 20 && distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        });
      });

      setHoveredPoint(closestPoint);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [animationProgress, chartConfig.padding, getDatasetOpacity]
  );

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  }, []);

  // 执行透明度动画
  const animateOpacity = useCallback((datasetIndex: number, targetOpacity: number) => {
    const startTime = Date.now();
    const startOpacity = datasetOpacityRef.current.get(datasetIndex) ?? (targetOpacity === 0 ? 1 : 0);
    animatingDatasetsRef.current.add(datasetIndex);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      // 使用 easeInOutCubic 缓动函数
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentOpacity = startOpacity + (targetOpacity - startOpacity) * eased;
      datasetOpacityRef.current.set(datasetIndex, currentOpacity);

      // 触发重绘
      setOpacityVersion(v => v + 1);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        datasetOpacityRef.current.set(datasetIndex, targetOpacity);
        animatingDatasetsRef.current.delete(datasetIndex);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // 处理点击
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // 首先检查是否点击了图例
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否点击了图例项
      const hitArea = legendHitAreasRef.current.find(
        (area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
      );

      if (hitArea) {
        // 点击了图例，切换显示/隐藏（带动画）
        const datasetIndex = hitArea.datasetIndex;
        const isCurrentlyHidden = hiddenDatasets.has(datasetIndex);

        // 更新隐藏状态
        setHiddenDatasets((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(datasetIndex)) {
            newSet.delete(datasetIndex);
          } else {
            newSet.add(datasetIndex);
          }
          return newSet;
        });

        // 执行透明度动画
        animateOpacity(datasetIndex, isCurrentlyHidden ? 1 : 0);
        return;
      }

      // 点击了数据点
      if (!hoveredPoint || !onDataClick) return;
      onDataClick(hoveredPoint.datasetIndex, hoveredPoint.dataIndex, hoveredPoint.value);
    },
    [hoveredPoint, onDataClick, hiddenDatasets, animateOpacity]
  );

  // 生成提示框内容
  const tooltipContent = useMemo(() => {
    if (!hoveredPoint) return null;

    const dataset = data.datasets[hoveredPoint.datasetIndex];
    return {
      title: hoveredPoint.label,
      label: dataset.label,
      value: hoveredPoint.value,
      color: getDatasetColor(hoveredPoint.datasetIndex, dataset),
    };
  }, [hoveredPoint, data]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsLineChartContainer, className)}
      style={{ ...style, width, height }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsLineChartCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* 提示框 */}
      {tooltip?.enabled !== false && tooltipContent && hoveredPoint && (
        <div
          className={classNames(styles.zcpcyChatsTooltip, styles.zcpcyChatsTooltipVisible)}
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y - 40,
            backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
          }}
        >
          <div
            className={styles.zcpcyChatsTooltipTitle}
            style={{ color: tooltip?.titleColor || '#fff' }}
          >
            {tooltipContent.title}
          </div>
          <div className={styles.zcpcyChatsTooltipItem}>
            <span
              className={styles.zcpcyChatsTooltipColor}
              style={{ backgroundColor: tooltipContent.color }}
            />
            <span style={{ color: tooltip?.bodyColor || '#fff' }}>
              {tooltipContent.label}: {tooltipContent.value}
            </span>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && <div className={styles.zcpcyChatsLoading}>加载中...</div>}
    </div>
  );
};

export default Line;
