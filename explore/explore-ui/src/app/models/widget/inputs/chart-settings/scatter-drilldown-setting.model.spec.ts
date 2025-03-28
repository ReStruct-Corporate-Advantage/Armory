import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ScatterDrilldownSetting} from './scatter-drilldown-setting.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';

/**
 * ScatterDrilldownSetting Input tests
 */
describe('ScatterDrilldownSetting test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const scatterDrilldownSetting: ScatterDrilldownSetting = new ScatterDrilldownSetting();
        scatterDrilldownSetting.groupByFirstLevelData = false;

        // Convert the object to string and then back to json again.
        const serializedData: any = scatterDrilldownSetting.serialize();

        const newScatterDrilldownSetting: ScatterDrilldownSetting = ConfigTypeFactory.createConfig(serializedData, scatterDrilldownSetting.getConfigType(), false);
        // Validate that the before and after are the same.
        expect(newScatterDrilldownSetting.groupByFirstLevelData).toBe(scatterDrilldownSetting.groupByFirstLevelData);
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const scatterDrilldownSetting: ScatterDrilldownSetting = new ScatterDrilldownSetting();
        expect(scatterDrilldownSetting.isDataStoreInput()).toBeFalsy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const input1: ScatterDrilldownSetting = new ScatterDrilldownSetting();
        input1.groupByFirstLevelData = true;
        const input2: ScatterDrilldownSetting = new ScatterDrilldownSetting();
        input2.groupByFirstLevelData = true;
        expect(input1.equals(input2)).toBeTruthy();

        // Different groupByFirstLevelData
        input1.groupByFirstLevelData = false;
        expect(input1.equals(input2)).toBeFalsy();
    });

    it('Test shouldSkipSerialize', () => {
        const scatterDrilldownSetting: ScatterDrilldownSetting = new ScatterDrilldownSetting();
        expect(scatterDrilldownSetting.shouldSkipSerialize()).toBeFalsy();
    });
});

