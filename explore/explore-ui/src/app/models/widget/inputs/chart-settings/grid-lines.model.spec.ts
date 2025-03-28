import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {GridLines} from './grid-lines.model';
import {ChartWidgetInputConfigType, ConfigTypeFactory} from '@blk/explore-ui-core';

/**
 * Test cases for GridLines.ts
 */
describe('GridLines tests', function () {

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((function () {
        ConfigInitializer.registerChartWidgetInputConfigTypes();
    }));

    /**
     * Test serialize/deserialize
     */
    it('Test Serialize/Deserialize', function () {
        // Create gridLines to serialize
        const gridLines = new GridLines({showGridLines: true});

        // Serialize
        let gridLinesSerialized: any = gridLines.serialize();

        // Deserialize
        let gridLinesDeserialized: GridLines =
            ConfigTypeFactory.createConfig(gridLinesSerialized, ChartWidgetInputConfigType.GRID_LINES, true);

        // Validate
        expect(gridLines.showGridLines).toStrictEqual(gridLinesDeserialized.showGridLines);

        gridLinesSerialized = {showGridLines: true};

        // Deserialize
        gridLinesDeserialized = ConfigTypeFactory.createConfig(gridLinesSerialized, ChartWidgetInputConfigType.GRID_LINES, true);

        // Validate
        expect(gridLinesDeserialized.showGridLines).toBe(true);

        // Validate showGridLines type
        expect(typeof gridLines.showGridLines).toBe('boolean');
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const gridLines1 = new GridLines({showGridLines: true});
        let gridLines2 = new GridLines({showGridLines: false});

        // Different values for showGridLines
        expect(gridLines1.equals(gridLines2)).toBe(false);

        // Same values for showGridLines
        gridLines2 = new GridLines({showGridLines: true});
        expect(gridLines1.equals(gridLines2)).toBe(true);
    });

    it('Test shouldSkipSerialize', () => {
        const gridLines = new GridLines({showGridLines: true});
        expect(gridLines.shouldSkipSerialize()).toBe(false);
    });
});
