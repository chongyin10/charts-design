/**
 * 韦恩图演示页面
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Venn } from '@/components/Venn';
import { Anchor } from '@zjpcy/simple-design';
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
 * 韦恩图示例页面
 */
export default function VennPage() {
  // 滚动容器
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const container = document.querySelector('.app-content') as HTMLElement || document.body;
    setScrollContainer(container);
  }, []);

  /**
   * 三集合韦恩图示例数据
   */
  const threeSetData = {
    sets: [
      { name: 'A', value: 100, color: '#3b82f6' },
      { name: 'B', value: 80, color: '#14b8a6' },
      { name: 'C', value: 60, color: '#f97316' },
    ],
    intersections: [
      { sets: ['A', 'B'], value: 30, label: 'A&B' },
      { sets: ['A', 'C'], value: 25, label: 'A&C' },
      { sets: ['B', 'C'], value: 20, label: 'B&C' },
      { sets: ['A', 'B', 'C'], value: 10, label: 'A&B&C' },
    ],
  };

  /**
   * 双集合韦恩图示例数据
   */
  const twoSetData = {
    sets: [
      { name: '前端开发', value: 150, color: '#8b5cf6' },
      { name: '后端开发', value: 120, color: '#f59e0b' },
    ],
    intersections: [
      { sets: ['前端开发', '后端开发'], value: 40, label: '全栈开发' },
    ],
  };

  /**
   * 技能分布韦恩图数据
   */
  const skillsData = {
    sets: [
      { name: 'React', value: 200, color: '#61dafb' },
      { name: 'Vue', value: 180, color: '#4fc08d' },
      { name: 'Angular', value: 100, color: '#dd0031' },
    ],
    intersections: [
      { sets: ['React', 'Vue'], value: 50, label: 'React&Vue' },
      { sets: ['React', 'Angular'], value: 30, label: 'React&Angular' },
      { sets: ['Vue', 'Angular'], value: 25, label: 'Vue&Angular' },
      { sets: ['React', 'Vue', 'Angular'], value: 15, label: '三大框架' },
    ],
  };

  const handleClick = (data: {
    type: 'set' | 'intersection';
    name: string;
    value?: number;
    sets: string[];
  }) => {
    console.log('点击了:', data);
  };

  // 三集合示例代码
  const threeSetCode = `import { Venn } from '@/components/Venn';

const data = {
  sets: [
    { name: 'A', value: 100, color: '#3b82f6' },
    { name: 'B', value: 80, color: '#14b8a6' },
    { name: 'C', value: 60, color: '#f97316' },
  ],
  intersections: [
    { sets: ['A', 'B'], value: 30, label: 'A&B' },
    { sets: ['A', 'C'], value: 25, label: 'A&C' },
    { sets: ['B', 'C'], value: 20, label: 'B&C' },
    { sets: ['A', 'B', 'C'], value: 10, label: 'A&B&C' },
  ],
};

<Venn
  data={data}
  width={500}
  height={400}
  config={{
    padding: 50,
    radius: 0.35,
    opacity: 0.75,
    label: {
      display: true,
      color: '#ffffff',
      fontSize: 14,
    },
    legend: {
      display: true,
      position: 'top',
    },
  }}
/>`;

  // 双集合示例代码
  const twoSetCode = `import { Venn } from '@/components/Venn';

const data = {
  sets: [
    { name: '前端开发', value: 150, color: '#8b5cf6' },
    { name: '后端开发', value: 120, color: '#f59e0b' },
  ],
  intersections: [
    { sets: ['前端开发', '后端开发'], value: 40, label: '全栈开发' },
  ],
};

<Venn
  data={data}
  width={500}
  height={400}
  config={{
    padding: 50,
    radius: 0.4,
    opacity: 0.7,
    label: {
      display: true,
      color: '#ffffff',
      fontSize: 13,
    },
    legend: {
      display: true,
      position: 'top',
    },
  }}
/>`;

  // 事件处理示例代码
  const eventCode = `<Venn
  data={data}
  width={500}
  height={400}
  onClick={(data) => {
    console.log('点击:', data.type, data.name);
  }}
  onMouseEnter={(data) => {
    console.log('悬停:', data.name);
  }}
  onMouseLeave={() => {
    console.log('离开');
  }}
  config={{
    tooltip: {
      enabled: true,
      customContent: (data) => {
        return \`\${data.name}: \${data.value || 'N/A'}\`;
      },
    },
  }}
/>`;

  // 自定义样式示例代码
  const customStyleCode = `<Venn
  data={data}
  width={500}
  height={400}
  config={{
    padding: 50,
    radius: 0.38,
    opacity: 0.5,
    label: {
      display: true,
      color: '#333333',
      fontSize: 12,
      formatter: (name: string, value?: number) =>
        value ? \`\${name}: \${value}\` : name,
    },
    legend: {
      display: true,
      position: 'bottom',
    },
  }}
/>`;

  // 锚点列表
  const anchors = [
    { key: 'three-set', title: '三集合示例' },
    { key: 'two-set', title: '双集合示例' },
    { key: 'skills', title: '技能分布' },
    { key: 'custom', title: '自定义样式' },
    { key: 'api', title: 'API 文档' },
  ];

  return (
    <div className={styles.page}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>韦恩图 (Venn Diagram)</h1>
        <p className={styles.description}>
          韦恩图是一种用重叠圆形来表示集合关系的可视化工具，由英国逻辑学家约翰・韦恩（John Venn）在 19 世纪发明。
          它通过图形的重叠区域直观展示不同集合的交集、并集、补集等逻辑关系。
        </p>
      </div>

      <div className={styles.main}>
        {/* 左侧内容 */}
        <div className={styles.content}>
          {/* 三集合韦恩图 */}
          <section id="three-set" className={styles.section}>
            <h2 className={styles.sectionTitle}>三集合韦恩图</h2>
            <p className={styles.paragraph}>
              经典的 A、B、C 三个集合的交集展示，自动计算并渲染交集区域。
            </p>

            <div className={styles.demo}>
              <Venn
                data={threeSetData}
                width={500}
                height={400}
                config={{
                  padding: 50,
                  radius: 0.35,
                  opacity: 0.75,
                  label: {
                    display: true,
                    color: '#ffffff',
                    fontSize: 14,
                  },
                  legend: {
                    display: true,
                    position: 'top',
                  },
                }}
                onClick={handleClick}
              />
            </div>

            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeTitle}>示例代码</span>
                <CopyButton text={threeSetCode} />
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                {threeSetCode}
              </SyntaxHighlighter>
            </div>
          </section>

          {/* 双集合韦恩图 */}
          <section id="two-set" className={styles.section}>
            <h2 className={styles.sectionTitle}>双集合韦恩图</h2>
            <p className={styles.paragraph}>
              展示前后端开发者的技能重叠情况，只有两个集合时自动使用双圆布局。
            </p>

            <div className={styles.demo}>
              <Venn
                data={twoSetData}
                width={500}
                height={400}
                config={{
                  padding: 50,
                  radius: 0.4,
                  opacity: 0.7,
                  label: {
                    display: true,
                    color: '#ffffff',
                    fontSize: 13,
                  },
                  legend: {
                    display: true,
                    position: 'top',
                  },
                }}
                onClick={handleClick}
              />
            </div>

            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeTitle}>示例代码</span>
                <CopyButton text={twoSetCode} />
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                {twoSetCode}
              </SyntaxHighlighter>
            </div>
          </section>

          {/* 前端框架技能分布 */}
          <section id="skills" className={styles.section}>
            <h2 className={styles.sectionTitle}>前端框架技能分布</h2>
            <p className={styles.paragraph}>
              展示开发者掌握不同前端框架的情况，使用自定义颜色。
            </p>

            <div className={styles.demo}>
              <Venn
                data={skillsData}
                width={500}
                height={400}
                config={{
                  padding: 50,
                  radius: 0.35,
                  opacity: 0.7,
                  label: {
                    display: true,
                    color: '#ffffff',
                    fontSize: 12,
                  },
                  legend: {
                    display: true,
                    position: 'top',
                  },
                }}
                onClick={handleClick}
              />
            </div>

            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeTitle}>事件处理代码</span>
                <CopyButton text={eventCode} />
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                {eventCode}
              </SyntaxHighlighter>
            </div>
          </section>

          {/* 自定义样式示例 */}
          <section id="custom" className={styles.section}>
            <h2 className={styles.sectionTitle}>自定义样式示例</h2>
            <p className={styles.paragraph}>
              不透明度调整和自定义标签格式，图例显示在底部。
            </p>

            <div className={styles.demo}>
              <Venn
                data={threeSetData}
                width={500}
                height={400}
                config={{
                  padding: 50,
                  radius: 0.38,
                  opacity: 0.5,
                  label: {
                    display: true,
                    color: '#333333',
                    fontSize: 12,
                    formatter: (name: string, value?: number) =>
                      value ? `${name}: ${value}` : name,
                  },
                  legend: {
                    display: true,
                    position: 'bottom',
                  },
                }}
                onClick={handleClick}
              />
            </div>

            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeTitle}>自定义样式代码</span>
                <CopyButton text={customStyleCode} />
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                {customStyleCode}
              </SyntaxHighlighter>
            </div>
          </section>

          {/* API 文档 */}
          <section id="api" className={styles.section}>
            <h2 className={styles.sectionTitle}>API 文档</h2>

            <h3 className={styles.subTitle}>Venn Props</h3>
            <div className={styles.codeBlock}>
              <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                {`interface VennProps {
  /** 图表数据 */
  data: VennData;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 图表配置 */
  config?: VennConfig;
  /** 点击事件回调 */
  onClick?: (data: {
    type: 'set' | 'intersection';
    name: string;
    value?: number;
    sets: string[];
  }) => void;
  /** 鼠标移入事件回调 */
  onMouseEnter?: (data: {
    type: 'set' | 'intersection';
    name: string;
    value?: number;
    sets: string[];
  }) => void;
  /** 鼠标移出事件回调 */
  onMouseLeave?: () => void;
}`}
              </SyntaxHighlighter>
            </div>

            <h3 className={styles.subTitle} style={{ marginTop: 32 }}>数据类型定义</h3>
            <div className={styles.codeBlock}>
              <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                {`// 集合数据项
interface VennSet {
  name: string;
  value?: number;
  color?: string;
}

// 交集数据项
interface VennIntersection {
  sets: string[];
  value?: number;
  label?: string;
  color?: string;
}

// 韦恩图数据
interface VennData {
  sets: VennSet[];
  intersections?: VennIntersection[];
}

// 配置对象
interface VennConfig {
  padding?: number;
  radius?: number;
  opacity?: number;
  animationDuration?: number;
  label?: {
    display?: boolean;
    color?: string;
    fontSize?: number;
    formatter?: string | ((name: string, value?: number) => string);
  };
  legend?: {
    display?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    labelColor?: string;
    labelFontSize?: number;
  };
  tooltip?: {
    enabled?: boolean;
    backgroundColor?: string;
    titleColor?: string;
    bodyColor?: string;
    fontSize?: number;
    customContent?: (data: {
      type: 'set' | 'intersection';
      name: string;
      value?: number;
      sets: string[];
    }) => React.ReactNode;
  };
}`}
              </SyntaxHighlighter>
            </div>
          </section>
        </div>

        {/* 右侧锚点导航 */}
        <div className={styles.sidebar}>
          {scrollContainer && (
            <Anchor
              getContainer={() => scrollContainer}
              offsetTop={20}
              affix={false}
              bounds={30}
            >
              <Anchor.Link href="#three-set" title="三集合示例" />
              <Anchor.Link href="#two-set" title="双集合示例" />
              <Anchor.Link href="#skills" title="技能分布" />
              <Anchor.Link href="#custom" title="自定义样式" />
              <Anchor.Link href="#api" title="API 文档" />
            </Anchor>
          )}
        </div>
      </div>
    </div>
  );
}
