import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {FactorDataHighlightSettings} from './factor-data-highlight-settings.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {HighlightColumnOption, HighlightComparisonType, HighlightSettings} from '@blk/explore-ui-column-option';
import {cloneDeep} from 'lodash';


/**
 * Test cases for FactorDataHighlightSettings.model.ts
 */
describe('FactorDataHighlightSettings tests', function () {
    const highlightSetting = new HighlightSettings();
    highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
    highlightSetting.comparisonRawValues = [50];

    const lowerHighlightSettings: HighlightColumnOption = new HighlightColumnOption();
    const upperHighlightSettings: HighlightColumnOption = new HighlightColumnOption();

    lowerHighlightSettings.highlightSettings = [ cloneDeep(highlightSetting) ];
    upperHighlightSettings.highlightSettings = [ cloneDeep(highlightSetting) ];

    const data: any = {};
    data.lowerHighlightSettings = lowerHighlightSettings.serialize();
    data.upperHighlightSettings = upperHighlightSettings.serialize();

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test serialize/deserialize
     */
    it('Test Serialize/Deserialize', function () {

        // Create factorDataHighlightSettings to serialize
        const factorDataHighlightSettings = new FactorDataHighlightSettings(data);

        // Serialize
        const factorDataHighlightSettingsSerialized: any = factorDataHighlightSettings.serialize();

        // Deserialize
        const factorDataHighlightSettingsDeserialized: FactorDataHighlightSettings =
            ConfigTypeFactory.createConfig(factorDataHighlightSettingsSerialized, FactorDataHighlightSettings.configType, true);

        // Validate
        expect(factorDataHighlightSettings.lowerHighlightSettings).toStrictEqual(factorDataHighlightSettingsDeserialized.lowerHighlightSettings);
        expect(factorDataHighlightSettings.upperHighlightSettings).toStrictEqual(factorDataHighlightSettingsDeserialized.upperHighlightSettings);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const factorDataHighlightSettings1 = new FactorDataHighlightSettings(data);
        let factorDataHighlightSettings2 = new FactorDataHighlightSettings(data);

        // Same settings
        expect(factorDataHighlightSettings1.equals(factorDataHighlightSettings2)).toBe(true);

        // Different lowerHighlightSettings
        factorDataHighlightSettings2.lowerHighlightSettings.highlightSettings[0].comparisonRawValues = [10];
        expect(factorDataHighlightSettings1.equals(factorDataHighlightSettings2)).toBe(false);

        // Different upperHighlightSettings
        factorDataHighlightSettings2 = new FactorDataHighlightSettings(data);
        factorDataHighlightSettings2.upperHighlightSettings.highlightSettings[0].comparisonRawValues = [10];
        expect(factorDataHighlightSettings1.equals(factorDataHighlightSettings2)).toBe(false);
    });
    /**
     * Test case for method equals
     */
    it('Test addRequestParams', function () {
        const factorDataHighlightSettings = new FactorDataHighlightSettings(data);
        const optionValues = {} as any;
        factorDataHighlightSettings.addRequestParams(optionValues);
        expect(optionValues).toStrictEqual({});
    });

    it('Test shouldSkipSerialize', () => {
        const factorDataHighlightSettings = new FactorDataHighlightSettings(data);
        expect(factorDataHighlightSettings.shouldSkipSerialize()).toBe(false);
    });
});
