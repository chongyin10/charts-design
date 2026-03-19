/**
 * 韦恩图组件
 * 用于展示集合之间的交集、并集等关系
 * 支持双集合和三集合韦恩图
 */

import React, { useRef, useState, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import type {
  VennProps,
  VennData,
  VennSet,
  VennIntersection,
  VennConfig,
  ComputedCircle,
  ComputedIntersection,
} from './Venn.type';

/**
 * 默认配色方案
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue - A
  '#14b8a6', // teal - B  
  '#f97316', // orange - C
];

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<VennConfig> = {
  padding: 40,
  radius: 0.35,
  opacity: 0.7,
  animationDuration: 600,
  label: {
    display: true,
    color: '#ffffff',
    fontSize: 14,
    formatter: '{name}',
  },
  legend: {
    display: true,
    position: 'top',
    labelColor: '#374151',
    labelFontSize: 12,
  },
  tooltip: {
    enabled: true,
    backgroundColor: '#ffffff',
    titleColor: '#111827',
    bodyColor: '#374151',
    fontSize: 12,
  },
};

/**
 * 合并配置
 */
const mergeConfig = (config: VennConfig = {}): Required<VennConfig> => ({
  ...DEFAULT_CONFIG,
  ...config,
  label: { ...DEFAULT_CONFIG.label, ...config.label },
  legend: { ...DEFAULT_CONFIG.legend, ...config.legend },
  tooltip: { ...DEFAULT_CONFIG.tooltip, ...config.tooltip },
});

/**
 * 获取集合颜色
 */
const getSetColor = (index: number, set?: VennSet): string => {
  if (set?.color) return set.color;
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * 混合两种颜色
 */
const blendColors = (color1: string, color2: string): string => {
  const hex2rgb = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  const rgb1 = hex2rgb(color1);
  const rgb2 = hex2rgb(color2);

  const blended = rgb1.map((c1, i) => Math.round((c1 + rgb2[i]) / 2));

  return `#${blended.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * 混合多种颜色
 */
const blendMultipleColors = (colors: string[]): string => {
  if (colors.length === 0) return '#999999';
  if (colors.length === 1) return colors[0];
  if (colors.length === 2) return blendColors(colors[0], colors[1]);

  // 对于三种颜色，先混合前两种，再与第三种混合
  const firstBlend = blendColors(colors[0], colors[1]);
  return blendColors(firstBlend, colors[2]);
};

/**
 * 计算两圆交点
 */
const getCircleIntersections = (
  cx1: number,
  cy1: number,
  r1: number,
  cx2: number,
  cy2: number,
  r2: number
): Array<{ x: number; y: number }> | null => {
  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const d = Math.sqrt(dx * dx + dy * dy);

  // 没有交点
  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) {
    return null;
  }

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));

  const xm = cx1 + (a * dx) / d;
  const ym = cy1 + (a * dy) / d;

  const xs1 = xm + (h * dy) / d;
  const xs2 = xm - (h * dy) / d;
  const ys1 = ym - (h * dx) / d;
  const ys2 = ym + (h * dx) / d;

  if (h === 0) {
    return [{ x: xs1, y: ys1 }];
  }

  return [
    { x: xs1, y: ys1 },
    { x: xs2, y: ys2 },
  ];
};

/**
 * 计算圆弧路径
 * 使用 sweep-flag = 0 表示逆时针，1 表示顺时针
 */
const arcPath = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = {
    x: cx + r * Math.cos(startAngle),
    y: cy + r * Math.sin(startAngle),
  };
  const end = {
    x: cx + r * Math.cos(endAngle),
    y: cy + r * Math.sin(endAngle),
  };

  const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
  const sweepFlag = endAngle > startAngle ? 1 : 0;

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};

/**
 * 计算两圆交集的透镜形状路径
 */
const getLensPath = (
  cx1: number,
  cy1: number,
  r1: number,
  cx2: number,
  cy2: number,
  r2: number
): string | null => {
  const intersections = getCircleIntersections(cx1, cy1, r1, cx2, cy2, r2);
  if (!intersections || intersections.length < 2) return null;

  const [p1, p2] = intersections;

  // 计算角度
  const angle1a = Math.atan2(p1.y - cy1, p1.x - cx1);
  const angle1b = Math.atan2(p2.y - cy1, p2.x - cx1);
  const angle2a = Math.atan2(p1.y - cy2, p1.x - cx2);
  const angle2b = Math.atan2(p2.y - cy2, p2.x - cx2);

  // 确定弧的方向（选择较小的弧）
  let startAngle1 = angle1a;
  let endAngle1 = angle1b;
  let startAngle2 = angle2b;
  let endAngle2 = angle2a;

  // 确保角度差在正确方向
  if (Math.abs(endAngle1 - startAngle1) > Math.PI) {
    if (endAngle1 > startAngle1) {
      startAngle1 += 2 * Math.PI;
    } else {
      endAngle1 += 2 * Math.PI;
    }
  }

  if (Math.abs(endAngle2 - startAngle2) > Math.PI) {
    if (endAngle2 > startAngle2) {
      startAngle2 += 2 * Math.PI;
    } else {
      endAngle2 += 2 * Math.PI;
    }
  }

  // 构建透镜路径
  const arc1 = arcPath(cx1, cy1, r1, startAngle1, endAngle1);
  const arc2 = arcPath(cx2, cy2, r2, endAngle2, startAngle2);

  return `${arc1} ${arc2} Z`;
};

/**
 * 计算透镜形区域的中心点
 */
const getLensCenter = (
  cx1: number,
  cy1: number,
  r1: number,
  cx2: number,
  cy2: number,
  r2: number
): { x: number; y: number } | null => {
  const intersections = getCircleIntersections(cx1, cy1, r1, cx2, cy2, r2);
  if (!intersections || intersections.length < 2) return null;

  // 透镜中心在两圆心连线上，靠近中点
  const t = 0.5;
  return {
    x: (1 - t) * ((cx1 + cx2) / 2) + t * ((intersections[0].x + intersections[1].x) / 2),
    y: (1 - t) * ((cy1 + cy2) / 2) + t * ((intersections[0].y + intersections[1].y) / 2),
  };
};

/**
 * 计算三集合韦恩图布局
 * 三个圆呈等边三角形排列
 */
const calculateThreeSetLayout = (
  width: number,
  height: number,
  padding: number,
  radiusRatio: number,
  sets: VennSet[]
): { circles: ComputedCircle[]; intersections: ComputedIntersection[] } => {
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;

  // 计算圆心位置和半径
  const centerX = width / 2;
  const centerY = height / 2;

  // 三个圆呈等边三角形排列，两圆重叠约 30%
  const distance = availableWidth * 0.28; // 圆心间距
  const radius = Math.min(availableWidth, availableHeight) * radiusRatio;

  // 等边三角形三个顶点（A在上，B在右上，C在左下）
  const angleOffset = -Math.PI / 2; // 从12点方向开始
  const circlePositions = [
    {
      // A - 上方
      cx: centerX + distance * Math.cos(angleOffset),
      cy: centerY + distance * Math.sin(angleOffset) * 0.8,
    },
    {
      // B - 右下
      cx: centerX + distance * Math.cos(angleOffset + (2 * Math.PI) / 3),
      cy: centerY + distance * Math.sin(angleOffset + (2 * Math.PI) / 3) * 0.8,
    },
    {
      // C - 左下
      cx: centerX + distance * Math.cos(angleOffset + (4 * Math.PI) / 3),
      cy: centerY + distance * Math.sin(angleOffset + (4 * Math.PI) / 3) * 0.8,
    },
  ];

  // 创建圆配置
  const circles: ComputedCircle[] = sets.slice(0, 3).map((set, index) => ({
    cx: circlePositions[index].cx,
    cy: circlePositions[index].cy,
    r: radius,
    name: set.name,
    color: getSetColor(index, set),
    value: set.value,
  }));

  const intersections: ComputedIntersection[] = [];

  if (circles.length >= 2) {
    // A&B 交集
    const abPath = getLensPath(
      circles[0].cx, circles[0].cy, circles[0].r,
      circles[1].cx, circles[1].cy, circles[1].r
    );
    if (abPath) {
      const abCenter = getLensCenter(
        circles[0].cx, circles[0].cy, circles[0].r,
        circles[1].cx, circles[1].cy, circles[1].r
      );
      intersections.push({
        path: abPath,
        sets: [circles[0].name, circles[1].name],
        color: blendColors(circles[0].color, circles[1].color),
        label: `${circles[0].name}&${circles[1].name}`,
        centerX: abCenter?.x || (circles[0].cx + circles[1].cx) / 2,
        centerY: abCenter?.y || (circles[0].cy + circles[1].cy) / 2,
      });
    }
  }

  if (circles.length >= 3) {
    // A&C 交集
    const acPath = getLensPath(
      circles[0].cx, circles[0].cy, circles[0].r,
      circles[2].cx, circles[2].cy, circles[2].r
    );
    if (acPath) {
      const acCenter = getLensCenter(
        circles[0].cx, circles[0].cy, circles[0].r,
        circles[2].cx, circles[2].cy, circles[2].r
      );
      intersections.push({
        path: acPath,
        sets: [circles[0].name, circles[2].name],
        color: blendColors(circles[0].color, circles[2].color),
        label: `${circles[0].name}&${circles[2].name}`,
        centerX: acCenter?.x || (circles[0].cx + circles[2].cx) / 2,
        centerY: acCenter?.y || (circles[0].cy + circles[2].cy) / 2,
      });
    }

    // B&C 交集
    const bcPath = getLensPath(
      circles[1].cx, circles[1].cy, circles[1].r,
      circles[2].cx, circles[2].cy, circles[2].r
    );
    if (bcPath) {
      const bcCenter = getLensCenter(
        circles[1].cx, circles[1].cy, circles[1].r,
        circles[2].cx, circles[2].cy, circles[2].r
      );
      intersections.push({
        path: bcPath,
        sets: [circles[1].name, circles[2].name],
        color: blendColors(circles[1].color, circles[2].color),
        label: `${circles[1].name}&${circles[2].name}`,
        centerX: bcCenter?.x || (circles[1].cx + circles[2].cx) / 2,
        centerY: bcCenter?.y || (circles[1].cy + circles[2].cy) / 2,
      });
    }

    // A&B&C 三重重叠区域（近似计算）
    // 三圆交集区域中心取三个圆的质心
    const abcCenterX = (circles[0].cx + circles[1].cx + circles[2].cx) / 3;
    const abcCenterY = (circles[0].cy + circles[1].cy + circles[2].cy) / 3;

    // 检查中心点是否在三个圆内
    const inAllCircles = circles.every(
      (c) =>
        Math.sqrt((abcCenterX - c.cx) ** 2 + (abcCenterY - c.cy) ** 2) < c.r
    );

    if (inAllCircles) {
      // 简化：三圆交集用一个小圆表示
      const abcRadius = radius * 0.15;
      const abcPath = `M ${abcCenterX + abcRadius} ${abcCenterY} ` +
        `A ${abcRadius} ${abcRadius} 0 1 0 ${abcCenterX - abcRadius} ${abcCenterY} ` +
        `A ${abcRadius} ${abcRadius} 0 1 0 ${abcCenterX + abcRadius} ${abcCenterY} Z`;

      intersections.push({
        path: abcPath,
        sets: [circles[0].name, circles[1].name, circles[2].name],
        color: blendMultipleColors([circles[0].color, circles[1].color, circles[2].color]),
        label: `${circles[0].name}&${circles[1].name}&${circles[2].name}`,
        centerX: abcCenterX,
        centerY: abcCenterY,
      });
    }
  }

  return { circles, intersections };
};

/**
 * 计算双集合韦恩图布局
 * 两个圆左右排列
 */
const calculateTwoSetLayout = (
  width: number,
  height: number,
  padding: number,
  radiusRatio: number,
  sets: VennSet[]
): { circles: ComputedCircle[]; intersections: ComputedIntersection[] } => {
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;

  const centerY = height / 2;
  const radius = Math.min(availableWidth, availableHeight) * radiusRatio;

  // 两个圆左右排列，重叠约 30%
  const distance = radius * 1.4;
  const centerX = width / 2;

  const circles: ComputedCircle[] = sets.slice(0, 2).map((set, index) => ({
    cx: centerX + (index === 0 ? -1 : 1) * distance / 2,
    cy: centerY,
    r: radius,
    name: set.name,
    color: getSetColor(index, set),
    value: set.value,
  }));

  const intersections: ComputedIntersection[] = [];

  if (circles.length === 2) {
    const lensPath = getLensPath(
      circles[0].cx, circles[0].cy, circles[0].r,
      circles[1].cx, circles[1].cy, circles[1].r
    );

    if (lensPath) {
      const lensCenter = getLensCenter(
        circles[0].cx, circles[0].cy, circles[0].r,
        circles[1].cx, circles[1].cy, circles[1].r
      );

      intersections.push({
        path: lensPath,
        sets: [circles[0].name, circles[1].name],
        color: blendColors(circles[0].color, circles[1].color),
        label: `${circles[0].name}&${circles[1].name}`,
        centerX: lensCenter?.x || (circles[0].cx + circles[1].cx) / 2,
        centerY: lensCenter?.y || centerY,
      });
    }
  }

  return { circles, intersections };
};

/**
 * 韦恩图组件
 */
const Venn: React.FC<VennProps> = ({
  data,
  width = 400,
  height = 400,
  config: userConfig,
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const config = mergeConfig(userConfig);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredSet, setHoveredSet] = useState<string | null>(null);
  const [hoveredIntersection, setHoveredIntersection] = useState<string[] | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: '' });

  // 计算布局
  const { circles, intersections } = useMemo(() => {
    const setCount = Math.min(data.sets.length, 3);

    if (setCount === 2) {
      return calculateTwoSetLayout(
        width,
        height,
        config.padding,
        config.radius,
        data.sets
      );
    }

    // 默认三集合布局
    return calculateThreeSetLayout(
      width,
      height,
      config.padding,
      config.radius,
      data.sets
    );
  }, [data.sets, width, height, config.padding, config.radius]);

  // 自定义交集颜色映射
  const customIntersectionColors = useMemo(() => {
    const map = new Map<string, string>();
    data.intersections?.forEach((inter) => {
      const key = inter.sets.sort().join('&');
      if (inter.color) {
        map.set(key, inter.color);
      }
    });
    return map;
  }, [data.intersections]);

  // 处理鼠标事件
  const handleSetMouseEnter = useCallback(
    (circle: ComputedCircle, event: React.MouseEvent) => {
      setHoveredSet(circle.name);

      if (config.tooltip.enabled) {
        const content = config.tooltip.customContent
          ? config.tooltip.customContent({
              type: 'set',
              name: circle.name,
              value: circle.value,
              sets: [circle.name],
            })
          : (
              <>
                <div className={styles.zcpcyChatsTooltipTitle}>{circle.name}</div>
                {circle.value !== undefined && (
                  <div className={styles.zcpcyChatsTooltipItem}>
                    <span
                      className={styles.zcpcyChatsTooltipColor}
                      style={{ backgroundColor: circle.color }}
                    />
                    <span>值: {circle.value}</span>
                  </div>
                )}
              </>
            );

        setTooltip({
          visible: true,
          x: event.clientX + 10,
          y: event.clientY - 10,
          content,
        });
      }

      onMouseEnter?.({
        type: 'set',
        name: circle.name,
        value: circle.value,
        sets: [circle.name],
      });
    },
    [config.tooltip, onMouseEnter]
  );

  const handleIntersectionMouseEnter = useCallback(
    (intersection: ComputedIntersection, event: React.MouseEvent) => {
      setHoveredIntersection(intersection.sets);

      if (config.tooltip.enabled) {
        const content = config.tooltip.customContent
          ? config.tooltip.customContent({
              type: 'intersection',
              name: intersection.label,
              value: intersection.value,
              sets: intersection.sets,
            })
          : (
              <>
                <div className={styles.zcpcyChatsTooltipTitle}>{intersection.label}</div>
                {intersection.value !== undefined && (
                  <div className={styles.zcpcyChatsTooltipItem}>
                    <span
                      className={styles.zcpcyChatsTooltipColor}
                      style={{ backgroundColor: intersection.color }}
                    />
                    <span>值: {intersection.value}</span>
                  </div>
                )}
              </>
            );

        setTooltip({
          visible: true,
          x: event.clientX + 10,
          y: event.clientY - 10,
          content,
        });
      }

      onMouseEnter?.({
        type: 'intersection',
        name: intersection.label,
        value: intersection.value,
        sets: intersection.sets,
      });
    },
    [config.tooltip, onMouseEnter]
  );

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!tooltip.visible) return;
    setTooltip((prev) => ({
      ...prev,
      x: event.clientX + 10,
      y: event.clientY - 10,
    }));
  }, [tooltip.visible]);

  const handleMouseLeave = useCallback(() => {
    setHoveredSet(null);
    setHoveredIntersection(null);
    setTooltip({ visible: false, x: 0, y: 0, content: '' });
    onMouseLeave?.();
  }, [onMouseLeave]);

  // 获取格式化的标签文本
  const getLabelText = (name: string, value?: number): string => {
    const { formatter } = config.label;
    if (!formatter) return name;
    if (typeof formatter === 'function') {
      return formatter(name, value);
    }
    return formatter
      .replace('{name}', name)
      .replace('{value}', String(value ?? ''));
  };

  // 判断是否应该高亮
  const isHighlighted = (type: 'set' | 'intersection', names: string[]): boolean => {
    if (!hoveredSet && !hoveredIntersection) return false;

    if (type === 'set') {
      const setName = names[0];
      if (hoveredSet === setName) return true;
      if (hoveredIntersection?.includes(setName)) return true;
    } else {
      // 交集高亮条件：完全匹配或包含关系
      if (hoveredIntersection) {
        const match =
          names.length === hoveredIntersection.length &&
          names.every((n) => hoveredIntersection.includes(n));
        if (match) return true;
      }
      if (hoveredSet && names.includes(hoveredSet)) return true;
    }

    return false;
  };

  // 判断是否变暗
  const isDimmed = (type: 'set' | 'intersection', names: string[]): boolean => {
    if (!hoveredSet && !hoveredIntersection) return false;
    return !isHighlighted(type, names);
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.zcpcyChatsVennChartContainer, className)}
      style={style}
    >
      {/* 图例 */}
      {config.legend.display && (
        <div className={styles.zcpcyChatsLegend}>
          {[...circles, ...intersections].map((item, index) => {
            const isSet = 'cx' in item;
            const name = isSet ? item.name : item.label;
            const color = item.color;

            return (
              <div
                key={`legend-${index}`}
                className={classNames(styles.zcpcyChatsLegendItem)}
                onMouseEnter={() =>
                  isSet
                    ? setHoveredSet(name)
                    : setHoveredIntersection((item as ComputedIntersection).sets)
                }
                onMouseLeave={() => {
                  setHoveredSet(null);
                  setHoveredIntersection(null);
                }}
              >
                <span
                  className={styles.zcpcyChatsLegendColor}
                  style={{ backgroundColor: color }}
                />
                <span>{name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* SVG 图表 */}
      <svg
        className={styles.zcpcyChatsVennChartSvg}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 先渲染圆（底层） */}
        {circles.map((circle) => (
          <g key={`circle-group-${circle.name}`}>
            <circle
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              fill={circle.color}
              fillOpacity={config.opacity}
              stroke={circle.color}
              strokeWidth={2}
              className={classNames(
                styles.zcpcyChatsVennCircle,
                isDimmed('set', [circle.name]) && styles.zcpcyChatsVennDimmed,
                isHighlighted('set', [circle.name]) && styles.zcpcyChatsVennHighlighted
              )}
              onMouseEnter={(e) => handleSetMouseEnter(circle, e)}
              onClick={() =>
                onClick?.({
                  type: 'set',
                  name: circle.name,
                  value: circle.value,
                  sets: [circle.name],
                })
              }
              style={{
                transition: `all ${config.animationDuration}ms ease`,
              }}
            />

            {/* 集合标签 - 只显示在独有区域 */}
            {config.label.display && (
              <text
                x={circle.cx}
                y={circle.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={config.label.color}
                fontSize={config.label.fontSize}
                className={styles.zcpcyChatsVennLabel}
                style={{
                  opacity: isDimmed('set', [circle.name]) ? 0.3 : 1,
                  transition: `opacity ${config.animationDuration}ms ease`,
                }}
              >
                {getLabelText(circle.name, circle.value)}
              </text>
            )}
          </g>
        ))}

        {/* 渲染交集区域（顶层） */}
        {intersections.map((intersection, index) => {
          const customColor = customIntersectionColors.get(
            intersection.sets.sort().join('&')
          );
          const finalColor = customColor || intersection.color;

          return (
            <g key={`intersection-${index}`}>
              <path
                d={intersection.path}
                fill={finalColor}
                fillOpacity={config.opacity + 0.1}
                stroke={finalColor}
                strokeWidth={1}
                className={classNames(
                  styles.zcpcyChatsVennIntersection,
                  isDimmed('intersection', intersection.sets) && styles.zcpcyChatsVennDimmed,
                  isHighlighted('intersection', intersection.sets) && styles.zcpcyChatsVennHighlighted
                )}
                onMouseEnter={(e) => handleIntersectionMouseEnter(intersection, e)}
                onClick={() =>
                  onClick?.({
                    type: 'intersection',
                    name: intersection.label,
                    value: intersection.value,
                    sets: intersection.sets,
                  })
                }
                style={{
                  transition: `all ${config.animationDuration}ms ease`,
                }}
              />

              {/* 交集标签 */}
              {config.label.display && (
                <text
                  x={intersection.centerX}
                  y={intersection.centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={config.label.color}
                  fontSize={config.label.fontSize! * 0.9}
                  className={styles.zcpcyChatsVennLabel}
                  style={{
                    opacity: isDimmed('intersection', intersection.sets) ? 0.3 : 1,
                    transition: `opacity ${config.animationDuration}ms ease`,
                  }}
                >
                  {getLabelText(intersection.label, intersection.value)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {config.tooltip.enabled && (
        <div
          className={classNames(
            styles.zcpcyChatsTooltip,
            tooltip.visible && styles.zcpcyChatsTooltipVisible
          )}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: config.tooltip.backgroundColor,
            color: config.tooltip.bodyColor,
            fontSize: config.tooltip.fontSize,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default Venn;
