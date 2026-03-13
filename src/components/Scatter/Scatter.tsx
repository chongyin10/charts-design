/**
 * 散点图组件
 * 用于展示两个变量之间的关系，适用于相关性分析、分布规律展示等场景
 * 支持区域勾选功能
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
    ScatterSelectedPoint,
    ScatterLabelConfig,
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
            label: point.label,
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
    hoveredPoint: ComputedScatterPoint | null,
    selectedPoints: Set<string>,
    selectedPointStyle?: { backgroundColor?: string; borderColor?: string; borderWidth?: number; radius?: number }
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
        const pointKey = `${point.datasetIndex}-${point.dataIndex}`;
        const isSelected = selectedPoints.has(pointKey);
        const isThisPointHovered = hoveredPoint?.datasetIndex === datasetIndex && hoveredPoint?.dataIndex === point.dataIndex;
        const finalRadius = isThisPointHovered ? hoverRadius : (isSelected ? (selectedPointStyle?.radius ?? baseRadius + 2) : baseRadius);
        const finalBackgroundColor = isSelected
            ? (selectedPointStyle?.backgroundColor ?? '#ef4444')
            : (isThisPointHovered ? (pointConfig?.hoverBackgroundColor ?? backgroundColor) : backgroundColor);
        const finalBorderColor = isSelected
            ? (selectedPointStyle?.borderColor ?? '#dc2626')
            : borderColor;
        const finalBorderWidth = isSelected
            ? (selectedPointStyle?.borderWidth ?? 3)
            : borderWidth;

        ctx.fillStyle = finalBackgroundColor;
        ctx.strokeStyle = finalBorderColor;
        ctx.lineWidth = finalBorderWidth;

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

        // 支持空心圆点：当背景色为透明时不填充
        const isTransparent = finalBackgroundColor === 'transparent' ||
                              finalBackgroundColor === 'rgba(0,0,0,0)' ||
                              finalBackgroundColor === 'rgba(0, 0, 0, 0)';
        if (!isTransparent) {
            ctx.fill();
        }
        ctx.stroke();
    });
};

/**
 * 绘制选择框
 */
const drawSelectionBox = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    borderColor: string,
    fillColor: string
): void => {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    ctx.restore();
};

/**
 * 绘制数据点标签
 */
