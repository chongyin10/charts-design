'use client';

import React, { useState, useEffect } from 'react';
import { Scatter } from '@/components/Scatter';
import { ScatterChartData, ScatterSelectedPoint } from '@/components/Scatter/Scatter.type';
import { Flex, Table, Anchor } from '@zjpcy/simple-design';
import type { Column } from '@zjpcy/simple-design';
import { Prism } from 'react-syntax-highlighter';

// 修复 react-syntax-highlighter 与 React 18 的类型不兼容问题
const SyntaxHighlighter = Prism as any;
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './page.module.css';
import cscaraData from './Json/cscara.json';
import scatterPointLabelData from './Json/scatter-point-label.json';

// 自定义复制按钮组件
interface CopyButtonProps {
    text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    return (
        <button
            className={styles.copyButton}
            onClick={handleCopy}
            title="复制代码"
        >
            {copied ? '✓ 已复制' : '📋 复制'}
        </button>
    );
};

/**
 * 散点图示例页面
 */
export default function ScatterChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
    const [selectedPoints, setSelectedPoints] = useState<ScatterSelectedPoint[]>([]);
    const [jsonSelectedPoints, setJsonSelectedPoints] = useState<ScatterSelectedPoint[]>([]);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 处理 JSON 数据 - 将数据按性别分组
    const jsonData: ScatterChartData = {
        datasets: [
            {
                label: '女性',
                data: cscaraData
                    .filter((d: { gender: string; height: number; weight: number }) => d.gender === 'female')
                    .map((d: { gender: string; height: number; weight: number }) => ({ x: d.height, y: d.weight })),
                backgroundColor: '#ec4899',
                point: {
                    radius: 2,
                    hoverRadius: 3,
                },
            },
            {
                label: '男性',
                data: cscaraData
                    .filter((d: { gender: string; height: number; weight: number }) => d.gender === 'male')
                    .map((d: { gender: string; height: number; weight: number }) => ({ x: d.height, y: d.weight })),
                backgroundColor: '#3b82f6',
                point: {
                    radius: 2,
                    hoverRadius: 3,
                },
            },
        ],
    };

    // 基础散点图数据 - 身高体重分布
    const basicData: ScatterChartData = {
        datasets: [
            {
                label: '男性',
                data: [
                    { x: 170, y: 65 },
                    { x: 175, y: 70 },
                    { x: 180, y: 75 },
                    { x: 165, y: 60 },
                    { x: 185, y: 85 },
                    { x: 172, y: 68 },
                    { x: 178, y: 72 },
                    { x: 168, y: 62 },
                    { x: 182, y: 78 },
                    { x: 176, y: 71 },
                ],
                backgroundColor: '#3b82f6',
            },
        ],
    };

    // 多数据集对比数据
    const multiData: ScatterChartData = {
        datasets: [
            {
                label: '产品 A',
                data: [
                    { x: 10, y: 20 },
                    { x: 15, y: 25 },
                    { x: 20, y: 30 },
                    { x: 25, y: 35 },
                    { x: 30, y: 40 },
                    { x: 35, y: 45 },
                    { x: 40, y: 50 },
                ],
                backgroundColor: '#3b82f6',
            },
            {
                label: '产品 B',
                data: [
                    { x: 10, y: 15 },
                    { x: 20, y: 20 },
                    { x: 30, y: 25 },
                    { x: 40, y: 30 },
                    { x: 50, y: 35 },
                    { x: 60, y: 40 },
                    { x: 70, y: 45 },
                ],
                backgroundColor: '#ef4444',
            },
        ],
    };

    // 不同形状数据点
    const shapeData: ScatterChartData = {
        datasets: [
            {
                label: '圆形',
                data: [
                    { x: 10, y: 10 },
                    { x: 20, y: 20 },
                    { x: 30, y: 30 },
                ],
                backgroundColor: '#3b82f6',
                point: {
                    style: 'circle',
                    radius: 8,
                },
            },
            {
                label: '矩形',
                data: [
                    { x: 15, y: 25 },
                    { x: 25, y: 35 },
                    { x: 35, y: 45 },
                ],
                backgroundColor: '#10b981',
                point: {
                    style: 'rect',
                    radius: 8,
                },
            },
            {
                label: '三角形',
                data: [
                    { x: 20, y: 40 },
                    { x: 30, y: 50 },
                    { x: 40, y: 60 },
                ],
                backgroundColor: '#f59e0b',
                point: {
                    style: 'triangle',
                    radius: 8,
                },
            },
        ],
    };

    // 回归线示例数据
    const trendlineData: ScatterChartData = {
        datasets: [
            {
                label: '学习时间与成绩',
                data: [
                    { x: 1, y: 55 },
                    { x: 2, y: 60 },
                    { x: 3, y: 65 },
                    { x: 4, y: 70 },
                    { x: 5, y: 75 },
                    { x: 6, y: 80 },
                    { x: 7, y: 85 },
                    { x: 8, y: 88 },
                    { x: 9, y: 92 },
                    { x: 10, y: 95 },
                ],
                backgroundColor: '#8b5cf6',
            },
        ],
    };

    // 象限示例数据
    const quadrantData: ScatterChartData = {
        datasets: [
            {
                label: '满意度 vs 重要性',
                data: [
                    { x: 80, y: 90 },
                    { x: 70, y: 85 },
                    { x: 60, y: 40 },
                    { x: 30, y: 20 },
                    { x: 20, y: 70 },
                    { x: 90, y: 30 },
                    { x: 50, y: 50 },
                    { x: 40, y: 80 },
                    { x: 75, y: 25 },
                    { x: 85, y: 60 },
                ],
                backgroundColor: '#06b6d4',
            },
        ],
    };

    // 区域选择示例数据
    const selectionData: ScatterChartData = {
        datasets: [
            {
                label: '数据点',
                data: [
                    { x: 10, y: 15 },
                    { x: 20, y: 25 },
                    { x: 30, y: 35 },
                    { x: 40, y: 45 },
                    { x: 50, y: 55 },
                    { x: 60, y: 65 },
                    { x: 70, y: 75 },
                    { x: 25, y: 40 },
                    { x: 35, y: 50 },
                    { x: 45, y: 60 },
                    { x: 15, y: 30 },
                    { x: 55, y: 70 },
                ],
                backgroundColor: '#3b82f6',
            },
        ],
    };

    // 带标签的数据点示例（汽车油耗 vs 重量）
    const labeledData: ScatterChartData = {
        datasets: [
            {
                label: '汽车数据',
                data: scatterPointLabelData.map((d: { name: string; mpg: number; hp: number }) => ({
                    x: d.mpg,
                    y: d.hp,
                    label: d.name,
                })),
                backgroundColor: '#3b82f6',
                point: {
                    radius: 5,
                    hoverRadius: 8,
                },
                labelConfig: {
                    display: true,
                    position: 'top',
                    color: '#374151',
                    fontSize: 9,
                    offset: { x: 0, y: -4 },
                },
            },
        ],
    };

    // 处理区域选择变化
    const handleSelectionChange = (points: ScatterSelectedPoint[]) => {
        setSelectedPoints(points);
    };

    // 处理 JSON 数据区域选择变化
    const handleJsonSelectionChange = (points: ScatterSelectedPoint[]) => {
        setJsonSelectedPoints(points);
    };

    // API 表格列定义
    const propColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    // ScatterProps API 数据
    const scatterPropsAPI = [
        { prop: 'data', desc: '图表数据', type: 'ScatterChartData', default: 'required' },
        { prop: 'width', desc: '图表宽度', type: 'number', default: '600' },
        { prop: 'height', desc: '图表高度', type: 'number', default: '400' },
        { prop: 'padding', desc: '内边距', type: 'number', default: '60' },
        { prop: 'xAxis', desc: 'X轴配置', type: 'ScatterAxisConfig', default: '-' },
        { prop: 'yAxis', desc: 'Y轴配置', type: 'ScatterAxisConfig', default: '-' },
        { prop: 'legend', desc: '图例配置', type: 'ScatterLegendConfig', default: '-' },
        { prop: 'tooltip', desc: '提示框配置', type: 'ScatterTooltipConfig', default: '-' },
        { prop: 'trendline', desc: '回归线配置', type: 'ScatterTrendlineConfig', default: '-' },
        { prop: 'quadrant', desc: '象限配置', type: 'ScatterQuadrantConfig', default: '-' },
        { prop: 'selection', desc: '区域选择配置', type: 'ScatterSelectionConfig', default: '-' },
        { prop: 'label', desc: '标签配置（全局）', type: 'ScatterLabelConfig', default: '-' },
        { prop: 'animationDuration', desc: '动画时长（毫秒）', type: 'number', default: '1000' },
        { prop: 'onDataClick', desc: '数据点击回调', type: '(datasetIndex, dataIndex, point) => void', default: '-' },
        { prop: 'onSelectionChange', desc: '区域选择回调', type: '(selectedPoints: ScatterSelectedPoint[]) => void', default: '-' },
    ];

    // Dataset API 数据
    const datasetColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterDatasetAPI = [
        { prop: 'label', desc: '数据标签', type: 'string', default: 'required' },
        { prop: 'data', desc: '数据点数组', type: 'ScatterDataPoint[]', default: 'required' },
        { prop: 'backgroundColor', desc: '数据点填充颜色', type: 'string', default: '-' },
        { prop: 'borderColor', desc: '数据点边框颜色', type: 'string', default: '-' },
        { prop: 'point', desc: '数据点配置', type: 'ScatterPointConfig', default: '-' },
        { prop: 'labelConfig', desc: '标签配置（数据集级别）', type: 'ScatterLabelConfig', default: '-' },
    ];

    // 类型定义表格列
    const typeColumns: Column[] = [
        { title: '类型名称', dataIndex: 'name', key: 'name', width: 200 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
    ];

    // 类型定义数据
    const typeDefinitionsAPI = [
        { name: 'ScatterDataPoint', desc: '散点数据点，包含 x 和 y 两个数值属性' },
        { name: 'ScatterPointConfig', desc: '数据点样式配置，包括颜色、形状、大小等' },
        { name: 'ScatterDataset', desc: '数据集配置，包含标签、数据点和样式' },
        { name: 'ScatterChartData', desc: '图表数据，包含多个数据集的数组' },
        { name: 'ScatterGridConfig', desc: '网格线配置，控制网格线的显示、颜色、透明度等' },
        { name: 'ScatterAxisConfig', desc: '坐标轴配置，包括标题、范围、网格线等' },
        { name: 'ScatterLegendConfig', desc: '图例配置，控制图例的显示和样式' },
        { name: 'ScatterTooltipConfig', desc: '提示框配置，包括背景色、自定义内容等' },
        { name: 'ScatterTrendlineConfig', desc: '回归线配置，用于显示线性趋势线' },
        { name: 'ScatterQuadrantConfig', desc: '象限配置，将图表划分为四个区域' },
        { name: 'ScatterSelectionConfig', desc: '区域选择配置，用于框选数据点' },
        { name: 'ScatterSelectedPoint', desc: '选中的数据点信息' },
        { name: 'ScatterProps', desc: '散点图组件的主要属性接口' },
        { name: 'ScatterLabelConfig', desc: '数据点标签配置，控制标签的显示、位置、样式等' },
    ];

    // ScatterPointConfig API
    const pointConfigColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterPointConfigAPI = [
        { prop: 'backgroundColor', desc: '数据点填充颜色', type: 'string', default: '-' },
        { prop: 'hoverBackgroundColor', desc: '悬停时填充颜色', type: 'string', default: '-' },
        { prop: 'borderColor', desc: '边框颜色', type: 'string', default: '-' },
        { prop: 'borderWidth', desc: '边框宽度', type: 'number', default: '-' },
        { prop: 'style', desc: '数据点样式', type: "'circle' | 'rect' | 'triangle'", default: "'circle'" },
        { prop: 'radius', desc: '数据点半径', type: 'number', default: '6' },
        { prop: 'hoverRadius', desc: '悬停时半径', type: 'number', default: '9' },
    ];

    // ScatterAxisConfig API
    const axisConfigColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterAxisConfigAPI = [
        { prop: 'display', desc: '是否显示坐标轴', type: 'boolean', default: 'true' },
        { prop: 'title', desc: '轴标题配置', type: '{ text: string; color?: string; fontSize?: number }', default: '-' },
        { prop: 'gridColor', desc: '网格线颜色', type: 'string', default: '-' },
        { prop: 'tickColor', desc: '刻度标签颜色', type: 'string', default: '-' },
        { prop: 'tickFontSize', desc: '刻度标签字体大小', type: 'number', default: '12' },
        { prop: 'min', desc: '最小值（不设置则自动计算）', type: 'number', default: '-' },
        { prop: 'max', desc: '最大值（不设置则自动计算）', type: 'number', default: '-' },
        { prop: 'grid', desc: '网格线详细配置', type: 'ScatterGridConfig', default: '-' },
    ];

    // ScatterLegendConfig API
    const legendConfigColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterLegendConfigAPI = [
        { prop: 'display', desc: '是否显示图例', type: 'boolean', default: 'true' },
        { prop: 'position', desc: '图例位置', type: "'top' | 'bottom'", default: "'top'" },
        { prop: 'labelColor', desc: '标签颜色', type: 'string', default: '-' },
        { prop: 'labelFontSize', desc: '标签字体大小', type: 'number', default: '-' },
    ];

    // ScatterTooltipConfig API
    const tooltipConfigColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterTooltipConfigAPI = [
        { prop: 'enabled', desc: '是否启用提示框', type: 'boolean', default: 'true' },
        { prop: 'backgroundColor', desc: '背景颜色', type: 'string', default: "'#ffffff'" },
        { prop: 'titleColor', desc: '标题颜色', type: 'string', default: "'#111827'" },
        { prop: 'bodyColor', desc: '内容颜色', type: 'string', default: "'#374151'" },
        { prop: 'fontSize', desc: '字体大小', type: 'number', default: '12' },
        { prop: 'customContent', desc: '自定义内容渲染函数', type: 'Function', default: '-' },
    ];

    // ScatterTrendlineConfig API
    const trendlineConfigColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterTrendlineConfigAPI = [
        { prop: 'enabled', desc: '是否显示回归线', type: 'boolean', default: 'false' },
        { prop: 'color', desc: '回归线颜色', type: 'string', default: "'#ef4444'" },
        { prop: 'width', desc: '回归线宽度', type: 'number', default: '2' },
        { prop: 'dashed', desc: '是否显示为虚线', type: 'boolean', default: 'false' },
    ];

    // ScatterQuadrantConfig API
    const quadrantConfigColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterQuadrantConfigAPI = [
        { prop: 'enabled', desc: '是否启用象限', type: 'boolean', default: 'false' },
        { prop: 'xDivider', desc: 'X轴分割线位置', type: 'number', default: '0' },
        { prop: 'yDivider', desc: 'Y轴分割线位置', type: 'number', default: '0' },
        { prop: 'colors', desc: '四个象限的颜色数组', type: '[string, string, string, string]', default: '-' },
        { prop: 'opacity', desc: '象限透明度', type: 'number', default: '0.3' },
    ];

    // ScatterSelectionConfig API
    const selectionConfigColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterSelectionConfigAPI = [
        { prop: 'enabled', desc: '是否启用区域选择', type: 'boolean', default: 'false' },
        { prop: 'borderColor', desc: '选择框边框颜色', type: 'string', default: "'#3b82f6'" },
        { prop: 'fillColor', desc: '选择框填充颜色', type: 'string', default: "'rgba(59, 130, 246, 0.2)'" },
        { prop: 'selectedPointStyle', desc: '选中点的样式配置', type: 'Object', default: '-' },
    ];

    // ScatterLabelConfig API
    const labelConfigColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const scatterLabelConfigAPI = [
        { prop: 'display', desc: '是否显示标签', type: 'boolean', default: 'false' },
        { prop: 'field', desc: '从原始数据读取标签的字段名', type: 'string', default: '-' },
        { prop: 'color', desc: '标签颜色', type: 'string', default: "'#374151'" },
        { prop: 'fontSize', desc: '标签字体大小', type: 'number', default: '10' },
        { prop: 'offset', desc: '标签位置偏移', type: '{ x?: number; y?: number }', default: "{ x: 0, y: -8 }" },
        { prop: 'position', desc: '标签位置', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'" },
    ];

    // 代码示例
    const basicCode = `import { Scatter } from '@/components/Scatter';

const data = {
  datasets: [{
    label: '男性',
    data: [
      { x: 170, y: 65 },
      { x: 175, y: 70 },
      { x: 180, y: 75 },
    ],
    backgroundColor: '#3b82f6',
  }],
};

<Scatter data={data} width={600} height={400} />`;

    const multiCode = `import { Scatter } from '@/components/Scatter';

const data = {
  datasets: [
    {
      label: '产品 A',
      data: [{ x: 10, y: 20 }, { x: 20, y: 30 }],
      backgroundColor: '#3b82f6',
    },
    {
      label: '产品 B',
      data: [{ x: 10, y: 15 }, { x: 20, y: 20 }],
      backgroundColor: '#ef4444',
    },
  ],
};

<Scatter data={data} width={600} height={400} />`;

    const shapeCode = `import { Scatter } from '@/components/Scatter';

const data = {
  datasets: [
    {
      label: '圆形',
      data: [{ x: 10, y: 10 }],
      point: { style: 'circle', radius: 8 },
    },
    {
      label: '矩形',
      data: [{ x: 15, y: 25 }],
      point: { style: 'rect', radius: 8 },
    },
    {
      label: '三角形',
      data: [{ x: 20, y: 40 }],
      point: { style: 'triangle', radius: 8 },
    },
  ],
};

<Scatter data={data} width={600} height={400} />`;

    const trendlineCode = `import { Scatter } from '@/components/Scatter';

const data = {
  datasets: [{
    label: '学习时间与成绩',
    data: [
      { x: 1, y: 55 },
      { x: 5, y: 75 },
      { x: 10, y: 95 },
    ],
    backgroundColor: '#8b5cf6',
  }],
};

<Scatter
  data={data}
  width={600}
  height={400}
  trendline={{ enabled: true, color: '#ef4444', dashed: true }}
/>`;

    const quadrantCode = `import { Scatter } from '@/components/Scatter';

const data = {
  datasets: [{
    label: '满意度 vs 重要性',
    data: [{ x: 80, y: 90 }, { x: 30, y: 20 }],
    backgroundColor: '#06b6d4',
  }],
};

<Scatter
  data={data}
  width={600}
  height={400}
  quadrant={{
    enabled: true,
    xDivider: 50,
    yDivider: 50,
    colors: ['#e0f2fe', '#fef3c7', '#dbeafe', '#fce7f3'],
    opacity: 0.3,
  }}
  xAxis={{ min: 0, max: 100, title: { text: '重要性' } }}
  yAxis={{ min: 0, max: 100, title: { text: '满意度' } }}
/>`;

    const selectionCode = `import { Scatter } from '@/components/Scatter';
import type { ScatterSelectedPoint } from '@/components/Scatter/Scatter.type';

const [selectedPoints, setSelectedPoints] = useState<ScatterSelectedPoint[]>([]);

const data = {
  datasets: [{
    label: '数据点',
    data: [
      { x: 10, y: 15 },
      { x: 20, y: 25 },
      { x: 30, y: 35 },
    ],
    backgroundColor: '#3b82f6',
  }],
};

<Scatter
  data={data}
  width={600}
  height={400}
  selection={{
    enabled: true,
    borderColor: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.2)',
    selectedPointStyle: {
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
      borderWidth: 3,
      radius: 8,
    },
  }}
  onSelectionChange={(points) => setSelectedPoints(points)}
/>

// 显示选中的点数
<p>已选中 {selectedPoints.length} 个数据点</p>`;

    const jsonDataCode = `import cscaraData from './Json/cscara.json';

// 处理 JSON 数据
const jsonData = {
  datasets: [
    {
      label: '女性',
      data: cscaraData
        .filter(d => d.gender === 'female')
        .map(d => ({ x: d.height, y: d.weight })),
      backgroundColor: '#ec4899',
    },
    {
      label: '男性',
      data: cscaraData
        .filter(d => d.gender === 'male')
        .map(d => ({ x: d.height, y: d.weight })),
      backgroundColor: '#3b82f6',
    },
  ],
};

<Scatter
  data={jsonData}
  width={600}
  height={400}
  selection={{
    enabled: true,
    borderColor: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.2)',
    selectedPointStyle: {
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
      borderWidth: 3,
      radius: 4,
    },
  }}
  trendline={{ enabled: true }}
/>`;

    const labeledDataCode = `import scatterPointLabelData from './Json/scatter-point-label.json';

// 带标签的数据点示例（汽车油耗 vs 重量）
const labeledData = {
  datasets: [
    {
      label: '汽车数据',
      data: scatterPointLabelData.map(d => ({
        x: d.mpg,    // 油耗
        y: d.wt,     // 重量
        label: d.name,  // 汽车名称作为标签
      })),
      backgroundColor: '#3b82f6',
      point: {
        radius: 5,
        hoverRadius: 8,
      },
      // 数据集级别的标签配置
      labelConfig: {
        display: true,
        position: 'top',
        color: '#374151',
        fontSize: 9,
        offset: { x: 0, y: -4 },
      },
    },
  ],
};

// 或者使用全局标签配置
<Scatter
  data={labeledData}
  width={600}
  height={400}
  label={{
    display: true,
    field: 'name',  // 从原始数据字段读取标签
    position: 'top',
    color: '#374151',
    fontSize: 10,
  }}
  xAxis={{ title: { text: '油耗 (mpg)' } }}
  yAxis={{ title: { text: '重量 (1000 lbs)' } }}
/>`;

    return (
        <div className={styles.examplePage}>
            <Flex gap={24} align="flex-start">
                {/* 左侧主内容 */}
                <div className={styles.mainContent}>
                    {/* 组件介绍 */}
                    <div className={styles.exampleSection} id="scatter-intro">
                        <h1 className={styles.sectionTitle}>散点图 Scatter</h1>
                        <p className={styles.sectionText}>
                            散点图通过在二维坐标系中绘制离散数据点来展示两个变量之间的关系。
                            每个点的横纵坐标分别对应两个变量的观测值，点的分布形态可直观反映变量间的相关性、分布规律或异常值。
                            适用于相关性分析、聚类分析、异常值检测等场景。
                            支持区域勾选功能，可以在图表中框选数据点。
                        </p>
                    </div>

                    {/* 基础散点图 */}
                    <div className={styles.exampleSection} id="scatter-basic">
                        <h2 className={styles.subsectionTitle}>基础散点图</h2>
                        <p className={styles.sectionText}>最简单的散点图，展示一组数据的分布情况。</p>
                        <div className={styles.exampleDemo}>
                            <Scatter data={basicData} width={600} height={400} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={basicCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {basicCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 多数据集对比 */}
                    <div className={styles.exampleSection} id="scatter-multi">
                        <h2 className={styles.subsectionTitle}>多数据集对比</h2>
                        <p className={styles.sectionText}>在同一图表中展示多个数据集的分布，便于对比分析。</p>
                        <div className={styles.exampleDemo}>
                            <Scatter data={multiData} width={600} height={400} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={multiCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {multiCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 不同形状数据点 */}
                    <div className={styles.exampleSection} id="scatter-shape">
                        <h2 className={styles.subsectionTitle}>数据点形状</h2>
                        <p className={styles.sectionText}>支持圆形、矩形、三角形三种数据点形状。</p>
                        <div className={styles.exampleDemo}>
                            <Scatter data={shapeData} width={600} height={400} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={shapeCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {shapeCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 回归线 */}
                    <div className={styles.exampleSection} id="scatter-trendline">
                        <h2 className={styles.subsectionTitle}>回归线</h2>
                        <p className={styles.sectionText}>显示线性回归趋势线，分析变量间的相关性。</p>
                        <div className={styles.exampleDemo}>
                            <Scatter
                                data={trendlineData}
                                width={600}
                                height={400}
                                trendline={{ enabled: true, color: '#ef4444', dashed: true }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={trendlineCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {trendlineCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 象限分析 */}
                    <div className={styles.exampleSection} id="scatter-quadrant">
                        <h2 className={styles.subsectionTitle}>象限分析</h2>
                        <p className={styles.sectionText}>将图表划分为四个象限，常用于满意度-重要性分析。</p>
                        <div className={styles.exampleDemo}>
                            <Scatter
                                data={quadrantData}
                                width={600}
                                height={400}
                                quadrant={{
                                    enabled: true,
                                    xDivider: 50,
                                    yDivider: 50,
                                    colors: ['#e0f2fe', '#fef3c7', '#dbeafe', '#fce7f3'],
                                    opacity: 0.3,
                                }}
                                xAxis={{ min: 0, max: 100, title: { text: '重要性' } }}
                                yAxis={{ min: 0, max: 100, title: { text: '满意度' } }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={quadrantCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {quadrantCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 带标签的数据点 */}
                    <div className={styles.exampleSection} id="scatter-labels">
                        <h2 className={styles.subsectionTitle}>带标签的数据点</h2>
                        <p className={styles.sectionText}>
                            为数据点添加标签，显示额外信息。支持通过数据点的 label 属性直接设置标签，
                            或通过 field 配置从原始数据中提取标签文本。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Scatter
                                data={labeledData}
                                width={600}
                                height={400}
                                // trendline={{ enabled: true, color: '#ef4444', dashed: true }}
                                xAxis={{ title: { text: '油耗 (mpg)' } }}
                                yAxis={{ title: { text: '重量 (1000 lbs)' } }}
                                label={{
                                    display: true,
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={labeledDataCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {labeledDataCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 区域选择 */}
                    <div className={styles.exampleSection} id="scatter-selection">
                        <h2 className={styles.subsectionTitle}>区域选择</h2>
                        <p className={styles.sectionText}>
                            支持在图表中框选数据点，选中的点会以不同样式高亮显示。
                            在图表区域内按住鼠标左键拖动即可框选数据点。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Scatter
                                data={selectionData}
                                width={600}
                                height={400}
                                selection={{
                                    enabled: true,
                                    borderColor: '#3b82f6',
                                    fillColor: 'rgba(59, 130, 246, 0.2)',
                                    selectedPointStyle: {
                                        backgroundColor: '#ef4444',
                                        borderColor: '#dc2626',
                                        borderWidth: 3,
                                        radius: 8,
                                    },
                                }}
                                onSelectionChange={handleSelectionChange}
                            />
                            <div style={{ marginTop: 12, color: '#374151', fontSize: 14 }}>
                                已选中 <strong>{selectedPoints.length}</strong> 个数据点
                                {selectedPoints.length > 0 && (
                                    <span style={{ marginLeft: 8, color: '#6b7280' }}>
                                        (可通过 onSelectionChange 回调获取详细数据)
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={selectionCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {selectionCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* JSON 数据示例 */}
                    <div className={styles.exampleSection} id="scatter-json">
                        <h2 className={styles.subsectionTitle}>JSON 数据示例</h2>
                        <p className={styles.sectionText}>
                            展示如何从 JSON 文件加载数据，显示男性和女性身高体重的分布关系。
                            支持区域选择功能，可以框选数据点进行分析。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Scatter
                                data={jsonData}
                                width={600}
                                height={400}
                                trendline={{ enabled: true, color: '#ef4444', dashed: true }}
                                selection={{
                                    enabled: true,
                                    borderColor: '#3b82f6',
                                    fillColor: 'rgba(59, 130, 246, 0.2)',
                                    selectedPointStyle: {
                                        backgroundColor: '#ef4444',
                                        borderColor: '#dc2626',
                                        borderWidth: 3,
                                        radius: 4,
                                    },
                                }}
                                onSelectionChange={handleJsonSelectionChange}
                                xAxis={{ title: { text: '身高 (cm)' } }}
                                yAxis={{ title: { text: '体重 (kg)' } }}
                            />
                            <div style={{ marginTop: 12, color: '#374151', fontSize: 14 }}>
                                已选中 <strong>{jsonSelectedPoints.length}</strong> 个数据点
                            </div>
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={jsonDataCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {jsonDataCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="scatter-api">
                        <h2 className={styles.subsectionTitle}>API 参考</h2>
                        <p className={styles.sectionText}>Scatter 组件的属性列表。</p>
                        <div className={styles.apiTable}>
                            <Table columns={propColumns} dataSource={scatterPropsAPI} />
                        </div>
                    </div>

                    {/* Dataset 配置 */}
                    <div className={styles.exampleSection} id="scatter-dataset">
                        <h2 className={styles.subsectionTitle}>Dataset 配置</h2>
                        <p className={styles.sectionText}>数据集配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={scatterDatasetAPI} />
                        </div>
                    </div>

                    {/* 类型定义 */}
                    <div className={styles.exampleSection} id="scatter-types">
                        <h2 className={styles.subsectionTitle}>类型定义</h2>
                        <p className={styles.sectionText}>Scatter 组件使用的 TypeScript 类型定义概览。</p>
                        <div className={styles.apiTable}>
                            <Table columns={typeColumns} dataSource={typeDefinitionsAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>ScatterPointConfig</h3>
                        <p className={styles.sectionText}>数据点样式配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={pointConfigColumns} dataSource={scatterPointConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>ScatterAxisConfig</h3>
                        <p className={styles.sectionText}>坐标轴配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={axisConfigColumns} dataSource={scatterAxisConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>ScatterLegendConfig</h3>
                        <p className={styles.sectionText}>图例配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={legendConfigColumns} dataSource={scatterLegendConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>ScatterTooltipConfig</h3>
                        <p className={styles.sectionText}>提示框配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={tooltipConfigColumns} dataSource={scatterTooltipConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>ScatterTrendlineConfig</h3>
                        <p className={styles.sectionText}>回归线配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={trendlineConfigColumns} dataSource={scatterTrendlineConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>ScatterQuadrantConfig</h3>
                        <p className={styles.sectionText}>象限配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={quadrantConfigColumns} dataSource={scatterQuadrantConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>ScatterSelectionConfig</h3>
                        <p className={styles.sectionText}>区域选择配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={selectionConfigColumns} dataSource={scatterSelectionConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>ScatterLabelConfig</h3>
                        <p className={styles.sectionText}>数据点标签配置，支持在数据点上显示标签文本。</p>
                        <div className={styles.apiTable}>
                            <Table columns={labelConfigColumns} dataSource={scatterLabelConfigAPI} />
                        </div>
                    </div>
                </div>

                {/* 右侧锚点导航 */}
                <div className={styles.anchorNav}>
                    <div className={styles.anchorWrapper}>
                        {scrollContainer && (
                            <Anchor
                                getContainer={() => scrollContainer}
                                offsetTop={20}
                                affix={false}
                                bounds={30}
                            >
                                <Anchor.Link href="#scatter-intro" title="组件介绍" />
                                <Anchor.Link href="#scatter-basic" title="基础散点图" />
                                <Anchor.Link href="#scatter-multi" title="多数据集对比" />
                                <Anchor.Link href="#scatter-shape" title="数据点形状" />
                                <Anchor.Link href="#scatter-trendline" title="回归线" />
                                <Anchor.Link href="#scatter-quadrant" title="象限分析" />
                                <Anchor.Link href="#scatter-labels" title="带标签的数据点" />
                                <Anchor.Link href="#scatter-selection" title="区域选择" />
                                <Anchor.Link href="#scatter-json" title="JSON 数据" />
                                <Anchor.Link href="#scatter-api" title="API 参考" />
                                <Anchor.Link href="#scatter-dataset" title="Dataset 配置" />
                                <Anchor.Link href="#scatter-types" title="类型定义" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
