/**
 * 股票图组件 - Canvas 实现
 * 用于展示金融市场中证券（如股票、期货、外汇等）价格走势及相关交易数据的专业图表
 * 核心功能：
 * 1. K线（蜡烛图）展示开盘、最高、最低、收盘价格
 * 2. 成交量柱状图
 * 3. 移动平均线（MA）技术指标
 * 4. 十字光标和提示框
 * 5. 缩放和平移交互
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  StockProps,
  StockChartData,
  StockDataPoint,
  StockChartConfig,
  ComputedCandle,
  MovingAveragePoint,
  ComputedLayout,
  TimeRange,
} from './Stock.type';

// 默认颜色配置
const UP_COLOR = '#ef4444';    // 红色-上涨
const DOWN_COLOR = '#22c55e';  // 绿色-下跌
const MA_COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
const GRID_COLOR = '#f3f4f6';
const TEXT_COLOR = '#6b7280';
const CROSSHAIR_COLOR = '#9ca3af';

// 默认配置常量
const DEFAULT_PADDING = { top: 20, right: 60, bottom: 30, left: 10 };
const DEFAULT_CANDLESTICK = {
  upColor: UP_COLOR,
  downColor: DOWN_COLOR,
  barWidthRatio: 0.7,
  showWick: true,
  wickWidth: 1,
};
const DEFAULT_VOLUME = {
  visible: true,
  heightRatio: 0.25,
  upColor: UP_COLOR,
  downColor: DOWN_COLOR,
  barWidthRatio: 0.7,
};
const DEFAULT_MA = {
  visible: true,
  periods: [5, 10, 20, 60],
  colors: MA_COLORS,
  lineWidth: 1.5,
};
const DEFAULT_GRID = {
  visible: true,
  horizontalLines: 6,
  verticalLines: 6,
  lineColor: GRID_COLOR,
  lineType: 'dashed' as const,
};
const DEFAULT_AXIS_X = {
  visible: true,
  labelColor: TEXT_COLOR,
  labelFontSize: 11,
  maxLabels: 6,
};
const DEFAULT_AXIS_Y = {
  visible: true,
  labelColor: TEXT_COLOR,
  labelFontSize: 11,
  position: 'right' as const,
  showZeroLine: false,
};
const DEFAULT_TOOLTIP = {
  visible: true,
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  titleColor: '#111827',
  textColor: '#374151',
  fontSize: 12,
  showOpen: true,
  showHigh: true,
  showLow: true,
  showClose: true,
  showChange: true,
  showVolume: true,
};
const DEFAULT_CROSSHAIR = {
  visible: true,
  horizontalColor: CROSSHAIR_COLOR,
  verticalColor: CROSSHAIR_COLOR,
  lineType: 'dashed' as const,
  labelBackground: '#374151',
  labelColor: '#ffffff',
};
const DEFAULT_INTERACTION = {
  zoomEnabled: true,
  minDataPoints: 20,
  maxDataPoints: 500,
  panEnabled: true,
  defaultDataPoints: 120,
};

/**
 * 格式化日期
 */
