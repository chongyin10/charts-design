/**
 * Design Charts 官网主应用
 * 展示组件库特性和 Pie 组件复杂示例
 */

import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './sections/Hero';
import Features from './sections/Features';
import PieShowcase from './sections/PieShowcase';
import Footer from './components/Footer';
import './styles/global.css';
import styles from './App.module.css';

const App: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'hero' | 'features' | 'showcase'>('hero');

    return (
        <div className={styles.app}>
            <Header activeSection={activeSection} onNavigate={setActiveSection} />
            <main className={styles.main}>
                <section id="hero" className={styles.section}>
                    <Hero onExplore={() => setActiveSection('features')} />
                </section>
                <section id="features" className={styles.section}>
                    <Features onShowcase={() => setActiveSection('showcase')} />
                </section>
                <section id="showcase" className={styles.section}>
                    <PieShowcase />
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default App;
