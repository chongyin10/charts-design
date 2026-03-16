/**
 * 对称条形图（BidirectionalBar）组件
 * 以坐标轴为中心，向左右两侧延伸条形的图表类型
 * 用于展示正负值数据或双向对比关系
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  BidirectionalBarProps,
  BidirectionalBarChartData,
  BidirectionalBarSignedData,
  BidirectionalBarMirrorData,
  BidirectionalBarVerticalData,
  BidirectionalBarChartConfig,
  ComputedBidirectionalBar,
  BidirectionalBarDataset,
  BidirectionalBarConfig,
  BidirectionalBarTooltipItem,
  BidirectionalBarVerticalLineConfig,
} from './BidirectionalBar.type';

/**
 * 默认配置
 */
const DEFAULT_COLORS = {
  left: '#ef4444', // red - 默认左侧颜色
  right: '#3b82f6', // blue - 默认右侧颜色
};

const DEFAULT_CONFIG = {
  padding: 60,
  borderWidth: 0,
  borderRadius: 4,
  animationDuration: 1000,
  gridColor: '#e5e7eb',
  textColor: '#6b7280',
  axisColor: '#d1d5db',
  tooltipBackground: '#ffffff',
  tooltipTitleColor: '#111827',
  tooltipBodyColor: '#374151',
  fontSize: 12,
  titleFontSize: 14,
  barHeight: 0.7,
  barSpacing: 4,
};

/**
 * 计算图表配置（左右分离模式）
 */
const calculateSplitChartConfig = (
  data: BidirectionalBarChartData,
  width: number,
  height: number,
  padding: number,
  xAxisMin?: number,
  xAxisMax?: number
): BidirectionalBarChartConfig => {
  const leftValues = data.leftData.data;
  const rightValues = data.rightData.data;

  // 计算左右两侧的最大值
  const leftMaxValue = xAxisMax ?? Math.max(...leftValues, 0);
  const rightMaxValue = xAxisMax ?? Math.max(...rightValues, 0);

  const leftValueRange = leftMaxValue || 1;
  const rightValueRange = rightMaxValue || 1;

  // 中心轴位置：图表中心
  const centerX = width / 2;

  return {
    padding,
    chartWidth: width - padding * 2,
    chartHeight: height - padding * 2,
    leftMaxValue,
    rightMaxValue,
    leftValueRange,
    rightValueRange,
    centerX,
  };
};

/**
 * 计算图表配置（正负值模式）
 */
const calculateSignedChartConfig = (
  data: BidirectionalBarSignedData,
  width: number,
  height: number,
  padding: number,
  xAxisMin?: number,
  xAxisMax?: number
): BidirectionalBarChartConfig => {
  // 计算所有数据的正负最大绝对值
  const allValues = data.datasets.flatMap((d) => d.data);
  const positiveMax = Math.max(...allValues.filter((v) => v >= 0), 0);
  const negativeMax = Math.max(...allValues.filter((v) => v < 0).map((v) => Math.abs(v)), 0);

  const leftMaxValue = xAxisMax ?? Math.max(negativeMax, 0);
  const rightMaxValue = xAxisMax ?? Math.max(positiveMax, 0);

  const leftValueRange = leftMaxValue || 1;
  const rightValueRange = rightMaxValue || 1;

  // 中心轴位置：图表中心
  const centerX = width / 2;

  return {
    padding,
    chartWidth: width - padding * 2,
    chartHeight: height - padding * 2,
    leftMaxValue,
    rightMaxValue,
    leftValueRange,
    rightValueRange,
    centerX,
  };
};

/**
 * 计算图表配置（镜像模式）
 * 标签在中间，左右两侧各自有独立的坐标轴
 */
const calculateMirrorChartConfig = (
  data: BidirectionalBarMirrorData,
  width: number,
  height: number,
  padding: number,
  xAxisMin?: number,
  xAxisMax?: number
): BidirectionalBarChartConfig => {
  const leftValues = data.leftData.data;
  const rightValues = data.rightData.data;

  // 计算左右两侧的最大值
  const leftMaxValue = xAxisMax ?? Math.max(...leftValues, 0);
  const rightMaxValue = xAxisMax ?? Math.max(...rightValues, 0);

  const leftValueRange = leftMaxValue || 1;
  const rightValueRange = rightMaxValue || 1;

  // 中心轴位置：图表中心
  const centerX = width / 2;

  return {
    padding,
    chartWidth: width - padding * 2,
    chartHeight: height - padding * 2,
    leftMaxValue,
    rightMaxValue,
    leftValueRange,
    rightValueRange,
    centerX,
  };
};

/**
 * 计算图表配置（垂直模式）
 * 标签在中间，上下两侧分别显示不同的数值
 */
const calculateVerticalChartConfig = (
  data: BidirectionalBarVerticalData,
  width: number,
  height: number,
  padding: number,
  xAxisMin?: number,
  xAxisMax?: number
): BidirectionalBarChartConfig => {
  const topValues = data.topData.data;
  const bottomValues = data.bottomData.data;

  // 计算上下两侧的最大值
  const topMaxValue = xAxisMax ?? Math.max(...topValues, 0);
  const bottomMaxValue = xAxisMax ?? Math.max(...bottomValues, 0);

  const leftValueRange = topMaxValue || 1;
  const rightValueRange = bottomMaxValue || 1;

  // 中心轴位置：图表中心
  const centerX = width / 2;
  const centerY = height / 2;

  return {
    padding,
    chartWidth: width - padding * 2,
    chartHeight: height - padding * 2,
    leftMaxValue: topMaxValue,
    rightMaxValue: bottomMaxValue,
    leftValueRange,
    rightValueRange,
    centerX,
    centerY,
  };
};

/**
 * 计算条形数据（左右分离模式）
 */
