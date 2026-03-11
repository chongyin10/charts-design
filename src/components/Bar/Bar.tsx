/**
 * 条形图组件
 * 用于展示不同类别之间的数据比较，支持分组和堆叠模式
 * 与 Column 柱状图的区别：条形图为水平方向，Column 为垂直方向
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  BarProps,
  BarChartData,
  BarChartConfig,
  ComputedBar,
  BarDataset,
  BarTooltipItem,
} from './Bar.type';

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
 * 获取数据集颜色
 */
const getDatasetColor = (index: number, dataset: BarDataset): string => {
  return dataset.backgroundColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: BarChartData,
  width: number,
  height: number,
  padding: number,
  stacked: boolean,
  xAxisMin?: number,
  xAxisMax?: number
): BarChartConfig => {
  let maxValue: number;
  let minValue: number;

  if (stacked) {
    // 堆叠模式：计算每个分类的总和的最大值
    const stackTotals = data.labels.map((_, index) => {
      return data.datasets.reduce((sum, dataset) => sum + (dataset.data[index] || 0), 0);
    });
    maxValue = xAxisMax ?? Math.max(...stackTotals, 0);
    minValue = xAxisMin ?? Math.min(0, ...stackTotals);
  } else {
    // 分组模式：计算所有数据中的最大值
    const allValues = data.datasets.flatMap((d) => d.data);
    maxValue = xAxisMax ?? Math.max(...allValues, 0);
    minValue = xAxisMin ?? Math.min(0, ...allValues);
  }

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
 * 将数据值转换为 X 坐标
 * @param value 数据值
 * @param config 图表配置
 * @param padding 内边距
 * @param yAxisPosition Y轴位置，'left' 或 'right'
 */
const valueToX = (value: number, config: BarChartConfig, padding: number, yAxisPosition: 'left' | 'right' = 'left'): number => {
  const normalizedValue = (value - config.minValue) / config.valueRange;
  if (yAxisPosition === 'right') {
    // 从右侧开始，X 坐标从右向左递增
    return padding + config.chartWidth - normalizedValue * config.chartWidth;
  }
  // 默认从左侧开始
  return padding + normalizedValue * config.chartWidth;
};

/**
 * 将数据值转换为宽度
 */
const valueToWidth = (value: number, config: BarChartConfig): number => {
  const normalizedValue = Math.abs(value) / config.valueRange;
  return normalizedValue * config.chartWidth;
};

/**
 * 计算条形数据
 */
const computeBars = (
  data: BarChartData,
  config: BarChartConfig,
  width: number,
  height: number,
  stacked: boolean,
  barHeight: number,
  barSpacing: number,
  yAxisPosition: 'left' | 'right' = 'left'
): ComputedBar[][] => {
  const { padding, chartWidth, chartHeight, minValue, maxValue, valueRange } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const datasetCount = data.datasets.length;

  const categoryHeight = chartHeight / categoryCount;
  const effectiveBarHeight = categoryHeight * barHeight;

  // 存储堆叠状态下的累计宽度
  const stackAccumulated: number[] = new Array(categoryCount).fill(0);
  const stackAccumulatedRight: number[] = new Array(categoryCount).fill(0);

  return data.datasets.map((dataset, datasetIndex) => {
    return dataset.data.map((value, dataIndex) => {
      let barY: number;
      let barHeight_actual: number;

      if (stacked) {
        // 堆叠模式：所有数据集共用同一 Y 位置
        barY = padding + dataIndex * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;
        barHeight_actual = effectiveBarHeight;
      } else {
        // 分组模式：每个数据集在分类内有自己的位置
        const groupHeight = effectiveBarHeight;
        const singleBarHeight = (groupHeight - (datasetCount - 1) * barSpacing) / datasetCount;
        const groupStartY = padding + dataIndex * categoryHeight + (categoryHeight - groupHeight) / 2;
        barY = groupStartY + datasetIndex * (singleBarHeight + barSpacing);
        barHeight_actual = singleBarHeight;
      }

      let barX: number;
      let barWidth: number;

      if (stacked) {
        // 堆叠模式：基于累计宽度计算位置
        const normalizedValue = (value - minValue) / valueRange;
        barWidth = normalizedValue * chartWidth;

        if (yAxisPosition === 'right') {
          // 从右侧开始堆叠
          const normalizedAccumulated = (stackAccumulatedRight[dataIndex] - minValue) / valueRange;
          barX = padding + chartWidth - normalizedAccumulated * chartWidth - barWidth;
          stackAccumulatedRight[dataIndex] += value;
        } else {
          // 从左侧开始堆叠
          const normalizedAccumulated = (stackAccumulated[dataIndex] - minValue) / valueRange;
          barX = padding + normalizedAccumulated * chartWidth;
          stackAccumulated[dataIndex] += value;
        }
      } else {
        // 分组模式
        barWidth = valueToWidth(value, config);
        if (yAxisPosition === 'right') {
          // 从右侧开始
          const zeroX = minValue < 0 ? valueToX(0, config, padding, 'right') : padding + chartWidth;
          barX = zeroX - barWidth;
        } else {
          // 从左侧开始（默认）
          barX = minValue < 0 ? valueToX(0, config, padding, 'left') : padding;
        }
      }

      return {
        x: barX,
        y: barY,
        width: barWidth,
        height: barHeight_actual,
        value,
        label: data.labels[dataIndex] || '',
        datasetIndex,
        dataIndex,
        color: getDatasetColor(datasetIndex, dataset),
      };
    });
  });
};

/**
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: BarChartConfig,
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
  yAxisPosition: 'left' | 'right' = 'left'
): void => {
  const { padding, chartWidth, chartHeight, maxValue, minValue } = config;

  const showGrid = xAxisGrid?.display !== false || yAxisGrid?.display !== false;
  const defaultGridColor = '#e5e7eb';
  const defaultLineWidth = 1;
  const defaultOpacity = 1;

  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;

  // 绘制 Y 轴标签（分类标签）
  const categoryHeight = chartHeight / Math.max(1, labels.length);
  const tickInterval = Math.max(1, yAxisTickInterval || 1);

  // 根据 Y 轴位置调整标签对齐方式
  ctx.textAlign = yAxisPosition === 'right' ? 'left' : 'right';
  ctx.textBaseline = 'middle';

  labels.forEach((label, index) => {
    if (index % tickInterval !== 0) return;
    const y = padding + index * categoryHeight + categoryHeight / 2;
    const labelX = yAxisPosition === 'right' ? width - padding + 8 : padding - 8;
    ctx.fillText(label, labelX, y);
  });

  // 绘制 X 轴标签（数值标签）
  const xGridCount = 5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = 0; i <= xGridCount; i++) {
    const ratio = i / xGridCount;
    const x = yAxisPosition === 'right'
      ? width - padding - ratio * chartWidth
      : padding + ratio * chartWidth;
    const value = yAxisPosition === 'right'
      ? maxValue - ratio * (maxValue - minValue)
      : minValue + ratio * (maxValue - minValue);
    ctx.fillText(value.toFixed(0), x, height - padding + 8);
  }

  // 绘制 Y 轴刻度尺
  ctx.save();
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  labels.forEach((_, index) => {
    if (index % tickInterval !== 0) return;
    const y = padding + index * categoryHeight + categoryHeight / 2;
    ctx.beginPath();
    if (yAxisPosition === 'right') {
      ctx.moveTo(width - padding, y);
      ctx.lineTo(width - padding + 6, y);
    } else {
      ctx.moveTo(padding - 6, y);
      ctx.lineTo(padding, y);
    }
    ctx.stroke();
  });
  ctx.restore();

  // 绘制 X 轴刻度尺
  ctx.save();
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  for (let i = 0; i <= xGridCount; i++) {
    const ratio = i / xGridCount;
    const x = yAxisPosition === 'right'
      ? width - padding - ratio * chartWidth
      : padding + ratio * chartWidth;
    ctx.beginPath();
    ctx.moveTo(x, height - padding);
    ctx.lineTo(x, height - padding + 6);
    ctx.stroke();
  }
  ctx.restore();

  // 绘制水平网格线
  const showHorizontalGrid = yAxisGrid?.horizontal !== false && showGrid;
  if (showHorizontalGrid) {
    ctx.save();
    ctx.strokeStyle = yAxisGrid?.color || defaultGridColor;
    ctx.lineWidth = yAxisGrid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = yAxisGrid?.opacity ?? defaultOpacity;

    labels.forEach((_, index) => {
      const y = padding + index * categoryHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
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

    for (let i = 0; i <= xGridCount; i++) {
      const ratio = i / xGridCount;
      const x = yAxisPosition === 'right'
        ? width - padding - ratio * chartWidth
        : padding + ratio * chartWidth;
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
    const titleX = yAxisPosition === 'right' ? width - padding : padding;
    ctx.fillText(yAxisTitle, titleX, padding - 10);
    ctx.restore();
  }
};

/**
 * 绘制坐标轴
 */
const drawAxes = (
  ctx: CanvasRenderingContext2D,
  config: BarChartConfig,
  width: number,
  height: number,
  axisColor: string,
  yAxisPosition: 'left' | 'right' = 'left'
): void => {
  const { padding } = config;

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1;

  // X 轴
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Y 轴 - 根据位置绘制在左侧或右侧
  ctx.beginPath();
  if (yAxisPosition === 'right') {
    ctx.moveTo(width - padding, padding);
    ctx.lineTo(width - padding, height - padding);
  } else {
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
  }
  ctx.stroke();
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
 * 绘制条形
 */
const drawBars = (
  ctx: CanvasRenderingContext2D,
  bars: ComputedBar[],
  dataset: BarDataset,
  datasetIndex: number,
  animationProgress: number,
  defaultBorderRadius: number | number[]
): void => {
  const borderRadius = dataset.borderRadius ?? defaultBorderRadius;
  const borderColor = dataset.borderColor;
  const borderWidth = dataset.borderWidth ?? DEFAULT_CONFIG.borderWidth;

  bars.forEach((bar) => {
    // 根据动画进度调整宽度
    const animatedWidth = bar.width * animationProgress;

    // 绘制条形
    ctx.fillStyle = bar.color;
    drawRoundedRect(ctx, bar.x, bar.y, animatedWidth, bar.height, borderRadius);
    ctx.fill();

    // 绘制边框
    if (borderColor && borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();
    }
  });
};

/**
 * 绘制高亮条形
 */
const drawHighlightedBar = (
  ctx: CanvasRenderingContext2D,
  bar: ComputedBar,
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
 * 条形图组件
 */
export const Bar: React.FC<BarProps> = ({
  data,
  width = 600,
  height = 400,
  padding = DEFAULT_CONFIG.padding,
  xAxis,
  yAxis,
  legend,
  tooltip,
  bar,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  stacked = false,
  className,
  style,
  onDataClick,
  onChartReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<ComputedBar | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
  const datasetOpacityRef = useRef<Map<number, number>>(new Map());
  const animatingDatasetsRef = useRef<Set<number>>(new Set());
  const [opacityVersion, setOpacityVersion] = useState(0);

  const barsRef = useRef<ComputedBar[][]>([]);
  const ANIMATION_DURATION = 300;

  const getDatasetOpacity = useCallback((datasetIndex: number): number => {
    return datasetOpacityRef.current.get(datasetIndex) ?? 1;
  }, [opacityVersion]);

  // 确定 Y 轴位置，默认为 'left'
  const yAxisPosition = yAxis?.position === 'right' ? 'right' : 'left';

  // 计算图表配置
  const chartConfig = useMemo(
    () => calculateChartConfig(data, width, height, padding, stacked, xAxis?.min, xAxis?.max),
    [data, width, height, padding, stacked, xAxis?.min, xAxis?.max]
  );

  // 计算所有条形
  const allBars = useMemo(
    () => computeBars(
      data,
      chartConfig,
      width,
      height,
      stacked,
      bar?.height ?? DEFAULT_CONFIG.barHeight,
      bar?.spacing ?? DEFAULT_CONFIG.barSpacing,
      yAxisPosition
    ),
    [data, chartConfig, width, height, stacked, bar?.height, bar?.spacing, yAxisPosition]
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

    // 绘制网格
    drawGrid(
      ctx,
      chartConfig,
      width,
      height,
      data.labels,
      yAxis?.tickColor || DEFAULT_CONFIG.textColor,
      yAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
      xAxis?.display !== false ? xAxis?.title?.text : undefined,
      yAxis?.display !== false ? yAxis?.title?.text : undefined,
      xAxis?.grid,
      yAxis?.grid,
      yAxis?.tickInterval,
      yAxisPosition
    );

    // 绘制坐标轴
    drawAxes(ctx, chartConfig, width, height, xAxis?.grid?.color || DEFAULT_CONFIG.axisColor, yAxisPosition);

    // 绘制条形
    data.datasets.forEach((dataset, datasetIndex) => {
      const opacity = getDatasetOpacity(datasetIndex);
      if (opacity <= 0.01) return;

      const bars = allBars[datasetIndex];
      if (!bars || bars.length === 0) return;

      ctx.save();
      ctx.globalAlpha = opacity;

      drawBars(
        ctx,
        bars,
        dataset,
        datasetIndex,
        animationProgress,
        bar?.borderRadius ?? DEFAULT_CONFIG.borderRadius
      );

      ctx.restore();
    });

    // 绘制高亮条形
    if (hoveredBar && animationProgress >= 1) {
      const hoveredOpacity = getDatasetOpacity(hoveredBar.datasetIndex);
      if (hoveredOpacity > 0.01) {
        drawHighlightedBar(
          ctx,
          hoveredBar,
          bar?.borderRadius ?? DEFAULT_CONFIG.borderRadius
        );
      }
    }

    // 保存计算的数据用于交互
    barsRef.current = allBars;

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
    allBars,
    xAxis,
    yAxis,
    legend,
    bar,
    animationProgress,
    hoveredBar,
    isLoading,
    onChartReady,
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

      // 查找鼠标下的条形
      let closestBar: ComputedBar | null = null;

      barsRef.current.forEach((datasetBars, datasetIndex) => {
        const opacity = getDatasetOpacity(datasetIndex);
        if (opacity < 0.1) return;

        datasetBars.forEach((bar) => {
          if (
            x >= bar.x &&
            x <= bar.x + bar.width &&
            y >= bar.y &&
            y <= bar.y + bar.height
          ) {
            closestBar = bar;
          }
        });
      });

      setHoveredBar(closestBar);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      // 更改鼠标样式
      canvas.style.cursor = closestBar ? 'pointer' : 'default';
    },
    [animationProgress, getDatasetOpacity]
  );

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setHoveredBar(null);
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
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentOpacity = startOpacity + (targetOpacity - startOpacity) * eased;
      datasetOpacityRef.current.set(datasetIndex, currentOpacity);
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
      if (!hoveredBar || !onDataClick) return;
      onDataClick(hoveredBar.datasetIndex, hoveredBar.dataIndex, hoveredBar.value);
    },
    [hoveredBar, onDataClick]
  );

  // 生成提示框内容
  const tooltipContent = useMemo(() => {
    if (!hoveredBar) return null;

    const dataset = data.datasets[hoveredBar.datasetIndex];
    return {
      dataIndex: hoveredBar.dataIndex,
      label: hoveredBar.label,
      title: hoveredBar.label,
      items: [{
        label: dataset.label,
        value: hoveredBar.value,
        color: hoveredBar.color,
        datasetIndex: hoveredBar.datasetIndex,
      }],
    };
  }, [hoveredBar, data]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsBarChartContainer, className)}
      style={{ ...style, width }}
    >
      {/* 图例区域 */}
      {legend?.display !== false && data.datasets.length > 0 && (
        <div
          className={styles.zcpcyChatsLegend}
          style={{
            justifyContent: legend?.position === 'bottom' ? 'center' : 'center',
            marginBottom: legend?.position === 'bottom' ? 0 : 12,
            marginTop: legend?.position === 'top' ? 0 : 12,
            order: legend?.position === 'bottom' ? 2 : 0,
          }}
        >
          {data.datasets.map((dataset, index) => {
            const color = getDatasetColor(index, dataset);
            const isHidden = hiddenDatasets.has(index);
            return (
              <div
                key={index}
                className={classNames(
                  styles.zcpcyChatsLegendItem,
                  isHidden && styles.zcpcyChatsLegendDisabled
                )}
                onClick={() => {
                  const currentOpacity = datasetOpacityRef.current.get(index) ?? 1;
                  const isCurrentlyVisible = currentOpacity > 0.5;
                  setHiddenDatasets((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(index)) {
                      newSet.delete(index);
                    } else {
                      newSet.add(index);
                    }
                    return newSet;
                  });
                  animateOpacity(index, isCurrentlyVisible ? 0 : 1);
                }}
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
        className={styles.zcpcyChatsBarChartCanvas}
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

export default Bar;
