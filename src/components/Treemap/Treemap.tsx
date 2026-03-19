/**
 * 矩阵树图（Treemap）组件
 * 使用 Squarified 算法实现近正方形布局
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
    TreemapProps,
    TreemapChartData,
    TreemapNode,
    TreemapChartConfig,
    ComputedRect,
    TreemapTooltipConfig,
    TreemapLabelConfig,
} from './Treemap.type';

/**
 * 防抖函数 - ResizeObserver 专用
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 */
const debounceResize = (
    func: (entries: ResizeObserverEntry[]) => void,
    wait: number
): ((entries: ResizeObserverEntry[]) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (entries: ResizeObserverEntry[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(entries);
        }, wait);
    };
};

/**
 * 默认配色方案 - 柔和莫兰迪色系
 */
const DEFAULT_COLORS = [
    '#7FB3D5', // 柔和蓝
    '#F4A6A6', // 柔和红
    '#A8D8B9', // 柔和绿
    '#F9D89C', // 柔和黄
    '#B8A9C9', // 柔和紫
    '#F4B8C7', // 柔和粉
    '#A2D5D8', // 柔和青
    '#F4C2A1', // 柔和橙
    '#C8D6AF', // 柔和草绿
    '#9FB4CC', // 柔和灰蓝
    '#B5D8C7', // 柔和薄荷
    '#E8B4B8', // 柔和玫瑰
];

/**
 * 次级配色方案 - 现代马卡龙色系
 */
export const MACARON_COLORS = [
    '#FFB3BA', // 樱花粉
    '#FFDFBA', // 奶油橙
    '#FFFFBA', // 柠檬黄
    '#BAFFC9', // 薄荷绿
    '#BAE1FF', // 天空蓝
    '#E6B3FF', // 薰衣草紫
    '#FFD1DC', // 淡粉
    '#B5EAD7', // 青柠
    '#C7CEEA', // 淡紫
    '#FFDAC1', // 蜜桃
    '#FF9AA2', // 珊瑚
    '#B5EAD7', // 浅绿
];

/**
 * 商务配色方案 - 淡雅专业
 */
export const BUSINESS_COLORS = [
    '#6B8E9F', // 雾霾蓝
    '#D4A5A5', // 豆沙红
    '#9FB4CC', // 钢蓝
    '#C8B8A6', // 驼色
    '#A8B5A0', // 鼠尾草绿
    '#B5A8B9', // 雾紫
    '#A5B5C8', // 淡钢蓝
    '#D4C5A5', // 浅卡其
    '#A8C8C8', // 水鸭色
    '#C8A8B8', // 藕荷色
];

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    animationDuration: 600,
    fontSize: 12,
    tooltipBackground: '#ffffff',
    tooltipTitleColor: '#111827',
    tooltipBodyColor: '#374151',
};

/**
 * 获取节点值（递归计算）
 */
const getNodeValue = (node: TreemapNode): number => {
    if (node.value !== undefined) {
        return node.value;
    }
    if (node.children && node.children.length > 0) {
        return node.children.reduce((sum, child) => sum + getNodeValue(child), 0);
    }
    return 0;
};

/**
 * 获取节点颜色
 */
const getNodeColor = (node: TreemapNode, index: number, depth: number, colors: string[]): string => {
    if (node.color) return node.color;
    // 同一层级的节点使用不同的基础色
    return colors[index % colors.length];
};

/**
 * 计算矩形的长宽比
 */
const getRatio = (row: TreemapNode[], width: number, totalValue: number): number => {
    if (row.length === 0 || totalValue === 0) return Infinity;
    
    const rowValue = row.reduce((sum, node) => sum + getNodeValue(node), 0);
    const rowArea = width * rowValue / totalValue;
    const rowHeight = rowArea / width;
    
    let minRatio = Infinity;
    let maxRatio = 0;
    
    row.forEach(node => {
        const nodeValue = getNodeValue(node);
        const nodeWidth = rowArea * nodeValue / rowValue;
        const ratio = Math.max(rowHeight / nodeWidth, nodeWidth / rowHeight);
        minRatio = Math.min(minRatio, ratio);
        maxRatio = Math.max(maxRatio, ratio);
    });
    
    return maxRatio;
};

