import {Breakdown} from '@blk/explore-ui-breakdown';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {
    beforAllDataServiceTest,
    createMultiLevelBreakdown,
    validateService
} from '@services/widget/functions-for-data-service.testutil';
import {TimeSeriesWidgetDataService} from '@services/widget/time-series-widget-data.service';
import {TestUtils} from '@utils/test.utils';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {
    ChartWidgetInputConfigType,
    CoreDefinitionStore,
    DateValue,
    ResponseData,
    TokenConstants,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';

describe('TimeSeriesWidgetDataService Test', () => {
    let service: TimeSeriesWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;
    let report: Report;
    let widget: Widget;
    let breakdown: Breakdown;
    let widgetInputs: Map<string, WidgetInput>;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new TimeSeriesWidgetDataService(exploreDataRequestService);
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

        widget.dataStore = new WidgetDataStore();
        widget.dataStore.metaData = new WidgetDataStoreMetaData();
        widget.dataStore.metaData.inputs = widgetInputs;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('validate service', () => {
        validateService(service, [WidgetConfigType.TIME_SERIES], 'Y');
    });

    describe('validateInputs - comparison mode', () => {
        const portA = new Portfolio('ABC', DateValue.newDate('04/01/2020'));
        portA.portId = 'ABC123';
        const portB = new Portfolio('XYZ', DateValue.newDate('04/01/2020'));
        portB.portId = 'XYZ123';

        const comparisonReport = new Report();
        comparisonReport.comparisonConfigId = 123456;

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [portA.portId, portB.portId];

        const reportGroup = new ReportGroup();
        reportGroup.addPortfolios(portA);
        reportGroup.addPortfolios(portB);
        reportGroup.addReports(comparisonReport);
        reportGroup.comparisonConfigMap.set(comparisonReport.comparisonConfigId, comparisonConfig);

        WorkspaceStore.init();
        WorkspaceStore.currentWorkpad$.next(reportGroup);

        it('Test validateInputs - comparison mode - matching dates', () => {
            const notification = service['validateInputs'](new Widget(), portA, comparisonReport);
            expect(notification).toBeNull();
        });

        it('Test validateInputs - comparison mode - non-matching dates', () => {
            // Different date than portA
            portB.datePicker.date = '05/25/2020';
            const notification = service['validateInputs'](new Widget(), portA, comparisonReport);
            expect(notification).not.toBeNull();
        });

        it('Test validateInputs - comparison mode - exceeded total number of data points', () => {
            // Try with undefined time periods
            portB.datePicker.date = '04/01/2020';
            const tsWidget = new Widget();
            const tsSettings = new TimeSeriesSettings();
            tsSettings.periods = undefined;
            tsWidget.dataStore.metaData.inputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, tsSettings);
            let notification = service['validateInputs'](tsWidget, portA, comparisonReport);
            expect(notification).toBeNull();

            // Try with 61 time periods (to exceed 60 max)
            tsSettings.periods = 61;
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_TIME_SERIES_COMPARISON_DATA_POINTS] = '60';
            notification = service['validateInputs'](tsWidget, portA, comparisonReport);
            expect(notification).not.toBeNull();
        });

        it('Test validateInputs - what-if port', () => {
            const portC = new WhatIfPortfolio('XYZ-What_if', DateValue.newDate('04/01/2020'));
            portC.portId = 'XYZ123';

            reportGroup.getAllPortfolios().pop();
            reportGroup.addPortfolios(portC);
            const notification = service['validateInputs'](new Widget(), portA, comparisonReport);
            expect(notification).not.toBeNull();
        });
    });

    it('validateInputs - valid scenarios', () => {
        const notification = service['validateInputs'](widget, null, report);
        expect(notification).toBeNull();
    });

    it('modifyWidgetInputsForRequest - multi level breakdown', () => {
        // Call the method
        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        // Validate that the breakdown has been modified.
        const modifiedBreakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.BREAKDOWN_TREE);
        expect(modifiedBreakdown !== breakdown).toBeTruthy();
        expect(modifiedBreakdown.isMultiLevel()).toBeFalsy();
    });

    it('modifyWidgetInputsForRequest - empty/no breakdown', () => {
        // Set the breakdown to a new empty breakdown.
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, new Breakdown());
        service['modifyWidgetInputsForRequest'](widgetInputs, widget);
        expect(widgetInputs.has(WidgetInputType.BREAKDOWN_TREE)).toBeFalsy();

        // Try again with no breakdown.
        widgetInputs.delete(WidgetInputType.BREAKDOWN_TREE);
        service['modifyWidgetInputsForRequest'](widgetInputs, widget);
        expect(widgetInputs.has(WidgetInputType.BREAKDOWN_TREE)).toBeFalsy();
    });

    it('customVizConfig - chartType line/bar', () => {
        // chartType line with secondaryAxisColumn defined
        const timeSeriesSettings: TimeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.frequency = 'Weekly';
        timeSeriesSettings.periods = 5;
        timeSeriesSettings.chartType = 'line';
        timeSeriesSettings.includeTotalValues = true;
        widgetInputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, timeSeriesSettings);
        widget.displayInputs.set('secondaryAxisColumn', {data: undefined} as any);

        const comboChartColumnSettings = new ComboChartColumnSettings();
        comboChartColumnSettings.columns = [new ComboChartColumn({colKey: 'col1', chartType: ColumnSeriesChartType.BAR}), new ComboChartColumn({colKey: 'col2', chartType: ColumnSeriesChartType.LINE})];
        widget.displayInputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, comboChartColumnSettings);

        expect(service['customVizConfig'](widget, widgetInputs).comboChartColumns).toHaveLength(2);
    });

    it('test processResponse', () => {
        const response: any = {data: {data: {children: [{'title': '28-FEB-2018', 'data': [null], 'rowId': 2}, {'title': '31-OCT-2018', 'data': [null], 'rowId': 10}, { 'data': [0.6480894993383869], 'title': '31-DEC-2018', 'children': [{ 'data': [0.5150270923372735], 'title': 'CASH', 'sectorOrder': 0, 'rowId': 13 }], 'rowId': 12 }, { 'data': [0.6052312391793252], 'title': '22-JAN-2019', 'children': [{ 'data': [0.48289495194762505], 'title': 'CASH', 'sectorOrder': 0, 'rowId': 18 }], 'rowId': 17 }]}}};
        AbstractChartsWidgetService.prototype['processResponse'] = jest.fn();
        service['processResponse']({} as any, {} as any, response, {} as any);
        expect(AbstractChartsWidgetService.prototype['processResponse']).toHaveBeenCalledWith({}, {}, {data: {data: {children: [{'children': [{ 'data': [ 0.5150270923372735 ], 'rowId': 13, 'sectorOrder': 0, 'title': 'CASH' } ], 'data': [ 0.6480894993383869 ], 'rowId': 12, 'title': '31-DEC-2018' }, { 'children': [ { 'data': [ 0.48289495194762505 ], 'rowId': 18, 'sectorOrder': 0, 'title': 'CASH' } ], 'data': [ 0.6052312391793252 ], 'rowId': 17, 'title': '22-JAN-2019' } ]}}}, {});
    });

    it('removeEmptyDataPoints test', () => {
        expect(service['removeEmptyDataPoints']([{ data: [1]}] as ResponseData[])).toEqual([{ data: [1]}]);
        expect(service['removeEmptyDataPoints']([{ data: [0, 1, 0, 0]}] as ResponseData[])).toEqual([{ data: [0, 1, 0, 0]}]);
        expect(service['removeEmptyDataPoints']([{ data: [0, 1, 0, 0]}, { data: [null, undefined]}, { data: [null, undefined, 0]}] as ResponseData[])).toEqual([{ data: [0, 1, 0, 0]}, { data: [null, undefined, 0]}]);
    });

    it('tests checkForSeriesResponse', () => {
        const response = {
            data: {
                data: {
                    children: [{
                        'title': '16-OCT-2018',
                        'data': [112683645.4337623],
                        'rowId': 2
                    }, {
                        'title': '17-OCT-2018',
                        'data': [113726635.7053488],
                        'rowId': 3
                    }]
                }
            }
        };

        // #1 - non-empty data
        expect(service['checkForEmptySeriesResponse'](response as any)).toBeFalsy();

        // #2 - non-empty children as well
        response.data.data.children.forEach(child => child['children'] = [{}]);
        expect(service['checkForEmptySeriesResponse'](response as any)).toBeFalsy();

        // #3 - non-empty children, but data with all null values
        response.data.data.children.forEach(child => child['data'] = [null]);
        expect(service['checkForEmptySeriesResponse'](response as any)).toBeFalsy();

        // #4 - empty children and data with null values
        response.data.data.children.forEach(child => child['children'] = []);
        expect(service['checkForEmptySeriesResponse'](response as any)).toBeTruthy();
    });
});
