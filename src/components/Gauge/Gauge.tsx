/**
 * 仪表盘组件
 * 用于展示数据的进度、比例或比较情况
 * 支持半圆和整圆两种类型，可自定义颜色、刻度、指针等
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  GaugeProps,
  GaugeData,
  GaugeChartConfig,
  ComputedAxis,
  ComputedProgress,
  ComputedPointer,
  ComputedPivot,
  ComputedText,
  ComputedRange,
  ComputedPanel,
  GaugeGeometry,
} from './Gauge.type';

/**
 * 默认颜色配置
 */
const DEFAULT_COLORS = {
  progress: ['#10b981'], // green theme
  background: '#d1d5db',
  text: '#10b981',
  title: '#6b7280',
  axis: '#9ca3af',
  pointer: '#10b981',
  pivot: '#10b981',
  ranges: [],
};

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<GaugeChartConfig> = {
  width: 300,
  height: 200,
  padding: 20,
  startAngle: 180,
  endAngle: 0,
  type: 'semi',
  radius: 0.75,
  axis: {
    min: 0,
    max: 100,
    lineColor: '#9ca3af',
    lineWidth: 1,
    labelColor: '#6b7280',
    labelFontSize: 12,
    labelFormatter: (value: number) => value.toString(),
    tickVisible: true,
    tickInterval: 20,
    subTickCount: 4,
  },
  progress: {
    width: 8,
    color: '#3b82f6',
    backgroundColor: '#e5e7eb',
    rounded: true,
    shadow: false,
  },
  pointer: {
    length: 0.75,
    width: 2,
    color: '#10b981',
    visible: true,
    tailLength: 0.1,
  },
  pivot: {
    radius: 10,
    color: '#10b981',
    visible: true,
  },
  valueText: {
    format: '{value}',
    fontSize: 28,
    color: '#374151',
    fontWeight: 400,
    visible: true,
    offsetY: -70,
  },
  titleText: {
    format: '{name}',
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 400,
    visible: true,
    offsetY: -35,
  },
  panel: {
    visible: true,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
    borderRadius: 8,
    waveEnabled: false,
    wave: {
      amplitude: 4,
      period: 0.03,
      color: ['#3b82f6', '#60a5fa', '#93c5fd'],
      opacity: 0.3,
      speed: 0.015,
      direction: 1,
      layers: 3,
    },
  },
  ranges: [],
  animationDuration: 1000,
  animation: true,
  responsive: true,
};

/**
 * 角度转弧度
 */
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * 弧度转角度
 */
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * 计算坐标轴配置
 */
const computeAxisConfig = (config?: GaugeChartConfig['axis']): ComputedAxis => {
  const axis = { ...DEFAULT_CONFIG.axis, ...config };
  return {
    min: axis.min!,
    max: axis.max!,
    lineColor: axis.lineColor!,
    lineWidth: axis.lineWidth!,
    labelColor: axis.labelColor!,
    labelFontSize: axis.labelFontSize!,
    labelFormatter: axis.labelFormatter!,
    tickVisible: axis.tickVisible!,
    tickInterval: axis.tickInterval!,
    subTickCount: axis.subTickCount!,
  };
};

/**
 * 计算进度条配置
 */
const computeProgressConfig = (config?: GaugeChartConfig['progress']): ComputedProgress => {
  const progress = { ...DEFAULT_CONFIG.progress, ...config };
  const colors: string[] = [];
  if (progress.color) {
    if (Array.isArray(progress.color)) {
      colors.push(...progress.color);
    } else {
      colors.push(progress.color);
    }
  } else {
    colors.push(DEFAULT_CONFIG.progress.color as string);
  }
  return {
    width: progress.width!,
    colors,
    backgroundColor: progress.backgroundColor!,
    rounded: progress.rounded!,
    shadow: progress.shadow!,
  };
};

/**
 * 计算指针配置
 */
const computePointerConfig = (config?: GaugeChartConfig['pointer']): ComputedPointer => {
  const pointer = { ...DEFAULT_CONFIG.pointer, ...config };
  return {
    length: pointer.length!,
    width: pointer.width!,
    color: pointer.color!,
    visible: pointer.visible!,
    tailLength: pointer.tailLength!,
  };
};

/**
 * 计算中心点配置
 */
