/**
 * 热力图组件
 * 通过颜色强度映射二维数据密度或数值大小的可视化图表
 * 擅长揭示数据分布规律、聚类特征及异常点
 * 支持传统矩阵热力图和密度热力图两种模式
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  HeatmapProps,
  HeatmapChartData,
  HeatmapChartConfig,
  HeatmapColorScaleConfig,
  ComputedCell,
  TooltipState,
  DensityPoint,
  DensityConfig,
  ClusteringConfig,
  ClusterNode,
  HierarchicalClusteringResult,
} from './Heatmap.type';

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  padding: 60,
  borderRadius: 0, // 改为0，使单元格紧密相连
  animationDuration: 800,
  gridColor: '#e5e7eb',
  textColor: '#6b7280',
  axisColor: '#d1d5db',
  tooltipBackground: '#ffffff',
  tooltipTitleColor: '#111827',
  tooltipBodyColor: '#374151',
  fontSize: 12,
  titleFontSize: 14,
  cellSpacing: 0, // 改为0，消除单元格间隙
};

/**
 * 密度热力图默认配置
 */
const DEFAULT_DENSITY_CONFIG: Required<DensityConfig> = {
  gridSize: 200,  // 更高的网格分辨率
  radius: 40,     // 适中的影响半径
  weighted: true,
  minOpacity: 0,
  maxOpacity: 1,
};

/**
 * 聚类热力图默认配置
 */
const DEFAULT_CLUSTERING_CONFIG: Required<ClusteringConfig> = {
  clusterRows: true,
  clusterCols: true,
  distanceMetric: 'euclidean',
  linkageMethod: 'average',
  dendrogramWidth: 100,
  dendrogramHeight: 60,
  dendrogramColor: '#374151',
  dendrogramLineWidth: 1,
  showRowLabels: true,
  rowLabelFontSize: 11,
  rowLabelColor: '#374151',
  clusterThreshold: 0,
  rowLabelPosition: 'right',
};

/**
 * 默认颜色比例尺 - 连续密度热力图配色
 * 按照示例图配色：白 -> 淡蓝 -> 绿 -> 黄 -> 红
 */
const DEFAULT_COLOR_SCALE: HeatmapColorScaleConfig = {
  minColor: '#ffffff', // 白色（无数据）
  maxColor: '#ff0000', // 红色（高密度）
  colorStops: [
    { offset: 0, color: '#ffffff' },    // 白色 - 无数据区域
    { offset: 0.05, color: '#f0f0f8' }, // 极淡蓝灰 - 极低密度
    { offset: 0.15, color: '#d0d8f0' }, // 淡蓝灰 - 低密度边缘
    { offset: 0.25, color: '#a0b8e0' }, // 浅蓝 - 边缘溢出
    { offset: 0.35, color: '#40ff40' }, // 亮绿
    { offset: 0.50, color: '#80ff40' }, // 黄绿
    { offset: 0.65, color: '#ffff00' }, // 黄色
    { offset: 0.80, color: '#ff8000' }, // 橙色
    { offset: 0.90, color: '#ff4000' }, // 红橙
    { offset: 1, color: '#ff0000' },    // 红色 - 高密度
  ],
};

/**
 * 发散型颜色比例尺 - 支持负值（蓝-白-红）
 */
const DIVERGING_COLOR_SCALE: HeatmapColorScaleConfig = {
  minColor: '#dc2626', // 红色（负值）
  midColor: '#ffffff', // 白色（零值）
  maxColor: '#2563eb', // 蓝色（正值）
  diverging: true,
  neutralColor: '#ffffff',
};

/**
 * CSS 颜色名称到 hex 的映射
 */
const COLOR_NAME_MAP: Record<string, string> = {
  // 基本颜色
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  // 扩展颜色
  orange: '#ffa500',
  purple: '#800080',
  pink: '#ffc0cb',
  brown: '#a52a2a',
  gray: '#808080',
  grey: '#808080',
  lime: '#00ff00',
  navy: '#000080',
  teal: '#008080',
  olive: '#808000',
  silver: '#c0c0c0',
  gold: '#ffd700',
  // 浅色系
  lightyellow: '#ffffe0',
  lightred: '#ffcccb',
  lightgreen: '#90ee90',
  lightblue: '#add8e6',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  // 深色系
  darkred: '#8b0000',
  darkgreen: '#006400',
  darkblue: '#00008b',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
};

/**
 * 解析颜色字符串为 RGB 对象
 */
const parseColor = (color: string): { r: number; g: number; b: number } => {
  const normalizedColor = color.toLowerCase().trim();
  
  // 处理颜色名称
  if (COLOR_NAME_MAP[normalizedColor]) {
    color = COLOR_NAME_MAP[normalizedColor];
  }
  
  // 处理 hex 颜色
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }
  // 处理 rgb/rgba 颜色
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  return { r: 0, g: 0, b: 0 };
};

/**
 * 将 RGB 对象转换为 hex 颜色字符串
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * 线性插值
 */
const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * 颜色插值
 */
const interpolateColor = (color1: string, color2: string, t: number): string => {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  const r = lerp(c1.r, c2.r, t);
  const g = lerp(c1.g, c2.g, t);
  const b = lerp(c1.b, c2.b, t);
  return rgbToHex(r, g, b);
};

/**
 * 从颜色停止点数组获取对应位置的颜色
 */
const getColorFromStops = (colorStops: { offset: number; color: string }[], t: number): string => {
  // 确保 t 在 0-1 范围内
  t = Math.max(0, Math.min(1, t));
  
  // 找到对应的两个停止点
  for (let i = 0; i < colorStops.length - 1; i++) {
    const start = colorStops[i];
    const end = colorStops[i + 1];
    
    if (t >= start.offset && t <= end.offset) {
      // 在当前区间内插值
      const localT = (t - start.offset) / (end.offset - start.offset);
      return interpolateColor(start.color, end.color, localT);
    }
  }
  
  // 如果超出范围，返回最后一个颜色
  return colorStops[colorStops.length - 1].color;
};

/**
 * 获取数值对应的颜色
 */
const getColorForValue = (
  value: number,
  minValue: number,
  maxValue: number,
  colorScale: HeatmapColorScaleConfig
): string => {
  if (maxValue === minValue) {
    return colorScale.minColor;
  }

  // 归一化数值到 0-1
  const t = (value - minValue) / (maxValue - minValue);
  const normalizedT = Math.max(0, Math.min(1, t));

  // 如果提供了颜色停止点数组，使用多色阶渐变
  if (colorScale.colorStops && colorScale.colorStops.length >= 2) {
    return getColorFromStops(colorScale.colorStops, normalizedT);
  }

  // 发散型颜色比例尺（支持负值）
  if (colorScale.diverging) {
    const midValue = 0;
    const minColor = colorScale.minColor;
    const midColor = colorScale.midColor || colorScale.neutralColor || '#ffffff';
    const maxColor = colorScale.maxColor;

    if (value < midValue) {
      // 负值：从中间颜色到最小颜色
      const localT = (value - minValue) / (midValue - minValue);
      return interpolateColor(minColor, midColor, Math.max(0, Math.min(1, localT)));
    } else {
      // 正值：从中间颜色到最大颜色
      const localT = (value - midValue) / (maxValue - midValue);
      return interpolateColor(midColor, maxColor, Math.max(0, Math.min(1, localT)));
    }
  }

  // 普通线性颜色比例尺
  return interpolateColor(colorScale.minColor, colorScale.maxColor, normalizedT);
};

/**
 * 计算图表配置
 * @param layoutOffsets 可选的布局偏移量（用于聚类模式）
 * 
 * 布局说明：
 * - 非聚类模式：热力图区域 = [padding, width-padding] x [padding, height-padding]
 * - 聚类模式：热力图区域 = [leftOffset+padding, width-padding] x [topOffset+padding, height-padding]
 * 
 * 树状图绘制在热力图区域外侧：
 * - 行树状图：[leftOffset, leftOffset+padding]（热力图左侧）
 * - 列树状图：[topOffset-padding, topOffset]（热力图上方，需要留出 padding 空间）
 */
