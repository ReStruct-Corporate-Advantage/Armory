import { ConfigTypeFactory } from '@blk/explore-ui-core';

import { ConfigInitializer } from '../../../../initializers/config.initializer';
import { ReturnChartStyleSettingsModel } from './return-chart-style-settings.model';

/**
 * Return Chart style Setting model test cases
 */
describe('Return Chart Style Settings test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const returnChartStyleData: ReturnChartStyleSettingsModel = new ReturnChartStyleSettingsModel();
        returnChartStyleData.showPortfolio = true;
        returnChartStyleData.showActive = true;
        returnChartStyleData.showBenchmark = true;
        returnChartStyleData.showActiveCumulative = false;
        returnChartStyleData.showPortfolioCumulative = true;
        returnChartStyleData.showBenchmarkCumulative = false;
        returnChartStyleData.showBaseline = false;
        returnChartStyleData.dateFormat = 'm/yy';

        // Convert the object to string and then back to json again.
        const serializedData: any = returnChartStyleData.serialize();

        const newReturnChartStyleData: ReturnChartStyleSettingsModel = ConfigTypeFactory.createConfig(serializedData, ReturnChartStyleSettingsModel.configType, false);
        // Validate that the before and after are the same.
        expect(newReturnChartStyleData).toStrictEqual(returnChartStyleData);
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const returnChartStyleSettings: ReturnChartStyleSettingsModel = new ReturnChartStyleSettingsModel();
        expect(returnChartStyleSettings.isDataStoreInput()).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const input1: ReturnChartStyleSettingsModel = new ReturnChartStyleSettingsModel();
        input1.showPortfolio = true;
        input1.showPortfolioCumulative = false;
        input1.showDataMarker = true;
        const input2: ReturnChartStyleSettingsModel = new ReturnChartStyleSettingsModel();
        input2.showPortfolio = true;
        input2.showPortfolioCumulative = false;
        input2.showDataMarker = true;

        // Both object have same fields
        expect(input1.equals(input2)).toBeTruthy();

        // Change one of it's fields
        input2.showPortfolioCumulative = true;
        expect(input1.equals(input2)).toBeFalsy();

        // Adding more scenarios, populate all checkbox options
        input1.showPortfolioCumulative = true;
        input1.showActive = true;
        input1.showActiveCumulative = true;
        input1.showBenchmark = true;
        input1.showBenchmarkCumulative = true;
        input2.showDataMarker = true;

        input2.showActive = true;
        input2.showActiveCumulative = true;
        input2.showBenchmark = true;
        input2.showBenchmarkCumulative = true;
        input2.showDataMarker = true;

        expect(input1.equals(input2)).toBeTruthy();

        // change any of boolean
        input2.showActiveCumulative = false;
        expect(input1.equals(input2)).toBeFalsy();
    });

    it('Test shouldSkipSerialize', () => {
        const returnChartStyleSettings: ReturnChartStyleSettingsModel = new ReturnChartStyleSettingsModel();
        expect(returnChartStyleSettings.shouldSkipSerialize()).toBeFalsy();
    });
});
