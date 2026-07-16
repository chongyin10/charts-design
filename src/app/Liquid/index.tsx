'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Liquid } from '@/components/Liquid';
import { LiquidData, LiquidChartConfig } from '@/components/Liquid/Liquid.type';
import { Flex, Table, Anchor } from '@zjpcy/simple-design';
import type { Column } from '@zjpcy/simple-design';
import { Prism } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './page.module.css';

// 修复 react-syntax-highlighter 与 React 18 的类型不兼容问题
const SyntaxHighlighter = Prism as any;

// 安全的代码高亮组件
interface SafeSyntaxHighlighterProps {
    children: string;
    language: string;
    style: typeof vscDarkPlus;
}

const SafeSyntaxHighlighter: React.FC<SafeSyntaxHighlighterProps> = ({ children, language, style }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) {
        return <pre style={{ background: '#1e1e1e', padding: 16, borderRadius: 8, margin: 0 }}><code>{children}</code></pre>;
    }

    return (
        <SyntaxHighlighter language={language} style={style}>
            {children}
        </SyntaxHighlighter>
    );
};

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
 * 水波图示例页面
 */
export default function LiquidChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
    const [demoValue, setDemoValue] = useState<number>(30);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础水波图数据
    const basicData: LiquidData = {
        value: 30,
        label: '基础示例',
    };

    // 交互式数据
    const interactiveData: LiquidData = {
        value: demoValue,
        label: '交互式示例',
    };

    // 高进度数据
    const highData: LiquidData = {
        value: 85,
        label: '高进度',
    };

    // 中等进度数据
    const mediumData: LiquidData = {
        value: 55,
        label: '中等进度',
    };

    // 低进度数据
    const lowData: LiquidData = {
        value: 15,
        label: '低进度',
    };

    // 基础配置
    const basicConfig: LiquidChartConfig = {
        width: 200,
        height: 200,
        wave: {
            amplitude: 8,
            period: 0.02,
            color: ['#3b82f6', '#60a5fa', '#93c5fd'],
            opacity: 0.8,
            speed: 0.02,
        },
        border: {
            width: 3,
            color: '#3b82f6',
            opacity: 1,
        },
    };

    // 红色主题配置
    const redConfig: LiquidChartConfig = {
        width: 200,
        height: 200,
        wave: {
            amplitude: 6,
            period: 0.025,
            color: ['#ef4444', '#f87171', '#fca5a5'],
            opacity: 0.85,
            speed: 0.03,
        },
        border: {
            width: 3,
            color: '#ef4444',
            opacity: 1,
        },
    };

    // 绿色主题配置
    const greenConfig: LiquidChartConfig = {
        width: 200,
        height: 200,
        wave: {
            amplitude: 10,
            period: 0.018,
            color: ['#10b981', '#34d399', '#6ee7b7'],
            opacity: 0.75,
            speed: 0.015,
        },
        border: {
            width: 3,
            color: '#10b981',
            opacity: 1,
        },
    };

    // 紫色主题配置
    const purpleConfig: LiquidChartConfig = {
        width: 200,
        height: 200,
        wave: {
            amplitude: 7,
            period: 0.022,
            color: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
            opacity: 0.8,
            speed: 0.025,
        },
        border: {
            width: 3,
            color: '#8b5cf6',
            opacity: 1,
        },
    };

    // 大图表配置
    const largeConfig: LiquidChartConfig = {
        width: 300,
        height: 300,
        wave: {
            amplitude: 12,
            period: 0.015,
            color: ['#06b6d4', '#22d3ee', '#67e8f9'],
            opacity: 0.8,
            speed: 0.02,
        },
        border: {
            width: 4,
            color: '#06b6d4',
            opacity: 1,
        },
        text: {
            format: '{value}%',
            fontSize: 36,
            fontWeight: 700,
        },
    };

    // 代码示例
    const basicCode = `import { Liquid } from '@zjpcy/charts';

const BasicLiquidExample = () => {
    const data = {
        value: 30,
        label: '基础示例',
    };

    const config = {
        width: 200,
        height: 200,
        wave: {
            amplitude: 8,
            period: 0.02,
            color: ['#3b82f6', '#60a5fa', '#93c5fd'],
            opacity: 0.8,
            speed: 0.02,
        },
        border: {
            width: 3,
            color: '#3b82f6',
            opacity: 1,
        },
    };

    return <Liquid data={data} config={config} />;
};`;

    const multipleCode = `import { Liquid } from '@zjpcy/charts';
import { Flex } from '@zjpcy/simple-design';

const MultipleLiquidExample = () => {
    // 不同主题配置
    const purpleConfig = {
        width: 200, height: 200,
        wave: { amplitude: 7, color: ['#8b5cf6', '#a78bfa', '#c4b5fd'] },
        border: { width: 3, color: '#8b5cf6' },
    };

    const greenConfig = {
        width: 200, height: 200,
        wave: { amplitude: 10, color: ['#10b981', '#34d399', '#6ee7b7'] },
        border: { width: 3, color: '#10b981' },
    };

    const redConfig = {
        width: 200, height: 200,
        wave: { amplitude: 6, color: ['#ef4444', '#f87171', '#fca5a5'] },
        border: { width: 3, color: '#ef4444' },
    };

    return (
        <Flex gap={40} justify="center">
            <Liquid data={{ value: 15 }} config={purpleConfig} />
            <Liquid data={{ value: 55 }} config={greenConfig} />
            <Liquid data={{ value: 85 }} config={redConfig} />
        </Flex>
    );
};`;

    const largeCode = `import { Liquid } from '@zjpcy/charts';

const LargeLiquidExample = () => {
    const config = {
        width: 300,
        height: 300,
        wave: {
            amplitude: 12,
            period: 0.015,
            color: ['#06b6d4', '#22d3ee', '#67e8f9'],
            opacity: 0.8,
            speed: 0.02,
        },
        border: {
            width: 4,
            color: '#06b6d4',
        },
        text: {
            format: '{value}%',
            fontSize: 36,
            fontWeight: 700,
        },
    };

    return <Liquid data={{ value: 85 }} config={config} />;
};`;

    const interactiveCode = `import { Liquid } from '@zjpcy/charts';
import { useState } from 'react';

const InteractiveLiquidExample = () => {
    const [value, setValue] = useState(30);

    const config = {
        width: 200,
        height: 200,
        wave: {
            amplitude: 8,
            color: ['#3b82f6', '#60a5fa', '#93c5fd'],
        },
        border: {
            width: 3,
            color: '#3b82f6',
        },
    };

    return (
        <Flex direction="column" align="center" gap={24}>
            <Liquid data={{ value }} config={config} />
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
            />
        </Flex>
    );
};`;

    // API 表格列定义
    const apiColumns: Column[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值', width: '100px' }
    ];

    // Liquid 组件 API 数据
    const apiData = [
        { param: 'data', description: '图表数据（必填）', type: 'LiquidData', default: 'required' },
        { param: 'config', description: '图表配置', type: 'LiquidChartConfig', default: '-' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'React.CSSProperties', default: '-' },
        { param: 'onChange', description: '数值变化回调', type: '(value: number) => void', default: '-' },
        { param: 'onClick', description: '点击回调', type: '(data: LiquidData) => void', default: '-' },
    ];

    // LiquidData 配置数据
    const dataTypeAPI = [
        { param: 'value', description: '数值 (0-100)', type: 'number', default: 'required' },
        { param: 'label', description: '标签名称', type: 'string', default: '-' },
    ];

    // Wave 配置数据
    const waveAPI = [
        { param: 'amplitude', description: '波浪振幅（波峰高度）', type: 'number', default: '8' },
        { param: 'period', description: '波浪周期（波长）', type: 'number', default: '0.02' },
        { param: 'color', description: '波浪颜色（支持单个颜色或颜色数组）', type: 'string | string[]', default: "['#3b82f6', '#60a5fa', '#93c5fd']" },
        { param: 'opacity', description: '波浪透明度 (0-1)', type: 'number', default: '0.8' },
        { param: 'speed', description: '波浪动画速度', type: 'number', default: '0.02' },
        { param: 'direction', description: '波浪方向：1 向右，-1 向左', type: '1 | -1', default: '1' },
    ];

    // Border 配置数据
    const borderAPI = [
        { param: 'width', description: '边框宽度', type: 'number', default: '3' },
        { param: 'color', description: '边框颜色', type: 'string', default: "'#3b82f6'" },
        { param: 'opacity', description: '边框透明度 (0-1)', type: 'number', default: '1' },
        { param: 'gap', description: '是否显示内部间隙', type: 'boolean', default: 'true' },
        { param: 'gapSize', description: '间隙大小', type: 'number', default: '4' },
    ];

    // Text 配置数据
    const textAPI = [
        { param: 'format', description: '文本格式（支持 {value} 占位符）', type: 'string', default: "'{value}%'" },
        { param: 'fontSize', description: '字体大小', type: 'number', default: '24' },
        { param: 'color', description: '字体颜色', type: 'string', default: "'#374151'" },
        { param: 'fontWeight', description: '字体粗细', type: 'string | number', default: '600' },
        { param: 'visible', description: '是否显示文本', type: 'boolean', default: 'true' },
        { param: 'offsetY', description: '垂直偏移量', type: 'number', default: '0' },
    ];

    // ChartConfig 配置数据
    const configAPI = [
        { param: 'width', description: '图表宽度（像素）', type: 'number', default: '200' },
        { param: 'height', description: '图表高度（像素）', type: 'number', default: '200' },
        { param: 'padding', description: '内边距', type: 'number', default: '10' },
        { param: 'size', description: '圆形大小（相对于容器的比例 0-1）', type: 'number', default: '0.8' },
        { param: 'backgroundColor', description: '背景颜色', type: 'string', default: "'#f8fafc'" },
        { param: 'wave', description: '波浪配置', type: 'LiquidWaveConfig', default: '-' },
        { param: 'border', description: '边框配置', type: 'LiquidBorderConfig', default: '-' },
        { param: 'text', description: '文本配置', type: 'LiquidTextConfig', default: '-' },
        { param: 'animationDuration', description: '动画持续时间（毫秒）', type: 'number', default: '2000' },
        { param: 'animation', description: '是否开启动画', type: 'boolean', default: 'true' },
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.sectionTitle} id="liquid-intro">Liquid 水波图</h2>
                    <p className={styles.sectionText}>
                        水波图（Liquid）又称涟漪图或波浪图，是一种通过模拟水波纹扩散效果来展示数据变化或进度的可视化图表。
                        适用于展示进度、占比、完成率等场景。
                    </p>

                    {/* 基础示例 */}
                    <div className={styles.exampleSection} id="liquid-basic">
                        <h3 className={styles.subsectionTitle}>基础示例</h3>
                        <p className={styles.sectionText}>最简单的使用方式，只需传入数据和基础配置即可展示水波图。</p>
                        <div className={styles.exampleDemo}>
                            <Liquid data={basicData} config={basicConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={basicCode} />
                        </div>
                        <SafeSyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {basicCode}
                        </SafeSyntaxHighlighter>
                    </div>

                    {/* 不同进度对比 */}
                    <div className={styles.exampleSection} id="liquid-multiple">
                        <h3 className={styles.subsectionTitle}>不同进度对比</h3>
                        <p className={styles.sectionText}>展示不同进度值的水波图效果，可以通过配置不同的颜色主题来区分状态。</p>
                        <div className={styles.exampleDemo}>
                            <Flex gap={40} justify="center" wrap="wrap">
                                <Liquid data={lowData} config={purpleConfig} />
                                <Liquid data={mediumData} config={greenConfig} />
                                <Liquid data={highData} config={redConfig} />
                            </Flex>
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={multipleCode} />
                        </div>
                        <SafeSyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {multipleCode}
                        </SafeSyntaxHighlighter>
                    </div>

                    {/* 大尺寸示例 */}
                    <div className={styles.exampleSection} id="liquid-large">
                        <h3 className={styles.subsectionTitle}>大尺寸示例</h3>
                        <p className={styles.sectionText}>通过调整宽高配置，可以创建更大尺寸的水波图，适用于需要突出展示的场景。</p>
                        <div className={styles.exampleDemo}>
                            <Liquid data={highData} config={largeConfig} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={largeCode} />
                        </div>
                        <SafeSyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {largeCode}
                        </SafeSyntaxHighlighter>
                    </div>

                    {/* 交互式示例 */}
                    <div className={styles.exampleSection} id="liquid-interactive">
                        <h3 className={styles.subsectionTitle}>交互式示例</h3>
                        <p className={styles.sectionText}>拖动滑块可以实时调整水波图的数值，观察动画过渡效果。</p>
                        <div className={styles.exampleDemo}>
                            <Flex direction="column" align="center" gap={24}>
                                <Liquid data={interactiveData} config={basicConfig} />
                                <div className={styles.sliderContainer}>
                                    <span className={styles.sliderLabel}>数值: {demoValue}%</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={demoValue}
                                        onChange={(e) => setDemoValue(Number(e.target.value))}
                                        className={styles.slider}
                                    />
                                </div>
                            </Flex>
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={interactiveCode} />
                        </div>
                        <SafeSyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {interactiveCode}
                        </SafeSyntaxHighlighter>
                    </div>

                    {/* 组件特性 */}
                    <div className={styles.exampleSection} id="liquid-features">
                        <h3 className={styles.subsectionTitle}>组件特性</h3>
                        <div className={styles.features}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>💧 水波动效</div>
                                <div className={styles.featureDesc}>逼真的水波流动动画效果，让进度展示更加生动有趣。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🎨 渐变配色</div>
                                <div className={styles.featureDesc}>支持多层颜色渐变，可配置波浪的前中后景颜色。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>⚙️ 波浪参数</div>
                                <div className={styles.featureDesc}>可调整波浪振幅、周期、速度和透明度，精细控制外观。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>📐 尺寸灵活</div>
                                <div className={styles.featureDesc}>支持自定义宽高，可创建不同尺寸的水波图适配各种场景。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🏷️ 文本配置</div>
                                <div className={styles.featureDesc}>支持自定义中心文本内容和样式，可显示百分比或标签。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🖼️ 边框样式</div>
                                <div className={styles.featureDesc}>支持配置圆形边框的宽度、颜色和透明度。</div>
                            </div>
                        </div>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="liquid-api">
                        <h3 className={styles.subsectionTitle}>API 参考</h3>
                        <p className={styles.sectionText}>Liquid 组件的属性配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={apiData} />
                        </div>
                    </div>

                    {/* LiquidData 配置 */}
                    <div className={styles.exampleSection} id="liquid-data">
                        <h3 className={styles.subsectionTitle}>LiquidData 配置</h3>
                        <p className={styles.sectionText}>图表数据配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={dataTypeAPI} />
                        </div>
                    </div>

                    {/* LiquidChartConfig 配置 */}
                    <div className={styles.exampleSection} id="liquid-config">
                        <h3 className={styles.subsectionTitle}>LiquidChartConfig 配置</h3>
                        <p className={styles.sectionText}>图表配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={configAPI} />
                        </div>
                    </div>

                    {/* Wave 配置 */}
                    <div className={styles.exampleSection} id="liquid-wave">
                        <h3 className={styles.subsectionTitle}>Wave 配置</h3>
                        <p className={styles.sectionText}>波浪样式配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={waveAPI} />
                        </div>
                    </div>

                    {/* Border 配置 */}
                    <div className={styles.exampleSection} id="liquid-border">
                        <h3 className={styles.subsectionTitle}>Border 配置</h3>
                        <p className={styles.sectionText}>边框配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={borderAPI} />
                        </div>
                    </div>

                    {/* Text 配置 */}
                    <div className={styles.exampleSection} id="liquid-text">
                        <h3 className={styles.subsectionTitle}>Text 配置</h3>
                        <p className={styles.sectionText}>文本配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={textAPI} />
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
                                <Anchor.Link href="#liquid-intro" title="组件介绍" />
                                <Anchor.Link href="#liquid-basic" title="基础示例" />
                                <Anchor.Link href="#liquid-multiple" title="不同进度对比" />
                                <Anchor.Link href="#liquid-large" title="大尺寸示例" />
                                <Anchor.Link href="#liquid-interactive" title="交互式示例" />
                                <Anchor.Link href="#liquid-features" title="组件特性" />
                                <Anchor.Link href="#liquid-api" title="API 参考" />
                                <Anchor.Link href="#liquid-data" title="LiquidData 配置" />
                                <Anchor.Link href="#liquid-config" title="ChartConfig 配置" />
                                <Anchor.Link href="#liquid-wave" title="Wave 配置" />
                                <Anchor.Link href="#liquid-border" title="Border 配置" />
                                <Anchor.Link href="#liquid-text" title="Text 配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
