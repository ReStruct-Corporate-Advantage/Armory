import {ConfigInitializer} from '../../../initializers/config.initializer';
import {PivotTableSettingsModel} from '@models/widget/inputs/pivot-table-settings.model';

/**
 *
 */
describe('PivotTableSettingsModel tests', function () {
    let pivotTableSettings: PivotTableSettingsModel;

    beforeEach(() => {
        ConfigInitializer.registerWidgetInputTypes();
        pivotTableSettings = new PivotTableSettingsModel();
    });

    /**
     *
     */
    it('configType', function() {
        expect(PivotTableSettingsModel.configType).toStrictEqual(PivotTableSettingsModel.PIVOT_SETTING_CONFIG_TYPE);
    });

    /**
     *
     */
    it('equals', function() {
        const otherPivotTableSettings = new PivotTableSettingsModel();

        // Equal
        expect(pivotTableSettings.equals(otherPivotTableSettings)).toStrictEqual(true);

        // Not equal
        otherPivotTableSettings.portBenchActiveEnabled = true;
        expect(pivotTableSettings.equals(otherPivotTableSettings)).toStrictEqual(false);

        // Equals when other is undefined
        expect(pivotTableSettings.equals(undefined)).toStrictEqual(false);
    });

    /**
     *
     */
    it('isDataStoreInput', function() {
        expect(pivotTableSettings.isDataStoreInput()).toStrictEqual(true);
    });

    /**
     *
     */
    it('deserialize', function() {
        // Undefined data
        pivotTableSettings.portBenchActiveEnabled = false;
        pivotTableSettings.deserialize(undefined);
        expect(pivotTableSettings.portBenchActiveEnabled).toStrictEqual(false);

        // Defined data
        pivotTableSettings.deserialize({portBenchActiveEnabled: true});
        expect(pivotTableSettings.portBenchActiveEnabled).toStrictEqual(true);
    });

    /**
     *
     */
    it('serialize', function() {
        pivotTableSettings.portBenchActiveEnabled = true;
        const serialisedPivotTableSettings = pivotTableSettings.serialize();

        expect(serialisedPivotTableSettings.portBenchActiveEnabled).toStrictEqual(true);
    });

    it('Test shouldSkipSerialize', () => {
        expect(pivotTableSettings.shouldSkipSerialize()).toEqual(false);
    });
});

