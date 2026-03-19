/**
 * 特性展示区域
 * 展示组件库的核心特性
 */

import React, { useState } from 'react';
import styles from './style.module.css';

interface FeaturesProps {
    onShowcase: () => void;
}

interface Feature {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    details: string[];
}

const features: Feature[] = [
    {
        id: 'typescript',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v18H3V3zm10.71 11.29a1 1 0 0 0-1.42 0l-2 2a1 1 0 0 0 1.42 1.42l1.29-1.3 1.29 1.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-2-2zM7 10a1 1 0 0 0 1 1h8a1 1 0 0 0 0-2H8a1 1 0 0 0-1 1z"/>
            </svg>
        ),
        title: 'TypeScript 全支持',
        description: '100% TypeScript 编写，提供完整的类型定义和智能提示',
        details: ['完整的类型定义', '智能代码提示', '编译时类型检查'],
    },
    {
        id: 'canvas',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z"/>
            </svg>
        ),
        title: 'Canvas 高性能渲染',
        description: '基于 Canvas 的高性能渲染，支持大规模数据可视化',
        details: ['60fps 流畅动画', '百万级数据渲染', '硬件加速'],
    },
    {
        id: 'animation',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
        ),
        title: '流畅动画效果',
        description: '精心设计的动画系统，让数据变化更加直观生动',
        details: ['入场动画', '交互反馈', '状态过渡'],
    },
    {
        id: 'customize',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        ),
        title: '高度可定制',
        description: '丰富的配置选项，满足各种定制化需求',
        details: ['主题定制', '自定义渲染', '交互事件'],
    },
    {
        id: 'responsive',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
            </svg>
        ),
        title: '响应式设计',
        description: '自适应容器大小，完美适配各种屏幕尺寸',
        details: ['自动尺寸调整', '断点适配', '高清屏支持'],
    },
    {
        id: 'tree-shaking',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/>
            </svg>
        ),
        title: '按需加载',
        description: '支持 Tree-shaking，只打包使用的组件',
        details: ['组件级引入', '样式按需加载', '最小化包体积'],
    },
];

const Features: React.FC<FeaturesProps> = ({ onShowcase }) => {
    const [activeFeature, setActiveFeature] = useState<string>(features[0].id);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleFeatureClick = (id: string) => {
        if (id === activeFeature) return;
        setIsAnimating(true);
        setTimeout(() => {
            setActiveFeature(id);
            setIsAnimating(false);
        }, 200);
    };

    const currentFeature = features.find(f => f.id === activeFeature) || features[0];

    return (
        <div className={styles.features}>
            <div className={styles.header}>
                <span className={styles.subtitle}>核心特性</span>
                <h2 className={styles.title}>
                    为什么选择 <span className={styles.gradientText}>Design Charts</span>?
                </h2>
                <p className={styles.description}>
                    我们精心打磨每一个细节，为您提供最佳的图表开发体验
                </p>
            </div>

            <div className={styles.content}>
                <div className={styles.featureList}>
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            className={`${styles.featureItem} ${activeFeature === feature.id ? styles.active : ''}`}
                            onClick={() => handleFeatureClick(feature.id)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={styles.featureIcon}>{feature.icon}</div>
                            <div className={styles.featureInfo}>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.description}</p>
                            </div>
                            <div className={styles.featureArrow}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`${styles.featureDetail} ${isAnimating ? styles.animating : ''}`}>
                    <div className={styles.detailCard}>
                        <div className={styles.detailIcon}>{currentFeature.icon}</div>
                        <h3 className={styles.detailTitle}>{currentFeature.title}</h3>
                        <p className={styles.detailDescription}>{currentFeature.description}</p>
                        <ul className={styles.detailList}>
                            {currentFeature.details.map((detail, index) => (
                                <li key={index} className={styles.detailItem}>
                                    <span className={styles.detailBullet} />
                                    <span>{detail}</span>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.detailCode}>
                            <div className={styles.codeHeader}>
                                <span />
                                <span />
                                <span />
                                <span className={styles.codeTitle}>示例代码</span>
                            </div>
                            <pre className={styles.codeContent}>
                                <code>{getFeatureCode(currentFeature.id)}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.cta}>
                <button className={styles.ctaBtn} onClick={onShowcase}>
                    <span>查看组件示例</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

function getFeatureCode(featureId: string): string {
    const codes: Record<string, string> = {
        typescript: `import { Pie } from '@zjpcy/charts/pie';
import type { PieChartData } from '@zjpcy/charts/pie';

const data: PieChartData = {
  items: [
    { label: 'A', value: 335 },
    { label: 'B', value: 310 },
  ]
};`,
        canvas: `// Canvas 高性能渲染
<Pie
  data={data}
  width={400}
  height={400}
  animationDuration={800}
/>`,
        animation: `// 流畅的动画配置
<Pie
  data={data}
  animationDuration={1000}
  // 支持自定义缓动函数
/>`,
        customize: `// 高度可定制
<Pie
  data={data}
  innerRadius={0.5}
  label={{
    display: true,
    position: 'outside',
    formatter: '{label}: {value}'
  }}
/>`,
        responsive: `// 响应式设计
<Pie
  data={data}
  width={400}
  height={400}
  // 自动适配容器
/>`,
        'tree-shaking': `// 按需引入
import { Pie } from '@zjpcy/charts/pie';
import '@zjpcy/charts/pie/style.css';`,
    };
    return codes[featureId] || '';
}

export default Features;
