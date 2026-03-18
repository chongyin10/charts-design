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
  const initialEnd = data.data.length;
  const initialStart = Math.max(0, data.data.length - mergedConfig.interaction.defaultDataPoints);
  const [visibleRange, setVisibleRange] = useState({
    start: initialStart,
    end: initialEnd,
  });
  // 初始 hoverIndex 设为默认可见范围的最后一个数据点，确保信息栏始终显示
  const [hoverIndex, setHoverIndex] = useState<number | null>(initialEnd > 0 ? initialEnd - 1 : null);
  // 鼠标/触摸的精确位置（用于十字光标）
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRange, setDragStartRange] = useState({ start: 0, end: 0 });
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  
  // 触摸状态
  const touchState = useRef<{
    startX: number;
    startY: number;
    startDistance: number;
    startRange: { start: number; end: number };
    isPinching: boolean;
    isDragging: boolean;
    lastTouchX: number;
    lastTouchY: number;
  }>({
    startX: 0,
    startY: 0,
    startDistance: 0,
    startRange: { start: 0, end: 0 },
    isPinching: false,
    isDragging: false,
    lastTouchX: 0,
    lastTouchY: 0,
  });

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
        // 使用光标实际位置，如果没有则使用 K 线数据点位置
        const cursorX = cursorPos?.x ?? candle.x;
        const cursorY = cursorPos?.y ?? candle.closeY;
        
        // 限制在图表区域内
        const clampedX = Math.max(mainChart.x, Math.min(mainChart.x + mainChart.width, cursorX));
        const clampedY = Math.max(mainChart.y, Math.min(mainChart.y + mainChart.height, cursorY));
        
        ctx.strokeStyle = crosshairHorizontalColor;
        ctx.lineWidth = 1;
        if (crosshairLineType === 'dashed') {
          ctx.setLineDash([4, 4]);
        }

        // 水平线 - 跟随光标 Y 位置
        ctx.beginPath();
        ctx.moveTo(mainChart.x, clampedY);
        ctx.lineTo(mainChart.x + mainChart.width, clampedY);
        ctx.stroke();

        // 垂直线 - 跟随光标 X 位置
        ctx.strokeStyle = crosshairVerticalColor;
        ctx.beginPath();
        ctx.moveTo(clampedX, mainChart.y);
        ctx.lineTo(clampedX, mainChart.y + mainChart.height);
        ctx.stroke();

        ctx.setLineDash([]);

        // 根据光标 Y 位置计算对应的价格
        const priceAtCursor = priceRange.max - (clampedY - mainChart.y) / mainChart.height * (priceRange.max - priceRange.min);
        
        // 绘制价格标签
        ctx.fillStyle = crosshairLabelBackground;
        const priceText = formatPrice(priceAtCursor);
        const textWidth = ctx.measureText(priceText).width + 10;
        const labelX = axisYPosition === 'left'
          ? mainChart.x - textWidth - 2
          : mainChart.x + mainChart.width + 2;
        
        ctx.fillRect(labelX, clampedY - 10, textWidth, 20);
        ctx.fillStyle = crosshairLabelColor;
        ctx.textAlign = 'center';
        ctx.fillText(priceText, labelX + textWidth / 2, clampedY + 4);
      }
    }
  }, [data, computedLayout, hoverIndex, cursorPos, width, height, visibleRange, mergedConfig]);

  // 绘制
  useEffect(() => {
    draw();
  }, [draw]);

  // 使用原生事件绑定触摸事件和滚轮事件（支持 passive: false）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 原生触摸事件处理器
    const handleNativeTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      const panEnabled = mergedConfig.interaction.panEnabled !== false;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      if (e.touches.length === 1 && panEnabled) {
        const touch = e.touches[0];
        // 转换为 Canvas 逻辑坐标
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        touchState.current = {
          startX: x,
          startY: y,
          startDistance: 0,
          startRange: { ...visibleRange },
          isPinching: false,
          isDragging: true,
          lastTouchX: x,
          lastTouchY: y,
        };
        setIsDragging(true);
        setDragStartX(touchState.current.startX);
        setDragStartRange({ ...visibleRange });
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        touchState.current = {
          ...touchState.current,
          startDistance: distance,
          startRange: { ...visibleRange },
          isPinching: true,
          isDragging: false,
          lastTouchX: ((touch1.clientX + touch2.clientX) / 2 - rect.left) * scaleX,
          lastTouchY: ((touch1.clientY + touch2.clientY) / 2 - rect.top) * scaleY,
        };
      }
    };

    const handleNativeTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      if (e.touches.length === 1 && touchState.current.isDragging) {
        const touch = e.touches[0];
        // 转换为 Canvas 逻辑坐标
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        const dx = x - touchState.current.startX;
        const dataPointWidth = computedLayout.mainChart.width / (touchState.current.startRange.end - touchState.current.startRange.start);
        const dataPointsDelta = Math.round(-dx / dataPointWidth);
        
        if (dataPointsDelta !== 0) {
          const newStart = Math.max(0, Math.min(
            data.data.length - (touchState.current.startRange.end - touchState.current.startRange.start),
            touchState.current.startRange.start + dataPointsDelta
          ));
          const newEnd = newStart + (touchState.current.startRange.end - touchState.current.startRange.start);
          
          setVisibleRange({ start: newStart, end: newEnd });
          onVisibleRangeChange?.({ start: newStart, end: newEnd });
        }
        
        // 更新悬停位置 - 即使在图表区域外也保持信息栏显示
        const { mainChart } = computedLayout;
        const relativeX = Math.max(0, Math.min(mainChart.width, x - mainChart.x));
        const dataIndex = Math.floor(relativeX / (mainChart.width / (visibleRange.end - visibleRange.start)));
        const actualIndex = Math.max(visibleRange.start, Math.min(visibleRange.end - 1, visibleRange.start + dataIndex));
        setHoverIndex(actualIndex);
        setCursorPos({ x, y });
      } else if (e.touches.length === 2 && touchState.current.isPinching) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const zoomEnabled = mergedConfig.interaction.zoomEnabled !== false;
        if (!zoomEnabled) return;
        
        const minDataPoints = mergedConfig.interaction.minDataPoints || 20;
        const maxDataPoints = mergedConfig.interaction.maxDataPoints || 500;
        
        const scale = distance / touchState.current.startDistance;
        const currentCount = touchState.current.startRange.end - touchState.current.startRange.start;
        const newCount = Math.round(currentCount / scale);
        
        const clampedCount = Math.max(minDataPoints, Math.min(maxDataPoints, newCount));
        
        const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
        const { mainChart } = computedLayout;
        const relativeX = Math.max(0, Math.min(mainChart.width, centerX - mainChart.x));
        const dataPointWidth = mainChart.width / currentCount;
        const centerDataIndex = touchState.current.startRange.start + Math.floor(relativeX / dataPointWidth);
        
        const newStart = Math.max(0, Math.min(data.data.length - clampedCount,
          Math.round(centerDataIndex - (relativeX / mainChart.width) * clampedCount)));
        const newEnd = newStart + clampedCount;
        
        setVisibleRange({ start: newStart, end: newEnd });
        onVisibleRangeChange?.({ start: newStart, end: newEnd });
      }
    };

    const handleNativeTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchState.current.isDragging = false;
      touchState.current.isPinching = false;
      setIsDragging(false);
    };

    // 原生滚轮事件处理器 - 支持鼠标滚轮和触摸板双指缩放
    const handleNativeWheel = (e: WheelEvent) => {
      // 总是阻止默认滚动行为（包括横向滚动）
      e.preventDefault();
      e.stopPropagation();
      
      const zoomEnabled = mergedConfig.interaction.zoomEnabled !== false;
      if (!zoomEnabled) return;

      const minDataPoints = mergedConfig.interaction.minDataPoints || 20;
      const maxDataPoints = mergedConfig.interaction.maxDataPoints || 500;
      
      const currentCount = visibleRange.end - visibleRange.start;
      
      // 检测触摸板双指缩放 (pinch gesture)
      // e.ctrlKey 在触摸板双指缩放时为 true
      const isPinch = e.ctrlKey || e.metaKey;
      
      // 根据 deltaY 计算缩放因子
      // 触摸板的 deltaY 通常较小，需要更灵敏的响应
      const delta = isPinch ? e.deltaY * 2 : e.deltaY;
      const zoomFactor = delta > 0 ? 1.08 : 0.92;
      const newCount = Math.round(currentCount * zoomFactor);
      
      const clampedCount = Math.max(minDataPoints, Math.min(maxDataPoints, newCount));
      
      // 以鼠标位置为中心缩放
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const { mainChart } = computedLayout;
      
      // 计算鼠标位置对应的数据索引
      const relativeX = Math.max(0, Math.min(mainChart.width, x - mainChart.x));
      const dataPointWidth = mainChart.width / currentCount;
      const mouseDataIndex = visibleRange.start + Math.floor(relativeX / dataPointWidth);
      
      // 以鼠标位置为中心计算新的可见范围
      const newStart = Math.max(0, Math.min(data.data.length - clampedCount,
        Math.round(mouseDataIndex - (relativeX / mainChart.width) * clampedCount)));
      const newEnd = newStart + clampedCount;
      
      setVisibleRange({ start: newStart, end: newEnd });
      onVisibleRangeChange?.({ start: newStart, end: newEnd });
    };

    // 绑定原生事件（支持 passive: false）
    canvas.addEventListener('touchstart', handleNativeTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleNativeTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleNativeTouchEnd, { passive: false });
    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleNativeTouchStart);
      canvas.removeEventListener('touchmove', handleNativeTouchMove);
      canvas.removeEventListener('touchend', handleNativeTouchEnd);
      canvas.removeEventListener('touchcancel', handleNativeTouchEnd);
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [visibleRange, computedLayout, data.data.length, mergedConfig.interaction, onVisibleRangeChange]);

  // 将 CSS 像素坐标转换为 Canvas 逻辑坐标
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // 计算 CSS 到 Canvas 逻辑像素的缩放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 使用正确的坐标转换
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);

    const panEnabled = mergedConfig.interaction.panEnabled !== false;
    
    // 检查鼠标左键是否真的被按下（e.buttons & 1 表示左键被按下）
    // 这样可以防止触摸板手势被误识别为拖拽
    const isLeftButtonDown = (e.buttons & 1) === 1;
    
    if (isDragging && panEnabled && isLeftButtonDown) {
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
      
      // 拖拽时也更新悬停位置，保持信息栏显示
      const { mainChart } = computedLayout;
      const relativeX = Math.max(0, Math.min(mainChart.width, x - mainChart.x));
      const dataIndex = Math.floor(relativeX / (mainChart.width / (visibleRange.end - visibleRange.start)));
      const actualIndex = Math.max(visibleRange.start, Math.min(visibleRange.end - 1, visibleRange.start + dataIndex));
      setHoverIndex(actualIndex);
      setCursorPos({ x, y });
      return;
    }
    
    // 如果左键没有按下但 isDragging 为 true，重置状态
    if (isDragging && !isLeftButtonDown) {
      setIsDragging(false);
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
        setCursorPos({ x, y });
        setTooltipPos({ x: e.clientX + 10, y: e.clientY - 10, visible: true });
      }
    } else {
      // 不重置 hoverIndex，保持信息栏显示最后悬停的数据
      setTooltipPos(prev => ({ ...prev, visible: false }));
    }
  }, [isDragging, dragStartX, dragStartRange, visibleRange, computedLayout, data.data.length, mergedConfig.interaction.panEnabled, onVisibleRangeChange]);

  // 处理鼠标按下 - 左键拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // 只响应左键
    if (e.button !== 0) return;
    
    const panEnabled = mergedConfig.interaction.panEnabled !== false;
    if (!panEnabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 使用正确的坐标转换
    const { x } = getCanvasCoordinates(e.clientX, e.clientY);
    
    setIsDragging(true);
    setDragStartX(x);
    setDragStartRange({ ...visibleRange });
    
    // 防止选中文本
    e.preventDefault();
  }, [visibleRange, mergedConfig.interaction.panEnabled, getCanvasCoordinates]);

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 全局监听 mouseup 事件，确保在 canvas 外松开鼠标时也能正确重置拖拽状态
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // 处理右键滚轮（Mac 触摸板双指）
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // 阻止默认右键菜单，但允许滚轮缩放
    e.preventDefault();
  }, []);

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    // 不重置 hoverIndex，保持信息栏显示最后悬停的数据
    setTooltipPos(prev => ({ ...prev, visible: false }));
  }, []);

  // 处理点击
  const handleClick = useCallback(() => {
    if (hoverIndex !== null && onDataClick) {
      onDataClick(data.data[hoverIndex], hoverIndex);
    }
  }, [hoverIndex, data.data, onDataClick]);


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
    // 切换时间范围时，将 hoverIndex 设为可见范围的最后一个数据点
    setHoverIndex(newRange.end > 0 ? newRange.end - 1 : null);
    onVisibleRangeChange?.(newRange);
  };

  // 当前悬停的数据，默认显示最后一个可见数据点
  const hoverData = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.data.length
    ? data.data[hoverIndex]
    : data.data[Math.max(0, visibleRange.end - 1)];

  // 信息栏数据是否就绪
  const hasHoverData = hoverData != null;

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

      {/* 信息栏 - 始终渲染，使用占位符保持布局稳定 */}
      <div className={styles.zcpcyChatsStockInfoBar}>
        <div className={styles.zcpcyChatsStockInfoItem}>
          <span className={styles.zcpcyChatsStockInfoLabel}>日期:</span>
          <span className={styles.zcpcyChatsStockInfoValue}>
            {hasHoverData ? formatDate(hoverData.timestamp) : '--'}
          </span>
        </div>
        <div className={styles.zcpcyChatsStockInfoItem}>
          <span className={styles.zcpcyChatsStockInfoLabel}>开:</span>
          <span className={classNames(
            styles.zcpcyChatsStockInfoValue,
            hasHoverData && (hoverData.close >= hoverData.open ? styles.zcpcyChatsStockInfoValueUp : styles.zcpcyChatsStockInfoValueDown)
          )}>
            {hasHoverData ? formatPrice(hoverData.open) : '--'}
          </span>
        </div>
        <div className={styles.zcpcyChatsStockInfoItem}>
          <span className={styles.zcpcyChatsStockInfoLabel}>高:</span>
          <span className={styles.zcpcyChatsStockInfoValue}>
            {hasHoverData ? formatPrice(hoverData.high) : '--'}
          </span>
        </div>
        <div className={styles.zcpcyChatsStockInfoItem}>
          <span className={styles.zcpcyChatsStockInfoLabel}>低:</span>
          <span className={styles.zcpcyChatsStockInfoValue}>
            {hasHoverData ? formatPrice(hoverData.low) : '--'}
          </span>
        </div>
        <div className={styles.zcpcyChatsStockInfoItem}>
          <span className={styles.zcpcyChatsStockInfoLabel}>收:</span>
          <span className={classNames(
            styles.zcpcyChatsStockInfoValue,
            hasHoverData && (hoverData.close >= hoverData.open ? styles.zcpcyChatsStockInfoValueUp : styles.zcpcyChatsStockInfoValueDown)
          )}>
            {hasHoverData ? formatPrice(hoverData.close) : '--'}
          </span>
        </div>
        <div className={styles.zcpcyChatsStockInfoItem}>
          <span className={styles.zcpcyChatsStockInfoLabel}>成交量:</span>
          <span className={styles.zcpcyChatsStockInfoValue}>
            {hasHoverData && hoverData.volume !== undefined ? formatVolume(hoverData.volume) : '--'}
          </span>
        </div>
      </div>

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
        onContextMenu={handleContextMenu}
        style={{ touchAction: 'none' }}
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