const calculateChartConfig = (
  data: HeatmapChartData,
  width: number,
  height: number,
  padding: number,
  cellSpacing: number,
  layoutOffsets?: { leftOffset: number; topOffset: number }
): HeatmapChartConfig => {
  const xCount = data.xLabels.length;
  const yCount = data.yLabels.length;

  // 计算所有数据中的最大最小值
  let minValue = Infinity;
  let maxValue = -Infinity;

  data.datasets.forEach((dataset) => {
    dataset.data.forEach((row) => {
      row.forEach((value) => {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      });
    });
  });

  if (minValue === Infinity) {
    minValue = 0;
    maxValue = 1;
  }

  // 应用布局偏移
  const leftOffset = layoutOffsets?.leftOffset || 0;
  const topOffset = layoutOffsets?.topOffset || 0;

  // 热力图区域：始终在两侧保留 padding（用于轴标签等）
  // 聚类模式下，热力图从 leftOffset/topOffset 开始，但仍需两侧的 padding
  const chartWidth = width - leftOffset - padding * 2;
  const chartHeight = height - topOffset - padding * 2;

  const cellWidth = xCount > 0 ? (chartWidth - cellSpacing * (xCount - 1)) / xCount : 0;
  const cellHeight = yCount > 0 ? (chartHeight - cellSpacing * (yCount - 1)) / yCount : 0;

  return {
    padding,
    chartWidth,
    chartHeight,
    cellWidth,
    cellHeight,
    minValue,
    maxValue,
    valueRange: maxValue - minValue || 1,
    leftOffset,
    topOffset,
  };
};

// ==================== 层次聚类算法 ====================

/**
 * 计算欧氏距离
 */
const euclideanDistance = (a: number[], b: number[]): number => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

/**
 * 计算相关系数距离 (1 - |correlation|)
 */
const correlationDistance = (a: number[], b: number[]): number => {
  const n = a.length;
  let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumA += a[i];
    sumB += b[i];
    sumAB += a[i] * b[i];
    sumA2 += a[i] * a[i];
    sumB2 += b[i] * b[i];
  }
  
  const numerator = n * sumAB - sumA * sumB;
  const denominator = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
  
  if (denominator === 0) return 1;
  const correlation = numerator / denominator;
  return 1 - Math.abs(correlation);
};

/**
 * 计算曼哈顿距离
 */
const manhattanDistance = (a: number[], b: number[]): number => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
};

/**
 * 获取距离函数
 */
const getDistanceFunction = (metric: ClusteringConfig['distanceMetric']) => {
  switch (metric) {
    case 'correlation': return correlationDistance;
    case 'manhattan': return manhattanDistance;
    case 'euclidean':
    default: return euclideanDistance;
  }
};

/**
 * 层次聚类算法 (HAC - Hierarchical Agglomerative Clustering)
 */
const hierarchicalClustering = (
  data: number[][],
  distanceMetric: ClusteringConfig['distanceMetric'] = 'euclidean',
  linkageMethod: ClusteringConfig['linkageMethod'] = 'average'
): ClusterNode => {
  const n = data.length;
  if (n === 0) throw new Error('Empty data for clustering');
  
  const distanceFn = getDistanceFunction(distanceMetric);
  
  // 初始化每个样本为一个簇
  let clusters: ClusterNode[] = data.map((row, i) => ({
    id: i,
    index: i,
    height: 0,
    indices: [i],
  }));
  
  // 预计算所有距离
  const distances: number[][] = Array(n).fill(null).map(() => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      distances[i][j] = distances[j][i] = distanceFn(data[i], data[j]);
    }
  }
  
  // 簇间距离矩阵：初始时每个样本是一个簇，距离就是样本间距离
  let clusterDistances: number[][] = Array(n).fill(null).map(() => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        clusterDistances[i][j] = distances[i][j];
      }
    }
  }
  
  let nextId = n;
  
  while (clusters.length > 1) {
    // 找到距离最近的两个簇
    let minDist = Infinity;
    let minI = -1, minJ = -1;
    
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        if (clusterDistances[i][j] < minDist) {
          minDist = clusterDistances[i][j];
          minI = i;
          minJ = j;
        }
      }
    }
    
    if (minI === -1) break;
    
    const clusterI = clusters[minI];
    const clusterJ = clusters[minJ];
    
    // 合并两个簇
    const newCluster: ClusterNode = {
      id: nextId++,
      height: minDist,
      left: clusterI,
      right: clusterJ,
      indices: [...clusterI.indices, ...clusterJ.indices],
    };
    
    // 更新簇列表
    clusters = clusters.filter((_, idx) => idx !== minI && idx !== minJ);
    clusters.push(newCluster);
    
    // 更新距离矩阵
    const newClustersLen = clusters.length;
    const newDistances: number[][] = Array(newClustersLen).fill(null).map(() => Array(newClustersLen).fill(Infinity));
    
    // 找到旧簇索引到新簇索引的映射
    const indexMap = new Map<number, number>();
    clusters.forEach((c, i) => indexMap.set(c.id, i));
    
    // 复制现有簇之间的距离
    const oldClustersLen = clusterDistances.length;
    const oldIndexMap = new Map<number, number>();
    // 在过滤前创建旧索引映射
    let oldIdx = 0;
    for (let i = 0; i < oldClustersLen; i++) {
      if (i !== minI && i !== minJ) {
        oldIndexMap.set(i, oldIdx++);
      }
    }
    
    // 填充非合并簇之间的距离
    for (let i = 0; i < oldClustersLen; i++) {
      if (i === minI || i === minJ) continue;
      const newI = oldIndexMap.get(i)!;
      for (let j = 0; j < oldClustersLen; j++) {
        if (j === minI || j === minJ) continue;
        const newJ = oldIndexMap.get(j)!;
        newDistances[newI][newJ] = clusterDistances[i][j];
      }
    }
    
    // 计算新簇与其他簇的距离
    const newClusterIdx = newClustersLen - 1;
    for (let i = 0; i < clusters.length - 1; i++) {
      const dist = calculateLinkageDistance(
        clusters[i],
        newCluster,
        distances,
        linkageMethod
      );
      newDistances[i][newClusterIdx] = dist;
      newDistances[newClusterIdx][i] = dist;
    }
    
    clusterDistances = newDistances;
  }
  
  return clusters[0];
};

/**
 * 计算两个簇之间的距离（根据连接方法）
 */
const calculateLinkageDistance = (
  clusterA: ClusterNode,
  clusterB: ClusterNode,
  distances: number[][],
  method: ClusteringConfig['linkageMethod']
): number => {
  const pairs: number[] = [];
  
  for (const i of clusterA.indices) {
    for (const j of clusterB.indices) {
      pairs.push(distances[i][j]);
    }
  }
  
  switch (method) {
    case 'single':
      return Math.min(...pairs);
    case 'complete':
      return Math.max(...pairs);
    case 'ward':
      // Ward 方法近似使用平均距离
      return pairs.reduce((a, b) => a + b, 0) / pairs.length;
    case 'average':
    default:
      return pairs.reduce((a, b) => a + b, 0) / pairs.length;
  }
};

/**
 * 计算节点的深度
 */
const calculateNodeDepth = (node: ClusterNode, depth: number = 0): void => {
  node.depth = depth;
  if (node.left) calculateNodeDepth(node.left, depth + 1);
  if (node.right) calculateNodeDepth(node.right, depth + 1);
};

/**
 * 计算节点的位置（用于树状图绘制）
 */
