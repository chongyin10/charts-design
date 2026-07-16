# @zjpcy/charts

一个基于 React + TypeScript 的图表组件库，支持全量引入和按需加载。

## 特性

- ⚡️ React 18 + TypeScript
- 🔧 支持按需引入（Tree Shaking）
- 🎨 每个组件独立 CSS，也可全量引入
- 📦 Rollup 构建，生成优化的 ESM/CJS 格式
- 🎯 类型定义自动生成

## 安装指南

### 环境要求

- React >= 18.0.0
- React DOM >= 18.0.0
- TypeScript >= 5.0.0（推荐）

## 📦 安装

使用 npm、yarn 或 pnpm 安装组件库：

```bash
npm install @zjpcy/charts
# 或
yarn add @zjpcy/charts
# 或
pnpm add @zjpcy/charts
```

## 🎨 引入样式

### 全量引入样式

在应用入口文件中引入全局样式文件：

```tsx
// 引入所有组件样式（必须）
import '@zjpcy/charts/style.css';
```

### 按需引入样式

推荐按需引入组件及其对应样式，减小打包体积：

```tsx
// 引入单个组件
import { Line } from '@zjpcy/charts/line';

// 引入组件对应的 CSS（必须）
import '@zjpcy/charts/line/style.css';
```

> 💡 **提示**
>
> 样式文件包含了组件的所有基础样式，必须在引入组件之前或同时引入。每个组件都有独立的样式文件，按需引入可有效减少打包体积。

## 🚀 使用示例

### 基础使用

直接引入需要的组件即可使用：

```tsx
import { Line } from '@zjpcy/charts/line';
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
}
```

### 全量引入

一次性引入所有组件和样式：

```tsx
import { Line, Column, Pie, Area } from '@zjpcy/charts';
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
}
```

### 按需引入（推荐）

只引入需要的组件及其 CSS，减少打包体积：

```tsx
// 引入单个组件
import { Line } from '@zjpcy/charts/line';
import type { LineProps } from '@zjpcy/charts/line';

// 引入组件对应的 CSS
import '@zjpcy/charts/line/style.css';

// 或者使用其他组件
import { Column } from '@zjpcy/charts/column';
import '@zjpcy/charts/column/style.css';
```

### CommonJS 导入

```javascript
const { Line, Column } = require('@zjpcy/charts');
require('@zjpcy/charts/style.css');
```

### 配合 babel-plugin-import 自动按需引入

配置 `.babelrc` 或 `babel.config.js`：

```js
module.exports = {
  plugins: [
    ['import', {
      libraryName: '@zjpcy/charts',
      libraryDirectory: '',
      camel2DashComponentName: false,
      customName: (name) => {
        // 自动映射到子路径
        return `@zjpcy/charts/${name.toLowerCase()}`;
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
import { Line, Column } from '@zjpcy/charts';
// CSS 会自动按需引入
```

## 🔧 TypeScript 支持

组件库使用 TypeScript 编写，提供了完整的类型定义：

```tsx
import { Line, type LineProps, type LineChartData } from '@zjpcy/charts/line';

// 使用类型定义
const MyLine: React.FC<LineProps> = (props) => {
  return <Line {...props} />;
};
```

> ✨ **类型提示**
>
> 所有组件都导出了对应的 Props 类型和数据类型，例如 `LineProps`、`LineChartData`、`ColumnProps` 等。

## 🌐 浏览器兼容性

- 🌐 Chrome >= 80
- 🔥 Firefox >= 75
- 🧭 Safari >= 13
- 🌊 Edge >= 80

## 示例代码

