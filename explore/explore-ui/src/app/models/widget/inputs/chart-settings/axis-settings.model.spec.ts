import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ChartWidgetInputConfigType, ConfigTypeFactory} from '@blk/explore-ui-core';
import {AxisSettings, AxisType} from '@models/widget/inputs/chart-settings/axis-settings.model';

describe('AxisSettings test', () => {
    beforeAll((function () {
        ConfigInitializer.registerChartWidgetInputConfigTypes();
    }));

    /**
     * Test serialize/deserialize
     */
    it('should test AxisSettings', () => {
        // serialize/deserialize check
        const axisSettings = new AxisSettings({axisType: 'PRIMARY', axisTitle: 'primaryAxis', hideAxisTitle: false, yLowerBound: 0, yUpperBound: 50, yInterval: 10});

        const serializedConfig = axisSettings.serialize();

        const deserializedConfig = ConfigTypeFactory.createConfig(serializedConfig, ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS);
        expect(axisSettings).toEqual(deserializedConfig);

        // equal check
        expect(axisSettings).toEqual(deserializedConfig);

        // isDataStoreInput check
        expect(axisSettings.isDataStoreInput()).toBeTruthy();

        expect(axisSettings.isEmpty()).toBeFalsy();
    });

    it('should deserialize with legacy input', () => {
        let callback = jest.fn();
        let serializedLegacyConfig = {overrideAxisTitle: {primaryAxisTitle: 'legacyPrimaryTitle1', secondaryAxisTitle: 'legacySecondaryTitle1'}} as any;
        AxisSettings.deserializeLegacyWidgetInput(serializedLegacyConfig, callback);

        expect(callback).toHaveBeenNthCalledWith(1, ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS, {axisType: AxisType.PRIMARY, axisTitle: 'legacyPrimaryTitle1'});
        expect(callback).toHaveBeenNthCalledWith(2, ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS, {axisType: AxisType.SECONDARY, axisTitle: 'legacySecondaryTitle1'});

        callback = jest.fn();
        serializedLegacyConfig = {primaryAxisTitle: 'legacyPrimaryTitle2', secondaryAxisTitle: 'legacySecondaryTitle2'} as any;
        AxisSettings.deserializeLegacyWidgetInput(serializedLegacyConfig, callback);

        expect(callback).toHaveBeenNthCalledWith(1, ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS, {axisType: AxisType.PRIMARY, axisTitle: 'legacyPrimaryTitle2'});
        expect(callback).toHaveBeenNthCalledWith(2, ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS, {axisType: AxisType.SECONDARY, axisTitle: 'legacySecondaryTitle2'});
    });

    it('Test shouldSkipSerialize', () => {
        const axisSettings = new AxisSettings({axisType: 'PRIMARY', axisTitle: 'primaryAxis', hideAxisTitle: false, yLowerBound: 0, yUpperBound: 50, yInterval: 10});
        expect(axisSettings.shouldSkipSerialize()).toBeFalsy();
    });
});
