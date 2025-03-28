import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ChartWidgetInputConfigType, ConfigTypeFactory} from '@blk/explore-ui-core';
import {PgsStackedBarChartSettingsModel} from '@models/widget/inputs/chart-settings/pgs-stacked-bar-chart-settings.model';

/**
 * PieChartDisplayInput Input tests
 */
describe('PgsStackedBarChartSettingsModel test', function () {

    beforeAll((function () {
        ConfigInitializer.registerChartWidgetInputConfigTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const pgsStackedBarChartSettings: PgsStackedBarChartSettingsModel = new PgsStackedBarChartSettingsModel();
        pgsStackedBarChartSettings.isStackedBarChart = true;

        // Convert the object to string and then back to json again.
        let serializedData: any = pgsStackedBarChartSettings.serialize();

        let newPgsStackedBarChartSettings: PgsStackedBarChartSettingsModel = ConfigTypeFactory.createConfig(serializedData, ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS, false);
        // Validate that the before and after are the same.
        expect(newPgsStackedBarChartSettings.isStackedBarChart).toBe(pgsStackedBarChartSettings.isStackedBarChart);
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const pgsStackedBarChartSettings: PgsStackedBarChartSettingsModel = new PgsStackedBarChartSettingsModel();
        expect(pgsStackedBarChartSettings.isDataStoreInput()).toBeFalsy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const pgsStackedBarChartSettings: PgsStackedBarChartSettingsModel = new PgsStackedBarChartSettingsModel();
        pgsStackedBarChartSettings.isStackedBarChart = true;
        const pgsStackedBarChartSettings2: PgsStackedBarChartSettingsModel = new PgsStackedBarChartSettingsModel();
        pgsStackedBarChartSettings2.isStackedBarChart = true;
        expect(pgsStackedBarChartSettings.equals(pgsStackedBarChartSettings2)).toBeTruthy();

        // Different displayAs
        pgsStackedBarChartSettings.isStackedBarChart = false;
        expect(pgsStackedBarChartSettings.equals(pgsStackedBarChartSettings2)).toBeFalsy();
    });

    it('Test shouldSkipSerialize', () => {
        const pgsStackedBarChartSettings: PgsStackedBarChartSettingsModel = new PgsStackedBarChartSettingsModel();
        expect(pgsStackedBarChartSettings.shouldSkipSerialize()).toBeFalsy();
    });
});

