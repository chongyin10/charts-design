/**
 * 雷达图组件
 * 雷达图（Radar）又称蜘蛛网图或星图，是一种将多个维度的数据以二维图表形式展示的可视化工具。
 * 其核心特征包括：
 * - 辐射状坐标轴：从中心向外辐射出若干条等距坐标轴（每个轴代表一个维度）
 * - 多边形闭合曲线：将各维度数据点连接成闭合多边形
 * - 多维度并行展示：可同时展示 3 个以上维度的数据（最多 12 个维度）
 * - 支持自适应窗口模式
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
    RadarProps,
    RadarChartData,
    RadarChartConfig,
    RadarSeries,
    RadarIndicator,
    RadarLabelConfig,
    RadarAxisConfig,
    RadarTickConfig,
    RadarGridConfig,
    RadarLegendConfig,
    RadarTooltipConfig,
    ComputedIndicator,
    ComputedPoint,
    ComputedSeries,
    RadarGeometry,
} from './Radar.type';

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
];

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<RadarChartConfig> = {
    padding: 50,
    radiusRatio: 0.9,
    startAngle: -90, // 从12点钟方向开始
    animationDuration: 800,
    animation: true,
    label: {
        display: true,
        color: '#374151',
        fontSize: 13,
        fontWeight: '500',
        offset: 15,
    },
    axis: {
        lineColor: '#e5e7eb',
        lineWidth: 1,
        showLine: true,
    },
    tick: {
        display: true,
        color: '#6b7280',
        fontSize: 11,
        offset: 6,
    },
    grid: {
        lineColor: '#e5e7eb',
        lineWidth: 1,
        showGrid: true,
        gridCount: 7,
        fillColor: 'transparent',
        outerShape: 'circle',
    },
    legend: {
        display: true,
        position: 'bottom',
        labelColor: '#374151',
        labelFontSize: 12,
        align: 'center',
    },
    tooltip: {
        enabled: true,
        backgroundColor: '#ffffff',
        titleColor: '#111827',
        bodyColor: '#374151',
        fontSize: 12,
    },
    point: {
        display: true,
        size: 5,
        fillColor: '#ffffff',
        strokeWidth: 2,
    },
};

/**
 * 角度转弧度
 */
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * 计算"友好"的最大值
 * 将数值向上取整到合适的间隔（10, 20, 50, 100, 200, 500, 1000等）
 */
const calculateNiceMax = (value: number): number => {
    if (value <= 0) return 100;
    if (value <= 10) return 10;

    // 计算数量级
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;

    // 根据归一化值选择合适的间隔
    let niceNormalized: number;
    if (normalized <= 1) {
        niceNormalized = 1;
    } else if (normalized <= 2) {
        niceNormalized = 2;
    } else if (normalized <= 5) {
        niceNormalized = 5;
    } else {
        niceNormalized = 10;
    }

    return niceNormalized * magnitude;
};

/**
 * 线性插值
 */
const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

/**
 * 获取系列颜色
 */
