import {Breakdown} from '@blk/explore-ui-breakdown';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {WorkspaceStore} from '../../../stores';
import {
    beforAllDataServiceTest,
    createMultiLevelBreakdown
} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {
    AlertConstants,
    DateValue,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {PortGroupSummaryTimeSeriesWidgetDataService} from '@services/widget/portgroup-summary-time-series-widget-data.service';
import {GroupByKey} from '@qbstr/data-cube';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';

describe('TimeSeriesWidgetDataService Test', () => {
    let service: PortGroupSummaryTimeSeriesWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;
    let report: Report;
    let widget: Widget;
    let breakdown: Breakdown;
    let widgetInputs: Map<string, WidgetInput>;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new PortGroupSummaryTimeSeriesWidgetDataService(exploreDataRequestService);
        WorkspaceStore.init();
    });

    beforeEach((done) => {
        TestUtils.initialize(done);

        report = new Report();
        widget = new Widget();

        const timeSeriesSettings: TimeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.frequency = 'Weekly';
        timeSeriesSettings.periods = 5;
        timeSeriesSettings.chartType = 'bar';
        timeSeriesSettings.includeTotalValues = true;

        breakdown = createMultiLevelBreakdown(['sec_group', 'sec_type']);

        widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, timeSeriesSettings);
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, breakdown);

        widget.configType = WidgetConfigType.PGS_TS;
        widget.dataStore = new WidgetDataStore();
        widget.dataStore.metaData = new WidgetDataStoreMetaData();
        widget.dataStore.metaData.inputs = widgetInputs;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('customVizConfig', () => {
        widget.dataStore.data = {customVizConfig : {queryKeys: [new GroupByKey('level-0')], chartOrientation: 'column'}};
        const customVizConfig = service['customVizConfig'](widget, widgetInputs);
        expect(customVizConfig['chartOrientation']).toEqual( widget.dataStore.data.customVizConfig['chartOrientation']);
        expect(customVizConfig['queryKeys'].length).toEqual( widget.dataStore.data.customVizConfig['queryKeys'].length);
    });

    it('getStaticWidgetRequestParams', () => {
        const staticWidgetReqParams = service['getStaticWidgetRequestParams']();
        expect(staticWidgetReqParams.isPortGroupSummaryRequest).toBe('Y');
    });

    it('validateInputs', () => {
        const widgetDef = new Widget();
        widgetDef.configType = WidgetConfigType.RISK_EXPOSURE;
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
        expect(notification).toBeNull();

        widgetDef.configType = WidgetConfigType.PGS_TS;

        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification.message).toBe(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.PGS_CHART);

        jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(undefined);
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).toBeNull();
        portfolio.title = 'PEP';
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).not.toBe(null);

        widgetDef.dataStore.data = {
            requestConfig: {
                portfolio: 'TR-MULTI'
            },
            customVizConfig : {
                queryKeys: [new GroupByKey('level-0')], chartOrientation: 'column'
            }
        };
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).not.toBe(null);

        portfolio.title = 'TR-MULTI';
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).toBeNull();

        portfolio.fullName = 'TR-MULTI FullName';
        widgetDef.dataStore.data.requestConfig = null;
        widgetDef.pgsChartPortfolio = 'TR-MULTI';
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).toBe(null);

        widgetDef.dataStore.data.requestConfig = null;
        widgetDef.pgsChartPortfolio = 'TR-MULTI FullName';
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).not.toBe(null);
    });
});