const calculateNodePositions = (root: ClusterNode): void => {
  const leaves: ClusterNode[] = [];
  
  // 收集所有叶子节点
  const collectLeaves = (node: ClusterNode) => {
    if (!node.left && !node.right) {
      leaves.push(node);
    } else {
      if (node.left) collectLeaves(node.left);
      if (node.right) collectLeaves(node.right);
    }
  };
  
  collectLeaves(root);
  
  // 为叶子节点分配位置（在 0-1 之间均匀分布）
  const n = leaves.length;
  leaves.forEach((leaf, i) => {
    // 避免除以0：如果只有一个叶子，位置设为0.5
    leaf.position = n > 1 ? i / (n - 1) : 0.5;
  });
  
  // 为内部节点计算位置（子节点的中点）
  const calculateInternalPosition = (node: ClusterNode): number => {
    if (!node.left && !node.right) {
      // 叶子节点，位置已设置
      return node.position!;
    }
    
    let leftPos = 0;
    let rightPos = 0;
    
    if (node.left) {
      leftPos = calculateInternalPosition(node.left);
    }
    if (node.right) {
      rightPos = calculateInternalPosition(node.right);
    }
    
    // 内部节点位置是子节点的平均值
    if (node.left && node.right) {
      node.position = (leftPos + rightPos) / 2;
    } else if (node.left) {
      node.position = leftPos;
    } else if (node.right) {
      node.position = rightPos;
    }
    
    return node.position!;
  };
  
  calculateInternalPosition(root);
};

/**
 * 获取聚类顺序（从树中获取叶子节点的顺序）
 */
const getClusterOrder = (root: ClusterNode): number[] => {
  const order: number[] = [];
  
  const traverse = (node: ClusterNode) => {
    if (!node.left && !node.right) {
      if (node.index !== undefined) {
        order.push(node.index);
      }
    } else {
      if (node.left) traverse(node.left);
      if (node.right) traverse(node.right);
    }
  };
  
  traverse(root);
  return order;
};

/**
 * 执行完整聚类分析
 */
const performClustering = (
  data: HeatmapChartData,
  config: ClusteringConfig
): HierarchicalClusteringResult => {
  const { clusterRows = true, clusterCols = true, distanceMetric, linkageMethod } = config;
  
  // 提取数据矩阵
  const matrix = data.datasets[0]?.data || [];
  if (matrix.length === 0) {
    throw new Error('No data for clustering');
  }
  
  // 行聚类
  let rowTree: ClusterNode;
  let rowOrder: number[];
  
  if (clusterRows) {
    rowTree = hierarchicalClustering(matrix, distanceMetric, linkageMethod);
    calculateNodeDepth(rowTree);
    calculateNodePositions(rowTree);
    rowOrder = getClusterOrder(rowTree);
  } else {
    // 不聚类，保持原始顺序
    rowTree = {
      id: 0,
      height: 0,
      indices: matrix.map((_, i) => i),
    };
    rowOrder = matrix.map((_, i) => i);
  }
  
  // 列聚类（转置矩阵）
  let colTree: ClusterNode;
  let colOrder: number[];
  
  if (clusterCols && matrix.length > 0 && matrix[0].length > 0) {
    const colCount = matrix[0].length;
    const transposed: number[][] = [];
    
    for (let j = 0; j < colCount; j++) {
      const col: number[] = [];
      for (let i = 0; i < matrix.length; i++) {
        col.push(matrix[i][j]);
      }
      transposed.push(col);
    }
    
    colTree = hierarchicalClustering(transposed, distanceMetric, linkageMethod);
    calculateNodeDepth(colTree);
    calculateNodePositions(colTree);
    colOrder = getClusterOrder(colTree);
  } else {
    // 不聚类，保持原始顺序
    const colCount = matrix[0]?.length || 0;
    colTree = {
      id: 0,
      height: 0,
      indices: Array.from({ length: colCount }, (_, i) => i),
    };
    colOrder = Array.from({ length: colCount }, (_, i) => i);
  }
  
  return { rowTree, colTree, rowOrder, colOrder };
};

// ==================== 树状图绘制 ====================

/**
 * 绘制垂直树状图（用于行聚类，显示在左侧）
 * 
 * 布局说明：
 * - X方向：从左（根节点，距离最大）到右（叶子节点，距离=0）
 * - Y方向：position=0 对应第一行中心，position=1 对应最后一行中心
 * - 叶子节点在右侧与热力图左侧对齐
 * 
 * @param x 树状图左边界（根节点所在位置）
 * @param y 第一个叶子节点对应的Y位置（第一行中心）
 * @param width 树状图宽度
 * @param height Y方向跨度（从第一行中心到最后一行中心）
 */
const drawVerticalDendrogram = (
  ctx: CanvasRenderingContext2D,
  root: ClusterNode,
  x: number,
  y: number,
  width: number,
  height: number,
  config: ClusteringConfig
): void => {
  const { dendrogramColor = '#374151', dendrogramLineWidth = 1 } = config;
  
  ctx.save();
  ctx.strokeStyle = dendrogramColor;
  ctx.lineWidth = dendrogramLineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  // 计算最大高度用于归一化
  const maxHeight = root.height || 1;
  
  /**
   * 递归绘制节点
   * @param node 当前节点
   * @param parentNodeY 父节点的Y位置
   * @param parentHeight 父节点的高度值
   */
  const drawNode = (node: ClusterNode, parentNodeY?: number, parentHeight?: number) => {
    // 节点的X位置：叶子节点（height=0）在右侧（x+width），根节点在左侧（x）
    const nodeX = x + width - (node.height / maxHeight) * width;
    // 节点的Y位置：position=0 在 y，position=1 在 y+height
    const nodeY = y + (node.position || 0) * height;
    
    // 如果有父节点，绘制连接线
    if (parentNodeY !== undefined && parentHeight !== undefined) {
      const parentX = x + width - (parentHeight / maxHeight) * width;
      
      ctx.beginPath();
      // 从父节点位置开始
      ctx.moveTo(parentX, parentNodeY);
      // 水平延伸到当前节点高度
      ctx.lineTo(nodeX, parentNodeY);
      // 垂直延伸到当前节点Y位置
      ctx.lineTo(nodeX, nodeY);
      ctx.stroke();
    }
    
    // 递归绘制子节点
    if (node.left) {
      drawNode(node.left, nodeY, node.height);
    }
    if (node.right) {
      drawNode(node.right, nodeY, node.height);
    }
  };
  
  // 从根节点开始绘制
  if (root.left || root.right) {
    // 根节点不需要绘制连接线，从子节点开始
    if (root.left) {
      drawNode(root.left, y + (root.position || 0) * height, root.height);
    }
    if (root.right) {
      drawNode(root.right, y + (root.position || 0) * height, root.height);
    }
  }
  
  ctx.restore();
};

/**
 * 绘制水平树状图（用于列聚类，显示在顶部）
 * 
 * 布局说明：
 * - Y方向：从上（根节点，距离最大）到下（叶子节点，距离=0）
 * - X方向：position=0 对应第一列中心，position=1 对应最后一列中心
 * - 叶子节点在底部与热力图顶部对齐
 * 
 * @param x 第一个叶子节点对应的X位置（第一列中心）
 * @param y 树状图顶部（根节点所在位置）
 * @param width X方向跨度（从第一列中心到最后一列中心）
 * @param height 树状图高度
 */
const drawHorizontalDendrogram = (
  ctx: CanvasRenderingContext2D,
  root: ClusterNode,
  x: number,
  y: number,
  width: number,
  height: number,
  config: ClusteringConfig
): void => {
  const { dendrogramColor = '#374151', dendrogramLineWidth = 1 } = config;
  
  ctx.save();
  ctx.strokeStyle = dendrogramColor;
  ctx.lineWidth = dendrogramLineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  // 计算最大高度用于归一化
  const maxHeight = root.height || 1;
  
  /**
   * 递归绘制节点
   * @param node 当前节点
   * @param parentNodeX 父节点的X位置
   * @param parentHeight 父节点的高度值
   */
  const drawNode = (node: ClusterNode, parentNodeX?: number, parentHeight?: number) => {
    // 节点的X位置：position=0 在 x，position=1 在 x+width
    const nodeX = x + (node.position || 0) * width;
    // 节点的Y位置：叶子节点（height=0）在底部（y+height），根节点在顶部（y）
    const nodeY = y + height - (node.height / maxHeight) * height;
    
    // 如果有父节点，绘制连接线
    if (parentNodeX !== undefined && parentHeight !== undefined) {
      const parentY = y + height - (parentHeight / maxHeight) * height;
      
      ctx.beginPath();
      // 从父节点位置开始
      ctx.moveTo(parentNodeX, parentY);
      // 垂直延伸到当前节点高度
      ctx.lineTo(parentNodeX, nodeY);
      // 水平延伸到当前节点X位置
      ctx.lineTo(nodeX, nodeY);
      ctx.stroke();
    }
    
    // 递归绘制子节点
    if (node.left) {
      drawNode(node.left, nodeX, node.height);
    }
    if (node.right) {
      drawNode(node.right, nodeX, node.height);
    }
  };
  
  // 从根节点开始绘制
  if (root.left || root.right) {
    // 根节点不需要绘制连接线，从子节点开始
    if (root.left) {
      drawNode(root.left, x + (root.position || 0) * width, root.height);
    }
    if (root.right) {
      drawNode(root.right, x + (root.position || 0) * width, root.height);
    }
  }
  
  ctx.restore();
};

