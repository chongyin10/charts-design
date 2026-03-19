/**
 * 矩阵树图（Treemap）类型定义
 * 用于展示层级数据的面积比例关系
 */

/**
 * 树图节点 - 支持无限嵌套
 */
export interface TreemapNode {
    /** 节点名称 */
    name: string;
    /** 节点值（叶子节点必须有值） */
    value?: number;
    /** 子节点数组 */
    children?: TreemapNode[];
    /** 自定义颜色 */
    color?: string;
    /** 额外数据 */
    data?: Record<string, unknown>;
}

/**
 * 树图数据
 */
export interface TreemapChartData {
    /** 根节点 */
    root: TreemapNode;
}

/**
 * 计算后的矩形节点
 */
export interface ComputedRect {
    /** 节点数据 */
    node: TreemapNode;
    /** 矩形位置 */
    x: number;
    y: number;
    width: number;
    height: number;
    /** 颜色 */
    color: string;
    /** 深度层级 */
    depth: number;
    /** 占父节点的百分比 */
    percentage: number;
    /** 是否可见 */
    visible: boolean;
}

/**
 * 树图配置
 */
export interface TreemapChartConfig {
    /** 内边距 */
    padding: number;
    /** 图表宽度 */
    chartWidth: number;
    /** 图表高度 */
    chartHeight: number;
}

/**
 * 标签配置
 */
export interface TreemapLabelConfig {
    /** 是否显示标签 */
    display?: boolean;
    /** 标签颜色 */
    color?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 标签格式，支持占位符: {name}, {value}, {percentage} */
    formatter?: string | ((node: TreemapNode, percentage: number) => string);
    /** 最小显示区域的尺寸（小于此值不显示标签） */
    minSize?: number;
}

/**
 * 提示框配置
 */
export interface TreemapTooltipConfig {
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
        /** 节点 */
        node: TreemapNode;
        /** 百分比 (0-100) */
        percentage: number;
        /** 深度层级 */
        depth: number;
    }) => string;
}

/**
 * 树图组件 Props
 */
export interface TreemapProps {
    /** 图表数据 */
    data: TreemapChartData;
    /** 图表宽度 */
    width?: number;
    /** 图表高度 */
    height?: number;
    /** 是否自适应容器大小（默认 true） */
    autoFit?: boolean;
    /** 自定义类名 */
    className?: string;
    /** 自定义样式 */
    style?: React.CSSProperties;
    /** 标签配置 */
    label?: TreemapLabelConfig;
    /** 提示框配置 */
    tooltip?: TreemapTooltipConfig;
    /** 点击事件回调 */
    onNodeClick?: (node: TreemapNode, depth: number) => void;
    /** 悬停事件回调 */
    onNodeHover?: (node: TreemapNode | null, depth: number) => void;
    /** 是否开启动画 */
    animation?: boolean;
    /** 动画时长（毫秒） */
    animationDuration?: number;
    /** 颜色方案 */
    colors?: string[];
    /** 层级深度限制（0为无限制） */
    maxDepth?: number;
    /** 边框颜色 */
    borderColor?: string;
    /** 边框宽度 */
    borderWidth?: number;
}

/**
 * 布局行数据（用于 Squarified 算法）
 */
export interface LayoutRow {
    /** 行中的节点 */
    nodes: TreemapNode[];
    /** 行总值 */
    totalValue: number;
}
