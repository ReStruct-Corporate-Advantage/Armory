import {
    BookColumnOption,
    ChartTypeColumnOption,
    ColumnSet,
    CustomTitleColumnOption,
    FormatAndScaleFactory,
    NumericDataFormatter,
    StringDataFormatter,
    ValueXXColumnOption
} from '@blk/explore-ui-column-option';
import {
    AttributionSettings, ChartWidgetInputConfigType,
    ColumnConfig,
    ColumnConstants,
    ColumnDefinition,
    CoreColumnUtils,
    DateFormatConstants,
    ExpostSettings,
    NumericColumnFormat,
    PerformanceSettings,
    ResponseData,
    ReturnsUtilityService,
    TimePeriod,
    UseType,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {ColumnHeaderDetails, ExploreResponse, ExploreResponseConfig, SplitColumnHeaderKey, SplitColumnKeys} from '@interfaces/response.interface';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Widget} from '@models/widget/widget.model';
import {CUSTOM_CALC_COL_TAG} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import {isNil} from 'lodash';
import moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {WorkspaceStore} from '../stores';
import {WidgetUtils} from './widget.utils';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {encode} from 'utf8';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';

/**
 * Test cases for class WidgetUtils
 */
describe('WidgetUtils', () => {

    beforeAll((done: any) => {
        TestUtils.initialize(done);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('handleLegacyFavorites Test', () => {
        it('should handleChartTypeColumnOptionFavorite', () => {
            // USER STORY 1654408 - FBA Bar Chart Case
            // Should Remove chartTypeColumnOption from columnOption and add it to ComboChartColumnSettings under widgetDisplayInputs
            const widgetColumns = [
                new ColumnConfig({columnTag: 'rfv_exp_port', columnKey: 'rfv_exp_port_35', columnTitle: 'Factor Exposure', optionValues: []}),
                new ColumnConfig({columnTag: 'rfv_std_port', columnKey: 'rfv_std_port_776', columnTitle: 'Standalone Risk', optionValues: [new ChartTypeColumnOption({chartType: 'line'})]}),
                new ColumnConfig({columnTag: 'rfv_contrib_port', columnKey: 'rfv_contrib_port_4', columnTitle: 'Risk Contribution', optionValues: [new ChartTypeColumnOption({chartType: 'line'})]}),
            ];
            const widgetDisplayInputs = new Map<string, WidgetInput>();
            widgetDisplayInputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, new ComboChartColumnSettings({columns: [new ComboChartColumn({colKey: 'rfv_contrib_port_4', secondaryAxis: true})]}));

            WidgetUtils['handleChartTypeColumnOptionFavorite'](widgetColumns, widgetDisplayInputs);

            expect(widgetColumns[0].optionValues.length).toBe(0);
            expect(widgetColumns[1].optionValues.length).toBe(0);
            expect(widgetColumns[2].optionValues.length).toBe(0);

            const comboChartColumnSettings = widgetDisplayInputs.get(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS) as ComboChartColumnSettings;
            expect(comboChartColumnSettings.columns.length).toBe(2);
            expect(comboChartColumnSettings.columns[0].colKey).toEqual('rfv_contrib_port_4');
            expect(comboChartColumnSettings.columns[0].chartType).toEqual(ColumnSeriesChartType.MARKER);
            expect(comboChartColumnSettings.columns[0].secondaryAxis).toBeTruthy();
            expect(comboChartColumnSettings.columns[1].colKey).toEqual('rfv_std_port_776');
            expect(comboChartColumnSettings.columns[1].chartType).toEqual(ColumnSeriesChartType.MARKER);
        });
    });

    it('convertWidgetInputsToVizualisationColumnConfig', () => {
        const widget = new Widget(WidgetConfigType.RETURNS);
        const columnSet = widget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        columnSet.columns = [];
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.PNL_CUSIP_IDENTIFIER_COLUMN.columnTag, ColumnConstants.PNL_CUSIP_IDENTIFIER_COLUMN.positionColumnType, ColumnConstants.PNL_CUSIP_IDENTIFIER_COLUMN.columnKey));
        let visualizationCols = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        expect(visualizationCols.length).toBe(3);
        expect(visualizationCols[0].columnKey).toBe(ColumnConstants.PNL_CUSIP_IDENTIFIER_COLUMN.columnKey);
        expect(visualizationCols[1].columnKey).toBe(ColumnConstants.PNL_ID);
        expect(visualizationCols[2].columnKey).toBe('pnl_sec_desc_hidden');

        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.PNL_ID, UseType.ALL, 'pnl_id_1'));
        visualizationCols = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        expect(visualizationCols.length).toBe(3);
        expect(visualizationCols[0].columnKey).toBe(ColumnConstants.PNL_CUSIP_IDENTIFIER_COLUMN.columnKey);
        expect(visualizationCols[1].columnKey).toBe('pnl_id_1');
        expect(visualizationCols[2].columnKey).toBe('pnl_sec_desc_hidden');
    });


    it('convertWidgetInputsToVizualisationColumnConfig - for splitColumns', () => {
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        // Extra cusip_1 column coming from backend would be ignored
        const columnKeys = ['cusip_1', 'security_description_1', 'cusip_0', 'pct_mv_1|Current|Total', 'pct_mv_1|Current|CASH', 'pct_mv_1|Current|EQUITY', 'pct_mv_1|Current|FUND', 'pct_mv_1|Prior Day|Total', 'pct_mv_1|Prior Day|CASH',
            'pct_mv_1|Prior Day|EQUITY', 'pct_mv_1|Prior Day|FUND', 'pct_mv_c80ed408ad68443'];
        const columnSet = widget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        columnSet.columns.push(ColumnConfig.createColumn('pct_mv', 'BENCH', 'pct_mv_c80ed408ad68443', 'Benchmark Market Value %'));
        const splitColumnKeys = {
            pct_mv_1: [{
                header: 'Current',
                originalKey: 'pct_mv_1|Current',
                updatedKey: 'pct_mv_1|Current',
                updatedKeySuffix: 'Current',
                children: [
                    {
                        header: 'Total',
                        originalKey: 'pct_mv_1|Current|Total',
                        updatedKey: 'pct_mv_1|Current|Total',
                        updatedKeySuffix: 'Total'
                    },
                    {
                        header: 'CASH',
                        originalKey: 'pct_mv_1|Current|CASH',
                        updatedKey: 'pct_mv_1|Current|CASH',
                        updatedKeySuffix: 'CASH'
                    },
                    {
                        header: 'EQUITY',
                        originalKey: 'pct_mv_1|Current|EQUITY',
                        updatedKey: 'pct_mv_1|Current|EQUITY',
                        updatedKeySuffix: 'EQUITY'
                    },
                    {
                        header: 'FUND',
                        originalKey: 'pct_mv_1|Current|FUND',
                        updatedKey: 'pct_mv_1|Current|FUND',
                        updatedKeySuffix: 'FUND'
                    }
                ]
            },
                {
                    header: 'Prior Day',
                    originalKey: 'pct_mv_1|Prior Day',
                    updatedKey: 'pct_mv_1|Prior Day',
                    updatedKeySuffix: 'Prior Day',
                    children: [
                        {
                            header: 'Total',
                            originalKey: 'pct_mv_1|Prior Day|Total',
                            updatedKey: 'pct_mv_1|Prior Day|Total',
                            updatedKeySuffix: 'Total'
                        },
                        {
                            header: 'CASH',
                            originalKey: 'pct_mv_1|Prior Day|CASH',
                            updatedKey: 'pct_mv_1|Prior Day|CASH',
                            updatedKeySuffix: 'CASH'
                        },
                        {
                            header: 'EQUITY',
                            originalKey: 'pct_mv_1|Prior Day|EQUITY',
                            updatedKey: 'pct_mv_1|Prior Day|EQUITY',
                            updatedKeySuffix: 'EQUITY'
                        },
                        {
                            header: 'FUND',
                            originalKey: 'pct_mv_1|Prior Day|FUND',
                            updatedKey: 'pct_mv_1|Prior Day|FUND',
                            updatedKeySuffix: 'FUND'
                        }
                    ]
                }]
        };
        const visualizationCols = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.getCombinedInputs(), widget.displayInputs, widget.configType, undefined, null, columnKeys, splitColumnKeys);
        expect(visualizationCols.length).toBe(11);
        verifyColumnKeyAndTitle(visualizationCols[0], 'security_description_1', 'Security Description');
        verifyColumnKeyAndTitle(visualizationCols[1], 'cusip_0', 'CUSIP');
        verifyColumnKeyAndTitle(visualizationCols[2], 'pct_mv_1|Current|Total', 'Total');
        verifyColumnKeyAndTitle(visualizationCols[3], 'pct_mv_1|Current|CASH', 'CASH');
        verifyColumnKeyAndTitle(visualizationCols[4], 'pct_mv_1|Current|EQUITY', 'EQUITY');
        verifyColumnKeyAndTitle(visualizationCols[5], 'pct_mv_1|Current|FUND', 'FUND');
        verifyColumnKeyAndTitle(visualizationCols[6], 'pct_mv_1|Prior Day|Total', 'Total');
        verifyColumnKeyAndTitle(visualizationCols[7], 'pct_mv_1|Prior Day|CASH', 'CASH');
        verifyColumnKeyAndTitle(visualizationCols[8], 'pct_mv_1|Prior Day|EQUITY', 'EQUITY');
        verifyColumnKeyAndTitle(visualizationCols[9], 'pct_mv_1|Prior Day|FUND', 'FUND');
        verifyColumnKeyAndTitle(visualizationCols[10], 'pct_mv_c80ed408ad68443', 'Benchmark Market Value %');
    });

    it('getCombinedInputs', () => {
        const widget = new Widget(WidgetConfigType.PIE);
        const inputs = WidgetUtils.getCombinedInputs(widget);

        // Ensure that the returned inputs is not the same instance as either of the other 2.
        expect(inputs !== widget.dataStore.metaData.inputs).toBeTruthy();
        expect(inputs !== widget.displayInputs).toBeTruthy();

        expect(widget.dataStore.metaData.inputs.size).toBeGreaterThan(0);
        expect(widget.displayInputs.size).toBeGreaterThan(0);
        expect(inputs.size).toBe(widget.dataStore.metaData.inputs.size + widget.displayInputs.size);
    });

    it('updateWidgetWithPortfolioSettings', () => {
        const port = new Portfolio();
        port.performanceSettings = new PerformanceSettings();
        port.performanceSettings.timePeriod = new TimePeriod('Month To Date', 1, 'MTD');
        port.portfolioRiskSettings = new RiskSettings();
        port.expostSettings = new ExpostSettings();
        port.expostSettings.samplingPeriod = new TimePeriod('Month To Date', 2, 'MTD');

        const widget = new Widget(WidgetConfigType.PRA);
        widget.displayInputs.set('expostSettings', new ExpostSettings());
        jest.spyOn(widget, 'setDisplayTitle').mockImplementation();

        // Force in a columnSet with a column that will have the performance settings updated on it.
        const columns = new ColumnSet();
        const col = new ColumnConfig();
        const perfSettings = new PerformanceSettings();
        col.optionValues.push(perfSettings);
        columns.columns.push(col);
        widget.dataStore.metaData.inputs.set('testColumns', columns);

        const dataStoreInputCount = widget.dataStore.metaData.inputs.size;
        const displayInputCount = widget.displayInputs.size;

        WidgetUtils.updateWidgetWithPortfolioSettings(widget, port);

        // Comparing the count from before and after the above method call as it was coping all the inputs to the data store.
        expect(widget.dataStore.metaData.inputs.size).toBe(dataStoreInputCount);
        expect(widget.displayInputs.size).toBe(displayInputCount);

        expect((widget.displayInputs.get('expostSettings') as ExpostSettings).samplingPeriod.equals(port.expostSettings.samplingPeriod)).toBeTruthy();
        expect((widget.dataStore.metaData.inputs.get('performanceSettings') as PerformanceSettings).parentPerformanceSettings).toBe(port.performanceSettings);
        expect((widget.dataStore.metaData.inputs.get('riskSettings') as RiskSettings).economyRiskSettings.parentRiskSettings).toBe(port.portfolioRiskSettings.economyRiskSettings);
        expect((widget.dataStore.metaData.inputs.get('riskSettings') as RiskSettings).economyRiskSettings.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect((widget.dataStore.metaData.inputs.get('riskSettings') as RiskSettings).exposureRiskSettings.parentRiskSettings).toBe(port.portfolioRiskSettings.exposureRiskSettings);
        expect((widget.dataStore.metaData.inputs.get('riskSettings') as RiskSettings).exposureRiskSettings.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect((widget.dataStore.metaData.inputs.get('riskSettings') as RiskSettings).advancedRiskSettings.parentRiskSettings).toBe(port.portfolioRiskSettings.advancedRiskSettings);
        expect((widget.dataStore.metaData.inputs.get('riskSettings') as RiskSettings).advancedRiskSettings.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect(widget.setDisplayTitle).toHaveBeenCalledWith(port.datePicker);

        // Validate that the column had the performance settings updated onto it.
        expect(perfSettings.timePeriod === port.performanceSettings.timePeriod).toBeTruthy();
    });

    it('updateWidgetWithPortfolioSettings - returns widget', () => {
        const port = new Portfolio();
        port.performanceSettings = new PerformanceSettings();
        port.performanceSettings.timePeriod = new TimePeriod('Month To Date', 1, 'MTD');
        port.performanceSettings.attributionSettings = new AttributionSettings();
        port.performanceSettings.attributionSettings.cannedMethod = 'FIXED_INCOME';
        jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(port);
        const widget = new Widget(WidgetConfigType.RETURNS);
        jest.spyOn(ReturnsUtilityService, 'addFactorColumns');
        WidgetUtils.addDefaultReturnsColumn(widget);
        expect(ReturnsUtilityService.addFactorColumns).toHaveBeenCalledWith(port.performanceSettings.attributionSettings.cannedMethod, (widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns, port.performanceSettings.attributionSettings.factors);
    });

    /**
     * Tests createVizColumn
     */
    it('createVizColumn - undefined columnTitle, undefined columnKey, undefined splitColumnKeys', () => {
        runCreateVizColumnAndValidate(undefined, undefined, undefined, true);
    });

    /**
     * Tests createVizColumn
     */
    it('createVizColumn - defined columnTitle, defined columnKey, defined splitColumnKeys', () => {
        const keys = new class implements SplitColumnKeys {
            [column: string]: SplitColumnHeaderKey[];
        }();

        runCreateVizColumnAndValidate('xyz', 'ABC columnKey', keys, true);
    });

    /**
     * Tests createVizColumn
     */
    it('createVizColumn - splitColumnKeys - different charts', () => {
        const splitColumnKeys = {
            pct_mv_1: [{
                header: 'Current',
                originalKey: 'pct_mv_1|Current',
                updatedKey: 'pct_mv_1|Current',
                updatedKeySuffix: 'Current',
            },
                {
                    header: 'Prior Day',
                    originalKey: 'pct_mv_1|Prior Day',
                    updatedKey: 'pct_mv_1|Prior Day',
                    updatedKeySuffix: 'Prior Day',
                }]
        };
        const col: ColumnConfig = ColumnConfig.createColumn(ColumnConstants.COLUMN_TAG.PCT_MARKET_VAL, UseType.PORT);
        col.columnTitle = 'Market Value %';
        col.columnKey = 'pct_mv_1';
        let vizColumn = WidgetUtils.createVizColumn({
            column: col,
            isHidden: false,
            columnKey: 'pct_mv_1|Current',
            splitColumnKeys,
            configType: WidgetConfigType.RISK_EXPOSURE
        });
        expect(vizColumn.columnTitle).toBe('Current');

        vizColumn = WidgetUtils.createVizColumn({column: col, isHidden: false, columnKey: 'pct_mv_1|Current', splitColumnKeys, configType: WidgetConfigType.BAR});
        expect(vizColumn.columnTitle).toBe('Current Market Value %');

        vizColumn = WidgetUtils.createVizColumn({column: col, isHidden: false, columnKey: 'pct_mv_1|Current', splitColumnKeys, configType: WidgetConfigType.PIE});
        expect(vizColumn.columnTitle).toBe('Market Value %');
    });

    /**
     * Tests createVizColumn
     */
    it('createVizColumn - splitColumnKeys - Bar charts with KRD Column saved as Fav', () => {
        const splitColumnKeys = {
            krd_123: [
                {header: '3M', originalKey: 'krd_123|3M', updatedKeySuffix: '3M', updatedKey: 'krd_123|3M'},
                {header: '1Y', originalKey: 'krd_123|1Y', updatedKeySuffix: '1Y', updatedKey: 'krd_123|1Y'},
                {header: '2Y', originalKey: 'krd_123|2Y', updatedKeySuffix: '2Y', updatedKey: 'krd_123|2Y'}
            ]
        };
        const col = ColumnConfig.createColumn('krdxx', UseType.PORT);
        col.columnTitle = 'KRDxx';
        col.columnKey = 'krd_123';
        col.optionValues = [new ValueXXColumnOption({shockValue: 1})];
        const vizColumn = WidgetUtils.createVizColumn({column: col, isHidden: false, columnKey: 'krd_123|3M', splitColumnKeys, configType: WidgetConfigType.BAR});
        expect(vizColumn.columnTitle).toBe('3M KRD1');
    });

    it('createVizColumn - Bar charts with Book Column saved as Fav', () => {
        const col = ColumnConfig.createColumn('book_value', UseType.PORT);
        col.columnTitle = 'Book Value';
        col.columnKey = 'book_value_1';
        col.optionValues = [new BookColumnOption({accountingConvention: 'GAAP'})];
        let vizColumn = WidgetUtils.createVizColumn({column: col, isHidden: false, columnKey: undefined, splitColumnKeys: undefined, configType: WidgetConfigType.BAR});
        expect(vizColumn.columnTitle).toBe('Book Value (GAAP)');

        // when columnTitle is already modified
        col.columnTitle = 'Book Value (GAAP)';
        vizColumn = WidgetUtils.createVizColumn({column: col, isHidden: false, columnKey: undefined, splitColumnKeys: undefined, configType: WidgetConfigType.BAR});
        expect(vizColumn.columnTitle).toBe('Book Value (GAAP)');
    });

    it('createVizColumn - when custom column title is defined', () => {
        const col = ColumnConfig.createColumn('pct_mv', UseType.PORT);
        col.columnTitle = 'Market Value %';
        col.columnKey = 'pct_mv_1';
        col.optionValues = [new CustomTitleColumnOption({customTitle: 'MV%'})];
        const vizColumn = WidgetUtils.createVizColumn({column: col, isHidden: false, columnKey: undefined, splitColumnKeys: undefined, configType: WidgetConfigType.BAR});
        expect(vizColumn.columnTitle).toBe('MV%');
    });

    describe('createVizColumn - custom_calc column tests', () => {
        const columnHeaderDetails: ColumnHeaderDetails = {
            columnKeyToDisplayNameMap: {
                'risk_date_1948050d,e089,4': 'Risk Date',
                'custom_calc_df3d663d,757e,4': 'Custom Calculation(Sum-PORT)',
                'cusip_0': 'CUSIP',
                'security_description_1': 'Security Description',
                'pct_mv_1': 'Market Value %',
                'price_date_7328d827,b980,4': 'Price Date',
                'custom_calc_ecf0a042,b21d,4': 'Custom Calculation(Sum-PORT)',
                'sec_group_hidden': 'Security Group'
            },
            columnKeyToTagMap: {
                'risk_date_1948050d,e089,4': 'risk_date',
                'custom_calc_df3d663d,757e,4': 'custom_calc',
                'cusip_0': 'cusip',
                'security_description_1': 'security_description',
                'pct_mv_1': 'pct_mv',
                'price_date_7328d827,b980,4': 'price_date',
                'custom_calc_ecf0a042,b21d,4': 'custom_calc',
                'sec_group_hidden': 'sec_group'
            }
        };
        const exploreResponseConfig: ExploreResponseConfig = {
            columnHeaderDetails,
            columns: [
                'security_description_1',
                'cusip_0',
                'pct_mv_1',
                'previous_close_price_b26d920c,3dd8,4',
                'book_price_af50f6c8,f56a,4',
                'custom_calc_e6370551,0de0,4',
                'sec_group_hidden'
            ]
        };
        let customCalcColumnDefinition: ColumnDefinition;
        let customCalcColumnConfig: ColumnConfig;

        beforeEach(() => {
            customCalcColumnDefinition = new ColumnDefinition({
                columnTag: 'custom_calc',
                field: null,
                title: 'Custom Calculation',
                uses: 'ALL',
                isSubtotalable: true,
                reportTypes: ['SINGLE', 'MULTI', 'TREND'],
                columnReports: ['prism_all'],
                dataType: 'DOUBLE',
                columnType: 'DERIVED',
                isNotSupportedInCustomCal: false,
                isGroupable: false,
                isStaticColumn: false,
                columnDesc: 'Customized calculated field using existing Prism columns as inputs',
                functionFlag: 0,
                strippedName: 'Custom Calculation',
                columnFormat: null
            });
            jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse').mockReturnValue(customCalcColumnDefinition);

            customCalcColumnConfig = ColumnConfig.createColumn('custom_calc', 'ALL', 'custom_calc_e6370551,0de0,4');
        });

        it('should set custom_calc dataType to STRING when string values present in response', () => {
            const stringCustomCalcResponse: ResponseData = {
                'data': [null, null, 1, null, 48.17905974507049, null, null],
                'children': [
                    {
                        'title': 'CASH',
                        'data': [null, null, 0.010317978483326991, null, 100, null, null],
                        'children': [
                            {
                                'data': ['AUD CASH(Alpha Committed)', 'AUD_CCASH', 0.0010364606527974152, 100, 100, 'BOOK', 'CASH'],
                                'rowId': 3
                            },
                            {
                                'data': ['EUR CASH(Alpha Committed)', 'EUR_CCASH', -0.0030653126140275837, 100, 99.99999999999999, 'PRICE', 'CASH'],
                                'rowId': 4
                            },
                        ],
                        'rowId': 2,
                        'sectorOrder': 0
                    },
                    {
                        'title': 'EQUITY',
                        'data': [null, null, 0.986453963582563, null, 32.15483573697766, null, null],
                        'children': [
                            {
                                'data': ['AIA GROUP LTD', 'SB4TX8S14', 0.007982666776307146, 68.8, 84.5842, 'BOOK', 'EQUITY'],
                                'rowId': 41
                            },
                            {
                                'data': ['AJINOMOTO INC', 'S60109063', 0.02040719059353326, 1740.5, 2120.719695131086, 'BOOK', 'EQUITY'],
                                'rowId': 42
                            }
                        ],
                        'rowId': 40,
                        'sectorOrder': 1
                    },
                    {
                        'title': 'FUND',
                        'data': [null, null, 0.003228057934110175, null, 100.09878233183944, null, null],
                        'children': [
                            {
                                'data': ['BLK ICS USD LEAF AGENCY DIST', 'BRTUM0NZ6', 0.003228057934110175, 100.0905, 100.09878233183944, 'BOOK', 'FUND'],
                                'rowId': 138
                            }
                        ],
                        'rowId': 137,
                        'sectorOrder': 2
                    }
                ],
                'rowId': 1
            };

            const exploreResponse: ExploreResponse = {
                data: {
                    ...exploreResponseConfig,
                    data: stringCustomCalcResponse
                }
            };

            const vizColumn = WidgetUtils.createVizColumn({column: customCalcColumnConfig, isHidden: false, columnKey: undefined, splitColumnKeys: undefined, configType: WidgetConfigType.RISK_EXPOSURE, response: exploreResponse, columnHeaderDetails});
            expect(vizColumn.columnTag).toEqual(CUSTOM_CALC_COL_TAG);
            expect(vizColumn.columnKey).toEqual('custom_calc_e6370551,0de0,4');
            expect(vizColumn.dataType).toEqual(ColumnConstants.COLUMN_DATA_TYPE.STRING);
        });

        it('should update custom_calc dataType to DATE when date values present in response', () => {
            // Create response
            const dateCustomCalcResponse: ResponseData = {
                'data': [null, null, 1, null, 48.17905974507049, null, null],
                'children': [
                    {
                        'title': 'CASH',
                        'data': [null, null, 0.010317978483326991, null, 100, null, null],
                        'children': [
                            {
                                'data': ['AUD CASH(Alpha Committed)', 'AUD_CCASH', 0.0010364606527974152, 100, 100, '10-MAR-2020', 'CASH'],
                                'rowId': 3
                            },
                            {
                                'data': ['EUR CASH(Alpha Committed)', 'EUR_CCASH', -0.0030653126140275837, 100, 99.99999999999999, '10-MAR-2020', 'CASH'],
                                'rowId': 4
                            },
                        ],
                        'rowId': 2,
                        'sectorOrder': 0
                    }
                ],
                'rowId': 1
            };

            const exploreResponse: ExploreResponse = {
                data: {
                    ...exploreResponseConfig,
                    data: dateCustomCalcResponse
                }
            };

            const vizColumn = WidgetUtils.createVizColumn({column: customCalcColumnConfig, isHidden: false, columnKey: undefined, splitColumnKeys: undefined, configType: WidgetConfigType.RISK_EXPOSURE, response: exploreResponse, columnHeaderDetails});
            expect(vizColumn.columnTag).toEqual(CUSTOM_CALC_COL_TAG);
            expect(vizColumn.columnKey).toEqual('custom_calc_e6370551,0de0,4');
            expect(vizColumn.dataType).toEqual(ColumnConstants.COLUMN_DATA_TYPE.DATE);
        });

        it('should default custom_calc dataType to DOUBLE when no string/date values present in response', () => {
            const doubleCustomCalcResponse: ResponseData = {
                'data': [null, null, 1, null, 48.17905974507049, null, null],
                'children': [
                    {
                        'title': 'CASH',
                        'data': [null, null, 0.010317978483326991, null, 100, 123.45, null],
                        'children': [
                            {
                                'data': ['AUD CASH(Alpha Committed)', 'AUD_CCASH', 0.0010364606527974152, 100, 100, 123.45, 'CASH'],
                                'rowId': 3
                            },
                            {
                                'data': ['EUR CASH(Alpha Committed)', 'EUR_CCASH', -0.0030653126140275837, 100, 99.99999999999999, 123.45, 'CASH'],
                                'rowId': 4
                            },
                        ],
                        'rowId': 2,
                        'sectorOrder': 0
                    }
                ],
                'rowId': 1
            };

            const exploreResponse: ExploreResponse = {
                data: {
                    ...exploreResponseConfig,
                    data: doubleCustomCalcResponse
                }
            };

            const vizColumn = WidgetUtils.createVizColumn({column: customCalcColumnConfig, isHidden: false, columnKey: undefined, splitColumnKeys: undefined, configType: WidgetConfigType.RISK_EXPOSURE, response: exploreResponse, columnHeaderDetails});
            expect(vizColumn.columnTag).toEqual(CUSTOM_CALC_COL_TAG);
            expect(vizColumn.columnKey).toEqual('custom_calc_e6370551,0de0,4');
            expect(vizColumn.dataType).toEqual(ColumnConstants.COLUMN_DATA_TYPE.DOUBLE);
        });

        it('should update custom_calc dataType to STRING when mixed string/number/data values are present in response', () => {
            const stringCustomCalcResponse: ResponseData = {
                'data': [null, null, 1, null, 48.17905974507049, null, null],
                'children': [
                    {
                        'title': 'CASH',
                        'data': [null, null, 0.010317978483326991, null, 100, '10-MAR-2020', null],
                        'children': [
                            {
                                'data': ['AUD CASH(Alpha Committed)', 'AUD_CCASH', 0.0010364606527974152, 100, 100, 123, 'CASH'],
                                'rowId': 3
                            },
                            {
                                'data': ['EUR CASH(Alpha Committed)', 'EUR_CCASH', -0.0030653126140275837, 100, 99.99999999999999, 'PRICE', 'CASH'],
                                'rowId': 4
                            },
                        ],
                        'rowId': 2,
                        'sectorOrder': 0
                    }
                ],
                'rowId': 1
            };

            const exploreResponse: ExploreResponse = {
                data: {
                    ...exploreResponseConfig,
                    data: stringCustomCalcResponse
                }
            };

            const vizColumn = WidgetUtils.createVizColumn({column: customCalcColumnConfig, isHidden: false, columnKey: undefined, splitColumnKeys: undefined, configType: WidgetConfigType.RISK_EXPOSURE, response: exploreResponse, columnHeaderDetails});
            expect(vizColumn.columnTag).toEqual(CUSTOM_CALC_COL_TAG);
            expect(vizColumn.columnKey).toEqual('custom_calc_e6370551,0de0,4');
            expect(vizColumn.dataType).toEqual(ColumnConstants.COLUMN_DATA_TYPE.STRING);
        });
    });

    it('Test errorOutWidget function', function () {
        const notificationText = 'Loading interrupted';
        const widgetModel = new Widget();
        widgetModel.id = 123;
        const widget: any = {widget: widgetModel};
        WorkspaceStore.widgetLoadingStatusMap.set(123, new BehaviorSubject<boolean>(true));
        WidgetUtils.errorOutWidget(widget, notificationText);
        expect(WorkspaceStore.widgetLoadingStatusMap.get(123).getValue()).toBeFalsy();
        expect(widget.widget.dataStore.data.notification.message).toBe(notificationText);
    });

    it('Test assembleDefaultFilterValues function', function () {
        expect(WidgetUtils.assembleDefaultFilterValues(null, ['cusip_2', 'market_val_1'])).toEqual({});

        const columnSet: ColumnSet = new ColumnSet();
        expect(WidgetUtils.assembleDefaultFilterValues(columnSet, ['cusip_2', 'market_val_1'])).toEqual({});

        columnSet.columns.push(ColumnConfig.createColumn('market_val', 'PORT', 'market_val_1'));
        columnSet.columns.push(ColumnConfig.createColumn('cusip', null, 'cusip_2'));
        expect(WidgetUtils.assembleDefaultFilterValues(columnSet, ['cusip_2', 'market_val_1'])).toEqual({});

        const filters = {
            'market_val_1': {filter: 100, type: 'greaterThan'},
            'ag-Grid-AutoColumn': {filter: '123', type: 'contains'}
        };

        columnSet.updateColumnFiltersFromGrid(filters, 'cusip_2');
        expect(WidgetUtils.assembleDefaultFilterValues(columnSet, ['cusip_2', 'market_val_1'])).toEqual(filters);
    });

    /**
     * Runs createVizColumn and validates the result
     */
    function runCreateVizColumnAndValidate(columnTitle: string, columnKey: string, splitColumnKeys: SplitColumnKeys, isGetOriginalColumnTitleExpectedToBeCalled: boolean) {
        // Spies and mock implementations
        const dummyTitle = 'xyz';
        const getOriginalColumnTitleSpy = jest.spyOn(CoreColumnUtils, 'getOriginalColumnTitle');
        getOriginalColumnTitleSpy.mockImplementation(jest.fn(() => {
            return dummyTitle;
        }));

        const columnDefinition = new ColumnDefinition();
        columnDefinition.dataType = 'S';
        columnDefinition.isSubtotalable = true;
        const getColumnDefByTagAndUseSpy = jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse');
        getColumnDefByTagAndUseSpy.mockImplementation(jest.fn(() => {
            return columnDefinition;
        }));

        const formatter = new StringDataFormatter();
        const getFormatterToUseSpy = jest.spyOn(FormatAndScaleFactory, 'getFormatterToUse');
        getFormatterToUseSpy.mockImplementation(jest.fn(() => {
            return formatter;
        }));

        // Create method inputs
        const isHidden = false;
        const column = new ColumnConfig();
        column.columnTag = 'tag';
        column.columnKey = 'key';
        column.columnTitle = columnTitle;

        // Determine expected results
        let expectedColumnKey;
        if (isNil(columnKey)) {
            expectedColumnKey = column.columnKey;
        } else {
            expectedColumnKey = columnKey;
        }

        let expectedTitle;
        let expectedGetOriginalColumnTitleCallTimes;
        if (isGetOriginalColumnTitleExpectedToBeCalled) {
            expectedTitle = dummyTitle;
            expectedGetOriginalColumnTitleCallTimes = 1;
        } else {
            expectedTitle = columnTitle;
            expectedGetOriginalColumnTitleCallTimes = 0;
        }

        // Run method
        const vizColumnConfig = WidgetUtils.createVizColumn({
            column, isHidden, columnKey, splitColumnKeys
        });

        // Validate the result
        expect(vizColumnConfig.columnKey).toStrictEqual(expectedColumnKey);
        expect(vizColumnConfig.columnTag).toStrictEqual(column.columnTag);
        expect(vizColumnConfig.isHidden).toStrictEqual(isHidden);
        expect(vizColumnConfig.dataType).toStrictEqual(columnDefinition.dataType);
        expect(vizColumnConfig.isSubtotalable).toStrictEqual(columnDefinition.isSubtotalable);
        expect(vizColumnConfig.formatter).toBe(formatter);

        expect(vizColumnConfig.columnTitle).toStrictEqual(expectedTitle);
        expect(getOriginalColumnTitleSpy).toHaveBeenCalledTimes(expectedGetOriginalColumnTitleCallTimes);
    }

    function verifyColumnKeyAndTitle(col: VizualizationColumnConfig, expectedColumnKey: string, expectedColumnTitle: string) {
        expect(col.columnKey === expectedColumnKey).toBeTruthy();
        expect(col.columnTitle === expectedColumnTitle).toBeTruthy();
    }


    it('tests getInputValueToFormat', () => {
        let value = {};
        const formatter = new NumericDataFormatter(new NumericColumnFormat({scalingFactor: 0.01}), []);

        // valid numeric formatter with invalid value
        expect(WidgetUtils.getInputValueToFormat(undefined, formatter)).toBe(undefined);

        // valid numeric formatter with invalid value
        expect(WidgetUtils.getInputValueToFormat(value, formatter)).toBe(value);

        // valid numeric operator with valid value
        value = 0.5;
        expect(WidgetUtils.getInputValueToFormat(value, formatter)).toBe(0.005);

        // valid numeric operator with valid value & expost boolean set to true
        expect(WidgetUtils.getInputValueToFormat(value, formatter, true)).toBe(0.00005);

        // invalid numeric formatter
        expect(WidgetUtils.getInputValueToFormat(value, {} as any)).toBe(value);

        // invalid value
        value = '0.500';
        expect(WidgetUtils.getInputValueToFormat(value, formatter)).toBe('0.500');

        // previousScaling is present
        expect(WidgetUtils.getInputValueToFormat(0.5, formatter, false, 0.000001)).toBe(0.0000005);
    });

    it('tests addNullValuesToResponseData', () => {
        const responseData: ResponseData = {
            data: [1, 2, 3, 4, 5, 7],
            children: [
                {data: [5, 6, 4, 89, 7], children: [{data: [2, 5, 4, 8, 6, 5]}]},
                {data: [null, 7, 3, 8, 3, null]},
                {data: [5, 6, null, null, 7, 10]}
            ]
        };
        WidgetUtils.addNullValuesToResponseData(responseData, [3, 5, 7]);
        expect(responseData.data).toStrictEqual([1, 2, 3, null, 4, null, 5, null, 7]);
        expect(responseData.children[0].data).toStrictEqual([5, 6, 4, null, 89, null, 7, null]);
        expect(responseData.children[1].data).toStrictEqual([null, 7, 3, null, 8, null, 3, null, null]);
        expect(responseData.children[2].data).toStrictEqual([5, 6, null, null, null, null, 7, null, 10]);
        expect(responseData.children[0].children).toStrictEqual([{data: [2, 5, 4, null, 8, null, 6, null, 5]}]);
    });

    it('tests hasMacroFactorBreakdown', () => {
        const widget = new Widget(WidgetConfigType.PRA);
        const columnDefinition = new ColumnDefinition();
        columnDefinition.isMacroFactor = true;
        jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse').mockReturnValue(columnDefinition);

        expect(WidgetUtils.hasMacroFactorBreakdown(widget)).toBeTruthy();

        columnDefinition.isMacroFactor = null;
        expect(WidgetUtils.hasMacroFactorBreakdown(widget)).toBeFalsy();
    });

    it('should never return true for hasMacroFactorBreakdown if isMandateDefaultBreakdown', () => {
        const breakdown = new Breakdown();
        breakdown.isMandateDefaultBreakdown = true;
        const widget = new Widget(WidgetConfigType.PRA);
        widget.dataStore.metaData.inputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, breakdown);

        expect(WidgetUtils.hasMacroFactorBreakdown(widget)).toEqual(false);
    });

    it('tests checkRowDataType', () => {
        // Checks if value is a date
        const isDate = (value: any): boolean => moment(value, DateFormatConstants.DDMMMYYYY_DASH, true).isValid();
        // Checks if value is a string. Note- we ignore strings that can be parsed to dates
        const isString = (value: any): boolean => (typeof value === 'string' || value instanceof String) && !isDate(value);

        expect(WidgetUtils.checkRowDataType(0, {data: undefined, children: [{data: ['Test']}]}, isString)).toBeTruthy();
        expect(WidgetUtils.checkRowDataType(0, {data: undefined, children: [{data: [1]}]}, isString)).toBeFalsy();
        expect(WidgetUtils.checkRowDataType(0, {data: ['Test']}, isString)).toBeTruthy();
    });

    it('tests sanitizeString', () => {
        const validAlphabetical = 'abc123';
        expect(WidgetUtils.sanitizeString(validAlphabetical)).toEqual(validAlphabetical);

        const validSymbol = '~!@#$%^&*()_+ ';
        expect(WidgetUtils.sanitizeString(validSymbol)).toEqual(validSymbol);

        const validLatin = 'Latīna';
        expect(WidgetUtils.sanitizeString(validLatin)).toEqual(validLatin);

        // The following Greek, Spanish and French words are considered utf8 "invalid" in the context of @types/utf8
        const invalidGreek = 'κόσμε';
        expect(WidgetUtils.sanitizeString(invalidGreek)).toEqual(encode(invalidGreek));

        const invalidSpanish = 'Español';
        expect(WidgetUtils.sanitizeString(invalidSpanish)).toEqual(encode(invalidSpanish));

        const invalidFrench = 'français';
        expect(WidgetUtils.sanitizeString(invalidFrench)).toEqual(encode(invalidFrench));

        const invalidString = 'abc�';
        expect(WidgetUtils.sanitizeString(invalidString)).toEqual('abc');
    });
});