const computePivotConfig = (config?: GaugeChartConfig['pivot']): ComputedPivot => {
  const pivot = { ...DEFAULT_CONFIG.pivot, ...config };
  return {
    radius: pivot.radius!,
    color: pivot.color!,
    visible: pivot.visible!,
  };
};

/**
 * 计算中心点半径（基于指针像素长度的 1/3）
 * pointerLength: 指针相对半径的比例 (0-1)
 * radius: 仪表盘半径（像素）
 */
const computePivotRadius = (pointerLength: number, pointerWidth: number, radius: number): number => {
  // 指针像素长度
  const pointerPixelLength = pointerLength * radius;
  // 中心点半径为指针长度的 1/3，最大不超过6px
  return Math.min(pointerPixelLength * 0.33, 6);
};

/**
 * 计算文本配置
 */
const computeTextConfig = (config?: GaugeChartConfig['valueText']): ComputedText => {
  const text = { ...DEFAULT_CONFIG.valueText, ...config };
  return {
    format: text.format!,
    fontSize: text.fontSize!,
    color: text.color!,
    fontWeight: text.fontWeight!,
    visible: text.visible!,
    offsetY: text.offsetY!,
  };
};

/**
 * 计算面板配置
 */
const computePanelConfig = (config?: GaugeChartConfig['panel']): ComputedPanel => {
  const panel = { ...DEFAULT_CONFIG.panel, ...config };
  const wave = { ...DEFAULT_CONFIG.panel.wave, ...panel.wave };
  
  let colors: string[];
  if (Array.isArray(wave.color)) {
    colors = wave.color.filter((c): c is string => typeof c === 'string');
  } else if (typeof wave.color === 'string') {
    colors = [wave.color, wave.color];
  } else {
    colors = ['#3b82f6', '#60a5fa', '#93c5fd'];
  }

  return {
    visible: panel.visible!,
    backgroundColor: panel.backgroundColor!,
    borderColor: panel.borderColor!,
    borderWidth: panel.borderWidth!,
    borderRadius: panel.borderRadius!,
    waveEnabled: panel.waveEnabled!,
    wave: {
      amplitude: wave.amplitude!,
      period: wave.period!,
      colors,
      opacity: wave.opacity!,
      speed: wave.speed!,
      direction: wave.direction!,
      layers: wave.layers!,
      phase: 0,
    },
  };
};

/**
 * 计算标题配置
 */
const computeTitleConfig = (config?: GaugeChartConfig['titleText']): ComputedText => {
  const text = { ...DEFAULT_CONFIG.titleText, ...config };
  return {
    format: text.format!,
    fontSize: text.fontSize!,
    color: text.color!,
    fontWeight: text.fontWeight!,
    visible: text.visible!,
    offsetY: text.offsetY!,
  };
};

/**
 * 计算区间配置
 */
const computeRanges = (
  ranges: GaugeChartConfig['ranges'],
  axis: ComputedAxis,
  geometry: GaugeGeometry
): ComputedRange[] => {
  if (!ranges || ranges.length === 0) return [];

  const { startAngle, endAngle } = geometry;
  const angleRange = endAngle - startAngle;
  const valueRange = axis.max - axis.min;

  return ranges.map((range) => {
    const ratioFrom = (range.from - axis.min) / valueRange;
    const ratioTo = (range.to - axis.min) / valueRange;
    return {
      ...range,
      startAngle: startAngle + ratioFrom * angleRange,
      endAngle: startAngle + ratioTo * angleRange,
    };
  });
};

/**
 * 计算几何配置
 */
const computeGeometry = (
  width: number,
  height: number,
  padding: number,
  config: Required<GaugeChartConfig>
): GaugeGeometry => {
  const centerX = width / 2;
  const centerY = config.type === 'semi' ? height - padding : height / 2;
  const minDim = Math.min(width, height * 2);
  const radius = (minDim / 2 - padding) * config.radius;
  const innerRadius = radius - config.progress!.width!;

  let startAngle = toRad(config.startAngle);
  let endAngle = toRad(config.endAngle);

  if (config.type === 'semi') {
    startAngle = Math.PI; // 180度，左边
    endAngle = Math.PI * 2; // 360度（等同于0度），形成上半圆
  }

  return {
    centerX,
    centerY,
    radius,
    innerRadius,
    startAngle,
    endAngle,
    angleRange: endAngle - startAngle,
  };
};

