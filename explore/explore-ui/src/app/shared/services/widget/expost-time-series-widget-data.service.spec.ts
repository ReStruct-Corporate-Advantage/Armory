import {ColumnSet} from '@blk/explore-ui-column-option';
import {ColumnConstants, ExpostSettings, TimePeriod, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ExpostTimeSeriesSettings} from '@models/expostSettings/expost-time-series-settings.model';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ExpostTimeSeriesWidgetDataService} from '@services/widget/expost-time-series-widget-data.service';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';

describe('ExpostTimeSeriesWidgetDataService test', () => {
    let service: ExpostTimeSeriesWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new ExpostTimeSeriesWidgetDataService(exploreDataRequestService);
    });

    beforeEach((done) => {
        TestUtils.initialize(done);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    /**
     * @see validateService
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.EXPOST_TIME_SERIES], undefined);
    });

    it('validate modifyWidgetInputsForRequest', () => {
        const widget = new Widget(WidgetConfigType.EXPOST_TIME_SERIES);
        const modifiedWidgetInputs: Map<string, WidgetInput> = new Map(widget.dataStore.metaData.inputs);
        service['modifyWidgetInputsForRequest'](modifiedWidgetInputs, widget);

        const widgetCols = widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const modifiedCols = modifiedWidgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        expect(widgetCols.columns.length === 2).toBeTruthy();
        expect(modifiedCols.columns.length === 3).toBeTruthy();
        expect(modifiedCols.columns[0].columnTag === ColumnConstants.DATE).toBeTruthy();
    });

    it('should test customVizConfig', () => {
        // setup data
        const samplingPeriod = new TimePeriod('1 Month', 1, 'Months');
        const statisticPeriod = new TimePeriod('1 Day', 1, 'Days');
        const expostSettings = new ExpostSettings();
        expostSettings.samplingPeriod = samplingPeriod;
        expostSettings.statisticPeriods = [statisticPeriod];
        const widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(ExpostTimeSeriesSettings.EXPOST_TIME_SERIES_SETTINGS, {[ExpostSettings.EXPOST_SETTINGS]: expostSettings} as any);

        const widget = new Widget();
        widget.dataStore = new WidgetDataStore();
        widget.dataStore.metaData = new WidgetDataStoreMetaData();
        widget.dataStore.metaData.inputs = widgetInputs;

        widget.displayInputs.set('secondaryAxisColumn', {data: undefined} as any);

        // action and validate
        expect(service['customVizConfig'](widget, widgetInputs)).toEqual({
            samplingPeriod: '1 Month',
            statisticPeriod: '1 Day',
            secondaryYAxis: undefined,
            primaryYAxisOverride: undefined,
            secondaryYAxisOverride: undefined
        });
    });
});

