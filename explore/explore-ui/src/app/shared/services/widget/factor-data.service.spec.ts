import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnConfig, ColumnConstants, ColumnType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {AdvancedRiskSettings, CoreRiskConstants, EconomySettings, ExposureSettings, HvarRiskSettingsModel, RiskSettings} from '@blk/explore-ui-risk';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {BehaviorSubject} from 'rxjs';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {FactorDataService} from '@services/widget/factor-data.service';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {ChartType} from '@qbstr/highcharts-api';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {ExploreResponse} from '@interfaces/response.interface';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {FactorDataRiskMatrixSettings} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';

describe('FactorDataService', () => {
    let service: FactorDataService;
    let exploreDataRequestService: ExploreDataRequestService;
    let widgetInputs: Map<string, WidgetInput>;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new FactorDataService(exploreDataRequestService);
    });

    beforeEach((done) => {
        TestUtils.initialize(done);
        widgetInputs = new Map<string, WidgetInput>();

        const column = new ColumnConfig();
        column.columnTag = 'factor1';
        column.positionColumnType = ColumnConstants.FACTOR_MODEL;
        column.columnKey = 'factor1abc';
        column.columnTitle = 'factor col 1';
        column.optionValues = [ new RiskSettings() ];

        const columnSet = new ColumnSet();
        columnSet.columns = [ column ];

        const factorDataChartSettings = new FactorDataChartSettings();
        factorDataChartSettings.isTimeSeriesMode = true;
        factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.VOLATILITIES;

        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        widgetInputs.set(FactorDataChartSettings.configType, factorDataChartSettings);

        const widgetRiskSettings = new RiskSettings();

        const portDefaultEconomySettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultEconomySettings.overlap = 5;
        const portEconomySettings = new EconomySettings(portDefaultEconomySettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        widgetRiskSettings.economyRiskSettings = new EconomySettings(portEconomySettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        const portDefaultExposureSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultExposureSettings.riskModel = '^EMEAA';
        const portExposureSettings = new ExposureSettings(portDefaultExposureSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        widgetRiskSettings.exposureRiskSettings = new ExposureSettings(portExposureSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        const portDefaultAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultAdvancedRiskSettings.dxsBlock = 'ALL_DXS';
        const portAdvancedRiskSettings = new AdvancedRiskSettings(portDefaultAdvancedRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        widgetRiskSettings.advancedRiskSettings = new AdvancedRiskSettings(portAdvancedRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        const portDefaultHVARSettings = new HvarRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultHVARSettings.factorScaling = 'NONE';
        const portHVARSettings = new HvarRiskSettingsModel(portDefaultHVARSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        widgetRiskSettings.hvarRiskSettings = new HvarRiskSettingsModel(portHVARSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        widgetInputs.set('riskSettings', widgetRiskSettings);

        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new FlatWorkpad());
    });

    it('Test modifyWidgetInputsForRequest for factorTimeSeriesSelectedOption = CORRELATIONS and mode = Risk matrix)', function () {
        const factorDataChartSettings = new FactorDataChartSettings();
        factorDataChartSettings.isTimeSeriesMode = false;
        factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.CORRELATIONS;

        widgetInputs.set(FactorDataChartSettings.configType, factorDataChartSettings);

        const factorDataRiskMatrixSettings = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: undefined, showChangeInUpperTriangle: false});
        widgetInputs.set(FactorDataRiskMatrixSettings.configType, factorDataRiskMatrixSettings);

        service['modifyWidgetInputsForRequest'](widgetInputs, null);
        expect(widgetInputs.has(WidgetInputType.COLUMNS)).toBeTruthy();
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].columnTag).toBe(ColumnConstants.FBA_TITLE);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[1].columnTag).toBe('factor1');
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns.length).toBe(2);
        expect(widgetInputs.has(FactorDataChartSettings.configType)).toBeTruthy();
    });

    it('validate service', () => {
        validateService(service, [WidgetConfigType.FACTOR_DATA], 'N');
    });

    it('Test modifyWidgetInputsForRequest for factorTimeSeriesSelectedOption = VOLATILITIES)', function () {
        service['modifyWidgetInputsForRequest'](widgetInputs, null);
        expect(widgetInputs.has(WidgetInputType.COLUMNS)).toBeTruthy();
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].columnTag).toBe(ColumnConstants.DATE);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[1].columnTag).toBe('factor1');
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[1].optionValues.length).toBe(1);
        expect(widgetInputs.has(FactorDataChartSettings.configType)).toBeTruthy();
    });

    it('Test modifyWidgetInputsForRequest for factorTimeSeriesSelectedOption = FACTOR_LEVELS)', function () {
        const factorDataChartSettings = widgetInputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings;
        factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.FACTOR_LEVELS;
        service['modifyWidgetInputsForRequest'](widgetInputs, null);
        expect(widgetInputs.has(WidgetInputType.COLUMNS)).toBeTruthy();
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].columnTag).toBe(ColumnConstants.DATE);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[1].columnTag).toBe('factor1');
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[1].optionValues.length).toBe(0);
        expect(widgetInputs.has(FactorDataChartSettings.configType)).toBeTruthy();
    });

    it('Test modifyWidgetInputsForRequest for defaultRiskSettings)', function () {
        service['modifyWidgetInputsForRequest'](widgetInputs, null);
        expect((widgetInputs.get('defaultRiskSettings') as RiskSettings).economyRiskSettings.overlap).toEqual(5);
        expect((widgetInputs.get('defaultRiskSettings') as RiskSettings).exposureRiskSettings.riskModel).toEqual('^EMEAA');
        expect((widgetInputs.get('defaultRiskSettings') as RiskSettings).advancedRiskSettings.dxsBlock).toEqual('ALL_DXS');
        expect((widgetInputs.get('defaultRiskSettings') as RiskSettings).hvarRiskSettings.factorScaling).toEqual('NONE');
    });

    it('validateInputs - valid scenarios', () => {
        const notification = service['validateInputs'](new Widget(WidgetConfigType.FACTOR_DATA), null, new Report());
        expect(notification).toBeNull();
    });

    it('validateInputs - comparison mode', () => {
        const report = new Report('report');
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(report.comparisonConfigId, new ComparisonConfig({portComparisonList: ['PEP', 'PEP_1']}));
        const notification = service['validateInputs'](new Widget(WidgetConfigType.FACTOR_DATA), null, report);
        expect(notification.isEmpty()).toEqual(false);
    });

    it('validateInputs - risk matrix mode - duplicate factors', () => {
        const widget = new Widget(WidgetConfigType.FACTOR_DATA);
        const columnSet = new ColumnSet();
        columnSet.columns = [
            ColumnConfig.createColumn('factor1'),
            ColumnConfig.createColumn('factor2'),
            ColumnConfig.createColumn('factor1'),
        ];

        widget.dataStore.metaData.inputs.set(ColumnType.COLUMNS, columnSet);
        widget.dataStore.metaData.inputs.set(FactorDataChartSettings.configType, new FactorDataChartSettings({ isTimeSeriesMode: false }));
        const notification = service['validateInputs'](widget, null, new Report());
        expect(notification).not.toBeNull();
        expect(notification.isEmpty()).toEqual(false);
    });

    it('should test customVizConfig', () => {
        const timeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.chartType = ChartType.LINE;
        timeSeriesSettings.dateFormat = 'Aladdin date format';

        widgetInputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, timeSeriesSettings);

        const factorDataRiskMatrixSettings = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: '06/06/2022', showChangeInUpperTriangle: false});
        widgetInputs.set(FactorDataRiskMatrixSettings.FACTOR_DATA_RISK_MATRIX_SETTINGS, factorDataRiskMatrixSettings);

        const widget = new Widget();
        widget.dataStore = new WidgetDataStore();
        widget.dataStore.metaData = new WidgetDataStoreMetaData();
        widget.dataStore.metaData.inputs = widgetInputs;

        expect(service['customVizConfig'](widget, widgetInputs, 'E_TEA')).toEqual({
            isTimeSeriesMode: true,
            factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption.VOLATILITIES,
            chartType: ChartType.LINE,
            dateFormat: 'Aladdin date format',
            compareModeToggle: false,
            compareMode: undefined,
            comparisonDate: '06/06/2022',
            isTriangularMatrix: true,
            showChangeInUpperTriangle: false,
            factorDataHighlightSettings: undefined,
        });

        const factorDataHighlightSettings = new FactorDataHighlightSettings();
        widget.dataStore.metaData.inputs.set(FactorDataHighlightSettings.configType, factorDataHighlightSettings);
        const factorDataChartSettings = widget.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings;
        factorDataChartSettings.isTimeSeriesMode = false;
        factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.CORRELATIONS;

        expect(service['customVizConfig'](widget, widgetInputs, 'E_TEA')).toStrictEqual({
            isTimeSeriesMode: false,
            factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption.CORRELATIONS,
            chartType: ChartType.LINE,
            dateFormat: 'Aladdin date format',
            comparisonDate: '06/06/2022',
            isTriangularMatrix: true,
            showChangeInUpperTriangle: false,
            compareModeToggle: false,
            compareMode: undefined,
            factorDataHighlightSettings,
        });
    });

    it('test createRequestConfig', () => {
        const widget = new Widget(WidgetConfigType.FACTOR_DATA);
        const regressionBetasResponse: ExploreResponse = {
            data: {
                columnHeaderDetails: {
                    columnKeyToDisplayNameMap: {
                        date: 'Date',
                        USD_1yr_USD_2yr_key: 'Tsy 1Y vs Tsy 2Y',
                        USD_3m_USD_2yr_key: 'Tsy 3M vs Tsy'
                    },
                    columnKeyToTagMap: {
                        date: 'date',
                        USD_1yr_USD_2yr_key: 'USD_1yr_USD_2yr',
                        USD_3m_USD_2yr_key: 'USD_3m_USD_2yr'
                    }
                },
                columns : ['date', 'USD_1yr_USD_2yr_key', 'USD_3m_USD_2yr_key'],
                data: null
            }
        };
        const request1 = {
            portfolio: 'PEP',
            factorDataChartSettings: {
                isTimeSeriesMode: true,
                factorTimeSeriesSelectedOption: 'REGRESSION_BETAS'
            }
        };

        const requestConfig1: RequestAdapterConfig = service['createRequestConfig'](widget.getCombinedInputs(), widget, regressionBetasResponse, request1, false);
        expect(requestConfig1.portfolio).toBe('PEP');
        expect(requestConfig1.columns.length).toBe(3);
        expect(requestConfig1.splitColumns.length).toBe(3);

        const volatilitiesResponse: ExploreResponse = {
            data: {
                columnHeaderDetails: {
                    columnKeyToDisplayNameMap: {
                        date: 'Date',
                        USD_3m_key: 'Tsy 3M'
                    },
                    columnKeyToTagMap: {
                        date: 'date',
                        USD_3m_key: 'USD_3m'
                    }
                },
                columns : ['date', 'USD_3m_key'],
                data: null
            }
        };

        const request2 = {
            portfolio: 'PEP',
            factorDataChartSettings: {
                isTimeSeriesMode: true,
                factorTimeSeriesSelectedOption: 'VOLATILITIES'
            }
        };

        const factorColumn = new ColumnConfig();
        factorColumn.columnTag = 'USD_3m';
        factorColumn.positionColumnType = ColumnConstants.FACTOR_MODEL;
        factorColumn.columnKey = 'USD_3m_key';
        factorColumn.columnTitle = 'TSY 3m';

        const factorColumnSet = new ColumnSet();
        factorColumnSet.columns = [factorColumn];

        widgetInputs.set(WidgetInputType.COLUMNS, factorColumnSet);

        const requestConfig2: RequestAdapterConfig = service['createRequestConfig'](widgetInputs, widget, volatilitiesResponse, request2, false);
        expect(requestConfig2.portfolio).toBe('PEP');
        expect(requestConfig2.columns.length).toBe(1);
        expect(requestConfig2.splitColumns.length).toBe(1);
    });
});
