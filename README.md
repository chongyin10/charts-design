# Design Charts

一个基于 React + Next.js 的组件库，支持双构建配置：

- **Webpack** - 用于开发环境 (Next.js dev server)
- **Rollup** - 用于组件库发布

## 特性

- ⚡️ React 18 + Next.js 14
- 🔧 TypeScript 支持 (TSX/TS/JS/JSX)
- 🎨 CSS Modules 样式隔离
- 📦 双构建配置 (Webpack + Rollup)
- 🎯 组件热更新开发体验
- 📚 类型定义自动生成

## 安装依赖

```bash
npm install
```

## 开发模式 (Webpack)

使用 Next.js 内置的 Webpack 配置进行开发：

```bash
npm run dev
```

访问 http://localhost:3000 查看组件演示

## 构建组件库 (Rollup)

使用 Rollup 打包组件用于发布：

```bash
npm run build:lib
```

输出文件在 `dist/` 目录：
- `dist/index.js` - CommonJS 格式
- `dist/index.esm.js` - ES Module 格式
- `dist/index.d.ts` - TypeScript 类型定义

## 项目结构

```
.
├── src/
│   ├── app/              # Next.js 应用页面
│   ├── components/       # 组件库源码
│   │   ├── Button/
│   │   ├── Card/
│   │   └── Chart/
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数
│   ├── types/            # 类型定义
│   └── index.ts          # 库入口文件
├── next.config.js        # Next.js + Webpack 配置
├── rollup.config.js      # Rollup 构建配置
└── tsconfig.json         # TypeScript 配置
```

## 使用组件库

安装后，你可以这样导入组件：

```tsx
import { Button, Card, Chart } from 'design-charts';
import type { ButtonProps, CardProps, ChartProps } from 'design-charts';

function App() {
  return (
    <Card title="示例">
      <Button variant="primary">点击我</Button>
    </Card>
  );
}
```

## 添加新组件

1. 在 `src/components/` 下创建组件目录
2. 添加组件文件 (`.tsx`)、类型定义 (`.types.ts`)、样式 (`.module.css`)
3. 在 `src/components/[Component]/index.ts` 导出
4. 在 `src/index.ts` 中导出组件
5. 在 `src/app/page.tsx` 添加演示

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Webpack) |
| `npm run build` | 构建 Next.js 应用 |
| `npm run build:lib` | 构建组件库 (Rollup) |
| `npm run build:lib:watch` | 监听构建组件库 |
| `npm run type-check` | 类型检查 |
| `npm run lint` | 代码检查 |

## 许可证

MIT