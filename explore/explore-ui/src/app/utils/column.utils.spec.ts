import {
    AggregationColumnOption,
    CustomCalculationColumnOption,
    FxFactorOptionsColumnOption,
    NumericColumnFormatColumnOption
} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnDefinition, CoreColumnUtils, CoreDefinitionStore, PerformanceSettings, PositionType, TimePeriod, UseType, WidgetConfigInput, WidgetInput} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {TestUtils} from '@utils/test.utils';
import {ColumnUtils} from './column.utils';
import {CommonConstants} from '@constants/common.constants';
import {DefinitionsStore} from '@stores/definitions.store';

describe('ColumnUtils', () => {

    beforeEach((done) => {
        TestUtils.initialize(done);
    });

    it('columns and columnTagColumnsPairs', () => {
        expect(CoreDefinitionStore.columns.length > 0).toBeTruthy();
        expect(CoreDefinitionStore.columnTagColumnsPairs.size > 0).toBeTruthy();
        const colDefs: ColumnDefinition[] = CoreDefinitionStore.columnTagColumnsPairs.get('market_val');
        expect(colDefs.length === 3).toBeTruthy();
    });

    /**
     * Tests replacing whitespace
     */
    it('test replacing whitespace in a col tag', () => {
        // Column tag without whitespaces - should get back the original column tag
        testReplaceWhitespaceInColumnTag('x', 'x');

        // Column tag with 1 whitespace - should get a replacement
        testReplaceWhitespaceInColumnTag('ab cd', 'ab_space_cd');

        // Column tag with multiple whitespaces in a row - should get replacements for all of them
        testReplaceWhitespaceInColumnTag(' ab   cd ', '_space_ab_space__space__space_cd_space_');

        // Column tag with whitespaces in different places - should get replacements for all of them
        testReplaceWhitespaceInColumnTag('ab   c  d', 'ab_space__space__space_c_space__space_d');
    });

    /**
     * check that no change is made in the original column definitions returned by getColumnDefByTagAndUse in ColumnService
     */
    it('test no change in columnDefs-getColumnDefByTagAndUse', () => {
        // get the column definition for market value
        const selectedColumn = CoreColumnUtils.getColumnDefByTagAndUse('market_val', 'BENCH');
        // make some changes in the column definition of market value
        selectedColumn.title = 'abc';
        // get the original column definition for market value
        const column = CoreColumnUtils.getColumnDefByTagAndUse('market_val', 'BENCH');
        // check that the changed made in the copy does not exist in the original column definition.
        expect(column.title).not.toBe(selectedColumn.title);
        expect(column.uses).toBe('BENCH');
    });


    /**
     * getColumnDefByTagAndOptionallyByUse
     */
    it('test getColumnDefByTagAndOptionallyByUse', () => {
        // get the column definition for market value
        const selectedColumn = CoreColumnUtils.getColumnDefByTagAndOptionallyByUse('market_val', 'BENCH', false);
        expect(selectedColumn.uses).toBe('PORT');
    });

    /**
     * Tests ColumnService.hasPositionUseType
     */
    it('testHasPositionUseType', () => {
        // Port/bench/active column definition - should be recognised as having a position use type
        testHasPositionUseType('market_val', PositionType.PORT, true);
        testHasPositionUseType('market_val', PositionType.BENCH, true);
        testHasPositionUseType('market_val', PositionType.ACTIVE, true);

        // Security attributes columns should not be recognised as having a position use type
        testHasPositionUseType('sec_group', UseType.ALL, false);
    });


    /**
     * Test that we can get a column just by specifying the column tag.
     */
    it('Get security column by tag and use - sec_group', () => {
        testColumnByTagAndUse('sec_group', 'ALL');
    });

    /**
     * Test that we can get a position column specifying the column tag and position type.
     */
    it('Get position column by tag and use - market_val (PORT)', () => {
        testColumnByTagAndUse('market_val', 'PORT');
    });

    /**
     * Test that we can get a column by col tag and use when there is no column with such use but there
     * is one column with such col tag.
     * E.g. our Praada columns have unique col tags and their use types can be ignored.
     *
     */
    it('Get performance column by tag and use - total_ret', () => {
        testColumnByTagAndUse('total_ret', 'PORT', false);
    });

    /**
     * Test that we can get a column just by specifying the column tag say for performance columns
     */
    it('Get performance column by tag only - total_ret', () => {
        testColumnDefByTag('total_ret');
    });

    /**
     * Test that requesting a column that does not exist returns no column.
     * NOTE:  Using a real column tag in this test so we match on that but not in the use.
     */
    it('Get invalid column by tag and use', () => {
        const columnDef = CoreColumnUtils.getColumnDefByTagAndUse('market_val', 'NONE');
        expect(columnDef).toBeNull();
    });

    /**
     * Test case for method updateColumnWithWidgetAndPortfolioSettings
     */
    it('Test updateColumnWithWidgetAndPortfolioSettings', () => {
        const column = new ColumnConfig();
        column.optionValues.push(new PerformanceSettings());
        column.optionValues.push(new RiskSettings());
        column.optionValues.push(new AggregationColumnOption());

        const widgetInputs = new Map<string, WidgetInput>();
        const widgetPerformanceSettings = new PerformanceSettings();
        const widgetRiskSettings = new RiskSettings();
        widgetPerformanceSettings.timePeriod = new TimePeriod('Month To Date', 1, 'MTD');
        widgetInputs.set('performanceSettings', widgetPerformanceSettings);
        widgetInputs.set('riskSettings', widgetRiskSettings);

        const portfolio = new Portfolio();
        portfolio.performanceSettings = new PerformanceSettings();
        portfolio.performanceSettings.timePeriod = new TimePeriod('Year To Date', 1, 'YTD');
        portfolio.portfolioRiskSettings = new RiskSettings();


        ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(column, portfolio, widgetInputs, '');
        expect((column.optionValues[0] as PerformanceSettings).parentPerformanceSettings).toBe(widgetPerformanceSettings);
        expect((column.optionValues[1] as RiskSettings).economyRiskSettings.parentRiskSettings).toBe(widgetRiskSettings.economyRiskSettings);
        expect((column.optionValues[1] as RiskSettings).exposureRiskSettings.parentRiskSettings).toBe(widgetRiskSettings.exposureRiskSettings);
        expect((column.optionValues[1] as RiskSettings).advancedRiskSettings.parentRiskSettings).toBe(widgetRiskSettings.advancedRiskSettings);

        ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(column, portfolio, null, '');
        expect((column.optionValues[0] as PerformanceSettings).parentPerformanceSettings).toBe(portfolio.performanceSettings);
        expect((column.optionValues[1] as RiskSettings).economyRiskSettings.parentRiskSettings).toBe(portfolio.portfolioRiskSettings.economyRiskSettings);
        expect((column.optionValues[1] as RiskSettings).exposureRiskSettings.parentRiskSettings).toBe(portfolio.portfolioRiskSettings.exposureRiskSettings);
        expect((column.optionValues[1] as RiskSettings).advancedRiskSettings.parentRiskSettings).toBe(portfolio.portfolioRiskSettings.advancedRiskSettings);

    });

    it('Test updateColumnWithWidgetAndPortfolioSettings when column is CustomCalc', () => {
        const data = {
            expression: 'a',
            measures: {
                a: {optionValues: [{attributionSettings: {}, configType: 'performanceSettings'}]}
            }
        };
        const customCalc: CustomCalculationColumnOption = new CustomCalculationColumnOption(data);

        const column = new ColumnConfig();
        column.optionValues.push(customCalc);

        const portfolio = new Portfolio();
        portfolio.performanceSettings = new PerformanceSettings();
        portfolio.performanceSettings.timePeriod = new TimePeriod('Year To Date', 1, 'YTD');
        portfolio.portfolioRiskSettings = new RiskSettings();

        // Update column with portfolio setting in case when we don't have defaultSettings from widgetInput
        // In case of customCalc when we add any performance column with defaults settings on
        ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(column, portfolio, null, '');

        // CustomCalc optionValues will have updated ParentPerformanceSetting with portfolio performance Setting
        expect(((column.optionValues[0] as CustomCalculationColumnOption).measureMapping['a'].optionValues[0] as PerformanceSettings)
            .parentPerformanceSettings).toBe(portfolio.performanceSettings);
    });

    /**
     * Gets the corresponding column definition, calls ColumnService.hasPositionUseType
     * and checks that the result is the same as the given hasPositionUseType
     */
    function testHasPositionUseType(colTag: string, useType: string, hasPositionUseType: boolean) {
        const columnDef = CoreColumnUtils.getColumnDefByTagAndUse(colTag, useType);

        const expectedHasPositionUseType = CoreColumnUtils.hasPositionUseType(columnDef);
        expect(expectedHasPositionUseType).toEqual(hasPositionUseType);
    }


    /**
     * Tests that replacing whitespaces in the given columnTag results in the given expectedColumnTag
     */
    function testReplaceWhitespaceInColumnTag(columnTag: string, expectedColumnTag: string): void {
        columnTag = CoreColumnUtils.replaceWhitespaceInColumnTag(columnTag);
        expect(columnTag).toEqual(expectedColumnTag);
    }


    /**
     * Get the column and performs some tests on the response.
     */
    function testColumnDefByTag(colTag: any) {
        const columnDef = CoreColumnUtils.getColumnDefByTag(colTag);
        expect(columnDef).not.toBeUndefined();
        expect(columnDef).not.toBeNull();
        expect(columnDef.columnTag).toBe(colTag);
    }

    /**
     * Get the column and performs some tests on the response.
     */
    function testColumnByTagAndUse(colTag: any, use: any, useNotToEqual?: boolean) {
        const columnDef = CoreColumnUtils.getColumnDefByTagAndUse(colTag, use);

        expect(columnDef).not.toBeUndefined();
        expect(columnDef).not.toBeNull();
        expect(columnDef.columnTag).toEqual(colTag);
        if (useNotToEqual) {
            expect(columnDef.uses).not.toEqual(use);
        } else {
            expect(columnDef.uses).toEqual(use);
        }
    }

    describe('createTooltip', () => {
        it('should use column title for tooltip', () => {
            expect(ColumnUtils.createTooltip({title: 'title'} as ColumnDefinition)).toBe('title');
        });

        it('should use column title and column description if available', () => {
            expect(ColumnUtils.createTooltip({
                title: 'title',
                columnDesc: 'description'
            } as ColumnDefinition)).toBe('title\n\nDefinition:\ndescription');
        });
    });


    describe('getWidgetConfigColumns Test', () => {

        it('should return an empty array if there is no widgetConfigInputs or column config input', () => {
            expect(ColumnUtils.getWidgetConfigColumns(undefined).length).toBe(0);
            expect(ColumnUtils.getWidgetConfigColumns([]).length).toBe(0);
        });

        it('should return an array of the columns from the column config input', () => {
            const columnConfigInput: WidgetConfigInput = {
                inputConfigType: 'columns',
                inputName: 'columns',
                inputTitle: '',
                valueField: 'columnTag',
                default: [
                    {
                        columnKey: 'security_description_1',
                        columnTag: 'security_description',
                        optionValues: {factorSecContribSettings: {}},
                        positionColumnType: 'ALL'
                    },
                    {
                        columnKey: 'cusip_0',
                        columnTag: 'cusip',
                        optionValues: {factorSecContribSettings: {}},
                        positionColumnType: 'ALL'
                    }
                ]
            };
            const widgetConfigInputs: WidgetConfigInput[] = [columnConfigInput];
            expect(ColumnUtils.getWidgetConfigColumns(widgetConfigInputs).length).toBe(2);
        });
    });

    it('test createActionColMenu', () => {
        const menu = ColumnUtils.createActionColMenu(undefined);
        expect(menu.length).toBe(0);

        const actionColMenuOptions = [
            {
                name: 'plot factor data',
                action: { action: () => {} },
                subMenu: [{
                    name: 'factor levels',
                    action: { action: () => {} },
                }],
            },
            CommonConstants.SEPARATOR,
        ];
        const colMenu = ColumnUtils.createActionColMenu(actionColMenuOptions);
        expect(colMenu.length).toBe(1);
        expect(colMenu[0][0].label).toBe('plot factor data');
        expect(colMenu[0][0].eventData).toBeDefined();
        expect(colMenu[0][0].flyoutData).toBeDefined();
        expect(colMenu[0][0].flyoutData).not.toBeNull();
        expect(colMenu[0][0].flyoutData.length).toBe(1);
        expect(colMenu[0][0].flyoutData[0][0].label).toBe('factor levels');
        expect(colMenu[0][0].flyoutData[0][0].eventData).toBeDefined();
    });

    describe('test getScalingLabel', () => {
        it('Case where column has numeric column format option and is numeric column', () => {
            const column = new ColumnConfig();
            column.columnTag = 'market_val';
            column.optionValues = [new NumericColumnFormatColumnOption({decimalPlaces: 2, scaling: 1000000, useThousandsSeparator: true})];
            expect(ColumnUtils.getScalingLabel(column)).toEqual('Millions (mm)');
        });
        it('Case where column has no numeric column format option and is numeric column', () => {
            const column = new ColumnConfig();
            column.columnTag = 'market_val';
            expect(ColumnUtils.getScalingLabel(column)).toEqual('Thousands (m)');
        });
        it('Case where column is not numeric column', () => {
            const column = new ColumnConfig();
            column.columnTag = 'cusip';
            expect(ColumnUtils.getScalingLabel(column)).toBeUndefined();
        });
        it('Case where column has numeric column format option and is numeric column but numeric column format option not supported by column', () => {
            const column = new ColumnConfig();
            column.columnTag = 'market_val';
            column.optionValues = [new NumericColumnFormatColumnOption({decimalPlaces: 2, scaling: 10, useThousandsSeparator: true})];
            expect(ColumnUtils.getScalingLabel(column)).toBeUndefined();
        });
    });

    describe('test createConstraintMeasures', () => {
        it('Case where function is called for constraints', () => {
            DefinitionsStore.optimizationConstraint = [
                {
                    columnTag: 'market_value',
                    uses: 'PORT',
                    constraintType: 'SECTOR_CONSTRAINT'
                }, {
                    columnTag: 'climate_col',
                    uses: 'PORT',
                    groups: ['Climate', 'sector'],
                    constraintType: 'SECTOR_CONSTRAINT'
                }, {
                    columnTag: 'esg_climate_col',
                    uses: 'PORT',
                    groups: ['ESG', 'MSCI', 'Climate', 'sector'],
                    constraintType: 'SECTOR_CONSTRAINT'
                }
            ];
            const result = ColumnUtils.createConstraintMeasures('SECTOR_CONSTRAINT', null, true);
            expect(result.length).toBe(3);
        });
        it('Case where function is called for maximize alpha', () => {
            DefinitionsStore.optimizationConstraint = [
                {
                    columnTag: 'market_value',
                    uses: 'PORT',
                    constraintType: 'SECTOR_CONSTRAINT'
                }, {
                    columnTag: 'climate_col',
                    uses: 'PORT',
                    groups: ['Climate', 'sector'],
                    constraintType: 'SECTOR_CONSTRAINT'
                }, {
                    columnTag: 'esg_climate_col',
                    uses: 'PORT',
                    groups: ['ESG', 'MSCI', 'Climate', 'sector'],
                    constraintType: 'SECTOR_CONSTRAINT'
                }
            ];
            const result = ColumnUtils.createConstraintMeasures('SECTOR_CONSTRAINT');
            expect(result.length).toBe(3);
        });
    });

    describe('test updateFxFactorColumn', () => {
        it('case where optionValue is created', () => {
            const portfolio = new Portfolio();
            portfolio.currency = 'USD';
            const column = new ColumnConfig();
            column.columnTag = 'ADP_FX_USD';
            const fxFactorOptionsColumnOption = new FxFactorOptionsColumnOption();
            column.optionValues.push(fxFactorOptionsColumnOption);

            expect(fxFactorOptionsColumnOption.fxCrossCurrency).toBeUndefined();

            ColumnUtils.updateFxFactorColumn(column, portfolio);
            expect(fxFactorOptionsColumnOption.fxCrossCurrency).toBe('USD');
        });

        it('case where optionValue is already modified', () => {
            const portfolio = new Portfolio();
            portfolio.currency = 'USD';
            const column = new ColumnConfig();
            column.columnTag = 'ADP_FX_USD';
            const fxFactorOptionsColumnOption = new FxFactorOptionsColumnOption();
            fxFactorOptionsColumnOption.fxCrossCurrency = 'ADP';
            column.optionValues.push(fxFactorOptionsColumnOption);

            ColumnUtils.updateFxFactorColumn(column, portfolio);
            expect(fxFactorOptionsColumnOption.fxCrossCurrency).toBe('ADP');
        });
    });

    describe('isMultiManagerEnabledColumn', () => {
        it('should return true for BENCH_L1 position type', () => {
            const column = new ColumnConfig();
            column.positionColumnType = PositionType.BENCH_L1.toString();
            const result = ColumnUtils.isMultiManagerEnabledColumn(column);
            expect(result).toBe(true);
        });

        it('should return true for BENCH_L2 position type', () => {
            const column = new ColumnConfig();
            column.positionColumnType = PositionType.BENCH_L2.toString();
            const result = ColumnUtils.isMultiManagerEnabledColumn(column);
            expect(result).toBe(true);
        });

        it('should return true for BENCH_L3 position type', () => {
            const column = new ColumnConfig();
            column.positionColumnType = PositionType.BENCH_L3.toString();
            const result = ColumnUtils.isMultiManagerEnabledColumn(column);
            expect(result).toBe(true);
        });

        it('should return false for non-benchmark position type', () => {
            const column = new ColumnConfig();
            column.positionColumnType = 'NON_BENCH';
            const result = ColumnUtils.isMultiManagerEnabledColumn(column);
            expect(result).toBe(false);
        });

        it('should return false for undefined position type', () => {
            const column = new ColumnConfig();
            column.positionColumnType = undefined;
            const result = ColumnUtils.isMultiManagerEnabledColumn(column);
            expect(result).toBe(false);
        });
    });
});
