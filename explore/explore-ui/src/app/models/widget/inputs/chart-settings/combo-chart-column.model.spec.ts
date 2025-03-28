import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';

/**
 * Test cases for ColorScale Model
 */
describe('ComboChartColumn tests', function () {

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

        // Create colorScale to serialize
        const comboChartColumn = new ComboChartColumn({chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false});
        // Serialize
        const comboChartColumnSerialized: any = comboChartColumn.serialize();
        // Deserialize
        const comboChartColumnDeserialized: ComboChartColumn = new ComboChartColumn(comboChartColumnSerialized);
        expect(comboChartColumnSerialized).toEqual(comboChartColumnDeserialized);
    });

    /**
     * Test case for equals method
     */
    it('Test equals', function () {
        let comboChartColumn1 = new ComboChartColumn({chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false});
        let comboChartColumn2 = new ComboChartColumn({chartType: 'bar', colKey: 'mkt_value', secondaryAxis: true});
        expect(comboChartColumn1.equals(comboChartColumn2)).toBeFalsy();
        expect(comboChartColumn1.equals(null)).toBeFalsy();
        comboChartColumn1 = new ComboChartColumn({chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false});
        comboChartColumn2 = new ComboChartColumn({chartType: 'bar', colKey: 'nt_mkt_value', secondaryAxis: false});
        expect(comboChartColumn1.equals(comboChartColumn2)).toBeFalsy();
        comboChartColumn1 = new ComboChartColumn({chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false});
        comboChartColumn2 = new ComboChartColumn({chartType: 'line', colKey: 'mkt_value', secondaryAxis: false});
        expect(comboChartColumn1.equals(comboChartColumn2)).toBeFalsy();
        comboChartColumn1 = new ComboChartColumn({chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false});
        comboChartColumn2 = new ComboChartColumn({chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false});
        expect(comboChartColumn1.equals(comboChartColumn2)).toBeTruthy();
    });

    it('Test getDefaultColumnChartType', function () {
        expect(ComboChartColumn.getDefaultColumnChartType(WidgetConfigType.PGS_BAR)).toEqual(ColumnSeriesChartType.BAR);
        expect(ComboChartColumn.getDefaultColumnChartType(WidgetConfigType.PGS_TS)).toEqual(ColumnSeriesChartType.LINE);
    });
});
