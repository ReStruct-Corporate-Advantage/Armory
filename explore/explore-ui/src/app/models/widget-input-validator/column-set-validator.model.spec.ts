import {
    ColumnSet,
    CustomCalculationColumnOption,
    CustomCalculationConstants, FactorSettingsColumnOption,
    LibColumnUtils
} from '@blk/explore-ui-column-option';
import {
    AlertConstants,
    ColumnConfig, ColumnConstants,
    ColumnDefinition,
    CoreColumnUtils,
    CoreDefinitionStore,
    CoreTestUtils,
    DateValue,
    PerformanceSettings,
    TokenUtils, WidgetConfigType
} from '@blk/explore-ui-core';
import {NotificationConstants} from '@constants/notification.constants';
import {ConfigUtils} from '@utils/config.utils';
import {Breakdown, ColumnBreakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {LookthroughFilterRule} from '../lookthrough/look-through-filter-rule.model';
import {Portfolio} from '../portfolio/portfolio.model';
import {ColumnSetValidator} from './column-set-validator.model';
import {DefinitionsStore} from '@stores/definitions.store';
import {AdvancedRiskSettings, RiskSettings} from '@blk/explore-ui-risk';
import {Widget} from '@models/widget/widget.model';
import {MultiManagerUtils} from '@utils/multi-manager.utils';
import {Notification} from '../widget/notification.model';

describe('ColumnSetValidator', () => {
    let validator;
    let widget: Widget;
    let portfolio: Portfolio;
    let columnSet: ColumnSet;

    beforeAll(() => {
        CoreTestUtils.initDefinitions();
    });
    beforeEach(() => {
        validator = new ColumnSetValidator();
        widget = new Widget();
        portfolio = new Portfolio();
        columnSet = new ColumnSet({
            columns: [
                {columnTag: 'pct_mv', positionColumnType: 'PORT'},
                {columnTag: 'beta_market_contr', positionColumnType: 'ALL'},
                {columnTag: 'acct_fees_contr', positionColumnType: 'ALL'}
            ]
        });

        widget.dataStore = {
            metaData: {
                inputs: new Map()
            }
        } as any;
    });

    afterEach(() => jest.resetAllMocks());

    describe('validateInput Test', () => {
        it('tests validateInput - ColumnSet', () => {
            // const mockBreakdown = new Breakdown();
            // jest.spyOn(widget.dataStore.metaData.inputs, 'get').mockReturnValue(mockBreakdown);
            expect(validator.validateInput(columnSet)).toBe(null);

            const portfolio: Portfolio = new Portfolio();
            expect(validator.validateInput(columnSet, portfolio)).toBe(null);

            columnSet.columns[1].optionValues.push(new CustomCalculationColumnOption({expression: 'alert()'}));
            expect(validator.validateInput(columnSet, portfolio).message).toBe(CustomCalculationConstants.INVALID_JS_EXPRESSION_MESSAGE);


            columnSet.columns[1].optionValues.length = 0;
            portfolio.lookthroughSettings.isLookThroughEnabled = true;
            expect(validator.validateInput(columnSet, portfolio)?.message).toMatch(NotificationConstants.WORKPAD_LOOKTHROUGH_RISK_NOTIFICATION_MSG_TOKEN_DISABLED);

            portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = [new LookthroughFilterRule({
                ltType: 'Sector',
                enabled: true
            })];
            CoreDefinitionStore.tokens = {enableRiskDataLookthrough: 'Y'};
            expect(validator.validateInput(columnSet, portfolio).message).toMatch(NotificationConstants.RISK_LOOKTHROUGH_WITH_CUSTOMIZATION_MSG);

            portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = [];
            portfolio.lookthroughSettings.isBenchLookThroughEnabled = true;
            expect(validator.validateInput(columnSet, portfolio).message).toMatch(NotificationConstants.RISK_LOOKTHROUGH_WITH_CUSTOMIZATION_MSG);

            portfolio.lookthroughSettings.isBenchLookThroughEnabled = false;
            jest.spyOn(ConfigUtils, 'isColumnBreakdownPortfolioBreakdown').mockReturnValue(true);
            expect(validator.validateInput(columnSet, portfolio).message).toMatch(NotificationConstants.PORTFOLIO_RISK_PORTNAME_BREAKDOWN);
            jest.resetAllMocks();

            portfolio.lookthroughSettings.ltProxies = ['RISK_PROXY', 'FUND'];
            expect(validator.validateInput(columnSet, portfolio).message).toMatch(NotificationConstants.RISK_LOOKTHROUGH_OTHER_THEN_RISK_PROXY);

            portfolio.lookthroughSettings.isBenchLookThroughEnabled = true;
            columnSet.columns.splice(1, 1);
            expect(validator.validateInput(columnSet, portfolio).message).toMatch(NotificationConstants.WORKPAD_LOOKTHROUGH_ERROR_MSG);
        });

        it('tests validateInput For Macro Factor Column Breakdown', () => {
            const columnBreakdown = new ColumnBreakdown();
            const breakdown = new Breakdown();
            const child = new ColumnSector();
            child.columnName = 'Security Type';
            child.columnTag = 'sec_type';
            child.positionColumnType = 'ALL';
            child.dataType = 'String';
            child.useNoneBuckets = false;
            breakdown.addChild(child);
            columnBreakdown.breakdown = breakdown;
            const columnSet: ColumnSet = new ColumnSet({
                columns: [
                    {
                        columnTag: 'acct_fees_contr',
                        positionColumnType: 'ALL',
                        optionValues: [columnBreakdown]
                    }
                ]
            });
            const columnDefinition: ColumnDefinition = new ColumnDefinition();
            columnDefinition.isMacroFactor = true;

            const colDefSpy = jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse');
            colDefSpy.mockReturnValue(columnDefinition);

            const perfColumnOptionSpy = jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType');
            perfColumnOptionSpy.mockReturnValue(new PerformanceSettings());

            const portfolio = new Portfolio();
            expect(validator.validateInput(columnSet, portfolio).message).toMatch(NotificationConstants.MACRO_FACTOR_BREAKDOWN_WITH_PERFORMANCE_COL_MSG);

            columnDefinition.isMacroFactor = false;
            expect(validator.validateInput(columnSet, portfolio)).toBe(null);

            columnDefinition.isMacroFactor = true;
            perfColumnOptionSpy.mockReturnValue(null);
            expect(validator.validateInput(columnSet, portfolio)).toBe(null);
        });

        it('tests validateInput For RAS Columns', () => {
            const column = new ColumnConfig();
            column.columnTitle = 'RAS Column';
            column.columnTag = 'ras_column';
            column.positionColumnType = 'ALL';
            const columnSet: ColumnSet = {
                columns: [column]
            };
            const columnDefinition = new ColumnDefinition();
            columnDefinition.isRASColumn = true;

            const colDefSpy = jest.spyOn(LibColumnUtils, 'getColumnDefinition');
            colDefSpy.mockReturnValue(columnDefinition);

            DefinitionsStore.rasCutoffDate = '01/01/2022';

            const portfolio = new Portfolio();
            portfolio.datePicker = new DateValue({
                calCode: 'US_NYSE',
                dateString: false,
                date: '12/31/2021'
            });
            expect(validator.validateInput(columnSet, portfolio)?.message).toMatch(NotificationConstants.RAS_RISK_COLUMNS_BEYOND_DATE_ERROR('RAS Column', '01/01/2022'));

        });
    });
    describe('test validateInputForWarning', () => {
        const column = new ColumnConfig();
        column.columnTitle = 'RAS Column';
        column.columnTag = 'ras_column';
        column.positionColumnType = 'ALL';
        column.optionValues = [];
        const riskSettings = new RiskSettings();
        riskSettings.advancedRiskSettings = new AdvancedRiskSettings();
        column.optionValues.push(riskSettings);
        const columnSet: ColumnSet = {
            columns: [column]
        };

        beforeEach(() => {
            const columnDefinition = new ColumnDefinition();
            columnDefinition.groups = ['Portfolio Risk', 'Monte Carlo VaR'];
            columnDefinition.isRASColumn = true;
            const colDefSpy = jest.spyOn(LibColumnUtils, 'getColumnDefinition');
            colDefSpy.mockReturnValue(columnDefinition);
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('undefined assetClassCovaraince', () => {
            expect(validator.validateInputForWarning(columnSet)).toBe(null);
        });

        it('Y as assetClassCovaraince', () => {
            riskSettings.advancedRiskSettings.assetClassCovariance = 'Y';
            expect(validator.validateInputForWarning(columnSet)).toBeNull();
        });

        it('M as assetClassCovaraince', () => {
            riskSettings.advancedRiskSettings.assetClassCovariance = 'M';
            expect(validator.validateInputForWarning(columnSet)).toEqual([NotificationConstants.MCVAR_COVAR_MATRIX_NOT_SUPPORTED]);
        });
    });

    it('should return MM_DECOMPOSITION_NOT_SUPPORTED_WITHOUT_BREAKDOWN if breakdown is invalid', () => {
        widget.configType = WidgetConfigType.RISK_EXPOSURE;

        jest.spyOn(MultiManagerUtils, 'columnContainsMultiManagerOptions').mockReturnValue(true);
        jest.spyOn(MultiManagerUtils, 'isValidMMBreakdown').mockReturnValue(false);
        const columnSet = new ColumnSet();
        columnSet.columns = [new ColumnConfig()];
        const result = validator.validateInput(columnSet, portfolio, widget);

        expect(result.message).toBe(NotificationConstants.MM_DECOMPOSITION_NOT_SUPPORTED_WITHOUT_BREAKDOWN);
    });

    it('should return INCOMPATIBLE_BREAKDOWN_FOR_MM_DECOMPOSITION if breakdown is incompatible', () => {
        widget.configType = WidgetConfigType.RISK_EXPOSURE;

        jest.spyOn(MultiManagerUtils, 'columnContainsMultiManagerOptions').mockReturnValue(true);
        jest.spyOn(MultiManagerUtils, 'isValidMMBreakdown').mockReturnValue(true);
        jest.spyOn(MultiManagerUtils, 'compareChildren').mockReturnValue(false);
        const columnSet = new ColumnSet();
        columnSet.columns = [new ColumnConfig()];
        portfolio.decisionLevelsConfig = {
            decisionBenchMap: {
                'path1': 'value1',
                'path2': 'value2'
            } };

        const result = validator.validateInput(columnSet, portfolio, widget);

        expect(result.message).toBe(NotificationConstants.INCOMPATIBLE_BREAKDOWN_FOR_MM_DECOMPOSITION);
    });

    it('should not return any notification if conditions are not met', () => {
        widget.configType = WidgetConfigType.RISK_EXPOSURE;
        jest.spyOn(MultiManagerUtils, 'columnContainsMultiManagerOptions').mockReturnValue(false);

        const result = validator.validateInput(columnSet, portfolio, widget);

        expect(result).toBeNull();
    });

    it('should not return any notification if widget config type is not RISK_EXPOSURE', () => {
        widget.configType = WidgetConfigType.PGS;
        jest.spyOn(MultiManagerUtils, 'columnContainsMultiManagerOptions').mockReturnValue(true);

        const result = validator.validateInput(columnSet, portfolio, widget);

        expect(result).toBeNull();
    });

    it('should not return any notification if no columns contain multi-manager options', () => {
        widget.configType = WidgetConfigType.RISK_EXPOSURE;

        jest.spyOn(MultiManagerUtils, 'columnContainsMultiManagerOptions').mockReturnValue(false);

        const result = validator.validateInput(columnSet, portfolio, widget);

        expect(result).toBeNull();
    });

    describe('test validateInput For Diversification Column', () => {
        const column = new ColumnConfig();
        column.columnTitle = 'Diversification Score';
        column.columnTag = 'diversification_score_pg_rk';
        column.positionColumnType = 'PORT';
        column.optionValues = [];
        const riskSettings = new RiskSettings();
        riskSettings.advancedRiskSettings = new AdvancedRiskSettings();
        column.optionValues.push(riskSettings);
        const factorSettingsColumnOption = new FactorSettingsColumnOption();
        column.optionValues.push(factorSettingsColumnOption);
        const columnSet: ColumnSet = {
            columns: [column]
        };

        it('undefined assetClassCovariance', () => {
            expect(validator.validateInputForWarning(columnSet)).toBe(null);
        });

        it('Y as assetClassCovariance', () => {
            riskSettings.advancedRiskSettings.assetClassCovariance = 'Y';
            expect(validator.validateInputForWarning(columnSet)).toBeNull();
        });

        it('M as assetClassCovariance', () => {
            riskSettings.advancedRiskSettings.assetClassCovariance = 'M';
            expect(validator.validateInputForWarning(columnSet)).toEqual([NotificationConstants.DIVERSIFICATION_COVAR_MATRIX_NOT_SUPPORTED]);
        });

        it('N as assetClassCovariance', () => {
            riskSettings.advancedRiskSettings.assetClassCovariance = 'N';
            expect(validator.validateInputForWarning(columnSet)).toEqual([NotificationConstants.DIVERSIFICATION_COVAR_MATRIX_NOT_SUPPORTED]);
        });
    });
});
