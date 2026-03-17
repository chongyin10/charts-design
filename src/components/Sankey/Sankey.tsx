/**
 * 桑基图组件 - Canvas 实现
 * 用于描述一组值到另一组值的流向，通常应用于能源、材料成分、金融等数据的可视化分析
 * 特点：
 * 1. 起始流量和结束流量相同，保持能量平衡
 * 2. 线条宽度成比例显示流量大小
 * 3. 节点宽度代表特定状态下的流量大小
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  SankeyProps,
  SankeyChartData,
  SankeyChartConfig,
  SankeyNode,
  SankeyLink,
  ComputedNode,
  ComputedLink,
} from './Sankey.type';

/**
 * 默认配色方案
 */
const DEFAULT_COLORS = [
  '#0066FF', // blue
  '#FF3366', // red
  '#00CC66', // green
  '#FF9900', // yellow
  '#9933FF', // purple
  '#FF66CC', // pink
  '#00CCFF', // cyan
  '#FF6600', // orange
  '#99CC00', // lime
  '#00AA88', // teal
  '#6666FF', // indigo
  '#CC33FF', // violet
];

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  padding: 40,
  nodeWidth: 3,
  nodePadding: 16,
  nodeCornerRadius: 2,
  linkOpacity: 0.25,
  animationDuration: 800,
  fontSize: 12,
  titleFontSize: 14,
  tooltipBackground: '#ffffff',
  tooltipTitleColor: '#111827',
  tooltipBodyColor: '#374151',
};

/**
 * 获取节点颜色
 */
const getNodeColor = (index: number, node: SankeyNode): string => {
  return node.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 计算节点层级（拓扑排序）
 */
const computeNodeColumns = (
  nodes: SankeyNode[],
  links: SankeyLink[]
): Map<string, number> => {
  const nodeColumns = new Map<string, number>();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // 初始化所有节点为第 0 列
  nodes.forEach(node => nodeColumns.set(node.id, 0));

  // 根据链接关系计算层级
  let changed = true;
  let iterations = 0;
  const maxIterations = nodes.length * 2;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    links.forEach(link => {
      const sourceCol = nodeColumns.get(link.source) || 0;
      const targetCol = nodeColumns.get(link.target) || 0;

      if (sourceCol >= targetCol) {
        nodeColumns.set(link.target, sourceCol + 1);
        changed = true;
      }
    });
  }

  return nodeColumns;
};

/**
 * 计算图表配置
 */
const calculateChartConfig = (
  data: SankeyChartData,
  width: number,
  height: number,
  padding: number,
  nodeWidth: number,
  nodePadding: number
): SankeyChartConfig => {
  return {
    padding,
    width,
    height,
    nodeWidth,
    nodePadding,
    linkOpacity: DEFAULT_CONFIG.linkOpacity,
    colors: DEFAULT_COLORS,
  };
};

/**
 * 计算节点和链接的位置
 */
