const { readFileSync, writeFileSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

const rootDir = join(__dirname, '..');
const packageJsonPath = join(rootDir, 'package.json');
const componentsDir = join(rootDir, 'src', 'components');

// 读取 package.json
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// 读取组件列表
const getComponentNames = () => {
  if (!statSync(componentsDir).isDirectory()) return [];

  return readdirSync(componentsDir).filter((name) => {
    const componentPath = join(componentsDir, name);
    return statSync(componentPath).isDirectory();
  });
};

// 生成 exports 配置
const generateExports = () => {
  const components = getComponentNames();
  const exports = {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.esm.js',
      require: './dist/index.js',
    },
  };

  components.forEach((name) => {
    const lowerName = name.toLowerCase();
    exports[`./${lowerName}`] = {
      types: `./dist/${lowerName}/index.d.ts`,
      import: `./dist/${lowerName}/index.esm.js`,
      require: `./dist/${lowerName}/index.js`,
    };
    exports[`./${lowerName}/style.css`] = `./dist/${lowerName}/style.css`;
  });

  // 全量样式
  exports['./style.css'] = './dist/style.css';

  return exports;
};

// 更新 package.json
packageJson.exports = generateExports();

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('[generate-exports] 已更新 package.json exports:');
console.log(Object.keys(packageJson.exports).join('\n'));
