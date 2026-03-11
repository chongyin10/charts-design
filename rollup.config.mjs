import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import { readFileSync, rmSync, existsSync, readdirSync, statSync, cpSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

// 自动读取 src/components 目录下的组件文件夹
const getComponentNames = () => {
  const componentsDir = join(__dirname, 'src', 'components');
  if (!existsSync(componentsDir)) return [];

  return readdirSync(componentsDir).filter((name) => {
    const componentPath = join(componentsDir, name);
    return statSync(componentPath).isDirectory();
  });
};

const components = getComponentNames();
console.log('[build] 发现组件:', components);

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
  if (existsSync(typesDir)) {
    const dirs = readdirSync(typesDir);
    for (const dir of dirs) {
      if (dir !== componentName) {
        const dirPath = join(typesDir, dir);
        rmSync(dirPath, { recursive: true, force: true });
        console.log(`[cleanup] Removed extra types: ${dirPath}`);
      }
    }
  }

  // 清理公共类型定义（保留在全量构建的 types 目录中）
  const hooksDir = join(__dirname, 'dist', lowerName, 'types', 'hooks');
  const libDir = join(__dirname, 'dist', lowerName, 'types', 'lib');

  if (existsSync(hooksDir)) {
    rmSync(hooksDir, { recursive: true, force: true });
    console.log(`[cleanup] Removed duplicate hooks types: ${lowerName}`);
  }
  if (existsSync(libDir)) {
    rmSync(libDir, { recursive: true, force: true });
    console.log(`[cleanup] Removed duplicate lib types: ${lowerName}`);
  }
};

/**
 * 复制公共类型到 dist/types 目录（只执行一次）
 */
const copySharedTypes = () => {
  const fullTypesDir = join(__dirname, 'dist', 'types');

  // 从第一个组件的 types 目录复制 hooks 和 lib（如果存在）
  const firstComponent = components[0];
  if (!firstComponent) return;

  const firstComponentTypesDir = join(__dirname, 'dist', firstComponent.toLowerCase(), 'types');
  const hooksSource = join(firstComponentTypesDir, 'hooks');
  const libSource = join(firstComponentTypesDir, 'lib');

  const targetHooksDir = join(fullTypesDir, 'hooks');
  const targetLibDir = join(fullTypesDir, 'lib');

  // 复制 hooks 类型
  if (existsSync(hooksSource) && !existsSync(targetHooksDir)) {
    cpSync(hooksSource, targetHooksDir, { recursive: true });
    console.log(`[shared-types] Copied hooks types to dist/types/hooks`);
  }

  // 复制 lib 类型
  if (existsSync(libSource) && !existsSync(targetLibDir)) {
    cpSync(libSource, targetLibDir, { recursive: true });
    console.log(`[shared-types] Copied lib types to dist/types/lib`);
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
      // 复制公共类型定义
      {
        name: 'copy-shared-types',
        closeBundle() {
          copySharedTypes();
        },
      },
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
