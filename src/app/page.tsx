'use client';

import styles from './page.module.css';
import { Button, Layout, Menu } from '@zjpcy/simple-design';
import '@zjpcy/simple-design/dist/cjs/index.css';
import LineExample from './Line';

const { Header, Sider, Content } = Layout;

export default function Home() {

    // 菜单项配置
    const menuItems = [
        {
            key: 'line',
            label: '折线图示例',
        },
    ];

    return (
        <Layout className={styles.layout}>
            {/* 侧边栏 */}
            <Sider className={styles.sider} width={200}>
                <div className={styles.logo}>Design Charts</div>
                <Menu
                    mode="inline"
                    selectedKey="home"
                    items={menuItems}
                    className={styles.menu}
                />
            </Sider>

            {/* 主内容区 */}
            <Layout>
                <Header className={styles.header}>
                    <h2>组件展示示例</h2>
                </Header>
                <Content className={styles.content}>
                    <LineExample />
                </Content>
            </Layout>
        </Layout>
    );
}