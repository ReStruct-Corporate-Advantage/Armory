import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {CommitmentRiskLegendSettings} from '@models/widget/inputs/chart-settings/commitment-risk-legend-settings.model';
import {PercentileRange} from '@enums/commitment-risk-percentiles.enum';

describe('CommitmentRiskLegendSettings tests', () => {

    beforeAll((() => {
        ConfigInitializer.registerWidgetInputTypes();
    }));


    it('Test Serialize/Deserialize', () => {
        const legendSettings = new CommitmentRiskLegendSettings();
        legendSettings.showBaseScenario = true;
        legendSettings.showStressScenario = false;
        legendSettings.percentileRange = PercentileRange.P25P75;

        const serializedData = legendSettings.serialize();

        const deserializedLegendSettings = new CommitmentRiskLegendSettings(serializedData);
        expect(deserializedLegendSettings.showBaseScenario).toEqual(true);
        expect(deserializedLegendSettings.showStressScenario).toEqual(false);
        expect(deserializedLegendSettings.percentileRange).toEqual(PercentileRange.P25P75);
    });


    it('Test equals', () => {
        const legendSettings = new CommitmentRiskLegendSettings();
        legendSettings.showBaseScenario = true;
        legendSettings.showStressScenario = false;
        legendSettings.percentileRange = PercentileRange.P25P75;

        const legendSettings2 = new CommitmentRiskLegendSettings();
        legendSettings2.showBaseScenario = true;
        legendSettings2.showStressScenario = false;
        legendSettings2.percentileRange = PercentileRange.P25P75;

        expect(legendSettings).toEqual(legendSettings2);

        legendSettings2.showStressScenario = true;
        expect(legendSettings).not.toEqual(legendSettings2);

        legendSettings2.showStressScenario = false;
        legendSettings2.percentileRange = PercentileRange.P10P90;
        expect(legendSettings).not.toEqual(legendSettings2);
    });

});
