/**
 * 漏斗图组件
 * 用于展示业务流程中各环节的转化效率，上宽下窄形态展示数据递减过程
 * 支持数据标注、转化率展示、动画效果等特性
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  FunnelProps,
  FunnelChartData,
  FunnelChartConfig,
  ComputedSlice,
  FunnelDataItem,
} from './Funnel.type';

/**
 * 默认配色方案
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#60a5fa', // light blue
  '#93c5fd', // lighter blue
  '#bfdbfe', // very light blue
  '#dbeafe', // lightest blue
  '#3b82f6', // blue (cycle)
];

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  padding: 40,
  funnelRatio: 0.7,
  neckRatio: 0.4,
  gap: 4,
  animationDuration: 800,
  fontSize: 12,
  titleFontSize: 14,
  tooltipBackground: '#ffffff',
  tooltipTitleColor: '#111827',
  tooltipBodyColor: '#374151',
};

/**
 * 获取数据项颜色
 */
const getItemColor = (index: number, item: FunnelDataItem): string => {
  return item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: FunnelChartData,
  width: number,
  height: number,
  padding: number,
  funnelRatio: number
): FunnelChartConfig => {
  const values = data.items.map((item) => item.value);
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  const totalValue = values.reduce((sum, val) => sum + val, 0);

  // 计算漏斗绘制区域
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;
  
  // 漏斗占容器的比例
  const chartWidth = availableWidth * funnelRatio;
  const chartHeight = availableHeight;

  return {
    padding,
    chartWidth,
    chartHeight,
    maxValue,
    minValue,
    totalValue,
  };
};

/**
 * 计算漏斗扇区数据
 */
const computeSlices = (
  data: FunnelChartData,
  config: FunnelChartConfig,
  neckRatio: number,
  gap: number,
  sort: 'desc' | 'asc' | 'none'
): ComputedSlice[] => {
  if (!data.items.length) return [];

  // 根据排序方式处理数据
  let sortedItems = [...data.items];
  if (sort === 'desc') {
    sortedItems.sort((a, b) => b.value - a.value);
  } else if (sort === 'asc') {
    sortedItems.sort((a, b) => a.value - b.value);
  }

  const maxValue = sortedItems[0]?.value || 1;
  const { chartWidth, chartHeight, padding } = config;

  // 计算总间隙高度
  const totalGapHeight = (sortedItems.length - 1) * gap;
  const availableHeight = chartHeight - totalGapHeight;

  // 漏斗中心 X 坐标
  const centerX = padding + (chartWidth / 2);

  // 每个扇区高度平均分配
  const sliceHeight = availableHeight / sortedItems.length;

  // 预计算每层对应的宽度（基于数值比例）
  const layerWidths = sortedItems.map((item) => {
    const valueRatio = item.value / maxValue;
    // 确保最小宽度为颈宽，形成漏斗形状
    return chartWidth * Math.max(neckRatio, valueRatio);
  });

  // 计算每个扇区
  const slices: ComputedSlice[] = [];
  let currentY = padding;

  sortedItems.forEach((item, index) => {
    const value = item.value;
    const percentage = value / config.totalValue;

    // 顶部宽度 = 当前层对应的宽度
    const topWidth = layerWidths[index];
    // 底部宽度 = 下一层对应的宽度（最后一层保持当前宽度）
    const bottomWidth = index < sortedItems.length - 1
      ? layerWidths[index + 1]
      : topWidth;

    // 计算转化率（相对于上一环节）
    let conversionRate = 1;
    if (index > 0) {
      const prevValue = sortedItems[index - 1].value;
      conversionRate = prevValue > 0 ? value / prevValue : 0;
    }

    slices.push({
      item,
      index,
      percentage,
      conversionRate,
      topWidth,
      bottomWidth,
      y: currentY,
      height: sliceHeight,
      centerX,
      centerY: currentY + sliceHeight / 2,
      leftX: centerX - topWidth / 2,
      rightX: centerX + topWidth / 2,
    });

    currentY += sliceHeight + gap;
  });

  return slices;
};

