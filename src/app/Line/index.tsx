'use client';

import React, { useState, useEffect } from 'react';
import { Line } from '@/components/Line';
import { LineChartData } from '@/components/Line/Line.type';
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
 * 折线图示例页面
 */
export default function LineChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础折线图数据 - 月度销售趋势
    const basicData: LineChartData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [
            {
                label: '2023年销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 38000, 42000, 45000],
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointStyle: 'circle',
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
            },
        ],
    };

    // 多线对比数据
    const multiLineData: LineChartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: '产品 A',
                data: [120, 135, 148, 162],
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointStyle: 'circle',
                pointRadius: 5,
                fill: false,
            },
            {
                label: '产品 B',
                data: [80, 95, 110, 125],
                borderColor: '#ef4444',
                borderWidth: 2,
                pointStyle: 'rect',
                pointRadius: 5,
                fill: false,
            },
            {
                label: '产品 C',
                data: [60, 75, 85, 95],
                borderColor: '#10b981',
                borderWidth: 2,
                pointStyle: 'triangle',
                pointRadius: 5,
                fill: false,
            },
        ],
    };

    // 面积图数据
    const areaData: LineChartData = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '访问量',
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                borderColor: '#8b5cf6',
                borderWidth: 2,
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                fill: true,
                pointStyle: 'circle',
                pointRadius: 4,
            },
        ],
    };

    // 预警线示例数据
    const thresholdData: LineChartData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 38000, 42000, 45000],
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointStyle: 'circle',
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
            },
        ],
    };

    // 处理数据点击
    const handleDataClick = (datasetIndex: number, dataIndex: number, value: number) => {
        console.log('点击数据点:', { datasetIndex, dataIndex, value });
        alert(`数据集: ${datasetIndex}, 数据索引: ${dataIndex}, 数值: ${value}`);
    };

    // 基础折线图代码
    const basicCode = `import { Line } from '@zjpcy/charts-design';

const BasicLineExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '2023年销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointStyle: 'circle',
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
            },
        ],
    };

    return (
        <Line
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

    // 平滑曲线代码
    const smoothCode = `import { Line } from '@zjpcy/charts-design';

const SmoothLineExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '2023年销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
        ],
    };

    return (
        <Line
            data={data}
            width={500}
            height={300}
            smooth={true}
            xAxis={{ display: true, title: { text: '月份' } }}
            yAxis={{ display: true, title: { text: '销售额 (元)' } }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
};`;

    // 多线对比代码
    const multiLineCode = `import { Line } from '@zjpcy/charts-design';

const MultiLineExample = () => {
    const data = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: '产品 A',
                data: [120, 135, 148, 162],
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointStyle: 'circle',
                pointRadius: 5,
            },
            {
                label: '产品 B',
                data: [80, 95, 110, 125],
                borderColor: '#ef4444',
                borderWidth: 2,
                pointStyle: 'rect',
                pointRadius: 5,
            },
            {
                label: '产品 C',
                data: [60, 75, 85, 95],
                borderColor: '#10b981',
                borderWidth: 2,
                pointStyle: 'triangle',
                pointRadius: 5,
            },
        ],
    };

    return (
        <Line
            data={data}
            width={500}
            height={300}
            smooth={true}
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

    // 面积图代码
    const areaCode = `import { Line } from '@zjpcy/charts-design';

const AreaLineExample = () => {
    const data = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '访问量',
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                borderColor: '#8b5cf6',
                borderWidth: 2,
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                fill: true,
                pointStyle: 'circle',
                pointRadius: 4,
            },
        ],
    };

    return (
        <Line
            data={data}
            width={500}
            height={300}
            smooth={true}
            xAxis={{ display: true, title: { text: '星期' } }}
            yAxis={{ display: true, title: { text: '访问量' } }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
};`;

    // 点击事件代码
    const clickCode = `import { Line } from '@zjpcy/charts-design';

const ClickableLineExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
        ],
    };

    const handleDataClick = (datasetIndex: number, dataIndex: number, value: number) => {
        console.log('点击数据点:', { datasetIndex, dataIndex, value });
        alert(\`数据集: \${datasetIndex}, 数据索引: \${dataIndex}, 数值: \${value}\`);
    };

    return (
        <Line
            data={data}
            width={500}
            height={300}
            onDataClick={handleDataClick}
        />
    );
};`;

    // 图例配置代码
    const legendCode = `import { Line } from '@zjpcy/charts-design';

const LegendExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '线上销售',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
            {
                label: '线下销售',
                data: [8000, 12000, 11000, 15000, 18000, 20000],
                borderColor: '#10b981',
                borderWidth: 2,
            },
        ],
    };

    return (
        <Line
            data={data}
            width={500}
            height={300}
            xAxis={{ display: true, title: { text: '月份' } }}
            yAxis={{ display: true, title: { text: '销售额 (元)' } }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
};`;

    // 预警线示例代码
    const thresholdCode = `import { Line } from '@zjpcy/charts-design';

const ThresholdLineExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
        ],
    };

    return (
        <Line
            data={data}
            width={500}
            height={300}
            threshold={{
                value: 20000,              // 预警线数值
                lineColor: '#ef4444',     // 预警线颜色（红色虚线）
                lineWidth: 2,             // 预警线宽度
                aboveLineColor: '#ef4444', // 预警线上方线条颜色（红色）
                belowLineColor: '#3b82f6', // 预警线下方线条颜色（蓝色）
                showLabel: true,          // 显示预警线标签
                label: '预警值: 20000',    // 自定义标签文字
            }}
            xAxis={{ display: true, title: { text: '月份' } }}
            yAxis={{ display: true, title: { text: '销售额 (元)' } }}
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

    // Line 组件 API 数据
    const apiData = [
        { param: 'data', description: '图表数据', type: 'LineChartData', default: 'required' },
        { param: 'width', description: '图表宽度', type: 'number', default: '500' },
        { param: 'height', description: '图表高度', type: 'number', default: '300' },
        { param: 'smooth', description: '是否使用平滑曲线', type: 'boolean', default: 'false' },
        { param: 'xAxis', description: 'X轴配置', type: 'AxisConfig', default: '-' },
        { param: 'yAxis', description: 'Y轴配置', type: 'AxisConfig', default: '-' },
        { param: 'legend', description: '图例配置', type: 'LegendConfig', default: '-' },
        { param: 'tooltip', description: '提示框配置', type: 'TooltipConfig', default: '-' },
        { param: 'threshold', description: '预警线配置', type: 'ThresholdConfig', default: '-' },
        { param: 'onDataClick', description: '数据点点击事件', type: '(datasetIndex, dataIndex, value) => void', default: '-' },
    ];

    // 预警线配置数据
    const thresholdDataAPI = [
        { param: 'value', description: '预警线数值（Y轴数值）', type: 'number', default: 'required' },
        { param: 'lineColor', description: '预警线颜色', type: 'string', default: "'#ef4444'" },
        { param: 'lineWidth', description: '预警线宽度', type: 'number', default: '2' },
        { param: 'aboveLineColor', description: '预警线上方线条颜色', type: 'string', default: "'#ef4444'" },
        { param: 'belowLineColor', description: '预警线下方线条颜色', type: 'string', default: '数据集默认颜色' },
        { param: 'aboveFillColor', description: '预警线上方区域填充颜色', type: 'string', default: '-' },
        { param: 'showLabel', description: '是否显示预警线标签', type: 'boolean', default: 'true' },
        { param: 'label', description: '预警线标签文字', type: 'string', default: "'预警值: {value}'" },
    ];

    // Dataset 配置表格
    const datasetColumns: Column[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值', width: '100px' }
    ];

    const datasetData = [
        { param: 'label', description: '数据系列名称', type: 'string', default: '-' },
        { param: 'data', description: '数据值数组', type: 'number[]', default: 'required' },
        { param: 'borderColor', description: '线条颜色', type: 'string', default: '-' },
        { param: 'borderWidth', description: '线条宽度', type: 'number', default: '2' },
        { param: 'backgroundColor', description: '填充颜色（面积图）', type: 'string', default: '-' },
        { param: 'fill', description: '是否填充区域', type: 'boolean', default: 'false' },
        { param: 'pointStyle', description: '数据点样式', type: '\'circle\' | \'rect\' | \'triangle\'', default: '\'circle\'' },
        { param: 'pointRadius', description: '数据点半径', type: 'number', default: '4' },
        { param: 'pointBackgroundColor', description: '数据点背景色', type: 'string', default: '-' },
        { param: 'pointBorderColor', description: '数据点边框色', type: 'string', default: '-' },
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.sectionTitle} id="line-intro">Line 折线图</h2>
                    <p className={styles.sectionText}>使用 Canvas 绘制的高性能折线图组件，支持多线对比、面积图、平滑曲线等功能。</p>

                    {/* 基础折线图 */}
                    <div className={styles.exampleSection} id="line-basic">
                        <h3 className={styles.subsectionTitle}>基础折线图</h3>
                        <p className={styles.sectionText}>展示数据随时间的变化趋势。</p>
                        <div className={styles.exampleDemo}>
                            <Line
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

                    {/* 平滑曲线 */}
                    <div className={styles.exampleSection} id="line-smooth">
                        <h3 className={styles.subsectionTitle}>平滑曲线</h3>
                        <p className={styles.sectionText}>使用贝塞尔曲线平滑连接数据点。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={basicData}
                                width={500}
                                height={300}
                                smooth={true}
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
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={smoothCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {smoothCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 多线对比 */}
                    <div className={styles.exampleSection} id="line-multi">
                        <h3 className={styles.subsectionTitle}>多线对比</h3>
                        <p className={styles.sectionText}>同时展示多个数据系列的对比，支持不同样式的数据点。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={multiLineData}
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
                                smooth={true}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={multiLineCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {multiLineCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 面积图 */}
                    <div className={styles.exampleSection} id="line-area">
                        <h3 className={styles.subsectionTitle}>面积图</h3>
                        <p className={styles.sectionText}>填充区域展示数据累积效果。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={areaData}
                                width={500}
                                height={300}
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
                                    labelColor: '#374151',
                                    labelFontSize: 12,
                                }}
                                smooth={true}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={areaCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {areaCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 点击事件 */}
                    <div className={styles.exampleSection} id="line-click">
                        <h3 className={styles.subsectionTitle}>点击事件</h3>
                        <p className={styles.sectionText}>支持数据点点击交互，可获取点击的数据点信息。</p>
                        <div className={styles.exampleDemo}>
                            <Line
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

                    {/* 图例配置 */}
                    <div className={styles.exampleSection} id="line-legend">
                        <h3 className={styles.subsectionTitle}>图例配置</h3>
                        <p className={styles.sectionText}>自定义图例显示、位置、颜色和字体大小。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={multiLineData}
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
                                smooth={true}
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

                    {/* 预警线配置 */}
                    <div className={styles.exampleSection} id="line-threshold">
                        <h3 className={styles.subsectionTitle}>预警线</h3>
                        <p className={styles.sectionText}>在Y轴上添加预警线，横线上方的数据使用预警颜色显示，下方数据使用正常颜色显示。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={thresholdData}
                                width={500}
                                height={300}
                                threshold={{
                                    value: 25000,
                                    lineColor: '#ef4444',
                                    lineWidth: 2,
                                    aboveLineColor: '#ef4444',
                                    belowLineColor: '#3b82f6',
                                    showLabel: true,
                                    label: '预警值: 25000',
                                }}
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
                                smooth={true}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={thresholdCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {thresholdCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="line-api">
                        <h3 className={styles.subsectionTitle}>API 参考</h3>
                        <p className={styles.sectionText}>Line 组件的属性配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={apiData} />
                        </div>
                    </div>

                    {/* Dataset 配置 */}
                    <div className={styles.exampleSection} id="line-dataset">
                        <h3 className={styles.subsectionTitle}>Dataset 配置</h3>
                        <p className={styles.sectionText}>数据集配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={datasetData} />
                        </div>
                    </div>

                    {/* Legend 配置 */}
                    <div className={styles.exampleSection} id="line-legend-api">
                        <h3 className={styles.subsectionTitle}>Legend 配置</h3>
                        <p className={styles.sectionText}>图例配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={[
                                { param: 'display', description: '是否显示图例', type: 'boolean', default: 'true' },
                                { param: 'position', description: '图例位置', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'" },
                                { param: 'labelColor', description: '标签文字颜色', type: 'string', default: "'#6b7280'" },
                                { param: 'labelFontSize', description: '标签字体大小', type: 'number', default: '12' },
                            ]} />
                        </div>
                    </div>

                    {/* Threshold 配置 */}
                    <div className={styles.exampleSection} id="line-threshold-api">
                        <h3 className={styles.subsectionTitle}>Threshold 配置</h3>
                        <p className={styles.sectionText}>预警线配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={thresholdDataAPI} />
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
                                <Anchor.Link href="#line-intro" title="组件介绍" />
                                <Anchor.Link href="#line-basic" title="基础折线图" />
                                <Anchor.Link href="#line-smooth" title="平滑曲线" />
                                <Anchor.Link href="#line-multi" title="多线对比" />
                                <Anchor.Link href="#line-area" title="面积图" />
                                <Anchor.Link href="#line-click" title="点击事件" />
                                <Anchor.Link href="#line-legend" title="图例配置" />
                                <Anchor.Link href="#line-threshold" title="预警线" />
                                <Anchor.Link href="#line-api" title="API 参考" />
                                <Anchor.Link href="#line-dataset" title="Dataset 配置" />
                                <Anchor.Link href="#line-legend-api" title="Legend 配置" />
                                <Anchor.Link href="#line-threshold-api" title="Threshold 配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
