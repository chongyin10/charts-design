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

// 导入 JSON 数据
import trendDataJson from './Json/trend-data.json';

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
                track: {
                    color: '#3b82f6',
                    width: 2,
                },
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
                track: {
                    color: '#3b82f6',
                    width: 2,
                },
            },
            {
                label: '产品 B',
                data: [80, 95, 110, 125],
                track: {
                    color: '#ef4444',
                    width: 2,
                },
            },
            {
                label: '产品 C',
                data: [60, 75, 85, 95],
                track: {
                    color: '#10b981',
                    width: 2,
                },
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
                track: {
                    color: '#8b5cf6',
                    width: 2,
                },
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                fill: true,
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
                track: {
                    color: '#3b82f6',
                    width: 2,
                },
            },
        ],
    };

    // 预警线+面积图示例数据
    const thresholdAreaData: LineChartData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 38000, 42000, 45000],
                track: {
                    color: '#3b82f6',
                    width: 2,
                },
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
            },
        ],
    };

    // 轨迹动画示例数据
    const trailAnimationData: LineChartData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [
            {
                label: '2023年趋势',
                data: [15000, 22000, 18000, 28000, 25000, 32000, 30000, 38000, 35000, 42000, 45000, 48000],
                track: {
                    color: '#3b82f6',
                    width: 2,
                },
            },
        ],
    };

    // 分组数据示例 - 按日期分组的多线图数据
    const groupedData: LineChartData = {
        labels: ['2018/8/1', '2018/8/2', '2018/8/3', '2018/8/4', '2018/8/5', '2018/8/6', '2018/8/7', '2018/8/8', '2018/8/9', '2018/8/10', '2018/8/11', '2018/8/12', '2018/8/13', '2018/8/14', '2018/8/15'],
        datasets: [
            {
                label: 'download',
                data: [4623, 6145, 508, 6268, 6411, 1890, 4251, 2978, 3880, 3606, 4311, 4116, 6419, 1643, 445],
                track: {
                    color: '#3b82f6',
                    width: 0,
                },
                point: false, // 隐藏数据点
                fill: false,
            },
            {
                label: 'register',
                data: [2208, 2016, 2916, 4512, 8281, 2008, 1963, 2367, 2956, 678, 3188, 3491, 2852, 4788, 4319],
                track: {
                    color: '#10b981',
                    width: 2,
                },
                point: {
                    hoverBackgroundColor: '#10b981',
                    width: 2,
                    style: 'rect',
                    radius: 4,
                },
                fill: false,
            },
            {
                label: 'bill',
                data: [182, 257, 289, 428, 619, 87, 706, 387, 488, 507, 548, 456, 689, 280, 176],
                track: {
                    color: '#f59e0b',
                    width: 2,
                },
                point: {
                    hoverBackgroundColor: '#f59e0b',
                    width: 2,
                    style: 'triangle',
                    radius: 4,
                },
                fill: false,
            },
        ],
    };

    // 处理从 JSON 加载的趋势数据
    const processTrendData = (): LineChartData => {
        // 定义数据项类型
        interface TrendDataItem {
            Date: string;
            series: string;
            value: number;
        }

        const data = trendDataJson as TrendDataItem[];

        // 获取唯一的日期列表
        const dates = [...new Set(data.map(item => item.Date))];

        // 获取唯一的系列列表
        const seriesList = [...new Set(data.map(item => item.series))];

        // 定义颜色映射
        const colorMap: Record<string, string> = {
            'USA': '#3b82f6',
            'California': '#ef4444',
            'BA9C': '#10b981',
            'Marin': '#f59e0b',
        };

        // 定义点样式映射
        const pointStyleMap: Record<string, 'circle' | 'rect' | 'triangle'> = {
            'USA': 'circle',
            'California': 'rect',
            'BA9C': 'triangle',
            'Marin': 'circle',
        };

        // 构建 datasets
        const datasets = seriesList.map(series => {
            const seriesData = data
                .filter(item => item.series === series)
                .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
                .map(item => item.value);

            return {
                label: series,
                data: seriesData,
                color: colorMap[series] || '#3b82f6',
                width: 2,
                point: false as const,
                fill: false,
            };
        });

        return {
            labels: dates,
            datasets,
        };
    };

    const trendData = processTrendData();

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
                color: '#3b82f6',
                width: 2,
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
                color: '#3b82f6',
                width: 2,
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
                color: '#3b82f6',
                width: 2,
            },
            {
                label: '产品 B',
                data: [80, 95, 110, 125],
                color: '#ef4444',
                width: 2,
            },
            {
                label: '产品 C',
                data: [60, 75, 85, 95],
                color: '#10b981',
                width: 2,
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
                color: '#8b5cf6',
                width: 2,
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                fill: true,
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
                color: '#3b82f6',
                width: 2,
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
                color: '#3b82f6',
                width: 2,
            },
            {
                label: '线下销售',
                data: [8000, 12000, 11000, 15000, 18000, 20000],
                color: '#10b981',
                width: 2,
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
                color: '#3b82f6',
                width: 2,
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

    // 预警线+面积图示例代码
    const thresholdAreaCode = `import { Line } from '@zjpcy/charts-design';

const ThresholdAreaExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                color: '#3b82f6',
                width: 2,
                fill: true,                          // 启用面积图
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
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
                lineColor: '#ef4444',     // 预警线颜色
                lineWidth: 2,
                aboveLineColor: '#ef4444', // 预警线上方线条颜色
                belowLineColor: '#3b82f6', // 预警线下方线条颜色
                aboveFillColor: 'rgba(239, 68, 68, 0.3)', // 预警线上方填充颜色
                showLabel: true,
                label: '预警值: 20000',
            }}
            xAxis={{ display: true, title: { text: '月份' } }}
            yAxis={{ display: true, title: { text: '销售额 (元)' } }}
            smooth={true}
        />
    );
};`;

    // 网格线示例代码
    const gridCode = `import { Line } from '@zjpcy/charts-design';

const GridLineExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                color: '#3b82f6',
                width: 2,
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

    // 数据点配置示例代码
    const pointCode = `import { Line } from '@zjpcy/charts-design';

const PointExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '2023年销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                color: '#3b82f6',
                width: 2,
                point: {
                    hoverBackgroundColor: '#3b82f6',     // 悬停时填充颜色
                    width: 2,
                    style: 'circle',            // 圆形样式
                    radius: 5,                  // 数据点大小
                    hoverRadius: 8,             // 悬停时大小
                    backgroundColor: '#fff',    // 填充颜色
                },
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

    // 轨迹动画示例代码
    const trailAnimationCode = `import { Line } from '@zjpcy/charts-design';

const TrailAnimationExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [
            {
                label: '2023年销售额',
                data: [15000, 22000, 18000, 28000, 25000, 32000, 30000, 38000, 35000, 42000, 45000, 48000],
                color: '#3b82f6',
                width: 2,
            },
        ],
    };

    return (
        <Line
            data={data}
            width={500}
            height={300}
            trailAnimation={{
                enabled: true,        // 启用轨迹动画
                duration: 3000,       // 动画时长 3 秒
                trailColor: '#10b981', // 轨迹颜色（绿色）
                trailWidth: 8,        // 轨迹宽度
                trailLength: 25,      // 轨迹长度（像素）
                trailOpacity: 0.7,    // 轨迹透明度
                loop: true,           // 循环播放
            }}
            xAxis={{ display: true, title: { text: '月份' } }}
            yAxis={{ display: true, title: { text: '销售额 (元)' } }}
            smooth={true}
        />
    );
};`;

    // 轨道连接示例代码（更新为最新 API）
    const trackConnectionCode = `import { Line } from '@zjpcy/charts-design';

const TrackConnectionExample = () => {
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [
            {
                label: '销售额',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 38000, 42000, 45000],
                color: '#3b82f6',
                width: 2,
                point: {
                    backgroundColor: '#3b82f6',
                    hoverBackgroundColor: '#3b82f6',
                    width: 2,
                    style: 'circle',
                    radius: 4,
                },
                // 启用轨道连接，配置轨道颜色
                track: {
                    color: '#3b82f6',
                },
            },
        ],
    };

    return (
        <Line
            data={data}
            width={500}
            height={300}
        />
    );
};`;

    // 分组数据示例代码
    const groupedDataCode = `import { Line } from '@zjpcy/charts-design';

const GroupedDataExample = () => {
    const data = {
        labels: ['2018/8/1', '2018/8/2', '2018/8/3', '2018/8/4', '2018/8/5',
                 '2018/8/6', '2018/8/7', '2018/8/8', '2018/8/9', '2018/8/10',
                 '2018/8/11', '2018/8/12', '2018/8/13', '2018/8/14', '2018/8/15'],
        datasets: [
            {
                label: 'download',
                data: [4623, 6145, 508, 6268, 6411, 1890, 4251, 2978, 3880, 3606,
                       4311, 4116, 6419, 1643, 445],
                color: '#3b82f6',
                width: 0,
                point: false,  // 隐藏数据点
            },
            {
                label: 'register',
                data: [2208, 2016, 2916, 4512, 8281, 2008, 1963, 2367, 2956, 678,
                       3188, 3491, 2852, 4788, 4319],
                color: '#10b981',
                width: 2,
                point: {
                    style: 'rect',
                    radius: 4,
                },
            },
            {
                label: 'bill',
                data: [182, 257, 289, 428, 619, 87, 706, 387, 488, 507,
                       548, 456, 689, 280, 176],
                color: '#f59e0b',
                width: 2,
                point: {
                    style: 'triangle',
                    radius: 4,
                },
            },
        ],
    };

    return (
        <Line
            data={data}
            width={600}
            height={350}
            smooth={true}
            xAxis={{ display: true, title: { text: '日期' } }}
            yAxis={{ display: true, title: { text: '数值' } }}
            legend={{
                display: true,
                position: 'top',
                labelColor: '#374151',
                labelFontSize: 12,
            }}
        />
    );
};`;

    // JSON 数据加载示例代码
    const jsonDataCode = `import { Line } from '@zjpcy/charts-design';
import trendDataJson from './Json/trend-data.json';

const JsonDataExample = () => {
    // 处理从 JSON 加载的趋势数据
    const processTrendData = () => {
        // 获取唯一的日期列表
        const dates = [...new Set(trendDataJson.map(item => item.Date))];

        // 获取唯一的系列列表
        const seriesList = [...new Set(trendDataJson.map(item => item.series))];

        // 构建 datasets
        const datasets = seriesList.map(series => {
            const seriesData = trendDataJson
                .filter(item => item.series === series)
                .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
                .map(item => item.value);

            return {
                label: series,
                data: seriesData,
                color: {
                    'USA': '#3b82f6',
                    'California': '#ef4444',
                    'BA9C': '#10b981',
                    'Marin': '#f59e0b',
                }[series] || '#3b82f6',
                width: 2,
                point: {
                    style: 'circle',
                    radius: 3,
                },
            };
        });

        return {
            labels: dates,
            datasets,
        };
    };

    const trendData = processTrendData();

    return (
        <Line
            data={trendData}
            width={700}
            height={400}
            smooth={true}
            xAxis={{
                display: true,
                title: { text: '日期' },
                grid: { display: true, opacity: 0.3 }
            }}
            yAxis={{
                display: true,
                title: { text: '数值' },
                grid: { display: true, opacity: 0.3 }
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
        { param: 'padding', description: '图表内边距', type: 'number', default: '60' },
        { param: 'smooth', description: '是否使用平滑曲线', type: 'boolean', default: 'false' },
        { param: 'animationDuration', description: '初始动画时长（毫秒）', type: 'number', default: '1000' },
        { param: 'xAxis', description: 'X轴配置', type: 'LineAxisConfig', default: '-' },
        { param: 'yAxis', description: 'Y轴配置', type: 'LineAxisConfig', default: '-' },
        { param: 'legend', description: '图例配置', type: 'LineLegendConfig', default: '-' },
        { param: 'tooltip', description: '提示框配置', type: 'LineTooltipConfig', default: '-' },
        { param: 'threshold', description: '预警线配置', type: 'LineThresholdConfig', default: '-' },
        { param: 'trailAnimation', description: '轨迹动画配置', type: 'LineTrailAnimationConfig', default: '-' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'React.CSSProperties', default: '-' },
        { param: 'onDataClick', description: '数据点点击事件', type: '(datasetIndex, dataIndex, value) => void', default: '-' },
        { param: 'onChartReady', description: '图表渲染完成回调', type: '() => void', default: '-' },
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

    // 网格线配置数据
    const gridDataAPI = [
        { param: 'display', description: '是否显示网格线', type: 'boolean', default: 'false' },
        { param: 'color', description: '网格线颜色', type: 'string', default: "'#e5e7eb'" },
        { param: 'lineWidth', description: '网格线宽度', type: 'number', default: '1' },
        { param: 'opacity', description: '网格线透明度 (0-1)', type: 'number', default: '1' },
        { param: 'vertical', description: '是否显示垂直网格线', type: 'boolean', default: 'true' },
        { param: 'horizontal', description: '是否显示水平网格线', type: 'boolean', default: 'true' },
    ];

    // 数据点配置数据（Dataset 内部配置）
    const pointDataAPI = [
        { param: 'style', description: '数据点样式', type: "'circle' | 'rect' | 'triangle'", default: "'circle'" },
        { param: 'radius', description: '数据点大小', type: 'number', default: '4' },
        { param: 'hoverRadius', description: '悬停时数据点大小', type: 'number', default: '6' },
        { param: 'hoverBackgroundColor', description: '悬停时数据点填充颜色', type: 'string', default: '与线条颜色相同' },
        { param: 'color', description: '数据点边框颜色', type: 'string', default: '与线条颜色相同' },
        { param: 'width', description: '数据点边框宽度', type: 'number', default: '2' },
        { param: 'backgroundColor', description: '数据点填充颜色', type: 'string', default: "'#fff'" },
    ];

    // 轨迹动画配置数据
    const trailAnimationDataAPI = [
        { param: 'enabled', description: '是否启用轨迹动画', type: 'boolean', default: 'false' },
        { param: 'duration', description: '轨迹动画时长（毫秒）', type: 'number', default: '2000' },
        { param: 'trailColor', description: '轨迹颜色', type: 'string', default: '与线条颜色相同' },
        { param: 'trailWidth', description: '轨迹宽度', type: 'number', default: '6' },
        { param: 'trailLength', description: '轨迹长度（像素）', type: 'number', default: '20' },
        { param: 'trailOpacity', description: '轨迹透明度 (0-1)', type: 'number', default: '0.6' },
        { param: 'loop', description: '是否循环播放', type: 'boolean', default: 'false' },
    ];

    // 轨道配置数据（Dataset 内部配置）
    const trackDataAPI = [
        { param: 'color', description: '轨道颜色（默认为线条颜色）', type: 'string', default: '与线条颜色相同' },
        { param: 'width', description: '轨道宽度', type: 'number', default: '与线条宽度相同' },
        { param: 'hoverColor', description: '悬停时轨道颜色', type: 'string', default: '与线条颜色相同' },
        { param: 'hoverWidth', description: '悬停时轨道宽度', type: 'number', default: '与线条宽度相同' },
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
        { param: 'backgroundColor', description: '填充颜色（面积图）', type: 'string', default: '-' },
        { param: 'fill', description: '是否填充区域', type: 'boolean', default: 'false' },
        { param: 'point', description: '数据点配置，设置为 false 隐藏数据点', type: 'DatasetPointConfig | false', default: '-' },
        { param: 'track', description: '轨道样式配置', type: 'LineTrackConfig', default: '-' },
    ];

    // 坐标轴配置数据
    const axisDataAPI = [
        { param: 'display', description: '是否显示坐标轴', type: 'boolean', default: 'true' },
        { param: 'title', description: '轴标题配置', type: '{ text: string; color?: string; fontSize?: number }', default: '-' },
        { param: 'tickColor', description: '标签颜色', type: 'string', default: "'#6b7280'" },
        { param: 'tickFontSize', description: '标签字体大小', type: 'number', default: '12' },
        { param: 'min', description: '最小值', type: 'number', default: '自动计算' },
        { param: 'max', description: '最大值', type: 'number', default: '自动计算' },
        { param: 'grid', description: '网格线配置', type: 'LineGridConfig', default: '-' },
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
                    <h2 className={styles.sectionTitle} id="line-intro">Line 折线图</h2>
                    <p className={styles.sectionText}>使用 Canvas 绘制的高性能折线图组件，支持多线对比、面积图、平滑曲线、轨迹动画等功能。</p>

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

                        <h4 className={styles.subsectionTitle} style={{ marginTop: '2rem' }}>预警线 + 面积图</h4>
                        <p className={styles.sectionText}>当设置 fill=true 时，预警线上方的区域可以单独设置填充颜色，下方区域按正常颜色显示。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={thresholdAreaData}
                                width={500}
                                height={300}
                                threshold={{
                                    value: 25000,
                                    lineColor: '#ef4444',
                                    lineWidth: 2,
                                    aboveLineColor: '#ef4444',
                                    belowLineColor: '#3b82f6',
                                    aboveFillColor: 'rgba(239, 68, 68, 0.3)',
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
                            <CopyButton text={thresholdAreaCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {thresholdAreaCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 网格线示例 */}
                    <div className={styles.exampleSection} id="line-grid">
                        <h3 className={styles.subsectionTitle}>网格线配置</h3>
                        <p className={styles.sectionText}>通过配置 xAxis/yAxis 的 grid 属性，可自定义网格线的显示、颜色、宽度和透明度。</p>
                        <div className={styles.exampleDemo}>
                            <Line
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

                    {/* 数据点配置示例 */}
                    <div className={styles.exampleSection} id="line-point">
                        <h3 className={styles.subsectionTitle}>数据点配置</h3>
                        <p className={styles.sectionText}>通过 point 属性控制数据点的显示与样式。默认不显示数据点，可通过设置 point 对象来显示和自定义样式。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={{
                                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                                    datasets: [
                                        {
                                            label: '2023年销售额',
                                            data: [12000, 19000, 15000, 25000, 22000, 30000],
                                            track: {
                                                color: '#3b82f6',
                                                width: 2,
                                            },
                                            point: false,
                                        },
                                    ],
                                }}
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
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={pointCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {pointCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 轨迹动画示例 */}
                    <div className={styles.exampleSection} id="line-trail">
                        <h3 className={styles.subsectionTitle}>轨迹动画</h3>
                        <p className={styles.sectionText}>在折线图上添加发光轨迹动画效果，线条从起点逐步绘制到终点，并跟随一个发光轨迹点。支持自定义轨迹颜色、宽度、长度、透明度和循环播放。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={trailAnimationData}
                                width={500}
                                height={300}
                                trailAnimation={{
                                    enabled: true,
                                    duration: 3000,
                                    trailColor: '#10b981',
                                    trailWidth: 8,
                                    trailLength: 25,
                                    trailOpacity: 0.7,
                                    loop: true,
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
                            <CopyButton text={trailAnimationCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {trailAnimationCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 轨道连接示例 - 更新为最新 API */}
                    <div className={styles.exampleSection} id="line-track-connection">
                        <h3 className={styles.subsectionTitle}>轨道连接</h3>
                        <p className={styles.sectionText}>在数据点之间绘制直接连接的轨道线条。在 dataset 中配置 track 对象即可启用，可自定义轨道颜色和宽度。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={{
                                    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                                    datasets: [
                                        {
                                            label: '销售额',
                                            data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 38000, 42000, 45000],
                                            track: {
                                                color: 'red',
                                                width: 2,
                                            },
                                            point: {
                                                backgroundColor: 'blue',
                                                hoverBackgroundColor: '#000',
                                                color: '#fff',
                                                width: 2,
                                                style: 'circle',
                                                radius: 4,
                                            },
                                        },
                                    ],
                                }}
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
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={trackConnectionCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {trackConnectionCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 分组数据示例 */}
                    <div className={styles.exampleSection} id="line-grouped">
                        <h3 className={styles.subsectionTitle}>分组数据示例</h3>
                        <p className={styles.sectionText}>展示按日期分组的多维数据对比，支持点击图例切换显示/隐藏数据系列。数据格式为：date（日期）、type（类型：download/register/bill）、value（数值）。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={groupedData}
                                width={600}
                                height={350}
                                smooth={true}
                                xAxis={{
                                    display: true,
                                    title: { text: '日期' },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '数值' },
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
                            <CopyButton text={groupedDataCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {groupedDataCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* JSON 数据加载示例 */}
                    <div className={styles.exampleSection} id="line-json-data">
                        <h3 className={styles.subsectionTitle}>JSON 数据加载示例</h3>
                        <p className={styles.sectionText}>从 JSON 文件加载趋势数据并渲染图表。数据包含多个系列（USA、California、BA9C、Marin）随时间变化的数值，展示了如何处理外部数据源。</p>
                        <div className={styles.exampleDemo}>
                            <Line
                                data={trendData}
                                width={700}
                                height={400}
                                smooth={true}
                                xAxis={{
                                    display: true,
                                    title: { text: '日期' },
                                    grid: {
                                        display: true,
                                        opacity: 0.3,
                                    }
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '数值' },
                                    grid: {
                                        display: true,
                                        opacity: 0.3,
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
                            <CopyButton text={jsonDataCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {jsonDataCode}
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
                        <p className={styles.sectionText}>数据集配置项说明。point 和 track 属性需要在 dataset 中配置。</p>
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

                    {/* Grid 配置 */}
                    <div className={styles.exampleSection} id="line-grid-api">
                        <h3 className={styles.subsectionTitle}>Grid 配置</h3>
                        <p className={styles.sectionText}>网格线配置项说明（在 xAxis 或 yAxis 的 grid 属性中配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={gridDataAPI} />
                        </div>
                    </div>

                    {/* TrailAnimation 配置 */}
                    <div className={styles.exampleSection} id="line-trail-api">
                        <h3 className={styles.subsectionTitle}>TrailAnimation 配置</h3>
                        <p className={styles.sectionText}>轨迹动画配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={trailAnimationDataAPI} />
                        </div>
                    </div>

                    {/* Point 配置 */}
                    <div className={styles.exampleSection} id="line-point-api">
                        <h3 className={styles.subsectionTitle}>Point 配置</h3>
                        <p className={styles.sectionText}>数据点配置项说明（在 dataset 的 point 属性中配置，设置为 false 可隐藏数据点）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={pointDataAPI} />
                        </div>
                    </div>

                    {/* Track 配置 */}
                    <div className={styles.exampleSection} id="line-track-api">
                        <h3 className={styles.subsectionTitle}>Track 配置</h3>
                        <p className={styles.sectionText}>轨道样式配置项说明（在 dataset 的 track 属性中配置）。配置该对象即启用轨道连接功能。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={trackDataAPI} />
                        </div>
                    </div>

                    {/* Axis 配置 */}
                    <div className={styles.exampleSection} id="line-axis-api">
                        <h3 className={styles.subsectionTitle}>Axis 配置</h3>
                        <p className={styles.sectionText}>坐标轴配置项说明（xAxis/yAxis 通用配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={axisDataAPI} />
                        </div>
                    </div>

                    {/* Tooltip 配置 */}
                    <div className={styles.exampleSection} id="line-tooltip-api">
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
                                <Anchor.Link href="#line-intro" title="组件介绍" />
                                <Anchor.Link href="#line-basic" title="基础折线图" />
                                <Anchor.Link href="#line-smooth" title="平滑曲线" />
                                <Anchor.Link href="#line-multi" title="多线对比" />
                                <Anchor.Link href="#line-area" title="面积图" />
                                <Anchor.Link href="#line-click" title="点击事件" />
                                <Anchor.Link href="#line-legend" title="图例配置" />
                                <Anchor.Link href="#line-threshold" title="预警线" />
                                <Anchor.Link href="#line-grid" title="网格线配置" />
                                <Anchor.Link href="#line-point" title="数据点配置" />
                                <Anchor.Link href="#line-trail" title="轨迹动画" />
                                <Anchor.Link href="#line-track-connection" title="轨道连接" />
                                <Anchor.Link href="#line-grouped" title="分组数据" />
                                <Anchor.Link href="#line-json-data" title="JSON 数据加载" />
                                <Anchor.Link href="#line-api" title="API 参考" />
                                <Anchor.Link href="#line-dataset" title="Dataset 配置" />
                                <Anchor.Link href="#line-legend-api" title="Legend 配置" />
                                <Anchor.Link href="#line-threshold-api" title="Threshold 配置" />
                                <Anchor.Link href="#line-grid-api" title="Grid 配置" />
                                <Anchor.Link href="#line-trail-api" title="TrailAnimation 配置" />
                                <Anchor.Link href="#line-point-api" title="Point 配置" />
                                <Anchor.Link href="#line-track-api" title="Track 配置" />
                                <Anchor.Link href="#line-axis-api" title="Axis 配置" />
                                <Anchor.Link href="#line-tooltip-api" title="Tooltip 配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
