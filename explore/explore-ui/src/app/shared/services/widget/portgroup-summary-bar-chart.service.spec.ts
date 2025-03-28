import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    AlertConstants,
    AttributionSettings, ChartWidgetInputConfigType, ColumnConfig, DateValue,
    PerformanceSettings,
    WidgetConfigType,
    WidgetInput
} from '@blk/explore-ui-core';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {PgsStackedBarChartSettingsModel} from '@models/widget/inputs/chart-settings/pgs-stacked-bar-chart-settings.model';
import {Breakdown, ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {CommonConstants} from '@constants/common.constants';
import {PortGroupSummaryBarChartService} from '@services/widget/portgroup-summary-bar-chart.service';
import {pgsCubeRequestConfig, pgsStackedResponse} from '@mocks/test-data/pgs-bar-chart-test-data';
import {Widget} from '@models/widget/widget.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {FilterIncludeKey, GroupByKey} from '@qbstr/data-cube';
import {ReportGroup} from '@models/workspace/report-group.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {Report} from '@models/workspace/report.model';
import {WorkspaceStore} from '@stores/workspace.store';

describe('PortGroupSummaryService Test', () => {
    let service: PortGroupSummaryBarChartService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new PortGroupSummaryBarChartService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);
    });

    it('validate service', () => {
        const portfolio: Portfolio = new Portfolio('test_ticker');
        const attributionSettings = new AttributionSettings(undefined, 'EQUITY');
        portfolio.performanceSettings = new PerformanceSettings(undefined, undefined, attributionSettings);
        const expectedRequestParams = {performanceSettings: {}};
        expectedRequestParams.performanceSettings['cannedAttributionMethod'] = 'EQUITY';

        jest.spyOn(AbstractWidgetService.prototype, 'createRequestParams').mockReturnValue([{}]);
        const widget = {
            displayInputs: new Map<string, WidgetInput>().set(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS, new PgsStackedBarChartSettingsModel({isStackedBarChart: false}))
        };
        expect(service.createRequestParams({} as any, widget as any, [portfolio], {} as any)[0]).toStrictEqual(expectedRequestParams);
        validateService(service, [WidgetConfigType.PGS_BAR], 'N');
    });

    it('validate service for PGS chart with normal breakdown - should not update response', () => {
        const portfolio: Portfolio = new Portfolio('test_ticker');
        const attributionSettings = new AttributionSettings(undefined, 'EQUITY');
        portfolio.performanceSettings = new PerformanceSettings(undefined, undefined, attributionSettings);
        const expectedRequestParams = {performanceSettings: {}};
        expectedRequestParams.performanceSettings['cannedAttributionMethod'] = 'EQUITY';

        jest.spyOn(AbstractWidgetService.prototype, 'createRequestParams').mockReturnValue([{}]);
        const columns = new ColumnSet();
        columns.columns = [new ColumnConfig({
            columnTag: 'sector',
            optionValues: []
        })];
        const widget = {
            displayInputs: new Map<string, WidgetInput>().set(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS, new PgsStackedBarChartSettingsModel({isStackedBarChart: true})),
            configType: WidgetConfigType.PGS_BAR,
            dataStore: {
                metaData: {
                    inputs: new Map<string, ColumnSet>().set(CommonConstants.CONFIG_TYPE.COLUMNS, columns)
                }
            }
        };
        const widgetInputs = new Map<string, WidgetInput>().set('columns', columns);
        const requestParams = service.createRequestParams({} as any, widget as any, [portfolio], widgetInputs as any)[0];
        expect(requestParams).toStrictEqual(expectedRequestParams);
        expect(widgetInputs.get(CommonConstants.CONFIG_TYPE.BREAKDOWN_TREE)).not.toBeNull();
        validateService(service, [WidgetConfigType.PGS_BAR], 'N');
        const response = pgsStackedResponse;

        service['processResponse'](widget as any, pgsCubeRequestConfig as any, response as any, {} as any);
        expect(response.data.data.children[0].children[0]['children']).toBeUndefined();
    });

    it('validate service for PGS chart with stacked breakdown updates response', () => {
        const portfolio: Portfolio = new Portfolio('test_ticker');
        const attributionSettings = new AttributionSettings(undefined, 'EQUITY');
        portfolio.performanceSettings = new PerformanceSettings(undefined, undefined, attributionSettings);
        const expectedRequestParams = {performanceSettings: {}};
        expectedRequestParams.performanceSettings['cannedAttributionMethod'] = 'EQUITY';

        jest.spyOn(AbstractWidgetService.prototype, 'createRequestParams').mockReturnValue([{}]);
        const colbreakdown = new ColumnBreakdown();
        colbreakdown.initialize();
        colbreakdown.breakdown = Breakdown.getDefaultBreakdown();
        const columns = new ColumnSet();
        columns.columns = [new ColumnConfig({
            columnTag: 'sector',
            optionValues: [colbreakdown]
        })];
        const widget = {
            displayInputs: new Map<string, WidgetInput>().set(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS, new PgsStackedBarChartSettingsModel({isStackedBarChart: true})),
            configType: WidgetConfigType.PGS_BAR,
            dataStore: {
                metaData: {
                    inputs: new Map<string, ColumnSet>().set(CommonConstants.CONFIG_TYPE.COLUMNS, columns)
                }
            }
        };
        const widgetInputs = new Map<string, WidgetInput>().set('columns', columns);
        const requestParams = service.createRequestParams({} as any, widget as any, [portfolio], widgetInputs as any)[0];
        expect(requestParams).toStrictEqual(expectedRequestParams);
        expect(widgetInputs.get(CommonConstants.CONFIG_TYPE.BREAKDOWN_TREE)).not.toBeNull();
        validateService(service, [WidgetConfigType.PGS_BAR], 'N');
        const response = pgsStackedResponse;

        service['processResponse'](widget as any, pgsCubeRequestConfig as any, response as any, {} as any);
        expect((response.data.data.children[0].children[0]['children'] as []).length).toBe(14);
    });

    it('validateInputs', () => {
        const widgetDef = new Widget();
        widgetDef.configType = WidgetConfigType.PGS_BAR;
        widgetDef.dataStore = new WidgetDataStore();
        widgetDef.pgsChartPortfolio = 'TR-MULTI';
        widgetDef.dataStore.data = {
            customVizConfig : {
                queryKeys: [new GroupByKey('level-0')], chartOrientation: 'column'
            }
        };
        const portfolio = new Portfolio('TR-MULTI', new DateValue({date: '11/03/2016'}));
        portfolio.title = 'TR-MULTI';
        portfolio.portId = 'TR-MULTI';
        const portfolio2 = new Portfolio('BGO', new DateValue({date: '11/03/2016'}));
        portfolio2.title = 'BGO';
        portfolio2.portId = 'BGO';
        const workpad = new ReportGroup();
        workpad.comparisonConfigMap.set(123, new ComparisonConfig({
            portComparisonList: ['TR-MULTI', 'BGO'],
        }));
        const reportObj = new Report({
            comparisonConfigId: 123
        });
        workpad.portfolios = [portfolio, portfolio2];
        jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(workpad);

        let notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).not.toBeNull();

        widgetDef.configType = WidgetConfigType.PGS_BAR;

        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification.message).toBe(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.PGS_CHART);

        jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(undefined);
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).toBeNull();
        portfolio.title = 'PEP';
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).not.toBeNull();

        widgetDef.dataStore.data = {
            requestConfig: {
                portfolio: 'TR-MULTI'
            },
            customVizConfig : {
                queryKeys: [new GroupByKey('level-0')], chartOrientation: 'column'
            }
        };
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).not.toBeNull();

        portfolio.title = 'TR-MULTI';
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).toBeNull();
    });

    it('validate customVizConfig for stacked bar chart', () => {
        const widgetDef = new Widget();
        widgetDef.configType = WidgetConfigType.PGS_BAR;
        widgetDef.dataStore = new WidgetDataStore();
        widgetDef.pgsChartPortfolio = 'TR-MULTI';
        widgetDef.dataStore.data = {
            customVizConfig: {
                queryKeys: [new GroupByKey('_ROOT_'), new FilterIncludeKey('portfolio', ['CBMF']), new FilterIncludeKey('level-2', []), new FilterIncludeKey('level-1', ['TR-MARKET']), new FilterIncludeKey('_ROOT_', ['TR-MULTI'])],
                chartOrientation: 'column'
            }
        };
        const columns: ColumnSet = new ColumnSet();
        const colbreakdown = new ColumnBreakdown();
        colbreakdown.initialize();
        colbreakdown.breakdown = Breakdown.getDefaultBreakdown();
        const colConfig = new ColumnConfig({
            optionValues: [colbreakdown]
        });
        columns.columns = [colConfig];
        widgetDef.dataStore.metaData.inputs = new Map<string, ColumnSet>().set(CommonConstants.CONFIG_TYPE.COLUMNS, columns);
        const widgetInputs = new Map<string, WidgetInput>().set(ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS, null).set(ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS, null);
        widgetDef.displayInputs = new Map<string, WidgetInput>().set(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS, new PgsStackedBarChartSettingsModel({isStackedBarChart: true}));
        const portfolio = new Portfolio('TR-MULTI', new DateValue({date: '11/03/2016'}));
        service['customVizConfig'](widgetDef, widgetInputs, portfolio.title);
        expect(widgetDef.dataStore.data.customVizConfig.queryKeys.length).toBe(5);
        expect(widgetDef.dataStore.data.customVizConfig.queryKeys[2]['includes']).toStrictEqual(['CBMF']);
    });
});
