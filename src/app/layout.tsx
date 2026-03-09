import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Design Charts - Component Library',
  description: 'A React + Next.js component library with dual build setup',
};

// 设置 viewport 防止渲染时的抖动
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#667eea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 关键 CSS：在 HTML 中内联背景样式，确保首屏渲染时就有背景色 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}