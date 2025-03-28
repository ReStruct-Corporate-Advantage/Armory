import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {AdditionalPerformanceSettings, AlertConstants, CalendarDateUtils, DateValue, PerformanceConstants, PerformanceSettings, WidgetConfigType} from '@blk/explore-ui-core';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {ReturnSpriteletService} from '@services/widget/return-spritelet.service';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {CommonConstants} from '@constants/common.constants';
import {NotificationConstants} from '@constants/notification.constants';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WorkspaceStore} from '../../../stores';
import {FlatWorkpad} from '../../../models/workspace/flat-workpad.model';
import * as performanceDetailResponseMock from '../../../../../mocks/performanceDetailResponseMock.json';

describe('ReturnAnalysisService Test', () => {
    let service: ReturnSpriteletService;
    let exploreDataRequestService: ExploreDataRequestService;
    let widget;
    let parentDataStore;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new ReturnSpriteletService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        WorkspaceStore.init();
        TestUtils.initialize(done);
        widget = new Widget(WidgetConfigType.RETURNS_PERF_DETAIL);
        parentDataStore = new WidgetDataStore();
        parentDataStore.metaData = new WidgetDataStoreMetaData();
        parentDataStore.metaData.inputs.set('performanceSettings', new PerformanceSettings());
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.RETURNS_TIME_SERIES, WidgetConfigType.RETURNS_PERF_DETAIL, WidgetConfigType.RETURNS_MANAGER_SELECTION, WidgetConfigType.RETURNS_FX_ATTRIBUTION], 'N');
    });

    it('modifyWidgetInputsForRequest', () => {
        const widgetInputs = widget.getCombinedInputs();
        service.modifyWidgetInputsForRequest(widgetInputs, widget);
        expect(widgetInputs.get('performanceSettings')).not.toBeDefined();
        widget.dataStore.parentDataStore = parentDataStore;
        service.modifyWidgetInputsForRequest(widgetInputs, widget);
        expect(widgetInputs.get('performanceSettings')).toBeDefined();
    });

    it('validateInputs - comparison mode', () => {
        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['port1', 'port2'];

        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);
        const workpad: FlatWorkpad = new FlatWorkpad();
        WorkspaceStore.currentWorkpad$.next(workpad);

        const widgetInputs = widget.getCombinedInputs();
        widget.dataStore.parentDataStore = parentDataStore;
        service.modifyWidgetInputsForRequest(widgetInputs, widget);
        const report = new Report('report 1');
        report.comparisonConfigId = 1;
        let notification = service['validateInputs'](widget, new Portfolio('PEP', CalendarDateUtils.getDefaultDateObject()), report);
        expect(notification).toBe(null);
        workpad.comparisonConfigMap = comparisonConfigMap;
        notification = service['validateInputs'](widget, new Portfolio(), report);
        expect(notification).toBeDefined();
        expect(notification.message).toBe(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.TIME_SERIES);
    });

    it('tests validateInputs - performance settings', () => {
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        const report: Report = new Report();
        const portfolio: Portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2018'}));
        const performanceSettings: PerformanceSettings = new PerformanceSettings();

        const parentWidget = new Widget(WidgetConfigType.RETURNS);
        widget.dataStore.parentDataStore = parentWidget.dataStore;
        parentWidget.dataStore.metaData.inputs.set(PerformanceConstants.PERFORMANCE_SETTINGS, performanceSettings);
        expect(service['validateInputs'](widget, portfolio, report)).toBe(null);

        performanceSettings.additionalSettings = new AdditionalPerformanceSettings();
        expect(service['validateInputs'](widget, portfolio, report)).toBe(null);

        performanceSettings.additionalSettings.showSummary = true;
        expect(service['validateInputs'](widget, portfolio, report).message).toBe(NotificationConstants.SHOW_SUMMARY_PERF_BREAKDOWN_MESSAGE);

        const breakdown: Breakdown = new Breakdown();
        parentWidget.dataStore.metaData.inputs.set(CommonConstants.CONFIG_TYPE.BREAKDOWN_TREE, breakdown);
        expect(service['validateInputs'](widget, portfolio, report)).toEqual(null);

        jest.spyOn(breakdown, 'isPerformanceBreakdown').mockReturnValue(true);
        expect(service['validateInputs'](widget, portfolio, report)).toBe(null);

        performanceSettings.additionalSettings.showSummary = false;
        performanceSettings.additionalSettings.customBreakdownType = true;
        jest.spyOn(breakdown, 'hasPortfolioNameColumn').mockReturnValue(false);
        expect(service['validateInputs'](widget, portfolio, report).message).toBe(NotificationConstants.BREAKDOWN_FLATTEN_COMPONENT_MESSAGE);
    });

    it('should set the collapsableColumns to the widget payload based on the response data', () => {
        const widgetPayload: any = {responseConfig: {}};
        const response = performanceDetailResponseMock;

        const expectedCollapsableColumns = new Set([
            'paydown',
            'total_fx',
            'fxcarry_pnl',
            'total_fin',
            'total_comm',
            'sec_lending',
            'total_wht',
            'acct_fees',
            'tradeprice_gl',
            'paydn_contr',
            'fx_contr',
            'fxcarry_contr',
            'comm_contr',
            'sec_lending_contr',
            'wht_contr',
            'acct_fees_contr',
            'tradeprice_contr',
            'beg_int',
            'end_int'
        ]);

        service['setCollapsableColumns'](widgetPayload, response as any);
        expect(widgetPayload.responseConfig.collapsableColumns).toEqual(expectedCollapsableColumns);
    });
});