```tsx
import React from 'react';
import { Line } from '@zjpcy/charts/line';
import '@zjpcy/charts/line/style.css';

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

## 可用组件

| 组件 | 导入路径 | 说明 |
|------|----------|------|
| Area | `@zjpcy/charts/area` | 面积图 |
| Bar | `@zjpcy/charts/bar` | 条形图 |
| BidirectionalBar | `@zjpcy/charts/bidirectionalbar` | 双向条形图 |
| BoxPlot | `@zjpcy/charts/box` | 箱线图 |
| Column | `@zjpcy/charts/column` | 柱状图 |
| DualAxes | `@zjpcy/charts/dualaxes` | 双轴图 |
| Funnel | `@zjpcy/charts/funnel` | 漏斗图 |
| Gauge | `@zjpcy/charts/gauge` | 仪表盘 |
| Heatmap | `@zjpcy/charts/heatmap` | 热力图 |
| Line | `@zjpcy/charts/line` | 折线图 |
| Liquid | `@zjpcy/charts/liquid` | 水波图 |
| Pie | `@zjpcy/charts/pie` | 饼图 |
| Radar | `@zjpcy/charts/radar` | 雷达图 |
| Sankey | `@zjpcy/charts/sankey` | 桑基图 |
| Scatter | `@zjpcy/charts/scatter` | 散点图 |
| Stock | `@zjpcy/charts/stock` | 股票图/K线图 |
| Treemap | `@zjpcy/charts/treemap` | 矩形树图 |
| Venn | `@zjpcy/charts/venn` | 韦恩图 |
| Waterfall | `@zjpcy/charts/waterfall` | 瀑布图 |

## 开发

### 安装依赖

```bash
npm install
```

### 构建命令

本项目包含三个独立的构建环境：

#### APP 环境 - 组件示例

用于展示组件的各种使用示例和说明文档。

```bash
npm run app:dev      # 开发模式，端口 3000
npm run app:build    # 构建到 distapp/
npm run app:serve    # 预览生产版本
```

#### WEB 环境 - 官网

用于构建项目官网，展示组件库特性和复杂示例。

```bash
npm run web:dev      # 开发模式，端口 3009
npm run web:build    # 构建到 distweb/
npm run web:serve    # 预览生产版本
```

#### COMPONENTS 环境 - 组件发布

用于构建发布到 npm 的组件库，支持 Tree-shaking 和按需引入。

```bash
npm run build        # 构建到 dist/（用于 npm 发布）
npm run build:watch  # 监听模式
```

### 构建输出目录

| 环境 | 输出目录 | 用途 |
|------|----------|------|
| APP | `distapp/` | 组件示例演示 |
| WEB | `distweb/` | 官网站点 |
| COMPONENTS | `dist/` | npm 发布包 |

输出文件在 `dist/` 目录（组件发布）：
```
dist/
├── index.js           # 全量 CJS 入口
├── index.esm.js       # 全量 ESM 入口
├── index.d.ts         # 全量类型定义
├── style.css          # 全量 CSS（所有组件样式）
├── types/             # 共享类型定义
├── line/
│   ├── index.js       # Line 组件 CJS
│   ├── index.esm.js   # Line 组件 ESM
│   ├── index.d.ts     # Line 类型定义
│   └── style.css      # Line 组件 CSS
├── column/
│   ├── index.js       # Column 组件 CJS
│   ├── index.esm.js   # Column 组件 ESM
│   ├── index.d.ts     # Column 类型定义
│   └── style.css      # Column 组件 CSS
└── ... (其他组件)
```

## 项目结构

```
.
├── src/
│   ├── app/              # Next.js 应用页面（演示）
│   ├── web/              # 官网页面
│   ├── components/       # 组件库源码
│   │   ├── Line/         # 折线图组件
│   │   │   ├── Line.tsx
│   │   │   ├── Line.type.ts
│   │   │   ├── style.module.css
│   │   │   └── index.ts  # 组件入口
│   │   └── Column/       # 柱状图组件
│   │       ├── Column.tsx
│   │       ├── Column.type.ts
│   │       ├── style.module.css
│   │       └── index.ts
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数
│   └── index.ts          # 库入口文件（全量导出）
├── dist/                 # 组件发布构建输出
├── rollup.config.mjs     # Rollup 构建配置
└── package.json          # 配置 exports 字段
```

## 添加新组件

1. 在 `src/components/` 下创建组件目录（如 `Pie/`）
2. 添加组件文件：
   - `Pie.tsx` - 组件实现
   - `Pie.type.ts` - 类型定义
   - `style.module.css` - 组件样式
   - `index.ts` - 组件入口，导出组件和类型
3. 在 `src/index.ts` 中导出组件（用于全量引入）
4. 运行 `npm run generate-exports` 自动生成 `package.json` 的 `exports` 字段
5. 重新构建：`npm run build`

## package.json 导出配置

`package.json` 中的 `exports` 字段定义了支持的导入方式：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js"
    },
    "./line": {
      "types": "./dist/line/index.d.ts",
      "import": "./dist/line/index.esm.js",
      "require": "./dist/line/index.js"
    },
    "./line/style.css": "./dist/line/style.css",
    "./style.css": "./dist/style.css"
  }
}
```

## 脚本说明

| 脚本 | 说明 | 端口/输出 |
|------|------|----------|
| `npm run app:dev` | APP 开发模式 | 3000 |
| `npm run app:build` | APP 生产构建 | distapp/ |
| `npm run web:dev` | WEB 开发模式 | 3009 |
| `npm run web:build` | WEB 生产构建 | distweb/ |
| `npm run build` | 构建组件库（Rollup） | dist/ |
| `npm run build:watch` | 监听构建组件库 | - |
| `npm run type-check` | 类型检查 | - |
| `npm run lint` | 代码检查 | - |
| `npm run generate-exports` | 自动生成 exports 配置 | - |

## 工具函数

库中还提供了一些实用的工具函数：

```tsx
import { cn, debounce, throttle, formatNumber, generateId } from '@zjpcy/charts';

// 类名合并
const className = cn('btn', 'btn-primary', isActive && 'active');

// 防抖
const debouncedFn = debounce(() => console.log('debounced'), 300);

// 节流
const throttledFn = throttle(() => console.log('throttled'), 300);

// 格式化数字
const formatted = formatNumber(1234567.89, 2); // "1,234,567.89"

// 生成唯一ID
const id = generateId('chart'); // "chart-abc123"
```

## License

MIT