/**
 * 根据聚类顺序重新排列数据
 */
const reorderDataByClustering = (
  data: HeatmapChartData,
  rowOrder: number[],
  colOrder: number[]
): HeatmapChartData => {
  const reordered: HeatmapChartData = {
    xLabels: colOrder.map(i => data.xLabels[i]),
    yLabels: rowOrder.map(i => data.yLabels[i]),
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      data: rowOrder.map(rowIdx =>
        colOrder.map(colIdx => dataset.data[rowIdx][colIdx])
      ),
    })),
  };
  
  return reordered;
};

/**
 * 计算单元格信息
 */
const calculateCells = (
  data: HeatmapChartData,
  config: HeatmapChartConfig,
  cellSpacing: number,
  colorScale: HeatmapColorScaleConfig
): ComputedCell[] => {
  const cells: ComputedCell[] = [];
  const { leftOffset = 0, topOffset = 0, effectivePaddingLeft = 0, effectivePaddingTop = 0 } = config;

  data.datasets.forEach((dataset) => {
    dataset.data.forEach((row, yIndex) => {
      row.forEach((value, xIndex) => {
        // 热力图位置：
        // - X 起始位置 = leftOffset + effectivePaddingLeft
        // - Y 起始位置 = topOffset + effectivePaddingTop
        // 在聚类模式下，effectivePaddingLeft/effectivePaddingTop 为 0（树状图已提供缓冲）
        // 在非聚类模式下，它们等于 padding
        const x = leftOffset + effectivePaddingLeft + config.padding + xIndex * (config.cellWidth + cellSpacing);
        const y = topOffset + effectivePaddingTop + config.padding + yIndex * (config.cellHeight + cellSpacing);

        cells.push({
          x,
          y,
          width: config.cellWidth,
          height: config.cellHeight,
          value,
          color: getColorForValue(value, config.minValue, config.maxValue, colorScale),
          xLabel: data.xLabels[xIndex] || '',
          yLabel: data.yLabels[yIndex] || '',
          xIndex,
          yIndex,
        });
      });
    });
  });

  return cells;
};

/**
 * 计算密度网格
 * 将数据点映射到网格中，计算每个网格单元的密度
 */
const calculateDensityGrid = (
  points: DensityPoint[],
  gridSize: number,
  xRange: [number, number],
  yRange: [number, number],
  radius: number,
  weighted: boolean
): { grid: number[][]; maxDensity: number } => {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  
  // 初始化网格
  const grid: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(0));
  
  const cellWidth = (xMax - xMin) / gridSize;
  const cellHeight = (yMax - yMin) / gridSize;
  
  // 计算每个网格单元的密度
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cellX = xMin + (i + 0.5) * cellWidth;
      const cellY = yMin + (j + 0.5) * cellHeight;
      
      let density = 0;
      
      for (const point of points) {
        const dx = point.x - cellX;
        const dy = point.y - cellY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius) {
          // 使用高斯核函数计算权重
          const weight = weighted ? (point.value ?? 1) : 1;
          const kernelWeight = Math.exp(-(distance * distance) / (2 * (radius / 3) * (radius / 3)));
          density += weight * kernelWeight;
        }
      }
      
      grid[j][i] = density; // 注意：网格是行优先，y对应行
    }
  }
  
  // 找到最大密度用于归一化
  let maxDensity = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      maxDensity = Math.max(maxDensity, grid[i][j]);
    }
  }
  
  return { grid, maxDensity };
};

/**
 * 将密度网格转换为单元格数据
 */
const convertDensityGridToCells = (
  grid: number[][],
  maxDensity: number,
  config: HeatmapChartConfig,
  xRange: [number, number],
  yRange: [number, number],
  colorScale: HeatmapColorScaleConfig,
  densityConfig: DensityConfig
): ComputedCell[] => {
  const cells: ComputedCell[] = [];
  const gridSize = grid.length;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  
  const { minOpacity = 0.05, maxOpacity = 1 } = densityConfig;
  
  // 计算单元格尺寸
  const cellWidth = config.chartWidth / gridSize;
  const cellHeight = config.chartHeight / gridSize;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const density = grid[j][i];
      
      // 归一化密度
      const normalizedDensity = maxDensity > 0 ? density / maxDensity : 0;
      
      const x = config.padding + i * cellWidth;
      const y = config.padding + j * cellHeight;
      
      // 使用颜色比例尺获取颜色
      const color = getColorForValue(density, 0, maxDensity, colorScale);
      
      // 对于非常低的密度，使用最小透明度
      const opacity = normalizedDensity < 0.01
        ? minOpacity
        : minOpacity + normalizedDensity * (maxOpacity - minOpacity);
      
      // 将透明度编码到颜色中
      const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
      const colorWithOpacity = color + opacityHex;
      
      // 计算对应的数据范围标签
      const xLabelStart = Math.round(xMin + i * (xMax - xMin) / gridSize);
      const xLabelEnd = Math.round(xMin + (i + 1) * (xMax - xMin) / gridSize);
      const yLabelStart = Math.round(yMin + j * (yMax - yMin) / gridSize);
      const yLabelEnd = Math.round(yMin + (j + 1) * (yMax - yMin) / gridSize);
      
      cells.push({
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        value: density,
        color: colorWithOpacity,
        xLabel: `${xLabelStart}-${xLabelEnd}`,
        yLabel: `${yLabelStart}-${yLabelEnd}`,
        xIndex: i,
        yIndex: j,
      });
    }
  }
  
  return cells;
};

/**
 * 绘制连续密度热力图 - 使用径向渐变实现平滑效果
 */
