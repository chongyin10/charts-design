# Design Charts

一个基于 React + Next.js 的图表组件库，支持按需加载 CSS，避免全量引入导致的性能问题。

## 特性

- ⚡️ React 18 + TypeScript
- 🔧 支持按需引入（Tree Shaking）
- 🎨 每个组件独立 CSS，避免全量加载
- 📦 Rollup 构建，生成优化的 ESM/CJS 格式
- 🎯 类型定义自动生成

## 安装

```bash
npm install @zjpcy/charts-design
```

## 使用方式

### 1. 按需引入（推荐）

只引入需要的组件及其 CSS，大幅减少打包体积：

```tsx
// 引入单个组件
import { Line } from '@zjpcy/charts-design/line';
// 必须引入组件对应的 CSS
import '@zjpcy/charts-design/line/style.css';

// 或者使用其他组件
import { Column } from '@zjpcy/charts-design/column';
import '@zjpcy/charts-design/column/style.css';
```

### 2. 全量引入（向后兼容）

如果需要一次性引入所有组件：

```tsx
import { Line, Column } from '@zjpcy/charts-design';
// 引入全量 CSS（会包含所有组件样式）
import '@zjpcy/charts-design/style.css';
```

### 3. 配合 babel-plugin-import 自动按需引入

配置 `.babelrc` 或 `babel.config.js`：

```js
module.exports = {
  plugins: [
    ['import', {
      libraryName: '@zjpcy/charts-design',
      libraryDirectory: '',
      camel2DashComponentName: false,
      customName: (name) => {
        // 自动映射到子路径
        return `@zjpcy/charts-design/${name.toLowerCase()}`;
      },
      style: (name) => {
        return `${name}/style.css`;
      },
    }],
  ],
};
```

配置后可直接使用：

```tsx
import { Line, Column } from '@zjpcy/charts-design';
// CSS 会自动按需引入
```

### 4. 配合 unplugin-vue-components / unplugin-auto-import

对于 Vite 或 Webpack 项目，可以使用 unplugin 系列插件实现自动按需引入。

## 示例代码

```tsx
import React from 'react';
import { Line } from '@zjpcy/charts-design/line';
import '@zjpcy/charts-design/line/style.css';

const data = {
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  datasets: [
    {
      label: '销售额',
      data: [120, 200, 150, 80, 70, 110],
    },
  ],
};

function App() {
  return (
    <div style={{ width: 800, height: 400 }}>
      <Line data={data} />
    </div>
  );
}

export default App;
```

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看组件演示

### 构建组件库

```bash
npm run build
```

输出文件在 `dist/` 目录：
```
dist/
├── index.js           # 全量 CJS
├── index.esm.js       # 全量 ESM
├── index.d.ts         # 类型定义
├── style.css          # 全量 CSS
├── line/
│   ├── index.js       # Line 组件 CJS
│   ├── index.esm.js   # Line 组件 ESM
│   ├── index.d.ts     # Line 类型定义
│   └── style.css      # Line 组件 CSS
└── column/
    ├── index.js       # Column 组件 CJS
    ├── index.esm.js   # Column 组件 ESM
    ├── index.d.ts     # Column 类型定义
    └── style.css      # Column 组件 CSS
```

## 项目结构

```
.
├── src/
│   ├── app/              # Next.js 应用页面（演示）
│   ├── components/       # 组件库源码
│   │   ├── Line/         # 折线图组件
│   │   │   ├── Line.tsx
│   │   │   ├── Line.type.ts
│   │   │   ├── style.module.css
│   │   │   └── index.ts  # 组件入口
│   │   └── Column/       # 柱状图组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数
│   └── index.ts          # 库入口文件
├── rollup.config.mjs     # Rollup 构建配置
└── package.json          # 配置 exports 字段
```

## 添加新组件

1. 在 `src/components/` 下创建组件目录（如 `Pie/`）
2. 添加组件文件：
   - `Pie.tsx` - 组件实现
   - `Pie.type.ts` - 类型定义
   - `style.module.css` - 组件样式
   - `index.ts` - 组件入口
3. 在 `rollup.config.mjs` 中的 `components` 数组添加组件名
4. 在 `package.json` 的 `exports` 字段添加子路径导出
5. 在 `src/index.ts` 中导出组件（用于全量引入）

## 导出配置说明

`package.json` 中的 `exports` 字段定义了子路径导出：

```json
{
  "exports": {
    ".": "全量入口",
    "./line": "Line 组件按需入口",
    "./line/style.css": "Line 组件 CSS",
    "./column": "Column 组件按需入口",
    "./column/style.css": "Column 组件 CSS"
  }
}
```

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建组件库（Rollup）|
| `npm run build:watch` | 监听构建组件库 |
| `npm run type-check` | 类型检查 |
| `npm run lint` | 代码检查 |

## License

MIT
