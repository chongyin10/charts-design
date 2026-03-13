/**
 * 热力图组件
 * 通过颜色强度映射二维数据密度或数值大小的可视化图表
 * 擅长揭示数据分布规律、聚类特征及异常点
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  HeatmapProps,
  HeatmapChartData,
  HeatmapChartConfig,
  HeatmapColorScaleConfig,
  ComputedCell,
  TooltipState,
} from './Heatmap.type';

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  padding: 60,
  borderRadius: 2,
  animationDuration: 800,
  gridColor: '#e5e7eb',
  textColor: '#6b7280',
  axisColor: '#d1d5db',
  tooltipBackground: '#ffffff',
  tooltipTitleColor: '#111827',
  tooltipBodyColor: '#374151',
  fontSize: 12,
  titleFontSize: 14,
  cellSpacing: 1,
};

/**
 * 默认颜色比例尺 - 蓝到红渐变
 */
const DEFAULT_COLOR_SCALE: HeatmapColorScaleConfig = {
  minColor: '#f0f9ff', // 浅蓝
  maxColor: '#0369a1', // 深蓝
};

/**
 * 发散型颜色比例尺 - 支持负值（蓝-白-红）
 */
const DIVERGING_COLOR_SCALE: HeatmapColorScaleConfig = {
  minColor: '#dc2626', // 红色（负值）
  midColor: '#ffffff', // 白色（零值）
  maxColor: '#2563eb', // 蓝色（正值）
  diverging: true,
  neutralColor: '#ffffff',
};

/**
 * 解析颜色字符串为 RGB 对象
 */
const parseColor = (color: string): { r: number; g: number; b: number } => {
  // 处理 hex 颜色
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }
  // 处理 rgb/rgba 颜色
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  return { r: 0, g: 0, b: 0 };
};

/**
 * 将 RGB 对象转换为 hex 颜色字符串
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * 线性插值
 */
const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * 颜色插值
 */
const interpolateColor = (color1: string, color2: string, t: number): string => {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  const r = lerp(c1.r, c2.r, t);
  const g = lerp(c1.g, c2.g, t);
  const b = lerp(c1.b, c2.b, t);
  return rgbToHex(r, g, b);
};

/**
 * 获取数值对应的颜色
 */
const getColorForValue = (
  value: number,
  minValue: number,
  maxValue: number,
  colorScale: HeatmapColorScaleConfig
): string => {
  if (maxValue === minValue) {
    return colorScale.minColor;
  }

  // 发散型颜色比例尺（支持负值）
  if (colorScale.diverging) {
    const midValue = 0;
    const minColor = colorScale.minColor;
    const midColor = colorScale.midColor || colorScale.neutralColor || '#ffffff';
    const maxColor = colorScale.maxColor;

    if (value < midValue) {
      // 负值：从中间颜色到最小颜色
      const t = (value - minValue) / (midValue - minValue);
      return interpolateColor(minColor, midColor, Math.max(0, Math.min(1, t)));
    } else {
      // 正值：从中间颜色到最大颜色
      const t = (value - midValue) / (maxValue - midValue);
      return interpolateColor(midColor, maxColor, Math.max(0, Math.min(1, t)));
    }
  }

  // 普通线性颜色比例尺
  const t = (value - minValue) / (maxValue - minValue);
  return interpolateColor(colorScale.minColor, colorScale.maxColor, Math.max(0, Math.min(1, t)));
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: HeatmapChartData,
  width: number,
  height: number,
  padding: number,
  cellSpacing: number
): HeatmapChartConfig => {
  const xCount = data.xLabels.length;
  const yCount = data.yLabels.length;

  // 计算所有数据中的最大最小值
  let minValue = Infinity;
  let maxValue = -Infinity;

  data.datasets.forEach((dataset) => {
    dataset.data.forEach((row) => {
      row.forEach((value) => {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      });
    });
  });

  if (minValue === Infinity) {
    minValue = 0;
    maxValue = 1;
  }

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const cellWidth = xCount > 0 ? (chartWidth - cellSpacing * (xCount - 1)) / xCount : 0;
  const cellHeight = yCount > 0 ? (chartHeight - cellSpacing * (yCount - 1)) / yCount : 0;

  return {
    padding,
    chartWidth,
    chartHeight,
    cellWidth,
    cellHeight,
    minValue,
    maxValue,
    valueRange: maxValue - minValue || 1,
  };
};

