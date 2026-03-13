/**
 * 水波图组件
 * 用于展示数据进度或强度，通过模拟水波纹扩散效果可视化
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  LiquidProps,
  LiquidData,
  LiquidChartConfig,
  ComputedWave,
  ComputedBorder,
  ComputedText,
} from './Liquid.type';

/**
 * 默认配色
 */
const DEFAULT_COLORS = [
  ['#3b82f6', '#60a5fa', '#93c5fd'], // blue gradient
  ['#06b6d4', '#22d3ee', '#67e8f9'], // cyan gradient
  ['#0ea5e9', '#38bdf8', '#7dd3fc'], // sky gradient
];

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<LiquidChartConfig> = {
  width: 200,
  height: 200,
  padding: 10,
  size: 0.8,
  backgroundColor: '#f8fafc',
  wave: {
    amplitude: 8,
    period: 0.02,
    color: DEFAULT_COLORS[0],
    opacity: 0.8,
    speed: 0.02,
    direction: 1,
  },
  border: {
    width: 3,
    color: '#3b82f6',
    opacity: 1,
    gap: true,
    gapSize: 4,
  },
  text: {
    format: '{value}%',
    fontSize: 24,
    color: '#374151',
    fontWeight: 600,
    visible: true,
    offsetY: 0,
  },
  animationDuration: 2000,
  animation: true,
};

/**
 * 计算波浪配置
 */
const computeWaveConfig = (config: LiquidChartConfig['wave']): ComputedWave => {
  const wave = { ...DEFAULT_CONFIG.wave, ...config };
  const defaultColor = DEFAULT_CONFIG.wave.color as string[];
  let colors: string[];
  
  if (Array.isArray(wave.color)) {
    colors = wave.color.filter((c): c is string => typeof c === 'string');
  } else if (typeof wave.color === 'string') {
    colors = [wave.color, wave.color];
  } else {
    colors = defaultColor;
  }

  return {
    amplitude: (wave.amplitude ?? DEFAULT_CONFIG.wave.amplitude) as number,
    period: (wave.period ?? DEFAULT_CONFIG.wave.period) as number,
    colors,
    opacity: (wave.opacity ?? DEFAULT_CONFIG.wave.opacity) as number,
    speed: (wave.speed ?? DEFAULT_CONFIG.wave.speed) as number,
    direction: (wave.direction ?? DEFAULT_CONFIG.wave.direction) as 1 | -1,
    phase: 0,
  };
};

/**
 * 计算边框配置
 */
const computeBorderConfig = (config: LiquidChartConfig['border']): ComputedBorder => {
  const border = { ...DEFAULT_CONFIG.border, ...config };
  return {
    width: border.width!,
    color: border.color!,
    opacity: border.opacity!,
    gap: border.gap!,
    gapSize: border.gapSize!,
  };
};

/**
 * 计算文本配置
 */
