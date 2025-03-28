import {ColumnConstants, ExpostSettings, TimePeriod, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, mockColumnCreation, validateService} from '@services/widget/functions-for-data-service.testutil';
import {Widget} from '@models/widget/widget.model';
import {ExpostReturnsWidgetDataService} from '@services/widget/expost-returns-widget-data.service';
import {ExpostReturnSettings} from '@models/expostSettings/expost-return-settings.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnSet, ExpostColumnOption} from '@blk/explore-ui-column-option';

describe('ExpostReturnsWidgetDataService test', () => {
    let service: ExpostReturnsWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    let widgetInputs: Map<string, WidgetInput>;
    let widget: Widget;
    let expostReturnSettings: ExpostReturnSettings;
    const timePeriod = new TimePeriod(undefined, 1, 'Months');

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new ExpostReturnsWidgetDataService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);

        widgetInputs = new Map<string, WidgetInput>();
        widget = new Widget();
        expostReturnSettings = new ExpostReturnSettings();

        widgetInputs.set(ExpostReturnSettings.EXPOST_RETURN_SETTINGS, expostReturnSettings);

        mockColumnCreation();
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.EXPOST_RETURNS], undefined);
    });

    /**
     *
     */
    it('modifyWidgetInputsForRequest has not bench, has no active', () => {
        runModifyWidgetInputsForRequest(false);
    });

    /**
     *
     */
    it('modifyWidgetInputsForRequest has bench and active', () => {
        expostReturnSettings.showBench = true;
        expostReturnSettings.showActive = true;
        runModifyWidgetInputsForRequest(true);
    });

    it('test modifyWidgetInputsForRequest for isNetReturns:true with bench and active', () => {
        expostReturnSettings.showBench = true;
        expostReturnSettings.showActive = true;

        expostReturnSettings.expostSettings = new ExpostSettings({
            samplingPeriod: timePeriod,
            statisticPeriods: [timePeriod],
            isNetReturns: true
        });

        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        const column1 = (widgetInputs.get('columns') as ColumnSet).columns[1];
        const column2 = (widgetInputs.get('columns') as ColumnSet).columns[2];
        const column3 = (widgetInputs.get('columns') as ColumnSet).columns[3];

        expect(column1.columnTag).toBe('CumRet');
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeTruthy();
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
        expect(column2.columnTag).toBe('BenchCumRet');
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeTruthy();
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
        expect(column3.columnTag).toBe('ActCumRet');
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeTruthy();
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
    });
    it('test modifyWidgetInputsForRequest for isGrossAndNetReturn:true with bench and active as true', () => {
        expostReturnSettings.showBench = true;
        expostReturnSettings.showActive = true;

        expostReturnSettings.expostSettings = new ExpostSettings({
            samplingPeriod: timePeriod,
            statisticPeriods: [timePeriod],
            isGrossAndNetReturns: true
        });

        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        const column1 = (widgetInputs.get('columns') as ColumnSet).columns[1];
        const column2 = (widgetInputs.get('columns') as ColumnSet).columns[2];
        const column3 = (widgetInputs.get('columns') as ColumnSet).columns[3];
        const column4 = (widgetInputs.get('columns') as ColumnSet).columns[4];
        const column5 = (widgetInputs.get('columns') as ColumnSet).columns[5];
        const column6 = (widgetInputs.get('columns') as ColumnSet).columns[6];

        expect(column1.columnTag).toBe('CumRet');
        expect(column1.columnKey).toBe('CumRet');
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeTruthy();
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
        expect(column3.columnTag).toBe('BenchCumRet');
        expect(column3.columnKey).toBe('BenchCumRet');
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeTruthy();
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
        expect(column5.columnTag).toBe('ActCumRet');
        expect(column5.columnKey).toBe('ActCumRet');
        expect((column5.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeTruthy();
        expect((column5.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column5.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);

        expect(column2.columnTag).toBe('CumRet');
        expect(column2.columnKey).toBe('CumRetGROSS');
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeFalsy();
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
        expect(column4.columnTag).toBe('BenchCumRet');
        expect(column4.columnKey).toBe('BenchCumRetGROSS');
        expect((column4.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeFalsy();
        expect((column4.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column4.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
        expect(column6.columnTag).toBe('ActCumRet');
        expect(column6.columnKey).toBe('ActCumRetGROSS');
        expect((column6.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeFalsy();
        expect((column6.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column6.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
    });

    it('test modifyWidgetInputsForRequest for isGrossAndNetReturn:true with bench and active as false', () => {
        expostReturnSettings.showBench = false;
        expostReturnSettings.showActive = false;

        expostReturnSettings.expostSettings = new ExpostSettings({
            samplingPeriod: timePeriod,
            statisticPeriods: [timePeriod],
            isGrossAndNetReturns: true
        });

        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        const column1 = (widgetInputs.get('columns') as ColumnSet).columns[1];
        const column2 = (widgetInputs.get('columns') as ColumnSet).columns[2];

        expect(column1.columnTag).toBe('CumRet');
        expect(column1.columnKey).toBe('CumRet');
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeTruthy();
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);

        expect(column2.columnTag).toBe('CumRet');
        expect(column2.columnKey).toBe('CumRetGROSS');
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeFalsy();
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
    });

    it('test modifyWidgetInputsForRequest for isNetReturns:false with bench and active', () => {
        expostReturnSettings.showBench = true;
        expostReturnSettings.showActive = true;

        expostReturnSettings.expostSettings = new ExpostSettings({
            samplingPeriod: timePeriod,
            statisticPeriods: [timePeriod],
            isNetReturns: false
        });

        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        const column1 = (widgetInputs.get('columns') as ColumnSet).columns[1];
        const column2 = (widgetInputs.get('columns') as ColumnSet).columns[2];
        const column3 = (widgetInputs.get('columns') as ColumnSet).columns[3];

        expect(column1.columnTag).toBe('CumRet');
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeFalsy();
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column1.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
        expect(column2.columnTag).toBe('BenchCumRet');
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeFalsy();
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column2.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
        expect(column3.columnTag).toBe('ActCumRet');
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.isNetReturns).toBeFalsy();
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.samplingPeriod).toEqual(timePeriod);
        expect((column3.optionValues[1] as ExpostColumnOption).expostSettings.statisticPeriods).toEqual([timePeriod]);
    });

    /**
     * Runs modifyWidgetInputsForRequest method and validates the result
     */
    function runModifyWidgetInputsForRequest(shouldBenchAndActiveColumnExist: boolean) {
        // Run the method
        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        // Validate
        expect(widgetInputs.has(WidgetInputType.COLUMNS)).toStrictEqual(true);

        const columnSet: ColumnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const expectedNumberOfColumns: number = shouldBenchAndActiveColumnExist ? 4 : 2;
        expect(columnSet.columns.length).toStrictEqual(expectedNumberOfColumns);

        // Validate columns are in the right order
        expect(columnSet.columns[0].columnTag).toStrictEqual(ColumnConstants.COLUMN_TAG.SEC_DESC);
        expect(columnSet.columns[1].columnTag).toStrictEqual(ColumnConstants.CUMULATIVE_RETURN);

        if (shouldBenchAndActiveColumnExist) {
            expect(columnSet.columns[2].columnTag).toStrictEqual(ColumnConstants.BENCH_CUMULATIVE_RETURN);
            expect(columnSet.columns[3].columnTag).toStrictEqual(ColumnConstants.ACTIVE_CUMULATIVE_RETURN);
        }
    }
});

