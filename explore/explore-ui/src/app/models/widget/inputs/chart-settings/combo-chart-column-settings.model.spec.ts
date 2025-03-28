import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ChartWidgetInputConfigType, ConfigTypeFactory} from '@blk/explore-ui-core';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {ColorScale} from '@models/widget/inputs/chart-settings/color-scale.model';

describe('ComboChartColumnSettings tests', function () {
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

        const comboChartColumnSettings = new ComboChartColumnSettings({columns: [{chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false}]});

        // Serialize
        const comboChartColumnSettingsSerialize: any = comboChartColumnSettings.serialize();

        // Deserialize
        const comboChartColumnSettingsDeserialized: ComboChartColumnSettings =
            ConfigTypeFactory.createConfig(comboChartColumnSettingsSerialize, ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, true);

       // Validate
        expect(comboChartColumnSettingsDeserialized).toEqual(comboChartColumnSettings);
    });

    // Create unit tests for getTrackableProperties method
    it('Test getTrackableProperties', function () {
        const comboChartColumnSettings = new ComboChartColumnSettings({columns: [{chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false},
                                                                                                    {chartType: 'line', colKey: 'nt_mkt_value', secondaryAxis: true}]});
        expect(comboChartColumnSettings.getTrackableProperties()).toEqual({
            columns: ['mkt_value', 'nt_mkt_value'],
            barColumns: ['mkt_value'],
            lineColumns: ['nt_mkt_value'],
            secondaryAxisColumn: ['nt_mkt_value']
        });
    });

    // Test of deserialize method when it contains secondaryAxisColumn field
    it('Test deserialize with secondaryAxisColumn field', function () {

        let secondaryAxisSerialized = {secondaryAxisColumn: {data: 'market_val_1'}} as any;

        // Deserialize
        let comboChartColumnSettingsDeserialized = new ComboChartColumnSettings(secondaryAxisSerialized);
        expect(comboChartColumnSettingsDeserialized.columns[0].colKey).toBe('market_val_1');
        expect(comboChartColumnSettingsDeserialized.columns[0].secondaryAxis).toBe(true);
        secondaryAxisSerialized = {secondaryAxisColumn: 'market_val_1'} as any;
        comboChartColumnSettingsDeserialized = new ComboChartColumnSettings(secondaryAxisSerialized);
        expect(comboChartColumnSettingsDeserialized.columns[0].colKey).toBe('market_val_1');
        expect(comboChartColumnSettingsDeserialized.columns[0].secondaryAxis).toBe(true);
    });

    /**
     * Test equals
     */
    it('Test equals', function () {
        expect(new ComboChartColumnSettings({columns: []}).equals(new ColorScale())).toBeFalsy();
        expect(new ComboChartColumnSettings({columns: []}).equals(new ComboChartColumnSettings({columns: []}))).toBeTruthy();
        expect(new ComboChartColumnSettings({}).equals(new ComboChartColumnSettings({}))).toBeTruthy();
        expect(new ComboChartColumnSettings({columns: []}).equals(new ComboChartColumnSettings({columns: [{chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false}]}))).toBeFalsy();
        expect(new ComboChartColumnSettings({columns: [{chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false}]}).equals(new ComboChartColumnSettings({columns: [{chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false}]}))).toBeTruthy();
        expect(new ComboChartColumnSettings({columns: [{chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false}]}).equals(new ComboChartColumnSettings({columns: [{chartType: 'bar', colKey: 'mkt_value', secondaryAxis: true}]}))).toBeFalsy();
    });

    it('Test shouldSkipSerialize', () => {
        const comboChartColumnSettings = new ComboChartColumnSettings({columns: [{chartType: 'bar', colKey: 'mkt_value', secondaryAxis: false}]});
        expect(comboChartColumnSettings.shouldSkipSerialize()).toBe(false);
    });
});
