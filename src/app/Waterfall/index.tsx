/**
 * 瀑布图演示页面
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Waterfall } from '@/components/Waterfall';
import { WaterfallChartData } from '@/components/Waterfall/Waterfall.type';
import { Anchor } from '@zjpcy/simple-design';
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
 * 瀑布图示例页面
 */
export default function WaterfallPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 季度利润瀑布图数据
    const profitData: WaterfallChartData = {
        items: [
            { label: '第一季度', value: 6.2, isTotal: true },
            { label: '第二季度', value: -2.6 },
            { label: '第三季度', value: 4.1 },
            { label: '第四季度', value: 3.7 },
            { label: '总计', value: 11.4, isTotal: true },
        ],
    };

    // 收入构成瀑布图数据
    const revenueData: WaterfallChartData = {
        items: [
            { label: '产品收入', value: 850000 },
            { label: '服务收入', value: 320000 },
            { label: '订阅收入', value: 180000 },
            { label: '其他收入', value: 50000 },
            { label: '总收入', value: 1400000, isTotal: true },
        ],
    };

    // 预算执行瀑布图数据
    const budgetData: WaterfallChartData = {
        items: [
            { label: '年初预算', value: 1000000, isTotal: true },
            { label: '研发超支', value: -150000 },
            { label: '营销节约', value: 80000 },
            { label: '运营成本', value: -400000 },
            { label: '人力成本', value: -300000 },
            { label: '年末结余', value: 230000, isTotal: true },
        ],
    };

    // 季度利润示例代码
    const profitCode = `import { Waterfall } from '@/components/Waterfall';

const data = {
    items: [
        { label: '第一季度', value: 6.2, isTotal: true },
        { label: '第二季度', value: -2.6 },
        { label: '第三季度', value: 4.1 },
        { label: '第四季度', value: 3.7 },
        { label: '总计', value: 11.4, isTotal: true },
    ],
};

<Waterfall
    data={data}
    width={700}
    height={400}
    column={{
        positiveColor: '#ff6b5b',
        negativeColor: '#10b981',
        totalColor: '#94a3b8',
    }}
    label={{
        display: true,
        position: 'inside',
        formatter: (value) => \`\${value} 百万\`,
    }}
/>`;

    // 收入构成示例代码
    const revenueCode = `import { Waterfall } from '@/components/Waterfall';

const data = {
    items: [
        { label: '产品收入', value: 850000 },
        { label: '服务收入', value: 320000 },
        { label: '订阅收入', value: 180000 },
        { label: '其他收入', value: 50000 },
        { label: '总收入', value: 1400000, isTotal: true },
    ],
};

<Waterfall
    data={data}
    width={700}
    height={400}
    column={{
        width: 0.5,
        borderRadius: 4,
    }}
    label={{
        display: true,
        position: 'outside',
        formatter: (value) => \`¥\${(value / 10000).toFixed(0)}万\`,
    }}
    connector={{
        display: true,
        color: '#9ca3af',
        dash: [4, 4],
    }}
/>`;

    // 预算执行示例代码
    const budgetCode = `import { Waterfall } from '@/components/Waterfall';

const data = {
    items: [
        { label: '年初预算', value: 1000000, isTotal: true },
        { label: '研发超支', value: -150000 },
        { label: '营销节约', value: 80000 },
        { label: '运营成本', value: -400000 },
        { label: '人力成本', value: -300000 },
        { label: '年末结余', value: 230000, isTotal: true },
    ],
};

<Waterfall
    data={data}
    width={800}
    height={400}
    yAxis={{
        title: {
            text: '金额 (元)',
        },
    }}
    label={{
        display: true,
        position: 'inside',
        formatter: (value) => \`¥\${(value / 10000).toFixed(0)}万\`,
    }}
    onDataClick={(index, item, cumulative) => {
        console.log('点击数据:', { index, item, cumulative });
    }}
/>`;

    // 自定义提示框示例代码
    const tooltipCode = `<Waterfall
    data={data}
    width={700}
    height={400}
    tooltip={{
        enabled: true,
        customContent: ({ item, cumulative }) => (
            <>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    {item.label}
                </div>
                <div>数值: {item.value} 百万</div>
                <div>累计: {cumulative} 百万</div>
            </>
        ),
    }}
/>`;

    // 锚点列表
    const anchors = [
        { key: 'profit', title: '季度利润' },
        { key: 'revenue', title: '收入构成' },
        { key: 'budget', title: '预算执行' },
        { key: 'api', title: 'API 文档' },
    ];

    return (
        <div className={styles.page}>
            {/* 页面标题 */}
            <div className={styles.header}>
                <h1 className={styles.title}>瀑布图 (Waterfall Chart)</h1>
                <p className={styles.description}>
                    瀑布图（Waterfall Chart）又称桥接图或飞瀑图，是一种用于展示数据从初始值到最终值的演变过程及各因素影响的可视化图表。
                    以柱状图为基础，通过垂直条形的增减叠加，呈现数据的累积变化。红色表示增长，绿色表示衰减，灰色表示总计。
                </p>
            </div>

            <div className={styles.main}>
                {/* 左侧内容 */}
                <div className={styles.content}>
                    {/* 季度利润瀑布图 */}
                    <section id="profit" className={styles.section}>
                        <h2 className={styles.sectionTitle}>季度利润分析</h2>
                        <p className={styles.paragraph}>
                            展示各季度利润贡献及年度总计，红色表示增长，绿色表示衰减。
                            使用 <code>isTotal: true</code> 标记总计项，从 0 开始绘制。
                        </p>

                        <div className={styles.demo}>
                            <Waterfall
                                data={profitData}
                                width={700}
                                height={400}
                                column={{
                                    positiveColor: '#ff6b5b',
                                    negativeColor: '#10b981',
                                    totalColor: '#94a3b8',
                                }}
                                label={{
                                    display: true,
                                    position: 'inside',
                                    formatter: (value) => `${value} 百万`,
                                }}
                                tooltip={{
                                    enabled: true,
                                    customContent: ({ item, cumulative }) => (
                                        <>
                                            <div style={{ fontWeight: 600, marginBottom: 6 }}>{item.label}</div>
                                            <div>数值: {item.value} 百万</div>
                                            <div>累计: {cumulative} 百万</div>
                                        </>
                                    ),
                                }}
                            />
                        </div>

                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span className={styles.codeTitle}>示例代码</span>
                                <CopyButton text={profitCode} />
                            </div>
                            <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                                {profitCode}
                            </SyntaxHighlighter>
                        </div>
                    </section>

                    {/* 收入构成瀑布图 */}
                    <section id="revenue" className={styles.section}>
                        <h2 className={styles.sectionTitle}>收入构成分析</h2>
                        <p className={styles.paragraph}>
                            展示各项收入来源累加至总收入的过程。使用 <code>position: 'outside'</code> 将标签显示在柱体外侧。
                        </p>

                        <div className={styles.demo}>
                            <Waterfall
                                data={revenueData}
                                width={700}
                                height={400}
                                column={{
                                    width: 0.5,
                                    borderRadius: 4,
                                }}
                                label={{
                                    display: true,
                                    position: 'outside',
                                    formatter: (value) => `¥${(value / 10000).toFixed(0)}万`,
                                }}
                                connector={{
                                    display: true,
                                    color: '#9ca3af',
                                    dash: [4, 4],
                                }}
                            />
                        </div>

                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span className={styles.codeTitle}>示例代码</span>
                                <CopyButton text={revenueCode} />
                            </div>
                            <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                                {revenueCode}
                            </SyntaxHighlighter>
                        </div>
                    </section>

                    {/* 预算执行瀑布图 */}
                    <section id="budget" className={styles.section}>
                        <h2 className={styles.sectionTitle}>预算执行分析</h2>
                        <p className={styles.paragraph}>
                            展示预算从年初到年末的变化过程，包含各项支出和节约。
                            通过 <code>onDataClick</code> 回调处理点击事件。
                        </p>

                        <div className={styles.demo}>
                            <Waterfall
                                data={budgetData}
                                width={800}
                                height={400}
                                yAxis={{
                                    title: {
                                        text: '金额 (元)',
                                    },
                                }}
                                label={{
                                    display: true,
                                    position: 'inside',
                                    formatter: (value) => `¥${(value / 10000).toFixed(0)}万`,
                                }}
                                onDataClick={(index, item, cumulative) => {
                                    console.log('点击数据:', { index, item, cumulative });
                                }}
                            />
                        </div>

                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span className={styles.codeTitle}>示例代码</span>
                                <CopyButton text={budgetCode} />
                            </div>
                            <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                                {budgetCode}
                            </SyntaxHighlighter>
                        </div>

                        <div className={styles.codeBlock} style={{ marginTop: 16 }}>
                            <div className={styles.codeHeader}>
                                <span className={styles.codeTitle}>自定义提示框</span>
                                <CopyButton text={tooltipCode} />
                            </div>
                            <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                                {tooltipCode}
                            </SyntaxHighlighter>
                        </div>
                    </section>

                    {/* API 文档 */}
                    <section id="api" className={styles.section}>
                        <h2 className={styles.sectionTitle}>API 文档</h2>

                        <h3 className={styles.subTitle}>Waterfall Props</h3>
                        <div className={styles.codeBlock}>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {`interface WaterfallProps {
  /** 图表数据 */
  data: WaterfallChartData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 内边距 */
  padding?: number;
  /** X轴配置 */
  xAxis?: WaterfallAxisConfig;
  /** Y轴配置 */
  yAxis?: WaterfallAxisConfig;
  /** 提示框配置 */
  tooltip?: WaterfallTooltipConfig;
  /** 连接线配置 */
  connector?: WaterfallConnectorConfig;
  /** 柱体配置 */
  column?: WaterfallColumnConfig;
  /** 标签配置 */
  label?: WaterfallLabelConfig;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 数据点击回调 */
  onDataClick?: (index: number, item: WaterfallDataItem, cumulative: number) => void;
  /** 图表渲染完成回调 */
  onChartReady?: () => void;
}`}
                            </SyntaxHighlighter>
                        </div>

                        <h3 className={styles.subTitle} style={{ marginTop: 32 }}>数据类型定义</h3>
                        <div className={styles.codeBlock}>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {`// 瀑布图数据项
interface WaterfallDataItem {
  /** 数据项标签 */
  label: string;
  /** 数据值 */
  value: number;
  /** 是否为总计项（true时显示为完整柱形） */
  isTotal?: boolean;
  /** 自定义颜色（可选） */
  color?: string;
}

// 瀑布图数据
interface WaterfallChartData {
  items: WaterfallDataItem[];
}

// 柱体配置
interface WaterfallColumnConfig {
  /** 柱体宽度 (0-1) */
  width?: number;
  /** 柱体圆角半径 */
  borderRadius?: number | number[];
  /** 正值柱体颜色（增长） */
  positiveColor?: string;
  /** 负值柱体颜色（衰减） */
  negativeColor?: string;
  /** 总计柱体颜色 */
  totalColor?: string;
}

// 连接线配置
interface WaterfallConnectorConfig {
  /** 是否显示连接线 */
  display?: boolean;
  /** 连接线颜色 */
  color?: string;
  /** 连接线宽度 */
  width?: number;
  /** 连接线样式（虚线） */
  dash?: number[];
}`}
                            </SyntaxHighlighter>
                        </div>
                    </section>
                </div>

                {/* 右侧锚点导航 */}
                <div className={styles.sidebar}>
                    {scrollContainer && (
                        <Anchor
                            getContainer={() => scrollContainer}
                            offsetTop={20}
                            affix={false}
                            bounds={30}
                        >
                            <Anchor.Link href="#profit" title="季度利润" />
                            <Anchor.Link href="#revenue" title="收入构成" />
                            <Anchor.Link href="#budget" title="预算执行" />
                            <Anchor.Link href="#api" title="API 文档" />
                        </Anchor>
                    )}
                </div>
            </div>
        </div>
    );
}
