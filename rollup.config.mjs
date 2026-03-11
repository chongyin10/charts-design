import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import { readFileSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

// 组件列表 - 新增组件时在此添加
const components = ['Line', 'Column'];

// resolve 插件配置
const resolveOptions = {
  extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx'],
  preferBuiltins: false,
};

/**
 * 清理单个组件构建目录中多余的类型定义
 * @param {string} lowerName - 组件小写名称
 * @param {string} componentName - 组件原始名称
 */
const cleanupExtraTypes = (lowerName, componentName) => {
  const typesDir = join(__dirname, 'dist', lowerName, 'types', 'components');
  if (!existsSync(typesDir)) return;

  const dirs = readdirSync(typesDir);
  for (const dir of dirs) {
    if (dir !== componentName) {
      const dirPath = join(typesDir, dir);
      rmSync(dirPath, { recursive: true, force: true });
      console.log(`[cleanup] Removed extra types: ${dirPath}`);
    }
  }
};

/**
 * 构建后清理插件
 */
const cleanupPlugin = (componentName) => ({
  name: 'cleanup-extra-types',
  closeBundle() {
    const lowerName = componentName.toLowerCase();
    cleanupExtraTypes(lowerName, componentName);
  },
});

/**
 * 生成单个组件的构建配置
 * @param {string} name - 组件名称
 * @returns {Array} Rollup配置数组
 */
const generateComponentConfig = (name) => {
  const lowerName = name.toLowerCase();

  return [
    // JS + CSS 构建
    {
      input: `src/components/${name}/index.ts`,
      output: [
        {
          file: `dist/${lowerName}/index.js`,
          format: 'cjs',
          sourcemap: true,
          exports: 'named',
        },
        {
          file: `dist/${lowerName}/index.esm.js`,
          format: 'esm',
          sourcemap: true,
        },
      ],
      plugins: [
        peerDepsExternal(),
        typescript({
          tsconfig: './tsconfig.build.json',
          declaration: true,
          declarationDir: `dist/${lowerName}/types`,
          rootDir: 'src',
        }),
        postcss({
          modules: false,
          extract: `style.css`,
          inject: false,
          minimize: true,
          sourceMap: true,
        }),
        resolve(resolveOptions),
        commonjs(),
        // 构建后清理多余的类型定义
        cleanupPlugin(name),
      ],
      external: ['react', 'react-dom', 'classnames', ...Object.keys(packageJson.dependencies || {})],
    },
    // 类型定义构建
    {
      input: `dist/${lowerName}/types/components/${name}/index.d.ts`,
      output: [{ file: `dist/${lowerName}/index.d.ts`, format: 'esm' }],
      plugins: [dts()],
    },
  ];
};

/**
 * 全量入口构建配置（向后兼容）
 */
const fullBundleConfig = [
  // CJS + ESM 构建
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      // TypeScript
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: 'dist/types',
        rootDir: 'src',
      }),
      // PostCSS 处理 CSS
      postcss({
        modules: false,
        extract: 'style.css',
        inject: false,
        minimize: true,
        sourceMap: true,
      }),
      resolve(resolveOptions),
      commonjs(),
    ],
    external: ['react', 'react-dom', 'classnames', ...Object.keys(packageJson.dependencies || {})],
  },
  // 类型定义构建
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
];

// 合并所有配置
export default [
  ...fullBundleConfig,
  ...components.flatMap(generateComponentConfig),
];
