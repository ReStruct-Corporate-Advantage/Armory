import {TimePeriodConstants} from '../date/constants/time-period.constants';
import {ReturnsUtilityService} from './returns-utility.service';
import {CoreTestUtils} from '../test-utils/core-test.utils';
import {PerformanceConstants} from './performance.constants';
import {ColumnConfig} from '../column/models/column-config/column-config.model';
import {PerformanceSettings} from './models/performance-settings/performance-settings.model';
import {AttributionSettings} from './models/attribution-settings/attribution-settings.model';

describe('ReturnsUtility Service', () => {

    const returnsWidgetColumns = [
        ColumnConfig.createColumn('pnl_sec_desc'),
        ColumnConfig.createColumn('pnl_cusip'),
        ColumnConfig.createColumn('wt_contr'),
        ColumnConfig.createColumn('bench_wt_contr'),
        ColumnConfig.createColumn('active_wt_contr'),
        ColumnConfig.createColumn('pnl_contr'),
        ColumnConfig.createColumn('active_pnl_contr'),
        ColumnConfig.createColumn('active_excess_contr'),
        ColumnConfig.createColumn('sector_alloc'),
        ColumnConfig.createColumn('security_sel')
    ];

    beforeAll(() => {
        CoreTestUtils.initDefinitions();
    });

    /**
     * Test case for method getActiveFactorTagsFromFactorTags
     */
    it('getActiveFactorTagsFromFactorTags', () => {
        const activeTags = ReturnsUtilityService.getActiveFactorTagsFromFactorTags(['fx_contr', 'fxcarry_contr']);
        expect(CoreTestUtils.validate(activeTags, ['active_fx_contr', 'active_fxcarry_contr'])).toBeTruthy();
    });

    /**
     * Test case for method getActiveFactorTagsFromFactorTags for undefined factor.
     */
    it('getActiveFactorTagsFromFactorTags for undefined factor', () => {
        const activeTags = ReturnsUtilityService.getActiveFactorTagsFromFactorTags(['fx_contr', 'fxcarry_contr1']);
        expect(CoreTestUtils.validate(activeTags, ['active_fx_contr'])).toBeTruthy();
    });

    it('addFactorsColumnsForGivenFactors', () => {
        const columns = [];

        ReturnsUtilityService.addFactorsColumnsForGivenFactors(['rf_contr', 'delta_contr'], columns);
        expect(CoreTestUtils.validate(CoreTestUtils.getColTags(columns), ['active_rf_contr', 'active_delta_contr'])).toBeTruthy();

        // Adding again won't make a difference
        ReturnsUtilityService.addFactorsColumnsForGivenFactors(['rf_contr', 'delta_contr'], columns);
        expect(CoreTestUtils.validate(CoreTestUtils.getColTags(columns), ['active_rf_contr', 'active_delta_contr'])).toBeTruthy();
    });

    it('addActiveBetColumnIfNeeded', () => {
        const columns = [];

        ReturnsUtilityService.addActiveBetColumnIfNeeded('FIXED_INCOME', columns);
        expect(columns.length).toBe(0);

        ReturnsUtilityService.addActiveBetColumnIfNeeded('OAS_CHG_DXS', columns);
        expect(CoreTestUtils.validate(CoreTestUtils.getColTags(columns), ['active_bet'])).toBeTruthy();
    });

    it('getPraadaCannedMethodFromValue', () => {
        const cannedMethod = ReturnsUtilityService.getPraadaCannedMethodFromValue('FIXED_INCOME');
        expect(cannedMethod.name).toBe('FIXED_INCOME');
        expect(cannedMethod.excessMethodologies[0].factors.length).toBe(10);
    });

    it('addFactorColumns', () => {
        jest.spyOn(ReturnsUtilityService, 'addFactorsColumnsForGivenFactors');
        jest.spyOn(ReturnsUtilityService, 'addActiveBetColumnIfNeeded');
        ReturnsUtilityService.addFactorColumns('FIXED_INCOME', [], []);
        expect(ReturnsUtilityService.addFactorsColumnsForGivenFactors).toHaveBeenCalledWith(expect.arrayContaining(ReturnsUtilityService.getPraadaCannedMethodFromValue('FIXED_INCOME').excessMethodologies[0].factors), expect.arrayContaining([]));
        expect(ReturnsUtilityService.addActiveBetColumnIfNeeded).toHaveBeenCalled();

        const customFactors = ['active_rf_contr'];
        ReturnsUtilityService.addFactorColumns('CUSTOM', [], customFactors);
        expect(ReturnsUtilityService.addFactorsColumnsForGivenFactors).toHaveBeenLastCalledWith(customFactors, expect.arrayContaining([]));
        expect(ReturnsUtilityService.addActiveBetColumnIfNeeded).toHaveBeenCalledTimes(2);
    });

    /**
     * Test case for method removeTimePeriodFromColumnOptions
     */
    it('removeTimePeriodFromColumnOptions', () => {
        const params: any = {
            columns: []
        };

        const col1: any = {columnTag: 'pnl_cusip'};
        const col2: any = {columnTag: 'total_ret'};
        col2.optionValues = {};
        col2.optionValues[TimePeriodConstants.TIME_PERIOD] = 'CUSTOM';
        col2.optionValues[TimePeriodConstants.NUMBER_OF_PERIODS] = 1;
        col2.optionValues[TimePeriodConstants.START_DATE] = '10-Mar-2015';
        col2.optionValues[TimePeriodConstants.END_DATE] = '10-Mar-2016';

        params.columns.push(col1);
        params.columns.push(col2);

        ReturnsUtilityService.removeTimePeriodFromColumnOptions([params]);

        expect(col1.optionValues).not.toBeDefined();
        expect(col2.optionValues[TimePeriodConstants.TIME_PERIOD]).not.toBeDefined();
        expect(col2.optionValues[TimePeriodConstants.NUMBER_OF_PERIODS]).not.toBeDefined();
        expect(col2.optionValues[TimePeriodConstants.START_DATE]).not.toBeDefined();
        expect(col2.optionValues[TimePeriodConstants.END_DATE]).not.toBeDefined();
    });


    /**
     * Test case for method removeRedundantAttributionSettingsFromColumnOptions
     */
    it('removeRedundantAttributionSettingsFromColumnOptions', () => {
        const params: any = {
            columns: []
        };

        const col1: any = {columnTag: 'pnl_cusip'};
        const col2: any = {columnTag: 'total_ret', columnKey: 'total_ret'};
        const col3: any = {columnTag: 'excess_contr', columnKey: 'excess_contr'};
        col2.optionValues = {};
        col2.optionValues[PerformanceConstants.ATTRIBUTION_METHOD] = 'FIXED_INCOME';
        col2.optionValues[PerformanceConstants.FACTORS] = ['factor1'];
        col2.optionValues[PerformanceConstants.SECTOR_WEIGHTING] = 'MarketValue';
        col2.optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD] = 'Method1';
        col2.optionValues[PerformanceConstants.SECTOR_LEVEL] = 'Level1';
        col2.optionValues[PerformanceConstants.ASSET_TYPE] = 'FixedIncome';
        col2.optionValues[PerformanceConstants.EXPOSURE_MODE] = 'Mode1';
        col2.optionValues[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH] = true;
        col2.optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION] = true;

        col3.optionValues = {};
        col3.optionValues[PerformanceConstants.ATTRIBUTION_METHOD] = 'FIXED_INCOME';

        params.columns.push(col1);
        params.columns.push(col2);
        params.columns.push(col3);

        const performanceSettings1 = new PerformanceSettings();
        performanceSettings1.attributionSettings = new AttributionSettings();
        returnsWidgetColumns[1].optionValues.push(performanceSettings1);
        returnsWidgetColumns[1].columnKey = 'total_ret';

        const performanceSettings2 = new PerformanceSettings();
        performanceSettings2.attributionSettings = new AttributionSettings();
        performanceSettings2.attributionSettings.cannedMethod = 'EQUITY';
        returnsWidgetColumns[2].optionValues.push(performanceSettings2);
        returnsWidgetColumns[2].columnKey = 'excess_contr';

        ReturnsUtilityService.removeRedundantAttributionSettingsFromColumnOptions([params], returnsWidgetColumns);

        expect(col1.optionValues).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.ATTRIBUTION_METHOD]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.FACTORS]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.SECTOR_WEIGHTING]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.SECTOR_LEVEL]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.ASSET_TYPE]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.EXPOSURE_MODE]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION]).not.toBeDefined();

        expect(col3.optionValues[PerformanceConstants.ATTRIBUTION_METHOD]).toBeDefined();

    });

    /**
     * Test case for method removeRedundantAttributionSettingsFromColumnOptions
     */
    it('removeRedundantAttributionSettingsFromColumnOptionsForMultiRequest', () => {
        const params: any = {
            columns: []
        };

        const params2: any = {
            columns: []
        };

        const col1: any = {columnTag: 'pnl_cusip'};
        const col2: any = {columnTag: 'total_ret', columnKey: 'total_ret'};
        const col3: any = {columnTag: 'excess_contr', columnKey: 'excess_contr'};
        col2.optionValues = {};
        col2.optionValues[PerformanceConstants.ATTRIBUTION_METHOD] = 'FIXED_INCOME';
        col2.optionValues[PerformanceConstants.FACTORS] = ['factor1'];
        col2.optionValues[PerformanceConstants.SECTOR_WEIGHTING] = 'MarketValue';
        col2.optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD] = 'Method1';
        col2.optionValues[PerformanceConstants.SECTOR_LEVEL] = 'Level1';
        col2.optionValues[PerformanceConstants.ASSET_TYPE] = 'FixedIncome';
        col2.optionValues[PerformanceConstants.EXPOSURE_MODE] = 'Mode1';
        col2.optionValues[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH] = true;
        col2.optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION] = true;

        col3.optionValues = {};
        col3.optionValues[PerformanceConstants.ATTRIBUTION_METHOD] = 'FIXED_INCOME';

        params.columns.push(col1);
        params.columns.push(col2);
        params.columns.push(col3);

        const col4: any = {columnTag: 'pnl_cusip'};
        const col5: any = {columnTag: 'total_ret', columnKey: 'total_ret'};
        const col6: any = {columnTag: 'excess_contr', columnKey: 'excess_contr'};
        col5.optionValues = {};
        col5.optionValues[PerformanceConstants.ATTRIBUTION_METHOD] = 'FIXED_INCOME';
        col5.optionValues[PerformanceConstants.FACTORS] = ['factor1'];
        col5.optionValues[PerformanceConstants.SECTOR_WEIGHTING] = 'MarketValue';
        col5.optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD] = 'Method1';
        col5.optionValues[PerformanceConstants.SECTOR_LEVEL] = 'Level1';
        col5.optionValues[PerformanceConstants.ASSET_TYPE] = 'FixedIncome';
        col5.optionValues[PerformanceConstants.EXPOSURE_MODE] = 'Mode1';
        col5.optionValues[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH] = true;
        col5.optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION] = true;

        col6.optionValues = {};
        col6.optionValues[PerformanceConstants.ATTRIBUTION_METHOD] = 'FIXED_INCOME';

        params2.columns.push(col4);
        params2.columns.push(col5);
        params2.columns.push(col6);

        const performanceSettings1 = new PerformanceSettings();
        performanceSettings1.attributionSettings = new AttributionSettings();
        returnsWidgetColumns[1].optionValues.push(performanceSettings1);
        returnsWidgetColumns[1].columnKey = 'total_ret';

        const performanceSettings2 = new PerformanceSettings();
        performanceSettings2.attributionSettings = new AttributionSettings();
        performanceSettings2.attributionSettings.cannedMethod = 'EQUITY';
        returnsWidgetColumns[2].optionValues.push(performanceSettings2);
        returnsWidgetColumns[2].columnKey = 'excess_contr';

        ReturnsUtilityService.removeRedundantAttributionSettingsFromColumnOptions([params, params2], returnsWidgetColumns);

        expect(col1.optionValues).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.ATTRIBUTION_METHOD]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.FACTORS]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.SECTOR_WEIGHTING]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.SECTOR_LEVEL]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.ASSET_TYPE]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.EXPOSURE_MODE]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH]).not.toBeDefined();
        expect(col2.optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION]).not.toBeDefined();

        expect(col3.optionValues[PerformanceConstants.ATTRIBUTION_METHOD]).toBeDefined();

        expect(col4.optionValues).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.ATTRIBUTION_METHOD]).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.FACTORS]).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.SECTOR_WEIGHTING]).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD]).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.SECTOR_LEVEL]).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.ASSET_TYPE]).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.EXPOSURE_MODE]).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH]).not.toBeDefined();
        expect(col5.optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION]).not.toBeDefined();

        expect(col6.optionValues[PerformanceConstants.ATTRIBUTION_METHOD]).toBeDefined();
    });
});
