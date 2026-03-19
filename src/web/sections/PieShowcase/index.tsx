/**
 * Pie 组件展示区域
 * 展示 Pie 组件的各种复杂用法和特性，带有切换动画效果
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Pie } from '@/components/Pie';
import type { PieChartData, PieMultiRingData, PieProps } from '@/components/Pie';
import styles from './style.module.css';

type DemoType = 'basic' | 'donut' | 'multi-ring' | 'custom-label' | 'interactive';

interface DemoConfig {
    id: DemoType;
    title: string;
    description: string;
}

const demos: DemoConfig[] = [
    {
        id: 'basic',
        title: '基础饼图',
        description: '展示数据占比的基础饼图，支持自定义颜色和动画效果',
    },
    {
        id: 'donut',
        title: '环形图',
        description: '带中心空洞的环形图，适合展示比例同时保留中心区域',
    },
    {
        id: 'multi-ring',
        title: '多层嵌套',
        description: '多层环形图，对比不同维度的数据分布',
    },
    {
        id: 'custom-label',
        title: '自定义标签',
        description: '灵活配置标签显示内容和样式，支持内外部标签',
    },
    {
        id: 'interactive',
        title: '交互效果',
        description: '点击、悬停等交互效果，支持事件回调',
    },
];

// 基础数据
const basicData: PieChartData = {
    items: [
        { label: '直接访问', value: 335, color: '#3b82f6' },
        { label: '邮件营销', value: 310, color: '#10b981' },
        { label: '联盟广告', value: 234, color: '#f59e0b' },
        { label: '视频广告', value: 135, color: '#8b5cf6' },
        { label: '搜索引擎', value: 1548, color: '#ef4444' },
    ],
};

// 多层环形图数据
const multiRingData: PieMultiRingData = {
    layers: [
        {
            name: '2022年',
            items: [
                { label: '线上', value: 450 },
                { label: '线下', value: 320 },
                { label: '分销', value: 230 },
            ],
            innerRadius: 0.2,
            outerRadius: 0.45,
        },
        {
            name: '2023年',
            items: [
                { label: '线上', value: 520 },
                { label: '线下', value: 280 },
                { label: '分销', value: 200 },
            ],
            innerRadius: 0.5,
            outerRadius: 0.75,
        },
    ],
};

const PieShowcase: React.FC = () => {
    const [activeDemo, setActiveDemo] = useState<DemoType>('basic');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [clickedIndex, setClickedIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // 处理 Tab 切换动画
    const handleDemoChange = useCallback((demoId: DemoType) => {
        if (demoId === activeDemo) return;

        setIsTransitioning(true);
        setTimeout(() => {
            setActiveDemo(demoId);
            setClickedIndex(null);
            setHoveredIndex(null);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 300);
    }, [activeDemo]);

    // 获取当前演示的配置
    const getPieProps = (): Partial<PieProps> => {
        const baseProps: Partial<PieProps> = {
            width: 500,
            height: 400,
            animationDuration: 800,
        };

        switch (activeDemo) {
            case 'basic':
                return {
                    ...baseProps,
                    data: basicData,
                    label: {
                        display: true,
                        position: 'outside',
                        formatter: '{label}',
                    },
                    legend: {
                        display: true,
                        position: 'right',
                    },
                };
            case 'donut':
                return {
                    ...baseProps,
                    data: basicData,
                    innerRadius: 0.5,
                    label: {
                        display: true,
                        position: 'inside',
                        formatter: '{percentage}%',
                        color: '#ffffff',
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                };
            case 'multi-ring':
                return {
                    ...baseProps,
                    multiRingData,
                    legend: {
                        display: true,
                        position: 'right',
                    },
                };
            case 'custom-label':
                return {
                    ...baseProps,
                    data: basicData,
                    innerRadius: 0.4,
                    label: {
                        display: true,
                        position: 'outside',
                        formatter: (item: { label: string }, percentage: number) => `${item.label}: ${percentage.toFixed(1)}%`,
                        fontSize: 13,
                    },
                    legend: {
                        display: true,
                        position: 'left',
                    },
                };
            case 'interactive':
                return {
                    ...baseProps,
                    data: basicData,
                    innerRadius: 0.3,
                    onDataClick: (index: number) => {
                        setClickedIndex(index);
                        setTimeout(() => setClickedIndex(null), 1000);
                    },
                    legend: {
                        display: true,
                        position: 'right',
                    },
                };
            default:
                return baseProps;
        }
    };

    // 获取代码示例
    const getCodeExample = (): string => {
        const examples: Record<DemoType, string> = {
            basic: `import { Pie } from '@zjpcy/charts/pie';

<Pie
  data={{
    items: [
      { label: '直接访问', value: 335 },
      { label: '邮件营销', value: 310 },
      { label: '联盟广告', value: 234 },
    ]
  }}
  width={500}
  height={400}
  animationDuration={800}
/>`,
            donut: `<Pie
  data={data}
  width={500}
  height={400}
  innerRadius={0.5}  // 环形图配置
  label={{
    display: true,
    position: 'inside',
    formatter: '{percentage}%'
  }}
/>`,
            'multi-ring': `<Pie
  multiRingData={{
    layers: [
      {
        name: '2022年',
        items: [...],
        innerRadius: 0.2,
        outerRadius: 0.45,
      },
      {
        name: '2023年',
        items: [...],
        innerRadius: 0.5,
        outerRadius: 0.75,
      }
    ]
  }}
  width={500}
  height={400}
/>`,
            'custom-label': `<Pie
  data={data}
  width={500}
  height={400}
  label={{
    display: true,
    position: 'outside',
    // 自定义格式化
    formatter: (item, percentage) => 
      \`\${item.label}: \${percentage.toFixed(1)}%\`,
    fontSize: 13
  }}
/>`,
            interactive: `<Pie
  data={data}
  width={500}
  height={400}
  innerRadius={0.3}
  onDataClick={(index, item) => {
    console.log('Clicked:', index, item);
  }}
/>`,
        };
        return examples[activeDemo];
    };

    return (
        <div className={styles.showcase}>
            <div className={styles.header}>
                <span className={styles.subtitle}>组件示例</span>
                <h2 className={styles.title}>
                    <span className={styles.gradientText}>Pie</span> 饼图组件
                </h2>
                <p className={styles.description}>
                    功能丰富的饼图组件，支持多种展示模式和交互效果
                </p>
            </div>

            {/* Tab 切换栏 */}
            <div className={styles.tabs}>
                {demos.map((demo) => (
                    <button
                        key={demo.id}
                        className={`${styles.tab} ${activeDemo === demo.id ? styles.tabActive : ''}`}
                        onClick={() => handleDemoChange(demo.id)}
                    >
                        <span className={styles.tabText}>{demo.title}</span>
                        {activeDemo === demo.id && (
                            <span className={styles.tabIndicator} />
                        )}
                    </button>
                ))}
            </div>

            {/* 演示区域 */}
            <div className={styles.demoArea}>
                <div
                    className={`${styles.chartSection} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
                >
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <div className={styles.chartDots}>
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className={styles.chartTitle}>
                                {demos.find(d => d.id === activeDemo)?.title}
                            </span>
                        </div>
                        <div className={styles.chartContainer}>
                            {activeDemo === 'multi-ring' ? (
                                <Pie {...getPieProps()} multiRingData={multiRingData} />
                            ) : (
                                <Pie {...getPieProps()} data={basicData} />
                            )}
                            {/* 交互反馈层 */}
                            {activeDemo === 'interactive' && clickedIndex !== null && (
                                <div className={styles.feedback}>
                                    <div className={styles.feedbackContent}>
                                        <span className={styles.feedbackIcon}>✓</span>
                                        <span>已选择: {basicData.items[clickedIndex].label}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 特性说明卡片 */}
                    <div className={`${styles.infoCard} ${isTransitioning ? styles.slideOut : styles.slideIn}`}>
                        <h3 className={styles.infoTitle}>
                            {demos.find(d => d.id === activeDemo)?.title}
                        </h3>
                        <p className={styles.infoDescription}>
                            {demos.find(d => d.id === activeDemo)?.description}
                        </p>
                        <div className={styles.featureTags}>
                            {getFeatureTags(activeDemo).map((tag, index) => (
                                <span key={index} className={styles.featureTag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 代码示例 */}
                <div className={`${styles.codeSection} ${isTransitioning ? styles.slideUpOut : styles.slideUpIn}`}>
                    <div className={styles.codeCard}>
                        <div className={styles.codeHeader}>
                            <div className={styles.codeDots}>
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className={styles.codeLang}>TypeScript / TSX</span>
                        </div>
                        <pre className={styles.codeContent}>
                            <code>{getCodeExample()}</code>
                        </pre>
                    </div>
                </div>
            </div>

            {/* 特性网格 */}
            <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h4>Canvas 渲染</h4>
                    <p>高性能 Canvas 渲染，支持大规模数据</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                    </div>
                    <h4>流畅动画</h4>
                    <p>精心设计的入场和交互动画</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                        </svg>
                    </div>
                    <h4>灵活配置</h4>
                    <p>丰富的配置选项，满足各种需求</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                        </svg>
                    </div>
                    <h4>TypeScript</h4>
                    <p>完整的类型支持，开发更安心</p>
                </div>
            </div>
        </div>
    );
};

function getFeatureTags(demoType: DemoType): string[] {
    const tags: Record<DemoType, string[]> = {
        basic: ['基础展示', '图例支持', '动画效果'],
        donut: ['环形图', '内部标签', '百分比显示'],
        'multi-ring': ['多层数据', '数据对比', '复杂场景'],
        'custom-label': ['标签定制', '格式化', '样式配置'],
        interactive: ['点击事件', '交互反馈', '状态管理'],
    };
    return tags[demoType];
}

export default PieShowcase;
