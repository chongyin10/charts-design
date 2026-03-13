'use client';

import React, { useState, useEffect } from 'react';
import { Funnel } from '@/components/Funnel';
import { FunnelChartData } from '@/components/Funnel/Funnel.type';
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
 * 漏斗图示例页面
 */
export default function FunnelChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础漏斗图数据 - 销售转化漏斗
    const basicData: FunnelChartData = {
        items: [
            { label: '曝光', value: 100000 },
            { label: '点击', value: 45000 },
            { label: '访问', value: 25000 },
            { label: '咨询', value: 8000 },
            { label: '下单', value: 3200 },
            { label: '支付', value: 2100 },
        ],
    };

    // 带自定义颜色的漏斗图数据
    const colorData: FunnelChartData = {
        items: [
            { label: '新用户', value: 50000, color: '#3b82f6' },
            { label: '注册用户', value: 35000, color: '#60a5fa' },
            { label: '活跃用户', value: 20000, color: '#93c5fd' },
            { label: '付费用户', value: 8000, color: '#bfdbfe' },
            { label: 'VIP用户', value: 3000, color: '#dbeafe' },
        ],
    };

    // 营销漏斗数据
    const marketingData: FunnelChartData = {
        items: [
            { label: '展示', value: 100000 },
            { label: '点击', value: 25000 },
            { label: '落地页访问', value: 12000 },
            { label: '加入购物车', value: 3000 },
            { label: '提交订单', value: 1500 },
            { label: '完成支付', value: 980 },
        ],
    };

    // 代码示例
    const basicCode = `import { Funnel } from '@/components/Funnel';
import { FunnelChartData } from '@/components/Funnel/Funnel.type';

const data: FunnelChartData = {
    items: [
        { label: '曝光', value: 100000 },
        { label: '点击', value: 45000 },
        { label: '访问', value: 25000 },
        { label: '咨询', value: 8000 },
        { label: '下单', value: 3200 },
        { label: '支付', value: 2100 },
    ],
};

<Funnel data={data} width={600} height={400} />`;

    const conversionCode = `import { Funnel } from '@/components/Funnel';

const data = {
    items: [
        { label: '曝光', value: 100000 },
        { label: '点击', value: 45000 },
        { label: '访问', value: 25000 },
        { label: '咨询', value: 8000 },
        { label: '下单', value: 3200 },
        { label: '支付', value: 2100 },
    ],
};

<Funnel
    data={data}
    width={600}
    height={400}
    conversion={{
        display: true,
        color: '#10b981',
        fontSize: 11,
        prefix: '转化率 ',
        suffix: '%',
    }}
/>`;

    const labelCode = `import { Funnel } from '@/components/Funnel';

const data = {
    items: [
        { label: '新用户', value: 50000 },
        { label: '注册用户', value: 35000 },
        { label: '活跃用户', value: 20000 },
        { label: '付费用户', value: 8000 },
        { label: 'VIP用户', value: 3000 },
    ],
};

// 内部标签
<Funnel
    data={data}
    width={500}
    height={400}
    label={{
        display: true,
        position: 'inside',
        formatter: '{label}',
        fontSize: 12,
    }}
/>

// 左侧标签
<Funnel
    data={data}
    width={600}
    height={400}
    label={{
        display: true,
        position: 'left',
        formatter: '{label}: {value}',
        fontSize: 12,
    }}
/>

// 右侧标签
<Funnel
    data={data}
    width={600}
    height={400}
    label={{
        display: true,
        position: 'right',
        formatter: '{label} ({percentage}%)',
        fontSize: 12,
    }}
/>`;

    const customColorCode = `import { Funnel } from '@/components/Funnel';

const data = {
    items: [
        { label: '新用户', value: 50000, color: '#3b82f6' },
        { label: '注册用户', value: 35000, color: '#60a5fa' },
        { label: '活跃用户', value: 20000, color: '#93c5fd' },
        { label: '付费用户', value: 8000, color: '#bfdbfe' },
        { label: 'VIP用户', value: 3000, color: '#dbeafe' },
    ],
};

<Funnel
    data={data}
    width={500}
    height={400}
    label={{ display: true, position: 'inside' }}
/>`;

    const clickCode = `import { Funnel } from '@/components/Funnel';

const data = {
    items: [
        { label: '曝光', value: 100000 },
        { label: '点击', value: 45000 },
        { label: '访问', value: 25000 },
        { label: '咨询', value: 8000 },
        { label: '下单', value: 3200 },
        { label: '支付', value: 2100 },
    ],
};

const handleDataClick = (index: number, item: FunnelDataItem) => {
    console.log('点击了:', item.label, '数值:', item.value);
    alert(\`点击了: \${item.label}, 数值: \${item.value}\`);
};

<Funnel
    data={data}
    width={600}
    height={400}
    onDataClick={handleDataClick}
/>`;

    const tooltipCode = `import { Funnel } from '@/components/Funnel';

const data = {
    items: [
        { label: '曝光', value: 100000 },
        { label: '点击', value: 45000 },
        { label: '访问', value: 25000 },
        { label: '咨询', value: 8000 },
        { label: '下单', value: 3200 },
        { label: '支付', value: 2100 },
    ],
};

<Funnel
    data={data}
    width={600}
    height={400}
    tooltip={{
        enabled: true,
        customContent: ({ item, percentage, conversionRate, index }) => (
            <div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {item.label}
                </div>
                <div>数值: {item.value.toLocaleString()}</div>
                <div>占比: {percentage.toFixed(1)}%</div>
                {index > 0 && (
                    <div>转化率: {conversionRate.toFixed(1)}%</div>
                )}
            </div>
        ),
    }}
/>`;

    // API 表格列定义
    const columns: Column[] = [
        { title: '属性', dataIndex: 'property', key: 'property', width: 180 },
        { title: '说明', dataIndex: 'description', key: 'description' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    // Funnel Props API 数据
    const propsData = [
        {
            property: 'data',
            description: '图表数据，包含漏斗各环节的数据项',
            type: 'FunnelChartData',
            default: 'required',
        },
        {
            property: 'width',
            description: '图表宽度（像素）',
            type: 'number',
            default: '600',
        },
        {
            property: 'height',
            description: '图表高度（像素）',
            type: 'number',
            default: '400',
        },
        {
            property: 'padding',
            description: '内边距（像素）',
            type: 'number',
            default: '40',
        },
        {
            property: 'funnelRatio',
            description: '漏斗占容器的比例 (0-1)',
            type: 'number',
            default: '0.7',
        },
        {
            property: 'neckRatio',
            description: '漏斗颈宽比例 (0-1，相对于最宽处)',
            type: 'number',
            default: '0.4',
        },
        {
            property: 'gap',
            description: '扇区间隙（像素）',
            type: 'number',
            default: '4',
        },
        {
            property: 'sort',
            description: '排序方式：desc-降序, asc-升序, none-不排序',
            type: "'desc' | 'asc' | 'none'",
            default: "'desc'",
        },
        {
            property: 'animationDuration',
            description: '动画时长（毫秒）',
            type: 'number',
            default: '800',
        },
        {
            property: 'label',
            description: '标签配置',
            type: 'FunnelLabelConfig',
            default: '-',
        },
        {
            property: 'conversion',
            description: '转化率配置',
            type: 'FunnelConversionConfig',
            default: '-',
        },
        {
            property: 'legend',
            description: '图例配置',
            type: 'FunnelLegendConfig',
            default: '-',
        },
        {
            property: 'tooltip',
            description: '提示框配置',
            type: 'FunnelTooltipConfig',
            default: '-',
        },
        {
            property: 'onDataClick',
            description: '数据点击回调函数',
            type: '(index: number, item: FunnelDataItem) => void',
            default: '-',
        },
        {
            property: 'onChartReady',
            description: '图表渲染完成回调函数',
            type: '() => void',
            default: '-',
        },
    ];

    // Label 配置 API
    const labelData = [
        {
            property: 'display',
            description: '是否显示标签',
            type: 'boolean',
            default: 'false',
        },
        {
            property: 'color',
            description: '标签文字颜色',
            type: 'string',
            default: "'#374151'",
        },
        {
            property: 'fontSize',
            description: '标签字体大小',
            type: 'number',
            default: '12',
        },
        {
            property: 'position',
            description: '标签位置：left-左侧, right-右侧, inside-内部',
            type: "'left' | 'right' | 'inside'",
            default: "'right'",
        },
        {
            property: 'formatter',
            description: '标签格式，支持占位符: {label}, {value}, {percentage}',
            type: "string | ((item: FunnelDataItem, percentage: number) => string)",
            default: "'{label}'",
        },
    ];

    // Conversion 配置 API
    const conversionData = [
        {
            property: 'display',
            description: '是否显示转化率',
            type: 'boolean',
            default: 'false',
        },
        {
            property: 'color',
            description: '转化率标签背景颜色',
            type: 'string',
            default: "'#10b981'",
        },
        {
            property: 'fontSize',
            description: '转化率字体大小',
            type: 'number',
            default: '11',
        },
        {
            property: 'prefix',
            description: '转化率前缀文字',
            type: 'string',
            default: "''",
        },
        {
            property: 'suffix',
            description: '转化率后缀文字',
            type: 'string',
            default: "'%'",
        },
        {
            property: 'formatter',
            description: '自定义格式化函数',
            type: '(rate: number) => string',
            default: '-',
        },
    ];

    // Legend 配置 API
    const legendData = [
        {
            property: 'display',
            description: '是否显示图例',
            type: 'boolean',
            default: 'true',
        },
        {
            property: 'position',
            description: '图例位置：top-顶部, bottom-底部, left-左侧, right-右侧',
            type: "'top' | 'bottom' | 'left' | 'right'",
            default: "'top'",
        },
        {
            property: 'labelColor',
            description: '图例标签颜色',
            type: 'string',
            default: "'#374151'",
        },
        {
            property: 'labelFontSize',
            description: '图例标签字体大小',
            type: 'number',
            default: '12',
        },
    ];

    // Tooltip 配置 API
    const tooltipData = [
        {
            property: 'enabled',
            description: '是否启用提示框',
            type: 'boolean',
            default: 'true',
        },
        {
            property: 'backgroundColor',
            description: '提示框背景颜色',
            type: 'string',
            default: "'#ffffff'",
        },
        {
            property: 'titleColor',
            description: '提示框标题颜色',
            type: 'string',
            default: "'#111827'",
        },
        {
            property: 'bodyColor',
            description: '提示框内容颜色',
            type: 'string',
            default: "'#374151'",
        },
        {
            property: 'fontSize',
            description: '提示框字体大小',
            type: 'number',
            default: '12',
        },
        {
            property: 'customContent',
            description: '自定义内容渲染函数',
            type: '(data: { item, percentage, conversionRate, index }) => React.ReactNode',
            default: '-',
        },
    ];

    // 数据项类型
    const dataItemData = [
        {
            property: 'label',
            description: '环节名称',
            type: 'string',
            default: 'required',
        },
        {
            property: 'value',
            description: '环节数值',
            type: 'number',
            default: 'required',
        },
        {
            property: 'color',
            description: '自定义颜色',
            type: 'string',
            default: '-',
        },
    ];

    // 点击事件处理
    const handleDataClick = (index: number, item: { label: string; value: number }) => {
        console.log('点击了:', item.label, '数值:', item.value);
        alert(`点击了: ${item.label}, 数值: ${item.value}`);
    };

    return (
        <div className={styles.examplePage}>
            <Flex gap={24} align="flex-start">
                <div className={styles.mainContent}>
                    {/* 组件介绍 */}
                    <div className={styles.exampleSection} id="funnel-intro">
                        <h1 className={styles.sectionTitle}>Funnel 漏斗图</h1>
                        <p className={styles.sectionText}>
                            漏斗图是一种形似漏斗的可视化图表，核心用于展示业务流程中各环节的转化效率。
                            上宽下窄的形态直观呈现从初始阶段到最终阶段的数据递减过程，
                            支持数据标注、转化率展示、动画效果等特性。
                        </p>
                    </div>

                    {/* 基础漏斗图 */}
                    <div className={styles.exampleSection} id="funnel-basic">
                        <h2 className={styles.subsectionTitle}>基础漏斗图</h2>
                        <p className={styles.sectionText}>
                            最简单的漏斗图用法，展示业务流程各环节的数据分布。组件会自动按数值降序排列。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Funnel data={basicData} width={600} height={400} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={basicCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {basicCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 显示转化率 */}
                    <div className={styles.exampleSection} id="funnel-conversion">
                        <h2 className={styles.subsectionTitle}>显示转化率</h2>
                        <p className={styles.sectionText}>
                            开启 conversion 配置，在漏斗各环节之间显示转化率，直观展示每一步的转化效果。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Funnel
                                data={basicData}
                                width={600}
                                height={400}
                                conversion={{
                                    display: true,
                                    color: '#10b981',
                                    fontSize: 11,
                                    prefix: '转化率 ',
                                    suffix: '%',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={conversionCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {conversionCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 标签位置 */}
                    <div className={styles.exampleSection} id="funnel-label">
                        <h2 className={styles.subsectionTitle}>标签位置</h2>
                        <p className={styles.sectionText}>
                            支持内部标签、左侧标签、右侧标签三种位置，通过 label.position 配置。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Funnel
                                data={colorData}
                                width={500}
                                height={400}
                                label={{
                                    display: true,
                                    position: 'inside',
                                    formatter: '{label}',
                                    fontSize: 12,
                                }}
                            />
                        </div>
                        <p className={styles.sectionText}>内部标签效果 ↑</p>
                        <div className={styles.exampleDemo}>
                            <Funnel
                                data={colorData}
                                width={600}
                                height={400}
                                label={{
                                    display: true,
                                    position: 'left',
                                    formatter: '{label}: {value}',
                                    fontSize: 12,
                                }}
                            />
                        </div>
                        <p className={styles.sectionText}>左侧标签效果 ↑</p>
                        <div className={styles.exampleDemo}>
                            <Funnel
                                data={colorData}
                                width={600}
                                height={400}
                                label={{
                                    display: true,
                                    position: 'right',
                                    formatter: '{label} ({percentage}%)',
                                    fontSize: 12,
                                }}
                            />
                        </div>
                        <p className={styles.sectionText}>右侧标签效果 ↑</p>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={labelCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {labelCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义颜色 */}
                    <div className={styles.exampleSection} id="funnel-color">
                        <h2 className={styles.subsectionTitle}>自定义颜色</h2>
                        <p className={styles.sectionText}>
                            通过在每个数据项中设置 color 属性，可以为不同环节指定自定义颜色。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Funnel
                                data={colorData}
                                width={500}
                                height={400}
                                label={{ display: true, position: 'inside' }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={customColorCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {customColorCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 点击事件 */}
                    <div className={styles.exampleSection} id="funnel-click">
                        <h2 className={styles.subsectionTitle}>点击事件</h2>
                        <p className={styles.sectionText}>
                            通过 onDataClick 属性可以监听数据项的点击事件，获取点击的索引和数据项信息。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Funnel
                                data={basicData}
                                width={600}
                                height={400}
                                onDataClick={handleDataClick}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={clickCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {clickCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义提示框 */}
                    <div className={styles.exampleSection} id="funnel-tooltip">
                        <h2 className={styles.subsectionTitle}>自定义提示框</h2>
                        <p className={styles.sectionText}>
                            通过 tooltip.customContent 可以完全自定义提示框的内容和样式。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Funnel
                                data={basicData}
                                width={600}
                                height={400}
                                tooltip={{
                                    enabled: true,
                                    customContent: ({ item, percentage, conversionRate, index }) => (
                                        <div>
                                            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                                                {item.label}
                                            </div>
                                            <div>数值: {item.value.toLocaleString()}</div>
                                            <div>占比: {percentage.toFixed(1)}%</div>
                                            {index > 0 && (
                                                <div>转化率: {conversionRate.toFixed(1)}%</div>
                                            )}
                                        </div>
                                    ),
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={tooltipCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {tooltipCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 营销漏斗示例 */}
                    <div className={styles.exampleSection} id="funnel-marketing">
                        <h2 className={styles.subsectionTitle}>营销漏斗示例</h2>
                        <p className={styles.sectionText}>
                            完整的营销转化漏斗展示，包含数据标注和转化率。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Funnel
                                data={marketingData}
                                width={700}
                                height={450}
                                label={{
                                    display: true,
                                    position: 'right',
                                    formatter: '{label}: {value}',
                                }}
                                conversion={{
                                    display: true,
                                    color: '#8b5cf6',
                                    fontSize: 12,
                                }}
                                gap={6}
                            />
                        </div>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="funnel-api">
                        <h2 className={styles.subsectionTitle}>API 参考</h2>
                        <p className={styles.sectionText}>Funnel 组件的属性说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={columns} dataSource={propsData} />
                        </div>
                    </div>

                    {/* 数据项类型 */}
                    <div className={styles.exampleSection} id="funnel-data-item">
                        <h3 className={styles.subsectionTitle}>FunnelDataItem 数据项</h3>
                        <p className={styles.sectionText}>漏斗图每个环节的数据结构。</p>
                        <div className={styles.apiTable}>
                            <Table columns={columns} dataSource={dataItemData} />
                        </div>
                    </div>

                    {/* Label 配置 */}
                    <div className={styles.exampleSection} id="funnel-label-api">
                        <h3 className={styles.subsectionTitle}>Label 配置</h3>
                        <p className={styles.sectionText}>标签配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={columns} dataSource={labelData} />
                        </div>
                    </div>

                    {/* Conversion 配置 */}
                    <div className={styles.exampleSection} id="funnel-conversion-api">
                        <h3 className={styles.subsectionTitle}>Conversion 配置</h3>
                        <p className={styles.sectionText}>转化率配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={columns} dataSource={conversionData} />
                        </div>
                    </div>

                    {/* Legend 配置 */}
                    <div className={styles.exampleSection} id="funnel-legend-api">
                        <h3 className={styles.subsectionTitle}>Legend 配置</h3>
                        <p className={styles.sectionText}>图例配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={columns} dataSource={legendData} />
                        </div>
                    </div>

                    {/* Tooltip 配置 */}
                    <div className={styles.exampleSection} id="funnel-tooltip-api">
                        <h3 className={styles.subsectionTitle}>Tooltip 配置</h3>
                        <p className={styles.sectionText}>提示框配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={columns} dataSource={tooltipData} />
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
                                <Anchor.Link href="#funnel-intro" title="组件介绍" />
                                <Anchor.Link href="#funnel-basic" title="基础漏斗图" />
                                <Anchor.Link href="#funnel-conversion" title="显示转化率" />
                                <Anchor.Link href="#funnel-label" title="标签位置" />
                                <Anchor.Link href="#funnel-color" title="自定义颜色" />
                                <Anchor.Link href="#funnel-click" title="点击事件" />
                                <Anchor.Link href="#funnel-tooltip" title="自定义提示框" />
                                <Anchor.Link href="#funnel-marketing" title="营销漏斗示例" />
                                <Anchor.Link href="#funnel-api" title="API 参考" />
                                <Anchor.Link href="#funnel-data-item" title="数据项类型" />
                                <Anchor.Link href="#funnel-label-api" title="Label 配置" />
                                <Anchor.Link href="#funnel-conversion-api" title="Conversion 配置" />
                                <Anchor.Link href="#funnel-legend-api" title="Legend 配置" />
                                <Anchor.Link href="#funnel-tooltip-api" title="Tooltip 配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
