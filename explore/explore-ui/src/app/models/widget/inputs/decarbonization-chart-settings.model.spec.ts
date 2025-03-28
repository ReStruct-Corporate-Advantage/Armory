import {ConfigInitializer} from '../../../initializers/config.initializer';
import {DecarbonizationChartSettings} from './decarbonization-chart-settings.model';
import {ChartWidgetInputConfigType} from '@blk/explore-ui-core';


/**
 * Bar Chart settings tests
 */
describe('DecarbonizationChartSettings test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    const data = {
        columnTag: "ta_rev_int_s12",
        positionColumnType: "PORT",
        selectedScenario: "Nationally Determined Contributions",
        emissionStartYear: "2049",
        aggregationMethod: 1401,
        emissionTargetType: "TA_METRIC_CODE_PRIORITY",
        portfolioTargets: []
    }

    /**
     * Test case for serialize/deserialize
     */
    it('Test constructor and deserialize', function () {
        const settingsWithoutData = new DecarbonizationChartSettings();
        jest.spyOn(settingsWithoutData, 'deserialize');
        expect(settingsWithoutData.deserialize).not.toHaveBeenCalled();

        const settingsWithData = new DecarbonizationChartSettings(data);
        expect(settingsWithData.columnTag).toEqual('ta_rev_int_s12');
        expect(settingsWithData.positionColumnType).toEqual('PORT');
        expect(settingsWithData.selectedScenario).toEqual('Nationally Determined Contributions');
        expect(settingsWithData.emissionStartYear).toEqual('2049');
        expect(settingsWithData.aggregationMethod).toEqual(1401);
        expect(settingsWithData.emissionTargetType).toEqual('TA_METRIC_CODE_PRIORITY');
        expect(settingsWithData.portfolioTargets).toEqual([]);


    });

    it('Test equals', function () {
        const settingsWithoutData = new DecarbonizationChartSettings();
        const settingsWithData = new DecarbonizationChartSettings(data);
        const settingsWithData2 = new DecarbonizationChartSettings(data);

        expect(settingsWithData.equals(settingsWithoutData)).toBeFalsy();
        expect(settingsWithData.equals({})).toBeFalsy();

        expect(settingsWithData.equals(settingsWithData2)).toBeTruthy();
    });

    it('Test Serialize', () => {
        const settingsWithoutData = new DecarbonizationChartSettings();
        const settingsWithData = new DecarbonizationChartSettings(data);
        expect(settingsWithoutData.serialize()).toBeUndefined();
        expect(settingsWithData.serialize()).toEqual(data);
    });

    it('Test ConfigType', () => {
        expect(DecarbonizationChartSettings.configType).toEqual(ChartWidgetInputConfigType.DECARBONIZATION_CHART_SETTINGS)
    });

    it('Test shouldSkipSerialize', () => {
        const settings = new DecarbonizationChartSettings();
        expect(settings.shouldSkipSerialize()).toBeFalsy();
    });
});