const drawContinuousDensityHeatmap = (
  ctx: CanvasRenderingContext2D,
  points: DensityPoint[],
  config: HeatmapChartConfig,
  dataRange: { xRange: [number, number]; yRange: [number, number] },
  colorScale: HeatmapColorScaleConfig,
  densityConfig: DensityConfig,
  animationProgress: number
) => {
  const { padding, chartWidth, chartHeight } = config;
  const { xRange, yRange } = dataRange;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const { radius = 30 } = densityConfig;

  // 保存上下文状态
  ctx.save();

  // 创建裁剪区域限制在图表范围内
  ctx.beginPath();
  ctx.rect(padding, padding, chartWidth, chartHeight);
  ctx.clip();

  // 设置全局合成模式为 screen 或 lighter 来实现颜色叠加效果
  ctx.globalCompositeOperation = 'screen';

  // 为每个数据点绘制径向渐变
  points.forEach((point, index) => {
    // 应用动画进度
    const delay = (index / points.length) * 0.5;
    const pointProgress = Math.max(0, Math.min(1, (animationProgress - delay) / (1 - delay)));
    if (pointProgress <= 0) return;

    // 将数据坐标转换为画布坐标
    const canvasX = padding + ((point.x - xMin) / (xMax - xMin)) * chartWidth;
    const canvasY = padding + chartHeight - ((point.y - yMin) / (yMax - yMin)) * chartHeight;

    // 根据权重调整半径和强度
    const weight = point.value ?? 1;
    const pointRadius = radius * (1 + weight * 0.5) * pointProgress;
    const intensity = Math.min(1, weight * 0.8 + 0.2) * pointProgress;

    // 创建径向渐变
    const gradient = ctx.createRadialGradient(
      canvasX, canvasY, 0,
      canvasX, canvasY, pointRadius
    );

    // 添加渐变色 stops - 从中心到边缘逐渐变淡
    gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
    gradient.addColorStop(0.3, `rgba(255, 230, 100, ${intensity * 0.7})`);
    gradient.addColorStop(0.6, `rgba(255, 100, 50, ${intensity * 0.4})`);
    gradient.addColorStop(1, 'rgba(100, 0, 100, 0)');

    // 绘制渐变圆形
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, pointRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  // 恢复合成模式
  ctx.globalCompositeOperation = 'source-over';

  // 应用颜色映射
  ctx.globalCompositeOperation = 'multiply';
  
  // 创建颜色映射渐变
  const colorGradient = ctx.createLinearGradient(padding, padding + chartHeight, padding, padding);
  if (colorScale.colorStops) {
    const sortedStops = [...colorScale.colorStops].sort((a, b) => a.offset - b.offset);
    sortedStops.forEach(stop => {
      colorGradient.addColorStop(stop.offset, stop.color);
    });
  } else {
    colorGradient.addColorStop(0, colorScale.minColor);
    colorGradient.addColorStop(1, colorScale.maxColor);
  }
  
  ctx.fillStyle = colorGradient;
  ctx.fillRect(padding, padding, chartWidth, chartHeight);

  // 恢复上下文
  ctx.restore();
};

/**
 * 绘制平滑密度热力图 - 使用高精度渲染
 * 无数据区域显示白色，边缘有淡蓝色阴影溢出
 */
const drawSmoothDensityHeatmap = (
  ctx: CanvasRenderingContext2D,
  points: DensityPoint[],
  config: HeatmapChartConfig,
  dataRange: { xRange: [number, number]; yRange: [number, number] },
  colorScale: HeatmapColorScaleConfig,
  densityConfig: DensityConfig,
  animationProgress: number
) => {
  const { padding, chartWidth, chartHeight } = config;
  const { xRange, yRange } = dataRange;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const { radius = 30, gridSize = 200 } = densityConfig;

  // 使用更高的内部分辨率以获得更清晰的渲染
  const internalGridSize = Math.max(gridSize, 200);

  // 计算密度值
  const densityData = new Float32Array(internalGridSize * internalGridSize);
  let maxDensity = 0;

  // 将数据点映射到网格并计算密度
  points.forEach(point => {
    const gridX = ((point.x - xMin) / (xMax - xMin)) * (internalGridSize - 1);
    const gridY = (1 - (point.y - yMin) / (yMax - yMin)) * (internalGridSize - 1);
    const weight = (point.value ?? 1) * animationProgress;
    
    // 计算影响半径（以网格单元为单位）
    const radiusInGrid = (radius / chartWidth) * internalGridSize;
    const radiusInGridSq = radiusInGrid * radiusInGrid;
    const sigma = radiusInGrid / 2.5; // 增大sigma使边缘更柔和
    const sigmaSq = sigma * sigma;
    
    // 计算影响范围
    const startX = Math.max(0, Math.floor(gridX - radiusInGrid));
    const endX = Math.min(internalGridSize - 1, Math.ceil(gridX + radiusInGrid));
    const startY = Math.max(0, Math.floor(gridY - radiusInGrid));
    const endY = Math.min(internalGridSize - 1, Math.ceil(gridY + radiusInGrid));
    
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const dx = x - gridX;
        const dy = y - gridY;
        const distanceSq = dx * dx + dy * dy;
        
        if (distanceSq <= radiusInGridSq) {
          // 高斯核函数
          const kernel = Math.exp(-distanceSq / (2 * sigmaSq));
          const idx = y * internalGridSize + x;
          densityData[idx] += weight * kernel;
          maxDensity = Math.max(maxDensity, densityData[idx]);
        }
      }
    }
  });

  // 创建临时 canvas 用于渲染
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = internalGridSize;
  tempCanvas.height = internalGridSize;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  // 先填充白色背景
  tempCtx.fillStyle = '#ffffff';
  tempCtx.fillRect(0, 0, internalGridSize, internalGridSize);

  // 如果没有数据，只返回白色背景
  if (maxDensity === 0) {
    // 在主 canvas 上绘制白色背景
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    ctx.restore();
    return;
  }

  // 创建 ImageData 并填充颜色
  const imageData = tempCtx.createImageData(internalGridSize, internalGridSize);
  const data = imageData.data;

  // 使用非线性映射增强低密度的可见性
  // 这样边缘的淡蓝色阴影会更明显
  const densityThreshold = maxDensity * 0.02; // 极低密度阈值

  for (let y = 0; y < internalGridSize; y++) {
    for (let x = 0; x < internalGridSize; x++) {
      const idx = y * internalGridSize + x;
      const density = densityData[idx];
      
      // 归一化密度
      let normalizedDensity = density / maxDensity;
      
      // 对低密度区域进行增强，使淡蓝色边缘更明显
      if (normalizedDensity > 0 && normalizedDensity < 0.3) {
        normalizedDensity = normalizedDensity * 1.5; // 增强低密度区域
      }
      normalizedDensity = Math.min(1, normalizedDensity);
      
      // 获取颜色
      const color = getColorForValue(normalizedDensity * maxDensity, 0, maxDensity, colorScale);
      const rgb = parseColor(color);
      
      // 设置像素值
      const pixelIdx = (y * internalGridSize + x) * 4;
      data[pixelIdx] = rgb.r;
      data[pixelIdx + 1] = rgb.g;
      data[pixelIdx + 2] = rgb.b;
      data[pixelIdx + 3] = 255; // 完全不透明
    }
  }

  // 将像素数据绘制到临时 canvas
  tempCtx.putImageData(imageData, 0, 0);

  // 在主 canvas 上绘制，使用高质量平滑
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    tempCanvas,
    0, 0, internalGridSize, internalGridSize,
    padding, padding, chartWidth, chartHeight
  );
  ctx.restore();
};

/**
 * 绘制圆角矩形
 */
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

/**
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: HeatmapChartConfig,
  data: HeatmapChartData,
  gridConfig: { display?: boolean; color?: string; lineWidth?: number; opacity?: number },
  cellSpacing: number
) => {
  if (!gridConfig.display) return;

  const { padding, chartWidth, chartHeight, cellWidth, cellHeight, leftOffset = 0, topOffset = 0 } = config;
  const { xLabels, yLabels } = data;

  ctx.strokeStyle = gridConfig.color || DEFAULT_CONFIG.gridColor;
  ctx.lineWidth = gridConfig.lineWidth || 1;
  ctx.globalAlpha = gridConfig.opacity ?? 0.5;

  // 绘制垂直网格线
  xLabels.forEach((_, index) => {
    const x = leftOffset + padding + index * (cellWidth + cellSpacing);
    ctx.beginPath();
    ctx.moveTo(x, topOffset + padding);
    ctx.lineTo(x, topOffset + padding + chartHeight);
    ctx.stroke();
  });

  // 绘制水平网格线
  yLabels.forEach((_, index) => {
    const y = topOffset + padding + index * (cellHeight + cellSpacing);
    ctx.beginPath();
    ctx.moveTo(leftOffset + padding, y);
    ctx.lineTo(leftOffset + padding + chartWidth, y);
    ctx.stroke();
  });

  // 绘制外边框
  ctx.strokeRect(leftOffset + padding, topOffset + padding, chartWidth, chartHeight);

  ctx.globalAlpha = 1;
};

/**
 * 绘制坐标轴标签
 */