/**
 * 绘制漏斗扇区
 */
const drawFunnelSlice = (
  ctx: CanvasRenderingContext2D,
  slice: ComputedSlice,
  color: string,
  animationProgress: number,
  isHovered: boolean,
  opacity: number = 1
): void => {
  const { topWidth, bottomWidth, y, height, centerX } = slice;

  // 应用动画进度
  const animatedHeight = height * animationProgress;

  // 悬停时的缩放效果
  const scale = isHovered ? 1.02 : 1;
  const scaledTopWidth = topWidth * scale;
  const scaledBottomWidth = bottomWidth * scale;

  // 计算梯形四个角（缩放后居中）
  const topLeftX = centerX - scaledTopWidth / 2;
  const topRightX = centerX + scaledTopWidth / 2;
  const bottomLeftX = centerX - scaledBottomWidth / 2;
  const bottomRightX = centerX + scaledBottomWidth / 2;

  // 保存当前状态
  ctx.save();

  // 悬停时添加阴影效果
  if (isHovered) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  }

  // 绘制梯形路径
  ctx.beginPath();
  ctx.moveTo(topLeftX, y);
  ctx.lineTo(topRightX, y);
  ctx.lineTo(bottomRightX, y + animatedHeight);
  ctx.lineTo(bottomLeftX, y + animatedHeight);
  ctx.closePath();

  // 填充
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.fill();

  // 重置阴影（避免影响描边）
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 描边（悬停时使用柔和的高亮边框）
  ctx.strokeStyle = isHovered
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = isHovered ? 1.5 : 1;
  ctx.globalAlpha = 1;
  ctx.stroke();

  // 恢复状态
  ctx.restore();
};

/**
 * 绘制标签
 */
