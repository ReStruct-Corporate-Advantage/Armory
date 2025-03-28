import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommitmentRiskChartScenarioLegendComponent} from './commitment-risk-chart-scenario-legend.component';
import {CommitmentRiskLegendSettings} from '@models/widget/inputs/chart-settings/commitment-risk-legend-settings.model';
import {AuxRadioGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {PercentileRange} from '@enums/commitment-risk-percentiles.enum';

describe('CommitmentRiskChartScenarioLegendComponent', () => {
    let component: CommitmentRiskChartScenarioLegendComponent;
    let fixture: ComponentFixture<CommitmentRiskChartScenarioLegendComponent>;

    let legendSettings: CommitmentRiskLegendSettings;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitmentRiskChartScenarioLegendComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CommitmentRiskChartScenarioLegendComponent);
        component = fixture.componentInstance;

        legendSettings = new CommitmentRiskLegendSettings();
        legendSettings.showBaseScenario = true;
        legendSettings.showStressScenario = true;
        legendSettings.percentileRange = PercentileRange.P10P90;

        component.legendSettings = legendSettings;
        component.scenarioName = 'General Recession';
        fixture.detectChanges();
    });

    it('ngOnInit test', () => {
        legendSettings.percentileRange = PercentileRange.P25P75;

        component.ngOnInit();

        expect(component.percentileRanges[0].checked).toEqual(false);
        expect(component.percentileRanges[1].checked).toEqual(true);
    });

    it('onPercentileRangeChanged test', () => {
        const event = {detail: {value: {eventData: PercentileRange.P25P75}}} as CustomEvent<AuxRadioGroupChangedDetailInterface>;

        component.onPercentileRangeChanged(event);

        expect(component.legendSettings.percentileRange).toEqual(PercentileRange.P25P75);
        expect(component.percentileRanges[0].checked).toEqual(false);
        expect(component.percentileRanges[1].checked).toEqual(true);
    });

    it('toggleBaseScenario test', () => {
        component.legendSettings.showBaseScenario = true;

        component.toggleBaseScenario();

        expect(component.legendSettings.showBaseScenario).toEqual(false);
    });

    it('toggleStressScenario test', () => {
        component.legendSettings.showStressScenario = false;

        component.toggleStressScenario();

        expect(component.legendSettings.showStressScenario).toEqual(true);
    });
});
