/**
 * 面积图组件类型定义
 */

/**
 * 数据点配置
 */
export interface AreaPointConfig {
    /** 数据点填充颜色 */
    backgroundColor?: string;
    /** 悬停时数据点填充颜色 */
    hoverBackgroundColor?: string;
    /** 数据点边框颜色 */
    color?: string;
    /** 数据点边框宽度 */
    width?: number;
    /** 数据点样式 */
    style?: 'circle' | 'rect' | 'triangle';
    /** 数据点大小 */
    radius?: number;
    /** 悬停时数据点大小 */
    hoverRadius?: number;
}

/**
 * 数据集配置
 */
export interface AreaDataset {
    /** 数据标签 */
    label: string;
    /** 数据数组 */
    data: number[];
    /** 填充颜色（面积图的主要特征） */
    fillColor?: string;
    /** 填充透明度 (0-1) */
    fillOpacity?: number;
    /** 线条颜色 */
    borderColor?: string;
    /** 线条宽度 */
    borderWidth?: number;
    /** 数据点样式（已废弃，请使用 point 配置） */
    pointStyle?: 'circle' | 'rect' | 'triangle' | 'none';
    /** 数据点大小（已废弃，请使用 point 配置） */
    pointRadius?: number;
    /** 数据点边框颜色（已废弃，请使用 point.color 配置） */
    pointBorderColor?: string;
    /** 数据点填充颜色（已废弃，请使用 point 配置） */
    pointBackgroundColor?: string;
    /** 数据点配置，设置为 false 隐藏数据点 */
    point?: AreaPointConfig | false;
    /** 是否隐藏此数据集 */
    hidden?: boolean;
    /** 堆叠模式下的堆叠键值，相同值的系列会堆叠在一起 */
    stack?: string;
}

/**
 * 图表数据
 */
export interface AreaChartData {
    /** X轴标签 */
    labels: string[];
    /** 数据集数组 */
    datasets: AreaDataset[];
}

/**
 * 网格线配置
 */
export interface AreaGridConfig {
    /** 是否显示网格线 */
    display?: boolean;
    /** 网格线颜色 */
    color?: string;
    /** 网格线宽度 */
    lineWidth?: number;
    /** 网格线透明度 (0-1) */
    opacity?: number;
    /** 是否显示垂直网格线 (X轴方向) */
    vertical?: boolean;
    /** 是否显示水平网格线 (Y轴方向) */
    horizontal?: boolean;
}

/**
 * 坐标轴配置
 */
export interface AreaAxisConfig {
    /** 是否显示 */
    display?: boolean;
    /** 轴标题 */
    title?: {
        text: string;
        color?: string;
        fontSize?: number;
    };
    /** 网格线颜色 (已废弃，请使用 grid 配置) */
    gridColor?: string;
    /** 标签颜色 */
    tickColor?: string;
    /** 标签字体大小 */
    tickFontSize?: number;
    /** 最小值 */
    min?: number;
    /** 最大值 */
    max?: number;
    /** 网格线配置 */
    grid?: AreaGridConfig;
    /** 标签间隔，每 n 个标签显示一个（默认为1，显示所有标签） */
    tickInterval?: number;
    /** 自定义刻度标签，传入后只显示指定的标签，会在图表范围内均匀分布显示 */
    customTicks?: string[];
    /** 自定义刻度位置数组，可选。如果提供，customTicks 会按指定索引位置显示；如果不提供，customTicks 会在图表范围内均匀分布 */
    customTickIndices?: number[];
}

/**
 * 图例配置
 */
export interface AreaLegendConfig {
    /** 是否显示 */
    display?: boolean;
    /** 位置 */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** 标签颜色 */
    labelColor?: string;
    /** 标签字体大小 */
    labelFontSize?: number;
}

/**
 * 提示框配置
 */
export interface AreaTooltipConfig {
    /** 是否显示 */
    enabled?: boolean;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 文字颜色 */
    titleColor?: string;
    /** 内容颜色 */
    bodyColor?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 自定义内容渲染函数，返回 React 节点 */
    customContent?: (data: {
        /** 当前悬停的数据索引 */
        dataIndex: number;
        /** X轴标签 */
        label: string;
        /** 数据项列表 */
        items: AreaTooltipItem[];
    }) => React.ReactNode;
}

/**
 * 竖线配置
 */
export interface AreaVerticalLineConfig {
    /** 是否启用竖线模式（默认 false） */
    enabled?: boolean;
    /** 竖线颜色 */
    color?: string;
    /** 竖线宽度 */
    lineWidth?: number;
    /** 竖线样式（实线/虚线） */
    dash?: number[];
}

/**
 * Tooltip 数据项
 */
export interface AreaTooltipItem {
    /** 数据集标签 */
    label: string;
    /** 数据值 */
    value: number;
    /** 数据集颜色 */
    color: string;
    /** 数据集索引 */
    datasetIndex: number;
}

/**
 * 面积图组件属性
 */
export interface AreaProps {
    /** 图表数据 */
    data: AreaChartData;
    /** 图表宽度 */
    width?: number;
    /** 图表高度 */
    height?: number;
    /** 内边距 */
    padding?: number;
    /** X轴配置 */
    xAxis?: AreaAxisConfig;
    /** Y轴配置 */
    yAxis?: AreaAxisConfig;
    /** 图例配置 */
    legend?: AreaLegendConfig;
    /** 提示框配置 */
    tooltip?: AreaTooltipConfig;
    /** 竖线配置 */
    verticalLine?: AreaVerticalLineConfig;
    /** 动画时长（毫秒） */
    animationDuration?: number;
    /** 是否平滑曲线 */
    smooth?: boolean;
    /** 是否堆叠显示 */
    stacked?: boolean;
    /** 自定义类名 */
    className?: string;
    /** 自定义样式 */
    style?: React.CSSProperties;
    /** 数据点击回调 */
    onDataClick?: (datasetIndex: number, dataIndex: number, value: number) => void;
    /** 图表渲染完成回调 */
    onChartReady?: () => void;
}

/**
 * 计算后的数据点
 */
export interface ComputedPoint {
    x: number;
    y: number;
    value: number;
    label: string;
    datasetIndex: number;
    dataIndex: number;
    stackValue?: number; // 堆叠后的累计值
}

/**
 * 图表配置
 */
export interface AreaChartConfig {
    padding: number;
    chartWidth: number;
    chartHeight: number;
    maxValue: number;
    minValue: number;
    valueRange: number;
}
