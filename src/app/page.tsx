'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Button, Layout, Menu } from '@zjpcy/simple-design';
import '@zjpcy/simple-design/dist/cjs/index.css';
import LineExample from './Line';
import ColumnExample from './Column';
import BarExample from './Bar';
import AreaExample from './Area';
import PieExample from './Pie';
import ScatterExample from './Scatter';
import FunnelExample from './Funnel';

const { Header, Sider, Content } = Layout;

export default function Home() {
    const [selectedKey, setSelectedKey] = useState('line');

    // 从 URL hash 读取初始 key
    useEffect(() => {
        const hash = window.location.hash.replace('#/', '');
        if (hash && (hash === 'line' || hash === 'column' || hash === 'bar' || hash === 'area' || hash === 'pie' || hash === 'scatter' || hash === 'funnel')) {
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
            key: 'line',
            label: '折线图示例',
        },
        {
            key: 'column',
            label: '柱状图示例',
        },
        {
            key: 'bar',
            label: '条形图示例',
        },
        {
            key: 'area',
            label: '面积图示例',
        },
        {
            key: 'pie',
            label: '饼图示例',
        },
        {
            key: 'scatter',
            label: '散点图示例',
        },
        {
            key: 'funnel',
            label: '漏斗图示例',
        },
    ];

    // 渲染对应的内容组件
    const renderContent = () => {
        switch (selectedKey) {
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
            default:
                return <LineExample />;
        }
    };

    return (
        <Layout className={styles.layout}>
            {/* 侧边栏 */}
            <Sider className={styles.sider} width={200}>
                <div className={styles.logo}>Design Charts</div>
                <Menu
                    mode="inline"
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
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
}
