/**
 * 页脚组件
 */

import React from 'react';
import styles from './style.module.css';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.brand}>
                        <div className={styles.brandLogo}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="url(#footerGradient)" strokeWidth="2"/>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10" stroke="url(#footerGradient)" strokeWidth="2" strokeLinecap="round"/>
                                <defs>
                                    <linearGradient id="footerGradient" x1="2" y1="2" x2="22" y2="22">
                                        <stop stopColor="#3b82f6"/>
                                        <stop offset="1" stopColor="#8b5cf6"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className={styles.brandName}>Design Charts</span>
                        <p className={styles.brandDesc}>
                            基于 React + TypeScript 的现代化图表组件库
                        </p>
                    </div>
                    <div className={styles.links}>
                        <div className={styles.linkGroup}>
                            <h4>组件</h4>
                            <a href="#showcase">饼图 Pie</a>
                            <a href="#">折线图 Line</a>
                            <a href="#">柱状图 Bar</a>
                            <a href="#">面积图 Area</a>
                        </div>
                        <div className={styles.linkGroup}>
                            <h4>资源</h4>
                            <a href="#">文档</a>
                            <a href="#">API 参考</a>
                            <a href="#">示例</a>
                            <a href="#">更新日志</a>
                        </div>
                        <div className={styles.linkGroup}>
                            <h4>社区</h4>
                            <a href="#">GitHub</a>
                            <a href="#">讨论区</a>
                            <a href="#">贡献指南</a>
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © 2024 Design Charts. All rights reserved.
                    </p>
                    <div className={styles.techStack}>
                        <span>Built with</span>
                        <span className={styles.techBadge}>React</span>
                        <span className={styles.techBadge}>TypeScript</span>
                        <span className={styles.techBadge}>Canvas</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
