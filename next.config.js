/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // 确保 CSS 在服务端正确渲染
  compiler: {
    // 如果使用 styled-components 则启用
    // styledComponents: true,
  },
  webpack: (config, { isServer, dev }) => {
    // 自定义 webpack 配置
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };

    // 开发环境优化
    if (dev) {
      config.devtool = 'eval-source-map';
    }

    return config;
  },
  // 允许 CSS 模块
  sassOptions: {
    includePaths: [require('path').join(__dirname, 'src/styles')],
  },
};

module.exports = nextConfig;