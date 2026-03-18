/**
 * 股票图示例页面
 * 展示 Stock 组件的各种用法和配置
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Stock } from '@/components/Stock';
import type { StockChartData, StockDataPoint, TimeRange } from '@/components/Stock';
import styles from './page.module.css';

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
 * 基础示例
 */
const BasicExample: React.FC = () => {
  const data = useMemo<StockChartData>(() => ({
    name: '示例股票',
    code: '600000',
    data: generateMockData(180, 50),
  }), []);

  return (
    <div className={styles.example}>
      <h3 className={styles.exampleTitle}>基础股票图</h3>
      <p className={styles.exampleDesc}>展示基本的K线、成交量和移动平均线</p>
      <div className={styles.chartWrapper}>
        <Stock
          data={data}
          width={800}
          height={500}
        />
      </div>
    </div>
  );
};

/**
 * 自定义配色示例
 */
const CustomColorExample: React.FC = () => {
  const data = useMemo<StockChartData>(() => ({
    name: '科技股',
    code: '000001',
    data: generateMockData(90, 200),
  }), []);

  return (
    <div className={styles.example}>
      <h3 className={styles.exampleTitle}>自定义配色</h3>
      <p className={styles.exampleDesc}>使用美股配色（绿涨红跌）</p>
      <div className={styles.chartWrapper}>
        <Stock
          data={data}
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
    </div>
  );
};

/**
 * 无成交量示例
 */
const NoVolumeExample: React.FC = () => {
  const data = useMemo<StockChartData>(() => ({
    name: '指数',
    code: 'INDEX',
    data: generateMockData(60, 3000),
  }), []);

  return (
    <div className={styles.example}>
      <h3 className={styles.exampleTitle}>隐藏成交量</h3>
      <p className={styles.exampleDesc}>仅显示K线和移动平均线</p>
      <div className={styles.chartWrapper}>
        <Stock
          data={data}
          width={800}
          height={400}
          config={{
            volume: {
              visible: false,
            },
          }}
        />
      </div>
    </div>
  );
};

/**
 * 自定义移动平均线示例
 */
const MACustomExample: React.FC = () => {
  const data = useMemo<StockChartData>(() => ({
    name: '成长股',
    code: '888888',
    data: generateMockData(120, 80),
  }), []);

  return (
    <div className={styles.example}>
      <h3 className={styles.exampleTitle}>自定义移动平均线</h3>
      <p className={styles.exampleDesc}>使用不同的MA周期和颜色</p>
      <div className={styles.chartWrapper}>
        <Stock
          data={data}
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
    </div>
  );
};

/**
 * 响应式示例
 */
const ResponsiveExample: React.FC = () => {
  const data = useMemo<StockChartData>(() => ({
    name: '小型股',
    code: '300001',
    data: generateMockData(90, 20),
  }), []);

  return (
    <div className={styles.example}>
      <h3 className={styles.exampleTitle}>响应式布局</h3>
      <p className={styles.exampleDesc}>适应容器宽度的股票图</p>
      <div className={styles.responsiveWrapper}>
        <Stock
          data={data}
          width={600}
          height={400}
        />
      </div>
    </div>
  );
};

/**
 * 主页面
 */
export default function StockPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>股票图组件</h1>
        <p className={styles.subtitle}>
          用于展示金融市场中证券价格走势及相关交易数据的专业图表组件
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>示例展示</h2>
        
        <BasicExample />
        <CustomColorExample />
        <NoVolumeExample />
        <MACustomExample />
        <ResponsiveExample />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>功能特性</h2>
        <div className={styles.features}>
          <div className={styles.feature}>
            <h4>📈 K线（蜡烛图）</h4>
            <p>展示开盘、最高、最低、收盘价格，支持自定义涨跌颜色</p>
          </div>
          <div className={styles.feature}>
            <h4>📊 成交量</h4>
            <p>底部显示成交量柱状图，与K线同色系</p>
          </div>
          <div className={styles.feature}>
            <h4>📉 移动平均线</h4>
            <p>支持多条MA线，可自定义周期、颜色和线宽</p>
          </div>
          <div className={styles.feature}>
            <h4>🎯 十字光标</h4>
            <p>鼠标悬停显示十字光标，实时显示价格和日期</p>
          </div>
          <div className={styles.feature}>
            <h4>🔍 缩放和平移</h4>
            <p>支持鼠标滚轮缩放，拖拽平移查看历史数据</p>
          </div>
          <div className={styles.feature}>
            <h4>⏱️ 时间范围</h4>
            <p>支持日K、周K、月K、季K、年K等多种时间范围切换</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>数据结构</h2>
        <pre className={styles.codeBlock}>
{`interface StockDataPoint {
  timestamp: number;    // 时间戳（毫秒）
  open: number;         // 开盘价
  high: number;         // 最高价
  low: number;          // 最低价
  close: number;        // 收盘价
  volume?: number;      // 成交量（可选）
  change?: number;      // 涨跌幅（可选）
}

interface StockChartData {
  name?: string;        // 股票名称
  code?: string;        // 股票代码
  data: StockDataPoint[];
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>基础用法</h2>
        <pre className={styles.codeBlock}>
{`import { Stock } from '@/components/Stock';

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
<Stock data={data} width={800} height={500} />

// 自定义配置
<Stock
  data={data}
  width={800}
  height={500}
  config={{
    candlestick: {
      upColor: '#22c55e',      // 上涨颜色
      downColor: '#ef4444',    // 下跌颜色
    },
    movingAverage: {
      visible: true,
      periods: [5, 10, 20, 60], // MA周期
    },
    volume: {
      visible: true,            // 显示成交量
      heightRatio: 0.25,       // 成交量区域高度占比
    },
  }}
/>`}
        </pre>
      </section>
    </div>
  );
}
