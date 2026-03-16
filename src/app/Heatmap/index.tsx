'use client';

import React, { useState, useEffect } from 'react';
import { Heatmap } from '@/components/Heatmap';
import { HeatmapChartData } from '@/components/Heatmap/Heatmap.type';
import { Flex, Table, Anchor } from '@zjpcy/simple-design';
import type { Column } from '@zjpcy/simple-design';
import { Prism } from 'react-syntax-highlighter';

// 修复 react-syntax-highlighter 与 React 18 的类型不兼容问题
const SyntaxHighlighter = Prism as any;
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './page.module.css';

// 导入密度热力图数据
import densityDataJson from './Json/heatmap.json';

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
 * 热力图示例页面
 */
export default function HeatmapChartPage() {
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // 获取滚动容器
        const container = document.querySelector('.app-content') as HTMLElement || document.body;
        setScrollContainer(container);
    }, []);

    // 基础热力图数据 - 网站流量分析（小时 × 星期）
    const basicData: HeatmapChartData = {
        xLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        yLabels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
            {
                label: '访问量',
                data: [
                    [120, 80, 90, 110, 150, 300, 350],
                    [50, 40, 45, 55, 80, 180, 220],
                    [200, 350, 400, 380, 420, 250, 280],
                    [450, 520, 580, 600, 650, 480, 420],
                    [380, 420, 460, 480, 520, 380, 350],
                    [280, 320, 380, 420, 450, 520, 480],
                ],
            },
        ],
    };

    // 相关性分析数据 - 变量相关性矩阵
    const correlationData: HeatmapChartData = {
        xLabels: ['销售额', '广告投入', '客户满意度', '复购率', '客单价', '转化率'],
        yLabels: ['销售额', '广告投入', '客户满意度', '复购率', '客单价', '转化率'],
        datasets: [
            {
                label: '相关系数',
                data: [
                    [1.00, 0.85, 0.72, 0.68, 0.55, 0.78],
                    [0.85, 1.00, 0.45, 0.38, 0.42, 0.65],
                    [0.72, 0.45, 1.00, 0.82, 0.35, 0.58],
                    [0.68, 0.38, 0.82, 1.00, 0.48, 0.52],
                    [0.55, 0.42, 0.35, 0.48, 1.00, 0.40],
                    [0.78, 0.65, 0.58, 0.52, 0.40, 1.00],
                ],
            },
        ],
    };

    // 包含负值的数据 - 温度异常分析
    const divergingData: HeatmapChartData = {
        xLabels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        yLabels: ['北京', '上海', '广州', '成都', '哈尔滨'],
        datasets: [
            {
                label: '温度异常(°C)',
                data: [
                    [-2.5, -1.8, 1.2, 3.5, 5.0, 4.2, 2.8, 1.5, -0.5, -2.0, -3.2, -2.8],
                    [1.2, 1.5, 2.8, 3.2, 4.0, 3.5, 2.2, 1.8, 0.8, 0.2, -0.5, 0.8],
                    [2.5, 3.2, 4.5, 5.0, 6.2, 5.8, 4.5, 3.8, 2.5, 1.8, 1.2, 2.0],
                    [0.8, 1.2, 2.5, 3.8, 4.5, 4.0, 3.2, 2.5, 1.2, 0.5, -0.2, 0.5],
                    [-5.2, -4.5, -2.0, 2.5, 4.2, 3.8, 2.0, 0.5, -1.5, -3.0, -4.5, -5.0],
                ],
            },
        ],
    };

    // 用户行为分析数据 - 产品功能使用频率
    const behaviorData: HeatmapChartData = {
        xLabels: ['新用户', '普通用户', '活跃用户', '忠实用户', 'VIP用户'],
        yLabels: ['首页', '搜索', '购物车', '支付', '个人中心', '消息', '设置'],
        datasets: [
            {
                label: '使用频率',
                data: [
                    [95, 88, 92, 85, 78],
                    [60, 75, 82, 90, 95],
                    [20, 45, 88, 92, 85],
                    [15, 30, 75, 98, 92],
                    [40, 35, 45, 55, 65],
                    [25, 40, 55, 70, 80],
                    [10, 15, 25, 35, 45],
                ],
            },
        ],
    };

    // 密度热力图数据 - 从 JSON 转换
    const densityHeatmapData: HeatmapChartData = {
        xLabels: [],
        yLabels: [],
        datasets: [],
        densityPoints: (densityDataJson as Array<{ g: number; l: number; tmp: number }>).map(item => ({
            x: item.g,
            y: item.l,
            value: item.tmp,
        })),
        xRange: [0, 1000],
        yRange: [0, 500],
    };

    // 聚类热力图数据 - 基因表达矩阵
    const clusteringData: HeatmapChartData = {
        xLabels: ['t1', 't2', 't3', 't4', 't5', 's1', 's2', 's3', 's4', 's5'],
        yLabels: [
            'ENSG00000109758', 'ENSG00000161944', 'ENSG00000057593', 'ENSG00000160593',
            'ENSG00000204420', 'ENSG00000134538', 'ENSG0000018236', 'ENSG00000159307',
            'ENSG00000101443', 'ENSG00000162881', 'ENSG00000160870', 'ENSG00000134258',
            'ENSG00000163736', 'ENSG00000257017', 'ENSG00000111181', 'ENSG00000100665',
            'ENSG00000172497', 'ENSG00000115718'
        ],
        datasets: [
            {
                label: 'Gene Expression',
                data: [
                    [1.2, 1.1, 1.5, 1.3, 0.8, -0.9, -1.1, -1.3, -0.8, -0.6],
                    [0.9, 0.8, 1.2, 1.0, 0.5, -0.7, -0.9, -1.0, -0.6, -0.4],
                    [1.0, 0.9, 1.3, 1.1, 0.6, -0.8, -1.0, -1.2, -0.7, -0.5],
                    [0.8, 0.7, 1.1, 0.9, 0.4, -0.6, -0.8, -0.9, -0.5, -0.3],
                    [1.1, 1.0, 1.4, 1.2, 0.7, -0.8, -1.0, -1.2, -0.7, -0.5],
                    [-0.5, -0.3, -0.4, -0.6, -0.2, 1.2, 1.4, 1.1, 0.9, 1.0],
                    [-0.4, -0.2, -0.3, -0.5, -0.1, 1.1, 1.3, 1.0, 0.8, 0.9],
                    [-0.6, -0.4, -0.5, -0.7, -0.3, 1.3, 1.5, 1.2, 1.0, 1.1],
                    [0.3, 0.2, 0.4, 0.3, 0.1, -0.3, -0.4, -0.2, -0.1, -0.2],
                    [-0.3, -0.1, -0.2, -0.4, 0.0, 0.8, 1.0, 0.7, 0.5, 0.6],
                    [-0.2, 0.0, -0.1, -0.3, 0.1, 0.9, 1.1, 0.8, 0.6, 0.7],
                    [-0.1, 0.1, 0.0, -0.2, 0.2, 0.6, 0.8, 0.5, 0.3, 0.4],
                    [0.2, 0.3, 0.5, 0.4, 0.2, -0.2, -0.3, -0.1, 0.0, -0.1],
                    [0.1, 0.2, 0.4, 0.3, 0.1, -0.1, -0.2, 0.0, 0.1, 0.0],
                    [0.4, 0.5, 0.7, 0.6, 0.4, 0.0, -0.1, 0.1, 0.2, 0.1],
                    [0.0, 0.1, 0.3, 0.2, 0.0, -0.4, -0.5, -0.3, -0.2, -0.3],
                    [0.3, 0.4, 0.6, 0.5, 0.3, -0.1, -0.2, 0.0, 0.1, 0.0],
                    [0.2, 0.3, 0.5, 0.4, 0.2, -0.3, -0.4, -0.2, -0.1, -0.2],
                ],
            },
        ],
    };

    // 处理单元格点击
    const handleCellClick = (xIndex: number, yIndex: number, value: number) => {
        console.log('点击单元格:', { xIndex, yIndex, value });
        alert(`X索引: ${xIndex}, Y索引: ${yIndex}, 数值: ${value.toFixed(2)}`);
    };

    // 处理密度热力图点击
    const handleDensityClick = (x: number, y: number, density: number) => {
        console.log('点击密度区域:', { x, y, density });
        alert(`坐标: (${x}, ${y}), 密度: ${density.toFixed(2)}`);
    };

    // 基础热力图代码
    const basicCode = `import { Heatmap } from '@zjpcy/charts-design';

const BasicHeatmapExample = () => {
    const data = {
        xLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        yLabels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [{
            label: '访问量',
            data: [
                [120, 80, 90, 110, 150, 300, 350],
                [50, 40, 45, 55, 80, 180, 220],
                [200, 350, 400, 380, 420, 250, 280],
                [450, 520, 580, 600, 650, 480, 420],
                [380, 420, 460, 480, 520, 380, 350],
                [280, 320, 380, 420, 450, 520, 480],
            ],
        }],
    };

    return (
        <Heatmap
            data={data}
            width={600}
            height={350}
            xAxis={{ title: { text: '星期' } }}
            yAxis={{ title: { text: '时段' } }}
            cellLabels={{ display: true, formatter: (v) => v.toString() }}
            colorScale={{
                minColor: '#f0f9ff',
                maxColor: '#0369a1',
            }}
        />
    );
};`;

    // 聚类热力图代码
    const clusteringCode = `import { Heatmap } from '@zjpcy/charts-design';

const ClusteringHeatmapExample = () => {
    const data = {
        xLabels: ['s4', 's3', 's2', 's5', 's1', 't2', 't1', 't5', 't3', 't4'],
        yLabels: ['ENSG00000109758', 'ENSG00000161944', ...],
        datasets: [{
            label: 'Gene Expression',
            data: [
                [1.2, 1.1, 1.5, 1.3, 0.8, -0.9, -1.1, -1.3, -0.8, -0.6],
                [0.9, 0.8, 1.2, 1.0, 0.5, -0.7, -0.9, -1.0, -0.6, -0.4],
                // ... 更多基因表达数据
            ],
        }],
    };

    return (
        <Heatmap
            data={data}
            width={750}
            height={480}
            clusteringMode={true}       // 启用聚类模式
            clusteringConfig={{
                clusterRows: true,        // 对行（基因）聚类
                clusterCols: true,        // 对列（样本）聚类
                distanceMetric: 'euclidean',   // 欧氏距离
                linkageMethod: 'average',      // 平均连接法
                dendrogramWidth: 80,      // 行树状图宽度
                dendrogramHeight: 50,     // 列树状图高度
                showRowLabels: true,      // 显示行标签
                rowLabelFontSize: 10,
                rowLabelPosition: 'right', // 行标签在右侧（与原图一致）
            }}
            yAxis={{ display: false }}   // 隐藏Y轴（使用行标签）
            colorScale={{
                minColor: '#2166ac',      // 蓝色（低表达）
                midColor: '#f7f7f7',      // 白色（中等）
                maxColor: '#b2182b',      // 红色（高表达）
                diverging: true,
            }}
            legend={{
                display: true,
                position: 'right',        // 图例在右侧
                showValues: true
            }}
        />
    );
};`;

    // 相关性矩阵代码
    const correlationCode = `import { Heatmap } from '@zjpcy/charts-design';

const CorrelationHeatmapExample = () => {
    const data = {
        xLabels: ['销售额', '广告投入', '客户满意度', '复购率', '客单价', '转化率'],
        yLabels: ['销售额', '广告投入', '客户满意度', '复购率', '客单价', '转化率'],
        datasets: [{
            label: '相关系数',
            data: [
                [1.00, 0.85, 0.72, 0.68, 0.55, 0.78],
                [0.85, 1.00, 0.45, 0.38, 0.42, 0.65],
                [0.72, 0.45, 1.00, 0.82, 0.35, 0.58],
                [0.68, 0.38, 0.82, 1.00, 0.48, 0.52],
                [0.55, 0.42, 0.35, 0.48, 1.00, 0.40],
                [0.78, 0.65, 0.58, 0.52, 0.40, 1.00],
            ],
        }],
    };

    return (
        <Heatmap
            data={data}
            width={600}
            height={400}
            xAxis={{ 
                title: { text: '指标' },
                tickRotation: 45 
            }}
            yAxis={{ title: { text: '指标' } }}
            cellLabels={{ display: true, formatter: (v) => v.toFixed(2) }}
            colorScale={{
                minColor: '#fee2e2',
                maxColor: '#dc2626',
            }}
            borderRadius={4}
        />
    );
};`;

    // 发散型颜色比例尺代码（负值支持）
    const divergingCode = `import { Heatmap } from '@zjpcy/charts-design';

const DivergingHeatmapExample = () => {
    const data = {
        xLabels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        yLabels: ['北京', '上海', '广州', '成都', '哈尔滨'],
        datasets: [{
            label: '温度异常(°C)',
            data: [
                [-2.5, -1.8, 1.2, 3.5, 5.0, 4.2],
                [1.2, 1.5, 2.8, 3.2, 4.0, 3.5],
                [2.5, 3.2, 4.5, 5.0, 6.2, 5.8],
                [0.8, 1.2, 2.5, 3.8, 4.5, 4.0],
                [-5.2, -4.5, -2.0, 2.5, 4.2, 3.8],
            ],
        }],
    };

    return (
        <Heatmap
            data={data}
            width={600}
            height={350}
            xAxis={{ title: { text: '月份' } }}
            yAxis={{ title: { text: '城市' } }}
            cellLabels={{ display: true, formatter: (v) => (v > 0 ? '+' : '') + v.toFixed(1) }}
            colorScale={{
                minColor: '#dc2626',  // 红色（负值）
                midColor: '#ffffff',  // 白色（零值）
                maxColor: '#2563eb',  // 蓝色（正值）
                diverging: true,
            }}
        />
    );
};`;

    // 用户行为分析代码
    const behaviorCode = `import { Heatmap } from '@zjpcy/charts-design';

const BehaviorHeatmapExample = () => {
    const data = {
        xLabels: ['新用户', '普通用户', '活跃用户', '忠实用户', 'VIP用户'],
        yLabels: ['首页', '搜索', '购物车', '支付', '个人中心', '消息', '设置'],
        datasets: [{
            label: '使用频率',
            data: [
                [95, 88, 92, 85, 78],
                [60, 75, 82, 90, 95],
                [20, 45, 88, 92, 85],
                [15, 30, 75, 98, 92],
                [40, 35, 45, 55, 65],
                [25, 40, 55, 70, 80],
                [10, 15, 25, 35, 45],
            ],
        }],
    };

    const handleCellClick = (xIndex, yIndex, value) => {
        console.log('点击单元格:', { xIndex, yIndex, value });
    };

    return (
        <Heatmap
            data={data}
            width={550}
            height={350}
            xAxis={{ title: { text: '用户类型' } }}
            yAxis={{ title: { text: '功能模块' } }}
            cellLabels={{ display: true, formatter: (v) => \`\${v}%\` }}
            colorScale={{
                minColor: '#fef3c7',
                maxColor: '#d97706',
            }}
            borderRadius={3}
            cellSpacing={2}
            onCellClick={handleCellClick}
        />
    );
};`;

    // 密度热力图代码
    const densityCode = `import { Heatmap } from '@zjpcy/charts-design';
import densityData from './heatmap.json';

const DensityHeatmapExample = () => {
    const data = {
        xLabels: [],
        yLabels: [],
        datasets: [],
        // 密度数据点：包含 x、y 坐标和可选的权重值
        densityPoints: densityData.map(item => ({
            x: item.g,  // X 坐标
            y: item.l,  // Y 坐标
            value: item.tmp,  // 权重值
        })),
        xRange: [0, 1000],  // X 轴范围
        yRange: [0, 500],   // Y 轴范围
    };

    return (
        <Heatmap
            data={data}
            width={600}
            height={400}
            densityMode={true}  // 启用密度热力图模式
            densityConfig={{
                gridSize: 100,     // 网格分辨率（越高越平滑）
                radius: 35,        // 搜索半径
                weighted: true,    // 使用加权密度
                minOpacity: 0,     // 最小透明度
                maxOpacity: 1,     // 最大透明度
            }}
            xAxis={{ title: { text: '经度' } }}
            yAxis={{ title: { text: '纬度' } }}
            colorScale={{
                minColor: '#ffffff',
                maxColor: '#ff0000',
                colorStops: [
                    { offset: 0, color: '#ffffff' },    // 白色 - 无数据
                    { offset: 0.05, color: '#f5f5ff' }, // 极淡蓝
                    { offset: 0.15, color: '#d0d8f0' }, // 淡蓝灰
                    { offset: 0.25, color: '#a0b8e0' }, // 浅蓝紫
                    { offset: 0.35, color: '#40ff60' }, // 亮绿
                    { offset: 0.50, color: '#80ff40' }, // 黄绿
                    { offset: 0.65, color: '#ffff00' }, // 黄色
                    { offset: 0.80, color: '#ff8000' }, // 橙色
                    { offset: 0.90, color: '#ff4000' }, // 红橙
                    { offset: 1, color: '#ff0000' },    // 红色
                ],
            }}
        />
    );
};`;

    // API 表格列定义
    const apiColumns: Column[] = [
        { dataIndex: 'param', title: '参数', width: '120px' },
        { dataIndex: 'description', title: '说明' },
        { dataIndex: 'type', title: '类型' },
        { dataIndex: 'default', title: '默认值', width: '100px' }
    ];

    // API 数据
    const apiData = [
        { param: 'data', description: '图表数据，包含 X/Y 轴标签和数据集', type: 'HeatmapChartData', default: 'required' },
        { param: 'width', description: '图表宽度（像素）', type: 'number', default: '600' },
        { param: 'height', description: '图表高度（像素）', type: 'number', default: '400' },
        { param: 'padding', description: '图表内边距', type: 'number', default: '60' },
        { param: 'colorScale', description: '颜色比例尺配置，支持线性和发散型', type: 'HeatmapColorScaleConfig', default: '-' },
        { param: 'xAxis', description: 'X 轴配置', type: 'HeatmapAxisConfig', default: '-' },
        { param: 'yAxis', description: 'Y 轴配置', type: 'HeatmapAxisConfig', default: '-' },
        { param: 'cellLabels', description: '单元格标签配置', type: 'HeatmapLabelConfig', default: '-' },
        { param: 'borderRadius', description: '单元格圆角半径', type: 'number', default: '2' },
        { param: 'cellSpacing', description: '单元格间距', type: 'number', default: '1' },
        { param: 'animationEnabled', description: '是否开启动画', type: 'boolean', default: 'true' },
        { param: 'onCellClick', description: '单元格点击回调函数', type: '(xIndex, yIndex, value) => void', default: '-' },
        { param: 'densityMode', description: '是否启用密度热力图模式', type: 'boolean', default: 'false' },
        { param: 'densityConfig', description: '密度热力图配置', type: 'DensityConfig', default: '-' },
        { param: 'onDensityClick', description: '密度区域点击回调', type: '(x, y, density) => void', default: '-' },
        { param: 'clusteringMode', description: '是否启用层次聚类热力图模式', type: 'boolean', default: 'false' },
        { param: 'clusteringConfig', description: '聚类配置', type: 'ClusteringConfig', default: '-' },
        { param: 'precomputedClustering', description: '预计算的聚类结果', type: 'HierarchicalClusteringResult', default: '-' },
        { param: 'onClusteringComplete', description: '聚类完成回调', type: '(result) => void', default: '-' },
    ];

    // ColorScale 配置数据
    const colorScaleDataAPI = [
        { param: 'minColor', description: '最小值颜色', type: 'string', default: '"#f0f9ff"' },
        { param: 'maxColor', description: '最大值颜色', type: 'string', default: '"#0369a1"' },
        { param: 'midColor', description: '中间值颜色（发散型）', type: 'string', default: '"#ffffff"' },
        { param: 'diverging', description: '是否使用发散型颜色比例尺', type: 'boolean', default: 'false' },
    ];

    // Axis 配置数据
    const axisDataAPI = [
        { param: 'display', description: '是否显示坐标轴', type: 'boolean', default: 'true' },
        { param: 'title', description: '轴标题配置', type: '{ text: string }', default: '-' },
        { param: 'tickRotation', description: '标签旋转角度', type: 'number', default: '0' },
    ];

    // CellLabels 配置数据
    const cellLabelsDataAPI = [
        { param: 'display', description: '是否显示单元格标签', type: 'boolean', default: 'false' },
        { param: 'formatter', description: '标签格式化函数', type: '(value: number) => string', default: '-' },
    ];

    // DensityConfig 配置数据
    const densityConfigDataAPI = [
        { param: 'gridSize', description: '网格分辨率（每行/列的单元格数量）', type: 'number', default: '20' },
        { param: 'radius', description: '搜索半径，用于计算密度的影响范围', type: 'number', default: '30' },
        { param: 'weighted', description: '是否使用加权密度计算', type: 'boolean', default: 'true' },
        { param: 'minOpacity', description: '最小透明度', type: 'number', default: '0.1' },
        { param: 'maxOpacity', description: '最大透明度', type: 'number', default: '0.9' },
    ];

    return (
        <div className={styles.examplePage}>
            <Flex direction="row" gap="large" align="flex-start">
                {/* 左侧主内容区 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.sectionTitle} id="heatmap-intro">Heatmap 热力图</h2>
                    <p className={styles.sectionText}>
                        热力图（Heatmap）是一种通过颜色强度映射二维数据密度或数值大小的可视化图表，
                        擅长揭示数据分布规律、聚类特征及异常点。
                    </p>

                    {/* 基础热力图 */}
                    <div className={styles.exampleSection} id="heatmap-basic">
                        <h3 className={styles.subsectionTitle}>基础热力图</h3>
                        <p className={styles.sectionText}>展示网站不同时间段和星期的访问量分布，颜色越深表示访问量越高。</p>
                        <div className={styles.exampleDemo}>
                            <Heatmap
                                data={basicData}
                                width={600}
                                height={350}
                                xAxis={{ title: { text: '星期' } }}
                                yAxis={{ title: { text: '时段' } }}
                                cellLabels={{ display: true, formatter: (v) => v.toString() }}
                                colorScale={{
                                    minColor: '#f0f9ff',
                                    maxColor: '#0369a1',
                                }}
                            />
                        </div>
                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span>示例代码</span>
                                <CopyButton text={basicCode} />
                            </div>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {basicCode}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    {/* 相关性分析 */}
                    <div className={styles.exampleSection} id="heatmap-correlation">
                        <h3 className={styles.subsectionTitle}>相关性分析</h3>
                        <p className={styles.sectionText}>使用热力图展示多个变量之间的相关性矩阵，颜色越深表示相关性越强。</p>
                        <div className={styles.exampleDemo}>
                            <Heatmap
                                data={correlationData}
                                width={600}
                                height={400}
                                xAxis={{ 
                                    title: { text: '指标' },
                                    tickRotation: 45 
                                }}
                                yAxis={{ title: { text: '指标' } }}
                                cellLabels={{ display: true, formatter: (v) => v.toFixed(2) }}
                                colorScale={{
                                    minColor: '#fee2e2',
                                    maxColor: '#dc2626',
                                }}
                                borderRadius={4}
                            />
                        </div>
                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span>示例代码</span>
                                <CopyButton text={correlationCode} />
                            </div>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {correlationCode}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    {/* 发散型颜色比例尺 */}
                    <div className={styles.exampleSection} id="heatmap-diverging">
                        <h3 className={styles.subsectionTitle}>发散型颜色比例尺</h3>
                        <p className={styles.sectionText}>当数据包含正负值时，使用发散型颜色比例尺可以直观显示偏离中心值的程度。</p>
                        <div className={styles.exampleDemo}>
                            <Heatmap
                                data={divergingData}
                                width={600}
                                height={350}
                                xAxis={{ 
                                    title: { text: '月份' },
                                    tickRotation: 30,
                                }}
                                yAxis={{ title: { text: '城市' } }}
                                cellLabels={{ 
                                    display: true, 
                                    formatter: (v) => (v > 0 ? '+' : '') + v.toFixed(1) 
                                }}
                                colorScale={{
                                    minColor: '#dc2626',
                                    midColor: '#ffffff',
                                    maxColor: '#2563eb',
                                    diverging: true,
                                }}
                            />
                        </div>
                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span>示例代码</span>
                                <CopyButton text={divergingCode} />
                            </div>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {divergingCode}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    {/* 用户行为分析 */}
                    <div className={styles.exampleSection} id="heatmap-behavior">
                        <h3 className={styles.subsectionTitle}>用户行为分析</h3>
                        <p className={styles.sectionText}>分析不同用户群体对各功能模块的使用频率，支持点击单元格查看详细数据。</p>
                        <div className={styles.exampleDemo}>
                            <Heatmap
                                data={behaviorData}
                                width={550}
                                height={350}
                                xAxis={{ title: { text: '用户类型' } }}
                                yAxis={{ title: { text: '功能模块' } }}
                                cellLabels={{ display: true, formatter: (v) => `${v}%` }}
                                colorScale={{
                                    minColor: '#fef3c7',
                                    maxColor: '#d97706',
                                }}
                                borderRadius={3}
                                cellSpacing={2}
                                onCellClick={handleCellClick}
                            />
                        </div>
                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span>示例代码</span>
                                <CopyButton text={behaviorCode} />
                            </div>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {behaviorCode}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    {/* 密度热力图 */}
                    <div className={styles.exampleSection} id="heatmap-density">
                        <h3 className={styles.subsectionTitle}>密度热力图</h3>
                        <p className={styles.sectionText}>
                            展示数据点的密度分布，适用于展示大量离散数据的聚集情况。
                            基于高斯核密度估计算法，通过颜色深浅表示数据密集程度。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Heatmap
                                data={densityHeatmapData}
                                width={600}
                                height={400}
                                densityMode={true}
                                densityConfig={{
                                    gridSize: 100,
                                    radius: 35,
                                    weighted: true,
                                    minOpacity: 0,
                                    maxOpacity: 1,
                                }}
                                xAxis={{ title: { text: '经度' } }}
                                yAxis={{ title: { text: '纬度' } }}
                                colorScale={{
                                    minColor: '#ffffff',
                                    maxColor: '#ff0000',
                                    colorStops: [
                                        { offset: 0, color: '#ffffff' },    // 白色 - 无数据
                                        { offset: 0.05, color: '#f5f5ff' }, // 极淡蓝
                                        { offset: 0.15, color: '#d0d8f0' }, // 淡蓝灰
                                        { offset: 0.25, color: '#a0b8e0' }, // 浅蓝紫
                                        { offset: 0.35, color: '#40ff60' }, // 亮绿
                                        { offset: 0.50, color: '#80ff40' }, // 黄绿
                                        { offset: 0.65, color: '#ffff00' }, // 黄色
                                        { offset: 0.80, color: '#ff8000' }, // 橙色
                                        { offset: 0.90, color: '#ff4000' }, // 红橙
                                        { offset: 1, color: '#ff0000' },    // 红色
                                    ],
                                }}
                                onDensityClick={handleDensityClick}
                            />
                        </div>
                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span>示例代码</span>
                                <CopyButton text={densityCode} />
                            </div>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {densityCode}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    {/* 层次聚类热力图 */}
                    <div className={styles.exampleSection} id="heatmap-clustering">
                        <h3 className={styles.subsectionTitle}>层次聚类热力图</h3>
                        <p className={styles.sectionText}>
                            展示基因表达数据的层次聚类结果。顶部和左侧的树状图（Dendrogram）展示了行和列的聚类层次结构，
                            使用欧氏距离和平均连接法进行层次聚类。颜色表示基因表达水平，红色表示高表达，蓝色表示低表达。
                        </p>
                        <div className={styles.exampleDemo}>
                            <Heatmap
                                data={clusteringData}
                                width={750}
                                height={480}
                                clusteringMode={true}
                                clusteringConfig={{
                                    clusterRows: true,
                                    clusterCols: true,
                                    distanceMetric: 'euclidean',
                                    linkageMethod: 'average',
                                    dendrogramWidth: 80,
                                    dendrogramHeight: 50,
                                    dendrogramColor: '#374151',
                                    showRowLabels: true,
                                    rowLabelFontSize: 10,
                                    rowLabelPosition: 'right',  // 行标签在右侧（与原图一致）
                                }}
                                xAxis={{
                                    title: { text: '' },
                                    tickRotation: 0,
                                }}
                                yAxis={{ display: false }}  // 隐藏Y轴标签（使用行标签）
                                colorScale={{
                                    minColor: '#2166ac',  // 蓝色（低表达）
                                    midColor: '#f7f7f7',  // 白色（中等）
                                    maxColor: '#b2182b',  // 红色（高表达）
                                    diverging: true,
                                }}
                                cellLabels={{ display: false }}
                                legend={{ display: true, position: 'right', showValues: true }}
                                onCellClick={handleCellClick}
                            />
                        </div>
                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span>示例代码</span>
                                <CopyButton text={clusteringCode} />
                            </div>
                            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                                {clusteringCode}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    {/* API 参考 */}
                    <div className={styles.exampleSection} id="heatmap-api">
                        <h3 className={styles.subsectionTitle}>API 参考</h3>
                        <p className={styles.sectionText}>Heatmap 组件的属性配置。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={apiData} />
                        </div>
                    </div>

                    {/* ColorScale 配置 */}
                    <div className={styles.exampleSection} id="heatmap-colorscale-api">
                        <h3 className={styles.subsectionTitle}>ColorScale 配置</h3>
                        <p className={styles.sectionText}>颜色比例尺配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={colorScaleDataAPI} />
                        </div>
                    </div>

                    {/* Axis 配置 */}
                    <div className={styles.exampleSection} id="heatmap-axis-api">
                        <h3 className={styles.subsectionTitle}>Axis 配置</h3>
                        <p className={styles.sectionText}>坐标轴配置项说明（xAxis/yAxis 通用配置）。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={axisDataAPI} />
                        </div>
                    </div>

                    {/* CellLabels 配置 */}
                    <div className={styles.exampleSection} id="heatmap-celllabels-api">
                        <h3 className={styles.subsectionTitle}>CellLabels 配置</h3>
                        <p className={styles.sectionText}>单元格标签配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={cellLabelsDataAPI} />
                        </div>
                    </div>

                    {/* DensityConfig 配置 */}
                    <div className={styles.exampleSection} id="heatmap-density-api">
                        <h3 className={styles.subsectionTitle}>DensityConfig 配置</h3>
                        <p className={styles.sectionText}>密度热力图配置项说明。</p>
                        <div className={styles.apiTable}>
                            <Table columns={apiColumns} dataSource={densityConfigDataAPI} />
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
                                <Anchor.Link href="#heatmap-intro" title="组件介绍" />
                                <Anchor.Link href="#heatmap-basic" title="基础热力图" />
                                <Anchor.Link href="#heatmap-correlation" title="相关性分析" />
                                <Anchor.Link href="#heatmap-diverging" title="发散型颜色比例尺" />
                                <Anchor.Link href="#heatmap-behavior" title="用户行为分析" />
                                <Anchor.Link href="#heatmap-density" title="密度热力图" />
                                <Anchor.Link href="#heatmap-clustering" title="层次聚类热力图" />
                                <Anchor.Link href="#heatmap-api" title="API 参考" />
                                <Anchor.Link href="#heatmap-colorscale-api" title="ColorScale 配置" />
                                <Anchor.Link href="#heatmap-axis-api" title="Axis 配置" />
                                <Anchor.Link href="#heatmap-celllabels-api" title="CellLabels 配置" />
                                <Anchor.Link href="#heatmap-density-api" title="DensityConfig 配置" />
                            </Anchor>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
}
