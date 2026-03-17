// 库入口文件 - 导出所有组件和工具
// 使用子路径导入获取按需加载支持
export { Line, default as LineDefault } from './components/Line';
export { Column, default as ColumnDefault } from './components/Column';
export { Area, default as AreaDefault } from './components/Area';
export { Pie, default as PieDefault } from './components/Pie';
export { Funnel, default as FunnelDefault } from './components/Funnel';
export { Heatmap, default as HeatmapDefault } from './components/Heatmap';
export { Liquid, default as LiquidDefault } from './components/Liquid';
export { BoxPlot, default as BoxPlotDefault } from './components/Box';
export { Gauge, default as GaugeDefault } from './components/Gauge';
export { Radar, default as RadarDefault } from './components/Radar';
export { Sankey, default as SankeyDefault } from './components/Sankey';

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

export type {
  LiquidProps,
  LiquidData,
  LiquidChartConfig,
  LiquidWaveConfig,
  LiquidBorderConfig,
  LiquidTextConfig,
} from './components/Liquid/Liquid.type';

export type {
  BoxPlotProps,
  BoxPlotChartData,
  BoxPlotDataset,
  BoxPlotItem,
  BoxPlotChartConfig,
  ComputedBox,
  BoxPlotTooltipItem,
  BoxPlotGridConfig,
  BoxPlotXAxisConfig,
  BoxPlotYAxisConfig,
  BoxPlotTooltipConfig,
} from './components/Box/Box.type';

export type {
  GaugeProps,
  GaugeData,
  GaugeChartConfig,
  GaugeAxisConfig,
  GaugeProgressConfig,
  GaugePointerConfig,
  GaugePivotConfig,
  GaugeTextConfig,
  GaugeRangeConfig,
} from './components/Gauge/Gauge.type';

export type {
  RadarProps,
  RadarChartData,
  RadarSeries,
  RadarDataItem,
  RadarIndicator,
  RadarLabelConfig,
  RadarAxisConfig,
  RadarGridConfig,
  RadarLegendConfig,
  RadarTooltipConfig,
  RadarChartConfig,
} from './components/Radar/Radar.type';

export type {
  SankeyProps,
  SankeyChartData,
  SankeyNode,
  SankeyLink,
  SankeyNodeConfig,
  SankeyLinkConfig,
  SankeyLayoutConfig,
  SankeyTooltipConfig,
  SankeyLegendConfig,
  SankeyAnimationConfig,
  ComputedNode,
  ComputedLink,
  SankeyChartConfig,
} from './components/Sankey/Sankey.type';

// 导出工具函数
export { cn, formatNumber, generateId, debounce, throttle } from './lib/utils';
