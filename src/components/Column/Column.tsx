/**
 * 柱状图组件
 * 用于展示不同类别之间的数据比较，支持分组和堆叠模式
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  ColumnProps,
  ColumnChartData,
  ColumnChartConfig,
  ComputedColumn,
  ColumnDataset,
  ColumnTooltipItem,
} from './Column.type';

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
  columnWidth: 0.7,
  columnSpacing: 4,
};

/**
 * 获取数据集颜色
 */
const getDatasetColor = (index: number, dataset: ColumnDataset): string => {
  return dataset.backgroundColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: ColumnChartData,
  width: number,
  height: number,
  padding: number,
  stacked: boolean,
  yAxisMin?: number,
  yAxisMax?: number
): ColumnChartConfig => {
  let maxValue: number;
  let minValue: number;

  if (stacked) {
    // 堆叠模式：计算每个分类的总和的最大值
    const stackTotals = data.labels.map((_, index) => {
      return data.datasets.reduce((sum, dataset) => sum + (dataset.data[index] || 0), 0);
    });
    maxValue = yAxisMax ?? Math.max(...stackTotals, 0);
    minValue = yAxisMin ?? Math.min(0, ...stackTotals);
  } else {
    // 分组模式：计算所有数据中的最大值
    const allValues = data.datasets.flatMap((d) => d.data);
    maxValue = yAxisMax ?? Math.max(...allValues, 0);
    minValue = yAxisMin ?? Math.min(0, ...allValues);
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
 * 将数据值转换为 Y 坐标
 */
const valueToY = (value: number, config: ColumnChartConfig, height: number): number => {
  const normalizedValue = (value - config.minValue) / config.valueRange;
  return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 将数据值转换为高度
 */
const valueToHeight = (value: number, config: ColumnChartConfig, height: number): number => {
  const normalizedValue = Math.abs(value) / config.valueRange;
  return normalizedValue * config.chartHeight;
};

/**
 * 计算柱体数据
 */
const computeColumns = (
  data: ColumnChartData,
  config: ColumnChartConfig,
  width: number,
  height: number,
  stacked: boolean,
  columnWidth: number,
  columnSpacing: number,
  visibleDatasetIndices: number[] = data.datasets.map((_, i) => i)
): ComputedColumn[][] => {
  const { padding, chartWidth, minValue } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const datasetCount = data.datasets.length;

  const categoryWidth = chartWidth / categoryCount;
  const effectiveColumnWidth = categoryWidth * columnWidth;

  // 存储堆叠状态下的累计高度（只针对可见数据集）
  const stackAccumulated: number[] = new Array(categoryCount).fill(0);
  
  // 预计算每个分类的可见数据集累计值，用于确定 Y 轴起始位置
  if (stacked) {
    for (let dataIndex = 0; dataIndex < categoryCount; dataIndex++) {
      let accumulated = 0;
      for (let datasetIndex = 0; datasetIndex < datasetCount; datasetIndex++) {
        if (visibleDatasetIndices.includes(datasetIndex)) {
          const dataset = data.datasets[datasetIndex];
          accumulated += dataset.data[dataIndex] || 0;
        }
      }
      stackAccumulated[dataIndex] = accumulated;
    }
  }

  return data.datasets.map((dataset, datasetIndex) => {
    return dataset.data.map((value, dataIndex) => {
      let columnX: number;
      let columnWidth_actual: number;

      if (stacked) {
        // 堆叠模式：所有数据集共用同一 X 位置
        columnX = padding + dataIndex * categoryWidth + (categoryWidth - effectiveColumnWidth) / 2;
        columnWidth_actual = effectiveColumnWidth;
      } else {
        // 分组模式：只考虑可见数据集
        const visibleDatasetsInGroup = visibleDatasetIndices.filter(i => i >= 0 && i < datasetCount);
        const visibleIndex = visibleDatasetsInGroup.indexOf(datasetIndex);
        
        if (visibleIndex === -1) {
          // 当前数据集不可见，返回默认位置（会被隐藏）
          columnX = padding;
          columnWidth_actual = 0;
        } else {
          // 根据可见数据集数量重新计算柱体宽度和位置
          const visibleCount = visibleDatasetsInGroup.length;
          const groupWidth = effectiveColumnWidth;
          const singleColumnWidth = (groupWidth - (visibleCount - 1) * columnSpacing) / visibleCount;
          const groupStartX = padding + dataIndex * categoryWidth + (categoryWidth - groupWidth) / 2;
          columnX = groupStartX + visibleIndex * (singleColumnWidth + columnSpacing);
          columnWidth_actual = singleColumnWidth;
        }
      }

      let columnY: number;
      let columnHeight: number;

      if (stacked) {
        if (visibleDatasetIndices.includes(datasetIndex)) {
          // 当前数据集可见，重新计算其在可见堆叠中的位置
          // 需要计算在此数据集之前有多少可见数据集的值
          let visibleAccumulated = 0;
          for (let i = 0; i < datasetIndex; i++) {
            if (visibleDatasetIndices.includes(i)) {
              visibleAccumulated += data.datasets[i].data[dataIndex] || 0;
            }
          }
          
          // 计算当前数据集的值
          const currentValue = value;
          
          // 归一化计算
          const normalizedValue = (currentValue - minValue) / config.valueRange;
          const normalizedAccumulated = (visibleAccumulated - minValue) / config.valueRange;
          
          columnHeight = normalizedValue * config.chartHeight;
          columnY = height - padding - normalizedAccumulated * config.chartHeight - columnHeight;
        } else {
          // 当前数据集不可见，返回零高度的柱体
          columnHeight = 0;
          columnY = height - padding;
        }
      } else {
        // 分组模式：只绘制可见数据集的柱体
        if (visibleDatasetIndices.includes(datasetIndex)) {
          columnY = valueToY(value, config, height);
          columnHeight = valueToHeight(value, config, height);
        } else {
          // 当前数据集不可见，返回零高度的柱体
          columnHeight = 0;
          columnY = height - padding;
        }
      }

      return {
        x: columnX,
        y: columnY,
        width: columnWidth_actual,
        height: columnHeight,
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
  config: ColumnChartConfig,
  width: number,
  height: number,
  labels: string[],
  textColor: string,
  fontSize: number,
  xAxisTitle?: string,
  yAxisTitle?: string,
  xAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
  yAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
  xAxisTickInterval?: number
): void => {
  const { padding, chartWidth, chartHeight, maxValue, minValue } = config;

  const showGrid = xAxisGrid?.display !== false || yAxisGrid?.display !== false;
  const defaultGridColor = '#e5e7eb';
  const defaultLineWidth = 1;
  const defaultOpacity = 1;

  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;

  // 绘制 X 轴标签
  const categoryWidth = chartWidth / Math.max(1, labels.length);
  const tickInterval = Math.max(1, xAxisTickInterval || 1);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  labels.forEach((label, index) => {
    if (index % tickInterval !== 0) return;
    const x = padding + index * categoryWidth + categoryWidth / 2;
    ctx.fillText(label, x, height - padding + 8);
  });

  // 绘制 Y 轴标签
  const yGridCount = 5;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= yGridCount; i++) {
    const ratio = i / yGridCount;
    const y = height - padding - ratio * chartHeight;
    const value = minValue + ratio * (maxValue - minValue);
    ctx.fillText(value.toFixed(0), padding - 8, y);
  }

  // 绘制 X 轴刻度尺
  ctx.save();
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  labels.forEach((_, index) => {
    if (index % tickInterval !== 0) return;
    const x = padding + index * categoryWidth + categoryWidth / 2;
    ctx.beginPath();
    ctx.moveTo(x, height - padding);
    ctx.lineTo(x, height - padding + 6);
    ctx.stroke();
  });
  ctx.restore();

  // 绘制 Y 轴刻度尺
  ctx.save();
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  for (let i = 0; i <= yGridCount; i++) {
    const ratio = i / yGridCount;
    const y = height - padding - ratio * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding - 6, y);
    ctx.lineTo(padding, y);
    ctx.stroke();
  }
  ctx.restore();

  // 绘制垂直网格线
  const showVerticalGrid = xAxisGrid?.vertical !== false && showGrid;
  if (showVerticalGrid) {
    ctx.save();
    ctx.strokeStyle = xAxisGrid?.color || defaultGridColor;
    ctx.lineWidth = xAxisGrid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = xAxisGrid?.opacity ?? defaultOpacity;

    labels.forEach((_, index) => {
      const x = padding + index * categoryWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    });
    ctx.restore();
  }

  // 绘制水平网格线
  const showHorizontalGrid = yAxisGrid?.horizontal !== false && showGrid;
  if (showHorizontalGrid) {
    ctx.save();
    ctx.strokeStyle = yAxisGrid?.color || xAxisGrid?.color || defaultGridColor;
    ctx.lineWidth = yAxisGrid?.lineWidth || xAxisGrid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = yAxisGrid?.opacity ?? xAxisGrid?.opacity ?? defaultOpacity;

    for (let i = 0; i <= yGridCount; i++) {
      const ratio = i / yGridCount;
      const y = height - padding - ratio * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
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
  config: ColumnChartConfig,
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
 * 绘制柱体
 */
const drawColumns = (
  ctx: CanvasRenderingContext2D,
  columns: ComputedColumn[],
  dataset: ColumnDataset,
  datasetIndex: number,
  animationProgress: number,
  defaultBorderRadius: number | number[]
): void => {
  const borderRadius = dataset.borderRadius ?? defaultBorderRadius;
  const borderColor = dataset.borderColor;
  const borderWidth = dataset.borderWidth ?? DEFAULT_CONFIG.borderWidth;

  columns.forEach((column) => {
    // 根据动画进度调整高度
    const animatedHeight = column.height * animationProgress;
    const animatedY = column.y + (column.height - animatedHeight);

    // 绘制柱体
    ctx.fillStyle = column.color;
    drawRoundedRect(ctx, column.x, animatedY, column.width, animatedHeight, borderRadius);
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
 * 绘制直方图柱体（带分隔线）
 * 只在柱体顶部绘制边框，避免相邻柱体边框重叠
 */
const drawHistogramColumns = (
  ctx: CanvasRenderingContext2D,
  columns: ComputedColumn[],
  dataset: ColumnDataset,
  datasetIndex: number,
  animationProgress: number,
  defaultBorderRadius: number | number[]
): void => {
  const borderColor = dataset.borderColor;
  const borderWidth = dataset.borderWidth ?? DEFAULT_CONFIG.borderWidth;

  columns.forEach((column) => {
    // 根据动画进度调整高度
    const animatedHeight = column.height * animationProgress;
    const animatedY = column.y + (column.height - animatedHeight);

    // 绘制柱体
    ctx.fillStyle = column.color;
    ctx.fillRect(column.x, animatedY, column.width, animatedHeight);

    // 只在柱体顶部和左右绘制边框（直方图效果）
    if (borderColor && borderWidth > 0) {
      ctx.save();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      
      // 绘制顶部边框
      ctx.beginPath();
      ctx.moveTo(column.x, animatedY);
      ctx.lineTo(column.x + column.width, animatedY);
      ctx.stroke();
      
      // 绘制左侧边框（只在第一个柱体或相邻柱体颜色不同时绘制）
      ctx.beginPath();
      ctx.moveTo(column.x, animatedY);
      ctx.lineTo(column.x, animatedY + animatedHeight);
      ctx.stroke();
      
      // 绘制右侧边框
      ctx.beginPath();
      ctx.moveTo(column.x + column.width, animatedY);
      ctx.lineTo(column.x + column.width, animatedY + animatedHeight);
      ctx.stroke();
      
      ctx.restore();
    }
  });
};

/**
 * 绘制高亮柱体
 */
const drawHighlightedColumn = (
  ctx: CanvasRenderingContext2D,
  column: ComputedColumn,
  borderRadius: number | number[]
): void => {
  ctx.save();
  ctx.fillStyle = column.color;
  ctx.globalAlpha = 0.9;
  drawRoundedRect(ctx, column.x, column.y, column.width, column.height, borderRadius);
  ctx.fill();

  // 添加白色边框效果
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
};

/**
 * 柱状图组件
 */
export const Column: React.FC<ColumnProps> = ({
  data,
  width = 600,
  height = 400,
  padding = DEFAULT_CONFIG.padding,
  xAxis,
  yAxis,
  legend,
  tooltip,
  column,
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
  const [hoveredColumn, setHoveredColumn] = useState<ComputedColumn | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
  const datasetOpacityRef = useRef<Map<number, number>>(new Map());
  const animatingDatasetsRef = useRef<Set<number>>(new Set());
  const [opacityVersion, setOpacityVersion] = useState(0);

  const columnsRef = useRef<ComputedColumn[][]>([]);
  const ANIMATION_DURATION = 300;

  // 柱体位置动画相关
  const previousColumnsRef = useRef<ComputedColumn[][]>([]);
  const [columnsAnimationProgress, setColumnsAnimationProgress] = useState(1);
  const [isColumnsAnimating, setIsColumnsAnimating] = useState(false);

  const getDatasetOpacity = useCallback((datasetIndex: number): number => {
    return datasetOpacityRef.current.get(datasetIndex) ?? 1;
  }, [opacityVersion]);

  // 计算图表配置
  const chartConfig = useMemo(
    () => calculateChartConfig(data, width, height, padding, stacked, yAxis?.min, yAxis?.max),
    [data, width, height, padding, stacked, yAxis?.min, yAxis?.max]
  );

  // 计算可见的数据集索引（透明度大于 0.1 的视为可见）
  const visibleDatasetIndices = useMemo(() => {
    const indices: number[] = [];
    data.datasets.forEach((_, datasetIndex) => {
      const opacity = datasetOpacityRef.current.get(datasetIndex) ?? 1;
      if (opacity > 0.1) {
        indices.push(datasetIndex);
      }
    });
    return indices;
  }, [data, opacityVersion]);

  // 计算所有柱体
  const allColumns = useMemo(
    () => computeColumns(
      data,
      chartConfig,
      width,
      height,
      stacked,
      column?.width ?? DEFAULT_CONFIG.columnWidth,
      column?.spacing ?? DEFAULT_CONFIG.columnSpacing,
      visibleDatasetIndices
    ),
    [data, chartConfig, width, height, stacked, column?.width, column?.spacing, visibleDatasetIndices]
  );

  // 初始动画效果
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

  // 柱体位置变化时触发动画
  useEffect(() => {
    // 保存当前柱体位置作为动画起点
    if (allColumns.length > 0 && allColumns[0].length > 0) {
      // 检查是否有位置变化
      const hasPositionChanged = previousColumnsRef.current.length > 0 &&
        allColumns.some((dataset, datasetIndex) =>
          dataset.some((column, dataIndex) => {
            const prev = previousColumnsRef.current[datasetIndex]?.[dataIndex];
            if (!prev) return true;
            return Math.abs(column.y - prev.y) > 0.1 || Math.abs(column.height - prev.height) > 0.1;
          })
        );

      if (hasPositionChanged) {
        setIsColumnsAnimating(true);
        setColumnsAnimationProgress(0);

        const startTime = Date.now();
        const animateColumns = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          setColumnsAnimationProgress(eased);

          if (progress < 1) {
            requestAnimationFrame(animateColumns);
          } else {
            setIsColumnsAnimating(false);
            setColumnsAnimationProgress(1);
            // 动画完成后更新参考位置
            previousColumnsRef.current = allColumns;
          }
        };
        requestAnimationFrame(animateColumns);
      } else {
        // 没有位置变化，直接更新参考位置
        previousColumnsRef.current = allColumns;
      }
    }
  }, [allColumns]);

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
      xAxis?.tickColor || DEFAULT_CONFIG.textColor,
      xAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
      xAxis?.display !== false ? xAxis?.title?.text : undefined,
      yAxis?.display !== false ? yAxis?.title?.text : undefined,
      xAxis?.grid,
      yAxis?.grid,
      xAxis?.tickInterval
    );

    // 绘制坐标轴
    drawAxes(ctx, chartConfig, width, height, xAxis?.grid?.color || DEFAULT_CONFIG.axisColor);

    // 绘制柱体
    data.datasets.forEach((dataset, datasetIndex) => {
      const opacity = getDatasetOpacity(datasetIndex);
      if (opacity <= 0.01) return;

      const columns = allColumns[datasetIndex];
      if (!columns || columns.length === 0) return;

      ctx.save();
      ctx.globalAlpha = opacity;

      // 如果正在播放位置动画，使用插值后的位置
      let renderColumns = columns;
      if (isColumnsAnimating && previousColumnsRef.current.length > 0) {
        const prevColumns = previousColumnsRef.current[datasetIndex];
        if (prevColumns) {
          renderColumns = columns.map((col, idx) => {
            const prevCol = prevColumns[idx];
            if (!prevCol) return col;
            
            // 插值计算当前位置
            const eased = columnsAnimationProgress;
            return {
              ...col,
              y: prevCol.y + (col.y - prevCol.y) * eased,
              height: prevCol.height + (col.height - prevCol.height) * eased,
            };
          });
        }
      }

      // 根据是否为直方图模式选择绘制方式
      if (column?.histogram) {
        drawHistogramColumns(
          ctx,
          renderColumns,
          dataset,
          datasetIndex,
          animationProgress,
          column?.borderRadius ?? DEFAULT_CONFIG.borderRadius
        );
      } else {
        drawColumns(
          ctx,
          renderColumns,
          dataset,
          datasetIndex,
          animationProgress,
          column?.borderRadius ?? DEFAULT_CONFIG.borderRadius
        );
      }

      ctx.restore();
    });

    // 绘制高亮柱体
    if (hoveredColumn && animationProgress >= 1) {
      const hoveredOpacity = getDatasetOpacity(hoveredColumn.datasetIndex);
      if (hoveredOpacity > 0.01) {
        drawHighlightedColumn(
          ctx,
          hoveredColumn,
          column?.borderRadius ?? DEFAULT_CONFIG.borderRadius
        );
      }
    }

    // 保存计算的数据用于交互
    columnsRef.current = allColumns;

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
    allColumns,
    xAxis,
    yAxis,
    legend,
    column,
    animationProgress,
    hoveredColumn,
    isLoading,
    onChartReady,
    isColumnsAnimating,
    columnsAnimationProgress,
  ]);

  useEffect(() => {
    drawChart();
  }, [drawChart, opacityVersion, columnsAnimationProgress]);

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || animationProgress < 1 || isColumnsAnimating) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 查找鼠标下的柱体
      let closestColumn: ComputedColumn | null = null;

      columnsRef.current.forEach((datasetColumns, datasetIndex) => {
        const opacity = getDatasetOpacity(datasetIndex);
        if (opacity < 0.1) return;

        datasetColumns.forEach((column) => {
          if (
            x >= column.x &&
            x <= column.x + column.width &&
            y >= column.y &&
            y <= column.y + column.height
          ) {
            closestColumn = column;
          }
        });
      });

      setHoveredColumn(closestColumn);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      // 更改鼠标样式
      canvas.style.cursor = closestColumn ? 'pointer' : 'default';
    },
    [animationProgress, getDatasetOpacity, isColumnsAnimating]
  );

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setHoveredColumn(null);
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
      if (!hoveredColumn || !onDataClick) return;
      onDataClick(hoveredColumn.datasetIndex, hoveredColumn.dataIndex, hoveredColumn.value);
    },
    [hoveredColumn, onDataClick]
  );

  // 生成提示框内容
  const tooltipContent = useMemo(() => {
    if (!hoveredColumn) return null;

    const dataset = data.datasets[hoveredColumn.datasetIndex];
    return {
      dataIndex: hoveredColumn.dataIndex,
      label: hoveredColumn.label,
      title: hoveredColumn.label,
      items: [{
        label: dataset.label,
        value: hoveredColumn.value,
        color: hoveredColumn.color,
        datasetIndex: hoveredColumn.datasetIndex,
      }],
    };
  }, [hoveredColumn, data]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsColumnChartContainer, className)}
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
        className={styles.zcpcyChatsColumnChartCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* 提示框 */}
      {tooltip?.enabled !== false && tooltipContent && hoveredColumn && (
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

export default Column;
