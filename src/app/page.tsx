'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Button, Layout, Menu } from '@zjpcy/simple-design';
import '@zjpcy/simple-design/dist/cjs/index.css';
import { Prism } from 'react-syntax-highlighter';
// 修复 react-syntax-highlighter 与 React 18 的类型不兼容问题
const SyntaxHighlighter = Prism as any;
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LineExample from './Line';
import ColumnExample from './Column';
import BarExample from './Bar';
import AreaExample from './Area';
import PieExample from './Pie';
import ScatterExample from './Scatter';
import FunnelExample from './Funnel';
import HeatmapExample from './Heatmap';
import LiquidExample from './Liquid';
import DualAxesExample from './DualAxes';
import BidirectionalBarExample from './BidirectionalBar';
import BoxExample from './Box';
import GaugeExample from './Gauge';
import RadarExample from './Radar';
import SankeyExample from './Sankey';
import StockExample from './Stock';
import TreemapExample from './Treemap';
import VennExample from './Venn';
import WaterfallExample from './Waterfall';
import InstallGuide from './InstallGuide';

const { Header, Sider, Content } = Layout;

export default function Home() {
    const [selectedKey, setSelectedKey] = useState('install');

    // 从 URL hash 读取初始 key
    useEffect(() => {
        const hash = window.location.hash.replace('#/', '');
        if (hash && (hash === 'install' || hash === 'line' || hash === 'column' || hash === 'bar' || hash === 'area' || hash === 'pie' || hash === 'scatter' || hash === 'funnel' || hash === 'heatmap' || hash === 'liquid' || hash === 'dualaxes' || hash === 'bidirectionalbar' || hash === 'box' || hash === 'gauge' || hash === 'radar' || hash === 'sankey' || hash === 'stock' || hash === 'treemap' || hash === 'venn' || hash === 'waterfall')) {
            setSelectedKey(hash);
        }
    }, []);

    // 切换菜单时更新 URL hash
    const handleMenuChange = (_: unknown, key: string) => {
        setSelectedKey(key);
        window.location.hash = `#/${key}`;
    };

    // 菜单项配置
    const menuItems = [
        {
            key: 'install',
            label: 'Install',
            description: '安装指南'
        },
        {
            key: 'line',
            label: 'Line',
            description: '折线图'
        },
        {
            key: 'column',
            label: 'Column',
            description: '柱状图'
        },
        {
            key: 'bar',
            label: 'Bar',
            description: '条形图'
        },
        {
            key: 'area',
            label: 'Area',
            description: '面积图'
        },
        {
            key: 'pie',
            label: 'Pie',
            description: '饼图'
        },
        {
            key: 'scatter',
            label: 'Scatter',
            description: '散点图'
        },
        {
            key: 'funnel',
            label: 'Funnel',
            description: '漏斗图'
        },
        {
            key: 'heatmap',
            label: 'Beatmap',
            description: '热力图'
        },
        {
            key: 'liquid',
            label: 'Liquid',
            description: '水波图'
        },
        {
            key: 'dualaxes',
            label: 'DualAxes',
            description: '双轴图'
        },
        {
            key: 'bidirectionalbar',
            label: 'BidirectionalBar',
            description: '对称条形图'
        },
        {
            key: 'box',
            label: 'Box',
            description: '箱线图'
        },
        {
            key: 'gauge',
            label: 'Gauge',
            description: '仪表盘'
        },
        {
            key: 'radar',
            label: 'Radar',
            description: '雷达图'
        },
        {
            key: 'sankey',
            label: 'Sankey',
            description: '桑基图'
        },
        {
            key: 'stock',
            label: 'Stock',
            description: '股票图'
        },
        {
            key: 'treemap',
            label: 'Treemap',
            description: '矩阵树图'
        },
        {
            key: 'venn',
            label: 'Venn',
            description: '韦恩图'
        },
        {
            key: 'waterfall',
            label: 'Waterfall',
            description: '瀑布图'
        },
    ];

    // 渲染对应的内容组件
    const renderContent = () => {
        switch (selectedKey) {
            case 'install':
                return <InstallGuide />;
            case 'line':
                return <LineExample />;
            case 'column':
                return <ColumnExample />;
            case 'bar':
                return <BarExample />;
            case 'area':
                return <AreaExample />;
            case 'pie':
                return <PieExample />;
            case 'scatter':
                return <ScatterExample />;
            case 'funnel':
                return <FunnelExample />;
            case 'heatmap':
                return <HeatmapExample />;
            case 'liquid':
                return <LiquidExample />;
            case 'dualaxes':
                return <DualAxesExample />;
            case 'bidirectionalbar':
                return <BidirectionalBarExample />;
            case 'box':
                return <BoxExample />;
            case 'gauge':
                return <GaugeExample />;
            case 'radar':
                return <RadarExample />;
            case 'sankey':
                return <SankeyExample />;
            case 'stock':
                return <StockExample />;
            case 'treemap':
                return <TreemapExample />;
            case 'venn':
                return <VennExample />;
            case 'waterfall':
                return <WaterfallExample />;
            default:
                return <LineExample />;
        }
    };

    // 安装命令
    const installCode = `npm install @zjpcy/charts
# 或
yarn add @zjpcy/charts
# 或
pnpm add @zjpcy/charts`;

    const handleCopyInstall = async () => {
        try {
            await navigator.clipboard.writeText('npm install @zjpcy/charts');
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    return (
        <Layout className={styles.layout}>
            {/* 侧边栏 */}
            <Sider className={styles.sider} width={200} theme="light">
                <div className={styles.logo}>Design Charts</div>
                <Menu
                    mode="inline"
                    theme="light"
                    items={menuItems}
                    className={styles.menu}
                    selectedKey={selectedKey}
                    onChange={handleMenuChange}
                />
            </Sider>

            {/* 主内容区 */}
            <Layout>
                <Header className={styles.header}>
                    <h2>组件展示示例</h2>
                </Header>
                <Content className={`${styles.content} app-content`}>
                    {selectedKey !== 'install' && (
                        <div className={styles.installCard}>
                            <div className={styles.installHeader}>
                                <h3>📦 快速开始</h3>
                                <Button type="primary" size="small" onClick={handleCopyInstall}>
                                    复制安装命令
                                </Button>
                            </div>
                            <p className={styles.installDesc}>
                                在使用本示例中的组件前，请先安装图表组件库。查看完整
                                <Button type="link" size="small" onClick={() => handleMenuChange(null, 'install')}>
                                    安装指南
                                </Button>
                            </p>
                            <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                                {installCode}
                            </SyntaxHighlighter>
                        </div>
                    )}
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
}
