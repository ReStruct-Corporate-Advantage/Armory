import {ChartMarkerSymbol, ChartType} from '@qbstr/highcharts-api';
import {BarChartAdditionalSettings} from '@models/widget/inputs/chart-settings/bar-chart-additional-settings.model';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';
import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ConfigTypeFactory} from '@blk/explore-ui-core';

/**
 * BarChartAdditionalSettings Input tests
 */
describe('BarChartAdditionalSettings test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function () {
        const barChartAdditionalSettings = new BarChartAdditionalSettings();
        barChartAdditionalSettings.stackByImmediateChild = true;
        barChartAdditionalSettings.showSelected = true;

        // convert the object to string and then back to json again.
        const serializedData: any = barChartAdditionalSettings.serialize();
        const newBarChartAdditionalSettings: BarChartAdditionalSettings = ConfigTypeFactory.createConfig(serializedData, barChartAdditionalSettings.getConfigType(), false);

        // validate that the before and after are the same.
        expect(newBarChartAdditionalSettings.isStacked).toBe(barChartAdditionalSettings.isStacked);
        expect(newBarChartAdditionalSettings.stackByImmediateChild).toBe(barChartAdditionalSettings.stackByImmediateChild);
        expect(newBarChartAdditionalSettings.showSelected).toBe(barChartAdditionalSettings.showSelected);
        expect(newBarChartAdditionalSettings.selectedAsMeasureSeries).toBe(barChartAdditionalSettings.selectedAsMeasureSeries);
        expect(newBarChartAdditionalSettings.selectedChartType).toBe(barChartAdditionalSettings.selectedChartType);
        expect(newBarChartAdditionalSettings.selectedChartMarkerSymbol).toBe(barChartAdditionalSettings.selectedChartMarkerSymbol);
    });

    it('Test deserialize no data', function () {
        const barChartAdditionalSettings = new BarChartAdditionalSettings();
        barChartAdditionalSettings.deserialize(undefined);

        expect(barChartAdditionalSettings.isStacked).toBeUndefined();
        expect(barChartAdditionalSettings.stackByImmediateChild).toBeUndefined();
        expect(barChartAdditionalSettings.showSelected).toBeUndefined();
        expect(barChartAdditionalSettings.selectedChartType).toBeUndefined();
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const barChartAdditionalSettings = new BarChartAdditionalSettings();
        expect(barChartAdditionalSettings.isDataStoreInput()).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const barChartAdditionalSettings1 = new BarChartAdditionalSettings();
        barChartAdditionalSettings1.stackByImmediateChild = true;
        barChartAdditionalSettings1.showSelected = true;
        barChartAdditionalSettings1.selectedAsMeasureSeries = true;
        barChartAdditionalSettings1.selectedChartType = ChartType.LINE;
        barChartAdditionalSettings1.selectedChartMarkerSymbol = ChartMarkerSymbol.CIRCLE;

        const barChartAdditionalSettings2 = new BarChartSettings();
        expect(barChartAdditionalSettings1.equals(barChartAdditionalSettings2)).toBeFalsy();

        const barChartAdditionalSettings3 = new BarChartAdditionalSettings();
        barChartAdditionalSettings3.stackByImmediateChild = false;
        expect(barChartAdditionalSettings1.equals(barChartAdditionalSettings3)).toBeFalsy();

        barChartAdditionalSettings3.stackByImmediateChild = true;
        barChartAdditionalSettings3.showSelected = false;
        expect(barChartAdditionalSettings1.equals(barChartAdditionalSettings3)).toBeFalsy();

        barChartAdditionalSettings3.showSelected = true;
        barChartAdditionalSettings3.selectedAsMeasureSeries = false;
        expect(barChartAdditionalSettings1.equals(barChartAdditionalSettings3)).toBeFalsy();

        barChartAdditionalSettings3.selectedAsMeasureSeries = true;
        barChartAdditionalSettings3.selectedChartType = ChartType.COLUMN;
        expect(barChartAdditionalSettings1.equals(barChartAdditionalSettings3)).toBeFalsy();

        barChartAdditionalSettings3.selectedChartType = ChartType.LINE;
        barChartAdditionalSettings3.selectedChartMarkerSymbol = ChartMarkerSymbol.DIAMOND;
        expect(barChartAdditionalSettings1.equals(barChartAdditionalSettings3)).toBeFalsy();

        barChartAdditionalSettings3.selectedChartMarkerSymbol = ChartMarkerSymbol.CIRCLE;
        expect(barChartAdditionalSettings1.equals(barChartAdditionalSettings3)).toBeTruthy();
    });

    it('Test shouldSkipSerialize', () => {
        const barChartAdditionalSettings = new BarChartAdditionalSettings();
        expect(barChartAdditionalSettings.shouldSkipSerialize()).toBeFalsy();
    });
});

