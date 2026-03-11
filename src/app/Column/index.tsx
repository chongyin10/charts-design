'use client';

import React, { useState, useEffect } from 'react';
import { Column } from '@/components/Column';
import { ColumnChartData } from '@/components/Column/Column.type';
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
 * 柱状图示例页面
 */
export default function ColumnChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础柱状图数据 - 月度销售趋势
    const basicData: ColumnChartData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [
            {
                label: '2024年销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 38000, 42000, 45000],
                backgroundColor: '#3b82f6',
            },
        ],
    };

    // 分组柱状图数据
    const groupedData: ColumnChartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: '产品 A',
                data: [120, 135, 148, 162],
                backgroundColor: '#3b82f6',
            },
            {
                label: '产品 B',
                data: [80, 95, 110, 125],
                backgroundColor: '#ef4444',
            },
            {
                label: '产品 C',
                data: [60, 75, 85, 95],
                backgroundColor: '#10b981',
            },
        ],
    };

    // 堆叠柱状图数据
    const stackedData: ColumnChartData = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '线上销售',
                data: [320, 302, 301, 334, 390, 330, 320],
                backgroundColor: '#3b82f6',
            },
            {
                label: '线下销售',
                data: [120, 132, 101, 134, 90, 230, 210],
                backgroundColor: '#10b981',
            },
            {
                label: '分销渠道',
                data: [220, 182, 191, 234, 290, 330, 310],
                backgroundColor: '#f59e0b',
            },
        ],
    };

    // 圆角柱状图数据
    const roundedData: ColumnChartData = {
        labels: ['电子产品', '服装', '食品', '家居', '图书', '运动'],
        datasets: [
            {
                label: '销量',
                data: [450, 320, 280, 190, 150, 220],
                backgroundColor: '#8b5cf6',
                borderRadius: [8, 8, 0, 0],
            },
        ],
    };

    // 横向柱状图数据（通过配置实现）
    const horizontalData: ColumnChartData = {
        labels: ['北京', '上海', '广州', '深圳', '杭州', '成都'],
        datasets: [
            {
                label: '门店数量',
                data: [85, 72, 68, 65, 45, 38],
                backgroundColor: '#ec4899',
            },
        ],
    };

    // 处理数据点击
    const handleDataClick = (datasetIndex: number, dataIndex: number, value: number) => {
        console.log('点击柱体:', { datasetIndex, dataIndex, value });
        alert(`数据集: ${datasetIndex}, 数据索引: ${dataIndex}, 数值: ${value}`);
    };

    // 基础柱状图代码
    const basicCode = `import { Column } from '@zjpcy/charts-design';

const BasicColumnExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '2024年销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: '#3b82f6',
            },
        ],
    };

    return (
        <Column
            data={data}
            width={500}
            height={300}
            xAxis={{
                display: true,
                title: { text: '月份' },
            }}
            yAxis={{
                display: true,
                title: { text: '销售额 (元)' },
            }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
};`;

    // 分组柱状图代码
    const groupedCode = `import { Column } from '@zjpcy/charts-design';

const GroupedColumnExample = () => {
    const data = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: '产品 A',
                data: [120, 135, 148, 162],
                backgroundColor: '#3b82f6',
            },
            {
                label: '产品 B',
                data: [80, 95, 110, 125],
                backgroundColor: '#ef4444',
            },
            {
                label: '产品 C',
                data: [60, 75, 85, 95],
                backgroundColor: '#10b981',
            },
        ],
    };

    return (
        <Column
            data={data}
            width={500}
            height={300}
            xAxis={{ display: true, title: { text: '季度' } }}
            yAxis={{ display: true, title: { text: '销量' } }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
};`;

    // 堆叠柱状图代码
    const stackedCode = `import { Column } from '@zjpcy/charts-design';

const StackedColumnExample = () => {
    const data = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '线上销售',
                data: [320, 302, 301, 334, 390, 330, 320],
                backgroundColor: '#3b82f6',
            },
            {
                label: '线下销售',
                data: [120, 132, 101, 134, 90, 230, 210],
                backgroundColor: '#10b981',
            },
            {
                label: '分销渠道',
                data: [220, 182, 191, 234, 290, 330, 310],
                backgroundColor: '#f59e0b',
            },
        ],
    };

    return (
        <Column
            data={data}
            width={500}
            height={300}
            stacked={true}  // 启用堆叠模式
            xAxis={{ display: true, title: { text: '星期' } }}
            yAxis={{ display: true, title: { text: '销售额' } }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
};`;

    // 圆角柱状图代码
    const roundedCode = `import { Column } from '@zjpcy/charts-design';

const RoundedColumnExample = () => {
    const data = {
        labels: ['电子产品', '服装', '食品', '家居', '图书', '运动'],
        datasets: [
            {
                label: '销量',
                data: [450, 320, 280, 190, 150, 220],
                backgroundColor: '#8b5cf6',
                borderRadius: [8, 8, 0, 0],  // 顶部圆角
            },
        ],
    };

    return (
        <Column
            data={data}
            width={500}
            height={300}
            xAxis={{ display: true, title: { text: '产品分类' } }}
            yAxis={{ display: true, title: { text: '销量 (件)' } }}
            column={{
                width: 0.5,      // 柱体宽度比例 (0-1)
                borderRadius: 8, // 圆角半径
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
};`;

    // 点击事件代码
    const clickCode = `import { Column } from '@zjpcy/charts-design';

const ClickableColumnExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: '#3b82f6',
            },
        ],
    };

    const handleDataClick = (datasetIndex: number, dataIndex: number, value: number) => {
        console.log('点击柱体:', { datasetIndex, dataIndex, value });
        alert(\`数据集: \${datasetIndex}, 数据索引: \${dataIndex}, 数值: \${value}\`);
    };

    return (
        <Column
            data={data}
            width={500}
            height={300}
            onDataClick={handleDataClick}
        />
    );
};`;

    // 网格线配置代码
    const gridCode = `import { Column } from '@zjpcy/charts-design';

const GridColumnExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: '#3b82f6',
            },
        ],
    };

    return (
        <Column
            data={data}
            width={500}
            height={300}
            xAxis={{
                display: true,
                title: { text: '月份' },
                grid: {
                    display: true,      // 显示网格线
                    color: '#e5e7eb',   // 网格线颜色
                    lineWidth: 1,       // 网格线宽度
                    opacity: 0.5,       // 网格线透明度
                    vertical: true,     // 显示垂直网格线
                    horizontal: false,  // 不显示水平网格线
                }
            }}
            yAxis={{
                display: true,
                title: { text: '销售额 (元)' },
                grid: {
                    display: true,
                    color: '#3b82f6',
                    opacity: 0.2,
                }
            }}
        />
    );
};`;

    // 完整配置代码
    const fullConfigCode = `import { Column } from '@zjpcy/charts-design';

const FullConfigExample = () => {
    const data = {
        labels: ['产品A', '产品B', '产品C', '产品D'],
        datasets: [
            {
                label: '2023年',
                data: [320, 280, 250, 180],
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: [4, 4, 0, 0],
            },
            {
                label: '2024年',
                data: [380, 320, 290, 220],
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 1,
                borderRadius: [4, 4, 0, 0],
            },
        ],
    };

    return (
        <Column
            data={data}
            width={600}
            height={400}
            padding={60}
            stacked={false}
            animationDuration={1000}
            xAxis={{
                display: true,
                title: { text: '产品类型', color: '#374151', fontSize: 14 },
                tickColor: '#6b7280',
                tickFontSize: 12,
                grid: {
                    display: true,
                    color: '#e5e7eb',
                    lineWidth: 1,
                    opacity: 0.8,
                    vertical: true,
                    horizontal: false,
                },
            }}
            yAxis={{
                display: true,
                title: { text: '销量 (件)', color: '#374151' },
                min: 0,
                max: 500,
                grid: { display: true, horizontal: true },
            }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
            tooltip={{
                enabled: true,
                backgroundColor: '#ffffff',
                titleColor: '#111827',
                bodyColor: '#374151',
            }}
            column={{
                width: 0.6,      // 柱体宽度比例 (0-1)
                borderRadius: 4, // 圆角半径
                spacing: 4,      // 分组内柱体间距
            }}
            onDataClick={(datasetIndex, dataIndex, value) => {
                console.log('点击数据:', { datasetIndex, dataIndex, value });
            }}
        />
    );
};`;

    // API 表格列定义
    const apiColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值', width: '100px' }
    ];

    // Column 组件 API 数据
    const apiData = [
        { param: 'data', description: '图表数据', type: 'ColumnChartData', default: 'required' },
        { param: 'width', description: '图表宽度', type: 'number', default: '600' },
        { param: 'height', description: '图表高度', type: 'number', default: '400' },
        { param: 'padding', description: '图表内边距', type: 'number', default: '60' },
        { param: 'stacked', description: '是否启用堆叠模式', type: 'boolean', default: 'false' },
        { param: 'animationDuration', description: '初始动画时长（毫秒）', type: 'number', default: '1000' },
        { param: 'xAxis', description: 'X轴配置', type: 'ColumnAxisConfig', default: '-' },
        { param: 'yAxis', description: 'Y轴配置', type: 'ColumnAxisConfig', default: '-' },
        { param: 'legend', description: '图例配置', type: 'ColumnLegendConfig', default: '-' },
        { param: 'tooltip', description: '提示框配置', type: 'ColumnTooltipConfig', default: '-' },
        { param: 'column', description: '柱体样式配置', type: 'ColumnConfig', default: '-' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'React.CSSProperties', default: '-' },
        { param: 'onDataClick', description: '柱体点击事件', type: '(datasetIndex, dataIndex, value) => void', default: '-' },
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
        { param: 'backgroundColor', description: '柱体填充颜色', type: 'string', default: "'#3b82f6'" },
        { param: 'borderColor', description: '柱体边框颜色', type: 'string', default: '-' },
        { param: 'borderWidth', description: '柱体边框宽度', type: 'number', default: '0' },
        { param: 'borderRadius', description: '柱体圆角（数字或数组）', type: 'number | number[]', default: '0' },
    ];

    // 坐标轴配置数据
    const axisDataAPI = [
        { param: 'display', description: '是否显示坐标轴', type: 'boolean', default: 'true' },
        { param: 'title', description: '轴标题配置', type: '{ text: string; color?: string; fontSize?: number }', default: '-' },
        { param: 'tickColor', description: '标签颜色', type: 'string', default: "'#6b7280'" },
        { param: 'tickFontSize', description: '标签字体大小', type: 'number', default: '12' },
        { param: 'min', description: '最小值', type: 'number', default: '自动计算' },
        { param: 'max', description: '最大值', type: 'number', default: '自动计算' },
        { param: 'grid', description: '网格线配置', type: 'ColumnGridConfig', default: '-' },
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

    // 柱体配置数据
    const columnDataAPI = [
        { param: 'width', description: '柱体宽度比例 (0-1)', type: 'number', default: '0.6' },
        { param: 'borderRadius', description: '柱体圆角半径', type: 'number', default: '0' },
        { param: 'spacing', description: '分组内柱体间距', type: 'number', default: '4' },
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
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.sectionTitle} id="column-intro">Column 柱状图</h2>
                    <p className={styles.sectionText}>使用 Canvas 绘制的高性能柱状图组件，支持分组对比、堆叠显示、圆角样式等功能。</p>

                    {/* 基础柱状图 */}
                    <div className={styles.exampleSection} id="column-basic">
                        <h3 className={styles.subsectionTitle}>基础柱状图</h3>
                        <p className={styles.sectionText}>展示单一数据系列的分布情况。</p>
                        <div className={styles.exampleDemo}>
                            <Column
                                data={basicData}
                                width={500}
                                height={300}
                                xAxis={{
                                    display: true,
                                    title: { text: '月份' },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '销售额 (元)' },
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
                            <CopyButton text={basicCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {basicCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 分组柱状图 */}
                    <div className={styles.exampleSection} id="column-grouped">
                        <h3 className={styles.subsectionTitle}>分组柱状图</h3>
                        <p className={styles.sectionText}>多数据集并列显示，便于横向比较不同系列的数据。</p>
                        <div className={styles.exampleDemo}>
                            <Column
                                data={groupedData}
                                width={500}
                                height={300}
                                xAxis={{
                                    display: true,
                                    title: { text: '季度' },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '销量' },
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

                    {/* 堆叠柱状图 */}
                    <div className={styles.exampleSection} id="column-stacked">
                        <h3 className={styles.subsectionTitle}>堆叠柱状图</h3>
                        <p className={styles.sectionText}>设置 stacked=true 启用堆叠模式，展示累积数据分布。</p>
                        <div className={styles.exampleDemo}>
                            <Column
                                data={stackedData}
                                width={500}
                                height={300}
                                stacked={true}
                                xAxis={{
                                    display: true,
                                    title: { text: '星期' },
                                }}
                                yAxis={{
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

                    {/* 圆角柱状图 */}
                    <div className={styles.exampleSection} id="column-rounded">
                        <h3 className={styles.subsectionTitle}>圆角柱状图</h3>
                        <p className={styles.sectionText}>通过 borderRadius 属性设置柱体圆角，支持在 dataset 中单独配置。</p>
                        <div className={styles.exampleDemo}>
                            <Column
                                data={roundedData}
                                width={500}
                                height={300}
                                xAxis={{
                                    display: true,
                                    title: { text: '产品分类' },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '销量 (件)' },
                                }}
                                column={{
                                    width: 0.5,
                                    borderRadius: 8,
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
                    <div className={styles.exampleSection} id="column-click">
                        <h3 className={styles.subsectionTitle}>点击事件</h3>
                        <p className={styles.sectionText}>支持柱体点击交互，可获取点击的数据信息。</p>
                        <div className={styles.exampleDemo}>
                            <Column
                                data={basicData}
                                width={500}
                                height={300}
                                xAxis={{
                                    display: true,
                                    title: { text: '月份' },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '销售额 (元)' },
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

                    {/* 网格线示例 */}
                    <div className={styles.exampleSection} id="column-grid">
                        <h3 className={styles.subsectionTitle}>网格线配置</h3>
                        <p className={styles.sectionText}>通过配置 xAxis/yAxis 的 grid 属性，可自定义网格线的显示、颜色、宽度和透明度。</p>
                        <div className={styles.exampleDemo}>
                            <Column
                                data={basicData}
                                width={500}
                                height={300}
                                xAxis={{
                                    display: true,
                                    title: { text: '月份' },
                                    grid: {
                                        display: true,
                                        color: '#e5e7eb',
                                        lineWidth: 1,
                                        opacity: 0.5,
                                        vertical: true,
                                        horizontal: false,
                                    }
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '销售额 (元)' },
                                    grid: {
                                        display: true,
                                        color: '#3b82f6',
                                        opacity: 0.2,
                                    }
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
                            <CopyButton text={gridCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {gridCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 完整配置 */}
                    <div className={styles.exampleSection} id="column-full">
                        <h3 className={styles.subsectionTitle}>完整配置</h3>
                        <p className={styles.sectionText}>展示所有可配置项的完整示例。</p>
                        <div className={styles.exampleDemo}>
                            <Column
                                data={{
                                    labels: ['产品A', '产品B', '产品C', '产品D'],
                                    datasets: [
                                        {
                                            label: '2023年',
                                            data: [320, 280, 250, 180],
                                            backgroundColor: '#3b82f6',
                                            borderColor: '#2563eb',
                                            borderWidth: 1,
                                            borderRadius: [4, 4, 0, 0],
                                        },
                                        {
                                            label: '2024年',
                                            data: [380, 320, 290, 220],
                                            backgroundColor: '#10b981',
                                            borderColor: '#059669',
                                            borderWidth: 1,
                                            borderRadius: [4, 4, 0, 0],
                                        },
                                    ],
                                }}
                                width={600}
                                height={400}
                                padding={60}
                                xAxis={{
                                    display: true,
                                    title: { text: '产品类型', color: '#374151', fontSize: 14 },
                                    tickColor: '#6b7280',
                                    tickFontSize: 12,
                                    grid: {
                                        display: true,
                                        color: '#e5e7eb',
                                        lineWidth: 1,
                                        opacity: 0.8,
                                        vertical: true,
                                        horizontal: false,
                                    },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '销量 (件)', color: '#374151' },
                                    min: 0,
                                    max: 500,
                                    grid: { display: true, horizontal: true },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                    labelColor: '#374151',
                                    labelFontSize: 12,
                                }}
                                tooltip={{
                                    enabled: true,
                                    backgroundColor: '#ffffff',
                                    titleColor: '#111827',
                                    bodyColor: '#374151',
                                }}
                                column={{
                                    width: 0.6,
                                    borderRadius: 4,
                                    spacing: 4,
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={fullConfigCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {fullConfigCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="column-api">
                        <h3 className={styles.subsectionTitle}>API 参考</h3>
                        <p className={styles.sectionText}>Column 组件的属性配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={apiData} />
                        </div>
                    </div>

                    {/* Dataset 配置 */}
                    <div className={styles.exampleSection} id="column-dataset">
                        <h3 className={styles.subsectionTitle}>Dataset 配置</h3>
                        <p className={styles.sectionText}>数据集配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={datasetData} />
                        </div>
                    </div>

                    {/* Axis 配置 */}
                    <div className={styles.exampleSection} id="column-axis-api">
                        <h3 className={styles.subsectionTitle}>Axis 配置</h3>
                        <p className={styles.sectionText}>坐标轴配置项说明（xAxis/yAxis 通用配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={axisDataAPI} />
                        </div>
                    </div>

                    {/* Grid 配置 */}
                    <div className={styles.exampleSection} id="column-grid-api">
                        <h3 className={styles.subsectionTitle}>Grid 配置</h3>
                        <p className={styles.sectionText}>网格线配置项说明（在 xAxis 或 yAxis 的 grid 属性中配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={gridDataAPI} />
                        </div>
                    </div>

                    {/* Column 样式配置 */}
                    <div className={styles.exampleSection} id="column-style-api">
                        <h3 className={styles.subsectionTitle}>Column 样式配置</h3>
                        <p className={styles.sectionText}>柱体样式配置项说明（在 column 属性中配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={columnDataAPI} />
                        </div>
                    </div>

                    {/* Legend 配置 */}
                    <div className={styles.exampleSection} id="column-legend-api">
                        <h3 className={styles.subsectionTitle}>Legend 配置</h3>
                        <p className={styles.sectionText}>图例配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={legendDataAPI} />
                        </div>
                    </div>

                    {/* Tooltip 配置 */}
                    <div className={styles.exampleSection} id="column-tooltip-api">
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
                                <Anchor.Link href="#column-intro" title="组件介绍" />
                                <Anchor.Link href="#column-basic" title="基础柱状图" />
                                <Anchor.Link href="#column-grouped" title="分组柱状图" />
                                <Anchor.Link href="#column-stacked" title="堆叠柱状图" />
                                <Anchor.Link href="#column-rounded" title="圆角柱状图" />
                                <Anchor.Link href="#column-click" title="点击事件" />
                                <Anchor.Link href="#column-grid" title="网格线配置" />
                                <Anchor.Link href="#column-full" title="完整配置" />
                                <Anchor.Link href="#column-api" title="API 参考" />
                                <Anchor.Link href="#column-dataset" title="Dataset 配置" />
                                <Anchor.Link href="#column-axis-api" title="Axis 配置" />
                                <Anchor.Link href="#column-grid-api" title="Grid 配置" />
                                <Anchor.Link href="#column-style-api" title="Column 样式配置" />
                                <Anchor.Link href="#column-legend-api" title="Legend 配置" />
                                <Anchor.Link href="#column-tooltip-api" title="Tooltip 配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
