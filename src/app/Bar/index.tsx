'use client';

import React, { useState, useEffect } from 'react';
import { Bar } from '@/components/Bar';
import { BarChartData } from '@/components/Bar/Bar.type';
import { Flex, Table, Anchor } from '@zjpcy/simple-design';
import type { Column as TableColumn } from '@zjpcy/simple-design';
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
 * 条形图示例页面
 */
export default function BarChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础条形图数据 - 产品销售排行
    const basicData: BarChartData = {
        labels: ['智能手机', '笔记本电脑', '平板电脑', '智能手表', '无线耳机', '智能音箱'],
        datasets: [
            {
                label: '销售额（万元）',
                data: [850, 720, 450, 380, 320, 280],
                backgroundColor: '#3b82f6',
            },
        ],
    };

    // 分组条形图数据 - 部门业绩对比
    const groupedData: BarChartData = {
        labels: ['销售部', '市场部', '技术部', '运营部', '客服部', '财务部'],
        datasets: [
            {
                label: '目标',
                data: [100, 80, 90, 70, 60, 50],
                backgroundColor: '#e5e7eb',
            },
            {
                label: '实际完成',
                data: [95, 85, 88, 75, 65, 52],
                backgroundColor: '#10b981',
            },
        ],
    };

    // 堆叠条形图数据 - 渠道销售构成
    const stackedData: BarChartData = {
        labels: ['华东区', '华南区', '华北区', '西南区', '西北区'],
        datasets: [
            {
                label: '线上销售',
                data: [45, 38, 32, 28, 20],
                backgroundColor: '#3b82f6',
            },
            {
                label: '线下销售',
                data: [30, 28, 25, 22, 18],
                backgroundColor: '#10b981',
            },
            {
                label: '分销渠道',
                data: [20, 18, 15, 12, 10],
                backgroundColor: '#f59e0b',
            },
        ],
    };

    // 圆角条形图数据
    const roundedData: BarChartData = {
        labels: ['项目 Alpha', '项目 Beta', '项目 Gamma', '项目 Delta', '项目 Epsilon'],
        datasets: [
            {
                label: '完成度 (%)',
                data: [95, 78, 65, 42, 30],
                backgroundColor: '#8b5cf6',
                borderRadius: [0, 4, 4, 0],
            },
        ],
    };

    // 处理数据点击
    const handleDataClick = (datasetIndex: number, dataIndex: number, value: number) => {
        console.log('点击条形:', { datasetIndex, dataIndex, value });
        alert(`数据集: ${datasetIndex}, 数据索引: ${dataIndex}, 数值: ${value}`);
    };

    // 基础条形图代码
    const basicCode = `import { Bar } from '@/components/Bar';
import type { BarChartData } from '@/components/Bar/Bar.type';

const data: BarChartData = {
    labels: ['智能手机', '笔记本电脑', '平板电脑', '智能手表', '无线耳机', '智能音箱'],
    datasets: [
        {
            label: '销售额（万元）',
            data: [850, 720, 450, 380, 320, 280],
            backgroundColor: '#3b82f6',
        },
    ],
};

export default function BasicBarChart() {
    return (
        <Bar
            data={data}
            width={500}
            height={300}
            yAxis={{ 
                display: true,
                title: { text: '产品' } 
            }}
            xAxis={{ 
                display: true,
                title: { text: '销售额（万元）' } 
            }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
}`;

    // 分组条形图代码
    const groupedCode = `import { Bar } from '@/components/Bar';
import type { BarChartData } from '@/components/Bar/Bar.type';

const data: BarChartData = {
    labels: ['销售部', '市场部', '技术部', '运营部', '客服部', '财务部'],
    datasets: [
        {
            label: '目标',
            data: [100, 80, 90, 70, 60, 50],
            backgroundColor: '#e5e7eb',
        },
        {
            label: '实际完成',
            data: [95, 85, 88, 75, 65, 52],
            backgroundColor: '#10b981',
        },
    ],
};

export default function GroupedBarChart() {
    return (
        <Bar
            data={data}
            width={500}
            height={300}
            yAxis={{ 
                display: true,
                title: { text: '部门' } 
            }}
            xAxis={{ 
                display: true,
                title: { text: '业绩' } 
            }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
}`;

    // 堆叠条形图代码
    const stackedCode = `import { Bar } from '@/components/Bar';
import type { BarChartData } from '@/components/Bar/Bar.type';

const data: BarChartData = {
    labels: ['华东区', '华南区', '华北区', '西南区', '西北区'],
    datasets: [
        {
            label: '线上销售',
            data: [45, 38, 32, 28, 20],
            backgroundColor: '#3b82f6',
        },
        {
            label: '线下销售',
            data: [30, 28, 25, 22, 18],
            backgroundColor: '#10b981',
        },
        {
            label: '分销渠道',
            data: [20, 18, 15, 12, 10],
            backgroundColor: '#f59e0b',
        },
    ],
};

export default function StackedBarChart() {
    return (
        <Bar
            data={data}
            width={500}
            height={300}
            stacked={true}
            yAxis={{ 
                display: true,
                title: { text: '区域' } 
            }}
            xAxis={{ 
                display: true,
                title: { text: '销售额' } 
            }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
}`;

    // 圆角条形图代码
    const roundedCode = `import { Bar } from '@/components/Bar';
import type { BarChartData } from '@/components/Bar/Bar.type';

const data: BarChartData = {
    labels: ['项目 Alpha', '项目 Beta', '项目 Gamma', '项目 Delta', '项目 Epsilon'],
    datasets: [
        {
            label: '完成度 (%)',
            data: [95, 78, 65, 42, 30],
            backgroundColor: '#8b5cf6',
            borderRadius: [0, 4, 4, 0],
        },
    ],
};

export default function RoundedBarChart() {
    return (
        <Bar
            data={data}
            width={500}
            height={300}
            bar={{
                height: 0.6,
                borderRadius: 4,
            }}
            yAxis={{ 
                display: true,
                title: { text: '项目' } 
            }}
            xAxis={{ 
                display: true,
                title: { text: '完成度 (%)' } 
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
}`;

    // 点击事件代码
    const clickCode = `import { Bar } from '@/components/Bar';

const handleDataClick = (datasetIndex, dataIndex, value) => {
    console.log('点击条形:', { datasetIndex, dataIndex, value });
    alert(\`数据集: \${datasetIndex}, 索引: \${dataIndex}, 数值: \${value}\`);
};

<Bar
    data={data}
    width={500}
    height={300}
    yAxis={{ 
        display: true,
        title: { text: '产品' } 
    }}
    xAxis={{ 
        display: true,
        title: { text: '销售额' } 
    }}
    legend={{
        display: true,
        position: 'top',
        labelColor: '#374151',
        labelFontSize: 12,
    }}
    onDataClick={handleDataClick}
/>`;

    // API 表格列定义
    const apiColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值', width: '100px' }
    ];

    // Bar 组件 API 数据
    const apiData = [
        { param: 'data', description: '图表数据', type: 'BarChartData', default: 'required' },
        { param: 'width', description: '图表宽度', type: 'number', default: '600' },
        { param: 'height', description: '图表高度', type: 'number', default: '400' },
        { param: 'padding', description: '图表内边距', type: 'number', default: '60' },
        { param: 'stacked', description: '是否启用堆叠模式', type: 'boolean', default: 'false' },
        { param: 'animationDuration', description: '初始动画时长（毫秒）', type: 'number', default: '1000' },
        { param: 'xAxis', description: 'X轴配置（数值轴）', type: 'BarAxisConfig', default: '-' },
        { param: 'yAxis', description: 'Y轴配置（分类轴）', type: 'BarAxisConfig', default: '-' },
        { param: 'legend', description: '图例配置', type: 'BarLegendConfig', default: '-' },
        { param: 'tooltip', description: '提示框配置', type: 'BarTooltipConfig', default: '-' },
        { param: 'bar', description: '条形样式配置', type: 'BarConfig', default: '-' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'React.CSSProperties', default: '-' },
        { param: 'onDataClick', description: '条形点击事件', type: '(datasetIndex, dataIndex, value) => void', default: '-' },
        { param: 'onChartReady', description: '图表渲染完成回调', type: '() => void', default: '-' },
    ];

    // Dataset 配置表格
    const datasetColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值', width: '100px' }
    ];

    const datasetData = [
        { param: 'label', description: '数据系列名称', type: 'string', default: '-' },
        { param: 'data', description: '数据值数组', type: 'number[]', default: 'required' },
        { param: 'backgroundColor', description: '条形填充颜色', type: 'string', default: "'#3b82f6'" },
        { param: 'borderColor', description: '条形边框颜色', type: 'string', default: '-' },
        { param: 'borderWidth', description: '条形边框宽度', type: 'number', default: '0' },
        { param: 'borderRadius', description: '条形圆角（数字或数组）', type: 'number | number[]', default: '0' },
    ];

    // 坐标轴配置数据
    const axisDataAPI = [
        { param: 'display', description: '是否显示坐标轴', type: 'boolean', default: 'true' },
        { param: 'title', description: '轴标题配置', type: '{ text: string; color?: string; fontSize?: number }', default: '-' },
        { param: 'tickColor', description: '标签颜色', type: 'string', default: "'#6b7280'" },
        { param: 'tickFontSize', description: '标签字体大小', type: 'number', default: '12' },
        { param: 'min', description: '最小值', type: 'number', default: '自动计算' },
        { param: 'max', description: '最大值', type: 'number', default: '自动计算' },
        { param: 'grid', description: '网格线配置', type: 'BarGridConfig', default: '-' },
    ];

    // 网格线配置数据
    const gridDataAPI = [
        { param: 'display', description: '是否显示网格线', type: 'boolean', default: 'false' },
        { param: 'color', description: '网格线颜色', type: 'string', default: "'#e5e7eb'" },
        { param: 'lineWidth', description: '网格线宽度', type: 'number', default: '1' },
        { param: 'opacity', description: '网格线透明度 (0-1)', type: 'number', default: '1' },
        { param: 'vertical', description: '是否显示垂直网格线', type: 'boolean', default: 'true' },
        { param: 'horizontal', description: '是否显示水平网格线', type: 'boolean', default: 'true' },
    ];

    // 条形配置数据
    const barDataAPI = [
        { param: 'height', description: '条形高度比例 (0-1)', type: 'number', default: '0.6' },
        { param: 'borderRadius', description: '条形圆角半径', type: 'number', default: '0' },
        { param: 'spacing', description: '分组内条形间距', type: 'number', default: '4' },
    ];

    // Legend 配置数据
    const legendDataAPI = [
        { param: 'display', description: '是否显示图例', type: 'boolean', default: 'true' },
        { param: 'position', description: '图例位置', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'" },
        { param: 'labelColor', description: '标签文字颜色', type: 'string', default: "'#6b7280'" },
        { param: 'labelFontSize', description: '标签字体大小', type: 'number', default: '12' },
    ];

    // Tooltip 配置数据
    const tooltipDataAPI = [
        { param: 'enabled', description: '是否显示提示框', type: 'boolean', default: 'true' },
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
                    <h2 className={styles.sectionTitle} id="bar-intro">Bar 条形图</h2>
                    <p className={styles.sectionText}>使用 Canvas 绘制的高性能条形图组件，支持分组对比、堆叠显示、圆角样式等功能。</p>

                    {/* 基础条形图 */}
                    <div className={styles.exampleSection} id="bar-basic">
                        <h3 className={styles.subsectionTitle}>基础条形图</h3>
                        <p className={styles.sectionText}>展示单一数据系列的分布情况。</p>
                        <div className={styles.exampleDemo}>
                            <Bar
                                data={basicData}
                                width={500}
                                height={300}
                                yAxis={{
                                    display: true,
                                    title: { text: '产品' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '销售额（万元）' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                    labelColor: '#374151',
                                    labelFontSize: 12,
                                }}
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

                    {/* 分组条形图 */}
                    <div className={styles.exampleSection} id="bar-grouped">
                        <h3 className={styles.subsectionTitle}>分组条形图</h3>
                        <p className={styles.sectionText}>多数据集并列显示，便于横向比较不同系列的数据。</p>
                        <div className={styles.exampleDemo}>
                            <Bar
                                data={groupedData}
                                width={500}
                                height={300}
                                yAxis={{
                                    display: true,
                                    title: { text: '部门' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '业绩' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                    labelColor: '#374151',
                                    labelFontSize: 12,
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={groupedCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {groupedCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 堆叠条形图 */}
                    <div className={styles.exampleSection} id="bar-stacked">
                        <h3 className={styles.subsectionTitle}>堆叠条形图</h3>
                        <p className={styles.sectionText}>设置 stacked=true 启用堆叠模式，展示累积数据分布。</p>
                        <div className={styles.exampleDemo}>
                            <Bar
                                data={stackedData}
                                width={500}
                                height={300}
                                stacked={true}
                                yAxis={{
                                    display: true,
                                    title: { text: '区域' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '销售额' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                    labelColor: '#374151',
                                    labelFontSize: 12,
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={stackedCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {stackedCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 圆角条形图 */}
                    <div className={styles.exampleSection} id="bar-rounded">
                        <h3 className={styles.subsectionTitle}>圆角条形图</h3>
                        <p className={styles.sectionText}>通过 borderRadius 属性设置条形圆角，支持在 dataset 中单独配置。</p>
                        <div className={styles.exampleDemo}>
                            <Bar
                                data={roundedData}
                                width={500}
                                height={300}
                                yAxis={{
                                    display: true,
                                    title: { text: '项目' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '完成度 (%)' },
                                }}
                                bar={{
                                    height: 0.6,
                                    borderRadius: 4,
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={roundedCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {roundedCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 点击事件 */}
                    <div className={styles.exampleSection} id="bar-click">
                        <h3 className={styles.subsectionTitle}>点击事件</h3>
                        <p className={styles.sectionText}>支持条形点击交互，可获取点击的数据信息。</p>
                        <div className={styles.exampleDemo}>
                            <Bar
                                data={basicData}
                                width={500}
                                height={300}
                                yAxis={{
                                    display: true,
                                    title: { text: '产品' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '销售额' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                    labelColor: '#374151',
                                    labelFontSize: 12,
                                }}
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

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="bar-api">
                        <h3 className={styles.subsectionTitle}>API 参考</h3>
                        <p className={styles.sectionText}>Bar 组件的属性配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={apiData} />
                        </div>
                    </div>

                    {/* Dataset 配置 */}
                    <div className={styles.exampleSection} id="bar-dataset">
                        <h3 className={styles.subsectionTitle}>Dataset 配置</h3>
                        <p className={styles.sectionText}>数据集配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={datasetData} />
                        </div>
                    </div>

                    {/* Axis 配置 */}
                    <div className={styles.exampleSection} id="bar-axis-api">
                        <h3 className={styles.subsectionTitle}>Axis 配置</h3>
                        <p className={styles.sectionText}>坐标轴配置项说明（xAxis 为数值轴，yAxis 为分类轴）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={axisDataAPI} />
                        </div>
                    </div>

                    {/* Grid 配置 */}
                    <div className={styles.exampleSection} id="bar-grid-api">
                        <h3 className={styles.subsectionTitle}>Grid 配置</h3>
                        <p className={styles.sectionText}>网格线配置项说明（在 xAxis 或 yAxis 的 grid 属性中配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={gridDataAPI} />
                        </div>
                    </div>

                    {/* Bar 样式配置 */}
                    <div className={styles.exampleSection} id="bar-style-api">
                        <h3 className={styles.subsectionTitle}>Bar 样式配置</h3>
                        <p className={styles.sectionText}>条形样式配置项说明（在 bar 属性中配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={barDataAPI} />
                        </div>
                    </div>

                    {/* Legend 配置 */}
                    <div className={styles.exampleSection} id="bar-legend-api">
                        <h3 className={styles.subsectionTitle}>Legend 配置</h3>
                        <p className={styles.sectionText}>图例配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={legendDataAPI} />
                        </div>
                    </div>

                    {/* Tooltip 配置 */}
                    <div className={styles.exampleSection} id="bar-tooltip-api">
                        <h3 className={styles.subsectionTitle}>Tooltip 配置</h3>
                        <p className={styles.sectionText}>提示框配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={tooltipDataAPI} />
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
                                <Anchor.Link href="#bar-intro" title="组件介绍" />
                                <Anchor.Link href="#bar-basic" title="基础条形图" />
                                <Anchor.Link href="#bar-grouped" title="分组条形图" />
                                <Anchor.Link href="#bar-stacked" title="堆叠条形图" />
                                <Anchor.Link href="#bar-rounded" title="圆角条形图" />
                                <Anchor.Link href="#bar-click" title="点击事件" />
                                <Anchor.Link href="#bar-api" title="API 参考" />
                                <Anchor.Link href="#bar-dataset" title="Dataset 配置" />
                                <Anchor.Link href="#bar-axis-api" title="Axis 配置" />
                                <Anchor.Link href="#bar-grid-api" title="Grid 配置" />
                                <Anchor.Link href="#bar-style-api" title="Bar 样式配置" />
                                <Anchor.Link href="#bar-legend-api" title="Legend 配置" />
                                <Anchor.Link href="#bar-tooltip-api" title="Tooltip 配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