/**
 * 计算单元格信息
 */
const calculateCells = (
  data: HeatmapChartData,
  config: HeatmapChartConfig,
  cellSpacing: number,
  colorScale: HeatmapColorScaleConfig
): ComputedCell[] => {
  const cells: ComputedCell[] = [];

  data.datasets.forEach((dataset) => {
    dataset.data.forEach((row, yIndex) => {
      row.forEach((value, xIndex) => {
        const x = config.padding + xIndex * (config.cellWidth + cellSpacing);
        const y = config.padding + yIndex * (config.cellHeight + cellSpacing);

        cells.push({
          x,
          y,
          width: config.cellWidth,
          height: config.cellHeight,
          value,
          color: getColorForValue(value, config.minValue, config.maxValue, colorScale),
          xLabel: data.xLabels[xIndex] || '',
          yLabel: data.yLabels[yIndex] || '',
          xIndex,
          yIndex,
        });
      });
    });
  });

  return cells;
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
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
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
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: HeatmapChartConfig,
  data: HeatmapChartData,
  gridConfig: { display?: boolean; color?: string; lineWidth?: number; opacity?: number },
  cellSpacing: number
) => {
  if (!gridConfig.display) return;

  const { padding, chartWidth, chartHeight, cellWidth, cellHeight } = config;
  const { xLabels, yLabels } = data;

  ctx.strokeStyle = gridConfig.color || DEFAULT_CONFIG.gridColor;
  ctx.lineWidth = gridConfig.lineWidth || 1;
  ctx.globalAlpha = gridConfig.opacity ?? 0.5;

  // 绘制垂直网格线
  xLabels.forEach((_, index) => {
    const x = padding + index * (cellWidth + cellSpacing);
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + chartHeight);
    ctx.stroke();
  });

  // 绘制水平网格线
  yLabels.forEach((_, index) => {
    const y = padding + index * (cellHeight + cellSpacing);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + chartWidth, y);
    ctx.stroke();
  });

  // 绘制外边框
  ctx.strokeRect(padding, padding, chartWidth, chartHeight);

  ctx.globalAlpha = 1;
};

/**
 * 绘制坐标轴标签
 */
