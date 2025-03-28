import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {AbsoluteValueSetting} from './absolute-value-setting.model';
import {ChartWidgetInputConfigType, ConfigTypeFactory} from '@blk/explore-ui-core';

/**
 * AbsoluteValueSetting Input tests
 */
describe('AbsoluteValueSetting test', function () {

    beforeAll((function () {
        ConfigInitializer.registerChartWidgetInputConfigTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const absoluteValueSetting: AbsoluteValueSetting = new AbsoluteValueSetting();
        absoluteValueSetting.useAbsoluteValue = false;

        // Convert the object to string and then back to json again.
        let serializedData: any = absoluteValueSetting.serialize();

        let newAbsoluteValueSetting: AbsoluteValueSetting = ConfigTypeFactory.createConfig(serializedData, absoluteValueSetting.getConfigType(), false);
        // Validate that the before and after are the same.
        expect(newAbsoluteValueSetting.useAbsoluteValue).toBe(absoluteValueSetting.useAbsoluteValue);

        // Mock an old Explore favorite
        serializedData = {sizeValue: true};
        newAbsoluteValueSetting = ConfigTypeFactory.createConfig(serializedData, ChartWidgetInputConfigType.ABSOLUTE_VALUE, false);

        expect(newAbsoluteValueSetting.useAbsoluteValue).toBe(true);
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const absoluteValueSetting: AbsoluteValueSetting = new AbsoluteValueSetting();
        expect(absoluteValueSetting.isDataStoreInput()).toBeFalsy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const input1: AbsoluteValueSetting = new AbsoluteValueSetting();
        input1.useAbsoluteValue = true;
        const input2: AbsoluteValueSetting = new AbsoluteValueSetting();
        input2.useAbsoluteValue = true;
        expect(input1.equals(input2)).toBeTruthy();

        // Different useAbsoluteValue
        input1.useAbsoluteValue = false;
        expect(input1.equals(input2)).toBeFalsy();
    });

    it('Test shouldSkipSerialize', () => {
        const absoluteValueSetting: AbsoluteValueSetting = new AbsoluteValueSetting();
        expect(absoluteValueSetting.shouldSkipSerialize()).toBeFalsy();
    });
});

