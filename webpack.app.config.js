const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: isProduction ? 'production' : 'development',
        entry: './src/app/index.tsx',
        output: {
            path: path.resolve(__dirname, 'distapp'),
            filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
            chunkFilename: isProduction ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
            publicPath: '/',
            clean: true,
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@/components': path.resolve(__dirname, 'src/components'),
                '@/lib': path.resolve(__dirname, 'src/lib'),
                '@/hooks': path.resolve(__dirname, 'src/hooks'),
                '@/types': path.resolve(__dirname, 'src/types'),
            },
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.app.json',
                        },
                    },
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    namedExport: false,
                                    exportLocalsConvention: 'camelCase',
                                    localIdentName: isProduction
                                        ? '[hash:base64:8]'
                                        : '[name]__[local]__[hash:base64:4]',
                                },
                                importLoaders: 1,
                                esModule: true,
                            },
                        },
                        'postcss-loader',
                    ],
                },
                {
                    test: /\.css$/,
                    include: /node_modules/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        'postcss-loader',
                    ],
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[name].[contenthash:8][ext]',
                    },
                },
                {
                    test: /\.json$/,
                    use: 'json-loader',
                    type: 'javascript/auto',
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: './src/app/index.html',
                filename: 'index.html',
                title: 'Design Charts - 组件示例',
                meta: {
                    description: 'Design Charts 组件库示例展示',
                    viewport: 'width=device-width, initial-scale=1',
                },
                minify: isProduction
                    ? {
                          removeComments: true,
                          collapseWhitespace: true,
                          removeRedundantAttributes: true,
                          useShortDoctype: true,
                          removeEmptyAttributes: true,
                          removeStyleLinkTypeAttributes: true,
                          keepClosingSlash: true,
                          minifyJS: true,
                          minifyCSS: true,
                          minifyURLs: true,
                      }
                    : false,
            }),
            ...(isProduction
                ? [
                      new MiniCssExtractPlugin({
                          filename: '[name].[contenthash:8].css',
                          chunkFilename: '[name].[contenthash:8].chunk.css',
                      }),
                  ]
                : []),
        ],
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true,
                            drop_debugger: true,
                        },
                        format: {
                            comments: false,
                        },
                    },
                    extractComments: false,
                }),
                new CssMinimizerPlugin(),
            ],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
            runtimeChunk: 'single',
        },
        performance: {
            hints: false,
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'distapp'),
            },
            hot: true,
            open: true,
            port: 3000,
            historyApiFallback: true,
            compress: true,
        },
        devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
    };
};
