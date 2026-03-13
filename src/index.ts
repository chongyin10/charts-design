// 库入口文件 - 导出所有组件和工具
// 使用子路径导入获取按需加载支持
export { Line, default as LineDefault } from './components/Line';
export { Column, default as ColumnDefault } from './components/Column';
export { Area, default as AreaDefault } from './components/Area';
export { Pie, default as PieDefault } from './components/Pie';
export { Funnel, default as FunnelDefault } from './components/Funnel';
export { Heatmap, default as HeatmapDefault } from './components/Heatmap';

// 导出类型定义
export type {
  LineProps,
  LineChartData,
  LineDataset,
  LineAxisConfig,
  LineLegendConfig,
  LineTooltipConfig,
  LineThresholdConfig,
  LineGridConfig,
} from './components/Line/Line.type';

export type {
  ColumnProps,
  ColumnChartData,
  ColumnDataset,
  ColumnAxisConfig,
  ColumnLegendConfig,
  ColumnTooltipConfig,
  ColumnGridConfig,
  ColumnConfig,
} from './components/Column/Column.type';

export type {
  AreaProps,
  AreaChartData,
  AreaDataset,
  AreaAxisConfig,
  AreaLegendConfig,
  AreaTooltipConfig,
  AreaGridConfig,
} from './components/Area/Area.type';

export type {
  PieProps,
  PieChartData,
  PieDataItem,
  PieLabelConfig,
  PieLegendConfig,
  PieTooltipConfig,
  ComputedSlice,
} from './components/Pie/Pie.type';

export type {
  FunnelProps,
  FunnelChartData,
  FunnelDataItem,
  FunnelLabelConfig,
  FunnelConversionConfig,
  FunnelLegendConfig,
  FunnelTooltipConfig,
} from './components/Funnel/Funnel.type';

export type {
  HeatmapProps,
  HeatmapChartData,
  HeatmapDataset,
  HeatmapColorScaleConfig,
  HeatmapAxisConfig,
  HeatmapGridConfig,
  HeatmapLegendConfig,
  HeatmapTooltipConfig,
  HeatmapLabelConfig,
} from './components/Heatmap/Heatmap.type';

// 导出工具函数
export { cn, formatNumber, generateId, debounce, throttle } from './lib/utils';
