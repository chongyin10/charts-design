import { useRef, useEffect, useState } from 'react';

/**
 * 图表数据类型
 */
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

/**
 * 图表类型
 */
export type ChartType = 'bar' | 'line' | 'pie';

interface UseChartOptions {
  data: ChartData;
  type: ChartType;
  width: number;
  height: number;
}

export const useChart = ({ data, type, width, height }: UseChartOptions) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartRef.current) return;

    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 简单的图表绘制示例
    const drawChart = () => {
      ctx.clearRect(0, 0, width, height);

      // 绘制背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // 绘制简单的柱状图作为示例
      if (type === 'bar') {
        drawBarChart(ctx, data, width, height);
      } else if (type === 'line') {
        drawLineChart(ctx, data, width, height);
      } else if (type === 'pie') {
        drawPieChart(ctx, data, width, height);
      }

      setIsLoading(false);
    };

    drawChart();
  }, [data, type, width, height]);

  return { chartRef, isLoading };
};

// 绘制柱状图
function drawBarChart(
  ctx: CanvasRenderingContext2D,
  data: ChartData,
  width: number,
  height: number
) {
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const datasets = data.datasets[0]?.data || [];
  const maxValue = Math.max(...datasets, 1);
  const barWidth = (chartWidth / datasets.length) * 0.6;
  const barSpacing = chartWidth / datasets.length;

  // 绘制坐标轴
  ctx.strokeStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // 绘制柱子
  datasets.forEach((value: number, index: number) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
    const y = height - padding - barHeight;

    ctx.fillStyle = (data.datasets[0].backgroundColor as string) || '#3b82f6';
    ctx.fillRect(x, y, barWidth, barHeight);

    // 绘制数值
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(value), x + barWidth / 2, y - 5);
  });
}

// 绘制折线图
function drawLineChart(
  ctx: CanvasRenderingContext2D,
  data: ChartData,
  width: number,
  height: number
) {
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const datasets = data.datasets[0]?.data || [];
  const maxValue = Math.max(...datasets, 1);

  // 绘制坐标轴
  ctx.strokeStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // 绘制折线
  ctx.strokeStyle = data.datasets[0].borderColor || '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();

  datasets.forEach((value: number, index: number) => {
    const x = padding + (index / (datasets.length - 1 || 1)) * chartWidth;
    const y = height - padding - (value / maxValue) * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // 绘制数据点
  datasets.forEach((value: number, index: number) => {
    const x = padding + (index / (datasets.length - 1 || 1)) * chartWidth;
    const y = height - padding - (value / maxValue) * chartHeight;

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 绘制饼图
function drawPieChart(
  ctx: CanvasRenderingContext2D,
  data: ChartData,
  width: number,
  height: number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;
  const datasets = data.datasets[0]?.data || [];
  const total = datasets.reduce((sum: number, value: number) => sum + value, 0) || 1;

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  let currentAngle = -Math.PI / 2;

  datasets.forEach((value: number, index: number) => {
    const sliceAngle = (value / total) * Math.PI * 2;

    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();

    currentAngle += sliceAngle;
  });
}