/**
 * Squarified 算法 - 将节点布局成近正方形
 */
const squarify = (
    children: TreemapNode[],
    row: TreemapNode[],
    x: number,
    y: number,
    width: number,
    height: number,
    totalValue: number,
    depth: number,
    colors: string[],
    results: ComputedRect[]
): void => {
    if (children.length === 0) {
        if (row.length > 0) {
            // 处理最后一行
            layoutRow(row, x, y, width, height, totalValue, depth, colors, results);
        }
        return;
    }
    
    const child = children[0];
    const remainingChildren = children.slice(1);
    const currentRowValue = row.reduce((sum, node) => sum + getNodeValue(node), 0);
    const newRow = [...row, child];
    
    // 判断是水平还是垂直切分
    const isHorizontal = width >= height;
    
    // 计算当前行和新行的长宽比
    const currentRatio = row.length > 0 ? getRatio(row, isHorizontal ? height : width, totalValue) : Infinity;
    const newRatio = getRatio(newRow, isHorizontal ? height : width, totalValue);
    
    if (row.length === 0 || newRatio <= currentRatio) {
        // 继续添加到当前行
        squarify(remainingChildren, newRow, x, y, width, height, totalValue, depth, colors, results);
    } else {
        // 开始新的一行
        const rowValue = currentRowValue;
        const rowArea = (isHorizontal ? height : width) * rowValue / totalValue;
        
        if (isHorizontal) {
            const rowHeight = rowArea / width;
            layoutRow(row, x, y, width, rowHeight, rowValue, depth, colors, results);
            squarify(remainingChildren, [], x, y + rowHeight, width, height - rowHeight, totalValue - rowValue, depth, colors, results);
        } else {
            const rowWidth = rowArea / height;
            layoutRow(row, x, y, rowWidth, height, rowValue, depth, colors, results);
            squarify(remainingChildren, [], x + rowWidth, y, width - rowWidth, height, totalValue - rowValue, depth, colors, results);
        }
    }
};

/**
 * 布局单行
 */
const layoutRow = (
    row: TreemapNode[],
    x: number,
    y: number,
    width: number,
    height: number,
    rowValue: number,
    depth: number,
    colors: string[],
    results: ComputedRect[]
): void => {
    let currentX = x;
    let currentY = y;
    
    row.forEach((node, index) => {
        const nodeValue = getNodeValue(node);
        const ratio = nodeValue / rowValue;
        
        let nodeWidth: number;
        let nodeHeight: number;
        
        if (width >= height) {
            // 水平排列
            nodeWidth = width * ratio;
            nodeHeight = height;
        } else {
            // 垂直排列
            nodeWidth = width;
            nodeHeight = height * ratio;
        }
        
        const percentage = ratio * 100;
        
        results.push({
            node,
            x: currentX,
            y: currentY,
            width: nodeWidth,
            height: nodeHeight,
            color: getNodeColor(node, index, depth, colors),
            depth,
            percentage,
            visible: true,
        });
        
        // 递归处理子节点
        if (node.children && node.children.length > 0) {
            const childTotalValue = node.children.reduce((sum, child) => sum + getNodeValue(child), 0);
            const padding = Math.min(nodeWidth, nodeHeight) * 0.05;
            const childColors = colors; // 子节点使用相同颜色系
            squarify(
                [...node.children].sort((a, b) => getNodeValue(b) - getNodeValue(a)),
                [],
                currentX + padding,
                currentY + padding,
                nodeWidth - padding * 2,
                nodeHeight - padding * 2,
                childTotalValue,
                depth + 1,
                childColors,
                results
            );
        }
        
        if (width >= height) {
            currentX += nodeWidth;
        } else {
            currentY += nodeHeight;
        }
    });
};

/**
 * 计算树图布局
 */
