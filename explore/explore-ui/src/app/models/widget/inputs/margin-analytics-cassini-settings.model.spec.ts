import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../../initializers/config.initializer';
import {MarginAnalyticsCassiniSettings} from '@models/widget/inputs/margin-analytics-cassini-settings.model';

describe('Margin Analytics Cassini settings test case', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', () => {
        const marginAnalyticsCassiniSettings = new MarginAnalyticsCassiniSettings();
        marginAnalyticsCassiniSettings.groupingStyle = 'Portfolio';
        marginAnalyticsCassiniSettings.calculationStyle = 'LEVEL_PROPORTIONAL';
        // Convert the object to string and then back to json again.
        const serializedData: any = marginAnalyticsCassiniSettings.serialize();

        const newMarginAnalyticsCassiniSettingsInput = ConfigTypeFactory.createConfig(serializedData, MarginAnalyticsCassiniSettings.MARGIN_ANALYTICS_CASSINI_SETTING_CONFIG_TYPE, false);
        // Validate that the before and after are the same.
        expect(marginAnalyticsCassiniSettings).toEqual(newMarginAnalyticsCassiniSettingsInput);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', () => {
        const input1 = new MarginAnalyticsCassiniSettings();
        const input2 = new MarginAnalyticsCassiniSettings();
        expect(input1.equals(input2)).toBeTruthy();

        // Differ in useAbsolute boolean value
        input1.groupingStyle = 'Portfolio';
        input2.groupingStyle = 'Instrument';

        input1.calculationStyle = 'LEVEL_PROPORTIONAL';
        input2.calculationStyle = 'LEVEL_PROPORTIONAL';
        expect(input1.equals(input2)).toBeFalsy();
        input2.groupingStyle = 'Portfolio';
        input2.calculationStyle = 'MARGINAL_MARGIN';
        expect(input1.equals(input2)).toBeFalsy();
        input2.calculationStyle = 'LEVEL_PROPORTIONAL';
        expect(input1.equals(input2)).toBeTruthy();
    });

    it('hasDataStoreInput test case', () => {
        const marginAnalyticsCassiniSettings = new MarginAnalyticsCassiniSettings();
        expect(marginAnalyticsCassiniSettings.isDataStoreInput()).toBeTruthy();
    });

    it('addRequestParams test case', () => {
        const marginAnalyticsCassiniSettings = new MarginAnalyticsCassiniSettings({
            groupingStyle: 'Portfolio',
            calculationStyle: 'LEVEL_PROPORTIONAL'
        });
        const requestParams = new Map<string, any>();
        marginAnalyticsCassiniSettings.addRequestParams(requestParams);
        expect(requestParams[MarginAnalyticsCassiniSettings.MARGIN_ANALYTICS_CASSINI_SETTING_CONFIG_TYPE]).toEqual({
            groupingStyle: 'Portfolio',
            calculationStyle: 'LEVEL_PROPORTIONAL'
        });
    });

    it('Test shouldSkipSerialize', () => {
        const model = new MarginAnalyticsCassiniSettings();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});
