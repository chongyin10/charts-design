// 库入口文件 - 导出所有组件和工具
// 使用子路径导入获取按需加载支持
export { Line, default as LineDefault } from './components/Line';
export { Column, default as ColumnDefault } from './components/Column';
export { Area, default as AreaDefault } from './components/Area';

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

// 导出工具函数
export { cn, formatNumber, generateId, debounce, throttle } from './lib/utils';