const calculateTreemapLayout = (
    data: TreemapChartData,
    width: number,
    height: number,
    padding: number,
    colors: string[]
): ComputedRect[] => {
    const results: ComputedRect[] = [];
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    if (!data.root || chartWidth <= 0 || chartHeight <= 0) {
        return results;
    }
    
    const totalValue = getNodeValue(data.root);
    
    if (totalValue === 0) {
        return results;
    }
    
    // 对根节点的子节点按值降序排序
    const sortedChildren = data.root.children 
        ? [...data.root.children].sort((a, b) => getNodeValue(b) - getNodeValue(a))
        : [];
    
    squarify(
        sortedChildren,
        [],
        padding,
        padding,
        chartWidth,
        chartHeight,
        totalValue,
        0,
        colors,
        results
    );
    
    return results;
};

/**
 * 判断点是否在矩形内
 */
const isPointInRect = (x: number, y: number, rect: ComputedRect): boolean => {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
};

/**
 * 截断文本
 */
const truncateText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
    if (ctx.measureText(text).width <= maxWidth) {
        return text;
    }
    
    let truncated = text;
    while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
        truncated = truncated.slice(0, -1);
    }
    
    return truncated + '...';
};

/**
 * 格式化数字
 */
const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

/**
 * Treemap 组件
 */