const getSeriesColor = (index: number, customColor?: string): string => {
    if (customColor) return customColor;
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 合并配置
 */
const mergeConfig = (config: RadarChartConfig | undefined): Required<RadarChartConfig> => {
    if (!config) return DEFAULT_CONFIG;
    return {
        ...DEFAULT_CONFIG,
        ...config,
        label: { ...DEFAULT_CONFIG.label, ...config.label },
        axis: { ...DEFAULT_CONFIG.axis, ...config.axis },
        tick: { ...DEFAULT_CONFIG.tick, ...config.tick },
        grid: { ...DEFAULT_CONFIG.grid, ...config.grid },
        legend: { ...DEFAULT_CONFIG.legend, ...config.legend },
        tooltip: { ...DEFAULT_CONFIG.tooltip, ...config.tooltip },
        point: { ...DEFAULT_CONFIG.point, ...config.point },
    };
};

/**
 * 计算图表几何配置
 * 让雷达图完全填充 canvas，同时确保标签等外围元素有足够空间
 */
const calculateGeometry = (
    width: number,
    height: number,
    padding: number,
    radiusRatio: number
): RadarGeometry => {
    // 计算中心点
    const centerX = width / 2;
    const centerY = height / 2;

    // 计算从中心到各边的距离
    const distToLeft = centerX;
    const distToRight = width - centerX;
    const distToTop = centerY;
    const distToBottom = height - centerY;

    // 最小边距距离，确保图表不会贴边
    const minDistanceToEdge = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    // 最终半径 = 最小可用距离 - padding，再应用 radiusRatio
    const radius = Math.max(10, (minDistanceToEdge - padding) * radiusRatio);

    return {
        centerX,
        centerY,
        radius,
    };
};

/**
 * 计算维度指示器
 */
const calculateIndicators = (
    data: RadarChartData,
    startAngle: number
): ComputedIndicator[] => {
    const series = data.series;
    if (series.length === 0) return [];

    // 获取所有维度名称
    const dimensionNames = series[0].data.map(item => item.name);
    const dimensionCount = dimensionNames.length;

    if (dimensionCount < 3) {
        console.warn('雷达图至少需要3个维度');
        return [];
    }

    if (dimensionCount > 12) {
        console.warn('雷达图最多支持12个维度');
    }

    // 计算每个维度的角度
    const angleStep = (Math.PI * 2) / dimensionCount;

    return dimensionNames.map((name, index) => {
        // 计算每个维度的最大值
        let max = 100;
        let min = 0;

        // 如果提供了indicators配置，使用配置的值
        if (data.indicators) {
            const indicator = data.indicators.find(ind => ind.name === name);
            if (indicator) {
                max = indicator.max;
                min = indicator.min ?? 0;
            }
        } else {
            // 否则从数据中计算最大值
            const allValues = series.flatMap(s =>
                s.data.filter(d => d.name === name).map(d => d.value)
            );
            const dataMax = Math.max(...allValues);
            // 计算一个"友好"的最大值（向上取整到合适的间隔）
            max = calculateNiceMax(dataMax);

            // 检查是否有自定义最大值
            series.forEach(s => {
                const item = s.data.find(d => d.name === name);
                if (item?.max) {
                    max = Math.max(max, item.max);
                }
            });
        }

        return {
            name,
            max,
            min,
            angle: toRad(startAngle) + (Math.PI * 2 * index) / dimensionCount,
        };
    });
};

/**
 * 计算系列数据点的坐标
 */
const calculateSeriesPoints = (
    series: RadarSeries,
    indicators: ComputedIndicator[],
    geometry: RadarGeometry,
    seriesIndex: number,
    globalPointConfig?: RadarChartConfig['point']
): ComputedSeries => {
    const points: ComputedPoint[] = [];

    series.data.forEach((item, index) => {
        const indicator = indicators[index];
        if (!indicator) return;

        const valueRatio = (item.value - indicator.min) / (indicator.max - indicator.min);
        const distance = valueRatio * geometry.radius;

        points.push({
            x: geometry.centerX + Math.cos(indicator.angle) * distance,
            y: geometry.centerY + Math.sin(indicator.angle) * distance,
            value: item.value,
            name: item.name,
            indicatorIndex: index,
        });
    });

    // 优先级：系列配置 > 全局配置 > 默认值
    const showPoints = series.showPoints ?? globalPointConfig?.display ?? true;
    const pointSize = series.pointSize ?? globalPointConfig?.size ?? 5;
    const smooth = series.smooth ?? false;

    return {
        name: series.name,
        color: getSeriesColor(seriesIndex, series.color),
        lineWidth: series.lineWidth ?? 2,
        fillOpacity: series.fillOpacity ?? 0.2,
        showPoints,
        pointSize,
        smooth,
        points,
    };
};

/**
 * 绘制网格
 */
const drawGrid = (
    ctx: CanvasRenderingContext2D,
    geometry: RadarGeometry,
    indicators: ComputedIndicator[],
    gridConfig: RadarGridConfig
) => {
    if (!gridConfig.showGrid) return;

    const { centerX, centerY, radius } = geometry;
    const gridCount = gridConfig.gridCount || 4;

    ctx.save();

    // 填充网格背景
    if (gridConfig.fillColor) {
        ctx.fillStyle = gridConfig.fillColor;
        if (gridConfig.outerShape === 'circle') {
            // 圆形填充
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // 多边形填充
            ctx.beginPath();
            indicators.forEach((indicator, index) => {
                const x = centerX + Math.cos(indicator.angle) * radius;
                const y = centerY + Math.sin(indicator.angle) * radius;
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.closePath();
            ctx.fill();
        }
    }

    // 绘制网格线
    ctx.strokeStyle = gridConfig.lineColor || '#e5e7eb';
    ctx.lineWidth = gridConfig.lineWidth || 1;

    if (gridConfig.outerShape === 'circle') {
        // 绘制同心圆网格
        for (let i = 1; i <= gridCount; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / gridCount) * i, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else {
        // 绘制多边形网格
        for (let i = 1; i <= gridCount; i++) {
            ctx.beginPath();
            const gridRadius = (radius / gridCount) * i;
            indicators.forEach((indicator, index) => {
                const x = centerX + Math.cos(indicator.angle) * gridRadius;
                const y = centerY + Math.sin(indicator.angle) * gridRadius;
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.closePath();
            ctx.stroke();
        }
    }

    ctx.restore();
};

/**
 * 绘制轴线
 */
const drawAxis = (
    ctx: CanvasRenderingContext2D,
    geometry: RadarGeometry,
    indicators: ComputedIndicator[],
    axisConfig: RadarAxisConfig
) => {
    if (!axisConfig.showLine) return;

    const { centerX, centerY, radius } = geometry;

    ctx.save();
    ctx.strokeStyle = axisConfig.lineColor || '#e5e7eb';
    ctx.lineWidth = axisConfig.lineWidth || 1;

    indicators.forEach(indicator => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(indicator.angle) * radius,
            centerY + Math.sin(indicator.angle) * radius
        );
        ctx.stroke();
    });

    ctx.restore();
};

/**
 * 绘制标签
 */
const drawLabels = (
    ctx: CanvasRenderingContext2D,
    geometry: RadarGeometry,
    indicators: ComputedIndicator[],
    labelConfig: RadarLabelConfig
) => {
    if (!labelConfig.display) return;

    const { centerX, centerY, radius } = geometry;
    const offset = labelConfig.offset || 12;

    ctx.save();
    ctx.fillStyle = labelConfig.color || '#374151';
    ctx.font = `${labelConfig.fontWeight || '500'} ${labelConfig.fontSize || 12}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    indicators.forEach(indicator => {
        const x = centerX + Math.cos(indicator.angle) * (radius + offset);
        const y = centerY + Math.sin(indicator.angle) * (radius + offset);

        // 根据位置调整文本对齐
        const angle = indicator.angle;
        if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
            ctx.textAlign = 'left';
        } else if (angle > (3 * Math.PI) / 4 || angle < (-3 * Math.PI) / 4) {
            ctx.textAlign = 'right';
        } else {
            ctx.textAlign = 'center';
        }

        ctx.fillText(indicator.name, x, y);
    });

    ctx.restore();
};

/**
 * 绘制刻度标签
 * 按照图片样式，在12点方向（G2轴线）上显示刻度值
 */
const drawTicks = (
    ctx: CanvasRenderingContext2D,
    geometry: RadarGeometry,
    indicators: ComputedIndicator[],
    tickConfig: RadarTickConfig,
    gridConfig: RadarGridConfig
) => {
    if (!tickConfig.display || indicators.length === 0) return;

    const { centerX, centerY, radius } = geometry;
    const gridCount = gridConfig.gridCount || 4;
    const offset = tickConfig.offset || 6;

    // 找到12点钟方向的维度（角度最接近 -PI/2 的）
    // 由于 startAngle = -90度 = -PI/2，第一个维度就在12点钟方向
    const topIndicator = indicators.reduce((prev, curr) => {
        // 将角度归一化到 [-PI, PI] 范围内比较
        const prevAngle = Math.atan2(Math.sin(prev.angle), Math.cos(prev.angle));
        const currAngle = Math.atan2(Math.sin(curr.angle), Math.cos(curr.angle));
        // 找最接近 -PI/2 (12点钟方向) 的角度
        const prevDiff = Math.abs(prevAngle - (-Math.PI / 2));
        const currDiff = Math.abs(currAngle - (-Math.PI / 2));
        return currDiff < prevDiff ? curr : prev;
    });

    ctx.save();
    ctx.fillStyle = tickConfig.color || '#6b7280';
    ctx.font = `${tickConfig.fontSize || 11}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // 增加标签与轴线的间距
    const labelOffset = offset + 4;

    // 在12点钟方向的轴线上绘制刻度（跳过中心点0）
    for (let i = 0; i <= gridCount; i++) {
        const ratio = i / gridCount;
        const tickRadius = radius * ratio;
        const x = centerX + Math.cos(topIndicator.angle) * tickRadius;
        const y = centerY + Math.sin(topIndicator.angle) * tickRadius;

        // 计算刻度值
        const value = topIndicator.min + (topIndicator.max - topIndicator.min) * ratio;

        // 格式化刻度值 - 确保显示为简洁格式
        let label: string;
        if (tickConfig.formatter) {
            label = tickConfig.formatter(value);
        } else {
            // 默认格式：智能格式化，避免小数精度问题
            let displayValue: number;
            const range = topIndicator.max - topIndicator.min;

            // 根据数值范围决定显示精度
            if (range >= 100) {
                // 大范围：显示整数
                displayValue = Math.round(value);
            } else if (range >= 10) {
                // 中等范围：最多1位小数
                displayValue = Math.round(value * 10) / 10;
            } else {
                // 小范围：最多2位小数
                displayValue = Math.round(value * 100) / 100;
            }

            // 去除不必要的小数位（如 1.0 显示为 1）
            if (displayValue >= 1000) {
                label = Math.round(displayValue / 1000) + 'K';
            } else {
                label = displayValue.toString();
            }
        }

        // 绘制刻度标签（放在轴线左侧，增加间距避免重叠）
        ctx.fillText(label, x - labelOffset, y);
    }

    ctx.restore();
};

/**
 * 计算平滑曲线的控制点
 * 使用 Catmull-Rom 样条算法转换为三次贝塞尔曲线
 */
const calculateControlPoints = (
    prev: ComputedPoint,
    curr: ComputedPoint,
    next: ComputedPoint,
    tension: number = 0.3
): { cp1: { x: number; y: number }; cp2: { x: number; y: number } } => {
    // 计算从 prev 到 next 的向量
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;

    // 控制点1：从 curr 向 prev 方向延伸
    const cp1 = {
        x: curr.x - dx * tension,
        y: curr.y - dy * tension,
    };

    // 控制点2：从 curr 向 next 方向延伸
    const cp2 = {
        x: curr.x + dx * tension,
        y: curr.y + dy * tension,
    };

    return { cp1, cp2 };
};

/**
 * 绘制平滑曲线路径
 */
const drawSmoothPath = (
    ctx: CanvasRenderingContext2D,
    points: ComputedPoint[],
    closed: boolean = true
) => {
    if (points.length < 3) {
        // 点太少，直接绘制直线
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        if (closed) ctx.closePath();
        return;
    }

    const n = points.length;
    const tension = 0.3;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < n; i++) {
        const prev = points[(i - 1 + n) % n];
        const curr = points[i];
        const next = points[(i + 1) % n];
        const nextNext = points[(i + 2) % n];

        // 计算当前点到下一点的控制点
        const { cp1, cp2 } = calculateControlPoints(curr, next, nextNext, tension);

        // 使用三次贝塞尔曲线
        ctx.bezierCurveTo(
            points[i].x + (next.x - prev.x) * tension,
            points[i].y + (next.y - prev.y) * tension,
            next.x - (nextNext.x - curr.x) * tension,
            next.y - (nextNext.y - curr.y) * tension,
            next.x,
            next.y
        );
    }

    if (closed) ctx.closePath();
};

/**
 * 绘制系列
 */
const drawSeries = (
    ctx: CanvasRenderingContext2D,
    computedSeries: ComputedSeries,
    animationProgress: number
) => {
    if (computedSeries.points.length === 0) return;

    const { points, color, lineWidth, fillOpacity, smooth } = computedSeries;

    ctx.save();

    // 绘制填充区域
    if (smooth) {
        drawSmoothPath(ctx, points, true);
    } else {
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.closePath();
    }

    // 填充
    ctx.fillStyle = color + Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
    ctx.fill();

    // 绘制线条
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 绘制点
    if (computedSeries.showPoints) {
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, computedSeries.pointSize, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    ctx.restore();
};

/**
 * 渲染 DOM 图例
 */
const renderLegend = (
    computedSeries: ComputedSeries[],
    legendConfig: RadarLegendConfig,
    onItemClick?: (seriesIndex: number) => void
) => {
    if (!legendConfig.display || computedSeries.length === 0) return null;

    const { position, labelColor, labelFontSize, align } = legendConfig;

    return (
        <div
            className={styles.zcpcyChatsRadarLegend}
            data-position={position}
            data-align={align}
        >
            {computedSeries.map((series, index) => (
                <div
                    key={series.name}
                    className={styles.zcpcyChatsRadarLegendItem}
                    onClick={() => onItemClick?.(index)}
                    style={{ fontSize: labelFontSize || 12, color: labelColor || '#374151' }}
                >
                    <span
                        className={styles.zcpcyChatsRadarLegendMarker}
                        style={{ backgroundColor: series.color }}
                    />
                    <span className={styles.zcpcyChatsRadarLegendLabel}>{series.name}</span>
                </div>
            ))}
        </div>
    );
};

/**
 * 雷达图组件
 */
const Radar: React.FC<RadarProps> = ({
    data,
    config,
    width: propWidth,
    height: propHeight,
    className,
    style,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [animationProgress, setAnimationProgress] = useState(0);
    const [hoverData, setHoverData] = useState<{
        seriesIndex: number;
        pointIndex: number;
        x: number;
        y: number;
    } | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const animationRef = useRef<number>();
    const isResizingRef = useRef(false);

    const mergedConfig = useMemo(() => mergeConfig(config), [config]);

    // 使用传入的 width/height 或容器尺寸
    const canvasWidth = propWidth || containerSize.width;
    const canvasHeight = propHeight || containerSize.height;

    // 计算图表几何配置和维度
    const geometry = useMemo(() => {
        if (canvasWidth === 0 || canvasHeight === 0) return null;
        return calculateGeometry(
            canvasWidth,
            canvasHeight,
            mergedConfig.padding,
            mergedConfig.radiusRatio
        );
    }, [canvasWidth, canvasHeight, mergedConfig.padding, mergedConfig.radiusRatio]);

    // 计算维度指示器
    const indicators = useMemo(() => {
        if (!geometry) return [];
        return calculateIndicators(data, mergedConfig.startAngle);
    }, [data, mergedConfig.startAngle, geometry]);

    // 计算系列数据
    const computedSeries = useMemo(() => {
        if (!geometry || indicators.length === 0) return [];
        return data.series.map((series, index) =>
            calculateSeriesPoints(series, indicators, geometry, index, mergedConfig.point)
        );
    }, [data.series, indicators, geometry, mergedConfig.point]);

    // 监听 canvas wrapper 尺寸变化 - 使用防抖处理
    useEffect(() => {
        if (!wrapperRef.current || propWidth || propHeight) return;

        const wrapper = wrapperRef.current;

        const updateSize = () => {
            if (isResizingRef.current) return;
            isResizingRef.current = true;

            requestAnimationFrame(() => {
                const rect = wrapper.getBoundingClientRect();
                setContainerSize({
                    width: Math.floor(rect.width),
                    height: Math.floor(rect.height),
                });
                isResizingRef.current = false;
            });
        };

        // 初始测量
        updateSize();

        // 使用 ResizeObserver 监听 wrapper 尺寸变化
        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });

        resizeObserver.observe(wrapper);

        return () => {
            resizeObserver.disconnect();
        };
    }, [propWidth, propHeight]);

    // 动画 - 只在初始挂载或配置变化时运行，不受 data 变化影响
    useEffect(() => {
        if (!mergedConfig.animation) {
            setAnimationProgress(1);
            return;
        }

        let startTime: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / mergedConfig.animationDuration, 1);

            // 使用缓动函数
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setAnimationProgress(easeOutQuart);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mergedConfig.animation, mergedConfig.animationDuration]); // 移除 data 依赖

    // 绘制图表
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !geometry || indicators.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 清除画布
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 绘制网格
        drawGrid(ctx, geometry, indicators, mergedConfig.grid);

        // 绘制轴线
        drawAxis(ctx, geometry, indicators, mergedConfig.axis);

        // 绘制刻度标签
        drawTicks(ctx, geometry, indicators, mergedConfig.tick, mergedConfig.grid);

        // 绘制系列
        computedSeries.forEach((series) => {
            drawSeries(ctx, series, animationProgress);
        });

        // 绘制维度标签
        drawLabels(ctx, geometry, indicators, mergedConfig.label);
    }, [
        canvasWidth,
        canvasHeight,
        geometry,
        indicators,
        computedSeries,
        animationProgress,
        mergedConfig,
    ]);

    // 处理鼠标移动 - tooltip
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!canvasRef.current || !mergedConfig.tooltip.enabled) return;

            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 查找最近的点
            let closestSeriesIndex = -1;
            let closestPointIndex = -1;
            let minDistance = Infinity;
            let closestPointX = 0;
            let closestPointY = 0;

            computedSeries.forEach((series, seriesIndex) => {
                series.points.forEach((point, pointIndex) => {
                    const dx = x - point.x;
                    const dy = y - point.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const hitRadius = Math.max(series.pointSize + 6, 16);

                    if (distance <= hitRadius && distance < minDistance) {
                        minDistance = distance;
                        closestSeriesIndex = seriesIndex;
                        closestPointIndex = pointIndex;
                        closestPointX = point.x;
                        closestPointY = point.y;
                    }
                });
            });

            if (closestSeriesIndex !== -1) {
                setHoverData({
                    seriesIndex: closestSeriesIndex,
                    pointIndex: closestPointIndex,
                    x: closestPointX,
                    y: closestPointY,
                });
                setTooltipPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            } else {
                setHoverData(null);
            }
        },
        [computedSeries, mergedConfig.tooltip.enabled]
    );

    // 处理鼠标离开
    const handleMouseLeave = useCallback(() => {
        setHoverData(null);
    }, []);

    // 格式化数值显示（避免过多小数位）
    const formatValue = useCallback((value: number): string => {
        if (value >= 1000) {
            return Math.round(value / 1000) + 'K';
        } else if (value >= 1 || value === 0) {
            return Math.round(value).toString();
        } else {
            // 小于1的值保留2位小数
            return value.toFixed(2);
        }
    }, []);

    // 生成提示框内容
    const tooltipContent = useMemo(() => {
        if (!hoverData) return null;

        const series = computedSeries[hoverData.seriesIndex];
        const point = series.points[hoverData.pointIndex];
        const indicator = indicators[point.indicatorIndex];

        if (mergedConfig.tooltip.customContent) {
            return mergedConfig.tooltip.customContent({
                seriesName: series.name,
                item: { name: point.name, value: point.value },
                seriesIndex: hoverData.seriesIndex,
                dataIndex: hoverData.pointIndex,
            });
        }

        return `
            <div class="${styles.zcpcyChatsTooltipTitle}">${series.name}</div>
            <div>${point.name}: <strong>${formatValue(point.value)}</strong> / ${formatValue(indicator.max)}</div>
        `;
    }, [hoverData, computedSeries, indicators, mergedConfig.tooltip, formatValue]);

    // 检查数据有效性
    const isValidData = useMemo(() => {
        if (!data.series || data.series.length === 0) return false;
        const dimensionCount = data.series[0].data.length;
        return dimensionCount >= 3 && dimensionCount <= 12;
    }, [data]);

    if (!isValidData) {
        return (
            <div
                ref={containerRef}
                className={classNames(styles.zcpcyChatsRadarChartContainer, className)}
                style={{
                    ...style,
                    width: propWidth || '100%',
                    height: propHeight || '100%',
                }}
            >
                <div className={styles.zcpcyChatsRadarChartEmpty}>
                    请提供有效的雷达图数据（至少需要 3 个维度，最多 12 个维度）
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={classNames(styles.zcpcyChatsRadarChartContainer, className)}
            style={{
                ...style,
                width: propWidth || '100%',
                height: propHeight || '100%',
            }}
        >
            <div ref={wrapperRef} className={styles.zcpcyChatsRadarChartCanvasWrapper}>
                <canvas
                    ref={canvasRef}
                    className={styles.zcpcyChatsRadarChartCanvas}
                    width={canvasWidth}
                    height={canvasHeight}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        cursor: mergedConfig.tooltip.enabled && hoverData
                            ? 'pointer'
                            : 'default',
                        width: canvasWidth > 0 ? canvasWidth : '100%',
                        height: canvasHeight > 0 ? canvasHeight : '100%',
                    }}
                />
                {mergedConfig.tooltip.enabled && hoverData && tooltipContent && (
                    <div
                        className={classNames(
                            styles.zcpcyChatsTooltip,
                            styles.zcpcyChatsTooltipVisible
                        )}
                        style={{
                            left: tooltipPosition.x + 10,
                            top: tooltipPosition.y - 10,
                        }}
                        dangerouslySetInnerHTML={{ __html: tooltipContent }}
                    />
                )}
            </div>
            {renderLegend(computedSeries, mergedConfig.legend)}
        </div>
    );
};

export default Radar;
