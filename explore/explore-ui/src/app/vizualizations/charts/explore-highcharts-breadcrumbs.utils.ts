import {Chart, default as Highcharts, wrap} from 'highcharts';
import {ChartType} from '@qbstr/highcharts-api';
import {merge} from 'lodash';

export class ExploreHighchartsBreadcrumbsUtils {
    static readonly BREADCRUMB_HIDDEN_POSITION_Y = -100;
    static readonly multiColumnMeasuresName = 'Column Measures';
    static readonly breadcrumbsSeparator = '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;';

    static handleHighchartsDefaultBreadcrumbs(): void {
        // wrap allows to extend an existing highcharts prototype function.
        wrap(Chart.prototype, 'getMargins', function (proceed) {

            // Highcharts doesn't support showing breadcrumbs non-drill-downed view.
            // Moreover, Highcharts doesn't correctly calculate the margin when the breadcrumb is manually added to the non-drill-downed view.
            // After checking Highcharts source code, I found that the top margin is added with the below condition only.
            // ** if (breadcrumbs && !breadcrumbs.options.floating && breadcrumbs.level) {...}

            if (ExploreHighchartsBreadcrumbsUtils.isHighchartsDefaultBreadcrumbsSupported(this.userOptions.chart.type)) {
                ExploreHighchartsBreadcrumbsUtils.addHighchartsDefaultBreadcrumbs(this, this.userOptions.chart.type);
            }

            // Now apply the original function with the original arguments, which are sliced off this function's arguments
            proceed.apply(this, Array.prototype.slice.call(arguments, 1));
        });
    }

    private static addHighchartsDefaultBreadcrumbs(chart: any, chartType: ChartType): void {
        // No need to add default breadcrumbs if breadcrumbs with level > 0 exists already.
        if (chart.breadcrumbs && chart.breadcrumbs.level > 0) {
            return;
        }

        // Unlike other charts, Highcharts does not provide a drillup/down callback for treemap and sunburst charts, and therefore, these charts do not utilize ExploreDefaultBreadcrumbs.
        // However, we force the breadcrumbs instance to the chart at the root level along with some modifications to the config.
        // This allows us to populate the breadcrumbs at the root level, despite it not being officially supported by Highcharts.
        if (chartType === ChartType.TREEMAP || chartType === ChartType.SUNBURST) {
            chart.breadcrumbs.options.position = {
                align : 'left',
                verticalAlign : 'top',
                y : -36
            };
            chart.breadcrumbs.options.showFullPath = true;
            chart.breadcrumbs.updateProperties([{level: 0}]);
            // HACK: Before redraw, update the breadcrumbs level (if 0) to tweak the margin calculation condition
            chart.breadcrumbs.level = 1;
            return;
        }

        // Similar to other charts that supports default breadcrumbs (except for treemap and sunburst),
        // the bar chart utilizes the ExploreDefaultBreadcrumbs component to display "Column / Breakdown" labels.
        // However, since we override the breadcrumbs top name later in the process (in bar chart multi-measures case),
        // the breadcrumbs instance needs to be created when we are at the root level (but hidden).
        if ((chartType === ChartType.BAR || chartType === ChartType.COLUMN) && !chart.breadcrumbs) {
            chart.breadcrumbs = new Highcharts['Breadcrumbs'](chart, {});
        }
        // For horizontal bar chart with secondary y axis, highcharts actually adds the breadcrumbs without drilldown (normally highcharts add breadcrumbs only on drilldown state),
        // but it overlaps with the secondary x axis (in the horizontal mode, the secondary y axis gets added at the top of the chart as the secondary x axis).
        //  check the screenshot in the ticket: https://dev.azure.com/1A4D/Explore/_workitems/edit/1608385
        // In this case, hide the breadcrumbs with hidden position and bring it back on drilldown.
        if (chartType === ChartType.BAR && chart.options.yAxis.some(yAxis => yAxis.opposite)) {
            chart.breadcrumbs.options.position = merge({},
                chart.breadcrumbs.options.position,
                {y: ExploreHighchartsBreadcrumbsUtils.BREADCRUMB_HIDDEN_POSITION_Y});
        }

        chart.breadcrumbs.updateProperties([{level: 0}]);
    }

    static getBreadcrumbTopName(columnTitle: string, breakdownTitle: string): string {
        return `${columnTitle}&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;${breakdownTitle}`;
    }

    private static isHighchartsDefaultBreadcrumbsSupported(chartType: ChartType): boolean {
        return chartType === ChartType.SUNBURST
            || chartType === ChartType.TREEMAP
            || chartType === ChartType.COLUMN
            || chartType === ChartType.BAR;
    }
}
