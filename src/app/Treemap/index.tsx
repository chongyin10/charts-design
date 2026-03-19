'use client';

import React, { useState, useEffect } from 'react';
import { Treemap } from '@/components/Treemap';
import { TreemapChartData, TreemapNode } from '@/components/Treemap/Treemap.type';
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
 * 矩阵树图示例页面
 */
export default function TreemapPage() {
    // 滚动容器
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础示例数据 - 文件系统大小
    const basicData: TreemapChartData = {
        root: {
            name: '根目录',
            children: [
                { name: '文档', value: 1200, color: '#3b82f6' },
                { name: '图片', value: 2800, color: '#ef4444' },
                { name: '视频', value: 4500, color: '#10b981' },
                { name: '音乐', value: 1500, color: '#f59e0b' },
                { name: '代码', value: 800, color: '#8b5cf6' },
                { name: '其他', value: 600, color: '#6b7280' },
            ],
        },
    };

    // 嵌套层级示例 - 电商销售数据
    const nestedData: TreemapChartData = {
        root: {
            name: '总销售额',
            children: [
                {
                    name: '电子产品',
                    children: [
                        { name: '手机', value: 2500000 },
                        { name: '电脑', value: 1800000 },
                        { name: '平板', value: 900000 },
                        { name: '配件', value: 450000 },
                    ],
                },
                {
                    name: '服装',
                    children: [
                        { name: '男装', value: 1200000 },
                        { name: '女装', value: 1500000 },
                        { name: '童装', value: 600000 },
                        { name: '鞋履', value: 800000 },
                    ],
                },
                {
                    name: '家居',
                    children: [
                        { name: '家具', value: 900000 },
                        { name: '厨具', value: 400000 },
                        { name: '装饰', value: 300000 },
                        { name: '收纳', value: 200000 },
                    ],
                },
                {
                    name: '食品',
                    children: [
                        { name: '零食', value: 500000 },
                        { name: '饮料', value: 350000 },
                        { name: '生鲜', value: 280000 },
                        { name: '粮油', value: 220000 },
                    ],
                },
            ],
        },
    };

    // 三层嵌套示例 - 公司组织架构
    const deepNestedData: TreemapChartData = {
        root: {
            name: '总公司',
            children: [
                {
                    name: '技术部',
                    children: [
                        {
                            name: '前端组',
                            children: [
                                { name: 'React组', value: 15 },
                                { name: 'Vue组', value: 12 },
                                { name: 'Angular组', value: 8 },
                            ],
                        },
                        {
                            name: '后端组',
                            children: [
                                { name: 'Java组', value: 20 },
                                { name: 'Python组', value: 10 },
                                { name: 'Go组', value: 8 },
                            ],
                        },
                        {
                            name: '测试组',
                            children: [
                                { name: '自动化', value: 8 },
                                { name: '手动测试', value: 6 },
                            ],
                        },
                    ],
                },
                {
                    name: '产品部',
                    children: [
                        {
                            name: '设计组',
                            children: [
                                { name: 'UI设计', value: 10 },
                                { name: 'UX设计', value: 6 },
                            ],
                        },
                        {
                            name: '产品组',
                            children: [
                                { name: 'C端产品', value: 8 },
                                { name: 'B端产品', value: 5 },
                            ],
                        },
                    ],
                },
                {
                    name: '运营部',
                    children: [
                        {
                            name: '市场组',
                            children: [
                                { name: '品牌推广', value: 6 },
                                { name: '内容运营', value: 8 },
                            ],
                        },
                        {
                            name: '销售组',
                            children: [
                                { name: '直销', value: 15 },
                                { name: '渠道', value: 10 },
                            ],
                        },
                    ],
                },
            ],
        },
    };

    const [clickedNode, setClickedNode] = useState<TreemapNode | null>(null);

    // 基础示例代码
    const basicCode = `import { Treemap } from '@/components/Treemap';

const data = {
  root: {
    name: '根目录',
    children: [
      { name: '文档', value: 1200, color: '#3b82f6' },
      { name: '图片', value: 2800, color: '#ef4444' },
      { name: '视频', value: 4500, color: '#10b981' },
      { name: '音乐', value: 1500, color: '#f59e0b' },
      { name: '代码', value: 800, color: '#8b5cf6' },
      { name: '其他', value: 600, color: '#6b7280' },
    ],
  },
};

<Treemap
  data={data}
  width={800}
  height={400}
/>`;

    // 嵌套示例代码
    const nestedCode = `import { Treemap } from '@/components/Treemap';

const data = {
  root: {
    name: '总销售额',
    children: [
      {
        name: '电子产品',
        children: [
          { name: '手机', value: 2500000 },
          { name: '电脑', value: 1800000 },
          { name: '平板', value: 900000 },
          { name: '配件', value: 450000 },
        ],
      },
      {
        name: '服装',
        children: [
          { name: '男装', value: 1200000 },
          { name: '女装', value: 1500000 },
          { name: '童装', value: 600000 },
          { name: '鞋履', value: 800000 },
        ],
      },
      // ...更多数据
    ],
  },
};

<Treemap
  data={data}
  width={800}
  height={400}
  animation={true}
/>`;

    // 事件处理代码
    const eventCode = `<Treemap
  data={data}
  width={800}
  height={400}
  onNodeClick={(node, depth) => {
    console.log('点击节点:', node.name, '深度:', depth);
  }}
  onNodeHover={(node, depth) => {
    if (node) {
      console.log('悬停节点:', node.name);
    }
  }}
  tooltip={{
    enabled: true,
    customContent: ({ node, percentage, depth }) => {
      return \`
        <div style="font-weight: bold;">\${node.name}</div>
        <div>数值: \${node.value}</div>
        <div>占比: \${percentage.toFixed(1)}%</div>
        <div>层级: \${depth}</div>
      \`;
    },
  }}
/>`;

    // 自适应示例代码
    const autoFitCode = `import { Treemap } from '@/components/Treemap';

const data = {
  root: {
    name: '根目录',
    children: [
      { name: '文档', value: 1200, color: '#3b82f6' },
      { name: '图片', value: 2800, color: '#ef4444' },
      { name: '视频', value: 4500, color: '#10b981' },
      { name: '音乐', value: 1500, color: '#f59e0b' },
      { name: '代码', value: 800, color: '#8b5cf6' },
      { name: '其他', value: 600, color: '#6b7280' },
    ],
  },
};

// 自适应容器大小
<div style={{ width: '100%', height: '400px' }}>
  <Treemap data={data} />
</div>`;

    // 锚点列表
    const anchors = [
        { key: 'basic', title: '基础示例' },
        { key: 'autofit', title: '自适应' },
        { key: 'nested', title: '嵌套层级' },
        { key: 'deep-nested', title: '多层嵌套' },
        { key: 'events', title: '事件交互' },
        { key: 'api', title: 'API 文档' },
    ];

    // API 文档列定义
    const apiColumns: Column[] = [
        {
            title: '属性',
            dataIndex: 'prop',
            width: 180,
            render: (value) => <code>{value}</code>,
        },
        {
            title: '说明',
            dataIndex: 'desc',
        },
        {
            title: '类型',
            dataIndex: 'type',
            width: 250,
            render: (value) => <code style={{ color: '#c41d7f' }}>{value}</code>,
        },
        {
            title: '默认值',
            dataIndex: 'default',
            width: 120,
            render: (value) => value ? <code>{value}</code> : '-',
        },
    ];

    // API 数据
    const apiData = [
        {
            key: '1',
            prop: 'data',
            desc: '图表数据，包含根节点和嵌套的子节点',
            type: 'TreemapChartData',
            default: 'required',
        },
        {
            key: '2',
            prop: 'width',
            desc: '图表宽度，不传则自适应容器',
            type: 'number',
            default: '-',
        },
        {
            key: '3',
            prop: 'height',
            desc: '图表高度，不传则自适应容器',
            type: 'number',
            default: '-',
        },
        {
            key: '3a',
            prop: 'autoFit',
            desc: '是否自适应容器大小（当 width/height 未指定时生效）',
            type: 'boolean',
            default: 'true',
        },
        {
            key: '4',
            prop: 'colors',
            desc: '颜色方案数组',
            type: 'string[]',
            default: '默认配色',
        },
        {
            key: '5',
            prop: 'animation',
            desc: '是否开启动画',
            type: 'boolean',
            default: 'true',
        },
        {
            key: '6',
            prop: 'animationDuration',
            desc: '动画时长（毫秒）',
            type: 'number',
            default: '600',
        },
        {
            key: '7',
            prop: 'maxDepth',
            desc: '最大显示层级深度（0为无限制）',
            type: 'number',
            default: '0',
        },
        {
            key: '8',
            prop: 'borderColor',
            desc: '边框颜色',
            type: 'string',
            default: "'#ffffff'",
        },
        {
            key: '9',
            prop: 'borderWidth',
            desc: '边框宽度',
            type: 'number',
            default: '1',
        },
        {
            key: '10',
            prop: 'label',
            desc: '标签配置对象',
            type: 'TreemapLabelConfig',
            default: '-',
        },
        {
            key: '11',
            prop: 'tooltip',
            desc: '提示框配置对象',
            type: 'TreemapTooltipConfig',
            default: '-',
        },
        {
            key: '12',
            prop: 'onNodeClick',
            desc: '节点点击事件回调',
            type: '(node: TreemapNode, depth: number) => void',
            default: '-',
        },
        {
            key: '13',
            prop: 'onNodeHover',
            desc: '节点悬停事件回调',
            type: '(node: TreemapNode | null, depth: number) => void',
            default: '-',
        },
    ];

    return (
        <div className={styles.page}>
            {/* 页面标题 */}
            <div className={styles.header}>
                <h1 className={styles.title}>矩阵树图 (Treemap)</h1>
                <p className={styles.description}>
                    使用嵌套矩形展示层级数据的面积比例关系，适用于展示文件系统、销售数据等具有层级结构的数据。
                </p>
            </div>

            <div className={styles.main}>
                {/* 左侧内容 */}
                <div className={styles.content}>
                    {/* 基础示例 */}
                    <section id="basic" className={styles.section}>
                        <h2 className={styles.sectionTitle}>基础示例</h2>
                        <p className={styles.paragraph}>
                            最简单的 Treemap 使用方式，展示扁平的数据结构。
                        </p>

                        <div className={styles.demo}>
                            <Treemap
                                data={basicData}
                                width={800}
                                height={400}
                            />
                        </div>

                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span className={styles.codeTitle}>示例代码</span>
                                <CopyButton text={basicCode} />
                            </div>
                            <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                                {basicCode}
                            </SyntaxHighlighter>
                        </div>
                    </section>

                    {/* 自适应示例 */}
                    <section id="autofit" className={styles.section}>
                        <h2 className={styles.sectionTitle}>自适应</h2>
                        <p className={styles.paragraph}>
                            Treemap 组件支持自适应容器大小。不传入 width 和 height 时，会自动填满父容器，
                            并监听容器尺寸变化自动重绘（带 150ms 防抖处理）。
                        </p>

                        <div className={styles.autoFitContainer}>
                            <Treemap
                                data={basicData}
                                animation={true}
                            />
                        </div>

                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span className={styles.codeTitle}>示例代码</span>
                                <CopyButton text={autoFitCode} />
                            </div>
                            <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                                {autoFitCode}
                            </SyntaxHighlighter>
                        </div>
                    </section>

                    {/* 嵌套层级 */}
                    <section id="nested" className={styles.section}>
                        <h2 className={styles.sectionTitle}>嵌套层级</h2>
                        <p className={styles.paragraph}>
                            Treemap 支持多层嵌套数据，会自动使用颜色区分不同层级，并显示层级间的包含关系。
                        </p>

                        <div className={styles.demo}>
                            <Treemap
                                data={nestedData}
                                width={800}
                                height={500}
                                animation={true}
                            />
                        </div>

                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span className={styles.codeTitle}>示例代码</span>
                                <CopyButton text={nestedCode} />
                            </div>
                            <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                                {nestedCode}
                            </SyntaxHighlighter>
                        </div>
                    </section>

                    {/* 多层嵌套 */}
                    <section id="deep-nested" className={styles.section}>
                        <h2 className={styles.sectionTitle}>多层嵌套</h2>
                        <p className={styles.paragraph}>
                            支持三层及以上的深层嵌套，适用于组织架构、文件目录等复杂层级数据。
                        </p>

                        <div className={styles.demo}>
                            <Treemap
                                data={deepNestedData}
                                width={800}
                                height={500}
                                label={{
                                    display: true,
                                    minSize: 40,
                                }}
                            />
                        </div>
                    </section>

                    {/* 事件交互 */}
                    <section id="events" className={styles.section}>
                        <h2 className={styles.sectionTitle}>事件交互</h2>
                        <p className={styles.paragraph}>
                            Treemap 支持点击和悬停事件，可以自定义提示框内容。
                        </p>

                        {clickedNode && (
                            <div className={styles.infoBox}>
                                <strong>最近点击：</strong>
                                {clickedNode.name} (值: {clickedNode.value || 'N/A'})
                            </div>
                        )}

                        <div className={styles.demo}>
                            <Treemap
                                data={nestedData}
                                width={800}
                                height={400}
                                onNodeClick={(node, depth) => {
                                    setClickedNode(node);
                                    console.log('点击节点:', node, '深度:', depth);
                                }}
                                onNodeHover={(node, depth) => {
                                    if (node) {
                                        console.log('悬停节点:', node.name, '深度:', depth);
                                    }
                                }}
                                tooltip={{
                                    enabled: true,
                                    customContent: ({ node, percentage, depth }) => {
                                        return `
                                            <div style="font-weight: bold;">${node.name}</div>
                                            <div>数值: ${node.value?.toLocaleString() || 'N/A'}</div>
                                            <div>占比: ${percentage.toFixed(1)}%</div>
                                            <div>层级: ${depth}</div>
                                        `;
                                    },
                                }}
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

                    {/* API 文档 */}
                    <section id="api" className={styles.section}>
                        <h2 className={styles.sectionTitle}>API 文档</h2>

                        <h3 className={styles.subTitle}>Treemap Props</h3>
                        <Table
                            columns={apiColumns}
                            dataSource={apiData}
                            pagination={false}
                            bordered
                        />

                        <h3 className={styles.subTitle} style={{ marginTop: 32 }}>数据类型定义</h3>
                        <div className={styles.codeBlock}>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {`// 树图节点
interface TreemapNode {
  name: string;           // 节点名称
  value?: number;         // 节点值（叶子节点必须有）
  children?: TreemapNode[]; // 子节点数组
  color?: string;         // 自定义颜色
  data?: Record<string, unknown>; // 额外数据
}

// 树图数据
interface TreemapChartData {
  root: TreemapNode;      // 根节点
}

// 标签配置
interface TreemapLabelConfig {
  display?: boolean;      // 是否显示标签
  color?: string;         // 标签颜色
  fontSize?: number;      // 字体大小
  formatter?: string | ((node: TreemapNode, percentage: number) => string);
  minSize?: number;       // 最小显示区域的尺寸
}

// 提示框配置
interface TreemapTooltipConfig {
  enabled?: boolean;      // 是否显示
  backgroundColor?: string;
  titleColor?: string;
  bodyColor?: string;
  fontSize?: number;
  customContent?: (data: {
    node: TreemapNode;
    percentage: number;
    depth: number;
  }) => string;
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
                            <Anchor.Link href="#basic" title="基础示例" />
                            <Anchor.Link href="#nested" title="嵌套层级" />
                            <Anchor.Link href="#deep-nested" title="多层嵌套" />
                            <Anchor.Link href="#events" title="事件交互" />
                            <Anchor.Link href="#api" title="API 文档" />
                        </Anchor>
                    )}
                </div>
            </div>
        </div>
    );
}