const formatDate = (timestamp: number, short = false): string => {
  const date = new Date(timestamp);
  if (short) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * 格式化价格
 */
const formatPrice = (price: number, decimals = 2): string => {
  return price.toFixed(decimals);
};

/**
 * 格式化成交量
 */
const formatVolume = (volume: number): string => {
  if (volume >= 100000000) {
    return `${(volume / 100000000).toFixed(2)}亿`;
  }
  if (volume >= 10000) {
    return `${(volume / 10000).toFixed(2)}万`;
  }
  return volume.toString();
};

/**
 * 计算移动平均线
 */
const calculateMA = (data: StockDataPoint[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push(sum / period);
  }
  return result;
};

/**
 * 股票图组件
 */
const Stock: React.FC<StockProps> = ({
  data,
  config,
  width = 800,
  height = 500,
  className,
  style,
  onDataClick,
  onVisibleRangeChange,
  loading = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 合并配置
  const mergedConfig = useMemo(() => {
    const cfg = config || {};
    return {
      padding: { ...DEFAULT_PADDING, ...cfg.padding },
      backgroundColor: cfg.backgroundColor || '#ffffff',
      candlestick: { ...DEFAULT_CANDLESTICK, ...cfg.candlestick },
      volume: { ...DEFAULT_VOLUME, ...cfg.volume },
      movingAverage: { ...DEFAULT_MA, ...cfg.movingAverage },
      grid: { ...DEFAULT_GRID, ...cfg.grid },
      axis: {
        x: { ...DEFAULT_AXIS_X, ...cfg.axis?.x },
        y: { ...DEFAULT_AXIS_Y, ...cfg.axis?.y },
      },
      tooltip: { ...DEFAULT_TOOLTIP, ...cfg.tooltip },
      crosshair: { ...DEFAULT_CROSSHAIR, ...cfg.crosshair },
      interaction: { ...DEFAULT_INTERACTION, ...cfg.interaction },
      indicator: { macd: { visible: false }, rsi: { visible: false }, kdj: { visible: false }, ...cfg.indicator },
      animationDuration: cfg.animationDuration || 300,
    };
  }, [config]);
  
  // 状态
  const [visibleRange, setVisibleRange] = useState({
    start: Math.max(0, data.data.length - mergedConfig.interaction.defaultDataPoints),
    end: data.data.length,
  });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRange, setDragStartRange] = useState({ start: 0, end: 0 });
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });

  // 计算布局
  const computedLayout = useMemo((): ComputedLayout => {
    const { padding, volume } = mergedConfig;
    const visibleData = data.data.slice(visibleRange.start, visibleRange.end);
    
    // 计算图表区域 - 使用类型断言确保值存在
    const paddingTop = padding.top || 20;
    const paddingBottom = padding.bottom || 30;
    const paddingLeft = padding.left || 10;
    const paddingRight = padding.right || 60;
    const volumeHeightRatio = volume.heightRatio || 0.25;
    const volumeVisible = volume.visible !== false;
    
    const mainChartHeight = volumeVisible
      ? height * (1 - volumeHeightRatio) - paddingTop - paddingBottom * 2
      : height - paddingTop - paddingBottom;
    
    const mainChart = {
      x: paddingLeft,
      y: paddingTop,
      width: width - paddingLeft - paddingRight,
      height: mainChartHeight,
    };

    const volumeChart = volumeVisible ? {
      x: paddingLeft,
      y: paddingTop + mainChartHeight + paddingBottom,
      width: width - paddingLeft - paddingRight,
      height: height * volumeHeightRatio - paddingBottom,
    } : undefined;

    // 计算价格范围
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleData.forEach(d => {
      minPrice = Math.min(minPrice, d.low);
      maxPrice = Math.max(maxPrice, d.high);
    });
    
    // 添加一些边距
    const priceRange = maxPrice - minPrice;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;

    // 计算K线
    const barWidthRatio = mergedConfig.candlestick.barWidthRatio || 0.7;
    const candleWidth = mainChart.width / visibleData.length * barWidthRatio;
    const priceScale = mainChart.height / (maxPrice - minPrice || 1);
    
    const candles: ComputedCandle[] = visibleData.map((d, i) => {
      const x = paddingLeft + (i + 0.5) * (mainChart.width / visibleData.length);
      return {
        index: visibleRange.start + i,
        x,
        openY: paddingTop + (maxPrice - d.open) * priceScale,
        closeY: paddingTop + (maxPrice - d.close) * priceScale,
        highY: paddingTop + (maxPrice - d.high) * priceScale,
        lowY: paddingTop + (maxPrice - d.low) * priceScale,
        isUp: d.close >= d.open,
        bodyHeight: Math.abs(d.close - d.open) * priceScale,
        width: candleWidth,
        data: d,
      };
    });

    // 计算移动平均线
    const movingAverages = new Map<number, MovingAveragePoint[]>();
    if (mergedConfig.movingAverage.visible) {
      const periods = mergedConfig.movingAverage.periods || [5, 10, 20, 60];
      periods.forEach(period => {
        const maData = calculateMA(data.data, period);
        const points: MovingAveragePoint[] = [];
        for (let i = visibleRange.start; i < visibleRange.end; i++) {
          const value = maData[i];
          const dataPoint = data.data[i];
          if (value !== null && dataPoint) {
            const localIndex = i - visibleRange.start;
            points.push({
              timestamp: dataPoint.timestamp,
              value,
              x: paddingLeft + (localIndex + 0.5) * (mainChart.width / visibleData.length),
              y: paddingTop + (maxPrice - value) * priceScale,
            });
          }
        }
        movingAverages.set(period, points);
      });
    }

    return {
      mainChart,
      volumeChart,
      priceRange: { min: minPrice, max: maxPrice },
      visibleRange,
      candles,
      movingAverages,
    };
  }, [data, visibleRange, width, height, mergedConfig]);

  // 绘制图表
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { backgroundColor, candlestick, volume, grid, axis, crosshair } = mergedConfig;
    const { mainChart, volumeChart, candles, movingAverages, priceRange } = computedLayout;
    
    // 获取配置值
    const gridVisible = grid.visible !== false;
    const gridLineColor = grid.lineColor || GRID_COLOR;
    const gridHorizontalLines = grid.horizontalLines || 6;
    const gridVerticalLines = grid.verticalLines || 6;
    const gridLineType = grid.lineType || 'dashed';
    
    const candleUpColor = candlestick.upColor || UP_COLOR;
    const candleDownColor = candlestick.downColor || DOWN_COLOR;
    const candleShowWick = candlestick.showWick !== false;
    const candleWickWidth = candlestick.wickWidth || 1;
    
    const volumeVisible = volume.visible !== false;
    const volumeUpColor = volume.upColor || UP_COLOR;
    const volumeDownColor = volume.downColor || DOWN_COLOR;
    const volumeBarWidthRatio = volume.barWidthRatio || 0.7;
    
    const axisYVisible = axis.y.visible !== false;
    const axisYLabelColor = axis.y.labelColor || TEXT_COLOR;
    const axisYLabelFontSize = axis.y.labelFontSize || 11;
    const axisYPosition = axis.y.position || 'right';
    
    const axisXVisible = axis.x.visible !== false;
    const axisXLabelColor = axis.x.labelColor || TEXT_COLOR;
    const axisXLabelFontSize = axis.x.labelFontSize || 11;
    const axisXMaxLabels = axis.x.maxLabels || 6;
    
    const crosshairVisible = crosshair.visible !== false;
    const crosshairHorizontalColor = crosshair.horizontalColor || CROSSHAIR_COLOR;
    const crosshairVerticalColor = crosshair.verticalColor || CROSSHAIR_COLOR;
    const crosshairLineType = crosshair.lineType || 'dashed';
    const crosshairLabelBackground = crosshair.labelBackground || '#374151';
    const crosshairLabelColor = crosshair.labelColor || '#ffffff';
    
    const maVisible = mergedConfig.movingAverage.visible !== false;
    const maPeriods = mergedConfig.movingAverage.periods || [5, 10, 20, 60];
    const maColors = mergedConfig.movingAverage.colors || MA_COLORS;
    const maLineWidth = mergedConfig.movingAverage.lineWidth || 1.5;

    // 清空画布
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // 绘制网格
    if (gridVisible) {
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1;
      if (gridLineType === 'dashed') {
        ctx.setLineDash([4, 4]);
      } else if (gridLineType === 'dotted') {
        ctx.setLineDash([2, 2]);
      }

      // 水平网格线
      for (let i = 0; i <= gridHorizontalLines; i++) {
        const y = mainChart.y + (mainChart.height / gridHorizontalLines) * i;
        ctx.beginPath();
        ctx.moveTo(mainChart.x, y);
        ctx.lineTo(mainChart.x + mainChart.width, y);
        ctx.stroke();
      }

      // 垂直网格线
      for (let i = 0; i <= gridVerticalLines; i++) {
        const x = mainChart.x + (mainChart.width / gridVerticalLines) * i;
        ctx.beginPath();
        ctx.moveTo(x, mainChart.y);
        ctx.lineTo(x, mainChart.y + mainChart.height);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // 绘制K线
    candles.forEach(candle => {
      const color = candle.isUp ? candleUpColor : candleDownColor;
      
      // 绘制影线
      if (candleShowWick) {
        ctx.strokeStyle = color;
        ctx.lineWidth = candleWickWidth;
        ctx.beginPath();
        ctx.moveTo(candle.x, candle.highY);
        ctx.lineTo(candle.x, candle.lowY);
        ctx.stroke();
      }

      // 绘制实体
      ctx.fillStyle = color;
      const bodyTop = Math.min(candle.openY, candle.closeY);
      const bodyHeight = Math.max(candle.bodyHeight, 1);
      ctx.fillRect(
        candle.x - candle.width / 2,
        bodyTop,
        candle.width,
        bodyHeight
      );
    });

    // 绘制移动平均线
    if (maVisible) {
      maPeriods.forEach((period, idx) => {
        const points = movingAverages.get(period);
        if (!points || points.length < 2) return;

        ctx.strokeStyle = maColors[idx % maColors.length];
        ctx.lineWidth = maLineWidth;
        ctx.beginPath();
        points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      });
    }

    // 绘制成交量
    if (volumeVisible && volumeChart) {
      const visibleData = data.data.slice(visibleRange.start, visibleRange.end);
      const maxVolume = Math.max(...visibleData.map(d => d.volume || 0), 1);
      const volumeScale = volumeChart.height / (maxVolume * 1.1);

      candles.forEach(candle => {
        const v = candle.data.volume || 0;
        const color = candle.isUp ? volumeUpColor : volumeDownColor;
        const barHeight = v * volumeScale;
        
        ctx.fillStyle = color;
        ctx.fillRect(
          candle.x - candle.width / 2,
          volumeChart.y + volumeChart.height - barHeight,
          candle.width * volumeBarWidthRatio,
          barHeight
        );
      });
    }

    // 绘制Y轴标签（价格）
    if (axisYVisible) {
      ctx.fillStyle = axisYLabelColor;
      ctx.font = `${axisYLabelFontSize}px sans-serif`;
      ctx.textAlign = axisYPosition === 'left' ? 'left' : 'right';
      
      const labelX = axisYPosition === 'left' 
        ? mainChart.x - 5 
        : mainChart.x + mainChart.width + 5;

      for (let i = 0; i <= gridHorizontalLines; i++) {
        const price = priceRange.max - (priceRange.max - priceRange.min) * (i / gridHorizontalLines);
        const y = mainChart.y + (mainChart.height / gridHorizontalLines) * i;
        ctx.fillText(formatPrice(price), labelX, y + 4);
      }
    }

    // 绘制X轴标签（日期）
    if (axisXVisible) {
      ctx.fillStyle = axisXLabelColor;
      ctx.font = `${axisXLabelFontSize}px sans-serif`;
      ctx.textAlign = 'center';

      const labelCount = Math.min(axisXMaxLabels, candles.length);
      const step = Math.ceil(candles.length / labelCount);

      candles.forEach((candle, i) => {
        if (i % step === 0 || i === candles.length - 1) {
          const short = candles.length > 60;
          ctx.fillText(
            formatDate(candle.data.timestamp, short),
            candle.x,
            mainChart.y + mainChart.height + 15
          );
        }
      });
    }

    // 绘制十字光标
    if (crosshairVisible && hoverIndex !== null) {
      const candle = candles[hoverIndex - visibleRange.start];
      if (candle) {
        ctx.strokeStyle = crosshairHorizontalColor;
        ctx.lineWidth = 1;
        if (crosshairLineType === 'dashed') {
          ctx.setLineDash([4, 4]);
        }

        // 水平线
        ctx.beginPath();
        ctx.moveTo(mainChart.x, candle.closeY);
        ctx.lineTo(mainChart.x + mainChart.width, candle.closeY);
        ctx.stroke();

        // 垂直线
        ctx.strokeStyle = crosshairVerticalColor;
        ctx.beginPath();
        ctx.moveTo(candle.x, mainChart.y);
        ctx.lineTo(candle.x, mainChart.y + mainChart.height);
        ctx.stroke();

        ctx.setLineDash([]);

        // 绘制价格标签
        ctx.fillStyle = crosshairLabelBackground;
        const priceText = formatPrice(candle.data.close);
        const textWidth = ctx.measureText(priceText).width + 10;
        const labelX = axisYPosition === 'left' 
          ? mainChart.x - textWidth - 2 
          : mainChart.x + mainChart.width + 2;
        
        ctx.fillRect(labelX, candle.closeY - 10, textWidth, 20);
        ctx.fillStyle = crosshairLabelColor;
        ctx.textAlign = 'center';
        ctx.fillText(priceText, labelX + textWidth / 2, candle.closeY + 4);
      }
    }
  }, [data, computedLayout, hoverIndex, width, height, visibleRange, mergedConfig]);

  // 绘制
  useEffect(() => {
    draw();
  }, [draw]);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const panEnabled = mergedConfig.interaction.panEnabled !== false;
    
    if (isDragging && panEnabled) {
      const dx = x - dragStartX;
      const dataPointWidth = computedLayout.mainChart.width / (visibleRange.end - visibleRange.start);
      const dataPointsDelta = Math.round(-dx / dataPointWidth);
      
      if (dataPointsDelta !== 0) {
        const newStart = Math.max(0, Math.min(
          data.data.length - (dragStartRange.end - dragStartRange.start),
          dragStartRange.start + dataPointsDelta
        ));
        const newEnd = newStart + (dragStartRange.end - dragStartRange.start);
        
        setVisibleRange({ start: newStart, end: newEnd });
        onVisibleRangeChange?.({ start: newStart, end: newEnd });
      }
      return;
    }

    // 查找最近的K线
    const { mainChart } = computedLayout;
    if (x >= mainChart.x && x <= mainChart.x + mainChart.width &&
        y >= mainChart.y && y <= mainChart.y + mainChart.height) {
      const relativeX = x - mainChart.x;
      const dataIndex = Math.floor(relativeX / (mainChart.width / (visibleRange.end - visibleRange.start)));
      const actualIndex = visibleRange.start + dataIndex;
      
      if (actualIndex >= visibleRange.start && actualIndex < visibleRange.end) {
        setHoverIndex(actualIndex);
        setTooltipPos({ x: e.clientX + 10, y: e.clientY - 10, visible: true });
      }
    } else {
      setHoverIndex(null);
      setTooltipPos(prev => ({ ...prev, visible: false }));
    }
  }, [isDragging, dragStartX, dragStartRange, visibleRange, computedLayout, data.data.length, mergedConfig.interaction.panEnabled, onVisibleRangeChange]);

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const panEnabled = mergedConfig.interaction.panEnabled !== false;
    if (!panEnabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    setIsDragging(true);
    setDragStartX(x);
    setDragStartRange({ ...visibleRange });
  }, [visibleRange, mergedConfig.interaction.panEnabled]);

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
    setTooltipPos(prev => ({ ...prev, visible: false }));
    setIsDragging(false);
  }, []);

  // 处理点击
  const handleClick = useCallback(() => {
    if (hoverIndex !== null && onDataClick) {
      onDataClick(data.data[hoverIndex], hoverIndex);
    }
  }, [hoverIndex, data.data, onDataClick]);

  // 处理滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    const zoomEnabled = mergedConfig.interaction.zoomEnabled !== false;
    if (!zoomEnabled) return;
    // 检查事件是否可以取消，避免 passive event listener 警告
    if (e.cancelable) {
      e.preventDefault();
    }

    const minDataPoints = mergedConfig.interaction.minDataPoints || 20;
    const maxDataPoints = mergedConfig.interaction.maxDataPoints || 500;
    
    const currentCount = visibleRange.end - visibleRange.start;
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newCount = Math.round(currentCount * zoomFactor);
    
    const clampedCount = Math.max(minDataPoints, Math.min(maxDataPoints, newCount));
    const centerIndex = (visibleRange.start + visibleRange.end) / 2;
    const newStart = Math.max(0, Math.min(data.data.length - clampedCount, 
      Math.round(centerIndex - clampedCount / 2)));
    const newEnd = newStart + clampedCount;

    setVisibleRange({ start: newStart, end: newEnd });
    onVisibleRangeChange?.({ start: newStart, end: newEnd });
  }, [visibleRange, data.data.length, mergedConfig.interaction, onVisibleRangeChange]);

  // 时间范围按钮
  const timeRanges: { label: string; value: TimeRange; getRange: () => { start: number; end: number } }[] = [
    {
      label: '1日',
      value: '1D',
      getRange: () => ({ start: Math.max(0, data.data.length - 1), end: data.data.length })
    },
    {
      label: '5日',
      value: '5D',
      getRange: () => ({ start: Math.max(0, data.data.length - 5), end: data.data.length })
    },
    {
      label: '1月',
      value: '1M',
      getRange: () => ({ start: Math.max(0, data.data.length - 30), end: data.data.length })
    },
    {
      label: '1季',
      value: '3M',
      getRange: () => ({ start: Math.max(0, data.data.length - 90), end: data.data.length })
    },
    {
      label: '1年',
      value: '1Y',
      getRange: () => ({ start: Math.max(0, data.data.length - 365), end: data.data.length })
    },
    {
      label: '全部',
      value: 'ALL',
      getRange: () => ({ start: 0, end: data.data.length })
    },
  ];

  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('1M');

  const handleTimeRangeClick = (range: typeof timeRanges[0]) => {
    const newRange = range.getRange();
    setActiveTimeRange(range.value);
    setVisibleRange(newRange);
    onVisibleRangeChange?.(newRange);
  };

  // 当前悬停的数据，默认显示最后一个可见数据点
  const hoverData = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.data.length
    ? data.data[hoverIndex]
    : data.data[visibleRange.end - 1];

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsStockChartContainer, className)}
      style={{ width, height: 'auto', ...style }}
    >
      {/* 控制栏 */}
      <div className={styles.zcpcyChatsStockControls}>
        <div className={styles.zcpcyChatsStockTimeRangeButtons}>
          {timeRanges.map(range => (
            <button
              key={range.value}
              className={classNames(
                styles.zcpcyChatsStockTimeRangeButton,
                activeTimeRange === range.value && styles.zcpcyChatsStockTimeRangeButtonActive
              )}
              onClick={() => handleTimeRangeClick(range)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* 信息栏 */}
      {hoverData && (
        <div className={styles.zcpcyChatsStockInfoBar}>
          <div className={styles.zcpcyChatsStockInfoItem}>
            <span className={styles.zcpcyChatsStockInfoLabel}>日期:</span>
            <span className={styles.zcpcyChatsStockInfoValue}>{formatDate(hoverData.timestamp)}</span>
          </div>
          <div className={styles.zcpcyChatsStockInfoItem}>
            <span className={styles.zcpcyChatsStockInfoLabel}>开:</span>
            <span className={classNames(
              styles.zcpcyChatsStockInfoValue,
              hoverData.close >= hoverData.open ? styles.zcpcyChatsStockInfoValueUp : styles.zcpcyChatsStockInfoValueDown
            )}>
              {formatPrice(hoverData.open)}
            </span>
          </div>
          <div className={styles.zcpcyChatsStockInfoItem}>
            <span className={styles.zcpcyChatsStockInfoLabel}>高:</span>
            <span className={styles.zcpcyChatsStockInfoValue}>{formatPrice(hoverData.high)}</span>
          </div>
          <div className={styles.zcpcyChatsStockInfoItem}>
            <span className={styles.zcpcyChatsStockInfoLabel}>低:</span>
            <span className={styles.zcpcyChatsStockInfoValue}>{formatPrice(hoverData.low)}</span>
          </div>
          <div className={styles.zcpcyChatsStockInfoItem}>
            <span className={styles.zcpcyChatsStockInfoLabel}>收:</span>
            <span className={classNames(
              styles.zcpcyChatsStockInfoValue,
              hoverData.close >= hoverData.open ? styles.zcpcyChatsStockInfoValueUp : styles.zcpcyChatsStockInfoValueDown
            )}>
              {formatPrice(hoverData.close)}
            </span>
          </div>
          {hoverData.volume !== undefined && (
            <div className={styles.zcpcyChatsStockInfoItem}>
              <span className={styles.zcpcyChatsStockInfoLabel}>成交量:</span>
              <span className={styles.zcpcyChatsStockInfoValue}>{formatVolume(hoverData.volume)}</span>
            </div>
          )}
        </div>
      )}

      {/* 图例 */}
      {mergedConfig.movingAverage.visible && (
        <div className={styles.zcpcyChatsStockLegend}>
          {(mergedConfig.movingAverage.periods || [5, 10, 20, 60]).map((period, idx) => (
            <div key={period} className={styles.zcpcyChatsStockLegendItem}>
              <div 
                className={styles.zcpcyChatsStockLegendColor}
                style={{ backgroundColor: (mergedConfig.movingAverage.colors || MA_COLORS)[idx % (mergedConfig.movingAverage.colors || MA_COLORS).length] }}
              />
              <span className={styles.zcpcyChatsStockLegendLabel}>MA{period}</span>
            </div>
          ))}
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={styles.zcpcyChatsStockChartCanvas}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* 加载状态 */}
      {loading && (
        <div className={styles.zcpcyChatsStockChartLoading}>
          <div className={styles.zcpcyChatsStockChartLoadingSpinner} />
        </div>
      )}

      {/* 空数据状态 */}
      {!loading && data.data.length === 0 && (
        <div className={styles.zcpcyChatsStockEmpty}>
          <svg className={styles.zcpcyChatsStockEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          <span className={styles.zcpcyChatsStockEmptyText}>暂无数据</span>
        </div>
      )}

      {/* 提示框 */}
      {mergedConfig.tooltip.visible && hoverData && tooltipPos.visible && (
        <div
          className={classNames(
            styles.zcpcyChatsStockTooltip,
            styles.zcpcyChatsStockTooltipVisible
          )}
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            backgroundColor: mergedConfig.tooltip.backgroundColor,
            borderColor: mergedConfig.tooltip.borderColor,
            color: mergedConfig.tooltip.textColor,
            fontSize: mergedConfig.tooltip.fontSize,
          }}
        >
          <div 
            className={styles.zcpcyChatsStockTooltipTitle}
            style={{ color: mergedConfig.tooltip.titleColor }}
          >
            {formatDate(hoverData.timestamp)}
          </div>
          {mergedConfig.tooltip.showOpen && (
            <div className={styles.zcpcyChatsStockTooltipRow}>
              <span className={styles.zcpcyChatsStockTooltipLabel}>开盘:</span>
              <span className={classNames(
                styles.zcpcyChatsStockTooltipValue,
                hoverData.close >= hoverData.open ? styles.zcpcyChatsStockTooltipUp : styles.zcpcyChatsStockTooltipDown
              )}>
                {formatPrice(hoverData.open)}
              </span>
            </div>
          )}
          {mergedConfig.tooltip.showHigh && (
            <div className={styles.zcpcyChatsStockTooltipRow}>
              <span className={styles.zcpcyChatsStockTooltipLabel}>最高:</span>
              <span className={styles.zcpcyChatsStockTooltipValue}>{formatPrice(hoverData.high)}</span>
            </div>
          )}
          {mergedConfig.tooltip.showLow && (
            <div className={styles.zcpcyChatsStockTooltipRow}>
              <span className={styles.zcpcyChatsStockTooltipLabel}>最低:</span>
              <span className={styles.zcpcyChatsStockTooltipValue}>{formatPrice(hoverData.low)}</span>
            </div>
          )}
          {mergedConfig.tooltip.showClose && (
            <div className={styles.zcpcyChatsStockTooltipRow}>
              <span className={styles.zcpcyChatsStockTooltipLabel}>收盘:</span>
              <span className={classNames(
                styles.zcpcyChatsStockTooltipValue,
                hoverData.close >= hoverData.open ? styles.zcpcyChatsStockTooltipUp : styles.zcpcyChatsStockTooltipDown
              )}>
                {formatPrice(hoverData.close)}
              </span>
            </div>
          )}
          {mergedConfig.tooltip.showChange && hoverData.change !== undefined && (
            <div className={styles.zcpcyChatsStockTooltipRow}>
              <span className={styles.zcpcyChatsStockTooltipLabel}>涨跌幅:</span>
              <span className={classNames(
                styles.zcpcyChatsStockTooltipValue,
                (hoverData.change || 0) >= 0 ? styles.zcpcyChatsStockTooltipUp : styles.zcpcyChatsStockTooltipDown
              )}>
                {(hoverData.change || 0) >= 0 ? '+' : ''}{hoverData.change?.toFixed(2)}%
              </span>
            </div>
          )}
          {mergedConfig.tooltip.showVolume && hoverData.volume !== undefined && (
            <div className={styles.zcpcyChatsStockTooltipRow}>
              <span className={styles.zcpcyChatsStockTooltipLabel}>成交量:</span>
              <span className={styles.zcpcyChatsStockTooltipValue}>{formatVolume(hoverData.volume)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Stock;
