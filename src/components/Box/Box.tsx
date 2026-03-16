/**
 * 箱线图组件
 * 用于展示数据的五数概括（最小值、Q1、中位数、Q3、最大值）
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  BoxPlotProps,
  BoxPlotChartData,
  BoxPlotChartConfig,
  ComputedBox,
  BoxPlotTooltipItem,
} from './Box.type';

/**
 * 默认配置
 */
const DEFAULT_COLORS = [
  '#93c5fd', // blue-300 (箱体默认填充色)
];

const DEFAULT_CONFIG = {
  padding: 60,
  boxWidth: 0.7,
  animationDuration: 800,
  gridColor: '#e5e7eb',
  textColor: '#6b7280',
  axisColor: '#d1d5db',
  tooltipBackground: '#ffffff',
  tooltipTitleColor: '#111827',
  tooltipBodyColor: '#374151',
  fontSize: 12,
  titleFontSize: 14,
  borderWidth: 1,
  borderColor: '#60a5fa',
  medianColor: '#374151',
  medianWidth: 1,
  whiskerColor: '#6b7280',
  whiskerWidth: 1,
};

/**
 * 获取数据集颜色
 */
const getDatasetColor = (index: number, dataset: BoxPlotChartData['datasets'][0]): string => {
  return dataset.backgroundColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

const getDatasetBorderColor = (index: number, dataset: BoxPlotChartData['datasets'][0]): string => {
  return dataset.borderColor || DEFAULT_CONFIG.borderColor;
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: BoxPlotChartData,
  width: number,
  height: number,
  padding: number,
  yAxisMin?: number,
  yAxisMax?: number
): BoxPlotChartConfig => {
  // 计算所有数据中的最小值和最大值
  const allValues = data.datasets.flatMap((dataset) =>
    dataset.data.flatMap((item) => [item.min, item.q1, item.median, item.q3, item.max])
  );

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
const valueToY = (value: number, config: BoxPlotChartConfig, height: number): number => {
  const normalizedValue = (value - config.minValue) / config.valueRange;
  return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 计算箱体位置和尺寸
 */
const calculateBoxes = (
  data: BoxPlotChartData,
  config: BoxPlotChartConfig,
  width: number,
  height: number,
  boxWidthRatio: number
): ComputedBox[] => {
  const boxes: ComputedBox[] = [];
  const categoryWidth = config.chartWidth / data.labels.length;

  data.datasets.forEach((dataset, datasetIndex) => {
    const boxWidth = categoryWidth * boxWidthRatio;

    dataset.data.forEach((item, dataIndex) => {
      const centerX = config.padding + dataIndex * categoryWidth + categoryWidth / 2;
      const x = centerX - boxWidth / 2;

      // Q3 在上方，Q1 在下方（Y坐标越小越靠上）
      const q3Y = valueToY(item.q3, config, height);
      const q1Y = valueToY(item.q1, config, height);
      const boxHeight = q1Y - q3Y;

      boxes.push({
        x,
        y: q3Y,
        width: boxWidth,
        height: boxHeight,
        medianY: valueToY(item.median, config, height),
        whiskerTopY: valueToY(item.max, config, height),
        whiskerBottomY: valueToY(item.min, config, height),
        centerX,
        data: item,
        datasetIndex,
        dataIndex,
      });
    });
  });

  return boxes;
};

/**
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: BoxPlotChartConfig,
  width: number,
  height: number,
  yAxis?: { stepSize?: number; color?: string; lineWidth?: number }
) => {
  const stepSize = yAxis?.stepSize ?? 5;
  const gridColor = yAxis?.color || DEFAULT_CONFIG.gridColor;
  const lineWidth = yAxis?.lineWidth || 1;

  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  // 水平网格线
  const steps = Math.ceil(config.valueRange / stepSize);
  for (let i = 0; i <= steps; i++) {
    const value = config.minValue + i * stepSize;
    if (value > config.maxValue) break;

    const y = valueToY(value, config, height);
    ctx.moveTo(config.padding, y);
    ctx.lineTo(width - config.padding, y);
  }

  ctx.stroke();
  ctx.restore();
};

/**
 * 绘制坐标轴
 */
const drawAxes = (
  ctx: CanvasRenderingContext2D,
  config: BoxPlotChartConfig,
  data: BoxPlotChartData,
  width: number,
  height: number,
  xAxis?: { color?: string; lineWidth?: number; labelColor?: string; labelFontSize?: number },
  yAxis?: { color?: string; lineWidth?: number; labelColor?: string; labelFontSize?: number; stepSize?: number }
) => {
  const axisColor = xAxis?.color || yAxis?.color || DEFAULT_CONFIG.axisColor;
  const lineWidth = xAxis?.lineWidth || yAxis?.lineWidth || 1;
  const labelColor = xAxis?.labelColor || yAxis?.labelColor || DEFAULT_CONFIG.textColor;
  const labelFontSize = xAxis?.labelFontSize || yAxis?.labelFontSize || DEFAULT_CONFIG.fontSize;

  ctx.save();
  ctx.strokeStyle = axisColor;
  ctx.lineWidth = lineWidth;
  ctx.font = `${labelFontSize}px sans-serif`;
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Y轴
  ctx.beginPath();
  ctx.moveTo(config.padding, config.padding);
  ctx.lineTo(config.padding, height - config.padding);
  ctx.stroke();

  // X轴
  ctx.beginPath();
  ctx.moveTo(config.padding, height - config.padding);
  ctx.lineTo(width - config.padding, height - config.padding);
  ctx.stroke();

  // X轴标签
  const categoryWidth = config.chartWidth / data.labels.length;
  data.labels.forEach((label, index) => {
    const x = config.padding + index * categoryWidth + categoryWidth / 2;
    const y = height - config.padding + 20;
    ctx.fillText(label, x, y);
  });

  // Y轴标签
  ctx.textAlign = 'right';
  const stepSize = yAxis?.stepSize ?? 5;
  const steps = Math.ceil(config.valueRange / stepSize);
  for (let i = 0; i <= steps; i++) {
    const value = config.minValue + i * stepSize;
    if (value > config.maxValue) break;

    const y = valueToY(value, config, height);
    ctx.fillText(value.toString(), config.padding - 10, y);
  }

  ctx.restore();
};

/**
 * 绘制箱线图
 */
const drawBoxPlot = (
  ctx: CanvasRenderingContext2D,
  boxes: ComputedBox[],
  data: BoxPlotChartData,
  progress: number,
  hoveredBox: ComputedBox | null
) => {
  boxes.forEach((box) => {
    const dataset = data.datasets[box.datasetIndex];
    const fillColor = getDatasetColor(box.datasetIndex, dataset);
    const borderColor = getDatasetBorderColor(box.datasetIndex, dataset);
    const medianColor = dataset.medianColor || DEFAULT_CONFIG.medianColor;
    const whiskerColor = dataset.whiskerColor || DEFAULT_CONFIG.whiskerColor;
    const isHovered = hoveredBox === box;

    // 动画插值
    const animatedHeight = box.height * progress;
    const animatedY = box.y + (box.height - animatedHeight);
    const animatedMedianY = box.y + (box.medianY - box.y) * progress;
    const animatedWhiskerTopY = box.y + (box.whiskerTopY - box.y) * progress;
    // 下边界从 Q1 位置动画到 min 位置
    const q1Y = box.y + box.height;
    const animatedWhiskerBottomY = q1Y + (box.whiskerBottomY - q1Y) * progress;

    ctx.save();

    // 绘制上须线 (max 到 q3)
    ctx.strokeStyle = whiskerColor;
    ctx.lineWidth = dataset.whiskerWidth || DEFAULT_CONFIG.whiskerWidth;
    ctx.beginPath();
    ctx.moveTo(box.centerX, animatedWhiskerTopY);
    ctx.lineTo(box.centerX, animatedY);
    ctx.stroke();

    // 绘制上边界横线 (max)
    const whiskerWidth = box.width * 0.4;
    ctx.beginPath();
    ctx.moveTo(box.centerX - whiskerWidth / 2, animatedWhiskerTopY);
    ctx.lineTo(box.centerX + whiskerWidth / 2, animatedWhiskerTopY);
    ctx.stroke();

    // 绘制箱体 (Q1 到 Q3)
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = dataset.borderWidth || DEFAULT_CONFIG.borderWidth;
    
    if (isHovered) {
      ctx.globalAlpha = 0.8;
    }

    ctx.fillRect(box.x, animatedY, box.width, animatedHeight);
    ctx.strokeRect(box.x, animatedY, box.width, animatedHeight);

    // 绘制中位线
    ctx.strokeStyle = medianColor;
    ctx.lineWidth = dataset.medianWidth || DEFAULT_CONFIG.medianWidth;
    ctx.beginPath();
    ctx.moveTo(box.x, animatedMedianY);
    ctx.lineTo(box.x + box.width, animatedMedianY);
    ctx.stroke();

    // 绘制下须线 (q1 到 min)
    ctx.strokeStyle = whiskerColor;
    ctx.lineWidth = dataset.whiskerWidth || DEFAULT_CONFIG.whiskerWidth;
    ctx.beginPath();
    ctx.moveTo(box.centerX, animatedY + animatedHeight);
    ctx.lineTo(box.centerX, animatedWhiskerBottomY);
    ctx.stroke();

    // 绘制下边界横线 (min)
    ctx.beginPath();
    ctx.moveTo(box.centerX - whiskerWidth / 2, animatedWhiskerBottomY);
    ctx.lineTo(box.centerX + whiskerWidth / 2, animatedWhiskerBottomY);
    ctx.stroke();

    ctx.restore();
  });
};

/**
 * 检测鼠标是否悬停在箱体上
 */
const getHoveredBox = (
  mouseX: number,
  mouseY: number,
  boxes: ComputedBox[]
): ComputedBox | null => {
  for (const box of boxes) {
    // 检测是否在箱体区域内
    if (
      mouseX >= box.x &&
      mouseX <= box.x + box.width &&
      mouseY >= box.whiskerTopY &&
      mouseY <= box.whiskerBottomY
    ) {
      return box;
    }
  }
  return null;
};

/**
 * 箱线图组件
 */
const BoxPlot: React.FC<BoxPlotProps> = ({
  data,
  width: propWidth = 600,
  height: propHeight = 400,
  padding = DEFAULT_CONFIG.padding,
  boxWidth = DEFAULT_CONFIG.boxWidth,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  grid,
  xAxis,
  yAxis,
  tooltip,
  className,
  style,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredBox, setHoveredBox] = useState<ComputedBox | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    item: BoxPlotTooltipItem;
    x: number;
    y: number;
  } | null>(null);
  
  // 响应式尺寸状态
  const [containerSize, setContainerSize] = useState({ width: propWidth, height: propHeight });
  
  // 使用 ResizeObserver 监听容器大小变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let debounceTimer: NodeJS.Timeout | null = null;

    const updateSize = () => {
      if (!isMounted || !container) return;
      const rect = container.getBoundingClientRect();
      // 宽度自适应容器，高度保持固定
      const newWidth = Math.max(rect.width, 300); // 最小宽度 300
      setContainerSize({ width: newWidth, height: propHeight });
    };

    // 防抖处理的尺寸更新
    const debouncedUpdateSize = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        if (isMounted) {
          updateSize();
        }
      }, 100); // 100ms 防抖延迟
    };

    // 初始计算（不使用防抖）
    updateSize();

    // 创建 ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      debouncedUpdateSize();
    });

    resizeObserver.observe(container);

    // 监听窗口大小变化
    const handleResize = () => {
      debouncedUpdateSize();
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
  const config = useMemo(
    () => calculateChartConfig(data, width, height, padding, yAxis?.min, yAxis?.max),
    [data, width, height, padding, yAxis?.min, yAxis?.max]
  );

  // 计算箱体位置
  const boxes = useMemo(
    () => calculateBoxes(data, config, width, height, boxWidth),
    [data, config, width, height, boxWidth]
  );

  // 动画效果
  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // 使用 easeOutCubic 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [data, animationDuration]);

  // 绘制图表
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格
    if (grid?.display !== false) {
      drawGrid(ctx, config, width, height, {
        stepSize: yAxis?.stepSize,
        color: grid?.color,
        lineWidth: grid?.lineWidth,
      });
    }

    // 绘制坐标轴
    if (xAxis?.display !== false || yAxis?.display !== false) {
      drawAxes(ctx, config, data, width, height, xAxis, yAxis);
    }

    // 绘制箱线图
    drawBoxPlot(ctx, boxes, data, animationProgress, hoveredBox);
  }, [config, data, width, height, grid, xAxis, yAxis, boxes, animationProgress, hoveredBox]);

  // 鼠标移动处理
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const box = getHoveredBox(mouseX, mouseY, boxes);
      setHoveredBox(box);

      if (box && tooltip?.enabled !== false) {
        const dataset = data.datasets[box.datasetIndex];
        const item: BoxPlotTooltipItem = {
          label: data.labels[box.dataIndex],
          datasetLabel: dataset.label,
          min: box.data.min,
          q1: box.data.q1,
          median: box.data.median,
          q3: box.data.q3,
          max: box.data.max,
          color: getDatasetColor(box.datasetIndex, dataset),
        };

        const containerRect = container.getBoundingClientRect();
        setTooltipData({
          item,
          x: event.clientX - containerRect.left + 10,
          y: event.clientY - containerRect.top - 10,
        });
      } else {
        setTooltipData(null);
      }
    },
    [boxes, data, tooltip?.enabled]
  );

  // 鼠标离开处理
  const handleMouseLeave = useCallback(() => {
    setHoveredBox(null);
    setTooltipData(null);
  }, []);

  // 点击处理
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onClick || !hoveredBox) return;

      const dataset = data.datasets[hoveredBox.datasetIndex];
      const item: BoxPlotTooltipItem = {
        label: data.labels[hoveredBox.dataIndex],
        datasetLabel: dataset.label,
        min: hoveredBox.data.min,
        q1: hoveredBox.data.q1,
        median: hoveredBox.data.median,
        q3: hoveredBox.data.q3,
        max: hoveredBox.data.max,
        color: getDatasetColor(hoveredBox.datasetIndex, dataset),
      };

      onClick(item, hoveredBox.dataIndex);
    },
    [hoveredBox, data, onClick]
  );

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsBoxPlotChartContainer, className)}
      style={style}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsBoxPlotChartCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      {tooltipData && (
        <div
          className={classNames(styles.zcpcyChatsTooltip, {
            [styles.zcpcyChatsTooltipVisible]: true,
          })}
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
            backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
            borderColor: tooltip?.borderColor,
            borderWidth: tooltip?.borderWidth,
            borderRadius: tooltip?.borderRadius,
          }}
        >
          <div
            className={styles.zcpcyChatsTooltipTitle}
            style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
          >
            {tooltip?.titleFormatter
              ? tooltip.titleFormatter(tooltipData.item.label)
              : tooltipData.item.label}
          </div>
          <div className={styles.zcpcyChatsTooltipBody}>
            <div
              className={styles.zcpcyChatsTooltipRow}
              style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}
            >
              <span className={styles.zcpcyChatsTooltipLabel}>最大值:</span>
              <span className={styles.zcpcyChatsTooltipValue}>
                {tooltip?.valueFormatter
                  ? tooltip.valueFormatter(tooltipData.item.max, 'max')
                  : tooltipData.item.max}
              </span>
            </div>
            <div
              className={styles.zcpcyChatsTooltipRow}
              style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}
            >
              <span className={styles.zcpcyChatsTooltipLabel}>Q3:</span>
              <span className={styles.zcpcyChatsTooltipValue}>
                {tooltip?.valueFormatter
                  ? tooltip.valueFormatter(tooltipData.item.q3, 'q3')
                  : tooltipData.item.q3}
              </span>
            </div>
            <div
              className={styles.zcpcyChatsTooltipRow}
              style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}
            >
              <span className={styles.zcpcyChatsTooltipLabel}>中位数:</span>
              <span className={styles.zcpcyChatsTooltipValue}>
                {tooltip?.valueFormatter
                  ? tooltip.valueFormatter(tooltipData.item.median, 'median')
                  : tooltipData.item.median}
              </span>
            </div>
            <div
              className={styles.zcpcyChatsTooltipRow}
              style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}
            >
              <span className={styles.zcpcyChatsTooltipLabel}>Q1:</span>
              <span className={styles.zcpcyChatsTooltipValue}>
                {tooltip?.valueFormatter
                  ? tooltip.valueFormatter(tooltipData.item.q1, 'q1')
                  : tooltipData.item.q1}
              </span>
            </div>
            <div
              className={styles.zcpcyChatsTooltipRow}
              style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}
            >
              <span className={styles.zcpcyChatsTooltipLabel}>最小值:</span>
              <span className={styles.zcpcyChatsTooltipValue}>
                {tooltip?.valueFormatter
                  ? tooltip.valueFormatter(tooltipData.item.min, 'min')
                  : tooltipData.item.min}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BoxPlot.displayName = 'BoxPlot';

export default BoxPlot;
