'use client';

import React from 'react';
import { Area } from '@/components/Area';
import { AreaChartData } from '@/components/Area/Area.type';
import styles from './page.module.css';

// 导入双Y轴数据
import dualAxisData from './Json/dual-axis-data.json';

/**
 * 双Y轴面积图示例
 * 展示沪深300指数与总市值/GDP的对比关系
 * 支持十字光标和双Y轴显示
 */
const DualAxisDemo: React.FC = () => {
    // 主图表数据
    const mainData: AreaChartData = {
        labels: dualAxisData.labels,
        datasets: [
            {
                label: '沪深300',
                data: dualAxisData.datasets[0].data,
                fillColor: '#3b82f6',
                fillOpacity: 0.3,
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
            {
                label: '总市值/GDP',
                data: dualAxisData.datasets[1].data,
                fillColor: '#ef4444',
                fillOpacity: 0.1,
                borderColor: '#ef4444',
                borderWidth: 2,
            },
        ],
    };

    // 百分位图数据
    const percentileData: AreaChartData = {
        labels: dualAxisData.labels,
        datasets: [
            {
                label: '历史分位数',
                data: dualAxisData.percentile.data,
                fillColor: '#10b981',
                fillOpacity: 0.3,
                borderColor: '#10b981',
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className={styles.dualAxisDemo}>
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>沪深300 vs 总市值/GDP</h3>
                <Area
                    data={mainData}
                    width={1200}
                    height={500}
                    padding={60}
                    smooth={true}
                    xAxis={{
                        tickColor: '#6b7280',
                        tickFontSize: 11,
                        tickInterval: 8,
                        grid: {
                            display: true,
                            vertical: false,
                            horizontal: true,
                            color: '#e5e7eb',
                        },
                    }}
                    yAxis={{
                        title: { text: '沪深300', color: '#3b82f6' },
                        tickColor: '#3b82f6',
                        tickFontSize: 11,
                        min: 0,
                        max: 6000,
                        tickFormatter: (value) => value.toFixed(0),
                        grid: {
                            display: true,
                            vertical: false,
                            horizontal: true,
                            color: '#e5e7eb',
                        },
                    }}
                    yAxisRight={{
                        title: { text: '总市值/GDP', color: '#ef4444' },
                        tickColor: '#ef4444',
                        tickFontSize: 11,
                        min: 0,
                        max: 2.2,
                        tickFormatter: (value) => value.toFixed(1),
                    }}
                    legend={{
                        display: true,
                        position: 'top',
                    }}
                    tooltip={{
                        enabled: true,
                    }}
                    crosshair={{
                        enabled: true,
                        horizontalColor: '#9ca3af',
                        verticalColor: '#9ca3af',
                        lineType: 'dashed',
                        showYLabel: true,
                        showXLabel: true,
                        yLabelBackground: '#374151',
                        yLabelColor: '#ffffff',
                        xLabelBackground: '#374151',
                        xLabelColor: '#ffffff',
                    }}
                    animationDuration={1000}
                />
            </div>

            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>历史分位数</h3>
                <Area
                    data={percentileData}
                    width={1200}
                    height={200}
                    padding={40}
                    smooth={true}
                    xAxis={{
                        tickColor: '#6b7280',
                        tickFontSize: 11,
                        tickInterval: 8,
                        grid: {
                            display: true,
                            vertical: false,
                            horizontal: true,
                            color: '#e5e7eb',
                        },
                    }}
                    yAxis={{
                        title: { text: '百分位', color: '#6b7280' },
                        tickColor: '#6b7280',
                        tickFontSize: 11,
                        min: 0,
                        max: 1,
                        tickFormatter: (value) => `${(value * 100).toFixed(0)}%`,
                        grid: {
                            display: true,
                            vertical: false,
                            horizontal: true,
                            color: '#e5e7eb',
                        },
                    }}
                    legend={{
                        display: false,
                    }}
                    tooltip={{
                        enabled: true,
                    }}
                    crosshair={{
                        enabled: true,
                        horizontalColor: '#9ca3af',
                        verticalColor: '#9ca3af',
                        lineType: 'dashed',
                        showYLabel: true,
                        showXLabel: true,
                        yLabelBackground: '#374151',
                        yLabelColor: '#ffffff',
                        xLabelBackground: '#374151',
                        xLabelColor: '#ffffff',
                    }}
                    animationDuration={1000}
                />
            </div>

            <div className={styles.description}>
                <h4>功能说明</h4>
                <ul>
                    <li><strong>双Y轴：</strong>左侧显示沪深300指数，右侧显示总市值/GDP比值</li>
                    <li><strong>十字光标：</strong>鼠标悬停时显示十字虚线，并显示对应位置的XY轴标签</li>
                    <li><strong>百分位图：</strong>底部显示历史分位数变化</li>
                    <li><strong>平滑曲线：</strong>数据点之间使用平滑曲线连接</li>
                </ul>
            </div>
        </div>
    );
};

export default DualAxisDemo;
