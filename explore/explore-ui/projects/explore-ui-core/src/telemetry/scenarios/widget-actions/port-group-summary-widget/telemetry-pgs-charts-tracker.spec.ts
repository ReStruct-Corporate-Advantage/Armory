import {TelemetryPgsChartsTracker} from './telemetry-pgs-charts-tracker';
import {PgsChartsParameter} from '../../../parameters/widget-actions/port-group-summary-widget/telemetry-pgs-charts-parameter';
import {ChartSpriteletClickType, PortGroupSummaryChartLevel, PortGroupSummaryChartType} from '../../../enums';
import {PgsChartsAdditionalSettingsParameter} from '../../../parameters/widget-actions/port-group-summary-widget/telemetry-pgs-charts-additional-settings-parameter';

describe('Telemetry PGS Charts Tracker', () => {
    it(' it should test generateProtoBuff', () => {
        const pgsChartsTracker = new TelemetryPgsChartsTracker();
        const params = new PgsChartsParameter({
            chartType: PortGroupSummaryChartType.PORT_GROUP_SUMMARY_CHART_TYPE_BAR,
            chartLevel: PortGroupSummaryChartLevel.PORT_GROUP_SUMMARY_CHART_LEVEL_AT_THIS_LEVEL,
            chartSpriteletClickType: ChartSpriteletClickType.CHART_SPRITELET_CLICK_TYPE_RIGHT_CLICK,
            pgsChartsAdditionalSettings: new PgsChartsAdditionalSettingsParameter({
                isBreakdownAdded: true,
                isStackedChart: true,
                numberOfObservations: 10
            })
        });
        const stats = pgsChartsTracker.generateProtoBuff(params);
        expect(stats.getLevel()).toBe(1);
        expect(stats.getChartType()).toBe(1);
        expect(stats.getChartSpriteletClickType()).toBe(2);
        expect(stats.getAdditionalSetting().getBreakdown()).toBe(true);
        expect(stats.getAdditionalSetting().getStackedChart()).toBe(true);
        expect(stats.getAdditionalSetting().getObservationNumber()).toBe(10);
        });
});