const computeLayout = (
  data: SankeyChartData,
  config: SankeyChartConfig,
  align: 'left' | 'right' | 'center' | 'justify'
): { nodes: ComputedNode[]; links: ComputedLink[] } => {
  const { nodes, links } = data;
  const { width, height, padding, nodeWidth, nodePadding } = config;

  if (!nodes.length) {
    return { nodes: [], links: [] };
  }

  // 计算节点层级
  const nodeColumns = computeNodeColumns(nodes, links);

  // 找出最大列数
  const maxColumn = Math.max(...Array.from(nodeColumns.values()), 0);

  // 按列分组节点
  const columnNodes: Map<number, SankeyNode[]> = new Map();
  nodes.forEach(node => {
    const col = nodeColumns.get(node.id) || 0;
    if (!columnNodes.has(col)) {
      columnNodes.set(col, []);
    }
    columnNodes.get(col)!.push(node);
  });

  // 计算可用高度
  const availableHeight = height - padding * 2;

  // 计算列宽度
  const chartWidth = width - padding * 2;
  const columnCount = maxColumn + 1;
  const columnWidth = columnCount > 0 ? chartWidth / columnCount : chartWidth;

  // 计算节点和链接的流量
  const nodeInputValues = new Map<string, number>();
  const nodeOutputValues = new Map<string, number>();

  nodes.forEach(node => {
    nodeInputValues.set(node.id, 0);
    nodeOutputValues.set(node.id, 0);
  });

  links.forEach(link => {
    const inputVal = (nodeInputValues.get(link.target) || 0) + link.value;
    const outputVal = (nodeOutputValues.get(link.source) || 0) + link.value;
    nodeInputValues.set(link.target, inputVal);
    nodeOutputValues.set(link.source, outputVal);
  });

  // 计算总流量（用于归一化）
  const totalValue = Math.max(
    ...nodes.map(node =>
      Math.max(
        nodeInputValues.get(node.id) || 0,
        nodeOutputValues.get(node.id) || 0
      )
    ),
    0
  ) || 1;

  // 计算每列的最大值（用于对齐）
  const columnMaxValues = new Map<number, number>();
  columnNodes.forEach((colNodes, col) => {
    const maxVal = Math.max(
      ...colNodes.map(node =>
        Math.max(
          nodeInputValues.get(node.id) || 0,
          nodeOutputValues.get(node.id) || 0
        )
      )
    );
    columnMaxValues.set(col, maxVal);
  });

  // 创建计算后的节点
  const computedNodes: ComputedNode[] = [];
  const nodeMap = new Map<string, ComputedNode>();

  columnNodes.forEach((colNodes, col) => {
    const colMaxVal = columnMaxValues.get(col) || totalValue;
    const colTotalHeight = colNodes.reduce((sum, node) => {
      const nodeValue = Math.max(
        nodeInputValues.get(node.id) || 0,
        nodeOutputValues.get(node.id) || 0
      );
      return sum + (nodeValue / totalValue) * availableHeight;
    }, 0);

    const colNodeSpacing = colNodes.length > 1
      ? (availableHeight - colTotalHeight) / (colNodes.length - 1)
      : 0;

    let currentY = padding;

    colNodes.forEach(node => {
      const nodeValue = Math.max(
        nodeInputValues.get(node.id) || 0,
        nodeOutputValues.get(node.id) || 0
      );
      const nodeHeight = (nodeValue / totalValue) * availableHeight;

      // 计算 X 坐标（根据对齐方式）
      let x: number;
      if (align === 'left') {
        x = padding + col * columnWidth;
      } else if (align === 'right') {
        x = padding + (col + 1) * columnWidth - nodeWidth;
      } else if (align === 'center') {
        x = padding + col * columnWidth + (columnWidth - nodeWidth) / 2;
      } else {
        // justify - 两端对齐，第一列贴左，最后一列贴右
        if (columnCount <= 1) {
          x = padding + (chartWidth - nodeWidth) / 2;
        } else {
          const step = (chartWidth - nodeWidth) / (columnCount - 1);
          x = padding + col * step;
        }
      }

      const computedNode: ComputedNode = {
        ...node,
        column: col,
        x,
        y: currentY,
        height: nodeHeight,
        inputValue: nodeInputValues.get(node.id) || 0,
        outputValue: nodeOutputValues.get(node.id) || 0,
        sourceLinks: [],
        targetLinks: [],
      };

      computedNodes.push(computedNode);
      nodeMap.set(node.id, computedNode);

      currentY += nodeHeight + colNodeSpacing;
    });
  });

  // 计算链接
  const computedLinks: ComputedLink[] = [];
  const sourceLinkOffsets = new Map<string, number>();
  const targetLinkOffsets = new Map<string, number>();

  // 初始化偏移量
  computedNodes.forEach(node => {
    sourceLinkOffsets.set(node.id, 0);
    targetLinkOffsets.set(node.id, 0);
  });

  links.forEach(link => {
    const sourceNode = nodeMap.get(link.source);
    const targetNode = nodeMap.get(link.target);

    if (!sourceNode || !targetNode) return;

    const linkHeight = (link.value / totalValue) * availableHeight;
    const sourceOffset = sourceLinkOffsets.get(link.source) || 0;
    const targetOffset = targetLinkOffsets.get(link.target) || 0;

    const sourceYTop = sourceNode.y + sourceOffset;
    const sourceYBottom = sourceYTop + linkHeight;
    const targetYTop = targetNode.y + targetOffset;
    const targetYBottom = targetYTop + linkHeight;

    // 生成桑基图链接路径（填充区域）
    const sourceX = sourceNode.x + nodeWidth;
    const targetX = targetNode.x;
    const controlPoint1X = sourceX + (targetX - sourceX) / 2;
    const controlPoint2X = sourceX + (targetX - sourceX) / 2;

    const percentage = totalValue > 0 ? (link.value / totalValue) * 100 : 0;

    const computedLink: ComputedLink = {
      ...link,
      sourceNode,
      targetNode,
      height: linkHeight,
      sourceY: sourceNode.y + sourceOffset,
      targetY: targetNode.y + targetOffset,
      path: '', // Canvas 不需要 SVG path 字符串
      sourceX,
      sourceYTop,
      sourceYBottom,
      targetX,
      targetYTop,
      targetYBottom,
      controlPoint1X,
      controlPoint2X,
      percentage,
    };

    computedLinks.push(computedLink);
    sourceNode.sourceLinks.push(computedLink);
    targetNode.targetLinks.push(computedLink);

    sourceLinkOffsets.set(link.source, sourceOffset + linkHeight);
    targetLinkOffsets.set(link.target, targetOffset + linkHeight);
  });

  return { nodes: computedNodes, links: computedLinks };
};

