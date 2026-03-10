/**
 * 折线图组件
 * 用于展示数据的连续变化趋势，适用于时间序列分析、数据对比等场景
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
    LineProps,
    LineChartData,
    LineChartConfig,
    ComputedPoint,
    LineDataset,
    LineThresholdConfig,
    DatasetPointConfig,
    LineVerticalLineConfig,
    LineTooltipItem,
} from './Line.type';

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
const getDatasetColor = (index: number, dataset: LineDataset): string => {
    return dataset.track?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
    data: LineChartData,
    width: number,
    height: number,
    padding: number,
    yAxisMin?: number,
    yAxisMax?: number
): LineChartConfig => {
    const allValues = data.datasets.flatMap((d) => d.data);
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
const valueToY = (value: number, config: LineChartConfig, height: number): number => {
    const normalizedValue = (value - config.minValue) / config.valueRange;
    return height - config.padding - normalizedValue * config.chartHeight;
};

/**
 * 将数据索引转换为 X 坐标
 * @param index - 数据点索引（对应 labels 数组的索引）
 * @param config - 图表配置
 * @param labelsLength - 数据标签数量
 */
const indexToX = (index: number, config: LineChartConfig, labelsLength: number): number => {
    const dataCount = Math.max(1, labelsLength);
    const step = dataCount > 1 ? config.chartWidth / (dataCount - 1) : 0;
    return config.padding + index * step;
};

/**
 * 计算数据点坐标
 */
const computePoints = (
    data: LineChartData,
    config: LineChartConfig,
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
 * 绘制网格线
 */
const drawGrid = (
    ctx: CanvasRenderingContext2D,
    config: LineChartConfig,
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
    xAxisTickInterval?: number
): void => {
    const { padding, chartWidth, chartHeight, maxValue, minValue } = config;

    // 确定是否显示网格线
    const showGrid = xAxisGrid?.display !== false || yAxisGrid?.display !== false;

    // 网格线默认配置
    const defaultGridColor = legacyGridColor || '#e5e7eb';
    const defaultLineWidth = 1;
    const defaultOpacity = 1;

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 绘制 X 轴标签
    const xStep = chartWidth / Math.max(1, labels.length - 1);

    // 应用标签间隔（tickInterval）
    const tickInterval = Math.max(1, xAxisTickInterval || 1);
    const visibleLabels = labels.filter((_, index) => index % tickInterval === 0);

    // 计算是否需要旋转标签：当标签数量较多时自动旋转 45 度
    const estimatedLabelWidth = fontSize * 8; // 估算每个标签的宽度（8字符）
    const availableWidthPerLabel = chartWidth / visibleLabels.length;
    const shouldRotateLabels = visibleLabels.length > 6 || estimatedLabelWidth > availableWidthPerLabel;

    labels.forEach((label, index) => {
        // 根据 tickInterval 跳过不需要显示的标签
        if (index % tickInterval !== 0) return;

        const x = padding + index * xStep;

        if (shouldRotateLabels) {
            // 旋转标签 45 度以避免重叠
            ctx.save();
            ctx.translate(x, height - padding + 8);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, 0, 0);
            ctx.restore();
        } else {
            // 正常水平显示
            ctx.fillText(label, x, height - padding + 8);
        }
    });

    // 绘制 Y 轴标签
    const yGridCount = 5;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yGridCount; i++) {
        const ratio = i / yGridCount;
        const y = height - padding - ratio * chartHeight;
        const value = minValue + ratio * (maxValue - minValue);
        // Y 轴标签
        ctx.fillText(value.toFixed(0), padding - 8, y);
    }

    // 绘制垂直网格线 (X轴方向)
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

    // 绘制水平网格线 (Y轴方向)
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
        // 将标题放在 Y 轴上方
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(yAxisTitle, padding, padding - 10);
        ctx.restore();
    }
};

/**
 * 绘制坐标轴
 */
