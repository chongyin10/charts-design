/**
 * 面积图组件
 * 用于展示数据的连续变化趋势和累计量，通过填充区域直观展示数据量的大小
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
    AreaProps,
    AreaChartData,
    AreaChartConfig,
    ComputedPoint,
    AreaDataset,
} from './Area.type';

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

const DEFAULT_FILL_OPACITY = 0.3;

const DEFAULT_CONFIG = {
    padding: 60,
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    animationDuration: 1000,
    gridColor: '#e5e7eb',
    textColor: '#6b7280',
    axisColor: '#d1d5db',
    tooltipBackground: '#ffffff',
    tooltipTitleColor: '#111827',
    tooltipBodyColor: '#374151',
    fontSize: 12,
    titleFontSize: 14,
};

/**
 * 获取数据集颜色
 */
const getDatasetColor = (index: number, dataset: AreaDataset): string => {
    return dataset.borderColor || dataset.fillColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 获取数据集填充颜色
 */
const getDatasetFillColor = (index: number, dataset: AreaDataset): string => {
    return dataset.fillColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
    data: AreaChartData,
    width: number,
    height: number,
    padding: number,
    stacked: boolean,
    yAxisMin?: number,
    yAxisMax?: number
): AreaChartConfig => {
    let allValues: number[];

    if (stacked) {
        // 堆叠模式下，计算每个数据点的累计值
        const dataLength = data.labels.length;
        const stackedValues: number[] = [];
        for (let i = 0; i < dataLength; i++) {
            let sum = 0;
            data.datasets.forEach(dataset => {
                if (!dataset.hidden) {
                    sum += dataset.data[i] || 0;
                }
            });
            stackedValues.push(sum);
        }
        allValues = [...data.datasets.flatMap(d => d.data), ...stackedValues];
    } else {
        allValues = data.datasets.flatMap((d) => d.data);
    }

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
const valueToY = (value: number, config: AreaChartConfig, height: number): number => {
    const normalizedValue = (value - config.minValue) / config.valueRange;
    return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 将数据索引转换为 X 坐标
 */
const indexToX = (index: number, config: AreaChartConfig, labelsLength: number): number => {
    const dataCount = Math.max(1, labelsLength);
    const step = dataCount > 1 ? config.chartWidth / (dataCount - 1) : 0;
    return config.padding + index * step;
};

/**
 * 计算堆叠数据点
 */
const computeStackedPoints = (
    data: AreaChartData,
    config: AreaChartConfig,
    width: number,
    height: number
): ComputedPoint[][] => {
    const dataLength = data.labels.length;
    const accumulatedValues: number[][] = [];

    // 初始化累积值数组
    for (let i = 0; i < dataLength; i++) {
        accumulatedValues[i] = [];
        let acc = 0;
        data.datasets.forEach((dataset, datasetIndex) => {
            if (!dataset.hidden) {
                acc += dataset.data[i] || 0;
                accumulatedValues[i][datasetIndex] = acc;
            } else {
                accumulatedValues[i][datasetIndex] = acc;
            }
        });
    }

    return data.datasets.map((dataset, datasetIndex) =>
        dataset.data.map((value, dataIndex) => ({
            x: indexToX(dataIndex, config, data.labels.length),
            y: valueToY(accumulatedValues[dataIndex][datasetIndex], config, height),
            value,
            label: data.labels[dataIndex] || '',
            datasetIndex,
            dataIndex,
            stackValue: accumulatedValues[dataIndex][datasetIndex],
        }))
    );
};

/**
 * 计算非堆叠数据点
 */
const computePoints = (
    data: AreaChartData,
    config: AreaChartConfig,
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
 * 计算自定义刻度的 X 坐标位置
 * 当 customTickIndices 未提供时，在图表范围内均匀分布
 */
const calculateCustomTickPositions = (
    customTicks: string[],
    customTickIndices: number[] | undefined,
    labelsLength: number,
    chartWidth: number,
    padding: number
): { label: string; x: number }[] => {
    if (customTickIndices && customTickIndices.length === customTicks.length) {
        // 使用提供的索引计算位置
        const xStep = chartWidth / Math.max(1, labelsLength - 1);
        return customTicks.map((label, i) => ({
            label,
            x: padding + customTickIndices[i] * xStep
        }));
    } else {
        // 在图表范围内均匀分布
        const step = chartWidth / Math.max(1, customTicks.length - 1);
        return customTicks.map((label, i) => ({
            label,
            x: padding + i * step
        }));
    }
};

/**
 * 绘制网格线
 */
const drawGrid = (
    ctx: CanvasRenderingContext2D,
    config: AreaChartConfig,
    width: number,
    height: number,
    labels: string[],
    textColor: string,
    fontSize: number,
    xAxisTitle?: string,
    yAxisTitle?: string,
    xAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
    yAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
    legacyGridColor?: string,
    xAxisTickInterval?: number,
    customTicks?: string[],
    customTickIndices?: number[]
): void => {
    const { padding, chartWidth, chartHeight, maxValue, minValue } = config;

    const showGrid = xAxisGrid?.display !== false || yAxisGrid?.display !== false;
    const defaultGridColor = legacyGridColor || '#e5e7eb';
    const defaultLineWidth = 1;
    const defaultOpacity = 1;

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const xStep = chartWidth / Math.max(1, labels.length - 1);
    
    // 使用自定义刻度或根据 tickInterval 计算
    let visibleLabels: string[];
    let visibleIndices: number[];
    let customTickPositions: { label: string; x: number }[] | null = null;
    
    if (customTicks && customTicks.length > 0) {
        // 使用自定义刻度标签
        visibleLabels = customTicks;
        if (customTickIndices && customTickIndices.length === customTicks.length) {
            // 如果提供了自定义索引，直接使用
            visibleIndices = customTickIndices;
        } else {
            // 未提供索引时，在图表范围内均匀分布
            customTickPositions = calculateCustomTickPositions(
                customTicks,
                customTickIndices,
                labels.length,
                chartWidth,
                padding
            );
            visibleIndices = []; // 不使用索引模式
        }
    } else {
        // 使用 tickInterval 计算
        const tickInterval = Math.max(1, xAxisTickInterval || 1);
        visibleLabels = labels.filter((_, index) => index % tickInterval === 0);
        visibleIndices = labels.map((_, index) => index).filter(index => index % tickInterval === 0);
    }

    const estimatedLabelWidth = fontSize * 8;
    const availableWidthPerLabel = chartWidth / visibleLabels.length;
    const shouldRotateLabels = visibleLabels.length > 6 || estimatedLabelWidth > availableWidthPerLabel;

    // 绘制 X 轴标签
    if (customTickPositions) {
        // 使用自定义刻度位置模式（均匀分布）
        customTickPositions.forEach(({ label, x }) => {
            if (shouldRotateLabels) {
                ctx.save();
                ctx.translate(x, height - padding + 8);
                ctx.rotate(-Math.PI / 4);
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(label, x, height - padding + 8);
            }
        });
    } else {
        // 使用索引模式
        visibleLabels.forEach((label, visibleIndex) => {
            const originalIndex = visibleIndices[visibleIndex];
            const x = padding + originalIndex * xStep;

            if (shouldRotateLabels) {
                ctx.save();
                ctx.translate(x, height - padding + 8);
                ctx.rotate(-Math.PI / 4);
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(label, x, height - padding + 8);
            }
        });
    }

    const yGridCount = 5;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yGridCount; i++) {
        const ratio = i / yGridCount;
        const y = height - padding - ratio * chartHeight;
        const value = minValue + ratio * (maxValue - minValue);
        ctx.fillText(value.toFixed(0), padding - 8, y);
    }

    ctx.save();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    if (customTickPositions) {
        // 使用自定义刻度位置绘制刻度线
        customTickPositions.forEach(({ x }) => {
            ctx.beginPath();
            ctx.moveTo(x, height - padding);
            ctx.lineTo(x, height - padding + 6);
            ctx.stroke();
        });
    } else {
        // 使用索引模式绘制刻度线
        visibleIndices.forEach((originalIndex) => {
            const x = padding + originalIndex * xStep;
            ctx.beginPath();
            ctx.moveTo(x, height - padding);
            ctx.lineTo(x, height - padding + 6);
            ctx.stroke();
        });
    }
    ctx.restore();

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

    const showVerticalGrid = xAxisGrid?.vertical !== false && showGrid;
    if (showVerticalGrid) {
        ctx.save();
        ctx.strokeStyle = xAxisGrid?.color || defaultGridColor;
        ctx.lineWidth = xAxisGrid?.lineWidth || defaultLineWidth;
        ctx.globalAlpha = xAxisGrid?.opacity ?? defaultOpacity;

        labels.forEach((_, index) => {
            const x = padding + index * xStep;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        });
        ctx.restore();
    }

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
 * 获取Y=0对应的Y坐标位置
 */
const getZeroY = (config: AreaChartConfig, height: number): number => {
    const { minValue, valueRange } = config;
    // 如果0在数据范围内，计算0对应的Y坐标
    if (minValue <= 0 && minValue + valueRange >= 0) {
        const normalizedValue = (0 - minValue) / valueRange;
        return height - config.padding - normalizedValue * config.chartHeight;
    }
    // 如果全部为正数，0在底部
    if (minValue > 0) {
        return height - config.padding;
    }
    // 如果全部为负数，0在顶部
    return config.padding;
};

/**
 * 绘制坐标轴
 * @param crossZero 是否启用穿越零点模式，为true时X轴绘制在Y=0位置
 */
const drawAxes = (
    ctx: CanvasRenderingContext2D,
    config: AreaChartConfig,
    width: number,
    height: number,
    axisColor: string,
    crossZero?: boolean
): void => {
    const { padding } = config;

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;

    // X轴位置：crossZero模式下绘制在Y=0处，否则绘制在底部
    const xAxisY = crossZero ? getZeroY(config, height) : height - padding;

    ctx.beginPath();
    ctx.moveTo(padding, xAxisY);
    ctx.lineTo(width - padding, xAxisY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
};

/**
 * 绘制面积填充（非堆叠模式）
 * @param crossZero 是否启用穿越零点模式，为true时从Y=0线开始填充
 */
const drawFillArea = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    color: string,
    opacity: number,
    height: number,
    padding: number,
    crossZero?: boolean,
    zeroY?: number
): void => {
    if (points.length < 2) return;

    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    // 填充基线Y坐标：crossZero模式下使用0线，否则使用底部
    const baseY = crossZero && zeroY !== undefined ? zeroY : height - padding;

    ctx.beginPath();
    ctx.moveTo(points[0].x, baseY);
    ctx.lineTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.lineTo(points[points.length - 1].x, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
};

/**
 * 绘制堆叠面积填充
 * @param crossZero 是否启用穿越零点模式
 * @param zeroY Y=0对应的Y坐标
 */
const drawStackedFillArea = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    bottomPoints: ComputedPoint[] | null,
    color: string,
    opacity: number,
    crossZero?: boolean,
    zeroY?: number
): void => {
    if (points.length < 2) return;

    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    ctx.beginPath();

    // crossZero模式下且没有底部点时，从0线开始
    const baseY = crossZero && zeroY !== undefined ? zeroY : (points[points.length - 1]?.y ?? 0);

    // 从底部线或底部边界的第一个点开始
    if (bottomPoints && bottomPoints.length > 0) {
        ctx.moveTo(bottomPoints[0].x, bottomPoints[0].y);
        for (let i = 1; i < bottomPoints.length; i++) {
            ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
        }
    } else if (crossZero && zeroY !== undefined) {
        // crossZero模式下，从0线开始
        ctx.moveTo(points[points.length - 1].x, zeroY);
        ctx.lineTo(points[0].x, zeroY);
    } else {
        ctx.moveTo(points[points.length - 1].x, baseY);
    }

    // 绘制顶部的数据线（从右到左）
    for (let i = points.length - 1; i >= 0; i--) {
        ctx.lineTo(points[i].x, points[i].y);
    }

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
    dataset: AreaDataset,
    datasetIndex: number,
    isHovered: boolean
): void => {
    if (dataset.point === false) return;
    if (dataset.pointStyle === 'none') return;

    const pointConfig = dataset.point;

    const radius = isHovered
        ? (pointConfig?.hoverRadius ?? DEFAULT_CONFIG.pointHoverRadius)
        : (pointConfig?.radius ?? dataset.pointRadius ?? DEFAULT_CONFIG.pointRadius);
    const hoverBackgroundColor = pointConfig?.hoverBackgroundColor ?? getDatasetColor(datasetIndex, dataset);
    const backgroundColor = pointConfig?.backgroundColor ?? dataset.pointBackgroundColor ?? '#fff';
    const pointStyle = pointConfig?.style ?? dataset.pointStyle ?? 'circle';

    points.forEach((point) => {
        ctx.fillStyle = isHovered ? hoverBackgroundColor : backgroundColor;
        ctx.strokeStyle = getDatasetColor(datasetIndex, dataset);
        ctx.lineWidth = pointConfig?.width ?? 2;

        ctx.beginPath();

        switch (pointStyle) {
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
 * 面积图组件
 */
export const Area: React.FC<AreaProps> = ({
    data,
    width: propWidth = 600,
    height: propHeight = 400,
    padding = DEFAULT_CONFIG.padding,
    xAxis,
    yAxis,
    legend,
    tooltip,
    verticalLine,
    animationDuration = DEFAULT_CONFIG.animationDuration,
    smooth = false,
    stacked = false,
    crossZero = false,
    className,
    style,
    onDataClick,
    onChartReady,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<ComputedPoint | null>(null);
    // 竖线模式下当前悬停的数据索引
    const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
    const hoveredDataIndexRef = useRef<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);

    // 存储计算的点用于交互
    const pointsRef = useRef<ComputedPoint[][]>([]);

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

    const visibleData: AreaChartData = useMemo(() => ({
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            hidden: hiddenDatasets.has(index) || dataset.hidden,
        })),
    }), [data, hiddenDatasets]);

    const chartConfig = useMemo(
        () => calculateChartConfig(visibleData, width, height, padding, stacked, yAxis?.min, yAxis?.max),
        [visibleData, width, height, padding, stacked, yAxis?.min, yAxis?.max]
    );

    const allPoints = useMemo(() => {
        if (stacked) {
            return computeStackedPoints(visibleData, chartConfig, width, height);
        }
        return computePoints(visibleData, chartConfig, width, height);
    }, [visibleData, chartConfig, width, height, stacked]);

    // 过滤隐藏的数据集
    const visiblePoints = useMemo(() => {
        return allPoints.filter((_, index) => !visibleData.datasets[index]?.hidden);
    }, [allPoints, visibleData.datasets]);

    // 使用 ref 存储悬停点，避免触发重绘
    const hoveredPointRef = useRef<ComputedPoint | null>(null);

    const draw = useCallback(
        (animationProgress: number = 1) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

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
                xAxis?.title?.text,
                yAxis?.title?.text,
                xAxis?.grid,
                yAxis?.grid,
                xAxis?.gridColor,
                xAxis?.tickInterval,
                xAxis?.customTicks,
                xAxis?.customTickIndices
            );

            // 绘制坐标轴（crossZero模式下X轴绘制在Y=0位置）
            drawAxes(ctx, chartConfig, width, height, DEFAULT_CONFIG.axisColor, crossZero);

            // 计算0线Y坐标
            const zeroY = getZeroY(chartConfig, height);

            // 动画插值函数
            const interpolateY = (y: number, baseY: number) => {
                return baseY - (baseY - y) * animationProgress;
            };

            // 获取当前数据点（考虑动画）
            // crossZero模式下，动画从0线开始，而不是从底部
            const getAnimatedPoints = (points: ComputedPoint[]) => {
                const baseY = crossZero ? zeroY : height - padding;
                return points.map(p => ({
                    ...p,
                    y: interpolateY(p.y, baseY),
                }));
            };

            if (stacked) {
                // 堆叠模式：按数据集顺序绘制，从下到上
                const filteredDatasets = visibleData.datasets.filter(d => !d.hidden);

                for (let i = 0; i < filteredDatasets.length; i++) {
                    const datasetIndex = visibleData.datasets.findIndex(d => d === filteredDatasets[i]);
                    if (datasetIndex === -1) continue;

                    const dataset = filteredDatasets[i];
                    const points = allPoints[datasetIndex];
                    if (!points || points.length === 0) continue;

                    const animatedPoints = getAnimatedPoints(points);
                    const fillColor = getDatasetFillColor(datasetIndex, dataset);
                    const fillOpacity = dataset.fillOpacity ?? DEFAULT_FILL_OPACITY;

                    // 获取下方的数据集作为底部边界
                    let bottomDatasetIndex = datasetIndex - 1;
                    let bottomPoints: ComputedPoint[] | null = null;

                    while (bottomDatasetIndex >= 0) {
                        if (!visibleData.datasets[bottomDatasetIndex]?.hidden) {
                            bottomPoints = allPoints[bottomDatasetIndex];
                            break;
                        }
                        bottomDatasetIndex--;
                    }

                    const animatedBottomPoints = bottomPoints ? getAnimatedPoints(bottomPoints) : null;

                    // 绘制堆叠面积（crossZero模式下从0线开始填充）
                    drawStackedFillArea(ctx, animatedPoints, animatedBottomPoints, fillColor, fillOpacity, crossZero, zeroY);

                    // 绘制数据点（不使用悬停效果，悬停效果单独绘制）
                    drawPoints(ctx, animatedPoints, dataset, datasetIndex, false);
                }
            } else {
                // 非堆叠模式
                visibleData.datasets.forEach((dataset, datasetIndex) => {
                    if (dataset.hidden) return;

                    const points = allPoints[datasetIndex];
                    if (!points || points.length === 0) return;

                    const animatedPoints = getAnimatedPoints(points);
                    const fillColor = getDatasetFillColor(datasetIndex, dataset);
                    const fillOpacity = dataset.fillOpacity ?? DEFAULT_FILL_OPACITY;

                    // 绘制填充区域（crossZero模式下从0线开始填充）
                    drawFillArea(ctx, animatedPoints, fillColor, fillOpacity, height, padding, crossZero, zeroY);

                    // 绘制数据点（不使用悬停效果，悬停效果单独绘制）
                    drawPoints(ctx, animatedPoints, dataset, datasetIndex, false);
                });
            }

            // 绘制竖线（竖线模式下）
            // 使用 ref 获取最新值，避免依赖更新导致重新创建 draw 函数
            const currentHoveredIndex = hoveredDataIndexRef.current;
            if (verticalLine?.enabled && currentHoveredIndex !== null && animationProgress >= 1) {
                const { padding: p, chartHeight } = chartConfig;
                const labelsLength = data.labels.length;
                const dataCount = Math.max(1, labelsLength);
                const step = dataCount > 1 ? chartConfig.chartWidth / (dataCount - 1) : 0;
                const lineX = p + currentHoveredIndex * step;

                ctx.save();
                ctx.strokeStyle = verticalLine.color || '#999';
                ctx.lineWidth = verticalLine.lineWidth || 1;
                if (verticalLine.dash && verticalLine.dash.length > 0) {
                    ctx.setLineDash(verticalLine.dash);
                }
                ctx.beginPath();
                ctx.moveTo(lineX, p);
                ctx.lineTo(lineX, p + chartHeight);
                ctx.stroke();
                ctx.restore();

                // 绘制竖线模式下所有可见数据集的高亮点
                pointsRef.current.forEach((datasetPoints, datasetIndex) => {
                    if (visibleData.datasets[datasetIndex]?.hidden) return;

                    const point = datasetPoints[currentHoveredIndex];
                    if (!point) return;

                    const dataset = visibleData.datasets[datasetIndex];
                    if (dataset.point === false || dataset.pointStyle === 'none') return;

                    ctx.save();
                    ctx.fillStyle = getDatasetColor(datasetIndex, dataset);
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                });
            }

            // 单独绘制悬停点（普通模式）
            const hoveredPoint = hoveredPointRef.current;
            if (hoveredPoint && !visibleData.datasets[hoveredPoint.datasetIndex]?.hidden && !verticalLine?.enabled) {
                const dataset = visibleData.datasets[hoveredPoint.datasetIndex];
                if (dataset && dataset.point !== false && dataset.pointStyle !== 'none') {
                    const pointConfig = dataset.point;
                    const radius = pointConfig?.hoverRadius ?? DEFAULT_CONFIG.pointHoverRadius;
                    const backgroundColor = pointConfig?.hoverBackgroundColor ?? getDatasetColor(hoveredPoint.datasetIndex, dataset);
                    const pointStyle = pointConfig?.style ?? dataset.pointStyle ?? 'circle';

                    ctx.fillStyle = backgroundColor;
                    ctx.strokeStyle = getDatasetColor(hoveredPoint.datasetIndex, dataset);
                    ctx.lineWidth = pointConfig?.width ?? 2;

                    ctx.beginPath();

                    switch (pointStyle) {
                        case 'rect':
                            ctx.rect(hoveredPoint.x - radius, hoveredPoint.y - radius, radius * 2, radius * 2);
                            break;
                        case 'triangle':
                            ctx.moveTo(hoveredPoint.x, hoveredPoint.y - radius);
                            ctx.lineTo(hoveredPoint.x + radius, hoveredPoint.y + radius);
                            ctx.lineTo(hoveredPoint.x - radius, hoveredPoint.y + radius);
                            ctx.closePath();
                            break;
                        case 'circle':
                        default:
                            ctx.arc(hoveredPoint.x, hoveredPoint.y, radius, 0, Math.PI * 2);
                            break;
                    }

                    ctx.fill();
                    ctx.stroke();
                }
            }

            // 保存计算的点用于交互
            pointsRef.current = allPoints;
        },
        [visibleData, allPoints, chartConfig, width, height, padding, data.labels, xAxis, yAxis, smooth, stacked, verticalLine, crossZero]
    );

    // 动画效果
    useEffect(() => {
        let startTime: number;
        let animationId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / animationDuration, 1);

            // 使用 easeOutQuart 缓动函数
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            draw(easeProgress);

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                setIsAnimationComplete(true);
                onChartReady?.();
            }
        };

        setIsAnimationComplete(false);
        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [draw, animationDuration, onChartReady]);

    // 鼠标事件处理
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 竖线模式：根据 X 轴位置查找最近的数据索引
            if (verticalLine?.enabled) {
                const { padding: p, chartWidth } = chartConfig;
                const labelsLength = data.labels.length;
                const dataCount = Math.max(1, labelsLength);
                const step = dataCount > 1 ? chartWidth / (dataCount - 1) : 0;

                // 计算最近的数据索引
                let closestIndex = 0;
                if (step > 0) {
                    closestIndex = Math.round((x - p) / step);
                    closestIndex = Math.max(0, Math.min(closestIndex, labelsLength - 1));
                }

                // 检查鼠标是否在有效的图表区域内（只在绘图网格区域内才显示竖线）
                const isInChartArea =
                    x >= p - step / 2 &&
                    x <= width - p + step / 2 &&
                    y >= p &&
                    y <= height - p;

                if (isInChartArea) {
                    const prevIndex = hoveredDataIndexRef.current;
                    // 找到第一个可见数据集的点作为参考点
                    let referencePoint: ComputedPoint | null = null;
                    for (let i = 0; i < pointsRef.current.length; i++) {
                        if (!visibleData.datasets[i]?.hidden && pointsRef.current[i][closestIndex]) {
                            referencePoint = pointsRef.current[i][closestIndex];
                            break;
                        }
                    }
                    if (prevIndex !== closestIndex) {
                        // 先更新 ref，确保 draw 能获取最新值
                        hoveredDataIndexRef.current = closestIndex;
                        setHoveredDataIndex(closestIndex);
                        hoveredPointRef.current = referencePoint;
                        setHoveredPoint(referencePoint);
                        // 立即重绘以显示竖线效果
                        if (isAnimationComplete) {
                            draw(1);
                        }
                    }
                    // 根据数据点位置计算 tooltip 位置（竖线与数据点交汇点）
                    if (referencePoint) {
                        setTooltipPos({ x: referencePoint.x, y: referencePoint.y });
                    }
                } else {
                    if (hoveredDataIndexRef.current !== null) {
                        hoveredDataIndexRef.current = null;
                        setHoveredDataIndex(null);
                        hoveredPointRef.current = null;
                        setHoveredPoint(null);
                        if (isAnimationComplete) {
                            draw(1);
                        }
                    }
                }
                return;
            }

            // 普通模式：查找最近的数据点
            let nearestPoint: ComputedPoint | null = null;
            let minDistance = Infinity;

            allPoints.forEach((datasetPoints, datasetIndex) => {
                if (visibleData.datasets[datasetIndex]?.hidden) return;

                datasetPoints.forEach((point) => {
                    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                    if (distance < 20 && distance < minDistance) {
                        minDistance = distance;
                        nearestPoint = point;
                    }
                });
            });

            // 使用 ref 存储悬停点，避免触发重绘
            const prevHoveredPoint = hoveredPointRef.current;
            const hasPointChanged = (() => {
                if (prevHoveredPoint === null && nearestPoint !== null) return true;
                if (prevHoveredPoint !== null && nearestPoint === null) return true;
                if (prevHoveredPoint !== null && nearestPoint !== null) {
                    return (prevHoveredPoint as ComputedPoint).datasetIndex !== (nearestPoint as ComputedPoint).datasetIndex ||
                           (prevHoveredPoint as ComputedPoint).dataIndex !== (nearestPoint as ComputedPoint).dataIndex;
                }
                return false;
            })();

            if (hasPointChanged) {
                hoveredPointRef.current = nearestPoint;
                // 立即重绘以显示悬停效果
                if (isAnimationComplete) {
                    draw(1);
                }
            }

            setHoveredPoint(nearestPoint);
            // 根据数据点位置计算 tooltip 位置
            if (nearestPoint) {
                const point = nearestPoint as ComputedPoint;
                setTooltipPos({ x: point.x, y: point.y });
            }
        },
        [allPoints, visibleData.datasets, draw, isAnimationComplete, chartConfig, data.labels.length, width, height, verticalLine]
    );

    const handleMouseLeave = useCallback(() => {
        hoveredPointRef.current = null;
        hoveredDataIndexRef.current = null;
        setHoveredPoint(null);
        setHoveredDataIndex(null);
        // 立即重绘以清除悬停效果
        if (isAnimationComplete) {
            draw(1);
        }
    }, [draw, isAnimationComplete]);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!hoveredPoint || !onDataClick) return;
            onDataClick(hoveredPoint.datasetIndex, hoveredPoint.dataIndex, hoveredPoint.value);
        },
        [hoveredPoint, onDataClick]
    );

    const toggleDataset = useCallback((index: number) => {
        setHiddenDatasets((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const showLegend = legend?.display !== false;
    // 判断 tooltip 显示条件：
    // 1. tooltip 启用
    // 2. 竖线模式下需要 hoveredDataIndex 不为 null
    // 3. 普通模式下需要 hoveredPoint 不为 null
    const showTooltip = tooltip?.enabled !== false && (
        verticalLine?.enabled
            ? hoveredDataIndex !== null
            : hoveredPoint !== null
    );

    // 获取 Tooltip 偏移量配置
    const hoveredDataset = hoveredPoint
        ? visibleData.datasets[hoveredPoint.datasetIndex]
        : null;
    const pointConfig = hoveredDataset && typeof hoveredDataset.point === 'object'
        ? hoveredDataset.point
        : null;
    const tooltipOffsetX = pointConfig?.tooltipOffsetX ?? 0;
    const tooltipOffsetY = pointConfig?.tooltipOffsetY ?? 0;

    return (
        <div
            ref={containerRef}
            className={classNames(styles.zcpcyChatsAreaChartContainer, className)}
            style={style}
        >
            {showLegend && (
                <div className={styles.zcpcyChatsLegend}>
                    {data.datasets.map((dataset, index) => (
                        <div
                            key={index}
                            className={classNames(styles.zcpcyChatsLegendItem, {
                                [styles.zcpcyChatsLegendDisabled]: hiddenDatasets.has(index) || dataset.hidden,
                            })}
                            onClick={() => toggleDataset(index)}
                        >
                            <span
                                className={styles.zcpcyChatsLegendColor}
                                style={{ backgroundColor: getDatasetFillColor(index, dataset) }}
                            />
                            <span>{dataset.label}</span>
                        </div>
                    ))}
                </div>
            )}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={styles.zcpcyChatsAreaChartCanvas}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            />
            {showTooltip && (
                <div
                    className={classNames(styles.zcpcyChatsTooltip, styles.zcpcyChatsTooltipVisible)}
                    style={{
                        left: tooltipPos.x + (verticalLine?.enabled ? 15 : 0) + tooltipOffsetX,
                        top: tooltipPos.y - (verticalLine?.enabled ? 0 : 50) + tooltipOffsetY,
                        transform: verticalLine?.enabled ? 'translate(0, -50%)' : 'translate(-50%, 0)',
                        backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
                    }}
                >
                    {tooltip?.customContent ? (
                        // 竖线模式：显示该索引的所有数据点
                        verticalLine?.enabled && hoveredDataIndex !== null ? (
                            tooltip.customContent({
                                dataIndex: hoveredDataIndex,
                                label: data.labels[hoveredDataIndex] || '',
                                items: visibleData.datasets
                                    .map((dataset, idx) => ({
                                        label: dataset.label,
                                        value: dataset.data[hoveredDataIndex],
                                        color: getDatasetFillColor(idx, dataset),
                                        datasetIndex: idx,
                                    }))
                                    .filter(item => !visibleData.datasets[item.datasetIndex]?.hidden),
                            })
                        ) : hoveredPoint ? (
                            tooltip.customContent({
                                dataIndex: hoveredPoint.dataIndex,
                                label: hoveredPoint.label,
                                items: visibleData.datasets
                                    .map((dataset, idx) => ({
                                        label: dataset.label,
                                        value: dataset.data[hoveredPoint.dataIndex],
                                        color: getDatasetFillColor(idx, dataset),
                                        datasetIndex: idx,
                                    }))
                                    .filter(item => !visibleData.datasets[item.datasetIndex]?.hidden),
                            })
                        ) : null
                    ) : (
                        // 竖线模式：显示该索引的所有数据点
                        verticalLine?.enabled && hoveredDataIndex !== null ? (
                            <>
                                <div
                                    className={styles.zcpcyChatsTooltipTitle}
                                    style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
                                >
                                    {data.labels[hoveredDataIndex]}
                                </div>
                                {visibleData.datasets.map((dataset, idx) => {
                                    if (dataset.hidden) return null;
                                    const value = dataset.data[hoveredDataIndex];
                                    return (
                                        <div key={idx} className={styles.zcpcyChatsTooltipItem}>
                                            <span
                                                className={styles.zcpcyChatsTooltipColor}
                                                style={{
                                                    backgroundColor: getDatasetFillColor(idx, dataset),
                                                }}
                                            />
                                            <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                                                {dataset.label}: {value}
                                                {stacked && (
                                                    <span style={{ opacity: 0.7 }}> (累计: {value})</span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                            </>
                        ) : hoveredPoint ? (
                            <>
                                <div
                                    className={styles.zcpcyChatsTooltipTitle}
                                    style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
                                >
                                    {hoveredPoint.label}
                                </div>
                                <div className={styles.zcpcyChatsTooltipItem}>
                                    <span
                                        className={styles.zcpcyChatsTooltipColor}
                                        style={{
                                            backgroundColor: getDatasetFillColor(
                                                hoveredPoint.datasetIndex,
                                                visibleData.datasets[hoveredPoint.datasetIndex]
                                            ),
                                        }}
                                    />
                                    <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                                        {visibleData.datasets[hoveredPoint.datasetIndex]?.label}: {hoveredPoint.value}
                                        {stacked && hoveredPoint.stackValue !== undefined && (
                                            <span style={{ opacity: 0.7 }}> (累计: {hoveredPoint.stackValue})</span>
                                        )}
                                    </span>
                                </div>
                            </>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
};

export default Area;
