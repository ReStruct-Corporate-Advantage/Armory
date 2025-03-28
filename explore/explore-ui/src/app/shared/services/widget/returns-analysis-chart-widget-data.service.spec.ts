import {ExploreResponseConfig} from '@interfaces/response.interface';
import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, mockColumnCreation, runValidateInputsAndCheckItFailsOnComparisonMode, validateService} from '@services/widget/functions-for-data-service.testutil';
import {Widget} from '@models/widget/widget.model';
import {ReturnsAnalysisChartWidgetDataService} from '@services/widget/returns-analysis-chart-widget-data.service';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {ReturnChartStyleSettingsModel} from '@models/widget/inputs/chart-settings/return-chart-style-settings.model';
import * as returnsChartResponse from '@mocks/charts/returnsChartMock1.json';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {
    ChartWidgetInputConfigType,
    DateValue,
    PerformanceConstants,
    ResponseData,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';

describe('ReturnsAnalysisChartWidgetDataService Test', () => {
    let service: ReturnsAnalysisChartWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    let widgetInputs: Map<string, WidgetInput>;
    let widget: Widget;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new ReturnsAnalysisChartWidgetDataService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);

        widgetInputs = new Map<string, WidgetInput>();
        widget = new Widget(WidgetConfigType.RETURN_ANALYSIS_CHART);

        mockColumnCreation();
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    /**
     * Validates the service
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.RETURN_ANALYSIS_CHART], undefined);
    });

    /**
     * Tests validateInputs
     */
    it('validateInputs - invalid scenario - comparison mode', () => {
        runValidateInputsAndCheckItFailsOnComparisonMode(service);
    });

    /**
     * Tests validateInputs
     */
    it('validateInputs - valid scenario', () => {
        const notification = service['validateInputs'](new Widget(), new Portfolio('PEP', new DateValue({date: '09/05/2016'})), new Report());
        expect(notification).toBeNull();
    });

    /**
     * Tests modifyWidgetInputsForRequest
     */
    it('modifyWidgetInputsForRequest - show columns flag in the settings is true', () => {
        runModifyWidgetInputsForRequestAndValidate(true);
    });

    /**
     * Tests modifyWidgetInputsForRequest
     */
    it('modifyWidgetInputsForRequest - show columns flag in the settings is false', () => {
        runModifyWidgetInputsForRequestAndValidate(false);
    });

    /**
     * Runs modifyWidgetInputsForRequest and validates the result
     * @param showColumns a flag for the ReturnChartStyleSettingsModel's showXXX flags
     */
    function runModifyWidgetInputsForRequestAndValidate(showColumns: boolean) {
        // Defined the settings
        const settings = new ReturnChartStyleSettingsModel();
        settings.showActive = showColumns;
        settings.showActiveCumulative = showColumns;
        settings.showBenchmark = showColumns;
        settings.showBenchmarkCumulative = showColumns;
        settings.showPortfolio = showColumns;
        settings.showPortfolioCumulative = showColumns;

        widgetInputs.set(ChartWidgetInputConfigType.RETURN_CHART_STYLE_SETTINGS, settings);

        // Run the method
        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        // Validate
        expect(widgetInputs.has(WidgetInputType.COLUMNS)).toStrictEqual(true);

        const expectedLength = showColumns ? 7 : 1;
        const columnSet: ColumnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        expect(columnSet.columns.length).toStrictEqual(expectedLength);
    }

    it('tests getPlottableResponse', () => {
        const plottableResponse: ExploreResponseConfig & { data: ResponseData } = service['getPlottableResponse']({data: returnsChartResponse}).data;
        expect(plottableResponse.data.children.length).toBe(4);
        expect(plottableResponse.data.data).toBeUndefined();
        plottableResponse.data.children.forEach(child => {
            expect(child.data.length).toBe(6);
            expect(child.rowId).toBeTruthy();
            expect(child.title).toBeTruthy();
        });
        expect(plottableResponse.columns.length).toBe(6);
    });

    it('customVizConfig', () => {
        const returnChartStyleSettings: ReturnChartStyleSettingsModel = new ReturnChartStyleSettingsModel();
        returnChartStyleSettings.dateFormat = 'M/d';
        widgetInputs.set(ChartWidgetInputConfigType.RETURN_CHART_STYLE_SETTINGS, returnChartStyleSettings);
        expect(service['customVizConfig'](widget, widgetInputs).dateFormat).toEqual('M/d');
    });


    it('createRequestParams', () => {
        const params: any = {
            columns: [],
            cannedAttributionMethodology: 'EQUITY'
        };
        jest.spyOn(AbstractWidgetService.prototype, 'createRequestParams').mockReturnValue([params]);
        const requestParams = service.createRequestParams({} as any, widget, {} as any, {} as any)[0];
        expect(requestParams[PerformanceConstants.ATTRIBUTION_METHOD]).not.toBeDefined();
    });
});

