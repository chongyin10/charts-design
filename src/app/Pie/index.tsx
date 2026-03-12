'use client';

import React, { useState, useEffect } from 'react';
import { Pie } from '@/components/Pie';
import { PieChartData, PieMultiRingData } from '@/components/Pie/Pie.type';
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
 * 饼图示例页面
 */
export default function PieChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础饼图数据
    const basicData: PieChartData = {
        items: [
            { label: '直接访问', value: 335 },
            { label: '邮件营销', value: 310 },
            { label: '联盟广告', value: 234 },
            { label: '视频广告', value: 135 },
            { label: '搜索引擎', value: 1548 },
        ],
    };

    // 带自定义颜色的数据
    const colorData: PieChartData = {
        items: [
            { label: '产品 A', value: 435, color: '#3b82f6' },
            { label: '产品 B', value: 310, color: '#10b981' },
            { label: '产品 C', value: 234, color: '#f59e0b' },
            { label: '产品 D', value: 135, color: '#ef4444' },
            { label: '产品 E', value: 248, color: '#8b5cf6' },
        ],
    };

    // 多层嵌套环形图数据
    const multiRingData: PieMultiRingData = {
        layers: [
            {
                name: '2022年',
                items: [
                    { label: '线上销售', value: 450 },
                    { label: '线下销售', value: 320 },
                    { label: '分销渠道', value: 230 },
                ],
            },
            {
                name: '2023年',
                items: [
                    { label: '线上销售', value: 520 },
                    { label: '线下销售', value: 280 },
                    { label: '分销渠道', value: 200 },
                ],
            },
            {
                name: '2024年',
                items: [
                    { label: '线上销售', value: 600 },
                    { label: '线下销售', value: 250 },
                    { label: '分销渠道', value: 150 },
                ],
            },
        ],
    };

    // 处理数据点击
    const handleDataClick = (index: number, item: { label: string; value: number }) => {
        console.log('点击了:', index, item);
        alert(`索引: ${index}, 标签: ${item.label}, 数值: ${item.value}`);
    };

    // 基础饼图代码
    const basicCode = `import { Pie } from '@zjpcy/charts-design';

const BasicPieExample = () => {
    const data = {
        items: [
            { label: '直接访问', value: 335 },
            { label: '邮件营销', value: 310 },
            { label: '联盟广告', value: 234 },
            { label: '视频广告', value: 135 },
            { label: '搜索引擎', value: 1548 },
        ],
    };

    return (
        <Pie
            data={data}
            width={400}
            height={400}
            label={{ display: true, position: 'inside' }}
            legend={{ display: true, position: 'bottom' }}
            tooltip={{ enabled: true }}
        />
    );
};`;

    // 环形图代码
    const donutCode = `import { Pie } from '@zjpcy/charts-design';

const DonutPieExample = () => {
    const data = {
        items: [
            { label: '产品 A', value: 435, color: '#3b82f6' },
            { label: '产品 B', value: 310, color: '#10b981' },
            { label: '产品 C', value: 234, color: '#f59e0b' },
            { label: '产品 D', value: 135, color: '#ef4444' },
            { label: '产品 E', value: 248, color: '#8b5cf6' },
        ],
    };

    return (
        <Pie
            data={data}
            width={400}
            height={400}
            innerRadius={0.5}
            label={{ display: true, position: 'outside', formatter: '{label}: {percentage}%' }}
            legend={{ display: true, position: 'right' }}
            tooltip={{ enabled: true }}
        />
    );
};`;

    // 外部标签代码
    const outsideLabelCode = `import { Pie } from '@zjpcy/charts-design';

const OutsideLabelExample = () => {
    const data = {
        items: [
            { label: '直接访问', value: 335 },
            { label: '邮件营销', value: 310 },
            { label: '联盟广告', value: 234 },
            { label: '视频广告', value: 135 },
            { label: '搜索引擎', value: 1548 },
        ],
    };

    return (
        <Pie
            data={data}
            width={450}
            height={450}
            gap={4}
            label={{
                display: true,
                position: 'outside',
                formatter: '{label}\\n{percentage}%',
                lineLength: 15
            }}
            legend={{ display: true, position: 'bottom' }}
            tooltip={{ enabled: true }}
        />
    );
};`;

    // 自定义起始角度代码
    const startAngleCode = `import { Pie } from '@zjpcy/charts-design';

const StartAngleExample = () => {
    const data = {
        items: [
            { label: '产品 A', value: 435, color: '#3b82f6' },
            { label: '产品 B', value: 310, color: '#10b981' },
            { label: '产品 C', value: 234, color: '#f59e0b' },
            { label: '产品 D', value: 135, color: '#ef4444' },
            { label: '产品 E', value: 248, color: '#8b5cf6' },
        ],
    };

    return (
        <Pie
            data={data}
            width={400}
            height={400}
            startAngle={0}
            label={{ display: true, position: 'inside' }}
            legend={{ display: true, position: 'bottom' }}
            tooltip={{ enabled: true }}
        />
    );
};`;

    // 点击事件代码
    const clickCode = `import { Pie } from '@zjpcy/charts-design';

const ClickablePieExample = () => {
    const data = {
        items: [
            { label: '直接访问', value: 335 },
            { label: '邮件营销', value: 310 },
            { label: '联盟广告', value: 234 },
            { label: '视频广告', value: 135 },
            { label: '搜索引擎', value: 1548 },
        ],
    };

    const handleDataClick = (index, item) => {
        console.log('点击了:', index, item);
        alert(\`索引: \${index}, 标签: \${item.label}, 数值: \${item.value}\`);
    };

    return (
        <Pie
            data={data}
            width={400}
            height={400}
            label={{ display: true, position: 'inside' }}
            legend={{ display: true, position: 'bottom' }}
            tooltip={{ enabled: true }}
            onDataClick={handleDataClick}
        />
    );
};`;

    // 自定义 Tooltip 代码
    const customTooltipCode = `import { Pie } from '@zjpcy/charts-design';

const CustomTooltipExample = () => {
    const data = {
        items: [
            { label: '直接访问', value: 335 },
            { label: '邮件营销', value: 310 },
            { label: '联盟广告', value: 234 },
            { label: '视频广告', value: 135 },
            { label: '搜索引擎', value: 1548 },
        ],
    };

    return (
        <Pie
            data={data}
            width={400}
            height={400}
            tooltip={{
                enabled: true,
                customContent: ({ item, percentage }) => (
                    <div style={{ padding: '4px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {item.label}
                        </div>
                        <div>数值: {item.value}</div>
                        <div>占比: {percentage.toFixed(2)}%</div>
                    </div>
                ),
            }}
            legend={{ display: true, position: 'bottom' }}
        />
    );
};`;

    // 图例配置代码
    const legendCode = `import { Pie } from '@zjpcy/charts-design';

const LegendExample = () => {
    const data = {
        items: [
            { label: '线上销售', value: 450 },
            { label: '线下销售', value: 320 },
            { label: '分销渠道', value: 230 },
        ],
    };

    return (
        <Pie
            data={data}
            width={400}
            height={400}
            legend={{
                display: true,
                position: 'bottom',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
            label={{ display: true, position: 'inside' }}
            tooltip={{ enabled: true }}
        />
    );
};`;

    // 多层嵌套环形图代码
    const multiRingCode = `import { Pie } from '@zjpcy/charts-design';

const MultiRingExample = () => {
    const multiRingData = {
        layers: [
            {
                name: '2022年',
                items: [
                    { label: '线上销售', value: 450 },
                    { label: '线下销售', value: 320 },
                    { label: '分销渠道', value: 230 },
                ],
            },
            {
                name: '2023年',
                items: [
                    { label: '线上销售', value: 520 },
                    { label: '线下销售', value: 280 },
                    { label: '分销渠道', value: 200 },
                ],
            },
            {
                name: '2024年',
                items: [
                    { label: '线上销售', value: 600 },
                    { label: '线下销售', value: 250 },
                    { label: '分销渠道', value: 150 },
                ],
            },
        ],
    };

    return (
        <Pie
            multiRingData={multiRingData}
            width={450}
            height={450}
            gap={2}
            legend={{ display: true, position: 'bottom' }}
            tooltip={{ enabled: true }}
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

    // Pie 组件 API 数据
    const apiData = [
        { param: 'data', description: '单层图表数据', type: 'PieChartData', default: '-' },
        { param: 'multiRingData', description: '多层环形图数据', type: 'PieMultiRingData', default: '-' },
        { param: 'width', description: '图表宽度', type: 'number', default: '400' },
        { param: 'height', description: '图表高度', type: 'number', default: '400' },
        { param: 'innerRadius', description: '内半径（0-1之间为比例，>1为像素值）', type: 'number', default: '0' },
        { param: 'startAngle', description: '起始角度（度数）', type: 'number', default: '-90' },
        { param: 'gap', description: '扇区间隙（像素）', type: 'number', default: '0' },
        { param: 'animationDuration', description: '动画时长（毫秒）', type: 'number', default: '800' },
        { param: 'label', description: '标签配置', type: 'PieLabelConfig', default: '-' },
        { param: 'legend', description: '图例配置', type: 'PieLegendConfig', default: '-' },
        { param: 'tooltip', description: '提示框配置', type: 'PieTooltipConfig', default: '-' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'React.CSSProperties', default: '-' },
        { param: 'onDataClick', description: '单层数据点击事件', type: '(index, item) => void', default: '-' },
        { param: 'onMultiRingDataClick', description: '多层数据点击事件', type: '(layerIndex, dataIndex, item) => void', default: '-' },
    ];

    // 多层数据 API
    const multiRingDataAPI = [
        { param: 'layers', description: '数据层数组', type: 'PieRingLayer[]', default: 'required' },
    ];

    // 数据层 API
    const ringLayerAPI = [
        { param: 'name', description: '层名称（用于图例和 Tooltip）', type: 'string', default: '-' },
        { param: 'items', description: '该层的数据项', type: 'PieDataItem[]', default: 'required' },
        { param: 'innerRadius', description: '该层的内半径比例（0-1）', type: 'number', default: '自动计算' },
        { param: 'outerRadius', description: '该层的外半径比例（0-1）', type: 'number', default: '自动计算' },
    ];

    // 数据项配置
    const itemDataAPI = [
        { param: 'label', description: '数据标签', type: 'string', default: 'required' },
        { param: 'value', description: '数据值', type: 'number', default: 'required' },
        { param: 'color', description: '扇区颜色（可选，默认使用主题色）', type: 'string', default: '-' },
    ];

    // Label 配置数据
    const labelDataAPI = [
        { param: 'display', description: '是否显示标签', type: 'boolean', default: 'true' },
        { param: 'position', description: '标签位置', type: "'inside' | 'outside' | 'center'", default: "'inside'" },
        { param: 'color', description: '标签文字颜色', type: 'string', default: "'#ffffff' (inside) / '#374151' (outside)" },
        { param: 'fontSize', description: '标签字体大小', type: 'number', default: '12' },
        { param: 'formatter', description: '标签格式化字符串', type: 'string', default: "'{label}\\n{percentage}%'" },
        { param: 'lineLength', description: '引导线长度（outside 模式有效）', type: 'number', default: '15' },
    ];

    // Legend 配置数据
    const legendDataAPI = [
        { param: 'display', description: '是否显示图例', type: 'boolean', default: 'true' },
        { param: 'position', description: '图例位置', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'" },
        { param: 'labelColor', description: '标签文字颜色', type: 'string', default: "'#6b7280'" },
        { param: 'labelFontSize', description: '标签字体大小', type: 'number', default: '12' },
    ];

    // Tooltip 配置数据
    const tooltipDataAPI = [
        { param: 'enabled', description: '是否启用提示框', type: 'boolean', default: 'true' },
        { param: 'backgroundColor', description: '背景颜色', type: 'string', default: "'#ffffff'" },
        { param: 'titleColor', description: '标题颜色', type: 'string', default: "'#111827'" },
        { param: 'bodyColor', description: '内容颜色', type: 'string', default: "'#374151'" },
        { param: 'fontSize', description: '字体大小', type: 'number', default: '12' },
        { param: 'customContent', description: '自定义内容渲染函数', type: '(data) => ReactNode', default: '-' },
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.sectionTitle} id="pie-intro">Pie 饼图</h2>
                    <p className={styles.sectionText}>使用 Canvas 绘制的高性能饼图组件，支持饼图、环形图、自定义标签、点击交互等功能。</p>

                    {/* 基础饼图 */}
                    <div className={styles.exampleSection} id="pie-basic">
                        <h3 className={styles.subsectionTitle}>基础饼图</h3>
                        <p className={styles.sectionText}>展示各部分数据在总体中所占的比例关系。</p>
                        <div className={styles.exampleDemo}>
                            <Pie
                                data={basicData}
                                width={400}
                                height={400}
                                label={{ display: true, position: 'inside' }}
                                legend={{ display: true, position: 'bottom' }}
                                tooltip={{ enabled: true }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={basicCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {basicCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 环形图 */}
                    <div className={styles.exampleSection} id="pie-donut">
                        <h3 className={styles.subsectionTitle}>环形图 (Donut Chart)</h3>
                        <p className={styles.sectionText}>通过设置 innerRadius 创建环形图，适合展示占比关系并可在中心显示汇总信息。</p>
                        <div className={styles.exampleDemo}>
                            <Pie
                                data={colorData}
                                width={400}
                                height={400}
                                innerRadius={0.5}
                                label={{ display: true, position: 'outside', formatter: '{label}: {percentage}%' }}
                                legend={{ display: true, position: 'right' }}
                                tooltip={{ enabled: true }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={donutCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {donutCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 外部标签 + 扇区间隙 */}
                    <div className={styles.exampleSection} id="pie-outside-label">
                        <h3 className={styles.subsectionTitle}>外部标签 + 扇区间隙</h3>
                        <p className={styles.sectionText}>显示外部标签并添加扇区间隙效果，使图表更具层次感。</p>
                        <div className={styles.exampleDemo}>
                            <Pie
                                data={basicData}
                                width={450}
                                height={450}
                                gap={4}
                                label={{
                                    display: true,
                                    position: 'outside',
                                    formatter: '{label}\n{percentage}%',
                                    lineLength: 15
                                }}
                                legend={{ display: true, position: 'bottom' }}
                                tooltip={{ enabled: true }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={outsideLabelCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {outsideLabelCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义起始角度 */}
                    <div className={styles.exampleSection} id="pie-start-angle">
                        <h3 className={styles.subsectionTitle}>自定义起始角度</h3>
                        <p className={styles.sectionText}>通过 startAngle 属性控制饼图的起始绘制角度。默认从12点钟方向开始（-90度），设置为0则从3点钟方向开始。</p>
                        <div className={styles.exampleDemo}>
                            <Pie
                                data={colorData}
                                width={400}
                                height={400}
                                startAngle={0}
                                label={{ display: true, position: 'inside' }}
                                legend={{ display: true, position: 'bottom' }}
                                tooltip={{ enabled: true }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={startAngleCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {startAngleCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 点击事件 */}
                    <div className={styles.exampleSection} id="pie-click">
                        <h3 className={styles.subsectionTitle}>点击事件</h3>
                        <p className={styles.sectionText}>支持扇区点击交互，可获取点击的数据项信息。</p>
                        <div className={styles.exampleDemo}>
                            <Pie
                                data={basicData}
                                width={400}
                                height={400}
                                label={{ display: true, position: 'inside' }}
                                legend={{ display: true, position: 'bottom' }}
                                tooltip={{ enabled: true }}
                                onDataClick={handleDataClick}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={clickCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {clickCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义 Tooltip */}
                    <div className={styles.exampleSection} id="pie-tooltip-custom">
                        <h3 className={styles.subsectionTitle}>Tooltip 自定义内容</h3>
                        <p className={styles.sectionText}>通过 customContent 属性自定义 Tooltip 的显示内容，可以完全控制提示框的样式和展示信息。</p>
                        <div className={styles.exampleDemo}>
                            <Pie
                                data={basicData}
                                width={400}
                                height={400}
                                tooltip={{
                                    enabled: true,
                                    customContent: ({ item, percentage }) => (
                                        <div style={{ padding: '4px' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                                {item.label}
                                            </div>
                                            <div>数值: {item.value}</div>
                                            <div>占比: {percentage.toFixed(2)}%</div>
                                        </div>
                                    ),
                                }}
                                legend={{ display: true, position: 'bottom' }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={customTooltipCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {customTooltipCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 图例配置 */}
                    <div className={styles.exampleSection} id="pie-legend">
                        <h3 className={styles.subsectionTitle}>图例配置</h3>
                        <p className={styles.sectionText}>自定义图例显示、位置、颜色和字体大小。</p>
                        <div className={styles.exampleDemo}>
                            <Pie
                                data={{
                                    items: [
                                        { label: '线上销售', value: 450 },
                                        { label: '线下销售', value: 320 },
                                        { label: '分销渠道', value: 230 },
                                    ],
                                }}
                                width={400}
                                height={400}
                                legend={{
                                    display: true,
                                    position: 'bottom',
                                    labelColor: '#374151',
                                    labelFontSize: 12,
                                }}
                                label={{ display: true, position: 'inside' }}
                                tooltip={{ enabled: true }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={legendCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {legendCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 多层嵌套环形图 */}
                    <div className={styles.exampleSection} id="pie-multi-ring">
                        <h3 className={styles.subsectionTitle}>多层嵌套环形图</h3>
                        <p className={styles.sectionText}>通过 multiRingData 属性创建多层嵌套环形图，适合展示多维度数据的占比关系，如不同年份的销售渠道对比。每层使用同色系的不同深浅颜色，便于区分。</p>
                        <div className={styles.exampleDemo}>
                            <Pie
                                multiRingData={multiRingData}
                                width={450}
                                height={450}
                                gap={2}
                                legend={{ display: true, position: 'bottom' }}
                                tooltip={{ enabled: true }}
                                onMultiRingDataClick={(layerIndex, dataIndex, item) => {
                                    alert(`层级: ${layerIndex}, 索引: ${dataIndex}, 标签: ${item.label}, 数值: ${item.value}`);
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={multiRingCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {multiRingCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="pie-api">
                        <h3 className={styles.subsectionTitle}>API 参考</h3>
                        <p className={styles.sectionText}>Pie 组件的属性配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={apiData} />
                        </div>
                    </div>

                    {/* 数据项配置 */}
                    <div className={styles.exampleSection} id="pie-item">
                        <h3 className={styles.subsectionTitle}>数据项配置</h3>
                        <p className={styles.sectionText}>PieChartData.items 中每个数据项的配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={itemDataAPI} />
                        </div>
                    </div>

                    {/* Label 配置 */}
                    <div className={styles.exampleSection} id="pie-label-api">
                        <h3 className={styles.subsectionTitle}>Label 配置</h3>
                        <p className={styles.sectionText}>标签配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={labelDataAPI} />
                        </div>
                    </div>

                    {/* Legend 配置 */}
                    <div className={styles.exampleSection} id="pie-legend-api">
                        <h3 className={styles.subsectionTitle}>Legend 配置</h3>
                        <p className={styles.sectionText}>图例配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={legendDataAPI} />
                        </div>
                    </div>

                    {/* Tooltip 配置 */}
                    <div className={styles.exampleSection} id="pie-tooltip-api">
                        <h3 className={styles.subsectionTitle}>Tooltip 配置</h3>
                        <p className={styles.sectionText}>提示框配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={tooltipDataAPI} />
                        </div>
                    </div>

                    {/* 多层数据配置 */}
                    <div className={styles.exampleSection} id="pie-multi-ring-api">
                        <h3 className={styles.subsectionTitle}>多层数据配置</h3>
                        <p className={styles.sectionText}>multiRingData 配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={multiRingDataAPI} />
                        </div>
                    </div>

                    {/* 数据层配置 */}
                    <div className={styles.exampleSection} id="pie-layer-api">
                        <h3 className={styles.subsectionTitle}>数据层配置</h3>
                        <p className={styles.sectionText}>PieRingLayer 配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={ringLayerAPI} />
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
                                <Anchor.Link href="#pie-intro" title="组件介绍" />
                                <Anchor.Link href="#pie-basic" title="基础饼图" />
                                <Anchor.Link href="#pie-donut" title="环形图" />
                                <Anchor.Link href="#pie-outside-label" title="外部标签" />
                                <Anchor.Link href="#pie-start-angle" title="起始角度" />
                                <Anchor.Link href="#pie-click" title="点击事件" />
                                <Anchor.Link href="#pie-tooltip-custom" title="Tooltip 自定义" />
                                <Anchor.Link href="#pie-legend" title="图例配置" />
                                <Anchor.Link href="#pie-multi-ring" title="多层嵌套环形图" />
                                <Anchor.Link href="#pie-api" title="API 参考" />
                                <Anchor.Link href="#pie-item" title="数据项配置" />
                                <Anchor.Link href="#pie-label-api" title="Label 配置" />
                                <Anchor.Link href="#pie-legend-api" title="Legend 配置" />
                                <Anchor.Link href="#pie-tooltip-api" title="Tooltip 配置" />
                                <Anchor.Link href="#pie-multi-ring-api" title="多层数据配置" />
                                <Anchor.Link href="#pie-layer-api" title="数据层配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
