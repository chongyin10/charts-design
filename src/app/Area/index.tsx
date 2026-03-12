'use client';

import React, { useState, useEffect } from 'react';
import { Area } from '@/components/Area';
import { AreaChartData } from '@/components/Area/Area.type';
import { Flex, Table, Anchor } from '@zjpcy/simple-design';
import type { Column } from '@zjpcy/simple-design';
import { Prism } from 'react-syntax-highlighter';

// 修复 react-syntax-highlighter 与 React 18 的类型不兼容问题
const SyntaxHighlighter = Prism as any;
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './page.module.css';

// 导入 JSON 数据
import areaDataJson from './Json/area-data.json';
import aaplJson from './Json/aapl.json';

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
 * 面积图示例页面
 */
export default function AreaChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础面积图数据
    const basicData: AreaChartData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [
            {
                label: '2024年访问量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 1450, 1520, 1480, 1600, 1750],
                fillColor: '#3b82f6',
                fillOpacity: 0.4,
            },
        ],
    };

    // 平滑曲线面积图数据
    const smoothData: AreaChartData = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '日活跃用户',
                data: [120, 132, 101, 134, 90, 230, 210],
                fillColor: '#8b5cf6',
                fillOpacity: 0.35,
                borderColor: '#7c3aed',
                borderWidth: 3,
            },
        ],
    };

    // 多系列面积图数据
    const multiSeriesData: AreaChartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: '产品 A',
                data: [120, 135, 148, 162],
                fillColor: '#3b82f6',
                fillOpacity: 0.4,
            },
            {
                label: '产品 B',
                data: [80, 95, 110, 125],
                fillColor: '#ef4444',
                fillOpacity: 0.4,
            },
            {
                label: '产品 C',
                data: [60, 70, 85, 95],
                fillColor: '#10b981',
                fillOpacity: 0.4,
            },
        ],
    };

    // 堆叠面积图数据
    const stackedData: AreaChartData = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '邮件营销',
                data: [120, 132, 101, 134, 90, 230, 210],
                fillColor: '#3b82f6',
                fillOpacity: 0.6,
            },
            {
                label: '联盟广告',
                data: [220, 182, 191, 234, 290, 330, 310],
                fillColor: '#10b981',
                fillOpacity: 0.6,
            },
            {
                label: '视频广告',
                data: [150, 232, 201, 154, 190, 330, 410],
                fillColor: '#f59e0b',
                fillOpacity: 0.6,
            },
        ],
    };

    // 从 JSON 文件加载的股票数据（Apple 股价示例）- 原始密集数据
    // labels 使用完整日期格式，Tooltip 会显示完整时间
    const stockData: AreaChartData = {
        labels: aaplJson.map((item: { date: string }) => {
            const date = new Date(item.date);
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }),
        datasets: [
            {
                label: "AAPL 收盘价",
                data: aaplJson.map((item: { close: number }) => item.close),
                fillColor: "#3b82f6",
                fillOpacity: 0.4,
                point: false
            },
        ],
    };

    // 从 JSON 文件加载的股票数据 - 使用自定义 X 轴标签（稀疏显示）
    // labels 使用完整日期格式，Tooltip 会显示完整时间
    const customTickStockData: AreaChartData = {
        labels: aaplJson.map((item: { date: string }) => {
            const date = new Date(item.date);
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }),
        datasets: [
            {
                label: "AAPL 收盘价",
                data: aaplJson.map((item: { close: number }) => item.close),
                fillColor: "#10b981",
                fillOpacity: 0.4,
                point: false
            },
        ],
    };

    // 自定义 X 轴刻度：只显示指定年份
    const customTickLabels = ['2007-4-23', '2007-5-3', '2007-5-13', '2007-5-23', '2007-6-1', '2007-6-11'];



    // 处理数据点击
    const handleDataClick = (datasetIndex: number, dataIndex: number, value: number) => {
        console.log('点击数据点:', { datasetIndex, dataIndex, value });
        alert(`数据集: ${datasetIndex}, 数据索引: ${dataIndex}, 数值: ${value}`);
    };

    // 基础面积图代码
    const basicCode = `import { Area } from '@zjpcy/charts-design';

const BasicAreaExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '2024年访问量',
                data: [820, 932, 901, 934, 1290, 1330],
                fillColor: '#3b82f6',      // 填充颜色
                fillOpacity: 0.4,           // 填充透明度
            },
        ],
    };

    return (
        <Area
            data={data}
            width={500}
            height={300}
            xAxis={{
                display: true,
                title: { text: '月份' },
            }}
            yAxis={{
                display: true,
                title: { text: '访问量' },
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
};`;

    // 平滑曲线代码
    const smoothCode = `import { Area } from '@zjpcy/charts-design';

const SmoothAreaExample = () => {
    const data = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '日活跃用户',
                data: [120, 132, 101, 134, 90, 230, 210],
                fillColor: '#8b5cf6',
                fillOpacity: 0.35,
                borderColor: '#7c3aed',
                borderWidth: 3,
            },
        ],
    };

    return (
        <Area
            data={data}
            width={500}
            height={300}
            smooth={true}  // 启用平滑曲线
            xAxis={{ display: true, title: { text: '星期' } }}
            yAxis={{ display: true, title: { text: '用户数' } }}
        />
    );
};`;

    // 多系列代码
    const multiSeriesCode = `import { Area } from '@zjpcy/charts-design';

const MultiSeriesAreaExample = () => {
    const data = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: '产品 A',
                data: [120, 135, 148, 162],
                fillColor: '#3b82f6',
                fillOpacity: 0.4,
            },
            {
                label: '产品 B',
                data: [80, 95, 110, 125],
                fillColor: '#ef4444',
                fillOpacity: 0.4,
            },
            {
                label: '产品 C',
                data: [60, 70, 85, 95],
                fillColor: '#10b981',
                fillOpacity: 0.4,
            },
        ],
    };

    return (
        <Area
            data={data}
            width={500}
            height={300}
            xAxis={{ display: true, title: { text: '季度' } }}
            yAxis={{ display: true, title: { text: '销量' } }}
            legend={{ display: true, position: 'top' }}
        />
    );
};`;

    // 堆叠面积图代码
    const stackedCode = `import { Area } from '@zjpcy/charts-design';

const StackedAreaExample = () => {
    const data = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '邮件营销',
                data: [120, 132, 101, 134, 90, 230, 210],
                fillColor: '#3b82f6',
                fillOpacity: 0.6,
            },
            {
                label: '联盟广告',
                data: [220, 182, 191, 234, 290, 330, 310],
                fillColor: '#10b981',
                fillOpacity: 0.6,
            },
            {
                label: '视频广告',
                data: [150, 232, 201, 154, 190, 330, 410],
                fillColor: '#f59e0b',
                fillOpacity: 0.6,
            },
        ],
    };

    return (
        <Area
            data={data}
            width={500}
            height={300}
            stacked={true}  // 启用堆叠模式
            xAxis={{ display: true, title: { text: '星期' } }}
            yAxis={{ display: true, title: { text: '访问量' } }}
            legend={{ display: true, position: 'top' }}
        />
    );
};`;

    // 股票数据示例代码（从 JSON 加载）
    const stockCode = `import { Area } from '@zjpcy/charts-design';
import aaplJson from './aapl.json';

const StockAreaExample = () => {
    // 从 JSON 数据转换格式，使用完整日期格式
    const data = {
        labels: aaplJson.slice(0, 30).map(item => {
            const date = new Date(item.date);
            return \`\${date.getFullYear()}-\${date.getMonth() + 1}-\${date.getDate()}\`;
        }),
        datasets: [
            {
                label: "AAPL 收盘价",
                data: aaplJson.slice(0, 30).map(item => item.close),
                fillColor: "#3b82f6",
                fillOpacity: 0.4,
                borderColor: "#2563eb",
                borderWidth: 2,
            },
        ],
    };

    return (
        <Area
            data={data}
            width={600}
            height={300}
            smooth={true}
            xAxis={{ display: true, title: { text: '日期' } }}
            yAxis={{ display: true, title: { text: '价格 (USD)' } }}
            legend={{ display: true, position: 'top' }}
        />
    );
};`;

    // 自定义 X 轴标签代码示例
    const customTickCode = `import { Area } from '@zjpcy/charts-design';
import aaplJson from './aapl.json';

const CustomTickExample = () => {
    // 使用全部数据（数据点很多，X轴会很密集）
    // labels 使用完整日期格式，Tooltip 会显示完整时间
    const data = {
        labels: aaplJson.map(item => {
            const date = new Date(item.date);
            return \`\${date.getFullYear()}-\${date.getMonth() + 1}-\${date.getDate()}\`;
        }),
        datasets: [
            {
                label: "AAPL 收盘价",
                data: aaplJson.map(item => item.close),
                fillColor: "#10b981",
                fillOpacity: 0.4,
                point: false
            },
        ],
    };

    // 自定义 X 轴刻度：只需要提供要显示的标签
    // 标签会在图表范围内均匀分布显示
    const customTickLabels = ['2007-4-23', '2007-5-3', '2007-5-13', '2007-5-23', '2007-6-1', '2007-6-11'];

    return (
        <Area
            data={data}
            width={600}
            height={300}
            smooth={true}
            xAxis={{
                display: true,
                title: { text: '日期' },
                // 自定义 X 轴显示的刻度，均匀分布
                // Tooltip 会显示完整的 labels（如 2007-4-23）
                customTicks: customTickLabels,
            }}
            yAxis={{ display: true, title: { text: '价格 (USD)' } }}
            legend={{ display: true, position: 'top' }}
        />
    );
};`;

    // 点击事件代码
    const clickEventCode = `import { Area } from '@zjpcy/charts-design';

const ClickableAreaExample = () => {
    const data = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '访问量',
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                fillColor: '#3b82f6',
                fillOpacity: 0.4,
            },
        ],
    };

    const handleDataClick = (datasetIndex, dataIndex, value) => {
        console.log('点击数据点:', { datasetIndex, dataIndex, value });
        alert(\`数据集: \${datasetIndex}, 索引: \${dataIndex}, 值: \${value}\`);
    };

    return (
        <Area
            data={data}
            width={500}
            height={300}
            onDataClick={handleDataClick}  // 点击事件回调
            xAxis={{ display: true, title: { text: '星期' } }}
            yAxis={{ display: true, title: { text: '访问量' } }}
        />
    );
};`;

    // 自定义 Tooltip 代码
    const customTooltipCode = `import { Area } from '@zjpcy/charts-design';

const CustomTooltipExample = () => {
    const data = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: '线上销售',
                data: [320, 302, 301, 334],
                fillColor: '#3b82f6',
                fillOpacity: 0.5,
            },
            {
                label: '线下销售',
                data: [120, 132, 101, 134],
                fillColor: '#10b981',
                fillOpacity: 0.5,
            },
        ],
    };

    return (
        <Area
            data={data}
            width={500}
            height={300}
            stacked={true}
            tooltip={{
                enabled: true,
                customContent: ({ dataIndex, label, items }) => (
                    <div style={{ padding: '8px' }}>
                        <strong>{label}</strong>
                        {items.map((item) => (
                            <div key={item.datasetIndex}>
                                <span style={{ color: item.color }}>●</span>
                                {item.label}: {item.value}
                            </div>
                        ))}
                    </div>
                ),
            }}
        />
    );
};`;

    // 竖线功能代码
    const verticalLineCode = `import { Area } from '@zjpcy/charts-design';

const VerticalLineExample = () => {
    const data = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '访问量',
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                fillColor: '#3b82f6',
                fillOpacity: 0.4,
            },
            {
                label: '转化量',
                data: [320, 432, 401, 434, 590, 630, 620],
                fillColor: '#10b981',
                fillOpacity: 0.4,
            },
        ],
    };

    return (
        <Area
            data={data}
            width={500}
            height={300}
            verticalLine={{
                enabled: true,
                color: '#999',
                lineWidth: 1,
                dash: [5, 5],
            }}
            legend={{ display: true, position: 'top' }}
        />
    );
};`;

    // API 表格数据
    const areaPropsData = [
        { param: 'data', description: '图表数据', type: 'AreaChartData', default: 'required' },
        { param: 'width', description: '图表宽度', type: 'number', default: '500' },
        { param: 'height', description: '图表高度', type: 'number', default: '300' },
        { param: 'padding', description: '内边距', type: 'number', default: '60' },
        { param: 'xAxis', description: 'X轴配置', type: 'AreaAxisConfig', default: '-' },
        { param: 'yAxis', description: 'Y轴配置', type: 'AreaAxisConfig', default: '-' },
        { param: 'legend', description: '图例配置', type: 'AreaLegendConfig', default: '{ display: true }' },
        { param: 'tooltip', description: '提示框配置', type: 'AreaTooltipConfig', default: '{ enabled: true }' },
        { param: 'smooth', description: '是否平滑曲线', type: 'boolean', default: 'false' },
        { param: 'stacked', description: '是否堆叠显示', type: 'boolean', default: 'false' },
        { param: 'animationDuration', description: '动画时长（毫秒）', type: 'number', default: '1000' },
        { param: 'onDataClick', description: '数据点击回调', type: '(datasetIndex, dataIndex, value) => void', default: '-' },
        { param: 'onChartReady', description: '图表渲染完成回调', type: '() => void', default: '-' },
    ];

    // Dataset 配置表格
    const datasetColumns: Column[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型', width: '200px' },
        { dataIndex: 'default', title: '默认值', width: '120px' },
    ];

    const datasetDataAPI = [
        { param: 'label', description: '数据标签（图例显示）', type: 'string', default: 'required' },
        { param: 'data', description: '数据数组', type: 'number[]', default: 'required' },
        { param: 'fillColor', description: '填充颜色', type: 'string', default: '自动生成' },
        { param: 'fillOpacity', description: '填充透明度 (0-1)', type: 'number', default: '0.3' },
        { param: 'borderColor', description: '线条颜色', type: 'string', default: 'fillColor' },
        { param: 'borderWidth', description: '线条宽度', type: 'number', default: '2' },
        { param: 'point', description: '数据点配置，设为 false 隐藏', type: 'AreaPointConfig | false', default: '-' },
        { param: 'hidden', description: '是否隐藏此数据集', type: 'boolean', default: 'false' },
    ];

    // Grid 配置数据
    const gridDataAPI = [
        { param: 'display', description: '是否显示网格线', type: 'boolean', default: 'true' },
        { param: 'color', description: '网格线颜色', type: 'string', default: "'#e5e7eb'" },
        { param: 'lineWidth', description: '网格线宽度', type: 'number', default: '1' },
        { param: 'opacity', description: '网格线透明度 (0-1)', type: 'number', default: '1' },
        { param: 'vertical', description: '是否显示垂直网格线', type: 'boolean', default: 'true' },
        { param: 'horizontal', description: '是否显示水平网格线', type: 'boolean', default: 'true' },
    ];

    // Tooltip 配置数据
    const tooltipDataAPI = [
        { param: 'enabled', description: '是否显示提示框', type: 'boolean', default: 'true' },
        { param: 'backgroundColor', description: '背景颜色', type: 'string', default: "'#ffffff'" },
        { param: 'titleColor', description: '标题文字颜色', type: 'string', default: "'#111827'" },
        { param: 'bodyColor', description: '内容文字颜色', type: 'string', default: "'#374151'" },
        { param: 'fontSize', description: '字体大小', type: 'number', default: '12' },
        { param: 'customContent', description: '自定义内容渲染函数', type: '(data) => ReactNode', default: '-' },
    ];

    // Axis 配置数据
    const axisDataAPI = [
        { param: 'display', description: '是否显示坐标轴', type: 'boolean', default: 'true' },
        { param: 'title', description: '轴标题配置', type: '{ text: string; color?: string; fontSize?: number }', default: '-' },
        { param: 'tickColor', description: '标签颜色', type: 'string', default: "'#6b7280'" },
        { param: 'tickFontSize', description: '标签字体大小', type: 'number', default: '12' },
        { param: 'min', description: '最小值', type: 'number', default: '数据最小值' },
        { param: 'max', description: '最大值', type: 'number', default: '数据最大值' },
        { param: 'tickInterval', description: '标签间隔，每 n 个标签显示一个', type: 'number', default: '1' },
        { param: 'customTicks', description: '自定义刻度标签数组，传入后只显示指定的标签，会在图表范围内均匀分布显示', type: 'string[]', default: '-' },
        { param: 'customTickIndices', description: '自定义刻度位置数组，可选。如果提供，customTicks 会按指定索引位置显示；如果不提供，customTicks 会在图表范围内均匀分布', type: 'number[]', default: '均匀分布' },
        { param: 'grid', description: '网格线配置', type: 'AreaGridConfig', default: '-' },
    ];

    // Point 配置数据
    const pointDataAPI = [
        { param: 'style', description: '数据点样式', type: "'circle' | 'rect' | 'triangle'", default: "'circle'" },
        { param: 'radius', description: '数据点大小', type: 'number', default: '4' },
        { param: 'hoverRadius', description: '悬停时数据点大小', type: 'number', default: '6' },
        { param: 'backgroundColor', description: '数据点填充颜色', type: 'string', default: "'#ffffff'" },
        { param: 'hoverBackgroundColor', description: '悬停时填充颜色', type: 'string', default: '数据集颜色' },
        { param: 'color', description: '数据点边框颜色', type: 'string', default: '数据集颜色' },
        { param: 'width', description: '数据点边框宽度', type: 'number', default: '2' },
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.sectionTitle} id="area-intro">Area 面积图</h2>
                    <p className={styles.sectionText}>使用 Canvas 绘制的高性能面积图组件，支持平滑曲线、多系列对比、堆叠显示、从 JSON 加载数据等功能。</p>

                    {/* 基础面积图 */}
                    <div className={styles.exampleSection} id="area-basic">
                        <h3 className={styles.subsectionTitle}>基础面积图</h3>
                        <p className={styles.sectionText}>最简单的面积图示例，展示数据随时间的变化趋势。</p>
                        <div className={styles.exampleDemo}>
                            <Area
                                data={basicData}
                                width={500}
                                height={300}
                                xAxis={{
                                    display: true,
                                    title: { text: '月份' },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '访问量' },
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

                    {/* 平滑曲线 */}
                    <div className={styles.exampleSection} id="area-smooth">
                        <h3 className={styles.subsectionTitle}>平滑曲线</h3>
                        <p className={styles.sectionText}>使用 smooth 属性启用平滑曲线，让数据趋势更加柔和。</p>
                        <div className={styles.exampleDemo}>
                            <Area
                                data={smoothData}
                                width={500}
                                height={300}
                                smooth={true}
                                xAxis={{
                                    display: true,
                                    title: { text: '星期' },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '用户数' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={smoothCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {smoothCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 多系列 */}
                    <div className={styles.exampleSection} id="area-multi">
                        <h3 className={styles.subsectionTitle}>多系列对比</h3>
                        <p className={styles.sectionText}>在一个图表中展示多个数据系列，方便对比分析。</p>
                        <div className={styles.exampleDemo}>
                            <Area
                                data={multiSeriesData}
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
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={multiSeriesCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {multiSeriesCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 堆叠面积图 */}
                    <div className={styles.exampleSection} id="area-stacked">
                        <h3 className={styles.subsectionTitle}>堆叠面积图</h3>
                        <p className={styles.sectionText}>使用 stacked 属性启用堆叠模式，展示各部分占总体的比例。</p>
                        <div className={styles.exampleDemo}>
                            <Area
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
                                    title: { text: '访问量' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
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

                    {/* 从 JSON 加载数据 */}
                    <div className={styles.exampleSection} id="area-stock">
                        <h3 className={styles.subsectionTitle}>从 JSON 加载数据</h3>
                        <p className={styles.sectionText}>从 JSON 文件加载数据并转换为 Area 组件需要的格式，展示 Apple 股价走势。</p>
                        <div className={styles.exampleDemo}>
                            <Area
                                data={stockData}
                                width={600}
                                height={300}
                                smooth={true}
                                xAxis={{
                                    display: true,
                                    title: { text: '日期' },
                                    customTicks: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '价格 (USD)' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={stockCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {stockCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义 X 轴刻度 */}
                    <div className={styles.exampleSection} id="area-custom-ticks">
                        <h3 className={styles.subsectionTitle}>自定义 X 轴刻度</h3>
                        <p className={styles.sectionText}>当数据点较多导致 X 轴标签过于密集时，可以使用 customTicks 自定义显示的刻度。只需要提供标签文本，组件会自动在原始数据中查找匹配位置。</p>
                        <div className={styles.exampleDemo}>
                            <Area
                                data={customTickStockData}
                                width={600}
                                height={300}
                                smooth={true}
                                xAxis={{
                                    display: true,
                                    title: { text: '日期' },
                                    // 只需要提供要显示的标签，会在图表范围内均匀分布
                                    customTicks: customTickLabels,
                                    // 也可以直接使用数组字面量
                                    // customTicks: ['4/23', '5/3', '5/13', '5/23', '6/1', '6/11'],
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '价格 (USD)' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                                verticalLine={{
                                    enabled: true,
                                    color: '#999',
                                    lineWidth: 1,
                                    dash: [5, 5],
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={customTickCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {customTickCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 点击事件 */}
                    <div className={styles.exampleSection} id="area-click">
                        <h3 className={styles.subsectionTitle}>点击事件</h3>
                        <p className={styles.sectionText}>点击图表中的数据点可以触发回调函数，实现交互功能。</p>
                        <div className={styles.exampleDemo}>
                            <Area
                                data={smoothData}
                                width={500}
                                height={300}
                                smooth={true}
                                onDataClick={handleDataClick}
                                xAxis={{
                                    display: true,
                                    title: { text: '星期' },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '用户数' },
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={clickEventCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {clickEventCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义 Tooltip */}
                    <div className={styles.exampleSection} id="area-tooltip">
                        <h3 className={styles.subsectionTitle}>自定义 Tooltip</h3>
                        <p className={styles.sectionText}>通过 customContent 属性自定义提示框内容。</p>
                        <div className={styles.exampleDemo}>
                            <Area
                                data={stackedData}
                                width={500}
                                height={300}
                                stacked={true}
                                tooltip={{
                                    enabled: true,
                                    customContent: ({ dataIndex, label, items }) => (
                                        <div style={{ padding: '8px' }}>
                                            <strong>{label}</strong>
                                            {items.map((item) => (
                                                <div key={item.datasetIndex}>
                                                    <span style={{ color: item.color }}>●</span>
                                                    {' '}{item.label}: {item.value}
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
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

                    {/* 竖线功能 */}
                    <div className={styles.exampleSection} id="area-vertical-line">
                        <h3 className={styles.subsectionTitle}>竖线功能</h3>
                        <p className={styles.sectionText}>通过 verticalLine 属性启用竖线模式，悬停时显示垂直参考线并展示该位置的所有数据点信息。</p>
                        <div className={styles.exampleDemo}>
                            <Area
                                data={smoothData}
                                width={500}
                                height={300}
                                verticalLine={{
                                    enabled: true,
                                    color: '#999',
                                    lineWidth: 1,
                                    dash: [5, 5],
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={verticalLineCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {verticalLineCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="area-api">
                        <h3 className={styles.subsectionTitle}>Area Props</h3>
                        <p className={styles.sectionText}>组件属性说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={areaPropsData} />
                        </div>
                    </div>

                    {/* Dataset 配置 */}
                    <div className={styles.exampleSection} id="area-dataset">
                        <h3 className={styles.subsectionTitle}>Dataset 配置</h3>
                        <p className={styles.sectionText}>数据集配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={datasetDataAPI} />
                        </div>
                    </div>

                    {/* Axis 配置 */}
                    <div className={styles.exampleSection} id="area-axis-api">
                        <h3 className={styles.subsectionTitle}>Axis 配置</h3>
                        <p className={styles.sectionText}>坐标轴配置项说明（xAxis 和 yAxis 配置相同）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={axisDataAPI} />
                        </div>
                    </div>

                    {/* Grid 配置 */}
                    <div className={styles.exampleSection} id="area-grid-api">
                        <h3 className={styles.subsectionTitle}>Grid 配置</h3>
                        <p className={styles.sectionText}>网格线配置项说明（在 xAxis 或 yAxis 的 grid 属性中配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={gridDataAPI} />
                        </div>
                    </div>

                    {/* Tooltip 配置 */}
                    <div className={styles.exampleSection} id="area-tooltip-api">
                        <h3 className={styles.subsectionTitle}>Tooltip 配置</h3>
                        <p className={styles.sectionText}>提示框配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={tooltipDataAPI} />
                        </div>
                    </div>

                    {/* Point 配置 */}
                    <div className={styles.exampleSection} id="area-point-api">
                        <h3 className={styles.subsectionTitle}>Point 配置</h3>
                        <p className={styles.sectionText}>数据点配置项说明（在 dataset 的 point 属性中配置，设置为 false 可隐藏数据点）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={pointDataAPI} />
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
                                <Anchor.Link href="#area-intro" title="组件介绍" />
                                <Anchor.Link href="#area-basic" title="基础面积图" />
                                <Anchor.Link href="#area-smooth" title="平滑曲线" />
                                <Anchor.Link href="#area-multi" title="多系列" />
                                <Anchor.Link href="#area-stacked" title="堆叠面积图" />
                                <Anchor.Link href="#area-stock" title="JSON 数据加载" />
                                <Anchor.Link href="#area-custom-ticks" title="自定义 X 轴刻度" />
                                <Anchor.Link href="#area-click" title="点击事件" />
                                <Anchor.Link href="#area-tooltip" title="自定义 Tooltip" />
                                <Anchor.Link href="#area-vertical-line" title="竖线功能" />
                                <Anchor.Link href="#area-api" title="API 参考" />
                                <Anchor.Link href="#area-dataset" title="Dataset 配置" />
                                <Anchor.Link href="#area-axis-api" title="Axis 配置" />
                                <Anchor.Link href="#area-grid-api" title="Grid 配置" />
                                <Anchor.Link href="#area-tooltip-api" title="Tooltip 配置" />
                                <Anchor.Link href="#area-point-api" title="Point 配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
