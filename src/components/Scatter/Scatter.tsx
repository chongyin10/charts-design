/**
 * 散点图组件
 * 用于展示两个变量之间的关系，适用于相关性分析、分布规律展示等场景
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
    ScatterProps,
    ScatterChartData,
    ScatterChartConfig,
    ComputedScatterPoint,
    ScatterDataset,
    ScatterTooltipItem,
} from './Scatter.type';

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
    pointRadius: 6,
    pointHoverRadius: 9,
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
const getDatasetColor = (index: number, dataset: ScatterDataset): string => {
    return dataset.backgroundColor || dataset.point?.backgroundColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
    data: ScatterChartData,
    width: number,
    height: number,
    padding: number,
    xAxisMin?: number,
    xAxisMax?: number,
    yAxisMin?: number,
    yAxisMax?: number
): ScatterChartConfig => {
    // 收集所有数据点的 X 和 Y 值
    const allXValues = data.datasets.flatMap((d) => d.data.map((p) => p.x));
    const allYValues = data.datasets.flatMap((d) => d.data.map((p) => p.y));

    const xMin = xAxisMin ?? Math.min(...allXValues);
    const xMax = xAxisMax ?? Math.max(...allXValues);
    const xRange = xMax - xMin || 1;

    const yMin = yAxisMin ?? Math.min(...allYValues);
    const yMax = yAxisMax ?? Math.max(...allYValues);
    const yRange = yMax - yMin || 1;

    return {
        padding,
        chartWidth: width - padding * 2,
        chartHeight: height - padding * 2,
        xMin,
        xMax,
        xRange,
        yMin,
        yMax,
        yRange,
    };
};

/**
 * 将数据 X 值转换为画布 X 坐标
 */
const valueToX = (value: number, config: ScatterChartConfig): number => {
    const normalizedValue = (value - config.xMin) / config.xRange;
    return config.padding + normalizedValue * config.chartWidth;
};

/**
 * 将数据 Y 值转换为画布 Y 坐标
 */
