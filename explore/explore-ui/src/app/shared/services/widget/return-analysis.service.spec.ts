import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {ReturnAnalysisService} from './return-analysis.service';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {
    AttributionSettings, PerformanceConstants,
    PerformanceSettings,
    TimePeriodConstants,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('ReturnAnalysisService Test', () => {
    let service: ReturnAnalysisService;
    let exploreDataRequestService: ExploreDataRequestService;
    let widget;
    let parentDataStore;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new ReturnAnalysisService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);
        widget = new Widget(WidgetConfigType.RETURNS);
        parentDataStore = new WidgetDataStore();
        parentDataStore.metaData = new WidgetDataStoreMetaData();
        parentDataStore.metaData.inputs.set('performanceSettings', new PerformanceSettings());
    });

    it('createRequestParams', () => {
        const params: any = {
            columns: []
        };
        const column = (widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet).columns[1];
        column.columnKey = 'total_ret';
        const performanceSettings = new PerformanceSettings();
        performanceSettings.attributionSettings = new AttributionSettings();
        column.optionValues.push(performanceSettings);

        const col1: any = {columnTag: 'pnl_cusip'};
        const col2: any = {columnTag: 'total_ret', columnKey: 'total_ret'};
        col2.optionValues = {};
        col2.optionValues[TimePeriodConstants.TIME_PERIOD] = 'CUSTOM';
        col2.optionValues[TimePeriodConstants.NUMBER_OF_PERIODS] = 1;
        col2.optionValues[TimePeriodConstants.START_DATE] = '10-Mar-2015';
        col2.optionValues[TimePeriodConstants.END_DATE] = '10-Mar-2016';
        col2.optionValues[PerformanceConstants.ATTRIBUTION_METHOD] = 'FIXED_INCOME';
        params.columns.push(col1);
        params.columns.push(col2);

        const expectedRequestParams: any = {
            columns: [{columnTag: 'pnl_cusip'}, {columnKey: 'total_ret', columnTag: 'total_ret', 'optionValues': {}}]
        };

        jest.spyOn(AbstractWidgetService.prototype, 'createRequestParams').mockReturnValue([params]);
        expect(service.createRequestParams({} as any, widget, {} as any, {} as any)[0]).toStrictEqual(expectedRequestParams);
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.RETURNS, WidgetConfigType.RETURNS_DRILLDOWN_TIME_SERIES, WidgetConfigType.RETURNS_DRILLDOWN_PERF_DETAIL], 'N');
    });

    it('modifyWidgetInputsForRequest', () => {
        widget.dataStore.metaData.inputs.delete('performanceSettings');
        const widgetInputs = widget.getCombinedInputs();
        service.modifyWidgetInputsForRequest(widgetInputs, widget);
        expect(widgetInputs.get('performanceSettings')).not.toBeDefined();
        widget.dataStore.parentDataStore = parentDataStore;
        service.modifyWidgetInputsForRequest(widgetInputs, widget);
        expect(widgetInputs.get('performanceSettings')).toBeDefined();
    });
});

