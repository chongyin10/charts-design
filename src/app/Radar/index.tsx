'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Radar } from '@/components/Radar';
import { RadarChartData, RadarChartConfig, RadarPointConfig } from '@/components/Radar/Radar.type';
import { Flex, Table, Anchor } from '@zjpcy/simple-design';
import type { Column } from '@zjpcy/simple-design';
import { Prism } from 'react-syntax-highlighter';

// 修复 react-syntax-highlighter 与 React 18 的类型不兼容问题
const SyntaxHighlighter = Prism as any;
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './page.module.css';

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
 * 雷达图示例页面
 */
export default function RadarPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础数据 - 单系列
    const basicData: RadarChartData = {
        series: [
            {
                name: '能力评估',
                data: [
                    { name: '技术能力', value: 85 },
                    { name: '沟通能力', value: 70 },
                    { name: '团队协作', value: 90 },
                    { name: '创新思维', value: 75 },
                    { name: '项目管理', value: 80 },
                    { name: '学习能力', value: 88 },
                ],
                color: '#3b82f6',
                fillOpacity: 0,
            },
        ],
    };

    // 多系列对比数据
    const multiSeriesData: RadarChartData = {
        series: [
            {
                name: '张三',
                data: [
                    { name: '技术能力', value: 85 },
                    { name: '沟通能力', value: 70 },
                    { name: '团队协作', value: 90 },
                    { name: '创新思维', value: 75 },
                    { name: '项目管理', value: 80 },
                    { name: '学习能力', value: 88 },
                ],
                color: '#3b82f6',
                fillOpacity: 0.2,
            },
            {
                name: '李四',
                data: [
                    { name: '技术能力', value: 75 },
                    { name: '沟通能力', value: 90 },
                    { name: '团队协作', value: 85 },
                    { name: '创新思维', value: 80 },
                    { name: '项目管理', value: 75 },
                    { name: '学习能力', value: 82 },
                ],
                color: '#ef4444',
                fillOpacity: 0.2,
            },
        ],
    };

    // 自定义维度最大值
    const customMaxData: RadarChartData = {
        series: [
            {
                name: '产品评分',
                data: [
                    { name: '性能', value: 85 },
                    { name: '设计', value: 90 },
                    { name: '易用性', value: 75 },
                    { name: '稳定性', value: 88 },
                    { name: '性价比', value: 70 },
                ],
                color: '#10b981',
                fillOpacity: 0.25,
            },
        ],
        indicators: [
            { name: '性能', max: 100 },
            { name: '设计', max: 100 },
            { name: '易用性', max: 100 },
            { name: '稳定性', max: 100 },
            { name: '性价比', max: 100 },
        ],
    };

    // 带刻度标签的雷达图数据（匹配图片样式）
    const tickRadarData: RadarChartData = {
        series: [
            {
                name: '性能指标',
                data: [
                    { name: 'G2', value: 12500 },
                    { name: 'F1', value: 8500 },
                    { name: 'F2', value: 6200 },
                    { name: 'L7', value: 7800 },
                    { name: 'X6', value: 9500 },
                    { name: 'AVA', value: 7200 },
                ],
                color: '#1677ff',
                fillOpacity: 0,
                lineWidth: 2,
                showPoints: false,
            },
        ],
    };

    // 8维度数据
    const eightDimensionData: RadarChartData = {
        series: [
            {
                name: '综合素质',
                data: [
                    { name: '领导力', value: 80 },
                    { name: '执行力', value: 85 },
                    { name: '沟通力', value: 75 },
                    { name: '协调力', value: 78 },
                    { name: '创新力', value: 70 },
                    { name: '学习力', value: 88 },
                    { name: '应变力', value: 72 },
                    { name: '决策力', value: 82 },
                ],
                color: '#8b5cf6',
                fillOpacity: 0.25,
                lineWidth: 2,
            },
        ],
    };

    // 自定义配置
    const customConfig = useMemo<RadarChartConfig>(() => ({
        padding: 30, // 减小内边距，让图表区域更大
        radiusRatio: 0.85, // 增大半径比例，接近占满 canvas
        startAngle: -90,
        animation: true,
        animationDuration: 1000,
        label: {
            display: true,
            color: '#374151',
            fontSize: 13,
            fontWeight: '600',
            offset: 16,
        },
        axis: {
            lineColor: '#d1d5db',
            lineWidth: 1.5,
            showLine: true,
        },
        grid: {
            lineColor: '#e5e7eb',
            lineWidth: 1,
            showGrid: true,
            gridCount: 5,
            fillColor: 'rgba(139, 92, 246, 0.05)',
        },
        legend: {
            display: true,
            position: 'bottom',
            labelColor: '#374151',
            labelFontSize: 13,
            align: 'center',
        },
        tooltip: {
            enabled: true,
            backgroundColor: '#ffffff',
            titleColor: '#111827',
            bodyColor: '#374151',
            fontSize: 12,
        },
    }), []);

    // 散点雷达图数据（只显示点，不连接线条）
    const scatterRadarData: RadarChartData = {
        series: [
            {
                name: '雷达扫描点',
                data: [
                    { name: '方向1', value: 30 },
                    { name: '方向2', value: 55 },
                    { name: '方向3', value: 42 },
                    { name: '方向4', value: 68 },
                    { name: '方向5', value: 35 },
                    { name: '方向6', value: 78 },
                    { name: '方向7', value: 50 },
                    { name: '方向8', value: 62 },
                ],
                color: '#10b981',
                showLine: false,  // 不显示连接线
                showPoints: true, // 显示数据点
                pointSize: 3,     // 较大的点
            },
            {
                name: '目标点',
                data: [
                    { name: '方向1', value: 65 },
                    { name: '方向2', value: 40 },
                    { name: '方向3', value: 72 },
                    { name: '方向4', value: 45 },
                    { name: '方向5', value: 58 },
                    { name: '方向6', value: 38 },
                    { name: '方向7', value: 70 },
                    { name: '方向8', value: 48 },
                ],
                color: '#ef4444',
                showLine: false,
                showPoints: true,
                pointSize: 4,
            },
        ],
    };

    // 散点雷达图配置（带扫描效果）
    const scatterRadarConfig = useMemo<RadarChartConfig>(() => ({
        padding: 40,
        radiusRatio: 0.8,
        startAngle: -90,
        animation: true,
        animationDuration: 1000,
        label: {
            display: true,
            color: '#065f46',
            fontSize: 11,
            fontWeight: '600',
            offset: 14,
        },
        axis: {
            lineColor: '#065f46',
            lineWidth: 1,
            showLine: true,
        },
        grid: {
            lineColor: 'rgba(6, 95, 70, 0.3)',
            lineWidth: 1,
            showGrid: true,
            gridCount: 4,
            fillColor: 'rgba(16, 185, 129, 0.03)',
            outerShape: 'circle',
        },
        legend: {
            display: true,
            position: 'bottom',
            labelColor: '#065f46',
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
        scan: {
            enabled: true,
            fillColor: '#40a9ff69',
            speed: 60,        // 60度/秒，更优雅的旋转速度
            sweepAngle: 60,   // 60度扇形，更大的覆盖范围
            highlightColor: '#00d4ff',
            highlightSize: 10,
        },
    }), []);

    // 雷达扫描效果数据
    const scanRadarData: RadarChartData = {
        series: [
            {
                name: '监测目标',
                data: [
                    { name: '0°', value: 45 },
                    { name: '45°', value: 72 },
                    { name: '90°', value: 38 },
                    { name: '135°', value: 85 },
                    { name: '180°', value: 55 },
                    { name: '225°', value: 68 },
                    { name: '270°', value: 42 },
                    { name: '315°', value: 78 },
                ],
                color: '#10b981',
                showLine: false,
                showPoints: true,
                pointSize: 6,
            },
            {
                name: '威胁目标',
                data: [
                    { name: '0°', value: 75 },
                    { name: '45°', value: 35 },
                    { name: '90°', value: 88 },
                    { name: '135°', value: 48 },
                    { name: '180°', value: 62 },
                    { name: '225°', value: 40 },
                    { name: '270°', value: 82 },
                    { name: '315°', value: 55 },
                ],
                color: '#ef4444',
                showLine: false,
                showPoints: true,
                pointSize: 6,
            },
        ],
    };

    // 雷达扫描效果配置
    const scanRadarConfig = useMemo<RadarChartConfig>(() => ({
        padding: 40,
        radiusRatio: 0.8,
        startAngle: -90,
        animation: true,
        animationDuration: 1000,
        label: {
            display: true,
            color: '#374151',
            fontSize: 11,
            fontWeight: '500',
            offset: 12,
        },
        axis: {
            lineColor: '#374151',
            lineWidth: 1,
            showLine: true,
        },
        grid: {
            lineColor: '#065f46',
            lineWidth: 1,
            showGrid: true,
            gridCount: 4,
            fillColor: 'rgba(6, 95, 70, 0.05)',
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
        scan: {
            enabled: true,
            lineColor: 'rgba(16, 185, 129, 0.8)',
            lineWidth: 2,
            fillColor: 'rgba(16, 185, 129, 0.2)',
            speed: 90,        // 90度/秒
            sweepAngle: 45,   // 45度扇形
            highlightColor: '#10b981',
            highlightSize: 12,
        },
    }), []);

    // 平滑曲线数据
    const smoothData: RadarChartData = {
        series: [
            {
                name: '产品能力',
                data: [
                    { name: '性能', value: 85 },
                    { name: '设计', value: 92 },
                    { name: '易用性', value: 78 },
                    { name: '稳定性', value: 88 },
                    { name: '性价比', value: 75 },
                    { name: '服务', value: 82 },
                ],
                color: '#f59e0b',
                fillOpacity: 0.3,
                smooth: true,
            },
            {
                name: '竞品对比',
                data: [
                    { name: '性能', value: 75 },
                    { name: '设计', value: 80 },
                    { name: '易用性', value: 85 },
                    { name: '稳定性', value: 82 },
                    { name: '性价比', value: 90 },
                    { name: '服务', value: 78 },
                ],
                color: '#3b82f6',
                fillOpacity: 0.3,
                smooth: true,
            },
        ],
    };

    // 平滑曲线配置
    const smoothConfig = useMemo<RadarChartConfig>(() => ({
        ...customConfig,
        grid: {
            ...customConfig.grid,
            outerShape: 'circle',
            gridCount: 5,
            lineColor: '#e5e7eb',
            fillColor: 'transparent',
        },
        point: {
            display: false
        },
    }), [customConfig]);

    // 不带动画的配置
    const noAnimationConfig = useMemo<RadarChartConfig>(() => ({
        ...customConfig,
        animation: false,
    }), [customConfig]);

    // 自定义提示框配置
    const customTooltipConfig = useMemo<RadarChartConfig>(() => ({
        ...customConfig,
        tooltip: {
            enabled: true,
            customContent: ({ seriesName, item }) => {
                return `
                    <div style="font-weight: 600; margin-bottom: 4px; color: #111827;">${seriesName}</div>
                    <div style="color: #374151;">${item.name}: <span style="font-weight: 600; color: #3b82f6;">${item.value}分</span></div>
                `;
            },
        },
    }), [customConfig]);

    // 圆形网格配置（带刻度标签）- 优化布局让图表占满 canvas
    const circleGridConfig = useMemo<RadarChartConfig>(() => ({
        padding: 30, // 减小内边距，让图表区域更大
        radiusRatio: 0.85, // 增大半径比例，接近占满 canvas
        startAngle: -90,
        animation: true,
        animationDuration: 1000,
        label: {
            display: true,
            color: '#374151',
            fontSize: 13,
            fontWeight: '600',
            offset: 16,
        },
        axis: {
            lineColor: '#d1d5db',
            lineWidth: 1.5,
            showLine: true,
        },
        grid: {
            showGrid: true,
            lineColor: '#d1d5db',
            lineWidth: 1,
            gridCount: 7,
            fillColor: 'transparent',
            outerShape: 'circle',
        },
        legend: {
            display: true,
            position: 'bottom',
            labelColor: '#374151',
            labelFontSize: 13,
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
            size: 0,
            fillColor: '#ffffff',
            strokeWidth: 2,
        },
        tick: {
            display: true,
            color: '#6b7280',
            fontSize: 11,
            offset: 6,
            formatter: (value: number) => {
                // 先对数值进行四舍五入，避免浮点精度问题
                const roundedValue = Math.round(value * 100) / 100;
                if (roundedValue >= 1000) {
                    return Math.round(roundedValue / 1000) + 'K';
                }
                // 判断是否为整数，如果是整数则不显示小数位
                return Number.isInteger(roundedValue)
                    ? roundedValue.toString()
                    : roundedValue.toFixed(2).replace(/\.?0+$/, '');
            },
        },
    }), []);

    // 带刻度标签的雷达图配置
    const tickRadarConfig = useMemo<RadarChartConfig>(() => ({
        padding: 30, // 减小内边距，让图表区域更大
        radiusRatio: 0.85, // 增大半径比例，接近占满 canvas
        startAngle: -90,
        animation: true,
        animationDuration: 1000,
        label: {
            display: true,
            color: '#374151',
            fontSize: 13,
            fontWeight: '500',
            offset: 24,
        },
        axis: {
            lineColor: '#d9d9d9',
            lineWidth: 1,
            showLine: true,
        },
        tick: {
            display: true,
            color: '#6b7280',
            fontSize: 11,
            offset: 6,
            formatter: (value: number) => {
                if (value >= 1000) {
                    return Math.round(value / 1000) + 'K';
                }
                return value.toString();
            },
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
            display: false,
        },
        tooltip: {
            enabled: true,
            backgroundColor: '#ffffff',
            titleColor: '#111827',
            bodyColor: '#374151',
            fontSize: 12,
        },
    }), []);

    // 基础雷达图代码
    const basicCode = `import { Radar } from '@zjpcy/charts-design';

const BasicRadarExample = () => {
    const data = {
        series: [
            {
                name: '能力评估',
                data: [
                    { name: '技术能力', value: 85 },
                    { name: '沟通能力', value: 70 },
                    { name: '团队协作', value: 90 },
                    { name: '创新思维', value: 75 },
                    { name: '项目管理', value: 80 },
                    { name: '学习能力', value: 88 },
                ],
                color: '#3b82f6',
                fillOpacity: 0.3,
            },
        ],
    };

    return (
        <Radar
            data={data}
            width={400}
            height={400}
            config={{
                padding: 80,
                radiusRatio: 0.6,
                startAngle: -90,
                animation: true,
                label: {
                    display: true,
                    color: '#374151',
                    fontSize: 13,
                },
                legend: {
                    display: true,
                    position: 'bottom',
                },
            }}
        />
    );
};`;

    // 多系列对比代码
    const multiSeriesCode = `import { Radar } from '@zjpcy/charts-design';

const MultiSeriesRadarExample = () => {
    const data = {
        series: [
            {
                name: '张三',
                data: [
                    { name: '技术能力', value: 85 },
                    { name: '沟通能力', value: 70 },
                    { name: '团队协作', value: 90 },
                    { name: '创新思维', value: 75 },
                    { name: '项目管理', value: 80 },
                    { name: '学习能力', value: 88 },
                ],
                color: '#3b82f6',
                fillOpacity: 0.2,
            },
            {
                name: '李四',
                data: [
                    { name: '技术能力', value: 75 },
                    { name: '沟通能力', value: 90 },
                    { name: '团队协作', value: 85 },
                    { name: '创新思维', value: 80 },
                    { name: '项目管理', value: 75 },
                    { name: '学习能力', value: 82 },
                ],
                color: '#ef4444',
                fillOpacity: 0.2,
            },
        ],
    };

    return (
        <Radar
            data={data}
            width={400}
            height={400}
            config={{
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                },
            }}
        />
    );
};`;

    // 自定义维度代码
    const customIndicatorCode = `import { Radar } from '@zjpcy/charts-design';

const CustomIndicatorExample = () => {
    const data = {
        series: [
            {
                name: '产品评分',
                data: [
                    { name: '性能', value: 85 },
                    { name: '设计', value: 90 },
                    { name: '易用性', value: 75 },
                    { name: '稳定性', value: 88 },
                    { name: '性价比', value: 70 },
                ],
                color: '#10b981',
                fillOpacity: 0.25,
            },
        ],
        indicators: [
            { name: '性能', max: 100 },
            { name: '设计', max: 100 },
            { name: '易用性', max: 100 },
            { name: '稳定性', max: 100 },
            { name: '性价比', max: 100 },
        ],
    };

    return (
        <Radar
            data={data}
            width={400}
            height={400}
            config={{
                legend: {
                    display: true,
                    position: 'bottom',
                },
            }}
        />
    );
};`;

    // 无动画代码
    const noAnimationCode = `import { Radar } from '@zjpcy/charts-design';

const NoAnimationExample = () => {
    const data = {
        series: [
            {
                name: '能力评估',
                data: [
                    { name: '技术能力', value: 85 },
                    { name: '沟通能力', value: 70 },
                    { name: '团队协作', value: 90 },
                    { name: '创新思维', value: 75 },
                    { name: '项目管理', value: 80 },
                    { name: '学习能力', value: 88 },
                ],
                color: '#3b82f6',
                fillOpacity: 0.3,
            },
        ],
    };

    return (
        <Radar
            data={data}
            width={400}
            height={400}
            config={{
                animation: false,  // 关闭动画
            }}
        />
    );
};`;

    // 自定义提示框代码
    const customTooltipCode = `import { Radar } from '@zjpcy/charts-design';

const CustomTooltipExample = () => {
    const data = {
        series: [
            {
                name: '张三',
                data: [
                    { name: '技术能力', value: 85 },
                    { name: '沟通能力', value: 70 },
                    { name: '团队协作', value: 90 },
                    { name: '创新思维', value: 75 },
                    { name: '项目管理', value: 80 },
                    { name: '学习能力', value: 88 },
                ],
                color: '#3b82f6',
                fillOpacity: 0.2,
            },
            {
                name: '李四',
                data: [
                    { name: '技术能力', value: 75 },
                    { name: '沟通能力', value: 90 },
                    { name: '团队协作', value: 85 },
                    { name: '创新思维', value: 80 },
                    { name: '项目管理', value: 75 },
                    { name: '学习能力', value: 82 },
                ],
                color: '#ef4444',
                fillOpacity: 0.2,
            },
        ],
    };

    return (
        <Radar
            data={data}
            width={400}
            height={400}
            config={{
                tooltip: {
                    enabled: true,
                    customContent: ({ seriesName, item }) => {
                        return \`
                            <div style="font-weight: 600; margin-bottom: 4px;">
                                \${seriesName}
                            </div>
                            <div>\${item.name}: <span style="font-weight: 600;">
                                \${item.value}分</span>
                            </div>
                        \`;
                    },
                },
            }}
        />
    );
};`;

    // 散点雷达图代码
    const scatterRadarCode = `import { Radar } from '@zjpcy/charts-design';

const ScatterRadarExample = () => {
    const data = {
        series: [
            {
                name: '雷达扫描点',
                data: [
                    { name: '方向1', value: 30 },
                    { name: '方向2', value: 55 },
                    { name: '方向3', value: 42 },
                    { name: '方向4', value: 68 },
                    { name: '方向5', value: 35 },
                    { name: '方向6', value: 78 },
                    { name: '方向7', value: 50 },
                    { name: '方向8', value: 62 },
                ],
                color: '#10b981',
                showLine: false,  // 不显示连接线，只显示点
                showPoints: true, // 显示数据点
                pointSize: 8,     // 点的大小
            },
            {
                name: '目标点',
                data: [
                    { name: '方向1', value: 65 },
                    { name: '方向2', value: 40 },
                    { name: '方向3', value: 72 },
                    { name: '方向4', value: 45 },
                    { name: '方向5', value: 58 },
                    { name: '方向6', value: 38 },
                    { name: '方向7', value: 70 },
                    { name: '方向8', value: 48 },
                ],
                color: '#ef4444',
                showLine: false,
                showPoints: true,
                pointSize: 6,
            },
        ],
    };

    return (
        <Radar
            data={data}
            width={400}
            height={400}
            config={{
                grid: {
                    outerShape: 'circle',
                    gridCount: 4,
                    lineColor: 'rgba(6, 95, 70, 0.3)',
                    fillColor: 'rgba(16, 185, 129, 0.03)',
                },
                axis: {
                    lineColor: '#065f46',
                },
                legend: {
                    display: true,
                    position: 'bottom',
                },
                scan: {
                    enabled: true,                              // 启用雷达扫描效果
                    lineColor: '#00d4ff',                       // 扫描线颜色（青色）
                    lineWidth: 2,
                    fillColor: 'rgba(0, 212, 255, 0.15)',      // 扫描区域填充
                    speed: 60,                                  // 扫描速度（度/秒）
                    sweepAngle: 60,                             // 扫描扇形角度
                    highlightColor: '#00d4ff',                  // 高亮点颜色
                    highlightSize: 10,                          // 高亮点大小
                },
            }}
        />
    );
};`;

    // 平滑曲线代码
    const smoothCode = `import { Radar } from '@zjpcy/charts-design';

const SmoothRadarExample = () => {
    const data = {
        series: [
            {
                name: '产品能力',
                data: [
                    { name: '性能', value: 85 },
                    { name: '设计', value: 92 },
                    { name: '易用性', value: 78 },
                    { name: '稳定性', value: 88 },
                    { name: '性价比', value: 75 },
                    { name: '服务', value: 82 },
                ],
                color: '#f59e0b',
                fillOpacity: 0.3,
                smooth: true,  // 启用平滑曲线
            },
            {
                name: '竞品对比',
                data: [
                    { name: '性能', value: 75 },
                    { name: '设计', value: 80 },
                    { name: '易用性', value: 85 },
                    { name: '稳定性', value: 82 },
                    { name: '性价比', value: 90 },
                    { name: '服务', value: 78 },
                ],
                color: '#3b82f6',
                fillOpacity: 0.3,
                smooth: true,  // 启用平滑曲线
            },
        ],
    };

    return (
        <Radar
            data={data}
            width={400}
            height={400}
            config={{
                grid: {
                    outerShape: 'circle',
                    gridCount: 5,
                },
            }}
        />
    );
};`;

    // 圆形网格代码
    const circleGridCode = `import { Radar } from '@zjpcy/charts-design';

const CircleGridRadarExample = () => {
    const data = {
        series: [
            {
                name: '能力评估',
                data: [
                    { name: '技术能力', value: 85 },
                    { name: '沟通能力', value: 70 },
                    { name: '团队协作', value: 90 },
                    { name: '创新思维', value: 75 },
                    { name: '项目管理', value: 80 },
                    { name: '学习能力', value: 88 },
                ],
                color: '#8b5cf6',
                fillOpacity: 0.25,
            },
        ],
    };

    return (
        <Radar
            data={data}
            width={400}
            height={400}
            config={{
                grid: {
                    outerShape: 'circle',  // 圆形外轮廓
                    gridCount: 4,
                    lineColor: '#d1d5db',
                },
            }}
        />
    );
};`;

    // API 表格列定义
    const apiColumns: Column[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值', width: '100px' }
    ];

    // Radar 组件 API 数据
    const apiData = [
        { param: 'data', description: '图表数据', type: 'RadarChartData', default: 'required' },
        { param: 'width', description: '图表宽度', type: 'number', default: '400' },
        { param: 'height', description: '图表高度', type: 'number', default: '400' },
        { param: 'config', description: '图表配置', type: 'RadarChartConfig', default: '-' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'React.CSSProperties', default: '-' },
    ];

    // Point 配置数据（数据点配置）
    const pointDataAPI = [
        { param: 'display', description: '是否显示数据点（可被 series.showPoints 覆盖）', type: 'boolean', default: 'true' },
        { param: 'size', description: '数据点大小（像素）', type: 'number', default: '5' },
        { param: 'fillColor', description: '数据点填充颜色', type: 'string', default: "'#ffffff'" },
        { param: 'strokeWidth', description: '数据点边框宽度', type: 'number', default: '2' },
    ];

    // DataSeries API
    const seriesDataAPI = [
        { param: 'name', description: '系列名称', type: 'string', default: 'required' },
        { param: 'data', description: '数据点数组', type: 'Array<{name: string, value: number}>', default: 'required' },
        { param: 'color', description: '线条颜色', type: 'string', default: '-' },
        { param: 'fillOpacity', description: '填充透明度 (0-1)', type: 'number', default: '0.3' },
        { param: 'lineWidth', description: '线条宽度', type: 'number', default: '2' },
        { param: 'showLine', description: '是否显示连接线', type: 'boolean', default: 'true' },
        { param: 'showPoints', description: '是否显示数据点', type: 'boolean', default: 'true' },
        { param: 'pointSize', description: '数据点大小', type: 'number', default: '5' },
        { param: 'smooth', description: '是否使用平滑曲线', type: 'boolean', default: 'false' },
    ];

    // Label 配置数据
    const labelDataAPI = [
        { param: 'display', description: '是否显示标签', type: 'boolean', default: 'true' },
        { param: 'color', description: '标签文字颜色', type: 'string', default: "'#374151'" },
        { param: 'fontSize', description: '标签字体大小', type: 'number', default: '12' },
        { param: 'fontWeight', description: '标签字体粗细', type: 'string', default: "'600'" },
        { param: 'offset', description: '标签偏移距离', type: 'number', default: '12' },
    ];

    // Legend 配置数据
    const legendDataAPI = [
        { param: 'display', description: '是否显示图例', type: 'boolean', default: 'true' },
        { param: 'position', description: '图例位置', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'" },
        { param: 'align', description: '图例对齐方式', type: "'left' | 'center' | 'right'", default: "'center'" },
        { param: 'labelColor', description: '图例文字颜色', type: 'string', default: "'#374151'" },
        { param: 'labelFontSize', description: '图例字体大小', type: 'number', default: '12' },
    ];

    // Tooltip 配置数据
    const tooltipDataAPI = [
        { param: 'enabled', description: '是否显示提示框', type: 'boolean', default: 'true' },
        { param: 'backgroundColor', description: '提示框背景色', type: 'string', default: "'#ffffff'" },
        { param: 'titleColor', description: '标题颜色', type: 'string', default: "'#111827'" },
        { param: 'bodyColor', description: '内容颜色', type: 'string', default: "'#374151'" },
        { param: 'fontSize', description: '字体大小', type: 'number', default: '12' },
        { param: 'customContent', description: '自定义内容函数', type: '(data) => string', default: '-' },
    ];

    // Grid 配置数据
    const gridDataAPI = [
        { param: 'showGrid', description: '是否显示网格', type: 'boolean', default: 'true' },
        { param: 'lineColor', description: '网格线颜色', type: 'string', default: "'#e5e7eb'" },
        { param: 'lineWidth', description: '网格线宽度', type: 'number', default: '1' },
        { param: 'gridCount', description: '网格圈数', type: 'number', default: '5' },
        { param: 'fillColor', description: '网格填充色', type: 'string', default: '-' },
        { param: 'outerShape', description: '外轮廓形状', type: "'polygon' | 'circle'", default: "'polygon'" },
    ];

    // Axis 配置数据
    const axisDataAPI = [
        { param: 'showLine', description: '是否显示轴线', type: 'boolean', default: 'true' },
        { param: 'lineColor', description: '轴线颜色', type: 'string', default: "'#d1d5db'" },
        { param: 'lineWidth', description: '轴线宽度', type: 'number', default: '1.5' },
    ];

    // Animation 配置数据
    const animationDataAPI = [
        { param: 'animation', description: '是否开启动画', type: 'boolean', default: 'true' },
        { param: 'animationDuration', description: '动画时长（毫秒）', type: 'number', default: '1000' },
        { param: 'padding', description: '图表内边距', type: 'number', default: '80' },
        { param: 'radiusRatio', description: '半径比例 (0-1)', type: 'number', default: '0.65' },
        { param: 'startAngle', description: '起始角度（度）', type: 'number', default: '-90' },
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.sectionTitle} id="radar-intro">Radar 雷达图</h2>
                    <p className={styles.sectionText}>
                        雷达图又称蜘蛛网图或星图，是一种将多个维度的数据以二维图表形式展示的可视化工具。
                        适用于多维指标的综合评估和对比分析。
                    </p>

                    {/* 基础雷达图 */}
                    <div className={styles.exampleSection} id="radar-basic">
                        <h3 className={styles.subsectionTitle}>基础雷达图</h3>
                        <p className={styles.sectionText}>单系列雷达图，展示单个对象的多维度能力评估。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={basicData} width={400} height={400} config={customConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={basicCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {basicCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 多系列对比 */}
                    <div className={styles.exampleSection} id="radar-multi">
                        <h3 className={styles.subsectionTitle}>多系列对比</h3>
                        <p className={styles.sectionText}>同时展示多个对象的综合表现，便于对比分析。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={multiSeriesData} width={400} height={400} config={customConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={multiSeriesCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {multiSeriesCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义维度 */}
                    <div className={styles.exampleSection} id="radar-indicator">
                        <h3 className={styles.subsectionTitle}>自定义维度</h3>
                        <p className={styles.sectionText}>通过 indicators 配置各维度的最大值，控制雷达图的量程。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={customMaxData} width={400} height={400} config={customConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={customIndicatorCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {customIndicatorCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 8维度展示 */}
                    <div className={styles.exampleSection} id="radar-8dimension">
                        <h3 className={styles.subsectionTitle}>8维度展示</h3>
                        <p className={styles.sectionText}>雷达图支持最多 12 个维度的数据展示。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={eightDimensionData} width={400} height={400} config={customConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={basicCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {basicCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 无动画 */}
                    <div className={styles.exampleSection} id="radar-no-animation">
                        <h3 className={styles.subsectionTitle}>无动画</h3>
                        <p className={styles.sectionText}>关闭动画效果，图表立即完整呈现。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={basicData} width={400} height={400} config={noAnimationConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={noAnimationCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {noAnimationCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义提示框 */}
                    <div className={styles.exampleSection} id="radar-tooltip">
                        <h3 className={styles.subsectionTitle}>自定义提示框</h3>
                        <p className={styles.sectionText}>通过 customContent 自定义提示框内容。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={multiSeriesData} width={400} height={400} config={customTooltipConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={customTooltipCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {customTooltipCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 散点雷达图 */}
                    <div className={styles.exampleSection} id="radar-scatter">
                        <h3 className={styles.subsectionTitle}>散点雷达图（带扫描效果）</h3>
                        <p className={styles.sectionText}>通过设置 showLine: false 只显示数据点，同时启用 scan 配置添加雷达扫描效果。扫描线会旋转并高亮经过的数据点，适合展示雷达监测、信号扫描等场景。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={scatterRadarData} width={400} height={400} config={scatterRadarConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={scatterRadarCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {scatterRadarCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 平滑曲线 */}
                    <div className={styles.exampleSection} id="radar-smooth">
                        <h3 className={styles.subsectionTitle}>平滑曲线</h3>
                        <p className={styles.sectionText}>通过设置 smooth: true，将雷达图的折线改为贝塞尔平滑曲线，呈现更加流畅的视觉效果。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={smoothData} width={400} height={400} config={smoothConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={smoothCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {smoothCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 圆形网格 */}
                    <div className={styles.exampleSection} id="radar-circle-grid">
                        <h3 className={styles.subsectionTitle}>圆形网格</h3>
                        <p className={styles.sectionText}>通过设置 outerShape: 'circle'，将网格外轮廓改为圆形，呈现更加柔和的视觉效果。</p>
                        <div className={styles.exampleDemo}>
                            <Radar data={basicData} width={400} height={400} config={circleGridConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={circleGridCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {circleGridCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 组件特性 */}
                    <div className={styles.exampleSection} id="radar-features">
                        <h3 className={styles.subsectionTitle}>组件特性</h3>
                        <div className={styles.features}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🕸️ 辐射状坐标轴</div>
                                <div className={styles.featureDesc}>从中心向外辐射出若干条等距坐标轴，每个轴代表一个维度，形似雷达的扫描波纹。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>⬡ 多边形闭合曲线</div>
                                <div className={styles.featureDesc}>将各维度数据点连接成闭合多边形，通过面积或形状对比不同对象的综合表现。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>📊 多维度并行展示</div>
                                <div className={styles.featureDesc}>可同时展示 3-12 个维度的数据，适合多维指标的综合评估。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🔄 多系列对比</div>
                                <div className={styles.featureDesc}>可在同一图表中展示多组数据，便于对比分析不同对象的优劣势。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>📐 自适应布局</div>
                                <div className={styles.featureDesc}>支持响应式布局，自动适应容器尺寸变化。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>⚙️ 丰富配置</div>
                                <div className={styles.featureDesc}>支持自定义颜色、标签、网格、动画等丰富的配置选项。</div>
                            </div>
                        </div>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="radar-api">
                        <h3 className={styles.subsectionTitle}>API 参考</h3>
                        <p className={styles.sectionText}>Radar 组件的属性配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={apiData} />
                        </div>
                    </div>

                    {/* DataSeries 配置 */}
                    <div className={styles.exampleSection} id="radar-series">
                        <h3 className={styles.subsectionTitle}>DataSeries 配置</h3>
                        <p className={styles.sectionText}>数据系列配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={seriesDataAPI} />
                        </div>
                    </div>

                    {/* Label 配置 */}
                    <div className={styles.exampleSection} id="radar-label">
                        <h3 className={styles.subsectionTitle}>Label 配置</h3>
                        <p className={styles.sectionText}>标签配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={labelDataAPI} />
                        </div>
                    </div>

                    {/* Legend 配置 */}
                    <div className={styles.exampleSection} id="radar-legend">
                        <h3 className={styles.subsectionTitle}>Legend 配置</h3>
                        <p className={styles.sectionText}>图例配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={legendDataAPI} />
                        </div>
                    </div>

                    {/* Tooltip 配置 */}
                    <div className={styles.exampleSection} id="radar-tooltip-api">
                        <h3 className={styles.subsectionTitle}>Tooltip 配置</h3>
                        <p className={styles.sectionText}>提示框配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={tooltipDataAPI} />
                        </div>
                    </div>

                    {/* Grid 配置 */}
                    <div className={styles.exampleSection} id="radar-grid">
                        <h3 className={styles.subsectionTitle}>Grid 配置</h3>
                        <p className={styles.sectionText}>网格配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={gridDataAPI} />
                        </div>
                    </div>

                    {/* Axis 配置 */}
                    <div className={styles.exampleSection} id="radar-axis">
                        <h3 className={styles.subsectionTitle}>Axis 配置</h3>
                        <p className={styles.sectionText}>坐标轴配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={axisDataAPI} />
                        </div>
                    </div>

                    {/* Point 配置 */}
                    <div className={styles.exampleSection} id="radar-point">
                        <h3 className={styles.subsectionTitle}>Point 配置</h3>
                        <p className={styles.sectionText}>数据点配置项说明，控制雷达图端点的显示样式。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={pointDataAPI} />
                        </div>
                    </div>

                    {/* 其他配置 */}
                    <div className={styles.exampleSection} id="radar-other">
                        <h3 className={styles.subsectionTitle}>其他配置</h3>
                        <p className={styles.sectionText}>动画、布局等配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={animationDataAPI} />
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
                                <Anchor.Link href="#radar-intro" title="组件介绍" />
                                <Anchor.Link href="#radar-basic" title="基础雷达图" />
                                <Anchor.Link href="#radar-multi" title="多系列对比" />
                                <Anchor.Link href="#radar-indicator" title="自定义维度" />
                                <Anchor.Link href="#radar-8dimension" title="8维度展示" />
                                <Anchor.Link href="#radar-no-animation" title="无动画" />
                                <Anchor.Link href="#radar-tooltip" title="自定义提示框" />
                                <Anchor.Link href="#radar-scatter" title="散点雷达图" />
                                <Anchor.Link href="#radar-smooth" title="平滑曲线" />
                                <Anchor.Link href="#radar-circle-grid" title="圆形网格" />
                                <Anchor.Link href="#radar-features" title="组件特性" />
                                <Anchor.Link href="#radar-api" title="API 参考" />
                                    <Anchor.Link href="#radar-series" title="Series 配置" />
                                    <Anchor.Link href="#radar-label" title="Label 配置" />
                                    <Anchor.Link href="#radar-legend" title="Legend 配置" />
                                    <Anchor.Link href="#radar-tooltip-api" title="Tooltip 配置" />
                                    <Anchor.Link href="#radar-grid" title="Grid 配置" />
                                    <Anchor.Link href="#radar-axis" title="Axis 配置" />
                                    <Anchor.Link href="#radar-point" title="Point 配置" />
                                    <Anchor.Link href="#radar-other" title="其他配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