const computeSplitBars = (
  data: BidirectionalBarChartData,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  barHeight: number
): ComputedBidirectionalBar[] => {
  const { padding, chartHeight, centerX, leftValueRange, rightValueRange } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const categoryHeight = chartHeight / categoryCount;
  const effectiveBarHeight = categoryHeight * barHeight;

  const bars: ComputedBidirectionalBar[] = [];

  // 左侧条形
  const leftColor = data.leftData.backgroundColor || DEFAULT_COLORS.left;
  data.leftData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / leftValueRange;
    const barWidth = (normalizedValue * (centerX - padding)) || 0;
    const barX = centerX - barWidth;
    const barY = padding + index * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;

    bars.push({
      x: barX,
      y: barY,
      width: barWidth,
      height: effectiveBarHeight,
      value,
      label: data.labels[index] || '',
      direction: 'left',
      dataIndex: index,
      color: leftColor,
    });
  });

  // 右侧条形
  const rightColor = data.rightData.backgroundColor || DEFAULT_COLORS.right;
  data.rightData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / rightValueRange;
    const barWidth = (normalizedValue * (width - padding - centerX)) || 0;
    const barX = centerX;
    const barY = padding + index * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;

    bars.push({
      x: barX,
      y: barY,
      width: barWidth,
      height: effectiveBarHeight,
      value,
      label: data.labels[index] || '',
      direction: 'right',
      dataIndex: index,
      color: rightColor,
    });
  });

  return bars;
};

/**
 * 计算条形数据（正负值模式）
 */
const computeSignedBars = (
  data: BidirectionalBarSignedData,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  barHeight: number,
  barSpacing: number
): ComputedBidirectionalBar[][] => {
  const { padding, chartHeight, centerX, leftValueRange, rightValueRange } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const datasetCount = data.datasets.length;
  const categoryHeight = chartHeight / categoryCount;
  const groupHeight = categoryHeight * barHeight;
  const singleBarHeight = (groupHeight - (datasetCount - 1) * barSpacing) / datasetCount;

  return data.datasets.map((dataset, datasetIndex) => {
    const color = dataset.backgroundColor || DEFAULT_COLORS.right;

    return dataset.data.map((value, dataIndex) => {
      const isNegative = value < 0;
      const normalizedValue = Math.abs(value) / (isNegative ? leftValueRange : rightValueRange);
      const barWidth = isNegative
        ? normalizedValue * (centerX - padding)
        : normalizedValue * (width - padding - centerX);
      const barX = isNegative ? centerX - barWidth : centerX;
      const groupStartY = padding + dataIndex * categoryHeight + (categoryHeight - groupHeight) / 2;
      const barY = groupStartY + datasetIndex * (singleBarHeight + barSpacing);

      return {
        x: barX,
        y: barY,
        width: barWidth || 0,
        height: singleBarHeight,
        value,
        label: data.labels[dataIndex] || '',
        direction: isNegative ? 'left' : 'right',
        dataIndex,
        color,
      };
    });
  });
};

/**
 * 计算条形数据（镜像模式）
 * 标签在中间，左右两侧分别显示不同的数值
 */
const computeMirrorBars = (
  data: BidirectionalBarMirrorData,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  barHeight: number
): ComputedBidirectionalBar[] => {
  const { padding, chartHeight, centerX, leftValueRange, rightValueRange } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const categoryHeight = chartHeight / categoryCount;
  const effectiveBarHeight = categoryHeight * barHeight;

  const bars: ComputedBidirectionalBar[] = [];

  // 中间标签区域宽度（左右条形之间的间隙）
  const labelGap = 80;
  const halfLabelGap = labelGap / 2;

  // 左侧条形 - 从中心左侧向左延伸，留出中间间隙
  const leftColor = data.leftData.backgroundColor || DEFAULT_COLORS.left;
  data.leftData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / leftValueRange;
    const availableWidth = centerX - padding - halfLabelGap;
    const barWidth = (normalizedValue * availableWidth) || 0;
    const barX = centerX - halfLabelGap - barWidth;
    const barY = padding + index * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;

    bars.push({
      x: barX,
      y: barY,
      width: barWidth,
      height: effectiveBarHeight,
      value,
      label: data.labels[index] || '',
      direction: 'left',
      dataIndex: index,
      color: leftColor,
    });
  });

  // 右侧条形 - 从中心右侧向右延伸，留出中间间隙
  const rightColor = data.rightData.backgroundColor || DEFAULT_COLORS.right;
  data.rightData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / rightValueRange;
    const availableWidth = width - padding - centerX - halfLabelGap;
    const barWidth = (normalizedValue * availableWidth) || 0;
    const barX = centerX + halfLabelGap;
    const barY = padding + index * categoryHeight + (categoryHeight - effectiveBarHeight) / 2;

    bars.push({
      x: barX,
      y: barY,
      width: barWidth,
      height: effectiveBarHeight,
      value,
      label: data.labels[index] || '',
      direction: 'right',
      dataIndex: index,
      color: rightColor,
    });
  });

  return bars;
};

/**
 * 计算条形数据（垂直模式）
 * 标签在中间，上下两侧分别显示不同的数值
 */
