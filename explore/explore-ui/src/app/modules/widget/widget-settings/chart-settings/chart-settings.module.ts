import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {ChartSettingsComponent} from './chart-settings.component';
import {GridLinesSettingsComponent} from './grid-lines-settings/grid-lines-settings.component';
import {BarChartSettingsComponent} from './bar-chart-settings/bar-chart-settings.component';
import {SecondaryAxisColumnSettingsComponent} from './secondary-axis-settings/secondary-axis-column-settings.component';
import {ColorScaleSettingsComponent} from './color-scale-settings/color-scale-settings.component';
import {CustomColorPositiveNegativeComponent} from './custom-color-positive-negative/custom-color-positive-negative.component';
import {ReturnChartStyleSettingsComponent} from './return-chart-style-settings/return-chart-style-settings.component';
import {AxesSortOrderSettingsComponent} from './axes-sort-order-settings/axes-sort-order-settings.component';
import {AbsoluteValueSettingsComponent} from './absolute-value-settings/absolute-value-settings.component';
import {PieChartDisplaySettingsComponent} from './pie-chart-display-settings/pie-chart-display-settings.component';
import {ScatterDrilldownSettingsComponent} from './scatter-drilldown-settings/scatter-drilldown-settings.component';
import {AxisSettingsComponent} from './axis-settings/axis-settings.component';
import {HeatmapSettingsComponent} from './heatmap-settings/heatmap-settings.component';
import {TimeSeriesChartSettingsComponent} from './time-series-chart-settings/time-series-chart-settings.component';
import {TimeSeriesTimePeriodSettingsComponent} from './time-series-time-period-settings/time-series-time-period-settings.component';
import {TimeSeriesFormatSettingsComponent} from './time-series-format-settings/time-series-format-settings.component';
import {ComboChartColumnSettingsComponent} from './combo-chart-column-settings/combo-chart-column-settings.component';
import {AxisSortSelectorComponent} from './axes-sort-order-settings/axis-sort-selector.component';
import {LetModule} from '@ngrx/component';
import {TimePeriodIntervalSettingsComponent} from './time-period-interval-settings/time-period-interval-settings.component';
import {PgsStackedBarChartSettingsComponent} from './pgs-stacked-bar-chart-settings/pgs-stacked-bar-chart-settings.component';

@NgModule({
    declarations: [
        ChartSettingsComponent,
        AxisSettingsComponent,
        TimePeriodIntervalSettingsComponent,
        GridLinesSettingsComponent,
        BarChartSettingsComponent,
        SecondaryAxisColumnSettingsComponent,
        ColorScaleSettingsComponent,
        CustomColorPositiveNegativeComponent,
        ReturnChartStyleSettingsComponent,
        AxesSortOrderSettingsComponent,
        AbsoluteValueSettingsComponent,
        PieChartDisplaySettingsComponent,
        ScatterDrilldownSettingsComponent,
        HeatmapSettingsComponent,
        TimeSeriesChartSettingsComponent,
        TimeSeriesTimePeriodSettingsComponent,
        TimeSeriesFormatSettingsComponent,
        ComboChartColumnSettingsComponent,
        AxisSortSelectorComponent,
        PgsStackedBarChartSettingsComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiColumnOptionModule,
        ExploreUiCoreModule,
        LetModule
    ],
    exports: [
        ChartSettingsComponent,
        AxisSettingsComponent,
        TimePeriodIntervalSettingsComponent,
        GridLinesSettingsComponent,
        BarChartSettingsComponent,
        SecondaryAxisColumnSettingsComponent,
        ColorScaleSettingsComponent,
        CustomColorPositiveNegativeComponent,
        ReturnChartStyleSettingsComponent,
        AxesSortOrderSettingsComponent,
        AbsoluteValueSettingsComponent,
        PieChartDisplaySettingsComponent,
        ScatterDrilldownSettingsComponent,
        HeatmapSettingsComponent,
        TimeSeriesChartSettingsComponent,
        TimeSeriesTimePeriodSettingsComponent,
        TimeSeriesFormatSettingsComponent,
        PgsStackedBarChartSettingsComponent
    ]
})
export class ChartSettingsModule {
}
