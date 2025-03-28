import {AbstractSpriteletLauncherService} from '../spritelet-launcher/abstract-spritelet-launcher.service';
import {ColumnDefinitionSpriteletLauncherService} from '../spritelet-launcher/column-definition-spritelet-launcher.service';
import {FactorBarSpriteletLauncherService} from '../spritelet-launcher/factor-bar-spritelet-launcher.service';
import {FactorDataSpriteletLauncherService} from '@services/spritelet-launcher/factor-data-spritelet-launcher.service';
import {FactorPieSpriteletLauncherService} from '../spritelet-launcher/factor-pie-spritelet-launcher.service';
import {FactorStackBarSpriteletLauncherService} from '../spritelet-launcher/factor-stack-bar-spritelet-launcher.service';
import {PriceChartSpriteletLauncherService} from '../spritelet-launcher/price-chart-spritelet-launcher.service';
import {ReturnDrillDownPerformanceDetailsSpriteletLauncherService} from '../spritelet-launcher/return-drill-down-performance-details-spritelet-launcher.service';
import {ReturnDrillDownTimeSeriesSpriteletLauncherService} from '../spritelet-launcher/return-drill-down-time-series-spritelet-launcher.service';
import {ReturnFXAttributionSpriteletLauncherService} from '../spritelet-launcher/return-fx-attribution-spritelet-launcher.service';
import {ReturnManagerSelectionSpriteletLauncherService} from '../spritelet-launcher/return-manager-selection-spritelet-launcher.service';
import {ReturnPerformanceDetailSpriteletLauncherService} from '../spritelet-launcher/return-performance-detail-spritelet-launcher.service';
import {ReturnTimeSeriesSpriteletLauncherService} from '../spritelet-launcher/return-time-series-spritelet-launcher.service';
import {RiskAndExposureSpriteletLauncherService} from '../spritelet-launcher/risk-and-exposure-spritelet-launcher.service';
import {SecurityContributionLauncherService} from '../spritelet-launcher/security-contribution-launcher.service';
import {TabularViewSpriteletLauncherService} from '../spritelet-launcher/tabular-view-spritelet-launcher.service';
import {AbstractWidgetService} from './abstract-widget.service';
import {BarChartWidgetDataService} from './bar-chart-widget-data.service';
import {ExpostReturnsWidgetDataService} from './expost-returns-widget-data.service';
import {ExpostStatisticsWidgetDataService} from './expost-statistics-widget-data.service';
import {ExpostTimeSeriesWidgetDataService} from './expost-time-series-widget-data.service';
import {FactorBasedAnalysisService} from './factor-based-analysis.service';
import {HeatMapWidgetDataService} from './heat-map-widget-data.service';
import {PortGroupSummaryTimeSeriesWidgetDataService} from './portgroup-summary-time-series-widget-data.service';
import {PieChartWidgetDataService} from './pie-chart-widget-data.service';
import {ClarityAiChartWidgetDataService} from './clarity-ai-chart-widget.service';
import {PivotTableWidgetDataService} from './pivot-table-widget-data.service';
import {PortGroupSummaryService} from './portgroup-summary.service';
import {ReturnAnalysisService} from './return-analysis.service';
import {ReturnSpriteletService} from './return-spritelet.service';
import {ReturnsAnalysisChartWidgetDataService} from './returns-analysis-chart-widget-data.service';
import {RiskAndExposureService} from './risk-and-exposure.service';
import {ScatterChartWidgetDataService} from './scatter-chart-widget-data.service';
import {SecurityContributionDataService} from './security-contribution-data.service';
import {SlopeGraphWidgetDataService} from './slope-graph-widget-data.service';
import {TimeSeriesWidgetDataService} from './time-series-widget-data.service';
import {TreeMapWidgetDataService} from './tree-map-widget-data.service';
import {CommitmentRiskWidgetService} from '@services/widget/commitment-risk-widget.service';
import {CommitmentRiskSpritletLauncherService} from '@services/spritelet-launcher/commitment-risk-spritlet-launcher.service';
import {CommitmentRiskChartWidgetService} from '@services/widget/commitment-risk-chart-widget.service';
import {FactorTimeSeriesSpriteletLauncherService} from '@services/spritelet-launcher/factor-time-series-spritelet-launcher.service';
import {FactorTimeSeriesService} from '@services/widget/factor-time-series.service';
import {MarginAnalyticsCassiniService} from '@services/widget/margin-analytics-cassini.service';
import {LookThroughSummaryService} from '@services/widget/lookthrough-summary.service';
import {FactorDataService} from '@services/widget/factor-data.service';
import {CommitmentRiskWidgetLegacyService} from '@services/widget/commitment-risk-widget-legacy.service';
import {CommitmentRiskChartWidgetLegacyService} from '@services/widget/commitment-risk-chart-widget-legacy.service';
import {PgsBarChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-bar-chart-spritelet-launcher.service';
import {PgsLeafBarChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-leaf-bar-chart-spritelet-launcher.service';
import {PgsTsChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-ts-chart-spritelet-launcher.service';
import {PgsTsLeafChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-ts-leaf-chart-spritelet.launcher.service';
import {
    PgsHvarPnlTimeseriesTableSpritletLauncherService
} from '@services/spritelet-launcher/pgs-hvar-pnl-timeseries-table-spritlet-launcher.service';
import {PnlTimeseriesWidgetDataService} from '@services/widget/pnl-timeseries-widget-data.service';
import {
    PgsMCvarPnlTimeseriesTableSpritletLauncherService
} from '@services/spritelet-launcher/pgs-mcvar-pnl-timeseries-table-spritlet-launcher.service';
import {PortGroupSummaryBarChartService} from '@services/widget/portgroup-summary-bar-chart.service';
import { DecarbonizationChartWidgetDataService } from './decarbonization-chart-widget-data.service';
import {CommitmentRiskExcludedFundsWidgetService} from '@services/widget/commitment-risk-excluded-funds-widget.service';
import {
    CommitmentRiskExcludedFundsLauncherService
} from '@services/spritelet-launcher/commitment-risk-excluded-funds-launcher.service';
import {DiversificationScoreWidgetDataService} from "@services/widget/diversification-score-widget-data.service";
import {
    DiversificationScoreTableSpriteletLauncherService
} from "@services/spritelet-launcher/diversification-score-table-spritelet-launcher.service";

/**
 * The lists are used in widget module
 * in module file function is not allowed to use so they are hardcoded;
 */
export const widgetServiceProviderList = [
    {provide: AbstractWidgetService, useClass: RiskAndExposureService, multi: true},
    {provide: AbstractWidgetService, useClass: BarChartWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: PieChartWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: ScatterChartWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: PortGroupSummaryService, multi: true},
    {provide: AbstractWidgetService, useClass: FactorBasedAnalysisService, multi: true},
    {provide: AbstractWidgetService, useClass: ReturnAnalysisService, multi: true},
    {provide: AbstractWidgetService, useClass: SlopeGraphWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: ReturnSpriteletService, multi: true},
    {provide: AbstractWidgetService, useClass: PivotTableWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: HeatMapWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: TreeMapWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: ExpostReturnsWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: ExpostStatisticsWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: ExpostTimeSeriesWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: TimeSeriesWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: ReturnsAnalysisChartWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: SecurityContributionDataService, multi: true},
    {provide: AbstractWidgetService, useClass: ClarityAiChartWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: CommitmentRiskWidgetService, multi: true},
    {provide: AbstractWidgetService, useClass: CommitmentRiskChartWidgetService, multi: true},
    {provide: AbstractWidgetService, useClass: CommitmentRiskWidgetLegacyService, multi: true},
    {provide: AbstractWidgetService, useClass: CommitmentRiskChartWidgetLegacyService, multi: true},
    {provide: AbstractWidgetService, useClass: CommitmentRiskExcludedFundsWidgetService, multi: true},
    {provide: AbstractWidgetService, useClass: FactorTimeSeriesService, multi: true},
    {provide: AbstractWidgetService, useClass: MarginAnalyticsCassiniService, multi: true},
    {provide: AbstractWidgetService, useClass: LookThroughSummaryService, multi: true},
    {provide: AbstractWidgetService, useClass: FactorDataService, multi: true},
    {provide: AbstractWidgetService, useClass: PortGroupSummaryTimeSeriesWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: PnlTimeseriesWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: PortGroupSummaryBarChartService, multi: true},
    {provide: AbstractWidgetService, useClass: DecarbonizationChartWidgetDataService, multi: true},
    {provide: AbstractWidgetService, useClass: DiversificationScoreWidgetDataService, multi: true}

];
export const spriteletLauncherServiceProviderList = [
    {provide: AbstractSpriteletLauncherService, useClass: ReturnTimeSeriesSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: ReturnPerformanceDetailSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: ReturnDrillDownTimeSeriesSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: ReturnDrillDownPerformanceDetailsSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: ReturnManagerSelectionSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: ReturnFXAttributionSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: RiskAndExposureSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: ColumnDefinitionSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: TabularViewSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: PriceChartSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: FactorBarSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: FactorPieSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: FactorStackBarSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: SecurityContributionLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: CommitmentRiskSpritletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: FactorTimeSeriesSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: FactorDataSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: PgsBarChartSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: PgsLeafBarChartSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: PgsLeafBarChartSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: PgsTsChartSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: PgsTsLeafChartSpriteletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: PgsHvarPnlTimeseriesTableSpritletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: PgsMCvarPnlTimeseriesTableSpritletLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: CommitmentRiskExcludedFundsLauncherService, multi: true},
    {provide: AbstractSpriteletLauncherService, useClass: DiversificationScoreTableSpriteletLauncherService, multi: true}
];