/**
 * 值转角度
 */
const valueToAngle = (value: number, axis: ComputedAxis, geometry: GaugeGeometry): number => {
  const ratio = (value - axis.min) / (axis.max - axis.min);
  return geometry.startAngle + ratio * geometry.angleRange;
};

/**
 * 绘制弧形路径
 */
const drawArc = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  counterClockwise: boolean = false
): void => {
  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
};

/**
 * 绘制圆角弧形条带
 */
const drawRoundedArc = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  width: number,
  startAngle: number,
  endAngle: number
): void => {
  const innerRadius = radius - width;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
  ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
  ctx.closePath();
};

/**
 * 绘制刻度线
 */
const drawTicks = (
  ctx: CanvasRenderingContext2D,
  geometry: GaugeGeometry,
  axis: ComputedAxis,
  progressWidth: number
): void => {
  if (!axis.tickVisible) return;

  const { centerX, centerY, radius, startAngle, angleRange } = geometry;
  const tickRadius = radius + 8;
  const valueRange = axis.max - axis.min;

  ctx.save();
  ctx.fillStyle = axis.labelColor;
  ctx.font = `${axis.labelFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = axis.lineColor;
  ctx.lineWidth = axis.lineWidth;

  // 主刻度
  const tickCount = Math.floor(valueRange / axis.tickInterval) + 1;
  for (let i = 0; i < tickCount; i++) {
    const value = axis.min + i * axis.tickInterval;
    const ratio = i * axis.tickInterval / valueRange;
    const angle = startAngle + ratio * angleRange;

    // 刻度线
    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * tickRadius;
    const y2 = centerY + Math.sin(angle) * tickRadius;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 刻度标签 - 放在扇形外围更远处
    const labelRadius = radius + 28;
    const labelX = centerX + Math.cos(angle) * labelRadius;
    const labelY = centerY + Math.sin(angle) * labelRadius;
    ctx.fillText(axis.labelFormatter(value), labelX, labelY);

    // 次刻度
    if (i < tickCount - 1 && axis.subTickCount > 0) {
      const subTickInterval = axis.tickInterval / (axis.subTickCount + 1);
      for (let j = 1; j <= axis.subTickCount; j++) {
        const subValue = value + j * subTickInterval;
        const subRatio = (subValue - axis.min) / valueRange;
        const subAngle = startAngle + subRatio * angleRange;

        const sx1 = centerX + Math.cos(subAngle) * radius;
        const sy1 = centerY + Math.sin(subAngle) * radius;
        const sx2 = centerX + Math.cos(subAngle) * (radius + 4);
        const sy2 = centerY + Math.sin(subAngle) * (radius + 4);

        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
};

/**
 * 绘制区间颜色
 */
const drawRanges = (
  ctx: CanvasRenderingContext2D,
  geometry: GaugeGeometry,
  ranges: ComputedRange[],
  progressWidth: number
): void => {
  if (ranges.length === 0) return;

  const { centerX, centerY, radius } = geometry;
  const innerRadius = radius - progressWidth;

  ctx.save();
  ranges.forEach((range) => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, range.startAngle, range.endAngle, false);
    ctx.arc(centerX, centerY, innerRadius, range.endAngle, range.startAngle, true);
    ctx.closePath();
    ctx.fillStyle = range.color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.restore();
};

/**
 * 绘制进度条背景
 */
const drawProgressBackground = (
  ctx: CanvasRenderingContext2D,
  geometry: GaugeGeometry,
  progress: ComputedProgress
): void => {
  const { centerX, centerY, radius, startAngle, endAngle } = geometry;

  ctx.save();
  if (progress.rounded) {
    drawRoundedArc(ctx, centerX, centerY, radius, progress.width, startAngle, endAngle);
  } else {
    const innerRadius = radius - progress.width;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
  }
  ctx.fillStyle = progress.backgroundColor;
  ctx.fill();
  ctx.restore();
};

/**
 * 绘制进度条
 */
const drawProgress = (
  ctx: CanvasRenderingContext2D,
  geometry: GaugeGeometry,
  progress: ComputedProgress,
  currentAngle: number
): void => {
  const { centerX, centerY, radius, startAngle } = geometry;

  ctx.save();
  if (progress.rounded) {
    drawRoundedArc(ctx, centerX, centerY, radius, progress.width, startAngle, currentAngle);
  } else {
    const innerRadius = radius - progress.width;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle, false);
    ctx.arc(centerX, centerY, innerRadius, currentAngle, startAngle, true);
    ctx.closePath();
  }

  // 渐变颜色
  if (progress.colors.length > 1) {
    const gradient = ctx.createConicGradient(startAngle + Math.PI / 2, centerX, centerY);
    progress.colors.forEach((color, index) => {
      gradient.addColorStop(index / (progress.colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = progress.colors[0] || DEFAULT_COLORS.progress[0];
  }

  if (progress.shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
  }

  ctx.fill();
  ctx.restore();
};

/**
 * 绘制指针 - 细线样式，带末端圆环
 */
const drawPointer = (
  ctx: CanvasRenderingContext2D,
  geometry: GaugeGeometry,
  pointer: ComputedPointer,
  angle: number
): void => {
  if (!pointer.visible) return;

  const { centerX, centerY, radius } = geometry;
  // 指针长度为圆半径的 85%
  const pointerLength = radius * 1;

  const tipX = centerX + Math.cos(angle) * pointerLength;
  const tipY = centerY + Math.sin(angle) * pointerLength;

  ctx.save();
  ctx.strokeStyle = pointer.color;
  ctx.lineWidth = pointer.width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.restore();
};

/**
 * 绘制中心点 - 空心圆样式
 */
const drawPivot = (
  ctx: CanvasRenderingContext2D,
  geometry: GaugeGeometry,
  pivot: ComputedPivot,
  pointer: ComputedPointer
): void => {
  if (!pivot.visible) return;

  const { centerX, centerY } = geometry;
  // 空心圆环半径
  const outerRadius = 10;
  const innerRadius = 6;

  ctx.save();
  ctx.strokeStyle = pivot.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 中心实心圆点
  ctx.fillStyle = pivot.color;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * 绘制文本
 */
const drawText = (
  ctx: CanvasRenderingContext2D,
  geometry: GaugeGeometry,
  textConfig: ComputedText,
  data: GaugeData,
  axis: ComputedAxis,
  suffix: string = ''
): void => {
  if (!textConfig.visible) return;

  const { centerX, centerY, radius } = geometry;
  const percent = Math.round(((data.value - axis.min) / (axis.max - axis.min)) * 100);

  let text = textConfig.format
    .replace('{value}', String(data.value))
    .replace('{percent}', String(percent))
    .replace('{name}', data.name || '')
    .replace('{unit}', data.unit || '');

  ctx.save();
  ctx.fillStyle = textConfig.color;
  // 根据仪表盘半径动态计算字体大小
  const baseFontSize = textConfig.fontSize || 28;
  const scaledFontSize = Math.min(baseFontSize, Math.max(14, radius * 0.35));
  ctx.font = `${textConfig.fontWeight} ${scaledFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 使用配置的 offsetY 定位文本
  ctx.fillText(text, centerX, centerY + textConfig.offsetY);
  ctx.restore();
};

/**
 * 绘制面板背景（支持水波动画）
 */
const drawPanelBackground = (
  ctx: CanvasRenderingContext2D,
  panelX: number,
  panelY: number,
  panelWidth: number,
  panelHeight: number,
  panelConfig: ComputedPanel,
  wavePhase: number
): void => {
  const { backgroundColor, borderColor, borderWidth, borderRadius, waveEnabled, wave } = panelConfig;

  ctx.save();

  // 创建面板裁剪区域
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, borderRadius);
  ctx.clip();

  // 绘制基础背景
  ctx.fillStyle = backgroundColor;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, borderRadius);
  ctx.fill();

  // 绘制水波动画背景
  if (waveEnabled) {
    const waveY = panelY + panelHeight * 0.6;

    wave.colors.forEach((color, index) => {
      const layerPhase = wavePhase + (index * Math.PI) / wave.layers;
      const layerAmplitude = wave.amplitude * (1 - index * 0.2);
      const layerOpacity = wave.opacity * (1 - index * 0.15);

      ctx.beginPath();
      ctx.moveTo(panelX, panelY + panelHeight);

      for (let x = 0; x <= panelWidth; x += 2) {
        const normalizedX = x - panelWidth / 2;
        const y =
          waveY +
          Math.sin(normalizedX * wave.period + layerPhase) * layerAmplitude +
          Math.sin(normalizedX * wave.period * 1.5 + layerPhase * 0.8) * (layerAmplitude * 0.5);
        ctx.lineTo(panelX + x, y);
      }

      ctx.lineTo(panelX + panelWidth, panelY + panelHeight);
      ctx.closePath();

      ctx.globalAlpha = layerOpacity;
      ctx.fillStyle = color;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // 绘制面板边框
  if (borderWidth > 0) {
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, borderRadius);
    ctx.stroke();
    ctx.restore();
  }
};

/**
 * 绘制信息面板（包含 value、name、unit 的 div 区域）
 * 返回面板的几何信息，用于动画
 */
const drawInfoPanel = (
  ctx: CanvasRenderingContext2D,
  geometry: GaugeGeometry,
  data: GaugeData,
  valueText: ComputedText,
  titleText: ComputedText,
  axis: ComputedAxis,
  panelConfig: ComputedPanel,
  wavePhase: number = 0
): { panelX: number; panelY: number; panelWidth: number; panelHeight: number } | null => {
  if (!panelConfig.visible) return null;

  const { centerX, centerY, radius } = geometry;
  const { name, unit } = data;

  // 计算内容尺寸
  ctx.save();

  // value 字体大小
  const valueBaseFontSize = valueText.fontSize || 28;
  const valueFontSize = Math.min(valueBaseFontSize, Math.max(14, radius * 0.35));

  // title（name）字体大小
  const titleBaseFontSize = titleText.fontSize || 14;
  const titleFontSize = Math.min(titleBaseFontSize, Math.max(10, radius * 0.18));

  // unit 字体大小
  const unitFontSize = valueFontSize * 0.5;

  // 计算文本尺寸 - 使用最大值来固定面板宽度，避免抖动
  ctx.font = `${valueText.fontWeight} ${valueFontSize}px sans-serif`;
  const maxValue = axis?.max ?? 100;
  const maxValueText = String(Math.round(maxValue));
  const maxValueTextWidth = ctx.measureText(maxValueText).width;
  // 计算当前 value 的实际宽度
  const currentValueText = String(data.value);
  const valueTextWidth = ctx.measureText(currentValueText).width;

  ctx.font = `${valueText.fontWeight} ${unitFontSize}px sans-serif`;
  const unitTextWidth = unit ? ctx.measureText(unit).width : 0;

  ctx.font = `${titleText.fontWeight} ${titleFontSize}px sans-serif`;
  const nameTextWidth = name ? ctx.measureText(name).width : 0;

  // 计算面板尺寸
  const paddingX = radius * 0.15;
  const paddingY = radius * 0.1;
  const gapBetweenLines = radius * 0.08;

  const contentWidth = Math.max(maxValueTextWidth + unitTextWidth + (unit ? 8 : 0), nameTextWidth);
  const panelWidth = contentWidth + paddingX * 2;
  const panelHeight = valueFontSize + titleFontSize + gapBetweenLines + paddingY * 2;

  // 面板位置（中心点上方）
  const panelX = centerX - panelWidth / 2;
  const panelY = centerY - radius * 0.45 - panelHeight / 2;

  // 绘制面板背景（支持水波动画）
  drawPanelBackground(ctx, panelX, panelY, panelWidth, panelHeight, panelConfig, wavePhase);

  // 绘制 value 和 unit
  // 计算 value + unit 组合的总宽度，使它们在面板中水平居中
  const valueUnitGap = unit ? 4 : 0;
  const valueUnitTotalWidth = valueTextWidth + unitTextWidth + valueUnitGap;
  const valueY = panelY + paddingY + valueFontSize * 0.7;
  const valueX = centerX - valueUnitTotalWidth / 2 + valueTextWidth;

  ctx.fillStyle = valueText.color;
  ctx.font = `${valueText.fontWeight} ${valueFontSize}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(String(data.value), valueX, valueY);

  // 绘制 unit（如果有）
  if (unit) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = `${valueText.fontWeight} ${unitFontSize}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(unit, valueX + valueUnitGap, valueY);
  }

  // 绘制 name（如果有）
  if (name) {
    const nameY = valueY + gapBetweenLines + titleFontSize * 0.8;
    ctx.fillStyle = titleText.color;
    ctx.font = `${titleText.fontWeight} ${titleFontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(name, centerX, nameY);
  }

  ctx.restore();

  // 返回面板几何信息
  return { panelX, panelY, panelWidth, panelHeight };
};

/**
 * 仪表盘组件
 */
export const Gauge: React.FC<GaugeProps> = ({
  data,
  config = {},
  className,
  style,
  onChange,
  onClick,
  onReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const prevValueRef = useRef<number>(0);
  const panelWavePhaseRef = useRef<number>(0);
  const panelAnimationRef = useRef<number>(0);

  // 响应式尺寸状态
  const [containerSize, setContainerSize] = useState({
    width: config.width || DEFAULT_CONFIG.width,
    height: config.height || DEFAULT_CONFIG.height,
  });

  const isResponsive = config.responsive !== false;

  // 初始化 prevValueRef，使第一次动画从正确的值开始
  useEffect(() => {
    prevValueRef.current = data.value;
  }, []);

  // 使用 ResizeObserver 监听容器大小变化
  useEffect(() => {
    if (!isResponsive) return;

    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let rafId: number | null = null;

    const updateSize = (newWidth: number, newHeight: number) => {
      if (!isMounted) return;
      const width = Math.max(newWidth, 100);
      const height = Math.max(newHeight, 80);
      setContainerSize({ width, height });
    };

    const debouncedUpdateSize = (width: number, height: number) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        if (isMounted) {
          updateSize(width, height);
        }
      }, 100);
    };

    // 初始计算 - 使用 requestAnimationFrame 确保 DOM 已准备好
    rafId = requestAnimationFrame(() => {
      if (!isMounted || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const initialWidth = config.width || rect.width || DEFAULT_CONFIG.width;
      const initialHeight = config.height || rect.height || DEFAULT_CONFIG.height;
      updateSize(initialWidth, initialHeight);
    });

    // 创建 ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!isMounted) return;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        debouncedUpdateSize(width, height);
      }
    });

    resizeObserver.observe(container);

    // 监听窗口大小变化
    const handleResize = () => {
      if (!isMounted || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      debouncedUpdateSize(rect.width, rect.height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isResponsive]);

  // 使用容器尺寸或传入的尺寸
  const width = isResponsive ? containerSize.width : (config.width || DEFAULT_CONFIG.width);
  const height = isResponsive ? containerSize.height : (config.height || DEFAULT_CONFIG.height);

  // 计算配置
  const computedConfig = useMemo(() => {
    const mergedConfig: Required<GaugeChartConfig> = {
      ...DEFAULT_CONFIG,
      ...config,
      axis: { ...DEFAULT_CONFIG.axis, ...config.axis },
      progress: { ...DEFAULT_CONFIG.progress, ...config.progress },
      pointer: { ...DEFAULT_CONFIG.pointer, ...config.pointer },
      pivot: { ...DEFAULT_CONFIG.pivot, ...config.pivot },
      valueText: { ...DEFAULT_CONFIG.valueText, ...config.valueText },
      titleText: { ...DEFAULT_CONFIG.titleText, ...config.titleText },
      panel: { ...DEFAULT_CONFIG.panel, ...config.panel },
    };

    return {
      axis: computeAxisConfig(mergedConfig.axis),
      progress: computeProgressConfig(mergedConfig.progress),
      pointer: computePointerConfig(mergedConfig.pointer),
      pivot: computePivotConfig(mergedConfig.pivot),
      valueText: computeTextConfig(mergedConfig.valueText),
      titleText: computeTitleConfig(mergedConfig.titleText),
      panel: computePanelConfig(mergedConfig.panel),
      animationDuration: mergedConfig.animationDuration,
      animation: mergedConfig.animation,
      type: mergedConfig.type,
      startAngle: mergedConfig.startAngle,
      endAngle: mergedConfig.endAngle,
      radius: mergedConfig.radius,
      padding: mergedConfig.padding,
    };
  }, [config]);

  // 计算几何信息
  const geometry = useMemo(() => {
    return computeGeometry(width, height, computedConfig.padding, {
      ...DEFAULT_CONFIG,
      ...config,
      type: computedConfig.type,
      radius: computedConfig.radius,
      padding: computedConfig.padding,
      startAngle: computedConfig.startAngle,
      endAngle: computedConfig.endAngle,
    } as Required<GaugeChartConfig>);
  }, [width, height, computedConfig, config]);

  // 计算区间
  const ranges = useMemo(() => {
    return computeRanges(config.ranges, computedConfig.axis, geometry);
  }, [config.ranges, computedConfig.axis, geometry]);

  // 动画效果
  useEffect(() => {
    let rafId: number;
    let isActive = true;

    if (!computedConfig.animation) {
      setAnimationProgress((data.value - computedConfig.axis.min) / (computedConfig.axis.max - computedConfig.axis.min));
      setIsAnimationComplete(true);
      prevValueRef.current = data.value;
      onReady?.();
      return;
    }

    const startValue = prevValueRef.current;
    const endValue = data.value;
    const startTime = Date.now();
    
    const animate = () => {
      if (!isActive) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / computedConfig.animationDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      // 计算当前值：从 startValue 过渡到 endValue
      const currentValue = startValue + (endValue - startValue) * eased;
      // 归一化到 0-1 范围用于绘制
      const normalizedProgress = (currentValue - computedConfig.axis.min) / (computedConfig.axis.max - computedConfig.axis.min);
      setAnimationProgress(normalizedProgress);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setIsAnimationComplete(true);
        prevValueRef.current = endValue;
        onReady?.();
      }
    };

    setIsAnimationComplete(false);
    rafId = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      // 动画被中断时，保存当前值作为下次动画的起点
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / computedConfig.animationDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * eased;
      prevValueRef.current = currentValue;
    };
  }, [data.value, computedConfig.animation, computedConfig.animationDuration, onReady, computedConfig.axis]);

  // 绘制图表
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const { axis, progress, pointer, pivot, valueText, titleText } = computedConfig;
    // animationProgress 现在是当前值相对于最大值的比例
    const currentValue = (axis.max - axis.min) * animationProgress + axis.min;
    const currentAngle = valueToAngle(currentValue, axis, geometry);

    // 绘制区间颜色
    drawRanges(ctx, geometry, ranges, progress.width);

    // 绘制进度条背景
    drawProgressBackground(ctx, geometry, progress);

    // 绘制进度条
    drawProgress(ctx, geometry, progress, currentAngle);

    // 绘制刻度
    drawTicks(ctx, geometry, axis, progress.width);

    // 绘制指针
    drawPointer(ctx, geometry, pointer, currentAngle);

    // 绘制信息面板（包含 value、name、unit）
    const { panel } = computedConfig;
    drawInfoPanel(ctx, geometry, { ...data, value: Math.round(currentValue) }, valueText, titleText, axis, panel, panelWavePhaseRef.current);

    // 绘制中心点（半径为指针长度的 3/4）- 最后绘制确保在最上层
    drawPivot(ctx, geometry, pivot, pointer);

    if (isLoading) {
      setIsLoading(false);
    }
  }, [
    width,
    height,
    data,
    computedConfig,
    geometry,
    ranges,
    animationProgress,
    isLoading,
  ]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // 面板水波动画循环
  useEffect(() => {
    const { panel } = computedConfig;
    if (!panel.waveEnabled) return;

    let isActive = true;

    const animateWave = () => {
      if (!isActive) return;

      // 更新波浪相位
      panelWavePhaseRef.current += panel.wave.speed * panel.wave.direction;
      
      // 触发重绘
      drawChart();
      
      panelAnimationRef.current = requestAnimationFrame(animateWave);
    };

    panelAnimationRef.current = requestAnimationFrame(animateWave);

    return () => {
      isActive = false;
      if (panelAnimationRef.current) {
        cancelAnimationFrame(panelAnimationRef.current);
      }
    };
  }, [computedConfig.panel, drawChart]);

  // 监听数值变化
  useEffect(() => {
    if (isAnimationComplete && onChange) {
      onChange(data.value);
    }
  }, [data.value, isAnimationComplete, onChange]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(data);
    }
  }, [data, onClick]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsGaugeContainer, className)}
      style={{
        ...style,
        width: isResponsive ? '100%' : width,
        height: isResponsive ? '100%' : height,
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.zcpcyChatsGaugeCanvas}
        onClick={handleClick}
      />
      {isLoading && <div className={styles.zcpcyChatsGaugeLoading}>加载中...</div>}
    </div>
  );
};

export default Gauge;
