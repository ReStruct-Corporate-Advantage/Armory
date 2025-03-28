/**
 * Constants for widget gallery
 */
export class WidgetGalleryConstants {
    static readonly SHOW_ALL_TAB = '0';
    static readonly TABLES_TAB = '1';
    static readonly CHARTS_TAB = '2';

    static readonly WIDGET_POPULARITY_ORDER = [
        'riskExposure',
        'returnsWidget',
        'bar',
        'ts',
        'pgsWidget',
        'praWidget',
        'returnChartWidget',
        'pie',
        'scatter',
        'heatmap',
        'expostReturnsWidget',
        'expostStatsWidget',
        'expostTimeSeriesWidget',
        'pivotWidget',
        'treemap',
        'slopeGraph',
        'clarity',
        'commitmentRiskChartWidget2',
        'commitmentRiskChartWidget',
        'cassiniMarginAnalyticsWidget',
        'decarbonizationWidget'
    ];

    static readonly TABS_LABEL_DATA = [
        {
            'label' : 'Show All',
            'uid': this.SHOW_ALL_TAB
        },
        {
            'label': 'Tables',
            'uid': this.TABLES_TAB
        },
        {
            'label': 'Charts',
            'uid': this.CHARTS_TAB
        }];

    static readonly SHOW_ALL_TAB_DESCRIPTION = 'Our Widgets offer deeper and more varied views into your data. Learn more about what each tabular and chart widget can do.';
    static readonly TABLES_TAB_DESCRIPTION = 'Our Widgets offer deeper and more varied views into your data. Learn more about what each tabular widget can do.';
    static readonly CHARTS_TAB_DESCRIPTION = 'Our Widgets offer deeper and more varied views into your data. Learn more about what each chart widget can do.';

}
