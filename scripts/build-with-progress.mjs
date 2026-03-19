#!/usr/bin/env node
/**
 * 带进度显示的构建脚本
 */

import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// 进度动画相关
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;
let spinnerInterval = null;

// 开始进度动画
const startSpinner = (message) => {
    process.stdout.write('\r' + spinnerFrames[spinnerIndex] + ' ' + message);
    spinnerInterval = setInterval(() => {
        spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
        process.stdout.write('\r' + spinnerFrames[spinnerIndex] + ' ' + message);
    }, 80);
};

// 停止进度动画
const stopSpinner = (successMessage) => {
    if (spinnerInterval) {
        clearInterval(spinnerInterval);
        spinnerInterval = null;
    }
    process.stdout.write('\r' + successMessage + '                              \n');
};

// 获取组件数量
const getComponentCount = () => {
    const componentsDir = join(rootDir, 'src', 'components');
    if (!existsSync(componentsDir)) return 0;
    return readdirSync(componentsDir).filter((name) => {
        const componentPath = join(componentsDir, name);
        return statSync(componentPath).isDirectory();
    }).length;
};

// 清理 dist 目录
const distPath = join(rootDir, 'dist');
if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
}

const totalComponents = getComponentCount();

// 先执行 generate-exports
console.log('🚀 开始构建...\n');

const generateExports = spawn('node', ['scripts/generate-exports.js'], {
    cwd: rootDir,
    stdio: 'pipe'
});

// 立即显示进度动画
startSpinner('正在生成导出文件...');

let generateOutput = '';
generateExports.stdout.on('data', (data) => {
    generateOutput += data.toString();
});

generateExports.on('close', (code) => {
    if (code !== 0) {
        stopSpinner('❌ generate-exports 失败');
        process.exit(1);
    }

    stopSpinner('✅ 导出文件生成完成');
    console.log(`📦 发现 ${totalComponents} 个组件`);

    // 开始 Rollup 构建
    const rollup = spawn('rollup', ['-c', 'rollup.config.mjs'], {
        cwd: rootDir,
        stdio: ['inherit', 'pipe', 'pipe']
    });

    // 立即显示打包进度动画
    startSpinner('正在打包组件，请稍候...');

    // 收集输出但不显示（除了错误）
    rollup.stdout.on('data', () => {});

    rollup.stderr.on('data', (data) => {
        const text = data.toString();
        // 过滤掉警告和 TypeScript 检查信息
        if (text.includes('(!)')) return;
        if (text.includes('TS2307')) return;
        if (text.includes('Cannot find module')) return;
        if (text.toLowerCase().includes('error')) {
            // 停止动画再显示错误
            if (spinnerInterval) {
                clearInterval(spinnerInterval);
                spinnerInterval = null;
            }
            process.stdout.write('\r');
            console.error('❌', text.trim());
            // 重新开始动画
            startSpinner('正在打包组件，请稍候...');
        }
    });

    rollup.on('close', (code) => {
        if (code === 0) {
            stopSpinner('✅ 构建完成！');
            console.log(`📁 输出目录: dist/`);
            console.log(`📊 共打包 ${totalComponents} 个组件`);
            process.exit(0);
        } else {
            stopSpinner(`❌ 构建失败 (exit code: ${code})`);
            process.exit(1);
        }
    });
});
