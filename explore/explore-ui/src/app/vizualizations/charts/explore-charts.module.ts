import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreCommitmentRiskChartComponent} from './explore-commitment-risk-chart/explore-commitment-risk-chart.component';
import {ExplorePieChartComponent} from './explore-pie-chart/explore-pie-chart.component';
import {ExploreSunburstChartComponent} from './explore-sunburst-chart/explore-sunburst-chart.component';
import {ExploreBarChartComponent} from './explore-bar-chart/explore-bar-chart.component';
import {ExploreHeatmapChartComponent} from './explore-heatmap-chart/explore-heatmap-chart.component';
import {ExploreTimeSeriesChartComponent} from './explore-time-series-chart/explore-time-series-chart.component';
import {ExploreSlopeGraphComponent} from './explore-slope-graph/explore-slope-graph.component';
import {ExploreTreemapChartComponent} from './explore-treemap-chart/explore-treemap-chart.component';
import {ExploreScatterChartComponent} from './explore-scatter-chart/explore-scatter-chart.component';
import {ExploreReturnsChartComponent} from './explore-returns-chart/explore-returns-chart.component';
import {ExploreExpostTimeSeriesChartComponent} from './explore-expost-time-series-chart/explore-expost-time-series-chart.component';
import {ExploreClarityAiChartComponent} from './explore-clarity-ai-chart/explore-clarity-ai-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import {ExploreDefaultBreadcrumbsComponent} from './explore-default-breadcrumbs/explore-default-breadcrumbs.component';
import {
    ExploreFactorDataTimeSeriesChartComponent
} from './explore-factor-data-chart/explore-factor-data-time-series-chart.component';
import {
    ExploreCommitmentRiskChartLegacyComponent
} from './explore-commitment-risk-chart/explore-commitment-risk-chart-legacy/explore-commitment-risk-chart-legacy.component';
import {ExploreFactorBarChartComponent} from './explore-factor-bar-chart/explore-factor-bar-chart.component';
import {
    CommitmentRiskChartScenarioLegendComponent
} from './explore-commitment-risk-chart/commitment-risk-chart-scenario-legend/commitment-risk-chart-scenario-legend.component';
import { ExploreDecarbonizationChartComponent } from './explore-decarbonization-chart/explore-decarbonization-chart.component';

const COMPONENTS = [
    ExplorePieChartComponent,
    ExploreBarChartComponent,
    ExploreSunburstChartComponent,
    ExploreHeatmapChartComponent,
    ExploreSunburstChartComponent,
    ExploreTimeSeriesChartComponent,
    ExploreSlopeGraphComponent,
    ExploreTreemapChartComponent,
    ExploreScatterChartComponent,
    ExploreReturnsChartComponent,
    ExploreExpostTimeSeriesChartComponent,
    ExploreFactorDataTimeSeriesChartComponent,
    ExploreClarityAiChartComponent,
    ExploreCommitmentRiskChartComponent,
    ExploreCommitmentRiskChartLegacyComponent,
    ExploreDefaultBreadcrumbsComponent,
    ExploreFactorBarChartComponent,
    ExploreDecarbonizationChartComponent
];

@NgModule({
    declarations: [
        COMPONENTS,
        CommitmentRiskChartScenarioLegendComponent,
    ],
    exports: COMPONENTS,
    imports: [
        AladdinAngularComponentsModule,
        HighchartsChartModule,
        CommonModule,
    ]
})
export class ExploreChartsModule {}
