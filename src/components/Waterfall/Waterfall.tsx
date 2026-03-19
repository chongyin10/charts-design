/**
 * 瀑布图组件
 * 用于展示数据从初始值到最终值的演变过程及各因素影响
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  WaterfallProps,
  WaterfallChartData,
  WaterfallChartConfig,
  ComputedWaterfallColumn,
  WaterfallTooltipData,
} from './Waterfall.type';

/**
 * 默认配置
 */
const DEFAULT_COLORS = {
  positive: '#ff6b5b', // 正值 - 红色（增长）
  negative: '#10b981', // 负值 - 绿色（衰减）
  total: '#94a3b8',    // 总计 - 灰色
};

const DEFAULT_CONFIG = {
  padding: 60,
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
  columnWidth: 0.6,
  connectorColor: '#9ca3af',
  connectorWidth: 1,
  connectorDash: [4, 4],
};

/**
 * 计算累计值数组
 */
const calculateCumulativeValues = (data: WaterfallChartData): number[] => {
  const cumulative: number[] = [];
  let sum = 0;

  data.items.forEach((item) => {
    if (item.isTotal) {
      // 总计项显示当前总计值
      sum = item.value;
    }
    cumulative.push(sum);
    if (!item.isTotal) {
      sum += item.value;
    }
  });

  return cumulative;
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: WaterfallChartData,
  width: number,
  height: number,
  padding: number,
  yAxisMin?: number,
  yAxisMax?: number
): WaterfallChartConfig => {
  const cumulative = calculateCumulativeValues(data);
  
  // 计算过程中的所有值
  const allValues: number[] = [];
  data.items.forEach((item, index) => {
    const startValue = cumulative[index];
    if (item.isTotal) {
      allValues.push(item.value);
    } else {
      allValues.push(startValue);
      allValues.push(startValue + item.value);
    }
  });

  const maxValue = yAxisMax ?? Math.max(...allValues, 0);
  const minValue = yAxisMin ?? Math.min(0, ...allValues);
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
const valueToY = (value: number, config: WaterfallChartConfig, height: number): number => {
  const normalizedValue = (value - config.minValue) / config.valueRange;
  return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 获取柱体颜色
 */
const getColumnColor = (
  item: { value: number; isTotal?: boolean; color?: string },
  columnConfig?: { positiveColor?: string; negativeColor?: string; totalColor?: string }
): string => {
  if (item.color) return item.color;
  if (item.isTotal) return columnConfig?.totalColor ?? DEFAULT_COLORS.total;
  return item.value >= 0
    ? (columnConfig?.positiveColor ?? DEFAULT_COLORS.positive)
    : (columnConfig?.negativeColor ?? DEFAULT_COLORS.negative);
};

/**
 * 计算柱体数据
 */
const computeColumns = (
  data: WaterfallChartData,
  config: WaterfallChartConfig,
  width: number,
  height: number,
  columnWidth: number,
  columnConfig?: { positiveColor?: string; negativeColor?: string; totalColor?: string }
): ComputedWaterfallColumn[] => {
  const { padding, chartWidth } = config;
  const itemCount = Math.max(1, data.items.length);
  const categoryWidth = chartWidth / itemCount;
  const effectiveColumnWidth = categoryWidth * columnWidth;

  const cumulative = calculateCumulativeValues(data);

  return data.items.map((item, index) => {
    const x = padding + index * categoryWidth + (categoryWidth - effectiveColumnWidth) / 2;
    
    let fromValue: number;
    let toValue: number;

    if (item.isTotal) {
      // 总计项：从0开始
      fromValue = 0;
      toValue = item.value;
    } else {
      // 普通项：从当前累计值开始
      fromValue = cumulative[index];
      toValue = fromValue + item.value;
    }

    const fromY = valueToY(fromValue, config, height);
    const toY = valueToY(toValue, config, height);
    
    const columnHeight = Math.abs(toY - fromY);
    const columnY = Math.min(fromY, toY);

    return {
      x,
      y: columnY,
      width: effectiveColumnWidth,
      height: columnHeight,
      fromValue,
      toValue,
      value: item.value,
      label: item.label,
      index,
      color: getColumnColor(item, columnConfig),
      isTotal: item.isTotal ?? false,
      cumulative: toValue,
    };
  });
};

/**
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: WaterfallChartConfig,
  width: number,
  height: number,
  labels: string[],
  textColor: string,
  fontSize: number,
  xAxisTitle?: string,
  yAxisTitle?: string,
  yAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number },
  xAxisTickInterval?: number
): void => {
  const { padding, chartWidth, chartHeight, maxValue, minValue, valueRange } = config;

  const defaultGridColor = '#e5e7eb';
  const defaultLineWidth = 1;

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

  // 绘制 Y 轴标签和网格线
  const yGridCount = 5;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= yGridCount; i++) {
    const ratio = i / yGridCount;
    const y = height - padding - ratio * chartHeight;
    const value = minValue + ratio * valueRange;
    ctx.fillText(value.toLocaleString(), padding - 8, y);

    // 绘制水平网格线
    if (yAxisGrid?.display !== false) {
      ctx.strokeStyle = yAxisGrid?.color || defaultGridColor;
      ctx.lineWidth = yAxisGrid?.lineWidth || defaultLineWidth;
      ctx.globalAlpha = yAxisGrid?.opacity ?? 1;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // 绘制坐标轴
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  // Y轴
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  // X轴
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // 绘制坐标轴标题
  if (yAxisTitle) {
    ctx.save();
    // 将标题放在 Y 轴上方
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillText(yAxisTitle, padding, padding - 10);
    ctx.restore();
  }

  if (xAxisTitle) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillText(xAxisTitle, width / 2, height - 16);
  }
};

/**
 * 绘制连接线
 */
const drawConnectors = (
  ctx: CanvasRenderingContext2D,
  columns: ComputedWaterfallColumn[],
  config: { color?: string; width?: number; dash?: number[] }
): void => {
  if (columns.length < 2) return;

  ctx.strokeStyle = config.color ?? DEFAULT_CONFIG.connectorColor;
  ctx.lineWidth = config.width ?? DEFAULT_CONFIG.connectorWidth;
  ctx.setLineDash(config.dash ?? DEFAULT_CONFIG.connectorDash);

  for (let i = 0; i < columns.length - 1; i++) {
    const current = columns[i];
    const next = columns[i + 1];

    // 从当前柱体的顶部画线到下一个柱体的顶部
    const startX = current.x + current.width;
    const startY = current.y;
    const endX = next.x;
    const endY = next.y;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  ctx.setLineDash([]);
};

/**
 * 绘制柱体
 */
const drawColumns = (
  ctx: CanvasRenderingContext2D,
  columns: ComputedWaterfallColumn[],
  animationProgress: number,
  borderRadius: number | number[]
): void => {
  columns.forEach((column) => {
    const animatedHeight = column.height * animationProgress;
    const animatedY = column.value >= 0
      ? column.y + column.height - animatedHeight
      : column.y;

    ctx.fillStyle = column.color;
    
    // 绘制圆角矩形
    roundRect(ctx, column.x, animatedY, column.width, animatedHeight, borderRadius);
    ctx.fill();
  });
};

/**
 * 绘制圆角矩形
 */
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[]
): void => {
  const r = Array.isArray(radius)
    ? Math.min(radius[0] || 0, width / 2, height / 2)
    : Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

/**
 * 绘制数值标签
 */
const drawLabels = (
  ctx: CanvasRenderingContext2D,
  columns: ComputedWaterfallColumn[],
  config: { display?: boolean; color?: string; fontSize?: number; position?: 'inside' | 'outside'; formatter?: (value: number) => string },
  animationProgress: number
): void => {
  if (config.display === false) return;

  ctx.fillStyle = config.color ?? '#ffffff';
  ctx.font = `${config.fontSize ?? 11}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  columns.forEach((column) => {
    const animatedHeight = column.height * animationProgress;
    if (animatedHeight < 10) return; // 柱体太小不显示标签

    const label = config.formatter
      ? config.formatter(column.value)
      : column.value.toLocaleString();

    const textX = column.x + column.width / 2;
    let textY: number;

    if (config.position === 'outside') {
      // 标签显示在柱体外部
      textY = column.value >= 0
        ? column.y - 10
        : column.y + column.height + 10;
      // 外部标签使用深色
      ctx.fillStyle = config.color ?? '#374151';
    } else {
      // 标签显示在柱体内部
      const animatedY = column.value >= 0
        ? column.y + column.height - animatedHeight
        : column.y;
      textY = animatedY + animatedHeight / 2;
      // 内部标签使用白色
      ctx.fillStyle = '#ffffff';
    }

    ctx.fillText(label, textX, textY);
  });
};

/**
 * 检测鼠标位置是否在柱体上
 */
const getColumnAtPosition = (
  x: number,
  y: number,
  columns: ComputedWaterfallColumn[]
): ComputedWaterfallColumn | null => {
  for (const column of columns) {
    if (
      x >= column.x &&
      x <= column.x + column.width &&
      y >= column.y &&
      y <= column.y + column.height
    ) {
      return column;
    }
  }
  return null;
};

/**
 * 瀑布图组件
 */
const Waterfall: React.FC<WaterfallProps> = ({
  data,
  width = 600,
  height = 400,
  padding = DEFAULT_CONFIG.padding,
  xAxis,
  yAxis,
  tooltip,
  connector,
  column,
  label,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  className,
  style,
  onDataClick,
  onChartReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [tooltipData, setTooltipData] = useState<WaterfallTooltipData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 计算图表配置
  const chartConfig = useMemo(() => {
    return calculateChartConfig(data, width, height, padding, yAxis?.min, yAxis?.max);
  }, [data, width, height, padding, yAxis?.min, yAxis?.max]);

  // 计算柱体数据
  const columns = useMemo(() => {
    return computeColumns(data, chartConfig, width, height, column?.width ?? DEFAULT_CONFIG.columnWidth, column);
  }, [data, chartConfig, width, height, column]);

  // 动画效果
  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // 使用 easeOutQuart 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setAnimationProgress(easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onChartReady?.();
      }
    };
    requestAnimationFrame(animate);
  }, [animationDuration, onChartReady, data]);

  // 绘制图表
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格线
    drawGrid(
      ctx,
      chartConfig,
      width,
      height,
      data.items.map(item => item.label),
      xAxis?.tickColor ?? DEFAULT_CONFIG.textColor,
      xAxis?.tickFontSize ?? DEFAULT_CONFIG.fontSize,
      xAxis?.title?.text,
      yAxis?.title?.text,
      yAxis?.grid,
      xAxis?.tickInterval
    );

    // 绘制连接线（在柱体下方）
    if (connector?.display !== false) {
      drawConnectors(ctx, columns, connector ?? {});
    }

    // 绘制柱体
    drawColumns(ctx, columns, animationProgress, column?.borderRadius ?? DEFAULT_CONFIG.borderRadius);

    // 绘制数值标签
    drawLabels(ctx, columns, label ?? {}, animationProgress);
  }, [columns, chartConfig, data, width, height, animationProgress, connector, label, column, xAxis, yAxis]);

  // 鼠标移动事件
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const column = getColumnAtPosition(x, y, columns);

      if (column) {
        const item = data.items[column.index];
        const cumulative = calculateCumulativeValues(data);
        const previousCumulative = column.isTotal ? 0 : cumulative[column.index];

        setTooltipData({
          x: e.clientX,
          y: e.clientY,
          index: column.index,
          item,
          cumulative: column.cumulative,
          previousCumulative,
          color: column.color,
        });
        setMousePos({ x: e.clientX, y: e.clientY });
      } else {
        setTooltipData(null);
      }
    },
    [columns, data]
  );

  // 鼠标离开事件
  const handleMouseLeave = useCallback(() => {
    setTooltipData(null);
  }, []);

  // 点击事件
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const column = getColumnAtPosition(x, y, columns);

      if (column) {
        const item = data.items[column.index];
        onDataClick?.(column.index, item, column.cumulative);
      }
    },
    [columns, data, onDataClick]
  );

  // 自定义提示框内容
  const renderTooltipContent = () => {
    if (!tooltipData) return null;

    if (tooltip?.customContent) {
      return tooltip.customContent({
        dataIndex: tooltipData.index,
        label: tooltipData.item.label,
        item: tooltipData.item,
        cumulative: tooltipData.cumulative,
        previousCumulative: tooltipData.previousCumulative,
      });
    }

    return (
      <>
        <div className={styles.zcpcyChatsTooltipTitle}>{tooltipData.item.label}</div>
        <div className={styles.zcpcyChatsTooltipItem}>
          <span
            className={styles.zcpcyChatsTooltipColor}
            style={{ backgroundColor: tooltipData.color }}
          />
          <span>
            数值: {tooltipData.item.value.toLocaleString()}
            {tooltipData.item.isTotal ? ' (总计)' : ''}
          </span>
        </div>
        {!tooltipData.item.isTotal && (
          <div className={styles.zcpcyChatsTooltipItem}>
            <span style={{ width: 10, height: 10, display: 'inline-block', marginRight: 8 }} />
            <span>累计: {tooltipData.cumulative.toLocaleString()}</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsWaterfallChartContainer, className)}
      style={style}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsWaterfallChartCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      
      {/* 提示框 */}
      {tooltip?.enabled !== false && tooltipData && (
        <div
          className={classNames(styles.zcpcyChatsTooltip, styles.zcpcyChatsTooltipVisible)}
          style={{
            left: mousePos.x + 12,
            top: mousePos.y - 12,
            backgroundColor: tooltip?.backgroundColor ?? DEFAULT_CONFIG.tooltipBackground,
          }}
        >
          {renderTooltipContent()}
        </div>
      )}
    </div>
  );
};

export default Waterfall;
