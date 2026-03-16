'use client';

import React, { useState, useEffect } from 'react';
import { BoxPlot } from '@/components/Box';
import { BoxPlotChartData } from '@/components/Box/Box.type';
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
 * 箱线图示例页面
 */
export default function BoxPlotPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础箱线图数据 - 各区域销售额统计
    const basicData: BoxPlotChartData = {
        labels: ['Oceania', 'East Europe', 'Australia', 'South America', 'North Africa', 'North America', 'West Europe', 'West Africa'],
        datasets: [
            {
                label: '销售额分布',
                data: [
                    { min: 8, q1: 12, median: 16, q3: 22, max: 24 },
                    { min: 4, q1: 6, median: 10, q3: 12, max: 16 },
                    { min: 8, q1: 12, median: 15, q3: 19, max: 26 },
                    { min: 1, q1: 12, median: 15, q3: 21, max: 28 },
                    { min: 7, q1: 10, median: 14, q3: 18, max: 24 },
                    { min: 2, q1: 10, median: 17, q3: 28, max: 30 },
                    { min: 7, q1: 9, median: 10, q3: 17, max: 22 },
                    { min: 5, q1: 7, median: 9, q3: 13, max: 16 },
                ],
                backgroundColor: '#93c5fd',
                borderColor: '#60a5fa',
            },
        ],
    };

    // 多数据集箱线图数据 - 各部门业绩分布
    const multiData: BoxPlotChartData = {
        labels: ['销售部', '市场部', '技术部', '运营部'],
        datasets: [
            {
                label: '2023年',
                data: [
                    { min: 30, q1: 50, median: 70, q3: 90, max: 100 },
                    { min: 20, q1: 40, median: 55, q3: 75, max: 85 },
                    { min: 40, q1: 60, median: 80, q3: 95, max: 100 },
                    { min: 25, q1: 45, median: 60, q3: 80, max: 90 },
                ],
                backgroundColor: '#93c5fd',
                borderColor: '#3b82f6',
            },
            {
                label: '2024年',
                data: [
                    { min: 35, q1: 55, median: 75, q3: 92, max: 100 },
                    { min: 25, q1: 45, median: 60, q3: 80, max: 90 },
                    { min: 45, q1: 65, median: 82, q3: 95, max: 100 },
                    { min: 30, q1: 50, median: 65, q3: 85, max: 95 },
                ],
                backgroundColor: '#86efac',
                borderColor: '#22c55e',
            },
        ],
    };

    // 学生成绩分布数据
    const gradeData: BoxPlotChartData = {
        labels: ['语文', '数学', '英语', '物理', '化学'],
        datasets: [
            {
                label: '成绩分布',
                data: [
                    { min: 60, q1: 72, median: 82, q3: 90, max: 98 },
                    { min: 45, q1: 65, median: 78, q3: 88, max: 100 },
                    { min: 55, q1: 70, median: 80, q3: 89, max: 95 },
                    { min: 40, q1: 58, median: 72, q3: 85, max: 96 },
                    { min: 50, q1: 68, median: 76, q3: 86, max: 94 },
                ],
                backgroundColor: '#fca5a5',
                borderColor: '#ef4444',
                medianColor: '#dc2626',
                whiskerColor: '#9ca3af',
            },
        ],
    };

    // 代码示例
    const codeExample = `import { BoxPlot } from '@/components/Box';
import type { BoxPlotChartData } from '@/components/Box/Box.type';

// 准备数据
const data: BoxPlotChartData = {
  labels: ['Oceania', 'East Europe', 'Australia'],
  datasets: [
    {
      label: '销售额分布',
      data: [
        { min: 8, q1: 12, median: 16, q3: 22, max: 24 },
        { min: 4, q1: 6, median: 10, q3: 12, max: 16 },
        { min: 8, q1: 12, median: 15, q3: 19, max: 26 },
      ],
      backgroundColor: '#93c5fd',
      borderColor: '#60a5fa',
    },
  ],
};

// 渲染组件
<BoxPlot
  data={data}
  width={800}
  height={400}
  boxWidth={0.6}
/>`;


    // API表格数据
    const apiColumns: TableColumn[] = [
        { title: '属性', dataIndex: 'property', key: 'property', width: 120 },
        { title: '说明', dataIndex: 'description', key: 'description' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 180 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 100 },
    ];

    const apiData = [
        { property: 'data', description: '图表数据', type: 'BoxPlotChartData', default: '必填' },
        { property: 'width', description: '图表宽度', type: 'number', default: '600' },
        { property: 'height', description: '图表高度', type: 'number', default: '400' },
        { property: 'padding', description: '内边距', type: 'number', default: '60' },
        { property: 'boxWidth', description: '箱体宽度比例 (0-1)', type: 'number', default: '0.7' },
        { property: 'animationDuration', description: '动画时长（毫秒）', type: 'number', default: '800' },
        { property: 'grid', description: '网格线配置', type: 'BoxPlotGridConfig', default: '-' },
        { property: 'xAxis', description: 'X轴配置', type: 'BoxPlotXAxisConfig', default: '-' },
        { property: 'yAxis', description: 'Y轴配置', type: 'BoxPlotYAxisConfig', default: '-' },
        { property: 'tooltip', description: '提示框配置', type: 'BoxPlotTooltipConfig', default: '-' },
        { property: 'onClick', description: '点击事件回调', type: '(item, index) => void', default: '-' },
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                {/* 标题区域 */}
                <div id="intro" className={styles.introSection}>
                    <h1 className={styles.sectionTitle}>BoxPlot 箱线图</h1>
                    <p className={styles.sectionText}>
                        箱线图用于展示数据的五数概括，包括最小值、第一四分位数(Q1)、中位数、第三四分位数(Q3)和最大值。
                        它可以直观地展示数据的分布情况和离散程度。
                    </p>
                </div>

                {/* 组件特性 */}
                <div className={styles.features}>
                    <div className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>📊 数据分布</h3>
                        <p className={styles.featureDesc}>直观展示数据的五数概括，清晰呈现数据分布特征</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>🎨 灵活样式</h3>
                        <p className={styles.featureDesc}>支持自定义箱体颜色、边框、中位线和须线样式</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>⚡ 动画交互</h3>
                        <p className={styles.featureDesc}>平滑的加载动画和丰富的鼠标交互体验</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>📈 多数据集</h3>
                        <p className={styles.featureDesc}>支持多组数据对比，方便进行数据分析</p>
                    </div>
                </div>

                {/* 基础示例 */}
                <div id="basic" className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>基础箱线图</h2>
                    <p className={styles.subsectionDesc}>展示各地区销售额的分布情况，包含最小值、四分位数、中位数和最大值。</p>
                    <div className={styles.exampleDemo}>
                        <BoxPlot
                            data={basicData}
                            width={900}
                            height={400}
                            boxWidth={0.7}
                        />
                    </div>
                </div>

                {/* 多数据集示例 */}
                <div id="multi" className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>多数据集对比</h2>
                    <p className={styles.subsectionDesc}>对比不同年份各部门的业绩分布情况，使用不同颜色区分数据集。</p>
                    <div className={styles.exampleDemo}>
                        <BoxPlot
                            data={multiData}
                            width={800}
                            height={400}
                            boxWidth={0.5}
                            yAxis={{
                                min: 0,
                                max: 110,
                                stepSize: 20,
                            }}
                        />
                    </div>
                </div>

                {/* 自定义样式示例 */}
                <div id="custom" className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>自定义样式</h2>
                    <p className={styles.subsectionDesc}>自定义箱体颜色、中位线和须线样式，以及Tooltip格式化显示。</p>
                    <div className={styles.exampleDemo}>
                        <BoxPlot
                            data={gradeData}
                            width={800}
                            height={400}
                            boxWidth={0.6}
                            yAxis={{
                                min: 0,
                                max: 100,
                                stepSize: 20,
                            }}
                            tooltip={{
                                titleFormatter: (label) => `${label} - 成绩统计`,
                                valueFormatter: (value) => `${value}分`,
                            }}
                        />
                    </div>
                </div>

                {/* 代码示例 */}
                <div id="code" className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>代码示例</h2>
                    <div className={styles.codeHeader}>
                        <span>TypeScript / React</span>
                        <CopyButton text={codeExample} />
                    </div>
                    <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                        {codeExample}
                    </SyntaxHighlighter>
                </div>

                {/* API 文档 */}
                <div id="api" className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>API 文档</h2>
                    <div className={styles.apiTable}>
                        <Table
                            columns={apiColumns}
                            dataSource={apiData}
                            pagination={false}
                        />
                    </div>
                </div>

                {/* 数据结构 */}
                <div className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>数据结构</h2>
                    <div className={styles.codeHeader}>
                        <span>BoxPlotItem 接口定义</span>
                    </div>
                    <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                        {`interface BoxPlotItem {
  min: number;      // 最小值
  q1: number;       // 第一四分位数 (25%)
  median: number;   // 中位数 (50%)
  q3: number;       // 第三四分位数 (75%)
  max: number;      // 最大值
}

interface BoxPlotChartData {
  labels: string[];              // X轴标签
  datasets: BoxPlotDataset[];    // 数据集数组
}

interface BoxPlotDataset {
  label: string;                 // 数据标签
  data: BoxPlotItem[];           // 箱线图数据
  backgroundColor?: string;      // 箱体填充色
  borderColor?: string;          // 边框颜色
  borderWidth?: number;          // 边框宽度
  medianColor?: string;          // 中位线颜色
  medianWidth?: number;          // 中位线宽度
  whiskerColor?: string;         // 须线颜色
  whiskerWidth?: number;         // 须线宽度
}`}
                    </SyntaxHighlighter>
                </div>
                </div>

                {/* 右侧锚点导航 */}
                {scrollContainer && (
                    <div className={styles.anchorNav}>
                        <div className={styles.anchorWrapper}>
                            <Anchor
                                getContainer={() => scrollContainer}
                                offsetTop={20}
                                affix={false}
                                bounds={30}
                            >
                                <Anchor.Link href="#intro" title="组件介绍" />
                                <Anchor.Link href="#basic" title="基础箱线图" />
                                <Anchor.Link href="#multi" title="多数据集对比" />
                                <Anchor.Link href="#custom" title="自定义样式" />
                                <Anchor.Link href="#code" title="代码示例" />
                                <Anchor.Link href="#api" title="API 文档" />
                            </Anchor>
                        </div>
                    </div>
                )}
            </Flex>
        </div>
    );
}
