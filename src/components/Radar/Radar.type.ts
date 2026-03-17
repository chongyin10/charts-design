/**
 * 雷达图组件类型定义
 * 雷达图（Radar）又称蜘蛛网图或星图，用于展示多维度数据的综合表现
 */

/**
 * 雷达图数据项
 */
export interface RadarDataItem {
    /** 维度名称 */
    name: string;
    /** 维度值 */
    value: number;
    /** 最大值（可选，用于自定义该维度的最大值） */
    max?: number;
}

/**
 * 雷达图系列数据
 */
export interface RadarSeries {
    /** 系列名称 */
    name: string;
    /** 数据项数组 */
    data: RadarDataItem[];
    /** 自定义颜色 */
    color?: string;
    /** 线条宽度 */
    lineWidth?: number;
    /** 填充透明度 (0-1) */
    fillOpacity?: number;
    /** 是否显示点 */
    showPoints?: boolean;
    /** 点的大小 */
    pointSize?: number;
    /** 是否使用平滑曲线（贝塞尔曲线） */
    smooth?: boolean;
    /** 是否显示连接线，false 时只显示点（适合散点雷达图） */
    showLine?: boolean;
}

/**
 * 雷达图数据
 */
export interface RadarChartData {
    /** 系列数组（支持多组数据对比） */
    series: RadarSeries[];
    /** 维度配置（可选，用于统一配置各维度） */
    indicators?: RadarIndicator[];
}

/**
 * 雷达图维度指示器
 */
export interface RadarIndicator {
    /** 维度名称 */
    name: string;
    /** 维度最大值 */
    max: number;
    /** 最小值（默认为0） */
    min?: number;
    /** 自定义颜色 */
    color?: string;
}

/**
 * 雷达图标签配置
 */
export interface RadarLabelConfig {
    /** 是否显示标签 */
    display?: boolean;
    /** 标签颜色 */
    color?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 字体粗细 */
    fontWeight?: string;
    /** 距离轴线的距离 */
    offset?: number;
}

/**
 * 雷达图轴线配置
 */
export interface RadarAxisConfig {
    /** 轴线颜色 */
    lineColor?: string;
    /** 轴线宽度 */
    lineWidth?: number;
    /** 是否显示轴线 */
    showLine?: boolean;
}

/**
 * 雷达图刻度标签配置
 */
export interface RadarTickConfig {
    /** 是否显示刻度标签 */
    display?: boolean;
    /** 刻度颜色 */
    color?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 刻度格式化函数，默认为数值 */
    formatter?: (value: number) => string;
    /** 刻度距离轴线的偏移量 */
    offset?: number;
}

/**
 * 雷达图网格配置
 */
export interface RadarGridConfig {
    /** 网格线颜色 */
    lineColor?: string;
    /** 网格线宽度 */
    lineWidth?: number;
    /** 是否显示网格 */
    showGrid?: boolean;
    /** 网格线数量（同心圆数量） */
    gridCount?: number;
    /** 填充颜色 */
    fillColor?: string;
    /** 外轮廓形状：'polygon' 多边形（默认） | 'circle' 圆形 */
    outerShape?: 'polygon' | 'circle';
}

/**
 * 雷达图图例配置
 */
export interface RadarLegendConfig {
    /** 是否显示 */
    display?: boolean;
    /** 位置 */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** 标签颜色 */
    labelColor?: string;
    /** 标签字体大小 */
    labelFontSize?: number;
    /** 水平对齐方式（当position为top/bottom时） */
    align?: 'left' | 'center' | 'right';
}

/**
 * 雷达图提示框配置
 */
export interface RadarTooltipConfig {
    /** 是否显示 */
    enabled?: boolean;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 标题颜色 */
    titleColor?: string;
    /** 内容颜色 */
    bodyColor?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 自定义内容渲染函数 */
    customContent?: (data: {
        /** 系列名称 */
        seriesName: string;
        /** 数据项 */
        item: RadarDataItem;
        /** 系列索引 */
        seriesIndex: number;
        /** 数据索引 */
        dataIndex: number;
    }) => string;
}

/**
 * 雷达图数据点配置
 */
export interface RadarPointConfig {
    /** 是否显示数据点 */
    display?: boolean;
    /** 数据点大小 */
    size?: number;
    /** 数据点填充颜色 */
    fillColor?: string;
    /** 数据点边框宽度 */
    strokeWidth?: number;
}

/**
 * 雷达扫描效果配置
 */
export interface RadarScanConfig {
    /** 是否启用扫描效果 */
    enabled?: boolean;
    /** 扫描线颜色 */
    lineColor?: string;
    /** 扫描线宽度 */
    lineWidth?: number;
    /** 扫描区域填充颜色（渐变色） */
    fillColor?: string;
    /** 扫描速度（度数/秒，默认30） */
    speed?: number;
    /** 扫描扇形角度范围（默认30度） */
    sweepAngle?: number;
    /** 被扫描到的高亮点颜色 */
    highlightColor?: string;
    /** 被扫描到的高亮点大小 */
    highlightSize?: number;
}

/**
 * 雷达图配置
 */
export interface RadarChartConfig {
    /** 画布内边距 */
    padding?: number;
    /** 半径比例（相对于容器最小边） */
    radiusRatio?: number;
    /** 起始角度（度数，默认-90表示从12点方向开始） */
    startAngle?: number;
    /** 动画时长（毫秒） */
    animationDuration?: number;
    /** 是否开启动画 */
    animation?: boolean;
    /** 标签配置（维度名称标签） */
    label?: RadarLabelConfig;
    /** 轴线配置 */
    axis?: RadarAxisConfig;
    /** 刻度标签配置 */
    tick?: RadarTickConfig;
    /** 网格配置 */
    grid?: RadarGridConfig;
    /** 图例配置 */
    legend?: RadarLegendConfig;
    /** 提示框配置 */
    tooltip?: RadarTooltipConfig;
    /** 数据点配置（全局默认） */
    point?: RadarPointConfig;
    /** 雷达扫描效果配置 */
    scan?: RadarScanConfig;
}

/**
 * 雷达图组件属性
 */
export interface RadarProps {
    /** 图表数据 */
    data: RadarChartData;
    /** 图表配置 */
    config?: RadarChartConfig;
    /** 画布宽度（可选，默认自适应容器） */
    width?: number;
    /** 画布高度（可选，默认自适应容器） */
    height?: number;
    /** 自定义类名 */
    className?: string;
    /** 自定义样式 */
    style?: React.CSSProperties;
}

/**
 * 计算后的维度配置
 */
export interface ComputedIndicator {
    name: string;
    max: number;
    min: number;
    color?: string;
    angle: number; // 角度（弧度）
}

/**
 * 计算后的点坐标
 */
export interface ComputedPoint {
    x: number;
    y: number;
    value: number;
    name: string;
    indicatorIndex: number;
}

/**
 * 计算后的系列数据
 */
export interface ComputedSeries {
    name: string;
    color: string;
    lineWidth: number;
    fillOpacity: number;
    showPoints: boolean;
    pointSize: number;
    smooth: boolean;
    showLine: boolean;
    points: ComputedPoint[];
}

/**
 * 图表几何配置
 */
export interface RadarGeometry {
    centerX: number;
    centerY: number;
    radius: number;
}
