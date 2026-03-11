'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { Button, Layout, Menu } from '@zjpcy/simple-design';
import '@zjpcy/simple-design/dist/cjs/index.css';
import LineExample from './Line';
import ColumnExample from './Column';

const { Header, Sider, Content } = Layout;

export default function Home() {
    const [selectedKey, setSelectedKey] = useState('line');

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
    ];

    // 渲染对应的内容组件
    const renderContent = () => {
        switch (selectedKey) {
            case 'line':
                return <LineExample />;
            case 'column':
                return <ColumnExample />;
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
                    onChange={(_, key) => setSelectedKey(key)}
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
