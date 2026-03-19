# Design Charts 构建环境指南

本项目包含三个独立的构建环境，分别用于不同的目的：

## 1. src/app - 组件示例环境

用于展示组件的各种使用示例和说明文档。

### 配置
- **入口文件**: `src/app/index.tsx`
- **Webpack 配置**: `webpack.app.config.js`
- **TypeScript 配置**: `tsconfig.app.json`
- **输出目录**: `distapp/`
- **开发端口**: 3000

### 命令
```bash
# 开发模式
npm run app:dev

# 生产构建
npm run app:build

# 预览生产版本
npm run app:serve
```

## 2. src/components - 组件发布环境

用于构建发布到 npm 的组件库，支持 Tree-shaking 和按需引入。

### 配置
- **入口文件**: `src/index.ts`
- **构建工具**: Rollup
- **配置**: `rollup.config.mjs`
- **输出目录**: `dist/`

### 命令
```bash
# 构建组件库
npm run build

# 监听模式
npm run build:watch
```

### 发布
```bash
npm publish
```

## 3. src/web - 官网环境

用于构建项目官网，展示组件库特性和复杂示例。

### 配置
- **入口文件**: `src/web/index.tsx`
- **Webpack 配置**: `webpack.web.config.js`
- **TypeScript 配置**: `tsconfig.web.json`
- **输出目录**: `distweb/`
- **开发端口**: 3009

### 命令
```bash
# 开发模式
npm run web:dev

# 生产构建
npm run web:build

# 预览生产版本
npm run web:serve
```

## 环境对比

| 环境 | 目的 | 开发端口 | 构建输出 | 开发命令 | 构建命令 |
|------|------|----------|----------|----------|----------|
| src/app | 组件示例 | 3000 | distapp/ | npm run app:dev | npm run app:build |
| src/components | npm 发布 | - | dist/ | - | npm run build |
| src/web | 官网 | 3009 | distweb/ | npm run web:dev | npm run web:build |

## 快速开始

### 开发组件示例
```bash
npm run app:dev
# 访问 http://localhost:3000
```

### 开发官网
```bash
npm run web:dev
# 访问 http://localhost:3009
```

### 构建组件库发布
```bash
npm run build
# 输出到 dist/ 目录
```

## 注意事项

1. **src/app** 和 **src/web** 使用 Webpack 构建，支持热更新
2. **src/components** 使用 Rollup 构建，优化了库打包
3. 三个环境完全独立，可以同时运行
4. 每个环境有独立的 TypeScript 配置，避免类型冲突