const computeVerticalBars = (
  data: BidirectionalBarVerticalData,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  barHeight: number
): ComputedBidirectionalBar[] => {
  const { padding, chartWidth, centerX, centerY = height / 2, leftValueRange, rightValueRange } = config;
  const categoryCount = Math.max(1, data.labels.length);
  const categoryWidth = chartWidth / categoryCount;
  const effectiveBarWidth = categoryWidth * barHeight;

  const bars: ComputedBidirectionalBar[] = [];

  // 中间标签区域高度（上下条形之间的间隙）
  const labelGap = 60;
  const halfLabelGap = labelGap / 2;

  // 上方条形 - 从中心向上延伸，留出中间间隙
  const topColor = data.topData.backgroundColor || DEFAULT_COLORS.left;
  data.topData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / leftValueRange;
    const availableHeight = centerY - padding - halfLabelGap;
    const barHeightValue = (normalizedValue * availableHeight) || 0;
    const barX = padding + index * categoryWidth + (categoryWidth - effectiveBarWidth) / 2;
    const barY = centerY - halfLabelGap - barHeightValue;

    bars.push({
      x: barX,
      y: barY,
      width: effectiveBarWidth,
      height: barHeightValue,
      value,
      label: data.labels[index] || '',
      direction: 'left', // 使用 left 表示上方
      dataIndex: index,
      color: topColor,
    });
  });

  // 下方条形 - 从中心向下延伸，留出中间间隙
  const bottomColor = data.bottomData.backgroundColor || DEFAULT_COLORS.right;
  data.bottomData.data.forEach((value, index) => {
    const normalizedValue = Math.abs(value) / rightValueRange;
    const availableHeight = height - padding - centerY - halfLabelGap;
    const barHeightValue = (normalizedValue * availableHeight) || 0;
    const barX = padding + index * categoryWidth + (categoryWidth - effectiveBarWidth) / 2;
    const barY = centerY + halfLabelGap;

    bars.push({
      x: barX,
      y: barY,
      width: effectiveBarWidth,
      height: barHeightValue,
      value,
      label: data.labels[index] || '',
      direction: 'right', // 使用 right 表示下方
      dataIndex: index,
      color: bottomColor,
    });
  });

  return bars;
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
  radius: number | number[]
): void => {
  let tl: number, tr: number, br: number, bl: number;

  if (Array.isArray(radius)) {
    [tl, tr, br, bl] = radius;
  } else {
    tl = tr = br = bl = radius;
  }

  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
};

