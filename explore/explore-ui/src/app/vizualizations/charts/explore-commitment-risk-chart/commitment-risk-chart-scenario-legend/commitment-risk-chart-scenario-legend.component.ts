import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuxRadioGroupChangedDetailInterface, AuxRadioInterface} from '@blk/aladdin-angular-components';
import {CommitmentRiskLegendSettings} from '@models/widget/inputs/chart-settings/commitment-risk-legend-settings.model';
import {PercentileRange} from '@enums/commitment-risk-percentiles.enum';
import { EventType, AcrmCustomLegendChangeEventDetailsKey, TelemetryGenericEventParameters, TelemetryService, TelemetryActionConstants } from '@blk/explore-ui-core';

/**
 * Component to display the custom chart legend for the commitment risk chart with stress scenario enabled
 */
@Component({
    selector: 'app-commitment-risk-chart-scenario-legend',
    templateUrl: './commitment-risk-chart-scenario-legend.component.html',
    styleUrls: ['./commitment-risk-chart-scenario-legend.component.scss']
})
export class CommitmentRiskChartScenarioLegendComponent implements OnInit {

    // name of the stress scenario
    @Input() scenarioName: string;
    // widget settings for the legend
    @Input() legendSettings: CommitmentRiskLegendSettings;

    @Output() scenarioLegendUpdated: EventEmitter<void> = new EventEmitter<void>();

    percentileRanges: AuxRadioInterface[] = [];

    ngOnInit() {
        this.percentileRanges = [
            {label: PercentileRange.P10P90, eventData: PercentileRange.P10P90, checked: this.legendSettings?.percentileRange === PercentileRange.P10P90},
            {label: PercentileRange.P25P75, eventData: PercentileRange.P25P75, checked: this.legendSettings?.percentileRange === PercentileRange.P25P75},
        ];
    }

    /**
     * Event handler for percentile range change
     */
    onPercentileRangeChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        const selectedRange = event.detail.value.eventData;
        this.legendSettings.percentileRange = selectedRange;
        this.percentileRanges.forEach(range => range.checked = range.eventData === selectedRange);
        this.scenarioLegendUpdated.emit();
    }

    /**
     * Toggles the visibility of the base scenario
     */
    toggleBaseScenario(): void {
        this.legendSettings.showBaseScenario = !this.legendSettings?.showBaseScenario;
        TelemetryService.track(TelemetryActionConstants.GENERIC_EVENT, this.generateCustomLegendParameters());
        this.scenarioLegendUpdated.emit();
    }

    /**
     * Toggles the visibility of the stress scenario
     */
    toggleStressScenario(): void {
        this.legendSettings.showStressScenario = !this.legendSettings?.showStressScenario;
        TelemetryService.track(TelemetryActionConstants.GENERIC_EVENT, this.generateCustomLegendParameters());
        this.scenarioLegendUpdated.emit();
    }

    private generateCustomLegendParameters(): TelemetryGenericEventParameters {
        const parameters = new TelemetryGenericEventParameters(EventType.ACRM_CUSTOM_LEGEND_CHANGE);
        //create telemetry parameter for BaseChecked or Scenario Checked
        parameters.details.set(AcrmCustomLegendChangeEventDetailsKey.IS_BASE_CHECKED, String(this.legendSettings.showBaseScenario));
        parameters.details.set(AcrmCustomLegendChangeEventDetailsKey.IS_SCENARIO_CHECKED, String(this.legendSettings.showStressScenario));
        return parameters;
    }
}