const drawLabels = (
  ctx: CanvasRenderingContext2D,
  slices: ComputedSlice[],
  labelConfig: FunnelProps['label'],
  conversionConfig: FunnelProps['conversion'],
  config: FunnelChartConfig,
  width: number
): void => {
  if (!labelConfig?.display) return;
  
  const {
    color = '#374151',
    fontSize = 12,
    formatter = '{label}',
    position = 'right',
  } = labelConfig;
  
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'middle';
  
  slices.forEach((slice, index) => {
    const { item, centerY, percentage } = slice;
    
    // 格式化标签文本
    let labelText: string;
    if (typeof formatter === 'function') {
      labelText = formatter(item, percentage * 100);
    } else {
      labelText = formatter
        .replace('{label}', item.label)
        .replace('{value}', String(item.value))
        .replace('{percentage}', `${(percentage * 100).toFixed(1)}%`);
    }
    
    ctx.fillStyle = color;
    
    if (position === 'inside') {
      // 内部标签居中显示
      ctx.textAlign = 'center';
      ctx.fillText(labelText, slice.centerX, centerY);
      
      // 显示数值
      ctx.font = `${fontSize - 2}px sans-serif`;
      ctx.fillStyle = '#6b7280';
      ctx.fillText(String(item.value), slice.centerX, centerY + fontSize);
      ctx.font = `${fontSize}px sans-serif`;
    } else {
      // 外部标签
      const labelX = position === 'left' 
        ? slice.leftX - 10 
        : slice.rightX + 10;
      
      ctx.textAlign = position === 'left' ? 'right' : 'left';
      ctx.fillText(labelText, labelX, centerY);
      
      // 显示数值
      ctx.font = `${fontSize - 2}px sans-serif`;
      ctx.fillStyle = '#6b7280';
      ctx.fillText(String(item.value), labelX, centerY + fontSize);
      ctx.font = `${fontSize}px sans-serif`;
    }
    
    // 绘制转化率（除第一层外）
    if (conversionConfig?.display && index > 0) {
      const prevSlice = slices[index - 1];
      const conversionY = (prevSlice.y + prevSlice.height + slice.y) / 2;
      const rate = slice.conversionRate;
      
      let rateText: string;
      if (conversionConfig.formatter) {
        rateText = conversionConfig.formatter(rate * 100);
      } else {
        const prefix = conversionConfig.prefix || '';
        const suffix = conversionConfig.suffix || '%';
        rateText = `${prefix}${(rate * 100).toFixed(1)}${suffix}`;
      }
      
      // 绘制转化率背景
      const rateWidth = ctx.measureText(rateText).width + 12;
      const rateHeight = 20;
      const rateX = width / 2 - rateWidth / 2;
      const rateY = conversionY - rateHeight / 2;
      
      ctx.fillStyle = conversionConfig.color || '#10b981';
      ctx.beginPath();
      ctx.roundRect(rateX, rateY, rateWidth, rateHeight, 10);
      ctx.fill();
      
      // 绘制转化率文字
      ctx.fillStyle = '#ffffff';
      ctx.font = `${conversionConfig.fontSize || 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(rateText, width / 2, conversionY);
      ctx.font = `${fontSize}px sans-serif`;
    }
  });
};

/**
 * 检查点是否在扇区内（用于鼠标交互）
 */
const isPointInSlice = (x: number, y: number, slice: ComputedSlice): boolean => {
  const { topWidth, bottomWidth, y: sliceY, height, centerX } = slice;
  
  // 检查 Y 范围
  if (y < sliceY || y > sliceY + height) {
    return false;
  }
  
  // 计算当前 Y 位置的理论宽度
  const ratio = (y - sliceY) / height;
  const currentWidth = topWidth + (bottomWidth - topWidth) * ratio;
  const halfWidth = currentWidth / 2;
  
  // 检查 X 范围
  return x >= centerX - halfWidth && x <= centerX + halfWidth;
};

/**
 * 漏斗图组件
 */
const Funnel: React.FC<FunnelProps> = ({
  data,
  width: propWidth = 600,
  height: propHeight = 400,
  padding = DEFAULT_CONFIG.padding,
  funnelRatio = DEFAULT_CONFIG.funnelRatio,
  neckRatio = DEFAULT_CONFIG.neckRatio,
  gap = DEFAULT_CONFIG.gap,
  label,
  conversion,
  legend,
  tooltip,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  sort = 'desc',
  className,
  style,
  onDataClick,
  onChartReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    slice?: ComputedSlice;
  }>({ visible: false, x: 0, y: 0 });

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
  const chartConfig = useMemo(() => 
    calculateChartConfig(data, width, height, padding, funnelRatio),
    [data, width, height, padding, funnelRatio]
  );
  
  // 计算扇区数据
  const slices = useMemo(() => 
    computeSlices(data, chartConfig, neckRatio, gap, sort),
    [data, chartConfig, neckRatio, gap, sort]
  );
  
  // 动画效果
  useEffect(() => {
    if (animationDuration <= 0) {
      setAnimationProgress(1);
      return;
    }
    
    setAnimationProgress(0);
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // 使用 ease-out 缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onChartReady?.();
      }
    };
    
    requestAnimationFrame(animate);
  }, [data, animationDuration, onChartReady]);
  
  // 绘制图表
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制每个扇区
    slices.forEach((slice, index) => {
      const color = getItemColor(index, slice.item);
      const isHovered = hoveredIndex === index;
      // 只有当前悬停区域有变化，其他区域保持默认状态
      const opacity = 1;

      drawFunnelSlice(ctx, slice, color, animationProgress, isHovered, opacity);
    });
    
    // 绘制标签
    drawLabels(ctx, slices, label, conversion, chartConfig, width);
  }, [slices, animationProgress, hoveredIndex, label, conversion, chartConfig, width, height]);
  
  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 查找悬停的扇区
    let foundIndex: number | null = null;
    for (let i = slices.length - 1; i >= 0; i--) {
      if (isPointInSlice(x, y, slices[i])) {
        foundIndex = i;
        break;
      }
    }
    
    setHoveredIndex(foundIndex);
    
    // 更新提示框
    if (foundIndex !== null && tooltip?.enabled !== false) {
      const slice = slices[foundIndex];
      setTooltipData({
        visible: true,
        x: e.clientX + 12,
        y: e.clientY - 12,
        slice,
      });
    } else {
      setTooltipData((prev) => ({ ...prev, visible: false }));
    }
  }, [slices, tooltip?.enabled]);
  
  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltipData((prev) => ({ ...prev, visible: false }));
  }, []);
  
  // 处理点击
  const handleClick = useCallback(() => {
    if (hoveredIndex !== null) {
      onDataClick?.(hoveredIndex, slices[hoveredIndex].item);
    }
  }, [hoveredIndex, slices, onDataClick]);
  
  // 处理图例点击
  const handleLegendClick = useCallback((index: number) => {
    onDataClick?.(index, slices[index].item);
  }, [slices, onDataClick]);
  
  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsFunnelChartContainer, className)}
      style={style}
    >
      {/* 顶部图例 */}
      {legend?.display !== false && legend?.position !== 'bottom' && (
        <div className={styles.zcpcyChatsLegend}>
          {slices.map((slice, index) => (
            <div
              key={index}
              className={classNames(styles.zcpcyChatsLegendItem, {
                [styles.zcpcyChatsLegendDisabled]: false,
              })}
              onClick={() => handleLegendClick(index)}
            >
              <div
                className={styles.zcpcyChatsLegendColor}
                style={{ backgroundColor: getItemColor(index, slice.item) }}
              />
              <span style={{ color: legend?.labelColor }}>{slice.item.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* 画布 */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsFunnelChartCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      
      {/* 底部图例 */}
      {legend?.display !== false && legend?.position === 'bottom' && (
        <div className={styles.zcpcyChatsLegend}>
          {slices.map((slice, index) => (
            <div
              key={index}
              className={classNames(styles.zcpcyChatsLegendItem, {
                [styles.zcpcyChatsLegendDisabled]: false,
              })}
              onClick={() => handleLegendClick(index)}
            >
              <div
                className={styles.zcpcyChatsLegendColor}
                style={{ backgroundColor: getItemColor(index, slice.item) }}
              />
              <span style={{ color: legend?.labelColor }}>{slice.item.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* 提示框 */}
      {tooltipData.visible && tooltipData.slice && (
        <div
          className={classNames(styles.zcpcyChatsTooltip, {
            [styles.zcpcyChatsTooltipVisible]: tooltipData.visible,
          })}
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
            backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
          }}
        >
          {tooltip?.customContent ? (
            tooltip.customContent({
              item: tooltipData.slice.item,
              percentage: tooltipData.slice.percentage * 100,
              conversionRate: tooltipData.slice.conversionRate * 100,
              index: tooltipData.slice.index,
            })
          ) : (
            <>
              <div
                className={styles.zcpcyChatsTooltipTitle}
                style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
              >
                {tooltipData.slice.item.label}
              </div>
              <div className={styles.zcpcyChatsTooltipItem}>
                <div
                  className={styles.zcpcyChatsTooltipColor}
                  style={{
                    backgroundColor: getItemColor(
                      tooltipData.slice.index,
                      tooltipData.slice.item
                    ),
                  }}
                />
                <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                  数值: {tooltipData.slice.item.value}
                </span>
              </div>
              <div className={styles.zcpcyChatsTooltipItem}>
                <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                  占比: {(tooltipData.slice.percentage * 100).toFixed(1)}%
                </span>
              </div>
              {tooltipData.slice.index > 0 && (
                <div className={styles.zcpcyChatsTooltipItem}>
                  <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                    转化率: {(tooltipData.slice.conversionRate * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Funnel;
