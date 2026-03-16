'use client';

import React, { useState, useEffect } from 'react';
import { Gauge } from '@/components/Gauge';
import { Flex, Table, Anchor } from '@zjpcy/simple-design';
import type { Column as TableColumn } from '@zjpcy/simple-design';
import { Prism } from 'react-syntax-highlighter';
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
            type="button"
        >
            {copied ? '已复制 ✓' : '复制代码'}
        </button>
    );
};

/**
 * 仪表盘示例页面
 */
export default function GaugeChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
    const [basicValue, setBasicValue] = useState(65);

    useEffect(() => {
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);


    // API 表格列定义
    const apiColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值' },
    ];

    // API 表格数据
    const apiData = [
        { param: 'data', description: '图表数据', type: 'GaugeData', default: '必填' },
        { param: 'config', description: '图表配置', type: 'GaugeChartConfig', default: '{}' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'CSSProperties', default: '-' },
        { param: 'onChange', description: '数值变化回调', type: '(value: number) => void', default: '-' },
        { param: 'onClick', description: '点击回调', type: '(data: GaugeData) => void', default: '-' },
        { param: 'onReady', description: '渲染完成回调', type: '() => void', default: '-' },
    ];

    return (
        <Flex className={styles.examplePage}>
            {/* 主内容区 */}
            <div className={styles.mainContent}>
                {/* 页面标题 */}
                <h1 className={styles.sectionTitle}>Gauge 仪表盘</h1>
                <p className={styles.sectionText}>
                    用于展示数据的进度、比例或比较情况，支持半圆和整圆两种类型，
                    广泛应用于业务指标展示、系统监控、设备仪表等场景。
                </p>

                {/* 基础用法 */}
                <section className={styles.exampleSection} id="basic">
                    <h2 className={styles.subsectionTitle}>基础用法</h2>
                    <p className={styles.subsectionText}>最简单的仪表盘用法，展示当前数值和进度。</p>
                    <div className={styles.controlPanel}>
                        <label className={styles.controlLabel}>
                            当前数值: {basicValue}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={basicValue}
                                onChange={(e) => setBasicValue(Number(e.target.value))}
                                className={styles.slider}
                            />
                        </label>
                    </div>
                    <div className={styles.exampleDemo}>
                        <Gauge
                            data={{ value: basicValue, name: '完成率', unit: '%' }}
                            config={{
                                type: 'semi',
                                animationDuration: 800,
                            }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const BasicExample = () => {
    return (
        <Gauge
            data={{ value: 65, name: '完成率', unit: '%' }}
            config={{
                type: 'semi',
                animationDuration: 800,
            }}
        />
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const BasicExample = () => {
    return (
        <Gauge
            data={{ value: 65, name: '完成率', unit: '%' }}
            config={{
                type: 'semi',
                animationDuration: 800,
            }}
        />
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* 多彩渐变 */}
                <section className={styles.exampleSection} id="gradient">
                    <h2 className={styles.subsectionTitle}>多彩渐变</h2>
                    <p className={styles.subsectionText}>使用渐变色和区间标记，让数据状态一目了然。</p>
                    <div className={styles.exampleDemo}>
                        <Gauge
                            data={{ value: 78, name: '性能指标' }}
                            config={{
                                type: 'semi',
                                progress: {
                                    width: 16,
                                    color: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
                                    rounded: true,
                                    shadow: true,
                                },
                                ranges: [
                                    { from: 0, to: 30, color: '#10b981' },
                                    { from: 30, to: 70, color: '#f59e0b' },
                                    { from: 70, to: 100, color: '#ef4444' },
                                ],
                            }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const GradientExample = () => {
    return (
        <Gauge
            data={{ value: 78, name: '性能指标' }}
            config={{
                type: 'semi',
                progress: {
                    width: 16,
                    color: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
                    rounded: true,
                    shadow: true,
                },
                ranges: [
                    { from: 0, to: 30, color: '#10b981' },
                    { from: 30, to: 70, color: '#f59e0b' },
                    { from: 70, to: 100, color: '#ef4444' },
                ],
            }}
        />
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const GradientExample = () => {
    return (
        <Gauge
            data={{ value: 78, name: '性能指标' }}
            config={{
                type: 'semi',
                progress: {
                    width: 16,
                    color: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
                    rounded: true,
                    shadow: true,
                },
                ranges: [
                    { from: 0, to: 30, color: '#10b981' },
                    { from: 30, to: 70, color: '#f59e0b' },
                    { from: 70, to: 100, color: '#ef4444' },
                ],
            }}
        />
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* 速度表 */}
                <section className={styles.exampleSection} id="speedometer">
                    <h2 className={styles.subsectionTitle}>速度表样式</h2>
                    <p className={styles.subsectionText}>自定义范围和刻度格式，模拟汽车速度表。</p>
                    <div className={styles.exampleDemo}>
                        <Gauge
                            data={{ value: 120, name: '速度' }}
                            config={{
                                type: 'semi',
                                axis: {
                                    min: 0,
                                    max: 240,
                                    tickInterval: 40,
                                    subTickCount: 3,
                                    labelFormatter: (v: number) => `${v}`,
                                },
                                progress: {
                                    width: 10,
                                    color: '#ef4444',
                                    rounded: true,
                                },
                                pointer: {
                                    length: 0.85,
                                    width: 3,
                                    color: '#374151',
                                },
                                valueText: {
                                    format: '{value}',
                                    fontSize: 36,
                                    offsetY: 30,
                                },
                                titleText: {
                                    format: 'km/h',
                                    fontSize: 14,
                                    offsetY: 60,
                                },
                                ranges: [
                                    { from: 0, to: 80, color: '#10b981' },
                                    { from: 80, to: 160, color: '#f59e0b' },
                                    { from: 160, to: 240, color: '#ef4444' },
                                ],
                            }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const SpeedometerExample = () => {
    return (
        <Gauge
            data={{ value: 120, name: '速度' }}
            config={{
                type: 'semi',
                axis: {
                    min: 0,
                    max: 240,
                    tickInterval: 40,
                    subTickCount: 3,
                    labelFormatter: (v: number) => \`\${v}\`,
                },
                progress: {
                    width: 10,
                    color: '#ef4444',
                    rounded: true,
                },
                pointer: {
                    length: 0.85,
                    width: 3,
                    color: '#374151',
                },
                valueText: {
                    format: '{value}',
                    fontSize: 36,
                    offsetY: 30,
                },
                titleText: {
                    format: 'km/h',
                    fontSize: 14,
                    offsetY: 60,
                },
                ranges: [
                    { from: 0, to: 80, color: '#10b981' },
                    { from: 80, to: 160, color: '#f59e0b' },
                    { from: 160, to: 240, color: '#ef4444' },
                ],
            }}
        />
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const SpeedometerExample = () => {
    return (
        <Gauge
            data={{ value: 120, name: '速度' }}
            config={{
                type: 'semi',
                axis: {
                    min: 0,
                    max: 240,
                    tickInterval: 40,
                    subTickCount: 3,
                    labelFormatter: (v: number) => \`\${v}\`,
                },
                progress: {
                    width: 10,
                    color: '#ef4444',
                    rounded: true,
                },
                pointer: {
                    length: 0.85,
                    width: 3,
                    color: '#374151',
                },
                valueText: {
                    format: '{value}',
                    fontSize: 36,
                    offsetY: 30,
                },
                titleText: {
                    format: 'km/h',
                    fontSize: 14,
                    offsetY: 60,
                },
                ranges: [
                    { from: 0, to: 80, color: '#10b981' },
                    { from: 80, to: 160, color: '#f59e0b' },
                    { from: 160, to: 240, color: '#ef4444' },
                ],
            }}
        />
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* 极简风格 */}
                <section className={styles.exampleSection} id="minimal">
                    <h2 className={styles.subsectionTitle}>极简风格</h2>
                    <p className={styles.subsectionText}>隐藏指针和刻度，简洁显示进度。</p>
                    <div className={styles.exampleDemo}>
                        <Gauge
                            data={{ value: 45, name: '加载进度' }}
                            config={{
                                type: 'semi',
                                axis: {
                                    tickVisible: false,
                                },
                                progress: {
                                    width: 8,
                                    color: '#8b5cf6',
                                },
                                pointer: {
                                    visible: false,
                                },
                                pivot: {
                                    visible: false,
                                },
                                titleText: {
                                    visible: false,
                                },
                            }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const MinimalExample = () => {
    return (
        <Gauge
            data={{ value: 45, name: '加载进度' }}
            config={{
                type: 'semi',
                axis: {
                    tickVisible: false,
                },
                progress: {
                    width: 8,
                    color: '#8b5cf6',
                },
                pointer: {
                    visible: false,
                },
                pivot: {
                    visible: false,
                },
                titleText: {
                    visible: false,
                },
            }}
        />
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const MinimalExample = () => {
    return (
        <Gauge
            data={{ value: 45, name: '加载进度' }}
            config={{
                type: 'semi',
                axis: {
                    tickVisible: false,
                },
                progress: {
                    width: 8,
                    color: '#8b5cf6',
                },
                pointer: {
                    visible: false,
                },
                pivot: {
                    visible: false,
                },
                titleText: {
                    visible: false,
                },
            }}
        />
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* 大数值范围 */}
                <section className={styles.exampleSection} id="large-range">
                    <h2 className={styles.subsectionTitle}>大数值范围</h2>
                    <p className={styles.subsectionText}>自定义数值范围和格式化显示。</p>
                    <div className={styles.exampleDemo}>
                        <Gauge
                            data={{ value: 6500, name: '销售额' }}
                            config={{
                                type: 'semi',
                                axis: {
                                    min: 0,
                                    max: 10000,
                                    tickInterval: 2500,
                                    labelFormatter: (v: number) => `${v / 1000}k`,
                                },
                                progress: { color: '#06b6d4', width: 14 },
                                valueText: {
                                    format: '{value}',
                                    fontSize: 28,
                                },
                            }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const LargeRangeExample = () => {
    return (
        <Gauge
            data={{ value: 6500, name: '销售额' }}
            config={{
                type: 'semi',
                axis: {
                    min: 0,
                    max: 10000,
                    tickInterval: 2500,
                    labelFormatter: (v: number) => \`\${v / 1000}k\`,
                },
                progress: { color: '#06b6d4', width: 14 },
                valueText: {
                    format: '{value}',
                    fontSize: 28,
                },
            }}
        />
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const LargeRangeExample = () => {
    return (
        <Gauge
            data={{ value: 6500, name: '销售额' }}
            config={{
                type: 'semi',
                axis: {
                    min: 0,
                    max: 10000,
                    tickInterval: 2500,
                    labelFormatter: (v: number) => \`\${v / 1000}k\`,
                },
                progress: { color: '#06b6d4', width: 14 },
                valueText: {
                    format: '{value}',
                    fontSize: 28,
                },
            }}
        />
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* 自定义样式 */}
                <section className={styles.exampleSection} id="custom-style">
                    <h2 className={styles.subsectionTitle}>自定义样式</h2>
                    <p className={styles.subsectionText}>自定义颜色、指针长度和文本位置，打造独特的视觉效果。</p>
                    <div className={styles.exampleDemo}>
                        <Gauge
                            data={{ value: 68, name: '健康指数' }}
                            config={{
                                type: 'semi',
                                progress: {
                                    width: 10,
                                    color: '#10b981',
                                    backgroundColor: '#e5e7eb',
                                },
                                pointer: {
                                    length: 0.85,
                                    width: 2,
                                    color: '#10b981',
                                },
                                pivot: {
                                    radius: 10,
                                    color: '#10b981',
                                },
                                valueText: {
                                    format: '{value}',
                                    fontSize: 32,
                                    color: '#374151',
                                    offsetY: -60,
                                },
                                axis: {
                                    min: 0,
                                    max: 100,
                                    tickInterval: 20,
                                    labelColor: '#6b7280',
                                },
                            }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const CustomStyleExample = () => {
    return (
        <Gauge
            data={{ value: 68, name: '健康指数' }}
            config={{
                type: 'semi',
                progress: {
                    width: 10,
                    color: '#10b981',
                    backgroundColor: '#e5e7eb',
                },
                pointer: {
                    length: 0.85,
                    width: 2,
                    color: '#10b981',
                },
                pivot: {
                    radius: 10,
                    color: '#10b981',
                },
                valueText: {
                    format: '{value}',
                    fontSize: 32,
                    color: '#374151',
                    offsetY: -60,
                },
                axis: {
                    min: 0,
                    max: 100,
                    tickInterval: 20,
                    labelColor: '#6b7280',
                },
            }}
        />
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const CustomStyleExample = () => {
    return (
        <Gauge
            data={{ value: 68, name: '健康指数' }}
            config={{
                type: 'semi',
                progress: {
                    width: 10,
                    color: '#10b981',
                    backgroundColor: '#e5e7eb',
                },
                pointer: {
                    length: 0.85,
                    width: 2,
                    color: '#10b981',
                },
                pivot: {
                    radius: 10,
                    color: '#10b981',
                },
                valueText: {
                    format: '{value}',
                    fontSize: 32,
                    color: '#374151',
                    offsetY: -60,
                },
                axis: {
                    min: 0,
                    max: 100,
                    tickInterval: 20,
                    labelColor: '#6b7280',
                },
            }}
        />
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* 回调事件 */}
                <section className={styles.exampleSection} id="events">
                    <h2 className={styles.subsectionTitle}>事件回调</h2>
                    <p className={styles.subsectionText}>支持点击和数值变化事件，点击仪表盘查看效果。</p>
                    <div className={styles.exampleDemo}>
                        <Gauge
                            data={{ value: 55, name: '点击我' }}
                            config={{
                                type: 'semi',
                                progress: { color: '#f59e0b' },
                            }}
                            onClick={(data) => alert(`当前值: ${data.value}${data.unit || ''}`)}
                            onChange={(value) => console.log('数值变化:', value)}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const EventsExample = () => {
    const handleClick = (data) => {
        alert(\`当前值: \${data.value}\${data.unit || ''}\`);
    };

    const handleChange = (value) => {
        console.log('数值变化:', value);
    };

    return (
        <Gauge
            data={{ value: 55, name: '点击我' }}
            config={{
                type: 'semi',
                progress: { color: '#f59e0b' },
            }}
            onClick={handleClick}
            onChange={handleChange}
        />
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const EventsExample = () => {
    const handleClick = (data) => {
        alert(\`当前值: \${data.value}\${data.unit || ''}\`);
    };

    const handleChange = (value) => {
        console.log('数值变化:', value);
    };

    return (
        <Gauge
            data={{ value: 55, name: '点击我' }}
            config={{
                type: 'semi',
                progress: { color: '#f59e0b' },
            }}
            onClick={handleClick}
            onChange={handleChange}
        />
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* 面板水波动画 */}
                <section className={styles.exampleSection} id="panel-wave">
                    <h2 className={styles.subsectionTitle}>面板水波动画</h2>
                    <p className={styles.subsectionText}>面板背景支持类似水波图的多层波浪动画效果，为数据展示增添活力。</p>
                    <div className={styles.exampleDemo}>
                        <Gauge
                            data={{ value: 72, name: '湿度', unit: '%' }}
                            config={{
                                type: 'semi',
                                progress: {
                                    color: '#3b82f6',
                                    width: 10,
                                },
                                pointer: {
                                    color: '#3b82f6',
                                },
                                panel: {
                                    visible: true,
                                    waveEnabled: true,
                                    wave: {
                                        amplitude: 5,
                                        period: 0.025,
                                        color: ['#3b82f6', '#60a5fa', '#93c5fd'],
                                        opacity: 0.35,
                                        speed: 0.02,
                                        direction: 1,
                                        layers: 3,
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const PanelWaveExample = () => {
    return (
        <Gauge
            data={{ value: 72, name: '湿度', unit: '%' }}
            config={{
                type: 'semi',
                progress: {
                    color: '#3b82f6',
                    width: 10,
                },
                panel: {
                    visible: true,
                    waveEnabled: true,
                    wave: {
                        amplitude: 5,           // 波浪振幅
                        period: 0.025,          // 波浪周期
                        color: ['#3b82f6', '#60a5fa', '#93c5fd'], // 波浪颜色数组
                        opacity: 0.35,          // 波浪透明度
                        speed: 0.02,            // 动画速度
                        direction: 1,           // 波浪方向: 1 向右, -1 向左
                        layers: 3,              // 波浪层数
                    },
                },
            }}
        />
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const PanelWaveExample = () => {
    return (
        <Gauge
            data={{ value: 72, name: '湿度', unit: '%' }}
            config={{
                type: 'semi',
                progress: {
                    color: '#3b82f6',
                    width: 10,
                },
                panel: {
                    visible: true,
                    waveEnabled: true,
                    wave: {
                        amplitude: 5,           // 波浪振幅
                        period: 0.025,          // 波浪周期
                        color: ['#3b82f6', '#60a5fa', '#93c5fd'],
                        opacity: 0.35,          // 波浪透明度
                        speed: 0.02,            // 动画速度
                        direction: 1,           // 波浪方向: 1 向右, -1 向左
                        layers: 3,              // 波浪层数
                    },
                },
            }}
        />
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* 面板动画配置选项 */}
                <section className={styles.exampleSection} id="panel-wave-config">
                    <h2 className={styles.subsectionTitle}>面板动画配置选项</h2>
                    <p className={styles.subsectionText}>自定义面板背景、边框和水波动画的各种属性。</p>
                    <div className={styles.exampleDemo}>
                        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Gauge
                                data={{ value: 85, name: '健康度' }}
                                config={{
                                    type: 'semi',
                                    progress: { color: '#10b981', width: 8 },
                                    panel: {
                                        visible: true,
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                        borderColor: 'rgba(16, 185, 129, 0.3)',
                                        borderWidth: 2,
                                        borderRadius: 12,
                                        waveEnabled: true,
                                        wave: {
                                            amplitude: 3,
                                            color: ['#10b981', '#34d399'],
                                            opacity: 0.25,
                                            speed: 0.015,
                                            layers: 2,
                                        },
                                    },
                                }}
                            />
                            <Gauge
                                data={{ value: 45, name: '温度', unit: '°C' }}
                                config={{
                                    type: 'semi',
                                    progress: { color: '#f59e0b', width: 8 },
                                    panel: {
                                        visible: true,
                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                        borderColor: 'rgba(245, 158, 11, 0.3)',
                                        waveEnabled: true,
                                        wave: {
                                            amplitude: 6,
                                            color: ['#f59e0b', '#fbbf24'],
                                            opacity: 0.3,
                                            speed: 0.025,
                                            direction: -1,
                                            layers: 2,
                                        },
                                    },
                                }}
                            />
                            <Gauge
                                data={{ value: 92, name: '完成率', unit: '%' }}
                                config={{
                                    type: 'semi',
                                    progress: { color: '#8b5cf6', width: 8 },
                                    panel: {
                                        visible: true,
                                        waveEnabled: false, // 关闭水波动画，只显示静态背景
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts-design';

const PanelConfigExample = () => {
    return (
        <div style={{ display: 'flex', gap: '40px' }}>
            {/* 绿色主题 + 水波动画 */}
            <Gauge
                data={{ value: 85, name: '健康度' }}
                config={{
                    progress: { color: '#10b981' },
                    panel: {
                        visible: true,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        borderWidth: 2,
                        borderRadius: 12,
                        waveEnabled: true,
                        wave: {
                            amplitude: 3,
                            color: ['#10b981', '#34d399'],
                            opacity: 0.25,
                            speed: 0.015,
                            layers: 2,
                        },
                    },
                }}
            />

            {/* 橙色主题 + 向左波浪 */}
            <Gauge
                data={{ value: 45, name: '温度', unit: '°C' }}
                config={{
                    progress: { color: '#f59e0b' },
                    panel: {
                        visible: true,
                        waveEnabled: true,
                        wave: {
                            amplitude: 6,
                            color: ['#f59e0b', '#fbbf24'],
                            opacity: 0.3,
                            speed: 0.025,
                            direction: -1,  // 向左
                            layers: 2,
                        },
                    },
                }}
            />

            {/* 静态面板背景 */}
            <Gauge
                data={{ value: 92, name: '完成率', unit: '%' }}
                config={{
                    progress: { color: '#8b5cf6' },
                    panel: {
                        visible: true,
                        waveEnabled: false,  // 关闭水波动画
                    },
                }}
            />
        </div>
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts-design';

const PanelConfigExample = () => {
    return (
        <div style={{ display: 'flex', gap: '40px' }}>
            {/* 绿色主题 + 水波动画 */}
            <Gauge
                data={{ value: 85, name: '健康度' }}
                config={{
                    progress: { color: '#10b981' },
                    panel: {
                        visible: true,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        borderWidth: 2,
                        borderRadius: 12,
                        waveEnabled: true,
                        wave: {
                            amplitude: 3,
                            color: ['#10b981', '#34d399'],
                            opacity: 0.25,
                            speed: 0.015,
                            layers: 2,
                        },
                    },
                }}
            />

            {/* 橙色主题 + 向左波浪 */}
            <Gauge
                data={{ value: 45, name: '温度', unit: '°C' }}
                config={{
                    progress: { color: '#f59e0b' },
                    panel: {
                        visible: true,
                        waveEnabled: true,
                        wave: {
                            amplitude: 6,
                            color: ['#f59e0b', '#fbbf24'],
                            opacity: 0.3,
                            speed: 0.025,
                            direction: -1,
                            layers: 2,
                        },
                    },
                }}
            />

            {/* 静态面板背景 */}
            <Gauge
                data={{ value: 92, name: '完成率', unit: '%' }}
                config={{
                    progress: { color: '#8b5cf6' },
                    panel: {
                        visible: true,
                        waveEnabled: false,
                    },
                }}
            />
        </div>
    );
};`}
                    </SyntaxHighlighter>
                </section>

                {/* API 文档 */}
                <section className={styles.exampleSection} id="api">
                    <h2 className={styles.subsectionTitle}>API</h2>
                    <p className={styles.subsectionText}>组件的属性说明。</p>
                    <div className={styles.apiTable}>
                        <Table
                            columns={apiColumns}
                            dataSource={apiData}
                        />
                    </div>
                </section>

                {/* 组件特性 */}
                <section className={styles.features}>
                    <div className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>🎨 高度可定制</h3>
                        <p className={styles.featureDesc}>
                            支持自定义颜色、刻度、指针样式，满足不同场景的视觉需求。
                        </p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>📊 多种模式</h3>
                        <p className={styles.featureDesc}>
                            支持半圆和整圆两种类型，以及区间颜色标记功能。
                        </p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>⚡ 流畅动画</h3>
                        <p className={styles.featureDesc}>
                            内置平滑的数值过渡动画，支持自定义动画时长。
                        </p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>📱 响应式设计</h3>
                        <p className={styles.featureDesc}>
                            自动适应容器大小变化，在各种屏幕尺寸下都能完美展示。
                        </p>
                    </div>
                </section>
            </div>

            {/* 锚点导航 */}
            <div className={styles.anchorNav}>
                <div className={styles.anchorWrapper}>
                    {scrollContainer && (
                        <Anchor
                            getContainer={() => scrollContainer}
                            offsetTop={20}
                            affix={false}
                            bounds={30}
                        >
                            <Anchor.Link href="#basic" title="基础用法" />
                            <Anchor.Link href="#gradient" title="多彩渐变" />
                            <Anchor.Link href="#speedometer" title="速度表" />
                            <Anchor.Link href="#minimal" title="极简风格" />
                            <Anchor.Link href="#large-range" title="大数值范围" />
                            <Anchor.Link href="#custom-style" title="自定义样式" />
                            <Anchor.Link href="#events" title="事件回调" />
                            <Anchor.Link href="#panel-wave" title="面板水波动画" />
                            <Anchor.Link href="#panel-wave-config" title="面板动画配置" />
                            <Anchor.Link href="#api" title="API" />
                        </Anchor>
                    )}
                </div>
            </div>
        </Flex>
    );
}
