/**
 * 股票图组件入口
 * 用于展示金融市场中证券（如股票、期货、外汇等）价格走势及相关交易数据的专业图表
 * 支持按需引入: import { Stock } from '@zjpcy/charts-design/stock'
 */

// 导入默认导出
import Stock from './Stock';

// 重新导出默认导出
export default Stock;

// 重新导出命名导出
export { Stock };

// 导出类型
export type {
  StockProps,
  StockChartData,
  StockDataPoint,
  StockChartConfig,
  CandlestickConfig,
  VolumeConfig,
  MovingAverageConfig,
  GridConfig,
  AxisConfig,
  XAxisConfig,
  YAxisConfig,
  TooltipConfig,
  CrosshairConfig,
  InteractionConfig,
  TechnicalIndicatorConfig,
  ComputedCandle,
  MovingAveragePoint,
  ComputedLayout,
  TimeRange,
  ChartType,
} from './Stock.type';
