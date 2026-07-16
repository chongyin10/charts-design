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
        { param: 'data', description: '图表数据，包含 value、name、unit', type: 'GaugeData', default: '必填' },
        { param: 'config', description: '图表配置，详见下方 GaugeChartConfig', type: 'GaugeChartConfig', default: '{}' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'CSSProperties', default: '-' },
        { param: 'onChange', description: '数值变化回调', type: '(value: number) => void', default: '-' },
        { param: 'onClick', description: '点击回调', type: '(data: GaugeData) => void', default: '-' },
        { param: 'onReady', description: '渲染完成回调', type: '() => void', default: '-' },
    ];

    // GaugeChartConfig 配置表格
    const configColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '150px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值' },
    ];

    const configData = [
        { param: 'width', description: '图表宽度（像素）', type: 'number', default: '300' },
        { param: 'height', description: '图表高度（像素）', type: 'number', default: '200' },
        { param: 'padding', description: '内边距', type: 'number', default: '20' },
        { param: 'type', description: '仪表类型：semi 半圆 / full 整圆', type: "'semi' | 'full'", default: "'semi'" },
        { param: 'radius', description: '半径（相对于容器最小边的比例 0-1）', type: 'number', default: '0.75' },
        { param: 'animation', description: '是否开启动画', type: 'boolean', default: 'true' },
        { param: 'animationDuration', description: '动画持续时间（毫秒）', type: 'number', default: '1000' },
        { param: 'responsive', description: '是否开启响应式', type: 'boolean', default: 'true' },
    ];

    // 坐标轴配置表格
    const axisColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '150px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值' },
    ];

    const axisData = [
        { param: 'min', description: '最小值', type: 'number', default: '0' },
        { param: 'max', description: '最大值', type: 'number', default: '100' },
        { param: 'tickInterval', description: '主刻度间隔', type: 'number', default: '20' },
        { param: 'subTickCount', description: '次刻度数量', type: 'number', default: '4' },
        { param: 'tickVisible', description: '是否显示刻度线', type: 'boolean', default: 'true' },
        { param: 'lineColor', description: '刻度线颜色', type: 'string', default: "'#9ca3af'" },
        { param: 'lineWidth', description: '刻度线宽度', type: 'number', default: '1' },
        { param: 'labelColor', description: '刻度标签颜色', type: 'string', default: "'#6b7280'" },
        { param: 'labelFontSize', description: '刻度标签字体大小', type: 'number', default: '12' },
        { param: 'labelFormatter', description: '刻度标签格式化函数', type: '(value: number) => string', default: '(v) => v.toString()' },
    ];

    // 进度条配置表格
    const progressColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '150px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值' },
    ];

    const progressData = [
        { param: 'width', description: '进度条宽度', type: 'number', default: '8' },
        { param: 'color', description: '进度条颜色，支持单色或渐变色数组', type: 'string | string[]', default: "'#3b82f6'" },
        { param: 'backgroundColor', description: '背景轨道颜色', type: 'string', default: "'#e5e7eb'" },
        { param: 'rounded', description: '是否圆角', type: 'boolean', default: 'true' },
        { param: 'shadow', description: '是否显示阴影', type: 'boolean', default: 'false' },
    ];

    // 指针配置表格
    const pointerColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '150px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值' },
    ];

    const pointerData = [
        { param: 'length', description: '指针长度（相对于半径的比例 0-1）', type: 'number', default: '0.75' },
        { param: 'width', description: '指针宽度', type: 'number', default: '2' },
        { param: 'color', description: '指针颜色', type: 'string', default: "'#10b981'" },
        { param: 'visible', description: '是否显示指针', type: 'boolean', default: 'true' },
        { param: 'tailLength', description: '指针尾部长度', type: 'number', default: '0.1' },
    ];

    // 中心点配置表格
    const pivotColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '150px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值' },
    ];

    const pivotData = [
        { param: 'radius', description: '中心点半径', type: 'number', default: '10' },
        { param: 'color', description: '中心点颜色', type: 'string', default: "'#10b981'" },
        { param: 'visible', description: '是否显示中心点', type: 'boolean', default: 'true' },
    ];

    // 面板配置表格
    const panelColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '150px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值' },
    ];

    const panelData = [
        { param: 'visible', description: '是否显示面板背景', type: 'boolean', default: 'true' },
        { param: 'width', description: '面板宽度（像素），不设置则自动计算', type: 'number', default: '-' },
        { param: 'height', description: '面板高度（像素），不设置则自动计算', type: 'number', default: '-' },
        { param: 'offsetX', description: '面板X坐标偏移（相对于中心）', type: 'number', default: '-' },
        { param: 'offsetY', description: '面板Y坐标偏移（相对于默认位置）', type: 'number', default: '-' },
        { param: 'backgroundColor', description: '面板背景颜色', type: 'string', default: "'rgba(255, 255, 255, 0.7)'" },
        { param: 'borderColor', description: '面板边框颜色', type: 'string', default: "'rgba(0, 0, 0, 0.06)'" },
        { param: 'borderWidth', description: '面板边框宽度', type: 'number', default: '1' },
        { param: 'borderRadius', description: '面板圆角', type: 'number', default: '8' },
        { param: 'waveEnabled', description: '是否显示波浪动画背景', type: 'boolean', default: 'false' },
    ];

    // 文本配置表格
    const textColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '150px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值' },
    ];

    const valueTextData = [
        { param: 'format', description: '文本格式，支持 {value}、{percent}、{name}、{unit}', type: 'string', default: "'{value}'" },
        { param: 'fontSize', description: '字体大小', type: 'number', default: '28' },
        { param: 'color', description: '字体颜色', type: 'string', default: "'#374151'" },
        { param: 'fontWeight', description: '字体粗细', type: 'string | number', default: '400' },
        { param: 'visible', description: '是否显示', type: 'boolean', default: 'true' },
        { param: 'offsetY', description: '垂直偏移', type: 'number', default: '-70' },
    ];

    const titleTextData = [
        { param: 'format', description: '文本格式，支持 {value}、{percent}、{name}、{unit}', type: 'string', default: "'{name}'" },
        { param: 'fontSize', description: '字体大小', type: 'number', default: '14' },
        { param: 'color', description: '字体颜色', type: 'string', default: "'#6b7280'" },
        { param: 'fontWeight', description: '字体粗细', type: 'string | number', default: '400' },
        { param: 'visible', description: '是否显示', type: 'boolean', default: 'true' },
        { param: 'offsetY', description: '垂直偏移', type: 'number', default: '-35' },
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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

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
                        {`import { Gauge } from '@zjpcy/charts';

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

                {/* 面板尺寸与位置 */}
                <section className={styles.exampleSection} id="panel-position">
                    <h2 className={styles.subsectionTitle}>面板尺寸与位置</h2>
                    <p className={styles.subsectionText}>自定义信息面板的宽度、高度以及位置偏移，精确控制面板显示。</p>
                    <div className={styles.exampleDemo}>
                        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Gauge
                                data={{ value: 75, name: '固定尺寸', unit: '%' }}
                                config={{
                                    type: 'semi',
                                    progress: { color: '#3b82f6', width: 10 },
                                    panel: {
                                        visible: true,
                                        width: 140,
                                        height: 90,
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: 12,
                                    },
                                }}
                            />
                            <Gauge
                                data={{ value: 60, name: '位置偏移', unit: '%' }}
                                config={{
                                    type: 'semi',
                                    progress: { color: '#10b981', width: 10 },
                                    panel: {
                                        visible: true,
                                        width: 120,
                                        offsetX: 30,
                                        offsetY: 10,
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: 10,
                                    },
                                }}
                            />
                            <Gauge
                                data={{ value: 88, name: '左上偏移', unit: '%' }}
                                config={{
                                    type: 'semi',
                                    progress: { color: '#f59e0b', width: 10 },
                                    panel: {
                                        visible: true,
                                        width: 110,
                                        height: 70,
                                        offsetX: -40,
                                        offsetY: -15,
                                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                        borderRadius: 8,
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={`import { Gauge } from '@zjpcy/charts';

const PanelPositionExample = () => {
    return (
        <div style={{ display: 'flex', gap: '40px' }}>
            {/* 固定尺寸面板 */}
            <Gauge
                data={{ value: 75, name: '固定尺寸', unit: '%' }}
                config={{
                    type: 'semi',
                    progress: { color: '#3b82f6', width: 10 },
                    panel: {
                        visible: true,
                        width: 140,     // 固定宽度 140px
                        height: 90,     // 固定高度 90px
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: 12,
                    },
                }}
            />

            {/* 向右下偏移 */}
            <Gauge
                data={{ value: 60, name: '位置偏移', unit: '%' }}
                config={{
                    type: 'semi',
                    progress: { color: '#10b981', width: 10 },
                    panel: {
                        visible: true,
                        width: 120,
                        offsetX: 30,    // 向右偏移 30px
                        offsetY: 10,    // 向下偏移 10px
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 10,
                    },
                }}
            />

            {/* 向左上偏移 */}
            <Gauge
                data={{ value: 88, name: '左上偏移', unit: '%' }}
                config={{
                    type: 'semi',
                    progress: { color: '#f59e0b', width: 10 },
                    panel: {
                        visible: true,
                        width: 110,
                        height: 70,
                        offsetX: -40,   // 向左偏移 40px
                        offsetY: -15,   // 向上偏移 15px
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        borderRadius: 8,
                    },
                }}
            />
        </div>
    );
};`} />
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`import { Gauge } from '@zjpcy/charts';

const PanelPositionExample = () => {
    return (
        <div style={{ display: 'flex', gap: '40px' }}>
            {/* 固定尺寸面板 */}
            <Gauge
                data={{ value: 75, name: '固定尺寸', unit: '%' }}
                config={{
                    type: 'semi',
                    progress: { color: '#3b82f6', width: 10 },
                    panel: {
                        visible: true,
                        width: 140,
                        height: 90,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: 12,
                    },
                }}
            />

            {/* 向右下偏移 */}
            <Gauge
                data={{ value: 60, name: '位置偏移', unit: '%' }}
                config={{
                    type: 'semi',
                    progress: { color: '#10b981', width: 10 },
                    panel: {
                        visible: true,
                        width: 120,
                        offsetX: 30,
                        offsetY: 10,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 10,
                    },
                }}
            />

            {/* 向左上偏移 */}
            <Gauge
                data={{ value: 88, name: '左上偏移', unit: '%' }}
                config={{
                    type: 'semi',
                    progress: { color: '#f59e0b', width: 10 },
                    panel: {
                        visible: true,
                        width: 110,
                        height: 70,
                        offsetX: -40,
                        offsetY: -15,
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        borderRadius: 8,
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
                    
                    <h3 className={styles.apiSubTitle}>Gauge Props</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={apiColumns}
                            dataSource={apiData}
                        />
                    </div>

                    <h3 className={styles.apiSubTitle}>GaugeChartConfig</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={configColumns}
                            dataSource={configData}
                        />
                    </div>

                    <h3 className={styles.apiSubTitle}>axis - 坐标轴配置</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={axisColumns}
                            dataSource={axisData}
                        />
                    </div>

                    <h3 className={styles.apiSubTitle}>progress - 进度条配置</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={progressColumns}
                            dataSource={progressData}
                        />
                    </div>

                    <h3 className={styles.apiSubTitle}>pointer - 指针配置</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={pointerColumns}
                            dataSource={pointerData}
                        />
                    </div>

                    <h3 className={styles.apiSubTitle}>pivot - 中心点配置</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={pivotColumns}
                            dataSource={pivotData}
                        />
                    </div>

                    <h3 className={styles.apiSubTitle}>panel - 面板配置</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={panelColumns}
                            dataSource={panelData}
                        />
                    </div>

                    <h3 className={styles.apiSubTitle}>valueText - 数值文本配置</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={textColumns}
                            dataSource={valueTextData}
                        />
                    </div>

                    <h3 className={styles.apiSubTitle}>titleText - 标题文本配置</h3>
                    <div className={styles.apiTable}>
                        <Table
                            columns={textColumns}
                            dataSource={titleTextData}
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
                            <Anchor.Link href="#panel-position" title="面板尺寸与位置" />
                            <Anchor.Link href="#api" title="API" />
                        </Anchor>
                    )}
                </div>
            </div>
        </Flex>
    );
}
