'use client';

import React, { useState, useEffect } from 'react';
import { BidirectionalBar } from '@/components/BidirectionalBar';
import { BidirectionalBarChartData, BidirectionalBarSignedData, BidirectionalBarMirrorData } from '@/components/BidirectionalBar/BidirectionalBar.type';
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
 * 对称条形图示例页面
 */
export default function BidirectionalBarChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 左右分离模式数据 - 人口性别对比
    const splitData: BidirectionalBarChartData = {
        labels: ['0-4岁', '5-9岁', '10-14岁', '15-19岁', '20-24岁', '25-29岁', '30-34岁', '35-39岁'],
        leftData: {
            label: '男性',
            data: [420, 380, 350, 320, 380, 420, 450, 410],
            backgroundColor: '#3b82f6',
        },
        rightData: {
            label: '女性',
            data: [400, 360, 330, 310, 370, 410, 440, 400],
            backgroundColor: '#ec4899',
        },
    };

    // 正负值模式数据 - 收支对比
    const signedData: BidirectionalBarSignedData = {
        labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
        datasets: [
            {
                label: '收支差额',
                data: [120, -80, 200, -150, 180, -50],
                backgroundColor: '#10b981',
            },
        ],
    };

    // 收入支出对比数据
    const incomeExpenseData: BidirectionalBarChartData = {
        labels: ['餐饮', '交通', '娱乐', '购物', '居住', '教育'],
        leftData: {
            label: '支出',
            data: [3200, 1500, 2000, 3500, 5000, 2800],
            backgroundColor: '#ef4444',
        },
        rightData: {
            label: '收入',
            data: [8000, 500, 3000, 0, 0, 1500],
            backgroundColor: '#10b981',
        },
    };

    // 优劣势分析数据
    const prosConsData: BidirectionalBarChartData = {
        labels: ['价格', '质量', '服务', '品牌', '创新', '口碑'],
        leftData: {
            label: '劣势得分',
            data: [30, 15, 25, 10, 20, 18],
            backgroundColor: '#f97316',
        },
        rightData: {
            label: '优势得分',
            data: [85, 92, 78, 88, 95, 82],
            backgroundColor: '#8b5cf6',
        },
    };

    // 镜像模式数据 - 国家数据对比
    const mirrorData: BidirectionalBarMirrorData = {
        labels: ['美国', '中国', '加拿大', '巴西', '阿根廷', '巴基斯坦', '南非', '巴拉圭', '乌拉圭'],
        leftData: {
            label: '某指标 A',
            data: [182, 100, 50, 35, 50, 50, 35, 30, 20],
            backgroundColor: '#5b8ff9',
        },
        rightData: {
            label: '某指标 B',
            data: [70, 8, 24, 19, 19, 15, 10, 9, 14],
            backgroundColor: '#5ad8a6',
        },
    };

    // 处理数据点击
    const handleDataClick = (direction: 'left' | 'right', dataIndex: number, value: number) => {
        console.log('点击条形:', { direction, dataIndex, value });
        alert(`方向: ${direction}, 索引: ${dataIndex}, 数值: ${value}`);
    };

    // 左右分离模式代码
    const splitCode = `import { BidirectionalBar } from '@/components/BidirectionalBar';
import type { BidirectionalBarChartData } from '@/components/BidirectionalBar/BidirectionalBar.type';

const data: BidirectionalBarChartData = {
    labels: ['0-4岁', '5-9岁', '10-14岁', '15-19岁', '20-24岁', '25-29岁', '30-34岁', '35-39岁'],
    leftData: {
        label: '男性',
        data: [420, 380, 350, 320, 380, 420, 450, 410],
        backgroundColor: '#3b82f6',
    },
    rightData: {
        label: '女性',
        data: [400, 360, 330, 310, 370, 410, 440, 400],
        backgroundColor: '#ec4899',
    },
};

export default function SplitBidirectionalBarChart() {
    return (
        <BidirectionalBar
            data={data}
            mode="split"
            width={600}
            height={400}
            yAxis={{
                display: true,
                title: { text: '年龄段' }
            }}
            xAxis={{
                display: true,
                title: { text: '人口数量（万）' }
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
}`;

    // 正负值模式代码
    const signedCode = `import { BidirectionalBar } from '@/components/BidirectionalBar';
import type { BidirectionalBarSignedData } from '@/components/BidirectionalBar/BidirectionalBar.type';

const data: BidirectionalBarSignedData = {
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    datasets: [
        {
            label: '收支差额',
            data: [120, -80, 200, -150, 180, -50],
            backgroundColor: '#10b981',
        },
    ],
};

export default function SignedBidirectionalBarChart() {
    return (
        <BidirectionalBar
            signedData={data}
            mode="signed"
            width={600}
            height={350}
            yAxis={{
                display: true,
                title: { text: '月份' }
            }}
            xAxis={{
                display: true,
                title: { text: '金额（万元）' }
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
}`;

    // 收入支出对比代码
    const incomeExpenseCode = `import { BidirectionalBar } from '@/components/BidirectionalBar';
import type { BidirectionalBarChartData } from '@/components/BidirectionalBar/BidirectionalBar.type';

const data: BidirectionalBarChartData = {
    labels: ['餐饮', '交通', '娱乐', '购物', '居住', '教育'],
    leftData: {
        label: '支出',
        data: [3200, 1500, 2000, 3500, 5000, 2800],
        backgroundColor: '#ef4444',
    },
    rightData: {
        label: '收入',
        data: [8000, 500, 3000, 0, 0, 1500],
        backgroundColor: '#10b981',
    },
};

export default function IncomeExpenseChart() {
    return (
        <BidirectionalBar
            data={data}
            mode="split"
            width={600}
            height={350}
            bar={{
                height: 0.6,
                borderRadius: 4,
            }}
            yAxis={{
                display: true,
                title: { text: '消费类别' }
            }}
            xAxis={{
                display: true,
                title: { text: '金额（元）' }
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
}`;

    // 优劣势分析代码
    const prosConsCode = `import { BidirectionalBar } from '@/components/BidirectionalBar';
import type { BidirectionalBarChartData } from '@/components/BidirectionalBar/BidirectionalBar.type';

const data: BidirectionalBarChartData = {
    labels: ['价格', '质量', '服务', '品牌', '创新', '口碑'],
    leftData: {
        label: '劣势得分',
        data: [30, 15, 25, 10, 20, 18],
        backgroundColor: '#f97316',
    },
    rightData: {
        label: '优势得分',
        data: [85, 92, 78, 88, 95, 82],
        backgroundColor: '#8b5cf6',
    },
};

export default function ProsConsChart() {
    return (
        <BidirectionalBar
            data={data}
            mode="split"
            width={600}
            height={350}
            bar={{
                dataLabel: {
                    display: true,
                    color: '#374151',
                    fontSize: 12,
                },
            }}
            yAxis={{
                display: true,
                title: { text: '评估维度' }
            }}
            xAxis={{
                display: true,
                title: { text: '得分' }
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
}`;

    // 镜像模式代码
    const mirrorCode = `import { BidirectionalBar } from '@/components/BidirectionalBar';
import type { BidirectionalBarMirrorData } from '@/components/BidirectionalBar/BidirectionalBar.type';

const data: BidirectionalBarMirrorData = {
    labels: ['美国', '中国', '加拿大', '巴西', '阿根廷', '巴基斯坦', '南非', '巴拉圭', '乌拉圭'],
    leftData: {
        label: '某指标 A',
        data: [182, 100, 50, 35, 50, 50, 35, 30, 20],
        backgroundColor: '#5b8ff9',
    },
    rightData: {
        label: '某指标 B',
        data: [70, 8, 24, 19, 19, 15, 10, 9, 14],
        backgroundColor: '#5ad8a6',
    },
};

export default function MirrorBidirectionalBarChart() {
    return (
        <BidirectionalBar
            mirrorData={data}
            mode="mirror"
            width={600}
            height={400}
            yAxis={{
                display: false,
            }}
            xAxis={{
                display: true,
                title: { text: '数值' },
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
}`;

    // 点击事件代码
    const clickCode = `import { BidirectionalBar } from '@/components/BidirectionalBar';

const handleDataClick = (direction, dataIndex, value) => {
    console.log('点击条形:', { direction, dataIndex, value });
    alert(\`方向: \${direction}, 索引: \${dataIndex}, 数值: \${value}\`);
};

<BidirectionalBar
    data={data}
    mode="split"
    width={600}
    height={400}
    yAxis={{
        display: true,
        title: { text: '年龄段' }
    }}
    xAxis={{
        display: true,
        title: { text: '人口数量' }
    }}
    legend={{
        display: true,
        position: 'top',
    }}
    onDataClick={handleDataClick}
/>`;

    // 垂直线模式代码
    const verticalLineCode = `import { BidirectionalBar } from '@/components/BidirectionalBar';
import type { BidirectionalBarChartData } from '@/components/BidirectionalBar/BidirectionalBar.type';

const data: BidirectionalBarChartData = {
    labels: ['0-4岁', '5-9岁', '10-14岁', '15-19岁', '20-24岁', '25-29岁', '30-34岁', '35-39岁'],
    leftData: {
        label: '男性',
        data: [420, 380, 350, 320, 380, 420, 450, 410],
        backgroundColor: '#3b82f6',
    },
    rightData: {
        label: '女性',
        data: [400, 360, 330, 310, 370, 410, 440, 400],
        backgroundColor: '#ec4899',
    },
};

export default function VerticalLineBidirectionalBarChart() {
    return (
        <BidirectionalBar
            data={data}
            mode="split"
            width={600}
            height={400}
            verticalLine={{
                enabled: true,
                color: '#999',
                lineWidth: 1,
                dash: [5, 5],
            }}
            yAxis={{
                display: true,
                title: { text: '年龄段' }
            }}
            xAxis={{
                display: true,
                title: { text: '人口数量（万）' }
            }}
            legend={{
                display: true,
                position: 'top',
            }}
        />
    );
}`;

    // API 表格列定义
    const apiColumns: TableColumn[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值', width: '100px' }
    ];

    // BidirectionalBar 组件 API 数据
    const apiData = [
        { param: 'data', description: '图表数据（左右分离模式）', type: 'BidirectionalBarChartData', default: '-' },
        { param: 'signedData', description: '图表数据（正负值模式）', type: 'BidirectionalBarSignedData', default: '-' },
        { param: 'mirrorData', description: '图表数据（镜像模式）', type: 'BidirectionalBarMirrorData', default: '-' },
        { param: 'mode', description: '数据模式：split 为左右分离，signed 为正负值，mirror 为镜像', type: "'split' | 'signed' | 'mirror'", default: "'split'" },
        { param: 'width', description: '图表宽度', type: 'number', default: '600' },
        { param: 'height', description: '图表高度', type: 'number', default: '400' },
        { param: 'padding', description: '图表内边距', type: 'number', default: '60' },
        { param: 'animationDuration', description: '初始动画时长（毫秒）', type: 'number', default: '1000' },
        { param: 'xAxis', description: 'X轴配置（数值轴）', type: 'BidirectionalBarAxisConfig', default: '-' },
        { param: 'yAxis', description: 'Y轴配置（分类轴）', type: 'BidirectionalBarAxisConfig', default: '-' },
        { param: 'legend', description: '图例配置', type: 'BidirectionalBarLegendConfig', default: '-' },
        { param: 'tooltip', description: '提示框配置', type: 'BidirectionalBarTooltipConfig', default: '-' },
        { param: 'bar', description: '条形样式配置', type: 'BidirectionalBarConfig', default: '-' },
        { param: 'verticalLine', description: '垂直线配置（鼠标移入时显示水平参考线）', type: 'BidirectionalBarVerticalLineConfig', default: '-' },
        { param: 'className', description: '自定义类名', type: 'string', default: '-' },
        { param: 'style', description: '自定义样式', type: 'React.CSSProperties', default: '-' },
        { param: 'onDataClick', description: '条形点击事件', type: '(direction, dataIndex, value) => void', default: '-' },
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
        { param: 'backgroundColor', description: '条形填充颜色', type: 'string', default: '自动分配' },
        { param: 'borderColor', description: '条形边框颜色', type: 'string', default: '-' },
        { param: 'borderWidth', description: '条形边框宽度', type: 'number', default: '0' },
        { param: 'borderRadius', description: '条形圆角', type: 'number | number[]', default: '4' },
    ];

    // 条形配置数据
    const barDataAPI = [
        { param: 'height', description: '条形高度比例 (0-1)', type: 'number', default: '0.7' },
        { param: 'borderRadius', description: '条形圆角半径', type: 'number | number[]', default: '4' },
        { param: 'spacing', description: '分组内条形间距', type: 'number', default: '4' },
        { param: 'dataLabel', description: '数据标签配置', type: 'BidirectionalBarDataLabelConfig', default: '-' },
    ];

    // 数据标签配置数据
    const dataLabelDataAPI = [
        { param: 'display', description: '是否显示数据标签', type: 'boolean', default: 'false' },
        { param: 'color', description: '标签文字颜色', type: 'string', default: "'#374151'" },
        { param: 'fontSize', description: '标签字体大小', type: 'number', default: '12' },
        { param: 'offset', description: '标签与条形的间距', type: 'number', default: '6' },
        { param: 'formatter', description: '自定义格式化函数', type: '(value: number) => string', default: '-' },
    ];

    // 垂直线配置数据
    const verticalLineDataAPI = [
        { param: 'enabled', description: '是否启用垂直线模式', type: 'boolean', default: 'false' },
        { param: 'color', description: '线条颜色', type: 'string', default: "'#999'" },
        { param: 'lineWidth', description: '线条宽度', type: 'number', default: '1' },
        { param: 'dash', description: '虚线样式，如 [5, 5] 表示 5px 实线 5px 空白', type: 'number[]', default: '-' },
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.sectionTitle} id="bidirectional-intro">BidirectionalBar 对称条形图</h2>
                    <p className={styles.sectionText}>
                        对称条形图是一种以坐标轴为中心，向左右两侧延伸条形的图表类型。
                        用于展示正负值数据或双向对比关系，适合展示"增加/减少"、"输入/输出"、"优势/劣势"等对立关系。
                    </p>

                    {/* 左右分离模式 */}
                    <div className={styles.exampleSection} id="bidirectional-split">
                        <h3 className={styles.subsectionTitle}>左右分离模式</h3>
                        <p className={styles.sectionText}>
                            使用 data 属性传入左右分离的数据，左侧条形表示一组数据，右侧条形表示另一组数据。
                            适合展示人口金字塔、收入支出对比等场景。
                        </p>
                        <div className={styles.exampleDemo}>
                            <BidirectionalBar
                                data={splitData}
                                mode="split"
                                width={600}
                                height={400}
                                yAxis={{
                                    display: true,
                                    title: { text: '年龄段' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '人口数量（万）' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={splitCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {splitCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 正负值模式 */}
                    <div className={styles.exampleSection} id="bidirectional-signed">
                        <h3 className={styles.subsectionTitle}>正负值模式</h3>
                        <p className={styles.sectionText}>
                            使用 signedData 属性传入数据，正值自动显示在右侧，负值自动显示在左侧。
                            适合展示收支差额、涨跌对比等场景。
                        </p>
                        <div className={styles.exampleDemo}>
                            <BidirectionalBar
                                signedData={signedData}
                                mode="signed"
                                width={600}
                                height={350}
                                yAxis={{
                                    display: true,
                                    title: { text: '月份' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '金额（万元）' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={signedCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {signedCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 收入支出对比 */}
                    <div className={styles.exampleSection} id="bidirectional-income-expense">
                        <h3 className={styles.subsectionTitle}>收入支出对比</h3>
                        <p className={styles.sectionText}>
                            展示各类别的收入与支出对比情况。
                        </p>
                        <div className={styles.exampleDemo}>
                            <BidirectionalBar
                                data={incomeExpenseData}
                                mode="split"
                                width={600}
                                height={350}
                                bar={{
                                    height: 0.6,
                                    borderRadius: 4,
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '消费类别' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '金额（元）' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={incomeExpenseCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {incomeExpenseCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 优劣势分析 */}
                    <div className={styles.exampleSection} id="bidirectional-pros-cons">
                        <h3 className={styles.subsectionTitle}>优劣势分析</h3>
                        <p className={styles.sectionText}>
                            展示产品或服务在各维度的优劣势评分，左侧为劣势得分，右侧为优势得分。
                        </p>
                        <div className={styles.exampleDemo}>
                            <BidirectionalBar
                                data={prosConsData}
                                mode="split"
                                width={600}
                                height={350}
                                bar={{
                                    dataLabel: {
                                        display: true,
                                        color: '#374151',
                                        fontSize: 12,
                                    },
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '评估维度' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '得分' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={prosConsCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {prosConsCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 镜像模式 */}
                    <div className={styles.exampleSection} id="bidirectional-mirror">
                        <h3 className={styles.subsectionTitle}>镜像模式</h3>
                        <p className={styles.sectionText}>
                            使用 mirrorData 属性传入数据，标签显示在图表中心，左右两侧分别显示不同的指标。
                            适合展示国家对比、双指标分析等场景。
                        </p>
                        <div className={styles.exampleDemo}>
                            <BidirectionalBar
                                mirrorData={mirrorData}
                                mode="mirror"
                                width={600}
                                height={400}
                                yAxis={{
                                    display: false,
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '数值' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={mirrorCode} />
                        </div>
                        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                            {mirrorCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 点击事件 */}
                    <div className={styles.exampleSection} id="bidirectional-click">
                        <h3 className={styles.subsectionTitle}>点击事件</h3>
                        <p className={styles.sectionText}>
                            支持条形点击交互，可获取点击的方向（left/right）、数据索引和数值。
                        </p>
                        <div className={styles.exampleDemo}>
                            <BidirectionalBar
                                data={splitData}
                                mode="split"
                                width={600}
                                height={400}
                                yAxis={{
                                    display: true,
                                    title: { text: '年龄段' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '人口数量' },
                                }}
                                legend={{
                                    display: true,
                                    position: 'top',
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

                    {/* 垂直线模式 */}
                    <div className={styles.exampleSection} id="bidirectional-verticalline">
                        <h3 className={styles.subsectionTitle}>垂直线模式</h3>
                        <p className={styles.sectionText}>
                            启用 verticalLine 后，鼠标移入时会显示一条水平参考线，横跨该分类的所有条形。
                            同时 tooltip 会显示该分类下所有条形的数据，方便进行横向对比分析。
                        </p>
                        <div className={styles.exampleDemo}>
                            <BidirectionalBar
                                data={splitData}
                                mode="split"
                                width={600}
                                height={400}
                                verticalLine={{
                                    enabled: true,
                                    color: '#999',
                                    lineWidth: 1,
                                    dash: [5, 5],
                                }}
                                yAxis={{
                                    display: true,
                                    title: { text: '年龄段' },
                                }}
                                xAxis={{
                                    display: true,
                                    title: { text: '人口数量（万）' },
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

                    {/* 组件特性 */}
                    <div className={styles.exampleSection} id="bidirectional-features">
                        <h3 className={styles.subsectionTitle}>组件特性</h3>
                        <div className={styles.features}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>⚖️ 双向对比</div>
                                <div className={styles.featureDesc}>以中心轴为对称轴，左右两侧条形形成直观对比，强化数据对立关系。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>📊 三模式支持</div>
                                <div className={styles.featureDesc}>支持左右分离、正负值和镜像模式，适应不同的数据展示场景。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🏷️ 数据标签</div>
                                <div className={styles.featureDesc}>支持在条形末端显示数据标签，可自定义格式和样式。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🎨 自定义样式</div>
                                <div className={styles.featureDesc}>支持自定义条形颜色、圆角、高度等样式，打造个性化图表。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>👆 点击交互</div>
                                <div className={styles.featureDesc}>支持条形点击事件，可获取方向、数据索引和数值信息。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>✨ 动画效果</div>
                                <div className={styles.featureDesc}>条形从中心轴向两侧延伸的动画效果，视觉效果流畅。</div>
                            </div>
                        </div>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="bidirectional-api">
                        <h3 className={styles.subsectionTitle}>API 参考</h3>
                        <p className={styles.sectionText}>BidirectionalBar 组件的属性配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={apiData} />
                        </div>
                    </div>

                    {/* Dataset 配置 */}
                    <div className={styles.exampleSection} id="bidirectional-dataset">
                        <h3 className={styles.subsectionTitle}>Dataset 配置</h3>
                        <p className={styles.sectionText}>数据集配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={datasetData} />
                        </div>
                    </div>

                    {/* Bar 样式配置 */}
                    <div className={styles.exampleSection} id="bidirectional-bar-api">
                        <h3 className={styles.subsectionTitle}>Bar 样式配置</h3>
                        <p className={styles.sectionText}>条形样式配置项说明（在 bar 属性中配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={barDataAPI} />
                        </div>
                    </div>

                    {/* 数据标签配置 */}
                    <div className={styles.exampleSection} id="bidirectional-datalabel-api">
                        <h3 className={styles.subsectionTitle}>DataLabel 数据标签配置</h3>
                        <p className={styles.sectionText}>数据标签配置项说明（在 bar.dataLabel 属性中配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={dataLabelDataAPI} />
                        </div>
                    </div>

                    {/* 垂直线配置 */}
                    <div className={styles.exampleSection} id="bidirectional-verticalline-api">
                        <h3 className={styles.subsectionTitle}>VerticalLine 垂直线配置</h3>
                        <p className={styles.sectionText}>
                            垂直线配置项说明。启用后，鼠标移入时会显示一条水平参考线，横跨该分类的所有条形，
                            同时 tooltip 会显示该分类下所有条形的数据。
                        </p>
                        <div className={styles.apiTable}>
                            <Table columns={datasetColumns} dataSource={verticalLineDataAPI} />
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
                                <Anchor.Link href="#bidirectional-intro" title="组件介绍" />
                                <Anchor.Link href="#bidirectional-split" title="左右分离模式" />
                                <Anchor.Link href="#bidirectional-signed" title="正负值模式" />
                                <Anchor.Link href="#bidirectional-income-expense" title="收入支出对比" />
                                <Anchor.Link href="#bidirectional-pros-cons" title="优劣势分析" />
                                <Anchor.Link href="#bidirectional-mirror" title="镜像模式" />
                                <Anchor.Link href="#bidirectional-click" title="点击事件" />
                                <Anchor.Link href="#bidirectional-verticalline" title="垂直线模式" />
                                <Anchor.Link href="#bidirectional-features" title="组件特性" />
                                <Anchor.Link href="#bidirectional-api" title="API 参考" />
                                <Anchor.Link href="#bidirectional-dataset" title="Dataset 配置" />
                                <Anchor.Link href="#bidirectional-bar-api" title="Bar 样式配置" />
                                <Anchor.Link href="#bidirectional-datalabel-api" title="数据标签配置" />
                                <Anchor.Link href="#bidirectional-verticalline-api" title="垂直线配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