const drawAxisLabels = (
  ctx: CanvasRenderingContext2D,
  config: HeatmapChartConfig,
  data: HeatmapChartData,
  xAxisConfig: HeatmapProps['xAxis'],
  yAxisConfig: HeatmapProps['yAxis'],
  cellSpacing: number
) => {
  const { padding, chartWidth, chartHeight, cellWidth, cellHeight } = config;
  const { xLabels, yLabels } = data;

  ctx.font = `${DEFAULT_CONFIG.fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // 绘制 X 轴标签
  if (xAxisConfig?.display !== false) {
    ctx.fillStyle = xAxisConfig?.tickColor || DEFAULT_CONFIG.textColor;
    ctx.font = `${xAxisConfig?.tickFontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;

    const rotation = ((xAxisConfig?.tickRotation || 0) * Math.PI) / 180;

    xLabels.forEach((label, index) => {
      const x = padding + index * (cellWidth + cellSpacing) + cellWidth / 2;
      const y = padding + chartHeight + 10;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });

    // 绘制 X 轴标题 - 放在图表底部居中
    if (xAxisConfig?.title?.text) {
      ctx.save();
      ctx.fillStyle = xAxisConfig.title.color || DEFAULT_CONFIG.textColor;
      ctx.font = `bold ${xAxisConfig.title.fontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(xAxisConfig.title.text, padding + chartWidth / 2, padding + chartHeight + 35);
      ctx.restore();
    }
  }

  // 绘制 Y 轴标签
  if (yAxisConfig?.display !== false) {
    ctx.fillStyle = yAxisConfig?.tickColor || DEFAULT_CONFIG.textColor;
    ctx.font = `${yAxisConfig?.tickFontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    yLabels.forEach((label, index) => {
      const x = padding - 10;
      const y = padding + index * (cellHeight + cellSpacing) + cellHeight / 2;
      ctx.fillText(label, x, y);
    });

    // 绘制 Y 轴标题 - 放在 Y 轴上方居中
    if (yAxisConfig?.title?.text) {
      ctx.save();
      ctx.fillStyle = yAxisConfig.title.color || DEFAULT_CONFIG.textColor;
      ctx.font = `bold ${yAxisConfig.title.fontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(yAxisConfig.title.text, padding, padding - 10);
      ctx.restore();
    }
  }
};

/**
 * 绘制单元格
 */
const drawCells = (
  ctx: CanvasRenderingContext2D,
  cells: ComputedCell[],
  borderRadius: number,
  animationProgress: number
) => {
  cells.forEach((cell) => {
    ctx.fillStyle = cell.color;

    // 动画效果：从中心向外扩展
    const centerX = cell.x + cell.width / 2;
    const centerY = cell.y + cell.height / 2;
    const currentWidth = cell.width * animationProgress;
    const currentHeight = cell.height * animationProgress;
    const currentX = centerX - currentWidth / 2;
    const currentY = centerY - currentHeight / 2;

    if (borderRadius > 0) {
      drawRoundedRect(ctx, currentX, currentY, currentWidth, currentHeight, borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
    }
  });
};

/**
 * 绘制单元格标签
 */
const drawCellLabels = (
  ctx: CanvasRenderingContext2D,
  cells: ComputedCell[],
  labelConfig: HeatmapProps['cellLabels'],
  config: HeatmapChartConfig
) => {
  if (!labelConfig?.display) return;

  const formatter = labelConfig.formatter || ((v: number) => v.toFixed(1));
  const minDisplayValue = labelConfig.minDisplayValue ?? -Infinity;

  ctx.font = `${labelConfig.fontSize || 11}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  cells.forEach((cell) => {
    if (cell.value < minDisplayValue) return;

    const text = formatter(cell.value);
    const x = cell.x + cell.width / 2;
    const y = cell.y + cell.height / 2;

    // 根据背景色亮度决定文字颜色
    const color = parseColor(cell.color);
    const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
    ctx.fillStyle = labelConfig.color || (brightness > 128 ? '#1f2937' : '#ffffff');

    ctx.fillText(text, x, y);
  });
};

/**
 * 查找鼠标位置对应的单元格
 */
const findCellAtPosition = (
  x: number,
  y: number,
  cells: ComputedCell[]
): ComputedCell | null => {
  for (const cell of cells) {
    if (
      x >= cell.x &&
      x <= cell.x + cell.width &&
      y >= cell.y &&
      y <= cell.y + cell.height
    ) {
      return cell;
    }
  }
  return null;
};

/**
 * 热力图组件
 */
const Heatmap: React.FC<HeatmapProps> = ({
  data,
  width = 600,
  height = 400,
  padding = DEFAULT_CONFIG.padding,
  colorScale = DEFAULT_COLOR_SCALE,
  xAxis,
  yAxis,
  grid,
  legend,
  tooltip,
  cellLabels,
  borderRadius = DEFAULT_CONFIG.borderRadius,
  cellSpacing = DEFAULT_CONFIG.cellSpacing,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  animationEnabled = true,
  className,
  style,
  onCellClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationProgress, setAnimationProgress] = useState(animationEnabled ? 0 : 1);
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    xLabel: '',
    yLabel: '',
    value: 0,
    color: '',
  });

  // 使用发散型颜色比例尺如果数据包含负值
  const effectiveColorScale = useMemo(() => {
    if (colorScale.diverging !== undefined) return colorScale;

    // 检查数据是否包含负值
    let hasNegative = false;
    for (const dataset of data.datasets) {
      for (const row of dataset.data) {
        for (const value of row) {
          if (value < 0) {
            hasNegative = true;
            break;
          }
        }
        if (hasNegative) break;
      }
      if (hasNegative) break;
    }

    return hasNegative ? DIVERGING_COLOR_SCALE : colorScale;
  }, [colorScale, data]);

  // 计算图表配置
  const config = useMemo(
    () => calculateChartConfig(data, width, height, padding, cellSpacing),
    [data, width, height, padding, cellSpacing]
  );

  // 计算单元格信息
  const cells = useMemo(
    () => calculateCells(data, config, cellSpacing, effectiveColorScale),
    [data, config, cellSpacing, effectiveColorScale]
  );

  // 动画效果
  useEffect(() => {
    if (!animationEnabled) {
      setAnimationProgress(1);
      return;
    }

    setAnimationProgress(0);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // 使用 easeOutCubic 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [data, animationDuration, animationEnabled]);

  // 绘制图表
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格
    drawGrid(ctx, config, data, grid || {}, cellSpacing);

    // 绘制单元格
    drawCells(ctx, cells, borderRadius, animationProgress);

    // 绘制坐标轴标签
    drawAxisLabels(ctx, config, data, xAxis, yAxis, cellSpacing);

    // 绘制单元格数值标签
    drawCellLabels(ctx, cells, cellLabels, config);
  }, [cells, config, data, grid, xAxis, yAxis, cellLabels, borderRadius, animationProgress, width, height, cellSpacing]);

  // 鼠标移动事件处理
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (tooltip?.enabled === false) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cell = findCellAtPosition(x, y, cells);

      if (cell) {
        setTooltipState({
          visible: true,
          x: e.clientX - (containerRef.current?.getBoundingClientRect().left || 0) + 10,
          y: e.clientY - (containerRef.current?.getBoundingClientRect().top || 0) - 10,
          xLabel: cell.xLabel,
          yLabel: cell.yLabel,
          value: cell.value,
          color: cell.color,
        });
      } else {
        setTooltipState((prev) => ({ ...prev, visible: false }));
      }
    },
    [cells, tooltip]
  );

  // 鼠标离开事件处理
  const handleMouseLeave = useCallback(() => {
    setTooltipState((prev) => ({ ...prev, visible: false }));
  }, []);

  // 点击事件处理
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onCellClick) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cell = findCellAtPosition(x, y, cells);
      if (cell) {
        onCellClick(cell.xIndex, cell.yIndex, cell.value);
      }
    },
    [cells, onCellClick]
  );

  // 生成颜色比例尺背景
  const colorScaleBackground = useMemo(() => {
    const { minColor, maxColor, midColor, diverging } = effectiveColorScale;
    
    if (diverging && midColor) {
      return `linear-gradient(to right, ${minColor}, ${midColor}, ${maxColor})`;
    }
    return `linear-gradient(to right, ${minColor}, ${maxColor})`;
  }, [effectiveColorScale]);

  // 生成图例数值标签
  const legendLabels = useMemo(() => {
    const { minValue, maxValue } = config;
    if (effectiveColorScale.diverging) {
      const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
      return [`-${maxAbs.toFixed(1)}`, '0', `${maxAbs.toFixed(1)}`];
    }
    return [minValue.toFixed(1), ((minValue + maxValue) / 2).toFixed(1), maxValue.toFixed(1)];
  }, [config, effectiveColorScale]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsHeatmapChartContainer, className)}
      style={style}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsHeatmapChartCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* 提示框 */}
      <div
        className={classNames(styles.zcpcyChatsTooltip, {
          [styles.zcpcyChatsTooltipVisible]: tooltipState.visible,
        })}
        style={{
          left: tooltipState.x,
          top: tooltipState.y,
          backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
          borderColor: tooltip?.borderColor || 'rgba(0, 0, 0, 0.05)',
          borderWidth: tooltip?.borderWidth || 1,
          borderStyle: 'solid',
          borderRadius: tooltip?.borderRadius || 8,
          padding: tooltip?.padding || '10px 14px',
        }}
      >
        {tooltip?.customContent ? (
          <div
            dangerouslySetInnerHTML={{
              __html: tooltip.customContent(
                tooltipState.xLabel,
                tooltipState.yLabel,
                tooltipState.value
              ),
            }}
          />
        ) : (
          <>
            <div
              className={styles.zcpcyChatsTooltipTitle}
              style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
            >
              {tooltipState.yLabel} × {tooltipState.xLabel}
            </div>
            <div className={styles.zcpcyChatsTooltipItem}>
              <span
                className={styles.zcpcyChatsTooltipColor}
                style={{ backgroundColor: tooltipState.color }}
              />
              <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                {tooltipState.value.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 颜色比例尺图例 */}
      {legend?.display !== false && (
        <div
          className={styles.zcpcyChatsColorScaleLegend}
          style={{
            marginTop: legend?.position === 'top' ? 0 : 8,
            marginBottom: legend?.position === 'bottom' ? 0 : 8,
          }}
        >
          <div
            className={styles.zcpcyChatsColorScaleBar}
            style={{ background: colorScaleBackground }}
          />
          {legend?.showValues !== false && (
            <div className={styles.zcpcyChatsColorScaleLabels}>
              {legendLabels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Heatmap;
