import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {PieChartDisplayAsOption, PieChartDisplayInput} from './pie-chart-display-input.model';
import {ChartWidgetInputConfigType, ConfigTypeFactory} from '@blk/explore-ui-core';

/**
 * PieChartDisplayInput Input tests
 */
describe('PieChartDisplayInput test', function () {

    beforeAll((function () {
        ConfigInitializer.registerChartWidgetInputConfigTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const pieChartDisplayInput: PieChartDisplayInput = new PieChartDisplayInput();
        pieChartDisplayInput.displayAs = PieChartDisplayAsOption.SUNBURST;

        // Convert the object to string and then back to json again.
        let serializedData: any = pieChartDisplayInput.serialize();

        let newPieChartDisplayInput: PieChartDisplayInput = ConfigTypeFactory.createConfig(serializedData, ChartWidgetInputConfigType.PIE_CHART_DISPLAY, false);
        // Validate that the before and after are the same.
        expect(newPieChartDisplayInput.displayAs).toBe(pieChartDisplayInput.displayAs);

        // Mock an old Explore favorite
        serializedData = {isDonutChart: false};
        newPieChartDisplayInput = ConfigTypeFactory.createConfig(serializedData, ChartWidgetInputConfigType.PIE_CHART_DISPLAY, false);

        expect(newPieChartDisplayInput.displayAs).toBe(PieChartDisplayAsOption.PIE);
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const pieChartDisplayInput: PieChartDisplayInput = new PieChartDisplayInput();
        expect(pieChartDisplayInput.isDataStoreInput()).toBeFalsy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const input1: PieChartDisplayInput = new PieChartDisplayInput();
        input1.displayAs = PieChartDisplayAsOption.PIE;
        const input2: PieChartDisplayInput = new PieChartDisplayInput();
        input2.displayAs = PieChartDisplayAsOption.PIE;
        expect(input1.equals(input2)).toBeTruthy();

        // Different displayAs
        input1.displayAs = PieChartDisplayAsOption.SUNBURST;
        expect(input1.equals(input2)).toBeFalsy();
    });

    it('Test shouldSkipSerialize', () => {
        const pieChartDisplayInput: PieChartDisplayInput = new PieChartDisplayInput();
        expect(pieChartDisplayInput.shouldSkipSerialize()).toBeFalsy();
    });
});