/**
 * 在 Canvas 上绘制圆角矩形
 */
const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

/**
 * 在 Canvas 上绘制贝塞尔曲线链接
 */
const drawLink = (
  ctx: CanvasRenderingContext2D,
  link: ComputedLink,
  color: string,
  opacity: number,
  animationProgress: number
) => {
  const {
    sourceX,
    sourceYTop,
    sourceYBottom,
    targetX,
    targetYTop,
    targetYBottom,
    controlPoint1X,
    controlPoint2X,
  } = link;

  const currentSourceYBottom = sourceYTop + (sourceYBottom - sourceYTop) * animationProgress;
  const currentTargetYBottom = targetYTop + (targetYBottom - targetYTop) * animationProgress;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(sourceX, sourceYTop);
  ctx.bezierCurveTo(
    controlPoint1X, sourceYTop,
    controlPoint2X, targetYTop,
    targetX, targetYTop
  );
  ctx.lineTo(targetX, currentTargetYBottom);
  ctx.bezierCurveTo(
    controlPoint2X, currentTargetYBottom,
    controlPoint1X, currentSourceYBottom,
    sourceX, currentSourceYBottom
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/**
 * 绘制渐变链接
 */
const drawGradientLink = (
  ctx: CanvasRenderingContext2D,
  link: ComputedLink,
  sourceColor: string,
  targetColor: string,
  opacity: number,
  animationProgress: number
) => {
  const {
    sourceX,
    sourceYTop,
    sourceYBottom,
    targetX,
    targetYTop,
    targetYBottom,
    controlPoint1X,
    controlPoint2X,
  } = link;

  const currentSourceYBottom = sourceYTop + (sourceYBottom - sourceYTop) * animationProgress;
  const currentTargetYBottom = targetYTop + (targetYBottom - targetYTop) * animationProgress;

  const gradient = ctx.createLinearGradient(sourceX, sourceYTop, targetX, targetYTop);
  gradient.addColorStop(0, sourceColor);
  gradient.addColorStop(1, targetColor);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(sourceX, sourceYTop);
  ctx.bezierCurveTo(
    controlPoint1X, sourceYTop,
    controlPoint2X, targetYTop,
    targetX, targetYTop
  );
  ctx.lineTo(targetX, currentTargetYBottom);
  ctx.bezierCurveTo(
    controlPoint2X, currentTargetYBottom,
    controlPoint1X, currentSourceYBottom,
    sourceX, currentSourceYBottom
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/**
 * 桑基图组件
 */
const Sankey: React.FC<SankeyProps> = ({
  data,
  width = 800,
  height = 600,
  padding = DEFAULT_CONFIG.padding,
  node: nodeConfig = {},
  link: linkConfig = {},
  layout: layoutConfig = {},
  tooltip: tooltipConfig = {},
  legend: legendConfig = {},
  animation: animationConfig = {},
  className,
  style,
  onNodeClick,
  onLinkClick,
  onRenderComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // 合并配置
  const config = useMemo(
    () =>
      calculateChartConfig(
        data,
        width,
        height,
        padding,
        nodeConfig.width || DEFAULT_CONFIG.nodeWidth,
        nodeConfig.padding || DEFAULT_CONFIG.nodePadding
      ),
    [data, width, height, padding, nodeConfig.width, nodeConfig.padding]
  );

  const layout = useMemo(
    () => ({
      direction: layoutConfig.direction || 'horizontal',
      align: layoutConfig.align || 'justify',
      iterations: layoutConfig.iterations || 32,
    }),
    [layoutConfig.direction, layoutConfig.align, layoutConfig.iterations]
  );

  const animation = useMemo(
    () => ({
      enabled: animationConfig.enabled !== false,
      duration: animationConfig.duration || DEFAULT_CONFIG.animationDuration,
      easing: animationConfig.easing || 'ease-out',
    }),
    [animationConfig.enabled, animationConfig.duration, animationConfig.easing]
  );

  // 提取 nodeConfig 和 linkConfig 的具体值，避免整个对象作为依赖
  const nodeWidth = nodeConfig.width || DEFAULT_CONFIG.nodeWidth;
  const nodeCornerRadius = nodeConfig.cornerRadius || DEFAULT_CONFIG.nodeCornerRadius;
  const nodeLabelColor = nodeConfig.labelColor || '#374151';
  const nodeLabelFontSize = nodeConfig.labelFontSize || DEFAULT_CONFIG.fontSize;
  const nodeShowName = nodeConfig.showName !== false;
  const nodeShowValue = nodeConfig.showValue;
  const nodeLabelFormatter = nodeConfig.labelFormatter;

  const linkGradient = linkConfig.gradient !== false;
  const linkOpacity = linkConfig.opacity || DEFAULT_CONFIG.linkOpacity;

  // 计算布局
  const { nodes, links } = useMemo(
    () => computeLayout(data, config, layout.align),
    [data, config, layout.align]
  );

  // 动画效果
  useEffect(() => {
    if (!animation.enabled) {
      setAnimationProgress(1);
      return;
    }

    setAnimationProgress(0);
    const startTime = Date.now();
    const duration = animation.duration;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 应用缓动函数
      let easedProgress: number;
      switch (animation.easing) {
        case 'ease-in':
          easedProgress = progress * progress;
          break;
        case 'ease-out':
          easedProgress = 1 - (1 - progress) * (1 - progress);
          break;
        case 'ease-in-out':
          easedProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          break;
        case 'linear':
        default:
          easedProgress = progress;
      }

      setAnimationProgress(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onRenderComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }, [animation, onRenderComplete]);

  // 渲染 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 绘制链接
    links.forEach((link, index) => {
      const sourceColor = getNodeColor(
        nodes.findIndex(n => n.id === link.source),
        link.sourceNode
      );
      const targetColor = getNodeColor(
        nodes.findIndex(n => n.id === link.target),
        link.targetNode
      );

      const isHovered = hoveredLink === `${link.source}-${link.target}`;
      const isRelatedToHoveredNode =
        hoveredNode &&
        (link.source === hoveredNode || link.target === hoveredNode);
  const opacity =
    hoveredNode && !isRelatedToHoveredNode
      ? 0.1
      : isHovered
      ? 0.8
      : linkOpacity;

  if (linkGradient) {
    drawGradientLink(ctx, link, sourceColor, targetColor, opacity, animationProgress);
  } else {
    drawLink(ctx, link, sourceColor, opacity, animationProgress);
  }
});

// 绘制节点
nodes.forEach((node, index) => {
  const color = getNodeColor(index, node);
  const isHovered = hoveredNode === node.id;
  const isRelatedToHoveredLink =
    hoveredLink &&
    (hoveredLink.startsWith(`${node.id}-`) ||
      hoveredLink.endsWith(`-${node.id}`));
  const opacity = hoveredLink && !isRelatedToHoveredLink ? 0.3 : 1;
  const nodeWidthActual = nodeWidth * animationProgress;

  ctx.save();
  ctx.globalAlpha = opacity;

  // 绘制节点矩形
  if (isHovered) {
    ctx.filter = 'brightness(1.1)';
  }
  drawRoundRect(
    ctx,
    node.x,
    node.y,
    nodeWidthActual,
    node.height,
    nodeCornerRadius
  );
  ctx.fillStyle = color;
  ctx.fill();
  ctx.filter = 'none';

  // 绘制节点标签
  if ((nodeShowName || nodeShowValue) && animationProgress > 0.5) {
    ctx.fillStyle = nodeLabelColor;
    ctx.font = `${nodeLabelFontSize}px sans-serif`;
    ctx.textBaseline = 'middle';
    const label = nodeLabelFormatter
      ? nodeLabelFormatter(node, node.outputValue || node.inputValue)
      : nodeShowName
      ? node.name
      : String(node.outputValue || node.inputValue);
    ctx.fillText(label, node.x + nodeWidthActual + 8, node.y + node.height / 2);
  }

  ctx.restore();
});
}, [nodes, links, hoveredNode, hoveredLink, animationProgress, linkGradient, linkOpacity, nodeWidth, nodeCornerRadius, nodeLabelColor, nodeLabelFontSize, nodeShowName, nodeShowValue, nodeLabelFormatter, width, height]);

  // 碰撞检测 - 查找鼠标下的节点
  const findNodeAtPosition = useCallback(
    (x: number, y: number): ComputedNode | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const canvasX = x - rect.left;
      const canvasY = y - rect.top;

      for (const node of nodes) {
        if (
          canvasX >= node.x &&
          canvasX <= node.x + nodeWidth &&
          canvasY >= node.y &&
          canvasY <= node.y + node.height
        ) {
          return node;
        }
      }
      return null;
    },
    [nodes, nodeWidth]
  );

  // 计算三次贝塞尔曲线上的点
  const getBezierPoint = (
    t: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number
  ): number => {
    const mt = 1 - t;
    return (
      mt * mt * mt * p0 +
      3 * mt * mt * t * p1 +
      3 * mt * t * t * p2 +
      t * t * t * p3
    );
  };

  // 通过二分法找到给定 X 对应的 t 值
  const findTForX = (
    x: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number
  ): number => {
    let low = 0;
    let high = 1;
    let t = 0.5;
    let epsilon = 0.0001;

    for (let i = 0; i < 20; i++) {
      const bx = getBezierPoint(t, p0, p1, p2, p3);
      if (Math.abs(bx - x) < epsilon) {
        return t;
      }
      if (bx < x) {
        low = t;
      } else {
        high = t;
      }
      t = (low + high) / 2;
    }
    return t;
  };

  // 碰撞检测 - 查找鼠标下的链接（精确贝塞尔曲线检测）
  const findLinkAtPosition = useCallback(
    (x: number, y: number): ComputedLink | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const canvasX = x - rect.left;
      const canvasY = y - rect.top;

      // 反向遍历链接，优先检测最上层绘制的链接
      for (let i = links.length - 1; i >= 0; i--) {
        const link = links[i];

        // 快速排除：检查 X 是否在链接范围内
        const minX = Math.min(link.sourceX, link.targetX);
        const maxX = Math.max(link.sourceX, link.targetX);
        if (canvasX < minX || canvasX > maxX) {
          continue;
        }

        // 对于贝塞尔曲线，找到当前 X 对应的 t 值
        const t = findTForX(
          canvasX,
          link.sourceX,
          link.controlPoint1X,
          link.controlPoint2X,
          link.targetX
        );

        // 计算上边界和下边界的 Y 值
        const yTop = getBezierPoint(
          t,
          link.sourceYTop,
          link.sourceYTop,
          link.targetYTop,
          link.targetYTop
        );
        const yBottom = getBezierPoint(
          t,
          link.sourceYBottom,
          link.sourceYBottom,
          link.targetYBottom,
          link.targetYBottom
        );

        // 检查鼠标 Y 是否在该 X 处的链接高度范围内
        if (canvasY >= yTop && canvasY <= yBottom) {
          return link;
        }
      }
      return null;
    },
    [links]
  );

  // 处理节点鼠标事件
  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: ComputedNode) => {
      setHoveredNode(node.id);

      if (tooltipConfig.enabled === false) return;

      const content = tooltipConfig.customNodeContent ? (
        tooltipConfig.customNodeContent({
          node,
          inputValue: node.inputValue,
          outputValue: node.outputValue,
        })
      ) : (
        <div>
          <div className={styles.zcpcyChatsTooltipTitle}>{node.name}</div>
          <div className={styles.zcpcyChatsTooltipItem}>
            <span>输入:</span>
            <strong>{node.inputValue.toLocaleString()}</strong>
          </div>
          <div className={styles.zcpcyChatsTooltipItem}>
            <span>输出:</span>
            <strong>{node.outputValue.toLocaleString()}</strong>
          </div>
        </div>
      );

      setTooltip({
        visible: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        content,
      });
    },
    [tooltipConfig]
  );

  const handleNodeMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip(prev => ({
      ...prev,
      x: event.clientX + 10,
      y: event.clientY - 10,
    }));
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // 处理链接鼠标事件
  const handleLinkMouseEnter = useCallback(
    (event: React.MouseEvent, link: ComputedLink) => {
      setHoveredLink(`${link.source}-${link.target}`);

      if (tooltipConfig.enabled === false) return;

      const content = tooltipConfig.customLinkContent ? (
        tooltipConfig.customLinkContent({
          link,
          sourceNode: link.sourceNode,
          targetNode: link.targetNode,
          percentage: link.percentage,
        })
      ) : (
        <div>
          <div className={styles.zcpcyChatsTooltipTitle}>
            {link.sourceNode.name} → {link.targetNode.name}
          </div>
          <div className={styles.zcpcyChatsTooltipItem}>
            <span>流量:</span>
            <strong>{link.value.toLocaleString()}</strong>
          </div>
          <div className={styles.zcpcyChatsTooltipItem}>
            <span>占比:</span>
            <strong>{link.percentage.toFixed(1)}%</strong>
          </div>
        </div>
      );

      setTooltip({
        visible: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        content,
      });
    },
    [tooltipConfig]
  );

  const handleLinkMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip(prev => ({
      ...prev,
      x: event.clientX + 10,
      y: event.clientY - 10,
    }));
  }, []);

  const handleLinkMouseLeave = useCallback(() => {
    setHoveredLink(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // Canvas 鼠标事件处理
  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const node = findNodeAtPosition(event.clientX, event.clientY);
      const link = !node ? findLinkAtPosition(event.clientX, event.clientY) : null;

      if (node) {
        if (hoveredNode !== node.id) {
          handleNodeMouseEnter(event, node);
        } else {
          handleNodeMouseMove(event);
        }
      } else if (link) {
        const linkId = `${link.source}-${link.target}`;
        if (hoveredLink !== linkId) {
          handleLinkMouseEnter(event, link);
        } else {
          handleLinkMouseMove(event);
        }
      } else if (hoveredNode || hoveredLink) {
        handleNodeMouseLeave();
        handleLinkMouseLeave();
      }
    },
    [
      findNodeAtPosition,
      findLinkAtPosition,
      hoveredNode,
      hoveredLink,
      handleNodeMouseEnter,
      handleNodeMouseMove,
      handleLinkMouseEnter,
      handleLinkMouseMove,
      handleNodeMouseLeave,
      handleLinkMouseLeave,
    ]
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const node = findNodeAtPosition(event.clientX, event.clientY);
      if (node) {
        onNodeClick?.(node, node.inputValue, node.outputValue);
        return;
      }

      const link = findLinkAtPosition(event.clientX, event.clientY);
      if (link) {
        onLinkClick?.(link, link.sourceNode, link.targetNode);
      }
    },
    [findNodeAtPosition, findLinkAtPosition, onNodeClick, onLinkClick]
  );

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setHoveredLink(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsSankeyChartContainer, className)}
      style={{ width, height, ...style }}
    >
      <canvas
        ref={canvasRef}
        className={styles.zcpcyChatsSankeyChartCanvas}
        width={width}
        height={height}
        style={{
          cursor: hoveredNode || hoveredLink ? 'pointer' : 'default',
        }}
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
        onMouseLeave={handleCanvasMouseLeave}
      />

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className={classNames(
            styles.zcpcyChatsTooltip,
            styles.zcpcyChatsTooltipVisible
          )}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: tooltipConfig.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default Sankey;
