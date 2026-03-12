/**
 * 饼图组件
 * 用于展示各部分数据在总体中所占的比例关系，直观呈现 "整体与部分" 的关系
 * 支持单层饼图、环形图和多层嵌套环形图
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
    PieProps,
    PieChartData,
    PieMultiRingData,
    PieRingLayer,
    PieChartConfig,
    ComputedSlice,
    PieDataItem,
} from './Pie.type';

/**
 * 默认配色方案
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
    '#84cc16', // lime
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f43f5e', // rose
];

/**
 * 多层环形图默认配色（每层的颜色变体）
 */
const MULTI_RING_COLORS: Record<number, string[]> = {
    0: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'], // 蓝色系
    1: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'], // 绿色系
    2: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'], // 黄色系
    3: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'], // 红色系
};

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
    padding: 40,
    radius: 0.8,
    innerRadius: 0,
    startAngle: -90, // 从12点钟方向开始
    gap: 2,
    animationDuration: 800,
    fontSize: 12,
    titleFontSize: 14,
    tooltipBackground: '#ffffff',
    tooltipTitleColor: '#111827',
    tooltipBodyColor: '#374151',
};

/**
 * 角度转弧度
 */
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * 获取数据项颜色
 */
const getItemColor = (index: number, item: PieDataItem, layerIndex: number = 0): string => {
    if (item.color) return item.color;
    // 多层环形图使用同色系变体
    const layerColors = MULTI_RING_COLORS[layerIndex % 4] || DEFAULT_COLORS;
    return layerColors[index % layerColors.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
    width: number,
    height: number,
    padding: number,
    radiusRatio: number,
    innerRadiusRatio: number
): PieChartConfig => {
    const minSide = Math.min(width, height);
    const radius = (minSide / 2 - padding) * radiusRatio;
    const innerRadius = radius * innerRadiusRatio;

    return {
        centerX: width / 2,
        centerY: height / 2,
        radius,
        innerRadius,
    };
};

/**
 * 计算扇区数据
 */
const computeSlices = (
    data: PieChartData,
    config: PieChartConfig,
    startAngleDeg: number,
    clockwise: boolean,
    gap: number,
    layerIndex: number = 0,
    layerInnerRadius?: number,
    layerOuterRadius?: number
): ComputedSlice[] => {
    const total = data.items.reduce((sum, item) => sum + item.value, 0);
    if (total <= 0) return [];

    const { centerX, centerY, radius } = config;
    
    // 使用层特定的半径或默认半径
    const actualInnerRadius = layerInnerRadius !== undefined ? layerInnerRadius * radius : config.innerRadius;
    const actualOuterRadius = layerOuterRadius !== undefined ? layerOuterRadius * radius : radius;
    
    const slices: ComputedSlice[] = [];
    let currentAngle = toRad(startAngleDeg);

    // 计算总的间隙角度
    const totalGapAngle = data.items.length > 1 ? (gap / actualOuterRadius) * data.items.length : 0;
    const availableAngle = Math.PI * 2 - totalGapAngle;

    data.items.forEach((item, index) => {
        const ratio = item.value / total;
        const sliceAngle = ratio * availableAngle;
        const endAngle = currentAngle + (clockwise ? sliceAngle : -sliceAngle);
        const middleAngle = currentAngle + (clockwise ? sliceAngle / 2 : -sliceAngle / 2);

        // 计算标签位置（外部标签）
        const labelRadius = actualOuterRadius * 1.2;
        const labelPos = {
            x: centerX + Math.cos(middleAngle) * labelRadius,
            y: centerY + Math.sin(middleAngle) * labelRadius,
        };

        // 计算连接线终点
        const lineEndRadius = actualOuterRadius * 1.05;
        const lineEndPos = {
            x: centerX + Math.cos(middleAngle) * lineEndRadius,
            y: centerY + Math.sin(middleAngle) * lineEndRadius,
        };

        slices.push({
            startAngle: currentAngle,
            endAngle,
            middleAngle,
            ratio,
            percentage: ratio * 100,
            color: getItemColor(index, item, layerIndex),
            item,
            index,
            labelPos,
            lineEndPos,
            layerIndex,
        });

        // 下一个扇区的起始角度（加上间隙）
        if (clockwise) {
            currentAngle = endAngle + (gap / actualOuterRadius);
        } else {
            currentAngle = endAngle - (gap / actualOuterRadius);
        }
    });

    return slices;
};

/**
 * 计算多层环形图数据
 */
const computeMultiRingSlices = (
    multiRingData: PieMultiRingData,
    config: PieChartConfig,
    startAngleDeg: number,
    clockwise: boolean,
    gap: number
): ComputedSlice[] => {
    const allSlices: ComputedSlice[] = [];
    const layerCount = multiRingData.layers.length;

    multiRingData.layers.forEach((layer, layerIndex) => {
        // 计算层的内外半径比例
        // 默认均匀分布：从内到外
        const defaultInnerRadius = layerIndex / layerCount;
        const defaultOuterRadius = (layerIndex + 1) / layerCount;
        
        const layerInnerRadius = layer.innerRadius !== undefined ? layer.innerRadius : defaultInnerRadius;
        const layerOuterRadius = layer.outerRadius !== undefined ? layer.outerRadius : defaultOuterRadius;

        const layerSlices = computeSlices(
            { items: layer.items },
            config,
            startAngleDeg,
            clockwise,
            gap,
            layerIndex,
            layerInnerRadius,
            layerOuterRadius
        );

        allSlices.push(...layerSlices);
    });

    return allSlices;
};

/**
 * 绘制扇区
 */
const drawSlice = (
    ctx: CanvasRenderingContext2D,
    config: PieChartConfig,
    slice: ComputedSlice,
    expandProgress: number,
    isMultiRing: boolean = false
): void => {
    const { centerX, centerY, radius } = config;

    // 计算拉出偏移量（根据动画进度）
    const maxExpandOffset = 10;
    const expandOffset = maxExpandOffset * expandProgress;
    const expandX = Math.cos(slice.middleAngle) * expandOffset;
    const expandY = Math.sin(slice.middleAngle) * expandOffset;

    const drawX = centerX + expandX;
    const drawY = centerY + expandY;

    ctx.beginPath();

    // 确定内外半径
    let innerR: number;
    let outerR: number;

    if (isMultiRing && slice.layerIndex !== undefined) {
        // 多层环形图使用扇区特定的半径
        const layerCount = 3; // 估算，实际应该传入
        const defaultInnerRadius = (slice.layerIndex / layerCount) * radius;
        const defaultOuterRadius = ((slice.layerIndex + 1) / layerCount) * radius;
        innerR = defaultInnerRadius;
        outerR = defaultOuterRadius;
    } else {
        innerR = config.innerRadius;
        outerR = radius;
    }

    // 如果有层特定的半径，重新计算
    if (slice.layerInnerRadius !== undefined && slice.layerOuterRadius !== undefined) {
        innerR = slice.layerInnerRadius * radius;
        outerR = slice.layerOuterRadius * radius;
    }

    if (innerR > 0) {
        // 环形图
        ctx.arc(drawX, drawY, outerR, slice.startAngle, slice.endAngle, false);
        ctx.arc(drawX, drawY, innerR, slice.endAngle, slice.startAngle, true);
    } else {
        // 实心饼图
        ctx.moveTo(drawX, drawY);
        ctx.arc(drawX, drawY, outerR, slice.startAngle, slice.endAngle, false);
    }

    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
};

/**
 * 绘制标签
 */
const drawLabels = (
    ctx: CanvasRenderingContext2D,
    slices: ComputedSlice[],
    labelConfig: PieProps['label'],
    config: PieChartConfig
): void => {
    if (labelConfig?.display === false) return;

    const { centerX, centerY } = config;
    const fontSize = labelConfig?.fontSize || DEFAULT_CONFIG.fontSize;
    const color = labelConfig?.color || '#374151';
    const position = labelConfig?.position || 'inside';
    const lineLength = labelConfig?.lineLength || 20;

    ctx.save();
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = 'middle';

    slices.forEach((slice) => {
        const formatter = labelConfig?.formatter;
        let labelText: string;

        if (typeof formatter === 'function') {
            labelText = formatter(slice.item, slice.percentage);
        } else if (typeof formatter === 'string') {
            labelText = formatter
                .replace('{label}', slice.item.label)
                .replace('{value}', String(slice.item.value))
                .replace('{percentage}', slice.percentage.toFixed(1) + '%');
        } else {
            // 默认格式
            if (position === 'inside') {
                labelText = slice.percentage > 5 ? `${slice.percentage.toFixed(1)}%` : '';
            } else {
                labelText = `${slice.item.label}: ${slice.percentage.toFixed(1)}%`;
            }
        }

        if (!labelText) return;

        // 计算内外半径
        let innerR = config.innerRadius;
        let outerR = config.radius;
        if (slice.layerInnerRadius !== undefined && slice.layerOuterRadius !== undefined) {
            innerR = slice.layerInnerRadius * config.radius;
            outerR = slice.layerOuterRadius * config.radius;
        }

        if (position === 'inside') {
            // 内部标签
            const labelRadius = innerR + (outerR - innerR) / 2;
            const labelX = centerX + Math.cos(slice.middleAngle) * labelRadius;
            const labelY = centerY + Math.sin(slice.middleAngle) * labelRadius;

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(labelText, labelX, labelY);
        } else {
            // 外部标签
            if (!slice.labelPos || !slice.lineEndPos) return;

            const isRightSide = Math.cos(slice.middleAngle) >= 0;

            // 绘制连接线
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(
                centerX + Math.cos(slice.middleAngle) * outerR,
                centerY + Math.sin(slice.middleAngle) * outerR
            );
            ctx.lineTo(slice.lineEndPos.x, slice.lineEndPos.y);
            ctx.lineTo(
                isRightSide ? slice.lineEndPos.x + lineLength : slice.lineEndPos.x - lineLength,
                slice.lineEndPos.y
            );
            ctx.stroke();

            // 绘制标签
            ctx.fillStyle = color;
            ctx.textAlign = isRightSide ? 'left' : 'right';
            const labelX = isRightSide
                ? slice.lineEndPos.x + lineLength + 4
                : slice.lineEndPos.x - lineLength - 4;
            ctx.fillText(labelText, labelX, slice.lineEndPos.y);
        }
    });

    ctx.restore();
};

/**
 * 检测鼠标是否在扇区内
 */
const getSliceAtPosition = (
    x: number,
    y: number,
    slices: ComputedSlice[],
    config: PieChartConfig
): ComputedSlice | null => {
    const { centerX, centerY } = config;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 计算角度
    let angle = Math.atan2(dy, dx);

    // 规范化角度到 [0, 2π)
    while (angle < 0) angle += Math.PI * 2;

    // 找到包含该角度的扇区
    for (const slice of slices) {
        // 计算内外半径
        let innerR = config.innerRadius;
        let outerR = config.radius;
        if (slice.layerInnerRadius !== undefined && slice.layerOuterRadius !== undefined) {
            innerR = slice.layerInnerRadius * config.radius;
            outerR = slice.layerOuterRadius * config.radius;
        }

        // 检查是否在半径范围内
        if (distance < innerR || distance > outerR) {
            continue;
        }

        let startAngle = slice.startAngle;
        let endAngle = slice.endAngle;

        // 规范化角度
        while (startAngle < 0) startAngle += Math.PI * 2;
        while (endAngle < 0) endAngle += Math.PI * 2;

        // 处理跨越 0° 的情况
        if (startAngle > endAngle) {
            if (angle >= startAngle || angle <= endAngle) {
                return slice;
            }
        } else {
            if (angle >= startAngle && angle <= endAngle) {
                return slice;
            }
        }
    }

    return null;
};

/**
 * 饼图组件
 */
export const Pie: React.FC<PieProps> = ({
    data,
    multiRingData,
    width = 400,
    height = 400,
    padding = DEFAULT_CONFIG.padding,
    radius = DEFAULT_CONFIG.radius,
    innerRadius = DEFAULT_CONFIG.innerRadius,
    startAngle = DEFAULT_CONFIG.startAngle,
    clockwise = true,
    gap = DEFAULT_CONFIG.gap,
    label,
    legend,
    tooltip,
    animationDuration = DEFAULT_CONFIG.animationDuration,
    className,
    style,
    onDataClick,
    onMultiRingDataClick,
    onChartReady,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipData, setTooltipData] = useState<{ item: PieDataItem; percentage: number; index: number; layerIndex?: number } | null>(null);
    // 存储隐藏的数据项索引
    const [hiddenItems, setHiddenItems] = useState<Set<number>>(new Set());
    const [hiddenLayers, setHiddenLayers] = useState<Set<number>>(new Set());
    // 动画完成标志
    const isAnimationCompleteRef = useRef(false);

    const slicesRef = useRef<ComputedSlice[]>([]);
    const hoveredIndexRef = useRef<number | null>(null);
    const hoveredLayerRef = useRef<number | null>(null);
    const animationProgressRef = useRef(0);
    // 展开动画进度 (0-1)
    const expandProgressRef = useRef(0);
    // 目标展开索引
    const targetExpandIndexRef = useRef<number | null>(null);

    // 判断是否为多层环形图
    const isMultiRing = useMemo(() => !!multiRingData && multiRingData.layers.length > 0, [multiRingData]);

    // 获取过滤后的数据（单层）
    const filteredData = useMemo(() => {
        if (!data) return { items: [] };
        return {
            items: data.items.filter((_, index) => !hiddenItems.has(index)),
        };
    }, [data, hiddenItems]);

    // 获取过滤后的多层数据
    const filteredMultiRingData = useMemo(() => {
        if (!multiRingData) return { layers: [] };
        return {
            layers: multiRingData.layers
                .filter((_, layerIndex) => !hiddenLayers.has(layerIndex))
                .map((layer, layerIndex) => ({
                    ...layer,
                    items: layer.items.filter((_, itemIndex) => !hiddenItems.has(layerIndex * 1000 + itemIndex)),
                })),
        };
    }, [multiRingData, hiddenLayers, hiddenItems]);

    // 计算图表配置
    const chartConfig = useMemo(
        () => calculateChartConfig(width, height, padding, radius, innerRadius),
        [width, height, padding, radius, innerRadius]
    );

    // 计算扇区数据
    const slices = useMemo(() => {
        if (isMultiRing) {
            // 为每个扇区添加层特定的半径信息
            const computedSlices = computeMultiRingSlices(
                filteredMultiRingData as PieMultiRingData,
                chartConfig,
                startAngle,
                clockwise,
                gap
            );
            
            // 添加层的内外半径信息
            const layers = filteredMultiRingData.layers;
            const layerCount = layers.length;
            
            return computedSlices.map(slice => {
                const layer = layers[slice.layerIndex || 0];
                if (!layer) return slice;
                
                const defaultInnerRadius = (slice.layerIndex || 0) / layerCount;
                const defaultOuterRadius = ((slice.layerIndex || 0) + 1) / layerCount;
                
                return {
                    ...slice,
                    layerInnerRadius: layer.innerRadius !== undefined ? layer.innerRadius : defaultInnerRadius,
                    layerOuterRadius: layer.outerRadius !== undefined ? layer.outerRadius : defaultOuterRadius,
                };
            });
        } else {
            return computeSlices(filteredData, chartConfig, startAngle, clockwise, gap);
        }
    }, [filteredData, filteredMultiRingData, chartConfig, startAngle, clockwise, gap, isMultiRing]);

    // 绘制函数 - 直接绘制，不依赖 state
    const draw = useCallback((progress: number = 1, expandProgress: number = 0, hoveredIdx: number | null = null, hoveredLayer: number | null = null) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        // 绘制扇区（带动画进度）
        slices.forEach((slice) => {
            // 计算动画中的角度
            const animatedSlice: ComputedSlice = progress < 1 ? {
                ...slice,
                endAngle: slice.startAngle + (slice.endAngle - slice.startAngle) * progress,
            } : slice;

            // 当前悬停的扇区拉出显示（根据展开动画进度）
            const isHovered = hoveredLayer !== null && hoveredIdx !== null 
                ? hoveredLayer === slice.layerIndex && hoveredIdx === slice.index
                : hoveredIdx !== null && hoveredIdx === slice.index;
            const sliceExpandProgress = isHovered ? expandProgress : 0;
            drawSlice(ctx, chartConfig, animatedSlice, sliceExpandProgress, isMultiRing);
        });

        // 只在动画完成时绘制标签（只绘制最外层或单层）
        if (progress >= 1) {
            // 单层图或只显示最外层标签
            const labelSlices = isMultiRing 
                ? slices.filter(s => s.layerIndex === (multiRingData?.layers.length || 1) - 1)
                : slices;
            drawLabels(ctx, labelSlices, label, chartConfig);
        }

        // 保存计算的点用于交互
        slicesRef.current = slices;
    }, [slices, width, height, chartConfig, label, isMultiRing, multiRingData]);

    // 动画效果
    useEffect(() => {
        let startTime: number;
        let animationId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);

            // 使用 easeOutQuart 缓动函数
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            animationProgressRef.current = easeProgress;

            draw(easeProgress, 0, null, null);

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                isAnimationCompleteRef.current = true;
                setIsLoading(false);
                onChartReady?.();
            }
        };

        isAnimationCompleteRef.current = false;
        animationProgressRef.current = 0;
        expandProgressRef.current = 0;
        hoveredIndexRef.current = null;
        hoveredLayerRef.current = null;
        targetExpandIndexRef.current = null;
        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [draw, animationDuration, onChartReady]);

    // 数据变化时重绘
    useEffect(() => {
        if (isAnimationCompleteRef.current) {
            draw(1, expandProgressRef.current, hoveredIndexRef.current, hoveredLayerRef.current);
        }
    }, [draw, data, multiRingData, hiddenItems, hiddenLayers]);

    // 展开动画
    const animateExpand = useCallback((targetIndex: number | null, targetLayer: number | null) => {
        const startProgress = expandProgressRef.current;
        const targetProgress = targetIndex !== null ? 1 : 0;
        const duration = 350; // 350ms 展开动画，更丝滑
        let startTime: number;
        let animationId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 使用 easeOutQuart 缓动函数，更丝滑
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            // 计算当前展开进度
            expandProgressRef.current = startProgress + (targetProgress - startProgress) * easeProgress;
            
            // 重绘
            draw(1, expandProgressRef.current, targetExpandIndexRef.current, hoveredLayerRef.current);

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            }
        };

        targetExpandIndexRef.current = targetIndex;
        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [draw]);

    // 处理鼠标移动 - 使用 ref 避免重渲染
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas || !isAnimationCompleteRef.current) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const slice = getSliceAtPosition(x, y, slicesRef.current, chartConfig);
            const newHoveredIndex = slice ? slice.index : null;
            const newHoveredLayer = slice ? slice.layerIndex ?? null : null;

            // 只有当悬停状态改变时才触发展开动画和更新 tooltip
            if (newHoveredIndex !== hoveredIndexRef.current || newHoveredLayer !== hoveredLayerRef.current) {
                hoveredIndexRef.current = newHoveredIndex;
                hoveredLayerRef.current = newHoveredLayer;

                // 触发展开/收缩动画
                animateExpand(newHoveredIndex, newHoveredLayer);

                // 更新 tooltip 状态（这会触发 React 更新，但只影响 tooltip）
                if (slice) {
                    setTooltipData({
                        item: slice.item,
                        percentage: slice.percentage,
                        index: slice.index,
                        layerIndex: slice.layerIndex,
                    });
                    setTooltipVisible(true);
                    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    canvas.style.cursor = 'pointer';
                } else {
                    setTooltipVisible(false);
                    canvas.style.cursor = 'default';
                }
            } else if (slice) {
                // 在同一扇区内移动，只更新 tooltip 位置
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
        },
        [animateExpand, chartConfig]
    );

    // 处理鼠标离开
    const handleMouseLeave = useCallback(() => {
        if (hoveredIndexRef.current !== null || hoveredLayerRef.current !== null) {
            hoveredIndexRef.current = null;
            hoveredLayerRef.current = null;
            animateExpand(null, null);
        }
        setTooltipVisible(false);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
    }, [animateExpand]);

    // 处理点击
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const hoveredIdx = hoveredIndexRef.current;
            const hoveredLayer = hoveredLayerRef.current;
            if (hoveredIdx === null) return;
            
            const slice = slicesRef.current.find(s => s.index === hoveredIdx && s.layerIndex === hoveredLayer);
            if (!slice) return;
            
            if (isMultiRing && onMultiRingDataClick) {
                onMultiRingDataClick(hoveredLayer || 0, hoveredIdx, slice.item);
            } else if (onDataClick) {
                onDataClick(hoveredIdx, slice.item);
            }
        },
        [onDataClick, onMultiRingDataClick, isMultiRing]
    );

    // 图例项类型
    interface LegendItem {
        label: string;
        color: string;
        layerIndex?: number;
        index?: number;
        isLayer: boolean;
    }

    // 获取图例数据
    const legendItems = useMemo<LegendItem[]>(() => {
        if (isMultiRing && multiRingData) {
            // 多层环形图：按层显示
            return multiRingData.layers.map((layer, layerIndex) => ({
                label: layer.name || `层级 ${layerIndex + 1}`,
                color: getItemColor(0, { label: '', value: 0 }, layerIndex),
                layerIndex,
                isLayer: true,
            }));
        } else if (data) {
            // 单层饼图
            return data.items.map((item, index) => ({
                label: item.label,
                color: getItemColor(index, item),
                index,
                isLayer: false,
            }));
        }
        return [];
    }, [data, multiRingData, isMultiRing]);

    return (
        <div
            ref={containerRef}
            className={classNames(styles.zcpcyChatsPieChartContainer, className)}
            style={{ ...style, width }}
        >
            {/* 图例区域 - 独立渲染在 Canvas 上方 */}
            {legend?.display !== false && legendItems.length > 0 && (
                <div
                    className={styles.zcpcyChatsLegend}
                    style={{
                        justifyContent: legend?.position === 'bottom' ? 'center' : 'center',
                        marginBottom: legend?.position === 'bottom' ? 0 : 12,
                        marginTop: legend?.position === 'top' ? 0 : 12,
                        order: legend?.position === 'bottom' ? 2 : 0,
                    }}
                >
                    {legendItems.map((legendItem, idx) => {
                        const isHidden = legendItem.isLayer 
                            ? hiddenLayers.has(legendItem.layerIndex!)
                            : hiddenItems.has(legendItem.index!);
                        
                        return (
                            <div
                                key={idx}
                                className={classNames(
                                    styles.zcpcyChatsLegendItem,
                                    isHidden && styles.zcpcyChatsLegendDisabled
                                )}
                                onClick={() => {
                                    if (legendItem.isLayer) {
                                        setHiddenLayers((prev) => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(legendItem.layerIndex!)) {
                                                newSet.delete(legendItem.layerIndex!);
                                            } else {
                                                newSet.add(legendItem.layerIndex!);
                                            }
                                            return newSet;
                                        });
                                    } else {
                                        setHiddenItems((prev) => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(legendItem.index!)) {
                                                newSet.delete(legendItem.index!);
                                            } else {
                                                newSet.add(legendItem.index!);
                                            }
                                            return newSet;
                                        });
                                    }
                                }}
                            >
                                <span
                                    className={styles.zcpcyChatsLegendColor}
                                    style={{ backgroundColor: legendItem.color }}
                                />
                                <span style={{ color: legend?.labelColor }}>{legendItem.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={styles.zcpcyChatsPieChartCanvas}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            />

            {/* 提示框 */}
            {tooltip?.enabled !== false && tooltipVisible && tooltipData && (
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
                            item: tooltipData.item,
                            percentage: tooltipData.percentage,
                            index: tooltipData.index,
                        })
                    ) : (
                        <>
                            <div
                                className={styles.zcpcyChatsTooltipTitle}
                                style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
                            >
                                {tooltipData.layerIndex !== undefined ? `${multiRingData?.layers[tooltipData.layerIndex]?.name || `层级 ${tooltipData.layerIndex + 1}`} - ${tooltipData.item.label}` : tooltipData.item.label}
                            </div>
                            <div className={styles.zcpcyChatsTooltipItem}>
                                <span
                                    className={styles.zcpcyChatsTooltipColor}
                                    style={{ backgroundColor: getItemColor(tooltipData.index, tooltipData.item, tooltipData.layerIndex) }}
                                />
                                <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                                    数值: {tooltipData.item.value}
                                </span>
                            </div>
                            <div className={styles.zcpcyChatsTooltipItem}>
                                <span
                                    className={styles.zcpcyChatsTooltipColor}
                                    style={{ backgroundColor: 'transparent' }}
                                />
                                <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                                    占比: {tooltipData.percentage.toFixed(2)}%
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* 加载状态 */}
            {isLoading && <div className={styles.zcpcyChatsLoading}>加载中...</div>}
        </div>
    );
};

export default Pie;