export const Treemap: React.FC<TreemapProps> = ({
    data,
    width: propWidth,
    height: propHeight,
    autoFit = true,
    className,
    style,
    label,
    tooltip,
    onNodeClick,
    onNodeHover,
    animation = true,
    animationDuration = DEFAULT_CONFIG.animationDuration,
    colors = DEFAULT_COLORS,
    maxDepth = 0,
    borderColor = DEFAULT_CONFIG.borderColor,
    borderWidth = DEFAULT_CONFIG.borderWidth,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredRect, setHoveredRect] = useState<ComputedRect | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
    const [animationProgress, setAnimationProgress] = useState(animation ? 0 : 1);
    
    // 自适应尺寸状态
    const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
        width: propWidth || 600,
        height: propHeight || 400,
    });
    
    // 实际使用的宽高（优先使用传入的 props，否则使用自适应尺寸）
    const width = propWidth ?? containerSize.width;
    const height = propHeight ?? containerSize.height;
    
    // 悬停动画相关
    const hoverAnimationRef = useRef<number | null>(null);
    const hoverProgressRef = useRef<Record<string, number>>({});
    const prevHoveredRectRef = useRef<ComputedRect | null>(null);
    
    // ResizeObserver 引用
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    
    // 自适应容器大小 - 使用 ResizeObserver
    useEffect(() => {
        // 如果 autoFit 为 false，或传入了固定的 width 和 height，则不启用自适应
        if (!autoFit || (propWidth !== undefined && propHeight !== undefined)) {
            return;
        }
        
        const container = containerRef.current;
        if (!container) return;
        
        // 防抖处理的大小变化回调
        const handleResize = debounceResize((entries: ResizeObserverEntry[]) => {
            const entry = entries[0];
            if (entry) {
                const { width: newWidth, height: newHeight } = entry.contentRect;
                setContainerSize({
                    width: propWidth ?? Math.floor(newWidth),
                    height: propHeight ?? Math.floor(newHeight),
                });
            }
        }, 150); // 150ms 防抖延迟
        
        // 初始化尺寸
        const { width: initialWidth, height: initialHeight } = container.getBoundingClientRect();
        setContainerSize({
            width: propWidth ?? Math.floor(initialWidth),
            height: propHeight ?? Math.floor(initialHeight),
        });
        
        // 创建 ResizeObserver
        resizeObserverRef.current = new ResizeObserver(handleResize);
        resizeObserverRef.current.observe(container);
        
        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
        };
    }, [autoFit, propWidth, propHeight]);
    
    const rects = useMemo(() => {
        return calculateTreemapLayout(data, width, height, DEFAULT_CONFIG.padding, colors);
    }, [data, width, height, colors]);
    
    // 动画效果
    useEffect(() => {
        if (!animation) {
            setAnimationProgress(1);
            return;
        }
        
        let startTime: number | null = null;
        let animationId: number;
        
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // 使用 ease-out 缓动函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setAnimationProgress(easeOut);
            
            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            }
        };
        
        animationId = requestAnimationFrame(animate);
        
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [animation, animationDuration, data]);
    
    // 绘制函数
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // 过滤显示的矩形（根据 maxDepth）
        const visibleRects = maxDepth > 0
            ? rects.filter(rect => rect.depth < maxDepth)
            : rects;
        
        // 绘制矩形
        visibleRects.forEach(rect => {
            const { x, y, width: rectWidth, height: rectHeight, color, depth } = rect;
            
            // 应用动画缩放
            const centerX = x + rectWidth / 2;
            const centerY = y + rectHeight / 2;
            const animatedWidth = rectWidth * animationProgress;
            const animatedHeight = rectHeight * animationProgress;
            const animatedX = centerX - animatedWidth / 2;
            const animatedY = centerY - animatedHeight / 2;
            
            // 绘制矩形背景
            ctx.fillStyle = color;
            ctx.fillRect(animatedX, animatedY, animatedWidth, animatedHeight);
            
            // 绘制边框
            if (borderWidth > 0) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = Math.max(0.5, borderWidth - depth * 0.3);
                ctx.strokeRect(animatedX, animatedY, animatedWidth, animatedHeight);
            }
            
            // 高亮悬停的矩形（带缓冲动画）
            const rectKey = `${rect.x}-${rect.y}-${rect.width}-${rect.height}`;
            const hoverAlpha = hoverProgressRef.current[rectKey] || 0;
            if (hoverAlpha > 0.01) {
                ctx.fillStyle = `rgba(255, 255, 255, ${hoverAlpha * 0.25})`;
                ctx.fillRect(animatedX, animatedY, animatedWidth, animatedHeight);
            }
            
            // 绘制标签
            const labelConfig: TreemapLabelConfig = {
                display: true,
                minSize: 30,
                fontSize: DEFAULT_CONFIG.fontSize,
                ...label,
            };
            
            if (labelConfig.display && 
                animatedWidth > (labelConfig.minSize || 30) && 
                animatedHeight > (labelConfig.minSize || 30)) {
                
                ctx.fillStyle = labelConfig.color || '#ffffff';
                const fontSize = Math.min(
                    labelConfig.fontSize || DEFAULT_CONFIG.fontSize,
                    animatedHeight / 3
                );
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 绘制名称
                const labelText = typeof labelConfig.formatter === 'function'
                    ? labelConfig.formatter(rect.node, rect.percentage)
                    : (labelConfig.formatter || '{name}')
                        .replace('{name}', rect.node.name)
                        .replace('{value}', String(rect.node.value || getNodeValue(rect.node)))
                        .replace('{percentage}', rect.percentage.toFixed(1) + '%');
                
                const truncatedLabel = truncateText(ctx, labelText, animatedWidth - 8);
                ctx.fillText(truncatedLabel, animatedX + animatedWidth / 2, animatedY + animatedHeight / 2);
                
                // 绘制数值（如果空间足够）
                if (animatedHeight > 50 && rect.node.value) {
                    ctx.font = `${fontSize * 0.8}px sans-serif`;
                    const valueText = formatNumber(rect.node.value);
                    ctx.fillText(
                        valueText,
                        animatedX + animatedWidth / 2,
                        animatedY + animatedHeight / 2 + fontSize + 2
                    );
                }
            }
        });
    }, [rects, width, height, animationProgress, label, borderColor, borderWidth, maxDepth]);
    
    // 绘制
    useEffect(() => {
        draw();
    }, [draw]);
    
    // 悬停缓冲动画
    useEffect(() => {
        const animateHover = () => {
            let hasChanged = false;
            const targetProgress: Record<string, number> = {};
            
            // 计算每个矩形的目标悬停透明度
            rects.forEach(rect => {
                const rectKey = `${rect.x}-${rect.y}-${rect.width}-${rect.height}`;
                const isHovered = hoveredRect === rect;
                targetProgress[rectKey] = isHovered ? 1 : 0;
            });
            
            // 平滑过渡
            const smoothingFactor = 0.15; // 缓冲系数，越小越平滑
            Object.keys(targetProgress).forEach(key => {
                const current = hoverProgressRef.current[key] || 0;
                const target = targetProgress[key];
                const diff = target - current;
                
                if (Math.abs(diff) > 0.001) {
                    hoverProgressRef.current[key] = current + diff * smoothingFactor;
                    hasChanged = true;
                } else {
                    hoverProgressRef.current[key] = target;
                }
            });
            
            // 如果有变化，继续动画
            if (hasChanged) {
                draw();
                hoverAnimationRef.current = requestAnimationFrame(animateHover);
            } else {
                hoverAnimationRef.current = null;
            }
        };
        
        // 启动悬停动画
        if (!hoverAnimationRef.current) {
            hoverAnimationRef.current = requestAnimationFrame(animateHover);
        }
        
        return () => {
            if (hoverAnimationRef.current) {
                cancelAnimationFrame(hoverAnimationRef.current);
                hoverAnimationRef.current = null;
            }
        };
    }, [hoveredRect, rects, draw]);
    
    // 鼠标事件处理
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 查找悬停的矩形（从后往前找，后绘制的在上层）
        const hovered = [...rects].reverse().find(r => isPointInRect(x, y, r)) || null;
        
        if (hovered !== hoveredRect) {
            setHoveredRect(hovered);
            setTooltipPos(hovered ? { x: e.clientX + 10, y: e.clientY - 10 } : null);
            
            if (onNodeHover) {
                onNodeHover(hovered?.node || null, hovered?.depth || 0);
            }
        } else if (hovered) {
            setTooltipPos({ x: e.clientX + 10, y: e.clientY - 10 });
        }
    }, [rects, hoveredRect, onNodeHover]);
    
    const handleMouseLeave = useCallback(() => {
        setHoveredRect(null);
        setTooltipPos(null);
        
        // 触发悬停动画（平滑淡出）
        if (!hoverAnimationRef.current) {
            hoverAnimationRef.current = requestAnimationFrame(() => {
                // 动画循环会自动处理
            });
        }
        
        if (onNodeHover) {
            onNodeHover(null, 0);
        }
    }, [onNodeHover]);
    
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onNodeClick || !hoveredRect) return;
        
        onNodeClick(hoveredRect.node, hoveredRect.depth);
    }, [hoveredRect, onNodeClick]);
    
    // 生成提示框内容
    const tooltipContent = useMemo(() => {
        if (!hoveredRect) return null;
        
        const tooltipConfig: TreemapTooltipConfig = {
            enabled: true,
            backgroundColor: DEFAULT_CONFIG.tooltipBackground,
            titleColor: DEFAULT_CONFIG.tooltipTitleColor,
            bodyColor: DEFAULT_CONFIG.tooltipBodyColor,
            fontSize: 12,
            ...tooltip,
        };
        
        if (!tooltipConfig.enabled) return null;
        
        if (tooltipConfig.customContent) {
            return tooltipConfig.customContent({
                node: hoveredRect.node,
                percentage: hoveredRect.percentage,
                depth: hoveredRect.depth,
            });
        }
        
        const nodeValue = hoveredRect.node.value || getNodeValue(hoveredRect.node);
        
        return `
            <div style="color: ${tooltipConfig.titleColor}; font-weight: bold; margin-bottom: 4px;">
                ${hoveredRect.node.name}
            </div>
            <div style="color: ${tooltipConfig.bodyColor};">
                数值: ${formatNumber(nodeValue)}<br/>
                占比: ${hoveredRect.percentage.toFixed(1)}%
            </div>
        `;
    }, [hoveredRect, tooltip]);
    
    return (
        <div
            ref={containerRef}
            className={classNames(styles.container, className)}
            style={{
                width: propWidth ?? '100%',
                height: propHeight ?? '100%',
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={styles.canvas}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            />
            
            {/* 提示框 */}
            {tooltipContent && tooltipPos && (
                <div
                    className={styles.tooltip}
                    style={{
                        left: tooltipPos.x,
                        top: tooltipPos.y,
                        backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
                    }}
                    dangerouslySetInnerHTML={{ __html: tooltipContent }}
                />
            )}
        </div>
    );
};

export default Treemap;