const drawAxisLabels = (
  ctx: CanvasRenderingContext2D,
  config: HeatmapChartConfig,
  data: HeatmapChartData,
  xAxisConfig: HeatmapProps['xAxis'],
  yAxisConfig: HeatmapProps['yAxis'],
  cellSpacing: number
) => {
  const { padding, chartWidth, chartHeight, cellWidth, cellHeight, leftOffset = 0, topOffset = 0 } = config;
  const { xLabels, yLabels } = data;

  ctx.font = `${DEFAULT_CONFIG.fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // 绘制 X 轴标签
  if (xAxisConfig?.display !== false) {
    ctx.fillStyle = xAxisConfig?.tickColor || DEFAULT_CONFIG.textColor;
    ctx.font = `${xAxisConfig?.tickFontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;

    const rotation = ((xAxisConfig?.tickRotation || 0) * Math.PI) / 180;

    xLabels.forEach((label, index) => {
      const x = leftOffset + padding + index * (cellWidth + cellSpacing) + cellWidth / 2;
      const y = topOffset + padding + chartHeight + 10;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });

    // 绘制 X 轴标题 - 放在图表底部居中
    if (xAxisConfig?.title?.text) {
      ctx.save();
      ctx.fillStyle = xAxisConfig.title.color || DEFAULT_CONFIG.textColor;
      ctx.font = `bold ${xAxisConfig.title.fontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(xAxisConfig.title.text, leftOffset + padding + chartWidth / 2, topOffset + padding + chartHeight + 35);
      ctx.restore();
    }
  }

  // 绘制 Y 轴标签
  if (yAxisConfig?.display !== false) {
    ctx.fillStyle = yAxisConfig?.tickColor || DEFAULT_CONFIG.textColor;
    ctx.font = `${yAxisConfig?.tickFontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    yLabels.forEach((label, index) => {
      const x = leftOffset + padding - 10;
      const y = topOffset + padding + index * (cellHeight + cellSpacing) + cellHeight / 2;
      ctx.fillText(label, x, y);
    });

    // 绘制 Y 轴标题 - 放在 Y 轴上方居中
    if (yAxisConfig?.title?.text) {
      ctx.save();
      ctx.fillStyle = yAxisConfig.title.color || DEFAULT_CONFIG.textColor;
      ctx.font = `bold ${yAxisConfig.title.fontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(yAxisConfig.title.text, leftOffset + padding, topOffset + padding - 10);
      ctx.restore();
    }
  }
};

/**
 * 绘制密度热力图坐标轴标签
 */
const drawDensityAxisLabels = (
  ctx: CanvasRenderingContext2D,
  config: HeatmapChartConfig,
  dataRange: { xRange: [number, number]; yRange: [number, number] },
  xAxisConfig: HeatmapProps['xAxis'],
  yAxisConfig: HeatmapProps['yAxis'],
  gridSize: number
) => {
  const { padding, chartWidth, chartHeight } = config;
  const { xRange, yRange } = dataRange;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  ctx.font = `${DEFAULT_CONFIG.fontSize}px sans-serif`;

  // 绘制 X 轴标签
  if (xAxisConfig?.display !== false) {
    ctx.fillStyle = xAxisConfig?.tickColor || DEFAULT_CONFIG.textColor;
    ctx.font = `${xAxisConfig?.tickFontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 显示5个刻度标签
    const xStep = (xMax - xMin) / 4;
    for (let i = 0; i <= 4; i++) {
      const value = xMin + i * xStep;
      const x = padding + (i / 4) * chartWidth;
      const y = padding + chartHeight + 10;
      ctx.fillText(Math.round(value).toString(), x, y);
    }

    // 绘制 X 轴标题
    if (xAxisConfig?.title?.text) {
      ctx.save();
      ctx.fillStyle = xAxisConfig.title.color || DEFAULT_CONFIG.textColor;
      ctx.font = `bold ${xAxisConfig.title.fontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(xAxisConfig.title.text, padding + chartWidth / 2, padding + chartHeight + 35);
      ctx.restore();
    }
  }

  // 绘制 Y 轴标签
  if (yAxisConfig?.display !== false) {
    ctx.fillStyle = yAxisConfig?.tickColor || DEFAULT_CONFIG.textColor;
    ctx.font = `${yAxisConfig?.tickFontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // 显示5个刻度标签
    const yStep = (yMax - yMin) / 4;
    for (let i = 0; i <= 4; i++) {
      const value = yMin + (4 - i) * yStep; // 从上到下递增
      const x = padding - 10;
      const y = padding + (i / 4) * chartHeight;
      ctx.fillText(Math.round(value).toString(), x, y);
    }

    // 绘制 Y 轴标题
    if (yAxisConfig?.title?.text) {
      ctx.save();
      ctx.fillStyle = yAxisConfig.title.color || DEFAULT_CONFIG.textColor;
      ctx.font = `bold ${yAxisConfig.title.fontSize || DEFAULT_CONFIG.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(yAxisConfig.title.text, padding, padding - 10);
      ctx.restore();
    }
  }
};

/**
 * 绘制单元格
 */
const drawCells = (
  ctx: CanvasRenderingContext2D,
  cells: ComputedCell[],
  borderRadius: number,
  animationProgress: number
) => {
  // 启用图像平滑以获得更好的渲染效果
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  cells.forEach((cell) => {
    ctx.fillStyle = cell.color;

    // 动画效果：从中心向外扩展
    const centerX = cell.x + cell.width / 2;
    const centerY = cell.y + cell.height / 2;
    const currentWidth = cell.width * animationProgress;
    const currentHeight = cell.height * animationProgress;
    const currentX = centerX - currentWidth / 2;
    const currentY = centerY - currentHeight / 2;

    if (borderRadius > 0) {
      drawRoundedRect(ctx, currentX, currentY, currentWidth, currentHeight, borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
    }
  });
  
  // 重置平滑设置
  ctx.imageSmoothingEnabled = false;
};

/**
 * 绘制单元格标签
 */
const drawCellLabels = (
  ctx: CanvasRenderingContext2D,
  cells: ComputedCell[],
  labelConfig: HeatmapProps['cellLabels'],
  config: HeatmapChartConfig
) => {
  if (!labelConfig?.display) return;

  const formatter = labelConfig.formatter || ((v: number) => v.toFixed(1));
  const minDisplayValue = labelConfig.minDisplayValue ?? -Infinity;

  ctx.font = `${labelConfig.fontSize || 11}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  cells.forEach((cell) => {
    if (cell.value < minDisplayValue) return;

    const text = formatter(cell.value);
    const x = cell.x + cell.width / 2;
    const y = cell.y + cell.height / 2;

    // 根据背景色亮度决定文字颜色
    const color = parseColor(cell.color);
    const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
    ctx.fillStyle = labelConfig.color || (brightness > 128 ? '#1f2937' : '#ffffff');

    ctx.fillText(text, x, y);
  });
};

/**
 * 查找鼠标位置对应的单元格
 */
const findCellAtPosition = (
  x: number,
  y: number,
  cells: ComputedCell[]
): ComputedCell | null => {
  for (const cell of cells) {
    if (
      x >= cell.x &&
      x <= cell.x + cell.width &&
      y >= cell.y &&
      y <= cell.y + cell.height
    ) {
      return cell;
    }
  }
  return null;
};

/**
 * 热力图组件
 */
const Heatmap: React.FC<HeatmapProps> = ({
  data,
  width = 600,
  height = 400,
  padding = DEFAULT_CONFIG.padding,
  colorScale = DEFAULT_COLOR_SCALE,
  xAxis,
  yAxis,
  grid,
  legend,
  tooltip,
  cellLabels,
  borderRadius = DEFAULT_CONFIG.borderRadius,
  cellSpacing = DEFAULT_CONFIG.cellSpacing,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  animationEnabled = true,
  densityMode = false,
  densityConfig,
  clusteringMode = false,
  clusteringConfig,
  precomputedClustering,
  className,
  style,
  onCellClick,
  onDensityClick,
  onClusteringComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationProgress, setAnimationProgress] = useState(animationEnabled ? 0 : 1);
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    xLabel: '',
    yLabel: '',
    value: 0,
    color: '',
  });

  // 合并聚类配置
  const effectiveClusteringConfig = useMemo(
    () => ({ ...DEFAULT_CLUSTERING_CONFIG, ...clusteringConfig }),
    [clusteringConfig]
  );

  // 执行聚类分析
  const clusteringResult = useMemo(() => {
    if (!clusteringMode || densityMode) return null;
    
    if (precomputedClustering) {
      return precomputedClustering;
    }
    
    try {
      const result = performClustering(data, effectiveClusteringConfig);
      onClusteringComplete?.(result);
      return result;
    } catch (error) {
      console.error('Clustering failed:', error);
      return null;
    }
  }, [clusteringMode, densityMode, data, effectiveClusteringConfig, precomputedClustering, onClusteringComplete]);

  // 根据聚类结果重新排列数据
  const reorderedData = useMemo(() => {
    if (!clusteringResult || densityMode) return data;
    return reorderDataByClustering(data, clusteringResult.rowOrder, clusteringResult.colOrder);
  }, [data, clusteringResult, densityMode]);

  // 计算布局偏移量（为树状图预留空间）
  const layoutOffsets = useMemo(() => {
    if (!clusteringMode || densityMode) {
      return { leftOffset: 0, topOffset: 0 };
    }
    
    const { dendrogramWidth, dendrogramHeight, showRowLabels, rowLabelPosition } = effectiveClusteringConfig;
    // 只有行标签在左侧时才需要预留左侧空间
    const leftLabelSpace = (showRowLabels && rowLabelPosition === 'left') ? 120 : 0;
    // leftOffset: 行树状图的宽度 + 左侧行标签空间
    const leftOffset = leftLabelSpace + (clusteringResult?.rowTree ? dendrogramWidth! : 0);
    // topOffset: 列树状图的高度 + 额外空间（用于与热力图之间的间距）
    // 注意：热力图将从 topOffset + padding 开始绘制，树状图叶子节点应该与热力图第一行对齐
    const topOffset = clusteringResult?.colTree ? dendrogramHeight! : 0;
    
    return { leftOffset, topOffset };
  }, [clusteringMode, densityMode, effectiveClusteringConfig, clusteringResult]);

  // 使用发散型颜色比例尺如果数据包含负值
  const effectiveColorScale = useMemo(() => {
    if (colorScale.diverging !== undefined) return colorScale;

    // 检查数据是否包含负值
    let hasNegative = false;
    for (const dataset of data.datasets) {
      for (const row of dataset.data) {
        for (const value of row) {
          if (value < 0) {
            hasNegative = true;
            break;
          }
        }
        if (hasNegative) break;
      }
      if (hasNegative) break;
    }

    return hasNegative ? DIVERGING_COLOR_SCALE : colorScale;
  }, [colorScale, data]);

  // 合并密度配置
  const effectiveDensityConfig = useMemo(
    () => ({ ...DEFAULT_DENSITY_CONFIG, ...densityConfig }),
    [densityConfig]
  );

  // 计算图表配置（使用重新排列后的数据）
  const config = useMemo(
    () => calculateChartConfig(reorderedData, width, height, padding, cellSpacing, layoutOffsets),
    [reorderedData, width, height, padding, cellSpacing, layoutOffsets]
  );

  // 计算数据范围（用于密度热力图）
  const dataRange = useMemo(() => {
    if (!densityMode || !data.densityPoints || data.densityPoints.length === 0) {
      return null;
    }
    
    const xRange = data.xRange || [
      Math.min(...data.densityPoints.map(p => p.x)),
      Math.max(...data.densityPoints.map(p => p.x))
    ];
    const yRange = data.yRange || [
      Math.min(...data.densityPoints.map(p => p.y)),
      Math.max(...data.densityPoints.map(p => p.y))
    ];
    
    return { xRange, yRange };
  }, [densityMode, data]);

  // 计算单元格信息
  const cells = useMemo(() => {
    if (densityMode && data.densityPoints && data.densityPoints.length > 0 && dataRange) {
      // 密度热力图模式
      const { grid, maxDensity } = calculateDensityGrid(
        data.densityPoints,
        effectiveDensityConfig.gridSize,
        dataRange.xRange,
        dataRange.yRange,
        effectiveDensityConfig.radius,
        effectiveDensityConfig.weighted
      );
      return convertDensityGridToCells(
        grid,
        maxDensity,
        config,
        dataRange.xRange,
        dataRange.yRange,
        effectiveColorScale,
        effectiveDensityConfig
      );
    }
    // 普通热力图模式（使用重新排列后的数据）
    return calculateCells(reorderedData, config, cellSpacing, effectiveColorScale);
  }, [densityMode, data, reorderedData, config, cellSpacing, effectiveColorScale, effectiveDensityConfig, dataRange]);

  // 动画效果
  useEffect(() => {
    if (!animationEnabled) {
      setAnimationProgress(1);
      return;
    }

    setAnimationProgress(0);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // 使用 easeOutCubic 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [data, animationDuration, animationEnabled]);

  // 绘制图表
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 获取布局偏移（如果有）
    const { leftOffset = 0, topOffset = 0 } = config;

    // 聚类模式下绘制树状图
    if (clusteringMode && !densityMode && clusteringResult) {
      const {
        dendrogramWidth = 100,
        dendrogramHeight = 60,
      } = effectiveClusteringConfig;
      
      // 绘制行树状图（左侧垂直）
      // 叶子节点的 position 是均匀分布的 0-1
      // 需要对应到热力图行的中心位置
      // position=0 对应第一行中心，position=1 对应最后一行中心
      if (clusteringResult.rowTree && effectiveClusteringConfig.clusterRows) {
        // 行树状图绘制区域：
        // X方向：从 leftOffset + padding - dendrogramWidth（根节点）到 leftOffset + padding（叶子节点）
        // Y方向：从第一行中心到最后一行中心
        const rowDendrogramX = leftOffset + config.padding - dendrogramWidth - 2;
        // Y起点：热力图第一行中心
        const rowDendrogramY = topOffset + config.padding + config.cellHeight / 2;
        // Y高度：从第一行中心到最后一行中心 = chartHeight - cellHeight
        const rowDendrogramHeight = config.chartHeight - config.cellHeight;
        
        drawVerticalDendrogram(
          ctx,
          clusteringResult.rowTree,
          rowDendrogramX,
          rowDendrogramY,
          dendrogramWidth,
          rowDendrogramHeight,
          effectiveClusteringConfig
        );
      }
      
      // 绘制列树状图（顶部水平）
      // 叶子节点的 position 是均匀分布的 0-1
      // 需要对应到热力图列的中心位置
      // position=0 对应第一列中心，position=1 对应最后一列中心
      if (clusteringResult.colTree && effectiveClusteringConfig.clusterCols) {
        // 列树状图绘制区域：
        // X方向：从第一列中心到最后一列中心
        // Y方向：叶子节点在底部（与热力图顶部对齐），根节点在顶部
        const colDendrogramX = leftOffset + config.padding + config.cellWidth / 2;
        // Y起点：确保叶子节点（Y = y + height）与热力图顶部（topOffset + padding）对齐
        // 即：y + dendrogramHeight = topOffset + padding
        // 所以：y = topOffset + padding - dendrogramHeight
        const colDendrogramY = topOffset + config.padding - dendrogramHeight - 2;
        // X宽度：从第一列中心到最后一列中心 = chartWidth - cellWidth
        const colDendrogramWidth = config.chartWidth - config.cellWidth;
        const colDendrogramHeight = dendrogramHeight;
        
        drawHorizontalDendrogram(
          ctx,
          clusteringResult.colTree,
          colDendrogramX,
          colDendrogramY,
          colDendrogramWidth,
          colDendrogramHeight,
          effectiveClusteringConfig
        );
      }
    }

    // 绘制网格
    drawGrid(ctx, config, reorderedData, grid || {}, cellSpacing);

    // 密度模式下使用平滑密度热力图绘制
    if (densityMode && data.densityPoints && data.densityPoints.length > 0 && dataRange) {
      // 使用平滑密度热力图绘制
      drawSmoothDensityHeatmap(
        ctx,
        data.densityPoints,
        config,
        dataRange,
        effectiveColorScale,
        effectiveDensityConfig,
        animationProgress
      );
    } else {
      // 绘制单元格（普通热力图模式）
      drawCells(ctx, cells, borderRadius, animationProgress);
    }

    // 绘制坐标轴标签
    if (densityMode && dataRange) {
      drawDensityAxisLabels(ctx, config, dataRange, xAxis, yAxis, effectiveDensityConfig.gridSize);
    } else {
      drawAxisLabels(ctx, config, reorderedData, xAxis, yAxis, cellSpacing);
    }

    // 绘制单元格数值标签（仅在普通热力图模式）
    if (!densityMode) {
      drawCellLabels(ctx, cells, cellLabels, config);
    }

    // 聚类模式下绘制行标签（最后绘制，确保不被遮挡）
    if (clusteringMode && !densityMode && clusteringResult) {
      const {
        dendrogramWidth = 100,
        showRowLabels,
        rowLabelFontSize,
        rowLabelColor,
        rowLabelPosition,
      } = effectiveClusteringConfig;
      
      // 绘制行标签（右侧或左侧）
      if (showRowLabels && reorderedData.yLabels) {
        ctx.save();
        ctx.font = `${rowLabelFontSize}px sans-serif`;
        ctx.fillStyle = rowLabelColor || '#374151';
        ctx.textBaseline = 'middle';
        
        // 标签位置：右侧（默认）或左侧
        if (rowLabelPosition === 'left') {
          ctx.textAlign = 'right';
          reorderedData.yLabels.forEach((label, index) => {
            // Y 位置需要考虑 topOffset
            const y = topOffset + config.padding + index * (config.cellHeight + cellSpacing) + config.cellHeight / 2;
            // X 位置在树状图左侧
            const x = leftOffset + config.padding - dendrogramWidth - 10;
            ctx.fillText(label, x, y);
          });
        } else {
          // 标签在右侧（与原图一致）
          ctx.textAlign = 'left';
          reorderedData.yLabels.forEach((label, index) => {
            // Y 位置需要考虑 topOffset
            const y = topOffset + config.padding + index * (config.cellHeight + cellSpacing) + config.cellHeight / 2;
            ctx.fillText(label, leftOffset + config.padding + config.chartWidth + 10, y);
          });
        }
        ctx.restore();
      }
    }
  }, [
    cells, config, reorderedData, data, grid, xAxis, yAxis, cellLabels,
    borderRadius, animationProgress, width, height, cellSpacing,
    densityMode, dataRange, effectiveDensityConfig, effectiveColorScale,
    clusteringMode, clusteringResult, effectiveClusteringConfig, layoutOffsets
  ]);

  // 鼠标移动事件处理
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (tooltip?.enabled === false) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cell = findCellAtPosition(x, y, cells);

      if (cell) {
        setTooltipState({
          visible: true,
          x: e.clientX - (containerRef.current?.getBoundingClientRect().left || 0) + 10,
          y: e.clientY - (containerRef.current?.getBoundingClientRect().top || 0) - 10,
          xLabel: cell.xLabel,
          yLabel: cell.yLabel,
          value: cell.value,
          color: cell.color,
        });
      } else {
        setTooltipState((prev) => ({ ...prev, visible: false }));
      }
    },
    [cells, tooltip]
  );

  // 鼠标离开事件处理
  const handleMouseLeave = useCallback(() => {
    setTooltipState((prev) => ({ ...prev, visible: false }));
  }, []);

  // 点击事件处理
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cell = findCellAtPosition(x, y, cells);
      if (cell) {
        if (densityMode && onDensityClick) {
          onDensityClick(cell.xIndex, cell.yIndex, cell.value);
        } else if (onCellClick) {
          onCellClick(cell.xIndex, cell.yIndex, cell.value);
        }
      }
    },
    [cells, onCellClick, onDensityClick, densityMode]
  );

  // 图例始终使用垂直方向（从上到下：最大值 -> 最小值）
  const isVerticalLegend = true;
  
  // 生成颜色比例尺背景
  const colorScaleBackground = useMemo(() => {
    const { minColor, maxColor, midColor, diverging, colorStops } = effectiveColorScale;
    
    // 始终使用垂直渐变方向（从下到上：最小值 -> 最大值）
    const direction = 'to top';
    
    // 如果有自定义颜色停止点，使用它们
    if (colorStops && colorStops.length >= 2) {
      const sortedStops = [...colorStops].sort((a, b) => a.offset - b.offset);
      // 垂直图例：反转顺序，从下到上（最小值在底部，最大值在顶部）
      const gradientStops = [...sortedStops].reverse().map(stop => `${stop.color} ${Math.round((1 - stop.offset) * 100)}%`).join(', ');
      return `linear-gradient(${direction}, ${gradientStops})`;
    }
    
    if (diverging && midColor) {
      // 垂直图例：从下到上：最小值 -> 中间值 -> 最大值
      return `linear-gradient(${direction}, ${maxColor}, ${midColor}, ${minColor})`;
    }
    // 垂直图例：从下到上：最小值 -> 最大值
    return `linear-gradient(${direction}, ${maxColor}, ${minColor})`;
  }, [effectiveColorScale]);

  // 生成图例数值标签
  const legendLabels = useMemo(() => {
    const { minValue, maxValue } = config;
    let labels: string[];
    if (effectiveColorScale.diverging) {
      const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
      labels = [`-${maxAbs.toFixed(1)}`, '0', `${maxAbs.toFixed(1)}`];
    } else {
      labels = [minValue.toFixed(1), ((minValue + maxValue) / 2).toFixed(1), maxValue.toFixed(1)];
    }
    // 垂直图例：反转标签顺序（从上到下：最大值到最小值）
    return [...labels].reverse();
  }, [config, effectiveColorScale]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsHeatmapChartContainer, className)}
      style={style}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsHeatmapChartCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* 提示框 */}
      <div
        className={classNames(styles.zcpcyChatsTooltip, {
          [styles.zcpcyChatsTooltipVisible]: tooltipState.visible,
        })}
        style={{
          left: tooltipState.x,
          top: tooltipState.y,
          backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
          borderColor: tooltip?.borderColor || 'rgba(0, 0, 0, 0.05)',
          borderWidth: tooltip?.borderWidth || 1,
          borderStyle: 'solid',
          borderRadius: tooltip?.borderRadius || 8,
          padding: tooltip?.padding || '10px 14px',
        }}
      >
        {tooltip?.customContent ? (
          <div
            dangerouslySetInnerHTML={{
              __html: tooltip.customContent(
                tooltipState.xLabel,
                tooltipState.yLabel,
                tooltipState.value
              ),
            }}
          />
        ) : (
          <>
            <div
              className={styles.zcpcyChatsTooltipTitle}
              style={{ color: tooltip?.titleColor || DEFAULT_CONFIG.tooltipTitleColor }}
            >
              {tooltipState.yLabel} × {tooltipState.xLabel}
            </div>
            <div className={styles.zcpcyChatsTooltipItem}>
              <span
                className={styles.zcpcyChatsTooltipColor}
                style={{ backgroundColor: tooltipState.color }}
              />
              <span style={{ color: tooltip?.bodyColor || DEFAULT_CONFIG.tooltipBodyColor }}>
                {tooltipState.value.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 颜色比例尺图例 - 始终垂直方向 */}
      {legend?.display !== false && (
        <div
          className={classNames(
            styles.zcpcyChatsColorScaleLegend,
            styles.zcpcyChatsColorScaleLegendVertical
          )}
          style={{
            marginTop: legend?.position === 'top' ? 0 : 8,
            marginBottom: legend?.position === 'bottom' ? 0 : 8,
          }}
        >
          <div
            className={classNames(
              styles.zcpcyChatsColorScaleBar,
              styles.zcpcyChatsColorScaleBarVertical
            )}
            style={{ background: colorScaleBackground }}
          />
          {legend?.showValues !== false && (
            <div className={classNames(
              styles.zcpcyChatsColorScaleLabels,
              styles.zcpcyChatsColorScaleLabelsVertical
            )}>
              {legendLabels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Heatmap;
