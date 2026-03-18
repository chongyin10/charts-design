'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Stock } from '@/components/Stock';
import type { StockChartData, StockDataPoint } from '@/components/Stock';
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
 * 生成模拟股票数据
 * @param days 天数
 * @param startPrice 起始价格
 */
const generateMockData = (days: number, startPrice: number = 100): StockDataPoint[] => {
    const data: StockDataPoint[] = [];
    let currentPrice = startPrice;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = days; i >= 0; i--) {
        // 随机波动
        const volatility = 0.02; // 2% 波动率
        const change = (Math.random() - 0.5) * 2 * volatility;

        const open = currentPrice;
        const close = currentPrice * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.floor(Math.random() * 10000000) + 1000000;

        const changePercent = ((close - open) / open) * 100;

        data.push({
            timestamp: now - i * oneDay,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume,
            change: parseFloat(changePercent.toFixed(2)),
        });

        currentPrice = close;
    }

    return data;
};

/**
 * 股票图示例页面
 */
export default function StockChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础示例数据
    const basicData = useMemo<StockChartData>(() => ({
        name: '示例股票',
        code: '600000',
        data: generateMockData(180, 50),
    }), []);

    // 自定义配色示例数据
    const customColorData = useMemo<StockChartData>(() => ({
        name: '科技股',
        code: '000001',
        data: generateMockData(90, 200),
    }), []);

    // 无成交量示例数据
    const noVolumeData = useMemo<StockChartData>(() => ({
        name: '指数',
        code: 'INDEX',
        data: generateMockData(60, 3000),
    }), []);

    // 自定义移动平均线示例数据
    const maCustomData = useMemo<StockChartData>(() => ({
        name: '成长股',
        code: '888888',
        data: generateMockData(120, 80),
    }), []);

    // 响应式示例数据
    const responsiveData = useMemo<StockChartData>(() => ({
        name: '小型股',
        code: '300001',
        data: generateMockData(90, 20),
    }), []);

    // API 表格列定义
    const propColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    // StockProps API 数据
    const stockPropsAPI = [
        { prop: 'data', desc: '股票数据', type: 'StockChartData', default: 'required' },
        { prop: 'width', desc: '图表宽度', type: 'number', default: '800' },
        { prop: 'height', desc: '图表高度', type: 'number', default: '500' },
        { prop: 'config', desc: '图表配置项', type: 'StockConfig', default: '-' },
    ];

    // StockDataPoint API 数据
    const dataPointColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '必填', dataIndex: 'required', key: 'required', width: 100 },
    ];

    const stockDataPointAPI = [
        { prop: 'timestamp', desc: '时间戳（毫秒）', type: 'number', required: '是' },
        { prop: 'open', desc: '开盘价', type: 'number', required: '是' },
        { prop: 'high', desc: '最高价', type: 'number', required: '是' },
        { prop: 'low', desc: '最低价', type: 'number', required: '是' },
        { prop: 'close', desc: '收盘价', type: 'number', required: '是' },
        { prop: 'volume', desc: '成交量', type: 'number', required: '否' },
        { prop: 'change', desc: '涨跌幅', type: 'number', required: '否' },
    ];

    // StockConfig API 数据
    const configColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const stockConfigAPI = [
        { prop: 'candlestick', desc: 'K线配置', type: 'CandlestickConfig', default: '-' },
        { prop: 'movingAverage', desc: '移动平均线配置', type: 'MovingAverageConfig', default: '-' },
        { prop: 'volume', desc: '成交量配置', type: 'VolumeConfig', default: '-' },
        { prop: 'grid', desc: '网格线配置', type: 'GridConfig', default: '-' },
        { prop: 'tooltip', desc: '提示框配置', type: 'TooltipConfig', default: '-' },
        { prop: 'timeRange', desc: '时间范围配置', type: 'TimeRangeConfig', default: '-' },
    ];

    // 类型定义表格列
    const typeColumns: Column[] = [
        { title: '类型名称', dataIndex: 'name', key: 'name', width: 200 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
    ];

    // 类型定义数据
    const typeDefinitionsAPI = [
        { name: 'StockDataPoint', desc: '股票数据点，包含开盘、最高、最低、收盘价格等信息' },
        { name: 'StockChartData', desc: '图表数据，包含股票名称、代码和数据点数组' },
        { name: 'StockConfig', desc: '图表配置对象，包含K线、MA线、成交量等配置' },
        { name: 'CandlestickConfig', desc: 'K线（蜡烛图）样式配置' },
        { name: 'MovingAverageConfig', desc: '移动平均线配置，包括周期、颜色、线宽等' },
        { name: 'VolumeConfig', desc: '成交量区域配置' },
        { name: 'GridConfig', desc: '网格线样式配置' },
        { name: 'TooltipConfig', desc: '提示框样式配置' },
        { name: 'TimeRangeConfig', desc: '时间范围配置' },
    ];

    // CandlestickConfig API
    const candlestickColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const candlestickConfigAPI = [
        { prop: 'upColor', desc: '上涨颜色', type: 'string', default: "'#ef4444'" },
        { prop: 'downColor', desc: '下跌颜色', type: 'string', default: "'#22c55e'" },
        { prop: 'wickColor', desc: '影线颜色', type: 'string', default: "'#6b7280'" },
        { prop: 'wickWidth', desc: '影线宽度', type: 'number', default: '1' },
    ];

    // MovingAverageConfig API
    const maColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const maConfigAPI = [
        { prop: 'visible', desc: '是否显示MA线', type: 'boolean', default: 'true' },
        { prop: 'periods', desc: 'MA周期数组', type: 'number[]', default: '[5, 10, 20, 60]' },
        { prop: 'colors', desc: 'MA线颜色数组', type: 'string[]', default: '["#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"]' },
        { prop: 'lineWidth', desc: 'MA线宽度', type: 'number', default: '1.5' },
    ];

    // VolumeConfig API
    const volumeColumns: Column[] = [
        { title: '属性', dataIndex: 'prop', key: 'prop', width: 180 },
        { title: '说明', dataIndex: 'desc', key: 'desc' },
        { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
        { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
    ];

    const volumeConfigAPI = [
        { prop: 'visible', desc: '是否显示成交量', type: 'boolean', default: 'true' },
        { prop: 'heightRatio', desc: '成交量区域高度占比', type: 'number', default: '0.25' },
        { prop: 'upColor', desc: '上涨时颜色', type: 'string', default: "'#ef4444'" },
        { prop: 'downColor', desc: '下跌时颜色', type: 'string', default: "'#22c55e'" },
        { prop: 'barWidth', desc: '柱子宽度', type: 'number', default: '0.8' },
    ];

    // 代码示例
    const basicCode = `import { Stock } from '@/components/Stock';

// 准备数据
const data = {
  name: '示例股票',
  code: '600000',
  data: [
    { timestamp: 1704067200000, open: 100, high: 105, low: 98, close: 102, volume: 1000000 },
    // ...更多数据
  ],
};

// 基础用法
<Stock data={data} width={800} height={500} />`;

    const customColorCode = `import { Stock } from '@/components/Stock';

<Stock
  data={data}
  width={800}
  height={500}
  config={{
    candlestick: {
      upColor: '#22c55e',      // 美股绿涨
      downColor: '#ef4444',    // 美股红跌
    },
    volume: {
      upColor: '#22c55e',
      downColor: '#ef4444',
    },
    grid: {
      lineColor: '#e5e7eb',
    },
  }}
/>`;

    const noVolumeCode = `import { Stock } from '@/components/Stock';

<Stock
  data={data}
  width={800}
  height={400}
  config={{
    volume: {
      visible: false,  // 隐藏成交量
    },
  }}
/>`;

    const maCustomCode = `import { Stock } from '@/components/Stock';

<Stock
  data={data}
  width={800}
  height={500}
  config={{
    movingAverage: {
      visible: true,
      periods: [10, 30, 60],                    // 自定义MA周期
      colors: ['#f59e0b', '#8b5cf6', '#ec4899'], // 自定义颜色
      lineWidth: 2,
    },
  }}
/>`;

    const responsiveCode = `import { Stock } from '@/components/Stock';

// 适应容器宽度
<div style={{ maxWidth: 632 }}>
  <Stock
    data={data}
    width={600}
    height={400}
  />
</div>`;

    return (
        <div className={styles.examplePage}>
            <Flex gap={24} align="flex-start">
                {/* 左侧主内容 */}
                <div className={styles.mainContent}>
                    {/* 组件介绍 */}
                    <div className={styles.exampleSection} id="stock-intro">
                        <h1 className={styles.sectionTitle}>股票图 Stock</h1>
                        <p className={styles.sectionText}>
                            股票图是用于展示金融市场中证券价格走势及相关交易数据的专业图表组件。
                            支持K线（蜡烛图）展示开盘、最高、最低、收盘价格，配合成交量柱状图和移动平均线，
                            帮助用户分析价格趋势和市场情绪。适用于股票分析、数字货币行情、金融数据可视化等场景。
                            支持十字光标、缩放平移、时间范围切换等交互功能。
                        </p>
                    </div>

                    {/* 基础股票图 */}
                    <div className={styles.exampleSection} id="stock-basic">
                        <h2 className={styles.subsectionTitle}>基础股票图</h2>
                        <p className={styles.sectionText}>展示基本的K线、成交量和移动平均线，包含默认的5日、10日、20日、60日均线。</p>
                        <div className={styles.exampleDemo}>
                            <Stock data={basicData} width={800} height={500} />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={basicCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {basicCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义配色 */}
                    <div className={styles.exampleSection} id="stock-color">
                        <h2 className={styles.subsectionTitle}>自定义配色</h2>
                        <p className={styles.sectionText}>使用美股配色（绿涨红跌），自定义K线和成交量的颜色。</p>
                        <div className={styles.exampleDemo}>
                            <Stock
                                data={customColorData}
                                width={800}
                                height={500}
                                config={{
                                    candlestick: {
                                        upColor: '#22c55e',
                                        downColor: '#ef4444',
                                    },
                                    volume: {
                                        upColor: '#22c55e',
                                        downColor: '#ef4444',
                                    },
                                    grid: {
                                        lineColor: '#e5e7eb',
                                    },
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={customColorCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {customColorCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 隐藏成交量 */}
                    <div className={styles.exampleSection} id="stock-novolume">
                        <h2 className={styles.subsectionTitle}>隐藏成交量</h2>
                        <p className={styles.sectionText}>仅显示K线和移动平均线，适用于不需要展示成交量的场景。</p>
                        <div className={styles.exampleDemo}>
                            <Stock
                                data={noVolumeData}
                                width={800}
                                height={400}
                                config={{
                                    volume: {
                                        visible: false,
                                    },
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={noVolumeCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {noVolumeCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 自定义移动平均线 */}
                    <div className={styles.exampleSection} id="stock-ma">
                        <h2 className={styles.subsectionTitle}>自定义移动平均线</h2>
                        <p className={styles.sectionText}>使用不同的MA周期和颜色，例如短期交易常用的10日、30日、60日均线。</p>
                        <div className={styles.exampleDemo}>
                            <Stock
                                data={maCustomData}
                                width={800}
                                height={500}
                                config={{
                                    movingAverage: {
                                        visible: true,
                                        periods: [10, 30, 60],
                                        colors: ['#f59e0b', '#8b5cf6', '#ec4899'],
                                        lineWidth: 2,
                                    },
                                }}
                            />
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={maCustomCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {maCustomCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 响应式布局 */}
                    <div className={styles.exampleSection} id="stock-responsive">
                        <h2 className={styles.subsectionTitle}>响应式布局</h2>
                        <p className={styles.sectionText}>适应容器宽度的股票图，在不同屏幕尺寸下保持良好的显示效果。</p>
                        <div className={styles.exampleDemo}>
                            <div style={{ maxWidth: 632 }}>
                                <Stock data={responsiveData} width={600} height={400} />
                            </div>
                        </div>
                        <div className={styles.codeHeader}>
                            <span>示例代码</span>
                            <CopyButton text={responsiveCode} />
                        </div>
                        <SyntaxHighlighter language="tsx" style={vscDarkPlus}>
                            {responsiveCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* 组件特性 */}
                    <div className={styles.exampleSection} id="stock-features">
                        <h2 className={styles.subsectionTitle}>组件特性</h2>
                        <div className={styles.features}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>📈 K线（蜡烛图）</div>
                                <div className={styles.featureDesc}>展示开盘、最高、最低、收盘价格，支持自定义涨跌颜色。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>📊 成交量</div>
                                <div className={styles.featureDesc}>底部显示成交量柱状图，与K线同色系，可配置显示/隐藏。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>📉 移动平均线</div>
                                <div className={styles.featureDesc}>支持多条MA线，可自定义周期、颜色和线宽。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🎯 十字光标</div>
                                <div className={styles.featureDesc}>鼠标悬停显示十字光标，实时显示价格和日期。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>🔍 缩放和平移</div>
                                <div className={styles.featureDesc}>支持鼠标滚轮缩放，拖拽平移查看历史数据。</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureTitle}>⏱️ 时间范围</div>
                                <div className={styles.featureDesc}>支持日K、周K、月K、季K、年K等多种时间范围切换。</div>
                            </div>
                        </div>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="stock-api">
                        <h2 className={styles.subsectionTitle}>API 参考</h2>
                        <p className={styles.sectionText}>Stock 组件的属性列表。</p>
                        <div className={styles.apiTable}>
                            <Table columns={propColumns} dataSource={stockPropsAPI} />
                        </div>
                    </div>

                    {/* StockDataPoint 数据结构 */}
                    <div className={styles.exampleSection} id="stock-datapoint">
                        <h2 className={styles.subsectionTitle}>数据点结构</h2>
                        <p className={styles.sectionText}>StockDataPoint 是股票数据的基本单位。</p>
                        <div className={styles.apiTable}>
                            <Table columns={dataPointColumns} dataSource={stockDataPointAPI} />
                        </div>
                    </div>

                    {/* StockConfig 配置 */}
                    <div className={styles.exampleSection} id="stock-config">
                        <h2 className={styles.subsectionTitle}>配置项说明</h2>
                        <p className={styles.sectionText}>StockConfig 包含图表的各种配置项。</p>
                        <div className={styles.apiTable}>
                            <Table columns={configColumns} dataSource={stockConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>CandlestickConfig</h3>
                        <p className={styles.sectionText}>K线（蜡烛图）样式配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={candlestickColumns} dataSource={candlestickConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>MovingAverageConfig</h3>
                        <p className={styles.sectionText}>移动平均线配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={maColumns} dataSource={maConfigAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>VolumeConfig</h3>
                        <p className={styles.sectionText}>成交量区域配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={volumeColumns} dataSource={volumeConfigAPI} />
                        </div>
                    </div>

                    {/* 类型定义 */}
                    <div className={styles.exampleSection} id="stock-types">
                        <h2 className={styles.subsectionTitle}>类型定义</h2>
                        <p className={styles.sectionText}>Stock 组件使用的 TypeScript 类型定义概览。</p>
                        <div className={styles.apiTable}>
                            <Table columns={typeColumns} dataSource={typeDefinitionsAPI} />
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>StockChartData 结构</h3>
                        <div className={styles.codeBlock}>
{`interface StockChartData {
  name?: string;        // 股票名称
  code?: string;        // 股票代码
  data: StockDataPoint[];
}`}
                        </div>

                        <h3 className={styles.typeSubsectionTitle}>StockDataPoint 结构</h3>
                        <div className={styles.codeBlock}>
{`interface StockDataPoint {
  timestamp: number;    // 时间戳（毫秒）
  open: number;         // 开盘价
  high: number;         // 最高价
  low: number;          // 最低价
  close: number;        // 收盘价
  volume?: number;      // 成交量（可选）
  change?: number;      // 涨跌幅（可选）
}`}
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
                                <Anchor.Link href="#stock-intro" title="组件介绍" />
                                <Anchor.Link href="#stock-basic" title="基础股票图" />
                                <Anchor.Link href="#stock-color" title="自定义配色" />
                                <Anchor.Link href="#stock-novolume" title="隐藏成交量" />
                                <Anchor.Link href="#stock-ma" title="自定义MA线" />
                                <Anchor.Link href="#stock-responsive" title="响应式布局" />
                                <Anchor.Link href="#stock-features" title="组件特性" />
                                <Anchor.Link href="#stock-api" title="API 参考" />
                                <Anchor.Link href="#stock-datapoint" title="数据结构" />
                                <Anchor.Link href="#stock-config" title="配置项" />
                                <Anchor.Link href="#stock-types" title="类型定义" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
