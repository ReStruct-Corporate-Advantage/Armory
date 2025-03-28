import {isObject} from 'lodash';
import {PortGroupSummaryChartType, PortGroupSummaryChartLevel, ChartSpriteletClickType} from '../../../enums';
import {PgsChartsAdditionalSettingsParameter} from './telemetry-pgs-charts-additional-settings-parameter';

/**
 * PgsChartsParameter captures the parameters for the all PGS charts spawned from PGS widget.
 */
export class PgsChartsParameter {
    chartType: PortGroupSummaryChartType;
    chartLevel: PortGroupSummaryChartLevel;
    chartSpriteletClickType: ChartSpriteletClickType;
    pgsChartsAdditionalSettings: PgsChartsAdditionalSettingsParameter;

    /**
     * Constructor.
     */
    constructor(data) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    private deserialize(data) {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.chartType = data.chartType;
        this.chartLevel = data.chartLevel;
        this.chartSpriteletClickType = data.chartSpriteletClickType;
        this.pgsChartsAdditionalSettings = data.pgsChartsAdditionalSettings;
    }
}