const valueToY = (value: number, config: ScatterChartConfig, height: number): number => {
    const normalizedValue = (value - config.yMin) / config.yRange;
    return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 计算数据点坐标
 */
const computePoints = (
    data: ScatterChartData,
    config: ScatterChartConfig,
    height: number
): ComputedScatterPoint[][] => {
    return data.datasets.map((dataset, datasetIndex) =>
        dataset.data.map((point, dataIndex) => ({
            x: valueToX(point.x, config),
            y: valueToY(point.y, config, height),
            dataX: point.x,
            dataY: point.y,
            datasetIndex,
            dataIndex,
        }))
    );
};

/**
 * 绘制网格线
 */
const drawGrid = (
    ctx: CanvasRenderingContext2D,
    config: ScatterChartConfig,
    width: number,
    height: number,
    textColor: string,
    fontSize: number,
    xAxisTitle?: string,
    yAxisTitle?: string,
    xAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
    yAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
    legacyGridColor?: string
): void => {
    const { padding, chartWidth, chartHeight, xMin, xMax, xRange, yMin, yMax, yRange } = config;

    // 确定是否显示网格线
    const showGrid = xAxisGrid?.display !== false || yAxisGrid?.display !== false;

    // 网格线默认配置
    const defaultGridColor = legacyGridColor || '#e5e7eb';
    const defaultLineWidth = 1;
    const defaultOpacity = 1;

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px sans-serif`;

    // 计算网格线数量
    const xGridCount = 5;
    const yGridCount = 5;

    // 绘制 X 轴标签（底部）
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= xGridCount; i++) {
        const ratio = i / xGridCount;
        const x = padding + ratio * chartWidth;
        const value = xMin + ratio * xRange;
        ctx.fillText(value.toFixed(1), x, height - padding + 8);
    }

    // 绘制 Y 轴标签（左侧）
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= yGridCount; i++) {
        const ratio = i / yGridCount;
        const y = height - padding - ratio * chartHeight;
        const value = yMin + ratio * yRange;
        ctx.fillText(value.toFixed(1), padding - 8, y);
    }

    // 绘制 X 轴刻度尺
    ctx.save();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    for (let i = 0; i <= xGridCount; i++) {
        const ratio = i / xGridCount;
        const x = padding + ratio * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, height - padding);
        ctx.lineTo(x, height - padding + 6);
        ctx.stroke();
    }
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

        for (let i = 0; i <= xGridCount; i++) {
            const ratio = i / xGridCount;
            const x = padding + ratio * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
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
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(yAxisTitle, 0, 0);
        ctx.restore();
    }
};

/**
 * 绘制坐标轴
 */
const drawAxes = (
    ctx: CanvasRenderingContext2D,
    config: ScatterChartConfig,
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
 * 绘制象限背景
 */
const drawQuadrantBackground = (
    ctx: CanvasRenderingContext2D,
    config: ScatterChartConfig,
    width: number,
    height: number,
    xDivider: number,
    yDivider: number,
    colors: [string, string, string, string],
    opacity: number
): void => {
    const { padding, chartWidth, chartHeight, xMin, xMax, xRange, yMin, yMax, yRange } = config;

    // 计算分割线位置
    const xDividerRatio = (xDivider - xMin) / xRange;
    const yDividerRatio = (yDivider - yMin) / yRange;

    const dividerX = padding + xDividerRatio * chartWidth;
    const dividerY = height - padding - yDividerRatio * chartHeight;

    ctx.save();
    ctx.globalAlpha = opacity;

    // 左上象限 (索引 0)
    ctx.fillStyle = colors[0];
    ctx.fillRect(padding, padding, dividerX - padding, dividerY - padding);

    // 右上象限 (索引 1)
    ctx.fillStyle = colors[1];
    ctx.fillRect(dividerX, padding, width - padding - dividerX, dividerY - padding);

    // 右下象限 (索引 2)
    ctx.fillStyle = colors[2];
    ctx.fillRect(dividerX, dividerY, width - padding - dividerX, height - padding - dividerY);

    // 左下象限 (索引 3)
    ctx.fillStyle = colors[3];
    ctx.fillRect(padding, dividerY, dividerX - padding, height - padding - dividerY);

    ctx.restore();
};

/**
 * 计算线性回归
 * 返回 [斜率, 截距]
 */
const calculateLinearRegression = (points: ComputedScatterPoint[]): [number, number] | null => {
    if (points.length < 2) return null;

    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    points.forEach((point) => {
        sumX += point.dataX;
        sumY += point.dataY;
        sumXY += point.dataX * point.dataY;
        sumX2 += point.dataX * point.dataX;
    });

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return null;

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return [slope, intercept];
};

/**
 * 绘制回归线
 */
const drawTrendline = (
    ctx: CanvasRenderingContext2D,
    config: ScatterChartConfig,
    width: number,
    height: number,
    color: string,
    lineWidth: number,
    dashed: boolean
): void => {
    // 这里简化处理，回归线需要在所有点计算完成后绘制
    // 实际绘制逻辑在主组件中完成
};

/**
 * 绘制数据点
 */
const drawPoints = (
    ctx: CanvasRenderingContext2D,
    points: ComputedScatterPoint[],
    dataset: ScatterDataset,
    datasetIndex: number,
    hoveredPoint: ComputedScatterPoint | null
): void => {
    const datasetColor = getDatasetColor(datasetIndex, dataset);
    const pointConfig = dataset.point;

    const baseRadius = pointConfig?.radius ?? DEFAULT_CONFIG.pointRadius;
    const hoverRadius = pointConfig?.hoverRadius ?? DEFAULT_CONFIG.pointHoverRadius;

    const backgroundColor = pointConfig?.backgroundColor ?? dataset.backgroundColor ?? datasetColor;
    const borderColor = pointConfig?.borderColor ?? dataset.borderColor ?? datasetColor;
    const borderWidth = pointConfig?.borderWidth ?? 2;
    const pointStyle = pointConfig?.style ?? 'circle';

    points.forEach((point) => {
        const isThisPointHovered = hoveredPoint?.datasetIndex === datasetIndex && hoveredPoint?.dataIndex === point.dataIndex;
        const finalRadius = isThisPointHovered ? hoverRadius : baseRadius;
        const finalBackgroundColor = isThisPointHovered
            ? (pointConfig?.hoverBackgroundColor ?? backgroundColor)
            : backgroundColor;

        ctx.fillStyle = finalBackgroundColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;

        ctx.beginPath();

        switch (pointStyle) {
            case 'rect':
                ctx.rect(point.x - finalRadius, point.y - finalRadius, finalRadius * 2, finalRadius * 2);
                break;
            case 'triangle':
                ctx.moveTo(point.x, point.y - finalRadius);
                ctx.lineTo(point.x + finalRadius, point.y + finalRadius);
                ctx.lineTo(point.x - finalRadius, point.y + finalRadius);
                ctx.closePath();
                break;
            case 'circle':
            default:
                ctx.arc(point.x, point.y, finalRadius, 0, Math.PI * 2);
                break;
        }

        ctx.fill();
        ctx.stroke();
    });
};

/**
 * 散点图组件
 */
export const Scatter: React.FC<ScatterProps> = ({
    data,
    width = 600,
    height = 400,
    padding = DEFAULT_CONFIG.padding,
    xAxis,
    yAxis,
    legend,
    tooltip,
    trendline,
    quadrant,
    animationDuration = DEFAULT_CONFIG.animationDuration,
    className,
    style,
    onDataClick,
    onChartReady,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState<ComputedScatterPoint | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [animationProgress, setAnimationProgress] = useState(0);
    // 存储隐藏的数据集索引
    const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
    // 存储数据集的动画透明度
    const datasetOpacityRef = useRef<Map<number, number>>(new Map());
    // 存储正在动画过渡中的数据集
    const animatingDatasetsRef = useRef<Set<number>>(new Set());
    // 用于触发透明度动画重绘
    const [opacityVersion, setOpacityVersion] = useState(0);

    const pointsRef = useRef<ComputedScatterPoint[][]>([]);

    // 动画持续时间（毫秒）
    const ANIMATION_DURATION = 300;

    // 获取数据集的当前透明度
    const getDatasetOpacity = useCallback((datasetIndex: number): number => {
        return datasetOpacityRef.current.get(datasetIndex) ?? 1;
    }, [opacityVersion]);

    // 计算图表配置
    const chartConfig = useMemo(
        () => calculateChartConfig(data, width, height, padding, xAxis?.min, xAxis?.max, yAxis?.min, yAxis?.max),
        [data, width, height, padding, xAxis?.min, xAxis?.max, yAxis?.min, yAxis?.max]
    );

    // 计算所有数据点
    const allPoints = useMemo(
        () => computePoints(data, chartConfig, height),
        [data, chartConfig, height]
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

        // 绘制象限背景（如果启用）
        if (quadrant?.enabled) {
            const defaultColors: [string, string, string, string] = ['#e0f2fe', '#fef3c7', '#dbeafe', '#fce7f3'];
            drawQuadrantBackground(
                ctx,
                chartConfig,
                width,
                height,
                quadrant.xDivider ?? 0,
                quadrant.yDivider ?? 0,
                quadrant.colors ?? defaultColors,
                quadrant.opacity ?? 0.3
            );
        }

        // 绘制网格
        drawGrid(
            ctx,
            chartConfig,
            width,
            height,
            xAxis?.tickColor || DEFAULT_CONFIG.textColor,
            xAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
            xAxis?.display !== false ? xAxis?.title?.text : undefined,
            yAxis?.display !== false ? yAxis?.title?.text : undefined,
            xAxis?.grid,
            yAxis?.grid,
            xAxis?.gridColor || DEFAULT_CONFIG.gridColor
        );

        // 绘制坐标轴
        drawAxes(ctx, chartConfig, width, height, xAxis?.gridColor || DEFAULT_CONFIG.axisColor);

        // 绘制回归线（如果启用）
        if (trendline?.enabled) {
            // 收集所有可见的数据点用于计算回归线
            const visiblePoints: ComputedScatterPoint[] = [];
            data.datasets.forEach((dataset, datasetIndex) => {
                if (getDatasetOpacity(datasetIndex) > 0.1) {
                    allPoints[datasetIndex]?.forEach((point) => {
                        visiblePoints.push(point);
                    });
                }
            });

            const regression = calculateLinearRegression(visiblePoints);
            if (regression) {
                const [slope, intercept] = regression;
                const { xMin, xMax } = chartConfig;

                // 计算回归线在图表边界上的两点
                const y1 = slope * xMin + intercept;
                const y2 = slope * xMax + intercept;

                const x1Canvas = valueToX(xMin, chartConfig);
                const y1Canvas = valueToY(y1, chartConfig, height);
                const x2Canvas = valueToX(xMax, chartConfig);
                const y2Canvas = valueToY(y2, chartConfig, height);

                ctx.save();
                ctx.strokeStyle = trendline.color || '#ef4444';
                ctx.lineWidth = trendline.width || 2;
                if (trendline.dashed) {
                    ctx.setLineDash([5, 5]);
                }
                ctx.beginPath();
                ctx.moveTo(x1Canvas, y1Canvas);
                ctx.lineTo(x2Canvas, y2Canvas);
                ctx.stroke();
                ctx.restore();
            }
        }

        // 绘制数据点（支持透明度动画）
        data.datasets.forEach((dataset, datasetIndex) => {
            const opacity = getDatasetOpacity(datasetIndex);
            if (opacity <= 0.01) return;

            const fullPoints = allPoints[datasetIndex];
            if (!fullPoints || fullPoints.length === 0) return;

            // 根据动画进度截取点
            const visibleCount = Math.max(1, Math.floor(fullPoints.length * animationProgress));
            const points = fullPoints.slice(0, visibleCount);

            ctx.save();
            ctx.globalAlpha = opacity;

            // 绘制数据点
            drawPoints(ctx, points, dataset, datasetIndex, hoveredPoint);

            ctx.restore();
        });

        // 保存计算的点用于交互
        pointsRef.current = allPoints;

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
        allPoints,
        xAxis,
        yAxis,
        legend,
        trendline,
        quadrant,
        animationProgress,
        hoveredPoint,
        isLoading,
        onChartReady,
        getDatasetOpacity,
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

            // 查找最近的数据点（只对可见数据集）
            let closestPoint: ComputedScatterPoint | null = null;
            let minDistance = Infinity;

            pointsRef.current.forEach((datasetPoints, datasetIndex) => {
                const opacity = getDatasetOpacity(datasetIndex);
                if (opacity < 0.1) return;

                datasetPoints.forEach((point) => {
                    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                    if (distance < 20 && distance < minDistance) {
                        minDistance = distance;
                        closestPoint = point;
                    }
                });
            });

            setHoveredPoint(closestPoint);
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        },
        [animationProgress, getDatasetOpacity]
    );

    // 处理鼠标离开
    const handleMouseLeave = useCallback(() => {
        setHoveredPoint(null);
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
            setOpacityVersion((v) => v + 1);

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
            if (!hoveredPoint || !onDataClick) return;
            onDataClick(hoveredPoint.datasetIndex, hoveredPoint.dataIndex, {
                x: hoveredPoint.dataX,
                y: hoveredPoint.dataY,
            });
        },
        [hoveredPoint, onDataClick]
    );

    // 生成提示框内容
    const tooltipContent = useMemo(() => {
        if (!hoveredPoint) return null;

        const dataset = data.datasets[hoveredPoint.datasetIndex];
        const items: ScatterTooltipItem[] = [{
            label: dataset.label,
            x: hoveredPoint.dataX,
            y: hoveredPoint.dataY,
            color: getDatasetColor(hoveredPoint.datasetIndex, dataset),
            datasetIndex: hoveredPoint.datasetIndex,
        }];

        return {
            dataIndex: hoveredPoint.dataIndex,
            label: dataset.label,
            point: { x: hoveredPoint.dataX, y: hoveredPoint.dataY },
            items,
        };
    }, [hoveredPoint, data]);

    return (
        <div
            ref={containerRef}
            className={classNames(styles.zcpcyChatsScatterChartContainer, className)}
            style={{ ...style, width }}
        >
            {/* 图例区域 */}
            {legend?.display !== false && data.datasets.length > 0 && (
                <div
                    className={styles.zcpcyChatsLegend}
                    style={{
                        justifyContent: 'center',
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
                className={styles.zcpcyChatsScatterChartCanvas}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            />

            {/* 提示框 */}
            {tooltip?.enabled !== false && tooltipContent && hoveredPoint && (
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
                            point: tooltipContent.point,
                            items: tooltipContent.items,
                        })
                    ) : (
                        <>
                            <div
                                className={styles.zcpcyChatsTooltipTitle}
                                style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
                            >
                                {tooltipContent.label}
                            </div>
                            {tooltipContent.items.map((item, index) => (
                                <div key={index} className={styles.zcpcyChatsTooltipItem}>
                                    <span
                                        className={styles.zcpcyChatsTooltipColor}
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                                        X: {item.x.toFixed(2)}, Y: {item.y.toFixed(2)}
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

export default Scatter;
