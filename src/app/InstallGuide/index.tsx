'use client';

import React, { useState } from 'react';
import { Prism } from 'react-syntax-highlighter';
// 修复 react-syntax-highlighter 与 React 18 的类型不兼容问题
const SyntaxHighlighter = Prism as any;
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './page.module.css';

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

// 代码块组件
interface CodeBlockProps {
    title: string;
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, code, language = 'tsx' }) => (
    <>
        <div className={styles.codeHeader}>
            <span>{title}</span>
            <CopyButton text={code} />
        </div>
        <SyntaxHighlighter language={language} style={vscDarkPlus}>
            {code}
        </SyntaxHighlighter>
    </>
);

/**
 * 安装指南页面
 */
export default function InstallGuidePage() {
    // 安装命令
    const installCode = `npm install @zjpcy/charts
# 或
yarn add @zjpcy/charts
# 或
pnpm add @zjpcy/charts`;

    // 全量引入样式
    const globalStyleCode = `// 引入所有组件样式（必须）
import '@zjpcy/charts/style.css';`;

    // 按需引入样式
    const onDemandStyleCode = `// 引入单个组件
import { Line } from '@zjpcy/charts/line';

// 引入组件对应的 CSS（必须）
import '@zjpcy/charts/line/style.css';`;

    // 基础使用示例
    const basicCode = `import { Line } from '@zjpcy/charts/line';
import '@zjpcy/charts/line/style.css';

function App() {
  const data = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        label: '销售额',
        data: [120, 200, 150, 80, 70, 110],
      },
    ],
  };

  return (
    <div style={{ width: 800, height: 400 }}>
      <Line data={data} />
    </div>
  );
}`;

    // 全量引入示例
    const fullImportCode = `import { Line, Column, Pie, Area } from '@zjpcy/charts';
import type { LineProps, LineChartData } from '@zjpcy/charts';

// 引入全局样式（包含所有组件样式）
import '@zjpcy/charts/style.css';

function App() {
  return (
    <div style={{ width: 800, height: 400 }}>
      <Line data={data} />
      <Column data={columnData} />
    </div>
  );
}`;

    // 按需引入示例
    const onDemandImportCode = `// 引入单个组件
import { Line } from '@zjpcy/charts/line';
import type { LineProps } from '@zjpcy/charts/line';

// 引入组件对应的 CSS
import '@zjpcy/charts/line/style.css';

// 或者使用其他组件
import { Column } from '@zjpcy/charts/column';
import '@zjpcy/charts/column/style.css';`;

    // CommonJS 示例
    const commonJSCode = `const { Line, Column } = require('@zjpcy/charts');
require('@zjpcy/charts/style.css');`;

    // babel-plugin-import 示例
    const babelCode = `module.exports = {
  plugins: [
    ['import', {
      libraryName: '@zjpcy/charts',
      libraryDirectory: '',
      camel2DashComponentName: false,
      customName: (name) => {
        // 自动映射到子路径
        return \`@zjpcy/charts/\${name.toLowerCase()}\`;
      },
      style: (name) => {
        return \`\${name}/style.css\`;
      },
    }],
  ],
};`;

    const babelUsageCode = `import { Line, Column } from '@zjpcy/charts';
// CSS 会自动按需引入`;

    // TypeScript 示例
    const tsCode = `import { Line, type LineProps, type LineChartData } from '@zjpcy/charts/line';

// 使用类型定义
const MyLine: React.FC<LineProps> = (props) => {
  return <Line {...props} />;
};`;

    return (
        <div className={styles.installPage}>
            <div className={styles.mainContent}>
                <h2 className={styles.sectionTitle} id="install-intro">安装指南</h2>
                <p className={styles.sectionText}>
                    本文档将帮助你在项目中快速安装和配置 @zjpcy/charts 图表组件库。
                </p>

                {/* 环境要求 */}
                <div className={styles.exampleSection} id="install-requirements">
                    <h3 className={styles.subsectionTitle}>环境要求</h3>
                    <ul className={styles.requirementList}>
                        <li>✅ React &gt;= 18.0.0</li>
                        <li>✅ React DOM &gt;= 18.0.0</li>
                        <li>✅ TypeScript &gt;= 5.0.0（推荐）</li>
                    </ul>
                </div>

                {/* 安装 */}
                <div className={styles.exampleSection} id="install-package">
                    <h3 className={styles.subsectionTitle}>📦 安装</h3>
                    <p className={styles.paragraph}>
                        使用 npm、yarn 或 pnpm 安装组件库：
                    </p>
                    <CodeBlock title="安装命令" code={installCode} language="bash" />
                </div>

                {/* 引入样式 */}
                <div className={styles.exampleSection} id="install-style">
                    <h3 className={styles.subsectionTitle}>🎨 引入样式</h3>

                    <p className={styles.paragraph}>
                        <strong>全量引入样式</strong>：在应用入口文件中引入全局样式文件。
                    </p>
                    <CodeBlock title="全局样式" code={globalStyleCode} />

                    <p className={styles.paragraph}>
                        <strong>按需引入样式</strong>：推荐按需引入组件及其对应样式，减小打包体积。
                    </p>
                    <CodeBlock title="按需引入" code={onDemandStyleCode} />

                    <div className={styles.tip}>
                        <div className={styles.tipTitle}>💡 提示</div>
                        <p className={styles.tipText}>
                            样式文件包含了组件的所有基础样式，必须在引入组件之前或同时引入。每个组件都有独立的样式文件，按需引入可有效减少打包体积。
                        </p>
                    </div>
                </div>

                {/* 使用示例 */}
                <div className={styles.exampleSection} id="install-usage">
                    <h3 className={styles.subsectionTitle}>🚀 使用示例</h3>

                    <p className={styles.paragraph}>
                        <strong>基础使用</strong>：直接引入需要的组件即可使用。
                    </p>
                    <CodeBlock title="基础使用" code={basicCode} />

                    <p className={styles.paragraph}>
                        <strong>全量引入</strong>：一次性引入所有组件和样式。
                    </p>
                    <CodeBlock title="全量引入" code={fullImportCode} />

                    <p className={styles.paragraph}>
                        <strong>按需引入（推荐）</strong>：只引入需要的组件及其 CSS，减少打包体积。
                    </p>
                    <CodeBlock title="按需引入" code={onDemandImportCode} />

                    <p className={styles.paragraph}>
                        <strong>CommonJS 导入</strong>：在不支持 ESM 的环境中使用。
                    </p>
                    <CodeBlock title="CommonJS" code={commonJSCode} language="javascript" />

                    <p className={styles.paragraph}>
                        <strong>配合 babel-plugin-import 自动按需引入</strong>：配置 .babelrc 或 babel.config.js。
                    </p>
                    <CodeBlock title="babel 配置" code={babelCode} language="javascript" />
                    <CodeBlock title="自动按需引入" code={babelUsageCode} />
                </div>

                {/* TypeScript 支持 */}
                <div className={styles.exampleSection} id="install-typescript">
                    <h3 className={styles.subsectionTitle}>🔧 TypeScript 支持</h3>
                    <p className={styles.paragraph}>
                        组件库使用 TypeScript 编写，提供了完整的类型定义。
                    </p>
                    <CodeBlock title="类型定义" code={tsCode} />

                    <div className={styles.tip}>
                        <div className={styles.tipTitle}>✨ 类型提示</div>
                        <p className={styles.tipText}>
                            所有组件都导出了对应的 Props 类型和数据类型，例如 LineProps、LineChartData、ColumnProps 等。
                        </p>
                    </div>
                </div>

                {/* 浏览器兼容性 */}
                <div className={styles.exampleSection} id="install-browser">
                    <h3 className={styles.subsectionTitle}>🌐 浏览器兼容性</h3>
                    <ul className={styles.browserList}>
                        <li>🌐 Chrome &gt;= 80</li>
                        <li>🔥 Firefox &gt;= 75</li>
                        <li>🧭 Safari &gt;= 13</li>
                        <li>🌊 Edge &gt;= 80</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
