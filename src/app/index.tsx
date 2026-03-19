/**
 * Design Charts 组件示例入口
 * 组件说明和示例展示环境
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './page';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
