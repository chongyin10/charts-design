/**
 * Hero 首屏区域
 * 展示组件库的核心价值主张
 */

import React from 'react';
import styles from './style.module.css';

interface HeroProps {
    onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore }) => {
    return (
        <div className={styles.hero}>
            <div className={styles.background}>
                <div className={styles.gradientOrb1} />
                <div className={styles.gradientOrb2} />
                <div className={styles.gridPattern} />
            </div>

            <div className={styles.content}>
                <div className={styles.badge}>
                    <span className={styles.badgeDot} />
                    <span>React + TypeScript + Canvas</span>
                </div>

                <h1 className={styles.title}>
                    <span className={styles.titleLine}>现代化图表组件库</span>
                    <span className={styles.titleHighlight}>
                        <span className={styles.gradientText}>Design Charts</span>
                    </span>
                </h1>

                <p className={styles.description}>
                    基于 Canvas 的高性能图表解决方案，提供丰富的图表类型、
                    <br />
                    流畅的动画效果和高度可定制的配置选项
                </p>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>18+</span>
                        <span className={styles.statLabel}>图表类型</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>100%</span>
                        <span className={styles.statLabel}>TypeScript</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>60fps</span>
                        <span className={styles.statLabel}>流畅动画</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={onExplore}>
                        <span>探索特性</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button className={styles.secondaryBtn}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>GitHub</span>
                    </button>
                </div>

                <div className={styles.previewCard}>
                    <div className={styles.previewHeader}>
                        <div className={styles.previewDots}>
                            <span />
                            <span />
                            <span />
                        </div>
                        <span className={styles.previewTitle}>Pie Chart Preview</span>
                    </div>
                    <div className={styles.previewContent}>
                        <svg viewBox="0 0 200 200" className={styles.previewChart}>
                            <defs>
                                <linearGradient id="pie1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6"/>
                                    <stop offset="100%" stopColor="#60a5fa"/>
                                </linearGradient>
                                <linearGradient id="pie2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981"/>
                                    <stop offset="100%" stopColor="#34d399"/>
                                </linearGradient>
                                <linearGradient id="pie3" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f59e0b"/>
                                    <stop offset="100%" stopColor="#fbbf24"/>
                                </linearGradient>
                                <linearGradient id="pie4" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6"/>
                                    <stop offset="100%" stopColor="#a78bfa"/>
                                </linearGradient>
                                <linearGradient id="pie5" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444"/>
                                    <stop offset="100%" stopColor="#f87171"/>
                                </linearGradient>
                            </defs>
                            <g transform="translate(100, 100)">
                                <path d="M0,-80 A80,80 0 0,1 76,25 L57,19 A60,60 0 0,0 0,-60 Z" fill="url(#pie1)" className={styles.pieSlice} />
                                <path d="M76,25 A80,80 0 0,1 47,71 L35,53 A60,60 0 0,0 57,19 Z" fill="url(#pie2)" className={styles.pieSlice} />
                                <path d="M47,71 A80,80 0 0,1 -29,75 L-22,56 A60,60 0 0,0 35,53 Z" fill="url(#pie3)" className={styles.pieSlice} />
                                <path d="M-29,75 A80,80 0 0,1 -76,22 L-57,16 A60,60 0 0,0 -22,56 Z" fill="url(#pie4)" className={styles.pieSlice} />
                                <path d="M-76,22 A80,80 0 0,1 0,-80 L0,-60 A60,60 0 0,0 -57,16 Z" fill="url(#pie5)" className={styles.pieSlice} />
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