const drawPointLabels = (
    ctx: CanvasRenderingContext2D,
    points: ComputedScatterPoint[],
    dataset: ScatterDataset,
    globalLabelConfig?: ScatterLabelConfig,
    hoveredPoint: ComputedScatterPoint | null = null
): void => {
    // 合并标签配置（数据集配置优先于全局配置）
    const labelConfig: ScatterLabelConfig = {
        display: false,
        position: 'top',
        color: '#374151',
        fontSize: 10,
        offset: { x: 0, y: -8 },
        ...globalLabelConfig,
        ...dataset.labelConfig,
    };

    if (!labelConfig.display) return;

    const { position = 'top', color = '#374151', fontSize = 10, offset = { x: 0, y: -8 }, field } = labelConfig;

    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    points.forEach((point) => {
        // 获取标签文本
        let labelText = '';
        
        // 优先使用 point.label（如果存在）
        // 从 ComputedScatterPoint 获取标签（在 computePoints 时已设置）
        if (point.label) {
            labelText = point.label;
        } else if (field && dataset.data[point.dataIndex]) {
            // 如果指定了字段名，从原始数据中获取
            const dataItem = dataset.data[point.dataIndex] as unknown as Record<string, unknown>;
            const fieldValue = dataItem[field];
            if (typeof fieldValue === 'string') {
                labelText = fieldValue;
            } else if (typeof fieldValue === 'number') {
                labelText = String(fieldValue);
            }
        }

        if (!labelText) return;

        // 只在悬停时显示标签，或者始终显示
        const isHovered = hoveredPoint?.datasetIndex === point.datasetIndex && hoveredPoint?.dataIndex === point.dataIndex;
        
        // 计算标签位置
        let labelX = point.x + (offset.x || 0);
        let labelY = point.y + (offset.y || 0);
        let textBaseline: CanvasTextBaseline = 'bottom';

        switch (position) {
            case 'top':
                labelY = point.y - 8 + (offset.y || 0);
                textBaseline = 'bottom';
                break;
            case 'bottom':
                labelY = point.y + 8 + (offset.y || 0);
                textBaseline = 'top';
                break;
            case 'left':
                labelX = point.x - 8 + (offset.x || 0);
                ctx.textAlign = 'right';
                textBaseline = 'middle';
                break;
            case 'right':
                labelX = point.x + 8 + (offset.x || 0);
                ctx.textAlign = 'left';
                textBaseline = 'middle';
                break;
        }

        ctx.textBaseline = textBaseline;
        
        // 绘制标签背景（半透明）
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        const padding = 2;
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(
            labelX - textWidth / 2 - padding,
            labelY - textHeight - padding,
            textWidth + padding * 2,
            textHeight + padding * 2
        );
        ctx.restore();
        
        ctx.fillText(labelText, labelX, labelY);
    });

    ctx.restore();
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
    selection,
    label,
    animationDuration = DEFAULT_CONFIG.animationDuration,
    className,
    style,
    onDataClick,
    onChartReady,
    onSelectionChange,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    // 用于触发 tooltip 更新的版本号
    const [tooltipVersion, setTooltipVersion] = useState(0);
    // 动画进度 - 使用 ref 避免触发重渲染，用 animationVersion 触发重绘
    const animationProgressRef = useRef(1);
    const [animationVersion, setAnimationVersion] = useState(0);
    // 存储隐藏的数据集索引
    const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
    // 存储数据集的动画透明度
    const datasetOpacityRef = useRef<Map<number, number>>(new Map());
    // 存储正在动画过渡中的数据集
    const animatingDatasetsRef = useRef<Set<number>>(new Set());
    // 用于触发透明度动画重绘
    const [opacityVersion, setOpacityVersion] = useState(0);

    // 区域选择相关状态
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
    const selectedPointsRef = useRef<Set<string>>(new Set());
    const [selectedVersion, setSelectedVersion] = useState(0);

    const pointsRef = useRef<ComputedScatterPoint[][]>([]);
    // 使用 ref 存储 hoveredPoint，避免不必要的状态更新
    const hoveredPointRef = useRef<ComputedScatterPoint | null>(null);
    // 重绘调度相关
    const redrawScheduledRef = useRef(false);
    const [, forceUpdate] = useState(0);

    // ===== 虚拟数据缓存机制 =====
    // 存储上一次的数据快照（用于 diff 对比）
    const dataSnapshotRef = useRef<{
        datasets: { label?: string; data: { x: number; y: number }[] }[];
    } | null>(null);
    // 缓存计算后的点坐标（虚拟 DOM 概念）
    const virtualPointsRef = useRef<ComputedScatterPoint[][] | null>(null);
    // 标记是否是首次渲染
    const isFirstRenderRef = useRef(true);
    // 标记数据是否真正变化
    const dataChangedRef = useRef(false);

    // 存储必要的绘制数据（避免在 drawChart 依赖中直接引用复杂对象）
    const drawDataRef = useRef<{
        data: ScatterChartData;
        chartConfig: ScatterChartConfig;
        allPoints: ComputedScatterPoint[][];
        width: number;
        height: number;
        padding: number;
        xAxis?: any;
        yAxis?: any;
        legend?: any;
        trendline?: any;
        quadrant?: any;
        selection?: any;
        label?: ScatterLabelConfig;
    } | null>(null);

    // 动画持续时间（毫秒）
    const ANIMATION_DURATION = 300;

    // 获取数据集的当前透明度
    const getDatasetOpacity = useCallback((datasetIndex: number): number => {
        return datasetOpacityRef.current.get(datasetIndex) ?? 1;
    }, [opacityVersion]);

    // 调度重绘（使用 requestAnimationFrame 合并多次重绘请求）
    const scheduleRedraw = useCallback(() => {
        if (redrawScheduledRef.current) return;
        
        redrawScheduledRef.current = true;
        requestAnimationFrame(() => {
            redrawScheduledRef.current = false;
            forceUpdate(v => v + 1);
        });
    }, []);

    // ===== Diff 算法：对比数据是否真正变化 =====
    const diffData = useCallback((newData: ScatterChartData): boolean => {
        const prevSnapshot = dataSnapshotRef.current;
        
        // 首次渲染，肯定变化
        if (!prevSnapshot) {
            dataSnapshotRef.current = {
                datasets: newData.datasets.map(d => ({
                    label: d.label,
                    data: d.data.map(p => ({ x: p.x, y: p.y })),
                })),
            };
            return true;
        }

        // 快速检查：数据集数量变化
        if (prevSnapshot.datasets.length !== newData.datasets.length) {
            dataSnapshotRef.current = {
                datasets: newData.datasets.map(d => ({
                    label: d.label,
                    data: d.data.map(p => ({ x: p.x, y: p.y })),
                })),
            };
            return true;
        }

        // 逐数据集对比
        for (let i = 0; i < newData.datasets.length; i++) {
            const prevDataset = prevSnapshot.datasets[i];
            const newDataset = newData.datasets[i];

            // 检查标签变化
            if (prevDataset.label !== newDataset.label) {
                dataSnapshotRef.current = {
                    datasets: newData.datasets.map(d => ({
                        label: d.label,
                        data: d.data.map(p => ({ x: p.x, y: p.y })),
                    })),
                };
                return true;
            }

            // 快速检查：数据点数量变化
            if (prevDataset.data.length !== newDataset.data.length) {
                dataSnapshotRef.current = {
                    datasets: newData.datasets.map(d => ({
                        label: d.label,
                        data: d.data.map(p => ({ x: p.x, y: p.y })),
                    })),
                };
                return true;
            }

            // 逐点对比坐标
            for (let j = 0; j < newDataset.data.length; j++) {
                const prevPoint = prevDataset.data[j];
                const newPoint = newDataset.data[j];
                if (prevPoint.x !== newPoint.x || prevPoint.y !== newPoint.y) {
                    dataSnapshotRef.current = {
                        datasets: newData.datasets.map(d => ({
                            label: d.label,
                            data: d.data.map(p => ({ x: p.x, y: p.y })),
                        })),
                    };
                    return true;
                }
            }
        }

        // 数据没有变化
        return false;
    }, []);

    // 计算图表配置（带缓存）
    const chartConfig = useMemo(() => {
        const newConfig = calculateChartConfig(
            data, 
            width, 
            height, 
            padding, 
            xAxis?.min, 
            xAxis?.max, 
            yAxis?.min, 
            yAxis?.max
        );
        return newConfig;
    }, [data, width, height, padding, xAxis?.min, xAxis?.max, yAxis?.min, yAxis?.max]);

    // 计算所有数据点（带缓存，只有数据变化时才重新计算）
    const allPoints = useMemo(() => {
        const hasDataChanged = diffData(data);
        dataChangedRef.current = hasDataChanged;

        // 如果数据没有变化，使用缓存的点
        if (!hasDataChanged && virtualPointsRef.current) {
            return virtualPointsRef.current;
        }

        // 数据变化，重新计算
        const newPoints = computePoints(data, chartConfig, height);
        virtualPointsRef.current = newPoints;
        return newPoints;
    }, [data, chartConfig, height, diffData]);

    // 动画效果 - 只在首次渲染或数据真正变化时触发
    useEffect(() => {
        // 如果不是数据变化导致的渲染，不触发动画
        if (!dataChangedRef.current && !isFirstRenderRef.current) {
            return;
        }

        // 重置动画进度
        animationProgressRef.current = 0;
        
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            
            animationProgressRef.current = eased;
            setAnimationVersion(v => v + 1); // 只触发重绘，不触发重新计算

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isFirstRenderRef.current = false;
            }
        };
        
        requestAnimationFrame(animate);
    }, [animationDuration, data]);

    // 获取选择框内的点
    const getPointsInSelection = useCallback((start: { x: number; y: number }, end: { x: number; y: number }): ComputedScatterPoint[] => {
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        const selected: ComputedScatterPoint[] = [];

        pointsRef.current.forEach((datasetPoints, datasetIndex) => {
            const opacity = getDatasetOpacity(datasetIndex);
            if (opacity < 0.1) return;

            datasetPoints.forEach((point) => {
                if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
                    selected.push(point);
                }
            });
        });

        return selected;
    }, [getDatasetOpacity]);

    // 更新绘制数据（只在数据真正变化时更新）
    useEffect(() => {
        const newDrawData = {
            data,
            chartConfig,
            allPoints,
            width,
            height,
            padding,
            xAxis,
            yAxis,
            legend,
            trendline,
            quadrant,
            selection,
            label,
        };

        drawDataRef.current = newDrawData;
        
        // 数据变化时触发重绘
        scheduleRedraw();
    }, [data, chartConfig, allPoints, width, height, padding, xAxis, yAxis, legend, trendline, quadrant, selection, label, scheduleRedraw]);

    // 绘制图表（只依赖必要的触发器）
    const drawChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawData = drawDataRef.current;
        if (!drawData) return;

        const {
            width: w,
            height: h,
            chartConfig: config,
            allPoints: points,
            data: chartData,
            xAxis: xConfig,
            yAxis: yConfig,
            trendline: trendConfig,
            quadrant: quadrantConfig,
            selection: selectionConfig,
            label: labelConfig,
        } = drawData;

        // 获取当前动画进度
        const progress = animationProgressRef.current;

        // 清空画布
        ctx.clearRect(0, 0, w, h);

        // 绘制象限背景（如果启用）
        if (quadrantConfig?.enabled) {
            const defaultColors: [string, string, string, string] = ['#e0f2fe', '#fef3c7', '#dbeafe', '#fce7f3'];
            drawQuadrantBackground(
                ctx,
                config,
                w,
                h,
                quadrantConfig.xDivider ?? 0,
                quadrantConfig.yDivider ?? 0,
                quadrantConfig.colors ?? defaultColors,
                quadrantConfig.opacity ?? 0.3
            );
        }

        // 绘制网格
        drawGrid(
            ctx,
            config,
            w,
            h,
            xConfig?.tickColor || DEFAULT_CONFIG.textColor,
            xConfig?.tickFontSize || DEFAULT_CONFIG.fontSize,
            xConfig?.display !== false ? xConfig?.title?.text : undefined,
            yConfig?.display !== false ? yConfig?.title?.text : undefined,
            xConfig?.grid,
            yConfig?.grid,
            xConfig?.gridColor || DEFAULT_CONFIG.gridColor
        );

        // 绘制坐标轴
        drawAxes(ctx, config, w, h, xConfig?.gridColor || DEFAULT_CONFIG.axisColor);

        // 绘制回归线（如果启用）
        if (trendConfig?.enabled) {
            // 收集所有可见的数据点用于计算回归线
            const visiblePoints: ComputedScatterPoint[] = [];
            chartData.datasets.forEach((dataset, datasetIndex) => {
                if (getDatasetOpacity(datasetIndex) > 0.1) {
                    points[datasetIndex]?.forEach((point) => {
                        visiblePoints.push(point);
                    });
                }
            });

            const regression = calculateLinearRegression(visiblePoints);
            if (regression) {
                const [slope, intercept] = regression;
                const { xMin, xMax } = config;

                // 计算回归线在图表边界上的两点
                const y1 = slope * xMin + intercept;
                const y2 = slope * xMax + intercept;

                const x1Canvas = valueToX(xMin, config);
                const y1Canvas = valueToY(y1, config, h);
                const x2Canvas = valueToX(xMax, config);
                const y2Canvas = valueToY(y2, config, h);

                ctx.save();
                ctx.strokeStyle = trendConfig.color || '#ef4444';
                ctx.lineWidth = trendConfig.width || 2;
                if (trendConfig.dashed) {
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
        chartData.datasets.forEach((dataset, datasetIndex) => {
            const opacity = getDatasetOpacity(datasetIndex);
            if (opacity <= 0.01) return;

            const fullPoints = points[datasetIndex];
            if (!fullPoints || fullPoints.length === 0) return;

            // 根据动画进度截取点
            const visibleCount = Math.max(1, Math.floor(fullPoints.length * progress));
            const datasetPoints = fullPoints.slice(0, visibleCount);

            ctx.save();
            ctx.globalAlpha = opacity;

            // 绘制数据点（使用 ref 中的 hoveredPoint）
            drawPoints(ctx, datasetPoints, dataset, datasetIndex, hoveredPointRef.current, selectedPointsRef.current, selectionConfig?.selectedPointStyle);

            ctx.restore();

            // 绘制数据点标签
            drawPointLabels(ctx, datasetPoints, dataset, labelConfig, hoveredPointRef.current);
        });

        // 绘制选择框（从状态中读取）
        if (isSelecting && selectionStart && selectionEnd) {
            drawSelectionBox(
                ctx,
                selectionStart.x,
                selectionStart.y,
                selectionEnd.x,
                selectionEnd.y,
                selectionConfig?.borderColor || '#3b82f6',
                selectionConfig?.fillColor || 'rgba(59, 130, 246, 0.2)'
            );
        }

        // 保存计算的点用于交互
        pointsRef.current = points;

        if (isLoading) {
            setIsLoading(false);
            onChartReady?.();
        }
    // 注意：drawChart 现在只依赖必要的触发器，数据从 ref 中读取
    }, [
        isLoading,
        onChartReady,
        getDatasetOpacity,
        isSelecting,
        selectionStart,
        selectionEnd,
    ]);

    useEffect(() => {
        drawChart();
    }, [drawChart, opacityVersion, selectedVersion, animationVersion]);

    // 处理鼠标按下（开始选择）
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!selection?.enabled) return;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 检查是否在图表区域内
            const { padding, chartWidth, chartHeight } = chartConfig;
            if (
                x >= padding &&
                x <= padding + chartWidth &&
                y >= padding &&
                y <= padding + chartHeight
            ) {
                setIsSelecting(true);
                setSelectionStart({ x, y });
                setSelectionEnd({ x, y });
            }
        },
        [selection?.enabled, chartConfig]
    );

    // 处理鼠标移动
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas || animationProgressRef.current < 1) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 更新选择框
            if (isSelecting && selectionStart) {
                setSelectionEnd({ x, y });
                return;
            }

            // 查找最近的数据点（只对可见数据集）
            let foundPoint: ComputedScatterPoint | null = null;
            let minDistance = Infinity;

            pointsRef.current.forEach((datasetPoints, datasetIndex) => {
                const opacity = getDatasetOpacity(datasetIndex);
                if (opacity < 0.1) return;

                // 获取当前数据集的 hoverRadius 配置
                const dataset = data.datasets[datasetIndex];
                const hoverRadius = dataset?.point?.hoverRadius ?? DEFAULT_CONFIG.pointHoverRadius;

                datasetPoints.forEach((point) => {
                    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                    // 使用数据集配置的 hoverRadius 作为触发阈值
                    if (distance < hoverRadius && distance < minDistance) {
                        minDistance = distance;
                        foundPoint = point;
                    }
                });
            });

            // 只在 hover 状态变化时才触发重绘
            const prevHoveredPoint = hoveredPointRef.current;
            const isHoverChanged =
                (prevHoveredPoint?.datasetIndex !== (foundPoint as ComputedScatterPoint | null)?.datasetIndex) ||
                (prevHoveredPoint?.dataIndex !== (foundPoint as ComputedScatterPoint | null)?.dataIndex);

            if (isHoverChanged) {
                hoveredPointRef.current = foundPoint;
                scheduleRedraw();
                // 触发 tooltip 更新
                setTooltipVersion(v => v + 1);
            }

            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        },
        [getDatasetOpacity, isSelecting, selectionStart, scheduleRedraw, data.datasets]
    );

    // 处理鼠标抬起（结束选择）
    const handleMouseUp = useCallback(() => {
        if (!isSelecting || !selectionStart || !selectionEnd) {
            setIsSelecting(false);
            return;
        }

        // 计算选择框内的点
        const pointsInBox = getPointsInSelection(selectionStart, selectionEnd);

        // 更新选中的点
        const newSelectedPoints = new Set<string>();
        const selectedPointsData: ScatterSelectedPoint[] = [];

        pointsInBox.forEach((point) => {
            const pointKey = `${point.datasetIndex}-${point.dataIndex}`;
            newSelectedPoints.add(pointKey);

            const dataset = data.datasets[point.datasetIndex];
            selectedPointsData.push({
                datasetIndex: point.datasetIndex,
                dataIndex: point.dataIndex,
                point: { x: point.dataX, y: point.dataY },
                datasetLabel: dataset?.label || '',
            });
        });

        selectedPointsRef.current = newSelectedPoints;
        setSelectedVersion(v => v + 1);
        onSelectionChange?.(selectedPointsData);

        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
    }, [isSelecting, selectionStart, selectionEnd, getPointsInSelection, data.datasets, onSelectionChange]);

    // 处理鼠标离开
    const handleMouseLeave = useCallback(() => {
        // 只在之前有 hover 点时才重绘
        if (hoveredPointRef.current) {
            hoveredPointRef.current = null;
            scheduleRedraw();
            // 触发 tooltip 更新
            setTooltipVersion(v => v + 1);
        }
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
        // 如果正在选择，取消选择
        if (isSelecting) {
            setIsSelecting(false);
            setSelectionStart(null);
            setSelectionEnd(null);
        }
    }, [isSelecting, scheduleRedraw]);

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
            // 如果正在选择，不触发点击事件
            if (isSelecting) return;

            const hoveredPt = hoveredPointRef.current;
            if (!hoveredPt || !onDataClick) return;
            onDataClick(hoveredPt.datasetIndex, hoveredPt.dataIndex, {
                x: hoveredPt.dataX,
                y: hoveredPt.dataY,
            });
        },
        [onDataClick, isSelecting]
    );

    // 生成提示框内容
    const tooltipContent = useMemo(() => {
        const hoveredPt = hoveredPointRef.current;
        if (!hoveredPt) return null;

        const dataset = data.datasets[hoveredPt.datasetIndex];
        const items: ScatterTooltipItem[] = [{
            label: dataset?.label,
            x: hoveredPt.dataX,
            y: hoveredPt.dataY,
            color: getDatasetColor(hoveredPt.datasetIndex, dataset),
            datasetIndex: hoveredPt.datasetIndex,
        }];

        return {
            dataIndex: hoveredPt.dataIndex,
            label: dataset.label,
            point: { x: hoveredPt.dataX, y: hoveredPt.dataY },
            items,
        };
    }, [data, tooltipVersion]);

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
                className={classNames(
                    styles.zcpcyChatsScatterChartCanvas,
                    selection?.enabled && styles.zcpcyChatsScatterChartSelectable
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            />

            {/* 提示框 */}
            {tooltip?.enabled !== false && tooltipContent && (
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
