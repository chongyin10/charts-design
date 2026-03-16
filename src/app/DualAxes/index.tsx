'use client';

import React, { useState, useEffect } from 'react';
import { DualAxes } from '@/components/DualAxes';
import type { DualAxesChartData } from '@/components/DualAxes/DualAxes.type';
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
    <button className={styles.copyButton} onClick={handleCopy} title="复制代码">
      {copied ? '✓ 已复制' : '📋 复制'}
    </button>
  );
};

/**
 * 双轴图示例页面
 */
export default function DualAxesChartPage() {
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // 获取滚动容器
    const container = (document.querySelector('.app-content') as HTMLElement) || document.body;
    setScrollContainer(container);
  }, []);

  // ==================== 示例数据 ====================

  // 基础双轴图 - 柱状图 + 折线图
  const basicData: DualAxesChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    leftDatasets: [
      {
        label: '销售额(万元)',
        type: 'column',
        data: [120, 190, 150, 250, 220, 300, 280, 350, 320, 380, 420, 450],
        backgroundColor: '#3b82f6',
      },
    ],
    rightDatasets: [
      {
        label: '增长率(%)',
        data: [10, 15, 8, 25, 20, 30, 28, 35, 32, 38, 42, 45],
        borderColor: '#ef4444',
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
    ],
  };

  // 产量与合格率
  const productionData: DualAxesChartData = {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    leftDatasets: [
      {
        label: '产量(件)',
        type: 'column',
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        backgroundColor: '#10b981',
      },
    ],
    rightDatasets: [
      {
        label: '合格率(%)',
        data: [95, 92, 94, 96, 93, 97, 95],
        borderColor: '#f59e0b',
        point: {
          radius: 4,
          style: 'circle',
        },
      },
    ],
  };

  // 多数据系列 - 柱状图 + 多条折线
  const multiSeriesData: DualAxesChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    leftDatasets: [
      {
        label: '线上销售',
        type: 'column',
        data: [320, 332, 301, 334],
        backgroundColor: '#3b82f6',
        barWidth: 0.4,
      },
      {
        label: '线下销售',
        type: 'column',
        data: [220, 182, 191, 234],
        backgroundColor: '#06b6d4',
        barWidth: 0.4,
      },
    ],
    rightDatasets: [
      {
        label: '利润率(%)',
        data: [15, 18, 16, 20],
        borderColor: '#ef4444',
        fill: true,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
      },
      {
        label: '增长率(%)',
        data: [5, 12, 8, 15],
        borderColor: '#8b5cf6',
      },
    ],
  };

  // 线上线下对比
  const compareData: DualAxesChartData = {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    leftDatasets: [
      {
        label: '线上收入',
        type: 'column',
        data: [800, 1200, 1800, 2500, 3200],
        backgroundColor: '#3b82f6',
      },
      {
        label: '线下收入',
        type: 'column',
        data: [1500, 1600, 1400, 1200, 1000],
        backgroundColor: '#10b981',
      },
    ],
    rightDatasets: [
      {
        label: '线上占比(%)',
        data: [35, 43, 56, 68, 76],
        borderColor: '#f59e0b',
        point: {
          radius: 5,
          hoverRadius: 7,
        },
      },
    ],
  };

  // 平滑曲线示例
  const smoothData: DualAxesChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    leftDatasets: [
      {
        label: '访问量(万)',
        type: 'column',
        data: [50, 65, 80, 95, 110, 130, 145, 160, 175, 190, 210, 230],
        backgroundColor: '#8b5cf6',
      },
    ],
    rightDatasets: [
      {
        label: '转化率(%)',
        data: [2.5, 3.2, 3.8, 4.5, 5.2, 5.8, 6.5, 7.2, 7.8, 8.5, 9.2, 10],
        borderColor: '#ec4899',
        fill: true,
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
      },
    ],
  };

  // 左侧折线图示例
  const leftLineData: DualAxesChartData = {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    leftDatasets: [
      {
        label: '新增用户',
        type: 'line',
        data: [150, 230, 224, 218, 135, 147, 260],
        borderColor: '#3b82f6',
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      },
    ],
    rightDatasets: [
      {
        label: '活跃率(%)',
        data: [45, 52, 48, 55, 42, 38, 60],
        borderColor: '#ef4444',
      },
    ],
  };

  // ==================== 代码示例 ====================

  const basicCode = `import { DualAxes } from '@zjpcy/charts-design/dual-axes';

<DualAxes
  data={{
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    leftDatasets: [
      {
        label: '销售额(万元)',
        type: 'column',
        data: [120, 190, 150, 250, 220, 300],
        backgroundColor: '#3b82f6',
      },
    ],
    rightDatasets: [
      {
        label: '增长率(%)',
        data: [10, 15, 8, 25, 20, 30],
        borderColor: '#ef4444',
      },
    ],
  }}
  leftYAxis={{ title: { text: '销售额(万元)' } }}
  rightYAxis={{ title: { text: '增长率(%)' } }}
  width={700}
  height={400}
/>`;

  const multiSeriesCode = `// 多数据系列示例
<DualAxes
  data={{
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    leftDatasets: [
      {
        label: '线上销售',
        type: 'column',
        data: [320, 332, 301, 334],
        backgroundColor: '#3b82f6',
      },
      {
        label: '线下销售',
        type: 'column',
        data: [220, 182, 191, 234],
        backgroundColor: '#06b6d4',
      },
    ],
    rightDatasets: [
      {
        label: '利润率(%)',
        data: [15, 18, 16, 20],
        borderColor: '#ef4444',
        fill: true,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
      },
    ],
  }}
  width={700}
  height={400}
/>`;

  const smoothCode = `// 平滑曲线示例
<DualAxes
  data={smoothData}
  smooth={true}
  width={700}
  height={400}
/>`;

  const verticalLineCode = `// 竖线模式 - 显示所有数据点
<DualAxes
  data={data}
  verticalLine={{
    enabled: true,
    color: '#999',
    lineWidth: 1,
    dash: [5, 5],
  }}
  width={700}
  height={400}
/>`;

  // ==================== 表格列定义 ====================

  const propsColumns: Column[] = [
    {
      title: '属性名',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 200,
    },
    {
      title: '默认值',
      dataIndex: 'default',
      key: 'default',
      width: 120,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const propsData = [
    {
      key: '1',
      name: 'data',
      type: 'DualAxesChartData',
      default: '-',
      description: '图表数据，包含 labels、leftDatasets 和 rightDatasets',
    },
    {
      key: '2',
      name: 'width',
      type: 'number',
      default: '700',
      description: '图表宽度',
    },
    {
      key: '3',
      name: 'height',
      type: 'number',
      default: '400',
      description: '图表高度',
    },
    {
      key: '4',
      name: 'padding',
      type: 'number',
      default: '60',
      description: '图表内边距',
    },
    {
      key: '5',
      name: 'xAxis',
      type: 'DualAxesAxisConfig',
      default: '-',
      description: 'X 轴配置',
    },
    {
      key: '6',
      name: 'leftYAxis',
      type: 'DualAxesAxisConfig',
      default: '-',
      description: '左侧 Y 轴配置（主轴）',
    },
    {
      key: '7',
      name: 'rightYAxis',
      type: 'DualAxesAxisConfig',
      default: '-',
      description: '右侧 Y 轴配置（副轴）',
    },
    {
      key: '8',
      name: 'legend',
      type: 'DualAxesLegendConfig',
      default: '-',
      description: '图例配置',
    },
    {
      key: '9',
      name: 'tooltip',
      type: 'DualAxesTooltipConfig',
      default: '-',
      description: '提示框配置',
    },
    {
      key: '10',
      name: 'verticalLine',
      type: 'DualAxesVerticalLineConfig',
      default: '-',
      description: '竖线配置，启用后鼠标移入显示竖线',
    },
    {
      key: '11',
      name: 'smooth',
      type: 'boolean',
      default: 'false',
      description: '是否启用平滑曲线',
    },
    {
      key: '12',
      name: 'animationDuration',
      type: 'number',
      default: '1000',
      description: '动画时长（毫秒）',
    },
    {
      key: '13',
      name: 'onDataClick',
      type: 'function',
      default: '-',
      description: '数据点击回调函数',
    },
  ];

  const datasetColumns: Column[] = [
    {
      title: '属性名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 180,
    },
    {
      title: '默认值',
      dataIndex: 'default',
      key: 'default',
      width: 100,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const leftDatasetData = [
    { key: '1', name: 'label', type: 'string', default: '-', description: '数据集标签' },
    { key: '2', name: 'data', type: 'number[]', default: '-', description: '数据数组' },
    { key: '3', name: 'type', type: "'line' | 'column'", default: "'column'", description: '图表类型，默认柱状图' },
    { key: '4', name: 'backgroundColor', type: 'string', default: '-', description: '填充颜色' },
    { key: '5', name: 'borderColor', type: 'string', default: '-', description: '边框颜色（折线图）' },
    { key: '6', name: 'fill', type: 'boolean', default: 'false', description: '是否填充区域（折线图）' },
    { key: '7', name: 'barWidth', type: 'number', default: '0.6', description: '柱状图宽度比例' },
    { key: '8', name: 'point', type: 'DualAxesPointConfig', default: '-', description: '数据点配置' },
    { key: '9', name: 'hidden', type: 'boolean', default: 'false', description: '是否隐藏' },
  ];

  const rightDatasetData = [
    { key: '1', name: 'label', type: 'string', default: '-', description: '数据集标签' },
    { key: '2', name: 'data', type: 'number[]', default: '-', description: '数据数组' },
    { key: '3', name: 'borderColor', type: 'string', default: '-', description: '线条颜色' },
    { key: '4', name: 'backgroundColor', type: 'string', default: '-', description: '填充颜色' },
    { key: '5', name: 'fill', type: 'boolean', default: 'false', description: '是否填充区域' },
    { key: '6', name: 'point', type: 'DualAxesPointConfig', default: '-', description: '数据点配置' },
    { key: '7', name: 'hidden', type: 'boolean', default: 'false', description: '是否隐藏' },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>双轴图 DualAxes</h1>
      <p className={styles.description}>
        双轴图是一种将两组不同量级或不同单位的数据，通过左右两个纵坐标轴（Y
        轴）和共同的横坐标轴（X 轴）进行可视化的图表类型。适用于展示如"销售额"与"增长率"、"产量"与"合格率"等需要双轴对比的场景。
      </p>

      <Flex gap={24}>
        {/* 主内容区 */}
        <div style={{ flex: 1 }}>
          {/* 基础用法 */}
          <section id="basic" className={styles.section}>
            <h2 className={styles.sectionTitle}>基础用法</h2>
            <p className={styles.sectionDescription}>
              左侧 Y 轴显示柱状图（销售额），右侧 Y 轴显示折线图（增长率），两组数据共享 X 轴。
            </p>

            <div className={styles.demoCard}>
              <div className={styles.demoTitle}>销售额与增长率对比</div>
              <div className={styles.chartWrapper}>
                <DualAxes
                  data={basicData}
                  leftYAxis={{ title: { text: '销售额(万元)', color: '#3b82f6' } }}
                  rightYAxis={{ title: { text: '增长率(%)', color: '#ef4444' } }}
                  width={700}
                  height={400}
                />
              </div>
              <div className={styles.codeBlock}>
                <CopyButton text={basicCode} />
                <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: 8 }}>
                  {basicCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </section>

          {/* 多数据系列 */}
          <section id="multi-series" className={styles.section}>
            <h2 className={styles.sectionTitle}>多数据系列</h2>
            <p className={styles.sectionDescription}>
              支持在左右两侧配置多个数据系列，左侧可配置多个柱状图或折线图，右侧可配置多条折线。
            </p>

            <div className={styles.demoCard}>
              <div className={styles.demoTitle}>线上/线下销售与利润率对比</div>
              <div className={styles.chartWrapper}>
                <DualAxes data={compareData} width={700} height={400} />
              </div>
              <div className={styles.codeBlock}>
                <CopyButton text={multiSeriesCode} />
                <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: 8 }}>
                  {multiSeriesCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </section>

          {/* 产量与合格率 */}
          <section id="production" className={styles.section}>
            <h2 className={styles.sectionTitle}>产量与合格率</h2>
            <p className={styles.sectionDescription}>
              展示每日产量（绝对值）与合格率（百分比）的关系，直观呈现生产质量趋势。
            </p>

            <div className={styles.demoCard}>
              <div className={styles.demoTitle}>每日生产数据</div>
              <div className={styles.chartWrapper}>
                <DualAxes
                  data={productionData}
                  leftYAxis={{ title: { text: '产量(件)' }, min: 0 }}
                  rightYAxis={{
                    title: { text: '合格率(%)' },
                    min: 80,
                    max: 100,
                    tickFormatter: (v) => `${v}%`,
                  }}
                  width={700}
                  height={400}
                />
              </div>
            </div>
          </section>

          {/* 平滑曲线 */}
          <section id="smooth" className={styles.section}>
            <h2 className={styles.sectionTitle}>平滑曲线</h2>
            <p className={styles.sectionDescription}>
              通过设置 smooth 属性，将折线显示为平滑曲线，使数据趋势更加柔和。
            </p>

            <div className={styles.demoCard}>
              <div className={styles.demoTitle}>访问量与转化率趋势</div>
              <div className={styles.chartWrapper}>
                <DualAxes
                  data={smoothData}
                  smooth={true}
                  verticalLine={{ enabled: true, color: '#999', dash: [5, 5] }}
                  width={700}
                  height={400}
                />
              </div>
              <div className={styles.codeBlock}>
                <CopyButton text={smoothCode} />
                <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: 8 }}>
                  {smoothCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </section>

          {/* 左侧折线图 */}
          <section id="left-line" className={styles.section}>
            <h2 className={styles.sectionTitle}>左侧折线图</h2>
            <p className={styles.sectionDescription}>
              左侧 Y 轴也可以配置为折线图类型，适合两个指标都适合用折线展示的场景。
            </p>

            <div className={styles.demoCard}>
              <div className={styles.demoTitle}>新增用户与活跃率</div>
              <div className={styles.chartWrapper}>
                <DualAxes
                  data={leftLineData}
                  smooth={true}
                  width={700}
                  height={400}
                />
              </div>
            </div>
          </section>

          {/* 竖线模式 */}
          <section id="vertical-line" className={styles.section}>
            <h2 className={styles.sectionTitle}>竖线模式</h2>
            <p className={styles.sectionDescription}>
              启用竖线模式后，鼠标移入图表时会在对应位置显示竖线，并展示所有数据系列在该位置的值。
            </p>

            <div className={styles.demoCard}>
              <div className={styles.demoTitle}>竖线交互效果</div>
              <div className={styles.chartWrapper}>
                <DualAxes
                  data={multiSeriesData}
                  verticalLine={{ enabled: true, color: '#999', lineWidth: 1, dash: [5, 5] }}
                  width={700}
                  height={400}
                />
              </div>
              <div className={styles.codeBlock}>
                <CopyButton text={verticalLineCode} />
                <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: 8 }}>
                  {verticalLineCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </section>

          {/* 组件特性 */}
          <section id="features" className={styles.section}>
            <h2 className={styles.sectionTitle}>组件特性</h2>
            <div className={styles.features}>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>🎨 双轴设计</div>
                <div className={styles.featureDesc}>
                  左右两个独立的 Y 轴，支持不同量级和单位的数据展示，避免数据被淹没。
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>📊 多图表类型</div>
                <div className={styles.featureDesc}>
                  左侧支持柱状图和折线图，右侧默认折线图，满足多种数据展示需求。
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>📈 平滑曲线</div>
                <div className={styles.featureDesc}>
                  支持 smooth 属性启用平滑曲线，使数据趋势展示更加柔和自然。
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>🖱️ 交互丰富</div>
                <div className={styles.featureDesc}>
                  支持竖线模式、提示框、图例点击隐藏等交互功能，提升用户体验。
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>✨ 动画效果</div>
                <div className={styles.featureDesc}>
                  内置入场动画效果，支持自定义动画时长，增强视觉表现力。
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>🔧 高度可配置</div>
                <div className={styles.featureDesc}>
                  支持坐标轴、网格线、图例、提示框等全方位配置，灵活适配各种场景。
                </div>
              </div>
            </div>
          </section>

          {/* API 文档 */}
          <section id="api" className={styles.section}>
            <h2 className={styles.sectionTitle}>API 文档</h2>

            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', marginTop: '24px' }}>
              DualAxes Props
            </h3>
            <Table columns={propsColumns} dataSource={propsData} pagination={false} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', marginTop: '24px' }}>
              LeftDataset 配置
            </h3>
            <Table columns={datasetColumns} dataSource={leftDatasetData} pagination={false} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', marginTop: '24px' }}>
              RightDataset 配置
            </h3>
            <Table columns={datasetColumns} dataSource={rightDatasetData} pagination={false} />
          </section>
        </div>

        {/* 锚点导航 */}
        <div className={styles.navigation}>
          <div>
            {scrollContainer && (
              <Anchor
                getContainer={() => scrollContainer}
                offsetTop={20}
                affix={false}
                bounds={30}
              >
                <Anchor.Link href="#basic" title="基础用法" />
                <Anchor.Link href="#multi-series" title="多数据系列" />
                <Anchor.Link href="#production" title="产量合格率" />
                <Anchor.Link href="#smooth" title="平滑曲线" />
                <Anchor.Link href="#left-line" title="左侧折线" />
                <Anchor.Link href="#vertical-line" title="竖线模式" />
                <Anchor.Link href="#features" title="组件特性" />
                <Anchor.Link href="#api" title="API 文档" />
              </Anchor>
            )}
          </div>
        </div>
      </Flex>
    </div>
  );
}