const drawAxes = (
    ctx: CanvasRenderingContext2D,
    config: LineChartConfig,
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
 * 绘制预警线
 */
const drawThresholdLine = (
    ctx: CanvasRenderingContext2D,
    config: LineChartConfig,
    width: number,
    height: number,
    threshold: LineThresholdConfig
): number => {
    const { padding, chartHeight, maxValue, minValue } = config;

    // 计算预警线在Y轴上的位置
    const normalizedValue = (threshold.value - minValue) / (maxValue - minValue || 1);
    const y = height - padding - normalizedValue * chartHeight;

    // 绘制预警线
    ctx.save();
    ctx.strokeStyle = threshold.lineColor || '#ef4444';
    ctx.lineWidth = threshold.lineWidth || 2;
    ctx.setLineDash([5, 5]); // 虚线样式

    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();

    // 绘制预警线标签
    if (threshold.showLabel !== false) {
        ctx.fillStyle = threshold.lineColor || '#ef4444';
        ctx.font = `bold ${DEFAULT_CONFIG.fontSize}px sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
            threshold.label || `预警值: ${threshold.value}`,
            width - padding,
            y - 4
        );
    }

    ctx.restore();

    return y;
};

/**
 * 根据预警阈值分割数据点
 * 返回分割后的线段数组，每个线段包含点数组和是否在阈值上方的标志
 */
const splitPointsByThreshold = (
    points: ComputedPoint[],
    thresholdValue: number
): Array<{ points: ComputedPoint[]; isAbove: boolean }> => {
    if (points.length < 2) return [{ points, isAbove: points[0]?.value >= thresholdValue }];

    const segments: Array<{ points: ComputedPoint[]; isAbove: boolean }> = [];
    let currentSegment: ComputedPoint[] = [points[0]];
    let currentIsAbove = points[0].value >= thresholdValue;

    for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currPoint = points[i];
        const currIsAbove = currPoint.value >= thresholdValue;

        // 如果跨越了阈值，需要计算交点并分割
        if ((prevPoint.value >= thresholdValue) !== (currPoint.value >= thresholdValue)) {
            // 计算与预警线的交点
            const ratio = (thresholdValue - prevPoint.value) / (currPoint.value - prevPoint.value);
            const intersectX = prevPoint.x + ratio * (currPoint.x - prevPoint.x);
            const intersectY = prevPoint.y + ratio * (currPoint.y - prevPoint.y);

            const intersectPoint: ComputedPoint = {
                x: intersectX,
                y: intersectY,
                value: thresholdValue,
                label: '',
                datasetIndex: prevPoint.datasetIndex,
                dataIndex: -1, // 标记为交点
            };

            // 结束当前线段
            currentSegment.push(intersectPoint);
            segments.push({ points: [...currentSegment], isAbove: currentIsAbove });

            // 开始新线段
            currentSegment = [intersectPoint, currPoint];
            currentIsAbove = currIsAbove;
        } else {
            currentSegment.push(currPoint);
        }
    }

    // 添加最后一个线段
    if (currentSegment.length > 0) {
        segments.push({ points: currentSegment, isAbove: currentIsAbove });
    }

    return segments;
};

/**
 * 绘制平滑曲线
 */
const drawSmoothLine = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    color: string,
    lineWidth: number
): void => {
    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        if (next) {
            // 使用三次贝塞尔曲线创建平滑连接
            const cp1X = prev.x + (curr.x - prev.x) * 0.5;
            const cp1Y = prev.y;
            const cp2X = curr.x - (next.x - curr.x) * 0.5;
            const cp2Y = curr.y;
            ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, curr.x, curr.y);
        } else {
            // 最后一个点
            const cpX = (prev.x + curr.x) / 2;
            ctx.quadraticCurveTo(cpX, (prev.y + curr.y) / 2, curr.x, curr.y);
        }
    }

    ctx.stroke();
};

/**
 * 绘制直线
 */
const drawStraightLine = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    color: string,
    lineWidth: number
): void => {
    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
};

/**
 * 绘制填充区域
 */
const drawFillArea = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    color: string,
    height: number,
    padding: number
): void => {
    if (points.length < 2) return;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2;

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    ctx.lineTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
};

/**
 * 绘制阈值分割的填充区域
 * 用于在预警线存在时，分别绘制上方和下方的填充区域
 */
const drawFillAreaByThreshold = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    color: string,
    height: number,
    padding: number,
    thresholdY: number,
    isAbove: boolean
): void => {
    if (points.length < 2) return;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2;

    ctx.beginPath();

    if (isAbove) {
        // 上方区域：从 thresholdY 开始向上填充到数据线
        // 对于在阈值以下的点，钳制到阈值线
        const firstY = Math.min(points[0].y, thresholdY);
        ctx.moveTo(points[0].x, thresholdY);
        ctx.lineTo(points[0].x, firstY);

        for (let i = 1; i < points.length; i++) {
            const y = Math.min(points[i].y, thresholdY);
            ctx.lineTo(points[i].x, y);
        }

        ctx.lineTo(points[points.length - 1].x, thresholdY);
    } else {
        // 下方区域：从底部向上填充到数据线（或阈值线，取较低者）
        // 对于在阈值以上的点，钳制到阈值线
        const firstY = Math.max(points[0].y, thresholdY);
        ctx.moveTo(points[0].x, height - padding);
        ctx.lineTo(points[0].x, firstY);

        for (let i = 1; i < points.length; i++) {
            const y = Math.max(points[i].y, thresholdY);
            ctx.lineTo(points[i].x, y);
        }

        ctx.lineTo(points[points.length - 1].x, height - padding);
    }

    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
};

/**
 * 为阈值填充构建连续的点集（下半部分填充）
 * 从图表底部到数据线，当数据线超过阈值时用阈值线作为边界
 */
const buildBelowThresholdFillPoints = (
    points: ComputedPoint[],
    thresholdValue: number
): ComputedPoint[] => {
    if (points.length < 2) return [];

    const result: ComputedPoint[] = [];

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        result.push(point);

        // 检查与下一个点的连线是否跨越阈值
        if (i < points.length - 1) {
            const nextPoint = points[i + 1];
            const isPointAbove = point.value >= thresholdValue;
            const isNextAbove = nextPoint.value >= thresholdValue;

            // 如果跨越了阈值，需要计算交点
            if (isPointAbove !== isNextAbove) {
                const ratio = (thresholdValue - point.value) / (nextPoint.value - point.value);
                const intersectX = point.x + ratio * (nextPoint.x - point.x);
                const intersectY = point.y + ratio * (nextPoint.y - point.y);

                result.push({
                    x: intersectX,
                    y: intersectY,
                    value: thresholdValue,
                    label: '',
                    datasetIndex: point.datasetIndex,
                    dataIndex: -1,
                });
            }
        }
    }

    return result;
};

/**
 * 为阈值填充构建连续的点集（上半部分填充）
 * 从数据线到阈值线，只包含在阈值以上的部分
 */
const buildAboveThresholdFillPoints = (
    points: ComputedPoint[],
    thresholdValue: number
): ComputedPoint[] => {
    if (points.length < 2) return [];

    const result: ComputedPoint[] = [];

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        result.push(point);

        // 检查与下一个点的连线是否跨越阈值
        if (i < points.length - 1) {
            const nextPoint = points[i + 1];
            const isPointAbove = point.value >= thresholdValue;
            const isNextAbove = nextPoint.value >= thresholdValue;

            // 如果跨越了阈值，需要计算交点
            if (isPointAbove !== isNextAbove) {
                const ratio = (thresholdValue - point.value) / (nextPoint.value - point.value);
                const intersectX = point.x + ratio * (nextPoint.x - point.x);
                const intersectY = point.y + ratio * (nextPoint.y - point.y);

                result.push({
                    x: intersectX,
                    y: intersectY,
                    value: thresholdValue,
                    label: '',
                    datasetIndex: point.datasetIndex,
                    dataIndex: -1,
                });
            }
        }
    }

    return result;
};

/**
 * 绘制轨道连接线
 * 在数据点之间绘制直接连接的轨道线条
 */
const drawTrack = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    dataset: LineDataset,
    datasetIndex: number,
    isHovered: boolean,
    smooth: boolean = false
): void => {
    if (!dataset.track || points.length < 2) return;

    const trackConfig = dataset.track;
    const defaultColor = getDatasetColor(datasetIndex, dataset);

    const trackColor = isHovered
        ? (trackConfig.hoverColor ?? trackConfig.color ?? defaultColor)
        : (trackConfig.color ?? defaultColor);
    const trackWidth = isHovered
        ? (trackConfig.hoverWidth ?? trackConfig.width ?? 1)
        : (trackConfig.width ?? 1);

    ctx.save();
    ctx.strokeStyle = trackColor;
    ctx.lineWidth = trackWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (smooth) {
        // 绘制平滑曲线
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];

            if (next) {
                // 使用三次贝塞尔曲线创建平滑连接
                const cp1X = prev.x + (curr.x - prev.x) * 0.5;
                const cp1Y = prev.y;
                const cp2X = curr.x - (next.x - curr.x) * 0.5;
                const cp2Y = curr.y;
                ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, curr.x, curr.y);
            } else {
                // 最后一个点
                const cpX = (prev.x + curr.x) / 2;
                ctx.quadraticCurveTo(cpX, (prev.y + curr.y) / 2, curr.x, curr.y);
            }
        }

        ctx.stroke();
    } else {
        // 绘制直线
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();
    }

    ctx.restore();
};

/**
 * 绘制数据点
 */
const drawPoints = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    dataset: LineDataset,
    datasetIndex: number,
    isHovered: boolean
): void => {
    // 如果 point 设置为 false，则隐藏数据点（相当于 borderWidth: 0, pointRadius: 0）
    if (dataset.point === false) return;
    // 兼容 dataset.pointStyle = 'none' 的情况
    if (dataset.pointStyle === 'none') return;

    // 获取 point 配置（确保不是 false）
    const pointConfig = dataset.point;

    const radius = isHovered
        ? (pointConfig?.hoverRadius ?? DEFAULT_CONFIG.pointHoverRadius)
        : (pointConfig?.radius ?? dataset.pointRadius ?? DEFAULT_CONFIG.pointRadius);
    const hoverBackgroundColor = pointConfig?.hoverBackgroundColor ?? getDatasetColor(datasetIndex, dataset);
    const backgroundColor = pointConfig?.backgroundColor ?? dataset.pointBackgroundColor ?? '#fff';
    const pointStyle = pointConfig?.style ?? dataset.pointStyle ?? 'circle';

    points.forEach((point) => {
    // 悬停时使用 hoverBackgroundColor，否则使用 backgroundColor
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
 * 折线图组件
 */
export const Line: React.FC<LineProps> = ({
    data,
    width = 600,
    height = 400,
    padding = DEFAULT_CONFIG.padding,
    xAxis,
    yAxis,
    legend,
    tooltip,
    threshold,
    verticalLine,
    animationDuration = DEFAULT_CONFIG.animationDuration,
    smooth = false,
    className,
    style,
    onDataClick,
    onChartReady,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState<ComputedPoint | null>(null);
    // 竖线模式下当前悬停的数据索引
    const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [animationProgress, setAnimationProgress] = useState(0);
    // 存储隐藏的数据集索引
    const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
    // 存储数据集的动画透明度（用于显示/隐藏动画）
    const datasetOpacityRef = useRef<Map<number, number>>(new Map());
    // 存储正在动画过渡中的数据集
    const animatingDatasetsRef = useRef<Set<number>>(new Set());
    // 用于触发透明度动画重绘
    const [opacityVersion, setOpacityVersion] = useState(0);

    const pointsRef = useRef<ComputedPoint[][]>([]);

    // 动画持续时间（毫秒）
    const ANIMATION_DURATION = 300;

    // 获取数据集的当前透明度
    // 只从 datasetOpacityRef 读取，不直接依赖 hiddenDatasets
    // 这样可以避免点击 legend 时立即触发重绘，而是通过 opacityVersion 控制
    const getDatasetOpacity = useCallback((datasetIndex: number): number => {
        return datasetOpacityRef.current.get(datasetIndex) ?? 1;
    }, [opacityVersion]);

    // 计算图表配置
    const chartConfig = useMemo(
        () => calculateChartConfig(data, width, height, padding, yAxis?.min, yAxis?.max),
        [data, width, height, padding, yAxis?.min, yAxis?.max]
    );

    // 计算所有数据点
    const allPoints = useMemo(
        () => computePoints(data, chartConfig, width, height),
        [data, chartConfig, width, height]
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

        // 绘制网格（默认不显示，需要配置 grid.display: true）
        drawGrid(
            ctx,
            chartConfig,
            width,
            height,
            data.labels,
            xAxis?.tickColor || DEFAULT_CONFIG.textColor,
            xAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
            xAxis?.display !== false ? xAxis?.title?.text : undefined,
            yAxis?.display !== false ? yAxis?.title?.text : undefined,
            xAxis?.grid,
            yAxis?.grid,
            xAxis?.gridColor || DEFAULT_CONFIG.gridColor,
            xAxis?.tickInterval
        );

        // 绘制坐标轴
        drawAxes(ctx, chartConfig, width, height, xAxis?.gridColor || DEFAULT_CONFIG.axisColor);

        // 绘制预警线（如果配置存在）
        let thresholdY = -1;
        if (threshold) {
            thresholdY = drawThresholdLine(ctx, chartConfig, width, height, threshold);
        }

        // 绘制数据线（支持透明度动画和预警线颜色分割）
        data.datasets.forEach((dataset, datasetIndex) => {
            const opacity = getDatasetOpacity(datasetIndex);
            // 跳过完全透明的数据集
            if (opacity <= 0.01) return;

            const fullPoints = allPoints[datasetIndex];
            if (!fullPoints || fullPoints.length === 0) return;

            // 根据动画进度截取点
            const visibleCount = Math.max(1, Math.floor(fullPoints.length * animationProgress));
            const points = fullPoints.slice(0, visibleCount);

            if (points.length < 2) return;

            const defaultColor = getDatasetColor(datasetIndex, dataset);
            const lineWidth = dataset.track?.width || DEFAULT_CONFIG.borderWidth;

            ctx.save();
            ctx.globalAlpha = opacity;

            // 绘制线条
            // 如果配置了预警线，优先根据阈值分割线条颜色
            if (threshold) {
                // 如果配置了预警线，根据阈值分割线条
                const segments = splitPointsByThreshold(points, threshold.value);

                segments.forEach((segment) => {
                    if (segment.points.length < 2) return;

                    // 根据优先级选择颜色：LineThresholdConfig > LineTrackConfig > 默认颜色
                    let segmentColor: string;
                    
                    if (segment.isAbove) {
                        // 预警线上方颜色优先级：
                        // 1. threshold.aboveLineColor (最高优先级)
                        // 2. dataset.track?.color (次优先级)
                        // 3. 默认红色 '#ef4444' (最低优先级)
                        segmentColor = threshold.aboveLineColor 
                            || dataset.track?.color 
                            || '#ef4444';
                    } else {
                        // 预警线下方颜色优先级：
                        // 1. threshold.belowLineColor (最高优先级)
                        // 2. dataset.track?.color (次优先级)
                        // 3. defaultColor (最低优先级)
                        segmentColor = threshold.belowLineColor 
                            || dataset.track?.color 
                            || defaultColor;
                    }

                    // 绘制线条
                    if (smooth) {
                        drawSmoothLine(ctx, segment.points, segmentColor, lineWidth);
                    } else {
                        drawStraightLine(ctx, segment.points, segmentColor, lineWidth);
                    }
                });

                // 绘制填充区域（如果 dataset.fill=true）
                if (dataset.fill) {
                    // 先绘制下方区域（作为底层）：从底部到数据线（或阈值线，取较小者）
                    const belowFillColor = threshold.belowLineColor || dataset.backgroundColor;
                    if (belowFillColor) {
                        const belowPoints = buildBelowThresholdFillPoints(points, threshold.value);
                        if (belowPoints.length >= 2) {
                            drawFillAreaByThreshold(ctx, belowPoints, belowFillColor, height, padding, thresholdY, false);
                        }
                    }

                    // 再绘制上方区域（作为上层）：从阈值线到数据线（仅阈值以上部分）
                    const aboveFillColor = threshold.aboveFillColor || dataset.backgroundColor;
                    if (aboveFillColor) {
                        const abovePoints = buildAboveThresholdFillPoints(points, threshold.value);
                        if (abovePoints.length >= 2) {
                            drawFillAreaByThreshold(ctx, abovePoints, aboveFillColor, height, padding, thresholdY, true);
                        }
                    }
                }
            } else {
                // 没有预警线时的绘制
                // 先绘制填充区域（如果有）
                if (dataset.fill && dataset.backgroundColor) {
                    drawFillArea(ctx, points, dataset.backgroundColor, height, padding);
                }

                if (dataset.track) {
                    // 有 track 配置时，使用 track 绘制线条
                    drawTrack(ctx, points, dataset, datasetIndex, false, smooth);
                } else {
                    // 正常绘制线条
                    if (smooth) {
                        drawSmoothLine(ctx, points, defaultColor, lineWidth);
                    } else {
                        drawStraightLine(ctx, points, defaultColor, lineWidth);
                    }
                }
            }

            // 绘制数据点（只在动画完成时显示）
            if (animationProgress >= 1) {
                drawPoints(ctx, points, dataset, datasetIndex, false);
            }

            ctx.restore();
        });

        // 绘制竖线（竖线模式下）
        if (verticalLine?.enabled && hoveredDataIndex !== null && animationProgress >= 1) {
            const { padding, chartHeight } = chartConfig;
            const labelsLength = data.labels.length;
            const dataCount = Math.max(1, labelsLength);
            const step = dataCount > 1 ? chartConfig.chartWidth / (dataCount - 1) : 0;
            const lineX = padding + hoveredDataIndex * step;

            ctx.save();
            ctx.strokeStyle = verticalLine.color || '#999';
            ctx.lineWidth = verticalLine.lineWidth || 1;
            if (verticalLine.dash && verticalLine.dash.length > 0) {
                ctx.setLineDash(verticalLine.dash);
            }
            ctx.beginPath();
            ctx.moveTo(lineX, padding);
            ctx.lineTo(lineX, padding + chartHeight);
            ctx.stroke();
            ctx.restore();

            // 绘制竖线模式下所有可见数据集的高亮点
            pointsRef.current.forEach((datasetPoints, datasetIndex) => {
                const opacity = getDatasetOpacity(datasetIndex);
                if (opacity < 0.1) return;

                const point = datasetPoints[hoveredDataIndex];
                if (!point) return;

                const dataset = data.datasets[datasetIndex];
                if (dataset.point === false || dataset.pointStyle === 'none') return;

                ctx.save();
                ctx.globalAlpha = opacity;
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

        // 绘制高亮点（只对可见数据集，且 point 不为 false）- 普通模式
        const hoveredOpacity = hoveredPoint ? getDatasetOpacity(hoveredPoint.datasetIndex) : 0;
        const hoveredDataset = hoveredPoint ? data.datasets[hoveredPoint.datasetIndex] : null;
        const shouldShowHoverPoint = hoveredDataset &&
            hoveredDataset.point !== false &&
            hoveredDataset.pointStyle !== 'none';

        // 普通模式下绘制单个高亮点
        if (hoveredPoint && shouldShowHoverPoint && animationProgress >= 1 && hoveredOpacity > 0.01 && !verticalLine?.enabled) {
            ctx.save();
            ctx.globalAlpha = hoveredOpacity;
            ctx.fillStyle = getDatasetColor(hoveredPoint.datasetIndex, hoveredDataset);
            ctx.beginPath();
            ctx.arc(hoveredPoint.x, hoveredPoint.y, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }

        // 图例已从 Canvas 绘制改为 DOM 渲染

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
        smooth,
        threshold,
        animationProgress,
        hoveredPoint,
        hoveredDataIndex,
        verticalLine,
        isLoading,
        onChartReady,
        // 注意：不依赖 hiddenDatasets，只依赖 opacityVersion 来触发重绘
        // getDatasetOpacity 内部使用 datasetOpacityRef 获取实际透明度
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

            // 竖线模式：根据 X 轴位置查找最近的数据索引
            if (verticalLine?.enabled) {
                const { padding, chartWidth } = chartConfig;
                const labelsLength = data.labels.length;
                const dataCount = Math.max(1, labelsLength);
                const step = dataCount > 1 ? chartWidth / (dataCount - 1) : 0;

                // 计算最近的数据索引
                let closestIndex = 0;
                if (step > 0) {
                    closestIndex = Math.round((x - padding) / step);
                    closestIndex = Math.max(0, Math.min(closestIndex, labelsLength - 1));
                }

                // 检查鼠标是否在有效的图表区域内（只在绘图网格区域内才显示竖线）
                const isInChartArea =
                    x >= padding - step / 2 &&
                    x <= width - padding + step / 2 &&
                    y >= padding &&
                    y <= height - padding;
                
                if (isInChartArea) {
                    setHoveredDataIndex(closestIndex);
                    // 找到第一个可见数据集的点作为参考点
                    let referencePoint: ComputedPoint | null = null;
                    for (let i = 0; i < pointsRef.current.length; i++) {
                        if (getDatasetOpacity(i) > 0.1 && pointsRef.current[i][closestIndex]) {
                            referencePoint = pointsRef.current[i][closestIndex];
                            break;
                        }
                    }
                    setHoveredPoint(referencePoint);
                } else {
                    setHoveredDataIndex(null);
                    setHoveredPoint(null);
                }
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                return;
            }

            // 普通模式：查找最近的数据点（只对可见数据集）
            let closestPoint: ComputedPoint | null = null;
            let minDistance = Infinity;

            pointsRef.current.forEach((datasetPoints, datasetIndex) => {
                // 使用透明度判断数据集是否可见
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
            setHoveredDataIndex(null);
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        },
        [animationProgress, chartConfig, data.labels.length, verticalLine, width, getDatasetOpacity]
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
            // 使用 easeInOutCubic 缓动函数
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const currentOpacity = startOpacity + (targetOpacity - startOpacity) * eased;
            datasetOpacityRef.current.set(datasetIndex, currentOpacity);

            // 触发重绘
            setOpacityVersion(v => v + 1);

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
            // 首先检查是否点击了图例
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            // 点击了数据点
            if (!hoveredPoint || !onDataClick) return;
            onDataClick(hoveredPoint.datasetIndex, hoveredPoint.dataIndex, hoveredPoint.value);
        },
        [hoveredPoint, onDataClick, animateOpacity]
    );

    // 生成提示框内容
    const tooltipContent = useMemo(() => {
        if (!hoveredPoint) return null;

        // 竖线模式：显示该索引的所有数据点
        if (verticalLine?.enabled && hoveredDataIndex !== null) {
            const items: LineTooltipItem[] = [];
            data.datasets.forEach((dataset, datasetIndex) => {
                // 只显示可见的数据集
                if (getDatasetOpacity(datasetIndex) < 0.1) return;
                if (dataset.data[hoveredDataIndex] !== undefined) {
                    items.push({
                        label: dataset.label,
                        value: dataset.data[hoveredDataIndex],
                        color: getDatasetColor(datasetIndex, dataset),
                        datasetIndex,
                    });
                }
            });
            return {
                title: data.labels[hoveredDataIndex] || '',
                items,
            };
        }

        // 普通模式：显示单个数据点
        const dataset = data.datasets[hoveredPoint.datasetIndex];
        return {
            title: hoveredPoint.label,
            items: [{
                label: dataset.label,
                value: hoveredPoint.value,
                color: getDatasetColor(hoveredPoint.datasetIndex, dataset),
                datasetIndex: hoveredPoint.datasetIndex,
            }],
        };
    }, [hoveredPoint, data, verticalLine, hoveredDataIndex, getDatasetOpacity]);

    return (
        <div
            ref={containerRef}
            className={classNames(styles.zcpcyChatsLineChartContainer, className)}
            style={{ ...style, width }}
        >
            {/* 图例区域 - 独立渲染在 Canvas 上方 */}
            {legend?.display !== false && data.datasets.length > 0 && (
                <div
                    className={styles.zcpcyChatsLegend}
                    style={{
                        justifyContent: legend?.position === 'bottom' ? 'center' : 'center',
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
                className={styles.zcpcyChatsLineChartCanvas}
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
                    <div
                        className={styles.zcpcyChatsTooltipTitle}
                        style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
                    >
                        {tooltipContent.title}
                    </div>
                    {tooltipContent.items.map((item, index) => (
                        <div key={index} className={styles.zcpcyChatsTooltipItem}>
                            <span
                                className={styles.zcpcyChatsTooltipColor}
                                style={{ backgroundColor: item.color }}
                            />
                            <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                                {item.label}: {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* 加载状态 */}
            {isLoading && <div className={styles.zcpcyChatsLoading}>加载中...</div>}
        </div>
    );
};

export default Line;
