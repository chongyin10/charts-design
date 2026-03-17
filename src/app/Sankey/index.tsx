'use client';

import React, { useState } from 'react';
import { Sankey } from '@/components/Sankey';
import { SankeyChartData } from '@/components/Sankey/Sankey.type';
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
 * 桑基图示例页面
 */
export default function SankeyChartPage() {
    // 基础桑基图数据 - 能源流向
    const basicData: SankeyChartData = {
        nodes: [
            { id: 'coal', name: '煤炭' },
            { id: 'oil', name: '石油' },
            { id: 'gas', name: '天然气' },
            { id: 'electricity', name: '电力' },
            { id: 'heating', name: '供暖' },
            { id: 'transport', name: '交通' },
            { id: 'industry', name: '工业' },
            { id: 'residential', name: '居民' },
        ],
        links: [
            { source: 'coal', target: 'electricity', value: 120 },
            { source: 'coal', target: 'industry', value: 80 },
            { source: 'oil', target: 'transport', value: 150 },
            { source: 'oil', target: 'industry', value: 60 },
            { source: 'gas', target: 'electricity', value: 90 },
            { source: 'gas', target: 'heating', value: 70 },
            { source: 'gas', target: 'residential', value: 40 },
            { source: 'electricity', target: 'industry', value: 100 },
            { source: 'electricity', target: 'residential', value: 110 },
        ],
    };

    // 带自定义颜色的桑基图数据 - 用户行为路径
    const colorData: SankeyChartData = {
        nodes: [
            { id: 'landing', name: '落地页', color: '#3b82f6' },
            { id: 'product', name: '产品页', color: '#60a5fa' },
            { id: 'cart', name: '购物车', color: '#93c5fd' },
            { id: 'checkout', name: '结算页', color: '#f59e0b' },
            { id: 'pay', name: '支付成功', color: '#10b981' },
            { id: 'leave', name: '离开', color: '#ef4444' },
        ],
        links: [
            { source: 'landing', target: 'product', value: 8000 },
            { source: 'landing', target: 'leave', value: 2000 },
            { source: 'product', target: 'cart', value: 5000 },
            { source: 'product', target: 'leave', value: 3000 },
            { source: 'cart', target: 'checkout', value: 3500 },
            { source: 'cart', target: 'leave', value: 1500 },
            { source: 'checkout', target: 'pay', value: 2800 },
            { source: 'checkout', target: 'leave', value: 700 },
        ],
    };

    // 复杂数据 - 资金流动
    const complexData: SankeyChartData = {
        nodes: [
            { id: 'salary', name: '工资收入' },
            { id: 'bonus', name: '奖金收入' },
            { id: 'investment', name: '投资收益' },
            { id: 'rent', name: '房租支出' },
            { id: 'food', name: '餐饮支出' },
            { id: 'transport', name: '交通支出' },
            { id: 'savings', name: '储蓄' },
            { id: 'entertainment', name: '娱乐支出' },
            { id: 'shopping', name: '购物支出' },
        ],
        links: [
            { source: 'salary', target: 'rent', value: 3000 },
            { source: 'salary', target: 'food', value: 2000 },
            { source: 'salary', target: 'transport', value: 800 },
            { source: 'salary', target: 'savings', value: 4200 },
            { source: 'bonus', target: 'savings', value: 5000 },
            { source: 'bonus', target: 'entertainment', value: 2000 },
            { source: 'investment', target: 'savings', value: 3000 },
            { source: 'savings', target: 'shopping', value: 2500 },
        ],
    };

    // 支付宝首页 UV 流向数据 - 匹配图片示例
    const alipayData: SankeyChartData = {
        nodes: [
            // 左侧来源
            { id: 'first_open', name: '首次打开', color: '#93c5fd' },
            { id: 'result_page', name: '结果页', color: '#86efac' },
            { id: 'verify_page', name: '验证页', color: '#d1d5db' },
            { id: 'my_page', name: '我的', color: '#fdba74' },
            { id: 'friends', name: '朋友', color: '#c4b5fd' },
            { id: 'other_source', name: '其他来源', color: '#bae6fd' },
            // 中间节点
            { id: 'home_uv', name: '首页 UV', color: '#c4b5fd' },
            // 右侧去向
            { id: 'wealth', name: '理财', color: '#fb923c' },
            { id: 'scan', name: '扫一扫', color: '#0f766e' },
            { id: 'service', name: '服务', color: '#f472b6' },
            { id: 'forest', name: '蚂蚁森林', color: '#60a5fa' },
            { id: 'bounce', name: '跳失', color: '#86efac' },
            { id: 'loan', name: '借呗', color: '#6b7280' },
            { id: 'huabei', name: '花呗', color: '#fbbf24' },
            { id: 'other_exit', name: '其他流向', color: '#818cf8' },
        ],
        links: [
            // 来源到首页 UV
            { source: 'first_open', target: 'home_uv', value: 5000 },
            { source: 'result_page', target: 'home_uv', value: 2000 },
            { source: 'verify_page', target: 'home_uv', value: 500 },
            { source: 'my_page', target: 'home_uv', value: 800 },
            { source: 'friends', target: 'home_uv', value: 600 },
            { source: 'other_source', target: 'home_uv', value: 1100 },
            // 首页 UV 到各去向
            { source: 'home_uv', target: 'wealth', value: 800 },
            { source: 'home_uv', target: 'scan', value: 1200 },
            { source: 'home_uv', target: 'service', value: 1500 },
            { source: 'home_uv', target: 'forest', value: 2000 },
            { source: 'home_uv', target: 'bounce', value: 800 },
            { source: 'home_uv', target: 'loan', value: 600 },
            { source: 'home_uv', target: 'huabei', value: 1000 },
            { source: 'home_uv', target: 'other_exit', value: 1100 },
        ],
    };

    // 代码示例
    const basicCode = `import { Sankey } from '@/components/Sankey';
import { SankeyChartData } from '@/components/Sankey/Sankey.type';

const data: SankeyChartData = {
    nodes: [
        { id: 'coal', name: '煤炭' },
        { id: 'oil', name: '石油' },
        { id: 'gas', name: '天然气' },
        { id: 'electricity', name: '电力' },
        { id: 'heating', name: '供暖' },
        { id: 'transport', name: '交通' },
        { id: 'industry', name: '工业' },
        { id: 'residential', name: '居民' },
    ],
    links: [
        { source: 'coal', target: 'electricity', value: 120 },
        { source: 'coal', target: 'industry', value: 80 },
        { source: 'oil', target: 'transport', value: 150 },
        { source: 'oil', target: 'industry', value: 60 },
        { source: 'gas', target: 'electricity', value: 90 },
        { source: 'gas', target: 'heating', value: 70 },
        { source: 'gas', target: 'residential', value: 40 },
        { source: 'electricity', target: 'industry', value: 100 },
        { source: 'electricity', target: 'residential', value: 110 },
    ],
};

export default function Example() {
    return <Sankey data={data} width={800} height={400} />;
}`;

    const colorCode = `import { Sankey } from '@/components/Sankey';

// 自定义节点颜色
const data = {
    nodes: [
        { id: 'landing', name: '落地页', color: '#3b82f6' },
        { id: 'product', name: '产品页', color: '#60a5fa' },
        { id: 'cart', name: '购物车', color: '#93c5fd' },
        { id: 'checkout', name: '结算页', color: '#f59e0b' },
        { id: 'pay', name: '支付成功', color: '#10b981' },
        { id: 'leave', name: '离开', color: '#ef4444' },
    ],
    links: [
        { source: 'landing', target: 'product', value: 8000 },
        { source: 'landing', target: 'leave', value: 2000 },
        { source: 'product', target: 'cart', value: 5000 },
        { source: 'product', target: 'leave', value: 3000 },
        { source: 'cart', target: 'checkout', value: 3500 },
        { source: 'cart', target: 'leave', value: 1500 },
        { source: 'checkout', target: 'pay', value: 2800 },
        { source: 'checkout', target: 'leave', value: 700 },
    ],
};

export default function Example() {
    return (
        <Sankey
            data={data}
            width={800}
            height={400}
            node={{ showName: true, showValue: false }}
            link={{ gradient: true, opacity: 0.5 }}
        />
    );
}`;

    const eventCode = `import { Sankey } from '@/components/Sankey';

export default function Example() {
    const handleNodeClick = (node, inputValue, outputValue) => {
        console.log('点击节点:', node.name);
        console.log('输入流量:', inputValue);
        console.log('输出流量:', outputValue);
    };

    const handleLinkClick = (link, sourceNode, targetNode) => {
        console.log('点击链接:', sourceNode.name, '->', targetNode.name);
        console.log('流量值:', link.value);
    };

    return (
        <Sankey
            data={data}
            width={800}
            height={400}
            onNodeClick={handleNodeClick}
            onLinkClick={handleLinkClick}
        />
    );
}`;

    const alipayCode = `import { Sankey } from '@/components/Sankey';

// 支付宝首页 UV 流向数据
const data = {
    nodes: [
        // 左侧来源
        { id: 'first_open', name: '首次打开', color: '#93c5fd' },
        { id: 'result_page', name: '结果页', color: '#86efac' },
        { id: 'verify_page', name: '验证页', color: '#d1d5db' },
        { id: 'my_page', name: '我的', color: '#fdba74' },
        { id: 'friends', name: '朋友', color: '#c4b5fd' },
        { id: 'other_source', name: '其他来源', color: '#bae6fd' },
        // 中间节点
        { id: 'home_uv', name: '首页 UV', color: '#c4b5fd' },
        // 右侧去向
        { id: 'wealth', name: '理财', color: '#fb923c' },
        { id: 'scan', name: '扫一扫', color: '#0f766e' },
        { id: 'service', name: '服务', color: '#f472b6' },
        { id: 'forest', name: '蚂蚁森林', color: '#60a5fa' },
        { id: 'bounce', name: '跳失', color: '#86efac' },
        { id: 'loan', name: '借呗', color: '#6b7280' },
        { id: 'huabei', name: '花呗', color: '#fbbf24' },
        { id: 'other_exit', name: '其他流向', color: '#818cf8' },
    ],
    links: [
        // 来源到首页 UV
        { source: 'first_open', target: 'home_uv', value: 5000 },
        { source: 'result_page', target: 'home_uv', value: 2000 },
        { source: 'verify_page', target: 'home_uv', value: 500 },
        { source: 'my_page', target: 'home_uv', value: 800 },
        { source: 'friends', target: 'home_uv', value: 600 },
        { source: 'other_source', target: 'home_uv', value: 1100 },
        // 首页 UV 到各去向
        { source: 'home_uv', target: 'wealth', value: 800 },
        { source: 'home_uv', target: 'scan', value: 1200 },
        { source: 'home_uv', target: 'service', value: 1500 },
        { source: 'home_uv', target: 'forest', value: 2000 },
        { source: 'home_uv', target: 'bounce', value: 800 },
        { source: 'home_uv', target: 'loan', value: 600 },
        { source: 'home_uv', target: 'huabei', value: 1000 },
        { source: 'home_uv', target: 'other_exit', value: 1100 },
    ],
};

export default function Example() {
    return (
        <Sankey
            data={data}
            width={800}
            height={400}
            node={{ showName: true, showValue: false }}
            link={{ gradient: true, opacity: 0.3 }}
        />
    );
}`;

    return (
        <div className={styles.examplePage}>
            <div>
                {/* 页面标题 */}
                <div className={styles.mainContent}>
                    <h1 className={styles.sectionTitle}>桑基图 Sankey</h1>
                    <p className={styles.sectionText}>
                        桑基图是一种特定类型的流图，用于描述一组值到另一组值的流向。
                        通常应用于能源、材料成分、金融等数据的可视化分析。
                        其特点是起始流量和结束流量相同，保持能量平衡；
                        线条宽度成比例显示流量大小，节点宽度代表特定状态下的流量大小。
                    </p>
                </div>

                {/* 基础示例 */}
                <div className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>基础用法</h2>
                    <p className={styles.subsectionText}>
                        最基本的桑基图，展示能源从来源到用途的流向。
                    </p>
                    <div className={styles.exampleDemo}>
                        <Sankey data={basicData} width={800} height={400} />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={basicCode} />
                    </div>
                    <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                        {basicCode}
                    </SyntaxHighlighter>
                </div>

                {/* 支付宝首页 UV 流向示例 - 与图片匹配 */}
                <div className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>支付宝首页 UV 流向</h2>
                    <p className={styles.subsectionText}>
                        展示用户从不同入口进入支付宝首页后，流向各功能模块的路径分析。
                        数据来源：左侧为各入口流量，中间汇聚到首页 UV，右侧分流到各功能模块。
                    </p>
                    <div className={styles.exampleDemo}>
                        <Sankey
                            data={alipayData}
                            width={800}
                            height={400}
                            node={{ showName: true, showValue: false }}
                            link={{ gradient: true, opacity: 0.3 }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={alipayCode} />
                    </div>
                    <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                        {alipayCode}
                    </SyntaxHighlighter>
                </div>

                {/* 自定义颜色 */}
                <div className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>自定义样式</h2>
                    <p className={styles.subsectionText}>
                        支持自定义节点颜色、链接透明度、渐变效果等样式配置。
                    </p>
                    <div className={styles.exampleDemo}>
                        <Sankey
                            data={colorData}
                            width={800}
                            height={400}
                            node={{ showName: true, showValue: false }}
                            link={{ gradient: true, opacity: 0.5 }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={colorCode} />
                    </div>
                    <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                        {colorCode}
                    </SyntaxHighlighter>
                </div>

                {/* 复杂数据 */}
                <div className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>复杂数据展示</h2>
                    <p className={styles.subsectionText}>
                        展示更复杂的数据流向，例如个人资金流向分析。
                    </p>
                    <div className={styles.exampleDemo}>
                        <Sankey
                            data={complexData}
                            width={900}
                            height={500}
                            node={{
                                showName: true,
                                showValue: false,
                                labelPosition: 'right',
                            }}
                            tooltip={{
                                enabled: true,
                            }}
                        />
                    </div>
                </div>

                {/* 事件处理 */}
                <div className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>事件处理</h2>
                    <p className={styles.subsectionText}>
                        支持节点点击和链接点击事件，可以获取详细的流量数据。
                    </p>
                    <div className={styles.exampleDemo}>
                        <Sankey
                            data={basicData}
                            width={800}
                            height={400}
                            onNodeClick={(node, inputValue, outputValue) => {
                                alert(
                                    `节点: ${node.name}\n输入流量: ${inputValue}\n输出流量: ${outputValue}`
                                );
                            }}
                            onLinkClick={(link, sourceNode, targetNode) => {
                                alert(
                                    `链接: ${sourceNode.name} → ${targetNode.name}\n流量: ${link.value}`
                                );
                            }}
                        />
                    </div>
                    <div className={styles.codeHeader}>
                        <span>示例代码</span>
                        <CopyButton text={eventCode} />
                    </div>
                    <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                        {eventCode}
                    </SyntaxHighlighter>
                </div>

                {/* 性能对比 */}
                <div className={styles.exampleSection}>
                    <h2 className={styles.subsectionTitle}>Canvas 渲染优势</h2>
                    <p className={styles.subsectionText}>
                        桑基图采用 Canvas 渲染技术，相比 SVG 具有更好的性能表现，
                        特别适合处理大量节点和链接的复杂场景。
                    </p>
                    <div className={styles.features}>
                        <div className={styles.featureCard}>
                            <h3>⚡ 高性能渲染</h3>
                            <p>
                                Canvas 使用像素级绘制，避免了 DOM 操作的开销，
                                在大数据量场景下渲染性能更优。
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <h3>🎨 渐变效果</h3>
                            <p>
                                支持链接渐变色彩，从源节点颜色平滑过渡到目标节点颜色，
                                视觉效果更加流畅自然。
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <h3>📱 流畅动画</h3>
                            <p>
                                使用 requestAnimationFrame 实现流畅的入场动画，
                                支持自定义缓动函数和动画时长。
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <h3>🎯 精准交互</h3>
                            <p>
                                通过碰撞检测算法实现鼠标交互，
                                支持节点和链接的悬停高亮、点击事件。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 组件特性 */}
                <div className={styles.features}>
                    <div className={styles.featureCard}>
                        <h3>🌊 能量平衡</h3>
                        <p>
                            桑基图保持流量守恒，起始流量和结束流量相同，
                            所有主支宽度总和与分支宽度总和相等。
                        </p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>📊 比例展示</h3>
                        <p>
                            线条宽度成比例显示流量大小，节点宽度代表特定状态下的流量大小，
                            直观展示数据分布。
                        </p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>🎨 丰富配置</h3>
                        <p>
                            支持自定义颜色、渐变效果、动画、提示框等，
                            满足不同场景的可视化需求。
                        </p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>🖱️ 交互支持</h3>
                        <p>
                            支持鼠标悬停高亮、点击事件等交互操作，
                            可以获取详细的节点和链接数据。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