/**
 * 绘制网格线
 */
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  labels: string[],
  textColor: string,
  fontSize: number,
  xAxisTitle?: string,
  yAxisTitle?: string,
  xAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
  yAxisGrid?: { display?: boolean; color?: string; lineWidth?: number; opacity?: number; vertical?: boolean; horizontal?: boolean },
  yAxisTickInterval?: number,
  isMirrorMode?: boolean,
  isVerticalMode?: boolean
): void => {
  const { padding, chartHeight, chartWidth, centerX, centerY = height / 2, leftMaxValue, rightMaxValue } = config;

  const showGrid = xAxisGrid?.display !== false || yAxisGrid?.display !== false;
  const defaultGridColor = '#e5e7eb';
  const defaultLineWidth = 1;
  const defaultOpacity = 1;

  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;

  // 垂直模式下，绘制逻辑与水平模式不同
  if (isVerticalMode) {
    // 垂直模式下，labels 在 X 轴（水平方向排列）
    const categoryCount = Math.max(1, labels.length);
    const categoryWidth = chartWidth / categoryCount;
    const tickInterval = Math.max(1, yAxisTickInterval || 1);

    // 中间标签区域高度
    const labelGap = 60;
    const halfLabelGap = labelGap / 2;

    // 绘制 X 轴标签（分类标签）- 显示在中心
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    labels.forEach((label, index) => {
      if (index % tickInterval !== 0) return;
      const x = padding + index * categoryWidth + categoryWidth / 2;
      ctx.fillText(label, x, centerY);
    });

    // 绘制 Y 轴标签（数值标签）- 上下对称，都在左侧显示
    const yGridCount = 5;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // 计算对称刻度的最大基准值（取上下最大值的较大者）
    const maxValue = Math.max(leftMaxValue, rightMaxValue);
    // 计算美观的刻度间隔（向上取整到合适的整数）
    const rawStep = maxValue / yGridCount;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalizedStep = rawStep / magnitude;
    let step: number;
    if (normalizedStep <= 1) step = magnitude;
    else if (normalizedStep <= 2) step = 2 * magnitude;
    else if (normalizedStep <= 5) step = 5 * magnitude;
    else step = 10 * magnitude;

    // 上方标签（从中心轴向外：0 -> step -> 2*step ...）
    for (let i = 0; i <= yGridCount; i++) {
      const ratio = i / yGridCount;
      // 从中心上方留出 labelGap 空间开始绘制，0 刻度在 labels 上边缘
      const y = centerY - halfLabelGap - ratio * (centerY - halfLabelGap - padding);
      const value = i * step;
      ctx.fillText(value.toString(), padding - 8, y);
    }

    // 下方标签（从中心轴向外：0 -> step -> 2*step ...）
    // 保持 textAlign = 'right'，与上方标签一致，都在左侧显示
    for (let i = 0; i <= yGridCount; i++) {
      const ratio = i / yGridCount;
      // 从中心下方留出 labelGap 空间开始绘制，0 刻度在 labels 下边缘
      const y = centerY + halfLabelGap + ratio * (height - padding - centerY - halfLabelGap);
      const value = i * step;
      ctx.fillText(value.toString(), padding - 8, y);
    }

    // 绘制垂直网格线
    const showVerticalGrid = xAxisGrid?.vertical !== false && showGrid;
    if (showVerticalGrid) {
      ctx.save();
      ctx.strokeStyle = xAxisGrid?.color || defaultGridColor;
      ctx.lineWidth = xAxisGrid?.lineWidth || defaultLineWidth;
      ctx.globalAlpha = xAxisGrid?.opacity ?? defaultOpacity;

      labels.forEach((_, index) => {
        const x = padding + index * categoryWidth;
        ctx.beginPath();
        // 垂直模式下，垂直网格线分成两段，中间留出 labels 区域
        ctx.moveTo(x, padding);
        ctx.lineTo(x, centerY - halfLabelGap);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, centerY + halfLabelGap);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      });
      ctx.restore();
    }

    // 绘制水平网格线
    const showHorizontalGrid = yAxisGrid?.horizontal !== false && showGrid;
    if (showHorizontalGrid) {
      ctx.save();
      ctx.strokeStyle = yAxisGrid?.color || defaultGridColor;
      ctx.lineWidth = yAxisGrid?.lineWidth || defaultLineWidth;
      ctx.globalAlpha = yAxisGrid?.opacity ?? defaultOpacity;

      // 上方水平网格线
      for (let i = 0; i <= yGridCount; i++) {
        const ratio = i / yGridCount;
        const y = centerY - halfLabelGap - ratio * (centerY - halfLabelGap - padding);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // 下方水平网格线
      for (let i = 0; i <= yGridCount; i++) {
        const ratio = i / yGridCount;
        const y = centerY + halfLabelGap + ratio * (height - padding - centerY - halfLabelGap);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    return;
  }

  // 水平模式（原有逻辑）
  // 绘制 Y 轴标签（分类标签）
  const categoryHeight = chartHeight / Math.max(1, labels.length);
  const tickInterval = Math.max(1, yAxisTickInterval || 1);

  // 镜像模式下，标签显示在中心轴位置
  if (isMirrorMode) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    labels.forEach((label, index) => {
      if (index % tickInterval !== 0) return;
      const y = padding + index * categoryHeight + categoryHeight / 2;
      ctx.fillText(label, centerX, y);
    });
  } else {
    // 普通模式下，标签显示在左侧
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    labels.forEach((label, index) => {
      if (index % tickInterval !== 0) return;
      const y = padding + index * categoryHeight + categoryHeight / 2;
      ctx.fillText(label, padding - 8, y);
    });
  }

  // 绘制 X 轴标签（数值标签）- 左右对称
  const xGridCount = 5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // 计算对称刻度的最大基准值（取左右最大值的较大者）
  const maxValue = Math.max(leftMaxValue, rightMaxValue);
  // 计算美观的刻度间隔（向上取整到合适的整数）
  const rawStep = maxValue / xGridCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalizedStep = rawStep / magnitude;
  let step: number;
  if (normalizedStep <= 1) step = magnitude;
  else if (normalizedStep <= 2) step = 2 * magnitude;
  else if (normalizedStep <= 5) step = 5 * magnitude;
  else step = 10 * magnitude;

  // 镜像模式下中间的 labels 区域宽度
  const labelGap = isMirrorMode ? 80 : 0;
  const halfLabelGap = labelGap / 2;

  // 左侧标签（从中心轴向外：0 -> step -> 2*step ...）
  for (let i = 0; i <= xGridCount; i++) {
    const ratio = i / xGridCount;
    // 镜像模式下，从中心左侧留出 labelGap 空间开始绘制，0 刻度在 labels 左边缘
    const x = isMirrorMode
      ? centerX - halfLabelGap - ratio * (centerX - halfLabelGap - padding)
      : centerX - ratio * (centerX - padding);
    const value = i * step;
    ctx.fillText(value.toString(), x, height - padding + 8);
  }

  // 右侧标签（从中心轴向外：0 -> step -> 2*step ...）
  for (let i = 0; i <= xGridCount; i++) {
    const ratio = i / xGridCount;
    // 镜像模式下，从中心右侧留出 labelGap 空间开始绘制，0 刻度在 labels 右边缘
    const x = isMirrorMode
      ? centerX + halfLabelGap + ratio * (width - padding - centerX - halfLabelGap)
      : centerX + ratio * (width - padding - centerX);
    const value = i * step;
    ctx.fillText(value.toString(), x, height - padding + 8);
  }

  // 绘制水平网格线
  const showHorizontalGrid = yAxisGrid?.horizontal !== false && showGrid;
  if (showHorizontalGrid) {
    ctx.save();
    ctx.strokeStyle = yAxisGrid?.color || defaultGridColor;
    ctx.lineWidth = yAxisGrid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = yAxisGrid?.opacity ?? defaultOpacity;

    // 镜像模式下中间的 labels 区域宽度
    const labelGap = isMirrorMode ? 80 : 0;
    const halfLabelGap = labelGap / 2;

    labels.forEach((_, index) => {
      const y = padding + index * categoryHeight;
      ctx.beginPath();
      if (isMirrorMode) {
        // 镜像模式下，水平网格线分成两段，中间留出 labels 区域
        ctx.moveTo(padding, y);
        ctx.lineTo(centerX - halfLabelGap, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + halfLabelGap, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      } else {
        // 普通模式，水平网格线贯穿整个图表
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // 绘制垂直网格线
  const showVerticalGrid = xAxisGrid?.vertical !== false && showGrid;
  if (showVerticalGrid) {
    ctx.save();
    ctx.strokeStyle = xAxisGrid?.color || yAxisGrid?.color || defaultGridColor;
    ctx.lineWidth = xAxisGrid?.lineWidth || yAxisGrid?.lineWidth || defaultLineWidth;
    ctx.globalAlpha = xAxisGrid?.opacity ?? yAxisGrid?.opacity ?? defaultOpacity;

    // 镜像模式下中间的 labels 区域宽度
    const labelGap = isMirrorMode ? 80 : 0;
    const halfLabelGap = labelGap / 2;

    // 左侧垂直网格线
    for (let i = 0; i <= xGridCount; i++) {
      const ratio = i / xGridCount;
      // 镜像模式下，从中心左侧留出 labelGap 空间开始绘制
      const x = isMirrorMode
        ? centerX - halfLabelGap - ratio * (centerX - halfLabelGap - padding)
        : centerX - ratio * (centerX - padding);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // 右侧垂直网格线
    for (let i = 0; i <= xGridCount; i++) {
      const ratio = i / xGridCount;
      // 镜像模式下，从中心右侧留出 labelGap 空间开始绘制
      const x = isMirrorMode
        ? centerX + halfLabelGap + ratio * (width - padding - centerX - halfLabelGap)
        : centerX + ratio * (width - padding - centerX);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
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
    ctx.fillText(yAxisTitle, padding, padding - 10);
    ctx.restore();
  }
};

/**
 * 绘制坐标轴
 */
const drawAxes = (
  ctx: CanvasRenderingContext2D,
  config: BidirectionalBarChartConfig,
  width: number,
  height: number,
  axisColor: string
): void => {
  const { padding, centerX } = config;

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 2;

  // X 轴
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // 中心轴（Y轴）
  ctx.beginPath();
  ctx.moveTo(centerX, padding);
  ctx.lineTo(centerX, height - padding);
  ctx.stroke();

  // 左边界
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();

  // 右边界
  ctx.beginPath();
  ctx.moveTo(width - padding, padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
};

/**
 * 绘制条形
 */
const drawBar = (
  ctx: CanvasRenderingContext2D,
  bar: ComputedBidirectionalBar,
  animationProgress: number,
  borderRadius: number | number[],
  centerX: number,
  isMirrorMode?: boolean
): void => {
  const animatedWidth = bar.width * animationProgress;
  let animatedX: number;

  if (isMirrorMode) {
    // 镜像模式：条形从实际位置开始（已经在 computeMirrorBars 中计算好）
    animatedX = bar.x;
  } else {
    // 普通模式：左侧条形从中心轴向左延伸，右侧从中心轴向右延伸
    if (bar.direction === 'left') {
      animatedX = centerX - animatedWidth;
    } else {
      animatedX = centerX;
    }
  }

  ctx.fillStyle = bar.color;
  drawRoundedRect(ctx, animatedX, bar.y, animatedWidth, bar.height, borderRadius);
  ctx.fill();
};

/**
 * 绘制数据标签
 */
const drawDataLabels = (
  ctx: CanvasRenderingContext2D,
  bars: ComputedBidirectionalBar[],
  animationProgress: number,
  dataLabelConfig: BidirectionalBarConfig['dataLabel'],
  defaultTextColor: string,
  defaultFontSize: number,
  centerX: number
): void => {
  if (!dataLabelConfig?.display) return;

  const color = dataLabelConfig.color || defaultTextColor;
  const fontSize = dataLabelConfig.fontSize || defaultFontSize;
  const offset = dataLabelConfig.offset ?? 6;
  const formatter = dataLabelConfig.formatter || ((value: number) => value.toString());

  ctx.fillStyle = color;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'middle';

  bars.forEach((bar) => {
    if (animationProgress < 1) return;

    const text = formatter(bar.value);
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;

    let labelX: number;
    if (bar.direction === 'left') {
      // 左侧条形：标签显示在条形左侧
      labelX = bar.x - offset - textWidth;
      ctx.textAlign = 'right';
    } else {
      // 右侧条形：标签显示在条形右侧
      labelX = bar.x + bar.width + offset;
      ctx.textAlign = 'left';
    }

    const labelY = bar.y + bar.height / 2;
    ctx.fillText(text, labelX, labelY);
  });
};

/**
 * 绘制高亮条形
 */
const drawHighlightedBar = (
  ctx: CanvasRenderingContext2D,
  bar: ComputedBidirectionalBar,
  borderRadius: number | number[]
): void => {
  ctx.save();
  ctx.fillStyle = bar.color;
  ctx.globalAlpha = 0.9;
  drawRoundedRect(ctx, bar.x, bar.y, bar.width, bar.height, borderRadius);
  ctx.fill();

  // 添加白色边框效果
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
};

/**
 * 对称条形图组件
 */
export const BidirectionalBar: React.FC<BidirectionalBarProps> = ({
  data,
  signedData,
  mirrorData,
  verticalData,
  width: propWidth = 600,
  height: propHeight = 400,
  padding = DEFAULT_CONFIG.padding,
  xAxis,
  yAxis,
  legend,
  tooltip,
  bar,
  verticalLine,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  mode = 'split',
  className,
  style,
  onDataClick,
  onChartReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<ComputedBidirectionalBar | null>(null);
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);
  const barsRef = useRef<ComputedBidirectionalBar[]>([]);
  const hoveredDataIndexRef = useRef<number | null>(null);

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
  const chartConfig = useMemo(() => {
    if (mode === 'signed' && signedData) {
      return calculateSignedChartConfig(signedData, width, height, padding, xAxis?.min, xAxis?.max);
    } else if (mode === 'mirror' && mirrorData) {
      return calculateMirrorChartConfig(mirrorData, width, height, padding, xAxis?.min, xAxis?.max);
    } else if (mode === 'vertical' && verticalData) {
      return calculateVerticalChartConfig(verticalData, width, height, padding, xAxis?.min, xAxis?.max);
    } else if (data) {
      return calculateSplitChartConfig(data, width, height, padding, xAxis?.min, xAxis?.max);
    }
    return null;
  }, [data, signedData, mirrorData, verticalData, width, height, padding, mode, xAxis?.min, xAxis?.max]);

  // 计算条形数据
  const bars = useMemo(() => {
    if (!chartConfig) return [];

    if (mode === 'signed' && signedData) {
      const signedBars = computeSignedBars(
        signedData,
        chartConfig,
        width,
        height,
        bar?.height ?? DEFAULT_CONFIG.barHeight,
        bar?.spacing ?? DEFAULT_CONFIG.barSpacing
      );
      return signedBars.flat();
    } else if (mode === 'mirror' && mirrorData) {
      return computeMirrorBars(
        mirrorData,
        chartConfig,
        width,
        height,
        bar?.height ?? DEFAULT_CONFIG.barHeight
      );
    } else if (mode === 'vertical' && verticalData) {
      return computeVerticalBars(
        verticalData,
        chartConfig,
        width,
        height,
        bar?.height ?? DEFAULT_CONFIG.barHeight
      );
    } else if (data) {
      return computeSplitBars(
        data,
        chartConfig,
        width,
        height,
        bar?.height ?? DEFAULT_CONFIG.barHeight
      );
    }
    return [];
  }, [data, signedData, mirrorData, verticalData, chartConfig, width, height, mode, bar?.height, bar?.spacing]);

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
  }, [animationDuration, data, signedData, mirrorData]);

  // 绘制图表
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !chartConfig) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 获取标签
    const labels = mode === 'signed' && signedData
      ? signedData.labels
      : mode === 'mirror' && mirrorData
        ? mirrorData.labels
        : mode === 'vertical' && verticalData
          ? verticalData.labels
          : data?.labels || [];
    const isMirrorMode = mode === 'mirror';
    const isVerticalMode = mode === 'vertical';

    // 绘制网格
    drawGrid(
      ctx,
      chartConfig,
      width,
      height,
      labels,
      yAxis?.tickColor || DEFAULT_CONFIG.textColor,
      yAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
      xAxis?.display !== false ? xAxis?.title?.text : undefined,
      yAxis?.display !== false ? yAxis?.title?.text : undefined,
      xAxis?.grid,
      yAxis?.grid,
      yAxis?.tickInterval,
      isMirrorMode,
      isVerticalMode
    );

    // 绘制坐标轴（mirror 和 vertical 模式下不绘制中心轴线）
    if (!isMirrorMode && !isVerticalMode) {
      drawAxes(ctx, chartConfig, width, height, xAxis?.grid?.color || DEFAULT_CONFIG.axisColor);
    }

    // 绘制条形
    bars.forEach((barItem) => {
      drawBar(
        ctx,
        barItem,
        animationProgress,
        bar?.borderRadius ?? DEFAULT_CONFIG.borderRadius,
        chartConfig.centerX,
        isMirrorMode || isVerticalMode
      );
    });

    // 绘制数据标签
    drawDataLabels(
      ctx,
      bars,
      animationProgress,
      bar?.dataLabel,
      yAxis?.tickColor || DEFAULT_CONFIG.textColor,
      yAxis?.tickFontSize || DEFAULT_CONFIG.fontSize,
      chartConfig.centerX
    );

    // 绘制高亮条形
    if (hoveredBar && animationProgress >= 1) {
      drawHighlightedBar(
        ctx,
        hoveredBar,
        bar?.borderRadius ?? DEFAULT_CONFIG.borderRadius
      );
    }

    // 绘制水平线/垂直线（verticalLine 模式下）
    if (verticalLine?.enabled && hoveredDataIndex !== null && animationProgress >= 1) {
      const { padding: p, chartHeight, chartWidth, centerX, centerY = height / 2 } = chartConfig;
      const labelsLength = labels.length;
      const categoryCount = Math.max(1, labelsLength);

      ctx.save();
      ctx.strokeStyle = verticalLine.color || '#999';
      ctx.lineWidth = verticalLine.lineWidth || 1;
      if (verticalLine.dash && verticalLine.dash.length > 0) {
        ctx.setLineDash(verticalLine.dash);
      }

      if (isVerticalMode) {
        // 垂直模式下，绘制垂直线（在分类之间）
        const categoryWidth = chartWidth / categoryCount;
        const lineX = p + hoveredDataIndex * categoryWidth + categoryWidth / 2;

        // 垂直模式下中间的 labels 区域高度
        const labelGap = 60;
        const halfLabelGap = labelGap / 2;

        // 上方垂直线
        ctx.beginPath();
        ctx.moveTo(lineX, p);
        ctx.lineTo(lineX, centerY - halfLabelGap);
        ctx.stroke();
        // 下方垂直线
        ctx.beginPath();
        ctx.moveTo(lineX, centerY + halfLabelGap);
        ctx.lineTo(lineX, height - p);
        ctx.stroke();
      } else {
        // 水平模式下，绘制水平线
        const categoryHeight = chartHeight / categoryCount;
        const lineY = p + hoveredDataIndex * categoryHeight + categoryHeight / 2;

        // 镜像模式下中间的 labels 区域宽度
        const labelGap = isMirrorMode ? 80 : 0;
        const halfLabelGap = labelGap / 2;

        // 绘制水平线（在双向条形图中，水平线横跨左右两侧）
        if (isMirrorMode) {
          // 镜像模式下，线条在 labels 区域断开
          // 左侧水平线
          ctx.beginPath();
          ctx.moveTo(p, lineY);
          ctx.lineTo(centerX - halfLabelGap, lineY);
          ctx.stroke();
          // 右侧水平线
          ctx.beginPath();
          ctx.moveTo(centerX + halfLabelGap, lineY);
          ctx.lineTo(width - p, lineY);
          ctx.stroke();
        } else {
          // 普通模式，水平线贯穿整个图表
          ctx.beginPath();
          ctx.moveTo(p, lineY);
          ctx.lineTo(width - p, lineY);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 绘制 verticalLine 模式下该分类的所有条形高亮效果
      const barsInCategory = bars.filter(b => b.dataIndex === hoveredDataIndex);
      barsInCategory.forEach((barItem) => {
        ctx.save();
        ctx.fillStyle = barItem.color;
        ctx.globalAlpha = 0.9;
        drawRoundedRect(ctx, barItem.x, barItem.y, barItem.width, barItem.height, bar?.borderRadius ?? DEFAULT_CONFIG.borderRadius);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });
    }

    // 保存计算的数据用于交互
    barsRef.current = bars;

    if (isLoading) {
      setIsLoading(false);
      onChartReady?.();
    }
  }, [
    data,
    signedData,
    mirrorData,
    width,
    height,
    padding,
    chartConfig,
    bars,
    xAxis,
    yAxis,
    legend,
    bar,
    verticalLine,
    animationProgress,
    hoveredBar,
    hoveredDataIndex,
    isLoading,
    onChartReady,
    mode,
  ]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || animationProgress < 1) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const isVerticalMode = mode === 'vertical';

      // verticalLine 模式：根据位置查找最近的数据索引
      if (verticalLine?.enabled && chartConfig) {
        const { padding: p, chartHeight, chartWidth } = chartConfig;
        const labels = mode === 'signed' && signedData
          ? signedData.labels
          : mode === 'mirror' && mirrorData
            ? mirrorData.labels
            : mode === 'vertical' && verticalData
              ? verticalData.labels
              : data?.labels || [];
        const labelsLength = labels.length;
        const categoryCount = Math.max(1, labelsLength);

        let dataIndex: number;
        let barsInCategory: ComputedBidirectionalBar[];
        let closestBar: ComputedBidirectionalBar | null = null;

        if (isVerticalMode) {
          // 垂直模式：根据 X 轴位置查找最近的数据索引
          const categoryWidth = chartWidth / categoryCount;
          const relativeX = x - p;
          dataIndex = Math.floor(relativeX / categoryWidth);
          dataIndex = Math.max(0, Math.min(dataIndex, categoryCount - 1));

          hoveredDataIndexRef.current = dataIndex;
          setHoveredDataIndex(dataIndex);

          // 在 verticalLine 模式下，查找该分类下的所有条形
          barsInCategory = barsRef.current.filter(b => b.dataIndex === dataIndex);
          // 选择鼠标位置最近的条形（根据 X 距离）
          let minDistance = Infinity;
          barsInCategory.forEach((barItem) => {
            const barCenterX = barItem.x + barItem.width / 2;
            const distance = Math.abs(x - barCenterX);
            if (distance < minDistance) {
              minDistance = distance;
              closestBar = barItem;
            }
          });
        } else {
          // 水平模式：根据 Y 轴位置查找最近的数据索引
          const categoryHeight = chartHeight / categoryCount;
          const relativeY = y - p;
          dataIndex = Math.floor(relativeY / categoryHeight);
          dataIndex = Math.max(0, Math.min(dataIndex, categoryCount - 1));

          hoveredDataIndexRef.current = dataIndex;
          setHoveredDataIndex(dataIndex);

          // 在 verticalLine 模式下，查找该分类下的所有条形
          barsInCategory = barsRef.current.filter(b => b.dataIndex === dataIndex);
          // 选择鼠标位置最近的条形（根据 Y 距离）
          let minDistance = Infinity;
          barsInCategory.forEach((barItem) => {
            const barCenterY = barItem.y + barItem.height / 2;
            const distance = Math.abs(y - barCenterY);
            if (distance < minDistance) {
              minDistance = distance;
              closestBar = barItem;
            }
          });
        }
        setHoveredBar(closestBar);
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        canvas.style.cursor = 'pointer';
        return;
      }

      // 普通模式：查找鼠标下的条形
      let closestBar: ComputedBidirectionalBar | null = null;

      barsRef.current.forEach((barItem) => {
        if (
          x >= barItem.x &&
          x <= barItem.x + barItem.width &&
          y >= barItem.y &&
          y <= barItem.y + barItem.height
        ) {
          closestBar = barItem;
        }
      });

      setHoveredBar(closestBar);
      hoveredDataIndexRef.current = null;
      setHoveredDataIndex(null);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      // 更改鼠标样式
      canvas.style.cursor = closestBar ? 'pointer' : 'default';
    },
    [animationProgress, chartConfig, mode, signedData, mirrorData, verticalData, data, verticalLine?.enabled]
  );

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setHoveredBar(null);
    hoveredDataIndexRef.current = null;
    setHoveredDataIndex(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  }, []);

  // 处理点击
  const handleClick = useCallback(() => {
    if (!hoveredBar || !onDataClick) return;
    onDataClick(hoveredBar.direction, hoveredBar.dataIndex, hoveredBar.value);
  }, [hoveredBar, onDataClick]);

  // 生成提示框内容
  const tooltipContent = useMemo(() => {
    // verticalLine 模式：显示该分类的所有数据
    if (verticalLine?.enabled && hoveredDataIndex !== null) {
      const labels = mode === 'signed' && signedData
        ? signedData.labels
        : mode === 'mirror' && mirrorData
          ? mirrorData.labels
          : mode === 'vertical' && verticalData
            ? verticalData.labels
            : data?.labels || [];
      const label = labels[hoveredDataIndex] || '';

      const items: BidirectionalBarTooltipItem[] = [];

      if (mode === 'signed' && signedData) {
        signedData.datasets.forEach((dataset, index) => {
          const value = dataset.data[hoveredDataIndex];
          if (value !== undefined) {
            items.push({
              label: dataset.label,
              value,
              color: dataset.backgroundColor || DEFAULT_COLORS.right,
              direction: value >= 0 ? 'right' : 'left',
            });
          }
        });
      } else if (mode === 'mirror' && mirrorData) {
        const leftValue = mirrorData.leftData.data[hoveredDataIndex];
        const rightValue = mirrorData.rightData.data[hoveredDataIndex];
        if (leftValue !== undefined) {
          items.push({
            label: mirrorData.leftData.label,
            value: leftValue,
            color: mirrorData.leftData.backgroundColor || DEFAULT_COLORS.left,
            direction: 'left',
          });
        }
        if (rightValue !== undefined) {
          items.push({
            label: mirrorData.rightData.label,
            value: rightValue,
            color: mirrorData.rightData.backgroundColor || DEFAULT_COLORS.right,
            direction: 'right',
          });
        }
      } else if (mode === 'vertical' && verticalData) {
        const topValue = verticalData.topData.data[hoveredDataIndex];
        const bottomValue = verticalData.bottomData.data[hoveredDataIndex];
        if (topValue !== undefined) {
          items.push({
            label: verticalData.topData.label,
            value: topValue,
            color: verticalData.topData.backgroundColor || DEFAULT_COLORS.left,
            direction: 'left', // 使用 left 表示上方
          });
        }
        if (bottomValue !== undefined) {
          items.push({
            label: verticalData.bottomData.label,
            value: bottomValue,
            color: verticalData.bottomData.backgroundColor || DEFAULT_COLORS.right,
            direction: 'right', // 使用 right 表示下方
          });
        }
      } else if (data) {
        const leftValue = data.leftData.data[hoveredDataIndex];
        const rightValue = data.rightData.data[hoveredDataIndex];
        if (leftValue !== undefined) {
          items.push({
            label: data.leftData.label,
            value: leftValue,
            color: data.leftData.backgroundColor || DEFAULT_COLORS.left,
            direction: 'left',
          });
        }
        if (rightValue !== undefined) {
          items.push({
            label: data.rightData.label,
            value: rightValue,
            color: data.rightData.backgroundColor || DEFAULT_COLORS.right,
            direction: 'right',
          });
        }
      }

      return {
        dataIndex: hoveredDataIndex,
        label,
        title: label,
        items,
      };
    }

    // 普通模式：显示单个条形的数据
    if (!hoveredBar) return null;

    const items: BidirectionalBarTooltipItem[] = [{
      label: hoveredBar.direction === 'left'
        ? (mode === 'signed' && signedData ? signedData.datasets[0].label
          : mode === 'mirror' && mirrorData ? mirrorData.leftData.label
          : mode === 'vertical' && verticalData ? verticalData.topData.label
          : data?.leftData.label || '左侧')
        : (mode === 'signed' && signedData ? signedData.datasets[0].label
          : mode === 'mirror' && mirrorData ? mirrorData.rightData.label
          : mode === 'vertical' && verticalData ? verticalData.bottomData.label
          : data?.rightData.label || '右侧'),
      value: hoveredBar.value,
      color: hoveredBar.color,
      direction: hoveredBar.direction,
    }];

    return {
      dataIndex: hoveredBar.dataIndex,
      label: hoveredBar.label,
      title: hoveredBar.label,
      items,
    };
  }, [hoveredBar, hoveredDataIndex, data, signedData, mirrorData, verticalData, mode, verticalLine?.enabled]);

  // 获取图例数据
  const legendItems = useMemo(() => {
    if (mode === 'signed' && signedData) {
      return signedData.datasets.map((dataset, index) => ({
        label: dataset.label,
        color: dataset.backgroundColor || (index === 0 ? DEFAULT_COLORS.right : DEFAULT_COLORS.left),
      }));
    } else if (mode === 'mirror' && mirrorData) {
      return [
        {
          label: mirrorData.leftData.label,
          color: mirrorData.leftData.backgroundColor || DEFAULT_COLORS.left,
        },
        {
          label: mirrorData.rightData.label,
          color: mirrorData.rightData.backgroundColor || DEFAULT_COLORS.right,
        },
      ];
    } else if (mode === 'vertical' && verticalData) {
      return [
        {
          label: verticalData.topData.label,
          color: verticalData.topData.backgroundColor || DEFAULT_COLORS.left,
        },
        {
          label: verticalData.bottomData.label,
          color: verticalData.bottomData.backgroundColor || DEFAULT_COLORS.right,
        },
      ];
    } else if (data) {
      return [
        {
          label: data.leftData.label,
          color: data.leftData.backgroundColor || DEFAULT_COLORS.left,
        },
        {
          label: data.rightData.label,
          color: data.rightData.backgroundColor || DEFAULT_COLORS.right,
        },
      ];
    }
    return [];
  }, [data, signedData, mirrorData, verticalData, mode]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsBidirectionalBarContainer, className)}
      style={style}
    >
      {/* 图例区域 */}
      {legend?.display !== false && legendItems.length > 0 && (
        <div
          className={styles.zcpcyChatsLegend}
          style={{
            justifyContent: 'center',
            marginBottom: legend?.position === 'bottom' ? 0 : 12,
            marginTop: legend?.position === 'top' ? 0 : 12,
            order: legend?.position === 'bottom' ? 2 : 0,
          }}
        >
          {legendItems.map((item, index) => (
            <div
              key={index}
              className={styles.zcpcyChatsLegendItem}
            >
              <span
                className={styles.zcpcyChatsLegendColor}
                style={{ backgroundColor: item.color }}
              />
              <span style={{ color: legend?.labelColor || '#374151', fontSize: legend?.labelFontSize || 12 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsBidirectionalBarCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* 提示框 */}
      {tooltip?.enabled !== false && tooltipContent && (
        (verticalLine?.enabled ? hoveredDataIndex !== null : hoveredBar !== null)
      ) && (
        <div
          className={classNames(styles.zcpcyChatsTooltip, styles.zcpcyChatsTooltipVisible)}
          style={{
            left: tooltipPos.x + (verticalLine?.enabled ? 15 : 10),
            top: tooltipPos.y - (verticalLine?.enabled ? 0 : 40),
            transform: verticalLine?.enabled ? 'translate(0, -50%)' : 'translate(0, 0)',
            backgroundColor: tooltip?.backgroundColor || DEFAULT_CONFIG.tooltipBackground,
          }}
        >
          {tooltip?.customContent ? (
            tooltip.customContent({
              dataIndex: tooltipContent.dataIndex,
              label: tooltipContent.label,
              items: tooltipContent.items,
            })
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && <div className={styles.zcpcyChatsLoading}>加载中...</div>}
    </div>
  );
};

export default BidirectionalBar;