const computeTextConfig = (config: LiquidChartConfig['text']): ComputedText => {
  const text = { ...DEFAULT_CONFIG.text, ...config };
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
 * 水波图组件
 */
const Liquid: React.FC<LiquidProps> = ({
  data,
  config = {},
  className,
  style,
  onChange,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const currentValueRef = useRef<number>(0);
  const targetValueRef = useRef<number>(data.value);

  // 合并配置
  const mergedConfig = useMemo<Required<LiquidChartConfig>>(
    () => ({
      ...DEFAULT_CONFIG,
      ...config,
      wave: { ...DEFAULT_CONFIG.wave, ...config.wave },
      border: { ...DEFAULT_CONFIG.border, ...config.border },
      text: { ...DEFAULT_CONFIG.text, ...config.text },
    }),
    [config]
  );

  const waveConfig = useMemo(() => computeWaveConfig(mergedConfig.wave), [mergedConfig.wave]);
  const borderConfig = useMemo(() => computeBorderConfig(mergedConfig.border), [mergedConfig.border]);
  const textConfig = useMemo(() => computeTextConfig(mergedConfig.text), [mergedConfig.text]);

  /**
   * 绘制波浪路径
   */
  const drawWave = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      waterLevel: number,
      amplitude: number,
      period: number,
      phase: number,
      color: string,
      opacity: number
    ) => {
      ctx.save();

      // 创建圆形裁剪区域
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // 绘制波浪
      ctx.beginPath();
      const startX = centerX - radius;
      const endX = centerX + radius;
      const waterY = centerY + radius - waterLevel * (radius * 2);

      ctx.moveTo(startX, centerY + radius);

      for (let x = startX; x <= endX; x += 2) {
        const normalizedX = x - centerX;
        const y =
          waterY +
          Math.sin(normalizedX * period + phase) * amplitude +
          Math.sin(normalizedX * period * 1.5 + phase * 0.8) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(endX, centerY + radius);
      ctx.closePath();

      // 填充颜色
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();
    },
    []
  );

  /**
   * 绘制文本
   */
  const drawText = useCallback(
    (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, value: number) => {
      if (!textConfig.visible) return;

      const text = textConfig.format.replace('{value}', Math.round(value).toString());

      ctx.save();
      ctx.font = `${textConfig.fontWeight} ${textConfig.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = textConfig.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, centerX, centerY + textConfig.offsetY);
      ctx.restore();
    },
    [textConfig]
  );

  /**
   * 绘制边框
   */
  const drawBorder = useCallback(
    (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
      ctx.save();

      // 绘制外圈
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = borderConfig.color;
      ctx.lineWidth = borderConfig.width;
      ctx.globalAlpha = borderConfig.opacity;
      ctx.stroke();

      // 绘制内圈（如果有间隙）
      if (borderConfig.gap && borderConfig.gapSize > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - borderConfig.gapSize, 0, Math.PI * 2);
        ctx.strokeStyle = borderConfig.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = borderConfig.opacity * 0.3;
        ctx.stroke();
      }

      ctx.restore();
    },
    [borderConfig]
  );

  /**
   * 绘制背景
   */
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = mergedConfig.backgroundColor;
      ctx.fill();
      ctx.restore();
    },
    [mergedConfig.backgroundColor]
  );

  /**
   * 渲染帧
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = mergedConfig.width;
    const height = mergedConfig.height;
    const dpr = window.devicePixelRatio || 1;

    // 设置 canvas 尺寸
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 计算中心点和半径
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - mergedConfig.padding;
    const radius = maxRadius * mergedConfig.size;

    // 绘制背景
    drawBackground(ctx, centerX, centerY, radius);

    // 当前水位 (0-1)
    const waterLevel = Math.min(1, Math.max(0, currentValueRef.current / 100));

    // 绘制多层波浪
    waveConfig.colors.forEach((color, index) => {
      const layerPhase = phaseRef.current + (index * Math.PI) / 2;
      const layerAmplitude = waveConfig.amplitude * (1 - index * 0.2);
      const layerOpacity = waveConfig.opacity * (1 - index * 0.15);

      drawWave(
        ctx,
        centerX,
        centerY,
        radius,
        waterLevel,
        layerAmplitude,
        waveConfig.period,
        layerPhase,
        color,
        layerOpacity
      );
    });

    // 绘制边框
    drawBorder(ctx, centerX, centerY, radius);

    // 绘制文本
    drawText(ctx, centerX, centerY, currentValueRef.current);
  }, [
    mergedConfig,
    waveConfig,
    drawWave,
    drawBorder,
    drawText,
    drawBackground,
  ]);

  /**
   * 动画循环
   */
  const animate = useCallback(() => {
    // 更新波浪相位
    phaseRef.current += waveConfig.speed * waveConfig.direction;

    // 数值动画（从当前值过渡到目标值）
    const diff = targetValueRef.current - currentValueRef.current;
    if (Math.abs(diff) > 0.1) {
      currentValueRef.current += diff * 0.05;
      onChange?.(currentValueRef.current);
    } else {
      currentValueRef.current = targetValueRef.current;
    }

    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [waveConfig, render, onChange]);

  // 启动动画
  useEffect(() => {
    if (mergedConfig.animation) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      render();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, mergedConfig.animation, render]);

  // 响应数据变化
  useEffect(() => {
    targetValueRef.current = data.value;
    if (!mergedConfig.animation) {
      currentValueRef.current = data.value;
      render();
    }
  }, [data.value, mergedConfig.animation, render]);

  // 初始渲染
  useEffect(() => {
    render();
  }, [render]);

  const handleClick = useCallback(() => {
    onClick?.(data);
  }, [onClick, data]);

  return (
    <div
      className={classNames(styles.zcpcyChatsLiquidChartContainer, className)}
      style={style}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className={styles.zcpcyChatsLiquidChartCanvas}
        style={{
          width: mergedConfig.width,
          height: mergedConfig.height,
        }}
      />
    </div>
  );
};

export default Liquid;
